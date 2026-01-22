/**
 * User Model
 * 
 * Represents a user in the skin cancer detection system.
 * Includes authentication fields and user profile information.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },

  // Profile information
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },

  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },

  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        // Must be at least 13 years old and not in the future
        const thirteenYearsAgo = new Date();
        thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
        return value <= thirteenYearsAgo && value <= new Date();
      },
      message: 'Date of birth must be valid and user must be at least 13 years old'
    }
  },

  // Medical profile (optional, for better screening)
  medicalProfile: {
    skinType: {
      type: String,
      enum: ['very_fair', 'fair', 'medium', 'olive', 'brown', 'dark'],
    },
    
    personalHistory: {
      type: Boolean,
      default: false
    },
    
    familyHistory: {
      type: Boolean,
      default: false
    },
    
    riskFactors: [{
      type: String,
      enum: [
        'frequent_sun_exposure',
        'history_of_sunburns',
        'fair_skin',
        'many_moles',
        'atypical_moles',
        'immunosuppression',
        'previous_skin_cancer'
      ]
    }]
  },

  // Account status and metadata
  isActive: {
    type: Boolean,
    default: true
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  lastLogin: {
    type: Date
  },

  // Privacy and consent
  consentToDataProcessing: {
    type: Boolean,
    required: true,
    default: false
  },

  consentToMedicalScreening: {
    type: Boolean,
    required: true,
    default: false
  },

  // Refresh token for JWT
  refreshToken: {
    type: String,
    select: false
  },

  // Account statistics
  totalScans: {
    type: Number,
    default: 0
  },

  totalReports: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.password;
      delete ret.refreshToken;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || 'User';
});

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12 (configurable via environment)
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment scan count
userSchema.methods.incrementScanCount = async function() {
  this.totalScans += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment report count
userSchema.methods.incrementReportCount = async function() {
  this.totalReports += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    age: this.age,
    isEmailVerified: this.isEmailVerified,
    totalScans: this.totalScans,
    totalReports: this.totalReports,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
};

module.exports = mongoose.model('User', userSchema);