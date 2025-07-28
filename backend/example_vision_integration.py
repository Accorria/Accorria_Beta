"""
Example: How to integrate Google Vision API into your existing QuickFlip AI endpoints

This shows how to use the VisionAnalyzer service in your car analysis endpoints.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.services.vision_analyzer import analyze_car_image_bytes

# Example integration into your existing car analysis endpoint
router = APIRouter()

@router.post("/car-analysis/analyze-images-with-vision")
async def analyze_car_images_with_vision(
    images: List[UploadFile] = File(..., description="Up to 10 car images")
):
    """
    Enhanced car image analysis using Google Vision API
    
    This endpoint combines your existing market intelligence with
    Google Vision API image analysis for comprehensive results.
    """
    try:
        if len(images) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 images allowed")
        
        analysis_results = []
        
        for i, image in enumerate(images):
            # Read image data
            image_data = await image.read()
            
            # Analyze with Vision API
            vision_result = await analyze_car_image_bytes(
                image_data, 
                f"{image.filename or f'image_{i+1}'}"
            )
            
            # Add to results
            analysis_results.append({
                'image_name': image.filename,
                'vision_analysis': vision_result,
                'file_size': len(image_data)
            })
        
        # Combine results for overall assessment
        combined_assessment = combine_vision_results(analysis_results)
        
        return {
            'success': True,
            'total_images': len(images),
            'individual_analyses': analysis_results,
            'combined_assessment': combined_assessment,
            'recommendations': generate_recommendations(combined_assessment)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")


def combine_vision_results(analyses: List[dict]) -> dict:
    """Combine multiple image analyses into overall assessment"""
    
    # Extract key information from all analyses
    all_car_types = []
    all_conditions = []
    all_text_info = {
        'vin_candidates': [],
        'mileage_candidates': [],
        'year_candidates': [],
        'price_candidates': []
    }
    
    for analysis in analyses:
        vision_data = analysis['vision_analysis']
        if vision_data['success']:
            # Collect car types
            primary_type = vision_data['make_model_detected']['primary_type']
            if primary_type != 'Unknown':
                all_car_types.append(primary_type)
            
            # Collect conditions
            condition = vision_data['condition_assessment']['overall_condition']
            if condition != 'unknown':
                all_conditions.append(condition)
            
            # Collect text information
            text_data = vision_data['text_extracted']
            for key in all_text_info.keys():
                all_text_info[key].extend(text_data.get(key, []))
    
    # Determine most likely car type
    most_common_type = max(set(all_car_types), key=all_car_types.count) if all_car_types else 'Unknown'
    
    # Determine overall condition (worst case)
    condition_priority = {'poor': 0, 'unknown': 1, 'good': 2, 'classic': 3, 'excellent': 4}
    overall_condition = min(all_conditions, key=lambda x: condition_priority.get(x, 1)) if all_conditions else 'unknown'
    
    # Extract most likely VIN, mileage, etc.
    likely_vin = all_text_info['vin_candidates'][0] if all_text_info['vin_candidates'] else None
    likely_year = max(set(all_text_info['year_candidates']), key=all_text_info['year_candidates'].count) if all_text_info['year_candidates'] else None
    
    return {
        'vehicle_type': most_common_type,
        'overall_condition': overall_condition,
        'likely_vin': likely_vin,
        'likely_year': likely_year,
        'total_images_analyzed': len([a for a in analyses if a['vision_analysis']['success']]),
        'analysis_confidence': calculate_combined_confidence(analyses)
    }


def calculate_combined_confidence(analyses: List[dict]) -> float:
    """Calculate overall confidence from multiple analyses"""
    confidences = [
        a['vision_analysis']['confidence_scores']['overall'] 
        for a in analyses 
        if a['vision_analysis']['success']
    ]
    return sum(confidences) / len(confidences) if confidences else 0.0


def generate_recommendations(assessment: dict) -> List[str]:
    """Generate recommendations based on vision analysis"""
    recommendations = []
    
    if assessment['analysis_confidence'] > 0.7:
        recommendations.append("High-quality image analysis - proceed with confidence")
    elif assessment['analysis_confidence'] > 0.4:
        recommendations.append("Moderate image quality - consider additional photos")
    else:
        recommendations.append("Low image quality - retake photos for better analysis")
    
    if assessment['overall_condition'] == 'poor':
        recommendations.append("⚠️ Potential damage detected - inspect carefully before purchase")
    elif assessment['overall_condition'] == 'excellent':
        recommendations.append("✅ Vehicle appears to be in excellent condition")
    
    if assessment['likely_vin']:
        recommendations.append(f"VIN detected: {assessment['likely_vin']} - verify with seller")
    
    if assessment['likely_year']:
        recommendations.append(f"Year detected: {assessment['likely_year']} - confirm vehicle details")
    
    return recommendations


# Example usage in your existing image analysis agent
async def enhanced_image_analysis_example():
    """
    Example of how to integrate Vision API into your existing 
    ImageAnalysisAgent service
    """
    from app.services.vision_analyzer import VisionAnalyzer
    
    # Initialize Vision analyzer
    vision_analyzer = VisionAnalyzer()
    
    # Example: Enhance your existing car processing
    async def process_car_with_vision(car_images: List[bytes]):
        """Enhanced car processing with Vision API"""
        
        vision_results = []
        for i, image_data in enumerate(car_images):
            result = await vision_analyzer.analyze_car_image(image_data, f"car_image_{i}")
            vision_results.append(result)
        
        # Your existing processing logic here...
        # + Vision API insights
        
        return {
            'vision_analysis': vision_results,
            'enhanced_insights': combine_vision_results([{'vision_analysis': r} for r in vision_results]),
            # ... your existing results
        }
    
    return process_car_with_vision


"""
INTEGRATION CHECKLIST:

✅ 1. Google Vision API working with ADC
✅ 2. VisionAnalyzer service created in app/services/
✅ 3. Production-ready error handling
✅ 4. Car-specific analysis (make/model, condition, text extraction)
✅ 5. Easy integration with existing FastAPI endpoints

NEXT STEPS:
1. Import VisionAnalyzer in your existing car analysis endpoints
2. Add vision analysis to your image upload workflows
3. Combine Vision API results with your market intelligence
4. Test with real car images from users

EXAMPLE USAGE:
    from app.services.vision_analyzer import analyze_car_image_bytes
    
    # In your FastAPI endpoint:
    image_data = await file.read()
    vision_result = await analyze_car_image_bytes(image_data, file.filename)
    
    if vision_result['success']:
        car_type = vision_result['make_model_detected']['primary_type']
        condition = vision_result['condition_assessment']['overall_condition']
        # Use this data in your market analysis...
""" 