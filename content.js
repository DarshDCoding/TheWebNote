// INIT
initSmartToggle();

function initSmartToggle() {
  const site = new URL(window.location.href).hostname;

  chrome.runtime.sendMessage(
    { action: "CHECK_SITE", url: site },
    (hasNotes) => {
      if (!hasNotes) return;
      createToggleButton(site);
    }
  );
}


// ─── INJECT SHARED STYLES ────────────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById("webnote-styles")) return;
  const style = document.createElement("style");
  style.id = "webnote-styles";
  style.textContent = `
    @keyframes webnote-pop-in {
      from { transform: scale(0.92) translateY(10px); opacity: 0; }
      to   { transform: scale(1)    translateY(0);    opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}


// ─── OPEN POPUP AS FLOATING IFRAME ───────────────────────────────────────────

function openFloatingPopup() {
  removeNotesUI();
  injectStyles();

  const overlay = document.createElement("div");
  overlay.id = "webnote-overlay";
  Object.assign(overlay.style, {
    position:       "fixed",
    top:            "0",
    left:           "0",
    width:          "100vw",
    height:         "100vh",
    background:     "rgba(0,0,0,0.25)",
    zIndex:         "999997",
    backdropFilter: "blur(2px)",
  });
  overlay.addEventListener("click", () => {
    removeNotesUI();
    document.dispatchEvent(new CustomEvent("webnote-closed"));
  });

  const wrapper = document.createElement("div");
  wrapper.id = "webnote-panel";
  Object.assign(wrapper.style, {
    position:     "fixed",
    bottom:       "76px",
    right:        "20px",
    width:        "370px",
    height:       "580px",
    borderRadius: "12px",
    overflow:     "hidden",
    zIndex:       "999998",
    boxShadow:    "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)",
    animation:    "webnote-pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",
  });

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("index.html");
  Object.assign(iframe.style, {
    width:   "100%",
    height:  "100%",
    border:  "none",
    display: "block",
  });

  wrapper.appendChild(iframe);
  document.body.appendChild(overlay);
  document.body.appendChild(wrapper);
}


// ─── REMOVE NOTES UI ─────────────────────────────────────────────────────────

function removeNotesUI() {
  document.getElementById("webnote-panel")?.remove();
  document.getElementById("webnote-overlay")?.remove();
}


// ─── CREATE TOGGLE BUTTON ─────────────────────────────────────────────────────

function createToggleButton(site) {
  if (document.querySelector("#webnote-toggle")) return;

  injectStyles();

  const priorityConfig = [
    { key: "important", color: "#ef4444" },
    { key: "medium",    color: "#eab308" },
    { key: "normal",    color: "#64748b" },
  ];

  // ── Pill shell ──────────────────────────────────────────────────────────────
  // Starts collapsed (icon only), expands after counts load, shrinks on open
  const pill = document.createElement("div");
  pill.id = "webnote-toggle";
  Object.assign(pill.style, {
    position:     "fixed",
    bottom:       "20px",
    right:        "20px",
    zIndex:       "999999",
    cursor:       "pointer",
    display:      "flex",
    alignItems:   "center",
    gap:          "8px",
    background:   "#ffffff",
    border:       "1.5px solid #e2e8f0",
    borderRadius: "6px",                   // subtle, not a full pill
    padding:      "6px",                   // tight — icon only initially
    boxShadow:    "0 4px 12px rgba(0,0,0,0.15)",
    fontFamily:   "'Segoe UI', sans-serif",
    fontSize:     "12px",
    fontWeight:   "700",
    whiteSpace:   "nowrap",
    overflow:     "hidden",
    maxWidth:     "44px",                  // collapsed to icon width
    // smooth expand / shrink on maxWidth + padding
    transition:   "max-width 0.45s cubic-bezier(0.34,1.2,0.64,1), padding 0.45s ease, box-shadow 0.2s ease",
  });

  pill.addEventListener("mouseenter", () => {
    pill.style.boxShadow = "0 6px 18px rgba(0,0,0,0.22)";
  });
  pill.addEventListener("mouseleave", () => {
    pill.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  });

  // ── Icon ────────────────────────────────────────────────────────────────────
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("assets/icons/icon128.png");
  img.alt = "TheWebNote";
  Object.assign(img.style, {
    width:      "45px",
    height:     "45px",
    borderRadius: "4px",
    objectFit:  "contain",
    flexShrink: "0",
    display:    "block",
  });
  pill.appendChild(img);

  // ── Divider ─────────────────────────────────────────────────────────────────
  const divider = document.createElement("span");
  Object.assign(divider.style, {
    width:      "1px",
    height:     "18px",
    background: "#e2e8f0",
    flexShrink: "0",
    opacity:    "0",
    transition: "opacity 0.2s ease",
  });
  pill.appendChild(divider);

  // ── Counts wrapper ──────────────────────────────────────────────────────────
  const countsEl = document.createElement("span");
  Object.assign(countsEl.style, {
    display:    "flex",
    alignItems: "center",
    gap:        "6px",
    opacity:    "0",
    transition: "opacity 0.2s ease",
    paddingRight: "4px",
  });
  pill.appendChild(countsEl);

  // ── Helpers: expand / collapse ──────────────────────────────────────────────
  function expand() {
    pill.style.maxWidth   = "200px";
    pill.style.padding    = "6px 10px 6px 6px";
    divider.style.opacity = "1";
    countsEl.style.opacity = "1";
  }

  function collapse() {
    pill.style.maxWidth    = "44px";
    pill.style.padding     = "6px";
    divider.style.opacity  = "0";
    countsEl.style.opacity = "0";
  }

  // ── Fetch counts, build count nodes, then expand ────────────────────────────
  chrome.runtime.sendMessage({ action: "GET_NOTES", url: site }, (data) => {
    if (!data) return;

    const entries = priorityConfig
      .map(({ key, color }) => ({ count: (data[key] || []).length, color }))
      .filter(({ count }) => count > 0);

    if (entries.length === 0) return;

    entries.forEach(({ count, color }, i) => {
      const dot = document.createElement("span");
      Object.assign(dot.style, {
        width:        "8px",
        height:       "8px",
        borderRadius: "50%",
        background:   color,
        display:      "inline-block",
        flexShrink:   "0",
      });

      const num = document.createElement("span");
      num.textContent = count;
      num.style.color = color;

      countsEl.appendChild(dot);
      countsEl.appendChild(num);

      if (i < entries.length - 1) {
        const sep = document.createElement("span");
        sep.textContent = "·";
        Object.assign(sep.style, { color: "#cbd5e1", fontSize: "14px" });
        countsEl.appendChild(sep);
      }
    });

    // Slight delay so the pill is visible on screen before expanding
    setTimeout(expand, 400);
  });

  document.body.appendChild(pill);

  // ── Toggle logic ─────────────────────────────────────────────────────────────
  let isOpen = false;

  // When popup closes → re-expand to show counts
  document.addEventListener("webnote-closed", () => {
    isOpen = false;
    setTimeout(expand, 150);   // small delay feels more natural
  });

  pill.addEventListener("click", () => {
    if (isOpen) {
      removeNotesUI();
      isOpen = false;
      setTimeout(expand, 150);
      return;
    }

    collapse();                // shrink before opening
    setTimeout(() => {
      openFloatingPopup();
      isOpen = true;
    }, 300);                   // let collapse finish first
  });
}