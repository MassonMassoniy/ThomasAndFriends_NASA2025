#!/usr/bin/env python3
"""
NASA Weather Probability Estimator
A dynamic script to query NASA Power API for weather data and predict probabilities for specific dates
"""

import requests
import json
import datetime
from typing import Dict, List, Any, Optional, Tuple
import argparse
import sys
from collections import defaultdict


class NASAWeatherProbability:
    """Main class for handling NASA Power API requests and date-specific probability calculations"""
    
    # Available parameters from NASA Power API
    AVAILABLE_PARAMETERS = {
        'T2M': 'Air Temperature at 2 meters (°C)',
        'T2M_MAX': 'Daily Maximum Temperature (°C)',
        'T2M_MIN': 'Daily Minimum Temperature (°C)',
        'PRECTOTCORR': 'Corrected Total Precipitation (mm/day)',
        'WS2M': 'Wind Speed at 2 meters (m/s)',
        'RH2M': 'Relative Humidity at 2 meters (%)',
        'T2MWET': 'Wet-bulb Temperature at 2 meters (°C)',
        'IMERG_PRECLIQUID_PROB': 'Probability of Liquid Precipitation',
        'CLRSKY_SFC_SW_DWN': 'Clear-sky irradiance'
    }
    
    # Thresholds for "very" conditions
    THRESHOLDS = {
        'very_hot_temp': 35.0,  # °C
        'very_cold_temp': -10.0,  # °C
        'very_windy_speed': 10.0,  # m/s
        'very_wet_precip': 10.0,  # mm/day
        'very_uncomfortable_humidity': 80.0  # %
    }
    
    def __init__(self, longitude: float, latitude: float, start_year: int = 2010, end_year: int = 2024):
        """
        Initialize the NASA Weather Probability estimator
        
        Args:
            longitude: Longitude coordinate
            latitude: Latitude coordinate
            start_year: Start year for data collection (default: 2010)
            end_year: End year for data collection (default: 2024)
        """
        self.longitude = longitude
        self.latitude = latitude
        self.start_year = start_year
        self.end_year = end_year
        self.base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        
        # Use all available parameters by default
        self.default_parameters = list(self.AVAILABLE_PARAMETERS.keys())
        
    def build_api_url(self, parameters: List[str], start_date: str, end_date: str) -> str:
        """
        Build the NASA Power API URL with specified parameters
        
        Args:
            parameters: List of parameter codes to request
            start_date: Start date in YYYYMMDD format
            end_date: End date in YYYYMMDD format
            
        Returns:
            Complete API URL
        """
        params_str = ','.join(parameters)
        
        url = f"{self.base_url}?parameters={params_str}&community=RE&longitude={self.longitude}&latitude={self.latitude}&start={start_date}&end={end_date}&format=JSON"
        
        return url
    
    def make_api_request(self, parameters: List[str]) -> Dict[str, Any]:
        """
        Make a request to NASA Power API
        
        Args:
            parameters: List of parameter codes to request
            
        Returns:
            API response data
        """
        start_date = f"{self.start_year}0101"
        end_date = f"{self.end_year}1231"
        
        url = self.build_api_url(parameters, start_date, end_date)
        
        try:
            print(f"Making request to: {url}")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"Error making API request: {e}")
            return {}
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}")
            return {}
    
    def parse_date_string(self, date_str: str) -> Tuple[int, int]:
        """
        Parse date string to extract month and day
        
        Args:
            date_str: Date in format "YYYY/MM/DD" or "MM/DD"
            
        Returns:
            Tuple of (month, day)
        """
        try:
            if '/' in date_str:
                parts = date_str.split('/')
                if len(parts) == 3:  # YYYY/MM/DD
                    return int(parts[1]), int(parts[2])
                elif len(parts) == 2:  # MM/DD
                    return int(parts[0]), int(parts[1])
            else:
                # Assume YYYYMMDD format
                if len(date_str) == 8:
                    month = int(date_str[4:6])
                    day = int(date_str[6:8])
                    return month, day
        except (ValueError, IndexError):
            pass
        
        raise ValueError(f"Invalid date format: {date_str}. Use YYYY/MM/DD, MM/DD, or YYYYMMDD")
    
    def get_seasonal_data(self, data: Dict[str, Any], parameters: List[str], target_month: int, target_day: int, tolerance_days: int = 7) -> Dict[str, List[float]]:
        """
        Extract data for dates around the target date across all years
        
        Args:
            data: Raw API response data
            parameters: List of requested parameters
            target_month: Target month
            target_day: Target day
            tolerance_days: Number of days before/after target date to include
            
        Returns:
            Dictionary with parameter data for seasonal analysis
        """
        if not data or 'properties' not in data:
            return {}
        
        properties = data['properties']
        parameter_data = properties.get('parameter', {})
        
        seasonal_data = defaultdict(list)
        
        for param in parameters:
            if param not in parameter_data:
                continue
                
            param_values = parameter_data[param]
            if not param_values:
                continue
            
            # Extract values for dates around target date
            for date_key, value_data in param_values.items():
                if isinstance(value_data, (int, float)) and value_data is not None:
                    try:
                        # Parse date from key (format: YYYYMMDD)
                        if len(date_key) == 8:
                            year = int(date_key[:4])
                            month = int(date_key[4:6])
                            day = int(date_key[6:8])
                            
                            # Check if this date is within tolerance of target date
                            if self.is_date_in_range(month, day, target_month, target_day, tolerance_days):
                                seasonal_data[param].append(value_data)
                    except (ValueError, IndexError):
                        continue
        
        return dict(seasonal_data)
    
    def is_date_in_range(self, month: int, day: int, target_month: int, target_day: int, tolerance_days: int) -> bool:
        """
        Check if a date is within tolerance days of the target date
        
        Args:
            month: Month to check
            day: Day to check
            target_month: Target month
            target_day: Target day
            tolerance_days: Number of days tolerance
            
        Returns:
            True if date is within range
        """
        # Convert to day of year for easier comparison
        try:
            date_obj = datetime.date(2024, month, day)  # Use leap year for consistency
            target_date_obj = datetime.date(2024, target_month, target_day)
            
            # Calculate difference in days
            diff = abs((date_obj - target_date_obj).days)
            
            # Handle year boundary (e.g., Dec 31 to Jan 1)
            if diff > 180:  # More than half a year apart
                diff = 365 - diff
            
            return diff <= tolerance_days
        except ValueError:
            return False
    
    def calculate_date_probabilities(self, seasonal_data: Dict[str, List[float]], parameters: List[str]) -> Dict[str, Any]:
        """
        Calculate weather probabilities for a specific date based on seasonal data
        
        Args:
            seasonal_data: Data for dates around target date
            parameters: List of requested parameters
            
        Returns:
            Dictionary with calculated probabilities and predicted values
        """
        results = {
            'probabilities': {},
            'predicted_values': {},
            'confidence': {},
            'metadata': {
                'location': {'longitude': self.longitude, 'latitude': self.latitude},
                'data_points_used': {},
                'parameters_requested': parameters
            }
        }
        
        probabilities = {}
        predicted_values = {}
        confidence = {}
        
        for param in parameters:
            if param not in seasonal_data or not seasonal_data[param]:
                continue
            
            values = seasonal_data[param]
            results['metadata']['data_points_used'][param] = len(values)
            
            if len(values) < 5:  # Need minimum data points for reliable statistics
                confidence[param] = "low"
            elif len(values) < 15:
                confidence[param] = "medium"
            else:
                confidence[param] = "high"
            
            # Calculate statistics
            mean_val = sum(values) / len(values)
            std_val = (sum((x - mean_val) ** 2 for x in values) / len(values)) ** 0.5
            
            predicted_values[param] = round(mean_val, 2)
            
            # Calculate probabilities based on parameter type
            if param == 'T2M' or param == 'T2M_MAX':
                # Temperature probabilities
                hot_count = sum(1 for v in values if v > self.THRESHOLDS['very_hot_temp'])
                cold_count = sum(1 for v in values if v < self.THRESHOLDS['very_cold_temp'])
                
                probabilities['very_hot'] = round((hot_count / len(values)) * 100, 1)
                probabilities['very_cold'] = round((cold_count / len(values)) * 100, 1)
                
            elif param == 'WS2M':
                # Wind speed probability
                windy_count = sum(1 for v in values if v > self.THRESHOLDS['very_windy_speed'])
                probabilities['very_windy'] = round((windy_count / len(values)) * 100, 1)
                
            elif param == 'PRECTOTCORR':
                # Precipitation probability
                wet_count = sum(1 for v in values if v > self.THRESHOLDS['very_wet_precip'])
                probabilities['very_wet'] = round((wet_count / len(values)) * 100, 1)
                
            elif param == 'RH2M':
                # Humidity probability
                uncomfortable_count = sum(1 for v in values if v > self.THRESHOLDS['very_uncomfortable_humidity'])
                probabilities['very_uncomfortable'] = round((uncomfortable_count / len(values)) * 100, 1)
        
        results['probabilities'] = probabilities
        results['predicted_values'] = predicted_values
        results['confidence'] = confidence
        
        # Add derived predictions
        if 'T2M' in predicted_values:
            temp = predicted_values['T2M']
            results['predicted_values']['feeling'] = "Hot" if temp > 25 else "Cold"
        
        if 'PRECTOTCORR' in predicted_values:
            precip = predicted_values['PRECTOTCORR']
            results['predicted_values']['precipitation'] = precip > 1.0
        
        # Air quality estimation (simplified based on humidity and precipitation)
        air_quality = 5  # Default moderate
        if 'RH2M' in predicted_values and 'PRECTOTCORR' in predicted_values:
            humidity = predicted_values['RH2M']
            precip = predicted_values['PRECTOTCORR']
            
            if humidity > 80 and precip > 5:
                air_quality = 3  # Poor
            elif humidity < 40 and precip < 1:
                air_quality = 8  # Good
            elif humidity < 60 and precip < 2:
                air_quality = 7  # Fair
        
        results['predicted_values']['air_quality'] = air_quality
        
        return results
    
    def predict_weather_for_date(self, target_date: str, parameters: Optional[List[str]] = None, tolerance_days: int = 7) -> Dict[str, Any]:
        """
        Main method to predict weather for a specific date
        
        Args:
            target_date: Target date in format "YYYY/MM/DD", "MM/DD", or "YYYYMMDD"
            parameters: List of parameter codes to request (if None, uses all available parameters)
            tolerance_days: Number of days before/after target date to include in analysis
            
        Returns:
            Complete weather prediction for the target date
        """
        # Use all parameters by default if none specified
        if parameters is None:
            parameters = self.default_parameters
            print(f"Using all available parameters: {', '.join(parameters)}")
        
        # Validate parameters
        invalid_params = [p for p in parameters if p not in self.AVAILABLE_PARAMETERS]
        if invalid_params:
            print(f"Warning: Invalid parameters: {invalid_params}")
            parameters = [p for p in parameters if p in self.AVAILABLE_PARAMETERS]
        
        if not parameters:
            print("Error: No valid parameters specified")
            return {}
        
        # Parse target date
        try:
            target_month, target_day = self.parse_date_string(target_date)
        except ValueError as e:
            print(f"Error: {e}")
            return {}
        
        # Make API request
        print(f"Requesting data for parameters: {parameters}")
        data = self.make_api_request(parameters)
        
        if not data:
            print("Error: Failed to retrieve data from NASA API")
            return {}
        
        # Extract seasonal data around target date
        seasonal_data = self.get_seasonal_data(data, parameters, target_month, target_day, tolerance_days)
        
        if not seasonal_data:
            print("Error: No seasonal data found for the specified date range")
            return {}
        
        # Calculate probabilities
        results = self.calculate_date_probabilities(seasonal_data, parameters)
        
        # Add target date to metadata
        results['metadata']['target_date'] = target_date
        results['metadata']['target_month'] = target_month
        results['metadata']['target_day'] = target_day
        results['metadata']['tolerance_days'] = tolerance_days
        
        return results


