# gabeamare.net

A minimal personal site built in Next.js from the supplied Figma design.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Add a writing

Create a Markdown file in `content/writings`:

```md
---
title: "Post title"
subtitle: "A short description"
date: "2026-07-25"
draft: true
---

Write the post here.
```

The filename becomes the URL. For example, `my-post.md` is served at
`/writings/my-post`. Drafts are excluded from every public writing list and
return a 404 at their direct URL. Change `draft` to `false` to publish.

Typography is automatic: prose uses Inter, headings use Redaction 10, and links
use Redaction 35. Start sections inside a post with `##`; the page title comes
from frontmatter.
