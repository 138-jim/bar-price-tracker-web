from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.firebase_utils import get_firestore_client
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter()

class CocktailIngredient(BaseModel):
    ingredient_id: str
    ingredient_name: str
    amount: float
    unit: str
    cost: float

class CocktailCreate(BaseModel):
    name: str
    description: Optional[str] = None
    ingredients: List[CocktailIngredient]
    instructions: List[str]
    profit_margin: float
    servings: int = 1
    category: str
    tags: List[str] = []
    image_url: Optional[str] = None

class CocktailResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    ingredients: List[CocktailIngredient]
    instructions: List[str]
    total_cost: float
    profit_margin: float
    selling_price: float
    servings: int
    cost_per_serving: float
    category: str
    tags: List[str]
    image_url: Optional[str]
    created_at: datetime
    updated_at: datetime

def calculate_cocktail_costs(ingredients: List[CocktailIngredient], profit_margin: float, servings: int):
    """Calculate cocktail costs"""
    total_cost = sum(ingredient.cost for ingredient in ingredients)
    cost_per_serving = total_cost / servings if servings > 0 else total_cost
    selling_price = total_cost * (1 + profit_margin / 100)
    
    return {
        'total_cost': total_cost,
        'cost_per_serving': cost_per_serving,
        'selling_price': selling_price
    }

@router.get("/", response_model=List[CocktailResponse])
async def get_cocktails(user_id: str):
    """Get all cocktails for a user"""
    db = get_firestore_client()
    
    cocktails_ref = db.collection('cocktails')
    cocktails_query = cocktails_ref.where('userId', '==', user_id).get()
    
    cocktails = []
    for doc in cocktails_query:
        data = doc.to_dict()
        cocktails.append(CocktailResponse(
            id=doc.id,
            user_id=data['userId'],
            name=data['name'],
            description=data.get('description'),
            ingredients=[
                CocktailIngredient(**ingredient) for ingredient in data['ingredients']
            ],
            instructions=data['instructions'],
            total_cost=data['totalCost'],
            profit_margin=data['profitMargin'],
            selling_price=data['sellingPrice'],
            servings=data['servings'],
            cost_per_serving=data['costPerServing'],
            category=data['category'],
            tags=data.get('tags', []),
            image_url=data.get('imageUrl'),
            created_at=data['createdAt'],
            updated_at=data['updatedAt']
        ))
    
    return cocktails

@router.post("/", response_model=CocktailResponse)
async def create_cocktail(user_id: str, cocktail_data: CocktailCreate):
    """Create a new cocktail"""
    db = get_firestore_client()
    
    cocktail_id = str(uuid.uuid4())
    
    # Calculate costs
    costs = calculate_cocktail_costs(
        cocktail_data.ingredients,
        cocktail_data.profit_margin,
        cocktail_data.servings
    )
    
    now = datetime.utcnow()
    cocktail_doc = {
        'id': cocktail_id,
        'userId': user_id,
        'name': cocktail_data.name,
        'description': cocktail_data.description,
        'ingredients': [ingredient.dict() for ingredient in cocktail_data.ingredients],
        'instructions': cocktail_data.instructions,
        'totalCost': costs['total_cost'],
        'profitMargin': cocktail_data.profit_margin,
        'sellingPrice': costs['selling_price'],
        'servings': cocktail_data.servings,
        'costPerServing': costs['cost_per_serving'],
        'category': cocktail_data.category,
        'tags': cocktail_data.tags,
        'imageUrl': cocktail_data.image_url,
        'createdAt': now,
        'updatedAt': now
    }
    
    db.collection('cocktails').document(cocktail_id).set(cocktail_doc)
    
    return CocktailResponse(
        id=cocktail_id,
        user_id=user_id,
        name=cocktail_data.name,
        description=cocktail_data.description,
        ingredients=cocktail_data.ingredients,
        instructions=cocktail_data.instructions,
        total_cost=costs['total_cost'],
        profit_margin=cocktail_data.profit_margin,
        selling_price=costs['selling_price'],
        servings=cocktail_data.servings,
        cost_per_serving=costs['cost_per_serving'],
        category=cocktail_data.category,
        tags=cocktail_data.tags,
        image_url=cocktail_data.image_url,
        created_at=now,
        updated_at=now
    )

@router.put("/{cocktail_id}", response_model=CocktailResponse)
async def update_cocktail(cocktail_id: str, user_id: str, cocktail_data: CocktailCreate):
    """Update a cocktail"""
    db = get_firestore_client()
    
    cocktail_ref = db.collection('cocktails').document(cocktail_id)
    cocktail_doc = cocktail_ref.get()
    
    if not cocktail_doc.exists:
        raise HTTPException(status_code=404, detail="Cocktail not found")
    
    existing_data = cocktail_doc.to_dict()
    if existing_data['userId'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Calculate costs
    costs = calculate_cocktail_costs(
        cocktail_data.ingredients,
        cocktail_data.profit_margin,
        cocktail_data.servings
    )
    
    updated_doc = {
        'name': cocktail_data.name,
        'description': cocktail_data.description,
        'ingredients': [ingredient.dict() for ingredient in cocktail_data.ingredients],
        'instructions': cocktail_data.instructions,
        'totalCost': costs['total_cost'],
        'profitMargin': cocktail_data.profit_margin,
        'sellingPrice': costs['selling_price'],
        'servings': cocktail_data.servings,
        'costPerServing': costs['cost_per_serving'],
        'category': cocktail_data.category,
        'tags': cocktail_data.tags,
        'imageUrl': cocktail_data.image_url,
        'updatedAt': datetime.utcnow()
    }
    
    cocktail_ref.update(updated_doc)
    
    return CocktailResponse(
        id=cocktail_id,
        user_id=user_id,
        created_at=existing_data['createdAt'],
        **updated_doc
    )

@router.delete("/{cocktail_id}")
async def delete_cocktail(cocktail_id: str, user_id: str):
    """Delete a cocktail"""
    db = get_firestore_client()
    
    cocktail_ref = db.collection('cocktails').document(cocktail_id)
    cocktail_doc = cocktail_ref.get()
    
    if not cocktail_doc.exists:
        raise HTTPException(status_code=404, detail="Cocktail not found")
    
    existing_data = cocktail_doc.to_dict()
    if existing_data['userId'] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cocktail_ref.delete()
    return {"message": "Cocktail deleted successfully"}