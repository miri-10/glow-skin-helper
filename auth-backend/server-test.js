/**
 * Test Server - Skin Cancer Detection Authentication Backend
 * 
 * A simplified version for testing without MongoDB dependency
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('dev'));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'skin-cancer-auth-backend',
    version: '1.0.0',
    database: 'test-mode'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Skin Cancer Detection - Authentication API (Test Mode)',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout'
      },
      scans: {
        create: 'POST /api/scans',
        list: 'GET /api/scans',
        get: 'GET /api/scans/:id'
      },
      reports: {
        create: 'POST /api/reports',
        list: 'GET /api/reports',
        get: 'GET /api/reports/:id'
      },
      users: {
        profile: 'GET /api/users/profile',
        update: 'PUT /api/users/profile'
      }
    },
    note: 'This is a test server without database connectivity'
  });
});

// Mock authentication routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Mock successful registration
  res.status(201).json({
    success: true,
    message: 'User registered successfully (test mode)',
    data: {
      user: {
        id: 'test-user-id-123',
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        createdAt: new Date().toISOString()
      },
      accessToken: 'test-access-token-123',
      refreshToken: 'test-refresh-token-123'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Mock successful login
  res.json({
    success: true,
    message: 'Login successful (test mode)',
    data: {
      user: {
        id: 'test-user-id-123',
        email,
        fullName: 'Test User',
        totalScans: 3,
        totalReports: 2
      },
      accessToken: 'test-access-token-123',
      refreshToken: 'test-refresh-token-123'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: 'test-user-id-123',
        email: 'test@example.com',
        fullName: 'Test User',
        totalScans: 3,
        totalReports: 2
      }
    }
  });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  res.json({
    success: true,
    message: 'Token refreshed successfully (test mode)',
    data: {
      accessToken: 'new-test-access-token-456',
      refreshToken: 'new-test-refresh-token-456'
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful (test mode)'
  });
});

// Mock user routes
app.get('/api/users/dashboard', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: 'test-user-id-123',
        email: 'test@example.com',
        fullName: 'Test User'
      },
      stats: {
        totalScans: 3,
        totalReports: 2,
        highRiskScans: 1,
        pendingFollowUps: 0,
        accountAge: 30,
        lastScanDate: new Date().toISOString()
      },
      recentScans: [
        {
          id: 'scan-1',
          prediction: 'benign',
          confidence: 85,
          riskLevel: 'low',
          createdAt: new Date().toISOString()
        }
      ],
      recentReports: [
        {
          id: 'report-1',
          riskLevel: 'Low',
          urgencyLevel: 'routine',
          generatedAt: new Date().toISOString()
        }
      ]
    }
  });
});

// Mock scans routes
app.get('/api/scans', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  res.json({
    success: true,
    data: {
      scans: [
        {
          id: 'scan-1',
          prediction: 'benign',
          confidence: 85,
          riskLevel: 'low',
          status: 'completed',
          createdAt: new Date().toISOString()
        },
        {
          id: 'scan-2',
          prediction: 'malignant',
          confidence: 92,
          riskLevel: 'high',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 20,
        pages: 1
      }
    }
  });
});

// Mock reports routes
app.get('/api/reports', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  res.json({
    success: true,
    data: {
      reports: [
        {
          id: 'report-1',
          riskLevel: 'Low',
          urgencyLevel: 'routine',
          generatedAt: new Date().toISOString(),
          viewed: true,
          downloaded: false
        },
        {
          id: 'report-2',
          riskLevel: 'High',
          urgencyLevel: 'urgent',
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          viewed: false,
          downloaded: false
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 20,
        pages: 1
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Skin Cancer Auth Backend (Test Mode) running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📋 API Info: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('⚠️  Test mode - No database connectivity required');
});

module.exports = app;