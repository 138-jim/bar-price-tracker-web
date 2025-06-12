from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from alcohol_items import router as alcohol_router
from ingredients import router as ingredients_router
from cocktails import router as cocktails_router
from scraper import router as scraper_router

app = FastAPI(title="Bar Price Tracker API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(alcohol_router, prefix="/alcohol", tags=["alcohol"])
app.include_router(ingredients_router, prefix="/ingredients", tags=["ingredients"])
app.include_router(cocktails_router, prefix="/cocktails", tags=["cocktails"])
app.include_router(scraper_router, prefix="/scraper", tags=["scraper"])

@app.get("/")
async def root():
    return {"message": "Bar Price Tracker API"}