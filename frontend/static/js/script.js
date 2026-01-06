const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
}).addTo(map);

setTimeout(() => {
    map.invalidateSize();
}, 0);

let polyline = null;
let hoverMarker = null;
let elevationChart = null;
let trackPoints = [];
let wetWeatherCodes = [];
let weatherCodeMap = {};

fetch("static/json/trekking_poles_weather.json")
  .then(r => r.json())
  .then(codes => {
    wetWeatherCodes = codes;
  })
  .catch(err => console.error("Failed to load weather codes", err));

function getGpxCenter() {
    if (!trackPoints.length) {
        return {lat: 0, lon: 0};
    }
    let latSum = 0;
    let lonSum = 0;
    trackPoints.forEach(p => {
        latSum += p.lat;
        lonSum += p.lon;
    });
    return {lat: latSum / trackPoints.length, lon: lonSum / trackPoints.length};
}

function evaluateTrekkingPolesFromTrack(trackPoints, weatherDescription) {
    if (!trackPoints || trackPoints.length === 0) {
        return {percentage: 0, reasons: 'No track data available'};
    }
    const distanceKm = trackPoints[trackPoints.length - 1].distanceFromStart / 1000;
    const elevations = trackPoints.map(p => p.elevation);
    const elevationGainM = Math.max(...elevations) - Math.min(...elevations);

    let score = 0;
    const reasons = [];

    if (distanceKm > 10 && distanceKm <= 20) {
        score += 20;
        reasons.push(`Distance: ${distanceKm.toFixed(1)} km`);
    } else if (distanceKm > 20) {
        score += 35;
        reasons.push(`Long distance: ${distanceKm.toFixed(1)} km`);
    }

    if (elevationGainM > 300 && elevationGainM <= 700) {
        score += 15;
        reasons.push(`Moderate elevation gain: ${elevationGainM.toFixed(0)} m`);
    } else if (elevationGainM > 700) {
        score += 25;
        reasons.push(`High elevation gain: ${elevationGainM.toFixed(0)} m`);
    }

    if (wetWeatherCodes.some(cond => weatherDescription.includes(cond))) {
        score += 25;
        reasons.push(`Weather: ${weatherDescription}`);
    }

    if (score > 100) {
        score = 100;
    }

    return {percentage: score, reasons: reasons.join(', ')};
}

function loadGpxFromText(gpxText) {
    gpxParse.parseGpx(gpxText, (error, data) => {
        if (error || !data.tracks.length) {
            return;
        }

        trackPoints = [];
        if (polyline) map.removeLayer(polyline);
        if (hoverMarker) map.removeLayer(hoverMarker);
        if (elevationChart) elevationChart?.destroy();

        const track = data.tracks[0];
        let cumulativeDistance = 0;
        let cumulativeAscent = 0;
        let cumulativeDescent = 0;
        let minElevation = Infinity;
        let maxElevation = -Infinity;
        let slopeSum = 0;
        let slopeCount = 0;
        let prevPoint = null;

        track.segments.forEach(segment => {
            segment.forEach(p => {
                const point = {lat: p.lat, lon: p.lon, elevation: p.elevation || 0};
                if (prevPoint) {
                    const d = L.latLng(prevPoint.lat, prevPoint.lon).distanceTo(L.latLng(point.lat, point.lon));
                    cumulativeDistance += d;
                    point.distanceFromStart = cumulativeDistance;
                    const eleDiff = point.elevation - prevPoint.elevation;
                    point.slope = d > 0 ? (eleDiff / d) * 100 : 0;
                    slopeSum += point.slope;
                    slopeCount++;
                    if (eleDiff > 0) cumulativeAscent += eleDiff;
                    if (eleDiff < 0) cumulativeDescent += Math.abs(eleDiff);
                    point.cumulativeAscent = cumulativeAscent;
                    point.cumulativeDescent = cumulativeDescent;
                } else {
                    point.distanceFromStart = 0;
                    point.slope = 0;
                    point.cumulativeAscent = 0;
                    point.cumulativeDescent = 0;
                }

                minElevation = Math.min(minElevation, point.elevation);
                maxElevation = Math.max(maxElevation, point.elevation);
                trackPoints.push(point);
                prevPoint = point;
            });
        });

        document.getElementById('total-distance').textContent = `Total Distance: ${(cumulativeDistance / 1000).toFixed(2)} km`;
        document.getElementById('total-ascent').textContent = `Total Ascent: ${cumulativeAscent.toFixed(0)} m`;
        document.getElementById('total-descent').textContent = `Total Descent: ${cumulativeDescent.toFixed(0)} m`;
        document.getElementById('min-elevation').textContent = `Min Elevation: ${minElevation.toFixed(0)} m`;
        document.getElementById('max-elevation').textContent = `Max Elevation: ${maxElevation.toFixed(0)} m`;
        document.getElementById('avg-slope').textContent = `Average Slope: ${(slopeCount ? slopeSum / slopeCount : 0).toFixed(2)} %`;

        polyline = L.polyline(trackPoints.map(p => [p.lat, p.lon]), {color: 'red', weight: 4}).addTo(map);
        map.fitBounds(polyline.getBounds());

        hoverMarker = L.circleMarker([0, 0], {radius: 6, color: 'blue', fillColor: 'cyan', fillOpacity: 0.7}).addTo(map);

        const distances = trackPoints.map(p => Math.round((Math.round(p.distanceFromStart)/500).toFixed(1)*500));
        const elevations = trackPoints.map(p => p.elevation.toFixed(1));
        const ctx = document.getElementById('elevationChart').getContext('2d');

        elevationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: distances,
                datasets: [{
                    label: 'Elevation (m)',
                    data: elevations,
                    borderColor: 'green',
                    backgroundColor: 'rgba(0,128,0,0.2)',
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {mode: 'index', intersect: false},
                scales: {
                    x: {title: {display: true, text: 'Distance (m)'}},
                    y: {title: {display: true, text: 'Elevation (m)'}},
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label(ctx) {
                                const p = trackPoints[ctx.dataIndex];
                                return [
                                    `Elevation: ${p.elevation.toFixed(1)} m`,
                                    `Slope: ${p.slope.toFixed(2)} %`,
                                    `Distance: ${(p.distanceFromStart / 1000).toFixed(2)} km`,
                                ];
                            },
                        },
                    },
                },
                animation: false,
            },
        });

        elevationChart.canvas.addEventListener('mousemove', evt => {
            const pts = elevationChart.getElementsAtEventForMode(evt, 'nearest', {intersect: false}, true);
            if (pts.length) {
                const p = trackPoints[pts[0].index];
                hoverMarker.setLatLng([p.lat, p.lon]);
            }
        });

        const center = getGpxCenter();
        loadForecast(center.lat, center.lon);
    });
}

