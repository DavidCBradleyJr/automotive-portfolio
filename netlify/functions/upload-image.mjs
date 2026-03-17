import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler = async (event, context) => {
  // CORS headers for all responses
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

  // JWT validation -- Netlify auto-populates user from Authorization header
  const { user } = context.clientContext || {};
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { image, folder, public_id, context: metadata } = JSON.parse(event.body);

    // Validate required fields
    if (!image || !folder || !public_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: image, folder, public_id' }),
      };
    }

    // Validate image is a data URI
    if (!image.startsWith('data:image/')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid image format. Expected base64 data URI.' }),
      };
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder,
      public_id,
      context: metadata || {},
      resource_type: 'image',
      overwrite: false,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
      }),
    };
  } catch (err) {
    console.error('Upload failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Upload failed. Please try again.' }),
    };
  }
};
