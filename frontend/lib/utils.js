// lib/utils.js

// Fetch centers from API
export async function getCenters({ type, location, q } = {}) {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (location) params.append('location', location);
    if (q) params.append('q', q);

    const url = `/api/centers${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch centers');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching centers:', error);
    return [];
  }
}

// Get single center by ID
export async function getCenterById(id) {
  try {
    const response = await fetch(`/api/centers/${id}`);

    if (!response.ok) {
      throw new Error('Center not found');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching center:', error);
    return null;
  }
}

// Client-side filter function (if you need local filtering)
export function filterCenters(centers, { type, location, q } = {}) {
  let res = centers;

  if (type && type !== "all") {
    res = res.filter((c) => c.type.toLowerCase() === type.toLowerCase());
  }

  if (location && location !== "all") {
    res = res.filter((c) =>
      c.city?.toLowerCase() === location.toLowerCase() ||
      c.district?.toLowerCase() === location.toLowerCase() ||
      c.state?.toLowerCase() === location.toLowerCase()
    );
  }

  if (q) {
    const query = q.toLowerCase();
    res = res.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.courses?.some((course) => course.toLowerCase().includes(query))
    );
  }

  return res;
}