# Probabilities - Weather Probability Estimator

## Input:
- **Location**: {longitude: float value, latitude: float value}
- **Date format**: String "YYYY/MM/DD", "MM/DD", or "YYYYMMDD"
- **Year range**: Dynamic by default (current year - 11 to current year - 1), or custom range via command line

## Parameters that we consider:
- **T2M** - Air Temperature at 2 meters (°C)
- **T2M_MAX** - Daily Maximum Temperature (°C)
- **T2M_MIN** - Daily Minimum Temperature (°C)
- **PRECTOTCORR** - Corrected Total Precipitation (mm/day)
- **WS2M** - Wind Speed at 2 meters (m/s)
- **RH2M** - Relative Humidity at 2 meters (%)
- **T2MWET** - Wet-bulb Temperature at 2 meters (°C)
- **IMERG_PRECLIQUID_PROB** - Probability of Liquid Precipitation
- **CLRSKY_SFC_SW_DWN** - Clear-sky irradiance
- Example API request: https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,WS2M,RH2M&community=RE&longitude=-97.1384&latitude=49.8951&start=20100101&end=20241231&format=JSON


## APIs used in the project:
- api-request: NASA Power https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- api-parameters: https://power.larc.nasa.gov/parameters/
- docs: https://power.larc.nasa.gov/docs/services/api/temporal/daily/

## Output JSON Structure:

The script returns a comprehensive JSON object with the following structure:

```json
{
  "probabilities": {
    "very_hot": 70.7,           // Percentage chance of very hot weather (>35°C)
    "very_cold": 0.0,           // Percentage chance of very cold weather (<-10°C)
    "very_windy": 8.7,          // Percentage chance of very windy conditions (>10 m/s)
    "very_wet": 12.3,           // Percentage chance of very wet conditions (>10mm/day)
    "very_uncomfortable": 5.4   // Percentage chance of very uncomfortable humidity (>80%)
  },
  "predicted_values": {
    "T2M": 30.77,               // Predicted air temperature at 2m (°C)
    "T2M_MAX": 37.43,           // Predicted daily maximum temperature (°C)
    "T2M_MIN": 25.12,           // Predicted daily minimum temperature (°C)
    "PRECTOTCORR": 1.83,        // Predicted precipitation (mm/day)
    "WS2M": 3.2,                // Predicted wind speed at 2m (m/s)
    "RH2M": 65.0,               // Predicted relative humidity (%)
    "feeling": "Hot",            // Derived feeling: "Hot" (>25°C) or "Cold" (≤25°C)
    "precipitation": true,       // Boolean: true if precipitation > 1.0mm/day
    "air_quality": 7            // Air quality index (0-10): 3=Poor, 5=Moderate, 7=Fair, 8=Good
  },
  "confidence": {
    "T2M": "high",              // Data confidence level: "low" (<5 points), "medium" (5-14), "high" (≥15)
    "T2M_MAX": "high",
    "PRECTOTCORR": "high",
    "WS2M": "high",
    "RH2M": "high"
  },
  "metadata": {
    "location": {
      "longitude": -97.1384,     // Input longitude coordinate
      "latitude": 30.2672        // Input latitude coordinate
    },
    "data_points_used": {
      "T2M": 75,                 // Number of historical data points used for this parameter
      "T2M_MAX": 75,
      "PRECTOTCORR": 75,
      "WS2M": 75,
      "RH2M": 75
    },
    "parameters_requested": [    // List of parameters requested from NASA API
      "T2M",
      "T2M_MAX", 
      "PRECTOTCORR",
      "WS2M",
      "RH2M"
    ],
    "target_date": "07/15",      // Input target date
    "target_month": 7,           // Parsed target month
    "target_day": 15,            // Parsed target day
    "tolerance_days": 7          // Days before/after target date included in analysis
  }
}
```

### Key Features:
- **Dynamic Year Range**: Automatically uses the last 10 years of data (current year - 11 to current year - 1)
- **All Parameters**: Uses all 9 available weather parameters by default
- **Probabilities**: Historical percentage chances of extreme weather conditions
- **Predicted Values**: Mean values based on historical data for the same seasonal period
- **Confidence Levels**: Indicates reliability based on sample size
- **Metadata**: Complete information about the analysis parameters and data sources
- **Zero Null Values**: NASA Power API provides 100% data completeness (no missing values)

### Usage Examples:

**Basic usage (uses dynamic year range and all parameters):**
```bash
python nasa_weather_probability.py --longitude -97.1384 --latitude 30.2672 --date "07/15"
```

**Custom year range:**
```bash
python nasa_weather_probability.py --longitude -97.1384 --latitude 30.2672 --date "07/15" --start-year 2020 --end-year 2023
```

**Python script usage:**
```python
from nasa_weather_probability import NASAWeatherProbability

# Uses dynamic year range (2014-2024 in 2025)
estimator = NASAWeatherProbability(longitude=-97.1384, latitude=30.2672)
results = estimator.predict_weather_for_date("07/15")
```