import os
import uuid
from PIL import Image
from fastapi import HTTPException, UploadFile
from typing import List

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image_file(file: UploadFile) -> bool:
    """Validate uploaded file is an image with allowed extension and size"""
    
    # Check file extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (this is approximate, actual size check happens during read)
    if hasattr(file, 'size') and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    return True

def save_image(file: UploadFile, upload_dir: str = "uploads/images") -> str:
    """Save uploaded image to disk and return file path"""
    
    # Create upload directory if it doesn't exist
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    try:
        # Read and validate image
        contents = file.file.read()
        
        # Check actual file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Validate it's a real image by opening with PIL
        try:
            image = Image.open(file.file)
            image.verify()  # Verify it's a valid image
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid image file"
            )
        
        # Reset file pointer and save
        file.file.seek(0)
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
            
        return file_path
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving file: {str(e)}"
        )
    finally:
        file.file.close()

def delete_image(file_path: str) -> bool:
    """Delete image file from disk"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False

def get_image_url(file_path: str, base_url: str = "http://localhost:8000") -> str:
    """Convert file path to accessible URL"""
    # Convert backslashes to forward slashes for URL
    url_path = file_path.replace("\\", "/")
    return f"{base_url}/{url_path}"