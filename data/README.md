# Local offline datasets

These files exist so FarmDirect AI never needs a live internet API for
market prices, weather, or buyer locations (see
`FarmDirect_Offline_Network_Free_Requirements.txt`, sections 5–8).

- `market_prices.csv` — demo/historical mandi prices, clearly labeled as
  non-live.
- `crops.csv` — reference list of crops.
- `buyers.csv` — sample buyers with stored latitude/longitude, so
  distance/route features never need online geocoding.
- `weather.json` — demo weather snapshot per district, clearly labeled as
  not a live forecast.

The AI service's actual demand/price models currently read
`ai-service/data/sample_orders.csv` (unchanged). These top-level files are
extra offline-safe data for any market-price, weather, or buyer-list screen
you add later — swap in real data any time without introducing an internet
dependency.
