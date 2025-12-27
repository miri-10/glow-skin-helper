from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ImageResponse(BaseModel):
    id: int
    file_path: str
    original_filename: str
    upload_timestamp: datetime
    prediction_result: Optional[str] = None
    confidence_score: Optional[str] = None
    
    class Config:
        from_attributes = True

class ImageUploadResponse(BaseModel):
    message: str
    image_id: int
    file_url: str

class ErrorResponse(BaseModel):
    detail: str