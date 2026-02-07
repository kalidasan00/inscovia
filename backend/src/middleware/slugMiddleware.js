// backend/src/middleware/slugMiddleware.js - OPTIMIZED & FIXED
import { slugify, generateUniqueSlug } from '../utils/slugify.js';

export function registerSlugMiddleware(prisma) {
  prisma.$use(async (params, next) => {
    // ✅ OPTIMIZED: Only validate slug exists, don't auto-generate
    // (auth.controller.js already generates slugs with timestamps)

    if (params.model === 'Center' && params.action === 'create') {
      // ✅ VALIDATION ONLY: Ensure slug exists
      if (!params.args.data.slug) {
        console.warn('⚠️ WARNING: Center created without slug! This should not happen.');
        console.warn('Slug generation should be done in auth.controller.js');

        // Emergency fallback (should never be needed)
        const { name, city } = params.args.data;
        const timestamp = Date.now().toString(36);
        params.args.data.slug = `${slugify(name, city)}-${timestamp}`;
        console.log(`🆘 Emergency slug generated: ${params.args.data.slug}`); // ✅ FIXED: Added parenthesis
      }
    }

    // ✅ REMOVED: Auto-update on UPDATE
    // Slug should be permanent once set
    // Changing slug breaks URLs and SEO

    return next(params);
  });
}