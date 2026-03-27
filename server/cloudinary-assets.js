// server/cloudinary-assets.js
// Minimal server that exposes a single endpoint: GET /api/cloudinary/assets
// It uses Cloudinary Search API to return image assets (secure_url etc).
//
// Usage (local):
//   npm install express cloudinary dotenv
//   CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... node server/cloudinary-assets.js
//
// Deploy: add to a Render (or other) Web Service and set env vars there.
// Important: keep API_SECRET on the server only (do NOT expose as VITE_*).

require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Simple CORS allow for your frontend domain (adjust as needed)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// GET /api/cloudinary/assets
// Query params:
//  - max_results (optional, default 500, cap 2000)
//  - expression (optional Cloudinary search expression, default 'resource_type:image')
// Returns JSON: { resources: [{ public_id, secure_url, format, width, height, tags }, ...] }
app.get('/api/cloudinary/assets', async (req, res) => {
  try {
    const maxResults = Math.min(parseInt(req.query.max_results || '500', 10), 2000);
    // Limit total returned items to avoid extremely heavy responses
    const totalLimit = Math.min(maxResults, 2000);
    const expression = req.query.expression || 'resource_type:image';
    let all = [];
    let nextCursor = undefined;
    // Cloudinary allows paging with next_cursor; we'll page until we reach totalLimit
    do {
      let builder = cloudinary.search
        .expression(expression)
        .max_results(Math.min(500, totalLimit - all.length))
        .sort_by('public_id', 'desc');
      if (nextCursor) builder = builder.next_cursor(nextCursor);
      const result = await builder.execute();
      if (!result || !result.resources) break;
      const resources = result.resources.map(r => ({
        public_id: r.public_id,
        secure_url: r.secure_url || r.url,
        format: r.format,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        created_at: r.created_at,
        tags: r.tags || []
      }));
      all = all.concat(resources);
      nextCursor = result.next_cursor;
      // safety break if nothing new
      if (!nextCursor) break;
    } while (all.length < totalLimit);
    res.json({ resources: all.slice(0, totalLimit) });
  } catch (err) {
    console.error('Cloudinary search error:', err && (err.message || err));
    res.status(500).json({ error: err && (err.message || 'Cloudinary error') });
  }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Cloudinary assets API listening on port ${PORT}`);
});
