// Simple test script to check debt API endpoints
const testDebtAPI = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No authentication token found. Please login first.');
    return;
  }

  console.log('🔑 Token found, testing debt API endpoints...');

  try {
    // Test GET /api/debts
    console.log('📖 Testing GET /api/debts...');
    const getResponse = await fetch('http://localhost:5000/api/debts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📖 GET Response status:', getResponse.status);
    const getData = await getResponse.json();
    console.log('📖 GET Response data:', getData);

    // Test POST /api/debts with sample data
    console.log('➕ Testing POST /api/debts...');
    const testLoan = {
      creditorName: 'Test Bank',
      debtType: 'Personal Loan',
      currentBalance: 50000,
      minimumPayment: 2500,
      interestRate: 12.5,
      dueDate: '15th of every month'
    };

    const postResponse = await fetch('http://localhost:5000/api/debts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testLoan)
    });

    console.log('➕ POST Response status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('➕ POST Response data:', postData);

    if (postResponse.ok) {
      console.log('✅ Debt API is working correctly!');
    } else {
      console.log('❌ Debt API has issues');
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Run the test
testDebtAPI();