# 🌾 AgriMind - Autonomous Smart AI Agriculture & Multi-Agent Decision Platform

AgriMind is an end-to-end Smart Agriculture web application with an Autonomous Multi-Agent Decision Orchestrator (95% AI autonomy, 5% farmer approval), Leaf Disease & Pest Vision AI, Open-Meteo real-time live weather, Soil NPK diagnostics, FAO-56 smart drip irrigation, Mandi market pricing, and a bilingual AI chatbot (English & Telugu - తెలుగు).

---

## 🚀 Key Features

1. **Autonomous Master AI Agent**:
   - Continuous multi-agent reasoning: Weather AI + Vision AI + Soil AI + Irrigation AI + Nutrient AI.
   - Unified Master Action Plan with 1-click execution.
2. **Farmer Authentication & Roles**:
   - Secure login, farmer registration, session management, and Agronomist / Admin roles.
3. **Crop Vision AI**:
   - Leaf disease classification with symptoms, organic & chemical treatments.
   - Pest identification & biological management.
   - Fruit classification and ripeness stage (Unripe / Ripe / Overripe).
4. **Live Weather & Evapotranspiration**:
   - Real-time Open-Meteo integration with 7-day forecast, rain chance, and FAO-56 $ET_0$ calculation.
   - Auto-postpones irrigation & pesticide spraying when heavy rain or high winds are forecasted.
5. **Smart Drip Irrigation**:
   - Calculates exact water volume in mm & Liters/Acre using crop coefficient ($K_c$), soil moisture %, and rain forecast.
6. **Soil NPK & Fertilizer Calculator**:
   - Calculates Soil Health Score (0-100), detects macro/micronutrient deficiencies, recommends precise Urea, DAP, SOP doses, and issues excessive usage warnings.
7. **Crop Suitability, Yield & Profit Predictor**:
   - Recommends best crops based on soil & climate parameters.
   - Financial calculator: Seed, Fertilizer, Labour, Irrigation, Pesticides $\rightarrow$ Net Profit & ROI %.
8. **Mandi Market Intelligence**:
   - Live APMC market rates, price change percentages, and historical trends.
9. **Smart Notification Center & Scheduler**:
   - Priority levels: HIGH, MEDIUM, LOW.
   - Web Audio API alarm chimes and Browser Push notifications.
10. **Bilingual AI Chatbot (English & Telugu)**:
    - Powered by Gemini 3.7 Flash with offline agricultural expert knowledge fallback.
11. **Thank You Farmer Summary Page**:
    - Warm "Annadata Sukhibhava / ధన్యవాదాలు" session summary highlighting liters of water saved, fertilizer costs optimized, and crop health status with celebratory confetti!

---

## 🛠️ How to Run Locally

### Option 1: Live Interactive Full-Stack Web App (Recommended)
This runs the full interactive React frontend with Express backend on port 3000:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option 2: Python Flask Backend

1. **Create and activate a virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Python requirements**:
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**:
Copy `.env.example` to `.env` and set your API keys if desired:
```bash
cp .env.example .env
```

4. **Run the Flask application**:
```bash
python app.py
```
The Flask REST API will start on [http://localhost:5000](http://localhost:5000).

---

## 🌐 API Endpoints Summary

- `POST /api/auth/login` - Farmer / Admin authentication
- `POST /api/auth/register` - New farm & farmer signup
- `GET /api/dashboard` - Complete aggregated farm dashboard
- `GET /api/master-agent/orchestrate` - Autonomous multi-agent decision cycle
- `POST /api/soil/analyze` - NPK soil health diagnosis
- `POST /api/crops/recommend` - Crop recommendation based on soil/climate
- `POST /api/disease/predict` - Leaf pathology Vision AI
- `POST /api/pest/predict` - Pest identification & management
- `POST /api/fruit/analyze` - Fruit type & ripeness classification
- `GET /api/weather` - Live Open-Meteo weather & alerts
- `POST /api/irrigation/recommend` - Smart water requirement ($ET_0 \times K_c$)
- `POST /api/fertilizer/recommend` - Nutrient dosage & warnings
- `POST /api/profit/predict` - Farm cost, revenue & profit calculator
- `GET /api/market/prices` - APMC Mandi commodity rates
- `GET /api/notifications` - Notifications list with priority filter
- `POST /api/notifications/<id>/read` - Mark notification as read
- `GET /api/crop-schedules` - Crop care & spraying calendar
- `POST /api/chat` - English & Telugu AI Agriculture Chatbot
