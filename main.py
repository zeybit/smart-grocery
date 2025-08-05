from fastapi import FastAPI
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import warnings
from datetime import timedelta

warnings.filterwarnings("ignore")

# === Dosya yolları ===
SALES_PATH = "data/datastaj/sales.csv"
PRODUCTS_PATH = "data/datastaj/products.csv"
CATEGORIES_PATH = "data/datastaj/categories.csv"

app = FastAPI(title="Smart Grocery API")

@app.get("/")
def home():
    return {"message": "Smart Grocery API çalışıyor!"}

@app.get("/forecast")
def forecast_sales():
    """
    Tüm ürünler için toplam satış tahmini (7 gün)
    """
    try:
        # 1. Verileri oku - sadece gerekli sütunları ve daha az satır
        sales_df = pd.read_csv(SALES_PATH, usecols=['ProductID', 'Quantity', 'SalesDate'], nrows=50000)
        products_df = pd.read_csv(PRODUCTS_PATH, usecols=['ProductID', 'ProductName'])

        # 2. Ürün isimleri ile birleştir
        merged_df = sales_df.merge(products_df, left_on="ProductID", right_on="ProductID", how="left")

        # 3. Tarihi datetime formatına çevir
        merged_df['SalesDate'] = pd.to_datetime(merged_df['SalesDate'])

        # 4. Günlük toplam satış
        daily_sales = merged_df.groupby('SalesDate')['Quantity'].sum()
        
        # Veri kontrolü
        if len(daily_sales) < 10:
            return {"status": "error", "message": "Yeterli veri yok"}

        # 5. ARIMA modeli ile tahmin
        model = ARIMA(daily_sales, order=(2,1,1))  # Daha basit model
        model_fit = model.fit()

        steps = 7
        forecast = model_fit.forecast(steps=steps)

        # 6. Tahminleri JSON formatına çevir
        forecast_dates = [str(daily_sales.index[-1] + timedelta(days=i+1)) for i in range(steps)]
        forecast_list = [{"date": date, "predicted_sales": int(max(0, value))} for date, value in zip(forecast_dates, forecast)]

        return {
            "status": "success",
            "forecast_days": steps,
            "data_points_used": len(daily_sales),
            "data": forecast_list
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}


@app.get("/forecast/{product_id}")
def forecast_product(product_id: int):
    """
    Belirli bir ürün için 7 günlük satış tahmini
    """
    try:
        # 1. Verileri oku - sadece gerekli sütunları ve daha az satır
        sales_df = pd.read_csv(SALES_PATH, usecols=['ProductID', 'Quantity', 'SalesDate'], nrows=50000)
        products_df = pd.read_csv(PRODUCTS_PATH, usecols=['ProductID', 'ProductName'])

        # 2. Ürün isimleri ile birleştir
        merged_df = sales_df.merge(products_df, left_on="ProductID", right_on="ProductID", how="left")

        # 3. İlgili ürünü filtrele
        product_data = merged_df[merged_df['ProductID'] == product_id]

        if product_data.empty:
            return {"status": "error", "message": f"Ürün bulunamadı: {product_id}"}

        # 4. Tarihi datetime formatına çevir
        product_data['SalesDate'] = pd.to_datetime(product_data['SalesDate'])

        # 5. Günlük satış
        daily_sales = product_data.groupby('SalesDate')['Quantity'].sum()

        # Veri yetersizse hata döndür
        if len(daily_sales) < 10:
            return {"status": "error", "message": "Yeterli veri yok"}

        # 6. ARIMA ile tahmin
        model = ARIMA(daily_sales, order=(2,1,1))  # Daha basit model
        model_fit = model.fit()

        steps = 7
        forecast = model_fit.forecast(steps=steps)

        # 7. Tahminleri JSON formatına çevir
        forecast_dates = [str(daily_sales.index[-1] + timedelta(days=i+1)) for i in range(steps)]
        forecast_list = [{"date": date, "predicted_sales": int(max(0, value))} for date, value in zip(forecast_dates, forecast)]

        product_name = product_data['ProductName'].iloc[0]

        return {
            "status": "success",
            "product_id": product_id,
            "product_name": product_name,
            "forecast_days": steps,
            "data": forecast_list
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}


