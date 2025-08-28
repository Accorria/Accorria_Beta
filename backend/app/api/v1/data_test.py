"""
Data Collection Test Endpoint
Tests that the backend can collect and store data properly
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.models.comprehensive_models import User, Session as UserSession, Car
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/test-data-collection")
async def test_data_collection(db: AsyncSession = Depends(get_db)):
    """
    Test endpoint to verify data collection is working
    Creates test records and returns statistics
    """
    try:
        # Create a test user
        test_user = User(
            user_type="test_user",
            is_active=True
        )
        db.add(test_user)
        await db.flush()  # Get the user_id
        
        # Create a test session
        test_session = UserSession(
            user_id=test_user.user_id,
            login_time=datetime.utcnow(),
            user_agent="test-agent",
            platform="web"
        )
        db.add(test_session)
        
        # Create a test car
        test_car = Car(
            seller_id=test_user.user_id,
            year=2020,
            make="Toyota",
            model="Camry",
            color="Silver",
            price=25000.00,
            mileage=50000,
            status="active",
            description="Test car for data collection verification"
        )
        db.add(test_car)
        
        # Commit all changes
        await db.commit()
        
        # Get statistics
        user_count_result = await db.execute(text("SELECT COUNT(*) FROM users"))
        user_count = user_count_result.scalar()
        
        session_count_result = await db.execute(text("SELECT COUNT(*) FROM sessions"))
        session_count = session_count_result.scalar()
        
        car_count_result = await db.execute(text("SELECT COUNT(*) FROM cars"))
        car_count = car_count_result.scalar()
        
        return {
            "status": "success",
            "message": "Data collection test completed successfully",
            "test_data": {
                "user_id": test_user.user_id,
                "session_id": test_session.session_id,
                "car_id": test_car.car_id
            },
            "database_stats": {
                "total_users": user_count,
                "total_sessions": session_count,
                "total_cars": car_count
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Data collection test failed: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Data collection test failed: {str(e)}")

@router.get("/data-stats")
async def get_data_stats(db: AsyncSession = Depends(get_db)):
    """
    Get current database statistics
    """
    try:
        user_count_result = await db.execute(text("SELECT COUNT(*) FROM users"))
        user_count = user_count_result.scalar()
        
        session_count_result = await db.execute(text("SELECT COUNT(*) FROM sessions"))
        session_count = session_count_result.scalar()
        
        car_count_result = await db.execute(text("SELECT COUNT(*) FROM cars"))
        car_count = car_count_result.scalar()
        
        return {
            "status": "success",
            "database_stats": {
                "total_users": user_count,
                "total_sessions": session_count,
                "total_cars": car_count
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get data stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get data stats: {str(e)}")

@router.post("/init-database")
async def initialize_database(db: AsyncSession = Depends(get_db)):
    """
    Initialize database tables
    """
    try:
        from app.core.database import init_db
        await init_db()
        
        return {
            "status": "success",
            "message": "Database tables initialized successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")

@router.get("/test-db-connection")
async def test_database_connection(db: AsyncSession = Depends(get_db)):
    """
    Test database connection
    """
    try:
        # Simple query to test connection
        result = await db.execute(text("SELECT 1 as test"))
        test_value = result.scalar()
        
        return {
            "status": "success",
            "message": "Database connection successful",
            "test_result": test_value,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
