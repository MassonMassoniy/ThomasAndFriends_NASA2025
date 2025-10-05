# This code only runs the home page of the site and provides api for using the probability calculator

from flask import Flask, render_template, request
from Probabilities.nasa_weather_probability import NASAWeatherProbability
from datetime import date

app = Flask(__name__)

# ------ Pages ------
@app.route('/')
def index():
    return render_template('index.html', default_date = date.today().isoformat())


# ------ APIs ------
@app.route('/getWeather', methods=['GET'])
def getWeather():
    latitude = request.args.get('latitude', type=float)
    longitude = request.args.get('longitude', type=float)
    target_date = request.args.get('date', type=str)

    estimator = NASAWeatherProbability(
        longitude = longitude,
        latitude = latitude,
        start_year = 2015,
        end_year = 2024,
    )

    parameters = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'WS2M', 'WD2M', 'RH2M', "T2MWET", "IMERG_PRECLIQUID_PROB", "CLRSKY_SFC_SW_DWN"]

    result = estimator.predict_weather_for_date(target_date, parameters, tolerance_days=7)

    return result


if __name__ == '__main__':
    app.run(debug = True)