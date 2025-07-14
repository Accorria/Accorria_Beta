#!/usr/bin/env python3
"""
Test script for the Listening Agent

This script tests the basic functionality of the Listening Agent
to ensure it properly processes uploaded files and form data.
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path
import tempfile
import shutil

# Add the backend directory to the Python path
import sys
sys.path.append('./backend')

from app.agents.listening_agent import ListeningAgent, UploadedFile, FormData


async def test_listening_agent():
    """Test the Listening Agent with sample data"""
    
    print("🚀 Testing Listening Agent...")
    
    # Create a temporary directory for test files
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create some test files
        test_files = []
        
        # Create a dummy image file
        image_path = Path(temp_dir) / "test_car.jpg"
        with open(image_path, 'w') as f:
            f.write("dummy image content")
        
        test_files.append(UploadedFile(
            filename="test_car.jpg",
            content_type="image/jpeg",
            size=1024,
            file_path=str(image_path),
            uploaded_at=datetime.now()
        ))
        
        # Create a dummy PDF file
        pdf_path = Path(temp_dir) / "test_document.pdf"
        with open(pdf_path, 'w') as f:
            f.write("dummy PDF content")
        
        test_files.append(UploadedFile(
            filename="test_document.pdf",
            content_type="application/pdf",
            size=2048,
            file_path=str(pdf_path),
            uploaded_at=datetime.now()
        ))
        
        # Create sample form data
        form_data = FormData(
            title="2018 Honda Civic for Sale",
            description="Great condition, low mileage",
            price=15000.0,
            make="Honda",
            model="Civic",
            year=2018,
            mileage=45000,
            location="Detroit, MI",
            contact_info="555-1234",
            additional_notes="Clean title, no accidents"
        )
        
        # Initialize the Listening Agent
        agent = ListeningAgent(config={
            "upload_directory": temp_dir,
            "max_file_size": 10 * 1024 * 1024,
            "allowed_extensions": [".jpg", ".jpeg", ".png", ".pdf"]
        })
        
        # Prepare input data
        input_data = {
            "files": [file.dict() for file in test_files],
            "form_data": form_data.dict(),
            "user_id": "test_user_123",
            "session_id": "test_session_456"
        }
        
        # Process the data
        print("📁 Processing files and form data...")
        result = await agent.execute(input_data)
        
        # Display results
        print(f"\n✅ Processing completed!")
        print(f"Success: {result.success}")
        print(f"Confidence: {result.confidence}")
        print(f"Processing time: {result.processing_time:.2f} seconds")
        
        if result.success:
            data = result.data
            
            print(f"\n📊 Results:")
            print(f"Files processed: {data['processed_files']}")
            print(f"Images found: {data['extracted_data']['images_count']}")
            print(f"PDFs found: {data['extracted_data']['pdfs_count']}")
            print(f"Next agents: {data['next_agents']}")
            
            print(f"\n⚠️  Validation:")
            validation = data['validation_results']
            if validation['warnings']:
                print("Warnings:")
                for warning in validation['warnings']:
                    print(f"  - {warning}")
            
            if validation['suggestions']:
                print("Suggestions:")
                for suggestion in validation['suggestions']:
                    print(f"  - {suggestion}")
        else:
            print(f"❌ Error: {result.error_message}")
        
        # Test agent capabilities
        print(f"\n🔧 Agent Capabilities:")
        capabilities = agent.get_capabilities()
        for capability in capabilities:
            print(f"  - {capability}")
        
        # Test agent status
        print(f"\n📈 Agent Status:")
        status = agent.get_status()
        print(f"  Name: {status['name']}")
        print(f"  Status: {status['status']}")
        print(f"  Config: {status['config']}")


if __name__ == "__main__":
    asyncio.run(test_listening_agent()) 