@app.get("/products")
def get_products(limit: int = 50):
    """
    Tüm ürünleri listele
    """
    try:
        products_df = pd.read_csv(PRODUCTS_PATH)
        
        # İlk 'limit' kadar ürünü al
        products_limited = products_df.head(limit)
        
        # JSON formatına çevir
        products_list = []
        for _, row in products_limited.iterrows():
            products_list.append({
                "product_id": int(row['ProductID']),
                "product_name": row['ProductName'],
                "price": float(row['Price']),
                "category_id": int(row['CategoryID']),
                "class": row['Class']
            })
        
        return {
            "status": "success",
            "total_products": len(products_df),
            "showing": len(products_list),
            "data": products_list
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}


@app.get("/top-products")
def get_top_products(limit: int = 10):
    """
    En çok satan ürünleri getir
    """
    try:
        # Veri oku
        sales_df = pd.read_csv(SALES_PATH, usecols=['ProductID', 'Quantity'], nrows=100000)
        products_df = pd.read_csv(PRODUCTS_PATH, usecols=['ProductID', 'ProductName', 'Price'])
        
        # Ürün bazlı toplam satış
        product_sales = sales_df.groupby('ProductID')['Quantity'].sum().reset_index()
        product_sales = product_sales.sort_values('Quantity', ascending=False).head(limit)
        
        # Ürün bilgileriyle birleştir
        top_products = product_sales.merge(products_df, on='ProductID')
        
        # JSON formatına çevir
        top_products_list = []
        for _, row in top_products.iterrows():
            top_products_list.append({
                "product_id": int(row['ProductID']),
                "product_name": row['ProductName'],
                "total_sold": int(row['Quantity']),
                "price": float(row['Price'])
            })
        
        return {
            "status": "success",
            "top_count": limit,
            "data": top_products_list
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}


@app.get("/stats")
def get_sales_stats():
    """
    Genel satış istatistikleri
    """
    try:
        # Veri oku
        sales_df = pd.read_csv(SALES_PATH, usecols=['ProductID', 'Quantity', 'SalesDate'], nrows=100000)
        products_df = pd.read_csv(PRODUCTS_PATH)
        
        # Tarihi datetime formatına çevir
        sales_df['SalesDate'] = pd.to_datetime(sales_df['SalesDate'])
        
        # İstatistikler hesapla
        total_sales = sales_df['Quantity'].sum()
        total_orders = len(sales_df)
        unique_products = sales_df['ProductID'].nunique()
        total_products = len(products_df)
        avg_order_size = sales_df['Quantity'].mean()
        
        # Günlük ortalama
        daily_sales = sales_df.groupby('SalesDate')['Quantity'].sum()
        avg_daily_sales = daily_sales.mean()
        
        # En yoğun gün
        busiest_day = daily_sales.idxmax()
        busiest_day_sales = daily_sales.max()
        
        return {
            "status": "success",
            "data": {
                "total_sales_quantity": int(total_sales),
                "total_orders": int(total_orders),
                "unique_products_sold": int(unique_products),
                "total_products_available": int(total_products),
                "average_order_size": float(round(avg_order_size, 2)),
                "average_daily_sales": float(round(avg_daily_sales, 2)),
                "busiest_day": str(busiest_day.date()),
                "busiest_day_sales": int(busiest_day_sales),
                "data_sample_size": len(sales_df)
            }
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}


