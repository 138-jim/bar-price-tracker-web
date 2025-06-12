export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export interface AlcoholItem {
  id: string;
  userId: string;
  name: string;
  brand: string;
  type: string;
  size: number; // in ml
  alcoholPercentage: number;
  price: number;
  pricePerLiter: number;
  shop: string;
  productUrl?: string;
  lastUpdated: Date;
  imageUrl?: string;
}

export interface Ingredient {
  id: string;
  userId: string;
  name: string;
  type: 'alcohol' | 'mixer' | 'garnish' | 'other';
  category: string;
  price: number;
  unit: string; // ml, g, piece, etc.
  pricePerUnit: number;
  shop: string;
  lastUpdated: Date;
}

export interface CocktailIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unit: string;
  cost: number;
}

export interface Cocktail {
  id: string;
  userId: string;
  name: string;
  description?: string;
  ingredients: CocktailIngredient[];
  instructions: string[];
  totalCost: number;
  profitMargin: number;
  sellingPrice: number;
  servings: number;
  costPerServing: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceAlert {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'alcohol' | 'ingredient';
  itemName: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface PriceHistory {
  id: string;
  itemId: string;
  itemType: 'alcohol' | 'ingredient';
  price: number;
  shop: string;
  date: Date;
}

export interface ScrapingResult {
  success: boolean;
  data?: {
    name: string;
    brand: string;
    price: number;
    size: number;
    alcoholPercentage: number;
    imageUrl?: string;
  };
  error?: string;
}