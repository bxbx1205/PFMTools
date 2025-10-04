#!/usr/bin/env python3
"""
Test script to verify ML service is working correctly with real data validation
"""
import requests
import json

def test_ml_service():
    # Test data that should be accepted (non-zero categories)
    test_data = {
        'user_id': 'test123',
        'category_averages': {
            'food': 300,
            'transport': 150,
            'bills': 200,
            'health': 80,
            'education': 0,  # Some categories can be zero
            'entertainment': 120,
            'other': 100
        },
        'income': 50000,
        'debt_payments': 5000,
        'future_dates': [
            '2024-12-30', '2024-12-31', '2025-01-01', 
            '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05'
        ]
    }

    print('🧪 Testing ML service with valid data...')
    try:
        response = requests.post('http://localhost:8000/predict_weekly', 
                               json=test_data, 
                               timeout=30)
        print(f'📊 Response Status: {response.status_code}')
        
        if response.status_code == 200:
            result = response.json()
            print('✅ ML service working correctly!')
            print(f'📅 Daily predictions generated: {len(result.get("daily_predictions", []))} days')
            print(f'💰 Budget calculation: ₹{result.get("budget_used", "N/A")}')
            print(f'✓ Validation passed: {result.get("validation_passed", False)}')
            print(f'📊 Using real data: {bool(result.get("input_data_used"))}')
            print(f'🔧 Fallback mode: {result.get("fallback_used", False)}')
            
            # Check if predictions are for future dates
            predictions = result.get('daily_predictions', [])
            if predictions:
                print(f'📆 First prediction date: {predictions[0].get("date")}')
                print(f'📆 Last prediction date: {predictions[-1].get("date")}')
            
        else:
            print(f'❌ Error Response: {response.text}')
            
    except requests.exceptions.ConnectionError:
        print('❌ Connection Error: ML service not running on port 8000')
        print('💡 Start ML service with: python app.py')
    except Exception as e:
        print(f'❌ Unexpected error: {e}')

def test_invalid_data():
    print('\n🧪 Testing ML service with invalid data (all zeros)...')
    
    # Test data that should be rejected (all zero categories)
    invalid_data = {
        'user_id': 'test123',
        'category_averages': {
            'food': 0,
            'transport': 0,
            'bills': 0,
            'health': 0,
            'education': 0,
            'entertainment': 0,
            'other': 0
        },
        'income': 50000,
        'debt_payments': 5000,
        'future_dates': ['2024-12-30', '2024-12-31']
    }
    
    try:
        response = requests.post('http://localhost:8000/predict_weekly', 
                               json=invalid_data, 
                               timeout=30)
        print(f'📊 Response Status: {response.status_code}')
        
        if response.status_code == 400:
            print('✅ Correctly rejected invalid data!')
            print(f'📝 Error message: {response.json().get("error", "No error message")}')
        else:
            print(f'⚠️ Unexpected response: {response.text}')
            
    except Exception as e:
        print(f'❌ Error testing invalid data: {e}')

if __name__ == "__main__":
    test_ml_service()
    test_invalid_data()