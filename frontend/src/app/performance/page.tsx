'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';
import { Activity, Cpu, Database, Zap, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface ModelPerformance {
  active_ml_models: number;
  cached_models: string[];
  model_type: string;
  features_used: string[];
  model_params: {
    n_estimators: number;
    max_depth: number;
    feature_window: number;
  };
  performance_metrics: {
    training_speed: string;
    prediction_speed: string;
    memory_usage: string;
    fallback_models: string[];
  };
}

interface PerformanceMetric {
  name: string;
  value: number | string;
  unit?: string;
  status: 'good' | 'warning' | 'error';
  description: string;
}

export default function PerformancePage() {
  const [performance, setPerformance] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [systemMetrics, setSystemMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setError('');
      const response = await apiService.getModelPerformance();
      setPerformance(response.data.data);
      
      // Sistem metriklerini oluştur
      generateSystemMetrics(response.data.data);
    } catch (error: any) {
      console.error('Performans verisi yüklenirken hata:', error);
      setError('Performans verisi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const generateSystemMetrics = (data: ModelPerformance) => {
    const metrics: PerformanceMetric[] = [
      {
        name: 'Aktif ML Modelleri',
        value: data.active_ml_models || 0,
        status: data.active_ml_models > 0 ? 'good' : 'warning',
        description: 'Cache\'lenen ve kullanıma hazır ML modeli sayısı'
      },
      {
        name: 'Model Türü',
        value: data.model_type || 'Random Forest',
        status: 'good',
        description: 'Kullanılan ana makine öğrenmesi algoritması'
      },
      {
        name: 'Eğitim Hızı',
        value: data.performance_metrics?.training_speed || '~1-2 saniye',
        status: 'good',
        description: 'Yeni model eğitimi için gereken ortalama süre'
      },
      {
        name: 'Tahmin Hızı',
        value: data.performance_metrics?.prediction_speed || '~0.1 saniye',
        status: 'good',
        description: 'Tek tahmin için gereken ortalama süre'
      },
      {
        name: 'Bellek Kullanımı',
        value: data.performance_metrics?.memory_usage || 'Düşük',
        status: 'good',
        description: 'ML modellerinin RAM kullanımı'
      },
      {
        name: 'Özellik Sayısı',
        value: data.features_used?.length || 6,
        status: 'good',
        description: 'Her tahmin için kullanılan özellik (feature) sayısı'
      },
      {
        name: 'Ağaç Sayısı',
        value: data.model_params?.n_estimators || 20,
        status: 'good',
        description: 'Random Forest algoritmasındaki karar ağacı sayısı'
      },
      {
        name: 'Maksimum Derinlik',
        value: data.model_params?.max_depth || 5,
        status: 'good',
        description: 'Her karar ağacının maksimum derinliği'
      }
    ];

    setSystemMetrics(metrics);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Model Performansı</h1>
          <p className="mt-2 text-gray-600">ML modelleri ve sistem performans metrikleri</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Performance Overview */}
        {performance && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Cpu className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Modeller</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {performance.active_ml_models || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-md">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tahmin Hızı</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {performance.performance_metrics?.prediction_speed || '~0.1s'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-md">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bellek Kullanımı</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {performance.performance_metrics?.memory_usage || 'Düşük'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-md">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Model Türü</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {performance.model_type || 'Random Forest'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sistem Metrikleri */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sistem Metrikleri</h2>
            <p className="text-sm text-gray-500 mt-1">Detaylı performans ve konfigürasyon bilgileri</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemMetrics.map((metric, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {getStatusIcon(metric.status)}
                        <h3 className="ml-2 text-sm font-medium text-gray-900">
                          {metric.name}
                        </h3>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {metric.value} {metric.unit}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {metric.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Detayları */}
        {performance && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kullanılan Özellikler */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Kullanılan Özellikler</h3>
                <p className="text-sm text-gray-500 mt-1">ML modellerinin kullandığı veri özellikleri</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {performance.features_used && performance.features_used.length > 0 ? (
                    performance.features_used.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Özellik bilgisi yükleniyor...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cache'lenen Modeller */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Cache'lenen Modeller</h3>
                <p className="text-sm text-gray-500 mt-1">Hazırda bekleyen eğitilmiş modeller</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {performance.cached_models && performance.cached_models.length > 0 ? (
                    performance.cached_models.map((model, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-700">{model}</span>
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Aktif
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Henüz cache'lenmiş model yok</p>
                      <p className="text-xs text-gray-400 mt-1">
                        İlk tahmin yapıldığında modeller cache'lenecek
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Modeller */}
        {performance?.performance_metrics?.fallback_models && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Fallback Modeller</h3>
              <p className="text-sm text-gray-500 mt-1">ML modeli başarısız olduğunda kullanılan alternatif yöntemler</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performance.performance_metrics.fallback_models.map((fallback, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">{fallback}</h4>
                    <p className="text-xs text-gray-600 mt-1">Yedek Model</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Model Parametreleri */}
        {performance?.model_params && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Model Parametreleri</h3>
              <p className="text-sm text-gray-500 mt-1">Random Forest algoritmasının konfigürasyonu</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {performance.model_params.n_estimators || 20}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Estimators</div>
                  <div className="text-xs text-gray-500 mt-1">Karar ağacı sayısı</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {performance.model_params.max_depth || 5}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Max Depth</div>
                  <div className="text-xs text-gray-500 mt-1">Maksimum ağaç derinliği</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {performance.model_params.feature_window || 7}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Feature Window</div>
                  <div className="text-xs text-gray-500 mt-1">Özellik pencere boyutu</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}