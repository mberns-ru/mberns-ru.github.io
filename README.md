# mberns-ru.github.io
Portfolio for Madeline Berns (Data Scientist)

## Real LLM Chatbot (Cloudflare Workers AI)

This repo supports **two** chatbot modes:

1) **Local fallback (no API):** `assets/chatbot.js` retrieves from `assets/resume_knowledge.json` and answers with snippets.
2) **Real LLM (recommended):** Deploy the included Cloudflare Worker (`worker.js`) using **Workers AI** (Llama 3.1), then point the front-end at it.

### Deploy the Worker

1. Install Wrangler:
```bash
npm i -g wrangler
```

2. Login:
```bash
wrangler login
```

3. From the project root (where `wrangler.toml` and `worker.js` live):
```bash
wrangler deploy
```

Wrangler will print your Worker URL, e.g.:
`https://portfolio-chatbot.<your-subdomain>.workers.dev`

### Connect your site to the Worker

Open `assets/chatbot.js` and set:

```js
const CHAT_ENDPOINT = "https://portfolio-chatbot.<your-subdomain>.workers.dev/chat";
```

Commit + push to GitHub Pages. The chat widget will now use the LLM, but still **refuses** to answer outside the resume/portfolio context.
