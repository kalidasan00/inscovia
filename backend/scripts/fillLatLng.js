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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`,
        { headers: { "User-Agent": "Inscovia/1.0 (support@inscovia.com)" } }
      );
      const data = await res.json();
      if (data?.[0]) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
      }
    } catch (err) {
      console.error(`❌ ${query}:`, err.message);
    }
  }
  return null;
}

async function main() {
  const centers = await prisma.center.findMany({
    where: { latitude: null },
    select: { id: true, name: true, city: true, district: true, state: true }
  });
  console.log(`📍 Found ${centers.length} centers missing lat/lng`);
  let success = 0, failed = 0;
  for (const center of centers) {
    const coords = await geocodeCity(center.city, center.district, center.state);
    if (coords) {
      await prisma.center.update({ where: { id: center.id }, data: coords });
      console.log(`✅ ${center.name} → lat:${coords.latitude}, lng:${coords.longitude}`);
      success++;
    } else {
      console.warn(`⚠️ Failed: ${center.name} (${center.city})`);
      failed++;
    }
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