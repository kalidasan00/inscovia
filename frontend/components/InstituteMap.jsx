// components/InstituteMap.jsx
"use client";
import { useEffect } from "react";
import { MapPin } from "lucide-react";

export default function InstituteMap({ latitude, longitude, name, address }) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // ✅ Open Google Maps for directions (free, no API key)
  const handleDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  useEffect(() => {
    // ✅ Leaflet must be imported client-side only (no SSR)
    let map;
    let L;

    async function initMap() {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // ✅ Fix default marker icon broken in webpack
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("institute-map");
      if (!container) return;

      // ✅ Prevent double init
      if (container._leaflet_id) return;

      map = L.map("institute-map", { zoomControl: true }).setView([lat, lng], 15);

      // ✅ OpenStreetMap tiles — 100% free
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // ✅ Marker with popup
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong>${name}</strong>${address ? `<br/><span style="font-size:12px;color:#666">${address}</span>` : ""}`)
        .openPopup();
    }

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      initMap();
    }

    return () => {
      if (map) map.remove();
    };
  }, [lat, lng, name, address]);

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-indigo-600" />
        Location
      </h2>

      {/* Map container */}
      <div
        id="institute-map"
        className="w-full rounded-xl overflow-hidden border border-gray-200"
        style={{ height: "220px", zIndex: 0 }}
      />

      {/* Directions button */}
      <button
        onClick={handleDirections}
        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        Get Directions
      </button>
    </div>
  );
}