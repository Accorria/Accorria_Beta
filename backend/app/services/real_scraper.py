"""
Real Car Scraper - Gets actual live data from marketplaces
"""

import aiohttp
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import re
from bs4 import BeautifulSoup
import json

logger = logging.getLogger(__name__)

class RealCarScraper:
    """
    Real scraper that gets live car data from multiple sources
    """
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers=self.headers)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_ebay_motors(self, search_term: str, max_results: int = 20) -> List[Dict[str, Any]]:
        """
        Scrape real eBay Motors listings
        """
        try:
            if not self.session:
                raise RuntimeError("Session not initialized")
            
            # eBay Motors search URL
            base_url = "https://www.ebay.com/sch/Cars-Trucks/6001/i.html"
            params = {
                '_nkw': search_term,
                '_sop': '12',  # Sort by newly listed
                '_ipg': '50'   # Items per page
            }
            
            async with self.session.get(base_url, params=params) as response:
                if response.status != 200:
                    logger.error(f"eBay request failed: {response.status}")
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                results = []
                items = soup.select('.s-item')
                
                for item in items[:max_results]:
                    try:
                        # Extract data
                        title_elem = item.select_one('.s-item__title')
                        price_elem = item.select_one('.s-item__price')
                        url_elem = item.select_one('.s-item__link')
                        location_elem = item.select_one('.s-item__location')
                        
                        if not all([title_elem, price_elem, url_elem]):
                            continue
                        
                        title = title_elem.get_text(strip=True)
                        price_text = price_elem.get_text(strip=True)
                        url = url_elem.get('href', '')
                        location = location_elem.get_text(strip=True) if location_elem else "Unknown"
                        
                        # Extract price
                        price = self._extract_price(price_text)
                        
                        # Extract car details from title
                        car_info = self._parse_car_title(title)
                        
                        # Extract mileage from description
                        mileage = self._extract_mileage(title)
                        
                        # Calculate deal score
                        deal_score = self._calculate_deal_score(price, car_info, mileage)
                        
                        result = {
                            "id": f"ebay_{len(results)}",
                            "title": title,
                            "make": car_info.get("make", ""),
                            "model": car_info.get("model", ""),
                            "year": car_info.get("year", 0),
                            "price": price,
                            "mileage": mileage,
                            "condition": car_info.get("condition", "unknown"),
                            "location": location,
                            "url": url,
                            "source": "ebay_motors",
                            "deal_score": deal_score,
                            "potential_profit": 0,  # Will be calculated by valuation agent
                            "seller_motivation": "unknown",
                            "urgency_indicators": [],
                            "scraped_at": datetime.now().isoformat()
                        }
                        
                        results.append(result)
                        
                    except Exception as e:
                        logger.error(f"Error parsing eBay item: {e}")
                        continue
                
                logger.info(f"Scraped {len(results)} cars from eBay Motors")
                return results
                
        except Exception as e:
            logger.error(f"eBay scraping error: {e}")
            return []
    
    async def scrape_cargurus(self, search_term: str, max_results: int = 20) -> List[Dict[str, Any]]:
        """
        Scrape CarGurus listings
        """
        try:
            if not self.session:
                raise RuntimeError("Session not initialized")
            
            # CarGurus search URL
            base_url = "https://www.cargurus.com/Cars/searchresults.action"
            params = {
                'search': search_term,
                'sortType': 'NEWEST_FIRST'
            }
            
            async with self.session.get(base_url, params=params) as response:
                if response.status != 200:
                    logger.error(f"CarGurus request failed: {response.status}")
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                results = []
                items = soup.select('[data-cg-ft="car-blade"]')
                
                for item in items[:max_results]:
                    try:
                        # Extract data from CarGurus
                        title_elem = item.select_one('[data-cg-ft="car-blade-title"]')
                        price_elem = item.select_one('[data-cg-ft="car-blade-price"]')
                        mileage_elem = item.select_one('[data-cg-ft="car-blade-mileage"]')
                        
                        if not all([title_elem, price_elem]):
                            continue
                        
                        title = title_elem.get_text(strip=True)
                        price_text = price_elem.get_text(strip=True)
                        mileage_text = mileage_elem.get_text(strip=True) if mileage_elem else ""
                        
                        price = self._extract_price(price_text)
                        mileage = self._extract_mileage(mileage_text)
                        car_info = self._parse_car_title(title)
                        
                        deal_score = self._calculate_deal_score(price, car_info, mileage)
                        
                        result = {
                            "id": f"cargurus_{len(results)}",
                            "title": title,
                            "make": car_info.get("make", ""),
                            "model": car_info.get("model", ""),
                            "year": car_info.get("year", 0),
                            "price": price,
                            "mileage": mileage,
                            "condition": car_info.get("condition", "unknown"),
                            "location": "Unknown",
                            "url": "",
                            "source": "cargurus",
                            "deal_score": deal_score,
                            "potential_profit": 0,
                            "seller_motivation": "unknown",
                            "urgency_indicators": [],
                            "scraped_at": datetime.now().isoformat()
                        }
                        
                        results.append(result)
                        
                    except Exception as e:
                        logger.error(f"Error parsing CarGurus item: {e}")
                        continue
                
                logger.info(f"Scraped {len(results)} cars from CarGurus")
                return results
                
        except Exception as e:
            logger.error(f"CarGurus scraping error: {e}")
            return []
    
    def _extract_price(self, price_text: str) -> int:
        """Extract price from text"""
        try:
            # Remove currency symbols and commas
            price_str = re.sub(r'[^\d]', '', price_text)
            return int(price_str) if price_str else 0
        except:
            return 0
    
    def _extract_mileage(self, text: str) -> int:
        """Extract mileage from text"""
        try:
            # Look for mileage patterns
            mileage_match = re.search(r'(\d{1,3}(?:,\d{3})*)\s*(?:miles?|mi)', text, re.IGNORECASE)
            if mileage_match:
                mileage_str = mileage_match.group(1).replace(',', '')
                return int(mileage_str)
            return 0
        except:
            return 0
    
    def _parse_car_title(self, title: str) -> Dict[str, Any]:
        """Parse car details from title"""
        try:
            # Common patterns
            year_pattern = r'\b(19|20)\d{2}\b'
            make_pattern = r'\b(Honda|Toyota|Ford|Chevrolet|BMW|Mercedes|Audi|Lexus|Nissan|Hyundai|Kia|Mazda|Subaru|Volkswagen)\b'
            
            year_match = re.search(year_pattern, title)
            make_match = re.search(make_pattern, title, re.IGNORECASE)
            
            year = int(year_match.group()) if year_match else 0
            make = make_match.group() if make_match else ""
            
            # Extract model (simplified)
            model = ""
            if make:
                # Remove make and year from title to get model
                model_text = title.replace(str(year), "").replace(make, "").strip()
                model = model_text.split()[0] if model_text else ""
            
            # Determine condition from keywords
            condition = "unknown"
            if any(word in title.lower() for word in ["excellent", "mint", "perfect"]):
                condition = "excellent"
            elif any(word in title.lower() for word in ["good", "clean", "well maintained"]):
                condition = "good"
            elif any(word in title.lower() for word in ["fair", "decent", "ok"]):
                condition = "fair"
            elif any(word in title.lower() for word in ["poor", "rough", "needs work"]):
                condition = "poor"
            
            return {
                "year": year,
                "make": make,
                "model": model,
                "condition": condition
            }
            
        except Exception as e:
            logger.error(f"Error parsing car title: {e}")
            return {"year": 0, "make": "", "model": "", "condition": "unknown"}
    
    def _calculate_deal_score(self, price: int, car_info: Dict[str, Any], mileage: int) -> float:
        """Calculate initial deal score"""
        try:
            score = 0.5  # Base score
            
            # Price factor (lower price = higher score)
            if price > 0:
                # Simple heuristic: lower price relative to year = better deal
                year = car_info.get("year", 0)
                if year > 0:
                    avg_price_per_year = price / (2024 - year)
                    if avg_price_per_year < 1000:
                        score += 0.2
                    elif avg_price_per_year < 2000:
                        score += 0.1
            
            # Mileage factor (lower mileage = higher score)
            if mileage > 0:
                if mileage < 50000:
                    score += 0.2
                elif mileage < 100000:
                    score += 0.1
                elif mileage > 200000:
                    score -= 0.1
            
            # Condition factor
            condition = car_info.get("condition", "unknown")
            condition_scores = {"excellent": 0.2, "good": 0.1, "fair": 0.0, "poor": -0.1}
            score += condition_scores.get(condition, 0.0)
            
            return max(0.0, min(1.0, score))
            
        except:
            return 0.5

# Global instance
real_scraper = RealCarScraper() 