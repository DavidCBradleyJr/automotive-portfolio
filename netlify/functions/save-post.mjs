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

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, NETLIFY_BUILD_HOOK } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.error('Missing GitHub env vars (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'GitHub integration not configured' }),
    };
  }

  try {
    const { slug, content, sha, title } = JSON.parse(event.body);

    if (!slug || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: slug, content' }),
      };
    }

    // Build GitHub API request body
    const ghBody = {
      message: `blog: ${sha ? 'update' : 'create'} "${title || slug}"`,
      content: Buffer.from(content, 'utf-8').toString('base64'),
    };

    // Include sha for updates (required by GitHub API)
    if (sha) {
      ghBody.sha = sha;
    }

    const ghRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/content/blog/${slug}.md`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ghBody),
      }
    );

    if (!ghRes.ok) {
      const errData = await ghRes.json().catch(() => ({}));
      throw new Error(`GitHub API returned ${ghRes.status}: ${errData.message || 'Unknown error'}`);
    }

    const result = await ghRes.json();

    // Trigger rebuild
    if (NETLIFY_BUILD_HOOK) {
      try {
        await fetch(NETLIFY_BUILD_HOOK, { method: 'POST' });
      } catch (rebuildErr) {
        console.error('Rebuild trigger failed (post was saved):', rebuildErr);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sha: result.content.sha, message: 'Post saved' }),
    };
  } catch (err) {
    console.error('Save post failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to save post' }),
    };
  }
};
