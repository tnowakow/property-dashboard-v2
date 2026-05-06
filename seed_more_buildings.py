#!/usr/bin/env python3
"""
Seed additional demo data: 4 more buildings with 8-12 units each.
Matches existing tickets table schema (no property_name column).
Uses asyncpg directly to match the database module pattern.
"""

import asyncio
import os
import random
import asyncpg
from uuid import uuid4

# Building configurations: building name and number of units
BUILDINGS = [
    {"name": "Maple Heights", "units_count": 10},
    {"name": "Oak Grove", "units_count": 8},
    {"name": "Pine Valley", "units_count": 12},
    {"name": "Cedar Point", "units_count": 9},
]

# Sample data for realistic tickets
FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", 
               "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
               "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa"]

LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", 
              "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
              "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson"]

ISSUES = {
    "HVAC": [
        "AC unit not cooling properly",
        "Heater making strange noises",
        "Thermostat not responding",
        "Furnace won't turn on",
        "Air conditioner leaking water",
        "No heat in the apartment",
        "AC blowing warm air",
    ],
    "Plumbing": [
        "Leaky faucet in kitchen",
        "Toilet running continuously",
        "Drain clogged in bathroom",
        "Water heater not working",
        "Pipe leaking under sink",
        "Shower has no hot water",
        "Garbage disposal jammed",
    ],
    "Electrical": [
        "Outlet stopped working",
        "Light fixture flickering",
        "Circuit breaker keeps tripping",
        "Ceiling fan not spinning",
        "Power outlet sparking",
        "Dead electrical socket",
        "Breaker panel issue",
    ],
    "General": [
        "Door lock broken",
        "Window won't close properly",
        "Garbage disposal needs cleaning",
        "Appliance repair needed",
        "Flooring damaged in hallway",
        "Paint peeling in bedroom",
        "Cabinet door hinge loose",
    ],
}

URGENCIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"]
STATUSES = ["incoming", "triaged", "dispatched", "completed"]
CHANNELS = ["sms", "voice", "web"]

def generate_unit_number(building_name, index):
    """Generate unit number like '5A', '12B', '8C'"""
    floor = (index // 3) + 1
    letter = chr(ord('A') + (index % 3))
    return f"{floor}{letter}"

def generate_phone():
    """Generate realistic phone number"""
    return f"+1555{random.randint(1000000, 9999999)}"

async def seed_buildings():
    print("🌱 Starting to seed additional buildings...")
    
    # Get DATABASE_URL from environment or use default
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        # Use the public URL for local testing (from CREDENTIALS.md)
        database_url = "postgresql://postgres:FVFibFbiwsUoREsPSjBZwoUPWHoGyWAq@shortline.proxy.rlwy.net:46446/railway"
        print("⚠️  Using public DATABASE_URL from CREDENTIALS.md (not configured in env)")
    
    try:
        # Create connection pool
        pool = await asyncpg.create_pool(database_url, min_size=1, max_size=5)
        
        total_tickets = 0
        
        for building in BUILDINGS:
            building_name = building["name"]
            units_count = building["units_count"]
            
            print(f"\n🏢 Seeding {building_name} with {units_count} units...")
            
            tickets_created = 0
            
            # Create some tickets for this building (not every unit has a ticket)
            # About 30-50% of units will have active/recent tickets
            num_tickets = random.randint(int(units_count * 0.3), int(units_count * 0.5))
            
            async with pool.acquire() as conn:
                for i in range(num_tickets):
                    unit_num = generate_unit_number(building_name, i)
                    trade_type = random.choice(list(ISSUES.keys()))
                    issue = random.choice(ISSUES[trade_type])
                    
                    ticket_id = uuid4()
                    vendor_id = uuid4() if random.random() > 0.5 else None
                    
                    # Insert ticket directly using asyncpg
                    await conn.execute(
                        """
                        INSERT INTO tickets (
                            id, unit, tenant_name, tenant_phone, issue_raw,
                            urgency, trade_type, status, vendor_id, notes, channel
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        """,
                        ticket_id,
                        f"{building_name} - {unit_num}",  # Include building name in unit field
                        f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                        generate_phone(),
                        issue,
                        random.choice(URGENCIES),
                        trade_type,
                        random.choice(STATUSES),
                        vendor_id,
                        f"[2026-05-{random.randint(1, 6):02d}] Ticket received via {random.choice(CHANNELS)}",
                        random.choice(CHANNELS)
                    )
                    
                    tickets_created += 1
            
            print(f"   ✅ Created {tickets_created} tickets for {building_name}")
            total_tickets += tickets_created
        
        # Verify the data
        async with pool.acquire() as conn:
            result = await conn.fetchval("SELECT COUNT(*) FROM tickets")
            total_count = result
            print(f"\n🎉 Successfully seeded {total_tickets} new tickets across 4 buildings!")
            print(f"   📊 Total tickets in database: {total_count}")
            
            # Show unique units
            rows = await conn.fetch("SELECT DISTINCT unit FROM tickets")
            unique_units = [row['unit'] for row in rows]
            print(f"   🏠 Unique units with tickets: {len(unique_units)}")
            
            # Show distribution by building
            print(f"\n📋 Distribution by building:")
            for building in BUILDINGS:
                building_name = building["name"]
                count = await conn.fetchval(
                    "SELECT COUNT(*) FROM tickets WHERE unit LIKE $1 || '%'",
                    building_name
                )
                print(f"   - {building_name}: {count} tickets")
        
        await pool.close()
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(seed_buildings())
