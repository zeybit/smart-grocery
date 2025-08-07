'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiService, ForecastData } from '../lib/api';
import { useAppContext } from '../contexts/AppContext';

export default function Home() {
  const { stats, topProducts, loading: globalLoading, refreshData, isDataFresh } = useAppContext();
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [plotUrls, setPlotUrls] = useState<{ forecast: string; compare: string } | null>(null);

  useEffect(() => {
    // Global veri fresh değilse yenile
    if (!isDataFresh() && !globalLoading) {
      refreshData();
    }

    // Forecast verisi ve plot URL'leri client-side yükle
    loadForecast();
    generatePlotUrls();
  }, []);

  // Timeout için özel error handling
const loadForecast = async () => {
  try {
    setForecastLoading(true);
    setError('');
    
    // Timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('İşlem çok uzun sürüyor')), 45000)
    );
    
    // API çağrısı
    const apiPromise = apiService.getForecast();
    
    // Race between API and timeout
    const response: any = await Promise.race([apiPromise, timeoutPromise]);
    setForecast(response.data.data);
    
  } catch (error: any) {
    console.error('Tahmin yüklenemedi:', error);
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      setError('Tahmin hesaplama işlemi çok uzun sürüyor. Lütfen daha sonra tekrar deneyin.');
    } else {
      setError('Tahmin verisi yüklenirken hata oluştu');
    }
    
    // Fallback veri
    const fallbackData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted_sales: 50
    }));
    setForecast(fallbackData);
    
  } finally {
    setForecastLoading(false);
  }
};

  const generatePlotUrls = () => {
    // Client-side'da URL'leri oluştur
    setPlotUrls({
      forecast: apiService.getForecastPlotUrl(),
      compare: apiService.getComparePlotUrl()
    });
  };

  if (globalLoading && !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Bağlantı Hatası</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Smart Grocery Analytics hoş geldiniz</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Toplam Satış Miktarı</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total_sales_quantity.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Toplam Sipariş</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total_orders.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Günlük Ortalama</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stats.average_daily_sales.toFixed(1)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">En Yoğun Gün</div>
              <div className="mt-2 text-lg font-bold text-gray-900">{stats.busiest_day}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">En Çok Satan Ürünler</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{product.product_name}</div>
                      <div className="text-sm text-gray-500">ID: {product.product_id} • ₺{product.price.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{product.total_sold.toLocaleString()} adet</div>
                      <div className="text-sm text-gray-500">#{index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">7 Günlük Tahmin</h3>
                {forecastLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>
            <div className="p-6">
              {forecastLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">Tahminler hesaplanıyor...</div>
                </div>
              ) : forecast.length > 0 ? (
                <div className="space-y-4">
                  {forecast.slice(0, 7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{item.date}</div>
                      <div className="font-bold text-blue-600">{item.predicted_sales.toLocaleString()} adet</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Tahmin verisi yüklenemedi
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grafikler - Client-side render */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">ARIMA Tahmin Grafiği</h3>
            </div>
            <div className="p-6">
              {plotUrls ? (
                <img 
                  src={plotUrls.forecast}
                  alt="ARIMA Tahmin Grafiği"
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg"><span class="text-gray-500">Grafik yüklenemedi</span></div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Model Karşılaştırma</h3>
            </div>
            <div className="p-6">
              {plotUrls ? (
                <img 
                  src={plotUrls.compare}
                  alt="Model Karşılaştırma Grafiği"
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg"><span class="text-gray-500">Grafik yüklenemedi</span></div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}