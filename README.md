
# Smart Grocery API

Bu proje, FastAPI kullanarak geliştirilmiş bir akıllı market satış tahmin sistemidir. ARIMA modeli kullanarak satış tahminleri yapar ve stok önerileri sunar.

## Özellikler

- 📈 **Satış Tahmini**: ARIMA modeli ile 7 günlük satış tahmini
- 🛍️ **Ürün Bazlı Tahmin**: Belirli ürünler için özel tahminler
- 📊 **Kategori Analizi**: Kategori bazlı satış tahminleri
- 📋 **Stok Önerileri**: Tahmin bazlı akıllı stok önerileri
- 📈 **İstatistikler**: Detaylı satış analizi ve performans metrikleri
- 🎯 **En Çok Satan Ürünler**: Popüler ürün listesi

## API Endpoints

- `GET /` - Ana sayfa
- `GET /forecast` - Genel satış tahmini (7 gün)
- `GET /forecast/{product_id}` - Ürün bazlı tahmin
- `GET /forecast/category/{category_id}` - Kategori bazlı tahmin
- `GET /products` - Ürün listesi
- `GET /top-products` - En çok satan ürünler
- `GET /stats` - Genel istatistikler
- `GET /sales/{start_date}/{end_date}` - Tarih aralığı satışları
- `GET /model-performance` - Model performans metrikleri
- `GET /stock-recommendation/{product_id}` - Stok önerisi

## Kurulum

1. Gerekli paketleri yükleyin:
```bash
pip install fastapi uvicorn pandas statsmodels scikit-learn
```

2. Uygulamayı çalıştırın:
```bash
uvicorn main:app --reload
```

3. API dokümantasyonuna erişin: http://localhost:8000/docs

## Veri Yapısı

Proje aşağıdaki CSV dosyalarını kullanır:
- `sales.csv` - Satış verileri
- `products.csv` - Ürün bilgileri
- `categories.csv` - Kategori bilgileri

## Teknolojiler

- **FastAPI** - Web framework
- **Pandas** - Veri analizi
- **ARIMA (Statsmodels)** - Zaman serisi tahmini
- **Scikit-learn** - Performans metrikleri

## Geliştirici

Bu proje staj çalışması kapsamında geliştirilmiştir.
