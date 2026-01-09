// backend/src/utils/slugify.js

/**
 * Convert text to URL-friendly slug
 * @param {string} text - Text to convert
 * @param {string} city - City name to append (optional)
 * @returns {string} - URL-friendly slug
 */
export function slugify(text, city = '') {
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end

  // Append city if provided
  if (city) {
    const citySlug = city
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    slug = `${slug}-${citySlug}`;
  }

  return slug;
}

/**
 * Generate unique slug by appending number if needed
 * @param {string} baseSlug - Base slug
 * @param {Object} prisma - Prisma client
 * @param {string} excludeId - ID to exclude from check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
export async function generateUniqueSlug(baseSlug, prisma, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.center.findUnique({
      where: { slug },
      select: { id: true }
    });

    // If no existing slug found, or found slug is the one we're updating
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }

    // Slug exists, try with counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}