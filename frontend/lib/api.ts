import { AlcoholItem, Ingredient, Cocktail, ScrapingResult } from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Alcohol Items API
export const alcoholItemsApi = {
  getAll: (userId: string): Promise<AlcoholItem[]> =>
    apiCall(`/alcohol?user_id=${userId}`),

  create: (userId: string, item: Omit<AlcoholItem, 'id' | 'userId' | 'pricePerLiter' | 'lastUpdated'>): Promise<AlcoholItem> =>
    apiCall(`/alcohol?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  update: (userId: string, itemId: string, item: Omit<AlcoholItem, 'id' | 'userId' | 'pricePerLiter' | 'lastUpdated'>): Promise<AlcoholItem> =>
    apiCall(`/alcohol/${itemId}?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),

  delete: (userId: string, itemId: string): Promise<{ message: string }> =>
    apiCall(`/alcohol/${itemId}?user_id=${userId}`, {
      method: 'DELETE',
    }),
};

// Ingredients API
export const ingredientsApi = {
  getAll: (userId: string): Promise<Ingredient[]> =>
    apiCall(`/ingredients?user_id=${userId}`),

  create: (userId: string, ingredient: Omit<Ingredient, 'id' | 'userId' | 'pricePerUnit' | 'lastUpdated'>): Promise<Ingredient> =>
    apiCall(`/ingredients?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(ingredient),
    }),

  update: (userId: string, ingredientId: string, ingredient: Omit<Ingredient, 'id' | 'userId' | 'pricePerUnit' | 'lastUpdated'>): Promise<Ingredient> =>
    apiCall(`/ingredients/${ingredientId}?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(ingredient),
    }),

  delete: (userId: string, ingredientId: string): Promise<{ message: string }> =>
    apiCall(`/ingredients/${ingredientId}?user_id=${userId}`, {
      method: 'DELETE',
    }),
};

// Cocktails API
export const cocktailsApi = {
  getAll: (userId: string): Promise<Cocktail[]> =>
    apiCall(`/cocktails?user_id=${userId}`),

  create: (userId: string, cocktail: Omit<Cocktail, 'id' | 'userId' | 'totalCost' | 'sellingPrice' | 'costPerServing' | 'createdAt' | 'updatedAt'>): Promise<Cocktail> =>
    apiCall(`/cocktails?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(cocktail),
    }),

  update: (userId: string, cocktailId: string, cocktail: Omit<Cocktail, 'id' | 'userId' | 'totalCost' | 'sellingPrice' | 'costPerServing' | 'createdAt' | 'updatedAt'>): Promise<Cocktail> =>
    apiCall(`/cocktails/${cocktailId}?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(cocktail),
    }),

  delete: (userId: string, cocktailId: string): Promise<{ message: string }> =>
    apiCall(`/cocktails/${cocktailId}?user_id=${userId}`, {
      method: 'DELETE',
    }),
};

// Scraper API
export const scraperApi = {
  scrapeProduct: (productUrl: string): Promise<ScrapingResult> =>
    apiCall('/scraper/scrape', {
      method: 'POST',
      body: JSON.stringify({ product_url: productUrl }),
    }),

  updateAllPrices: (userId: string): Promise<{ updated_count: number; total_items: number; errors: string[] }> =>
    apiCall('/scraper/update-prices', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),
};