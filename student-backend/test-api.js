const http = require('http');

// Test function to check if server is running
function testServer() {
  const options = {
    hostname: 'localhost',
    port: 8084,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response:', data);
      if (res.statusCode === 200) {
        console.log('✅ Backend server is running successfully!');
      } else {
        console.log('❌ Backend server is not responding correctly');
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Cannot connect to backend server:', error.message);
    console.log('Make sure the server is running on port 8084');
  });

  req.end();
}

// Test registration endpoint
function testRegistration() {
  const postData = JSON.stringify({
    rollNo: 12345,
    name: 'Test Student',
    program: 'B.Tech',
    requiredCredits: 120,
    password: 'testpassword123'
  });

  const options = {
    hostname: 'localhost',
    port: 8084,
    path: '/api/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Registration Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Registration Response:', data);
    });
  });

  req.on('error', (error) => {
    console.log('❌ Registration test failed:', error.message);
  });

  req.write(postData);
  req.end();
}

console.log('🧪 Testing Backend API...\n');

// Test server health
console.log('1. Testing server health...');
testServer();

// Wait a bit then test registration
setTimeout(() => {
  console.log('\n2. Testing student registration...');
  testRegistration();
}, 2000);








