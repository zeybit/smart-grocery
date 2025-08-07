'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, SalesStatsData, TopProductData } from '../lib/api';

interface AppState {
  stats: SalesStatsData | null;
  topProducts: TopProductData[];
  loading: boolean;
  lastUpdated: number;
}

interface AppContextType extends AppState {
  refreshData: () => Promise<void>;
  isDataFresh: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    stats: null,
    topProducts: [],
    loading: false,
    lastUpdated: 0
  });

  const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

  const isDataFresh = () => {
    return Date.now() - state.lastUpdated < CACHE_DURATION;
  };

  const refreshData = async () => {
    if (state.loading || isDataFresh()) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const [statsRes, topProductsRes] = await Promise.all([
        apiService.getStats(),
        apiService.getTopProducts(10),
      ]);

      setState({
        stats: statsRes.data.data,
        topProducts: topProductsRes.data.data,
        loading: false,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Veri yenileme hatası:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AppContext.Provider value={{ ...state, refreshData, isDataFresh }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};