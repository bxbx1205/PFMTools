// Test script for onboarding form - Run this in browser console after signup
const testOnboardingFlow = () => {
  console.log('🧪 Testing Onboarding Flow');
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No token found. Please sign up/login first.');
    return;
  }
  
  console.log('✅ User authenticated');
  
  // Check if onboarding modal appears
  const modal = document.querySelector('[data-testid="onboarding-modal"]');
  if (modal) {
    console.log('✅ Onboarding modal is visible');
  } else {
    console.log('ℹ️ Onboarding modal not visible (user may have completed onboarding)');
  }
  
  // Test profile creation with sample data
  const sampleProfileData = {
    ageGroup: '25-34',
    familySize: '2',
    dailyIncome: '1667',
    monthlyIncome: '50000',
    debtAmount: '100000',
    loanType: 'Personal Loan',
    interestRate: '12.5',
    loanTenureMonths: '60',
    remainingTenureMonths: '36',
    monthlyEMI: '2500',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false
    },
    preferredCurrency: 'INR',
    darkMode: true,
    occupation: 'Software Engineer',
    hasExistingInvestments: 'yes',
    riskTolerance: 'moderate',
    primaryGoal: 'debt-payoff',
    monthlyBudget: '40000',
    savingsTarget: '10000',
    investmentExperience: 'intermediate'
  };
  
  console.log('📝 Sample profile data:', sampleProfileData);
  console.log('🎯 Test this data in the onboarding form to verify it works!');
};

// Auto-run the test
testOnboardingFlow();