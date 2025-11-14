"""
User-Specific Facebook Posting API endpoints
Handles posting to user's own Facebook pages using their OAuth2 tokens
"""

from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.utils.auth import get_current_user_id
from app.services.user_facebook_poster import UserFacebookPoster, create_facebook_listing_data
from app.services.facebook_marketplace import FacebookListingData
from app.models.user_platform_connection import UserPlatformConnection

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

# Pydantic models
class FacebookPostingRequest(BaseModel):
    title: str
    description: str
    price: float
    make: Optional[str] = ""
    model: Optional[str] = ""
    year: Optional[int] = 0
    mileage: Optional[int] = 0
    condition: Optional[str] = "GOOD"
    page_id: Optional[str] = None  # If None, will use first available page
    post_to_marketplace: Optional[bool] = False  # If True, prepare for Marketplace posting

class FacebookPostingResponse(BaseModel):
    success: bool
    message: str
    platform: str
    user_id: str
    page_id: Optional[str] = None
    page_name: Optional[str] = None
    listing_id: Optional[str] = None
    listing_url: Optional[str] = None
    error_message: Optional[str] = None
    posted_at: Optional[datetime] = None
    marketplace_guidance: Optional[Dict[str, Any]] = None

class FacebookPageInfo(BaseModel):
    page_id: str
    name: str
    category: str

