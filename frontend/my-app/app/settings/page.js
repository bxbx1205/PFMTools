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
                <div className="w-3 h-8 bg-gradient-to-b from-purple-400 to-violet-500 rounded-full mr-3"></div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Settings
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 font-medium">Welcome, <span className="text-white font-semibold">{user?.name}</span>!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="glass-morphism rounded-2xl p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'profile'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'security'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'preferences'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab('danger')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'danger'
                      ? 'bg-red-500/20 text-red-400 border border-red-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Danger Zone
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <div className="glass-morphism rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <div className="w-3 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full mr-3"></div>
                  Profile Information
                </h3>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Age Group</label>
                      <select
                        value={profileForm.ageGroup}
                        onChange={(e) => setProfileForm({...profileForm, ageGroup: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      >
                        <option value="">Select age group</option>
                        <option value="18-25">18-25</option>
                        <option value="26-35">26-35</option>
                        <option value="36-45">36-45</option>
                        <option value="46-55">46-55</option>
                        <option value="56+">56+</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Family Size</label>
                      <select
                        value={profileForm.familySize}
                        onChange={(e) => setProfileForm({...profileForm, familySize: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      >
                        <option value="">Select family size</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5+">5+</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Occupation</label>
                      <input
                        type="text"
                        value={profileForm.occupation}
                        onChange={(e) => setProfileForm({...profileForm, occupation: e.target.value})}
                        placeholder="Your occupation"
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={profileForm.monthlyIncome}
                        onChange={(e) => setProfileForm({...profileForm, monthlyIncome: e.target.value})}
                        placeholder="50000"
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Monthly Budget (₹)</label>
                      <input
                        type="number"
                        value={profileForm.monthlyBudget}
                        onChange={(e) => setProfileForm({...profileForm, monthlyBudget: e.target.value})}
                        placeholder="40000"
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Savings Target (₹)</label>
                      <input
                        type="number"
                        value={profileForm.savingsTarget}
                        onChange={(e) => setProfileForm({...profileForm, savingsTarget: e.target.value})}
                        placeholder="100000"
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Primary Goal</label>
                      <select
                        value={profileForm.primaryGoal}
                        onChange={(e) => setProfileForm({...profileForm, primaryGoal: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
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

                    <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Risk Tolerance</label>
                      <select
                        value={profileForm.riskTolerance}
                        onChange={(e) => setProfileForm({...profileForm, riskTolerance: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      >
                        <option value="">Select risk tolerance</option>
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="glass-morphism rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full mr-3"></div>
                    Security Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="text-lg font-semibold text-white">Change Password</h4>
                        <p className="text-slate-400">Update your account password</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="text-lg font-semibold text-white">PIN Setup</h4>
                        <p className="text-slate-400">
                          {user?.pinEnabled ? 'Update your PIN for quick access' : 'Set up a PIN for quick access'}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPinModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        {user?.pinEnabled ? 'Update PIN' : 'Setup PIN'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="glass-morphism rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <div className="w-3 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-3"></div>
                  Notification Preferences
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-xl">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Email Notifications</h4>
                      <p className="text-slate-400">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, email: !notificationSettings.email})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        notificationSettings.email ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-xl">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Push Notifications</h4>
                      <p className="text-slate-400">Receive push notifications in browser</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, push: !notificationSettings.push})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        notificationSettings.push ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-xl">
                    <div>
                      <h4 className="text-lg font-semibold text-white">SMS Notifications</h4>
                      <p className="text-slate-400">Receive updates via SMS</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, sms: !notificationSettings.sms})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        notificationSettings.sms ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.sms ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="glass-morphism rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <div className="w-3 h-8 bg-gradient-to-b from-purple-400 to-violet-500 rounded-full mr-3"></div>
                  App Preferences
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-800/30 rounded-xl">
                    <div>
                      <h4 className="text-lg font-semibold text-white">Currency</h4>
                      <p className="text-slate-400">Select your preferred currency</p>
                    </div>
                    <select
                      value={profileForm.preferredCurrency}
                      onChange={(e) => setProfileForm({...profileForm, preferredCurrency: e.target.value})}
                      className="bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    >
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </select>
                  </div>

                  
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="glass-morphism rounded-3xl p-8 border border-red-500/30">
                <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
                  <div className="w-3 h-8 bg-gradient-to-b from-red-400 to-rose-500 rounded-full mr-3"></div>
                  Danger Zone
                </h3>
                <div className="space-y-6">
                  <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h4>
                    <p className="text-slate-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-morphism rounded-3xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                  minLength={6}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-morphism rounded-3xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Setup PIN</h3>
              <button
                onClick={() => setShowPinModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePinSetup} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">New PIN (4 digits)</label>
                <input
                  type="password"
                  value={pinForm.newPin}
                  onChange={(e) => setPinForm({...pinForm, newPin: e.target.value})}
                  required
                  pattern="[0-9]{4}"
                  maxLength={4}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-center text-2xl tracking-widest"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Confirm PIN</label>
                <input
                  type="password"
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm({...pinForm, confirmPin: e.target.value})}
                  required
                  pattern="[0-9]{4}"
                  maxLength={4}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white py-3 rounded-xl font-semibold transition-all duration-300"
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