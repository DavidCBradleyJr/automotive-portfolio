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

  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK;
  if (!buildHookUrl) {
    console.error('NETLIFY_BUILD_HOOK environment variable not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Build hook not configured' }),
    };
  }

  try {
    const response = await fetch(buildHookUrl, { method: 'POST' });

    if (!response.ok) {
      throw new Error(`Build hook returned ${response.status}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Rebuild triggered successfully' }),
    };
  } catch (err) {
    console.error('Rebuild trigger failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to trigger rebuild' }),
    };
  }
};
