'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import AlcoholItemsList from '@/components/AlcoholItems/AlcoholItemsList';
import { User, AlcoholItem } from '@/types';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('alcohol');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [alcoholItems, setAlcoholItems] = useState<AlcoholItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock authentication functions
  const handleLogin = async (email: string) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const mockUser: User = {
        id: '1',
        email,
        firstName: 'Demo',
        lastName: 'User',
        createdAt: new Date()
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch {
      setAuthError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, firstName: string, lastName: string) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const mockUser: User = {
        id: '1',
        email,
        firstName,
        lastName,
        createdAt: new Date()
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch {
      setAuthError('Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Mock data loading
  useEffect(() => {
    if (user && activeTab === 'alcohol') {
      setLoading(true);
      // TODO: Replace with actual API call
      setTimeout(() => {
        setAlcoholItems([
          {
            id: '1',
            userId: user.id,
            name: 'Jameson Irish Whiskey',
            brand: 'Jameson',
            type: 'Whiskey',
            size: 700,
            alcoholPercentage: 40,
            price: 45.99,
            pricePerLiter: 65.70,
            shop: 'BWS',
            lastUpdated: new Date(),
            productUrl: 'https://bws.com.au/product/jameson'
          },
          {
            id: '2',
            userId: user.id,
            name: 'Grey Goose Vodka',
            brand: 'Grey Goose',
            type: 'Vodka',
            size: 750,
            alcoholPercentage: 40,
            price: 65.99,
            pricePerLiter: 87.99,
            shop: 'Liquorland',
            lastUpdated: new Date()
          }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [user, activeTab]);

  const handleEditItem = (item: AlcoholItem) => {
    // TODO: Implement edit functionality
    console.log('Edit item:', item);
  };

  const handleDeleteItem = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete item:', id);
    setAlcoholItems(items => items.filter(item => item.id !== id));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'alcohol':
        return (
          <AlcoholItemsList
            items={alcoholItems}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            loading={loading}
          />
        );
      case 'ingredients':
        return <div className="text-center py-12 text-gray-500">Ingredients feature coming soon...</div>;
      case 'cocktails':
        return <div className="text-center py-12 text-gray-500">Cocktails feature coming soon...</div>;
      case 'prices':
        return <div className="text-center py-12 text-gray-500">Price updates feature coming soon...</div>;
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
    </Layout>
  );
}