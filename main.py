from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)

@app.route('/')
def main():
    return render_template("index.html")

@app.route("/weather", methods=["GET"])
def weather():
    # Get query params
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    date = request.args.get("date")  # YYYY-MM-DD

    # Validation
    if lat is None or lon is None or not date:
        return jsonify({
            "error": "Missing parameters. Required: lat, lon, date (YYYY-MM-DD)"
        }), 400

    # Open-Meteo API URL
    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": date,
        "end_date": date,
        "hourly": [
            "temperature_2m",
            "precipitation",
            "wind_speed_10m",
            "weather_code"
        ],
        "timezone": "UTC"
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch weather data"}), 500

    data = response.json()

    # Example: return daily average values
    temps = data["hourly"]["temperature_2m"]
    winds = data["hourly"]["wind_speed_10m"]
    precipitation = data["hourly"]["precipitation"]
    weather_code = data["hourly"]["weather_code"]

    WEATHER_CODES = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    }

    times = data["hourly"]["time"][::3]
    codes = data["hourly"]["weather_code"][::3]

    translated_weather = [
        {
            "time": t,
            "code": c,
            "description": WEATHER_CODES.get(c, "Unknown")
        }
        for t, c in zip(times, codes)
    ]

    result = {
        "latitude": lat,
        "longitude": lon,
        "date": date,
        "temperature_avg": round(sum(temps) / len(temps), 1),
        "wind_speed_avg": round(sum(winds) / len(winds), 1),
        "precipitation_total": round(sum(precipitation), 1),
        "weather_code_samples": translated_weather
    }

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
