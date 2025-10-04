'use client'

import { useState } from 'react'

export default function OnboardingModal({ isOpen, onComplete, userName }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // User Profile (Step 1)
    ageGroup: '',
    familySize: '',
    monthlyIncome: '',
    
    // Debt Information (Step 2)
    debtAmount: '',
    loanType: '',
    interestRate: '',
    loanTenureMonths: '',
    remainingTenureMonths: '',
    monthlyEMI: '',
    
    // Preferences (Step 3)
    notificationPreferences: {
      email: true,
      push: true,
      sms: false
    },
    preferredCurrency: 'INR',
    darkMode: true,
    
    // Additional Info
    occupation: '',
    hasExistingInvestments: '',
    riskTolerance: '',
    primaryGoal: '',
    monthlyBudget: '',
    savingsTarget: '',
    investmentExperience: ''
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No token found')
        alert('Session expired. Please log in again.')
        return
      }

      // Calculate dailyIncome from monthlyIncome (required for ML model)
      const monthlyIncome = parseFloat(formData.monthlyIncome) || 0
      const dailyIncome = monthlyIncome > 0 ? Math.round(monthlyIncome / 30) : 0

      // Prepare profile data with all fields
      const profileData = {
        // Core fields for ML model
        ageGroup: formData.ageGroup,
        familySize: parseInt(formData.familySize) || 1,
        dailyIncome: dailyIncome,  // Calculated from monthly
        monthlyIncome: monthlyIncome,
        
        // Debt information (stored in Profile model)
        hasDebt: formData.debtAmount && parseFloat(formData.debtAmount) > 0,
        debtAmount: parseFloat(formData.debtAmount) || 0,
        loanType: formData.loanType || 'None',
        interestRate: parseFloat(formData.interestRate) || 0,
        loanTenureMonths: parseInt(formData.loanTenureMonths) || 0,
        remainingTenureMonths: parseInt(formData.remainingTenureMonths) || 0,
        monthlyEMI: parseFloat(formData.monthlyEMI) || 0,
        
        // Additional profile info
        occupation: formData.occupation,
        primaryGoal: formData.primaryGoal,
        riskTolerance: formData.riskTolerance,
        monthlyBudget: parseFloat(formData.monthlyBudget) || 0,
        savingsTarget: parseFloat(formData.savingsTarget) || 0,
        investmentExperience: formData.investmentExperience,
        hasExistingInvestments: formData.hasExistingInvestments === 'yes',
        
        // Preferences
        notificationPreferences: formData.notificationPreferences,
        preferredCurrency: formData.preferredCurrency,
        darkMode: formData.darkMode,
        
        // Profile completion flag
        profileCompleted: true
      }

      console.log('Saving profile data:', profileData)

      // Save profile data
      const profileResponse = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      if (!profileResponse.ok) {
        const error = await profileResponse.json()
        console.error('Profile save error:', error)
        throw new Error(error.message || 'Failed to save profile')
      }

      const profileResult = await profileResponse.json()
      console.log('✓ Profile saved:', profileResult)

      // Save debt data separately if provided
      if (formData.debtAmount && parseFloat(formData.debtAmount) > 0) {
        const debtData = {
          debts: [{
            creditorName: formData.loanType || 'Personal Loan',
            debtType: formData.loanType || 'Personal Loan',
            currentBalance: parseFloat(formData.debtAmount) || 0,
            minimumPayment: parseFloat(formData.monthlyEMI) || 0,
            interestRate: parseFloat(formData.interestRate) || 0,
            dueDate: new Date(Date.now() + (parseInt(formData.remainingTenureMonths) || 12) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }]
        }

        console.log('Saving debt data:', debtData)

        const debtResponse = await fetch('http://localhost:5000/api/debts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(debtData)
        })

        if (debtResponse.ok) {
          const debtResult = await debtResponse.json()
          console.log('✓ Debt saved:', debtResult)
        } else {
          console.error('Failed to save debt data')
        }
      }

      // Success! Complete onboarding
      console.log('✓ Onboarding completed successfully')
      onComplete()

    } catch (error) {
      console.error('Error saving onboarding data:', error)
      alert('Failed to save your information. Please try again.')
      // Don't complete if there's an error - let user retry
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome, {userName}! 👋
              </h2>
              <p className="text-gray-400">
                Let's set up your financial profile to provide personalized recommendations
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Step {step} of 3</div>
              <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: User Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                <p className="text-gray-400 mb-6">Tell us about yourself to help us understand your financial situation better.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Age Group <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="">Select age group</option>
                    <option value="18-25">18-25 years</option>
                    <option value="26-35">26-35 years</option>
                    <option value="36-45">36-45 years</option>
                    <option value="46-60">46-60 years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Family Size <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="familySize"
                    value={formData.familySize}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="">Select family size</option>
                    <option value="1">Just me</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4 people</option>
                    <option value="5">5+ people</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly Income (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 50000"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                  {formData.monthlyIncome && (
                    <p className="text-xs text-gray-400 mt-1">
                      Daily Income: ₹{Math.round(formData.monthlyIncome / 30).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Teacher"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Financial Goal
                  </label>
                  <select
                    name="primaryGoal"
                    value={formData.primaryGoal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="">Select your main goal</option>
                    <option value="debt-payoff">Pay off debt</option>
                    <option value="emergency-fund">Build emergency fund</option>
                    <option value="saving">Save for future</option>
                    <option value="investment">Investment growth</option>
                    <option value="retirement">Retirement planning</option>
                    <option value="home-buying">Buy a home</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Risk Tolerance
                  </label>
                  <select
                    name="riskTolerance"
                    value={formData.riskTolerance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="">Select risk level</option>
                    <option value="conservative">Conservative (Low risk)</option>
                    <option value="moderate">Moderate (Medium risk)</option>
                    <option value="aggressive">Aggressive (High risk)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Debt Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Debt Information</h3>
                <p className="text-gray-400 mb-6">Help us understand your current debt situation to provide better financial advice.</p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  💡 <strong>Optional:</strong> You can skip this section if you don't have any current debts. This information helps us provide personalized debt management strategies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Debt Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="debtAmount"
                    value={formData.debtAmount}
                    onChange={handleInputChange}
                    placeholder="e.g., 200000 (Leave empty if no debt)"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Loan Type
                  </label>
                  <select
                    name="loanType"
                    value={formData.loanType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="">Select loan type</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interest Rate (% per annum)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    placeholder="e.g., 12.5"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Original Loan Tenure (months)
                  </label>
                  <input
                    type="number"
                    name="loanTenureMonths"
                    value={formData.loanTenureMonths}
                    onChange={handleInputChange}
                    placeholder="e.g., 60"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Remaining Tenure (months)
                  </label>
                  <input
                    type="number"
                    name="remainingTenureMonths"
                    value={formData.remainingTenureMonths}
                    onChange={handleInputChange}
                    placeholder="e.g., 36"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    name="monthlyEMI"
                    value={formData.monthlyEMI}
                    onChange={handleInputChange}
                    placeholder="e.g., 4500"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Debt Summary */}
              {formData.debtAmount && formData.monthlyEMI && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Debt Summary</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Total Debt: ₹{parseInt(formData.debtAmount).toLocaleString()}</p>
                    <p>Monthly Payment: ₹{parseInt(formData.monthlyEMI).toLocaleString()}</p>
                    {formData.monthlyIncome && (
                      <p>Debt-to-Income Ratio: {((formData.monthlyEMI / formData.monthlyIncome) * 100).toFixed(1)}%</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Preferences & Settings</h3>
                <p className="text-gray-400 mb-6">Customize your experience and notification preferences.</p>
              </div>

              <div className="space-y-6">
                {/* Notification Preferences */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-300 font-medium">Email Notifications</label>
                        <p className="text-sm text-gray-400">Receive updates and reminders via email</p>
                      </div>
                      <input
                        type="checkbox"
                        name="notificationPreferences.email"
                        checked={formData.notificationPreferences.email}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-300 font-medium">Push Notifications</label>
                        <p className="text-sm text-gray-400">Get instant alerts on your device</p>
                      </div>
                      <input
                        type="checkbox"
                        name="notificationPreferences.push"
                        checked={formData.notificationPreferences.push}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-300 font-medium">SMS Notifications</label>
                        <p className="text-sm text-gray-400">Receive text messages for important updates</p>
                      </div>
                      <input
                        type="checkbox"
                        name="notificationPreferences.sms"
                        checked={formData.notificationPreferences.sms}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Currency
                    </label>
                    <select
                      name="preferredCurrency"
                      value={formData.preferredCurrency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monthly Budget (₹)
                    </label>
                    <input
                      type="number"
                      name="monthlyBudget"
                      value={formData.monthlyBudget}
                      onChange={handleInputChange}
                      placeholder="e.g., 30000"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monthly Savings Target (₹)
                    </label>
                    <input
                      type="number"
                      name="savingsTarget"
                      value={formData.savingsTarget}
                      onChange={handleInputChange}
                      placeholder="e.g., 10000"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Investment Experience
                    </label>
                    <select
                      name="investmentExperience"
                      value={formData.investmentExperience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner (0-1 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="experienced">Experienced (5+ years)</option>
                      <option value="expert">Expert (10+ years)</option>
                    </select>
                  </div>
                </div>

                {/* Theme Preference */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-gray-300 font-medium">Dark Mode</label>
                    <p className="text-sm text-gray-400">Use dark theme for better viewing experience</p>
                  </div>
                  <input
                    type="checkbox"
                    name="darkMode"
                    checked={formData.darkMode}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="px-6 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-8 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-medium"
            >
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
