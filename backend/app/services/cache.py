"""
Simple in-memory cache for market intelligence queries.

Reduces duplicate API calls by caching results based on normalized query keys.
Can be replaced with Redis later for production scaling.
"""

import time
import json
from typing import Any, Dict, Tuple, Optional

# In-memory cache: key -> (timestamp, value)
_CACHE: Dict[str, Tuple[float, Any]] = {}


def cache_get(key: str, ttl_sec: int = 900) -> Optional[Any]:
    """
    Get cached value if it exists and hasn't expired.
    
    Args:
        key: Cache key
        ttl_sec: Time-to-live in seconds (default: 15 minutes)
        
    Returns:
        Cached value or None if not found/expired
    """
    item = _CACHE.get(key)
    if not item:
        return None
    
    timestamp, value = item
    if time.time() - timestamp > ttl_sec:
        # Expired - remove it
        _CACHE.pop(key, None)
        return None
    
    return value


def cache_set(key: str, value: Any) -> None:
    """
    Set a cached value.
    
    Args:
        key: Cache key
        value: Value to cache
    """
    _CACHE[key] = (time.time(), value)


def cache_clear(key: Optional[str] = None) -> None:
    """
    Clear cache entry or all cache.
    
    Args:
        key: Specific key to clear, or None to clear all
    """
    if key:
        _CACHE.pop(key, None)
    else:
        _CACHE.clear()


def cache_size() -> int:
    """Get current cache size."""
    return len(_CACHE)


def _normalize_key(payload: Dict[str, Any]) -> str:
    """
    Create a stable cache key from a payload dict.
    
    Args:
        payload: Dictionary with make, model, year, mileage, location, etc.
        
    Returns:
        Normalized cache key string
    """
    # Sort keys for consistent hashing
    # Exclude price and other fields that shouldn't affect cache hit
    normalized = {
        "make": payload.get("make", "").lower().strip(),
        "model": payload.get("model", "").lower().strip(),
        "year": payload.get("year"),
        "mileage": payload.get("mileage"),
        "location": payload.get("location", "").lower().strip(),
        "analysis_type": payload.get("analysis_type", "comprehensive"),
    }
    
    # Create hash-like key
    key_str = json.dumps(normalized, sort_keys=True, separators=(',', ':'))
    return f"mi:{hash(key_str)}"

