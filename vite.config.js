import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'node:fs';

function getBlogEntries() {
  const blogDir = resolve(__dirname, 'blog');
  if (!existsSync(blogDir)) return {};
  const entries = {};
  const slugs = readdirSync(blogDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  for (const slug of slugs) {
    const htmlPath = resolve(blogDir, slug, 'index.html');
    if (existsSync(htmlPath)) {
      entries[`blog/${slug}`] = htmlPath;
    }
  }
  return entries;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        ...getBlogEntries(),
      },
    },
  },
});
