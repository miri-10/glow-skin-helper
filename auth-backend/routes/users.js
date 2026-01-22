/**
 * User Routes
 * 
 * Handles user profile management and account operations
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Scan = require('../models/Scan');
const Report = require('../models/Report');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom(value => {
      const date = new Date(value);
      const thirteenYearsAgo = new Date();
      thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
      
      if (date > thirteenYearsAgo || date > new Date()) {
        throw new Error('Date of birth must be valid and user must be at least 13 years old');
      }
      return true;
    }),
  
  body('medicalProfile.skinType')
    .optional()
    .isIn(['very_fair', 'fair', 'medium', 'olive', 'brown', 'dark'])
    .withMessage('Invalid skin type'),
  
  body('medicalProfile.personalHistory')
    .optional()
    .isBoolean()
    .withMessage('Personal history must be a boolean'),
  
  body('medicalProfile.familyHistory')
    .optional()
    .isBoolean()
    .withMessage('Family history must be a boolean'),
  
  body('medicalProfile.riskFactors')
    .optional()
    .isArray()
    .withMessage('Risk factors must be an array'),
  
  body('medicalProfile.riskFactors.*')
    .optional()
    .isIn([
      'frequent_sun_exposure',
      'history_of_sunburns',
      'fair_skin',
      'many_moles',
      'atypical_moles',
      'immunosuppression',
      'previous_skin_cancer'
    ])
    .withMessage('Invalid risk factor')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  })
);

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile',
  authenticateToken,
  updateProfileValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'dateOfBirth', 'medicalProfile'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  })
);

/**
 * POST /api/users/change-password
 * Change user password
 */
router.post('/change-password',
  authenticateToken,
  changePasswordValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

/**
 * GET /api/users/dashboard
 * Get user dashboard data
 */
router.get('/dashboard',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent scans
    const recentScans = await Scan.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent reports
    const recentReports = await Report.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get high-risk scans
    const highRiskScans = await Scan.findHighRisk(req.user.userId);

    // Get reports needing follow-up
    const followUpReports = await Report.findNeedingFollowUp(req.user.userId);

    // Calculate statistics
    const stats = {
      totalScans: user.totalScans,
      totalReports: user.totalReports,
      highRiskScans: highRiskScans.length,
      pendingFollowUps: followUpReports.length,
      accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastScanDate: recentScans.length > 0 ? recentScans[0].createdAt : null
    };

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        stats,
        recentScans: recentScans.map(scan => scan.getSummary()),
        recentReports: recentReports.map(report => report.getSummary()),
        highRiskScans: highRiskScans.map(scan => scan.getSummary()),
        followUpReports: followUpReports.map(report => report.getSummary())
      }
    });
  })
);

/**
 * DELETE /api/users/account
 * Deactivate user account (soft delete)
 */
router.delete('/account',
  authenticateToken,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required for account deactivation'),
    
    body('confirmation')
      .equals('DELETE_MY_ACCOUNT')
      .withMessage('Please type "DELETE_MY_ACCOUNT" to confirm')
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

    const { password } = req.body;

    const user = await User.findById(req.user.userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Deactivate account (soft delete)
    user.isActive = false;
    user.refreshToken = null; // Invalidate all sessions
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  })
);

/**
 * GET /api/users/export
 * Export user data (GDPR compliance)
 */
router.get('/export',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    const scans = await Scan.find({ userId: req.user.userId });
    const reports = await Report.find({ userId: req.user.userId });

    const exportData = {
      user: user.toObject(),
      scans: scans.map(scan => scan.toObject()),
      reports: reports.map(report => report.toObject()),
      exportedAt: new Date(),
      exportVersion: '1.0'
    };

    // Remove sensitive data
    delete exportData.user.password;
    delete exportData.user.refreshToken;

    res.json({
      success: true,
      data: exportData
    });
  })
);

module.exports = router;