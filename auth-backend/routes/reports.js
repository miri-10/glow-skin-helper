/**
 * Report Routes
 * 
 * Handles AI report generation, retrieval, and management
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Report = require('../models/Report');
const Scan = require('../models/Scan');
const Questionnaire = require('../models/Questionnaire');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { isValidObjectId } = require('../utils/validation');

const router = express.Router();

// Validation rules
const createReportValidation = [
  body('scanId')
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid scan ID');
      }
      return true;
    }),
  
  body('questionnaireId')
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid questionnaire ID');
      }
      return true;
    })
];

const reportIdValidation = [
  param('id')
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid report ID');
      }
      return true;
    })
];

/**
 * Simulate AI report generation using ChatGPT
 * In production, this would call the actual ChatGPT API
 */
async function generateAIReport(scan, questionnaire) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Mock AI analysis based on scan and questionnaire data
  const aiAnalysis = scan.aiAnalysis;
  const riskAssessment = questionnaire.riskAssessment;
  
  // Determine overall risk level
  let riskLevel = 'Low';
  if (aiAnalysis.prediction === 'malignant' || riskAssessment.overallRiskScore > 70) {
    riskLevel = 'High';
  } else if (aiAnalysis.prediction === 'uncertain' || riskAssessment.overallRiskScore > 40) {
    riskLevel = 'Medium';
  }

  // Generate report content (in production, this would be from ChatGPT)
  const reportData = {
    riskLevel,
    
    imageSummary: `AI analysis of the uploaded image shows a ${aiAnalysis.prediction} lesion with ${aiAnalysis.confidence}% confidence. The analysis identified key features consistent with ${aiAnalysis.prediction === 'malignant' ? 'concerning characteristics that warrant immediate medical attention' : 'typical benign skin lesions'}.`,
    
    questionnaireSummary: `Based on your questionnaire responses, ${riskAssessment.riskFactors.length} risk factors were identified, including ${riskAssessment.riskFactors.map(rf => rf.factor).join(', ')}. ${riskAssessment.protectiveFactors.length > 0 ? `Protective factors include: ${riskAssessment.protectiveFactors.join(', ')}.` : ''}`,
    
    combinedAssessment: `Combining the AI image analysis (${aiAnalysis.prediction}, ${aiAnalysis.confidence}% confidence) with your personal risk factors (score: ${riskAssessment.overallRiskScore}/100), the overall assessment indicates ${riskLevel.toLowerCase()} risk. ${questionnaire.hasConcerningSymptoms ? 'The presence of concerning symptoms increases the urgency for medical evaluation.' : ''}`,
    
    recommendation: riskLevel === 'High' 
      ? 'Immediate dermatologist consultation is strongly recommended. Schedule an appointment within 1-2 days.'
      : riskLevel === 'Medium'
      ? 'Schedule a dermatologist appointment within 2-4 weeks for professional evaluation.'
      : 'Continue regular self-examinations and routine dermatological check-ups. Monitor for any changes.',
    
    riskFactors: riskAssessment.riskFactors.map(rf => rf.factor),
    protectiveFactors: riskAssessment.protectiveFactors,
    
    nextSteps: riskLevel === 'High'
      ? ['Contact dermatologist immediately', 'Avoid sun exposure to the area', 'Document any changes with photos']
      : riskLevel === 'Medium'
      ? ['Schedule dermatologist appointment', 'Monitor lesion for changes', 'Use sun protection']
      : ['Continue monthly self-examinations', 'Annual dermatology check-up', 'Maintain sun protection habits'],
    
    urgencyLevel: riskLevel === 'High' ? 'urgent' : riskLevel === 'Medium' ? 'soon' : 'routine'
  };

  return {
    reportData,
    aiGeneration: {
      model: 'gpt-4o-mini',
      promptVersion: '1.0',
      processingTime: 3000,
      tokenUsage: {
        promptTokens: 1200,
        completionTokens: 800,
        totalTokens: 2000
      },
      status: 'completed'
    }
  };
}

/**
 * POST /api/reports
 * Generate a new AI report
 */
