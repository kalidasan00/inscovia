// app/api/centers/route.js
import centers from "../../../data/centers.json";

export async function GET(request) {
  const url = new URL(request.url);
  // optional filters via query (type, location, q)
  const type = url.searchParams.get("type");
  const location = url.searchParams.get("location");
  const q = url.searchParams.get("q");

  let results = centers;

  if (type) {
    results = results.filter(c => c.type.toLowerCase() === type.toLowerCase());
  }
  if (location) {
    results = results.filter(c => c.location.toLowerCase() === location.toLowerCase());
  }
  if (q) {
    const qq = q.toLowerCase();
    results = results.filter(c => (c.name + " " + c.courses.join(" ")).toLowerCase().includes(qq));
  }

  return new Response(JSON.stringify({ success: true, data: results }), {
    headers: { "Content-Type": "application/json" }
  });
}
