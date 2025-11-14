#!/usr/bin/env python3
"""
Accorria - Service Testing Script
Tests Supabase, OpenAI, Gemini, and Google Cloud API connections
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Optional
import httpx
import asyncio

# Colors for terminal output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def print_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.NC}")

def print_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.NC}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.NC}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.NC}")

def load_env_file(filepath: Path) -> Dict[str, str]:
    """Load environment variables from .env file"""
    env_vars = {}
    if filepath.exists():
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip().strip('"').strip("'")
    return env_vars

async def test_openai_api(api_key: str) -> bool:
    """Test OpenAI API connection"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.openai.com/v1/models",
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=10.0
            )
            if response.status_code == 200:
                models = response.json()
                print_success(f"OpenAI API: Connected ({len(models.get('data', []))} models available)")
                return True
            else:
                print_error(f"OpenAI API: Failed (HTTP {response.status_code})")
                return False
    except Exception as e:
        print_error(f"OpenAI API: Error - {str(e)}")
        return False

async def test_gemini_api(api_key: str) -> bool:
    """Test Gemini API connection"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}",
                timeout=10.0
            )
            if response.status_code == 200:
                models = response.json()
                model_count = len(models.get('models', []))
                print_success(f"Gemini API: Connected ({model_count} models available)")
                return True
            else:
                print_error(f"Gemini API: Failed (HTTP {response.status_code})")
                return False
    except Exception as e:
        print_error(f"Gemini API: Error - {str(e)}")
        return False

async def test_supabase_connection(url: str, anon_key: str) -> bool:
    """Test Supabase connection"""
    try:
        async with httpx.AsyncClient() as client:
            # Test health endpoint
            response = await client.get(
                f"{url}/rest/v1/",
                headers={
                    "apikey": anon_key,
                    "Authorization": f"Bearer {anon_key}"
                },
                timeout=10.0
            )
            if response.status_code in [200, 301, 302]:
                print_success(f"Supabase: Connected ({url})")
                return True
            else:
                print_error(f"Supabase: Failed (HTTP {response.status_code})")
                return False
    except Exception as e:
        print_error(f"Supabase: Error - {str(e)}")
        return False

async def test_supabase_storage(url: str, anon_key: str, bucket: str = "car-images") -> bool:
    """Test Supabase Storage bucket access"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{url}/storage/v1/bucket/{bucket}",
                headers={
                    "apikey": anon_key,
                    "Authorization": f"Bearer {anon_key}"
                },
                timeout=10.0
            )
            if response.status_code == 200:
                bucket_info = response.json()
                print_success(f"Supabase Storage: Bucket '{bucket}' exists and is accessible")
                return True
            elif response.status_code == 404:
                print_warning(f"Supabase Storage: Bucket '{bucket}' not found")
                print_info("  Create it in Supabase Dashboard: Storage > New bucket")
                return False
            else:
                print_error(f"Supabase Storage: Failed (HTTP {response.status_code})")
                return False
    except Exception as e:
        print_error(f"Supabase Storage: Error - {str(e)}")
        return False

def check_google_cloud_cli() -> bool:
    """Check if Google Cloud CLI is installed and configured"""
    import subprocess
    try:
        # Check if gcloud is installed
        result = subprocess.run(
            ["gcloud", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.split('\n')[0]
            print_success(f"Google Cloud CLI: {version}")
            
            # Check authentication
            auth_result = subprocess.run(
                ["gcloud", "auth", "list", "--filter=status:ACTIVE", "--format=value(account)"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if auth_result.returncode == 0 and auth_result.stdout.strip():
                account = auth_result.stdout.strip().split('\n')[0]
                print_success(f"Google Cloud: Authenticated as {account}")
                
                # Check project
                project_result = subprocess.run(
                    ["gcloud", "config", "get-value", "project"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if project_result.returncode == 0 and project_result.stdout.strip():
                    project = project_result.stdout.strip()
                    print_success(f"Google Cloud: Project set to {project}")
                    return True
                else:
                    print_warning("Google Cloud: No project set")
                    return False
            else:
                print_warning("Google Cloud: Not authenticated")
                return False
        else:
            print_warning("Google Cloud CLI: Not installed")
            return False
    except FileNotFoundError:
        print_warning("Google Cloud CLI: Not installed")
        return False
    except Exception as e:
        print_error(f"Google Cloud CLI: Error - {str(e)}")
        return False

async def main():
    """Main testing function"""
    print(f"{Colors.BLUE}🚀 Accorria - Service Testing{Colors.NC}")
    print("=" * 50)
    print()
    
    # Load environment variables
    backend_env = Path("backend/.env")
    frontend_env = Path("frontend/.env.local")
    
    backend_vars = load_env_file(backend_env)
    frontend_vars = load_env_file(frontend_env)
    
    results = {
        "openai": False,
        "gemini": False,
        "supabase": False,
        "supabase_storage": False,
        "google_cloud": False
    }
    
    # Test OpenAI
    print(f"{Colors.BLUE}Testing OpenAI API...{Colors.NC}")
    openai_key = backend_vars.get("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if openai_key and not openai_key.startswith("sk-your"):
        results["openai"] = await test_openai_api(openai_key)
    else:
        print_warning("OpenAI API key not configured")
    print()
    
    # Test Gemini
    print(f"{Colors.BLUE}Testing Gemini API...{Colors.NC}")
    gemini_key = backend_vars.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    if gemini_key and not gemini_key.startswith("AIza-your"):
        results["gemini"] = await test_gemini_api(gemini_key)
    else:
        print_warning("Gemini API key not configured")
    print()
    
    # Test Supabase
    print(f"{Colors.BLUE}Testing Supabase...{Colors.NC}")
    supabase_url = backend_vars.get("SUPABASE_URL") or frontend_vars.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = backend_vars.get("SUPABASE_ANON_KEY") or frontend_vars.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if supabase_url and supabase_key:
        results["supabase"] = await test_supabase_connection(supabase_url, supabase_key)
        print()
        results["supabase_storage"] = await test_supabase_storage(supabase_url, supabase_key)
    else:
        print_warning("Supabase URL or key not configured")
    print()
    
    # Test Google Cloud CLI
    print(f"{Colors.BLUE}Testing Google Cloud CLI...{Colors.NC}")
    results["google_cloud"] = check_google_cloud_cli()
    print()
    
    # Summary
    print("=" * 50)
    print(f"{Colors.BLUE}📊 Test Summary{Colors.NC}")
    print("=" * 50)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for service, status in results.items():
        status_icon = f"{Colors.GREEN}✓{Colors.NC}" if status else f"{Colors.RED}✗{Colors.NC}"
        print(f"{status_icon} {service.replace('_', ' ').title()}")
    
    print()
    print(f"Results: {passed}/{total} services configured and working")
    
    if passed == total:
        print_success("All services are configured and working!")
    else:
        print_warning(f"{total - passed} service(s) need configuration")
        print()
        print("Next steps:")
        if not results["openai"]:
            print("  - Configure OPENAI_API_KEY in backend/.env")
        if not results["gemini"]:
            print("  - Configure GEMINI_API_KEY in backend/.env")
        if not results["supabase"]:
            print("  - Configure SUPABASE_URL and SUPABASE_ANON_KEY")
        if not results["supabase_storage"]:
            print("  - Create 'car-images' bucket in Supabase Storage (public)")
        if not results["google_cloud"]:
            print("  - Install and configure Google Cloud CLI")

if __name__ == "__main__":
    asyncio.run(main())

