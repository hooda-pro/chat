/* ============================================================
   Final AI — Stylesheet
   Design tokens + glassmorphism + RTL + dark/light mode
   ============================================================ */

:root {
  /* Light theme */
  --background: #f6f7f9;
  --foreground: #14181d;
  --card: #ffffff;
  --card-foreground: #14181d;
  --muted: #eceef1;
  --muted-foreground: #5c6570;
  --border: #dfe3e8;
  --accent: #0d8a72;
  --accent-hover: #0a705d;
  --accent-foreground: #ffffff;
  --danger: #d64545;
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(20, 24, 29, 0.08);
  --sidebar-bg: #eef0f3;
  --user-bubble: #0d8a72;
  --user-bubble-fg: #ffffff;
  --code-bg: #f0f2f5;
  --shadow: 0 8px 32px rgba(15, 20, 25, 0.08);
  --radius: 0.875rem;
}

html.dark {
  --background: #0b0f14;
  --foreground: #e8ecf1;
  --card: #12181f;
  --card-foreground: #e8ecf1;
  --muted: #1a222b;
  --muted-foreground: #8b98a5;
  --border: #232d38;
  --accent: #17b895;
  --accent-hover: #12a081;
  --accent-foreground: #06231c;
  --danger: #e46a6a;
  --glass-bg: rgba(18, 24, 31, 0.72);
  --glass-border: rgba(232, 236, 241, 0.08);
  --sidebar-bg: #0e131a;
  --user-bubble: #17b895;
  --user-bubble-fg: #06231c;
  --code-bg: #0d1319;
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { background: var(--background); }

body {
  font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;
  background: var(--background);
  color: var(--foreground);
  line-height: 1.6;
  font-size: 15px;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

code, pre, kbd { font-family: 'JetBrains Mono', ui-monospace, monospace; }

.text-balance { text-wrap: balance; }
.text-pretty { text-wrap: pretty; }

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ============ Layout ============ */
.app {
  display: flex;
  height: 100dvh;
  width: 100%;
}

/* ============ Sidebar ============ */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  border-inline-end: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0.875rem;
  transition: transform 0.28s ease;
  z-index: 40;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand { display: flex; align-items: center; gap: 0.625rem; }
.brand-logo { display: flex; border-radius: 0.5rem; overflow: hidden; }
.brand-name { font-weight: 700; font-size: 1.05rem; letter-spacing: -0.01em; }

.sidebar-close { display: none; }

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--accent);
  color: var(--accent-foreground);
  border: none;
  border-radius: 0.625rem;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}
.new-chat-btn:hover { background: var(--accent-hover); }
.new-chat-btn:active { transform: scale(0.98); }

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--muted);
  border: 1px solid transparent;
  border-radius: 0.625rem;
  padding: 0.5rem 0.75rem;
  color: var(--muted-foreground);
  transition: border-color 0.15s ease;
}
.search-box:focus-within { border-color: var(--accent); }
.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.85rem;
  min-width: 0;
}
.search-box input::placeholder { color: var(--muted-foreground); }

.chat-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--foreground);
  border: none;
  background: none;
  font-family: inherit;
  text-align: start;
  width: 100%;
  transition: background 0.12s ease;
  position: relative;
}
.chat-item:hover { background: var(--muted); }
.chat-item.active { background: var(--muted); font-weight: 600; }
.chat-item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.chat-item input.rename-input {
  flex: 1;
  min-width: 0;
  background: var(--card);
  border: 1px solid var(--accent);
  border-radius: 0.375rem;
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.15rem 0.4rem;
  outline: none;
}
.chat-item-actions {
  display: none;
  gap: 0.125rem;
  flex-shrink: 0;
}
.chat-item:hover .chat-item-actions,
.chat-item.active .chat-item-actions { display: flex; }
.chat-item-actions .mini-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border: none;
  background: none;
  color: var(--muted-foreground);
  border-radius: 0.3rem;
  cursor: pointer;
  transition: color 0.12s, background 0.12s;
}
.chat-item-actions .mini-btn:hover { background: var(--border); color: var(--foreground); }
.chat-item-actions .mini-btn.del:hover { color: var(--danger); }

.chat-list-empty {
  color: var(--muted-foreground);
  font-size: 0.8rem;
  text-align: center;
  padding: 1.5rem 0.5rem;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  border-top: 1px solid var(--border);
  padding-top: 0.625rem;
}
.footer-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.7rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.12s ease;
}
.footer-btn:hover { background: var(--muted); }

