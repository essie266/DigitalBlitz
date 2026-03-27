// One-time exporter: exports all Cloudinary image assets to public/cloudinary-assets.json
// Run: node tools/export_cloudinary_assets.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const PAGE_SIZE = 500; // Cloudinary search max per page
const OUT_FILE = process.env.OUT_FILE || 'public/cloudinary-assets.json';

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function exportAll() {
  try {
    console.log('Starting Cloudinary export to', OUT_FILE);
    let nextCursor;
    const allResources = [];

    do {
      let builder = cloudinary.search
        .expression('resource_type:image') // change if you want videos too
        .max_results(PAGE_SIZE)
        .sort_by('public_id', 'desc');

      if (nextCursor) builder = builder.next_cursor(nextCursor);

      const res = await builder.execute();
      if (!res || !res.resources || res.resources.length === 0) break;

      res.resources.forEach(r => {
        allResources.push({
          public_id: r.public_id,
          resource_type: r.resource_type,
          secure_url: r.secure_url || r.url,
          format: r.format,
          width: r.width,
          height: r.height,
          bytes: r.bytes,
          created_at: r.created_at,
          tags: r.tags || []
        });
      });

      console.log(`Fetched ${allResources.length} resources so far. next_cursor=${res.next_cursor || 'none'}`);
      nextCursor = res.next_cursor;
    } while (nextCursor);

    const outDir = path.dirname(OUT_FILE);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(OUT_FILE, JSON.stringify({ resources: allResources }, null, 2), 'utf8');
    console.log('Export completed. Total assets exported:', allResources.length);
    console.log('File written to:', OUT_FILE);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

exportAll();
