/**
 * Scan Model
 * 
 * Represents a skin lesion scan with uploaded image and AI analysis results.
 * Links to User and can have associated Questionnaire and Report.
 */

const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Image information
  image: {
    originalName: {
      type: String,
      required: [true, 'Original filename is required']
    },
    
    filename: {
      type: String,
      required: [true, 'Stored filename is required']
    },
    
    path: {
      type: String,
      required: [true, 'File path is required']
    },
    
    size: {
      type: Number,
      required: [true, 'File size is required'],
      max: [10485760, 'File size cannot exceed 10MB'] // 10MB limit
    },
    
    mimetype: {
      type: String,
      required: [true, 'MIME type is required'],
      enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    },
    
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  // AI Analysis Results
  aiAnalysis: {
    // CNN Model prediction
    prediction: {
      type: String,
      enum: ['benign', 'malignant', 'uncertain'],
      required: [true, 'AI prediction is required']
    },
    
    confidence: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: [0, 'Confidence cannot be negative'],
      max: [100, 'Confidence cannot exceed 100%']
    },
    
    // Detailed analysis explanation
    explanation: {
      type: String,
      required: [true, 'Analysis explanation is required'],
      maxlength: [2000, 'Explanation cannot exceed 2000 characters']
    },
    
    // AI recommendations
    recommendations: [{
      type: String,
      maxlength: [500, 'Recommendation cannot exceed 500 characters']
    }],
    
    // Raw model outputs (for debugging/analysis)
    rawPredictions: {
      benign: {
        type: Number,
        min: 0,
        max: 1
      },
      malignant: {
        type: Number,
        min: 0,
        max: 1
      }
    },
    
    // Model metadata
    modelInfo: {
      name: String,
      version: String,
      architecture: String,
      trainedOn: String
    },
    
    // Processing metadata
    processedAt: {
      type: Date,
      default: Date.now
    },
    
    processingTime: {
      type: Number, // milliseconds
      min: 0
    }
  },

  // Scan metadata
  scanType: {
    type: String,
    enum: ['self_examination', 'follow_up', 'routine_check', 'concern_based'],
    default: 'self_examination'
  },

  // Body location (optional)
  bodyLocation: {
    area: {
      type: String,
      enum: [
        'face', 'scalp', 'neck', 'chest', 'back', 'arms', 'hands', 
        'abdomen', 'legs', 'feet', 'other'
      ]
    },
    
    side: {
      type: String,
      enum: ['left', 'right', 'center', 'bilateral']
    },
    
    specificLocation: {
      type: String,
      maxlength: [100, 'Specific location cannot exceed 100 characters']
    }
  },

  // User notes
  userNotes: {
    type: String,
    maxlength: [1000, 'User notes cannot exceed 1000 characters']
  },

  // Scan status
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'archived'],
    default: 'processing'
  },

  // Quality metrics
  imageQuality: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    
    issues: [{
      type: String,
      enum: ['blurry', 'poor_lighting', 'too_small', 'obstructed', 'low_resolution']
    }],
    
    recommendations: [String]
  },

  // Privacy and sharing
  isPrivate: {
    type: Boolean,
    default: true
  },

  // Medical context (if user provides)
  medicalContext: {
    hasChanged: {
      type: Boolean,
      default: false
    },
    
    changeDescription: String,
    
    symptoms: [{
      type: String,
      enum: ['itching', 'bleeding', 'pain', 'crusting', 'growing', 'color_change']
    }],
    
    duration: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years', 'unknown']
    }
  },

  // Flags for medical review
  flags: {
    requiresAttention: {
      type: Boolean,
      default: false
    },
    
    highRisk: {
      type: Boolean,
      default: false
    },
    
    flaggedReasons: [String]
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
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ 'aiAnalysis.prediction': 1 });
scanSchema.index({ status: 1 });
scanSchema.index({ createdAt: -1 });
scanSchema.index({ 'flags.requiresAttention': 1 });

// Virtual for risk level based on AI analysis
scanSchema.virtual('riskLevel').get(function() {
  if (!this.aiAnalysis) return 'unknown';
  
  const { prediction, confidence } = this.aiAnalysis;
  
  if (prediction === 'malignant') {
    return confidence > 75 ? 'high' : 'medium';
  } else if (prediction === 'uncertain') {
    return 'medium';
  } else if (prediction === 'benign') {
    return confidence > 85 ? 'low' : 'medium';
  }
  
  return 'unknown';
});

// Virtual for urgency level
scanSchema.virtual('urgencyLevel').get(function() {
  const riskLevel = this.riskLevel;
  const hasSymptoms = this.medicalContext?.symptoms?.length > 0;
  const hasChanged = this.medicalContext?.hasChanged;
  
  if (riskLevel === 'high' || (hasSymptoms && hasChanged)) {
    return 'urgent';
  } else if (riskLevel === 'medium' || hasSymptoms) {
    return 'soon';
  } else {
    return 'routine';
  }
});

// Pre-save middleware to set flags
scanSchema.pre('save', function(next) {
  // Set attention flag for high-risk scans
  if (this.riskLevel === 'high' || this.aiAnalysis?.prediction === 'malignant') {
    this.flags.requiresAttention = true;
    this.flags.highRisk = true;
    
    if (!this.flags.flaggedReasons.includes('high_risk_ai_prediction')) {
      this.flags.flaggedReasons.push('high_risk_ai_prediction');
    }
  }
  
  // Flag scans with concerning symptoms
  if (this.medicalContext?.symptoms?.includes('bleeding') || 
      this.medicalContext?.symptoms?.includes('growing')) {
    this.flags.requiresAttention = true;
    
    if (!this.flags.flaggedReasons.includes('concerning_symptoms')) {
      this.flags.flaggedReasons.push('concerning_symptoms');
    }
  }
  
  next();
});

// Static method to find user scans
scanSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.riskLevel) {
    // This would need to be implemented with aggregation for virtual fields
  }
  
  return query.sort({ createdAt: -1 });
};

// Static method to find high-risk scans
scanSchema.statics.findHighRisk = function(userId) {
  return this.find({
    userId,
    $or: [
      { 'aiAnalysis.prediction': 'malignant' },
      { 'flags.highRisk': true }
    ]
  }).sort({ createdAt: -1 });
};

// Instance method to get summary
scanSchema.methods.getSummary = function() {
  return {
    id: this._id,
    prediction: this.aiAnalysis?.prediction,
    confidence: this.aiAnalysis?.confidence,
    riskLevel: this.riskLevel,
    urgencyLevel: this.urgencyLevel,
    bodyLocation: this.bodyLocation,
    createdAt: this.createdAt,
    status: this.status
  };
};

// Instance method to mark as completed
scanSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Instance method to archive scan
scanSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

module.exports = mongoose.model('Scan', scanSchema);