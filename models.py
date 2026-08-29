from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(64), primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    role = db.Column(db.String(20), default='farmer')  # farmer or admin
    location = db.Column(db.String(120), nullable=True)
    preferred_language = db.Column(db.String(10), default='en')  # en or te
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'role': self.role,
            'location': self.location,
            'preferredLanguage': self.preferred_language,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Farm(db.Model):
    __tablename__ = 'farms'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    latitude = db.Column(db.Float, default=16.3067)
    longitude = db.Column(db.Float, default=80.4365)
    total_area_acres = db.Column(db.Float, default=2.5)
    soil_type = db.Column(db.String(80), default='Black Clay Loam')
    irrigation_type = db.Column(db.String(50), default='Drip')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'totalAreaAcres': self.total_area_acres,
            'soilType': self.soil_type,
            'irrigationType': self.irrigation_type
        }

class Crop(db.Model):
    __tablename__ = 'crops'
    id = db.Column(db.String(64), primary_key=True)
    farm_id = db.Column(db.String(64), db.ForeignKey('farms.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    variety = db.Column(db.String(80), nullable=True)
    planting_date = db.Column(db.String(50), nullable=True)
    expected_harvest_date = db.Column(db.String(50), nullable=True)
    growth_stage = db.Column(db.String(50), default='Flowering')
    area_acres = db.Column(db.Float, default=2.0)
    status = db.Column(db.String(50), default='Healthy')
    soil_moisture_optimal_min = db.Column(db.Float, default=45.0)
    soil_moisture_optimal_max = db.Column(db.Float, default=65.0)
    target_yield_per_acre_quintal = db.Column(db.Float, default=140.0)

    def to_dict(self):
        return {
            'id': self.id,
            'farmId': self.farm_id,
            'name': self.name,
            'variety': self.variety,
            'plantingDate': self.planting_date,
            'expectedHarvestDate': self.expected_harvest_date,
            'growthStage': self.growth_stage,
            'areaAcres': self.area_acres,
            'status': self.status,
            'soilMoistureOptimalMin': self.soil_moisture_optimal_min,
            'soilMoistureOptimalMax': self.soil_moisture_optimal_max,
            'targetYieldPerAcreQuintal': self.target_yield_per_acre_quintal
        }

class SoilData(db.Model):
    __tablename__ = 'soil_data'
    id = db.Column(db.String(64), primary_key=True)
    farm_id = db.Column(db.String(64), db.ForeignKey('farms.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    nitrogen = db.Column(db.Float, default=180.0)
    phosphorus = db.Column(db.Float, default=24.0)
    potassium = db.Column(db.Float, default=160.0)
    ph = db.Column(db.Float, default=6.8)
    moisture_percent = db.Column(db.Float, default=38.0)
    organic_carbon_percent = db.Column(db.Float, default=0.72)
    electrical_conductivity = db.Column(db.Float, default=0.65)
    health_score = db.Column(db.Integer, default=78)

    def to_dict(self):
        return {
            'id': self.id,
            'farmId': self.farm_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'nitrogen': self.nitrogen,
            'phosphorus': self.phosphorus,
            'potassium': self.potassium,
            'ph': self.ph,
            'moisturePercent': self.moisture_percent,
            'organicCarbonPercent': self.organic_carbon_percent,
            'electricalConductivity': self.electrical_conductivity,
            'healthScore': self.health_score
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False)
    farm_id = db.Column(db.String(64), nullable=True)
    crop_id = db.Column(db.String(64), nullable=True)
    type = db.Column(db.String(50), default='general')
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='MEDIUM')  # HIGH, MEDIUM, LOW
    scheduled_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='active')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'farmId': self.farm_id,
            'cropId': self.crop_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'priority': self.priority,
            'scheduledAt': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'isRead': self.is_read,
            'status': self.status
        }

class CropSchedule(db.Model):
    __tablename__ = 'crop_schedules'
    id = db.Column(db.String(64), primary_key=True)
    farm_id = db.Column(db.String(64), db.ForeignKey('farms.id'), nullable=False)
    crop_id = db.Column(db.String(64), nullable=False)
    crop_name = db.Column(db.String(80), default='Tomato')
    task_type = db.Column(db.String(50), nullable=False)  # irrigation, spraying, fertilizer, harvest
    task_name = db.Column(db.String(120), nullable=False)
    scheduled_at = db.Column(db.String(50), nullable=False)
    recommended_time = db.Column(db.String(50), default='06:00 AM')
    frequency = db.Column(db.String(50), default='Once')
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='Pending')
    weather_check_status = db.Column(db.String(50), default='Suitable')

    def to_dict(self):
        return {
            'id': self.id,
            'farmId': self.farm_id,
            'cropId': self.crop_id,
            'cropName': self.crop_name,
            'taskType': self.task_type,
            'taskName': self.task_name,
            'scheduledAt': self.scheduled_at,
            'recommendedTime': self.recommended_time,
            'frequency': self.frequency,
            'notes': self.notes,
            'status': self.status,
            'weatherCheckStatus': self.weather_check_status
        }

class DiseaseResult(db.Model):
    __tablename__ = 'disease_results'
    id = db.Column(db.String(64), primary_key=True)
    crop_name = db.Column(db.String(80), nullable=False)
    disease_name = db.Column(db.String(120), nullable=False)
    confidence = db.Column(db.Float, default=90.0)
    severity = db.Column(db.String(50), default='Moderate')
    treatment_chemical = db.Column(db.Text, nullable=True)
    treatment_organic = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cropName': self.crop_name,
            'diseaseName': self.disease_name,
            'confidence': self.confidence,
            'severity': self.severity,
            'treatmentChemical': self.treatment_chemical,
            'treatmentOrganic': self.treatment_organic,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class PestResult(db.Model):
    __tablename__ = 'pest_results'
    id = db.Column(db.String(64), primary_key=True)
    crop_name = db.Column(db.String(80), nullable=False)
    pest_name = db.Column(db.String(120), nullable=False)
    confidence = db.Column(db.Float, default=90.0)
    severity = db.Column(db.String(50), default='Medium')
    biological_control = db.Column(db.Text, nullable=True)
    chemical_control = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cropName': self.crop_name,
            'pestName': self.pest_name,
            'confidence': self.confidence,
            'severity': self.severity,
            'biologicalControl': self.biological_control,
            'chemicalControl': self.chemical_control,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class FruitResult(db.Model):
    __tablename__ = 'fruit_results'
    id = db.Column(db.String(64), primary_key=True)
    fruit_name = db.Column(db.String(80), nullable=False)
    ripeness = db.Column(db.String(50), default='Ripe')
    confidence = db.Column(db.Float, default=95.0)
    shelf_life_days = db.Column(db.Integer, default=5)
    harvest_recommendation = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'fruitName': self.fruit_name,
            'ripeness': self.ripeness,
            'confidence': self.confidence,
            'shelfLifeDays': self.shelf_life_days,
            'harvestRecommendation': self.harvest_recommendation,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), nullable=True)
    sender = db.Column(db.String(20), default='user')
    text = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(10), default='en')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'text': self.text,
            'language': self.language,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
