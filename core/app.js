/* ========================================================
   Lucen OS – Neutral Runtime
======================================================== */

const LucenOS = {

  settings: {
    footerMode: "interactive",   // interactive | reveal | static
    footerHideThreshold: 80,
    theme: "rich-neutral",

    showMasterFields: true,
    showSettings: true,
    showModes: true,
    showSupport: true,
    showDonate: true
  },

  state: {
    level: "core",
    masterId: null,
    fieldId: null,
    moduleId: null,
    miniId: null
  },

  initNeutral() {
    this.app = document.getElementById("app");

    this.buildHeader();
    this.buildFooter();
    this.initFooterMode();

    window.addEventListener("hashchange", () => this.applyRouteFromHash());

    if (location.hash && location.hash.length > 1) {
      this.applyRouteFromHash();
    } else {
      this.setState({ level: "core" }, true);
    }
  },

  /* ROUTING ------------------------------------------------ */

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
    if (!hash || hash.length <= 1)
      return { level: "core" };

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

  /* HEADER ------------------------------------------------ */

  buildHeader() {
    const shell = document.createElement("div");
    shell.className = "header-shell";

    const h = document.createElement("div");
    h.className = "header";

    const topRow = document.createElement("div");
    topRow.className = "header-top-row";

    const back = document.createElement("button");
    back.className = "header-back";
    back.textContent = "Back";
    back.onclick = () => this.navigateUp();

    const block = document.createElement("div");

    const title = document.createElement("div");
    title.className = "header-title";
    title.textContent = "Hub – Clarity Movement";

    const sub = document.createElement("div");
    sub.className = "header-sub";
    sub.textContent = "Local Nav • Universe Navigation";

    const pos = document.createElement("div");
    pos.className = "header-pos";

    block.appendChild(title);
    block.appendChild(sub);
    block.appendChild(pos);

    topRow.appendChild(back);
    topRow.appendChild(block);

    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    h.appendChild(topRow);
    h.appendChild(toolbar);
    shell.appendChild(h);

    document.body.insertBefore(shell, this.app);

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
          LucenComponents.createToolbarPill(m.name, false, () => this.goModule(ctx.master.id, ctx.field.id, m.id))
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
          LucenComponents.createToolbarPill(m.name, false, () => this.goModule(ctx.master.id, ctx.field.id, m.id))
        )
      );
    }
  },

  /* FOOTER ------------------------------------------------ */

  buildFooter() {
    const shell = document.createElement("div");
    shell.className = "footer-shell";

    const f = document.createElement("div");
    f.className = "footer";

    const title = document.createElement("div");
    title.className = "footer-title";
    title.textContent = "Global Nav – Lucen Hub";

    const sub = document.createElement("div");
    sub.className = "footer-sub";
    sub.textContent = "OS navigation • Modes • Settings";

    const rows = document.createElement("div");
    rows.className = "footer-rows";

    const row1 = document.createElement("div");
    row1.className = "footer-row";

    row1.appendChild(this.btn("Hub", () => this.goCore()));
    row1.appendChild(this.btn("Master Fields", () => this.goCore()));

    const row2 = document.createElement("div");
    row2.className = "footer-row";

    row2.appendChild(this.btn("Settings", () => alert("Settings panel coming")));
    row2.appendChild(this.btn("Modes", () => alert("Modes coming")));

    const row3 = document.createElement("div");
    row3.className = "footer-row";

    row3.appendChild(this.btn("Support", () => alert("Support coming")));

    const donate = document.createElement("a");
    donate.href = "https://www.educationalfreedom.uk/donate";
    donate.target = "_blank";
    donate.className = "footer-link footer-donate";
    donate.textContent = "Donate";
    row3.appendChild(donate);

    rows.appendChild(row1);
    rows.appendChild(row2);
    rows.appendChild(row3);

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

  initFooterMode() {
    const mode = this.settings.footerMode;

    if (!this.footerSentinel) {
      const s = document.createElement("div");
      s.id = "lucen-footer-trigger";
      s.style.height = "1px";
      this.app.appendChild(s);
      this.footerSentinel = s;
    }

    /* Reset */
    if (this.footerObserver) this.footerObserver.disconnect();
    if (this.footerScrollHandler)
      window.removeEventListener("scroll", this.footerScrollHandler);

    this.footerShell.classList.remove("footer-static","visible");
    this.footerVisible = false;

    /* Static mode */
    if (mode === "static") {
      this.footerShell.classList.add("footer-static","visible");
      return;
    }

    /* Reveal + Interactive */
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

    if (mode === "interactive") {
      let last = window.scrollY;
      const th = this.settings.footerHideThreshold;

      this.footerScrollHandler = () => {
        const now = window.scrollY;
        const delta = now - last;

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

  /* NAVIGATION HELPERS ------------------------------------- */

  navigateUp() {
    const l = this.state.level;

    if (l === "mini") this.goModule(this.state.masterId,this.state.fieldId,this.state.moduleId);
    else if (l === "module") this.goField(this.state.masterId,this.state.fieldId);
    else if (l === "field") this.goMaster(this.state.masterId);
    else if (l === "master") this.goCore();
  },

  goCore() {
    this.setState({ level:"core",masterId:null,fieldId:null,moduleId:null,miniId:null },true);
  },
  goMaster(id) {
    this.setState({ level:"master",masterId:id,fieldId:null,moduleId:null,miniId:null },true);
  },
  goField(mid,fid) {
    this.setState({ level:"field",masterId:mid,fieldId:fid,moduleId:null,miniId:null },true);
  },
  goModule(mid,fid,mod) {
    this.setState({ level:"module",masterId:mid,fieldId:fid,moduleId:mod,miniId:null },true);
  },
  goMini(mid,fid,mod,mm) {
    this.setState({ level:"mini",masterId:mid,fieldId:fid,moduleId:mod,miniId:mm },true);
  },

  /* CONTEXT LOOKUP ----------------------------------------- */

  getContext() {
    const W = window.LucenWorld;
    const ms = this.state.masterId ? W.masterFields.find(m => m.id === this.state.masterId) : null;
    const fs = ms && this.state.fieldId ? ms.fields.find(f => f.id === this.state.fieldId) : null;
    const mo = fs && this.state.moduleId ? fs.modules.find(m => m.id === this.state.moduleId) : null;
    const mi = mo && this.state.miniId ? mo.minis.find(x => x.id === this.state.miniId) : null;
    return { master:ms, field:fs, module:mo, mini:mi };
  },

  /* RENDER -------------------------------------------------- */

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
            meta: `Mini modules: ${m.minis.length}`,
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
