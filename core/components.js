/* =====================================================
   ONE OS – COMPONENT LIBRARY
   Cards • Toolbar Pills • UI Primitives
===================================================== */

window.LucenComponents = {

  /* --------------------------------------
     Toolbar Pills
  -------------------------------------- */
  createToolbarPill(label, active, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";

    btn.className = "toolbar-pill" + (active ? " active" : "");
    btn.textContent = label;

    if (onClick) btn.onclick = onClick;

    return btn;
  },

  /* --------------------------------------
     Universal Card Component
     Used for: Master Fields, Fields, Modules
  -------------------------------------- */
  createCard({ title, summary, meta, buttonLabel, onOpen }) {
    const card = document.createElement("div");
    card.className = "card";

    /* --- Title --- */
    const h = document.createElement("div");
    h.className = "card-title";
    h.textContent = title;
    card.appendChild(h);

    /* --- Summary (optional) --- */
    if (summary) {
      const s = document.createElement("div");
      s.className = "card-summary";
      s.textContent = summary;
      card.appendChild(s);
    }

    /* --- Metadata line (optional) --- */
    if (meta) {
      const m = document.createElement("div");
      m.className = "card-meta";
      m.textContent = meta;
      card.appendChild(m);
    }

    /* --- Button (optional) --- */
    if (buttonLabel) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn card-btn";
      btn.textContent = buttonLabel;

      if (onOpen) btn.onclick = onOpen;

      card.appendChild(btn);
    }

    return card;
  }
};
