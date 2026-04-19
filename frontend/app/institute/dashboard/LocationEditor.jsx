// app/institute/dashboard/LocationEditor.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import { MapPin, Loader2, Check, Navigation, Pencil, X, Lock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function LocationEditor({
  centerId,
  centerSlug,
  initialLat,
  initialLng,
  onSaved,
}) {
  const [lat, setLat] = useState(initialLat || null);
  const [lng, setLng] = useState(initialLng || null);
  const [isEditing, setIsEditing] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const latRef = useRef(lat);
  const lngRef = useRef(lng);

  // Keep refs in sync so event listeners always have fresh values
  useEffect(() => { latRef.current = lat; }, [lat]);
  useEffect(() => { lngRef.current = lng; }, [lng]);

  // ── Init map once ────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mounted) return;

      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("loc-editor-map");
      if (!container || container._leaflet_id) return;

      const startLat = lat || 20.5937;
      const startLng = lng || 78.9629;
      const zoom = lat ? 15 : 5;

      const map = L.map("loc-editor-map", {
        // ✅ All interactions OFF by default (view-only mode)
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomControl: true,
      }).setView([startLat, startLng], zoom);

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([startLat, startLng], {
        draggable: false, // ✅ Locked by default
      }).addTo(map);
      markerRef.current = marker;

      if (lat && lng) {
        marker.bindPopup("Your institute location").openPopup();
      } else {
        marker.bindPopup("No location set yet").openPopup();
      }

      marker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        setLat(pos.lat);
        setLng(pos.lng);
        setSaved(false);
      });

      map.on("click", (e) => {
        // Only respond to clicks in edit mode
        if (!isEditingRef.current) return;
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        setSaved(false);
      });
    }

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keep a ref so the map click handler can read current isEditing ───────────
  const isEditingRef = useRef(false);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  // ── Enable / disable map interactions when edit mode changes ─────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    if (isEditing) {
      map.scrollWheelZoom.enable();
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      marker.dragging.enable();
      marker.setPopupContent("Drag pin or click map to update location");
      marker.openPopup();
    } else {
      map.scrollWheelZoom.disable();
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      marker.dragging.disable();
      if (lat && lng) {
        marker.setPopupContent("Your institute location");
      }
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GPS detect ───────────────────────────────────────────────────────────────
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
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 16);
          markerRef.current.setLatLng([newLat, newLng]);
        }
        setDetecting(false);
      },
      () => {
        setError("Could not detect location. Drag the pin manually.");
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
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
      setIsEditing(false);
      if (onSaved) onSaved(lat, lng);
    } catch {
      setError("Failed to save location. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel edit ──────────────────────────────────────────────────────────────
  const handleCancel = () => {
    // Revert to initial coords
    const revertLat = initialLat || null;
    const revertLng = initialLng || null;
    setLat(revertLat);
    setLng(revertLng);
    setError(null);
    setSaved(false);
    setIsEditing(false);
    if (mapInstanceRef.current && markerRef.current && revertLat && revertLng) {
      mapInstanceRef.current.setView([revertLat, revertLng], 15);
      markerRef.current.setLatLng([revertLat, revertLng]);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Institute Location
        </h3>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            /* View mode — show Edit button */
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Location
            </button>
          ) : (
            /* Edit mode — GPS + Cancel */
            <>
              <button
                onClick={handleDetectGPS}
                disabled={detecting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {detecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                {detecting ? "Detecting…" : "Use GPS"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 pb-2">
        {isEditing ? (
          <p className="text-xs text-indigo-500 font-medium flex items-center gap-1">
            <Pencil className="w-3 h-3" />
            Editing — click the map or drag the pin to update your location.
          </p>
        ) : (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Map is view-only. Click <strong className="text-gray-500">Edit Location</strong> to make changes.
          </p>
        )}
      </div>

      {/* Map */}
      <div className="relative">
        <div
          id="loc-editor-map"
          className="w-full border-y border-gray-100"
          style={{ height: "300px", zIndex: 0 }}
        />

        {/* View-mode overlay — blocks accidental scroll capture */}
        {!isEditing && (
          <div
            className="absolute inset-0 z-10 cursor-default"
            style={{ background: "transparent" }}
            onWheel={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pt-3 pb-4 space-y-2">
        {/* Coordinates */}
        {lat && lng && (
          <p className="text-[11px] text-gray-400 text-center tabular-nums">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg text-center">
            {error}
          </p>
        )}

        {/* Save — only visible while editing */}
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={saving || !lat || !lng}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
              saved
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Location Saved!
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Save Location
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}