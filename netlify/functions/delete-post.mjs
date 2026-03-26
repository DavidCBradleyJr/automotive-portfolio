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
    const { slug, sha, title } = JSON.parse(event.body);

    if (!slug || !sha) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: slug, sha' }),
      };
    }

    const ghRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/content/blog/${slug}.md`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `blog: delete "${title || slug}"`,
          sha,
        }),
      }
    );

    if (!ghRes.ok) {
      const errData = await ghRes.json().catch(() => ({}));
      throw new Error(`GitHub API returned ${ghRes.status}: ${errData.message || 'Unknown error'}`);
    }

    // Trigger rebuild
    if (NETLIFY_BUILD_HOOK) {
      try {
        await fetch(NETLIFY_BUILD_HOOK, { method: 'POST' });
      } catch (rebuildErr) {
        console.error('Rebuild trigger failed (post was deleted):', rebuildErr);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Post deleted' }),
    };
  } catch (err) {
    console.error('Delete post failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete post' }),
    };
  }
};
