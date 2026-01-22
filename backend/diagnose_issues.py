#!/usr/bin/env python3
"""
Diagnostic script to identify issues with SkinGuard AI system
"""

import os
import sys
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("🔍 Checking Dependencies...")
    
    required_packages = [
        'tensorflow',
        'numpy',
        'pillow',
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'bcrypt',
        'python-jose',
        'passlib',
        'python-multipart'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("💡 Run: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies installed")
    return True

def check_ai_model():
    """Check if AI model loads correctly"""
    print("\n🧠 Checking AI Model...")
    
    try:
        from ai_service import detector
        
        if detector.model is None:
            print("❌ AI model not loaded")
            print("💡 Run: python setup_ai.py")
            return False
        
        print("✅ AI model loaded successfully")
        print(f"   Model: {detector.model_info.get('name', 'Unknown')}")
        print(f"   Architecture: {detector.model_info.get('base_architecture', 'Unknown')}")
        
        # Test prediction
        print("   Testing prediction...")
        import numpy as np
        from PIL import Image
        import io
        
        # Create test image
        test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        pil_image = Image.fromarray(test_image)
        img_bytes = io.BytesIO()
        pil_image.save(img_bytes, format='JPEG')
        img_bytes = img_bytes.getvalue()
        
        # Test prediction
        result = detector.predict(img_bytes)
        
        if 'error' in result:
            print(f"❌ Prediction failed: {result['error']}")
            return False
        
        print(f"✅ Prediction test passed")
        print(f"   Result: {result.get('prediction', 'Unknown')}")
        print(f"   Confidence: {result.get('confidence', 0)}%")
        
        return True
        
    except Exception as e:
        print(f"❌ AI model error: {e}")
        traceback.print_exc()
        return False

def check_database():
    """Check database connection"""
    print("\n🗄️  Checking Database...")
    
    try:
        from database import engine, SessionLocal
        from models import Base, User, Image
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Test connection
        db = SessionLocal()
        
        # Test query
        user_count = db.query(User).count()
        image_count = db.query(Image).count()
        
        db.close()
        
        print("✅ Database connection successful")
        print(f"   Users: {user_count}")
        print(f"   Images: {image_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        traceback.print_exc()
        return False

def check_api_endpoints():
    """Check if API endpoints are working"""
    print("\n🌐 Checking API Endpoints...")
    
    try:
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test root endpoint
        response = client.get("/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
        
        # Test model stats endpoint (if exists)
        try:
            response = client.get("/model-stats")
            if response.status_code == 200:
                print("✅ Model stats endpoint working")
            else:
                print(f"⚠️  Model stats endpoint: {response.status_code}")
        except:
            print("⚠️  Model stats endpoint not available")
        
        return True
        
    except Exception as e:
        print(f"❌ API endpoint error: {e}")
        traceback.print_exc()
        return False

def check_file_structure():
    """Check if all required files exist"""
    print("\n📁 Checking File Structure...")
    
    required_files = [
        'ai_service.py',
        'main.py',
        'database.py',
        'models.py',
        'schemas.py',
        'auth.py',
        'utils.py',
        'requirements.txt',
        '.env'
    ]
    
    missing_files = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} - MISSING")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n❌ Missing files: {', '.join(missing_files)}")
        return False
    
    print("✅ All required files present")
    return True

def check_environment():
    """Check environment variables"""
    print("\n🔧 Checking Environment...")
    
    required_env_vars = [
        'SECRET_KEY',
        'ALGORITHM',
        'ACCESS_TOKEN_EXPIRE_MINUTES'
    ]
    
    missing_vars = []
    
    # Load .env file
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except:
        print("⚠️  python-dotenv not available")
    
    for var in required_env_vars:
        value = os.getenv(var)
        if value:
            print(f"   ✅ {var}")
        else:
            print(f"   ❌ {var} - MISSING")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n❌ Missing environment variables: {', '.join(missing_vars)}")
        print("💡 Check your .env file")
        return False
    
    print("✅ Environment variables configured")
    return True

def run_full_diagnosis():
    """Run complete system diagnosis"""
    print("🏥 SkinGuard AI - System Diagnosis")
    print("=" * 50)
    
    checks = [
        ("Dependencies", check_dependencies),
        ("File Structure", check_file_structure),
        ("Environment", check_environment),
        ("Database", check_database),
        ("AI Model", check_ai_model),
        ("API Endpoints", check_api_endpoints)
    ]
    
    results = {}
    
    for check_name, check_func in checks:
        try:
            results[check_name] = check_func()
        except Exception as e:
            print(f"❌ {check_name} check failed: {e}")
            results[check_name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 DIAGNOSIS SUMMARY")
    print("=" * 50)
    
    passed = sum(results.values())
    total = len(results)
    
    for check_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {check_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 All systems working correctly!")
        print("💡 If you're still having issues, check:")
        print("   - Frontend connection to backend")
        print("   - Network/firewall settings")
        print("   - Browser console for errors")
    else:
        print("⚠️  Issues detected - fix the failed checks above")
        
        # Specific recommendations
        if not results.get("Dependencies", True):
            print("\n🔧 QUICK FIX:")
            print("   pip install -r requirements.txt")
        
        if not results.get("AI Model", True):
            print("\n🔧 QUICK FIX:")
            print("   python setup_ai.py")
        
        if not results.get("Environment", True):
            print("\n🔧 QUICK FIX:")
            print("   Check your .env file has all required variables")

def main():
    """Main diagnostic function"""
    run_full_diagnosis()

if __name__ == "__main__":
    main()