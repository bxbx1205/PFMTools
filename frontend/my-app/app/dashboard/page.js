'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingModal from '../components/OnboardingModal'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profile, setProfile] = useState(null)
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Get user profile
      const userResponse = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
        
        // Check if user has completed onboarding
        try {
          const profileResponse = await fetch('http://localhost:5000/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            setProfile(profileData.profile)
          } else {
            // No profile found, show onboarding
            setShowOnboarding(true)
          }
        } catch (error) {
          console.log('No profile found, showing onboarding')
          setShowOnboarding(true)
        }

        // Get debts
        try {
          const debtsResponse = await fetch('http://localhost:5000/api/debts', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (debtsResponse.ok) {
            const debtsData = await debtsResponse.json()
            setDebts(debtsData.debts || [])
          }
        } catch (error) {
          console.log('No debts found')
        }
        
      } else {
        localStorage.removeItem('token')
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    // Refresh data after onboarding
    checkAuth()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('lastEmail')
    localStorage.removeItem('userName')
    router.push('/login')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          {/* SavR Logo Loading */}
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-3xl shadow-2xl animate-pulse">
              <span className="text-3xl font-black text-white tracking-tight">S</span>
            </div>
            <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl blur opacity-40 animate-pulse"></div>
          </div>
          
          {/* Loading Animation */}
          <div className="relative mb-6">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-teal-500 rounded-full animate-ping mx-auto"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Sav<span className="text-emerald-400">R</span>
          </h2>
          <p className="text-slate-300 font-medium animate-pulse">Loading your financial universe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Custom Scrollbar & Enhanced Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        /* Enhanced Webkit Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 12px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.2);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #047857);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
        }
        
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #10b981 rgba(15, 23, 42, 0.3);
        }
        
        /* Smooth animations */
        * {
          scroll-behavior: smooth;
        }
        
        /* Glass morphism enhancement */
        .glass-morphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        /* Glow effects */
        .glow-emerald {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }
        
        .glow-blue {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        /* Animation keyframes */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slide-in-up {
          animation: slideInUp 0.8s ease-out forwards;
        }
      `}</style>

      {/* Enhanced Header */}
      <header className="glass-morphism border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              {/* SavR Logo */}
              <div className="relative group">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-2xl shadow-xl glow-emerald group-hover:scale-105 transition-all duration-300">
                  <span className="text-2xl font-black text-white tracking-tight">S</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Sav<span className="text-emerald-400">R</span>
                </h1>
                <p className="text-sm text-slate-400 font-medium">Smart Financial Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 font-medium">Welcome back, <span className="text-white font-semibold">{user?.name}</span>!</span>
              </div>
              <button
                onClick={handleLogout}
                className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span className="relative z-10">Sign Out</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Hero Welcome Section */}
        <div className="glass-morphism rounded-3xl p-8 mb-10 relative overflow-hidden animate-slide-in-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                  Your Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Universe</span>
                </h2>
                <p className="text-xl text-slate-300 font-medium max-w-2xl leading-relaxed">
                  Take control of your financial future with SavR's intelligent insights and personalized recommendations
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center animate-float">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur opacity-30 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Monthly Income */}
          <div className="group glass-morphism rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Monthly Income</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {profile?.monthlyIncome ? formatCurrency(profile.monthlyIncome) : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* Total Debts */}
          <div className="group glass-morphism rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Debts</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {formatCurrency(debts.reduce((sum, debt) => sum + debt.currentBalance, 0))}
                  </p>
                </div>
              </div>
              <div className="w-3 h-3 bg-red-400 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* Savings Target */}
          <div className="group glass-morphism rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Savings Target</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {profile?.savingsTarget ? formatCurrency(profile.savingsTarget) : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="w-3 h-3 bg-blue-400 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="group glass-morphism rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Risk Profile</p>
                  <p className="text-2xl font-black text-white mt-1 capitalize">
                    {profile?.riskTolerance || 'Not set'}
                  </p>
                </div>
              </div>
              <div className="w-3 h-3 bg-purple-400 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Debts Overview */}
          <div className="glass-morphism rounded-3xl p-8 animate-slide-in-up" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <div className="w-3 h-8 bg-gradient-to-b from-red-400 to-rose-500 rounded-full mr-3"></div>
                Debt Portfolio
              </h3>
              <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                {debts.length} {debts.length === 1 ? 'debt' : 'debts'}
              </div>
            </div>
            {debts.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {debts.map((debt, index) => (
                  <div key={debt.id} className="group bg-slate-800/30 hover:bg-slate-800/50 rounded-2xl p-5 transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50" style={{animationDelay: `${0.1 * index}s`}}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-bold text-white text-lg">{debt.creditorName}</h4>
                          <span className="ml-3 text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full font-medium uppercase tracking-wider">{debt.debtType}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Balance</p>
                            <p className="text-xl font-black text-white">{formatCurrency(debt.currentBalance)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Interest Rate</p>
                            <p className="text-xl font-black text-red-400">{debt.interestRate}%</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400 font-medium">Monthly Payment</span>
                            <span className="text-lg font-bold text-white">{formatCurrency(debt.minimumPayment)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur opacity-20 animate-pulse"></div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Debt-Free Zone! 🎉</h4>
                <p className="text-slate-400 font-medium">You're doing amazing by staying debt-free</p>
              </div>
            )}
          </div>

          {/* Profile Summary */}
          <div className="glass-morphism rounded-3xl p-8 animate-slide-in-up" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full mr-3"></div>
                Profile Insights
              </h3>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            {profile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Age Group</p>
                    <p className="text-lg font-bold text-white">{profile.ageGroup || 'Not specified'}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Occupation</p>
                    <p className="text-lg font-bold text-white">{profile.occupation || 'Not specified'}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Family Size</p>
                    <p className="text-lg font-bold text-white">{profile.familySize || 'Not specified'}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Primary Goal</p>
                    <p className="text-lg font-bold text-white capitalize">{profile.primaryGoal?.replace('-', ' ') || 'Not specified'}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/30">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Financial Snapshot
                  </h4>
                  <div className="space-y-3">
                    {profile.monthlyIncome && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Monthly Income</span>
                        <span className="text-white font-bold text-lg">{formatCurrency(profile.monthlyIncome)}</span>
                      </div>
                    )}
                    {profile.monthlyBudget && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Monthly Budget</span>
                        <span className="text-white font-bold text-lg">{formatCurrency(profile.monthlyBudget)}</span>
                      </div>
                    )}
                    {profile.savingsTarget && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Savings Target</span>
                        <span className="text-white font-bold text-lg">{formatCurrency(profile.savingsTarget)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur opacity-20 animate-pulse"></div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Complete Your Journey</h4>
                <p className="text-slate-400 font-medium mb-4">Set up your financial profile for personalized insights</p>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="glass-morphism rounded-3xl p-8 animate-slide-in-up" style={{animationDelay: '0.7s'}}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <div className="w-3 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full mr-3"></div>
              Quick Actions
            </h3>
            <div className="text-sm text-slate-400">Take control of your finances</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => router.push('/transactions')}
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-left"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg mb-2">Add Transaction</h4>
                <p className="text-sm text-emerald-100 font-medium">Record income or expense with smart categorization</p>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/analytics')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-left"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg mb-2">Analytics Hub</h4>
                <p className="text-sm text-blue-100 font-medium">Deep insights and spending patterns analysis</p>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/settings')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-left"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg mb-2">Profile Settings</h4>
                <p className="text-sm text-purple-100 font-medium">Customize preferences and financial goals</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        userName={user?.name || 'User'}
      />
    </div>
  )
}