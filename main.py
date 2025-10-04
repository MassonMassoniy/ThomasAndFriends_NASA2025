from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ------ Pages ------
@app.route('/')
def index():
    return render_template('index.html')


# ------ APIs ------
@app.route('/api/getWeather', methods=['GET'])
def getWeather():
    latitude = request.args.get('latitude', type=float)
    longitude = request.args.get('longitude', type=float)

    result = jsonify(
        latitude=latitude,
        longitude=longitude
    )

    return result


if __name__ == '__main__':
    app.run(debug = True)