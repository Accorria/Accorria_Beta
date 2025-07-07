from pydantic import BaseModel, Field
from typing import Optional

class Listing(BaseModel):
    """
    Pydantic model for car listing data
    
    Defines the structure and validation for listing information
    """
    title: str = Field(..., min_length=1, max_length=200, description="Title of the listing")
    description: str = Field(..., min_length=10, max_length=2000, description="Detailed description of the car")
    price: float = Field(..., gt=0, description="Price of the car in dollars")
    mileage: int = Field(..., ge=0, description="Mileage of the car")
    
    class Config:
        # Example data for API documentation
        schema_extra = {
            "example": {
                "title": "2018 Honda Civic EX",
                "description": "Excellent condition, one owner, clean title. Great fuel economy and reliable transportation.",
                "price": 18500.0,
                "mileage": 45000
            }
        }

class ListingResponse(BaseModel):
    """
    Response model for listing operations
    """
    message: str
    listing: dict 