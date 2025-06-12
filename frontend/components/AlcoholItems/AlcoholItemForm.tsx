'use client';

import { useState } from 'react';
import { AlcoholItem } from '@/types';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { scraperApi } from '@/lib/api';

interface AlcoholItemFormProps {
  item?: AlcoholItem;
  onSave: (item: Omit<AlcoholItem, 'id' | 'userId' | 'pricePerLiter' | 'lastUpdated'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function AlcoholItemForm({ item, onSave, onCancel, loading }: AlcoholItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    brand: item?.brand || '',
    type: item?.type || '',
    size: item?.size || 0,
    alcoholPercentage: item?.alcoholPercentage || 0,
    price: item?.price || 0,
    shop: item?.shop || '',
    productUrl: item?.productUrl || '',
    imageUrl: item?.imageUrl || '',
  });
  
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'size' || name === 'alcoholPercentage' || name === 'price' 
        ? parseFloat(value) || 0 
        : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAutoFill = async () => {
    if (!formData.productUrl) return;
    
    setScrapingLoading(true);
    try {
      const result = await scraperApi.scrapeProduct(formData.productUrl);
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          name: result.data?.name || prev.name,
          brand: result.data?.brand || prev.brand,
          size: result.data?.size || prev.size,
          alcoholPercentage: result.data?.alcoholPercentage || prev.alcoholPercentage,
          price: result.data?.price || prev.price,
          imageUrl: result.data?.imageUrl || prev.imageUrl,
        }));
      } else {
        alert(`Auto-fill failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Auto-fill failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScrapingLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.type.trim()) newErrors.type = 'Type is required';
    if (formData.size <= 0) newErrors.size = 'Size must be greater than 0';
    if (formData.alcoholPercentage < 0 || formData.alcoholPercentage > 100) {
      newErrors.alcoholPercentage = 'Alcohol percentage must be between 0 and 100';
    }
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.shop.trim()) newErrors.shop = 'Shop is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSave(formData);
    } catch (error) {
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">
            {item ? 'Edit Alcohol Item' : 'Add New Alcohol Item'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product URL with Auto-fill */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="productUrl"
                value={formData.productUrl}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://bws.com.au/product/..."
              />
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={!formData.productUrl || scrapingLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {scrapingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                <span>Auto-fill</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Jameson Irish Whiskey"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.brand ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Jameson"
              />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.type ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select type</option>
                <option value="Whiskey">Whiskey</option>
                <option value="Vodka">Vodka</option>
                <option value="Gin">Gin</option>
                <option value="Rum">Rum</option>
                <option value="Tequila">Tequila</option>
                <option value="Beer">Beer</option>
                <option value="Wine">Wine</option>
                <option value="Liqueur">Liqueur</option>
                <option value="Brandy">Brandy</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size (ml) *
              </label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.size ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="700"
              />
              {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
            </div>

            {/* Alcohol Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alcohol % *
              </label>
              <input
                type="number"
                name="alcoholPercentage"
                value={formData.alcoholPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.alcoholPercentage ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="40"
              />
              {errors.alcoholPercentage && <p className="text-red-500 text-xs mt-1">{errors.alcoholPercentage}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="45.99"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* Shop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop *
              </label>
              <select
                name="shop"
                value={formData.shop}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.shop ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select shop</option>
                <option value="BWS">BWS</option>
                <option value="Liquorland">Liquorland</option>
                <option value="Dan Murphy&apos;s">Dan Murphy&apos;s</option>
                <option value="First Choice Liquor">First Choice Liquor</option>
                <option value="Other">Other</option>
              </select>
              {errors.shop && <p className="text-red-500 text-xs mt-1">{errors.shop}</p>}
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{item ? 'Update' : 'Create'} Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}