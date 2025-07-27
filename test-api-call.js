// Test script to verify the test user logic
console.log('Testing isTestUser function...');

// Simulate the function from the API
const TEST_USER_EMAIL = "jeff.sit13@gmail.com";
const isTestUser = (email) => {
  return email === TEST_USER_EMAIL;
};

const DEFAULT_CREDITS = {
  free: 3,
  basic: 50,
  pro: 999,
  test: 999999
};

// Test the logic
const testEmail = "jeff.sit13@gmail.com";
const result = isTestUser(testEmail);

console.log(`Email: ${testEmail}`);
console.log(`Is test user: ${result}`);
console.log(`Credits would be: ${result ? DEFAULT_CREDITS.test : DEFAULT_CREDITS.free}`);

// Test with a different email
const regularEmail = "test@example.com";
const regularResult = isTestUser(regularEmail);

console.log(`\nRegular email: ${regularEmail}`);
console.log(`Is test user: ${regularResult}`);
console.log(`Credits would be: ${regularResult ? DEFAULT_CREDITS.test : DEFAULT_CREDITS.free}`);

// Test the deployed API by making a request to a test endpoint
async function testDeployedAPI() {
  try {
    console.log('\n--- Testing Deployed API ---');
    
    // Test the debug endpoint if it exists
    const response = await fetch('https://case-gen-next.vercel.app/api/debug/user-info');
    console.log('Debug endpoint status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ API is working - returns 401 Unauthorized as expected (no session)');
    } else {
      console.log('Response:', await response.text());
    }
    
    // Test the main endpoint
    const mainResponse = await fetch('https://case-gen-next.vercel.app/api/users/me');
    console.log('Main endpoint status:', mainResponse.status);
    
    if (mainResponse.status === 401) {
      console.log('✅ Main API is working - returns 401 Unauthorized as expected (no session)');
    }
    
  } catch (error) {
    console.log('API test error:', error.message);
  }
}

testDeployedAPI();
