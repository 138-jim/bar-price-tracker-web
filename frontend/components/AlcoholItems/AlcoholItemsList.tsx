'use client';

import { useState } from 'react';
import { AlcoholItem } from '@/types';
import { Edit, Trash2, ExternalLink } from 'lucide-react';

interface AlcoholItemsListProps {
  items: AlcoholItem[];
  onEdit: (item: AlcoholItem) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function AlcoholItemsList({ items, onEdit, onDelete, loading }: AlcoholItemsListProps) {
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'pricePerLiter' | 'lastUpdated'>('name');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState('');

  const filteredAndSortedItems = items
    .filter(item => !filterType || item.type.toLowerCase().includes(filterType.toLowerCase()))
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'lastUpdated') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // const handleSort = (field: typeof sortBy) => {
  //   if (sortBy === field) {
  //     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortBy(field);
  //     setSortOrder('asc');
  //   }
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No alcohol items added yet.</p>
        <p className="text-gray-400 text-sm mt-2">Add your first item to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Alcohol Items ({items.length})</h3>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by type..."
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="pricePerLiter">Sort by Price/L</option>
            <option value="lastUpdated">Sort by Updated</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.brand} • {item.type}</p>
              </div>
              
              <div className="flex space-x-1 ml-2">
                {item.productUrl && (
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View product page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => onEdit(item)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit item"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Size:</span>
                <span className="font-medium">{item.size}ml</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Alcohol:</span>
                <span className="font-medium">{item.alcoholPercentage}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Price:</span>
                <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Per Liter:</span>
                <span className="font-medium">${item.pricePerLiter.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Shop:</span>
                <span className="font-medium">{item.shop}</span>
              </div>
              
              <div className="text-xs text-gray-400 mt-3">
                Updated: {new Date(item.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}