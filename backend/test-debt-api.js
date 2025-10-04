const mongoose = require('mongoose');

// Test the debt API endpoint
const testDebtAPI = async () => {
  try {
    console.log('Testing debt API...');
    
    // Test data
    const testData = {
      creditorName: "Test Bank",
      debtType: "Personal Loan",
      currentBalance: 50000,
      minimumPayment: 2500,
      interestRate: 12.5,
      dueDate: "15th of every month"
    };

    // Make a request to the API (you'll need to replace with actual token)
    const response = await fetch('http://localhost:5000/api/debts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Response:', result);
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

console.log('Use this to test: node test-debt-api.js');
console.log('Make sure to replace YOUR_TOKEN_HERE with a real token from localStorage');