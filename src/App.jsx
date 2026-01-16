import React, { useState } from "react";
import Map from "./components/Map";
import Weather from "./components/Weather";
import TrekkingPoles from "./components/TrekkingPoles";
import "./styles/app.css";

const App = () => {
  const [trackPoints, setTrackPoints] = useState([]);
  const [center, setCenter] = useState({ lat: 0, lon: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [gpxFile, setGpxFile] = useState(null);
  const [forecastDesc, setForecastDesc] = useState("");

  const handleGpxLoad = (points) => {
    setTrackPoints(points);
    if (points.length) {
      const latSum = points.reduce((sum, p) => sum + p.lat, 0);
      const lonSum = points.reduce((sum, p) => sum + p.lon, 0);
      setCenter({ lat: latSum / points.length, lon: lonSum / points.length });
    } else {
      setCenter({ lat: 0, lon: 0 });
    }
  };

  return (
    <div className="app-container">
      <div className="map-section">
        <Map
          gpxFile={gpxFile}
          defaultGpxUrl="/route.gpx"
          onTrackLoad={handleGpxLoad}
        />
      </div>
      <div className="info-section">
        <div className="inputs">
          <input
            type="file"
            accept=".gpx"
            onChange={(e) => setGpxFile(e.target.files[0])}
            style={{ marginRight: "10px" }}
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="weather-section">
          <Weather
            lat={center.lat}
            lon={center.lon}
            date={selectedDate}
            onForecastChange={setForecastDesc}
          />
        </div>

        {trackPoints.length > 0 && (
          <div className="trekking-section">
            <TrekkingPoles trackPoints={trackPoints} forecastDesc={forecastDesc} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