html.dark .icon-sun { display: none; }
html:not(.dark) .icon-moon { display: none; }

/* ============ Sidebar overlay (mobile) ============ */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 35;
  opacity: 0;
  transition: opacity 0.25s ease;
}

/* ============ Main ============ */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100dvh;
  position: relative;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10;
}
.topbar-title {
  font-size: 0.95rem;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.topbar .icon-btn { display: none; }

.topbar-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
}
.pulse-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* ============ Chat area ============ */
.chat-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
  scroll-behavior: smooth;
  position: relative;
}

.messages {
  max-width: 820px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Welcome */
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.875rem;
  padding: 3.5rem 1rem 2rem;
  animation: fadeUp 0.5s ease;
}
.welcome-logo {
  border-radius: 1rem;
  box-shadow: var(--shadow);
  display: flex;
}
.welcome-title { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em; }
.welcome-sub { color: var(--muted-foreground); font-size: 0.95rem; max-width: 26rem; }

.suggestions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.625rem;
  width: 100%;
  max-width: 34rem;
  margin-top: 1rem;
}
@media (min-width: 560px) {
  .suggestions { grid-template-columns: 1fr 1fr; }
}
.suggestion {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.875rem 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: inherit;
  cursor: pointer;
  text-align: start;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.suggestion:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.suggestion-title { font-weight: 600; font-size: 0.875rem; color: var(--foreground); }
.suggestion-desc { font-size: 0.78rem; color: var(--muted-foreground); }

/* ============ Messages ============ */
.msg {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  animation: fadeUp 0.3s ease;
  max-width: 100%;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.msg.user { align-items: flex-start; }
.msg.assistant { align-items: stretch; }

.msg-bubble {
  position: relative;
  max-width: 85%;
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.msg.user .msg-bubble {
  background: var(--user-bubble);
  color: var(--user-bubble-fg);
  border-end-start-radius: 0.25rem;
}
.msg.assistant .msg-bubble {
  max-width: 100%;
  background: transparent;
  padding: 0;
}

.msg-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted-foreground);
}
.msg-head .avatar {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 0.4rem;
  background: var(--accent);
  color: var(--accent-foreground);
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
}

.msg-files {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
}
.msg-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  background: rgba(0,0,0,0.12);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}
.msg.assistant .msg-file-chip { background: var(--muted); color: var(--muted-foreground); }

.msg-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.msg:hover .msg-actions, .msg:focus-within .msg-actions { opacity: 1; }
.msg-action-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.55rem;
  border: none;
  background: none;
  color: var(--muted-foreground);
  border-radius: 0.4rem;
  font-family: inherit;
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.msg-action-btn:hover { background: var(--muted); color: var(--foreground); }

/* Edit mode */
.msg-edit-area {
  width: 100%;
  max-width: 85%;
}
.msg-edit-area textarea {
  width: 100%;
  background: var(--card);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  resize: vertical;
  min-height: 60px;
  outline: none;
}
.msg-edit-buttons { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

/* Typing indicator */
.typing {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0;
}
.typing span {
  width: 7px; height: 7px;
  background: var(--muted-foreground);
  border-radius: 50%;
  animation: bounce 1.2s ease-in-out infinite;
}
.typing span:nth-child(2) { animation-delay: 0.15s; }
.typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}

.cursor-blink {
  display: inline-block;
  width: 8px; height: 1.05em;
  background: var(--accent);
  vertical-align: text-bottom;
  border-radius: 2px;
  animation: blink 0.9s step-end infinite;
  margin-inline-start: 2px;
}
@keyframes blink { 50% { opacity: 0; } }

