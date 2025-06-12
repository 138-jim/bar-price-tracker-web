from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.firebase_utils import get_firestore_client
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter()

class AlcoholItemCreate(BaseModel):
    name: str
    brand: str
    type: str
    size: int
    alcohol_percentage: float
    price: float
    shop: str
    product_url: Optional[str] = None
    image_url: Optional[str] = None

class AlcoholItemResponse(BaseModel):
    id: str
    user_id: str
    name: str
    brand: str
    type: str
    size: int
    alcohol_percentage: float
    price: float
    price_per_liter: float
    shop: str
    product_url: Optional[str] = None
    image_url: Optional[str] = None
    last_updated: datetime

def calculate_price_per_liter(price: float, size_ml: int) -> float:
    """Calculate price per liter"""
    return (price / size_ml) * 1000

@router.get("/", response_model=List[AlcoholItemResponse])
async def get_alcohol_items(user_id: str):
    """Get all alcohol items for a user"""
    db = get_firestore_client()
    
    items_ref = db.collection('alcohol_items')
    items_query = items_ref.where('userId', '==', user_id).get()
    
    items = []
    for doc in items_query:
        data = doc.to_dict()
        items.append(AlcoholItemResponse(
            id=doc.id,
            user_id=data['userId'],
            name=data['name'],
            brand=data['brand'],
            type=data['type'],
            size=data['size'],
            alcohol_percentage=data['alcoholPercentage'],
            price=data['price'],
            price_per_liter=data['pricePerLiter'],
            shop=data['shop'],
            product_url=data.get('productUrl'),
            image_url=data.get('imageUrl'),
            last_updated=data['lastUpdated']
        ))
    
    return items

@router.post("/", response_model=AlcoholItemResponse)
async def create_alcohol_item(user_id: str, item_data: AlcoholItemCreate):
    """Create a new alcohol item"""
    db = get_firestore_client()
    
    item_id = str(uuid.uuid4())
    price_per_liter = calculate_price_per_liter(item_data.price, item_data.size)
    
    item_doc = {
        'id': item_id,
        'userId': user_id,
        'name': item_data.name,
        'brand': item_data.brand,
        'type': item_data.type,
        'size': item_data.size,
        'alcoholPercentage': item_data.alcohol_percentage,
        'price': item_data.price,
        'pricePerLiter': price_per_liter,
        'shop': item_data.shop,
        'productUrl': item_data.product_url,
        'imageUrl': item_data.image_url,
        'lastUpdated': datetime.utcnow()
    }
    
    db.collection('alcohol_items').document(item_id).set(item_doc)
    
    return AlcoholItemResponse(
        id=item_id,
        user_id=user_id,
        name=item_data.name,
        brand=item_data.brand,
        type=item_data.type,
        size=item_data.size,
        alcohol_percentage=item_data.alcohol_percentage,
        price=item_data.price,
        price_per_liter=price_per_liter,
        shop=item_data.shop,
        product_url=item_data.product_url,
        image_url=item_data.image_url,
        last_updated=datetime.utcnow()
    )

@router.put("/{item_id}", response_model=AlcoholItemResponse)
async def update_alcohol_item(item_id: str, user_id: str, item_data: AlcoholItemCreate):
    """Update an alcohol item"""
    db = get_firestore_client()
    
    item_ref = db.collection('alcohol_items').document(item_id)
    item_doc = item_ref.get()
    
    if not item_doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    existing_data = item_doc.to_dict()
    if existing_data['userId'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    price_per_liter = calculate_price_per_liter(item_data.price, item_data.size)
    
    updated_doc = {
        'name': item_data.name,
        'brand': item_data.brand,
        'type': item_data.type,
        'size': item_data.size,
        'alcoholPercentage': item_data.alcohol_percentage,
        'price': item_data.price,
        'pricePerLiter': price_per_liter,
        'shop': item_data.shop,
        'productUrl': item_data.product_url,
        'imageUrl': item_data.image_url,
        'lastUpdated': datetime.utcnow()
    }
    
    item_ref.update(updated_doc)
    
    return AlcoholItemResponse(
        id=item_id,
        user_id=user_id,
        **updated_doc
    )

@router.delete("/{item_id}")
async def delete_alcohol_item(item_id: str, user_id: str):
    """Delete an alcohol item"""
    db = get_firestore_client()
    
    item_ref = db.collection('alcohol_items').document(item_id)
    item_doc = item_ref.get()
    
    if not item_doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    
    existing_data = item_doc.to_dict()
    if existing_data['userId'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    item_ref.delete()
    return {"message": "Item deleted successfully"}