# Skin Cancer Detection - Authentication Backend

A secure Node.js + Express backend providing user authentication and data storage for the Skin Cancer Detection application.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **User Management**: Registration, login, profile management
- **Data Storage**: MongoDB with Mongoose for user data, scans, questionnaires, and reports
- **File Upload**: Secure image upload with validation
- **AI Integration**: Ready for AI model integration and report generation
- **Security**: Password hashing, input validation, rate limiting, CORS protection
- **Medical Compliance**: Proper disclaimers and medical data handling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation

1. **Navigate to the auth-backend directory:**
   ```bash
   cd auth-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/skin_cancer_detection
   JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
   JWT_REFRESH_SECRET=your_super_secure_refresh_token_secret_here
   PORT=5000
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Seed the database** (optional, for development):
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | User logout | Yes |
| GET | `/me` | Get current user profile | Yes |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/change-password` | Change password | Yes |
| GET | `/dashboard` | Get dashboard data | Yes |
| DELETE | `/account` | Deactivate account | Yes |
| GET | `/export` | Export user data (GDPR) | Yes |

### Scan Routes (`/api/scans`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Upload image and create scan | Yes |
| GET | `/` | Get user's scans | Yes |
| GET | `/:id` | Get specific scan | Yes |
| PUT | `/:id` | Update scan metadata | Yes |
| DELETE | `/:id` | Archive scan | Yes |
| GET | `/filter/high-risk` | Get high-risk scans | Yes |

### Report Routes (`/api/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Generate AI report | Yes |
| GET | `/` | Get user's reports | Yes |
| GET | `/:id` | Get specific report | Yes |
| POST | `/:id/download` | Record report download | Yes |
| POST | `/:id/feedback` | Add report feedback | Yes |
| GET | `/filter/high-risk` | Get high-risk reports | Yes |
| GET | `/filter/follow-up` | Get reports needing follow-up | Yes |

## 📊 Data Models

### User Model
- Authentication fields (email, password)
- Profile information (name, date of birth)
- Medical profile (skin type, risk factors)
- Account metadata (status, statistics)

### Scan Model
- Image information (file details, upload metadata)
- AI analysis results (prediction, confidence, explanation)
- Body location and user notes
- Medical context (symptoms, changes)

### Questionnaire Model
- Lesion changes assessment
- Symptoms evaluation
- Sun exposure history
- Medical history
- Demographics
- Risk assessment calculation

### Report Model
- Combined AI analysis and questionnaire assessment
- Risk level determination
- Recommendations and next steps
- Medical disclaimers
- User interactions tracking

## 🔒 Security Features

- **Password Security**: bcrypt hashing with configurable rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **File Upload Security**: Type and size validation
- **Environment Variables**: Secure configuration management

## 🧪 Testing

1. **Install test dependencies:**
   ```bash
   npm install axios  # For API testing
   ```

2. **Start the server** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Run the test script:**
   ```bash
   node test-auth-backend.js
   ```

The test script will verify:
- Health check endpoint
- User registration and login
- Protected route access
- Token refresh functionality
- Dashboard and API endpoints

## 📁 Project Structure

```
auth-backend/
├── models/           # Mongoose data models
│   ├── User.js
│   ├── Scan.js
│   ├── Questionnaire.js
│   └── Report.js
├── routes/           # Express route handlers
│   ├── auth.js
│   ├── users.js
│   ├── scans.js
│   └── reports.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── utils/           # Utility functions
│   └── validation.js
├── scripts/         # Database and utility scripts
│   └── seed.js
├── uploads/         # File upload directory
├── server.js        # Main server file
├── package.json     # Dependencies and scripts
├── .env.example     # Environment variables template
└── README.md        # This file
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets (32+ characters)
3. Configure MongoDB connection string
4. Set up proper CORS origins
5. Configure file upload limits

### Production Considerations
- Use MongoDB Atlas or managed database
- Implement proper logging (Winston, Morgan)
- Set up monitoring and health checks
- Configure reverse proxy (nginx)
- Enable HTTPS/SSL certificates
- Implement backup strategies

## 🔗 Integration with Frontend

The backend is designed to work with the React frontend. Key integration points:

1. **Authentication**: JWT tokens for API access
2. **File Upload**: Multipart form data for image uploads
3. **Real-time Updates**: WebSocket support (future enhancement)
4. **Error Handling**: Consistent error response format

### Frontend Integration Example:
```javascript
// Login request
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Authenticated request
const scans = await fetch('/api/scans', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## 📝 Development Notes

### Sample Login Credentials (after seeding):
- **Email**: `john.doe@example.com`
- **Email**: `jane.smith@example.com`  
- **Email**: `test@example.com`
- **Password**: `Password123`

### Common Commands:
```bash
# Start development server
npm run dev

# Seed database with sample data
npm run seed

# Run tests
npm test

# Start production server
npm start
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add proper error handling and validation
3. Include JSDoc comments for functions
4. Test your changes thoroughly
5. Update documentation as needed

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the server logs for error details
2. Verify environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Test with the provided test script
5. Review the API documentation above

---

**Note**: This backend provides screening support only and does not provide medical diagnosis or treatment recommendations. All medical decisions should be made in consultation with qualified healthcare professionals.