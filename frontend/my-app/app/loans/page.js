'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Loans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // EMI Calculator form state
  const [loanForm, setLoanForm] = useState({
    creditorName: '',
    debtType: '',
    loanAmount: '',
    tenureMonths: '',
    interestRate: '',
    dueDate: ''
  })

  // EMI Calculation results
  const [emiResults, setEmiResults] = useState({
    emi: 0,
    totalPayment: 0,
    totalInterest: 0,
    monthlyBreakdown: []
  })

  // Form errors state
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    checkAuth()
    loadLoans()
  }, [])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showAddModal) {
          setShowAddModal(false)
          setEditingLoan(null)
          resetForm()
        }
        if (showDeleteModal) {
          setShowDeleteModal(null)
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showAddModal, showDeleteModal])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return false
    }
    return true
  }

  const loadLoans = async () => {
    if (!checkAuth()) return

    try {
      setError(null)
      const token = localStorage.getItem('token')
      console.log('Loading loans with token:', token ? 'present' : 'missing')
      
      const response = await fetch('http://localhost:5000/api/debts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('Load loans response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Loaded loans data:', data)
        setLoans(data.debts || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error('Failed to load loans:', response.status, errorData)
        setError('Failed to load loans. Please try again.')
      }
    } catch (error) {
      console.error('Error loading loans:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setLoanForm({
      creditorName: '',
      debtType: '',
      loanAmount: '',
      tenureMonths: '',
      interestRate: '',
      dueDate: ''
    })
    setFormErrors({})
    setEmiResults({
      emi: 0,
      totalPayment: 0,
      totalInterest: 0,
      monthlyBreakdown: []
    })
  }

  const calculateEMI = () => {
    const principal = parseFloat(loanForm.loanAmount) || 0
    const annualRate = parseFloat(loanForm.interestRate) || 0
    const months = parseInt(loanForm.tenureMonths) || 0

    if (principal <= 0 || annualRate < 0 || months <= 0) {
      setEmiResults({
        emi: 0,
        totalPayment: 0,
        totalInterest: 0,
        monthlyBreakdown: []
      })
      return
    }

    // Monthly interest rate
    const monthlyRate = annualRate / 12 / 100

    // EMI calculation using formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    let emi = 0
    if (monthlyRate > 0) {
      const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months)
      const denominator = Math.pow(1 + monthlyRate, months) - 1
      emi = numerator / denominator
    } else {
      // If interest rate is 0, simple division
      emi = principal / months
    }

    const totalPayment = emi * months
    const totalInterest = totalPayment - principal

    // Generate monthly breakdown
    const monthlyBreakdown = []
    let remainingPrincipal = principal

    for (let i = 1; i <= months; i++) {
      const interestPayment = remainingPrincipal * monthlyRate
      const principalPayment = emi - interestPayment
      remainingPrincipal -= principalPayment

      monthlyBreakdown.push({
        month: i,
        emi: emi,
        principalPayment: principalPayment,
        interestPayment: interestPayment,
        remainingBalance: Math.max(0, remainingPrincipal)
      })
    }

    setEmiResults({
      emi,
      totalPayment,
      totalInterest,
      monthlyBreakdown
    })
  }

  // Calculate EMI when loan details change
  useEffect(() => {
    calculateEMI()
  }, [loanForm.loanAmount, loanForm.tenureMonths, loanForm.interestRate])

  const validateForm = () => {
    const errors = {}
    
    if (!loanForm.creditorName.trim()) {
      errors.creditorName = 'Creditor name is required'
    }
    
    if (!loanForm.debtType.trim()) {
      errors.debtType = 'Debt type is required'
    }
    
    if (!loanForm.loanAmount || parseFloat(loanForm.loanAmount) <= 0) {
      errors.loanAmount = 'Valid loan amount is required'
    }
    
    if (!loanForm.tenureMonths || parseInt(loanForm.tenureMonths) <= 0) {
      errors.tenureMonths = 'Valid tenure is required'
    }
    
    if (loanForm.interestRate && parseFloat(loanForm.interestRate) < 0) {
      errors.interestRate = 'Interest rate cannot be negative'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checkAuth() || !validateForm()) return

    setSubmitting(true)
    console.log('Submitting loan form:', loanForm)

    try {
      const token = localStorage.getItem('token')
      const url = editingLoan 
        ? `http://localhost:5000/api/debts/${editingLoan._id}`
        : 'http://localhost:5000/api/debts'
      
      const method = editingLoan ? 'PUT' : 'POST'

      // Prepare data exactly as Debt model expects
      const requestBody = {
        creditorName: loanForm.creditorName.trim(),
        debtType: loanForm.debtType.trim(),
        currentBalance: parseFloat(loanForm.loanAmount) || 0,
        minimumPayment: emiResults.emi || 0,
        interestRate: parseFloat(loanForm.interestRate) || 0,
        dueDate: loanForm.dueDate.trim()
      }

      console.log('Request details:', { url, method, requestBody })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('Success response:', responseData)
        await loadLoans()
        setShowAddModal(false)
        setEditingLoan(null)
        resetForm()
        // Note: Using alert is not ideal for production, consider using a toast notification
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setError(`Failed to save loan: ${errorText}`)
      }
    } catch (error) {
      console.error('Network error:', error)
      setError(`Network error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (loan) => {
    setEditingLoan(loan)
    setLoanForm({
      creditorName: loan.creditorName || '',
      debtType: loan.debtType || '',
      loanAmount: loan.currentBalance?.toString() || '',
      tenureMonths: '',
      interestRate: loan.interestRate?.toString() || '',
      dueDate: loan.dueDate || ''
    })
    setFormErrors({})
    setShowAddModal(true)
  }

  const handleDelete = async (loanId) => {
    if (!checkAuth()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/debts/${loanId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        await loadLoans()
        setShowDeleteModal(null)
      } else {
        const errorText = await response.text()
        console.error('Delete error:', errorText)
        setError(`Failed to delete loan: ${errorText}`)
      }
    } catch (error) {
      console.error('Error deleting loan:', error)
      setError(`Error: ${error.message}`)
    }
  }

  const calculateTotalDebt = () => {
    return loans.reduce((total, loan) => total + (loan.currentBalance || 0), 0)
  }

  const calculateTotalMinPayments = () => {
    return loans.reduce((total, loan) => total + (loan.minimumPayment || 0), 0)
  }

  const calculateAverageInterest = () => {
    if (loans.length === 0) return 0
    const totalInterest = loans.reduce((total, loan) => total + (loan.interestRate || 0), 0)
    return totalInterest / loans.length
  }

  const getDebtTypeColor = (type) => {
    const colors = {
      'Credit Card': 'bg-red-500',
      'Personal Loan': 'bg-blue-500',
      'Home Loan': 'bg-green-500',
      'Car Loan': 'bg-purple-500',
      'Student Loan': 'bg-yellow-500',
      'Business Loan': 'bg-indigo-500',
      'Other': 'bg-gray-500'
    }
    return colors[type] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        {/* Neural Network Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-cyan-900/10"></div>
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-violet-400/20 to-cyan-400/20 animate-float"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                animationDuration: Math.random() * 10 + 10 + 's'
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500 animate-spin"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Debt Portfolio...</h2>
          <p className="text-slate-400 font-medium">Analyzing your financial obligations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Enhanced Styles with proper animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
        }
        
        .glass-morphism {
          background: rgba(15, 15, 24, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .card-hover {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(139, 92, 246, 0.15);
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.7;
          }
          33% { 
            transform: translateY(-20px) rotate(1deg); 
            opacity: 1;
          }
          66% { 
            transform: translateY(-10px) rotate(-1deg); 
            opacity: 0.8;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .text-gradient {
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Modal animations */
        .modal-enter {
          opacity: 0;
          transform: scale(0.9);
        }

        .modal-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 300ms, transform 300ms;
        }

        /* Focus styles for accessibility */
        .focus-outline:focus {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }

        /* Error input styles */
        .input-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
      `}</style>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/5 via-slate-900/10 to-cyan-900/5"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-violet-400/10 to-cyan-400/10 animate-float"
            style={{
              width: Math.random() * 6 + 3 + 'px',
              height: Math.random() * 6 + 3 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: Math.random() * 20 + 15 + 's'
            }}
          />
        ))}
      </div>

      {/* Fixed Header with proper z-index */}
      <header className="fixed top-0 left-0 right-0 z-40 p-6">
        <div className="glass-morphism rounded-2xl px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="group w-10 h-10 bg-gradient-to-br from-slate-600/50 to-slate-700/50 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center transition-all duration-300 focus-outline"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  EMI <span className="text-gradient">Calculator</span>
                </h1>
                <p className="text-sm text-slate-400 font-medium">Smart loan planning & EMI calculation</p>
              </div>
            </div>

            <button
              onClick={() => {
                resetForm()
                setEditingLoan(null)
                setShowAddModal(true)
              }}
              className="group relative overflow-hidden bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl focus-outline"
              aria-label="Add new debt"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Calculate EMI</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="fixed top-24 left-6 right-6 z-30 glass-morphism rounded-xl p-4 border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors duration-200"
              aria-label="Dismiss error"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content with proper top margin */}
      <main className="relative z-10 pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="glass-morphism rounded-2xl p-6 card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Active Loans</p>
                    <p className="text-2xl font-black text-white">{loans.length}</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Total Principal</p>
                    <p className="text-2xl font-black text-white">₹{calculateTotalDebt().toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Monthly EMIs</p>
                    <p className="text-2xl font-black text-white">₹{calculateTotalMinPayments().toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Avg Interest</p>
                    <p className="text-2xl font-black text-white">{calculateAverageInterest().toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Debt Portfolio */}
          {loans.length === 0 ? (
            <div className="glass-morphism rounded-2xl p-16 text-center card-hover">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto animate-float">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur opacity-20 animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Calculate EMI! 🧮</h3>
              <p className="text-slate-400 font-medium mb-8 max-w-md mx-auto">Start planning your loan by calculating EMI, total interest, and payment schedule with our smart calculator.</p>
              <button
                onClick={() => {
                  resetForm()
                  setEditingLoan(null)
                  setShowAddModal(true)
                }}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl focus-outline"
              >
                Calculate Your First EMI
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">Saved Loan Plans</h2>
                </div>
                <div className="text-sm text-slate-400 bg-slate-800/30 px-3 py-1 rounded-full border border-slate-700/50">
                  {loans.length} {loans.length === 1 ? 'plan' : 'plans'} saved
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loans.map((loan) => (
                  <div key={loan._id} className="glass-morphism rounded-2xl p-6 card-hover group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{loan.creditorName}</h3>
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${getDebtTypeColor(loan.debtType)}`}></span>
                          <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">{loan.debtType}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(loan)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all duration-300 focus-outline"
                          aria-label={`Edit ${loan.creditorName} debt`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(loan._id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300 focus-outline"
                          aria-label={`Delete ${loan.creditorName} debt`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                        <span className="text-slate-400 font-medium">Loan Amount</span>
                        <span className="text-blue-400 font-bold text-lg">₹{(loan.currentBalance || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                        <span className="text-slate-400 font-medium">Monthly EMI</span>
                        <span className="text-emerald-400 font-bold">₹{(loan.minimumPayment || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                        <span className="text-slate-400 font-medium">Interest Rate</span>
                        <span className="text-amber-400 font-bold">{loan.interestRate || 0}% p.a.</span>
                      </div>
                      
                      {loan.dueDate && (
                        <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                          <span className="text-slate-400 font-medium">EMI Due Date</span>
                          <span className="text-slate-300 font-medium">{loan.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Add/Edit Loan Modal with accessibility */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div 
            className="glass-morphism rounded-3xl p-8 w-full max-w-lg relative modal-enter modal-enter-active"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 id="modal-title" className="text-3xl font-bold text-white">
                  {editingLoan ? 'Edit Loan' : 'EMI Calculator'}
                </h3>
                <p className="text-slate-400 font-medium mt-1">Calculate your monthly EMI and payment schedule</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingLoan(null)
                  resetForm()
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 focus-outline"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="creditorName" className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">
                  Lender Name *
                </label>
                <input
                  id="creditorName"
                  type="text"
                  value={loanForm.creditorName}
                  onChange={(e) => setLoanForm({...loanForm, creditorName: e.target.value})}
                  className={`w-full bg-slate-800/30 border text-white rounded-xl px-4 py-4 font-medium focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all duration-300 focus-outline ${
                    formErrors.creditorName ? 'border-red-500 input-error' : 'border-slate-600/50'
                  }`}
                  placeholder="e.g., HDFC Bank, SBI, ICICI"
                  required
                  disabled={submitting}
                />
                {formErrors.creditorName && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.creditorName}</p>
                )}
              </div>

              <div>
                <label htmlFor="debtType" className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">
                  Loan Type *
                </label>
                <select
                  id="debtType"
                  value={loanForm.debtType}
                  onChange={(e) => setLoanForm({...loanForm, debtType: e.target.value})}
                  className={`w-full bg-slate-800/30 border text-white rounded-xl px-4 py-4 font-medium focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all duration-300 focus-outline ${
                    formErrors.debtType ? 'border-red-500 input-error' : 'border-slate-600/50'
                  }`}
                  required
                  disabled={submitting}
                >
                  <option value="">Select loan type</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Car Loan">Car Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Gold Loan">Gold Loan</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.debtType && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.debtType}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="loanAmount" className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">
                    Loan Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-400 font-bold text-lg">₹</span>
                    <input
                      id="loanAmount"
                      type="number"
                      value={loanForm.loanAmount}
                      onChange={(e) => setLoanForm({...loanForm, loanAmount: e.target.value})}
                      className={`w-full bg-slate-800/30 border text-white rounded-xl px-4 py-4 pl-10 text-lg font-semibold focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all duration-300 focus-outline ${
                        formErrors.loanAmount ? 'border-red-500 input-error' : 'border-slate-600/50'
                      }`}
                      placeholder="5,00,000"
                      min="1"
                      step="1"
                      required
                      disabled={submitting}
                    />
                  </div>
                  {formErrors.loanAmount && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.loanAmount}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tenureMonths" className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">
                    Tenure (Months) *
                  </label>
                  <input
                    id="tenureMonths"
                    type="number"
                    value={loanForm.tenureMonths}
                    onChange={(e) => setLoanForm({...loanForm, tenureMonths: e.target.value})}
                    className={`w-full bg-slate-800/30 border text-white rounded-xl px-4 py-4 font-medium focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all duration-300 focus-outline ${
                      formErrors.tenureMonths ? 'border-red-500 input-error' : 'border-slate-600/50'
                    }`}
                    placeholder="60"
                    min="1"
                    step="1"
                    required
                    disabled={submitting}
                  />
                  {formErrors.tenureMonths && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.tenureMonths}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="interestRate" className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">
                    Interest Rate (%) *
                  </label>
                  <div className="relative">
                    <span className="absolute right-4 top-4 text-slate-400 font-bold text-lg">%</span>
                    <input
                      id="interestRate"
                      type="number"
                      value={loanForm.interestRate}
                      onChange={(e) => setLoanForm({...loanForm, interestRate: e.target.value})}
                      className={`w-full bg-slate-800/30 border text-white rounded-xl px-4 py-4 pr-10 font-medium focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all duration-300 focus-outline ${
                        formErrors.interestRate ? 'border-red-500 input-error' : 'border-slate-600/50'
                      }`}
                      placeholder="8.5"
                      min="0"
                      max="50"
                      step="0.1"
                      required
                      disabled={submitting}
                    />
                  </div>
                  {formErrors.interestRate && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.interestRate}</p>
                  )}
                </div>
              </div>

              {/* EMI Results Section */}
              {emiResults.emi > 0 && (
                <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-6 border border-violet-500/20">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-6 h-6 text-violet-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    EMI Calculation Results
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                      <p className="text-slate-400 text-sm font-medium mb-1">Monthly EMI</p>
                      <p className="text-2xl font-black text-emerald-400">₹{emiResults.emi.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                      <p className="text-slate-400 text-sm font-medium mb-1">Total Interest</p>
                      <p className="text-2xl font-black text-red-400">₹{emiResults.totalInterest.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                      <p className="text-slate-400 text-sm font-medium mb-1">Total Payment</p>
                      <p className="text-2xl font-black text-blue-400">₹{emiResults.totalPayment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 font-medium">Principal Amount</span>
                      <span className="text-white font-bold">₹{parseFloat(loanForm.loanAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 font-medium">Interest Component</span>
                      <span className="text-red-400 font-bold">₹{emiResults.totalInterest.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400 font-medium">Loan Tenure</span>
                      <span className="text-white font-bold">{loanForm.tenureMonths} months ({Math.round(loanForm.tenureMonths / 12)} years)</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{width: `${(parseFloat(loanForm.loanAmount || 0) / emiResults.totalPayment) * 100}%`}}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Principal ({((parseFloat(loanForm.loanAmount || 0) / emiResults.totalPayment) * 100).toFixed(1)}%)</span>
                      <span>Interest ({((emiResults.totalInterest / emiResults.totalPayment) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="dueDate" className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">
                  EMI Due Date (optional)
                </label>
                <input
                  id="dueDate"
                  type="text"
                  value={loanForm.dueDate}
                  onChange={(e) => setLoanForm({...loanForm, dueDate: e.target.value})}
                  className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-4 py-4 font-medium focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all duration-300 focus-outline"
                  placeholder="e.g., 5th of every month"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingLoan(null)
                    resetForm()
                  }}
                  className="flex-1 px-6 py-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-all duration-300 border border-slate-600/50 focus-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl focus-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Processing...</span>
                    </span>
                  ) : (
                    `${editingLoan ? 'Update Loan' : 'Save EMI Plan'}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal with accessibility */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div 
            className="glass-morphism rounded-3xl p-8 w-full max-w-md modal-enter modal-enter-active"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 id="delete-modal-title" className="text-2xl font-bold text-white mb-3">Delete Loan Plan</h3>
              <p className="text-slate-400 font-medium mb-8">
                Are you sure you want to remove this loan plan from your saved calculations? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-all duration-300 border border-slate-600/50 focus-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl focus-outline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}