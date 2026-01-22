// Test API Connection
// Run this in browser console or create a test page

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...\n');

  // Test 1: Health Check
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
  }

  // Test 2: User Registration
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test@123456',
        phone: '9876543210'
      })
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ User Registration:', data);
      localStorage.setItem('test_token', data.token);
    } else {
      console.error('❌ Registration Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
  }

  // Test 3: Get Current User (with token)
  try {
    const token = localStorage.getItem('test_token');
    if (token) {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('✅ Get Current User:', data);
    }
  } catch (error) {
    console.error('❌ Get User Error:', error.message);
  }

  // Test 4: Search Buses
  try {
    const response = await fetch(
      `${API_BASE_URL}/buses/search?from=Bangalore&to=Chennai&date=2026-01-22`
    );
    const data = await response.json();
    console.log('✅ Bus Search:', data);
  } catch (error) {
    console.error('❌ Bus Search Error:', error.message);
  }

  console.log('\n✨ Connection tests completed!');
}

// Run tests
testBackendConnection();
