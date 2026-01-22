/**
 * Database Seeding Script
 * 
 * Creates sample data for development and testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Scan = require('../models/Scan');
const Questionnaire = require('../models/Questionnaire');
const Report = require('../models/Report');

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  await User.deleteMany({});
  await Scan.deleteMany({});
  await Questionnaire.deleteMany({});
  await Report.deleteMany({});
  console.log('✅ Database cleared');
}

async function createSampleUsers() {
  console.log('👥 Creating sample users...');
  
  const users = [
    {
      email: 'john.doe@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-06-15'),
      consentToDataProcessing: true,
      consentToMedicalScreening: true,
      medicalProfile: {
        skinType: 'fair',
        personalHistory: false,
        familyHistory: true,
        riskFactors: ['fair_skin', 'history_of_sunburns']
      }
    },
    {
      email: 'jane.smith@example.com',
      password: 'Password123',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1990-03-22'),
      consentToDataProcessing: true,
      consentToMedicalScreening: true,
      medicalProfile: {
        skinType: 'medium',
        personalHistory: false,
        familyHistory: false,
        riskFactors: ['many_moles']
      }
    },
    {
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User',
      consentToDataProcessing: true,
      consentToMedicalScreening: true
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
    console.log(`✅ Created user: ${user.email}`);
  }

  return createdUsers;
}

async function createSampleScans(users) {
  console.log('🔬 Creating sample scans...');
  
  const scans = [];
  
  for (const user of users) {
    // Create 2-3 scans per user
    const scanCount = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < scanCount; i++) {
      const scan = new Scan({
        userId: user._id,
        image: {
          originalName: `sample_lesion_${i + 1}.jpg`,
          filename: `sample_lesion_${user._id}_${i + 1}.jpg`,
          path: `./uploads/sample_lesion_${user._id}_${i + 1}.jpg`,
          size: Math.floor(Math.random() * 2000000) + 500000, // 0.5-2.5MB
          mimetype: 'image/jpeg'
        },
        scanType: ['self_examination', 'follow_up', 'concern_based'][Math.floor(Math.random() * 3)],
        bodyLocation: {
          area: ['face', 'chest', 'back', 'arms', 'legs'][Math.floor(Math.random() * 5)],
          side: ['left', 'right', 'center'][Math.floor(Math.random() * 3)]
        },
        aiAnalysis: {
          prediction: Math.random() > 0.8 ? 'malignant' : 'benign',
          confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
          explanation: 'AI analysis completed successfully. This is sample data for development.',
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
          processingTime: Math.floor(Math.random() * 5000) + 1000
        },
        status: 'completed',
        userNotes: i === 0 ? 'This mole has been growing recently' : undefined,
        medicalContext: {
          hasChanged: Math.random() > 0.7,
          symptoms: Math.random() > 0.8 ? ['itching'] : [],
          duration: ['weeks', 'months', 'years'][Math.floor(Math.random() * 3)]
        }
      });

      await scan.save();
      scans.push(scan);
      
      // Update user scan count
      await user.incrementScanCount();
    }
  }

  console.log(`✅ Created ${scans.length} sample scans`);
  return scans;
}

async function createSampleQuestionnaires(scans) {
  console.log('📋 Creating sample questionnaires...');
  
  const questionnaires = [];
  
  for (const scan of scans) {
    const questionnaire = new Questionnaire({
      userId: scan.userId,
      scanId: scan._id,
      lesionChanges: {
        sizeChange: ['increased', 'decreased', 'no_change', 'unsure'][Math.floor(Math.random() * 4)],
        colorChange: Math.random() > 0.7 ? 'yes' : 'no',
        shapeChange: Math.random() > 0.8 ? 'yes' : 'no',
        timeframe: ['weeks', 'months', 'years'][Math.floor(Math.random() * 3)]
      },
      symptoms: {
        itching: Math.random() > 0.8,
        bleeding: Math.random() > 0.9,
        pain: Math.random() > 0.85,
        crusting: Math.random() > 0.9,
        none: Math.random() > 0.3
      },
      sunExposure: {
        dailyExposure: ['minimal', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        sunburnHistory: ['never', 'rarely', 'sometimes', 'frequently'][Math.floor(Math.random() * 4)],
        sunProtection: ['always', 'usually', 'sometimes', 'rarely'][Math.floor(Math.random() * 4)],
        tanningSalon: ['never', 'rarely'][Math.floor(Math.random() * 2)]
      },
      medicalHistory: {
        personalHistory: Math.random() > 0.9 ? 'yes' : 'no',
        familyHistory: Math.random() > 0.8 ? 'yes' : 'no',
        previousBiopsies: Math.random() > 0.85 ? 'yes' : 'no',
        immunocompromised: Math.random() > 0.95 ? 'yes' : 'no'
      },
      demographics: {
        ageRange: ['20_29', '30_39', '40_49', '50_59'][Math.floor(Math.random() * 4)],
        skinType: ['very_fair', 'fair', 'medium', 'olive'][Math.floor(Math.random() * 4)],
        moleCount: ['few', 'some', 'many'][Math.floor(Math.random() * 3)]
      },
      completionTime: Math.floor(Math.random() * 300) + 120 // 2-7 minutes
    });

    await questionnaire.save();
    questionnaires.push(questionnaire);
  }

  console.log(`✅ Created ${questionnaires.length} sample questionnaires`);
  return questionnaires;
}

async function createSampleReports(questionnaires) {
  console.log('📄 Creating sample reports...');
  
  const reports = [];
  
  for (const questionnaire of questionnaires) {
    const scan = await Scan.findById(questionnaire.scanId);
    const riskLevel = scan.aiAnalysis.prediction === 'malignant' ? 'High' : 
                     Math.random() > 0.7 ? 'Medium' : 'Low';
    
    const report = new Report({
      userId: questionnaire.userId,
      scanId: questionnaire.scanId,
      questionnaireId: questionnaire._id,
      reportData: {
        riskLevel,
        imageSummary: `AI analysis shows ${scan.aiAnalysis.prediction} lesion with ${scan.aiAnalysis.confidence}% confidence.`,
        questionnaireSummary: `Questionnaire analysis completed with ${questionnaire.riskAssessment?.riskFactors?.length || 0} risk factors identified.`,
        combinedAssessment: `Combined analysis indicates ${riskLevel.toLowerCase()} risk based on image analysis and questionnaire responses.`,
        recommendation: riskLevel === 'High' ? 
          'Immediate dermatologist consultation recommended.' :
          riskLevel === 'Medium' ?
          'Schedule dermatologist appointment within 2-4 weeks.' :
          'Continue regular self-examinations and routine check-ups.',
        riskFactors: questionnaire.riskAssessment?.riskFactors?.map(rf => rf.factor) || [],
        protectiveFactors: questionnaire.riskAssessment?.protectiveFactors || [],
        nextSteps: riskLevel === 'High' ? 
          ['Contact dermatologist immediately', 'Avoid sun exposure'] :
          ['Schedule appointment', 'Monitor for changes'],
        urgencyLevel: riskLevel === 'High' ? 'urgent' : riskLevel === 'Medium' ? 'soon' : 'routine'
      },
      aiGeneration: {
        model: 'gpt-4o-mini',
        promptVersion: '1.0',
        processingTime: Math.floor(Math.random() * 3000) + 2000,
        tokenUsage: {
          promptTokens: Math.floor(Math.random() * 500) + 800,
          completionTokens: Math.floor(Math.random() * 300) + 500,
          totalTokens: Math.floor(Math.random() * 800) + 1300
        },
        status: 'completed'
      }
    });

    await report.save();
    reports.push(report);
    
    // Update user report count
    const user = await User.findById(questionnaire.userId);
    await user.incrementReportCount();
  }

  console.log(`✅ Created ${reports.length} sample reports`);
  return reports;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDatabase();
    await clearDatabase();
    
    const users = await createSampleUsers();
    const scans = await createSampleScans(users);
    const questionnaires = await createSampleQuestionnaires(scans);
    const reports = await createSampleReports(questionnaires);
    
    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Scans: ${scans.length}`);
    console.log(`   Questionnaires: ${questionnaires.length}`);
    console.log(`   Reports: ${reports.length}`);
    
    console.log('\n🔐 Sample Login Credentials:');
    console.log('   Email: john.doe@example.com');
    console.log('   Email: jane.smith@example.com');
    console.log('   Email: test@example.com');
    console.log('   Password: Password123');
    
    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };