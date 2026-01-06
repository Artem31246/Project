from flask import Blueprint, request, jsonify
import requests
import json
import os

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
json_path = os.path.join(base, "frontend", "static", "json", "weather_codes.json")

with open(json_path, "r", encoding="utf-8") as f:
    WEATHER_CODES = {
        int(k): v for k, v in json.load(f).items()
    }

weather_blueprint = Blueprint("weather_blueprint", __name__)

@weather_blueprint.route("/api/v1/weather", methods=["GET"])
def weather():

    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    date = request.args.get("date")


    if lat is None or lon is None or not date:
        return jsonify({
            "error": "Missing parameters. Required: lat, lon, date (YYYY-MM-DD)"
        }), 400


    url = "https://api.open-meteo.com/v1/forecast"

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


    temps = data["hourly"]["temperature_2m"]
    winds = data["hourly"]["wind_speed_10m"]
    precipitation = data["hourly"]["precipitation"]
    weather_code = data["hourly"]["weather_code"]



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