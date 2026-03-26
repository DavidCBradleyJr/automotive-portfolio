export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // JWT validation
  const { user } = context.clientContext || {};
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    console.error('Missing GitHub env vars (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'GitHub integration not configured' }),
    };
  }

  const ghHeaders = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    // Fetch directory listing
    const listRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/content/blog`,
      { headers: ghHeaders }
    );

    if (listRes.status === 404) {
      return { statusCode: 200, headers, body: JSON.stringify({ posts: [] }) };
    }

    if (!listRes.ok) {
      throw new Error(`GitHub API returned ${listRes.status}`);
    }

    const files = await listRes.json();
    const mdFiles = files.filter((f) => f.type === 'file' && f.name.endsWith('.md'));

    // Fetch each file's content
    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        const fileRes = await fetch(file.url, { headers: ghHeaders });
        if (!fileRes.ok) return null;

        const data = await fileRes.json();
        const decoded = Buffer.from(data.content, 'base64').toString('utf-8');

        // Parse frontmatter
        const fmMatch = decoded.match(/^---\n([\s\S]*?)\n---/);
        if (!fmMatch) return null;

        const frontmatter = {};
        const fmLines = fmMatch[1].split('\n');
        let currentKey = null;
        let collectingArray = false;

        for (const line of fmLines) {
          // Array item (e.g. "  - Track Day")
          if (collectingArray && /^\s+-\s+/.test(line)) {
            const val = line.replace(/^\s+-\s+/, '').trim();
            frontmatter[currentKey].push(val);
            continue;
          }

          // Key-value pair
          const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
          if (kvMatch) {
            currentKey = kvMatch[1];
            const rawVal = kvMatch[2].trim();
            collectingArray = false;

            if (rawVal === '') {
              // Could be start of array
              frontmatter[currentKey] = [];
              collectingArray = true;
            } else {
              // Strip surrounding quotes
              frontmatter[currentKey] = rawVal.replace(/^["']|["']$/g, '');
            }
          }
        }

        // Extract body (everything after second ---)
        const bodyMatch = decoded.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)/);
        const body = bodyMatch ? bodyMatch[1].trim() : '';

        const slug = file.name.replace(/\.md$/, '');

        return {
          slug,
          sha: data.sha,
          title: frontmatter.title || slug,
          date: frontmatter.date || '',
          cover: frontmatter.cover || '',
          excerpt: frontmatter.excerpt || '',
          status: frontmatter.status || 'draft',
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          body,
        };
      })
    );

    // Filter out null entries (failed fetches or missing frontmatter)
    const validPosts = posts.filter(Boolean);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ posts: validPosts }),
    };
  } catch (err) {
    console.error('List posts failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to list posts' }),
    };
  }
};
