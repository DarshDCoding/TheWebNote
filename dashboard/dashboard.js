import { initTheme } from "../utils/toggleDark.js";
import { renderElement }         from "../utils/render.js";
import { addGlobalEventListner } from "../utils/events.js";

const container = document.getElementById("dashboard-container");
document.getElementById("backBtn").addEventListener("click", () => window.close());

// ── All DB operations go through background.js via sendMessage ────────────────

function sendMessage(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

// ── Build one site card ───────────────────────────────────────────────────────

const MAX_VISIBLE = 5;

function buildSiteCard(url, data) {
  const order = ["important", "medium", "normal"];

  // Stamp _url on each note so the global delete handler knows which site
  const allNotes = order.flatMap(p =>
    [...(data[p] || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(note => ({ ...note, _url: url }))
  );

  // ── Card shell ──
  const card = document.createElement("div");
  card.className   = "site-card";
  card.dataset.url = url;

  // ── Header: favicon + link + delete-site ──
  const header = document.createElement("div");
  header.className = "site-card-header";

  const link = document.createElement("a");
  link.className = "site-title-link";
  link.href      = `https://${url}`;
  link.target    = "_blank";
  link.rel       = "noopener noreferrer";

  const favicon = document.createElement("img");
  favicon.className = "site-favicon";
  favicon.src       = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
  favicon.onerror   = () => favicon.style.display = "none";

  const siteName = document.createElement("span");
  siteName.textContent = url;

  link.appendChild(favicon);
  link.appendChild(siteName);

  const delSiteBtn = document.createElement("button");
  delSiteBtn.className = "site-delete-btn";
  delSiteBtn.title     = "Delete all notes for this site";
  delSiteBtn.innerHTML = `<img src="${chrome.runtime.getURL("assets/svgs/deleteCard.svg")}" style="height:50px;width:50px">`;
  delSiteBtn.addEventListener("click", async () => {
    await sendMessage({ action: "DELETE_SITE", url });
    card.classList.add("site-card-fade-out");
    setTimeout(() => { card.remove(); checkEmpty(); }, 260);
  });

  header.appendChild(link);
  header.appendChild(delSiteBtn);
  card.appendChild(header);

  // ── Notes wrap ──
  const notesWrap = document.createElement("div");
  notesWrap.className = "site-notes-wrap";

  // First MAX_VISIBLE — pass "dashboard" context so Edit button is suppressed
  const visibleWrap = document.createElement("div");
  visibleWrap.className = "notes-visible";
  visibleWrap.innerHTML = allNotes
    .slice(0, MAX_VISIBLE)
    .map(note => renderElement(note, "dashboard"))
    .join("");
  notesWrap.appendChild(visibleWrap);

  // Remaining notes in a smooth collapsible
  const hidden = allNotes.slice(MAX_VISIBLE);
  if (hidden.length > 0) {
    const collapser      = document.createElement("div");
    collapser.className  = "notes-collapser";

    const collapserInner = document.createElement("div");
    collapserInner.className = "notes-collapser-inner";
    collapserInner.innerHTML = hidden
      .map(note => renderElement(note, "dashboard"))
      .join("");

    collapser.appendChild(collapserInner);
    notesWrap.appendChild(collapser);

    const toggleBtn = document.createElement("button");
    toggleBtn.className   = "btn-show-all";
    toggleBtn.textContent = `Show all ${allNotes.length} notes ↓`;

    let expanded = false;
    toggleBtn.addEventListener("click", () => {
      expanded = !expanded;
      collapser.classList.toggle("is-expanded", expanded);
      toggleBtn.textContent = expanded
        ? "Show less ↑"
        : `Show all ${allNotes.length} notes ↓`;
      if (!expanded) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    notesWrap.appendChild(toggleBtn);
  }

  card.appendChild(notesWrap);
  return card;
}

// ── Global delete handler — mirrors popup.js pattern ─────────────────────────

function setupDeleteHandler() {
  addGlobalEventListner("click", ".btn-delete", (e) => {
    const btn      = e.target.closest(".btn-delete");
    const noteId   = btn.dataset.id;
    const url      = btn.dataset.url;
    const taskCard = btn.closest(".task-card");
    const siteCard = btn.closest(".site-card");
    const notesWrap = siteCard?.querySelector(".site-notes-wrap");

    // Freeze height, then animate to 0 so cards below slide up
    const cardHeight = taskCard.offsetHeight;
    taskCard.style.height     = cardHeight + "px";
    taskCard.style.overflow   = "hidden";
    taskCard.style.transition =
      "height 0.35s ease, opacity 0.25s ease, margin 0.35s ease, padding 0.35s ease";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        taskCard.style.height        = "0";
        taskCard.style.opacity       = "0";
        taskCard.style.marginTop     = "0";
        taskCard.style.marginBottom  = "0";
        taskCard.style.paddingTop    = "0";
        taskCard.style.paddingBottom = "0";
      });
    });

    setTimeout(() => {
      taskCard.remove();

      sendMessage({ action: "DELETE_NOTE", url, id: noteId }).then((siteData) => {
        const siteEmpty =
          !siteData?.important?.length &&
          !siteData?.medium?.length    &&
          !siteData?.normal?.length;

        if (siteEmpty || !notesWrap?.querySelector(".task-card")) {
          siteCard.classList.add("site-card-fade-out");
          setTimeout(() => { siteCard.remove(); checkEmpty(); }, 260);
        }
      });
    }, 380);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkEmpty() {
  if (!container.querySelector(".site-card")) {
    container.innerHTML =
      `<p class="empty-state">No notes saved yet. Start browsing and add some!</p>`;
  }
}

function renderDashboard(sites) {
  container.innerHTML = "";
  if (!sites.length) {
    container.innerHTML =
      `<p class="empty-state">No notes saved yet. Start browsing and add some!</p>`;
    return;
  }
  sites.forEach(({ url, data }) => container.appendChild(buildSiteCard(url, data)));
}

// ── Init ──────────────────────────────────────────────────────────────────────

initTheme();

(async () => {
  try {
    setupDeleteHandler();
    const sites = await sendMessage({ action: "GET_ALL" });
    renderDashboard(sites);
  } catch (err) {
    console.error("Dashboard error:", err);
    container.innerHTML = `<p class="empty-state">Failed to load notes.</p>`;
  }
})();