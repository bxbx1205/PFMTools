'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Analytics() {
  const [transactions, setTransactions] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return false
    }
    return true
  }

  const loadData = async () => {
    if (!checkAuth()) return

    try {
      const token = localStorage.getItem('token')
      
      // Load transactions
      const transactionsResponse = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions || [])
      }

      // Load profile
      const profileResponse = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Filter transactions based on time range
  const getFilteredTransactions = () => {
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return transactions
    }

    return transactions.filter(t => new Date(t.date) >= startDate)
  }

  const filteredTransactions = getFilteredTransactions()

  // Calculate metrics
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

  // Category analysis
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  // Monthly trends
  const monthlyData = filteredTransactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 }
    }
    acc[month][t.type] += t.amount
    return acc
  }, {})

  // Top categories
  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  const topIncomeCategories = Object.entries(incomeByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Budget analysis
  const budgetAnalysis = profile?.monthlyBudget ? {
    budgetUsed: (totalExpenses / profile.monthlyBudget) * 100,
    remaining: profile.monthlyBudget - totalExpenses,
    isOverBudget: totalExpenses > profile.monthlyBudget
  } : null

  // Financial health score
  const calculateHealthScore = () => {
    let score = 50 // Base score
    
    if (savingsRate > 20) score += 30
    else if (savingsRate > 10) score += 20
    else if (savingsRate > 0) score += 10
    else score -= 20

    if (budgetAnalysis && !budgetAnalysis.isOverBudget) score += 20
    else if (budgetAnalysis && budgetAnalysis.isOverBudget) score -= 15

    if (profile?.savingsTarget && netSavings > 0) {
      const savingsProgress = (netSavings / profile.savingsTarget) * 100
      if (savingsProgress > 100) score += 20
      else if (savingsProgress > 50) score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  const healthScore = calculateHealthScore()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold gradient-text">Loading Analytics</p>
            <p className="text-slate-400">Analyzing your financial data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Enhanced Neural Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary cosmic gradient */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-conic from-violet-500/30 via-purple-600/20 to-violet-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-radial from-cyan-400/25 via-blue-500/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-conic from-purple-600/20 via-violet-500/10 to-cyan-400/20 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
        
        {/* Neural network particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-40 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-40 left-32 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-violet-300 rounded-full animate-ping delay-1000"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-10 w-20 h-20 border border-violet-500/20 rotate-45 animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-16 h-16 border border-cyan-400/20 rounded-full animate-float delay-500"></div>
      </div>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        .glass-morphism {
          background: rgba(15, 15, 23, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.4),
            0 10px 10px -5px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(139, 92, 246, 0.1),
            0 0 0 1px rgba(139, 92, 246, 0.05);
        }
        
        .neural-card {
          background: linear-gradient(135deg, 
            rgba(15, 15, 23, 0.9) 0%, 
            rgba(20, 20, 30, 0.8) 50%, 
            rgba(15, 15, 23, 0.9) 100%);
          border: 1px solid;
          border-image: linear-gradient(135deg, 
            rgba(139, 92, 246, 0.3), 
            rgba(59, 130, 246, 0.2), 
            rgba(139, 92, 246, 0.3)) 1;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .metric-card {
          background: linear-gradient(135deg, 
            rgba(15, 15, 23, 0.95) 0%, 
            rgba(25, 25, 35, 0.9) 50%, 
            rgba(15, 15, 23, 0.95) 100%);
          border: 1px solid rgba(139, 92, 246, 0.15);
          backdrop-filter: blur(15px);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.4),
            0 0 25px rgba(139, 92, 246, 0.1);
        }
      `}</style>

      {/* Floating Header with Enhanced Design */}
      <header className="glass-morphism border-b border-violet-500/20 relative z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="group p-3 text-slate-400 hover:text-white transition-all duration-300 hover:bg-violet-500/10 rounded-xl"
              >
                <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-10 bg-gradient-to-b from-blue-400 via-cyan-500 to-teal-400 rounded-full"></div>
                <h1 className="text-4xl font-black gradient-text tracking-tight">
                  Analytics Hub
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-3 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50 font-semibold"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Enhanced Design */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 relative z-10">
        {/* Enhanced Financial Health Score */}
        <div className="neural-card rounded-3xl p-10 mb-12 shadow-2xl">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-4xl font-black gradient-text mb-3">Financial Health Score</h2>
              <p className="text-slate-400 text-lg">Your overall financial wellness assessment</p>
            </div>
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="rgba(51, 65, 85, 0.3)"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={healthScore >= 70 ? 'url(#healthGradientGood)' : healthScore >= 40 ? 'url(#healthGradientOk)' : 'url(#healthGradientBad)'}
                  strokeWidth="12"
                  strokeDasharray={`${(healthScore / 100) * 439.823} 439.823`}
                  className="transition-all duration-2000"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="healthGradientGood" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="healthGradientOk" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <linearGradient id="healthGradientBad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-black text-white">{Math.round(healthScore)}</span>
                  <div className="text-sm text-slate-400 font-medium">/ 100</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-2xl font-bold ${
                healthScore >= 70 ? 'text-emerald-400' : 
                healthScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {healthScore >= 70 ? 'Excellent' : healthScore >= 40 ? 'Good' : 'Needs Improvement'}
              </p>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                {healthScore >= 70 ? 'Your finances are in excellent shape! Keep up the great work.' :
                 healthScore >= 40 ? 'You\'re on the right track. Focus on increasing your savings rate.' :
                 'Consider reducing expenses and increasing your savings to improve your financial health.'}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="metric-card rounded-3xl p-8 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Total Income</p>
              <p className="text-3xl font-black text-white">{formatCurrency(totalIncome)}</p>
              <p className="text-slate-400 text-sm">Current period</p>
            </div>
          </div>

          <div className="metric-card rounded-3xl p-8 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-red-400 uppercase tracking-wider">Total Expenses</p>
              <p className="text-3xl font-black text-white">{formatCurrency(totalExpenses)}</p>
              <p className="text-slate-400 text-sm">Current period</p>
            </div>
          </div>

          <div className="metric-card rounded-3xl p-8 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${
                netSavings >= 0 
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' 
                  : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'
              }`}>
                <svg className={`w-8 h-8 ${netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className={`w-2 h-2 rounded-full animate-pulse ${netSavings >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            </div>
            <div className="space-y-2">
              <p className={`text-sm font-bold uppercase tracking-wider ${netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netSavings >= 0 ? 'Net Savings' : 'Net Loss'}
              </p>
              <p className={`text-3xl font-black ${netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(Math.abs(netSavings))}
              </p>
              <p className="text-slate-400 text-sm">Current period</p>
            </div>
          </div>

          <div className="metric-card rounded-3xl p-8 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-purple-400 uppercase tracking-wider">Savings Rate</p>
              <p className={`text-3xl font-black ${
                savingsRate >= 20 ? 'text-emerald-400' : 
                savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {savingsRate.toFixed(1)}%
              </p>
              <p className="text-slate-400 text-sm">Of total income</p>
            </div>
          </div>
        </div>

        {/* Enhanced Budget Analysis */}
        {budgetAnalysis && (
          <div className="neural-card rounded-3xl p-10 mb-12 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-3xl font-black text-white mb-3 flex items-center">
                <div className="w-4 h-10 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-400 rounded-full mr-4"></div>
                <span className="gradient-text">Budget Analysis</span>
              </h3>
              <p className="text-slate-400 text-lg">Monitor your spending against your monthly budget</p>
              <div className="w-full h-0.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-400 rounded-full mt-4"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold text-lg">Budget Usage</span>
                  <span className={`font-black text-2xl ${budgetAnalysis.isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                    {budgetAnalysis.budgetUsed.toFixed(1)}%
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-800/50 rounded-full h-6 border border-slate-700/50">
                    <div
                      className={`h-6 rounded-full transition-all duration-2000 relative overflow-hidden ${
                        budgetAnalysis.isOverBudget 
                          ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      }`}
                      style={{ width: `${Math.min(budgetAnalysis.budgetUsed, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Spent: <span className="text-white font-bold">{formatCurrency(totalExpenses)}</span></span>
                  <span className="text-slate-400 font-medium">Budget: <span className="text-white font-bold">{formatCurrency(profile.monthlyBudget)}</span></span>
                </div>
              </div>
              <div className="text-center space-y-4">
                <div className="p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-3xl border border-slate-700/30">
                  <p className="text-lg font-semibold text-slate-300 mb-3">
                    {budgetAnalysis.isOverBudget ? 'Over Budget' : 'Remaining Budget'}
                  </p>
                  <p className={`text-4xl font-black mb-3 ${budgetAnalysis.isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatCurrency(Math.abs(budgetAnalysis.remaining))}
                  </p>
                  <p className="text-slate-400">
                    {budgetAnalysis.isOverBudget 
                      ? 'Consider reducing expenses to get back on track'
                      : 'Excellent budget management! Keep it up!'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Top Expense Categories */}
          <div className="neural-card rounded-3xl p-10 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-3xl font-black text-white mb-3 flex items-center">
                <div className="w-4 h-10 bg-gradient-to-b from-red-400 via-rose-500 to-pink-400 rounded-full mr-4"></div>
                <span className="gradient-text">Top Expense Categories</span>
              </h3>
              <p className="text-slate-400 text-lg">Where your money is going</p>
              <div className="w-full h-0.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-400 rounded-full mt-4"></div>
            </div>
            {topExpenseCategories.length > 0 ? (
              <div className="space-y-6">
                {topExpenseCategories.map(([category, amount], index) => (
                  <div key={category} className="group p-6 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/30 hover:border-red-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                          index === 0 ? 'bg-gradient-to-r from-red-500/20 to-rose-600/20' :
                          index === 1 ? 'bg-gradient-to-r from-orange-500/20 to-yellow-600/20' :
                          index === 2 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-600/20' :
                          index === 3 ? 'bg-gradient-to-r from-purple-500/20 to-violet-600/20' :
                          'bg-gradient-to-r from-blue-500/20 to-cyan-600/20'
                        }`}>
                          <div className={`w-4 h-4 rounded-full ${
                            index === 0 ? 'bg-red-500' :
                            index === 1 ? 'bg-orange-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-purple-500' :
                            'bg-blue-500'
                          }`}></div>
                        </div>
                        <div>
                          <span className="text-white font-bold text-lg">{category}</span>
                          <div className="text-sm text-slate-400">
                            {((amount / totalExpenses) * 100).toFixed(1)}% of total expenses
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-black text-xl">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg">No expense data available</p>
              </div>
            )}
          </div>

          {/* Top Income Categories */}
          <div className="neural-card rounded-3xl p-10 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-3xl font-black text-white mb-3 flex items-center">
                <div className="w-4 h-10 bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-400 rounded-full mr-4"></div>
                <span className="gradient-text">Top Income Sources</span>
              </h3>
              <p className="text-slate-400 text-lg">Your revenue streams</p>
              <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 rounded-full mt-4"></div>
            </div>
            {topIncomeCategories.length > 0 ? (
              <div className="space-y-6">
                {topIncomeCategories.map(([category, amount], index) => (
                  <div key={category} className="group p-6 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                          index === 0 ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20' :
                          index === 1 ? 'bg-gradient-to-r from-green-500/20 to-emerald-600/20' :
                          index === 2 ? 'bg-gradient-to-r from-teal-500/20 to-cyan-600/20' :
                          index === 3 ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20' :
                          'bg-gradient-to-r from-blue-500/20 to-indigo-600/20'
                        }`}>
                          <div className={`w-4 h-4 rounded-full ${
                            index === 0 ? 'bg-emerald-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-teal-500' :
                            index === 3 ? 'bg-cyan-500' :
                            'bg-blue-500'
                          }`}></div>
                        </div>
                        <div>
                          <span className="text-white font-bold text-lg">{category}</span>
                          <div className="text-sm text-slate-400">
                            {((amount / totalIncome) * 100).toFixed(1)}% of total income
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-black text-xl">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg">No income data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Monthly Trends */}
        <div className="neural-card rounded-3xl p-10 mb-12 shadow-2xl">
          <div className="mb-8">
            <h3 className="text-3xl font-black text-white mb-3 flex items-center">
              <div className="w-4 h-10 bg-gradient-to-b from-blue-400 via-cyan-500 to-teal-400 rounded-full mr-4"></div>
              <span className="gradient-text">Monthly Trends</span>
            </h3>
            <p className="text-slate-400 text-lg">Track your financial patterns over time</p>
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 rounded-full mt-4"></div>
          </div>
          {Object.keys(monthlyData).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(monthlyData)
                .sort(([a], [b]) => new Date(a + ' 1') - new Date(b + ' 1'))
                .slice(-6)
                .map(([month, data]) => (
                <div key={month} className="group p-8 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-3xl border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-2xl font-bold text-white">{month}</h4>
                    <div className="text-right">
                      <div className="text-sm text-slate-400 mb-1">Net Result</div>
                      <div className={`text-2xl font-black ${(data.income - data.expense) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(data.income - data.expense) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(data.income - data.expense))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="text-emerald-400 font-semibold text-lg">Income</span>
                        </div>
                        <span className="text-white font-black text-xl">{formatCurrency(data.income)}</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-slate-800/50 rounded-full h-3">
                          <div
                            className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.max((data.income / Math.max(data.income, data.expense)) * 100, 8)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-red-400 font-semibold text-lg">Expenses</span>
                        </div>
                        <span className="text-white font-black text-xl">{formatCurrency(data.expense)}</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-slate-800/50 rounded-full h-3">
                          <div
                            className="h-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.max((data.expense / Math.max(data.income, data.expense)) * 100, 8)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-slate-400 text-xl">No trend data available</p>
              <p className="text-slate-500 mt-2">Start adding transactions to see your financial trends</p>
            </div>
          )}
        </div>

        {/* Enhanced Financial Goals Progress */}
        {profile?.savingsTarget && (
          <div className="neural-card rounded-3xl p-10 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-3xl font-black text-white mb-3 flex items-center">
                <div className="w-4 h-10 bg-gradient-to-b from-purple-400 via-violet-500 to-indigo-400 rounded-full mr-4"></div>
                <span className="gradient-text">Savings Goal Progress</span>
              </h3>
              <p className="text-slate-400 text-lg">Track your progress towards your financial goals</p>
              <div className="w-full h-0.5 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-400 rounded-full mt-4"></div>
            </div>
            <div className="text-center space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-3xl border border-slate-700/30">
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Current Savings</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(Math.max(netSavings, 0))}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-3xl border border-slate-700/30">
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Target Goal</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(profile.savingsTarget)}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-3xl border border-slate-700/30">
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Remaining</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(Math.max(profile.savingsTarget - Math.max(netSavings, 0), 0))}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-full bg-slate-800/50 rounded-full h-8 border border-slate-700/50">
                    <div
                      className="h-8 bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-500 rounded-full transition-all duration-2000 relative overflow-hidden"
                      style={{ width: `${Math.min((Math.max(netSavings, 0) / profile.savingsTarget) * 100, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black text-purple-400">
                    {((Math.max(netSavings, 0) / profile.savingsTarget) * 100).toFixed(1)}% Complete
                  </p>
                  <p className="text-slate-400">
                    {Math.max(netSavings, 0) >= profile.savingsTarget 
                      ? '🎉 Congratulations! You\'ve reached your savings goal!' 
                      : 'Keep saving to reach your Financial goal!'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}