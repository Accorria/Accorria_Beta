"""
Facebook OAuth2 API endpoints
Handles user Facebook account connections for multi-tenant posting
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.core.database import get_db
from app.core.config import settings
from app.services.facebook_oauth import FacebookOAuthService, get_facebook_oauth_config, FacebookUserInfo, FacebookPageInfo
from app.models.user_platform_connection import UserPlatformConnection
from app.utils.auth import get_current_user_id
import json
import base64
from cryptography.fernet import Fernet
import os

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

# Encryption for storing tokens securely
def get_encryption_key() -> bytes:
    """Get or generate encryption key for tokens"""
    key = os.getenv("TOKEN_ENCRYPTION_KEY")
    if not key:
        # Generate a new key if none exists (for development)
        key = Fernet.generate_key().decode()
        logger.warning("TOKEN_ENCRYPTION_KEY not set. Generated temporary key for development.")
    else:
        key = key.encode()
    return key

def encrypt_token(token: str) -> str:
    """Encrypt a token for storage"""
    f = Fernet(get_encryption_key())
    return f.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a stored token"""
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_token.encode()).decode()

# Pydantic models
class FacebookConnectionResponse(BaseModel):
    success: bool
    message: str
    connection_id: Optional[str] = None
    user_info: Optional[Dict[str, Any]] = None
    pages: Optional[List[Dict[str, Any]]] = None

class FacebookConnectionStatus(BaseModel):
    connected: bool
    platform: str
    user_info: Optional[Dict[str, Any]] = None
    pages: Optional[List[Dict[str, Any]]] = None
    last_used: Optional[datetime] = None

class FacebookDisconnectRequest(BaseModel):
    platform: str = "facebook"

# Database model for user_platform_connections (simplified)
class UserPlatformConnection:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

@router.get("/facebook/connect")
async def initiate_facebook_connection(
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Initiate Facebook OAuth2 connection for the current user
    Returns the authorization URL for the user to visit
    """
    try:
        config = get_facebook_oauth_config()
        
        async with FacebookOAuthService(config) as oauth_service:
            # For now, use only basic scopes that don't require App Review
            # Once App Review is approved, you can add:
            # additional_scopes=["pages_manage_posts", "pages_read_engagement"]
            auth_url = oauth_service.generate_authorization_url(
                user_id=current_user_id
                # additional_scopes=["pages_manage_posts", "pages_read_engagement"]
            )
            
            return {
                "success": True,
                "authorization_url": auth_url,
                "message": "Visit the authorization URL to connect your Facebook account"
            }
            
    except Exception as e:
        logger.error(f"Error initiating Facebook connection: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initiate Facebook connection: {str(e)}"
        )

@router.get("/facebook/callback")
async def facebook_oauth_callback(
    code: str = Query(..., description="Authorization code from Facebook"),
    state: str = Query(..., description="State parameter for CSRF protection"),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Facebook OAuth2 callback
    Exchange code for tokens and store user connection
    """
    try:
        config = get_facebook_oauth_config()
        
        async with FacebookOAuthService(config) as oauth_service:
            # Exchange code for token
            result = await oauth_service.exchange_code_for_token(code, state)
            
            if not result["success"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"OAuth2 exchange failed: {result['error']}"
                )
            
            user_id = result["user_id"]
            access_token = result["access_token"]
            expires_at = result["expires_at"]
            user_info = result["user_info"]
            pages = result["pages"]
            
            # Store connection in database
            # Check if connection already exists
            existing_connection = await db.execute(
                select(UserPlatformConnection)
                .where(
                    UserPlatformConnection.user_id == user_id,
                    UserPlatformConnection.platform == "facebook"
                )
            )
            existing = existing_connection.scalar_one_or_none()
            
            # Prepare platform data
            platform_data = {
                "user_info": {
                    "name": user_info.name,
                    "email": user_info.email,
                    "picture_url": user_info.picture_url
                },
                "pages": [
                    {
                        "page_id": page.page_id,
                        "name": page.name,
                        "access_token": encrypt_token(page.access_token),
                        "category": page.category
                    }
                    for page in pages
                ]
            }
            
            if existing:
                # Update existing connection
                existing.access_token = encrypt_token(access_token)
                existing.token_expires_at = expires_at
                existing.scopes = result["scopes"]
                existing.platform_data = platform_data
                existing.is_active = True
                existing.last_used_at = datetime.utcnow()
                existing.updated_at = datetime.utcnow()
                connection_id = str(existing.id)
            else:
                # Create new connection
                new_connection = UserPlatformConnection.create_facebook_connection(
                    user_id=user_id,
                    platform_user_id=user_info.user_id,
                    platform_username=user_info.name,
                    access_token=encrypt_token(access_token),
                    token_expires_at=expires_at,
                    scopes=result["scopes"],
                    user_info=platform_data["user_info"],
                    pages=platform_data["pages"]
                )
                db.add(new_connection)
                # Flush to get the ID assigned
                await db.flush()
                connection_id = str(new_connection.id)
            
            await db.commit()
            
            # Ensure connection_id is not None
            if not connection_id:
                logger.error("Connection ID is None after commit")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create connection: ID not assigned"
                )
            
            response_data = FacebookConnectionResponse(
                success=True,
                message="Facebook account connected successfully",
                connection_id=connection_id,
                user_info={
                    "name": user_info.name,
                    "email": user_info.email,
                    "picture_url": user_info.picture_url
                },
                pages=[
                    {
                        "page_id": page.page_id,
                        "name": page.name,
                        "category": page.category
                    }
                    for page in pages
                ]
            )
            
            logger.info(f"Facebook connection successful for user {user_id}, connection_id: {connection_id}")
            return response_data
            
    except HTTPException:
        # Re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error in Facebook OAuth callback: {error_msg}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"OAuth callback failed: {error_msg}"
        )

