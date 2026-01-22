/**
 * Scan Routes
 * 
 * Handles image upload, AI analysis, and scan management
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, param, validationResult } = require('express-validator');
const Scan = require('../models/Scan');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { validateFileUpload, generateUniqueFilename, isValidObjectId } = require('../utils/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    try {
      validateFileUpload(file);
      cb(null, true);
    } catch (error) {
      cb(new AppError(error.message, 400, 'INVALID_FILE'));
    }
  }
});

// Validation rules
const createScanValidation = [
  body('scanType')
    .optional()
    .isIn(['self_examination', 'follow_up', 'routine_check', 'concern_based'])
    .withMessage('Invalid scan type'),
  
  body('bodyLocation.area')
    .optional()
    .isIn(['face', 'scalp', 'neck', 'chest', 'back', 'arms', 'hands', 'abdomen', 'legs', 'feet', 'other'])
    .withMessage('Invalid body area'),
  
  body('bodyLocation.side')
    .optional()
    .isIn(['left', 'right', 'center', 'bilateral'])
    .withMessage('Invalid body side'),
  
  body('userNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('User notes cannot exceed 1000 characters'),
  
  body('medicalContext.hasChanged')
    .optional()
    .isBoolean()
    .withMessage('hasChanged must be a boolean'),
  
  body('medicalContext.symptoms')
    .optional()
    .isArray()
    .withMessage('Symptoms must be an array'),
  
  body('medicalContext.symptoms.*')
    .optional()
    .isIn(['itching', 'bleeding', 'pain', 'crusting', 'growing', 'color_change'])
    .withMessage('Invalid symptom')
];

const scanIdValidation = [
  param('id')
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid scan ID');
      }
      return true;
    })
];

/**
 * POST /api/scans
 * Create a new scan with image upload
 */
router.post('/', 
  authenticateToken,
  upload.single('image'),
  createScanValidation,
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Create scan object
    const scanData = {
      userId: req.user.userId,
      image: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      scanType: req.body.scanType || 'self_examination',
      bodyLocation: req.body.bodyLocation || {},
      userNotes: req.body.userNotes,
      medicalContext: req.body.medicalContext || {},
      status: 'processing'
    };

    const scan = new Scan(scanData);
    await scan.save();

    // Update user scan count
    const user = await User.findById(req.user.userId);
    await user.incrementScanCount();

    // TODO: Trigger AI analysis here
    // For now, we'll simulate AI analysis
    setTimeout(async () => {
      try {
        // Simulate AI processing
        const mockAiAnalysis = {
          prediction: Math.random() > 0.7 ? 'malignant' : 'benign',
          confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
          explanation: 'AI analysis completed. This is a simulated result for development purposes.',
          recommendations: ['Consult with a dermatologist for professional evaluation'],
          rawPredictions: {
            benign: Math.random(),
            malignant: Math.random()
          },
          modelInfo: {
            name: 'SkinCancerCNN',
            version: '1.0.0',
            architecture: 'ResNet50',
            trainedOn: 'ISIC 2019 Dataset'
          },
          processingTime: Math.floor(Math.random() * 5000) + 1000 // 1-6 seconds
        };

        scan.aiAnalysis = mockAiAnalysis;
        scan.status = 'completed';
        await scan.save();
      } catch (error) {
        console.error('AI analysis simulation error:', error);
        scan.status = 'failed';
        await scan.save();
      }
    }, 2000); // 2 second delay to simulate processing

    res.status(201).json({
      success: true,
      message: 'Scan created successfully',
      data: {
        scan: scan.getSummary()
      }
    });
  })
);

/**
 * GET /api/scans
 * Get user's scans with optional filtering
 */
router.get('/', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { status, limit = 20, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { userId: req.user.userId };
    
    if (status) {
      query.status = status;
    }

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const scans = await Scan.find(query, null, options);
    const total = await Scan.countDocuments(query);

    res.json({
      success: true,
      data: {
        scans: scans.map(scan => scan.getSummary()),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  })
);

/**
 * GET /api/scans/:id
 * Get specific scan details
 */
router.get('/:id',
  authenticateToken,
  scanIdValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    res.json({
      success: true,
      data: {
        scan
      }
    });
  })
);

/**
 * PUT /api/scans/:id
 * Update scan metadata (not the image)
 */
router.put('/:id',
  authenticateToken,
  scanIdValidation,
  [
    body('userNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('User notes cannot exceed 1000 characters'),
    
    body('bodyLocation.area')
      .optional()
      .isIn(['face', 'scalp', 'neck', 'chest', 'back', 'arms', 'hands', 'abdomen', 'legs', 'feet', 'other'])
      .withMessage('Invalid body area'),
    
    body('medicalContext.hasChanged')
      .optional()
      .isBoolean()
      .withMessage('hasChanged must be a boolean')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['userNotes', 'bodyLocation', 'medicalContext'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        scan[field] = req.body[field];
      }
    });

    await scan.save();

    res.json({
      success: true,
      message: 'Scan updated successfully',
      data: {
        scan
      }
    });
  })
);

/**
 * DELETE /api/scans/:id
 * Delete a scan (archive it)
 */
router.delete('/:id',
  authenticateToken,
  scanIdValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    // Archive instead of delete
    await scan.archive();

    res.json({
      success: true,
      message: 'Scan archived successfully'
    });
  })
);

/**
 * GET /api/scans/high-risk
 * Get user's high-risk scans
 */
router.get('/filter/high-risk',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const scans = await Scan.findHighRisk(req.user.userId);

    res.json({
      success: true,
      data: {
        scans: scans.map(scan => scan.getSummary())
      }
    });
  })
);

module.exports = router;