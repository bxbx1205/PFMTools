const fetch = require('node-fetch');

async function testMLService() {
  console.log('Testing ML Service...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:8000/health');
    console.log('Health status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
    }
    
    // Test prediction endpoint
    console.log('\n2. Testing prediction endpoint...');
    const testData = {
      age_group: '26-35',
      family_size: 2,
      daily_income: 2000,
      past_7day_avg: 1500
    };
    
    const predictionResponse = await fetch('http://localhost:8000/predict-weekly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Prediction status:', predictionResponse.status);
    if (predictionResponse.ok) {
      const predictionData = await predictionResponse.json();
      console.log('Prediction data:', JSON.stringify(predictionData, null, 2));
    } else {
      const errorText = await predictionResponse.text();
      console.log('Prediction error:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testMLService();