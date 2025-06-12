from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import re
from typing import Optional, Dict, Any
from utils.firebase_utils import get_firestore_client
from datetime import datetime

router = APIRouter()

class ScrapeRequest(BaseModel):
    product_url: str

class ScrapeResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    return re.sub(r'\s+', ' ', text.strip()) if text else ""

def extract_price(price_text: str) -> Optional[float]:
    """Extract price from text"""
    if not price_text:
        return None
    
    # Remove currency symbols and extract numbers
    price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
    if price_match:
        try:
            return float(price_match.group().replace(',', ''))
        except ValueError:
            return None
    return None

def extract_volume(text: str) -> Optional[int]:
    """Extract volume in ml from text"""
    if not text:
        return None
    
    # Look for ml pattern
    ml_match = re.search(r'(\d+(?:\.\d+)?)\s*ml', text.lower())
    if ml_match:
        return int(float(ml_match.group(1)))
    
    # Look for L pattern and convert to ml
    l_match = re.search(r'(\d+(?:\.\d+)?)\s*l(?:itre)?', text.lower())
    if l_match:
        return int(float(l_match.group(1)) * 1000)
    
    return None

def extract_alcohol_percentage(text: str) -> Optional[float]:
    """Extract alcohol percentage from text"""
    if not text:
        return None
    
    # Look for percentage pattern
    percentage_match = re.search(r'(\d+(?:\.\d+)?)\s*%', text)
    if percentage_match:
        return float(percentage_match.group(1))
    
    return None

async def scrape_bws_product(url: str) -> Dict[str, Any]:
    """Scrape BWS product page"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract product name
        name_elem = soup.find('h1') or soup.find('h2')
        name = clean_text(name_elem.get_text()) if name_elem else ""
        
        # Extract price
        price_elem = soup.find('span', class_=re.compile(r'price|amount')) or soup.find(text=re.compile(r'\$\d+'))
        price_text = clean_text(str(price_elem)) if price_elem else ""
        price = extract_price(price_text)
        
        # Extract brand (usually first part of name)
        brand = name.split()[0] if name else ""
        
        # Extract volume
        volume_text = name + " " + soup.get_text()
        volume = extract_volume(volume_text)
        
        # Extract alcohol percentage
        alcohol_percentage = extract_alcohol_percentage(volume_text)
        
        # Extract image
        img_elem = soup.find('img', src=re.compile(r'product|item'))
        image_url = img_elem.get('src') if img_elem else None
        
        return {
            'name': name,
            'brand': brand,
            'price': price,
            'size': volume,
            'alcohol_percentage': alcohol_percentage,
            'image_url': image_url
        }
        
    except Exception as e:
        raise Exception(f"Failed to scrape BWS: {str(e)}")

async def scrape_liquorland_product(url: str) -> Dict[str, Any]:
    """Scrape Liquorland product page"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Similar logic to BWS but adapted for Liquorland structure
        name_elem = soup.find('h1') or soup.find('h2')
        name = clean_text(name_elem.get_text()) if name_elem else ""
        
        price_elem = soup.find('span', class_=re.compile(r'price|amount')) or soup.find(text=re.compile(r'\$\d+'))
        price_text = clean_text(str(price_elem)) if price_elem else ""
        price = extract_price(price_text)
        
        brand = name.split()[0] if name else ""
        
        volume_text = name + " " + soup.get_text()
        volume = extract_volume(volume_text)
        alcohol_percentage = extract_alcohol_percentage(volume_text)
        
        img_elem = soup.find('img', src=re.compile(r'product|item'))
        image_url = img_elem.get('src') if img_elem else None
        
        return {
            'name': name,
            'brand': brand,
            'price': price,
            'size': volume,
            'alcohol_percentage': alcohol_percentage,
            'image_url': image_url
        }
        
    except Exception as e:
        raise Exception(f"Failed to scrape Liquorland: {str(e)}")

@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_product(request: ScrapeRequest):
    """Scrape product details from URL"""
    url = request.product_url.lower()
    
    try:
        if 'bws.com.au' in url:
            data = await scrape_bws_product(request.product_url)
        elif 'liquorland.com.au' in url:
            data = await scrape_liquorland_product(request.product_url)
        else:
            raise HTTPException(status_code=400, detail="Unsupported retailer")
        
        return ScrapeResponse(success=True, data=data)
        
    except Exception as e:
        return ScrapeResponse(success=False, error=str(e))

@router.post("/update-prices")
async def update_all_prices(user_id: str):
    """Update prices for all items with product URLs"""
    db = get_firestore_client()
    
    # Get all alcohol items with product URLs
    items_ref = db.collection('alcohol_items')
    items_query = items_ref.where('userId', '==', user_id).where('productUrl', '!=', None).get()
    
    updated_count = 0
    errors = []
    
    for doc in items_query:
        try:
            item_data = doc.to_dict()
            product_url = item_data.get('productUrl')
            
            if not product_url:
                continue
            
            # Scrape current price
            scrape_request = ScrapeRequest(product_url=product_url)
            scrape_result = await scrape_product(scrape_request)
            
            if scrape_result.success and scrape_result.data:
                new_price = scrape_result.data.get('price')
                if new_price and new_price != item_data.get('price'):
                    # Update price
                    size = item_data.get('size', 1)
                    price_per_liter = (new_price / size) * 1000 if size > 0 else new_price
                    
                    doc.reference.update({
                        'price': new_price,
                        'pricePerLiter': price_per_liter,
                        'lastUpdated': datetime.utcnow()
                    })
                    
                    # Store price history
                    history_doc = {
                        'itemId': doc.id,
                        'itemType': 'alcohol',
                        'price': new_price,
                        'shop': item_data.get('shop', ''),
                        'date': datetime.utcnow()
                    }
                    db.collection('price_history').add(history_doc)
                    
                    updated_count += 1
            else:
                errors.append(f"Failed to update {item_data.get('name', 'Unknown')}: {scrape_result.error}")
                
        except Exception as e:
            errors.append(f"Error updating {doc.id}: {str(e)}")
    
    return {
        'updated_count': updated_count,
        'total_items': len(items_query),
        'errors': errors
    }