@app.get("/sales/{start_date}/{end_date}")
def get_sales_by_date_range(start_date: str, end_date: str):
    """
    Belirli tarih aralığındaki satışlar
    Format: YYYY-MM-DD
    """
    try:
        # Veri oku
        sales_df = pd.read_csv(SALES_PATH, usecols=['ProductID', 'Quantity', 'SalesDate'], nrows=100000)
        products_df = pd.read_csv(PRODUCTS_PATH, usecols=['ProductID', 'ProductName'])
        
        # Tarihi datetime formatına çevir
        sales_df['SalesDate'] = pd.to_datetime(sales_df['SalesDate'])
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
        
        # Tarih aralığında filtrele
        filtered_sales = sales_df[(sales_df['SalesDate'] >= start_dt) & (sales_df['SalesDate'] <= end_dt)]
        
        if filtered_sales.empty:
            return {"status": "error", "message": "Bu tarih aralığında satış bulunamadı"}
        
        # Ürün bilgileriyle birleştir
        merged_df = filtered_sales.merge(products_df, on='ProductID')
        
        # Günlük satış toplamları
        daily_sales = merged_df.groupby('SalesDate')['Quantity'].sum().reset_index()
        daily_sales['SalesDate'] = daily_sales['SalesDate'].dt.strftime('%Y-%m-%d')
        
        # En çok satan ürünler bu aralıkta
        top_products = merged_df.groupby(['ProductID', 'ProductName'])['Quantity'].sum().reset_index()
        top_products = top_products.sort_values('Quantity', ascending=False).head(5)
        
        return {
            "status": "success",
            "date_range": {"start": start_date, "end": end_date},
            "total_sales": int(filtered_sales['Quantity'].sum()),
            "total_orders": len(filtered_sales),
            "daily_sales": daily_sales.to_dict('records'),
            "top_products_in_range": [
                {
                    "product_id": int(row['ProductID']),
                    "product_name": row['ProductName'],
                    "total_sold": int(row['Quantity'])
                } for _, row in top_products.iterrows()
            ]
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}


@app.get("/forecast/category/{category_id}")
def forecast_by_category(category_id: int):
    """
    Kategori bazlı satış tahmini (7 gün)
    """
    try:
        # Veri oku
        sales_df = pd.read_csv(SALES_PATH, usecols=['ProductID', 'Quantity', 'SalesDate'], nrows=100000)
        products_df = pd.read_csv(PRODUCTS_PATH, usecols=['ProductID', 'ProductName', 'CategoryID'])
        categories_df = pd.read_csv(CATEGORIES_PATH)
        
        # Kategoriyi kontrol et
        category_info = categories_df[categories_df['CategoryID'] == category_id]
        if category_info.empty:
            return {"status": "error", "message": f"Kategori bulunamadı: {category_id}"}
        
        # Ürün bilgileriyle birleştir
        merged_df = sales_df.merge(products_df, on='ProductID')
        
        # Kategoriye göre filtrele
        category_data = merged_df[merged_df['CategoryID'] == category_id]
        
        if category_data.empty:
            return {"status": "error", "message": f"Bu kategoride satış bulunamadı: {category_id}"}
        
        # Tarihi datetime formatına çevir
        category_data['SalesDate'] = pd.to_datetime(category_data['SalesDate'])
        
        # Günlük kategori satışları
        daily_sales = category_data.groupby('SalesDate')['Quantity'].sum()
        
        if len(daily_sales) < 10:
            return {"status": "error", "message": "Kategori için yeterli veri yok"}
        
        # ARIMA ile tahmin
        model = ARIMA(daily_sales, order=(2,1,1))
        model_fit = model.fit()
        
        steps = 7
        forecast = model_fit.forecast(steps=steps)
        
        # Tahminleri JSON formatına çevir
        forecast_dates = [str(daily_sales.index[-1] + timedelta(days=i+1)) for i in range(steps)]
        forecast_list = [{"date": date, "predicted_sales": int(max(0, value))} for date, value in zip(forecast_dates, forecast)]
        
        category_name = category_info['CategoryName'].iloc[0]
        
        return {
            "status": "success",
            "category_id": category_id,
            "category_name": category_name,
            "forecast_days": steps,
            "data_points_used": len(daily_sales),
            "data": forecast_list
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}


