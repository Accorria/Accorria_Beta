import scrapy
import re
import logging
from urllib.parse import urljoin, urlparse, parse_qs
from accorria_scraper.items import CarListingItem

logger = logging.getLogger(__name__)


class EbayCarsSpider(scrapy.Spider):
    name = 'ebay_cars'
    allowed_domains = ['ebay.com', 'ebaymotors.com']
    
    def __init__(self, search_term=None, max_results=20, *args, **kwargs):
        super(EbayCarsSpider, self).__init__(*args, **kwargs)
        self.search_term = search_term or 'car'
        self.max_results = max_results
        self.results_count = 0
        
        # Build search URL
        self.start_urls = [
            f'https://www.ebay.com/sch/Cars-Trucks/6001/i.html?_nkw={self.search_term.replace(" ", "+")}'
        ]
    
    def parse(self, response):
        """Parse the main search results page"""
        logger.info(f"Parsing eBay search results for: {self.search_term}")
        
        # Extract individual listing links
        listing_links = response.css('.s-item__link::attr(href)').getall()
        
        for link in listing_links:
            if self.results_count >= self.max_results:
                break
                
            # Skip sponsored links and non-car listings
            if 'ebay.com/itm/' in link and 'Cars-Trucks' in link:
                yield response.follow(link, self.parse_listing)
        
        # Follow pagination if needed
        next_page = response.css('.pagination__next::attr(href)').get()
        if next_page and self.results_count < self.max_results:
            yield response.follow(next_page, self.parse)
    
    def parse_listing(self, response):
        """Parse individual car listing page"""
        if self.results_count >= self.max_results:
            return
        
        try:
            item = CarListingItem()
            
            # Basic identification
            item['source'] = 'eBay Motors'
            item['url'] = response.url
            item['listing_id'] = self._extract_listing_id(response.url)
            
            # Title and vehicle details
            item['title'] = self._extract_title(response)
            item['make'], item['model'], item['year'] = self._extract_vehicle_details(item['title'])
            
            # Pricing
            item['price'] = self._extract_price(response)
            
            # Vehicle specifications
            item['mileage'] = self._extract_mileage(response)
            item['condition'] = self._extract_condition(response)
            item['transmission'] = self._extract_transmission(response)
            item['fuel_type'] = self._extract_fuel_type(response)
            item['drivetrain'] = self._extract_drivetrain(response)
            item['body_style'] = self._extract_body_style(response)
            item['engine'] = self._extract_engine(response)
            item['exterior_color'] = self._extract_exterior_color(response)
            item['interior_color'] = self._extract_interior_color(response)
            item['vin'] = self._extract_vin(response)
            
            # Location and seller
            item['location'] = self._extract_location(response)
            item['seller_name'] = self._extract_seller_name(response)
            item['seller_type'] = self._extract_seller_type(response)
            
            # Images
            item['image_urls'] = self._extract_images(response)
            item['primary_image'] = item['image_urls'][0] if item['image_urls'] else ''
            
            # Additional details
            item['description'] = self._extract_description(response)
            item['listing_date'] = self._extract_listing_date(response)
            item['views'] = self._extract_views(response)
            item['watchers'] = self._extract_watchers(response)
            
            # Search metadata
            item['search_term'] = self.search_term
            item['is_direct_listing'] = True
            
            # Validate item has required data
            if item['title'] and item['price'] > 0:
                self.results_count += 1
                logger.info(f"Extracted eBay listing: {item['title']} - ${item['price']}")
                yield item
            else:
                logger.warning(f"Skipping incomplete eBay listing: {response.url}")
                
        except Exception as e:
            logger.error(f"Error parsing eBay listing {response.url}: {e}")
    
    def _extract_listing_id(self, url):
        """Extract listing ID from URL"""
        try:
            # eBay URL format: https://www.ebay.com/itm/123456789
            match = re.search(r'/itm/(\d+)', url)
            return match.group(1) if match else ''
        except:
            return ''
    
    def _extract_title(self, response):
        """Extract listing title"""
        title = response.css('h1#x-title-label-lbl::text').get()
        if not title:
            title = response.css('h1[data-testid="x-title-label"]::text').get()
        if not title:
            title = response.css('h1::text').get()
        return title.strip() if title else ''
    
    def _extract_vehicle_details(self, title):
        """Extract make, model, year from title"""
        make = model = year = ''
        
        if title:
            # Extract year (4 digits)
            year_match = re.search(r'\b(19|20)\d{2}\b', title)
            if year_match:
                year = int(year_match.group())
            
            # Extract make and model (simplified)
            words = title.split()
            if len(words) >= 2:
                make = words[0]
                model = ' '.join(words[1:3])  # Take next 1-2 words as model
        
        return make, model, year
    
    def _extract_price(self, response):
        """Extract price"""
        price_selectors = [
            '.notranslate::text',
            '.u-flL.condText::text',
            '.notranslate[data-testid="x-price-primary"]::text',
            '.u-flL.condText span::text'
        ]
        
        for selector in price_selectors:
            price_text = response.css(selector).get()
            if price_text:
                # Extract numeric price
                price_match = re.search(r'[\d,]+', price_text.replace('$', '').replace(',', ''))
                if price_match:
                    try:
                        return int(price_match.group())
                    except ValueError:
                        continue
        
        return 0
    
    def _extract_mileage(self, response):
        """Extract mileage"""
        mileage_selectors = [
            'text*="miles"',
            'text*="mileage"',
            'text*="odometer"'
        ]
        
        for selector in mileage_selectors:
            mileage_text = response.css(selector).get()
            if mileage_text:
                mileage_match = re.search(r'([\d,]+)', mileage_text)
                if mileage_match:
                    try:
                        return int(mileage_match.group(1).replace(',', ''))
                    except ValueError:
                        continue
        
        return 0
    
    def _extract_condition(self, response):
        """Extract vehicle condition"""
        condition_selectors = [
            '.u-flL.condText::text',
            'text*="condition"',
            'text*="excellent"',
            'text*="good"',
            'text*="fair"'
        ]
        
        for selector in condition_selectors:
            condition_text = response.css(selector).get()
            if condition_text:
                condition = condition_text.lower()
                if 'excellent' in condition or 'mint' in condition:
                    return 'excellent'
                elif 'good' in condition or 'clean' in condition:
                    return 'good'
                elif 'fair' in condition or 'average' in condition:
                    return 'fair'
                elif 'poor' in condition or 'rough' in condition:
                    return 'poor'
        
        return 'unknown'
    
    def _extract_transmission(self, response):
        """Extract transmission type"""
        # Look for transmission in item specifics or description
        transmission_selectors = [
            'text*="transmission"',
            'text*="automatic"',
            'text*="manual"'
        ]
        
        for selector in transmission_selectors:
            text = response.css(selector).get()
            if text:
                if 'automatic' in text.lower():
                    return 'automatic'
                elif 'manual' in text.lower():
                    return 'manual'
        
        return ''
    
    def _extract_fuel_type(self, response):
        """Extract fuel type"""
        fuel_selectors = [
            'text*="fuel"',
            'text*="gas"',
            'text*="diesel"',
            'text*="electric"'
        ]
        
        for selector in fuel_selectors:
            text = response.css(selector).get()
            if text:
                text_lower = text.lower()
                if 'gas' in text_lower or 'gasoline' in text_lower:
                    return 'gasoline'
                elif 'diesel' in text_lower:
                    return 'diesel'
                elif 'electric' in text_lower:
                    return 'electric'
                elif 'hybrid' in text_lower:
                    return 'hybrid'
        
        return ''
    
    def _extract_drivetrain(self, response):
        """Extract drivetrain"""
        drivetrain_selectors = [
            'text*="drivetrain"',
            'text*="fwd"',
            'text*="rwd"',
            'text*="awd"',
            'text*="4wd"'
        ]
        
        for selector in drivetrain_selectors:
            text = response.css(selector).get()
            if text:
                text_lower = text.lower()
                if 'fwd' in text_lower or 'front wheel' in text_lower:
                    return 'FWD'
                elif 'rwd' in text_lower or 'rear wheel' in text_lower:
                    return 'RWD'
                elif 'awd' in text_lower or 'all wheel' in text_lower:
                    return 'AWD'
                elif '4wd' in text_lower or 'four wheel' in text_lower:
                    return '4WD'
        
        return ''
    
    def _extract_body_style(self, response):
        """Extract body style"""
        body_selectors = [
            'text*="sedan"',
            'text*="suv"',
            'text*="truck"',
            'text*="coupe"',
            'text*="convertible"'
        ]
        
        for selector in body_selectors:
            text = response.css(selector).get()
            if text:
                text_lower = text.lower()
                if 'sedan' in text_lower:
                    return 'sedan'
                elif 'suv' in text_lower:
                    return 'SUV'
                elif 'truck' in text_lower:
                    return 'truck'
                elif 'coupe' in text_lower:
                    return 'coupe'
                elif 'convertible' in text_lower:
                    return 'convertible'
        
        return ''
    
    def _extract_engine(self, response):
        """Extract engine information"""
        engine_selectors = [
            'text*="engine"',
            'text*="cyl"',
            'text*="liter"'
        ]
        
        for selector in engine_selectors:
            text = response.css(selector).get()
            if text:
                # Look for engine size patterns
                engine_match = re.search(r'(\d+\.?\d*)\s*(L|liter|cyl)', text, re.IGNORECASE)
                if engine_match:
                    return f"{engine_match.group(1)}L"
        
        return ''
    
    def _extract_exterior_color(self, response):
        """Extract exterior color"""
        color_selectors = [
            'text*="exterior"',
            'text*="color"'
        ]
        
        for selector in color_selectors:
            text = response.css(selector).get()
            if text:
                # Common colors
                colors = ['black', 'white', 'silver', 'gray', 'red', 'blue', 'green', 'brown', 'gold', 'yellow']
                text_lower = text.lower()
                for color in colors:
                    if color in text_lower:
                        return color.title()
        
        return ''
    
    def _extract_interior_color(self, response):
        """Extract interior color"""
        interior_selectors = [
            'text*="interior"',
            'text*="leather"',
            'text*="cloth"'
        ]
        
        for selector in interior_selectors:
            text = response.css(selector).get()
            if text:
                text_lower = text.lower()
                if 'leather' in text_lower:
                    return 'leather'
                elif 'cloth' in text_lower:
                    return 'cloth'
        
        return ''
    
    def _extract_vin(self, response):
        """Extract VIN"""
        vin_selectors = [
            'text*="vin"',
            'text*="VIN"'
        ]
        
        for selector in vin_selectors:
            text = response.css(selector).get()
            if text:
                # Look for VIN pattern (17 characters)
                vin_match = re.search(r'\b[A-HJ-NPR-Z0-9]{17}\b', text)
                if vin_match:
                    return vin_match.group()
        
        return ''
    
    def _extract_location(self, response):
        """Extract location"""
        location_selectors = [
            '.u-flL.condText::text',
            'text*="location"',
            'text*="shipping"'
        ]
        
        for selector in location_selectors:
            text = response.css(selector).get()
            if text:
                # Look for city, state pattern
                location_match = re.search(r'([A-Za-z\s]+,\s*[A-Z]{2})', text)
                if location_match:
                    return location_match.group(1)
        
        return ''
    
    def _extract_seller_name(self, response):
        """Extract seller name"""
        seller_selectors = [
            '.mbg-nw::text',
            '.mbg::text',
            'text*="seller"'
        ]
        
        for selector in seller_selectors:
            seller = response.css(selector).get()
            if seller:
                return seller.strip()
        
        return ''
    
    def _extract_seller_type(self, response):
        """Extract seller type (dealer, private, etc.)"""
        # Look for dealer indicators
        dealer_indicators = [
            'text*="dealer"',
            'text*="dealership"',
            'text*="auto"'
        ]
        
        for selector in dealer_indicators:
            text = response.css(selector).get()
            if text:
                text_lower = text.lower()
                if 'dealer' in text_lower or 'dealership' in text_lower:
                    return 'dealer'
                elif 'private' in text_lower:
                    return 'private'
        
        return 'unknown'
    
    def _extract_images(self, response):
        """Extract image URLs"""
        image_selectors = [
            '.img::attr(src)',
            'img::attr(src)',
            '.img::attr(data-src)'
        ]
        
        images = []
        for selector in image_selectors:
            img_urls = response.css(selector).getall()
            for img_url in img_urls:
                if img_url and 'ebay' in img_url and img_url not in images:
                    images.append(img_url)
        
        return images[:5]  # Limit to 5 images
    
    def _extract_description(self, response):
        """Extract listing description"""
        description_selectors = [
            '.u-flL.condText',
            '.u-flL.condText span',
            '.u-flL.condText div'
        ]
        
        for selector in description_selectors:
            desc = response.css(selector).get()
            if desc:
                return desc.strip()
        
        return ''
    
    def _extract_listing_date(self, response):
        """Extract listing date"""
        date_selectors = [
            'text*="listed"',
            'text*="posted"',
            'text*="date"'
        ]
        
        for selector in date_selectors:
            text = response.css(selector).get()
            if text:
                return text.strip()
        
        return ''
    
    def _extract_views(self, response):
        """Extract view count"""
        views_selectors = [
            'text*="views"',
            'text*="watched"'
        ]
        
        for selector in views_selectors:
            text = response.css(selector).get()
            if text:
                views_match = re.search(r'(\d+)', text)
                if views_match:
                    try:
                        return int(views_match.group(1))
                    except ValueError:
                        continue
        
        return 0
    
    def _extract_watchers(self, response):
        """Extract watcher count"""
        watchers_selectors = [
            'text*="watchers"',
            'text*="watching"'
        ]
        
        for selector in watchers_selectors:
            text = response.css(selector).get()
            if text:
                watchers_match = re.search(r'(\d+)', text)
                if watchers_match:
                    try:
                        return int(watchers_match.group(1))
                    except ValueError:
                        continue
        
        return 0
