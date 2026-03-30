// backend/src/utils/geocode.js
// ✅ Free geocoding via Nominatim — no API key needed

export async function geocodeCity(city, district, state) {
  // Try city first, fallback to district, then state capital
  const queries = [
    `${city}, ${state}, India`,
    `${district}, ${state}, India`,
    `${state}, India`,
  ];

  for (const query of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
      const res = await fetch(url, {
        headers: {
          // Nominatim requires a user-agent
          "User-Agent": "Inscovia/1.0 (support@inscovia.com)"
        }
      });
      const data = await res.json();
      if (data && data[0]) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
    } catch (err) {
      console.error(`❌ Geocode error for "${query}":`, err.message);
    }
  }

  // All attempts failed — return null silently (non-blocking)
  console.warn(`⚠️ Could not geocode: ${city}, ${state}`);
  return null;
}