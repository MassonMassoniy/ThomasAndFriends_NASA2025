#!/usr/bin/env python3
"""
Script to analyze null values in NASA Power API data
Shows data completeness and missing values for a specific location and time range
"""

import requests
import json
from collections import defaultdict
import datetime

def analyze_nasa_data(longitude, latitude, start_year=2010, end_year=2024):
    """
    Analyze NASA Power API data for null values and data completeness
    
    Args:
        longitude: Longitude coordinate
        latitude: Latitude coordinate
        start_year: Start year for analysis
        end_year: End year for analysis
    """
    
    # Parameters to analyze
    parameters = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'WS2M', 'RH2M', 'T2MWET']
    
    # Build API URL
    params_str = ','.join(parameters)
    base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    start_date = f"{start_year}0101"
    end_date = f"{end_year}1231"
    
    url = f"{base_url}?parameters={params_str}&community=RE&longitude={longitude}&latitude={latitude}&start={start_date}&end={end_date}&format=JSON"
    
    print(f"Analyzing data for location: {longitude}, {latitude}")
    print(f"Time range: {start_year}-{end_year}")
    print(f"Parameters: {', '.join(parameters)}")
    print(f"API URL: {url}")
    print("-" * 80)
    
    try:
        # Make API request
        print("Making API request...")
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        
        if 'properties' not in data or 'parameter' not in data['properties']:
            print("Error: Invalid API response structure")
            return
        
        parameter_data = data['properties']['parameter']
        
        # Calculate total expected days
        start_date_obj = datetime.date(start_year, 1, 1)
        end_date_obj = datetime.date(end_year, 12, 31)
        total_days = (end_date_obj - start_date_obj).days + 1
        
        print(f"Total expected days in range: {total_days}")
        print()
        
        # Analyze each parameter
        results = {}
        
        for param in parameters:
            if param not in parameter_data:
                print(f"X {param}: Parameter not found in response")
                continue
            
            param_values = parameter_data[param]
            
            # Count different types of values
            total_entries = len(param_values)
            null_count = 0
            valid_count = 0
            zero_count = 0
            
            valid_values = []
            
            for date_key, value in param_values.items():
                if value is None:
                    null_count += 1
                elif isinstance(value, (int, float)):
                    if value == 0:
                        zero_count += 1
                    else:
                        valid_count += 1
                        valid_values.append(value)
                else:
                    # Handle string values that might represent nulls
                    if str(value).lower() in ['null', 'none', 'nan', '']:
                        null_count += 1
                    else:
                        valid_count += 1
            
            # Calculate percentages
            null_percentage = (null_count / total_entries) * 100 if total_entries > 0 else 0
            valid_percentage = (valid_count / total_entries) * 100 if total_entries > 0 else 0
            zero_percentage = (zero_count / total_entries) * 100 if total_entries > 0 else 0
            
            # Calculate data completeness
            completeness = (valid_count / total_days) * 100 if total_days > 0 else 0
            
            results[param] = {
                'total_entries': total_entries,
                'valid_count': valid_count,
                'null_count': null_count,
                'zero_count': zero_count,
                'null_percentage': null_percentage,
                'valid_percentage': valid_percentage,
                'zero_percentage': zero_percentage,
                'completeness': completeness
            }
            
            # Print results for this parameter
            print(f"[{param}] {parameter_descriptions.get(param, 'Unknown')}:")
            print(f"   Total entries: {total_entries:,}")
            print(f"   Valid values: {valid_count:,} ({valid_percentage:.1f}%)")
            print(f"   Null values: {null_count:,} ({null_percentage:.1f}%)")
            print(f"   Zero values: {zero_count:,} ({zero_percentage:.1f}%)")
            print(f"   Data completeness: {completeness:.1f}%")
            
            if valid_values:
                min_val = min(valid_values)
                max_val = max(valid_values)
                avg_val = sum(valid_values) / len(valid_values)
                print(f"   Value range: {min_val:.2f} to {max_val:.2f}")
                print(f"   Average: {avg_val:.2f}")
            
            print()
        
        # Summary
        print("=" * 80)
        print("SUMMARY")
        print("=" * 80)
        
        avg_completeness = sum(r['completeness'] for r in results.values()) / len(results)
        total_nulls = sum(r['null_count'] for r in results.values())
        total_valid = sum(r['valid_count'] for r in results.values())
        
        print(f"Average data completeness: {avg_completeness:.1f}%")
        print(f"Total null values across all parameters: {total_nulls:,}")
        print(f"Total valid values across all parameters: {total_valid:,}")
        
        # Find parameters with most nulls
        if results:
            worst_param = max(results.items(), key=lambda x: x[1]['null_percentage'])
            best_param = min(results.items(), key=lambda x: x[1]['null_percentage'])
            
            print(f"Parameter with most nulls: {worst_param[0]} ({worst_param[1]['null_percentage']:.1f}%)")
            print(f"Parameter with least nulls: {best_param[0]} ({best_param[1]['null_percentage']:.1f}%)")
        
        return results
        
    except requests.exceptions.RequestException as e:
        print(f"Error making API request: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

# Parameter descriptions
parameter_descriptions = {
    'T2M': 'Air Temperature at 2 meters (°C)',
    'T2M_MAX': 'Daily Maximum Temperature (°C)',
    'T2M_MIN': 'Daily Minimum Temperature (°C)',
    'PRECTOTCORR': 'Corrected Total Precipitation (mm/day)',
    'WS2M': 'Wind Speed at 2 meters (m/s)',
    'RH2M': 'Relative Humidity at 2 meters (%)',
    'T2MWET': 'Wet-bulb Temperature at 2 meters (°C)'
}

def main():
    """Main function to run the analysis"""
    
    # Example locations to analyze
    locations = [
        {"name": "Austin, Texas", "longitude": -97.1384, "latitude": 30.2672},
        {"name": "New York City", "longitude": -74.0060, "latitude": 40.7128},
        {"name": "London, UK", "longitude": -0.1276, "latitude": 51.5074},
        {"name": "Tokyo, Japan", "longitude": 139.6917, "latitude": 35.6895}
    ]
    
    print("NASA Power API Data Completeness Analysis")
    print("=" * 80)
    
    for location in locations:
        print(f"\nAnalyzing: {location['name']}")
        print("=" * 60)
        
        results = analyze_nasa_data(
            longitude=location['longitude'],
            latitude=location['latitude'],
            start_year=2010,
            end_year=2024
        )
        
        if results:
            print(f"SUCCESS: Analysis completed for {location['name']}")
        else:
            print(f"ERROR: Analysis failed for {location['name']}")
        
        print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