/* ============ Markdown content ============ */
.md { line-height: 1.75; }
.md > *:first-child { margin-top: 0; }
.md > *:last-child { margin-bottom: 0; }
.md h1, .md h2, .md h3, .md h4 { margin: 1.25em 0 0.5em; line-height: 1.35; }
.md h1 { font-size: 1.35rem; }
.md h2 { font-size: 1.2rem; }
.md h3 { font-size: 1.05rem; }
.md p { margin: 0.6em 0; }
.md ul, .md ol { margin: 0.6em 0; padding-inline-start: 1.5em; }
.md li { margin: 0.25em 0; }
.md a { color: var(--accent); }
.md blockquote {
  border-inline-start: 3px solid var(--accent);
  padding: 0.25rem 1rem;
  margin: 0.75em 0;
  color: var(--muted-foreground);
  background: var(--muted);
  border-radius: 0.4rem;
}
.md table {
  border-collapse: collapse;
  margin: 0.75em 0;
  width: 100%;
  font-size: 0.85rem;
  display: block;
  overflow-x: auto;
}
.md th, .md td { border: 1px solid var(--border); padding: 0.45rem 0.75rem; text-align: start; }
.md th { background: var(--muted); font-weight: 600; }
.md code:not(pre code) {
  background: var(--code-bg);
  border: 1px solid var(--border);
  padding: 0.1em 0.4em;
  border-radius: 0.3rem;
  font-size: 0.83em;
  direction: ltr;
  unicode-bidi: embed;
}
.md hr { border: none; border-top: 1px solid var(--border); margin: 1.25em 0; }
.md img { max-width: 100%; border-radius: 0.5rem; }

/* Code blocks */
.code-block {
  direction: ltr;
  margin: 0.875em 0;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--code-bg);
}
.code-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.875rem;
  background: var(--muted);
  border-bottom: 1px solid var(--border);
  font-size: 0.72rem;
  color: var(--muted-foreground);
}
.code-block-head .lang { font-family: 'JetBrains Mono', monospace; font-weight: 500; }
.code-block-head .actions { display: flex; gap: 0.25rem; }
.code-block-head button {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border: none;
  background: none;
  color: var(--muted-foreground);
  font-family: inherit;
  font-size: 0.72rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  transition: background 0.12s, color 0.12s;
}
.code-block-head button:hover { background: var(--border); color: var(--foreground); }
.code-block pre {
  margin: 0;
  padding: 0.875rem 1rem;
  overflow-x: auto;
  font-size: 0.82rem;
  line-height: 1.6;
  background: transparent !important;
  scrollbar-width: thin;
}
.code-block pre code { background: transparent !important; padding: 0; }

/* KaTeX */
.katex-display { direction: ltr; overflow-x: auto; padding: 0.25rem 0; }

/* Generated file download card */
.file-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75em 0;
  padding: 0.75rem 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  max-width: 26rem;
}
.file-card .file-icon {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: var(--accent);
  color: var(--accent-foreground);
  border-radius: 0.6rem;
  flex-shrink: 0;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
}
.file-card .file-meta { flex: 1; min-width: 0; }
.file-card .file-name {
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: ltr;
  text-align: end;
}
.file-card .file-size { font-size: 0.72rem; color: var(--muted-foreground); }
.file-card .dl-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--accent);
  color: var(--accent-foreground);
  border: none;
  border-radius: 0.5rem;
  padding: 0.45rem 0.8rem;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.file-card .dl-btn:hover { background: var(--accent-hover); }

/* ============ Scroll to bottom ============ */
.scroll-bottom-btn {
  position: sticky;
  bottom: 1rem;
  margin-inline-start: auto;
  margin-inline-end: 1.5rem;
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--foreground);
  cursor: pointer;
  box-shadow: var(--shadow);
  z-index: 5;
  float: left;
  transition: transform 0.12s;
}
.scroll-bottom-btn:hover { transform: translateY(-2px); }
.scroll-bottom-btn.visible { display: flex; }

/* ============ Composer ============ */
.composer-wrap {
  padding: 0 1.25rem 0.75rem;
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}

.composer {
  border-radius: 1.25rem;
  box-shadow: var(--shadow);
  padding: 0.625rem 0.75rem;
  transition: border-color 0.15s ease;
}
.composer:focus-within { border-color: var(--accent); }

