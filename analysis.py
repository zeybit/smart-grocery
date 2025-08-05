import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
import warnings
warnings.filterwarnings("ignore")

# 1. CSV dosyalarının yolu
SALES_PATH = "data/datastaj/sales.csv"
PRODUCTS_PATH = "data/datastaj/products.csv"

# 2. CSV'leri oku
sales_df = pd.read_csv(SALES_PATH)
products_df = pd.read_csv(PRODUCTS_PATH)

# 3. sales ile products birleştir (ürün adını almak için)
merged_df = sales_df.merge(products_df, on="product_id", how="left")

print("İlk 5 satır:")
print(merged_df.head())

# 4. Tarih formatı dönüştür
merged_df['sale_date'] = pd.to_datetime(merged_df['sale_date'])

# 5. Günlük toplam satış
daily_sales = merged_df.groupby('sale_date')['quantity'].sum()

# 6. Grafik: Günlük satış trendi
plt.figure(figsize=(10,4))
plt.plot(daily_sales.index, daily_sales.values)
plt.title("Günlük Toplam Satış")
plt.xlabel("Tarih")
plt.ylabel("Satış Miktarı")
plt.show()

# 7. Basit ARIMA tahmini (7 gün sonrası)
model = ARIMA(daily_sales, order=(5,1,0))
model_fit = model.fit()

forecast = model_fit.forecast(steps=7)
print("\n📅 7 Günlük Tahmin:")
print(forecast)

# 8. Tahmin grafiği
plt.figure(figsize=(10,4))
plt.plot(daily_sales.index, daily_sales.values, label="Gerçek Satış")
plt.plot(pd.date_range(daily_sales.index[-1] + pd.Timedelta(days=1), periods=7), forecast, label="Tahmin", color="red")
plt.legend()
plt.show()
