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
- **WD2M** - Wind Direction at 2 meters (degrees)
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
    "very_hot": 64.8,           // Percentage chance of very hot weather (>35°C)
    "very_cold": 0.0,           // Percentage chance of very cold weather (<-10°C)
    "very_windy": 0.0,          // Percentage chance of very windy conditions (>10 m/s)
    "very_wet": 3.6,            // Percentage chance of very wet conditions (>10mm/day)
    "very_uncomfortable": 10.9  // Percentage chance of very uncomfortable humidity (>80%)
  },
  "predicted_values": {
    "T2M": 29.89,               // Predicted air temperature at 2m (°C)
    "T2M_MAX": 36.34,           // Predicted daily maximum temperature (°C)
    "T2M_MIN": 24.19,           // Predicted daily minimum temperature (°C)
    "PRECTOTCORR": 1.47,        // Predicted precipitation (mm/day)
    "WS2M": 2.6,                // Predicted wind speed at 2m (m/s)
    "WD2M": 169.5,              // Predicted wind direction at 2m (degrees)
    "RH2M": 65.0,               // Predicted relative humidity (%)
    "T2M_trend": 30.76,          // Predicted value which is calculated with advanced algorithm (climate change)
    "feeling": "Hot",            // Derived feeling: "Hot" (>25°C) or "Cold" (≤25°C)
    "precipitation": true,       // Boolean: true if precipitation > 1.0mm/day
    "air_quality": 7            // Air quality index (0-10): 3=Poor, 5=Moderate, 7=Fair, 8=Good
  },
  "confidence": {
    "T2M": "high",              // Data confidence level: "low" (<5 points), "medium" (5-14), "high" (≥15)
    "T2M_MAX": "high",
    "T2M_MIN": "high",
    "PRECTOTCORR": "high",
    "WS2M": "high",
    "WD2M": "high",
    "RH2M": "high",
    "T2MWET": "high",
    "IMERG_PRECLIQUID_PROB": "high",
    "CLRSKY_SFC_SW_DWN": "high"
  },
  "uncertainty": {
    "predicted_values": {
      "T2M": {
        "margin_of_error": 0.36,        // ±0.36°C at 95% confidence interval
        "confidence_interval_width": 0.72,  // Total width of 95% CI
        "confidence_level": "95%"
      },
      "T2M_MAX": {
        "margin_of_error": 0.55,        // ±0.55°C at 95% confidence interval
        "confidence_interval_width": 1.1,   // Total width of 95% CI
        "confidence_level": "95%"
      },
      "T2M_MIN": {
        "margin_of_error": 0.22,        // ±0.22°C at 95% confidence interval
        "confidence_interval_width": 0.45,  // Total width of 95% CI
        "confidence_level": "95%"
      },
      "PRECTOTCORR": {
        "margin_of_error": 0.71,        // ±0.71 mm/day at 95% confidence interval
        "confidence_interval_width": 1.41,  // Total width of 95% CI
        "confidence_level": "95%"
      },
      "WS2M": {
        "margin_of_error": 0.12,        // ±0.12 m/s at 95% confidence interval
        "confidence_interval_width": 0.24,  // Total width of 95% CI
        "confidence_level": "95%"
      },
      "WD2M": {
        "margin_of_error": 7.64,        // ±7.64° at 95% confidence interval
        "confidence_interval_width": 15.28, // Total width of 95% CI
        "confidence_level": "95%"
      },
      "RH2M": {
        "margin_of_error": 1.76,        // ±1.76% at 95% confidence interval
        "confidence_interval_width": 3.52,  // Total width of 95% CI
        "confidence_level": "95%"
      },
      "T2MWET": {
        "margin_of_error": 0.12,        // ±0.12°C at 95% confidence interval
        "confidence_interval_width": 0.24,  // Total width of 95% CI
        "confidence_level": "95%"
      },
      "IMERG_PRECLIQUID_PROB": {
        "margin_of_error": 0.0,         // ±0.0 at 95% confidence interval
        "confidence_interval_width": 0.0,   // Total width of 95% CI
        "confidence_level": "95%"
      },
      "CLRSKY_SFC_SW_DWN": {
        "margin_of_error": 0.04,        // ±0.04 at 95% confidence interval
        "confidence_interval_width": 0.07,  // Total width of 95% CI
        "confidence_level": "95%"
      }
    }
  },
  "metadata": {
    "location": {
      "longitude": -97.1384,     // Input longitude coordinate
      "latitude": 30.2672        // Input latitude coordinate
    },
    "data_points_used": {
      "T2M": 165,                // Number of historical data points used for this parameter
      "T2M_MAX": 165,
      "T2M_MIN": 165,
      "PRECTOTCORR": 165,
      "WS2M": 165,
      "WD2M": 165,
      "RH2M": 165,
      "T2MWET": 165,
      "IMERG_PRECLIQUID_PROB": 165,
      "CLRSKY_SFC_SW_DWN": 165
    },
    "parameters_requested": [    // List of all parameters requested from NASA API
      "T2M",
      "T2M_MAX",
      "T2M_MIN",
      "PRECTOTCORR",
      "WS2M",
      "WD2M",
      "RH2M",
      "T2MWET",
      "IMERG_PRECLIQUID_PROB",
      "CLRSKY_SFC_SW_DWN"
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
- **All Parameters**: Uses all 10 available weather parameters by default (including wind direction)
- **Probabilities**: Historical percentage chances of extreme weather conditions
- **Predicted Values**: Mean values based on historical data for the same seasonal period
- **Uncertainty Quantification**: 95% confidence intervals for all predicted values
- **Weather Condition Labels**: Human-readable labels for precipitation, wind, humidity, and air quality
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