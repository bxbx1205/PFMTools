'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  // Transaction form state
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Default categories
  const defaultCategories = {
    income: ['Salary', 'Freelancing', 'Business', 'Investments', 'Other Income'],
    expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other Expenses']
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    checkAuth()
    loadTransactions()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return false
    }
    return true
  }

  const loadTransactions = async () => {
    if (!checkAuth()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checkAuth()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        setShowAddModal(false)
        setFormData({
          type: 'expense',
          amount: '',
          description: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        })
        loadTransactions()
      } else {
        alert('Failed to add transaction')
      }
    } catch (error) {
      console.error('Failed to add transaction:', error)
      alert('Failed to add transaction')
    }
  }

  const deleteTransaction = async (id) => {
    if (!checkAuth()) return
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        loadTransactions()
      } else {
        alert('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      alert('Failed to delete transaction')
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredTransactions = transactions
    .filter(transaction => {
      if (filter === 'all') return true
      return transaction.type === filter
    })
    .filter(transaction => {
      if (!searchTerm) return true
      return transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date)
      } else if (sortBy === 'amount') {
        return b.amount - a.amount
      }
      return 0
    })

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

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
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-spin"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Transaction Hub...</h2>
          <p className="text-slate-400 font-medium">Analyzing your financial activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/5 via-slate-900/10 to-cyan-900/5"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 animate-float"
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

      {/* Enhanced Styles */}
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
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .text-gradient {
          background: linear-gradient(135deg, #10b981, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Floating Header */}
      <header className="fixed top-6 left-6 right-6 z-50">
        <div className="glass-morphism rounded-2xl px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="group w-10 h-10 bg-gradient-to-br from-slate-600/50 to-slate-700/50 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Transaction <span className="text-gradient">Hub</span>
                </h1>
                <p className="text-sm text-slate-400 font-medium">Track every financial movement</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Transaction</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 px-6 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-morphism rounded-2xl p-6 card-hover group">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Income</p>
                  <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalIncome)}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-emerald-500 font-medium">↗ +12.5%</span>
                    <span className="text-xs text-slate-500 ml-2">this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 card-hover group">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</p>
                  <p className="text-2xl font-black text-red-400">{formatCurrency(totalExpenses)}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-red-500 font-medium">↗ +8.2%</span>
                    <span className="text-xs text-slate-500 ml-2">this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 card-hover group">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 ${balance >= 0 ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'}`}>
                  <svg className={`w-8 h-8 ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Net Balance</p>
                  <p className={`text-2xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(Math.abs(balance))}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {balance >= 0 ? '↗ Positive' : '↘ Negative'}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">flow</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 card-hover group">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Transactions</p>
                  <p className="text-2xl font-black text-blue-400">{transactions.length}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-blue-500 font-medium">
                      {currentTime.toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">updated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="glass-morphism rounded-2xl p-6 mb-8 card-hover">
            <div className="flex flex-wrap gap-6 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">Search Transactions</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by description, category..."
                    className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-6 py-3 pl-12 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                  />
                  <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">Filter Type</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                >
                  <option value="all">All Transactions</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="amount">Amount (Highest First)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Transactions Table */}
          <div className="glass-morphism rounded-2xl overflow-hidden card-hover">
            <div className="p-6 border-b border-slate-700/30">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">Transaction History</h3>
                  <p className="text-slate-400 font-medium">Showing {filteredTransactions.length} of {transactions.length} transactions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-sm text-slate-400">Live data</span>
                </div>
              </div>
            </div>

          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-slate-700/30">
              {filteredTransactions.map((transaction) => (
                <div key={transaction._id} className="p-6 hover:bg-slate-800/20 transition-all duration-300 group relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className={`p-3 rounded-xl group-hover:scale-110 transition-all duration-300 ${
                        transaction.type === 'income' 
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' 
                          : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'
                      }`}>
                        <svg className={`w-6 h-6 ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {transaction.type === 'income' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg mb-1">{transaction.description}</h4>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-medium text-slate-300 border border-slate-600/30">
                            {transaction.category}
                          </span>
                          <span className="text-sm text-slate-400 font-medium">{formatDate(transaction.date)}</span>
                        </div>
                        {transaction.notes && (
                          <p className="text-sm text-slate-500 mt-2 font-medium">{transaction.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`text-2xl font-black ${
                          transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {transaction.type === 'income' ? 'Credit' : 'Debit'}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteTransaction(transaction._id)}
                        className="opacity-0 group-hover:opacity-100 p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No transactions found</h3>
              <p className="text-slate-400 font-medium mb-6">Start building your financial history by adding your first transaction</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Add Your First Transaction
              </button>
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Enhanced Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="glass-morphism rounded-3xl p-8 w-full max-w-lg relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white">Add Transaction</h3>
                <p className="text-slate-400 font-medium mt-1">Track your financial activity</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Type Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-4 block tracking-wide">Transaction Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'income', category: ''})}
                    className={`group p-4 rounded-2xl border-2 transition-all duration-300 ${
                      formData.type === 'income'
                        ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400 shadow-lg shadow-emerald-400/20'
                        : 'border-slate-600/50 bg-slate-800/30 text-slate-400 hover:border-slate-500 hover:bg-slate-700/30'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span className="font-bold">Income</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'expense', category: ''})}
                    className={`group p-4 rounded-2xl border-2 transition-all duration-300 ${
                      formData.type === 'expense'
                        ? 'border-red-400/50 bg-red-400/10 text-red-400 shadow-lg shadow-red-400/20'
                        : 'border-slate-600/50 bg-slate-800/30 text-slate-400 hover:border-slate-500 hover:bg-slate-700/30'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                    <span className="font-bold">Expense</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-slate-400 font-bold text-lg">₹</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                    required
                    className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-4 py-4 pl-10 text-lg font-semibold focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What was this transaction for?"
                  required
                  className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-4 py-4 font-medium focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                  className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-4 py-4 font-medium focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                >
                  <option value="">Select a category</option>
                  {defaultCategories[formData.type].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-4 py-4 font-medium focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                />
              </div>

              {/* Notes Input */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block tracking-wide">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional details or context..."
                  rows={3}
                  className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-xl px-4 py-4 font-medium focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white py-4 rounded-xl font-bold transition-all duration-300 border border-slate-600/50 hover:border-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}