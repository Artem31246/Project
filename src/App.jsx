import React, { useState, useEffect } from "react";
import Map from "./components/Map";
import Weather from "./components/Weather";
import TrekkingPoles from "./components/TrekkingPoles";
import "./styles/app.css";

const App = ({ initialFile }) => {
  const [trackPoints, setTrackPoints] = useState([]);
  const [center, setCenter] = useState({ lat: 0, lon: 0 });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [gpxFile, setGpxFile] = useState(initialFile || null);
  const [forecastDesc, setForecastDesc] = useState("");

  
  useEffect(() => {
    if (initialFile) setGpxFile(initialFile);
  }, [initialFile]);

  const handleGpxLoad = (points) => {
    setTrackPoints(points);

    if (points.length) {
      const latSum = points.reduce((sum, p) => sum + p.lat, 0);
      const lonSum = points.reduce((sum, p) => sum + p.lon, 0);
      setCenter({
        lat: latSum / points.length,
        lon: lonSum / points.length
      });
    } else {
      setCenter({ lat: 0, lon: 0 });
    }
  };

  return (
    <div className="app-container">
      <div className="map-section">
        <Map
          gpxFile={gpxFile}
          defaultGpxUrl={gpxFile ? null : "/route.gpx"}
          onTrackLoad={handleGpxLoad}
        />
      </div>

      <div className="info-section">
        <div className="inputs">
          <div className="input-file">
            <img
              src="/icons/upload.svg"
              height="25"
              width="25"
              alt="Upload icon"
            />
            <input
              id="files"
              type="file"
              accept=".gpx"
              onChange={(e) => {
                if (e.target.files[0]) setGpxFile(e.target.files[0]);
              }}
              style={{ marginRight: "10px" }}
            />
            <label htmlFor="files">Upload a file</label>
          </div>

          <div className="input-date">
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
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
            <TrekkingPoles
              trackPoints={trackPoints}
              forecastDesc={forecastDesc}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
