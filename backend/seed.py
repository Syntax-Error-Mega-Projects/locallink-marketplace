# -*- coding: utf-8 -*-
"""
Full seed script for LocalLink.
Run: python seed.py
Drops all data and re-seeds with realistic Pune data.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal, Base
import models  # register all models
from models.user import User
from models.shop import Shop
from models.service import ServiceCategory, WorkerProfile
from models.booking import Booking, LabourPackage, BookingPart
from models.part import Part, SupplierPrice
from models.payment import Payment
from models.review import Review
from services.auth_service import hash_password

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# --- 1. USERS ----------------------------------------------------------------
pw = hash_password("demo1234")

users_data = [
    dict(name="Amit Sharma",        phone="9876543210", email="customer@demo.com",     role="customer",  verified=True),
    dict(name="Ravi Kumar",         phone="9823456701", email="worker@demo.com",        role="worker",    verified=True),
    dict(name="Suresh Mehta",       phone="9823456702", email="supplier@demo.com",      role="supplier",  verified=True),
    dict(name="Admin User",         phone="9823456703", email="admin@demo.com",          role="admin",     verified=True),
    dict(name="Suresh Patil",       phone="9823456704", email="electrician@demo.com",   role="worker",    verified=True),
    dict(name="Mahesh Sharma",      phone="9823456705", email="plumber@demo.com",        role="worker",    verified=True),
    dict(name="Adv. Priya Desai",   phone="9823456706", email="lawyer@demo.com",         role="worker",    verified=True),
    dict(name="Vikram Yadav",       phone="9823456707", email="supplier2@demo.com",     role="supplier",  verified=True),
    dict(name="Anjali Patel",       phone="9823456708", email="supplier3@demo.com",     role="supplier",  verified=True),
]

created_users = {}
for u in users_data:
    user = User(password_hash=pw, **u)
    db.add(user)
    db.flush()
    created_users[u["email"]] = user

# --- 2. SHOPS (all in Pune) ---------------------------------------------------
shops_data = [
    # Supplier shops
    dict(owner_email="supplier@demo.com",  name="Sharma Hardware & Tools",      type="supplier", gstin="27AABCS1234D1Z5", address="Shop 12, Kothrud Market, Pune 411038", lat=18.5082, lng=73.8232, verified=True),
    dict(owner_email="supplier2@demo.com", name="Pune Electrical Supplies",     type="supplier", gstin="27AABCP5678E2Z6", address="E-45, Shivajinagar, Pune 411005",      lat=18.5296, lng=73.8479, verified=True),
    dict(owner_email="supplier3@demo.com", name="AC Spares Hub",                type="supplier", gstin="27AABCA9012F3Z7", address="Plot 7, Wakad Industrial Estate, Pune 411057", lat=18.5983, lng=73.7619, verified=True),
    dict(owner_email="supplier@demo.com",  name="National Plumbing Store",      type="supplier", gstin="27AABCN3456G4Z8", address="23, Hadapsar Road, Pune 411028",       lat=18.5089, lng=73.9260, verified=True),
    dict(owner_email="supplier2@demo.com", name="BuildMart Supplies",           type="supplier", gstin="27AABCB7890H5Z9", address="MIDC Phase 2, Pimpri, Pune 411018",    lat=18.6298, lng=73.8002, verified=True),
    # Worker shops
    dict(owner_email="worker@demo.com",   name="CoolBreeze AC Service Center",  type="shop",     gstin=None,             address="FC Road, Aundh, Pune 411007",           lat=18.5590, lng=73.8077, verified=True),
    dict(owner_email="lawyer@demo.com",   name="Desai & Associates Law Firm",   type="shop",     gstin=None,             address="MG Road, Camp, Pune 411001",            lat=18.5195, lng=73.8757, verified=True),
]

created_shops = {}
for s in shops_data:
    shop = Shop(
        owner_id=created_users[s["owner_email"]].id,
        name=s["name"], type=s["type"], gstin=s.get("gstin"),
        address=s["address"], lat=s["lat"], lng=s["lng"], verified=s["verified"],
    )
    db.add(shop)
    db.flush()
    created_shops[s["name"]] = shop

# --- 3. SERVICE CATEGORIES (All active, coming_soon=False) -------------------
categories_data = [
    # Home repair
    dict(group="home_repair", name="AC Repair & Service",          fee_type="fixed",           shop_visit_allowed=True,  active=True,  coming_soon=False, base_service_charge=550,  market_rate_estimate=1500, icon="❄️",  description="Air conditioner repair, service and gas refill by verified technicians."),
    dict(group="home_repair", name="RO / Water Purifier Repair",   fee_type="fixed",           shop_visit_allowed=True,  active=True,  coming_soon=False, base_service_charge=400,  market_rate_estimate=900,  icon="💧",  description="RO membrane replacement, filter change and general service."),
    dict(group="home_repair", name="Electrician",                  fee_type="fixed",           shop_visit_allowed=False, active=True,  coming_soon=False, base_service_charge=400,  market_rate_estimate=800,  icon="⚡",  description="Wiring, switchboard, MCB, fan and all electrical repair."),
    dict(group="home_repair", name="Plumber",                      fee_type="fixed",           shop_visit_allowed=False, active=True,  coming_soon=False, base_service_charge=350,  market_rate_estimate=700,  icon="🔧",  description="Tap, pipe, flush, drainage and bathroom fitting repair."),
    dict(group="home_repair", name="Carpenter",                    fee_type="fixed",           shop_visit_allowed=False, active=True,  coming_soon=False, base_service_charge=500,  market_rate_estimate=1000, icon="🪑",  description="Door, window, furniture repair and custom woodwork."),
    dict(group="home_repair", name="Painter",                      fee_type="fixed",           shop_visit_allowed=False, active=True,  coming_soon=False, base_service_charge=1200, market_rate_estimate=2000, icon="🎨",  description="Interior and exterior painting, waterproofing."),
    dict(group="home_repair", name="Fridge / Washing Machine / TV Repair", fee_type="fixed",  shop_visit_allowed=True,  active=True,  coming_soon=False, base_service_charge=450,  market_rate_estimate=1000, icon="📺",  description="Appliance diagnosis and repair at home or at the shop."),
    dict(group="home_repair", name="Pest Control",                 fee_type="fixed",           shop_visit_allowed=False, active=True,  coming_soon=False, base_service_charge=800,  market_rate_estimate=1500, icon="🐜",  description="Cockroach, termite, bed bug treatment for home and office."),
    dict(group="home_repair", name="Deep Cleaning",                fee_type="fixed",           shop_visit_allowed=False, active=True,  coming_soon=False, base_service_charge=1500, market_rate_estimate=2500, icon="✨",  description="Full home deep cleaning including sofa, kitchen and bathroom."),
    # Household and personal
    dict(group="household_personal", name="Maid",        fee_type="monthly",        shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=3500, market_rate_estimate=5000, icon="🧹", description="Verified home helper for cleaning and daily chores."),
    dict(group="household_personal", name="Cook",        fee_type="monthly",        shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=4000, market_rate_estimate=6000, icon="🍳", description="Home cook for breakfast, lunch or dinner — veg or non-veg."),
    dict(group="household_personal", name="Driver",      fee_type="monthly",        shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=8000, market_rate_estimate=12000, icon="🚗", description="Personal driver for daily commute or outstation trips."),
    dict(group="household_personal", name="Massage / Spa at Home", fee_type="hourly", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=800,  market_rate_estimate=1500, icon="💆", description="Relaxation, Swedish or deep-tissue massage at home."),
    dict(group="household_personal", name="Babysitter",  fee_type="hourly",        shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=200,  market_rate_estimate=400,  icon="👶", description="Verified childcare helper for a few hours to full day."),
    dict(group="household_personal", name="Elder Care",  fee_type="monthly",       shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=6000, market_rate_estimate=10000, icon="👵", description="Trained caretakers for senior citizens with medical needs."),
    # Construction labour
    dict(group="construction_labour", name="Construction Labour", fee_type="per_day", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=800, market_rate_estimate=1000, icon="🧱", description="Mason, helper, tile fitter, welder, painter and more — by the day."),
    # Professional services
    dict(group="professional_services", name="Lawyer",                fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=1500, market_rate_estimate=3000, icon="⚖️",  description="Civil, criminal, property and family law consultations."),
    dict(group="professional_services", name="CA / Chartered Accountant", fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=1200, market_rate_estimate=2500, icon="📊", description="Income tax, GST filing and financial advisory."),
    dict(group="professional_services", name="Tax Filer",             fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=500,  market_rate_estimate=1000, icon="📋", description="ITR filing for individuals, salaried and self-employed."),
    dict(group="professional_services", name="Notary",                fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=300,  market_rate_estimate=600,  icon="📝", description="Notarisation of documents, affidavits and agreements."),
    dict(group="professional_services", name="Architect",             fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=2000, market_rate_estimate=4000, icon="📐", description="House plan, renovation design and 3D visualisation."),
    dict(group="professional_services", name="Civil Engineer",        fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=1500, market_rate_estimate=3000, icon="🏗️", description="Structural assessment, construction supervision."),
    dict(group="professional_services", name="Interior Designer",     fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=2500, market_rate_estimate=5000, icon="🛋️", description="Home and office interiors, modular kitchen design."),
    dict(group="professional_services", name="Property Surveyor",     fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=1000, market_rate_estimate=2000, icon="🗺️", description="Land measurement, boundary survey and valuation."),
    dict(group="professional_services", name="CCTV / Security Installer", fee_type="fixed",       shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=800,  market_rate_estimate=1500, icon="📷", description="CCTV, alarm and smart lock installation for home and office."),
    dict(group="professional_services", name="Solar Consultant",      fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=500,  market_rate_estimate=1000, icon="☀️", description="Rooftop solar panel sizing, installation and subsidy guidance."),
    dict(group="professional_services", name="IT Support",            fee_type="hourly",            shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=400,  market_rate_estimate=800,  icon="💻", description="PC/laptop repair, network setup, software and virus removal."),
    dict(group="professional_services", name="Tutor",                 fee_type="hourly",            shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=300,  market_rate_estimate=600,  icon="📚", description="Home tuition from Class 1 to competitive exams."),
    dict(group="professional_services", name="Physiotherapist",       fee_type="hourly",            shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=600,  market_rate_estimate=1200, icon="🩺", description="At-home physiotherapy sessions for injury and recovery."),
    dict(group="professional_services", name="Photographer",          fee_type="per_consultation", shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=2000, market_rate_estimate=4000, icon="📸", description="Event, product, real-estate and portrait photography."),
    dict(group="professional_services", name="Documentation Agent",   fee_type="fixed",            shop_visit_allowed=False, active=True, coming_soon=False, base_service_charge=500,  market_rate_estimate=1000, icon="📁", description="Aadhaar, PAN, passport, GSTIN and property registrations."),
]

created_cats = {}
for c in categories_data:
    cat = ServiceCategory(**c)
    db.add(cat)
    db.flush()
    created_cats[c["name"]] = cat

# --- 4. WORKER PROFILES ------------------------------------------------------
worker_profiles_data = [
    dict(email="worker@demo.com",       cat_name="AC Repair & Service",    shop_name="CoolBreeze AC Service Center", base_rate=550, rating=4.8, exp=6, bio="6 years experience in all AC brands. Daikin & Voltas specialist."),
    dict(email="electrician@demo.com",  cat_name="Electrician",            shop_name=None,                           base_rate=400, rating=4.6, exp=5, bio="Residential and commercial wiring. Fire-safety certified."),
    dict(email="plumber@demo.com",      cat_name="Plumber",                shop_name=None,                           base_rate=350, rating=4.7, exp=8, bio="Expert in bathroom fitting, CPVC piping and drainage."),
    dict(email="lawyer@demo.com",       cat_name="Lawyer",                 shop_name="Desai & Associates Law Firm",  base_rate=1500, rating=4.9, exp=12, bio="Bar Council No. MH/2012/4832. Property, civil and family law."),
]

for wp in worker_profiles_data:
    user = created_users[wp["email"]]
    cat = created_cats[wp["cat_name"]]
    shop = created_shops.get(wp["shop_name"]) if wp["shop_name"] else None
    profile = WorkerProfile(
        user_id=user.id,
        category_id=cat.id,
        shop_id=shop.id if shop else None,
        base_rate=wp["base_rate"],
        rating=wp["rating"],
        available_today=True,
        experience_years=wp["exp"],
        bio=wp["bio"],
    )
    db.add(profile)

# --- 5. PARTS ----------------------------------------------------------------
parts_data = [
    # AC parts
    ("AC Capacitor 5 Ton",          "ac_parts"),
    ("AC Fan Motor (Indoor Unit)",  "ac_parts"),
    ("Refrigerant Gas R22 (1 kg)",  "ac_parts"),
    ("AC PCB Control Board",        "ac_parts"),
    ("AC Thermostat",               "ac_parts"),
    # Electrical
    ("MCB 32A Single Pole",         "electrical"),
    ("Electrical Wire 2.5 sqmm (per metre)", "electrical"),
    ("16A Switch Socket Combo",     "electrical"),
    ("LED Driver 18W",              "electrical"),
    ("Distribution Board 8-way",   "electrical"),
    # Plumbing
    ("PVC Ball Valve 1/2\"",        "plumbing"),
    ("CPVC Pipe 1\" (per metre)",   "plumbing"),
    ("Ceramic Pillar Tap",          "plumbing"),
    ("Basin Mixer Tap",             "plumbing"),
    ("Flush Tank Complete Set",     "plumbing"),
    # RO parts
    ("RO Membrane 75 GPD",          "ro_parts"),
    ("Sediment Filter 10\"",        "ro_parts"),
    ("Carbon Block Filter",         "ro_parts"),
    ("Booster Pump 24V DC",         "ro_parts"),
    # Hardware
    ("Screw Assortment 200pc",      "hardware"),
    ("Diamond Drill Bit Set 6pc",   "hardware"),
    ("PVC Solvent Cement 100ml",    "hardware"),
    ("Teflon Tape (5 rolls)",       "hardware"),
    ("Wall Putty 5 kg",             "hardware"),
    ("Tile Adhesive 5 kg",          "hardware"),
]

created_parts = []
for name, cat in parts_data:
    part = Part(name=name, category=cat)
    db.add(part)
    db.flush()
    created_parts.append(part)

part_map = {p.name: p for p in created_parts}

# --- 6. SUPPLIER PRICES ------------------------------------------------------
prices_data = [
    ("Sharma Hardware & Tools", "PVC Ball Valve 1/2\"",        95,   40),
    ("Sharma Hardware & Tools", "CPVC Pipe 1\" (per metre)",   22,  200),
    ("Sharma Hardware & Tools", "Screw Assortment 200pc",      110,  80),
    ("Sharma Hardware & Tools", "Diamond Drill Bit Set 6pc",   380,  30),
    ("Sharma Hardware & Tools", "PVC Solvent Cement 100ml",    95,   60),
    ("Sharma Hardware & Tools", "Teflon Tape (5 rolls)",       55,  100),
    ("Sharma Hardware & Tools", "Wall Putty 5 kg",             290,  50),
    ("Sharma Hardware & Tools", "Tile Adhesive 5 kg",          240,  45),
    ("Sharma Hardware & Tools", "Ceramic Pillar Tap",          480,  25),
    ("Sharma Hardware & Tools", "Basin Mixer Tap",             720,  15),
    ("Pune Electrical Supplies", "MCB 32A Single Pole",              135,  80),
    ("Pune Electrical Supplies", "Electrical Wire 2.5 sqmm (per metre)", 18, 500),
    ("Pune Electrical Supplies", "16A Switch Socket Combo",          120,  60),
    ("Pune Electrical Supplies", "LED Driver 18W",                   150,  40),
    ("Pune Electrical Supplies", "Distribution Board 8-way",         680,  20),
    ("Pune Electrical Supplies", "AC Capacitor 5 Ton",               480,  30),
    ("AC Spares Hub", "AC Capacitor 5 Ton",          450,  50),
    ("AC Spares Hub", "AC Fan Motor (Indoor Unit)",   980,  20),
    ("AC Spares Hub", "Refrigerant Gas R22 (1 kg)",  850,  30),
    ("AC Spares Hub", "AC PCB Control Board",       1800,  10),
    ("AC Spares Hub", "AC Thermostat",               320,  25),
    ("AC Spares Hub", "RO Membrane 75 GPD",          680,  35),
    ("AC Spares Hub", "Sediment Filter 10\"",        95,   80),
    ("AC Spares Hub", "Carbon Block Filter",         110,  70),
    ("AC Spares Hub", "Booster Pump 24V DC",         780,  20),
    ("National Plumbing Store", "PVC Ball Valve 1/2\"",       72,   60),
    ("National Plumbing Store", "CPVC Pipe 1\" (per metre)",  19,  300),
    ("National Plumbing Store", "Ceramic Pillar Tap",         420,  35),
    ("National Plumbing Store", "Basin Mixer Tap",            650,  20),
    ("National Plumbing Store", "Flush Tank Complete Set",    720,  15),
    ("National Plumbing Store", "Screw Assortment 200pc",     98,   90),
    ("National Plumbing Store", "Teflon Tape (5 rolls)",      45,  120),
    ("National Plumbing Store", "Wall Putty 5 kg",            265,  60),
    ("BuildMart Supplies", "MCB 32A Single Pole",              150,  60),
    ("BuildMart Supplies", "Electrical Wire 2.5 sqmm (per metre)", 21, 300),
    ("BuildMart Supplies", "Screw Assortment 200pc",           105,  70),
    ("BuildMart Supplies", "Diamond Drill Bit Set 6pc",        350,  25),
    ("BuildMart Supplies", "Wall Putty 5 kg",                  275,  45),
    ("BuildMart Supplies", "Tile Adhesive 5 kg",               225,  40),
    ("BuildMart Supplies", "Flush Tank Complete Set",          760,  12),
]

for shop_name, part_name, price, stock in prices_data:
    shop = created_shops[shop_name]
    part = part_map[part_name]
    sp = SupplierPrice(supplier_shop_id=shop.id, part_id=part.id, price=price, stock=stock)
    db.add(sp)

db.commit()
print("✅ Seed complete! All services are active and coming_soon is removed.")
db.close()
