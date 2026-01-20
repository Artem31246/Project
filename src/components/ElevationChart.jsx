import React, { useEffect, useRef } from "react";
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
Chart.defaults.color = "#fff";

const ElevationChart = ({ trackPoints }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

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
              title: { display: true, text: "Distance", font: { family: "Raleway", size: 14 } },
              ticks: {
                font: { family: "Raleway", size: 12 },
                stepSize: maxDistanceM / 20,
                callback: v => `${Math.round(v/25)*25} m`
              }
            },
            y: {
              title: { display: true, text: "Elevation", font: { family: "Raleway", size: 14 } },
              ticks: { font: { family: "Raleway", size: 12 }, stepSize: 50, callback: v => `${Math.round(v/25)*25} m` }
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
  }, [trackPoints, maxDistanceM]);



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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: "#252B37", borderRadius: "10px",}}>
      <div style={{ flex: 1, minHeight: 0, borderRadius: "10px", padding: "10px" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%"}} />
      </div>
    </div>
    
  );
};

export default ElevationChart;
