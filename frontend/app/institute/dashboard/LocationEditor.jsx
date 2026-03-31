// components/LocationEditor.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import { MapPin, Loader2, Check, Navigation } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function LocationEditor({ centerId, centerSlug, initialLat, initialLng, onSaved }) {
  const [lat, setLat] = useState(initialLat || null);
  const [lng, setLng] = useState(initialLng || null);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let L;

    async function initMap() {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // ✅ Fix default marker icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("location-editor-map");
      if (!container || container._leaflet_id) return;

      // Default to India center if no coords
      const startLat = lat || 20.5937;
      const startLng = lng || 78.9629;
      const zoom = lat ? 15 : 5;

      const map = L.map("location-editor-map").setView([startLat, startLng], zoom);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // ✅ Add draggable marker
      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      if (lat && lng) {
        marker.bindPopup("Drag to adjust your location").openPopup();
      } else {
        marker.bindPopup("Click on map or drag pin to set location").openPopup();
      }

      // ✅ Update lat/lng on drag
      marker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        setLat(pos.lat);
        setLng(pos.lng);
        setSaved(false);
      });

      // ✅ Click on map to move marker
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        setSaved(false);
      });
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setError("GPS not supported on this device.");
      return;
    }
    setDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        setSaved(false);
        // Move map and marker
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 16);
          markerRef.current.setLatLng([newLat, newLng]);
        }
        setDetecting(false);
      },
      () => {
        setError("Could not detect location. Please drag the pin manually.");
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSave = async () => {
    if (!lat || !lng) {
      setError("Please set a location first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("instituteToken");
      const res = await fetch(`${API_URL}/centers/${centerSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      if (onSaved) onSaved(lat, lng);
    } catch {
      setError("Failed to save location. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Institute Location
        </h3>
        {/* ✅ GPS detect button */}
        <button
          onClick={handleDetectGPS}
          disabled={detecting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {detecting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Navigation className="w-3.5 h-3.5" />
          }
          {detecting ? "Detecting..." : "Use GPS"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Click on the map or drag the pin to set your exact location.
      </p>

      {/* Map */}
      <div
        id="location-editor-map"
        className="w-full rounded-xl overflow-hidden border border-gray-200 mb-3"
        style={{ height: "280px", zIndex: 0 }}
      />

      {/* Coordinates display */}
      {lat && lng && (
        <p className="text-[10px] text-gray-400 mb-3 text-center">
          lat: {lat.toFixed(6)}, lng: {lng.toFixed(6)}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-3 text-center">
          {error}
        </p>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !lat || !lng}
        className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
          saved
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {saving
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          : saved
          ? <><Check className="w-4 h-4" /> Location Saved!</>
          : <><MapPin className="w-4 h-4" /> Save Location</>
        }
      </button>
    </div>
  );
}