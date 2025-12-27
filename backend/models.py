from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with images
    images = relationship("Image", back_populates="user")

class Image(Base):
    __tablename__ = "images"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    prediction_result = Column(String, nullable=True)  # Store ML prediction results
    confidence_score = Column(String, nullable=True)   # Store confidence scores
    
    # Relationship with user
    user = relationship("User", back_populates="images")