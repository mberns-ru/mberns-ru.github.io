const logEl = document.getElementById("chat-log");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");

/**
 * Set this to your deployed Cloudflare Worker URL.
 * Example:
 *   const CHAT_ENDPOINT = "https://portfolio-chatbot.<your-subdomain>.workers.dev/chat";
 *
 * If left as null, the chatbot will fall back to the local (non-LLM) retrieval-only version.
 */
const CHAT_ENDPOINT = "https://portfolio-chatbot.madeline-berns.workers.dev/chat";
const panelEl = document.querySelector(".chat-panel");
const toggleEl = document.getElementById("chat-toggle");

function setCollapsed(collapsed) {
  if (!panelEl || !toggleEl) return;

  panelEl.classList.toggle("collapsed", collapsed);
  toggleEl.setAttribute("aria-expanded", String(!collapsed));

  try {
    localStorage.setItem("chat_collapsed", collapsed ? "1" : "0");
  } catch (_) {}
}

function initChatCollapse() {
  if (!panelEl || !toggleEl) return;

  // Load saved state
  let collapsed = false;
  try {
    collapsed = localStorage.getItem("chat_collapsed") === "1";
  } catch (_) {}

  setCollapsed(collapsed);

  toggleEl.addEventListener("click", () => {
    const isCollapsed = panelEl.classList.contains("collapsed");
    setCollapsed(!isCollapsed);

    // If expanding, focus input for convenience
    if (isCollapsed && inputEl) {
      setTimeout(() => inputEl.focus(), 0);
    }
  });
}

initChatCollapse();


function addMsg(role, text) {
  const row = document.createElement("div");
  row.className = `msg ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble);
  logEl.appendChild(row);
  logEl.scrollTop = logEl.scrollHeight;
}

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreChunk(query, chunk) {
  const q = normalize(query).split(" ").filter(Boolean);
  const c = normalize(chunk);

  // Simple lexical overlap scoring (transparent + robust on static content)
  let score = 0;
  for (const term of q) {
    if (term.length < 3) continue;
    if (c.includes(term)) score += 1;
  }
  return score;
}

function retrieveTop(query, kb, k = 4) {
  const hits = [];
  for (const section of kb.sections) {
    for (const chunk of section.chunks) {
      const s = scoreChunk(query, chunk);
      if (s > 0) hits.push({ score: s, section: section.title, chunk });
    }
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, k);
}

function buildAnswer(query, hits) {
  if (!hits.length) {
    return (
      "I can’t answer that from Madeline’s resume/portfolio content.\n" +
      "Try asking about: education, skills, Rutgers/GTRI research, Streamlit dashboards, or publications."
    );
  }

  // Compose a grounded response using retrieved chunks only.
  const grouped = new Map();
  for (const h of hits) {
    if (!grouped.has(h.section)) grouped.set(h.section, []);
    grouped.get(h.section).push(h.chunk);
  }

  let out = "Here’s what I found in the resume/portfolio:\n";
  for (const [section, chunks] of grouped.entries()) {
    out += `\n• ${section}:\n`;
    for (const ch of chunks) out += `  - ${ch}\n`;
  }

  out += "\n(Answer is limited to resume/portfolio content.)";
  return out;
}

async function loadKB() {
  const res = await fetch("assets/resume_knowledge.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load knowledge base.");
  return await res.json();
}

let KB_PROMISE = loadKB();

async function askLLM(question) {
  const res = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Chat API error: ${res.status} ${txt}`);
  }

  return await res.json(); // { answer, sources? }
}

async function handleAsk(q) {
  if (CHAT_ENDPOINT) {
    try {
      const data = await askLLM(q);
      let out = (data.answer || "").trim();

      if (Array.isArray(data.sources) && data.sources.length) {
        out += `\n\nSources: ${data.sources.join(", ")}`;
      }

      addMsg("bot", out || "Sorry — I couldn't generate an answer right now.");
      return;
    } catch (e) {
      console.warn(e);
      addMsg(
        "bot",
        "I couldn't reach the LLM right now, so I’m falling back to local resume-only search."
      );
      // fall through
    }
  }

  // Local fallback
  const kb = await KB_PROMISE;
  const hits = retrieveTop(q, kb, 5);
  addMsg("bot", buildAnswer(q, hits));
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = inputEl.value.trim();
  if (!q) return;
  addMsg("user", q);
  inputEl.value = "";
  await handleAsk(q);
});

// Welcome message
addMsg(
  "bot",
  "Hi! Ask me about my experience :)"
);
