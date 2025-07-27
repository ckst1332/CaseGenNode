// Quick test script to see what the user API returns
const testUserAPI = async () => {
  try {
    // Test the local API
    const response = await fetch('http://localhost:3000/api/users/me', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Local API response:', data);
    } else {
      console.log('Local API error:', response.status, await response.text());
    }
  } catch (error) {
    console.log('Local API fetch error:', error.message);
  }
  
  try {
    // Test the deployed API (will fail without auth but shows the endpoint is reachable)
    const response = await fetch('https://case-gen-next.vercel.app/api/users/me');
    console.log('Deployed API status:', response.status);
    if (response.status === 500) {
      console.log('Deployed API returned 500 - likely auth issue which is expected');
    }
  } catch (error) {
    console.log('Deployed API fetch error:', error.message);
  }
};

testUserAPI();
