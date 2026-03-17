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
    const { public_id, caption, alt, category } = JSON.parse(event.body);

    if (!public_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required field: public_id' }),
      };
    }

    // Fetch current resource to get existing context (update replaces entire context)
    const resource = await cloudinary.api.resource(public_id, { context: true });
    const existing = resource.context?.custom || resource.context || {};

    // Merge existing context with provided updates
    const mergedCaption = caption ?? existing.caption ?? '';
    const mergedAlt = alt ?? existing.alt ?? '';
    const mergedSortOrder = existing.sort_order ?? '';
    const contextString = `caption=${mergedCaption}|alt=${mergedAlt}|sort_order=${mergedSortOrder}`;

    // Update metadata
    await cloudinary.api.update(public_id, { context: contextString });

    let finalPublicId = public_id;

    // Handle category change (rename)
    if (category) {
      const currentCategory = extractCategory(resource);
      if (category !== currentCategory) {
        const parts = public_id.split('/');
        const filename = parts[parts.length - 1];
        const newPublicId = `gallery/${category}/${filename}`;

        try {
          await cloudinary.uploader.rename(public_id, newPublicId, { overwrite: false });
          finalPublicId = newPublicId;
        } catch (renameErr) {
          if (renameErr.http_code === 409 || (renameErr.message && renameErr.message.includes('already exists'))) {
            return {
              statusCode: 409,
              headers,
              body: JSON.stringify({ error: 'An image with that name already exists in the target category' }),
            };
          }
          throw renameErr;
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, public_id: finalPublicId }),
    };
  } catch (err) {
    console.error('Update image failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update image' }),
    };
  }
};

function extractCategory(resource) {
  if (resource.asset_folder) {
    const parts = resource.asset_folder.split('/');
    if (parts.length >= 2 && parts[0] === 'gallery') return parts[1];
  }
  const parts = resource.public_id.split('/');
  if (parts.length >= 3 && parts[0] === 'gallery') return parts[1];
  return 'uncategorized';
}
