'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { apiService, ForecastData } from '../../lib/api';
import { TrendingUp, Calendar } from 'lucide-react';

interface ProductForecast {
  product_id: number;
  product_name: string;
  data: ForecastData[];
}

interface CategoryForecast {
  category_id: number;
  data: ForecastData[];
}

function ForecastsPageContent() {
  const searchParams = useSearchParams();
  const productParam = searchParams.get('product');
  const categoryParam = searchParams.get('category');

  const [generalForecast, setGeneralForecast] = useState<ForecastData[]>([]);
  const [productForecast, setProductForecast] = useState<ProductForecast | null>(null);
  const [categoryForecast, setCategoryForecast] = useState<CategoryForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>(productParam || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryParam || '');

  useEffect(() => {
    fetchForecasts();
  }, []);

  useEffect(() => {
    if (productParam) {
      handleProductForecast();
    }
  }, [productParam]);

  useEffect(() => {
    if (categoryParam) {
      handleCategoryForecast();
    }
  }, [categoryParam]);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getForecast();
      setGeneralForecast(response.data.data);
    } catch (error: any) {
      console.error('Tahminler yüklenirken hata:', error);
      setError('Tahminler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleProductForecast = async () => {
    if (!selectedProductId) return;
    
    try {
      setError('');
      const response = await apiService.getProductForecast(Number(selectedProductId));
      // Backend response structure: { status: "success", data: { product_id, product_name, data: [...] } }
      setProductForecast(response.data.data);
    } catch (error: any) {
      console.error('Ürün tahmini yüklenirken hata:', error);
      setError(error.response?.data?.message || 'Ürün tahmini alınırken hata oluştu');
    }
  };

  const handleCategoryForecast = async () => {
    if (!selectedCategoryId) return;
    
    try {
      setError('');
      const response = await apiService.getCategoryForecast(Number(selectedCategoryId));
      // Backend response structure: { status: "success", data: { category_id, data: [...] } }
      setCategoryForecast(response.data.data);
    } catch (error: any) {
      console.error('Kategori tahmini yüklenirken hata:', error);
      setError(error.response?.data?.message || 'Kategori tahmini alınırken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Satış Tahminleri</h1>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Satış Tahminleri</h1>
        <p className="mt-2 text-gray-600">AI tabanlı satış tahminleri ve analizler</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ürün Bazında Tahmin</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Ürün ID girin"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleProductForecast}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Tahmin Et
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kategori Bazında Tahmin</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Kategori ID girin"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleCategoryForecast}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Tahmin Et
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* General Forecast */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Genel Satış Tahmini</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Tüm ürünler için 7 günlük tahmin</p>
          </div>
          <div className="p-6">
            {generalForecast.length > 0 ? (
              <div className="space-y-4">
                {generalForecast.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.predicted_sales.toLocaleString()} adet
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Veri yüklenirken bir hata oluştu.</p>
            )}
          </div>
        </div>

        {/* Product Forecast */}
        {productForecast && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Ürün Tahmini</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {productForecast.product_name} (ID: {productForecast.product_id})
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {productForecast.data && Array.isArray(productForecast.data) ? (
                  productForecast.data.map((item: ForecastData, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(item.date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.predicted_sales.toLocaleString()} adet
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Tahmin verisi mevcut değil.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Forecast */}
        {categoryForecast && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Kategori Tahmini</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Kategori ID: {categoryForecast.category_id}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {categoryForecast.data && Array.isArray(categoryForecast.data) ? (
                  categoryForecast.data.map((item: ForecastData, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(item.date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.predicted_sales.toLocaleString()} adet
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Tahmin verisi mevcut değil.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!productForecast && !categoryForecast && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Özel Tahmin</h3>
            <p className="text-gray-600">Henüz tahmin verisi yok.</p>
            <p className="text-sm text-gray-500 mt-2">
              Ürün veya kategori ID&apos;si girerek özel tahmin alabilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">ARIMA Tahmin Grafiği</h2>
          </div>
          <div className="p-6">
            <img 
              src={apiService.getForecastPlotUrl()} 
              alt="ARIMA Forecast Chart" 
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg"><span class="text-gray-500">Grafik yüklenemedi</span></div>';
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Model Karşılaştırması</h2>
          </div>
          <div className="p-6">
            <img 
              src={apiService.getComparePlotUrl()} 
              alt="Model Comparison Chart" 
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg"><span class="text-gray-500">Grafik yüklenemedi</span></div>';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ForecastsPageLoading() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Satış Tahminleri</h1>
        <p className="mt-2 text-gray-600">Sayfa yükleniyor...</p>
      </div>
    </div>
  );
}

export default function ForecastsPage() {
  return (
    <Layout>
      <Suspense fallback={<ForecastsPageLoading />}>
        <ForecastsPageContent />
      </Suspense>
    </Layout>
  );
}