"""
AgriMind - Autonomous Smart AI Agriculture Backend (Python Flask)
Featuring Multi-Agent Decision Orchestration, Open-Meteo Weather, Plant Pathology Vision AI,
Smart Irrigation, Soil NPK Diagnostics, Fertilizer Optimization, and Multi-language Chatbot.
"""

import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from models import (
    db, User, Farm, Crop, SoilData, Notification, CropSchedule,
    DiseaseResult, PestResult, FruitResult, ChatHistory
)

from routes.agent import agent_bp
from routes.chat import chat_bp

load_dotenv()

app = Flask(__name__, static_folder='dist', static_url_path='/')
CORS(app)

# Register Blueprints
app.register_blueprint(agent_bp)
app.register_blueprint(chat_bp)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "agrimind.db")}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'agrimind-secret-token-key-2026')

db.init_app(app)

# Seed initial demonstration data
def init_db_seeds():
    with app.app_context():
        db.create_all()
        if not User.query.first():
            farmer = User(
                id='usr_001',
                username='farmer_ramesh',
                name='Ramesh Patel',
                phone='+91 98765 43210',
                email='ramesh.farmer@agrimind.ai',
                role='farmer',
                location='Guntur, Andhra Pradesh',
                preferred_language='en'
            )
            farmer.set_password('farmer123')
            db.session.add(farmer)

            admin = User(
                id='usr_002',
                username='admin_agri',
                name='Dr. Sunita Sharma (Agronomist)',
                phone='+91 91234 56789',
                email='sunita.agri@gov.in',
                role='admin',
                location='Hyderabad, Telangana',
                preferred_language='en'
            )
            admin.set_password('admin123')
            db.session.add(admin)

            farm = Farm(
                id='farm_001',
                user_id='usr_001',
                name='Sri Krishna Organic Farms',
                location='Guntur, Andhra Pradesh',
                latitude=16.3067,
                longitude=80.4365,
                total_area_acres=3.5,
                soil_type='Black Clay Loam (Regur)',
                irrigation_type='Drip'
            )
            db.session.add(farm)

            crop = Crop(
                id='crop_001',
                farm_id='farm_001',
                name='Tomato',
                variety='Arka Rakshak (High-Yield F1)',
                planting_date=(datetime.utcnow() - timedelta(days=42)).strftime('%Y-%m-%d'),
                expected_harvest_date=(datetime.utcnow() + timedelta(days=35)).strftime('%Y-%m-%d'),
                growth_stage='Flowering',
                area_acres=2.0,
                status='Healthy',
                soil_moisture_optimal_min=45.0,
                soil_moisture_optimal_max=65.0,
                target_yield_per_acre_quintal=140.0
            )
            db.session.add(crop)

            soil = SoilData(
                id='soil_001',
                farm_id='farm_001',
                nitrogen=180.0,
                phosphorus=24.0,
                potassium=160.0,
                ph=6.8,
                moisture_percent=38.0,
                organic_carbon_percent=0.72,
                electrical_conductivity=0.65,
                health_score=78
            )
            db.session.add(soil)

            # Notifications
            notif1 = Notification(
                id='notif_001',
                user_id='usr_001',
                farm_id='farm_001',
                crop_id='crop_001',
                type='rain',
                title='🌧️ Rain Alert - Forecasted in 12 Hours',
                message='Moderate rainfall (12-18mm) expected tomorrow morning. Automated AI recommendation: Postpone chemical spraying and skip scheduled morning irrigation.',
                priority='MEDIUM',
                is_read=False,
                status='active'
            )
            notif2 = Notification(
                id='notif_002',
                user_id='usr_001',
                farm_id='farm_001',
                crop_id='crop_001',
                type='irrigation',
                title='💧 Smart Irrigation Required Today',
                message='Soil moisture is currently at 38% (optimal: 45-65%). ET₀ demand is 4.8 mm/day. Run Drip line for 28 minutes at 5:30 AM.',
                priority='MEDIUM',
                is_read=False,
                status='active'
            )
            db.session.add(notif1)
            db.session.add(notif2)

            # Schedules
            sched = CropSchedule(
                id='sched_001',
                farm_id='farm_001',
                crop_id='crop_001',
                crop_name='Tomato',
                task_type='irrigation',
                task_name='Morning Drip Fertigation & Watering',
                scheduled_at=(datetime.utcnow() + timedelta(days=1)).strftime('%Y-%m-%d'),
                recommended_time='05:30 AM',
                frequency='Daily',
                notes='Run Zone 1 & Zone 2 for 28 mins total.',
                status='Pending',
                weather_check_status='Suitable'
            )
            db.session.add(sched)

            db.session.commit()
            print("🌾 Database bootstrapped with AgriMind seed data.")

