// lib/utils.js
import centers from "../data/centers.json";

export function getCenters({ type, location, q } = {}) {
  let res = centers;
  if (type) res = res.filter(c => c.type.toLowerCase() === type.toLowerCase());
  if (location) res = res.filter(c => c.location.toLowerCase() === location.toLowerCase());
  if (q) {
    const qq = q.toLowerCase();
    res = res.filter(c => (c.name + " " + c.courses.join(" ")).toLowerCase().includes(qq));
  }
  return res;
}

export function getCenterById(id) {
  return centers.find(c => c.id === Number(id)) || null;
}