.composer-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.composer textarea {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  resize: none;
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.55;
  max-height: 200px;
  padding: 0.45rem 0.25rem;
  min-width: 0;
  scrollbar-width: thin;
}
.composer textarea::placeholder { color: var(--muted-foreground); }

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  flex-shrink: 0;
  border: none;
  background: none;
  color: var(--muted-foreground);
  border-radius: 0.6rem;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.icon-btn:hover { background: var(--muted); color: var(--foreground); }

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 0.7rem;
  background: var(--accent);
  color: var(--accent-foreground);
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s, transform 0.1s;
}
.send-btn:hover:not(:disabled) { background: var(--accent-hover); }
.send-btn:active:not(:disabled) { transform: scale(0.94); }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.send-btn .icon-stop { display: none; }
.send-btn.streaming .icon-stop { display: block; }
.send-btn.streaming .icon-send { display: none; }
.send-btn.streaming { background: var(--danger); color: #fff; opacity: 1; }

.composer-note {
  text-align: center;
  font-size: 0.7rem;
  color: var(--muted-foreground);
  margin-top: 0.5rem;
}

/* Attachments preview */
.attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.attachments:not(:empty) { padding: 0.25rem 0.25rem 0.625rem; }
.attachment-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  padding: 0.35rem 0.6rem;
  font-size: 0.75rem;
  max-width: 220px;
}
.attachment-chip .att-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: ltr;
}
.attachment-chip .att-status { color: var(--muted-foreground); font-size: 0.68rem; flex-shrink: 0; }
.attachment-chip .att-remove {
  display: flex;
  border: none;
  background: none;
  color: var(--muted-foreground);
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  flex-shrink: 0;
}
.attachment-chip .att-remove:hover { color: var(--danger); }
.attachment-chip img.att-thumb {
  width: 26px; height: 26px;
  object-fit: cover;
  border-radius: 0.35rem;
  flex-shrink: 0;
}

/* Drag & drop overlay */
.drop-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--background) 75%, transparent);
  backdrop-filter: blur(6px);
  z-index: 100;
  align-items: center;
  justify-content: center;
}
.drop-overlay.active { display: flex; }
.drop-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  padding: 3rem 4rem;
  border: 2px dashed var(--accent);
  border-radius: 1.5rem;
  color: var(--accent);
  font-weight: 600;
  background: var(--card);
}

/* ============ Modals ============ */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}
.modal-backdrop[hidden] { display: none; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal {
  width: 100%;
  max-width: 460px;
  border-radius: 1.25rem;
  box-shadow: var(--shadow);
  animation: fadeUp 0.25s ease;
  background: var(--card);
}
.modal-sm { max-width: 380px; }
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.25rem 0.5rem;
}
.modal-header h2 { font-size: 1.05rem; }
.modal-body { padding: 0.875rem 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem 1.25rem;
}

.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.85rem; font-weight: 600; }
.field input {
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  color: var(--foreground);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  padding: 0.6rem 0.8rem;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus { border-color: var(--accent); }
.field-hint { font-size: 0.72rem; color: var(--muted-foreground); line-height: 1.5; }

.primary-btn {
  background: var(--accent);
  color: var(--accent-foreground);
  border: none;
  border-radius: 0.6rem;
  padding: 0.55rem 1.4rem;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.primary-btn:hover { background: var(--accent-hover); }

.ghost-btn {
  background: none;
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  padding: 0.55rem 1.2rem;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}
.ghost-btn:hover { background: var(--muted); }

.danger-btn {
  background: none;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: 0.6rem;
  padding: 0.55rem 1.2rem;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.danger-btn:hover { background: var(--danger); color: #fff; }

.danger-zone { border-top: 1px solid var(--border); padding-top: 1rem; }

.confirm-title { font-size: 1rem; margin-bottom: 0.25rem; }
.confirm-text { font-size: 0.85rem; color: var(--muted-foreground); }

/* ============ Toasts ============ */
.toast-container {
  position: fixed;
  bottom: 1.25rem;
  inset-inline-start: 50%;
  transform: translateX(50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 120;
  pointer-events: none;
}
html[dir="ltr"] .toast-container { transform: translateX(-50%); }
.toast {
  background: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.6rem 1.1rem;
  font-size: 0.82rem;
  box-shadow: var(--shadow);
  animation: fadeUp 0.25s ease;
}
.toast.error { border-color: var(--danger); color: var(--danger); }

/* ============ Responsive ============ */
@media (max-width: 860px) {
  .sidebar {
    position: fixed;
    top: 0; bottom: 0;
    inset-inline-start: 0;
    transform: translateX(100%);
    box-shadow: var(--shadow);
  }
  html[dir="ltr"] .sidebar { transform: translateX(-100%); }
  .app.sidebar-open .sidebar { transform: translateX(0); }
  .app.sidebar-open .sidebar-overlay { display: block; opacity: 1; }
  .sidebar-close { display: flex; }
  .topbar .icon-btn { display: flex; }
  .msg-bubble { max-width: 92%; }
  .messages { padding: 1rem 0.875rem 1.5rem; }
  .composer-wrap { padding: 0 0.75rem 0.6rem; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