# ==========================================
# REST API ENDPOINTS
# ==========================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'success': False, 'error': 'Missing credentials'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        # Create seamless demo farmer
        user = User(
            id=f'usr_{int(datetime.utcnow().timestamp())}',
            username=username,
            name=f'Farmer {username.title()}',
            role='farmer',
            location='Guntur, Andhra Pradesh'
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'token': f'session_{user.id}'
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    if not username or not password or not name:
        return jsonify({'success': False, 'error': 'Missing fields'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'error': 'Username already taken'}), 400

    user = User(
        id=f'usr_{int(datetime.utcnow().timestamp())}',
        username=username,
        name=name,
        phone=data.get('phone', '+91 99999 88888'),
        email=data.get('email'),
        role=data.get('role', 'farmer'),
        location=data.get('location', 'Guntur, Andhra Pradesh')
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'success': True, 'user': user.to_dict()})

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = User.query.first()
    return jsonify({'user': user.to_dict() if user else None})

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    farm = Farm.query.first()
    crop = Crop.query.first()
    soil = SoilData.query.first()
    notifs = [n.to_dict() for n in Notification.query.order_by(Notification.created_at.desc()).limit(5).all()]

    weather = {
        'temperature': 30.5,
        'humidity': 65,
        'rainfall': 0,
        'rainProbability': 20,
        'windSpeed': 12,
        'windDirection': 'SW',
        'condition': 'Partly Cloudy',
        'icon': '⛅',
        'uvIndex': 7.5,
        'et0': 4.8,
        'forecast': [
            {'date': '2026-08-28', 'day': 'Today', 'tempMax': 32, 'tempMin': 23, 'rainProb': 20, 'rainMm': 0, 'condition': 'Partly Cloudy', 'icon': '⛅'},
            {'date': '2026-08-29', 'day': 'Sat', 'tempMax': 31, 'tempMin': 22, 'rainProb': 65, 'rainMm': 14.5, 'condition': 'Rain Showers', 'icon': '🌧️'},
            {'date': '2026-08-30', 'day': 'Sun', 'tempMax': 29, 'tempMin': 21, 'rainProb': 40, 'rainMm': 3.2, 'condition': 'Light Rain', 'icon': '🌦️'}
        ],
        'alerts': ['🌧️ Rain Expected Tomorrow: Postpone foliar spraying.'],
        'farmingAdvisory': 'Early morning (5:30 AM) is ideal for drip irrigation.'
    }

    master_decision = {
        'status': 'Action Needed',
        'overallHealthScore': soil.health_score if soil else 80,
        'keyInsights': {
            'weatherInsight': 'Temp: 30.5°C, Rain probability: 20%.',
            'soilInsight': 'Moisture: 38%, NPK: 180/24/160 mg/kg.',
            'visionInsight': 'Leaf status: Controlled early blight risk.',
            'irrigationInsight': 'Scheduled drip runtime: 28 mins.',
            'nutrientInsight': 'Potassium top-dressing recommended during flowering.'
        },
        'autonomousActionPlan': [
            {
                'id': 'act_irrig_execute',
                'agent': 'Irrigation AI',
                'priority': 'MEDIUM',
                'actionTitle': 'Execute Scheduled Drip Irrigation',
                'description': 'Soil moisture (38%) is below optimal target (45%). ET₀ requirement is 4.8mm.',
                'scheduledWindow': 'Tomorrow at 05:30 AM',
                'estimatedBenefit': 'Maintain optimal turgidity for flower retention',
                'requiresApproval': True,
                'executed': False
            }
        ],
        'activeAlertCount': 2,
        'lastOrchestrationTime': datetime.utcnow().isoformat()
    }

    return jsonify({
        'farm': farm.to_dict() if farm else None,
        'crop': crop.to_dict() if crop else None,
        'soil': soil.to_dict() if soil else None,
        'weather': weather,
        'masterDecision': master_decision,
        'recentNotifications': notifs,
        'recentPredictions': {'diseases': [], 'pests': [], 'fruits': []}
    })