document.getElementById('route').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadGpxFromText(reader.result);
    reader.readAsText(file);
});

fetch('static/route.gpx').then(r => r.text()).then(loadGpxFromText);

const dateInput = document.getElementById('input-date');
dateInput.value = new Date().toISOString().split('T')[0];

fetch("static/json/weather_codes.json")
  .then(r => r.json())
  .then(codes => {
    weatherCodeMap = codes;
  })
  .catch(err => console.error("Failed to load weather codes", err));

async function loadForecast(lat, lon) {
    const selectedDate = dateInput.value || new Date().toISOString().split('T')[0];
    const summaryEl = document.getElementById('weather-summary');
    const listEl = document.getElementById('weather-list');
    listEl.innerHTML = '';
    summaryEl.textContent = '';

    try {
        const url = `/api/v1/weather?lat=${lat}&lon=${lon}&date=${selectedDate}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Forecast request failed');
        const data = await response.json();

        const hourlyTimes = data.weather_code_samples.map(s => s.time);
        const hourlyTemp = data.weather_code_samples.map(s => s.temperature || data.temperature_avg);
        const hourlyCode = data.weather_code_samples.map(s => s.code);

        const filtered = hourlyTimes.map((t, i) => ({t, i}))
            .filter(({t}) => t.split('T')[0] === selectedDate)
            .filter(({t}) => new Date(t).getHours() % 3 === 0);

        const codeCounts = {};
        filtered.forEach(({t, i}) => {
            const code = hourlyCode[i];
            codeCounts[code] = (codeCounts[code] || 0) + 1;
            const li = document.createElement('li');
            li.textContent = `${new Date(t).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} — Temp: ${hourlyTemp[i]}°C, Weather: ${weatherCodeMap[code] || code}`;
            listEl.appendChild(li);
        });

        if (!filtered.length) {
            const li = document.createElement('li');
            li.textContent = 'No 3-hour forecast available for selected date';
            listEl.appendChild(li);
        }

        summaryEl.textContent = `3-hour Forecast for ${selectedDate}`;

        let mostCommonCode = '0', maxCount = 0;
        for (const [code, count] of Object.entries(codeCounts)) {
            if (count > maxCount) { maxCount = count; mostCommonCode = code; }
        }

        const weatherDesc = weatherCodeMap[mostCommonCode] || 'clear';
        const polesRecommendation = evaluateTrekkingPolesFromTrack(trackPoints, weatherDesc);
        const polesEl = document.getElementById('poles-recommendation');
        if (polesEl) polesEl.textContent = `Trekking poles - ${polesRecommendation.percentage}%, Reasons: ${polesRecommendation.reasons}`;
    } catch (err) {
        summaryEl.textContent = 'Failed to load forecast';
        listEl.innerHTML = '';
        console.error(err);
    }
}

dateInput.addEventListener('change', () => {
    if (!trackPoints || trackPoints.length === 0) return;
    const center = getGpxCenter();
    loadForecast(center.lat, center.lon).then(() => {
        const listEl = document.getElementById('weather-list');
        let weatherDesc = 'clear';
        if (listEl && listEl.children.length) {
            const codes = {};
            for (let i = 0; i < listEl.children.length; i++) {
                const text = listEl.children[i].textContent;
                const match = text.match(/Weather: (.+)$/);
                if (match) {
                    const code = match[1];
                    codes[code] = (codes[code] || 0) + 1;
                }
            }
            let maxCount = 0;
            for (const code in codes) {
                if (codes[code] > maxCount) {
                    maxCount = codes[code];
                    weatherDesc = code;
                }
            }
        }
        const polesRecommendation = evaluateTrekkingPolesFromTrack(trackPoints, weatherDesc);
        const polesEl = document.getElementById('poles-recommendation');
        if (polesEl) polesEl.textContent = `Trekking poles - ${polesRecommendation.percentage}%, reasons: ${polesRecommendation.reasons}`;
    });
});
