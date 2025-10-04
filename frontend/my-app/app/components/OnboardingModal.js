'use client'

import { useState } from 'react'

export default function OnboardingModal({ isOpen, onComplete, userName }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // User Profile (Step 1)
    ageGroup: '',
    familySize: '',
    dailyIncome: '',
    
    // Debt Information (Step 2)
    debtAmount: '',
    loanType: '',
    interestRate: '',
    loanTenureMonths: '',
    remainingTenureMonths: '',
    monthlyEMI: '',
    
    // Preferences (Step 3 - keeping same)
    notificationPreferences: {
      email: true,
      push: true,
      sms: false
    },
    preferredCurrency: 'INR',
    darkMode: true,
    
    // Additional Info (keeping from old Step 2)
    occupation: '',
    monthlyIncome: '',
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

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (token) {
        // Save profile data to backend
        const profileData = {
          ageGroup: formData.ageGroup,
          familySize: parseInt(formData.familySize) || null,
          dailyIncome: parseFloat(formData.dailyIncome) || null,
          monthlyIncome: parseFloat(formData.monthlyIncome) || null,
          occupation: formData.occupation,
          hasExistingInvestments: formData.hasExistingInvestments,
          riskTolerance: formData.riskTolerance,
          primaryGoal: formData.primaryGoal,
          monthlyBudget: parseFloat(formData.monthlyBudget) || null,
          savingsTarget: parseFloat(formData.savingsTarget) || null,
          investmentExperience: formData.investmentExperience,
          notificationPreferences: formData.notificationPreferences,
          preferredCurrency: formData.preferredCurrency,
          darkMode: formData.darkMode
        }

        // Save profile
        await fetch('http://localhost:5000/api/profile/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        })

        // Save debt information if provided
        if (formData.loanType && formData.loanType !== '') {
          const debtData = {
            loanType: formData.loanType,
            debtAmount: parseFloat(formData.debtAmount) || 0,
            interestRate: parseFloat(formData.interestRate) || 0,
            loanTenureMonths: parseInt(formData.loanTenureMonths) || 0,
            remainingTenureMonths: parseInt(formData.remainingTenureMonths) || 0,
            monthlyEMI: parseFloat(formData.monthlyEMI) || 0
          }

          await fetch('http://localhost:5000/api/debt/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(debtData)
          })
        }

        // Mark onboarding as complete
        await fetch('http://localhost:5000/api/profile/complete-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error)
    }

    // Save locally as backup
    localStorage.setItem('onboardingData', JSON.stringify(formData))
    localStorage.setItem('onboardingCompleted', 'true')
    localStorage.removeItem('isFirstTimeUser')
    onComplete()
  }

  if (!isOpen) return null

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          animation: modalFadeIn 0.4s ease-out;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }

        .modal-container {
          background: linear-gradient(135deg, rgba(20, 28, 45, 0.98) 0%, rgba(23, 28, 43, 0.98) 100%);
          backdrop-filter: blur(28px);
          border-radius: 28px;
          padding: 4rem;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 32px 64px rgba(0, 0, 0, 0.5),
            0 16px 48px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          position: relative;
          animation: modalSlideIn 0.5s ease-out 0.1s both;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, rgba(0, 200, 150, 0.8) 20%, rgba(0, 200, 150, 1) 50%, rgba(0, 200, 150, 0.8) 80%, transparent 100%);
          border-radius: 28px 28px 0 0;
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 12px 40px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          position: relative;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
        }

        .modal-header::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00C896, transparent);
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #00C896 30%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
          text-shadow: 0 0 40px rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .welcome-subtitle {
          color: #94a3b8;
          font-size: 1.25rem;
          font-weight: 400;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 3rem;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(0, 200, 150, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(0, 200, 150, 0.1);
        }

        .step-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(71, 85, 105, 0.5);
          transition: all 0.4s ease;
          position: relative;
          cursor: pointer;
        }

        .step-dot.active {
          background: linear-gradient(135deg, #00C896 0%, #00B87C 100%);
          width: 40px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 200, 150, 0.4);
        }

        .step-dot.active::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }

        .step-content {
          margin-bottom: 3rem;
        }

        .step-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 2rem;
          text-align: center;
          position: relative;
          padding-bottom: 1rem;
        }

        .step-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00C896, transparent);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 2rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #e2e8f0;
          font-size: 0.95rem;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 1.25rem 1.5rem;
          border: 1.5px solid rgba(71, 85, 105, 0.5);
          border-radius: 16px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: all 0.3s ease;
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(12px);
          font-family: inherit;
          color: #f8fafc;
          min-height: 58px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #00C896;
          box-shadow: 
            0 0 0 3px rgba(0, 200, 150, 0.15),
            0 4px 20px rgba(0, 200, 150, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.1);
          background: rgba(30, 41, 59, 0.8);
          transform: translateY(-1px);
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 12px;
          background: rgba(30, 41, 59, 0.3);
          transition: all 0.3s ease;
        }

        .checkbox-item:hover {
          background: rgba(30, 41, 59, 0.5);
          border-color: rgba(71, 85, 105, 0.5);
        }

        .checkbox-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #00C896;
        }

        .checkbox-label {
          color: #e2e8f0;
          font-weight: 500;
          cursor: pointer;
        }

        .radio-group {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .radio-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 16px;
          background: rgba(30, 41, 59, 0.3);
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .radio-item:hover {
          background: rgba(30, 41, 59, 0.5);
          border-color: rgba(0, 200, 150, 0.4);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .radio-item.selected {
          background: rgba(0, 200, 150, 0.15);
          border-color: #00C896;
          box-shadow: 0 4px 20px rgba(0, 200, 150, 0.2);
        }

        .radio-item input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #00C896;
        }

        .radio-label {
          color: #e2e8f0;
          font-weight: 500;
          flex: 1;
        }

        .button-group {
          display: flex;
          gap: 1.5rem;
          justify-content: space-between;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(71, 85, 105, 0.2);
        }

        .btn {
          padding: 1.25rem 2.5rem;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          min-height: 60px;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-secondary {
          background: rgba(71, 85, 105, 0.4);
          color: #cbd5e1;
          border: 1px solid rgba(71, 85, 105, 0.6);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .btn-secondary:hover {
          background: rgba(71, 85, 105, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #00C896 0%, #00B87C 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(0, 200, 150, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(0, 200, 150, 0.4);
        }

        .btn-complete {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
        }

        .btn-complete:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(139, 92, 246, 0.4);
        }

        .skip-link {
          position: absolute;
          top: 2rem;
          right: 2rem;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          transition: all 0.2s ease;
          background: rgba(71, 85, 105, 0.1);
          border: 1px solid rgba(71, 85, 105, 0.2);
        }

        .skip-link:hover {
          color: #cbd5e1;
          background: rgba(71, 85, 105, 0.3);
          border-color: rgba(71, 85, 105, 0.4);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 1rem;
          }

          .modal-container {
            padding: 2.5rem 2rem;
            margin: 0.5rem;
            max-height: 95vh;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .button-group {
            flex-direction: column;
            gap: 1rem;
          }

          .welcome-title {
            font-size: 2rem;
          }

          .step-title {
            font-size: 1.5rem;
          }

          .step-indicator {
            padding: 1rem;
            gap: 1rem;
          }

          .btn {
            padding: 1rem 2rem;
            font-size: 1rem;
          }

          .skip-link {
            top: 1rem;
            right: 1rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .modal-container {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .welcome-title {
            font-size: 1.75rem;
          }

          .step-indicator {
            margin-bottom: 2rem;
          }

          .form-input,
          .form-select {
            padding: 1rem 1.25rem;
            min-height: 52px;
          }
        }
      `}</style>

      <div className="modal-overlay">
        <div className="modal-container">
          <button className="skip-link" onClick={handleComplete}>
            Skip for now →
          </button>

          <div className="modal-header">
            <h1 className="welcome-title">Welcome, {userName}! 👋</h1>
            <p className="welcome-subtitle">
              Let's personalize your experience in just a few steps
            </p>
          </div>

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
          </div>

          <div className="step-content">
            {step === 1 && (
              <>
                <h2 className="step-title">User Profile</h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Age Group</label>
                    <select
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select age group</option>
                      <option value="18-25">18-25 years</option>
                      <option value="26-35">26-35 years</option>
                      <option value="36-45">36-45 years</option>
                      <option value="46-60">46-60 years</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Family Size</label>
                    <input
                      type="number"
                      name="familySize"
                      value={formData.familySize}
                      onChange={handleInputChange}
                      placeholder="Number of family members"
                      className="form-input"
                      min="1"
                      max="20"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Income (₹)</label>
                  <input
                    type="number"
                    name="dailyIncome"
                    value={formData.dailyIncome}
                    onChange={handleInputChange}
                    placeholder="Your average daily income"
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="step-title">Debt Information</h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Loan Type</label>
                    <select
                      name="loanType"
                      value={formData.loanType}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select loan type</option>
                      <option value="None">No existing loan</option>
                      <option value="Personal">Personal Loan</option>
                      <option value="Home">Home Loan</option>
                      <option value="Vehicle">Vehicle Loan</option>
                      <option value="Education">Education Loan</option>
                      <option value="Business">Business Loan</option>
                      <option value="Gold">Gold Loan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Debt Amount (₹)</label>
                    <input
                      type="number"
                      name="debtAmount"
                      value={formData.debtAmount}
                      onChange={handleInputChange}
                      placeholder="Outstanding loan amount"
                      className="form-input"
                      min="0"
                      step="0.01"
                      disabled={formData.loanType === 'None'}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Interest Rate (%)</label>
                    <input
                      type="number"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      placeholder="Annual interest rate"
                      className="form-input"
                      min="0"
                      max="50"
                      step="0.01"
                      disabled={formData.loanType === 'None'}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly EMI (₹)</label>
                    <input
                      type="number"
                      name="monthlyEMI"
                      value={formData.monthlyEMI}
                      onChange={handleInputChange}
                      placeholder="Monthly EMI amount"
                      className="form-input"
                      min="0"
                      step="0.01"
                      disabled={formData.loanType === 'None'}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Original Tenure (Months)</label>
                    <input
                      type="number"
                      name="loanTenureMonths"
                      value={formData.loanTenureMonths}
                      onChange={handleInputChange}
                      placeholder="Total loan period"
                      className="form-input"
                      min="1"
                      max="360"
                      disabled={formData.loanType === 'None'}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Remaining Tenure (Months)</label>
                    <input
                      type="number"
                      name="remainingTenureMonths"
                      value={formData.remainingTenureMonths}
                      onChange={handleInputChange}
                      placeholder="Months left to repay"
                      className="form-input"
                      min="0"
                      max={formData.loanTenureMonths || 360}
                      disabled={formData.loanType === 'None'}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="step-title">Preferences & Additional Info</h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Engineer"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Income (₹)</label>
                    <input
                      type="number"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange}
                      placeholder="e.g., 80000"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Financial Goal</label>
                  <div className="radio-group">
                    {[
                      'Build an emergency fund',
                      'Save for a specific purchase',
                      'Invest for retirement',
                      'Pay off debt faster',
                      'Generate passive income'
                    ].map((goal) => (
                      <label key={goal} className={`radio-item ${formData.primaryGoal === goal ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="primaryGoal"
                          value={goal}
                          checked={formData.primaryGoal === goal}
                          onChange={handleInputChange}
                        />
                        <span className="radio-label">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notification Preferences</label>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        name="notificationPreferences.email"
                        checked={formData.notificationPreferences.email}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-label">Email notifications</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        name="notificationPreferences.push"
                        checked={formData.notificationPreferences.push}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-label">Push notifications</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        name="notificationPreferences.sms"
                        checked={formData.notificationPreferences.sms}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-label">SMS notifications</span>
                    </label>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Preferred Currency</label>
                    <select
                      name="preferredCurrency"
                      value={formData.preferredCurrency}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Budget (₹)</label>
                    <input
                      type="number"
                      name="monthlyBudget"
                      value={formData.monthlyBudget}
                      onChange={handleInputChange}
                      placeholder="e.g., 50000"
                      className="form-input"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="button-group">
            {step > 1 && (
              <button onClick={prevStep} className="btn btn-secondary">
                ← Previous
              </button>
            )}
            
            {step < 3 ? (
              <button onClick={nextStep} className="btn btn-primary" style={{marginLeft: 'auto'}}>
                Continue →
              </button>
            ) : (
              <button onClick={handleComplete} className="btn btn-complete" style={{marginLeft: 'auto'}}>
                Complete Setup 🎉
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}