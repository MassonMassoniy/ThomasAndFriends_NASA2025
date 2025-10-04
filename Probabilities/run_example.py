#!/usr/bin/env python3
"""
Simple command-line example to run the NASA Weather Probability Estimator for specific dates
"""

import subprocess
import sys

def run_command_example():
    """Run the script with command-line arguments for date prediction"""
    
    # Example coordinates for Austin, Texas
    longitude = -97.1384
    latitude = 30.2672
    
    # Example command for predicting weather on July 15th (using dynamic year range and all parameters)
    cmd = [
        sys.executable, 
        "nasa_weather_probability.py",
        "--longitude", str(longitude),
        "--latitude", str(latitude),
        "--date", "07/15",  # July 15th
        "--tolerance-days", "7",
        "--output", "austin_july_15_prediction.json"
    ]
    
    print("Running NASA Weather Probability Estimator for July 15th...")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("STDOUT:")
        print(result.stdout)
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)

def run_winter_example():
    """Run example for winter date prediction"""
    
    # Example coordinates for New York City
    longitude = -74.0060
    latitude = 40.7128
    
    # Example command for predicting weather on January 15th (using dynamic year range and all parameters)
    cmd = [
        sys.executable, 
        "nasa_weather_probability.py",
        "--longitude", str(longitude),
        "--latitude", str(latitude),
        "--date", "01/15",  # January 15th
        "--tolerance-days", "5",
        "--output", "nyc_january_15_prediction.json"
    ]
    
    print("\nRunning NASA Weather Probability Estimator for January 15th...")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("STDOUT:")
        print(result.stdout)
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)

def run_specific_year_example():
    """Run example for specific year date prediction"""
    
    # Example coordinates for London
    longitude = -0.1276
    latitude = 51.5074
    
    # Example command for predicting weather on June 21st, 2025 (using dynamic year range and all parameters)
    cmd = [
        sys.executable, 
        "nasa_weather_probability.py",
        "--longitude", str(longitude),
        "--latitude", str(latitude),
        "--date", "2025/06/21",  # June 21st, 2025
        "--tolerance-days", "10",
        "--output", "london_june_21_2025_prediction.json"
    ]
    
    print("\nRunning NASA Weather Probability Estimator for June 21st, 2025...")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("STDOUT:")
        print(result.stdout)
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)

if __name__ == "__main__":
    run_command_example()
    # run_winter_example()
    # run_specific_year_example()