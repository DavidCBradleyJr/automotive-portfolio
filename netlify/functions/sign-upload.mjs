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

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // JWT validation
  const { user } = context.clientContext || {};
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { folder, public_id, context: metadata, overwrite } = JSON.parse(event.body);

    if (!folder || !public_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: folder, public_id' }),
      };
    }

    // Build params to sign
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      folder,
      public_id,
      overwrite: overwrite || false,
    };

    if (metadata) {
      // Cloudinary context format: key=value|key2=value2
      const contextStr = Object.entries(metadata)
        .map(([k, v]) => `${k}=${v}`)
        .join('|');
      params.context = contextStr;
    }

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        signature,
        timestamp,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
      }),
    };
  } catch (err) {
    console.error('Signature generation failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate upload signature' }),
    };
  }
};
