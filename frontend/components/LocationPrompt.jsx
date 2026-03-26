// components/LocationPrompt.jsx
"use client";
import { useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";

export default function LocationPrompt({ onDone }) {
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState(null);

  const handleDetect = () => {
    if (!navigator.geolocation) {
      setError("GPS not supported on this device.");
      return;
    }
    setDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            null;
          if (city) {
            localStorage.setItem("userCity", city);
            window.dispatchEvent(new Event("userCityChanged"));
            onDone(city);
          } else {
            setError("Could not detect your city. Please skip and set manually from navbar.");
          }
        } catch {
          setError("Something went wrong. Please try again.");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        setError("Location access denied. You can set your city manually from the navbar.");
        setTimeout(() => onDone(null), 2000);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">

        {/* Skip X button */}
        <button
          onClick={() => onDone(null)}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-7 h-7 text-blue-600" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
          Enable Location
        </h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          Find institutes near you — like Zomato and Swiggy do.
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Detect button */}
        <button
          onClick={handleDetect}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 mb-3"
        >
          {detecting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</>
            : <><MapPin className="w-4 h-4" /> Use My Location</>
          }
        </button>

        {/* Skip */}
        <button
          onClick={() => onDone(null)}
          className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          Skip for now
        </button>

        <p className="text-[10px] text-gray-400 text-center mt-3">
          You can change your city anytime from the navbar.
        </p>
      </div>
    </div>
  );
}