@router.post("/post-to-page", response_model=FacebookPostingResponse)
async def post_to_facebook_page(
    request: FacebookPostingRequest,
    images: Optional[List[UploadFile]] = File(None, description="Listing images (up to 10)"),
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Post a listing to user's Facebook page using their OAuth2 token
    """
    try:
        # Convert uploaded images to bytes
        image_bytes = []
        if images:
            for image in images[:10]:  # Facebook allows max 10 images
                content = await image.read()
                image_bytes.append(content)
        
        # Create Facebook listing data
        listing_data = create_facebook_listing_data(
            title=request.title,
            description=request.description,
            price=request.price,
            make=request.make,
            model=request.model,
            year=request.year,
            mileage=request.mileage,
            condition=request.condition,
            images=image_bytes if image_bytes else None
        )
        
        # Post to user's Facebook page
        async with UserFacebookPoster(db) as poster:
            if request.post_to_marketplace:
                # Prepare for Marketplace posting (guided workflow)
                result = await poster.post_to_user_facebook_marketplace(
                    user_id=current_user_id,
                    listing_data=listing_data
                )
                
                # Prepare marketplace guidance
                marketplace_guidance = {
                    "marketplace_url": result.listing_url,
                    "prepared_data": {
                        "title": request.title,
                        "description": request.description,
                        "price": f"${request.price:,.2f}",
                        "make": request.make,
                        "model": request.model,
                        "year": request.year,
                        "mileage": f"{request.mileage:,} miles" if request.mileage else "Not specified",
                        "condition": request.condition
                    },
                    "instructions": [
                        "1. Click the marketplace URL to open Facebook Marketplace",
                        "2. Select 'Vehicle' as the category",
                        "3. Copy and paste the prepared data into the form",
                        "4. Upload your images",
                        "5. Review and publish your listing"
                    ]
                }
                
                return FacebookPostingResponse(
                    success=True,
                    message="Listing prepared for Facebook Marketplace posting",
                    platform="facebook_marketplace",
                    user_id=current_user_id,
                    listing_url=result.listing_url,
                    posted_at=result.posted_at,
                    marketplace_guidance=marketplace_guidance
                )
            else:
                # Post to user's Facebook page
                result = await poster.post_to_user_facebook_page(
                    user_id=current_user_id,
                    page_id=request.page_id or "",  # Will use first available page if None
                    listing_data=listing_data
                )
                
                return FacebookPostingResponse(
                    success=result.success,
                    message="Posted to Facebook page successfully" if result.success else "Failed to post to Facebook page",
                    platform=result.platform,
                    user_id=result.user_id,
                    page_id=result.page_id,
                    page_name=result.page_name,
                    listing_id=result.listing_id,
                    listing_url=result.listing_url,
                    error_message=result.error_message,
                    posted_at=result.posted_at
                )
                
    except Exception as e:
        logger.error(f"Error posting to Facebook: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to post to Facebook: {str(e)}"
        )

@router.get("/pages", response_model=List[FacebookPageInfo])
async def get_user_facebook_pages(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's Facebook pages for posting
    """
    try:
        # Query user's Facebook connection
        result = await db.execute(
            select(UserPlatformConnection)
            .where(
                UserPlatformConnection.user_id == current_user_id,
                UserPlatformConnection.platform == "facebook",
                UserPlatformConnection.is_active == True
            )
        )
        connection = result.scalar_one_or_none()
        
        if not connection:
            raise HTTPException(
                status_code=404,
                detail="Facebook account not connected"
            )
        
        pages = connection.platform_data.get("pages", []) if connection.platform_data else []
        
        return [
            FacebookPageInfo(
                page_id=page["page_id"],
                name=page["name"],
                category=page["category"]
            )
            for page in pages
        ]
            
    except Exception as e:
        logger.error(f"Error getting Facebook pages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Facebook pages: {str(e)}"
        )

@router.get("/connection-status")
async def get_facebook_connection_status(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's Facebook connection status and available pages
    """
    import asyncio
    try:
        # Add timeout to prevent hanging (5 seconds max for database query)
        async def query_connection():
            result = await db.execute(
                select(UserPlatformConnection)
                .where(
                    UserPlatformConnection.user_id == current_user_id,
                    UserPlatformConnection.platform == "facebook",
                    UserPlatformConnection.is_active == True
                )
            )
            return result.scalar_one_or_none()
        
        try:
            connection = await asyncio.wait_for(query_connection(), timeout=5.0)
        except asyncio.TimeoutError:
            logger.warning(f"Database query timed out for Facebook connection status (user: {current_user_id})")
            # Return not connected if query times out
            return {
                "connected": False,
                "message": "Facebook account not connected",
                "pages": []
            }
        
        if not connection:
            return {
                "connected": False,
                "message": "Facebook account not connected",
                "pages": []
            }
        
        user_info = connection.platform_data.get("user_info", {}) if connection.platform_data else {}
        pages = connection.platform_data.get("pages", []) if connection.platform_data else []
        
        # Remove access tokens from pages for security
        safe_pages = [
            {
                "page_id": page["page_id"],
                "name": page["name"],
                "category": page["category"]
            }
            for page in pages
        ]
        
        return {
            "connected": True,
            "message": "Facebook account connected",
            "user_info": user_info,
            "pages": safe_pages,
            "last_used": connection.last_used_at,
            "token_expires": connection.token_expires_at
        }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Facebook connection status: {str(e)}")
        # Return not connected instead of raising error to prevent frontend timeout
        return {
            "connected": False,
            "message": "Facebook account not connected",
            "pages": [],
            "error": "Connection check failed"
        }

@router.post("/test-connection")
async def test_facebook_connection(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Test user's Facebook connection by making a simple API call
    """
    try:
        # Query user's Facebook connection
        result = await db.execute(
            select(UserPlatformConnection)
            .where(
                UserPlatformConnection.user_id == current_user_id,
                UserPlatformConnection.platform == "facebook",
                UserPlatformConnection.is_active == True
            )
        )
        connection = result.scalar_one_or_none()
        
        if not connection:
            raise HTTPException(
                status_code=404,
                detail="Facebook account not connected"
            )
        
        # Decrypt access token for testing
        from cryptography.fernet import Fernet
        import os
        
        def get_encryption_key():
            key = os.getenv("TOKEN_ENCRYPTION_KEY")
            if not key:
                key = Fernet.generate_key().decode()
            else:
                key = key.encode()
            return key
        
        def decrypt_token(encrypted_token: str) -> str:
            f = Fernet(get_encryption_key())
            return f.decrypt(encrypted_token.encode()).decode()
        
        access_token = decrypt_token(connection.access_token)
        
        # Test the connection by getting user info
        import aiohttp
        async with aiohttp.ClientSession() as session:
            url = "https://graph.facebook.com/v18.0/me"
            params = {
                "access_token": access_token,
                "fields": "id,name"
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "message": "Facebook connection is working",
                        "user_info": data
                    }
                else:
                    error_text = await response.text()
                    return {
                        "success": False,
                        "message": f"Facebook connection test failed: {response.status}",
                        "error": error_text
                    }
                        
    except Exception as e:
        logger.error(f"Error testing Facebook connection: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to test Facebook connection: {str(e)}"
        )
