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

  // JWT validation -- Netlify auto-populates user from Authorization header
  const { user } = context.clientContext || {};
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const result = await cloudinary.search
      .expression('folder:gallery/*')
      .with_field('context')
      .sort_by('created_at', 'desc')
      .max_results(200)
      .execute();

    const images = result.resources.map((r) => ({
      public_id: r.public_id,
      url: cloudinary.url(r.public_id, {
        fetch_format: 'auto',
        quality: 'auto',
        width: 400,
        crop: 'limit',
        secure: true,
      }),
      full_url: cloudinary.url(r.public_id, {
        fetch_format: 'auto',
        quality: 'auto',
        width: 2000,
        crop: 'limit',
        secure: true,
      }),
      width: r.width,
      height: r.height,
      category: extractCategory(r),
      caption: r.context?.custom?.caption || r.context?.caption || '',
      alt: r.context?.custom?.alt || r.context?.alt || '',
      created_at: r.created_at,
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ images }) };
  } catch (err) {
    console.error('List images failed:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to load gallery' }) };
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
