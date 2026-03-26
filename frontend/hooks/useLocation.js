// hooks/useLocation.js
"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "userCity";

export function useLocation() {
  const [city, setCity] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState(null);

  // Load saved city from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCity(saved);
    } catch { }
  }, []);

  const detectLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("GPS not supported");
        resolve(null);
        return;
      }
      setDetecting(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            // Nominatim — 100% free, no API key needed
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            const detectedCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              null;
            if (detectedCity) {
              setCity(detectedCity);
              localStorage.setItem(STORAGE_KEY, detectedCity);
              resolve(detectedCity);
            } else {
              resolve(null);
            }
          } catch {
            setError("Could not detect city");
            resolve(null);
          } finally {
            setDetecting(false);
          }
        },
        () => {
          setDetecting(false);
          setError("Location access denied");
          resolve(null);
        },
        { timeout: 8000 }
      );
    });
  };

  const setManualCity = (cityName) => {
    setCity(cityName);
    try {
      localStorage.setItem(STORAGE_KEY, cityName);
    } catch { }
  };

  const clearCity = () => {
    setCity(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { }
  };

  return { city, detecting, error, detectLocation, setManualCity, clearCity };
}