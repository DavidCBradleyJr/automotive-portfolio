/**
 * Image Processing Pipeline
 *
 * Processes source JPGs from ~/Pictures/cars/ into optimized WebP files
 * and generates a gallery data file with LQIP base64 placeholders.
 *
 * Usage: node scripts/process-images.js
 */

import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const SOURCE_DIR = join(process.env.HOME, 'Pictures/cars');
const OUTPUT_DIR = 'public/images/gallery';
const DATA_FILE = 'src/data/gallery-images.js';
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;
const MAX_FILE_SIZE = 400 * 1024; // 400KB budget per FOUND-06
const LQIP_SIZE = 16;
const WEBP_QUALITY = 82;
const LQIP_QUALITY = 20;

// Category distribution for the 29 real images
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

// Gradient colors for placeholder entries
const gradientColors = {
  jdm: ['#1a1a2e', '#e94560'],
  euro: ['#1a1a2e', '#3498db'],
  supercar: ['#1a1a2e', '#f39c12'],
  'american-muscle': ['#1a1a2e', '#e74c3c'],
  track: ['#1a1a2e', '#2ecc71'],
};

// Placeholder entries per category (to reach 8-12 per category)
const placeholderCounts = {
  jdm: 4,
  euro: 4,
  supercar: 4,
  'american-muscle': 4,
  track: 5,
};

// Placeholder captions per category
const placeholderCaptions = {
  jdm: 'JDM Import',
  euro: 'Euro Performance',
  supercar: 'Exotic Machine',
  'american-muscle': 'American Power',
  track: 'Motorsport Action',
};

async function processImage(inputPath, outputName) {
  const metadata = await sharp(inputPath).metadata();

  // Resize constraining both width and height, then convert to WebP.
  // If the result exceeds the file-size budget, re-encode at lower quality.
  const outputPath = join(OUTPUT_DIR, `${outputName}.webp`);

  let quality = WEBP_QUALITY;
  const resizeOpts = {
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    fit: 'inside',
    withoutEnlargement: true,
  };

  await sharp(inputPath)
    .resize(resizeOpts)
    .webp({ quality })
    .toFile(outputPath);

  // Check file size and reduce quality if over budget
  const { stat } = await import('node:fs/promises');
  let fileInfo = await stat(outputPath);
  while (fileInfo.size > MAX_FILE_SIZE && quality > 40) {
    quality -= 10;
    await sharp(inputPath)
      .resize(resizeOpts)
      .webp({ quality })
      .toFile(outputPath);
    fileInfo = await stat(outputPath);
  }

  if (quality < WEBP_QUALITY) {
    console.log(`    (reduced quality to ${quality} for size budget)`);
  }

  // Read actual output dimensions
  const outputMeta = await sharp(outputPath).metadata();

  // LQIP base64
  const lqipBuffer = await sharp(inputPath)
    .resize(LQIP_SIZE)
    .webp({ quality: LQIP_QUALITY })
    .toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

  return { width: outputMeta.width, height: outputMeta.height, lqip };
}

async function main() {
  // Check if source directory exists
  if (!existsSync(SOURCE_DIR)) {
    console.warn(
      `Warning: Source directory ${SOURCE_DIR} not found. Generating data file with placeholders only.`
    );
    await generateDataFile([]);
    return;
  }

  // Read source files
  const files = (await readdir(SOURCE_DIR))
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();

  console.log(`Found ${files.length} source images in ${SOURCE_DIR}`);

  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Build flat list of all category assignments with source file mapping
  const allAssignments = [];
  const categories = Object.keys(categoryAssignments);
  let fileIndex = 0;

  for (const category of categories) {
    for (const [id, caption, alt] of categoryAssignments[category]) {
      if (fileIndex < files.length) {
        allAssignments.push({
          sourceFile: files[fileIndex],
          id,
          caption,
          alt,
          category,
        });
        fileIndex++;
      }
    }
  }

  console.log(`Processing ${allAssignments.length} images...`);

  // Process each image
  const realEntries = [];
  for (const assignment of allAssignments) {
    const inputPath = join(SOURCE_DIR, assignment.sourceFile);
    console.log(
      `  ${assignment.sourceFile} -> ${assignment.id}.webp`
    );

    const result = await processImage(inputPath, assignment.id);
    realEntries.push({
      id: assignment.id,
      src: `/images/gallery/${assignment.id}.webp`,
      lqip: result.lqip,
      width: result.width,
      height: result.height,
      category: assignment.category,
      caption: assignment.caption,
      alt: assignment.alt,
      isPlaceholder: false,
    });
  }

  console.log(`Processed ${realEntries.length} real images.`);

  await generateDataFile(realEntries);
}

