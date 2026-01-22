/**
 * Report Model
 * 
 * Represents the final AI-generated screening report that combines
 * image analysis and questionnaire data for comprehensive assessment.
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    required: [true, 'Scan ID is required'],
    index: true
  },

  questionnaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Questionnaire',
    required: [true, 'Questionnaire ID is required']
  },

  // Report Content
  reportData: {
    // Overall risk assessment
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Uncertain'],
      required: [true, 'Risk level is required']
    },

    // Image analysis summary
    imageSummary: {
      type: String,
      required: [true, 'Image summary is required'],
      maxlength: [2000, 'Image summary cannot exceed 2000 characters']
    },

    // Questionnaire findings summary
    questionnaireSummary: {
      type: String,
      required: [true, 'Questionnaire summary is required'],
      maxlength: [2000, 'Questionnaire summary cannot exceed 2000 characters']
    },

    // Combined assessment
    combinedAssessment: {
      type: String,
      required: [true, 'Combined assessment is required'],
      maxlength: [3000, 'Combined assessment cannot exceed 3000 characters']
    },

    // Recommendations
    recommendation: {
      type: String,
      required: [true, 'Recommendation is required'],
      maxlength: [2000, 'Recommendation cannot exceed 2000 characters']
    },

    // Medical disclaimer
    disclaimer: {
      type: String,
      required: [true, 'Disclaimer is required'],
      default: 'This AI-powered screening tool is designed for educational and awareness purposes only. It does not provide medical diagnosis, treatment recommendations, or replace professional medical evaluation. The analysis combines artificial intelligence image assessment with self-reported information to generate risk estimates. All findings should be discussed with qualified healthcare professionals. For concerning symptoms or high-risk results, seek immediate medical attention from a dermatologist or healthcare provider.'
    },

    // Risk factors identified
    riskFactors: [{
      type: String,
      maxlength: [200, 'Risk factor cannot exceed 200 characters']
    }],

    // Protective factors
    protectiveFactors: [{
      type: String,
      maxlength: [200, 'Protective factor cannot exceed 200 characters']
    }],

    // Next steps with timeline
    nextSteps: [{
      type: String,
      maxlength: [300, 'Next step cannot exceed 300 characters']
    }],

    // Urgency level for medical consultation
    urgencyLevel: {
      type: String,
      enum: ['routine', 'soon', 'urgent'],
      required: [true, 'Urgency level is required']
    }
  },

  // AI Generation Metadata
  aiGeneration: {
    // Model used for report generation
    model: {
      type: String,
      default: 'gpt-4o-mini'
    },

    // Prompt version used
    promptVersion: {
      type: String,
      default: '1.0'
    },

    // Generation timestamp
    generatedAt: {
      type: Date,
      default: Date.now
    },

    // Processing time in milliseconds
    processingTime: {
      type: Number,
      min: 0
    },

    // Token usage (for cost tracking)
    tokenUsage: {
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number
    },

    // Generation status
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating'
    },

    // Error information if generation failed
    error: {
      message: String,
      code: String,
      timestamp: Date
    }
  },

  // Report Metadata
  metadata: {
    // Report version for schema changes
    version: {
      type: String,
      default: '1.0',
      required: true
    },

    // Report format
    format: {
      type: String,
      enum: ['json', 'pdf', 'html'],
      default: 'json'
    },

    // Language of the report
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de'] // Extensible for internationalization
    },

    // Report quality score (if applicable)
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // User Interactions
  userInteractions: {
    // Has user viewed the report
    viewed: {
      type: Boolean,
      default: false
    },

    // When user first viewed
    firstViewedAt: Date,

    // Number of times viewed
    viewCount: {
      type: Number,
      default: 0
    },

    // Has user downloaded the report
    downloaded: {
      type: Boolean,
      default: false
    },

    // Download timestamps
    downloadHistory: [{
      downloadedAt: Date,
      format: String,
      ipAddress: String
    }],

    // User feedback on report quality
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      
      comments: {
        type: String,
        maxlength: [1000, 'Feedback comments cannot exceed 1000 characters']
      },
      
      submittedAt: Date
    }
  },

  // Privacy and Sharing
  privacy: {
    // Is report private to user only
    isPrivate: {
      type: Boolean,
      default: true
    },

    // Sharing permissions
    sharingEnabled: {
      type: Boolean,
      default: false
    },

    // Shared with healthcare providers
    sharedWith: [{
      providerName: String,
      providerEmail: String,
      sharedAt: Date,
      accessLevel: {
        type: String,
        enum: ['view', 'download'],
        default: 'view'
      }
    }]
  },

  // Medical Follow-up
  followUp: {
    // Recommended follow-up date
    recommendedDate: Date,

    // Follow-up type
    type: {
      type: String,
      enum: ['routine_checkup', 'dermatologist_visit', 'urgent_consultation', 'self_monitoring']
    },

    // Follow-up status
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'overdue'],
      default: 'pending'
    },

    // Reminder settings
    reminders: {
      enabled: {
        type: Boolean,
        default: false
      },
      
      reminderDates: [Date]
    }
  }

}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ scanId: 1 });
reportSchema.index({ 'reportData.riskLevel': 1 });
reportSchema.index({ 'reportData.urgencyLevel': 1 });
reportSchema.index({ 'aiGeneration.generatedAt': -1 });
reportSchema.index({ 'followUp.recommendedDate': 1 });

// Virtual for days since generation
reportSchema.virtual('daysSinceGeneration').get(function() {
  if (!this.aiGeneration?.generatedAt) return null;
  
  const now = new Date();
  const generated = new Date(this.aiGeneration.generatedAt);
  const diffTime = Math.abs(now - generated);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for follow-up urgency
reportSchema.virtual('followUpUrgency').get(function() {
  if (!this.followUp?.recommendedDate) return null;
  
  const now = new Date();
  const followUpDate = new Date(this.followUp.recommendedDate);
  const daysUntil = Math.ceil((followUpDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 30) return 'soon';
  return 'routine';
});

// Pre-save middleware to set follow-up recommendations
reportSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('reportData.urgencyLevel')) {
    this.setFollowUpRecommendations();
  }
  next();
});

// Instance method to set follow-up recommendations
reportSchema.methods.setFollowUpRecommendations = function() {
  const urgencyLevel = this.reportData.urgencyLevel;
  const now = new Date();
  
  switch (urgencyLevel) {
    case 'urgent':
      this.followUp.recommendedDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
      this.followUp.type = 'urgent_consultation';
      break;
    case 'soon':
      this.followUp.recommendedDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
      this.followUp.type = 'dermatologist_visit';
      break;
    case 'routine':
      this.followUp.recommendedDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
      this.followUp.type = 'routine_checkup';
      break;
  }
};

// Instance method to mark as viewed
reportSchema.methods.markAsViewed = function(ipAddress = null) {
  if (!this.userInteractions.viewed) {
    this.userInteractions.viewed = true;
    this.userInteractions.firstViewedAt = new Date();
  }
  
  this.userInteractions.viewCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to record download
reportSchema.methods.recordDownload = function(format = 'pdf', ipAddress = null) {
  this.userInteractions.downloaded = true;
  this.userInteractions.downloadHistory.push({
    downloadedAt: new Date(),
    format,
    ipAddress
  });
  
  return this.save({ validateBeforeSave: false });
};

// Instance method to add feedback
reportSchema.methods.addFeedback = function(rating, comments = '') {
  this.userInteractions.feedback = {
    rating,
    comments,
    submittedAt: new Date()
  };
  
  return this.save();
};

// Static method to find by user
reportSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.riskLevel) {
    query.where('reportData.riskLevel').equals(options.riskLevel);
  }
  
  if (options.urgencyLevel) {
    query.where('reportData.urgencyLevel').equals(options.urgencyLevel);
  }
  
  return query.sort({ createdAt: -1 });
};

// Static method to find high-risk reports
reportSchema.statics.findHighRisk = function(userId) {
  return this.find({
    userId,
    'reportData.riskLevel': { $in: ['High', 'Medium'] }
  }).sort({ createdAt: -1 });
};

// Static method to find reports needing follow-up
reportSchema.statics.findNeedingFollowUp = function(userId) {
  const now = new Date();
  
  return this.find({
    userId,
    'followUp.recommendedDate': { $lte: now },
    'followUp.status': { $in: ['pending', 'overdue'] }
  }).sort({ 'followUp.recommendedDate': 1 });
};

// Instance method to get summary
reportSchema.methods.getSummary = function() {
  return {
    id: this._id,
    riskLevel: this.reportData.riskLevel,
    urgencyLevel: this.reportData.urgencyLevel,
    generatedAt: this.aiGeneration.generatedAt,
    viewed: this.userInteractions.viewed,
    downloaded: this.userInteractions.downloaded,
    followUpDate: this.followUp.recommendedDate,
    followUpUrgency: this.followUpUrgency,
    daysSinceGeneration: this.daysSinceGeneration
  };
};

// Instance method to get public data (for sharing)
reportSchema.methods.getPublicData = function() {
  return {
    riskLevel: this.reportData.riskLevel,
    imageSummary: this.reportData.imageSummary,
    questionnaireSummary: this.reportData.questionnaireSummary,
    combinedAssessment: this.reportData.combinedAssessment,
    recommendation: this.reportData.recommendation,
    riskFactors: this.reportData.riskFactors,
    protectiveFactors: this.reportData.protectiveFactors,
    nextSteps: this.reportData.nextSteps,
    urgencyLevel: this.reportData.urgencyLevel,
    disclaimer: this.reportData.disclaimer,
    generatedAt: this.aiGeneration.generatedAt
  };
};

module.exports = mongoose.model('Report', reportSchema);