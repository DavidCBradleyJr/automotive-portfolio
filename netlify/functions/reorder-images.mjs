import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // JWT validation
  const { user } = context.clientContext || {};
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { images } = JSON.parse(event.body);

    if (!images || !Array.isArray(images) || images.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing or empty images array' }),
      };
    }

    let updated = 0;
    const errors = [];

    // Process sequentially to avoid Cloudinary rate limits
    for (const img of images) {
      try {
        // Fetch current resource context
        const resource = await cloudinary.api.resource(img.public_id, { context: true });
        const existing = resource.context?.custom || resource.context || {};

        // Merge existing context with new sort_order
        const caption = existing.caption ?? '';
        const alt = existing.alt ?? '';
        const sort_order = img.sort_order ?? existing.sort_order ?? '';
        const contextString = `caption=${caption}|alt=${alt}|sort_order=${sort_order}`;

        await cloudinary.api.update(img.public_id, { context: contextString });
        updated++;
      } catch (imgErr) {
        console.error(`Failed to update sort_order for ${img.public_id}:`, imgErr.message);
        errors.push({ public_id: img.public_id, error: imgErr.message });
      }
    }

    if (errors.length > 0 && updated > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: 'partial', updated, errors }),
      };
    }

    if (errors.length > 0 && updated === 0) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, updated: 0, errors }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, updated }),
    };
  } catch (err) {
    console.error('Reorder images failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to reorder images' }),
    };
  }
};
