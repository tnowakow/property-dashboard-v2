#!/usr/bin/env python3
"""
Seed script to add 4 new buildings with 8-12 units each.
Connects to Railway PostgreSQL and inserts demo data.
"""

import os
import asyncpg
from typing import List, Dict, Any
import random
from datetime import datetime, timedelta


# Building names for the demo
BUILDING_NAMES = [
    "Oakwood Apartments",
    "Riverside Commons", 
    "Maple Grove Residences",
    "Sunset Terrace"
]

def generate_units(building_name: str, num_units: int) -> List[Dict[str, Any]]:
    """Generate unit data for a building."""
    units = []
    
    # Mix of floor numbers and letter suffixes
    floors = list(range(1, 8))  # Floors 1-7
    letters = ['A', 'B', 'C']
    
    used_units = set()
    
    for i in range(num_units):
        while True:
            floor = random.choice(floors)
            letter = random.choice(letters)
            unit_num = f"{floor}{letter}"
            
            if unit_num not in used_units:
                used_units.add(unit_num)
                break
        
        units.append({
            "building_name": building_name,
            "unit_number": unit_num,
            "num_bedrooms": random.choice([1, 2, 3]),
            "num_bathrooms": random.choice([1, 2]),
            "square_feet": random.randint(650, 1400),
            "is_occupied": True,
            "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 365))
        })
    
    return units


async def seed_buildings():
    """Connect to database and insert buildings/units."""
    
    # Get DATABASE_URL from environment (Railway provides this)
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not set in environment")
        print("\nFor local testing, use:")
        print(f"DATABASE_URL=postgresql://postgres:FVFibFpiwsUoREsPSjBZwoUPWVoGyWAq@shortline.proxy.rlwy.net:46446/railway python3 seed_buildings.py")
        return
    
    try:
        # Connect to database
        print("🔗 Connecting to Railway PostgreSQL...")
        pool = await asyncpg.create_pool(dsn=database_url)
        
        async with pool.acquire() as conn:
            # Check if tables exist
            result = await conn.fetchrow(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'buildings') AS exists_check"
            )
            
            if not result['exists_check']:
                print("📝 Creating buildings and units tables...")
                
                # Create buildings table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS buildings (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name VARCHAR(255) NOT NULL UNIQUE,
                        address VARCHAR(500),
                        city VARCHAR(100),
                        state VARCHAR(50),
                        zip_code VARCHAR(20),
                        total_units INTEGER DEFAULT 0,
                        property_manager_name VARCHAR(255),
                        property_manager_email VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Create units table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS units (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
                        unit_number VARCHAR(20) NOT NULL,
                        num_bedrooms INTEGER,
                        num_bathrooms INTEGER,
                        square_feet INTEGER,
                        is_occupied BOOLEAN DEFAULT TRUE,
                        tenant_name VARCHAR(255),
                        tenant_phone VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(building_id, unit_number)
                    )
                """)
                
                print("✅ Tables created successfully")
            
            # Seed 4 buildings with random units (8-12 each)
            total_units_created = 0
            
            for building_name in BUILDING_NAMES:
                num_units = random.randint(8, 12)
                
                print(f"\n🏢 Seeding {building_name} ({num_units} units)...")
                
                # Insert building
                result = await conn.fetchrow("""
                    INSERT INTO buildings (name, total_units, property_manager_name, property_manager_email)
                    VALUES ($1, $2, 'Tom Nowakowski', 'tom@focuspathconsulting.com')
                    ON CONFLICT (name) DO UPDATE SET total_units = EXCLUDED.total_units
                    RETURNING id
                """, building_name, num_units)
                
                building_id = result['id']
                
                # Generate and insert units
                units = generate_units(building_name, num_units)
                
                for unit in units:
                    await conn.execute("""
                        INSERT INTO units (building_id, unit_number, num_bedrooms, num_bathrooms, square_feet, is_occupied)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (building_id, unit_number) DO NOTHING
                    """, building_id, unit['unit_number'], unit['num_bedrooms'], 
                       unit['num_bathrooms'], unit['square_feet'], unit['is_occupied'])
                
                total_units_created += num_units
                print(f"   ✅ Added {num_units} units to {building_name}")
            
            # Print summary
            buildings_result = await conn.fetch("SELECT name, total_units FROM buildings ORDER BY name")
            units_count = await conn.fetchrow("SELECT COUNT(*) as count FROM units")
            
            print(f"\n{'='*60}")
            print("🎉 SEEDING COMPLETE!")
            print(f"{'='*60}")
            print(f"\n📊 SUMMARY:")
            print(f"   Buildings created: {len(buildings_result)}")
            print(f"   Total units in database: {units_count['count']}")
            
            print(f"\n🏢 BUILDINGS:")
            for b in buildings_result:
                print(f"   • {b['name']}: {b['total_units']} units")
            
            # Show sample units per building
            print(f"\n📋 SAMPLE UNITS PER BUILDING:")
            for b in buildings_result[:2]:  # Just show first 2 as examples
                sample = await conn.fetch("""
                    SELECT u.unit_number, u.num_bedrooms, u.num_bathrooms 
                    FROM units u 
                    JOIN buildings b ON u.building_id = b.id 
                    WHERE b.name = $1 
                    LIMIT 3
                """, b['name'])
                
                print(f"   {b['name']}:")
                for s in sample:
                    print(f"      - Unit {s['unit_number']} ({s['num_bedrooms']} bed, {s['num_bathrooms']} bath)")
            
            print(f"\n💡 TIP: You can now query:")
            print(f"   GET /api/buildings - List all buildings")
            print(f"   GET /api/units?building_id=X - Get units for a building")
        
        await pool.close()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_buildings())
