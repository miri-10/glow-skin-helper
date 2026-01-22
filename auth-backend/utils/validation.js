/**
 * Validation Utilities
 * 
 * Environment validation and other utility functions
 */

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    console.error('❌ JWT_REFRESH_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

/**
 * Validate file upload
 */
function validateFileUpload(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    throw new Error('No file provided');
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB');
  }

  return true;
}

/**
 * Sanitize filename for safe storage
 */
function sanitizeFilename(filename) {
  // Remove path traversal attempts and special characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.+/g, '.')
    .substring(0, 255);
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName) {
  const { v4: uuidv4 } = require('uuid');
  const path = require('path');
  
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const sanitizedName = sanitizeFilename(name);
  
  return `${sanitizedName}_${uuidv4()}${ext}`;
}

/**
 * Validate MongoDB ObjectId
 */
function isValidObjectId(id) {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const minLength = 8;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }

  // Optional: require special characters for stronger security
  if (process.env.REQUIRE_SPECIAL_CHARS === 'true' && !hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize user input to prevent XSS
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}

/**
 * Rate limiting key generator
 */
function generateRateLimitKey(req) {
  // Use IP address and user ID (if authenticated) for rate limiting
  const ip = req.ip || req.connection.remoteAddress;
  const userId = req.user?.userId || 'anonymous';
  return `${ip}:${userId}`;
}

module.exports = {
  validateEnvironment,
  validateFileUpload,
  sanitizeFilename,
  generateUniqueFilename,
  isValidObjectId,
  isValidEmail,
  validatePasswordStrength,
  sanitizeInput,
  generateRateLimitKey
};