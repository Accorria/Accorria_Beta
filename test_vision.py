#!/usr/bin/env python3
"""
Google Vision API Test Script
Uses Application Default Credentials (ADC) - no JSON key files needed

Prerequisites:
- gcloud CLI authenticated: gcloud auth login
- Project set: gcloud config set project YOUR_PROJECT_ID  
- Vision API enabled: gcloud services enable vision.googleapis.com
- IAM permissions: Vision AI Application Editor role
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
import asyncio

# Add backend to path for imports
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

try:
    from google.cloud import vision
    from google.api_core import exceptions as google_exceptions
    import io
    from PIL import Image
except ImportError as e:
    print(f"❌ Missing required packages: {e}")
    print("Install with: pip install google-cloud-vision Pillow")
    sys.exit(1)


class VisionAPITester:
    """Google Vision API tester using Application Default Credentials"""
    
    def __init__(self):
        """Initialize Vision API client using ADC"""
        try:
            # This uses Application Default Credentials automatically
            self.client = vision.ImageAnnotatorClient()
            print("✅ Vision API client initialized successfully with ADC")
        except Exception as e:
            print(f"❌ Failed to initialize Vision API client: {e}")
            print("Make sure you're authenticated: gcloud auth login")
            raise
    
    def load_image(self, image_path: str) -> bytes:
        """Load image file and return as bytes"""
        try:
            path = Path(image_path)
            if not path.exists():
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            with open(path, 'rb') as image_file:
                content = image_file.read()
            
            print(f"📸 Loaded image: {path.name} ({len(content)} bytes)")
            return content
            
        except Exception as e:
            print(f"❌ Error loading image: {e}")
            raise
    
    def detect_labels(self, image_content: bytes) -> List[Dict[str, Any]]:
        """
        Detect labels in image using Vision API
        
        Args:
            image_content: Image as bytes
            
        Returns:
            List of detected labels with scores
        """
        try:
            # Create Vision API image object
            image = vision.Image(content=image_content)
            
            print("🔍 Sending image to Google Vision API...")
            
            # Perform label detection
            response = self.client.label_detection(image=image)
            
            # Check for API errors
            if response.error.message:
                raise Exception(f'Vision API error: {response.error.message}')
            
            # Process results
            labels = []
            for label in response.label_annotations:
                labels.append({
                    'description': label.description,
                    'score': round(label.score, 4),
                    'confidence': f"{label.score * 100:.1f}%"
                })
            
            print(f"✅ Vision API successful! Found {len(labels)} labels")
            return labels
            
        except google_exceptions.PermissionDenied as e:
            print(f"❌ Permission denied: {e}")
            print("Check your IAM permissions for Vision API")
            raise
        except google_exceptions.NotFound as e:
            print(f"❌ Resource not found: {e}")
            print("Make sure Vision API is enabled: gcloud services enable vision.googleapis.com")
            raise
        except google_exceptions.QuotaExceeded as e:
            print(f"❌ Quota exceeded: {e}")
            print("Check your Vision API quota in Google Cloud Console")
            raise
        except Exception as e:
            print(f"❌ Vision API error: {e}")
            raise
    
    def detect_text(self, image_content: bytes) -> List[str]:
        """Detect text in image using Vision API"""
        try:
            image = vision.Image(content=image_content)
            response = self.client.text_detection(image=image)
            
            if response.error.message:
                raise Exception(f'Vision API error: {response.error.message}')
            
            texts = [text.description for text in response.text_annotations]
            print(f"📝 Found {len(texts)} text elements")
            return texts
            
        except Exception as e:
            print(f"❌ Text detection error: {e}")
            return []
    
    def detect_objects(self, image_content: bytes) -> List[Dict[str, Any]]:
        """Detect objects in image using Vision API"""
        try:
            image = vision.Image(content=image_content)
            response = self.client.object_localization(image=image)
            
            if response.error.message:
                raise Exception(f'Vision API error: {response.error.message}')
            
            objects = []
            for obj in response.localized_object_annotations:
                objects.append({
                    'name': obj.name,
                    'score': round(obj.score, 4),
                    'confidence': f"{obj.score * 100:.1f}%"
                })
            
            print(f"🎯 Found {len(objects)} objects")
            return objects
            
        except Exception as e:
            print(f"❌ Object detection error: {e}")
            return []
    
    def analyze_car_image(self, image_path: str) -> Dict[str, Any]:
        """
        Comprehensive car image analysis
        
        This is the reusable function for your main backend app!
        
        Args:
            image_path: Path to car image
            
        Returns:
            Dictionary with all analysis results
        """
        try:
            print(f"\n🚗 Analyzing car image: {image_path}")
            print("=" * 60)
            
            # Load image
            image_content = self.load_image(image_path)
            
            # Run all analyses
            labels = self.detect_labels(image_content)
            texts = self.detect_text(image_content)
            objects = self.detect_objects(image_content)
            
            # Filter for car-related results
            car_labels = [label for label in labels 
                         if any(keyword in label['description'].lower() 
                               for keyword in ['car', 'vehicle', 'auto', 'truck', 'suv', 'sedan', 'honda', 'toyota', 'ford', 'bmw'])]
            
            result = {
                'success': True,
                'image_path': image_path,
                'all_labels': labels,
                'car_related_labels': car_labels,
                'text_found': texts,
                'objects_found': objects,
                'analysis_summary': {
                    'total_labels': len(labels),
                    'car_labels': len(car_labels),
                    'text_elements': len(texts),
                    'objects': len(objects)
                }
            }
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'image_path': image_path
            }


def print_results(results: Dict[str, Any]):
    """Pretty print analysis results"""
    if not results['success']:
        print(f"❌ Analysis failed: {results['error']}")
        return
    
    print("\n📊 VISION API ANALYSIS RESULTS")
    print("=" * 60)
    
    # Summary
    summary = results['analysis_summary']
    print(f"📈 Summary:")
    print(f"   • Total labels detected: {summary['total_labels']}")
    print(f"   • Car-related labels: {summary['car_labels']}")
    print(f"   • Text elements: {summary['text_elements']}")
    print(f"   • Objects detected: {summary['objects']}")
    
    # Top labels
    print(f"\n🏷️  Top Labels Detected:")
    for i, label in enumerate(results['all_labels'][:10], 1):
        print(f"   {i:2d}. {label['description']:20} ({label['confidence']})")
    
    # Car-specific labels
    if results['car_related_labels']:
        print(f"\n🚗 Car-Related Labels:")
        for i, label in enumerate(results['car_related_labels'][:5], 1):
            print(f"   {i:2d}. {label['description']:20} ({label['confidence']})")
    
    # Objects
    if results['objects_found']:
        print(f"\n🎯 Objects Detected:")
        for i, obj in enumerate(results['objects_found'][:5], 1):
            print(f"   {i:2d}. {obj['name']:20} ({obj['confidence']})")
    
    # Text (first few lines only)
    if results['text_found']:
        print(f"\n📝 Text Found:")
        for i, text in enumerate(results['text_found'][:3], 1):
            preview = text.replace('\n', ' ')[:50]
            print(f"   {i:2d}. {preview}...")


def main():
    """Main test function"""
    print("🧪 Google Vision API Test - Using Application Default Credentials")
    print("=" * 70)
    
    # Initialize tester
    try:
        tester = VisionAPITester()
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        return False
    
    # Test images to try (in order of preference)
    test_images = [
        "../honda_civic_2019.jpg",
        "../test_car.png", 
        "test_car.jpg",
        "honda_civic_2019.jpg"
    ]
    
    # Find available test image
    test_image = None
    for img_path in test_images:
        if Path(img_path).exists():
            test_image = img_path
            break
    
    if not test_image:
        print("❌ No test car images found!")
        print(f"Looked for: {', '.join(test_images)}")
        return False
    
    # Run analysis
    print(f"🎯 Testing with image: {test_image}")
    results = tester.analyze_car_image(test_image)
    
    # Print results
    print_results(results)
    
    # Success check
    if results['success']:
        print(f"\n✅ Google Vision API test completed successfully!")
        print(f"🎉 You're ready to use Vision API in your QuickFlip AI backend!")
        return True
    else:
        print(f"\n❌ Test failed: {results['error']}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 