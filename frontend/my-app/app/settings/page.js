'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const router = useRouter()

  // Form states
  const [profileForm, setProfileForm] = useState({
    ageGroup: '',
    familySize: '',
    occupation: '',
    monthlyIncome: '',
    monthlyBudget: '',
    savingsTarget: '',
    primaryGoal: '',
    riskTolerance: '',
    investmentExperience: '',
    hasExistingInvestments: '',
    preferredCurrency: 'INR',
    darkMode: true
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [pinForm, setPinForm] = useState({
    newPin: '',
    confirmPin: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false
  })

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
      
      // Load user data
      const userResponse = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      // Load profile data
      const profileResponse = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)
        setProfileForm({
          ageGroup: profileData.profile?.ageGroup || '',
          familySize: profileData.profile?.familySize || '',
          occupation: profileData.profile?.occupation || '',
          monthlyIncome: profileData.profile?.monthlyIncome || '',
          monthlyBudget: profileData.profile?.monthlyBudget || '',
          savingsTarget: profileData.profile?.savingsTarget || '',
          primaryGoal: profileData.profile?.primaryGoal || '',
          riskTolerance: profileData.profile?.riskTolerance || '',
          investmentExperience: profileData.profile?.investmentExperience || '',
          hasExistingInvestments: profileData.profile?.hasExistingInvestments || '',
          preferredCurrency: profileData.profile?.preferredCurrency || 'INR',
          darkMode: profileData.profile?.darkMode !== false
        })
        setNotificationSettings({
          email: profileData.profile?.notificationPreferences?.email !== false,
          push: profileData.profile?.notificationPreferences?.push !== false,
          sms: profileData.profile?.notificationPreferences?.sms === true
        })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    if (!checkAuth()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileForm,
          notificationPreferences: notificationSettings
        })
      })

      if (response.ok) {
        alert('Profile updated successfully!')
        loadData()
      } else {
        const error = await response.json()
        alert('Failed to update profile: ' + error.message)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        alert('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.json()
        alert('Failed to change password: ' + error.message)
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('Failed to change password')
    }
  }

  const handlePinSetup = async (e) => {
    e.preventDefault()
    if (pinForm.newPin !== pinForm.confirmPin) {
      alert('PINs do not match')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/user/setup-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pin: pinForm.newPin
        })
      })

      if (response.ok) {
        alert('PIN setup successfully!')
        setShowPinModal(false)
        setPinForm({ newPin: '', confirmPin: '' })
        loadData()
      } else {
        const error = await response.json()
        alert('Failed to setup PIN: ' + error.message)
      }
    } catch (error) {
      console.error('Failed to setup PIN:', error)
      alert('Failed to setup PIN')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        localStorage.removeItem('token')
        localStorage.removeItem('lastEmail')
        localStorage.removeItem('userName')
        router.push('/login')
      } else {
        alert('Failed to delete account')
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Failed to delete account')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading settings...</p>
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
                <div className="w-4 h-10 bg-gradient-to-b from-violet-400 via-purple-500 to-cyan-400 rounded-full"></div>
                <h1 className="text-4xl font-black gradient-text tracking-tight">
                  Settings
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 font-medium">Welcome, <span className="text-white font-semibold gradient-text">{user?.name}</span>!</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Enhanced Design */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="neural-card rounded-3xl p-8 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold gradient-text mb-2">Navigation</h2>
                <div className="w-full h-0.5 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"></div>
              </div>
              <nav className="space-y-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-400/30 shadow-lg shadow-violet-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/50 border border-transparent hover:border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold">Profile Settings</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === 'security'
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-400/30 shadow-lg shadow-violet-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/50 border border-transparent hover:border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-semibold">Security</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === 'notifications'
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-400/30 shadow-lg shadow-violet-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/50 border border-transparent hover:border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Notifications</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === 'preferences'
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-400/30 shadow-lg shadow-violet-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/50 border border-transparent hover:border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold">Preferences</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('danger')}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === 'danger'
                      ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-400/30 shadow-lg shadow-red-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/50 border border-transparent hover:border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-semibold">Danger Zone</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <div className="neural-card rounded-3xl p-10 shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white mb-3 flex items-center">
                    <div className="w-4 h-10 bg-gradient-to-b from-violet-400 via-purple-500 to-cyan-400 rounded-full mr-4"></div>
                    <span className="gradient-text">Profile Information</span>
                  </h3>
                  <p className="text-slate-400 text-lg">Manage your personal profile and financial preferences</p>
                  <div className="w-full h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 rounded-full mt-4"></div>
                </div>
                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Age Group</label>
                      <select
                        value={profileForm.ageGroup}
                        onChange={(e) => setProfileForm({...profileForm, ageGroup: e.target.value})}
                        className="w-full bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50"
                      >
                        <option value="">Select age group</option>
                        <option value="18-25">18-25</option>
                        <option value="26-35">26-35</option>
                        <option value="36-45">36-45</option>
                        <option value="46-55">46-55</option>
                        <option value="56+">56+</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Family Size</label>
                      <select
                        value={profileForm.familySize}
                        onChange={(e) => setProfileForm({...profileForm, familySize: e.target.value})}
                        className="w-full bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50"
                      >
                        <option value="">Select family size</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5+">5+</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Occupation</label>
                      <input
                        type="text"
                        value={profileForm.occupation}
                        onChange={(e) => setProfileForm({...profileForm, occupation: e.target.value})}
                        placeholder="Your occupation"
                        className="w-full bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50 placeholder-slate-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={profileForm.monthlyIncome}
                        onChange={(e) => setProfileForm({...profileForm, monthlyIncome: e.target.value})}
                        placeholder="50000"
                        className="w-full bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50 placeholder-slate-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Monthly Budget (₹)</label>
                      <input
                        type="number"
                        value={profileForm.monthlyBudget}
                        onChange={(e) => setProfileForm({...profileForm, monthlyBudget: e.target.value})}
                        placeholder="40000"
                        className="w-full bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50 placeholder-slate-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Savings Target (₹)</label>
                      <input
                        type="number"
                        value={profileForm.savingsTarget}
                        onChange={(e) => setProfileForm({...profileForm, savingsTarget: e.target.value})}
                        placeholder="100000"
                        className="w-full bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50 placeholder-slate-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Primary Goal</label>
                      <select
                        value={profileForm.primaryGoal}
                        onChange={(e) => setProfileForm({...profileForm, primaryGoal: e.target.value})}
                        className="w-full bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50"
                      >
                        <option value="">Select primary goal</option>
                        <option value="debt-payoff">Debt Payoff</option>
                        <option value="emergency-fund">Emergency Fund</option>
                        <option value="saving">Saving</option>
                        <option value="investment">Investment</option>
                        <option value="retirement">Retirement</option>
                        <option value="home-buying">Home Buying</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Risk Tolerance</label>
                      <select
                        value={profileForm.riskTolerance}
                        onChange={(e) => setProfileForm({...profileForm, riskTolerance: e.target.value})}
                        className="w-full bg-slate-900/70 border border-violet-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-300 hover:border-violet-400/50"
                      >
                        <option value="">Select risk tolerance</option>
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      type="submit"
                      className="group bg-gradient-to-r from-violet-500 via-purple-600 to-cyan-500 hover:from-violet-600 hover:via-purple-700 hover:to-cyan-600 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105"
                    >
                      <span className="flex items-center">
                        Update Profile
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="neural-card rounded-3xl p-10 shadow-2xl">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-white mb-3 flex items-center">
                      <div className="w-4 h-10 bg-gradient-to-b from-blue-400 via-cyan-500 to-teal-400 rounded-full mr-4"></div>
                      <span className="gradient-text">Security Settings</span>
                    </h3>
                    <p className="text-slate-400 text-lg">Protect your account with enhanced security measures</p>
                    <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 rounded-full mt-4"></div>
                  </div>
                  <div className="space-y-8">
                    <div className="group p-8 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-3xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">Change Password</h4>
                            <p className="text-slate-400">Update your account password for enhanced security</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>

                    <div className="group p-8 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-3xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">PIN Setup</h4>
                            <p className="text-slate-400">
                              {user?.pinEnabled ? 'Update your PIN for quick access' : 'Set up a PIN for quick access'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPinModal(true)}
                          className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105"
                        >
                          {user?.pinEnabled ? 'Update PIN' : 'Setup PIN'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="neural-card rounded-3xl p-10 shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white mb-3 flex items-center">
                    <div className="w-4 h-10 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-400 rounded-full mr-4"></div>
                    <span className="gradient-text">Notification Preferences</span>
                  </h3>
                  <p className="text-slate-400 text-lg">Control how you receive updates and alerts</p>
                  <div className="w-full h-0.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-400 rounded-full mt-4"></div>
                </div>
                <div className="space-y-8">
                  <div className="group p-8 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-3xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">Email Notifications</h4>
                          <p className="text-slate-400">Receive updates and alerts via email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotificationSettings({...notificationSettings, email: !notificationSettings.email})}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none transform hover:scale-105 ${
                          notificationSettings.email ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25' : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                            notificationSettings.email ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="group p-8 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-3xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">Push Notifications</h4>
                          <p className="text-slate-400">Receive push notifications in browser</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotificationSettings({...notificationSettings, push: !notificationSettings.push})}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none transform hover:scale-105 ${
                          notificationSettings.push ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25' : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                            notificationSettings.push ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="group p-8 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-3xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">SMS Notifications</h4>
                          <p className="text-slate-400">Receive updates via SMS</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotificationSettings({...notificationSettings, sms: !notificationSettings.sms})}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none transform hover:scale-105 ${
                          notificationSettings.sms ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25' : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                            notificationSettings.sms ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="neural-card rounded-3xl p-10 shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white mb-3 flex items-center">
                    <div className="w-4 h-10 bg-gradient-to-b from-purple-400 via-violet-500 to-indigo-400 rounded-full mr-4"></div>
                    <span className="gradient-text">App Preferences</span>
                  </h3>
                  <p className="text-slate-400 text-lg">Customize your application experience</p>
                  <div className="w-full h-0.5 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-400 rounded-full mt-4"></div>
                </div>
                <div className="space-y-8">
                  <div className="group p-8 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-3xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">Currency</h4>
                          <p className="text-slate-400">Select your preferred currency for transactions</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <select
                          value={profileForm.preferredCurrency}
                          onChange={(e) => setProfileForm({...profileForm, preferredCurrency: e.target.value})}
                          className="bg-slate-900/70 border border-purple-500/30 text-white rounded-2xl px-6 py-3 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 hover:border-purple-400/50 text-lg font-semibold"
                        >
                          <option value="INR">₹ INR</option>
                          <option value="USD">$ USD</option>
                          <option value="EUR">€ EUR</option>
                          <option value="GBP">£ GBP</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="neural-card rounded-3xl p-10 shadow-2xl border border-red-500/30 bg-gradient-to-br from-red-900/10 to-rose-900/10">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-red-400 mb-3 flex items-center">
                    <div className="w-4 h-10 bg-gradient-to-b from-red-400 via-rose-500 to-pink-400 rounded-full mr-4"></div>
                    <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">Danger Zone</span>
                  </h3>
                  <p className="text-slate-400 text-lg">Irreversible actions that affect your account</p>
                  <div className="w-full h-0.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-400 rounded-full mt-4"></div>
                </div>
                <div className="space-y-8">
                  <div className="group p-8 bg-gradient-to-r from-red-900/30 to-rose-900/30 border border-red-500/30 rounded-3xl hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-red-400">Delete Account</h4>
                          <p className="text-slate-400">Permanently delete your account and all associated data</p>
                          <p className="text-red-300 text-sm mt-1 font-medium">⚠️ This action cannot be undone</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105 border border-red-500/50"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Enhanced Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="neural-card rounded-3xl p-10 w-full max-w-md shadow-2xl border border-blue-500/30">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold gradient-text">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                  className="w-full bg-slate-900/70 border border-blue-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 hover:border-blue-400/50"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                  minLength={6}
                  className="w-full bg-slate-900/70 border border-blue-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 hover:border-blue-400/50"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                  className="w-full bg-slate-900/70 border border-blue-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 hover:border-blue-400/50"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="neural-card rounded-3xl p-10 w-full max-w-md shadow-2xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold gradient-text">Setup PIN</h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePinSetup} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">New PIN (4 digits)</label>
                <input
                  type="password"
                  value={pinForm.newPin}
                  onChange={(e) => setPinForm({...pinForm, newPin: e.target.value})}
                  required
                  pattern="[0-9]{4}"
                  maxLength={4}
                  className="w-full bg-slate-900/70 border border-purple-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-center text-2xl tracking-widest transition-all duration-300 hover:border-purple-400/50"
                  placeholder="••••"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 mb-3 block tracking-wide">Confirm PIN</label>
                <input
                  type="password"
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm({...pinForm, confirmPin: e.target.value})}
                  required
                  pattern="[0-9]{4}"
                  maxLength={4}
                  className="w-full bg-slate-900/70 border border-purple-500/30 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-center text-2xl tracking-widest transition-all duration-300 hover:border-purple-400/50"
                  placeholder="••••"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105"
                >
                  Setup PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}