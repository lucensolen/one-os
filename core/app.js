/* ============================================================
   ONE OS — NEUTRAL RUNTIME ENGINE
   Header (Local Nav) + Footer (Global Nav)
   Interactive Footer Mode Default
============================================================ */

const LucenOS = {

  /* ---------------------------------------------------------
     SETTINGS
  ---------------------------------------------------------- */
  settings: {
    footerMode: "interactive",   // interactive | reveal | static
    footerHideThreshold: 80,

    showMasterFields: true,
    showSettings: true,
    showModes: true,
    showSupport: true,
    showDonate: true
  },

  /* ---------------------------------------------------------
     STATE
  ---------------------------------------------------------- */
  state: {
    level: "core",
    masterId: null,
    fieldId: null,
    moduleId: null,
    miniId: null
  },

  /* ---------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  init() {
    this.app = document.getElementById("app");

    this.buildHeader();
    this.buildFooter();

    /* IMPORTANT:
       Render BEFORE footer mode init
       so the sentinel survives and footer logic is stable */
    this.render();

    this.createFooterSentinel();
    this.initFooterMode();

    // Routing
    window.addEventListener("hashchange", () => this.applyRouteFromHash());

    if (location.hash && location.hash.length > 1) {
      this.applyRouteFromHash();
    } else {
      this.setState({ level: "core" }, true);
    }
  },

  /* ---------------------------------------------------------
     ROUTING
  ---------------------------------------------------------- */
  encodeRoute(state) {
    const { level, masterId, fieldId, moduleId, miniId } = state;
    if (level === "core") return "#core";
    if (level === "master") return `#master|${masterId}`;
    if (level === "field") return `#field|${masterId}|${fieldId}`;
    if (level === "module") return `#module|${masterId}|${fieldId}|${moduleId}`;
    if (level === "mini") return `#mini|${masterId}|${fieldId}|${moduleId}|${miniId}`;
    return "#core";
  },

  decodeRoute(hash) {
    if (!hash || hash.length <= 1) return { level: "core" };
    const raw = hash.slice(1);
    const p = raw.split("|");
    switch (p[0]) {
      case "core": return { level: "core" };
      case "master": return { level: "master", masterId: p[1] };
      case "field": return { level: "field", masterId: p[1], fieldId: p[2] };
      case "module": return { level: "module", masterId: p[1], fieldId: p[2], moduleId: p[3] };
      case "mini": return { level: "mini", masterId: p[1], fieldId: p[2], moduleId: p[3], miniId: p[4] };
    }
    return { level: "core" };
  },

  applyRouteFromHash() {
    this.setState(this.decodeRoute(location.hash), false);
  },

  setState(newState, push) {
    this.state = { ...this.state, ...newState };

    if (push) {
      const h = this.encodeRoute(this.state);
      if (location.hash !== h) location.hash = h;
    }

    this.render();
    window.scrollTo(0, 0);
  },

  /* ---------------------------------------------------------
     LOCAL NAV (HEADER)
  ---------------------------------------------------------- */
  buildHeader() {
    const shell = document.createElement("div");
    shell.className = "header-shell";

    const h = document.createElement("div");
    h.className = "header";

    const row = document.createElement("div");
    row.className = "header-top-row";

    const back = document.createElement("button");
    back.className = "header-back";
    back.textContent = "Back";
    back.onclick = () => this.navigateUp();

    const block = document.createElement("div");

    const title = document.createElement("div");
    title.className = "header-title";
    title.textContent = "Hub – One OS";

    const sub = document.createElement("div");
    sub.className = "header-sub";
    sub.textContent = "Local Navigation Layer";

    const pos = document.createElement("div");
    pos.className = "header-pos";

    block.appendChild(title);
    block.appendChild(sub);
    block.appendChild(pos);

    row.appendChild(back);
    row.appendChild(block);

    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    h.appendChild(row);
    h.appendChild(toolbar);
    shell.appendChild(h);

    document.body.insertBefore(shell, this.app);

    // Store refs
    this.headerPos = pos;
    this.toolbar = toolbar;
    this.backButton = back;
  },

  updateHeader(ctx) {
    const lvl = this.state.level;
    this.backButton.style.display = lvl === "core" ? "none" : "inline-flex";

    const parts = [];
    if (ctx.master) parts.push(ctx.master.name);
    if (ctx.field) parts.push(ctx.field.name);
    if (ctx.module) parts.push(ctx.module.name);
    if (ctx.mini) parts.push(ctx.mini.name);

    this.headerPos.textContent =
      `${lvl.toUpperCase()} • ${parts.length ? parts.join(" / ") : "Hub"}`;

    this.toolbar.innerHTML = "";

    const W = window.LucenWorld;

    if (lvl === "core") {
      W.masterFields.forEach(m =>
        this.toolbar.appendChild(
          LucenComponents.createToolbarPill(m.name, false, () => this.goMaster(m.id))
        )
      );
      return;
    }

    if (lvl === "master") {
      this.toolbar.appendChild(
        LucenComponents.createToolbarPill("Hub", false, () => this.goCore())
      );
      ctx.master.fields.forEach(f =>
        this.toolbar.appendChild(
          LucenComponents.createToolbarPill(f.name, false, () => this.goField(ctx.master.id, f.id))
        )
      );
      return;
    }

    if (lvl === "field") {
      this.toolbar.appendChild(
        LucenComponents.createToolbarPill(ctx.master.name, false, () => this.goMaster(ctx.master.id))
      );
      ctx.field.modules.forEach(m =>
        this.toolbar.appendChild(
          LucenComponents.createToolbarPill(
            m.name,
            ctx.module && ctx.module.id === m.id,
            () => this.goModule(ctx.master.id, ctx.field.id, m.id)
          )
        )
      );
      return;
    }

    if (lvl === "module" || lvl === "mini") {
      this.toolbar.appendChild(
        LucenComponents.createToolbarPill(ctx.field.name, false, () => this.goField(ctx.master.id, ctx.field.id))
      );
      ctx.field.modules.forEach(m =>
        this.toolbar.appendChild(
          LucenComponents.createToolbarPill(
            m.name,
            ctx.module && ctx.module.id === m.id,
            () => this.goModule(ctx.master.id, ctx.field.id, m.id)
          )
        )
      );
    }
  },

  /* ---------------------------------------------------------
     GLOBAL NAV (FOOTER)
  ---------------------------------------------------------- */
  buildFooter() {
    const shell = document.createElement("div");
    shell.className = "footer-shell";

    const f = document.createElement("div");
    f.className = "footer";

    const title = document.createElement("div");
    title.className = "footer-title";
    title.textContent = "Global Navigation";

    const sub = document.createElement("div");
    sub.className = "footer-sub";
    sub.textContent = "OS-level Controls • Modes • Settings";

    const rows = document.createElement("div");
    rows.className = "footer-rows";

    // Row 1
    const r1 = document.createElement("div");
    r1.className = "footer-row";

    r1.appendChild(this.btn("Hub", () => this.goCore()));
    r1.appendChild(this.btn("Master Fields", () => this.goCore()));

    // Row 2
    const r2 = document.createElement("div");
    r2.className = "footer-row";

    r2.appendChild(this.btn("Settings", () => alert("Settings coming")));
    r2.appendChild(this.btn("Modes", () => alert("Modes coming")));

    // Row 3
    const r3 = document.createElement("div");
    r3.className = "footer-row";

    r3.appendChild(this.btn("Support", () => alert("Support coming")));

    const donate = document.createElement("a");
    donate.href = "https://www.educationalfreedom.uk/donate";
    donate.target = "_blank";
    donate.className = "footer-link footer-donate";
    donate.textContent = "Donate";
    r3.appendChild(donate);

    rows.appendChild(r1);
    rows.appendChild(r2);
    rows.appendChild(r3);

    f.appendChild(title);
    f.appendChild(sub);
    f.appendChild(rows);
    shell.appendChild(f);
    document.body.appendChild(shell);

    this.footerShell = shell;
  },

  btn(label, fn) {
    const b = document.createElement("button");
    b.className = "footer-link";
    b.textContent = label;
    b.onclick = fn;
    return b;
  },

  /* ---------------------------------------------------------
     FOOTER SENTINEL (the key fix)
  ---------------------------------------------------------- */
  createFooterSentinel() {
    if (!this.footerSentinel) {
      const s = document.createElement("div");
      s.id = "footer-trigger";
      s.style.height = "2px";
      s.style.width = "100%";
      document.body.appendChild(s);
      this.footerSentinel = s;
    }
  },

  /* ---------------------------------------------------------
     INTERACTIVE FOOTER MODE
  ---------------------------------------------------------- */
  initFooterMode() {
    const mode = this.settings.footerMode;

    // Reset previous listeners/observers
    if (this.footerObserver) this.footerObserver.disconnect();
    if (this.footerScrollHandler)
      window.removeEventListener("scroll", this.footerScrollHandler);

    this.footerShell.classList.remove("footer-static", "visible");
    this.footerVisible = false;

    /* STATIC MODE */
    if (mode === "static") {
      this.footerShell.classList.add("footer-static", "visible");
      return;
    }

    /* REVEAL + INTERACTIVE */
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            this.footerShell.classList.add("visible");
            this.footerVisible = true;
          } else if (mode === "reveal") {
            this.footerShell.classList.remove("visible");
            this.footerVisible = false;
          }
        });
      },
      { threshold: 0.1 }
    );

    obs.observe(this.footerSentinel);
    this.footerObserver = obs;

    /* INTERACTIVE MODE */
    if (mode === "interactive") {
      let last = window.scrollY;
      const th = this.settings.footerHideThreshold;

      this.footerScrollHandler = () => {
        const now = window.scrollY;
        const delta = now - last;

        // scrolling up hides footer
        if (delta < 0 && this.footerVisible) {
          if ((last - now) >= th) {
            this.footerShell.classList.remove("visible");
            this.footerVisible = false;
          }
        }

        last = now;
      };

      window.addEventListener("scroll", this.footerScrollHandler, { passive:true });
    }
  },

  /* ---------------------------------------------------------
     NAV HELPERS
  ---------------------------------------------------------- */
  navigateUp() {
    const l = this.state.level;

    if (l === "mini") this.goModule(this.state.masterId, this.state.fieldId, this.state.moduleId);
    else if (l === "module") this.goField(this.state.masterId, this.state.fieldId);
    else if (l === "field") this.goMaster(this.state.masterId);
    else if (l === "master") this.goCore();
  },

  goCore()     { this.setState({ level:"core", masterId:null, fieldId:null, moduleId:null, miniId:null }, true); },
  goMaster(m)  { this.setState({ level:"master", masterId:m, fieldId:null, moduleId:null, miniId:null }, true); },
  goField(m,f) { this.setState({ level:"field", masterId:m, fieldId:f, moduleId:null, miniId:null }, true); },
  goModule(m,f,mod) { this.setState({ level:"module", masterId:m, fieldId:f, moduleId:mod, miniId:null }, true); },
  goMini(m,f,mod,mm) { this.setState({ level:"mini", masterId:m, fieldId:f, moduleId:mod, miniId:mm }, true); },

  /* ---------------------------------------------------------
     CONTEXT LOOKUP
  ---------------------------------------------------------- */
  getContext() {
    const W = window.LucenWorld;

    const mf = this.state.masterId ?
      W.masterFields.find(m => m.id === this.state.masterId) : null;

    const ff = mf && this.state.fieldId ?
      mf.fields.find(f => f.id === this.state.fieldId) : null;

    const mo = ff && this.state.moduleId ?
      ff.modules.find(m => m.id === this.state.moduleId) : null;

    const mi = mo && this.state.miniId ?
      mo.minis.find(x => x.id === this.state.miniId) : null;

    return { master:mf, field:ff, module:mo, mini:mi };
  },

  /* ---------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  render() {
    const W = window.LucenWorld;
    const ctx = this.getContext();

    this.updateHeader(ctx);

    this.app.innerHTML = "";
    const view = document.createElement("div");
    view.className = "view";

    const lvl = this.state.level;

    if (lvl === "core") {
      const grid = document.createElement("div");
      grid.className = "grid";

      W.masterFields.forEach(m =>
        grid.appendChild(
          LucenComponents.createCard({
            title: m.name,
            summary: m.short,
            meta: `Fields: ${m.fields.length}`,
            buttonLabel: "Open master field",
            onOpen: () => this.goMaster(m.id)
          })
        )
      );

      view.appendChild(grid);
    }

    if (lvl === "master" && ctx.master) {
      const grid = document.createElement("div");
      grid.className = "grid";

      ctx.master.fields.forEach(f =>
        grid.appendChild(
          LucenComponents.createCard({
            title: f.name,
            summary: f.short,
            meta: `Modules: ${f.modules.length}`,
            buttonLabel: "Open field",
            onOpen: () => this.goField(ctx.master.id, f.id)
          })
        )
      );

      view.appendChild(grid);
    }

    if (lvl === "field" && ctx.field) {
      const grid = document.createElement("div");
      grid.className = "grid";

      ctx.field.modules.forEach(m =>
        grid.appendChild(
          LucenComponents.createCard({
            title: m.name,
            summary: m.short,
            meta: `Mini: ${m.minis.length}`,
            buttonLabel: "Open module",
            onOpen: () => this.goModule(ctx.master.id, ctx.field.id, m.id)
          })
        )
      );

      view.appendChild(grid);
    }

    if (lvl === "module" && ctx.module) {
      const grid = document.createElement("div");
      grid.className = "grid";

      const card = LucenComponents.createCard({
        title: ctx.module.name,
        summary: ctx.module.short,
        meta: `Mini modules: ${ctx.module.minis.length}`,
        buttonLabel: "Back",
        onOpen: () => this.goField(ctx.master.id, ctx.field.id)
      });

      const list = document.createElement("div");
      ctx.module.minis.forEach(mm => {
        const row = document.createElement("div");
        row.textContent = mm.name;
        row.className = "mini-item";
        row.onclick = () =>
          this.goMini(ctx.master.id, ctx.field.id, ctx.module.id, mm.id);
        list.appendChild(row);
      });

      card.appendChild(list);
      grid.appendChild(card);
      view.appendChild(grid);
    }

    if (lvl === "mini" && ctx.mini) {
      const grid = document.createElement("div");
      grid.className = "grid";

      const card = LucenComponents.createCard({
        title: ctx.mini.name,
        summary: ctx.mini.body,
        meta: "",
        buttonLabel: "Back",
        onOpen: () => this.goModule(ctx.master.id, ctx.field.id, ctx.module.id)
      });

      grid.appendChild(card);
      view.appendChild(grid);
    }

    this.app.appendChild(view);
  }
};    
