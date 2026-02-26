# Madeline Berns — Portfolio Website

Personal portfolio for **Madeline Berns (Data Scientist)** featuring:

* Research experience
* ML & data science projects
* Publications & presentations
* An AI-powered resume chatbot (grounded strictly in portfolio content)

> Repo: `mberns-ru.github.io` 

---

## 🌐 Live Site

Hosted via **GitHub Pages**
Chatbot powered by **Cloudflare Workers + Workers AI**

---

## 🧠 Features

### 📊 Portfolio Website

* Responsive layout (custom CSS)
* Project cards with screenshots + links
* Experience, education, and publications sections
* Skills bar with key tools (Python, R, PyTorch, Streamlit, etc.)

Main site file:

* `index.html` 
* `assets/style.css` 

---

### 🤖 Resume-Grounded Chatbot

Two versions exist in this repo:

#### 1️⃣ Static (Client-Side) Retrieval Bot

* Simple lexical scoring
* Answers strictly from `resume_knowledge.json`
* No LLM required

Frontend script:

* `assets/chatbot.js` 

Knowledge base:

* `assets/resume_knowledge.json` 

How it works:

* User question → normalized
* Simple keyword overlap scoring
* Top-matching resume chunks returned
* No hallucination possible (fully grounded)

---

#### 2️⃣ Cloudflare Worker + LLM (Production Version)

A more conversational chatbot using:

* Cloudflare Workers
* Workers AI (`@cf/meta/llama-3.1-8b-instruct`)
* Retrieval over resume chunks
* Strict grounding rules (no invented info)

Worker entry file:

* `worker.js` 

Worker configuration:

* `wrangler.toml` 

### 🔒 Grounding Guarantees

The Worker enforces:

* First-person voice ("I", "my")
* Uses **only** resume context
* Refuses unsupported questions
* Suggests better prompts if no match found
* Low temperature (0.35) to reduce hallucination

Knowledge base is fetched from GitHub Pages and cached at the edge.

---

## 🗂 Project Structure

```
.
├── index.html
├── assets/
│   ├── style.css
│   ├── chatbot.js
│   ├── resume_knowledge.json
│   └── projects/
├── worker.js
├── wrangler.toml
└── README.md
```

---

## 🚀 Local Development

### Website (GitHub Pages)

You can run locally with a simple server:

```bash
python -m http.server 8000
```

Then visit:

```
http://localhost:8000
```

---

### Cloudflare Worker

Install Wrangler:

```bash
npm install -g wrangler
```

Login:

```bash
wrangler login
```

Run locally:

```bash
wrangler dev
```

Deploy:

```bash
wrangler deploy
```

The Worker expects:

```
POST /chat
{
  "question": "Your question here"
}
```

---

## 🧩 Knowledge Base Design

`resume_knowledge.json` is structured as:

```json
{
  "owner": "...",
  "policy": {...},
  "sections": [
    {
      "title": "...",
      "chunks": ["...", "..."]
    }
  ]
}
```

Each chunk is:

* Self-contained
* Resume-verifiable
* Safe for LLM grounding

---

## 🎯 Design Goals

* Clean academic aesthetic
* Purple accent theme
* Transparent chatbot logic
* Zero hallucinated resume content
* Fast edge performance

---

## 🛠 Tech Stack

Frontend:

* HTML5
* Custom CSS (no framework)
* Vanilla JavaScript

Backend:

* Cloudflare Workers
* Workers AI
* Edge caching

ML Models Used in Projects:

* XGBoost
* Random Forest
* PCA
* CatBoost
* CNN architectures (ResNet, AlexNet, PCANet)

---

## 👩‍💻 Author

**Madeline Berns**
M.S. Data Science — Rutgers University
B.S. Neuroscience — Georgia Tech

GitHub: [https://github.com/mberns-ru](https://github.com/mberns-ru)
LinkedIn: [https://linkedin.com/in/mpberns](https://linkedin.com/in/mpberns)