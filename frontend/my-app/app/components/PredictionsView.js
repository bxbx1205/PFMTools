'use client'

import { useState, useEffect } from 'react'

export default function PredictionsView() {
  const [dailyPrediction, setDailyPrediction] = useState(null)
  const [weeklyPrediction, setWeeklyPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('daily')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    setLoading(true)
    setError(null)
    
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please login to view predictions')
      setLoading(false)
      return
    }

    try {
      // Load both daily and weekly predictions
      const [dailyResponse, weeklyResponse] = await Promise.all([
        fetch('http://localhost:5000/api/predict/daily-expense', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }),
        fetch('http://localhost:5000/api/predict/weekly-expense', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        })
      ])

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json()
        setDailyPrediction(dailyData)
      }

      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json()
        setWeeklyPrediction(weeklyData)
      }

    } catch (err) {
      console.error('Error loading predictions:', err)
      setError('Failed to load predictions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const refreshPredictions = async () => {
    setRefreshing(true)
    await loadPredictions()
    setRefreshing(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'success':
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
    }
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return 'text-emerald-400'
      case 'medium':
        return 'text-amber-400'
      case 'low':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Spending Patterns</h2>
          <p className="text-slate-400">Generating AI-powered predictions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Prediction Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={loadPredictions}
            className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/5 via-slate-900/10 to-cyan-900/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .glass-morphism {
          background: rgba(15, 15, 24, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="glass-morphism rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                  AI Expense <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Predictions</span>
                </h1>
                <p className="text-slate-400 font-medium">Advanced machine learning insights for your spending patterns</p>
              </div>
              <button
                onClick={refreshPredictions}
                disabled={refreshing}
                className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="glass-morphism rounded-2xl p-2 mb-8 inline-flex">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Prediction
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'weekly'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Forecast
            </button>
          </div>

          {/* Daily Prediction Tab */}
          {activeTab === 'daily' && dailyPrediction && (
            <div className="space-y-8">
              {/* Main Prediction Card */}
              <div className="glass-morphism rounded-2xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Prediction Display */}
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Today's Prediction</h3>
                        <p className="text-slate-400 text-sm">Based on AI analysis</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-2">
                          {formatCurrency(dailyPrediction.prediction?.predicted_spend || 0)}
                        </p>
                        <p className="text-slate-400 font-medium">Predicted daily expense</p>
                      </div>
                      
                      <div className="flex items-center justify-center lg:justify-start space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-sm text-slate-300">
                            {dailyPrediction.prediction?.model_accuracy || 85}% Accuracy
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            dailyPrediction.prediction?.confidence_level === 'High' ? 'bg-emerald-400' :
                            dailyPrediction.prediction?.confidence_level === 'Medium' ? 'bg-amber-400' : 'bg-red-400'
                          }`}></div>
                          <span className={`text-sm ${getConfidenceColor(dailyPrediction.prediction?.confidence_level)}`}>
                            {dailyPrediction.prediction?.confidence_level || 'Medium'} Confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Factors Analysis */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-6">Analysis Factors</h4>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-4 border border-slate-600/30">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">Historical Pattern</span>
                          <span className="text-white font-bold">
                            {formatCurrency(dailyPrediction.prediction?.factors?.historical_pattern || 0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-4 border border-slate-600/30">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">Income Ratio</span>
                          <span className="text-white font-bold">
                            {dailyPrediction.prediction?.factors?.income_ratio || '0'}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-4 border border-slate-600/30">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">Debt Impact</span>
                          <span className={`font-bold ${
                            dailyPrediction.prediction?.factors?.debt_impact === 'High' ? 'text-red-400' :
                            dailyPrediction.prediction?.factors?.debt_impact === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {dailyPrediction.prediction?.factors?.debt_impact || 'Low'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {dailyPrediction.prediction?.recommendations && dailyPrediction.prediction.recommendations.length > 0 && (
                <div className="glass-morphism rounded-2xl p-8">
                  <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 text-violet-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Smart Recommendations
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dailyPrediction.prediction.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
                          rec.type === 'warning' ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30' :
                          rec.type === 'success' ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30' :
                          rec.type === 'info' ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30' :
                          'bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {getRecommendationIcon(rec.type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-white mb-2">{rec.title}</h5>
                            <p className="text-sm text-slate-300 mb-3">{rec.message}</p>
                            <p className="text-xs font-medium text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg">
                              💡 {rec.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weekly Prediction Tab */}
          {activeTab === 'weekly' && weeklyPrediction && (
            <div className="space-y-8">
              {/* Weekly Overview */}
              <div className="glass-morphism rounded-2xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <svg className="w-6 h-6 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      7-Day Forecast
                    </h3>
                    
                    <div className="space-y-4">
                      {weeklyPrediction.weekly_predictions?.map((day, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${
                                day.day_of_week === 'Saturday' || day.day_of_week === 'Sunday' 
                                  ? 'bg-amber-400' : 'bg-blue-400'
                              }`}></div>
                              <div>
                                <p className="font-bold text-white">{day.day_of_week}</p>
                                <p className="text-sm text-slate-400">{new Date(day.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-white">
                                {formatCurrency(day.predicted_spend)}
                              </p>
                              <p className="text-sm text-slate-400">
                                {day.day_of_week === 'Saturday' || day.day_of_week === 'Sunday' ? 'Weekend' : 'Weekday'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-white mb-6">Weekly Summary</h4>
                    <div className="space-y-6">
                      <div className="text-center p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                          {formatCurrency(weeklyPrediction.total_weekly_spend || 0)}
                        </p>
                        <p className="text-slate-400 font-medium">Total Weekly Spend</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">Model Accuracy</span>
                          <span className="text-emerald-400 font-bold">
                            {weeklyPrediction.model_accuracy || 85}%
                          </span>
                        </div>
                        
                        {weeklyPrediction.insights && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300 font-medium">Savings Opportunity</span>
                              <span className="text-cyan-400 font-bold">
                                {formatCurrency(weeklyPrediction.insights.savings_opportunity || 0)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300 font-medium">Budget Status</span>
                              <span className={`font-bold ${
                                weeklyPrediction.insights.budget_status === 'Over budget' ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                {weeklyPrediction.insights.budget_status}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Insights */}
              {weeklyPrediction.insights && (
                <div className="glass-morphism rounded-2xl p-8">
                  <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Weekly Insights
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-bold text-white mb-2">Weekend Pattern</h5>
                          <p className="text-sm text-slate-300">{weeklyPrediction.insights.weekend_pattern}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-bold text-white mb-2">Savings Potential</h5>
                          <p className="text-sm text-slate-300">
                            You could save {formatCurrency(weeklyPrediction.insights.savings_opportunity || 0)} this week
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Model Status */}
          <div className="glass-morphism rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 font-medium">
                ML Model Status: {dailyPrediction?.fallback_used || weeklyPrediction?.fallback_used ? 'Fallback Mode' : 'Fully Operational'}
              </span>
              {(dailyPrediction?.fallback_used || weeklyPrediction?.fallback_used) && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                  Using built-in algorithms
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
