from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.firebase_utils import get_firestore_client
import hashlib
import uuid
from datetime import datetime

router = APIRouter()

class UserRegistration(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    db = get_firestore_client()
    
    # Check if user already exists
    users_ref = db.collection('users')
    existing_user = users_ref.where('email', '==', user_data.email).limit(1).get()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        'id': user_id,
        'email': user_data.email,
        'firstName': user_data.first_name,
        'lastName': user_data.last_name,
        'createdAt': datetime.utcnow()
    }
    
    # Store user
    users_ref.document(user_id).set(user_doc)
    
    # Store password separately
    password_doc = {
        'userId': user_id,
        'passwordHash': hash_password(user_data.password),
        'createdAt': datetime.utcnow()
    }
    db.collection('user_passwords').document(user_id).set(password_doc)
    
    return UserResponse(
        id=user_id,
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )

@router.post("/login", response_model=UserResponse)
async def login_user(login_data: UserLogin):
    """Login user"""
    db = get_firestore_client()
    
    # Find user
    users_ref = db.collection('users')
    user_query = users_ref.where('email', '==', login_data.email).limit(1).get()
    
    if not user_query:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc = user_query[0].to_dict()
    user_id = user_doc['id']
    
    # Check password
    password_ref = db.collection('user_passwords').document(user_id)
    password_doc = password_ref.get()
    
    if not password_doc.exists:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    password_data = password_doc.to_dict()
    if password_data['passwordHash'] != hash_password(login_data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return UserResponse(
        id=user_id,
        email=user_doc['email'],
        first_name=user_doc['firstName'],
        last_name=user_doc['lastName']
    )