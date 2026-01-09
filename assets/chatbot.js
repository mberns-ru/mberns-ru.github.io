const logEl = document.getElementById("chat-log");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");

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

function buildAnswer(query, hits, kb) {
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

async function handleAsk(q) {
  const kb = await KB_PROMISE;
  const hits = retrieveTop(q, kb, 5);
  const answer = buildAnswer(q, hits, kb);
  addMsg("bot", answer);
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = inputEl.value.trim();
  if (!q) return;
  addMsg("user", q);
  inputEl.value = "";
  await handleAsk(q);
});

document.querySelectorAll(".hint").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const q = btn.getAttribute("data-q");
    addMsg("user", q);
    await handleAsk(q);
  });
});

// Welcome message
addMsg(
  "bot",
  "Hi! Ask me about Madeline’s experience. I’ll answer only from the resume/portfolio content."
);
