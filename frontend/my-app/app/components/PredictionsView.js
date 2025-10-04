'use client'

import { useState, useEffect, useCallback } from 'react'

export default function PredictionsView() {
  const [weeklyPrediction, setWeeklyPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [mlServiceStatus, setMlServiceStatus] = useState('checking')

  const loadPredictions = useCallback(async () => {
    console.log('🔵 loadPredictions called')
    setLoading(true)
    setError(null)
    
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('❌ No token found')
      setError('Please login to view predictions')
      setLoading(false)
      return
    }

    try {
      // Check ML service health
      try {
        const healthResponse = await fetch('http://localhost:8000/health')
        console.log('ML Service Health:', healthResponse.status)
        setMlServiceStatus(healthResponse.ok ? 'connected' : 'disconnected')
      } catch (err) {
        console.error('ML Service Health Error:', err)
        setMlServiceStatus('disconnected')
      }

      // Load weekly predictions
      const weeklyResponse = await fetch('http://localhost:5000/api/predict/weekly-expense', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json()
        console.log('✅ Data received:', weeklyData)
        
        // Check if this is an insufficient data response
        if (weeklyData.success === false && weeklyData.required_days) {
          setError({
            type: 'insufficient_data',
            message: weeklyData.error,
            required_days: weeklyData.required_days,
            current_days: weeklyData.current_days,
            days_remaining: weeklyData.days_remaining,
            has_data: weeklyData.has_data
          })
        } else if (weeklyData.success) {
          setWeeklyPrediction(weeklyData)
        } else {
          throw new Error(weeklyData.error || 'Failed to get weekly predictions')
        }
      } else {
        const errorData = await weeklyResponse.json()
        if (errorData.required_days) {
          setError({
            type: 'insufficient_data',
            message: errorData.error,
            required_days: errorData.required_days,
            current_days: errorData.current_days,
            days_remaining: errorData.days_remaining,
            has_data: errorData.has_data
          })
        } else {
          throw new Error('Failed to get weekly predictions')
        }
      }

    } catch (err) {
      console.error('❌ Error:', err)
      setError('Failed to load ML predictions. Please ensure the ML service is running.')
    } finally {
      console.log('🔵 Setting loading to FALSE')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('🟢 Component mounted')
    loadPredictions()
  }, [loadPredictions])

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-emerald-400'
      case 'disconnected': return 'text-red-400'
      case 'checking': return 'text-amber-400'
      default: return 'text-slate-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return (
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'disconnected':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-amber-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: '64px', height: '64px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pulse 2s infinite'}}>
            <svg style={{width: '32px', height: '32px', color: 'white'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '10px'}}>Analyzing with ML Model</h2>
          <p style={{color: '#94a3b8'}}>Generating AI-powered weekly predictions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    // Handle insufficient data error specifically
    if (error.type === 'insufficient_data') {
      return (
        <div style={{minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{textAlign: 'center', maxWidth: '500px', padding: '20px'}}>
            <div style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
              <svg style={{width: '40px', height: '40px', color: 'white'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 style={{fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '15px'}}>Track Your Expenses First!</h2>
            <p style={{color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6'}}>
              AI predictions require at least <strong style={{color: '#f59e0b'}}>7 days</strong> of expense tracking data to provide accurate forecasts.
            </p>
            
            {/* Progress indicator */}
            <div style={{background: 'rgba(15, 15, 24, 0.6)', borderRadius: '12px', padding: '20px', marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                <span style={{color: '#94a3b8', fontSize: '14px'}}>Progress</span>
                <span style={{color: '#f59e0b', fontSize: '14px', fontWeight: 'bold'}}>
                  {error.current_days}/{error.required_days} days
                </span>
              </div>
              <div style={{width: '100%', height: '8px', background: 'rgba(75, 85, 99, 0.3)', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{
                  width: `${(error.current_days / error.required_days) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <p style={{color: '#94a3b8', fontSize: '14px', marginTop: '10px'}}>
                {error.days_remaining > 0 ? (
                  <>Only <strong style={{color: '#f59e0b'}}>{error.days_remaining} more days</strong> of tracking needed!</>
                ) : (
                  <span style={{color: '#10b981'}}>✅ You have enough days! Please enter actual expense amounts.</span>
                )}
              </p>
            </div>

            <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500'}}
              >
                Start Tracking Expenses
              </button>
              <button
                onClick={loadPredictions}
                style={{background: 'rgba(75, 85, 99, 0.3)', color: '#94a3b8', padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(75, 85, 99, 0.5)', cursor: 'pointer', fontWeight: '500'}}
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Handle other errors
    return (
      <div style={{minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: '64px', height: '64px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
            <svg style={{width: '32px', height: '32px', color: 'white'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '10px'}}>Prediction Error</h2>
          <p style={{color: '#94a3b8', marginBottom: '20px'}}>{typeof error === 'string' ? error : error.message}</p>
          <button
            onClick={loadPredictions}
            style={{background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500'}}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight: '100vh', background: '#0a0a0f', padding: '40px', color: 'white'}}>
      {/* Header */}
      <div style={{maxWidth: '1280px', margin: '0 auto'}}>
        <div style={{background: 'rgba(15, 15, 24, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '16px', padding: '24px', marginBottom: '32px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h1 style={{fontSize: '36px', fontWeight: '900', color: 'white', marginBottom: '8px'}}>
                AI Expense <span style={{background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Predictions</span>
              </h1>
              <p style={{color: '#94a3b8', fontWeight: '500'}}>Next week forecasts based on your actual spending data</p>
            </div>
            <button
              onClick={refreshPredictions}
              disabled={refreshing}
              style={{background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500'}}
            >
              <svg style={{width: '16px', height: '16px', animation: refreshing ? 'spin 1s linear infinite' : 'none'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* ML Service Status */}
        <div style={{background: 'rgba(15, 15, 24, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '16px', padding: '16px', marginBottom: '32px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              {getStatusIcon(mlServiceStatus)}
              <div>
                <p style={{color: 'white', fontWeight: '500'}}>ML Service Status</p>
                <p style={{fontSize: '14px'}} className={getStatusColor(mlServiceStatus)}>
                  {mlServiceStatus === 'connected' ? 'Real-time ML Model Active' : 
                   mlServiceStatus === 'disconnected' ? 'ML Service Offline' : 'Checking Connection...'}
                </p>
              </div>
            </div>
            {mlServiceStatus === 'connected' && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div style={{width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', animation: 'pulse 2s infinite'}}></div>
                <span style={{color: '#34d399', fontSize: '14px', fontWeight: '500'}}>Using PKL Model</span>
              </div>
            )}
          </div>
        </div>

        {weeklyPrediction && weeklyPrediction.weekly_predictions && (
          <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '32px'}}>
            {/* Main Content Grid */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px'}}>
              
              {/* Next Week Predictions */}
              <div style={{background: 'rgba(15, 15, 24, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '16px', padding: '32px'}}>
                <h3 style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <svg style={{width: '24px', height: '24px', color: '#22d3ee'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Next Week Forecast
                  <span style={{fontSize: '14px', background: 'linear-gradient(135deg, #22d3ee, #3b82f6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: '500'}}>
                    Future Predictions
                  </span>
                </h3>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  {weeklyPrediction.weekly_predictions.map((day, index) => (
                    <div
                      key={index}
                      style={{background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(30, 58, 64, 0.4))', borderRadius: '12px', padding: '16px', border: '1px solid rgba(100, 116, 139, 0.3)'}}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                          <div style={{width: '12px', height: '12px', borderRadius: '50%', background: day.day_of_week === 'Saturday' || day.day_of_week === 'Sunday' ? '#fbbf24' : '#3b82f6'}}></div>
                          <div>
                            <p style={{fontWeight: 'bold', color: 'white'}}>{day.day_of_week}</p>
                            <p style={{fontSize: '14px', color: '#94a3b8'}}>{new Date(day.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <p style={{fontSize: '20px', fontWeight: '900', color: 'white'}}>
                            {formatCurrency(day.predicted_spend)}
                          </p>
                          <p style={{fontSize: '14px', color: '#94a3b8'}}>
                            {day.day_of_week === 'Saturday' || day.day_of_week === 'Sunday' ? 'Weekend' : 'Weekday'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Week Actual */}
              {weeklyPrediction.last_week_actual && (
                <div style={{background: 'rgba(15, 15, 24, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '16px', padding: '32px'}}>
                  <h3 style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <svg style={{width: '24px', height: '24px', color: '#a78bfa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Last Week's Actual
                  </h3>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {weeklyPrediction.last_week_actual.map((day, index) => {
                      const prediction = weeklyPrediction.weekly_predictions[index]
                      const difference = prediction ? prediction.predicted_spend - day.actual_spend : 0
                      const isHigher = difference > 0
                      
                      return (
                        <div
                          key={index}
                          style={{background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.4), rgba(88, 28, 135, 0.4))', borderRadius: '12px', padding: '16px', border: '1px solid rgba(167, 139, 250, 0.3)'}}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                              <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#a78bfa'}}></div>
                              <div>
                                <p style={{fontWeight: 'bold', color: 'white'}}>{day.day_of_week}</p>
                                <p style={{fontSize: '14px', color: '#c4b5fd'}}>{new Date(day.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div style={{textAlign: 'right'}}>
                              <p style={{fontSize: '20px', fontWeight: '900', color: 'white'}}>
                                {formatCurrency(day.actual_spend)}
                              </p>
                              {prediction && (
                                <p style={{fontSize: '14px', fontWeight: 'bold', color: isHigher ? '#fb923c' : '#34d399'}}>
                                  {isHigher ? '↑' : '↓'} {formatCurrency(Math.abs(difference))}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Comparison Summary */}
                  <div style={{marginTop: '24px', padding: '16px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(100, 116, 139, 0.3)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <span style={{color: '#cbd5e1', fontWeight: '500'}}>Last Week Total:</span>
                      <span style={{color: '#a78bfa', fontWeight: 'bold', fontSize: '18px'}}>
                        {formatCurrency(weeklyPrediction.total_last_week || 0)}
                      </span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                      <span style={{color: '#cbd5e1', fontWeight: '500'}}>Next Week Predicted:</span>
                      <span style={{color: '#22d3ee', fontWeight: 'bold', fontSize: '18px'}}>
                        {formatCurrency(weeklyPrediction.total_weekly_spend || 0)}
                      </span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(100, 116, 139, 0.3)'}}>
                      <span style={{color: 'white', fontWeight: 'bold'}}>Difference:</span>
                      <span style={{fontWeight: '900', fontSize: '20px', color: weeklyPrediction.total_weekly_spend > weeklyPrediction.total_last_week ? '#ef4444' : '#22c55e'}}>
                        {weeklyPrediction.total_weekly_spend > weeklyPrediction.total_last_week ? '+' : ''}
                        {formatCurrency(weeklyPrediction.total_weekly_spend - weeklyPrediction.total_last_week)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weekly Summary */}
            <div style={{background: 'rgba(15, 15, 24, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '16px', padding: '32px'}}>
              <h4 style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px'}}>Weekly Summary</h4>
              
              <div style={{textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px', marginBottom: '24px'}}>
                <p style={{fontSize: '36px', fontWeight: '900', background: 'linear-gradient(135deg, #22d3ee, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px'}}>
                  {formatCurrency(weeklyPrediction.total_weekly_spend || 0)}
                </p>
                <p style={{color: '#94a3b8', fontWeight: '500'}}>Predicted Weekly Spend</p>
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{color: '#cbd5e1', fontWeight: '500'}}>Model Accuracy</span>
                  <span style={{color: '#34d399', fontWeight: 'bold'}}>
                    {weeklyPrediction.model_accuracy || 85}%
                  </span>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{color: '#cbd5e1', fontWeight: '500'}}>Budget Status</span>
                  <span style={{fontWeight: 'bold', color: weeklyPrediction.insights?.budget_status === 'Over budget' ? '#ef4444' : '#34d399'}}>
                    {weeklyPrediction.insights?.budget_status || 'Unknown'}
                  </span>
                </div>
                
                {weeklyPrediction.insights && (
                  <>
                    {weeklyPrediction.insights.budget_status === 'Over budget' ? (
                      <>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{color: '#cbd5e1', fontWeight: '500'}}>Overspend Amount</span>
                          <span style={{color: '#ef4444', fontWeight: 'bold'}}>
                            +{formatCurrency(weeklyPrediction.insights.overspend_amount || 0)}
                          </span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{color: '#cbd5e1', fontWeight: '500'}}>Reduction Needed</span>
                          <span style={{color: '#fb923c', fontWeight: 'bold'}}>
                            {formatCurrency(weeklyPrediction.insights.reduction_needed || 0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{color: '#cbd5e1', fontWeight: '500'}}>Actual Savings</span>
                          <span style={{color: '#34d399', fontWeight: 'bold'}}>
                            {formatCurrency(weeklyPrediction.insights.actual_savings || 0)}
                          </span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{color: '#cbd5e1', fontWeight: '500'}}>Potential Savings</span>
                          <span style={{color: '#22d3ee', fontWeight: 'bold'}}>
                            {formatCurrency(weeklyPrediction.insights.savings_opportunity || 0)}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Insights */}
              {weeklyPrediction.insights && (
                <div style={{marginTop: '24px', padding: '16px', background: weeklyPrediction.insights.budget_status === 'Over budget' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 211, 153, 0.1)', border: `1px solid ${weeklyPrediction.insights.budget_status === 'Over budget' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`, borderRadius: '12px'}}>
                  <div style={{color: weeklyPrediction.insights.budget_status === 'Over budget' ? '#fca5a5' : '#6ee7b7', marginBottom: '4px', fontWeight: 'bold'}}>
                    Weekend Pattern
                  </div>
                  <div style={{color: '#e2e8f0', fontSize: '14px'}}>
                    {weeklyPrediction.insights.weekend_pattern}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Status */}
            <div style={{background: 'rgba(15, 15, 24, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '16px', padding: '24px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
                {/* ML Model Status */}
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{width: '12px', height: '12px', borderRadius: '50%', animation: 'pulse 2s infinite', background: mlServiceStatus === 'connected' ? '#34d399' : '#ef4444'}}></div>
                  <span style={{color: '#cbd5e1', fontWeight: '500'}}>
                    ML Model: {weeklyPrediction.fallback_used ? 'Fallback Mode' : 'PKL Model Active'}
                  </span>
                  {weeklyPrediction.fallback_used && (
                    <span style={{fontSize: '12px', background: 'rgba(251, 146, 60, 0.2)', color: '#fdba74', padding: '4px 12px', borderRadius: '999px'}}>
                      Backup Algorithm
                    </span>
                  )}
                  {!weeklyPrediction.fallback_used && mlServiceStatus === 'connected' && (
                    <span style={{fontSize: '12px', background: 'rgba(52, 211, 153, 0.2)', color: '#6ee7b7', padding: '4px 12px', borderRadius: '999px'}}>
                      Real ML Model
                    </span>
                  )}
                </div>
                
                {/* Data Source Indicator */}
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <svg style={{width: '16px', height: '16px', color: '#22d3ee'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span style={{color: '#cbd5e1', fontWeight: '500'}}>
                    Data Source: Your Actual Expenses
                  </span>
                  <span style={{fontSize: '12px', background: 'rgba(34, 211, 238, 0.2)', color: '#67e8f9', padding: '4px 12px', borderRadius: '999px'}}>
                    7+ Days Tracked
                  </span>
                </div>
                
                {/* Accuracy Indicator */}
                {weeklyPrediction.input_data_used && (
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{color: '#94a3b8', fontSize: '14px'}}>
                      Based on ₹{Object.values(weeklyPrediction.input_data_used).reduce((sum, val) => sum + (val || 0), 0).toFixed(0)}/day avg
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
