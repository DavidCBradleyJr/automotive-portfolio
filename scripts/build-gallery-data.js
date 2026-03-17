/**
 * Build Gallery Data from Cloudinary
 *
 * Fetches gallery image metadata from Cloudinary Search API,
 * generates LQIP base64 placeholders from Cloudinary thumbnail transforms,
 * and writes src/data/gallery-images.js in the same format as v1.
 *
 * Usage: node scripts/build-gallery-data.js
 * Local: node --env-file=.env scripts/build-gallery-data.js
 */

import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

// --- Auto-load .env if present and env vars not already set ---
if (!process.env.CLOUDINARY_CLOUD_NAME && existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// --- Env var validation ---
const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error('ERROR: Missing required environment variables:');
  missing.forEach((v) => console.error(`  - ${v}`));
  console.error('\nSet these in your .env file (local) or Netlify dashboard (production).');
  console.error('See .env.example for reference.');
  process.exit(1);
}

// --- Configure Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Category label map (hardcoded, same as v1) ---
const categoryLabels = {
  'jdm': 'JDM',
  'euro': 'Euro',
  'supercar': 'Supercar',
  'american-muscle': 'American Muscle',
  'track': 'Track/Motorsport',
};

/**
 * Fetch tiny blurred thumbnails and convert to base64 data URLs.
 * Processes in batches of 5 to limit concurrency.
 */
async function generateLqipBatch(resources) {
  const results = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < resources.length; i += BATCH_SIZE) {
    const batch = resources.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (resource) => {
        const lqipUrl = cloudinary.url(resource.public_id, {
          width: 16,
          effect: 'blur:1000',
          quality: 'auto',
          fetch_format: 'webp',
          secure: true,
        });

        const response = await fetch(lqipUrl);
        if (!response.ok) {
          console.warn(`Warning: Failed to fetch LQIP for ${resource.public_id} (${response.status})`);
          return null;
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        return `data:image/webp;base64,${buffer.toString('base64')}`;
      })
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Extract category from a Cloudinary resource.
 * Folder structure: gallery/{category}/{filename}
 */
function extractCategory(resource) {
  // Try asset_folder first (dynamic folder mode)
  if (resource.asset_folder) {
    const parts = resource.asset_folder.split('/');
    // asset_folder could be "gallery/jdm" or just "jdm"
    if (parts.length >= 2 && parts[0] === 'gallery') {
      return parts[1];
    }
    if (parts.length === 1 && categoryLabels[parts[0]]) {
      return parts[0];
    }
  }

  // Fall back to parsing public_id
  const parts = resource.public_id.split('/');
  // Expected: gallery/{category}/{filename}
  if (parts.length >= 3 && parts[0] === 'gallery') {
    return parts[1];
  }

  // Last resort: try folder field
  if (resource.folder) {
    const folderParts = resource.folder.split('/');
    if (folderParts.length >= 2 && folderParts[0] === 'gallery') {
      return folderParts[1];
    }
  }

  return 'uncategorized';
}

async function main() {
  console.log('Fetching gallery images from Cloudinary...');

  // Fetch all gallery images
  const result = await cloudinary.search
    .expression('folder:gallery/* AND -tags:hidden')
    .with_field('context')
    .with_field('tags')
    .sort_by('public_id', 'asc')
    .max_results(500)
    .execute();

  const resources = result.resources;
  console.log(`Found ${resources.length} images in Cloudinary.`);

  if (resources.length === 0) {
    console.error('ERROR: No images found in Cloudinary gallery folder.');
    console.error('Run the migration script first: npm run migrate');
    process.exit(1);
  }

  // Generate LQIP base64 strings
  console.log('Generating LQIP base64 placeholders...');
  const lqipStrings = await generateLqipBatch(resources);

  // Build gallery entries
  const galleryImages = resources.map((resource, index) => {
    const publicIdParts = resource.public_id.split('/');
    const id = publicIdParts[publicIdParts.length - 1];
    const category = extractCategory(resource);

    const src = cloudinary.url(resource.public_id, {
      fetch_format: 'auto',
      quality: 'auto',
      width: 2000,
      crop: 'limit',
      secure: true,
    });

    // Context metadata may be at context.custom.X (pipe-delimited upload)
    // or directly at context.X (object-form upload, as used by our migration)
    const caption = resource.context?.custom?.caption || resource.context?.caption || '';
    const alt = resource.context?.custom?.alt || resource.context?.alt || '';
    const sort_order = parseInt(resource.context?.custom?.sort_order || resource.context?.sort_order || '999', 10);

    return {
      id,
      src,
      lqip: lqipStrings[index] || '',
      width: resource.width,
      height: resource.height,
      category,
      caption,
      alt,
      sort_order,
      isPlaceholder: false,
    };
  });

  // Sort: by category alphabetically, then by sort_order ascending, then by id
  galleryImages.sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });

  // Build the output file content
  const entries = galleryImages
    .map((img) => {
      const caption = img.caption.replace(/'/g, "\\'");
      const alt = img.alt.replace(/'/g, "\\'");
      return `  {
    id: '${img.id}',
    src: '${img.src}',
    lqip: '${img.lqip}',
    width: ${img.width},
    height: ${img.height},
    category: '${img.category}',
    caption: '${caption}',
    alt: '${alt}',
    isPlaceholder: false,
  }`;
    })
    .join(',\n');

  const categoriesBlock = `  { id: 'all', label: 'All' },
  { id: 'jdm', label: 'JDM' },
  { id: 'euro', label: 'Euro' },
  { id: 'supercar', label: 'Supercar' },
  { id: 'american-muscle', label: 'American Muscle' },
  { id: 'track', label: 'Track/Motorsport' },`;

  const output = `/**
 * Gallery Image Data
 *
 * Auto-generated by scripts/build-gallery-data.js
 * Do not edit manually -- re-run the build to regenerate.
 *
 * Total: ${galleryImages.length} images
 */

export const galleryImages = [
${entries},
];

export const categories = [
${categoriesBlock}
];
`;

  // Ensure output directory exists
  const outputPath = 'src/data/gallery-images.js';
  await mkdir(dirname(outputPath), { recursive: true });

  // Write the data file
  await writeFile(outputPath, output, 'utf-8');
  console.log(`Generated gallery-images.js with ${galleryImages.length} images.`);

  // Try to fetch hero image config from Cloudinary
  try {
    const heroResult = await cloudinary.api.resource('site-config/hero', {
      secure: true,
    });

    if (heroResult && heroResult.public_id) {
      const heroUrl = cloudinary.url('site-config/hero', {
        fetch_format: 'auto',
        quality: 'auto',
        secure: true,
      });

      const heroConfig = `/**
 * Hero Image Configuration
 *
 * Auto-generated by scripts/build-gallery-data.js
 * Do not edit manually -- set hero via admin panel.
 */

export const heroConfig = {
  src: '${heroUrl}',
  cloudinary: true,
};
`;

      const heroOutputPath = 'src/data/hero-config.js';
      await writeFile(heroOutputPath, heroConfig, 'utf-8');
      console.log('Generated hero-config.js with Cloudinary hero image.');
    }
  } catch (err) {
    // Hero image not set via admin yet -- that's fine, skip
    if (err.error && err.error.http_code === 404) {
      console.log('No hero image set via admin panel -- skipping hero-config.js.');
    } else {
      console.warn('Warning: Could not check for hero image:', err.message || err);
    }
  }
}

main().catch((err) => {
  console.error('Build gallery data failed:', err);
  process.exit(1);
});
