// Debug script to verify ML predictions are using real data
const fetch = require('node-fetch');

async function debugMLPredictions() {
  console.log('🔍 DEBUG: ML Prediction Data Flow');
  console.log('=====================================\n');

  try {
    // Test 1: Check ML service health
    console.log('1️⃣ Testing ML Service Health...');
    const healthResponse = await fetch('http://localhost:8000/health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ ML Service Status:', health.status);
      console.log('📊 Model Loaded:', health.model_loaded);
      console.log('🔖 Version:', health.version || 'Unknown');
    } else {
      console.log('❌ ML Service not responding');
      return;
    }

    // Test 2: Test backend ML integration
    console.log('\n2️⃣ Testing Backend ML Integration...');
    const backendTestResponse = await fetch('http://localhost:5000/api/test-ml');
    if (backendTestResponse.ok) {
      const backendTest = await backendTestResponse.json();
      console.log('✅ Backend Test Status:', backendTest.status);
      
      if (backendTest.data_test) {
        console.log('📊 Data Reception Test:');
        console.log('   - Has Category Data:', backendTest.data_test.analysis.has_category_data);
        console.log('   - Total Daily Categories: ₹', backendTest.data_test.analysis.total_daily_categories);
        console.log('   - Past 7-day Avg: ₹', backendTest.data_test.analysis.past_7day_avg);
        console.log('   - Data Consistency:', backendTest.data_test.analysis.data_consistency);
      }
      
      if (backendTest.sample_prediction) {
        console.log('📈 Sample Prediction:');
        console.log('   - Success:', backendTest.sample_prediction.success);
        console.log('   - Fallback Used:', backendTest.sample_prediction.fallback_used || false);
        console.log('   - Total Weekly: ₹', backendTest.sample_prediction.total_weekly_spend);
        
        if (backendTest.sample_prediction.weekly_predictions) {
          console.log('   - Days Predicted:', backendTest.sample_prediction.weekly_predictions.length);
          const firstDay = backendTest.sample_prediction.weekly_predictions[0];
          if (firstDay) {
            console.log(`   - First Day (${firstDay.day_of_week}): ₹${firstDay.predicted_spend} on ${firstDay.date}`);
          }
        }
      }
    } else {
      console.log('❌ Backend test failed');
    }

    // Test 3: Direct ML service data test
    console.log('\n3️⃣ Testing Direct ML Service Data Reception...');
    const directTestData = {
      age_group: '26-35',
      family_size: 3,
      daily_income: 3000,
      past_7day_avg: 2100,
      food: 600,
      transport: 300,
      bills: 800,
      health: 150,
      education: 100,
      entertainment: 200,
      other: 150,
      debt_amount: 100000,
      monthly_emi: 8000,
      loan_type: 'Home',
      interest_rate: 8.5
    };

    const directDataResponse = await fetch('http://localhost:8000/test-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(directTestData)
    });

    if (directDataResponse.ok) {
      const directTest = await directDataResponse.json();
      console.log('✅ Direct ML Test:', directTest.message);
      console.log('📊 Analysis:');
      console.log('   - Has Category Data:', directTest.analysis.has_category_data);
      console.log('   - Total Daily Categories: ₹', directTest.analysis.total_daily_categories);
      console.log('   - Has Income Data:', directTest.analysis.has_income_data);
      console.log('   - Has Debt Data:', directTest.analysis.has_debt_data);
    }

    // Test 4: Direct prediction with real data
    console.log('\n4️⃣ Testing Direct ML Prediction...');
    const directPredictionResponse = await fetch('http://localhost:8000/predict-weekly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(directTestData)
    });

    if (directPredictionResponse.ok) {
      const prediction = await directPredictionResponse.json();
      console.log('✅ Direct Prediction Success:', prediction.success);
      console.log('📊 Results:');
      console.log('   - Fallback Used:', prediction.fallback_used || false);
      console.log('   - Model Accuracy:', prediction.model_accuracy + '%');
      console.log('   - Total Weekly: ₹', prediction.total_weekly_spend);
      console.log('   - Weekly Budget: ₹', prediction.weekly_budget);
      
      if (prediction.input_data_used) {
        console.log('📈 Input Data Verification:');
        console.log('   - Food Avg: ₹', prediction.input_data_used.food_avg);
        console.log('   - Transport Avg: ₹', prediction.input_data_used.transport_avg);
        console.log('   - Entertainment Avg: ₹', prediction.input_data_used.entertainment_avg);
        console.log('   - Bills Avg: ₹', prediction.input_data_used.bills_avg);
      }
    } else {
      const error = await directPredictionResponse.text();
      console.log('❌ Direct prediction failed:', error);
    }

    console.log('\n✅ Debug completed!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugMLPredictions();