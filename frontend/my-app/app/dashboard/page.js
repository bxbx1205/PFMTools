'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingModal from '../components/OnboardingModal'
import EmailModal from '../components/EmailModal'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profile, setProfile] = useState(null)
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showEmailModal, setShowEmailModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

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
      
      const userResponse = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)

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
            
            setShowOnboarding(true)
          }
        } catch (error) {
          console.log('No profile found, showing onboarding')
          setShowOnboarding(true)
        }

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
    
    checkAuth()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('lastPhone')
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
        {}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-emerald-900/10"></div>
          {}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-float"
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
        
        {}
        <div className="relative z-10 text-center">
          {}
          <div className="relative mb-8 group">
            <div className="w-24 h-24 mx-auto relative">
              {}
              <div className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-green-500 to-emerald-500 animate-spin"></div>
              {}
              <div className="absolute inset-2 bg-gradient-to-br from-green-600 via-emerald-600 to-lime-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-black text-white tracking-tighter">S</span>
              </div>
              {}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 animate-ping"></div>
            </div>
          </div>
          
          {}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Sav<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">R</span>
            </h2>
            <p className="text-green-300 font-medium">Initializing your financial ecosystem...</p>
            
            {}
            <div className="flex justify-center space-x-2 mt-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {}
      <div className="fixed inset-0 pointer-events-none">
        {}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/5 via-gray-900/10 to-emerald-900/5"></div>
        
        {}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-lime-500/10 to-green-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '6s'}}></div>
        </div>

        {}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-float"
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

          {}
          <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
            
            * {
              font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
              font-feature-settings: "cv02", "cv03", "cv04", "cv11";
            }        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 15, 24, 0.8);
          border-radius: 12px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .glass-morphism {
          background: rgba(10, 15, 10, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(34, 197, 94, 0.2);
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
            0 0 40px rgba(34, 197, 94, 0.15);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .text-gradient {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .border-gradient {
          border-image: linear-gradient(135deg, #22c55e, #16a34a) 1;
        }
      `}</style>

      {}
      <header className="fixed top-6 left-6 right-6 z-50">
        <div className="glass-morphism rounded-2xl px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {}
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-black text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
              
              {}
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {getGreeting()}, <span className="text-gradient">{user?.name}</span>
                </h1>
                <p className="text-sm text-green-300 font-medium">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowEmailModal(true)}
                className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 hover:border-green-400/50 text-green-300 hover:text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Send Weekly Report</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="group relative overflow-hidden bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 border border-red-500/30 text-red-300 hover:text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {}
      <main className="relative z-10 pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
              {}
              <div className="glass-morphism rounded-3xl p-8 mb-8 card-hover relative overflow-hidden border-2 border-slate-600/30">
                {}
                <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-emerald-500/8 via-green-500/5 to-slate-600/10 rounded-full blur-3xl opacity-70 animate-float"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-500/6 to-emerald-500/8 rounded-full blur-2xl opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-10 bg-gradient-to-b from-emerald-400/80 via-green-500/70 to-slate-500/60 rounded-full animate-pulse-glow"></div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-black text-white tracking-tight">
                            Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400/90 to-slate-300">Hub</span>
                          </h3>
                          <div className="bg-gradient-to-r from-emerald-500/80 to-green-500/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                            AI POWERED
                          </div>
                        </div>
                        <p className="text-slate-300 font-medium">Your intelligent financial command center</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-400/70 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-400/60 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                        <div className="w-2 h-2 bg-slate-400/70 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      </div>
                      <span className="text-sm text-slate-300 bg-gray-800/30 px-3 py-1 rounded-full border border-slate-600/50">
                        Live Data
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push('/analytics')}
                    className="group w-full relative overflow-hidden bg-gradient-to-br from-slate-700/20 via-emerald-500/8 to-slate-700/15 hover:from-slate-700/30 hover:via-emerald-500/15 hover:to-slate-700/25 border border-slate-600/40 hover:border-emerald-400/30 text-white p-6 rounded-2xl transition-all duration-500 text-left"
                  >
                    {}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-slate-600/8 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-slate-500/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150"></div>                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                          Deep Insights & Predictive Analysis
                        </h4>
                        <p className="text-green-200 font-medium">
                          Unlock AI-driven financial forecasting and smart recommendations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        FEATURED
                      </div>
                      <svg className="w-5 h-5 text-emerald-400 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/25 border border-emerald-500/30 rounded-lg p-3 group-hover:border-emerald-400/50 transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-emerald-300 font-bold text-xs">ML Predictions</p>
                          <p className="text-green-200 text-xs">Smart forecasts</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500/15 to-green-600/25 border border-green-500/30 rounded-lg p-3 group-hover:border-green-400/50 transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-300 font-bold text-xs">Smart Insights</p>
                          <p className="text-green-200 text-xs">AI guidance</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-lime-500/15 to-lime-600/25 border border-lime-500/30 rounded-lg p-3 group-hover:border-lime-400/50 transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-lime-500 rounded-md flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lime-300 font-bold text-xs">Trend Analysis</p>
                          <p className="text-green-200 text-xs">Pattern detection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {}
          <div className="glass-morphism rounded-3xl p-8 mb-12 card-hover">
            <div className="relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-emerald-400/80 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      </div>
                      <span className="text-sm text-slate-300 font-medium uppercase tracking-wider">Financial Command Center</span>
                    </div>
                    <h2 className="text-5xl font-black text-white mb-4 tracking-tight">
                      Your Money,<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400/90 to-slate-300">Simplified</span>
                    </h2>
                    <p className="text-xl text-slate-300 font-medium max-w-2xl leading-relaxed">
                      Advanced analytics and intelligent insights to optimize your financial future
                    </p>
                  </div>
                  
                  {}
                  <div className="hidden lg:block relative">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-green-300">Total Balance</p>
                            <p className="text-lg font-bold text-white">
                              {profile?.monthlyIncome ? formatCurrency(profile.monthlyIncome) : '₹0'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-emerald-500/10 to-lime-500/10 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-emerald-300">Active Goals</p>
                            <p className="text-lg font-bold text-white">{debts.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {}
            <div className="lg:col-span-8 space-y-8">
              {}
              <div className="glass-morphism rounded-2xl p-6 card-hover mb-6 border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span className="text-purple-300 font-semibold text-sm">Featured Financial Tools</span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Sponsored</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">₹</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Tax Saver Fund</p>
                        <p className="text-purple-200 text-xs">12.5% Returns</p>
                      </div>
                    </div>
                    <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-xs font-semibold transition-colors">
                      Invest Now
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">💳</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Credit Card</p>
                        <p className="text-blue-200 text-xs">Instant Approval</p>
                      </div>
                    </div>
                    <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-xs font-semibold transition-colors">
                      Apply Free
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">🏠</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Home Loan</p>
                        <p className="text-green-200 text-xs">6.5% Interest</p>
                      </div>
                    </div>
                    <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-xs font-semibold transition-colors">
                      Check Eligibility
                    </button>
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {}
                <div className="glass-morphism rounded-2xl p-6 card-hover group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Monthly Income</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-black text-white">
                              {profile?.monthlyIncome ? formatCurrency(profile.monthlyIncome) : 'Not set'}
                            </p>
                            <div className="flex items-center space-x-1 text-emerald-400 text-sm">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span className="font-medium">+12%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-glow"></div>
                  </div>
                </div>

                {}
                <div className="glass-morphism rounded-2xl p-6 card-hover group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Total Obligations</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-black text-white">
                              {formatCurrency(debts.reduce((sum, debt) => sum + debt.currentBalance, 0))}
                            </p>
                            <div className="flex items-center space-x-1 text-red-400 text-sm">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                              </svg>
                              <span className="font-medium">{debts.length} active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse-glow"></div>
                  </div>
                </div>
              </div>

              {}
              <div className="glass-morphism rounded-2xl p-8 card-hover">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-white">Debt Portfolio</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-green-300 bg-gray-800/30 px-3 py-1 rounded-full border border-green-700/50">
                      {debts.length} {debts.length === 1 ? 'obligation' : 'obligations'}
                    </div>
                    <button 
                      onClick={() => router.push('/loans')}
                      className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                    >
                      Manage
                    </button>
                  </div>
                </div>
                
                {debts.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {debts.map((debt, index) => (
                      <div key={debt.id} className="bg-gradient-to-r from-slate-800/20 to-slate-700/20 hover:from-slate-800/40 hover:to-slate-700/40 rounded-xl p-6 transition-all duration-300 border border-slate-700/30 hover:border-slate-600/50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-white">{debt.creditorName[0]}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-lg">{debt.creditorName}</h4>
                                <span className="text-xs bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300 px-2 py-1 rounded-full font-medium uppercase tracking-wider">{debt.debtType}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-6">
                              <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Outstanding</p>
                                <p className="text-xl font-black text-white">{formatCurrency(debt.currentBalance)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Rate</p>
                                <p className="text-xl font-black text-red-400">{debt.interestRate}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Payment</p>
                                <p className="text-xl font-black text-white">{formatCurrency(debt.minimumPayment)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto animate-float">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur opacity-20 animate-pulse"></div>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-3">Debt-Free Excellence! 🚀</h4>
                    <p className="text-slate-400 font-medium max-w-md mx-auto">You're crushing it with zero debt obligations. Keep building that wealth!</p>
                  </div>
                )}
              </div>

              {/* Interstitial AdSense - Mid-Content Placement */}
              <div className="glass-morphism rounded-2xl p-6 card-hover my-8 border-indigo-500/30">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <span className="text-indigo-300 text-xs uppercase tracking-wider font-semibold">Premium Recommendation</span>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-xl p-8 relative overflow-hidden">
                  {/* Animated background elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-xl"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                      <span className="text-yellow-300 text-lg">⚡</span>
                      <span className="text-white font-bold text-sm">Limited Time Offer</span>
                    </div>
                    
                    <h3 className="text-white font-black text-2xl mb-4">
                      Unlock Premium Financial Analytics
                    </h3>
                    <p className="text-indigo-100 font-medium mb-6 max-w-2xl mx-auto">
                      Get AI-powered insights, advanced charts, and personalized investment recommendations. 
                      Join 50,000+ users who've improved their financial health.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                      <div className="flex items-center space-x-2 text-white">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Real-time alerts</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Portfolio optimization</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Expert guidance</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl hover:bg-indigo-50 transition-colors duration-300 shadow-lg">
                        Start Free Trial
                      </button>
                      <button className="border-2 border-white/30 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/10 transition-colors duration-300">
                        View Plans
                      </button>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center space-x-4 text-indigo-200 text-sm">
                      <span>⭐ 4.9/5 Rating</span>
                      <span>•</span>
                      <span>📱 10M+ Downloads</span>
                      <span>•</span>
                      <span>🔒 Bank-level Security</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="lg:col-span-4 space-y-8">
              {}
              <div className="glass-morphism rounded-2xl p-4 card-hover border-cyan-500/30 sticky top-32">
                <div className="text-center mb-3">
                  <span className="text-cyan-300 text-xs uppercase tracking-wider font-semibold">Advertisement</span>
                </div>
                
                <div className="bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl">📈</span>
                    </div>
                    
                    <h4 className="text-white font-bold text-lg mb-2">Stock Market Mastery</h4>
                    <p className="text-cyan-100 text-sm mb-4 leading-relaxed">
                      Learn to trade like a pro with our AI-powered trading signals and market analysis
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center space-x-2 text-white text-sm">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>95% Success Rate</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-white text-sm">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span>Real-time Alerts</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-white text-cyan-600 font-bold py-3 px-4 rounded-lg hover:bg-cyan-50 transition-colors duration-300 shadow-lg">
                      Get Free Signals
                    </button>
                    
                    <div className="mt-3 text-cyan-200 text-xs">
                      ⚡ Limited: First 100 users only
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mt-2 space-x-2 text-xs text-gray-400">
                  <span>Google AdSense</span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>High RPM</span>
                </div>
              </div>

              {}
              <div className="glass-morphism rounded-2xl p-6 card-hover">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white">Profile</h3>
                  </div>
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
                
                {profile ? (
                  <div className="space-y-6">
                    {}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-xl p-4 border border-slate-600/30">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Age Group</p>
                        <p className="text-lg font-bold text-white">{profile.ageGroup || 'Not set'}</p>
                      </div>
                      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-xl p-4 border border-slate-600/30">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Risk Level</p>
                        <p className="text-lg font-bold text-white capitalize">{profile.riskTolerance || 'Moderate'}</p>
                      </div>
                    </div>
                    
                    {}
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Goals & Targets
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">Savings Target</span>
                          <span className="text-white font-bold">
                            {profile.savingsTarget ? formatCurrency(profile.savingsTarget) : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">Primary Goal</span>
                          <span className="text-cyan-300 font-bold capitalize">
                            {profile.primaryGoal?.replace('-', ' ') || 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-20 animate-pulse"></div>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Setup Profile</h4>
                    <p className="text-slate-400 font-medium text-sm mb-4">Complete your financial profile</p>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>

              {}
              <div className="glass-morphism rounded-2xl p-6 card-hover">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white">Quick Insights</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-300">Spending Trend</p>
                      <p className="text-white font-bold">12% below budget</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-300">Savings Rate</p>
                      <p className="text-white font-bold">
                        {profile?.savingsTarget && profile?.monthlyIncome 
                          ? `${Math.round((profile.savingsTarget / profile.monthlyIncome) * 100)}%`
                          : 'Calculate now'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="glass-morphism rounded-2xl p-6 card-hover border-blue-500/30">
                <div className="text-center">
                  <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-3">Advertisement</div>
                  
                  {}
                  <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 relative overflow-hidden">
                    {}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      
                      <h4 className="text-white font-bold text-lg mb-2">Credit Score Boost</h4>
                      <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                        Improve your credit score by 100+ points with our AI-powered financial tools
                      </p>
                      
                      <button className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                        Get Started Free
                      </button>
                      
                      <div className="mt-3 flex items-center justify-center space-x-1 text-blue-200 text-xs">
                        <span>⭐⭐⭐⭐⭐</span>
                        <span>4.9/5 Rating</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center mt-3 space-x-2 text-xs text-gray-400">
                    <span>Ads by Google</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>Why this ad?</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="glass-morphism rounded-2xl p-8 card-hover">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-8 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
              </div>
              <div className="text-sm text-slate-400">Essential financial tools</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {}
              <button 
                onClick={() => router.push('/transactions')}
                className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/8 to-slate-700/15 hover:from-emerald-500/15 hover:to-slate-700/25 border border-emerald-500/20 hover:border-emerald-400/40 text-white p-6 rounded-xl transition-all duration-300 text-left card-hover"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-slate-600/15 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/80 to-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-emerald-400/80 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Record Transaction</h4>
                  <p className="text-sm text-slate-300 font-medium">Track income, expenses with smart categorization</p>
                </div>
              </button>

              {}
              <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border border-orange-500/30 hover:border-orange-400/50 text-white p-6 rounded-xl transition-all duration-300 text-left card-hover">
                <div className="absolute top-2 right-2">
                  <span className="text-orange-300 text-xs bg-orange-500/20 px-2 py-1 rounded-full">Ad</span>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl">💰</span>
                    </div>
                    <svg className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Earn ₹5000 Monthly</h4>
                  <p className="text-sm text-orange-300 font-medium">Start freelancing with top-rated projects</p>
                  <div className="mt-3 flex items-center space-x-2 text-xs text-orange-200">
                    <span>⭐ 4.8 Rating</span>
                    <span>•</span>
                    <span>🚀 Quick Setup</span>
                  </div>
                </div>
              </div>
              
              {}
              <button 
                onClick={() => router.push('/loans')}
                className="group relative overflow-hidden bg-gradient-to-br from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 border border-red-500/30 hover:border-red-400/50 text-white p-6 rounded-xl transition-all duration-300 text-left card-hover"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Debt Manager</h4>
                  <p className="text-sm text-slate-400 font-medium">Optimize payment strategies and track progress</p>
                </div>
              </button>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {}
              <button 
                onClick={() => router.push('/settings')}
                className="group relative overflow-hidden bg-gradient-to-br from-slate-600/15 to-emerald-500/8 hover:from-slate-600/25 hover:to-emerald-500/15 border border-slate-500/30 hover:border-emerald-400/40 text-white p-6 rounded-xl transition-all duration-300 text-left card-hover"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-600/15 to-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-emerald-500/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-emerald-400/80 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Preferences</h4>
                  <p className="text-sm text-slate-300 font-medium">Customize goals and notification settings</p>
                </div>
              </button>

              {}
              <div className="group relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border border-violet-500/30 hover:border-violet-400/50 text-white p-6 rounded-xl transition-all duration-300 text-left card-hover">
                <div className="absolute top-2 right-2">
                  <span className="text-violet-300 text-xs bg-violet-500/20 px-2 py-1 rounded-full">Sponsored</span>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl">📱</span>
                    </div>
                    <svg className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Trading App</h4>
                  <p className="text-sm text-violet-300 font-medium">Zero brokerage • Free demat account</p>
                  <div className="mt-3 flex items-center space-x-2 text-xs text-violet-200">
                    <span>🎁 ₹1000 Bonus</span>
                    <span>•</span>
                    <span>📈 Live Charts</span>
                  </div>
                </div>
              </div>

              {}
              <div className="group relative overflow-hidden bg-gradient-to-br from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border border-teal-500/30 hover:border-teal-400/50 text-white p-6 rounded-xl transition-all duration-300 text-left card-hover">
                <div className="absolute top-2 right-2">
                  <span className="text-teal-300 text-xs bg-teal-500/20 px-2 py-1 rounded-full">Ad</span>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl">🛡️</span>
                    </div>
                    <svg className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Life Insurance</h4>
                  <p className="text-sm text-teal-300 font-medium">₹1 Crore cover from ₹490/month</p>
                  <div className="mt-3 flex items-center space-x-2 text-xs text-teal-200">
                    <span>⚡ 2 Min Quote</span>
                    <span>•</span>
                    <span>🏆 #1 Rated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="glass-morphism rounded-2xl p-6 card-hover mt-8 border-yellow-500/30">
            <div className="text-center mb-4">
              <div className="text-xs text-yellow-300 uppercase tracking-wider font-semibold">Sponsored Content</div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-xl p-6 relative overflow-hidden">
              {}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-red-500/20 animate-pulse"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-black text-xl mb-1">🚀 Investment Opportunity</h4>
                    <p className="text-yellow-100 font-medium">Start investing with just ₹100 • Zero commission • AI-powered portfolio</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <button className="bg-white text-orange-600 font-bold py-3 px-6 rounded-lg hover:bg-yellow-50 transition-colors duration-300 shadow-lg">
                    Start Investing
                  </button>
                  <div className="mt-2 text-yellow-200 text-sm">
                    💰 Limited time: Get ₹500 bonus
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-3 space-x-2 text-xs text-gray-400">
              <span>AdSense Demo</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>Revenue Active</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>Click Performance: 2.8% CTR</span>
            </div>
          </div>
        </div>
      </main>

      {}
      <OnboardingModal 
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        userName={user?.name || 'User'}
      />

      {}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        userName={user?.name || 'User'}
      />

      {}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">💳</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Get Credit Card</p>
                <p className="text-emerald-100 text-xs">Instant approval • ₹5L limit</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-white text-emerald-600 font-bold py-2 px-4 rounded-lg text-sm">
                Apply
              </button>
              <button className="text-white text-lg">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}