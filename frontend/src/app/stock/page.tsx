'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { apiService, StockRecommendationData } from '../../lib/api';
import { Package, TrendingUp, Clock, DollarSign } from 'lucide-react';

function StockPageContent() {
  const searchParams = useSearchParams();
  const productParam = searchParams.get('product');

  const [stockData, setStockData] = useState<StockRecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(productParam || '');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (productParam) {
      handleStockRecommendation();
    }
  }, [productParam]);

  const handleStockRecommendation = async () => {
    if (!selectedProductId) {
      setError('Lütfen ürün ID\'si girin');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiService.getStockRecommendation(Number(selectedProductId));
      setStockData(response.data);
    } catch (error: any) {
      console.error('Stok önerisi yüklenirken hata:', error);
      setError(error.response?.data?.message || 'Stok önerisi alınırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stok Önerileri</h1>
        <p className="mt-2 text-gray-600">AI tabanlı stok optimizasyonu ve öneriler</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün ID&apos;sine Göre Stok Önerisi
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Ürün ID girin"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleStockRecommendation}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : 'Analiz Et'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      {/* Stock Recommendation Results */}
      {stockData && (
        <div className="space-y-8">
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ürün Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ürün Adı</p>
                <p className="text-lg font-medium text-gray-900">{stockData.product_info.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ürün ID</p>
                <p className="text-lg font-medium text-gray-900">#{stockData.product_info.product_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Birim Fiyat</p>
                <p className="text-lg font-medium text-gray-900">₺{stockData.product_info.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Stock Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Önerilen Stok</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stockData.stock_recommendation.recommended_stock_quantity.toLocaleString()} adet
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-md">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">7 Günlük Talep</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stockData.stock_recommendation.predicted_7day_demand.toLocaleString()} adet
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-md">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Güvenlik Stoku</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stockData.stock_recommendation.safety_stock.toLocaleString()} adet
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-md">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tahmini Maliyet</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₺{stockData.stock_recommendation.estimated_cost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Detaylı Analiz</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ortalama Günlük Satış</h3>
                  <p className="text-xl font-semibold text-gray-900">
                    {stockData.analytics.average_daily_sales.toFixed(1)} adet/gün
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Son 30 Gün Ortalaması</h3>
                  <p className="text-xl font-semibold text-gray-900">
                    {stockData.analytics.recent_30day_avg.toFixed(1)} adet/gün
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Stok Devir Süresi</h3>
                  <p className="text-xl font-semibold text-gray-900">
                    {stockData.analytics.stock_turnover_days.toFixed(1)} gün
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Toplam Geçmiş Satış</h3>
                  <p className="text-xl font-semibold text-gray-900">
                    {stockData.analytics.total_historical_sales.toLocaleString()} adet
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Kullanılan Veri Noktası</h3>
                  <p className="text-xl font-semibold text-gray-900">
                    {stockData.analytics.data_points_used.toLocaleString()} gün
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Stok Durumu</h3>
                  <div className="mt-2">
                    {stockData.analytics.stock_turnover_days < 30 ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Hızlı Satış
                      </span>
                    ) : stockData.analytics.stock_turnover_days < 60 ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Normal Satış
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Yavaş Satış
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Stok Yönetimi Önerileri</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Önerilen stok miktarı 7 günlük talep tahmini + güvenlik stokunu içerir</li>
                    <li>Güvenlik stoku 3 günlük ortalama satışa eşittir</li>
                    <li>Stok devir süresi {stockData.analytics.stock_turnover_days.toFixed(1)} gündür</li>
                    {stockData.analytics.recent_30day_avg > stockData.analytics.average_daily_sales && (
                      <li className="text-green-700">Son dönemde satışlar artış gösteriyor</li>
                    )}
                    {stockData.analytics.recent_30day_avg < stockData.analytics.average_daily_sales && (
                      <li className="text-orange-700">Son dönemde satışlar azalış gösteriyor</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StockPageLoading() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stok Önerileri</h1>
        <p className="mt-2 text-gray-600">Sayfa yükleniyor...</p>
      </div>
    </div>
  );
}

export default function StockPage() {
  return (
    <Layout>
      <Suspense fallback={<StockPageLoading />}>
        <StockPageContent />
      </Suspense>
    </Layout>
  );
}