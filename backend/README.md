# Skin Cancer Detection Backend API

A secure FastAPI backend system for the Skin Cancer Detection Web App with **REAL AI integration** for melanoma classification.

## 🧠 AI Features

- **Real Deep Learning Model**: TensorFlow-based CNN for skin cancer detection
- **Melanoma Classification**: Distinguishes between benign and malignant lesions
- **Confidence Scoring**: Provides prediction confidence percentages
- **Smart Recommendations**: AI-generated medical recommendations
- **Image Preprocessing**: Automatic image optimization for analysis

## Features

- **AI-Powered Analysis**: Real skin cancer detection using deep learning
- **User Authentication**: Secure signup/login with JWT tokens
- **Password Security**: Bcrypt hashing for password protection
- **Image Upload**: Secure image upload with AI analysis
- **File Storage**: Images stored on server with database references
- **CORS Support**: Ready for frontend integration
- **Input Validation**: Comprehensive error handling and validation

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: TensorFlow installation may take several minutes.

### 2. Setup AI Model

```bash
python setup_ai.py
```

This will:
- Create the AI model directory
- Download/create the skin cancer detection model
- Test the model functionality
- Verify everything is working

### 3. Environment Configuration

Update the `.env` file with your settings:

```env
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./skin_cancer_app.db
```

### 4. Run the Server

```bash
python run.py
```

The API will be available at: `http://localhost:8000`

## 🤖 AI Endpoints

### POST /analyze-image
Analyze skin lesion image using AI model
- **Headers**: `Authorization: Bearer <token>` (optional for demo)
- **Body**: Form data with image file
- **Returns**: AI analysis results with prediction, confidence, and recommendations

```json
{
  "message": "Image analyzed successfully",
  "image_id": 123,
  "file_url": "http://localhost:8000/uploads/images/abc123.jpg",
  "analysis": {
    "prediction": "benign",
    "confidence": 87.3,
    "explanation": "The analyzed lesion shows characteristics commonly associated with benign skin conditions...",
    "recommendations": [
      "Continue regular self-examinations",
      "Monitor for any changes in size, shape, or color",
      "Schedule routine skin check with dermatologist"
    ],
    "raw_predictions": {
      "benign": 0.873,
      "malignant": 0.127
    }
  }
}
```

## API Endpoints

### Authentication

#### POST /signup
Register a new user
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### POST /login
Authenticate user and get access token
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Image Management

#### POST /upload-image
Upload skin lesion image (requires authentication)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Form data with image file

#### GET /user-images
Get all uploaded images for logged-in user
- **Headers**: `Authorization: Bearer <token>`

#### DELETE /delete-image/{image_id}
Delete an image (user can only delete their own images)
- **Headers**: `Authorization: Bearer <token>`

### User Profile

#### GET /user-profile
Get current user profile
- **Headers**: `Authorization: Bearer <token>`

## Security Features

- **Password Hashing**: Bcrypt with salt
- **JWT Authentication**: Secure token-based auth
- **File Validation**: Only image files allowed (JPG, PNG, BMP, TIFF)
- **Size Limits**: Maximum 10MB per image
- **User Isolation**: Users can only access their own data
- **Input Validation**: Pydantic schemas for request validation

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `hashed_password`: Bcrypt hashed password
- `created_at`: Registration timestamp

### Images Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `file_path`: Path to stored image
- `original_filename`: Original uploaded filename
- `upload_timestamp`: Upload time
- `prediction_result`: ML prediction result (optional)
- `confidence_score`: Prediction confidence (optional)

## Frontend Integration

### React/Next.js Example

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:8000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
};

// Upload Image
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/upload-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  return response.json();
};
```

### Streamlit Example

```python
import streamlit as st
import requests

# Login
def login(email, password):
    response = requests.post(
        "http://localhost:8000/login",
        json={"email": email, "password": password}
    )
    return response.json()

# Upload Image
def upload_image(file, token):
    files = {"file": file}
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        "http://localhost:8000/upload-image",
        files=files,
        headers=headers
    )
    return response.json()
```

## Production Deployment

1. **Change SECRET_KEY**: Generate a secure random key
2. **Use PostgreSQL**: Replace SQLite with PostgreSQL for production
3. **Add HTTPS**: Use SSL certificates
4. **Environment Variables**: Use proper environment management
5. **File Storage**: Consider cloud storage (AWS S3, etc.)
6. **Rate Limiting**: Add rate limiting for API endpoints
7. **Logging**: Implement proper logging and monitoring

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Testing

Test the API endpoints using the interactive documentation or tools like Postman/curl.

Example curl commands:

```bash
# Signup
curl -X POST "http://localhost:8000/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Login
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Upload Image (replace TOKEN with actual token)
curl -X POST "http://localhost:8000/upload-image" \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@path/to/image.jpg"
```