@router.get("/facebook/status")
async def get_facebook_connection_status(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current user's Facebook connection status
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
            return FacebookConnectionStatus(
                connected=False,
                platform="facebook"
            )
        
        # Decrypt and return connection info
        user_info = connection.platform_data.get("user_info", {}) if connection.platform_data else {}
        pages = connection.platform_data.get("pages", []) if connection.platform_data else []
        
        # Remove access tokens from response for security
        safe_pages = [
            {
                "page_id": page["page_id"],
                "name": page["name"],
                "category": page["category"]
            }
            for page in pages
        ]
        
        return FacebookConnectionStatus(
            connected=True,
            platform="facebook",
            user_info=user_info,
            pages=safe_pages,
            last_used=connection.last_used_at
        )
        
    except Exception as e:
        logger.error(f"Error getting Facebook connection status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get connection status: {str(e)}"
        )

@router.post("/facebook/disconnect")
async def disconnect_facebook(
    request: FacebookDisconnectRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Disconnect user's Facebook account
    """
    try:
        # Deactivate Facebook connection
        await db.execute(
            update(UserPlatformConnection)
            .where(
                UserPlatformConnection.user_id == current_user_id,
                UserPlatformConnection.platform == "facebook"
            )
            .values(is_active=False, updated_at=datetime.utcnow())
        )
        await db.commit()
        
        return {
            "success": True,
            "message": "Facebook account disconnected successfully"
        }
        
    except Exception as e:
        logger.error(f"Error disconnecting Facebook: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to disconnect Facebook: {str(e)}"
        )

@router.get("/facebook/pages")
async def get_user_facebook_pages(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's Facebook pages for posting
    """
    try:
        # Get user's Facebook connection and pages
        # Note: This is simplified. In production, use proper SQLAlchemy queries
        connection = None  # Placeholder for database query
        
        if not connection:
            raise HTTPException(
                status_code=404,
                detail="Facebook account not connected"
            )
        
        pages = connection.platform_data.get("pages", [])
        
        # Return pages without access tokens
        safe_pages = [
            {
                "page_id": page["page_id"],
                "name": page["name"],
                "category": page["category"]
            }
            for page in pages
        ]
        
        return {
            "success": True,
            "pages": safe_pages
        }
        
    except Exception as e:
        logger.error(f"Error getting Facebook pages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Facebook pages: {str(e)}"
        )

@router.post("/facebook/refresh-token")
async def refresh_facebook_token(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh user's Facebook access token
    """
    try:
        # Get user's current connection
        connection = None  # Placeholder for database query
        
        if not connection:
            raise HTTPException(
                status_code=404,
                detail="Facebook account not connected"
            )
        
        # Check if token needs refresh
        if connection.token_expires_at and connection.token_expires_at > datetime.utcnow():
            return {
                "success": True,
                "message": "Token is still valid",
                "expires_at": connection.token_expires_at
            }
        
        # Refresh token using Facebook API
        config = get_facebook_oauth_config()
        async with FacebookOAuthService(config) as oauth_service:
            # Note: This would need the refresh token, which Facebook doesn't provide
            # In practice, you'd need to re-authenticate the user
            raise HTTPException(
                status_code=400,
                detail="Token refresh not supported. Please reconnect your Facebook account."
            )
        
    except Exception as e:
        logger.error(f"Error refreshing Facebook token: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh token: {str(e)}"
        )