@app.get("/model-performance")
def get_model_performance():
    """
    ARIMA modelinin performans metrikleri
    """
    try:
        # Veri oku
        sales_df = pd.read_csv(SALES_PATH, usecols=['ProductID', 'Quantity', 'SalesDate'], nrows=50000)
        
        # Tarihi datetime formatına çevir
        sales_df['SalesDate'] = pd.to_datetime(sales_df['SalesDate'])
        
        # Günlük satış
        daily_sales = sales_df.groupby('SalesDate')['Quantity'].sum()
        
        if len(daily_sales) < 20:
            return {"status": "error", "message": "Performans analizi için yeterli veri yok"}
        
        # Train/Test split (son 7 günü test için ayır)
        train_data = daily_sales[:-7]
        test_data = daily_sales[-7:]
        
        # ARIMA modeli eğit
        model = ARIMA(train_data, order=(2,1,1))
        model_fit = model.fit()
        
        # Tahmin yap
        forecast = model_fit.forecast(steps=7)
        
        # Performans metrikleri hesapla
        from sklearn.metrics import mean_absolute_error, mean_squared_error
        import numpy as np
        
        mae = mean_absolute_error(test_data.values, forecast)
        mse = mean_squared_error(test_data.values, forecast)
        rmse = np.sqrt(mse)
        mape = np.mean(np.abs((test_data.values - forecast) / test_data.values)) * 100
        
        return {
            "status": "success",
            "model_info": {
                "model_type": "ARIMA(2,1,1)",
                "training_days": len(train_data),
                "test_days": len(test_data)
            },
            "performance_metrics": {
                "mean_absolute_error": float(round(mae, 2)),
                "mean_squared_error": float(round(mse, 2)),
                "root_mean_squared_error": float(round(rmse, 2)),
                "mean_absolute_percentage_error": float(round(mape, 2))
            },
            "test_vs_prediction": [
                {
                    "date": str(date),
                    "actual": int(actual),
                    "predicted": int(pred)
                } for date, actual, pred in zip(test_data.index, test_data.values, forecast)
            ]
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}


@app.get("/stock-recommendation/{product_id}")
def recommend_stock(product_id: int):
    """
    Tahmine dayalı stok önerisi
    """
    try:
        # Veri oku
        sales_df = pd.read_csv(SALES_PATH, usecols=['ProductID', 'Quantity', 'SalesDate'], nrows=50000)
        products_df = pd.read_csv(PRODUCTS_PATH, usecols=['ProductID', 'ProductName', 'Price'])
        
        # Ürün bilgilerini al
        product_info = products_df[products_df['ProductID'] == product_id]
        if product_info.empty:
            return {"status": "error", "message": f"Ürün bulunamadı: {product_id}"}
        
        # Ürün satışlarını filtrele
        product_sales = sales_df[sales_df['ProductID'] == product_id]
        
        if product_sales.empty:
            return {"status": "error", "message": f"Ürün için satış verisi bulunamadı: {product_id}"}
        
        # Tarihi datetime formatına çevir
        product_sales['SalesDate'] = pd.to_datetime(product_sales['SalesDate'])
        
        # Günlük satış
        daily_sales = product_sales.groupby('SalesDate')['Quantity'].sum()
        
        if len(daily_sales) < 10:
            return {"status": "error", "message": "Stok önerisi için yeterli veri yok"}
        
        # Son 30 günün ortalaması
        recent_avg = daily_sales.tail(min(30, len(daily_sales))).mean()
        
        # ARIMA ile 7 günlük tahmin
        model = ARIMA(daily_sales, order=(2,1,1))
        model_fit = model.fit()
        forecast = model_fit.forecast(steps=7)
        
        # Önerilen stok hesapla
        predicted_demand = forecast.sum()  # 7 günlük toplam tahmin
        safety_stock = recent_avg * 3  # 3 günlük güvenlik stoku
        recommended_stock = predicted_demand + safety_stock
        
        # Stok dönüş oranı hesapla
        total_sold = daily_sales.sum()
        avg_daily = daily_sales.mean()
        stock_turnover_days = recommended_stock / avg_daily if avg_daily > 0 else 0
        
        product_name = product_info['ProductName'].iloc[0]
        product_price = product_info['Price'].iloc[0]
        
        return {
            "status": "success",
            "product_info": {
                "product_id": product_id,
                "product_name": product_name,
                "price": float(product_price)
            },
            "stock_recommendation": {
                "recommended_stock_quantity": int(max(0, recommended_stock)),
                "predicted_7day_demand": int(max(0, predicted_demand)),
                "safety_stock": int(max(0, safety_stock)),
                "estimated_cost": float(round(recommended_stock * product_price, 2))
            },
            "analytics": {
                "average_daily_sales": float(round(avg_daily, 2)),
                "recent_30day_avg": float(round(recent_avg, 2)),
                "stock_turnover_days": float(round(stock_turnover_days, 1)),
                "total_historical_sales": int(total_sold),
                "data_points_used": len(daily_sales)
            }
        }
    except Exception as e:
        return {"status": "error", "message": f"Hata: {str(e)}"}
