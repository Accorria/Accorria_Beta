# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy
from scrapy import Field
from itemloaders.processors import TakeFirst, MapCompose, Join
import re
from datetime import datetime


def clean_price(value):
    """Clean and convert price to integer"""
    if not value:
        return 0
    
    # Remove currency symbols and commas
    cleaned = re.sub(r'[^\d]', '', str(value))
    try:
        return int(cleaned)
    except ValueError:
        return 0


def clean_mileage(value):
    """Clean and convert mileage to integer"""
    if not value:
        return 0
    
    # Remove non-numeric characters except commas
    cleaned = re.sub(r'[^\d,]', '', str(value))
    # Remove commas
    cleaned = cleaned.replace(',', '')
    try:
        return int(cleaned)
    except ValueError:
        return 0


def clean_year(value):
    """Clean and convert year to integer"""
    if not value:
        return 0
    
    # Extract 4-digit year
    year_match = re.search(r'\b(19|20)\d{2}\b', str(value))
    if year_match:
        try:
            return int(year_match.group())
        except ValueError:
            return 0
    return 0


def clean_text(value):
    """Clean text by stripping whitespace and normalizing"""
    if not value:
        return ''
    return str(value).strip()


def clean_url(value):
    """Clean and normalize URLs"""
    if not value:
        return ''
    
    url = str(value).strip()
    if url.startswith('//'):
        url = 'https:' + url
    elif url.startswith('/'):
        # This would need base URL context - handled in spider
        pass
    
    return url


class CarListingItem(scrapy.Item):
    """Item for car listing data"""
    
    # Basic identification
    listing_id = Field(output_processor=TakeFirst())
    source = Field(output_processor=TakeFirst())
    url = Field(input_processor=MapCompose(clean_url), output_processor=TakeFirst())
    
    # Vehicle details
    title = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    make = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    model = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    year = Field(input_processor=MapCompose(clean_year), output_processor=TakeFirst())
    
    # Pricing and condition
    price = Field(input_processor=MapCompose(clean_price), output_processor=TakeFirst())
    mileage = Field(input_processor=MapCompose(clean_mileage), output_processor=TakeFirst())
    condition = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    
    # Location and seller
    location = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    seller_name = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    seller_type = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())  # dealer, private, etc.
    
    # Vehicle specifications
    transmission = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    fuel_type = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    drivetrain = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    body_style = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    engine = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    exterior_color = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    interior_color = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    vin = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    
    # Images and media
    image_urls = Field()
    primary_image = Field(output_processor=TakeFirst())
    
    # Deal analysis
    deal_score = Field(output_processor=TakeFirst())
    potential_profit = Field(output_processor=TakeFirst())
    seller_motivation = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    urgency_indicators = Field()
    
    # Metadata
    scraped_at = Field(output_processor=TakeFirst())
    search_term = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    is_direct_listing = Field(output_processor=TakeFirst())
    
    # Additional fields for specific marketplaces
    listing_date = Field(input_processor=MapCompose(clean_text), output_processor=TakeFirst())
    views = Field(output_processor=TakeFirst())
    watchers = Field(output_processor=TakeFirst())
    description = Field(input_processor=MapCompose(clean_text), output_processor=Join(' '))
    
    def __setitem__(self, key, value):
        """Override to set default values"""
        if key == 'scraped_at' and not value:
            value = datetime.now().isoformat()
        if key == 'is_direct_listing' and not value:
            value = True
        if key == 'deal_score' and not value:
            value = 0.5
        if key == 'potential_profit' and not value:
            value = 0
        if key == 'urgency_indicators' and not value:
            value = []
        if key == 'image_urls' and not value:
            value = []
        
        super().__setitem__(key, value)
