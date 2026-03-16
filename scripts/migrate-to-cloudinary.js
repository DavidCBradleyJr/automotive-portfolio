/**
 * Cloudinary Migration Script
 *
 * Uploads all 29 gallery images to Cloudinary with folder-per-category
 * structure and contextual metadata (caption + alt text).
 *
 * Usage: npm run migrate
 * Requires: .env file with CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from 'cloudinary';

// --- Validate environment variables ---
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = requiredEnvVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error('ERROR: Missing required environment variables:');
  missing.forEach((v) => console.error(`  - ${v}`));
  console.error('\nCreate a .env file from .env.example and fill in your Cloudinary credentials.');
  console.error('Get credentials from: https://console.cloudinary.com/settings/api-keys');
  process.exit(1);
}

// --- Configure Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Category assignments (copied from scripts/process-images.js) ---
// Each entry: [descriptive-id, caption, alt-text]
const categoryAssignments = {
  jdm: [
    ['jdm-street-racer-01', 'JDM Street Racer', 'Japanese domestic market street racing car'],
    ['jdm-tuner-coupe-02', 'JDM Tuner Coupe', 'Modified Japanese tuner coupe in urban setting'],
    ['jdm-drift-machine-03', 'JDM Drift Machine', 'Japanese drift car with aggressive body kit'],
    ['jdm-import-sedan-04', 'JDM Import Sedan', 'Classic Japanese import sedan with clean styling'],
    ['jdm-sports-hatch-05', 'JDM Sports Hatch', 'Japanese sports hatchback with aftermarket wheels'],
    ['jdm-midnight-runner-06', 'JDM Midnight Runner', 'Japanese performance car photographed at night'],
  ],
  euro: [
    ['euro-sports-coupe-01', 'Euro Sports Coupe', 'European sports coupe with sleek body lines'],
    ['euro-grand-tourer-02', 'Euro Grand Tourer', 'European grand touring car on open road'],
    ['euro-luxury-saloon-03', 'Euro Luxury Saloon', 'Premium European luxury saloon in motion'],
    ['euro-hot-hatch-04', 'Euro Hot Hatch', 'European hot hatchback with sport trim'],
    ['euro-classic-roadster-05', 'Euro Classic Roadster', 'Classic European roadster convertible'],
    ['euro-touring-wagon-06', 'Euro Touring Wagon', 'European performance touring wagon'],
  ],
  supercar: [
    ['supercar-exotic-red-01', 'Exotic Supercar', 'Red exotic supercar with dramatic lighting'],
    ['supercar-hypercar-02', 'Hypercar Profile', 'Hypercar photographed from side profile'],
    ['supercar-mid-engine-03', 'Mid-Engine Beast', 'Mid-engine supercar with aerodynamic body'],
    ['supercar-v12-coupe-04', 'V12 Coupe', 'Twelve-cylinder supercar coupe'],
    ['supercar-carbon-fiber-05', 'Carbon Fiber Special', 'Carbon fiber supercar with exposed weave'],
    ['supercar-track-weapon-06', 'Track Weapon', 'Track-focused supercar with rear wing'],
  ],
  'american-muscle': [
    ['american-muscle-pony-car-01', 'Pony Car', 'American pony car with classic proportions'],
    ['american-muscle-big-block-02', 'Big Block Cruiser', 'American muscle car with big block engine'],
    ['american-muscle-drag-racer-03', 'Drag Strip Ready', 'American muscle car built for the drag strip'],
    ['american-muscle-modern-power-04', 'Modern Muscle', 'Modern American muscle car with bold styling'],
    ['american-muscle-classic-resto-05', 'Classic Restoration', 'Restored classic American muscle car'],
    ['american-muscle-burnout-king-06', 'Burnout King', 'American muscle car with smoking tires'],
  ],
  track: [
    ['track-circuit-racer-01', 'Circuit Racer', 'Race car on circuit with full livery'],
    ['track-time-attack-02', 'Time Attack Build', 'Time attack car with aerodynamic modifications'],
    ['track-rally-spec-03', 'Rally Spec', 'Rally-prepared car with roll cage and lights'],
    ['track-endurance-racer-04', 'Endurance Racer', 'Endurance racing car in pit lane'],
    ['track-open-wheel-05', 'Open Wheel', 'Open wheel racing car on track'],
  ],
};

async function main() {
  console.log('Cloudinary Migration: Uploading 29 gallery images\n');

  let uploaded = 0;
  let failed = 0;
  const failures = [];
  const total = Object.values(categoryAssignments).flat().length;

  for (const [category, entries] of Object.entries(categoryAssignments)) {
    for (const [id, caption, altText] of entries) {
      const filePath = `public/images/gallery/${id}.webp`;

      try {
        await cloudinary.uploader.upload(filePath, {
          public_id: id,
          folder: `gallery/${category}`,
          context: { caption: caption, alt: altText },
          overwrite: true,
          resource_type: 'image',
        });

        uploaded++;
        console.log(`[${uploaded + failed}/${total}] Uploaded ${id} -> gallery/${category}/`);
      } catch (err) {
        failed++;
        failures.push({ id, category, error: err.message });
        console.error(`[${uploaded + failed}/${total}] FAILED ${id}: ${err.message}`);
      }
    }
  }

  // Summary
  console.log(`\n--- Migration Summary ---`);
  console.log(`Uploaded: ${uploaded}/${total}`);

  if (failed > 0) {
    console.log(`Failed: ${failed}`);
    failures.forEach((f) => console.log(`  - ${f.id} (${f.category}): ${f.error}`));
  }

  // Verification: search for uploaded images
  try {
    const result = await cloudinary.search
      .expression('folder:gallery/*')
      .max_results(100)
      .execute();
    console.log(`\nVerification: ${result.total_count} images found in Cloudinary`);
  } catch (err) {
    console.error(`\nVerification search failed: ${err.message}`);
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
