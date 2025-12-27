from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import os

from database import SessionLocal, engine, get_db
from models import Base, User, Image
from schemas import (
    UserCreate, UserLogin, UserResponse, Token, 
    ImageResponse, ImageUploadResponse, ErrorResponse
)
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from utils import validate_image_file, save_image, get_image_url

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Skin Cancer Detection API",
    description="Backend API for Skin Cancer Detection Web App",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (uploaded images)
os.makedirs("uploads/images", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Skin Cancer Detection API", "status": "running"}

@app.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    
    # Find user by email
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/upload-image", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload skin lesion image for authenticated user"""
    
    # Validate file
    validate_image_file(file)
    
    # Save image to disk
    file_path = save_image(file)
    
    # Save image record to database
    db_image = Image(
        user_id=current_user.id,
        file_path=file_path,
        original_filename=file.filename
    )
    
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    # Return response with image URL
    file_url = get_image_url(file_path)
    
    return ImageUploadResponse(
        message="Image uploaded successfully",
        image_id=db_image.id,
        file_url=file_url
    )

@app.get("/user-images", response_model=List[ImageResponse])
async def get_user_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch all uploaded images for the logged-in user"""
    
    images = db.query(Image).filter(Image.user_id == current_user.id).order_by(Image.upload_timestamp.desc()).all()
    
    return images

@app.get("/user-profile", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@app.delete("/delete-image/{image_id}")
async def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an image (user can only delete their own images)"""
    
    # Find image
    db_image = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user.id
    ).first()
    
    if not db_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Delete file from disk
    if os.path.exists(db_image.file_path):
        os.remove(db_image.file_path)
    
    # Delete from database
    db.delete(db_image)
    db.commit()
    
    return {"message": "Image deleted successfully"}

@app.post("/predict/{image_id}")
async def update_prediction(
    image_id: int,
    prediction_result: str,
    confidence_score: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update prediction results for an image (for ML model integration)"""
    
    # Find image
    db_image = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user.id
    ).first()
    
    if not db_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Update prediction results
    db_image.prediction_result = prediction_result
    db_image.confidence_score = confidence_score
    
    db.commit()
    db.refresh(db_image)
    
    return {"message": "Prediction updated successfully", "image": db_image}

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)