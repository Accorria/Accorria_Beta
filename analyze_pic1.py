#!/usr/bin/env python3
"""
Simple script to analyze pic1.jpg using OpenAI Vision API
"""

import base64
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/Users/prestoneaton/QuickFlip_MVP/Accorria/backend/.env')

def analyze_image(image_path):
    """Analyze an image using OpenAI Vision API"""
    
    # Initialize OpenAI client
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OpenAI API key not found")
        return
    
    client = openai.OpenAI(api_key=api_key)
    
    # Read and encode image
    with open(image_path, "rb") as image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
    
    print(f"📸 Analyzing image: {image_path}")
    print(f"📊 Image size: {os.path.getsize(image_path) / 1024 / 1024:.1f} MB")
    
    try:
        # Call OpenAI Vision API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this car image and tell me:\n1. Make and model\n2. Year (if visible)\n3. Color\n4. Condition\n5. Any notable features\n6. Mileage if visible on odometer\n7. Overall assessment"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        analysis = response.choices[0].message.content
        print("\n🤖 AI Analysis Results:")
        print("=" * 50)
        print(analysis)
        print("=" * 50)
        
        # Show usage info
        if hasattr(response, 'usage'):
            print(f"\n📈 API Usage:")
            print(f"   Input tokens: {response.usage.prompt_tokens}")
            print(f"   Output tokens: {response.usage.completion_tokens}")
            print(f"   Total tokens: {response.usage.total_tokens}")
        
    except Exception as e:
        print(f"❌ Error analyzing image: {e}")

if __name__ == "__main__":
    image_path = "/Users/prestoneaton/QuickFlip_MVP/Accorria/frontend/public/pic2.jpg"
    analyze_image(image_path)
