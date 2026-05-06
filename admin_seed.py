#!/usr/bin/env python3
"""
Admin script to seed additional buildings via HTTP API.
This can be run locally and will POST tickets through the web intake endpoint.
"""

import asyncio
import httpx
import random
from uuid import uuid4

# Building configurations
BUILDINGS = [
    {"name": "Maple Heights", "units_count": 10},
    {"name": "Oak Grove", "units_count": 8},
    {"name": "Pine Valley", "units_count": 12},
    {"name": "Cedar Point", "units_count": 9},
]

FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]

ISSUES = {
    "HVAC": ["AC not cooling", "Heater making noise", "Thermostat broken", "Furnace won't start"],
    "Plumbing": ["Leaky faucet", "Toilet running", "Drain clogged", "Water heater issue"],
    "Electrical": ["Outlet stopped working", "Light flickering", "Circuit breaker tripping"],
    "General": ["Door lock broken", "Window won't close", "Appliance repair needed"],
}

API_BASE = "https://property-dashboard-v2-production.up.railway.app"

def generate_unit_number(index):
    floor = (index // 3) + 1
    letter = chr(ord('A') + (index % 3))
    return f"{floor}{letter}"

async def seed_ticket(building_name, unit_num, issue):
    """Create a single ticket via the web intake endpoint"""
    
    payload = {
        "unit": f"{building_name} - {unit_num}",
        "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
        "phone": f"+1555{random.randint(1000000, 9999999)}",
        "issue": issue,
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(f"{API_BASE}/intake/web", json=payload)
            if response.status_code in [200, 201]:
                result = response.json()
                return {"success": True, "ticket_id": result.get("ticketId"), "unit": payload["unit"]}
            else:
                print(f"   Error {response.status_code}: {response.text[:80]}")
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            print(f"   Exception: {e}")
            return {"success": False, "error": str(e)}

async def seed_buildings():
    print(f"🌱 Seeding 4 additional buildings via API...")
    print(f"   Target: {API_BASE}\n")
    
    total_created = 0
    
    for building in BUILDINGS:
        building_name = building["name"]
        units_count = building["units_count"]
        
        print(f"🏢 Seeding {building_name} ({units_count} units)...")
        
        # Create tickets for ~40% of units
        num_tickets = int(units_count * 0.4)
        created = 0
        
        for i in range(num_tickets):
            unit_num = generate_unit_number(i)
            trade_type = random.choice(list(ISSUES.keys()))
            issue = random.choice(ISSUES[trade_type])
            
            result = await seed_ticket(building_name, unit_num, issue)
            
            if result["success"]:
                created += 1
                total_created += 1
        
        print(f"   ✅ Created {created} tickets for {building_name}")
        
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.2)
    
    print(f"\n🎉 Seeding complete!")
    print(f"   Successfully created: {total_created} tickets")

if __name__ == "__main__":
    asyncio.run(seed_buildings())
