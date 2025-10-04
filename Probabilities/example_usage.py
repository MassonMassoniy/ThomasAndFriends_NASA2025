#!/usr/bin/env python3
"""
Example usage of the NASA Weather Probability Estimator for specific dates
"""

from nasa_weather_probability import NASAWeatherProbability
import json

def example_summer_date():
    """Example predicting weather for a summer date"""
    print("=== Summer Date Prediction Example ===")
    
    # Create estimator for Austin, Texas coordinates
    estimator = NASAWeatherProbability(
        longitude=-97.1384,
        latitude=30.2672,
        start_year=2015,
        end_year=2024
    )
    
    # Predict weather for July 15th (summer)
    target_date = "07/15"  # July 15th
    parameters = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'WS2M', 'RH2M']
    
    results = estimator.predict_weather_for_date(target_date, parameters, tolerance_days=7)
    
    print(f"Weather Prediction for {target_date}:")
    print(json.dumps(results, indent=2))

def example_winter_date():
    """Example predicting weather for a winter date"""
    print("\n=== Winter Date Prediction Example ===")
    
    # Create estimator for New York City coordinates
    estimator = NASAWeatherProbability(
        longitude=-74.0060,
        latitude=40.7128,
        start_year=2020,
        end_year=2024
    )
    
    # Predict weather for January 15th (winter)
    target_date = "01/15"  # January 15th
    parameters = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'WS2M', 'RH2M']
    
    results = estimator.predict_weather_for_date(target_date, parameters, tolerance_days=5)
    
    print(f"Weather Prediction for {target_date}:")
    print(json.dumps(results, indent=2))

def example_specific_year_date():
    """Example predicting weather for a specific date with year"""
    print("\n=== Specific Year Date Prediction Example ===")
    
    # Create estimator for London coordinates
    estimator = NASAWeatherProbability(
        longitude=-0.1276,
        latitude=51.5074,
        start_year=2018,
        end_year=2024
    )
    
    # Predict weather for June 21st, 2025 (summer solstice)
    target_date = "2025/06/21"  # June 21st, 2025
    parameters = ['T2M', 'T2M_MAX', 'PRECTOTCORR', 'WS2M', 'RH2M']
    
    results = estimator.predict_weather_for_date(target_date, parameters, tolerance_days=10)
    
    print(f"Weather Prediction for {target_date}:")
    print(json.dumps(results, indent=2))

def example_spring_date():
    """Example predicting weather for a spring date"""
    print("\n=== Spring Date Prediction Example ===")
    
    # Create estimator for Tokyo coordinates
    estimator = NASAWeatherProbability(
        longitude=139.6917,
        latitude=35.6895,
        start_year=2010,
        end_year=2024
    )
    
    # Predict weather for April 15th (spring)
    target_date = "04/15"  # April 15th
    parameters = ['T2M', 'T2M_MAX', 'PRECTOTCORR', 'WS2M', 'RH2M']
    
    results = estimator.predict_weather_for_date(target_date, parameters, tolerance_days=7)
    
    print(f"Weather Prediction for {target_date}:")
    print(json.dumps(results, indent=2))

def example_save_to_file():
    """Example of saving results to a file"""
    print("\n=== Save to File Example ===")
    
    # Create estimator for Miami coordinates
    estimator = NASAWeatherProbability(
        longitude=-80.1918,
        latitude=25.7617,
        start_year=2015,
        end_year=2024
    )
    
    # Predict weather for August 15th (peak summer)
    target_date = "08/15"  # August 15th
    parameters = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'WS2M', 'RH2M']
    
    results = estimator.predict_weather_for_date(target_date, parameters, tolerance_days=7)
    
    # Save to file
    output_file = "miami_august_weather_prediction.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Results saved to {output_file}")

def example_compare_dates():
    """Example comparing weather predictions for different dates"""
    print("\n=== Date Comparison Example ===")
    
    # Create estimator for Denver coordinates
    estimator = NASAWeatherProbability(
        longitude=-104.9903,
        latitude=39.7392,
        start_year=2015,
        end_year=2024
    )
    
    parameters = ['T2M', 'T2M_MAX', 'PRECTOTCORR', 'WS2M']
    
    # Compare different dates
    dates_to_compare = ["01/15", "04/15", "07/15", "10/15"]
    
    comparison_results = {}
    
    for date in dates_to_compare:
        results = estimator.predict_weather_for_date(date, parameters, tolerance_days=7)
        comparison_results[date] = {
            'probabilities': results.get('probabilities', {}),
            'predicted_values': results.get('predicted_values', {}),
            'confidence': results.get('confidence', {})
        }
    
    print("Weather Comparison Across Different Dates:")
    print(json.dumps(comparison_results, indent=2))

if __name__ == "__main__":
    try:
        example_summer_date()
        example_winter_date()
        example_specific_year_date()
        example_spring_date()
        example_save_to_file()
        example_compare_dates()
        
    except Exception as e:
        print(f"Error running examples: {e}")