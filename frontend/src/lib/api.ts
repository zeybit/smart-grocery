import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 saniye
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - caching için
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Cache mekanizması
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

const getCacheKey = (url: string, params?: any) => {
  return `${url}_${JSON.stringify(params || {})}`;
};

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// API fonksiyonları
export const apiService = {
  // Cache'li API çağrıları
  async getStats() {
    const cacheKey = getCacheKey('/stats');
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get('/stats');
    setCachedData(cacheKey, response);
    return response;
  },

  async getTopProducts(limit: number = 10) {
    const cacheKey = getCacheKey('/top-products', { limit });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get(`/top-products?limit=${limit}`);
    setCachedData(cacheKey, response);
    return response;
  },

  // Cache'siz API çağrıları (dinamik veriler)
  async getForecast() {
    return apiClient.get('/forecast');
  },

  async getProductForecast(productId: number) {
    return apiClient.get(`/forecast/${productId}`);
  },

  async getCategoryForecast(categoryId: number) {
    return apiClient.get(`/forecast/category/${categoryId}`);
  },

  async getProducts(limit: number = 50) {
    const cacheKey = getCacheKey('/products', { limit });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get(`/products?limit=${limit}`);
    setCachedData(cacheKey, response);
    return response;
  },

  async getModelPerformance() {
    return apiClient.get('/model-performance');
  },

  async getStockRecommendation(productId: number) {
    return apiClient.get(`/stock-recommendation/${productId}`);
  },

  async getSalesByDateRange(startDate: string, endDate: string) {
    return apiClient.get(`/sales/${startDate}/${endDate}`);
  },

    getForecastPlotUrl() {
    // Client-side'da timestamp ekle
    if (typeof window !== 'undefined') {
      return `${API_BASE_URL}/forecast-plot?t=${Date.now()}`;
    }
    // Server-side'da timestamp yok
    return `${API_BASE_URL}/forecast-plot`;
  },

  getComparePlotUrl() {
    // Client-side'da timestamp ekle
    if (typeof window !== 'undefined') {
      return `${API_BASE_URL}/compare-plot?t=${Date.now()}`;
    }
    // Server-side'da timestamp yok
    return `${API_BASE_URL}/compare-plot`;
  },

  // Cache temizleme
  clearCache() {
    cache.clear();
  }
};

// Type definitions
export interface SalesStatsData {
  total_sales_quantity: number;
  total_orders: number;
  average_daily_sales: number;
  busiest_day: string;
  busiest_day_sales: number;
  ml_models_cached?: number;
}

export interface TopProductData {
  product_id: number;
  product_name: string;
  total_sold: number;
  price: number;
}

export interface ForecastData {
  date: string;
  predicted_sales: number;
}

export interface ProductData {
  product_id: number;
  product_name: string;
  price: number;
  category_id: number;
  class: string;
}
// ...existing code...

export interface StockRecommendationData {
  product_info: {
    product_id: number;
    product_name: string;
    price: number;
  };
  stock_recommendation: {
    recommended_stock_quantity: number;
    predicted_7day_demand: number;
    safety_stock: number;
    estimated_cost: number;
  };
  analytics: {
    average_daily_sales: number;
    recent_30day_avg: number;
    stock_turnover_days: number;
    total_historical_sales: number;
    data_points_used: number;
  };
}