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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Header */}
      <header className="glass-morphism border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center">
                <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full mr-3"></div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Analytics Hub
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Financial Health Score */}
        <div className="glass-morphism rounded-3xl p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Financial Health Score</h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgb(51, 65, 85)"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="12"
                  strokeDasharray={`${(healthScore / 100) * 339.292} 339.292`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-white">{Math.round(healthScore)}</span>
              </div>
            </div>
            <p className={`text-lg font-semibold ${
              healthScore >= 70 ? 'text-emerald-400' : 
              healthScore >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {healthScore >= 70 ? 'Excellent' : healthScore >= 40 ? 'Good' : 'Needs Improvement'}
            </p>
            <p className="text-slate-400 mt-2">
              {healthScore >= 70 ? 'Your finances are in great shape!' :
               healthScore >= 40 ? 'You\'re on the right track, keep it up!' :
               'Focus on saving more and controlling expenses.'}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Income</p>
                <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Expenses</p>
                <p className="text-2xl font-black text-red-400">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${netSavings >= 0 ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'}`}>
                <svg className={`w-8 h-8 ${netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Net Savings</p>
                <p className={`text-2xl font-black ${netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(Math.abs(netSavings))}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</p>
                <p className={`text-2xl font-black ${savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Analysis */}
        {budgetAnalysis && (
          <div className="glass-morphism rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-3 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-3"></div>
              Budget Analysis
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-300 font-medium">Budget Usage</span>
                  <span className={`font-bold ${budgetAnalysis.isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                    {budgetAnalysis.budgetUsed.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ${
                      budgetAnalysis.isOverBudget 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    }`}
                    style={{ width: `${Math.min(budgetAnalysis.budgetUsed, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Spent: {formatCurrency(totalExpenses)}</span>
                  <span className="text-slate-400">Budget: {formatCurrency(profile.monthlyBudget)}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-300 mb-2">
                  {budgetAnalysis.isOverBudget ? 'Over Budget' : 'Remaining Budget'}
                </p>
                <p className={`text-3xl font-black ${budgetAnalysis.isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatCurrency(Math.abs(budgetAnalysis.remaining))}
                </p>
                <p className="text-slate-400 mt-2">
                  {budgetAnalysis.isOverBudget 
                    ? 'Consider reducing expenses next month'
                    : 'Great job staying within budget!'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Expense Categories */}
          <div className="glass-morphism rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-3 h-8 bg-gradient-to-b from-red-400 to-rose-500 rounded-full mr-3"></div>
              Top Expense Categories
            </h3>
            {topExpenseCategories.length > 0 ? (
              <div className="space-y-4">
                {topExpenseCategories.map(([category, amount], index) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 bg-gradient-to-r ${
                        index === 0 ? 'from-red-500 to-rose-600' :
                        index === 1 ? 'from-orange-500 to-yellow-600' :
                        index === 2 ? 'from-yellow-500 to-orange-600' :
                        index === 3 ? 'from-purple-500 to-violet-600' :
                        'from-blue-500 to-cyan-600'
                      }`}></div>
                      <span className="text-white font-medium">{category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{formatCurrency(amount)}</span>
                      <div className="text-sm text-slate-400">
                        {((amount / totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No expense data available</p>
            )}
          </div>

          {/* Top Income Categories */}
          <div className="glass-morphism rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-3 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full mr-3"></div>
              Top Income Sources
            </h3>
            {topIncomeCategories.length > 0 ? (
              <div className="space-y-4">
                {topIncomeCategories.map(([category, amount], index) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 bg-gradient-to-r ${
                        index === 0 ? 'from-emerald-500 to-teal-600' :
                        index === 1 ? 'from-green-500 to-emerald-600' :
                        index === 2 ? 'from-teal-500 to-cyan-600' :
                        index === 3 ? 'from-cyan-500 to-blue-600' :
                        'from-blue-500 to-indigo-600'
                      }`}></div>
                      <span className="text-white font-medium">{category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{formatCurrency(amount)}</span>
                      <div className="text-sm text-slate-400">
                        {((amount / totalIncome) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No income data available</p>
            )}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="glass-morphism rounded-3xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full mr-3"></div>
            Monthly Trends
          </h3>
          {Object.keys(monthlyData).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(monthlyData)
                .sort(([a], [b]) => new Date(a + ' 1') - new Date(b + ' 1'))
                .slice(-6)
                .map(([month, data]) => (
                <div key={month} className="bg-slate-800/30 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-white">{month}</h4>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${(data.income - data.expense) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        Net: {formatCurrency(Math.abs(data.income - data.expense))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-emerald-400 font-medium">Income</span>
                        <span className="text-white font-bold">{formatCurrency(data.income)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                          style={{ width: `${Math.max((data.income / Math.max(data.income, data.expense)) * 100, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-red-400 font-medium">Expenses</span>
                        <span className="text-white font-bold">{formatCurrency(data.expense)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-full"
                          style={{ width: `${Math.max((data.expense / Math.max(data.income, data.expense)) * 100, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No trend data available</p>
          )}
        </div>

        {/* Financial Goals Progress */}
        {profile?.savingsTarget && (
          <div className="glass-morphism rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-3 h-8 bg-gradient-to-b from-purple-400 to-violet-500 rounded-full mr-3"></div>
              Savings Goal Progress
            </h3>
            <div className="text-center">
              <div className="mb-6">
                <p className="text-slate-300 text-lg mb-2">Current Savings</p>
                <p className="text-4xl font-black text-white">{formatCurrency(Math.max(netSavings, 0))}</p>
                <p className="text-slate-400">of {formatCurrency(profile.savingsTarget)} goal</p>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-6 mb-4">
                <div
                  className="h-6 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((Math.max(netSavings, 0) / profile.savingsTarget) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-lg font-semibold text-purple-400">
                {((Math.max(netSavings, 0) / profile.savingsTarget) * 100).toFixed(1)}% Complete
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}