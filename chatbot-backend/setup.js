#!/usr/bin/env node

/**
 * Setup Script for ChatGPT Backend
 * 
 * This script helps set up the ChatGPT backend with proper configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 ChatGPT Backend Setup\n');
  
  // Check if .env already exists
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Existing .env file preserved.');
      rl.close();
      return;
    }
  }

  console.log('Please provide the following configuration:\n');

  // Get OpenAI API key
  const apiKey = await question('OpenAI API Key (sk-...): ');
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.log('❌ Invalid API key format. Should start with "sk-"');
    rl.close();
    return;
  }

  // Get port
  const port = await question('Server Port (default: 3001): ') || '3001';
  
  // Get frontend URL
  const frontendUrl = await question('Frontend URL (default: http://localhost:8080): ') || 'http://localhost:8080';
  
  // Get environment
  const nodeEnv = await question('Environment (development/production, default: development): ') || 'development';

  // Create .env content
  const envContent = `# OpenAI Configuration
OPENAI_API_KEY=${apiKey}

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# CORS Configuration (Frontend URL)
FRONTEND_URL=${frontendUrl}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
API_SECRET=chatgpt-backend-${Date.now()}
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
  } catch (error) {
    console.log('\n❌ Error creating .env file:', error.message);
    rl.close();
    return;
  }

  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('\n📦 Installing dependencies...');
    const { spawn } = require('child_process');
    
    const npm = spawn('npm', ['install'], { stdio: 'inherit' });
    
    npm.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Dependencies installed successfully!');
        showNextSteps();
      } else {
        console.log('\n❌ Error installing dependencies. Please run "npm install" manually.');
      }
      rl.close();
    });
  } else {
    console.log('\n✅ Dependencies already installed');
    showNextSteps();
    rl.close();
  }
}

function showNextSteps() {
  console.log('\n🎉 Setup Complete!\n');
  console.log('Next steps:');
  console.log('1. Start the backend server:');
  console.log('   npm run dev');
  console.log('');
  console.log('2. Test the backend:');
  console.log('   node test-backend.js');
  console.log('');
  console.log('3. Update your frontend to use this backend');
  console.log('   See FRONTEND_INTEGRATION_GUIDE.md for details');
  console.log('');
  console.log('4. Your backend will be available at:');
  console.log(`   http://localhost:${process.env.PORT || 3001}`);
  console.log('');
  console.log('📚 For more information, see README.md');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Setup error:', error.message);
  rl.close();
  process.exit(1);
});

// Run setup
if (require.main === module) {
  setup().catch(console.error);
}

module.exports = { setup };