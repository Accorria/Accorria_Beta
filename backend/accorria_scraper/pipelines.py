# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

import logging
import hashlib
from datetime import datetime
from typing import Dict, Any
from scrapy.exceptions import DropItem

logger = logging.getLogger(__name__)


class ValidationPipeline:
    """Validate scraped items"""
    
    def process_item(self, item, spider):
        """Validate required fields"""
        required_fields = ['title', 'price', 'url', 'source']
        
        for field in required_fields:
            if not item.get(field):
                raise DropItem(f"Missing required field: {field}")
        
        # Validate price is reasonable
        price = item.get('price', 0)
        if price < 100 or price > 1000000:  # $100 to $1M
            raise DropItem(f"Invalid price: {price}")
        
        # Validate year is reasonable
        year = item.get('year', 0)
        current_year = datetime.now().year
        if year < 1900 or year > current_year + 1:
            raise DropItem(f"Invalid year: {year}")
        
        logger.info(f"Item validated: {item['title']} - ${item['price']}")
        return item


class DuplicatesPipeline:
    """Remove duplicate items"""
    
    def __init__(self):
        self.seen_items = set()
    
    def process_item(self, item, spider):
        """Check for duplicates based on URL and title"""
        # Create a unique identifier
        identifier = f"{item['url']}_{item['title']}"
        item_hash = hashlib.md5(identifier.encode()).hexdigest()
        
        if item_hash in self.seen_items:
            raise DropItem(f"Duplicate item found: {item['title']}")
        
        self.seen_items.add(item_hash)
        return item


class CleaningPipeline:
    """Clean and normalize item data"""
    
    def process_item(self, item, spider):
        """Clean and normalize item data"""
        # Clean title
        if item.get('title'):
            item['title'] = item['title'].strip()
        
        # Clean location
        if item.get('location'):
            item['location'] = item['location'].strip()
        
        # Clean seller name
        if item.get('seller_name'):
            item['seller_name'] = item['seller_name'].strip()
        
        # Normalize condition
        if item.get('condition'):
            condition = item['condition'].lower().strip()
            if 'excellent' in condition or 'mint' in condition:
                item['condition'] = 'excellent'
            elif 'good' in condition or 'clean' in condition:
                item['condition'] = 'good'
            elif 'fair' in condition or 'average' in condition:
                item['condition'] = 'fair'
            elif 'poor' in condition or 'rough' in condition:
                item['condition'] = 'poor'
            else:
                item['condition'] = 'unknown'
        
        # Calculate deal score if not present
        if not item.get('deal_score'):
            item['deal_score'] = self._calculate_deal_score(item)
        
        # Set scraped timestamp
        if not item.get('scraped_at'):
            item['scraped_at'] = datetime.now().isoformat()
        
        # Ensure is_direct_listing is set
        if not item.get('is_direct_listing'):
            item['is_direct_listing'] = True
        
        logger.info(f"Item cleaned: {item['title']} - Deal Score: {item['deal_score']}")
        return item
    
    def _calculate_deal_score(self, item: Dict[str, Any]) -> float:
        """Calculate deal score based on price, year, mileage"""
        try:
            score = 0.5  # Base score
            
            price = item.get('price', 0)
            year = item.get('year', 0)
            mileage = item.get('mileage', 0)
            
            if price > 0 and year > 0:
                current_year = datetime.now().year
                age = current_year - year
                if age > 0:
                    price_per_year = price / age
                    if price_per_year < 2000:
                        score += 0.3
                    elif price_per_year < 3000:
                        score += 0.2
                    elif price_per_year < 4000:
                        score += 0.1
            
            if mileage > 0:
                if mileage < 30000:
                    score += 0.3
                elif mileage < 60000:
                    score += 0.2
                elif mileage < 100000:
                    score += 0.1
                elif mileage > 150000:
                    score -= 0.1
            
            # Popular brands get slight boost
            make = item.get('make', '').lower()
            popular_brands = ['toyota', 'honda', 'subaru', 'mazda']
            if make in popular_brands:
                score += 0.05
            
            return max(0.0, min(1.0, score))
            
        except Exception as e:
            logger.error(f"Error calculating deal score: {e}")
            return 0.5


class DatabasePipeline:
    """Save items to database (optional)"""
    
    def __init__(self):
        # Initialize database connection if needed
        pass
    
    def process_item(self, item, spider):
        """Save item to database"""
        # Implement database saving logic here
        # For now, just log the item
        logger.info(f"Item saved to database: {item['title']}")
        return item
    
    def close_spider(self, spider):
        """Close database connection"""
        pass


class JsonExportPipeline:
    """Export items to JSON file"""
    
    def __init__(self):
        self.file = None
        self.items = []
    
    def open_spider(self, spider):
        """Open file when spider starts"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'car_listings_{spider.name}_{timestamp}.json'
        self.file = open(filename, 'w', encoding='utf-8')
        self.file.write('[\n')
    
    def close_spider(self, spider):
        """Close file when spider ends"""
        if self.file:
            # Remove trailing comma from last item
            if self.items:
                self.file.seek(self.file.tell() - 2)  # Go back 2 characters
                self.file.truncate()
            
            self.file.write('\n]')
            self.file.close()
            logger.info(f"Exported {len(self.items)} items to JSON file")
    
    def process_item(self, item, spider):
        """Add item to JSON export"""
        import json
        
        # Convert item to dict
        item_dict = dict(item)
        
        # Add to items list
        self.items.append(item_dict)
        
        # Write to file
        json.dump(item_dict, self.file, indent=2, ensure_ascii=False)
        self.file.write(',\n')
        
        return item