router.post('/',
  authenticateToken,
  createReportValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { scanId, questionnaireId } = req.body;

    // Verify scan belongs to user and is completed
    const scan = await Scan.findOne({
      _id: scanId,
      userId: req.user.userId,
      status: 'completed'
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found or not completed'
      });
    }

    // Verify questionnaire belongs to user and scan
    const questionnaire = await Questionnaire.findOne({
      _id: questionnaireId,
      userId: req.user.userId,
      scanId: scanId
    });

    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        message: 'Questionnaire not found'
      });
    }

    // Check if report already exists
    const existingReport = await Report.findOne({
      scanId,
      questionnaireId,
      userId: req.user.userId
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: 'Report already exists for this scan and questionnaire'
      });
    }

    // Create initial report
    const report = new Report({
      userId: req.user.userId,
      scanId,
      questionnaireId,
      reportData: {
        riskLevel: 'Uncertain',
        imageSummary: 'Generating...',
        questionnaireSummary: 'Generating...',
        combinedAssessment: 'Generating...',
        recommendation: 'Generating...',
        riskFactors: [],
        protectiveFactors: [],
        nextSteps: [],
        urgencyLevel: 'routine'
      },
      aiGeneration: {
        status: 'generating'
      }
    });

    await report.save();

    // Update user report count
    const user = await User.findById(req.user.userId);
    await user.incrementReportCount();

    // Generate AI report asynchronously
    generateAIReport(scan, questionnaire)
      .then(async (aiResult) => {
        report.reportData = aiResult.reportData;
        report.aiGeneration = aiResult.aiGeneration;
        await report.save();
      })
      .catch(async (error) => {
        console.error('AI report generation error:', error);
        report.aiGeneration.status = 'failed';
        report.aiGeneration.error = {
          message: error.message,
          code: 'AI_GENERATION_FAILED',
          timestamp: new Date()
        };
        await report.save();
      });

    res.status(201).json({
      success: true,
      message: 'Report generation started',
      data: {
        report: report.getSummary()
      }
    });
  })
);

/**
 * GET /api/reports
 * Get user's reports with optional filtering
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { riskLevel, urgencyLevel, limit = 20, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { userId: req.user.userId };
    
    if (riskLevel) {
      query['reportData.riskLevel'] = riskLevel;
    }
    
    if (urgencyLevel) {
      query['reportData.urgencyLevel'] = urgencyLevel;
    }

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const reports = await Report.find(query, null, options)
      .populate('scanId', 'createdAt bodyLocation')
      .populate('questionnaireId', 'completedAt');

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports: reports.map(report => report.getSummary()),
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
 * GET /api/reports/:id
 * Get specific report details
 */
router.get('/:id',
  authenticateToken,
  reportIdValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.userId
    })
    .populate('scanId')
    .populate('questionnaireId');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Mark as viewed
    await report.markAsViewed(req.ip);

    res.json({
      success: true,
      data: {
        report
      }
    });
  })
);

/**
 * POST /api/reports/:id/download
 * Record report download
 */
router.post('/:id/download',
  authenticateToken,
  reportIdValidation,
  [
    body('format')
      .optional()
      .isIn(['pdf', 'json'])
      .withMessage('Invalid format')
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

    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const format = req.body.format || 'pdf';
    await report.recordDownload(format, req.ip);

    res.json({
      success: true,
      message: 'Download recorded',
      data: {
        report: report.getPublicData(),
        format
      }
    });
  })
);

/**
 * POST /api/reports/:id/feedback
 * Add feedback to a report
 */
router.post('/:id/feedback',
  authenticateToken,
  reportIdValidation,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    
    body('comments')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Comments cannot exceed 1000 characters')
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

    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const { rating, comments } = req.body;
    await report.addFeedback(rating, comments);

    res.json({
      success: true,
      message: 'Feedback added successfully'
    });
  })
);

/**
 * GET /api/reports/filter/high-risk
 * Get user's high-risk reports
 */
router.get('/filter/high-risk',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const reports = await Report.findHighRisk(req.user.userId);

    res.json({
      success: true,
      data: {
        reports: reports.map(report => report.getSummary())
      }
    });
  })
);

/**
 * GET /api/reports/filter/follow-up
 * Get reports needing follow-up
 */
router.get('/filter/follow-up',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const reports = await Report.findNeedingFollowUp(req.user.userId);

    res.json({
      success: true,
      data: {
        reports: reports.map(report => report.getSummary())
      }
    });
  })
);

module.exports = router;