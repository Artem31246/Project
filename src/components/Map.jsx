import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ElevationChart from "./ElevationChart";

const Map = ({ gpxFile, defaultGpxUrl, onTrackLoad }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const lastGpxIdRef = useRef(null);
  const [trackPoints, setTrackPoints] = useState([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true
    }).setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!mapReady) return;

    const loadGpx = async (fileOrUrl) => {
      if (!mapInstanceRef.current || !fileOrUrl) return;

      const gpxId =
        fileOrUrl instanceof File
          ? `${fileOrUrl.name}-${fileOrUrl.size}-${fileOrUrl.lastModified}`
          : fileOrUrl;

      const isNewGpx = lastGpxIdRef.current !== gpxId;
      lastGpxIdRef.current = gpxId;

      let gpxText;
      if (fileOrUrl instanceof File) {
        gpxText = await fileOrUrl.text();
      } else {
        const res = await fetch(fileOrUrl);
        gpxText = await res.text();
      }

      const parser = new DOMParser();
      const xml = parser.parseFromString(gpxText, "application/xml");
      const trkpts = Array.from(xml.querySelectorAll("trkpt"));

      let cumulativeDistance = 0;
      let cumulativeAscent = 0;
      let cumulativeDescent = 0;
      let prevPoint = null;

      const points = trkpts.map((pt) => {
        const lat = parseFloat(pt.getAttribute("lat"));
        const lon = parseFloat(pt.getAttribute("lon"));
        const ele = parseFloat(pt.querySelector("ele")?.textContent) || 0;

        const point = {
          lat,
          lon,
          elevation: ele,
          distanceFromStart: 0,
          slope: 0,
          cumulativeAscent: 0,
          cumulativeDescent: 0
        };

        if (prevPoint) {
          const d = L.latLng(prevPoint.lat, prevPoint.lon)
            .distanceTo(L.latLng(lat, lon));

          cumulativeDistance += d;
          point.distanceFromStart = cumulativeDistance;

          const eleDiff = ele - prevPoint.elevation;
          if (eleDiff > 0) cumulativeAscent += eleDiff;
          if (eleDiff < 0) cumulativeDescent += Math.abs(eleDiff);

          point.slope = d > 0 ? (eleDiff / d) * 100 : 0;
          point.cumulativeAscent = cumulativeAscent;
          point.cumulativeDescent = cumulativeDescent;
        }

        prevPoint = point;
        return point;
      });

      if (polylineRef.current) {
        mapInstanceRef.current.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      const line = L.polyline(
        points.map(p => [p.lat, p.lon]),
        { color: "red", weight: 4 }
      ).addTo(mapInstanceRef.current);

      polylineRef.current = line;

      if (points.length && isNewGpx) {
        mapInstanceRef.current.fitBounds(line.getBounds(), { padding: [20, 20] });
      }

      setTrackPoints(points);
      if (onTrackLoad) onTrackLoad(points);
    };

    if (gpxFile) loadGpx(gpxFile);
    else if (defaultGpxUrl) loadGpx(defaultGpxUrl);
  }, [mapReady, gpxFile, defaultGpxUrl, onTrackLoad]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "10px",
        minHeight: 0,
        padding: "0px"
      }}
    >
      <div
        ref={mapRef}
        style={{
          flex: 8,
          minHeight: 0,
          borderRadius: "10px",
          border: "5px solid #252B37",
          padding: "0px",
          background: "#252B37",
          boxShadow: "4px 4px 10px rgba(0,0,0,0.35)",
          outline: "none"
        }}
      />

      {trackPoints.length > 0 && (
        <div
          style={{
            flex: 2.5,
            minHeight: 0,
            padding: "0px",
            width: "100%",
            borderRadius: "10px",
            boxShadow: "4px 4px 10px rgba(0,0,0,0.35)"
          }}
        >
          <ElevationChart trackPoints={trackPoints} />
        </div>
      )}
    </div>
  );
};

export default Map;
