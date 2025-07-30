// Test script to check the LLM API directly
// Using native fetch (Node.js 18+)

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

async function testLLMAPI() {
  try {
    console.log('Testing Together AI API...');
    
    if (!TOGETHER_API_KEY) {
      console.log('❌ TOGETHER_API_KEY not found in environment');
      return;
    }
    
    console.log('✅ API key found, testing request...');
    
    const requestBody = {
      model: "mistralai/Mistral-Small-24B-Instruct-2501",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Generate a simple JSON object with a 'test' field set to 'success'. Respond with JSON only."
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
      top_p: 0.9
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success! Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLLMAPI();