def main():
    """Main function to run the script"""
    parser = argparse.ArgumentParser(description='NASA Weather Probability Estimator for Specific Dates')
    parser.add_argument('--longitude', type=float, required=True, help='Longitude coordinate')
    parser.add_argument('--latitude', type=float, required=True, help='Latitude coordinate')
    parser.add_argument('--date', type=str, required=True, help='Target date (YYYY/MM/DD, MM/DD, or YYYYMMDD)')
    parser.add_argument('--parameters', nargs='*', 
                       choices=list(NASAWeatherProbability.AVAILABLE_PARAMETERS.keys()),
                       default=None,
                       help='Parameters to request from NASA API (if not specified, uses all available parameters)')
    parser.add_argument('--start-year', type=int, default=2010, help='Start year for data collection (default: 2010)')
    parser.add_argument('--end-year', type=int, default=2024, help='End year for data collection (default: 2024)')
    parser.add_argument('--tolerance-days', type=int, default=7, help='Days before/after target date to include (default: 7)')
    parser.add_argument('--output', type=str, help='Output file path (optional)')
    
    args = parser.parse_args()
    
    # Create estimator instance
    estimator = NASAWeatherProbability(
        longitude=args.longitude,
        latitude=args.latitude,
        start_year=args.start_year,
        end_year=args.end_year
    )
    
    # Use all parameters if none specified
    parameters = args.parameters if args.parameters else None
    
    # Predict weather for target date
    results = estimator.predict_weather_for_date(args.date, parameters, args.tolerance_days)
    
    if not results:
        print("Failed to predict weather for the specified date")
        sys.exit(1)
    
    # Output results
    output_json = json.dumps(results, indent=2)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output_json)
        print(f"Results saved to {args.output}")
    else:
        print(f"Weather Prediction for {args.date}:")
        print(output_json)


if __name__ == "__main__":
    main()