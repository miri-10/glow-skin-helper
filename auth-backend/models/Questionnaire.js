/**
 * Questionnaire Model
 * 
 * Represents questionnaire responses for comprehensive skin cancer screening.
 * Links to User and Scan for complete medical assessment.
 */

const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
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

  // Lesion Changes Section
  lesionChanges: {
    sizeChange: {
      type: String,
      enum: ['increased', 'decreased', 'no_change', 'unsure'],
      required: [true, 'Size change information is required']
    },
    
    colorChange: {
      type: String,
      enum: ['yes', 'no', 'unsure'],
      required: [true, 'Color change information is required']
    },
    
    shapeChange: {
      type: String,
      enum: ['yes', 'no', 'unsure'],
      required: [true, 'Shape change information is required']
    },
    
    timeframe: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years', 'unsure'],
      required: [true, 'Timeframe information is required']
    }
  },

  // Symptoms Section
  symptoms: {
    itching: {
      type: Boolean,
      default: false
    },
    
    bleeding: {
      type: Boolean,
      default: false
    },
    
    pain: {
      type: Boolean,
      default: false
    },
    
    crusting: {
      type: Boolean,
      default: false
    },
    
    none: {
      type: Boolean,
      default: false
    }
  },

  // Sun Exposure Section
  sunExposure: {
    dailyExposure: {
      type: String,
      enum: ['minimal', 'moderate', 'high', 'extreme'],
      required: [true, 'Daily sun exposure information is required']
    },
    
    sunburnHistory: {
      type: String,
      enum: ['never', 'rarely', 'sometimes', 'frequently'],
      required: [true, 'Sunburn history is required']
    },
    
    sunProtection: {
      type: String,
      enum: ['always', 'usually', 'sometimes', 'rarely', 'never'],
      required: [true, 'Sun protection information is required']
    },
    
    tanningSalon: {
      type: String,
      enum: ['never', 'rarely', 'regularly', 'frequently'],
      required: [true, 'Tanning salon usage information is required']
    }
  },

  // Medical History Section
  medicalHistory: {
    personalHistory: {
      type: String,
      enum: ['yes', 'no', 'unsure'],
      required: [true, 'Personal history information is required']
    },
    
    familyHistory: {
      type: String,
      enum: ['yes', 'no', 'unsure'],
      required: [true, 'Family history information is required']
    },
    
    previousBiopsies: {
      type: String,
      enum: ['yes', 'no', 'unsure'],
      required: [true, 'Previous biopsies information is required']
    },
    
    immunocompromised: {
      type: String,
      enum: ['yes', 'no', 'unsure'],
      required: [true, 'Immunocompromised status is required']
    }
  },

  // Demographics Section
  demographics: {
    ageRange: {
      type: String,
      enum: ['under_20', '20_29', '30_39', '40_49', '50_59', '60_69', '70_plus'],
      required: [true, 'Age range is required']
    },
    
    skinType: {
      type: String,
      enum: ['very_fair', 'fair', 'medium', 'olive', 'brown', 'dark'],
      required: [true, 'Skin type is required']
    },
    
    moleCount: {
      type: String,
      enum: ['few', 'some', 'many', 'numerous'],
      required: [true, 'Mole count information is required']
    }
  },

  // Additional Notes
  additionalNotes: {
    type: String,
    maxlength: [2000, 'Additional notes cannot exceed 2000 characters'],
    trim: true
  },

  // Questionnaire metadata
  completedAt: {
    type: Date,
    default: Date.now
  },

  completionTime: {
    type: Number, // seconds taken to complete
    min: 0
  },

  version: {
    type: String,
    default: '1.0',
    required: true
  },

  // Risk assessment based on responses
  riskAssessment: {
    riskFactors: [{
      factor: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }],
    
    protectiveFactors: [String],
    
    overallRiskScore: {
      type: Number,
      min: 0,
      max: 100
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
questionnaireSchema.index({ userId: 1, createdAt: -1 });
questionnaireSchema.index({ scanId: 1 });
questionnaireSchema.index({ completedAt: -1 });

// Virtual for symptom count
questionnaireSchema.virtual('symptomCount').get(function() {
  const symptoms = this.symptoms;
  if (symptoms.none) return 0;
  
  return Object.keys(symptoms).filter(key => 
    key !== 'none' && symptoms[key] === true
  ).length;
});

// Virtual for has concerning symptoms
questionnaireSchema.virtual('hasConcerningSymptoms').get(function() {
  return this.symptoms.bleeding || this.symptoms.pain || 
         (this.lesionChanges.sizeChange === 'increased' && 
          ['days', 'weeks'].includes(this.lesionChanges.timeframe));
});

// Virtual for sun exposure risk level
questionnaireSchema.virtual('sunExposureRisk').get(function() {
  const { dailyExposure, sunburnHistory, sunProtection, tanningSalon } = this.sunExposure;
  
  let riskScore = 0;
  
  // Daily exposure scoring
  const exposureScores = { minimal: 0, moderate: 1, high: 2, extreme: 3 };
  riskScore += exposureScores[dailyExposure] || 0;
  
  // Sunburn history scoring
  const burnScores = { never: 0, rarely: 1, sometimes: 2, frequently: 3 };
  riskScore += burnScores[sunburnHistory] || 0;
  
  // Sun protection scoring (inverse)
  const protectionScores = { always: 0, usually: 1, sometimes: 2, rarely: 3, never: 4 };
  riskScore += protectionScores[sunProtection] || 0;
  
  // Tanning salon scoring
  const tanningScores = { never: 0, rarely: 1, regularly: 2, frequently: 3 };
  riskScore += tanningScores[tanningSalon] || 0;
  
  // Convert to risk level
  if (riskScore <= 3) return 'low';
  if (riskScore <= 7) return 'medium';
  return 'high';
});

// Pre-save middleware to calculate risk assessment
questionnaireSchema.pre('save', function(next) {
  this.calculateRiskAssessment();
  next();
});

// Instance method to calculate risk assessment
questionnaireSchema.methods.calculateRiskAssessment = function() {
  const riskFactors = [];
  const protectiveFactors = [];
  let riskScore = 0;

  // Analyze lesion changes
  if (this.lesionChanges.sizeChange === 'increased') {
    riskFactors.push({ factor: 'Lesion size increase', severity: 'high' });
    riskScore += 20;
  }
  
  if (this.lesionChanges.colorChange === 'yes') {
    riskFactors.push({ factor: 'Color changes in lesion', severity: 'medium' });
    riskScore += 15;
  }
  
  if (this.lesionChanges.shapeChange === 'yes') {
    riskFactors.push({ factor: 'Shape changes in lesion', severity: 'medium' });
    riskScore += 15;
  }

  // Analyze symptoms
  if (this.symptoms.bleeding) {
    riskFactors.push({ factor: 'Bleeding from lesion', severity: 'high' });
    riskScore += 25;
  }
  
  if (this.symptoms.itching) {
    riskFactors.push({ factor: 'Itching or irritation', severity: 'low' });
    riskScore += 5;
  }
  
  if (this.symptoms.none) {
    protectiveFactors.push('No concerning symptoms reported');
  }

  // Analyze sun exposure
  if (this.sunExposure.sunburnHistory === 'frequently') {
    riskFactors.push({ factor: 'History of frequent sunburns', severity: 'high' });
    riskScore += 15;
  }
  
  if (this.sunExposure.sunProtection === 'always' || this.sunExposure.sunProtection === 'usually') {
    protectiveFactors.push('Regular use of sun protection');
  }
  
  if (this.sunExposure.tanningSalon === 'never') {
    protectiveFactors.push('No tanning salon use');
  }

  // Analyze medical history
  if (this.medicalHistory.personalHistory === 'yes') {
    riskFactors.push({ factor: 'Personal history of skin cancer', severity: 'high' });
    riskScore += 30;
  }
  
  if (this.medicalHistory.familyHistory === 'yes') {
    riskFactors.push({ factor: 'Family history of skin cancer', severity: 'medium' });
    riskScore += 10;
  }
  
  if (this.medicalHistory.personalHistory === 'no' && this.medicalHistory.familyHistory === 'no') {
    protectiveFactors.push('No personal or family history of skin cancer');
  }

  // Analyze demographics
  if (this.demographics.skinType === 'very_fair' || this.demographics.skinType === 'fair') {
    riskFactors.push({ factor: 'Fair skin type (higher UV sensitivity)', severity: 'medium' });
    riskScore += 10;
  }
  
  if (this.demographics.moleCount === 'numerous') {
    riskFactors.push({ factor: 'Numerous moles (>50)', severity: 'medium' });
    riskScore += 10;
  }

  // Cap the risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Update risk assessment
  this.riskAssessment = {
    riskFactors,
    protectiveFactors,
    overallRiskScore: riskScore
  };
};

// Static method to find by scan
questionnaireSchema.statics.findByScan = function(scanId) {
  return this.findOne({ scanId });
};

// Static method to find by user
questionnaireSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Instance method to get risk summary
questionnaireSchema.methods.getRiskSummary = function() {
  return {
    overallRiskScore: this.riskAssessment?.overallRiskScore || 0,
    riskFactorCount: this.riskAssessment?.riskFactors?.length || 0,
    protectiveFactorCount: this.riskAssessment?.protectiveFactors?.length || 0,
    hasConcerningSymptoms: this.hasConcerningSymptoms,
    sunExposureRisk: this.sunExposureRisk,
    symptomCount: this.symptomCount
  };
};

module.exports = mongoose.model('Questionnaire', questionnaireSchema);