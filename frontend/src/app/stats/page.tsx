'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Calendar } from 'lucide-react';

interface StatsData {
  total_sales_quantity: number;
  total_orders: number;
  average_daily_sales: number;
  busiest_day: string;
  busiest_day_sales: number;
  ml_models_cached?: number;
}

interface SalesDateRange {
  start_date: string;
  end_date: string;
  total_sales: number;
  total_orders: number;
  daily_sales: Array<{
    SalesDate: string;
    Quantity: number;
  }>;
  top_products_in_range: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
  }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dateRangeData, setDateRangeData] = useState<SalesDateRange | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchStats();
    
    // Varsayılan tarih aralığı - son 30 gün
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    setStartDate(formatDate(thirtyDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  const fetchStats = async () => {
    try {
      setError('');
      const response = await apiService.getStats();
      setStats(response.data.data);
    } catch (error: any) {
      console.error('İstatistikler yüklenirken hata:', error);
      setError('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchDateRangeData = async () => {
    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Başlangıç tarihi bitiş tarihinden büyük olamaz');
      return;
    }

    try {
      setDateRangeLoading(true);
      setError('');
      const response = await apiService.getSalesByDateRange(startDate, endDate);
      setDateRangeData(response.data);
    } catch (error: any) {
      console.error('Tarih aralığı verisi yüklenirken hata:', error);
      setError(error.response?.data?.message || 'Tarih aralığı verisi yüklenirken hata oluştu');
    } finally {
      setDateRangeLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Güvenli değer alma fonksiyonu
  const safeValue = (value: any, defaultValue: any = 0) => {
    return value !== undefined && value !== null ? value : defaultValue;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detaylı İstatistikler</h1>
          <p className="mt-2 text-gray-600">Satış performansı ve trend analizleri</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Genel İstatistikler */}
        {stats && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Satış</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {safeValue(stats.total_sales_quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-md">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {safeValue(stats.total_orders).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-md">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Günlük Ortalama</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {safeValue(stats.average_daily_sales, 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-md">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Yoğun Gün</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {safeValue(stats.busiest_day, 'N/A')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-md">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Yoğun Gün Satış</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {safeValue(stats.busiest_day_sales).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-md">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ML Modelleri</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {safeValue(stats.ml_models_cached, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tarih Aralığı Analizi */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tarih Aralığı Analizi</h2>
            <p className="text-sm text-gray-500 mt-1">Belirli bir tarih aralığındaki satış verilerini analiz edin</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchDateRangeData}
                  disabled={dateRangeLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {dateRangeLoading ? 'Yükleniyor...' : 'Analiz Et'}
                </button>
              </div>
            </div>

            {/* Tarih Aralığı Sonuçları */}
            {dateRangeData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dönem Özeti</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toplam Satış:</span>
                        <span className="font-semibold">{safeValue(dateRangeData.total_sales).toLocaleString()} adet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toplam Sipariş:</span>
                        <span className="font-semibold">{safeValue(dateRangeData.total_orders).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Günlük Ortalama:</span>
                        <span className="font-semibold">
                          {dateRangeData.daily_sales && dateRangeData.daily_sales.length > 0 
                            ? (safeValue(dateRangeData.total_sales) / dateRangeData.daily_sales.length).toFixed(1)
                            : '0'
                          } adet/gün
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">En Çok Satan Ürünler</h3>
                    <div className="space-y-2">
                      {dateRangeData.top_products_in_range && dateRangeData.top_products_in_range.length > 0 ? (
                        dateRangeData.top_products_in_range.slice(0, 5).map((product, index) => (
                          <div key={product.product_id} className="flex justify-between">
                            <span className="text-gray-600 truncate">
                              {index + 1}. {product.product_name}
                            </span>
                            <span className="font-semibold ml-2">
                              {safeValue(product.total_sold).toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">Veri bulunamadı</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Günlük Satış Trendi */}
                {dateRangeData.daily_sales && dateRangeData.daily_sales.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Günlük Satış Trendi</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dateRangeData.daily_sales.map((day, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600">{day.SalesDate}</span>
                          <span className="font-semibold">{safeValue(day.Quantity).toLocaleString()} adet</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sistem Performansı</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{safeValue(stats?.ml_models_cached, 0)}</div>
                <div className="text-sm text-gray-600">Aktif ML Modeli</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">~2s</div>
                <div className="text-sm text-gray-600">Ortalama API Yanıt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Cache</div>
                <div className="text-sm text-gray-600">Optimizasyon Aktif</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}