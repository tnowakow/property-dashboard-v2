#!/usr/bin/env python3
"""
Add more diverse tickets to existing buildings for better demo data.
"""

import asyncio
import httpx
import random

BUILDINGS = ["Maple Heights", "Oak Grove", "Pine Valley", "Cedar Point"]

ISSUES_BY_TRADE = {
    "HVAC": [
        "AC unit not cooling properly in summer",
        "Heater making loud banging noises",
        "Thermostat display is blank",
        "Furnace won't start in cold weather",
        "Air conditioner dripping water on floor",
        "No heat coming from vents",
    ],
    "Plumbing": [
        "Kitchen sink leaking under cabinet",
        "Toilet running continuously wasting water",
        "Shower drain completely clogged",
        "Water heater not producing hot water",
        "Pipe burst causing water damage",
        "Garbage disposal won't turn on",
    ],
    "Electrical": [
        "Outlet in bedroom stopped working",
        "Ceiling light flickering constantly",
        "Circuit breaker tripping repeatedly",
        "Power surge damaged appliances",
        "Dead socket in kitchen",
        "Smoke detector beeping won't stop",
    ],
    "General": [
        "Front door lock stuck won't turn",
        "Window pane cracked needs replacement",
        "Cabinet doors misaligned",
        "Flooring warped from water damage",
        "Paint peeling in bathroom",
        "Blinds broken need repair",
    ],
}

URGENCIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"]
API_BASE = "https://property-dashboard-v2-production.up.railway.app"

async def add_ticket(building, unit_num, trade_type, issue, urgency):
    """Add a single ticket"""
    payload = {
        "unit": f"{building} - {unit_num}",
        "name": f"Tenant {unit_num}",
        "phone": f"+1555{random.randint(1000000, 9999999)}",
        "issue": issue,
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(f"{API_BASE}/intake/web", json=payload)
            return response.status_code in [200, 201]
        except:
            return False

async def main():
    print("🌱 Adding more diverse tickets to existing buildings...\n")
    
    added = 0
    
    # Add 2-3 tickets per building with varied trade types
    for building in BUILDINGS:
        print(f"🏢 {building}:")
        
        num_tickets = random.randint(2, 3)
        for i in range(num_tickets):
            floor = random.randint(1, 4)
            letter = random.choice(['A', 'B', 'C'])
            unit_num = f"{floor}{letter}"
            
            trade_type = random.choice(list(ISSUES_BY_TRADE.keys()))
            issue = random.choice(ISSUES_BY_TRADE[trade_type])
            urgency = random.choice(URGENCIES)
            
            success = await add_ticket(building, unit_num, trade_type, issue, urgency)
            
            if success:
                added += 1
                print(f"   ✅ {unit_num}: {trade_type} - {issue[:40]}...")
            else:
                print(f"   ❌ {unit_num}: Failed to add ticket")
        
        await asyncio.sleep(0.3)
    
    print(f"\n🎉 Added {added} new tickets!")

if __name__ == "__main__":
    asyncio.run(main())
