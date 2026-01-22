#!/usr/bin/env python3
"""
Simple connection test for SkinGuard backend
"""

import requests
import json
import os
from PIL import Image
import io
import numpy as np

def test_backend_connection():
    """Test if backend is running and responding"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 Testing Backend Connection...")
    print("=" * 40)
    
    # Test 1: Root endpoint
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            data = response.json()
            print(f"   Message: {data.get('message', 'Unknown')}")
        else:
            print(f"❌ Backend responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend")
        print("💡 Make sure backend is running: python run.py")
        return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
    
    # Test 2: Model stats (if available)
    try:
        response = requests.get(f"{base_url}/model-stats", timeout=10)
        if response.status_code == 200:
            print("✅ Model stats endpoint working")
            data = response.json()
            if data.get('model_loaded'):
                print(f"   Model: {data.get('model_info', {}).get('name', 'Unknown')}")
                print(f"   Parameters: {data.get('total_parameters', 0):,}")
            else:
                print("   ⚠️  Model not loaded")
        else:
            print(f"⚠️  Model stats endpoint: {response.status_code}")
    except:
        print("⚠️  Model stats endpoint not available")
    
    # Test 3: Image analysis (without auth)
    print("\n🧪 Testing Image Analysis...")
    
    # Create test image
    test_image = np.random.randint(100, 200, (224, 224, 3), dtype=np.uint8)
    # Make it look more skin-like
    test_image[:, :, 0] = np.random.randint(150, 200)  # More red
    test_image[:, :, 1] = np.random.randint(120, 170)  # Some green
    test_image[:, :, 2] = np.random.randint(80, 130)   # Less blue
    
    pil_image = Image.fromarray(test_image)
    img_bytes = io.BytesIO()
    pil_image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    try:
        files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
        response = requests.post(f"{base_url}/analyze-image", files=files, timeout=15)
        
        if response.status_code == 200:
            print("✅ Image analysis working")
            data = response.json()
            analysis = data.get('analysis', {})
            print(f"   Prediction: {analysis.get('prediction', 'Unknown')}")
            print(f"   Confidence: {analysis.get('confidence', 0)}%")
        elif response.status_code == 401:
            print("⚠️  Image analysis requires authentication")
            print("   This is normal - the endpoint is protected")
        else:
            print(f"❌ Image analysis failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Raw response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Image analysis error: {e}")
    
    print("\n" + "=" * 40)
    print("✅ Backend connection test completed")
    return True

def main():
    """Main test function"""
    print("🏥 SkinGuard Backend Connection Test")
    test_backend_connection()

if __name__ == "__main__":
    main()