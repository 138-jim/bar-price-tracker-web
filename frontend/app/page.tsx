'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout/Layout';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import AlcoholItemsList from '@/components/AlcoholItems/AlcoholItemsList';
import AlcoholItemForm from '@/components/AlcoholItems/AlcoholItemForm';
import { User, AlcoholItem } from '@/types';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '@/lib/auth';
import { alcoholItemsApi, scraperApi } from '@/lib/api';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('alcohol');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [alcoholItems, setAlcoholItems] = useState<AlcoholItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<AlcoholItem | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [priceUpdateLoading, setPriceUpdateLoading] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    
    initAuth();
  }, []);

  const loadAlcoholItems = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await alcoholItemsApi.getAll(user.id);
      setAlcoholItems(items);
    } catch (error) {
      console.error('Failed to load alcohol items:', error);
      alert('Failed to load alcohol items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load data when user changes
  useEffect(() => {
    if (user && activeTab === 'alcohol') {
      loadAlcoholItems();
    }
  }, [user, activeTab, loadAlcoholItems]);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, firstName: string, lastName: string) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const userData = await registerUser(email, password, firstName, lastName);
      setUser(userData);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setAlcoholItems([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveItem = async (itemData: Omit<AlcoholItem, 'id' | 'userId' | 'pricePerLiter' | 'lastUpdated'>) => {
    if (!user) return;
    
    setFormLoading(true);
    try {
      if (editingItem) {
        await alcoholItemsApi.update(user.id, editingItem.id, itemData);
      } else {
        await alcoholItemsApi.create(user.id, itemData);
      }
      
      await loadAlcoholItems();
      setShowForm(false);
      setEditingItem(undefined);
    } catch (error) {
      throw error; // Let the form handle the error display
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditItem = (item: AlcoholItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await alcoholItemsApi.delete(user.id, id);
      await loadAlcoholItems();
    } catch {
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleUpdateAllPrices = async () => {
    if (!user) return;
    
    setPriceUpdateLoading(true);
    try {
      const result = await scraperApi.updateAllPrices(user.id);
      
      if (result.errors.length > 0) {
        alert(`Updated ${result.updated_count} of ${result.total_items} items. Some errors occurred:\n${result.errors.join('\n')}`);
      } else {
        alert(`Successfully updated prices for ${result.updated_count} of ${result.total_items} items.`);
      }
      
      await loadAlcoholItems();
    } catch {
      alert('Failed to update prices. Please try again.');
    } finally {
      setPriceUpdateLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'alcohol':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Alcohol Items</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateAllPrices}
                  disabled={priceUpdateLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {priceUpdateLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Update Prices</span>
                </button>
                <button
                  onClick={() => {
                    setEditingItem(undefined);
                    setShowForm(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
            
            <AlcoholItemsList
              items={alcoholItems}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              loading={loading}
            />
          </div>
        );
      case 'ingredients':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
            <p className="text-gray-500">Ingredients management coming soon...</p>
          </div>
        );
      case 'cocktails':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cocktails</h2>
            <p className="text-gray-500">Cocktail recipes and cost calculations coming soon...</p>
          </div>
        );
      case 'prices':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Price History</h2>
            <p className="text-gray-500">Price tracking and history coming soon...</p>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  if (!user) {
    return (
      <Layout
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          {authMode === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => setAuthMode('register')}
              loading={authLoading}
              error={authError}
            />
          ) : (
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => setAuthMode('login')}
              loading={authLoading}
              error={authError}
            />
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {renderTabContent()}
      
      {showForm && (
        <AlcoholItemForm
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(undefined);
          }}
          loading={formLoading}
        />
      )}
    </Layout>
  );
}