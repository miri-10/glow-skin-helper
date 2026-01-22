/**
 * Authentication Backend Test Script
 * 
 * Tests the main authentication and API endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let refreshToken = '';

// Test data
const testUser = {
  email: 'test.user@example.com',
  password: 'TestPassword123',
  firstName: 'Test',
  lastName: 'User',
  consentToDataProcessing: true,
  consentToMedicalScreening: true
};

async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data.status);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    
    if (response.data.success) {
      authToken = response.data.data.accessToken;
      refreshToken = response.data.data.refreshToken;
      console.log('✅ User registration successful');
      console.log('   User ID:', response.data.data.user.id);
      console.log('   Email:', response.data.data.user.email);
      return true;
    } else {
      console.error('❌ Registration failed:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️  User already exists, trying login instead...');
      return await testUserLogin();
    }
    console.error('❌ Registration error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data.success) {
      authToken = response.data.data.accessToken;
      refreshToken = response.data.data.refreshToken;
      console.log('✅ User login successful');
      console.log('   User ID:', response.data.data.user.id);
      return true;
    } else {
      console.error('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testProtectedRoute() {
  console.log('\n🔒 Testing Protected Route...');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Protected route access successful');
      console.log('   User:', response.data.data.user.fullName);
      return true;
    } else {
      console.error('❌ Protected route failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Protected route error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testTokenRefresh() {
  console.log('\n🔄 Testing Token Refresh...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      refreshToken: refreshToken
    });
    
    if (response.data.success) {
      authToken = response.data.data.accessToken;
      refreshToken = response.data.data.refreshToken;
      console.log('✅ Token refresh successful');
      return true;
    } else {
      console.error('❌ Token refresh failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserDashboard() {
  console.log('\n📊 Testing User Dashboard...');
  try {
    const response = await axios.get(`${BASE_URL}/api/users/dashboard`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Dashboard access successful');
      console.log('   Total Scans:', response.data.data.stats.totalScans);
      console.log('   Total Reports:', response.data.data.stats.totalReports);
      return true;
    } else {
      console.error('❌ Dashboard failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Dashboard error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testScansEndpoint() {
  console.log('\n🔬 Testing Scans Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/scans`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Scans endpoint accessible');
      console.log('   Scans found:', response.data.data.scans.length);
      return true;
    } else {
      console.error('❌ Scans endpoint failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Scans endpoint error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testReportsEndpoint() {
  console.log('\n📄 Testing Reports Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/reports`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Reports endpoint accessible');
      console.log('   Reports found:', response.data.data.reports.length);
      return true;
    } else {
      console.error('❌ Reports endpoint failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Reports endpoint error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n👋 Testing User Logout...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ User logout successful');
      return true;
    } else {
      console.error('❌ Logout failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Logout error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Authentication Backend Tests...');
  console.log('📍 Base URL:', BASE_URL);
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'Protected Route', fn: testProtectedRoute },
    { name: 'Token Refresh', fn: testTokenRefresh },
    { name: 'User Dashboard', fn: testUserDashboard },
    { name: 'Scans Endpoint', fn: testScansEndpoint },
    { name: 'Reports Endpoint', fn: testReportsEndpoint },
    { name: 'User Logout', fn: testLogout }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server logs and configuration.');
  }
}

// Add axios dependency check
async function checkDependencies() {
  try {
    require('axios');
    return true;
  } catch (error) {
    console.error('❌ Missing dependency: axios');
    console.log('💡 Install with: npm install axios');
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  checkDependencies().then(hasAxios => {
    if (hasAxios) {
      runAllTests();
    }
  });
}

module.exports = { runAllTests };