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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        /* Webkit browsers (Chrome, Safari, newer Edge) */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.4);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
          border: 2px solid rgba(30, 41, 59, 0.4);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #1e40af);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        ::-webkit-scrollbar-corner {
          background: rgba(30, 41, 59, 0.4);
        }
        
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 rgba(30, 41, 59, 0.4);
        }
        
        /* Smooth scrolling for all elements */
        * {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Header */}
      <header className="bg-gray-800/20 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-3">
                <span className="text-xl font-bold text-white">PF</span>
              </div>
              <h1 className="text-xl font-bold text-white">Personal Finance Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-400">
            Track your financial progress and manage your money effectively
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Income */}
          <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Monthly Income</p>
                <p className="text-2xl font-bold text-white">
                  {profile?.monthlyIncome ? formatCurrency(profile.monthlyIncome) : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Debts */}
          <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Debts</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(debts.reduce((sum, debt) => sum + debt.currentBalance, 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Savings Target */}
          <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Savings Target</p>
                <p className="text-2xl font-bold text-white">
                  {profile?.savingsTarget ? formatCurrency(profile.savingsTarget) : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Risk Tolerance</p>
                <p className="text-2xl font-bold text-white capitalize">
                  {profile?.riskTolerance || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Debts Overview */}
          <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Debt Overview</h3>
            {debts.length > 0 ? (
              <div className="space-y-4">
                {debts.map((debt) => (
                  <div key={debt.id} className="bg-gray-700/30 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white">{debt.creditorName}</h4>
                        <p className="text-sm text-gray-400">{debt.debtType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(debt.currentBalance)}</p>
                        <p className="text-sm text-gray-400">{debt.interestRate}% APR</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Monthly Payment</span>
                        <span className="text-white">{formatCurrency(debt.minimumPayment)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400">No debts recorded</p>
                <p className="text-sm text-gray-500">Great job staying debt-free!</p>
              </div>
            )}
          </div>

          {/* Profile Summary */}
          <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Profile Summary</h3>
            {profile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Age Group</p>
                    <p className="text-white font-medium">{profile.ageGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Occupation</p>
                    <p className="text-white font-medium">{profile.occupation || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Family Size</p>
                    <p className="text-white font-medium">{profile.familySize || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Primary Goal</p>
                    <p className="text-white font-medium capitalize">{profile.primaryGoal?.replace('-', ' ') || 'Not specified'}</p>
                  </div>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <p className="text-sm text-gray-400 mb-2">Financial Overview</p>
                  <div className="space-y-2">
                    {profile.monthlyIncome && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Monthly Income:</span>
                        <span className="text-white font-medium">{formatCurrency(profile.monthlyIncome)}</span>
                      </div>
                    )}
                    {profile.monthlyBudget && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Monthly Budget:</span>
                        <span className="text-white font-medium">{formatCurrency(profile.monthlyBudget)}</span>
                      </div>
                    )}
                    {profile.savingsTarget && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Savings Target:</span>
                        <span className="text-white font-medium">{formatCurrency(profile.savingsTarget)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-gray-400">Profile not completed</p>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="mt-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Complete your profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-colors text-left">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h4 className="font-medium">Add Transaction</h4>
              <p className="text-sm text-blue-100">Record income or expense</p>
            </button>
            
            <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-colors text-left">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4 className="font-medium">View Reports</h4>
              <p className="text-sm text-green-100">Analyze your finances</p>
            </button>
            
            <button 
              onClick={() => setShowOnboarding(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl transition-colors text-left"
            >
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h4 className="font-medium">Settings</h4>
              <p className="text-sm text-purple-100">Update preferences</p>
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