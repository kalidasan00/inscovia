// backend/src/middleware/slugMiddleware.js
import { slugify, generateUniqueSlug } from '../utils/slugify.js';

export function registerSlugMiddleware(prisma) {
  prisma.$use(async (params, next) => {
    // Auto-generate slug on CREATE
    if (params.model === 'Center' && params.action === 'create') {
      if (!params.args.data.slug) {
        const { name, city } = params.args.data;
        const baseSlug = slugify(name, city);
        params.args.data.slug = await generateUniqueSlug(baseSlug, prisma);
        console.log(`✅ Auto-generated slug: ${params.args.data.slug}`);
      }
    }

    // Auto-update slug on UPDATE (if name or city changes)
    if (params.model === 'Center' && params.action === 'update') {
      const { name, city } = params.args.data;
      if (name || city) {
        const center = await prisma.center.findUnique({
          where: params.args.where,
          select: { id: true, name: true, city: true }
        });

        if (center) {
          const newName = name || center.name;
          const newCity = city || center.city;
          const baseSlug = slugify(newName, newCity);
          params.args.data.slug = await generateUniqueSlug(baseSlug, prisma, center.id);
          console.log(`✅ Auto-updated slug: ${params.args.data.slug}`);
        }
      }
    }

    return next(params);
  });
}