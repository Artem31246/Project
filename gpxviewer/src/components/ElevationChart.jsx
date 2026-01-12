import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Filler
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Filler);

const ElevationChart = ({ trackPoints }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [windowSize, setWindowSize] = useState(1000);

  const maxDistanceM = trackPoints.length
    ? trackPoints[trackPoints.length - 1].distanceFromStart
    : 1000;


  useEffect(() => {
    if (!canvasRef.current || !trackPoints.length) return;

    const ctx = canvasRef.current.getContext("2d");

    if (!chartRef.current) {
      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Elevation",
              data: trackPoints.map(p => ({ x: p.distanceFromStart, y: p.elevation })),
              borderColor: "green",
              backgroundColor: "rgba(0,128,0,0.2)",
              fill: true,
              tension: 0.2,
              pointRadius: 0,
              pointHoverRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: "nearest", intersect: false },
          scales: {
            x: {
              type: "linear",
              min: 0,
              max: maxDistanceM,
              title: { display: true, text: "Distance", font: { family: "Montserrat", size: 14 } },
              ticks: {
                font: { family: "Montserrat", size: 12 },
                stepSize: windowSize,
                callback: v => `${Math.round(v/25)*25} m`
              }
            },
            y: {
              title: { display: true, text: "Elevation", font: { family: "Montserrat", size: 14 } },
              ticks: { font: { family: "Montserrat", size: 12 }, stepSize: 50, callback: v => `${Math.round(v/25)*25} m` }
            }
          },
          plugins: {
            tooltip: {
            callbacks: {
              label: ctx => {
                const p = trackPoints[ctx.dataIndex];
                return [
                  `Elevation: ${p.elevation.toFixed(1)} m`,
                  `Slope: ${p.slope.toFixed(2)} %`,
                  `Distance: ${Math.round(p.distanceFromStart)} m`
                ];
              }
            }
          }
          }
        }
      });
    }
  }, [trackPoints, maxDistanceM, windowSize]);

  useEffect(() => {
    if (!chartRef.current || !trackPoints.length) return;

    const chart = chartRef.current;


    chart.data.datasets[0].data = trackPoints.map(p => ({
      x: p.distanceFromStart,
      y: p.elevation
    }));


    chart.options.scales.x.ticks.stepSize = windowSize;

    chart.update();
}, [windowSize, trackPoints]);

  useEffect(() => {
  if (!chartRef.current || !trackPoints.length) return;

  const chart = chartRef.current;


  chart.data.datasets[0].data = trackPoints.map(p => ({
    x: p.distanceFromStart,
    y: p.elevation
  }));


  chart.options.scales.x.max = trackPoints[trackPoints.length - 1].distanceFromStart;

  chart.update('none'); 
}, [trackPoints]);



  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div style={{ padding: "6px 8px" }}>
        <input
          type="range"
          min={100}
          max={Math.max(50, Math.round(maxDistanceM / 2))}
          step={100}
          value={windowSize}
          disabled={!trackPoints.length}
          onChange={e => setWindowSize(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ fontFamily: "Montserrat", fontSize: "12px", textAlign: "center" }}>
          X-axis scale: {windowSize} m per tick
        </div>
      </div>
    </div>
  );
};

export default ElevationChart;