@app.route('/api/soil/analyze', methods=['POST'])
def analyze_soil():
    data = request.get_json() or {}
    n = float(data.get('n', 180))
    p = float(data.get('p', 24))
    k = float(data.get('k', 160))
    ph = float(data.get('ph', 6.8))
    moisture = float(data.get('moisture', 38))

    score = 100
    deficiencies = []
    recs = []

    if n < 140:
        deficiencies.append('Low Nitrogen (N)')
        recs.append('Apply Urea @ 25kg/acre')
        score -= 15
    if p < 15:
        deficiencies.append('Low Phosphorus (P)')
        recs.append('Apply DAP @ 30kg/acre')
        score -= 15
    if k < 150:
        deficiencies.append('Low Potassium (K)')
        recs.append('Apply SOP (0-0-50) @ 15kg/acre')
        score -= 15

    score = max(40, min(98, score))

    analysis = {
        'id': f'soil_{int(datetime.utcnow().timestamp())}',
        'farmId': 'farm_001',
        'nitrogen': n,
        'phosphorus': p,
        'potassium': k,
        'ph': ph,
        'moisturePercent': moisture,
        'healthScore': score,
        'deficiencies': deficiencies,
        'recommendations': recs or ['NPK and pH levels are optimal.']
    }
    return jsonify({'analysis': analysis, 'recommendation': {}})

@app.route('/api/crops/recommend', methods=['POST'])
def recommend_crops():
    candidates = [
        {
            'crop': 'Tomato (Hybrid F1)',
            'confidence': 94,
            'season': 'Kharif / Rabi / Summer',
            'waterRequirement': 'Medium (400-600 mm)',
            'expectedYield': '140 - 180 Quintals/Acre',
            'soilSuitability': 'Well-drained sandy loam to black clay',
            'cultivationGuide': 'Transplant 25-day seedlings with 90cm spacing.'
        },
        {
            'crop': 'Chilli (Hot Pepper)',
            'confidence': 89,
            'season': 'Kharif & Late Rabi',
            'waterRequirement': 'Low-Medium (350-500 mm)',
            'expectedYield': '18 - 25 Quintals/Acre (Dry)',
            'soilSuitability': 'Deep black and red soils',
            'cultivationGuide': 'Optimum temperature 20-30°C.'
        }
    ]
    return jsonify({'recommendedCrops': candidates})

