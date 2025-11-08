/**
 * Simple API test script
 * Run: node test-api.js
 */
const http = require('http');

const testEndpoint = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

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
  console.log('🧪 Testing API endpoints...\n');

  // Test health endpoint
  try {
    const health = await testEndpoint('GET', '/health');
    console.log('✅ Health check:', health.status === 200 ? 'PASS' : 'FAIL');
    console.log('   Response:', health.data);
  } catch (error) {
    console.log('❌ Health check failed - Server might not be running');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  console.log('');

  // Test login endpoint (should fail with validation error, not 404)
  try {
    const login = await testEndpoint('POST', '/api/auth/login', {
      email: 'test@test.com',
      password: 'test123'
    });
    if (login.status === 404) {
      console.log('❌ Login endpoint: Route not found (404)');
      console.log('   This means the route is not registered properly');
    } else if (login.status === 400 || login.status === 401) {
      console.log('✅ Login endpoint: Route found (got validation/auth error, not 404)');
      console.log('   Status:', login.status);
      console.log('   Message:', login.data.message);
    } else {
      console.log('⚠️  Login endpoint: Unexpected status', login.status);
      console.log('   Response:', login.data);
    }
  } catch (error) {
    console.log('❌ Login endpoint test failed');
    console.log('   Error:', error.message);
  }

  console.log('');

  // Test register endpoint
  try {
    const register = await testEndpoint('POST', '/api/auth/register', {
      email: 'test@test.com',
      password: 'test123',
      full_name: 'Test User',
      role: 'resident'
    });
    if (register.status === 404) {
      console.log('❌ Register endpoint: Route not found (404)');
    } else {
      console.log('✅ Register endpoint: Route found');
      console.log('   Status:', register.status);
      console.log('   Message:', register.data.message);
    }
  } catch (error) {
    console.log('❌ Register endpoint test failed');
    console.log('   Error:', error.message);
  }

  console.log('\n✅ Testing complete!');
})();

