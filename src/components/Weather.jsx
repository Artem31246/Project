import React, { useEffect, useState } from "react";
import weatherCodes from "../data/weather_codes.json";

const Weather = ({ lat, lon, date, onForecastChange }) => {
  const [forecast, setForecast] = useState([]);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!lat || !lon || !date) return;

    const fetchForecast = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode`);
        const data = await res.json();
        const times = data.hourly.time;
        const temps = data.hourly.temperature_2m;
        const codes = data.hourly.weathercode;

        const filtered = times
          .map((t, i) => ({ t, temp: temps[i], code: codes[i] }))
          .filter(({ t }) => t.split("T")[0] === date);

        const forecastData = filtered.map(f => ({
          time: new Date(f.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          temp: f.temp,
          weather: weatherCodes[f.code] || f.code
        }));

        setForecast(forecastData);
        setSummary(`Forecast for ${date}`);

        const weatherCounts = {};
        forecastData.forEach(f => {
          if (!f.weather) return;
          weatherCounts[f.weather] = (weatherCounts[f.weather] || 0) + 1;
        });

        let mostCommonWeather = "Unavailable";
        let maxCount = 0;
        for (const [w, count] of Object.entries(weatherCounts)) {
          if (count > maxCount) {
            maxCount = count;
            mostCommonWeather = w;
          }
        }

        if (onForecastChange) onForecastChange(mostCommonWeather);

      } catch {
        setSummary("Forecast unavailable");
        setForecast([]);
        if (onForecastChange) onForecastChange("Unavailable");
      }
    };

    fetchForecast();
  }, [lat, lon, date, onForecastChange]);

  return (
    <div style={{ padding: "0px 15px", background: "#252B37", color: "#fff", borderRadius: "10px"}}>
      <h3>Weather</h3>
      <p>{summary || "Loading…"}</p>
      <ul style={{}}>
        {forecast.map((f, i) => (
          <li key={i} style={{fontSize: "16px", fontFamily: "Raleway"}}>
            {`${f.time} — Temp: ${f.temp}°C, Weather: ${f.weather}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Weather;
