/**
 * Environment and Input Validation Utilities
 * 
 * Validates environment variables and request inputs for security
 */

/**
 * Validate required environment variables on startup
 * 
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment() {
  const required = [
    'OPENAI_API_KEY',
    'PORT',
    'NODE_ENV'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate OpenAI API key format
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
    console.warn('⚠️  OpenAI API key format appears invalid. Expected format: sk-...');
  }

  // Validate port
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number (1-65535)');
  }

  // Validate environment
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(process.env.NODE_ENV)) {
    console.warn(`⚠️  NODE_ENV should be one of: ${validEnvs.join(', ')}`);
  }

  console.log('✅ Environment validation passed');
}

/**
 * Sanitize user input to prevent injection attacks
 * 
 * @param {string} input - User input string
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000);   // Limit length
}

/**
 * Validate scan result object structure
 * 
 * @param {Object} scanResult - Scan result object
 * @returns {boolean} - True if valid
 */
function validateScanResult(scanResult) {
  if (!scanResult || typeof scanResult !== 'object') {
    return false;
  }

  const validRisks = ['Low', 'Medium', 'High', 'Uncertain'];
  const validPredictions = ['benign', 'malignant', 'uncertain'];

  // Check risk if provided
  if (scanResult.risk && !validRisks.includes(scanResult.risk)) {
    return false;
  }

  // Check prediction if provided
  if (scanResult.prediction && !validPredictions.includes(scanResult.prediction)) {
    return false;
  }

  // Check confidence format if provided
  if (scanResult.confidence && !/^\d{1,3}%$/.test(scanResult.confidence)) {
    return false;
  }

  return true;
}

/**
 * Check if message is related to allowed topics
 * 
 * @param {string} message - User message
 * @returns {boolean} - True if message appears to be on-topic
 */
function isOnTopic(message) {
  const allowedKeywords = [
    'skin', 'cancer', 'melanoma', 'mole', 'lesion', 'dermatology',
    'ai', 'cnn', 'neural', 'network', 'detection', 'analysis',
    'abcde', 'biopsy', 'dermatologist', 'diagnosis', 'risk',
    'confidence', 'prediction', 'scan', 'result', 'app'
  ];

  const lowerMessage = message.toLowerCase();
  
  return allowedKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
}

/**
 * Rate limiting helper - check if IP should be blocked
 * 
 * @param {string} ip - Client IP address
 * @param {Object} rateLimitStore - In-memory rate limit store
 * @returns {boolean} - True if request should be allowed
 */
function checkRateLimit(ip, rateLimitStore = {}) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  const record = rateLimitStore[ip];
  
  if (now > record.resetTime) {
    // Reset window
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

module.exports = {
  validateEnvironment,
  sanitizeInput,
  validateScanResult,
  isOnTopic,
  checkRateLimit
};