async function generateDataFile(realEntries) {
  // Generate placeholder entries
  const placeholderEntries = [];
  const categories = Object.keys(placeholderCounts);

  for (const category of categories) {
    const count = placeholderCounts[category];
    const realInCategory = categoryAssignments[category].length;
    const [from, to] = gradientColors[category];

    for (let i = 0; i < count; i++) {
      const num = String(realInCategory + i + 1).padStart(2, '0');
      placeholderEntries.push({
        id: `${category}-placeholder-${num}`,
        src: null,
        lqip: null,
        width: 1600,
        height: 1067,
        category,
        caption: placeholderCaptions[category],
        alt: 'Automotive photography placeholder',
        isPlaceholder: true,
        gradient: `linear-gradient(135deg, ${from}, ${to})`,
      });
    }
  }

  const allEntries = [...realEntries, ...placeholderEntries];

  // Sort by category then by id for consistent ordering
  allEntries.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.id.localeCompare(b.id);
  });

  // Generate the data file content
  const entriesStr = allEntries
    .map((entry) => {
      const lines = [
        `  {`,
        `    id: '${entry.id}',`,
        `    src: ${entry.src === null ? 'null' : `'${entry.src}'`},`,
        `    lqip: ${entry.lqip === null ? 'null' : `'${entry.lqip}'`},`,
        `    width: ${entry.width},`,
        `    height: ${entry.height},`,
        `    category: '${entry.category}',`,
        `    caption: '${entry.caption}',`,
        `    alt: '${entry.alt}',`,
        `    isPlaceholder: ${entry.isPlaceholder},`,
      ];
      if (entry.gradient) {
        lines.push(`    gradient: '${entry.gradient}',`);
      }
      lines.push(`  }`);
      return lines.join('\n');
    })
    .join(',\n');

  const dataContent = `/**
 * Gallery Image Data
 *
 * Auto-generated by scripts/process-images.js
 * Do not edit manually -- re-run the script to regenerate.
 *
 * Total: ${allEntries.length} images (${realEntries.length} real + ${allEntries.length - realEntries.length} placeholders)
 */

export const galleryImages = [
${entriesStr},
];

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'jdm', label: 'JDM' },
  { id: 'euro', label: 'Euro' },
  { id: 'supercar', label: 'Supercar' },
  { id: 'american-muscle', label: 'American Muscle' },
  { id: 'track', label: 'Track/Motorsport' },
];
`;

  await mkdir('src/data', { recursive: true });
  await writeFile(DATA_FILE, dataContent, 'utf-8');
  console.log(`\nData file written to ${DATA_FILE}`);
  console.log(`Total entries: ${allEntries.length} (${realEntries.length} real + ${allEntries.length - realEntries.length} placeholders)`);

  // Per-category breakdown
  const catCounts = {};
  for (const entry of allEntries) {
    catCounts[entry.category] = (catCounts[entry.category] || 0) + 1;
  }
  console.log('Per category:', JSON.stringify(catCounts));
}

main().catch((err) => {
  console.error('Image processing failed:', err);
  process.exit(1);
});
