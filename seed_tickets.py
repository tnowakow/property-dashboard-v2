#!/usr/bin/env python3
"""
Seed script to add demo tickets for 4 new buildings with 8-12 units each.
Connects to Railway PostgreSQL and inserts realistic maintenance ticket data.
"""

import os
import asyncpg
from typing import List, Dict, Any
import random
from datetime import datetime, timedelta


# Building names for the demo
BUILDINGS = [
    "Oakwood Apartments",
    "Riverside Commons", 
    "Maple Grove Residences",
    "Sunset Terrace"
]

# Issue templates by trade type
ISSUE_TEMPLATES = {
    "HVAC": [
        "My AC is not cooling properly. The unit runs but air is warm.",
        "Heater won't turn on and I'm freezing in here!",
        "Thermostat is broken - can't control temperature at all.",
        "AC makes loud banging noise when it kicks on.",
        "Condensation dripping from my AC unit onto the floor."
    ],
    "Plumbing": [
        "Kitchen sink is leaking under the cabinet. Water everywhere!",
        "Toilet keeps running and won't stop. Wasting so much water.",
        "Shower has no hot water - only cold coming out.",
        "Bathtub drain is completely clogged, water won't go down.",
        "Water heater is making weird noises and smells like sulfur."
    ],
    "Electrical": [
        "One of my outlets is sparking when I plug things in!",
        "Half the lights in my apartment don't work anymore.",
        "Circuit breaker keeps tripping every few hours.",
        "Ceiling fan wobbles dangerously and makes grinding noise.",
        "GFCI outlet in bathroom won't reset - no power at all."
    ],
    "General": [
        "Door lock is stuck and won't turn properly. Can't get in!",
        "Window screen is torn and bugs are getting inside.",
        "Garbage disposal is jammed and won't drain.",
        "Microwave outlet stopped working - appliance won't power on.",
        "Floor has water damage near the bathroom door."
    ],
    "Other": [
        "Pest problem - seeing rodents in my kitchen at night.",
        "Elevator has been broken for 3 days, I have mobility issues!",
        "Laundry room machines are all out of order.",
        "Garbage collection area is overflowing and attracting pests.",
        "Parking lot light near my spot is broken, very dark."
    ]
}

# Tenant names for realism
TENANT_NAMES = [
    "Jennifer Taylor", "Robert Johnson", "Michael Brown", "Sarah Davis",
    "David Wilson", "Emily Martinez", "James Anderson", "Lisa Thompson",
    "William Garcia", "Patricia Rodriguez", "Christopher Lee", "Mary White",
    "Daniel Harris", "Nancy Clark", "Matthew Lewis", "Karen Walker"
]


def generate_unit_number(building_name: str, existing_units: set) -> str:
    """Generate a unique unit number for a building."""
    while True:
        floor = random.randint(1, 8)
        letter = random.choice(['A', 'B', 'C'])
        unit_num = f"{floor}{letter}"
        
        # Make it unique per building by using building initials
        prefix = ''.join([word[0] for word in building_name.split()])[:2].upper()
        full_unit = f"{prefix}-{unit_num}"
        
        if full_unit not in existing_units:
            return full_unit


async def seed_tickets():
    """Connect to database and insert demo tickets."""
    
    # Get DATABASE_URL from environment (Railway provides this)
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not set in environment")
        return
    
    try:
        # Connect to database
        print("🔗 Connecting to Railway PostgreSQL...")
        pool = await asyncpg.create_pool(dsn=database_url)
        
        async with pool.acquire() as conn:
            # Get existing tickets to see what we have
            existing = await conn.fetch("SELECT unit, property_name FROM tickets")
            print(f"📊 Found {len(existing)} existing tickets\n")
            
            # Track units per building
            buildings_data = {}
            total_tickets_created = 0
            
            for building_name in BUILDINGS:
                num_units = random.randint(8, 12)
                buildings_data[building_name] = {
                    'units': set(),
                    'tickets': []
                }
                
                print(f"🏢 Seeding tickets for {building_name} ({num_units} units)...")
                
                # Generate tickets for this building (not all units will have tickets)
                num_tickets = random.randint(3, 6)  # Some units won't have active tickets
                
                for i in range(num_tickets):
                    unit_num = generate_unit_number(building_name, buildings_data[building_name]['units'])
                    buildings_data[building_name]['units'].add(unit_num)
                    
                    # Pick random trade type and issue
                    trade_type = random.choice(list(ISSUE_TEMPLATES.keys()))
                    issue_raw = random.choice(ISSUE_TEMPLATES[trade_type])
                    
                    # Random tenant info
                    tenant_name = random.choice(TENANT_NAMES)
                    tenant_phone = f"+1555{random.randint(1000000, 9999999)}"
                    
                    # Random status and urgency
                    status = random.choice(['incoming', 'triaged', 'dispatched', 'in_progress'])
                    urgency = random.choice(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'])
                    
                    # Random channel
                    channel = random.choice(['sms', 'voice', 'web'])
                    
                    # Create timestamp (within last 7 days)
                    created_at = datetime.utcnow() - timedelta(
                        hours=random.randint(1, 168)
                    )
                    
                    # Insert ticket
                    await conn.execute("""
                        INSERT INTO tickets (
                            unit, tenant_name, issue_raw, channel, 
                            tenant_phone, urgency, trade_type, status, created_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """, unit_num, tenant_name, issue_raw, channel, 
                       tenant_phone, urgency, trade_type, status, created_at)
                    
                    buildings_data[building_name]['tickets'].append({
                        'unit': unit_num,
                        'trade': trade_type,
                        'status': status
                    })
                    
                    total_tickets_created += 1
                
                print(f"   ✅ Created {num_tickets} tickets across {len(buildings_data[building_name]['units'])} unique units")
            
            # Print summary
            final_count = await conn.fetchrow("SELECT COUNT(*) as count FROM tickets")
            
            print(f"\n{'='*60}")
            print("🎉 SEEDING COMPLETE!")
            print(f"{'='*60}")
            print(f"\n📊 SUMMARY:")
            print(f"   New tickets created: {total_tickets_created}")
            print(f"   Total tickets in database: {final_count['count']}")
            
            print(f"\n🏢 BUILDINGS & UNITS:")
            for building_name, data in buildings_data.items():
                print(f"   • {building_name}: {len(data['units'])} units with tickets")
                
                # Show sample tickets
                if len(data['tickets']) >= 2:
                    samples = random.sample(data['tickets'], min(2, len(data['tickets'])))
                    for s in samples:
                        print(f"      - Unit {s['unit']}: {s['trade']} ({s['status']})")
            
            # Show distribution by trade type
            trades_dist = await conn.fetch("""
                SELECT trade_type, COUNT(*) as count 
                FROM tickets 
                GROUP BY trade_type 
                ORDER BY count DESC
            """)
            
            print(f"\n🔧 TICKETS BY TRADE TYPE:")
            for t in trades_dist:
                bar = '█' * (t['count'] // 2)
                print(f"   {t['trade_type']:12} {t['count']:3} {bar}")
            
            # Show distribution by status
            status_dist = await conn.fetch("""
                SELECT status, COUNT(*) as count 
                FROM tickets 
                GROUP BY status 
                ORDER BY count DESC
            """)
            
            print(f"\n📋 TICKETS BY STATUS:")
            for s in status_dist:
                bar = '█' * (s['count'] // 2)
                print(f"   {s['status']:15} {s['count']:3} {bar}")
        
        await pool.close()
        print(f"\n✅ Database seeding finished successfully!")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_tickets())
