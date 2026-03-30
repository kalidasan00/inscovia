// backend/scripts/fillLatLng.js
// ✅ Run ONCE to fill lat/lng for all existing centers
// Usage: node scripts/fillLatLng.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function geocodeCity(city, district, state) {
  const queries = [
    `${city}, ${state}, India`,
    `${district}, ${state}, India`,
    `${state}, India`,
  ];

  for (const query of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Inscovia/1.0 (support@inscovia.com)" }
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
  return null;
}

async function main() {
  // Only process centers missing lat/lng
  const centers = await prisma.center.findMany({
    where: { latitude: null },
    select: { id: true, name: true, city: true, district: true, state: true }
  });

  console.log(`📍 Found ${centers.length} centers missing lat/lng`);

  let success = 0;
  let failed = 0;

  for (const center of centers) {
    const coords = await geocodeCity(center.city, center.district, center.state);

    if (coords) {
      await prisma.center.update({
        where: { id: center.id },
        data: { latitude: coords.latitude, longitude: coords.longitude }
      });
      console.log(`✅ ${center.name} (${center.city}) → lat:${coords.latitude}, lng:${coords.longitude}`);
      success++;
    } else {
      console.warn(`⚠️ Could not geocode: ${center.name} (${center.city}, ${center.state})`);
      failed++;
    }

    // ✅ Wait 1 second between requests — Nominatim rate limit
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n🎉 Done! ${success} updated, ${failed} failed`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("❌ Script failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
