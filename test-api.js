/**
 * 🧪 Comprehensive API Test Script
 * Run: node test-api.js
 */

const http = require('http');

const TOKEN = ''; // 🔒 Paste your JWT token here if available (optional)

const testEndpoint = (method, path, data = null, useAuth = false) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (useAuth && TOKEN) {
      options.headers['Authorization'] = `Bearer ${TOKEN}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

(async () => {
  console.log('🧩 Starting API Endpoint Tests...\n');

  // 1️⃣ Health check
  try {
    const health = await testEndpoint('GET', '/health');
    if (health.status === 200) {
      console.log('✅ [Health] Server running fine');
    } else {
      console.log('⚠️ [Health] Unexpected response:', health);
    }
  } catch (error) {
    console.error('❌ [Health] Failed - Server might not be running');
    console.error('   Error:', error.message);
    process.exit(1);
  }

  console.log('');

  // 2️⃣ Auth: Login Test
  try {
    const login = await testEndpoint('POST', '/api/auth/login', {
      email: 'test@test.com',
      password: 'test123',
    });
    if (login.status === 404) {
      console.log('❌ [Auth] Login route not found (404)');
    } else if (login.status === 400 || login.status === 401) {
      console.log('✅ [Auth] Login route found (validation/auth error expected)');
    } else if (login.status === 200) {
      console.log('✅ [Auth] Logged in successfully');
      console.log('   → JWT token:', login.data.token);
    } else {
      console.log('⚠️ [Auth] Unexpected status:', login.status, login.data);
    }
  } catch (error) {
    console.error('❌ [Auth] Login test failed');
    console.error('   Error:', error.message);
  }

  console.log('');

  // 3️⃣ Auth: Register Test
  try {
    const register = await testEndpoint('POST', '/api/auth/register', {
      email: 'resident_test@test.com',
      password: 'pass123',
      full_name: 'Resident Test',
      role: 'resident',
    });
    if (register.status === 404) {
      console.log('❌ [Auth] Register route not found (404)');
    } else {
      console.log('✅ [Auth] Register route found');
      console.log('   Status:', register.status);
      console.log('   Message:', register.data.message);
    }
  } catch (error) {
    console.error('❌ [Auth] Register test failed');
    console.error('   Error:', error.message);
  }

  console.log('');

  // 🧩 Stop here if no token available
  if (!TOKEN) {
    console.log('⚠️  No JWT token provided. Skipping resident complaint tests.');
    console.log('👉 To test resident APIs, paste your token in the TOKEN variable at top.\n');
    process.exit(0);
  }

  // 4️⃣ Resident: Get complaints
  try {
    const complaints = await testEndpoint('GET', '/api/resident/complaints', null, true);
    if (complaints.status === 200) {
      console.log('✅ [Resident] Complaints fetched successfully');
      console.log('   Total complaints:', complaints.data.data?.complaints?.length || 0);
    } else if (complaints.status === 403) {
      console.log('❌ [Resident] Forbidden – token might not belong to a resident');
    } else {
      console.log('⚠️ [Resident] Unexpected response:', complaints.status, complaints.data);
    }
  } catch (error) {
    console.error('❌ [Resident] Failed to fetch complaints');
    console.error('   Error:', error.message);
  }

  console.log('');

  // 5️⃣ Resident: Submit a new complaint
  try {
    const newComplaint = await testEndpoint(
      'POST',
      '/api/resident/complaints',
      {
        title: 'API Test Complaint',
        description: 'This is a test complaint from the API script.',
        category: 'Washroom',
        whichWashroom: 'T2',
        subcategory: 'Flush not working',
        floor: '1',
        room: '',
        priority: 'Medium',
      },
      true
    );

    if (newComplaint.status === 201) {
      console.log('✅ [Resident] Complaint submitted successfully');
      console.log('   Complaint ID:', newComplaint.data.data.id);
    } else {
      console.log('⚠️ [Resident] Unexpected response:', newComplaint.status, newComplaint.data);
    }
  } catch (error) {
    console.error('❌ [Resident] Complaint submission failed');
    console.error('   Error:', error.message);
  }

  console.log('\n🏁 Testing complete!\n');
})();