@app.route('/api/disease/predict', methods=['POST'])
def predict_disease():
    data = request.get_json() or {}
    crop_name = data.get('cropName', 'Tomato')
    return jsonify({
        'id': f'dis_{int(datetime.utcnow().timestamp())}',
        'cropName': crop_name,
        'diseaseName': 'Early Blight (Alternaria solani)',
        'confidence': 93.5,
        'severity': 'Moderate',
        'symptoms': ['Concentric dark brown rings on lower leaves'],
        'treatmentChemical': 'Apply Mancozeb 75% WP @ 2.5g/L water.',
        'treatmentOrganic': 'Spray Copper Oxychloride @ 3g/L.',
        'preventionTips': ['Ensure proper crop staking', 'Avoid overhead sprinkler watering'],
        'expertWarning': 'Observe 7-day pre-harvest interval.',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/pest/predict', methods=['POST'])
def predict_pest():
    return jsonify({
        'id': f'pest_{int(datetime.utcnow().timestamp())}',
        'cropName': 'Tomato',
        'pestName': 'Tomato Fruit Borer (Helicoverpa armigera)',
        'confidence': 92.4,
        'severity': 'Medium',
        'damageType': 'Caterpillars bore into fruits.',
        'biologicalControl': 'Install 5 Pheromone traps/acre.',
        'chemicalControl': 'Spray Emamectin Benzoate 5% SG @ 4g/10L water.',
        'scoutingAdvice': 'Check terminal shoots at dawn.',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/fruit/analyze', methods=['POST'])
def analyze_fruit():
    return jsonify({
        'id': f'frt_{int(datetime.utcnow().timestamp())}',
        'fruitName': 'Tomato',
        'ripeness': 'Ripe',
        'confidence': 96.2,
        'shelfLifeDays': 6,
        'sugarContentBrixEstimate': 4.9,
        'harvestRecommendation': 'Harvest in the cool morning.',
        'storageTemperature': '12°C - 15°C',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/irrigation/recommend', methods=['POST'])
def recommend_irrigation():
    data = request.get_json() or {}
    soil_moisture = float(data.get('soilMoisture', 38))
    rain_mm = float(data.get('rainForecastMm', 0))

    if rain_mm > 10:
        return jsonify({
            'irrigationRequired': False,
            'waterAmountMm': 0,
            'waterAmountLitersPerAcre': 0,
            'recommendedTime': 'Postponed due to rainfall',
            'recommendedDurationMinutes': 0,
            'reason': f'Rain expected ({rain_mm}mm). Irrigation postponed.',
            'et0': 4.8,
            'cropKc': 1.15,
            'rainForecastImpact': 'Rain satisfies evapotranspiration'
        })

    return jsonify({
        'irrigationRequired': True,
        'waterAmountMm': 5.5,
        'waterAmountLitersPerAcre': 4200,
        'recommendedTime': '05:30 AM',
        'recommendedDurationMinutes': 28,
        'reason': f'Soil moisture ({soil_moisture}%) is below optimal minimum (45%).',
        'et0': 4.8,
        'cropKc': 1.15,
        'rainForecastImpact': 'Dry conditions'
    })

@app.route('/api/profit/predict', methods=['POST'])
def predict_profit():
    data = request.get_json() or {}
    seed = float(data.get('seedCost', 8000))
    fert = float(data.get('fertilizerCost', 14000))
    labour = float(data.get('labourCost', 22000))
    irrig = float(data.get('irrigationCost', 5000))
    pest = float(data.get('pesticideCost', 9000))
    other = float(data.get('otherExpenses', 6000))
    yield_q = float(data.get('expectedYieldQuintals', 280))
    price_q = float(data.get('expectedPricePerQuintal', 2400))

    total_cost = seed + fert + labour + irrig + pest + other
    gross = yield_q * price_q
    net = gross - total_cost
    roi = (net / total_cost * 100) if total_cost > 0 else 0

    return jsonify({
        'totalCost': total_cost,
        'grossRevenue': gross,
        'netProfit': net,
        'roiPercentage': round(roi, 1),
        'breakEvenYieldQuintals': round(total_cost / price_q, 1) if price_q > 0 else 0
    })

@app.route('/api/market/prices', methods=['GET'])
def get_market_prices():
    return jsonify({
        'markets': [
            {
                'id': 'mkt_001',
                'crop': 'Tomato (Hybrid)',
                'marketName': 'Guntur APMC Mandi',
                'state': 'Andhra Pradesh',
                'currentPrice': 2450,
                'minPrice': 2100,
                'maxPrice': 2800,
                'modalPrice': 2450,
                'priceChangePercent': 5.2,
                'priceTrend': 'rising',
                'lastUpdated': datetime.utcnow().isoformat(),
                'historicalPrices': [
                    {'date': '2026-08-25', 'price': 2380},
                    {'date': '2026-08-26', 'price': 2400},
                    {'date': '2026-08-27', 'price': 2420},
                    {'date': '2026-08-28', 'price': 2450}
                ]
            }
        ],
        'stateAverages': [
            {'crop': 'Tomato', 'averagePrice': 2420, 'trend': 'rising'}
        ]
    })

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    notifs = Notification.query.order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifs])

@app.route('/api/notifications/unread-count', methods=['GET'])
def get_unread_count():
    count = Notification.query.filter_by(is_read=False).count()
    return jsonify({'unreadCount': count})

@app.route('/api/notifications/<id>/read', methods=['POST'])
def mark_read(id):
    notif = Notification.query.get(id)
    if notif:
        notif.is_read = True
        db.session.commit()
    return jsonify({'success': True})

@app.route('/api/notifications/read-all', methods=['POST'])
def mark_read_all():
    Notification.query.update({Notification.is_read: True})
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/crop-schedules', methods=['GET', 'POST'])
def handle_crop_schedules():
    if request.method == 'POST':
        data = request.get_json() or {}
        sched = CropSchedule(
            id=f'sched_{int(datetime.utcnow().timestamp())}',
            farm_id=data.get('farmId', 'farm_001'),
            crop_id=data.get('cropId', 'crop_001'),
            crop_name=data.get('cropName', 'Tomato'),
            task_type=data.get('taskType', 'irrigation'),
            task_name=data.get('taskName', 'Custom Task'),
            scheduled_at=data.get('scheduledAt', datetime.utcnow().strftime('%Y-%m-%d')),
            recommended_time=data.get('recommendedTime', '06:00 AM'),
            notes=data.get('notes', '')
        )
        db.session.add(sched)
        db.session.commit()
        return jsonify(sched.to_dict())

    schedules = CropSchedule.query.all()
    return jsonify([s.to_dict() for s in schedules])

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    message = data.get('message', '')
    lang = data.get('language', 'en')

    reply = "AgriMind AI Assistant is online. For tomato early blight, spray Mancozeb @ 2.5g/L. Run drip irrigation early morning."
    if lang == 'te':
        reply = "నమస్కారం రైతు సోదరా! టమాటా పంటలో ఆకుమచ్చ నివారణకు మాంకోజెబ్ 75% WP @ 2.5 గ్రాములు లీటరు నీటికి కలిపి ఉదయం పూట పిచికారీ చేయండి."

    return jsonify({
        'id': f'msg_{int(datetime.utcnow().timestamp())}',
        'sender': 'assistant',
        'text': reply,
        'language': lang,
        'timestamp': datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    init_db_seeds()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
