/**
 * Test Script for ChatGPT Backend
 * 
 * Run this script to test the backend functionality
 * Usage: node test-backend.js
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:3001';

/**
 * Make HTTP request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.headers['content-type']?.includes('application/json') 
              ? JSON.parse(body) 
              : body
          };
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test health endpoint
 */
async function testHealth() {
  console.log('🔍 Testing health endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Health check passed');
      console.log('   Response:', response.body);
    } else {
      console.log('❌ Health check failed');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
}

/**
 * Test chat endpoint without scan result
 */
async function testChatBasic() {
  console.log('\n🔍 Testing basic chat...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      message: "How does AI detect skin cancer?"
    });

    if (response.statusCode === 200) {
      console.log('✅ Basic chat test passed');
      console.log('   AI Response:', response.body.reply?.substring(0, 100) + '...');
    } else {
      console.log('❌ Basic chat test failed');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Basic chat error:', error.message);
  }
}

/**
 * Test chat endpoint with scan result
 */
async function testChatWithScan() {
  console.log('\n🔍 Testing chat with scan result...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      message: "What does my result mean?",
      scanResult: {
        risk: "High",
        confidence: "89%",
        prediction: "malignant"
      }
    });

    if (response.statusCode === 200) {
      console.log('✅ Scan context chat test passed');
      console.log('   AI Response:', response.body.reply?.substring(0, 100) + '...');
    } else {
      console.log('❌ Scan context chat test failed');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Scan context chat error:', error.message);
  }
}

/**
 * Test invalid input
 */
async function testInvalidInput() {
  console.log('\n🔍 Testing invalid input handling...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      message: "", // Empty message should fail validation
    });

    if (response.statusCode === 400) {
      console.log('✅ Invalid input test passed (correctly rejected)');
      console.log('   Error:', response.body.error);
    } else {
      console.log('❌ Invalid input test failed (should have been rejected)');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Invalid input test error:', error.message);
  }
}

/**
 * Test comprehensive screening report generation
 */
async function testScreeningReport() {
  console.log('\n🔍 Testing screening report generation...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/screening-report',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      message: "Generate a comprehensive screening report based on the provided image analysis and questionnaire data.",
      imageAnalysis: {
        prediction: "malignant",
        confidence: 87,
        explanation: "The AI detected irregular borders, asymmetrical shape, and color variation consistent with concerning features."
      },
      questionnaire: {
        lesionChanges: {
          sizeChange: "increased",
          colorChange: "yes",
          shapeChange: "yes",
          timeframe: "weeks"
        },
        symptoms: {
          itching: false,
          bleeding: true,
          pain: false,
          crusting: false,
          none: false
        },
        sunExposure: {
          dailyExposure: "high",
          sunburnHistory: "frequently",
          sunProtection: "rarely",
          tanningSalon: "regularly"
        },
        medicalHistory: {
          personalHistory: "no",
          familyHistory: "yes",
          previousBiopsies: "no",
          immunocompromised: "no"
        },
        demographics: {
          ageRange: "50_59",
          skinType: "fair",
          moleCount: "many"
        }
      }
    });

    if (response.statusCode === 200) {
      console.log('✅ Screening report test passed');
      console.log('   Report generated:', response.body.reply?.substring(0, 150) + '...');
      console.log('   Model used:', response.body.model);
      console.log('   Report type:', response.body.type);
    } else {
      console.log('❌ Screening report test failed');
      console.log('   Status:', response.statusCode);
      console.log('   Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Screening report error:', error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting ChatGPT Backend Tests\n');
  console.log('Make sure the backend server is running on http://localhost:3001\n');

  await testHealth();
  await testChatBasic();
  await testChatWithScan();
  await testInvalidInput();
  await testScreeningReport();

  console.log('\n🎉 Tests completed!');
  console.log('\nNext steps:');
  console.log('1. If tests passed, your backend is working correctly');
  console.log('2. Update your frontend to use this backend URL');
  console.log('3. Make sure to set your OpenAI API key in .env file');
  console.log('4. Test the complete screening questionnaire flow');
  console.log('5. Deploy to production when ready');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };