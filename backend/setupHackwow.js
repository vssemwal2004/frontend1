/**
 * Setup Hackwow Integration
 * 
 * This script helps configure the Bus Ticketing system
 * to use Hackwow Unified Booking Service.
 * 
 * Run: node setupHackwow.js
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           HACKWOW INTEGRATION SETUP                        ║
║                                                            ║
║   This script helps you connect the Bus Ticketing System   ║
║   to Hackwow Unified Booking Service.                      ║
╚════════════════════════════════════════════════════════════╝
`);

  // Step 1: Get Hackwow URL
  const hackwowUrl = await question('Enter Hackwow API URL [http://localhost:5000]: ') || 'http://localhost:5000';
  
  // Step 2: Test connection
  console.log('\n🔍 Testing connection to Hackwow...');
  try {
    const response = await axios.get(`${hackwowUrl}/health`);
    if (response.data.success) {
      console.log('✅ Hackwow is reachable');
    }
  } catch (error) {
    console.log('❌ Cannot connect to Hackwow');
    console.log('   Make sure Hackwow backend is running');
    console.log(`   URL: ${hackwowUrl}`);
    process.exit(1);
  }

  // Step 3: Login as admin
  console.log('\n📝 Login to Hackwow Admin...');
  const adminEmail = await question('Admin Email [admin@gmail.com]: ') || 'admin@gmail.com';
  const adminPassword = await question('Admin Password: ');

  let adminToken;
  try {
    const loginResponse = await axios.post(`${hackwowUrl}/admin/login`, {
      email: adminEmail,
      password: adminPassword
    });
    adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }

  // Step 4: Create app for Bus Ticketing
  console.log('\n🚌 Creating app for Bus Ticketing System...');
  const appName = await question('App Name [Bus Ticketing]: ') || 'Bus Ticketing';
  const appDomain = await question('Frontend Domain [localhost]: ') || 'localhost';

  let appCredentials;
  try {
    const createAppResponse = await axios.post(
      `${hackwowUrl}/admin/apps`,
      {
        name: appName,
        description: 'Bus Ticketing System integration',
        domain: appDomain,
        status: 'ACTIVE'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    appCredentials = createAppResponse.data.app;
    console.log('✅ App created successfully');
    console.log(`   App ID: ${appCredentials.appId}`);
    console.log(`   API Key: ${appCredentials.apiKey}`);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ App already exists. Getting credentials...');
      // Try to get existing app
      try {
        const appsResponse = await axios.get(`${hackwowUrl}/admin/apps`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const existingApp = appsResponse.data.apps?.find(a => a.name === appName);
        if (existingApp) {
          appCredentials = existingApp;
          console.log(`   App ID: ${existingApp.appId}`);
          console.log(`   API Key: [Use existing key or rotate from admin dashboard]`);
        }
      } catch (e) {
        console.log('Could not retrieve existing app credentials');
      }
    } else {
      console.log('❌ Failed to create app:', error.response?.data?.message || error.message);
    }
  }

  // Step 5: Generate .env content
  console.log('\n📄 Environment Configuration:\n');
  console.log('Add these to your Bus Ticketing backend .env file:\n');
  console.log('─'.repeat(50));
  console.log(`
# Hackwow Integration
USE_HACKWOW=true
HACKWOW_API_URL=${hackwowUrl}
HACKWOW_APP_ID=${appCredentials?.appId || 'YOUR_APP_ID'}
HACKWOW_API_KEY=${appCredentials?.apiKey || 'YOUR_API_KEY'}
`);
  console.log('─'.repeat(50));

  // Step 6: Instructions
  console.log(`
📋 Next Steps:

1. Copy the environment variables above to:
   d:\\hee\\frontend1\\backend\\.env

2. Install dependencies:
   cd d:\\hee\\frontend1\\backend
   npm install

3. Start Hackwow backend:
   cd d:\\hee\\hackwow\\backend
   npm run dev

4. Start Bus Ticketing backend:
   cd d:\\hee\\frontend1\\backend
   npm run dev

5. Start Bus Ticketing frontend:
   cd d:\\hee\\frontend1\\frontend
   npm run dev

🎉 The Bus Ticketing System will now use Hackwow for:
   - Seat locking (race condition prevention)
   - Razorpay order creation
   - Payment verification
   - Booking confirmation

📖 For more details, see:
   d:\\hee\\hackwow\\CLIENT_INTEGRATION_GUIDE.md
`);

  rl.close();
}

main().catch(console.error);
