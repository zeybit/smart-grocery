# Smart Grocery Frontend

Bu proje, Smart Grocery API'si için geliştirilmiş modern bir React frontend uygulamasıdır.

## Özellikler

- 📊 Dashboard - Genel satış istatistikleri ve özetler
- 🔮 Tahminler - ARIMA ve Prophet modelleriyle satış tahminleri
- 📦 Ürün Yönetimi - Ürün listesi ve detayları
- 🎯 Stok Önerileri - AI tabanlı stok optimizasyonu
- 📈 İstatistikler - Detaylı satış analizleri
- ⚙️ Model Performansı - ARIMA model performans metrikleri

## Teknolojiler

- Next.js 15
- TypeScript
- Tailwind CSS
- Axios
- Lucide React (İkonlar)
- Chart.js

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda http://localhost:3000 adresini açın

## Backend Bağlantısı

Frontend, http://localhost:8000 adresinde çalışan FastAPI backend'ine bağlanır.

Backend'i çalıştırmak için:
```bash
cd ..
uvicorn main:app --reload
```

## Sayfalar

- **/** - Ana dashboard
- **/forecasts** - Satış tahminleri
- **/products** - Ürün listesi
- **/stock** - Stok önerileri
- **/stats** - İstatistikler
- **/performance** - Model performansı
