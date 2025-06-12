from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.firebase_utils import get_firestore_client
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter()

class IngredientCreate(BaseModel):
    name: str
    type: str  # 'alcohol', 'mixer', 'garnish', 'other'
    category: str
    price: float
    unit: str  # ml, g, piece, etc.
    shop: str

class IngredientResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: str
    category: str
    price: float
    unit: str
    price_per_unit: float
    shop: str
    last_updated: datetime

def calculate_price_per_unit(price: float, unit: str) -> float:
    """Calculate price per unit - simplified calculation"""
    # This would need more sophisticated logic based on unit types
    return price  # For now, assume price is already per unit

@router.get("/", response_model=List[IngredientResponse])
async def get_ingredients(user_id: str):
    """Get all ingredients for a user"""
    db = get_firestore_client()
    
    ingredients_ref = db.collection('ingredients')
    ingredients_query = ingredients_ref.where('userId', '==', user_id).get()
    
    ingredients = []
    for doc in ingredients_query:
        data = doc.to_dict()
        ingredients.append(IngredientResponse(
            id=doc.id,
            user_id=data['userId'],
            name=data['name'],
            type=data['type'],
            category=data['category'],
            price=data['price'],
            unit=data['unit'],
            price_per_unit=data['pricePerUnit'],
            shop=data['shop'],
            last_updated=data['lastUpdated']
        ))
    
    return ingredients

@router.post("/", response_model=IngredientResponse)
async def create_ingredient(user_id: str, ingredient_data: IngredientCreate):
    """Create a new ingredient"""
    db = get_firestore_client()
    
    ingredient_id = str(uuid.uuid4())
    price_per_unit = calculate_price_per_unit(ingredient_data.price, ingredient_data.unit)
    
    ingredient_doc = {
        'id': ingredient_id,
        'userId': user_id,
        'name': ingredient_data.name,
        'type': ingredient_data.type,
        'category': ingredient_data.category,
        'price': ingredient_data.price,
        'unit': ingredient_data.unit,
        'pricePerUnit': price_per_unit,
        'shop': ingredient_data.shop,
        'lastUpdated': datetime.utcnow()
    }
    
    db.collection('ingredients').document(ingredient_id).set(ingredient_doc)
    
    return IngredientResponse(
        id=ingredient_id,
        user_id=user_id,
        name=ingredient_data.name,
        type=ingredient_data.type,
        category=ingredient_data.category,
        price=ingredient_data.price,
        unit=ingredient_data.unit,
        price_per_unit=price_per_unit,
        shop=ingredient_data.shop,
        last_updated=datetime.utcnow()
    )

@router.put("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(ingredient_id: str, user_id: str, ingredient_data: IngredientCreate):
    """Update an ingredient"""
    db = get_firestore_client()
    
    ingredient_ref = db.collection('ingredients').document(ingredient_id)
    ingredient_doc = ingredient_ref.get()
    
    if not ingredient_doc.exists:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    existing_data = ingredient_doc.to_dict()
    if existing_data['userId'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    price_per_unit = calculate_price_per_unit(ingredient_data.price, ingredient_data.unit)
    
    updated_doc = {
        'name': ingredient_data.name,
        'type': ingredient_data.type,
        'category': ingredient_data.category,
        'price': ingredient_data.price,
        'unit': ingredient_data.unit,
        'pricePerUnit': price_per_unit,
        'shop': ingredient_data.shop,
        'lastUpdated': datetime.utcnow()
    }
    
    ingredient_ref.update(updated_doc)
    
    return IngredientResponse(
        id=ingredient_id,
        user_id=user_id,
        **updated_doc
    )

@router.delete("/{ingredient_id}")
async def delete_ingredient(ingredient_id: str, user_id: str):
    """Delete an ingredient"""
    db = get_firestore_client()
    
    ingredient_ref = db.collection('ingredients').document(ingredient_id)
    ingredient_doc = ingredient_ref.get()
    
    if not ingredient_doc.exists:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    existing_data = ingredient_doc.to_dict()
    if existing_data['userId'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    ingredient_ref.delete()
    return {"message": "Ingredient deleted successfully"}