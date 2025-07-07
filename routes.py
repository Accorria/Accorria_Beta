from fastapi import APIRouter, HTTPException
from models import Listing
from ai_brain import create_ai_brain, AIBrainOrchestrator
import os

# Create router instance for organizing endpoints
router = APIRouter()

# Initialize AI Brain (you'll need to set these environment variables)
ai_brain = create_ai_brain(
    openai_key=os.getenv("OPENAI_API_KEY", "your-openai-api-key"),
    google_key=os.getenv("GOOGLE_API_KEY", "your-google-api-key")
)

@router.post("/listings")
async def create_listing(listing: Listing):
    """
    Create a new car listing
    
    Accepts listing data including title, description, price, and mileage
    Returns the listing data as confirmation
    """
    try:
        # In a real app, you'd save this to a database
        # For now, we'll just return the data as confirmation
        
        # Convert the Pydantic model to a dictionary
        listing_data = listing.dict()
        
        # Add a mock ID (in real app, this would come from database)
        listing_data["id"] = "mock-id-123"
        
        return {
            "message": "Listing created successfully",
            "listing": listing_data
        }
        
    except Exception as e:
        # Handle any errors that might occur
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create listing: {str(e)}"
        )

@router.get("/listings")
async def get_listings():
    """
    Get all listings (placeholder for now)
    In a real app, this would fetch from database
    """
    return {
        "message": "Listings endpoint ready",
        "listings": []
    }

# AI Brain Endpoints
@router.post("/ai/think")
async def ai_think(prompt: str, task_type: str = "general", context: dict = None):
    """
    Use the AI brain to generate a response
    
    Args:
        prompt: The question or request
        task_type: Type of task ("analytical", "creative", "conversation", "general")
        context: Additional context for the AI
    """
    try:
        response = await ai_brain.think(prompt, task_type, context)
        return {
            "response": response.content,
            "brain_type": response.brain_type.value,
            "model_used": response.model_used,
            "confidence": response.confidence,
            "cost": response.cost
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI brain error: {str(e)}")

@router.post("/ai/dual-think")
async def ai_dual_think(prompt: str, context: dict = None):
    """
    Get responses from both left and right brains
    Useful for comparing perspectives or important decisions
    """
    try:
        responses = await ai_brain.dual_think(prompt, context)
        
        result = {}
        for brain_name, response in responses.items():
            result[brain_name] = {
                "response": response.content,
                "model_used": response.model_used,
                "confidence": response.confidence,
                "cost": response.cost
            }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI dual think error: {str(e)}")

@router.get("/ai/status")
async def ai_brain_status():
    """
    Check the status of both AI brains
    """
    status = ai_brain.get_brain_status()
    return {
        "left_brain_available": status["left_brain_available"],
        "right_brain_available": status["right_brain_available"],
        "message": "Check if your API keys are configured correctly"
    }

@router.post("/ai/generate-reply")
async def generate_reply(message: str, listing_context: dict = None):
    """
    Generate a reply to a buyer message using the appropriate brain
    
    This demonstrates how QuickFlip AI would respond to buyer inquiries
    """
    try:
        # Use right brain for customer communication (more friendly/empathetic)
        response = await ai_brain.think(
            prompt=f"Generate a helpful reply to this buyer message: {message}",
            task_type="customer_service",
            context=listing_context
        )
        
        return {
            "reply": response.content,
            "brain_used": response.brain_type.value,
            "confidence": response.confidence,
            "suggested_delay_minutes": 5  # Human-like delay
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reply generation error: {str(e)}")

@router.post("/ai/analyze-listing")
async def analyze_listing(listing: Listing):
    """
    Analyze a listing using the left brain (analytical)
    
    This demonstrates how QuickFlip AI would analyze pricing and market data
    """
    try:
        # Use left brain for analytical tasks
        analysis_prompt = f"""
        Analyze this car listing for market competitiveness:
        Title: {listing.title}
        Description: {listing.description}
        Price: ${listing.price}
        Mileage: {listing.mileage}
        
        Provide insights on:
        1. Price competitiveness
        2. Key selling points
        3. Potential buyer concerns
        4. Suggested improvements
        """
        
        response = await ai_brain.think(
            prompt=analysis_prompt,
            task_type="analytical",
            context={"listing_data": listing.dict()}
        )
        
        return {
            "analysis": response.content,
            "brain_used": response.brain_type.value,
            "confidence": response.confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Listing analysis error: {str(e)}") 