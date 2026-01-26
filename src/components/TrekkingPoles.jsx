import React, { useEffect, useState } from "react";
import trekkingCodes from "../data/trekking_poles_weather.json";

const TrekkingPoles = ({ trackPoints, forecastDesc }) => {
  const [recommendation, setRecommendation] = useState("");
  const [score, setScore] = useState("");
  const [stats, setStats] = useState("");

  useEffect(() => {
    if (!trackPoints || trackPoints.length === 0) {
      setRecommendation("No track loaded");
      return;
    }

    const distanceKm = trackPoints[trackPoints.length - 1].distanceFromStart / 1000;
    const elevations = trackPoints.map(p => p.elevation);
    const elevationGainM = Math.max(...elevations) - Math.min(...elevations);
    

    let score = 0;
    const reasons = [];

    if (distanceKm > 10 && distanceKm <= 20) {
      score += 20;
      reasons.push(`Distance - ${distanceKm.toFixed(1)} km`);
    } else if (distanceKm > 20) {
      score += 35;
      reasons.push(`Long distance - ${distanceKm.toFixed(1)} km`);
    }

    if (elevationGainM > 300 && elevationGainM <= 700) {
      score += 15;
      reasons.push(`Moderate elevation gain - ${elevationGainM.toFixed(0)} m`);
    } else if (elevationGainM > 700) {
      score += 25;
      reasons.push(`High elevation gain - ${elevationGainM.toFixed(0)} m`);
    }

    if (trekkingCodes.some(cond => forecastDesc?.includes(cond))) {
      score += 25;
      reasons.push(`Weather - ${forecastDesc}`);
    }

    if (score > 100) score = 100;

    if (score > 0) {
      setRecommendation(`Reasons: \n${reasons.join("\n")}`);
    } else {
      setRecommendation(``);
    }
    
    setScore(`${score} / 100`)
    setStats(`Distance (km): ${distanceKm.toFixed(2)}\nElevation Gain (m): ${elevationGainM.toFixed(2)}\nAverage Weather: ${forecastDesc}`)

  }, [trackPoints, forecastDesc]);

  if (!trackPoints || trackPoints.length === 0) return null;

  return (
    <div style={{ padding: "0px 15px", background: "#252B37", display: "flex", justifyContent: "space-between",color: "#ffffff"}}>
      <div className="poles">
        <h3 className="poles-header">Trekking Poles</h3>
        <p className="poles-subheader" style={{fontFamily: "Raleway"}}>Reccomendation - {score}</p>
        <p className="poles-rec" style={{whiteSpace: "pre-wrap", fontFamily: "Raleway"}}>{recommendation}</p>
      </div>
      <div className="stats" style={{}}>
        <h3 className="stats-header">Stats</h3>
        <p className="stats-info" style={{whiteSpace: "pre-wrap", fontFamily: "Raleway"}}>{stats}</p>
      </div>
    </div>
  );
};

export default TrekkingPoles;
