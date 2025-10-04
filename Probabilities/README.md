# Probabilities - Weather Probability Estimator

## Input:
- The locationformat: {longitude:int value, latitude:int value}
- The date format: String year/month/day/hour

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

## Output:
- dictionary: {"very hot" : float percantage,
                "very cold" : float percantage,
                "very windy" : flaot percantage,
                "very uncomfortable" : boolean True/False}
- predicted values: 
  - temperature: float 
  - precipatation: boolean True/False
  - air quality: int (0-10):
  - windspeed: float
  - feeling: String ("Hot" or "Cold")
  - humidity: float