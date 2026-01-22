/**
 * Skin Cancer Detection - ChatGPT Backend Server
 * 
 * This server handles all ChatGPT API interactions for the skin cancer detection app.
 * It provides a secure, rate-limited endpoint for AI chat functionality.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
require('dotenv').config();

const { ChatGPTService } = require('./services/chatgpt-service');
const { validateEnvironment } = require('./utils/validation');
const { errorHandler, notFoundHandler } = require('./middleware/error-handlers');

// Validate environment variables on startup
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize ChatGPT service
const chatGPTService = new ChatGPTService();

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

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting - Prevent abuse of ChatGPT API
const chatRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many chat requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'skin-cancer-chatbot-backend',
    version: '1.0.0'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Skin Cancer Detection - ChatGPT API',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /health'
    },
    documentation: 'See README.md for usage instructions'
  });
});

/**
 * Main ChatGPT endpoint
 * 
 * Accepts user messages and optional scan results, returns AI responses
 * Rate limited and validated for security
 */
app.post('/api/chat',
  chatRateLimit,
  [
    // Input validation
    body('message')
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be a string between 1 and 1000 characters'),
    
    body('scanResult')
      .optional()
      .isObject()
      .withMessage('Scan result must be an object if provided'),
    
    body('scanResult.risk')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Uncertain'])
      .withMessage('Risk must be Low, Medium, High, or Uncertain'),
    
    body('scanResult.confidence')
      .optional()
      .isString()
      .matches(/^\d{1,3}%$/)
      .withMessage('Confidence must be a percentage (e.g., "89%")'),
    
    body('scanResult.prediction')
      .optional()
      .isIn(['benign', 'malignant', 'uncertain'])
      .withMessage('Prediction must be benign, malignant, or uncertain')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid input',
          details: errors.array()
        });
      }

      const { message, scanResult } = req.body;

      // Log request (without sensitive data)
      console.log(`[${new Date().toISOString()}] Chat request:`, {
        messageLength: message.length,
        hasScanResult: !!scanResult,
        clientIP: req.ip
      });

      // Get AI response from ChatGPT service
      const aiResponse = await chatGPTService.getChatResponse(message, scanResult);

      // Log successful response
      console.log(`[${new Date().toISOString()}] Chat response generated successfully`);

      // Return response in required format
      res.json({
        reply: aiResponse,
        timestamp: new Date().toISOString(),
        model: 'gpt-4o-mini'
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Chat error:`, {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          error: 'AI service temporarily unavailable',
          message: 'Please try again later'
        });
      }

      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Please wait before making another request'
        });
      }

      // Generic error response
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to process chat request at this time'
      });
    }
  }
);

/**
 * Screening Report endpoint
 * 
 * Generates comprehensive screening reports combining image analysis and questionnaire data
 */
app.post('/api/screening-report',
  chatRateLimit,
  [
    // Input validation
    body('message')
      .isString()
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Screening prompt must be between 10 and 5000 characters'),
    
    body('imageAnalysis')
      .isObject()
      .withMessage('Image analysis data is required'),
    
    body('imageAnalysis.prediction')
      .isIn(['benign', 'malignant', 'uncertain'])
      .withMessage('Prediction must be benign, malignant, or uncertain'),
    
    body('imageAnalysis.confidence')
      .isNumeric({ min: 0, max: 100 })
      .withMessage('Confidence must be a number between 0 and 100'),
    
    body('questionnaire')
      .isObject()
      .withMessage('Questionnaire data is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid input',
          details: errors.array()
        });
      }

      const { message, imageAnalysis, questionnaire } = req.body;

      // Log request (without sensitive data)
      console.log(`[${new Date().toISOString()}] Screening report request:`, {
        messageLength: message.length,
        prediction: imageAnalysis.prediction,
        confidence: imageAnalysis.confidence,
        clientIP: req.ip
      });

      // Get comprehensive screening report from ChatGPT service
      const aiResponse = await chatGPTService.generateScreeningReport(message, {
        imageAnalysis,
        questionnaire
      });

      // Log successful response
      console.log(`[${new Date().toISOString()}] Screening report generated successfully`);

      // Return response in required format
      res.json({
        reply: aiResponse,
        timestamp: new Date().toISOString(),
        model: 'gpt-4o-mini',
        type: 'screening-report'
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Screening report error:`, {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(503).json({
          error: 'AI service temporarily unavailable',
          message: 'Please try again later'
        });
      }

      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Please wait before making another request'
        });
      }

      // Generic error response
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to process screening report request at this time'
      });
    }
  }
);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Skin Cancer ChatGPT Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Development mode - Make sure to set OPENAI_API_KEY in .env file');
  }
});

module.exports = app;