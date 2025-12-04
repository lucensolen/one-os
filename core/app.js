/* ______________________________
   LUCEN OS – NEUTRAL RUNTIME ENGINE
   Local Nav (header) + Global Nav (footer)
   Footer modes: interactive / reveal / static
________________________________ */

// Global settings – tweak per OS build.
const LucenOS = {
  settings: {
    // "interactive" = drawer: appears when bottom reached, hides after scrolling up
    // "reveal"      = shows while bottom sentinel is in view
    // "static"      = always visible
    footerMode: "interactive",

    // How far you must scroll UP (px) before interactive footer hides
    footerHideThreshold: 80,

    theme: "rich-neutral",

    // Toggle which Global Nav buttons show
    showMasterFields: true,
    showSettings: true,
    showModes: true,
    showSupport: true,
    showDonate: true
  },

  state: {
    level: "core",   // "core" | "master" | "field" | "module" | "mini"
    masterId: null,
    fieldId: null,
    moduleId: null,
    miniId: null
  },

  initNeutral() {
    this.app = document.getElementById("app");

    // Build Local Nav (header) + Global Nav (footer)
    this.buildHeader();
    this.buildFooter();
    this.ensureFooterSentinel();
    this.initFooterMode();

    // Routing: listen to hash changes
    window.addEventListener("hashchange", () => this.applyRouteFromHash());

    // On first load: use hash if present, else Hub (core)
    if (location.hash && location.hash.length > 1) {
      this.applyRouteFromHash();
    } else {
      this.setState(
        { level: "core", masterId: null, fieldId: null, moduleId: null, miniId: null },
        true
      );
    }
  },

  /* ===== ROUTING UTILITIES ===== */

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
    if (!hash || hash.length <= 1) {
      return {
        level: "core",
        masterId: null,
        fieldId: null,
        moduleId: null,
        miniId: null
      };
    }

    const raw = hash.replace(/^#/, "");
    const parts = raw.split("|");
    const kind = parts[0];

    if (kind === "core") {
      return { level: "core", masterId: null, fieldId: null, moduleId: null, miniId: null };
    }

    if (kind === "master" && parts.length >= 2) {
      return { level: "master", masterId: parts[1], fieldId: null, moduleId: null, miniId: null };
    }

    if (kind === "field" && parts.length >= 3) {
      return {
        level: "field",
        masterId: parts[1],
        fieldId: parts[2],
        moduleId: null,
        miniId: null
      };
    }

    if (kind === "module" && parts.length >= 4) {
      return {
        level: "module",
        masterId: parts[1],
        fieldId: parts[2],
        moduleId: parts[3],
        miniId: null
      };
    }

    if (kind === "mini" && parts.length >= 5) {
      return {
        level: "mini",
        masterId: parts[1],
        fieldId: parts[2],
        moduleId: parts[3],
        miniId: parts[4]
      };
    }

    // Fallback
    return {
      level: "core",
      masterId: null,
      fieldId: null,
      moduleId: null,
      miniId: null
    };
  },

  applyRouteFromHash() {
    const parsed = this.decodeRoute(location.hash);
    this.setState(parsed, false); // don't push history again
  },

  setState(newState, pushHistory) {
    this.state = { ...newState };

    if (pushHistory) {
      const targetHash = this.encodeRoute(this.state);
      if (location.hash !== targetHash) {
        location.hash = targetHash;
      }
    }

    this.render();
    window.scrollTo({ top: 0, behavior: "auto" });
  },

  /* ===== LOCAL NAV (HEADER) ===== */

  buildHeader() {
    const shell = document.createElement("div");
    shell.className = "header-shell";

    const header = document.createElement("div");
    header.className = "header";

    // Back + title + breadcrumbs
    const topRow = document.createElement("div");
    topRow.className = "header-top-row";

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "btn header-back";
    backBtn.textContent = "Back";
    backBtn.onclick = () => this.navigateUp();

    const top = document.createElement("div");
    top.className = "header-top";

    const title = document.createElement("div");
    title.className = "header-title";
    title.textContent = "Hub – One OS";

    const sub = document.createElement("div");
    sub.className = "header-sub";
    sub.textContent = "Local Navigation Layer";

    const pos = document.createElement("div");
    pos.className = "header-pos";
    pos.textContent = "CORE • Hub";

    top.appendChild(title);
    top.appendChild(sub);
    top.appendChild(pos);

    topRow.appendChild(backBtn);
    topRow.appendChild(top);

    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    header.appendChild(topRow);
    header.appendChild(toolbar);
    shell.appendChild(header);

    document.body.insertBefore(shell, this.app);

    this.headerShell = shell;
    this.headerPos = pos;
    this.toolbar = toolbar;
    this.backButton = backBtn;
  },

  updateHeader(context) {
    const isCore = this.state.level === "core";

    // Back only when not at Hub
    if (this.backButton) {
      this.backButton.style.display = isCore ? "none" : "inline-flex";
    }

    // Breadcrumb text
    const parts = [];
    if (context.master) parts.push(context.master.name);
    if (context.field) parts.push(context.field.name);
    if (context.module) parts.push(context.module.name);
    if (context.mini) parts.push(context.mini.name);

    const levelLabel = this.state.level.toUpperCase();
    const path = parts.length ? parts.join(" / ") : "Hub";

    if (this.headerPos) {
      this.headerPos.textContent = `${levelLabel} • ${path}`;
    }

    // Toolbar pills (local navigation choices)
    this.toolbar.innerHTML = "";

    const WC = window.LucenWorld;

    if (this.state.level === "core") {
      WC.masterFields.forEach(mf => {
        this.toolbar.appendChild(
          LucenComponents.createToolbarPill(
            mf.name,
            false,
            () => this.goMaster(mf.id)
          )
        );
      });
    } else if (this.state.level === "master") {
      this.toolbar.appendChild(
        LucenComponents.createToolbarPill("Hub", false, () => this.goCore())
      );

      context.master.fields.forEach(f => {
        this.toolbar.appendChild(
          LucenComponents.createToolbarPill(
            f.name,
            context.field && context.field.id === f.id,
            () => this.goField(context.master.id, f.id)
          )
        );
      });
    } else if (this.state.level === "field") {
      this.toolbar.appendChild(
        LucenComponents.createToolbarPill(
          context.master.name,
          false,
          () => this.goMaster(context.master.id)
        )
      );

      context.field.modules.forEach(mod => {
        this.toolbar.appendChild(
          LucenComponents.createToolbarPill(
            mod.name,
            context.module && context.module.id === mod.id,
            () => this.goModule(context.master.id, context.field.id, mod.id)
          )
        );
      });
    } else if (this.state.level === "module" || this.state.level === "mini") {
      this.toolbar.appendChild(
        LucenComponents.createToolbarPill(
          context.field.name,
          false,
          () => this.goField(context.master.id, context.field.id)
        )
      );

      context.field.modules.forEach(mod => {
        this.toolbar.appendChild(
          LucenComponents.createToolbarPill(
            mod.name,
            context.module && context.module.id === mod.id,
            () => this.goModule(context.master.id, context.field.id, mod.id)
          )
        );
      });
    }
  },

  /* ===== GLOBAL NAV (FOOTER / OS BAR) ===== */

  buildFooter() {
    const shell = document.createElement("div");
    shell.className = "footer-shell";

    const footer = document.createElement("div");
    footer.className = "footer";

    const title = document.createElement("div");
    title.className = "footer-title";
    title.textContent = "Global Navigation";

    const sub = document.createElement("div");
    sub.className = "footer-sub";
    sub.textContent = "OS-level controls • Modes • Settings";

    const actions = document.createElement("div");
    actions.className = "footer-actions";

    // Buttons – will render as 2 rows × 3 via CSS grid
    const btnHub = this.createFooterButton("Hub", () => this.goCore());
    actions.appendChild(btnHub);

    if (this.settings.showMasterFields) {
      const btnMasters = this.createFooterButton("Master Fields", () => this.goCore());
      actions.appendChild(btnMasters);
    }

    if (this.settings.showSettings) {
      const btnSettings = this.createFooterButton("Settings", () => {
        alert("Settings panel – to be wired.");
      });
      actions.appendChild(btnSettings);
    }

    if (this.settings.showModes) {
      const btnModes = this.createFooterButton("Modes", () => {
        alert("Modes selector – to be wired.");
      });
      actions.appendChild(btnModes);
    }

    if (this.settings.showSupport) {
      const btnSupport = this.createFooterButton("Support", () => {
        alert("Support / FAQ – to be wired.");
      });
      actions.appendChild(btnSupport);
    }

    if (this.settings.showDonate) {
      const donate = document.createElement("a");
      donate.href = "https://www.educationalfreedom.uk/donate";
      donate.target = "_blank";
      donate.rel = "noopener noreferrer";
      donate.className = "footer-link footer-donate";
      donate.textContent = "Donate";
      actions.appendChild(donate);
    }

    footer.appendChild(title);
    footer.appendChild(sub);
    footer.appendChild(actions);
    shell.appendChild(footer);
    document.body.appendChild(shell);

    this.footerShell = shell;
  },

  createFooterButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "footer-link";
    btn.textContent = label;
    btn.onclick = onClick;
    return btn;
  },

  ensureFooterSentinel() {
    if (this.footerSentinel || !this.footerShell) return;

    const s = document.createElement("div");
    s.id = "lucen-footer-trigger";
    s.style.height = "1px";
    s.style.width = "100%";

    // Place sentinel just before footer, outside #app so re-renders don't delete it
    document.body.insertBefore(s, this.footerShell);
    this.footerSentinel = s;
  },

  initFooterMode() {
    if (!this.footerShell || !this.footerSentinel) return;

    const mode = this.settings.footerMode || "interactive";

    // Clear any existing observer / scroll handler
    if (this.footerObserver) {
      this.footerObserver.disconnect();
      this.footerObserver = null;
    }
    if (this.footerScrollHandler) {
      window.removeEventListener("scroll", this.footerScrollHandler);
      this.footerScrollHandler = null;
    }

    this.footerShell.classList.remove("footer-static", "visible");
    this.footerVisible = false;

    if (mode === "static") {
      // Always visible, OS-style fixed bar
      this.footerShell.classList.add("visible", "footer-static");
      return;
    }

    // Shared IntersectionObserver for "interactive" and "reveal"
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Bottom reached → reveal footer
            this.footerShell.classList.add("visible");
            this.footerVisible = true;
            this.footerLastRevealScrollY = window.scrollY || 0;
          } else {
            if (mode === "reveal") {
              // In reveal mode, hide when sentinel leaves viewport
              this.footerShell.classList.remove("visible");
              this.footerVisible = false;
            }
            // In interactive mode, hide is handled via scroll listener
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.footerSentinel);
    this.footerObserver = observer;
    this.footerModeActive = mode;

    // Interactive mode: hide after scrolling UP by threshold
    if (mode === "interactive") {
      const threshold = this.settings.footerHideThreshold || 80;
      this.footerLastScrollY = window.scrollY || 0;

      this.footerScrollHandler = () => {
        const current = window.scrollY || 0;
        const delta = current - this.footerLastScrollY;

        // Scrolling up
        if (delta < 0 && this.footerVisible) {
          const travelUp = this.footerLastScrollY - current;
          if (travelUp >= threshold) {
            this.footerShell.classList.remove("visible");
            this.footerVisible = false;
          }
        }

        this.footerLastScrollY = current;
      };

      window.addEventListener("scroll", this.footerScrollHandler, { passive: true });
    }
  },

  /* ===== NAV HELPERS (ALL ROUTES GO THROUGH setState) ===== */

  navigateUp() {
    const { level, masterId, fieldId, moduleId } = this.state;

    if (level === "mini") {
      this.setState(
        { level: "module", masterId, fieldId, moduleId, miniId: null },
        true
      );
    } else if (level === "module") {
      this.setState(
        { level: "field", masterId, fieldId, moduleId: null, miniId: null },
        true
      );
    } else if (level === "field") {
      this.setState(
        { level: "master", masterId, fieldId: null, moduleId: null, miniId: null },
        true
      );
    } else if (level === "master") {
      this.setState(
        { level: "core", masterId: null, fieldId: null, moduleId: null, miniId: null },
        true
      );
    } else {
      // Already at Hub
    }
  },

  goCore() {
    this.setState(
      { level: "core", masterId: null, fieldId: null, moduleId: null, miniId: null },
      true
    );
  },

  goMaster(masterId) {
    this.setState(
      { level: "master", masterId, fieldId: null, moduleId: null, miniId: null },
      true
    );
  },

  goField(masterId, fieldId) {
    this.setState(
      { level: "field", masterId, fieldId, moduleId: null, miniId: null },
      true
    );
  },

  goModule(masterId, fieldId, moduleId) {
    this.setState(
      { level: "module", masterId, fieldId, moduleId, miniId: null },
      true
    );
  },

  goMini(masterId, fieldId, moduleId, miniId) {
    this.setState(
      { level: "mini", masterId, fieldId, moduleId, miniId },
      true
    );
  },

  /* ===== WORLD LOOKUPS ===== */

  getContext() {
    const W = window.LucenWorld;
    let master = null,
      field = null,
      module = null,
      mini = null;

    if (this.state.masterId) {
      master = W.masterFields.find(m => m.id === this.state.masterId) || null;
    }
    if (master && this.state.fieldId) {
      field = master.fields.find(f => f.id === this.state.fieldId) || null;
    }
    if (field && this.state.moduleId) {
      module = field.modules.find(m => m.id === this.state.moduleId) || null;
    }
    if (module && this.state.miniId) {
      mini = module.minis.find(mm => mm.id === this.state.miniId) || null;
    }

    return { master, field, module, mini };
  },

  /* ===== RENDER ===== */

  render() {
    const W = window.LucenWorld;
    const ctx = this.getContext();

    // Update Local Nav (header)
    this.updateHeader(ctx);

    // Clear main area
    this.app.innerHTML = "";

    const view = document.createElement("div");
    view.className = "view active";

    if (this.state.level === "core") {
      const grid = document.createElement("div");
      grid.className = "grid";

      W.masterFields.forEach(mf => {
        const card = LucenComponents.createCard({
          title: mf.name,
          summary: mf.short,
          meta: `Fields: ${mf.fields.length}`,
          buttonLabel: "Open master field",
          onOpen: () => this.goMaster(mf.id)
        });
        grid.appendChild(card);
      });

      view.appendChild(grid);
    } else if (this.state.level === "master" && ctx.master) {
      const grid = document.createElement("div");
      grid.className = "grid";

      ctx.master.fields.forEach(f => {
        const card = LucenComponents.createCard({
          title: f.name,
          summary: f.short,
          meta: `Modules: ${f.modules.length}`,
          buttonLabel: "Open field",
          onOpen: () => this.goField(ctx.master.id, f.id)
        });
        grid.appendChild(card);
      });

      view.appendChild(grid);
    } else if (this.state.level === "field" && ctx.master && ctx.field) {
      const grid = document.createElement("div");
      grid.className = "grid";

      ctx.field.modules.forEach(mod => {
        const card = LucenComponents.createCard({
          title: mod.name,
          summary: mod.short,
          meta: `Mini modules: ${mod.minis.length}`,
          buttonLabel: "Open module",
          onOpen: () =>
            this.goModule(ctx.master.id, ctx.field.id, mod.id)
        });
        grid.appendChild(card);
      });

      view.appendChild(grid);
    } else if (this.state.level === "module" && ctx.master && ctx.field && ctx.module) {
      const grid = document.createElement("div");
      grid.className = "grid";

      const card = LucenComponents.createCard({
        title: ctx.module.name,
        summary: ctx.module.short,
        meta: `Mini modules: ${ctx.module.minis.length}`,
        buttonLabel: "Back to field",
        onOpen: () => this.goField(ctx.master.id, ctx.field.id)
      });

      const miniList = document.createElement("div");
      miniList.className = "mini-list";

      ctx.module.minis.forEach(mm => {
        const row = document.createElement("div");
        row.className = "mini-item";

        const left = document.createElement("div");
        left.className = "mini-name";
        left.textContent = mm.name;

        const right = document.createElement("div");
        right.className = "mini-body";
        right.textContent = mm.body;

        row.appendChild(left);
        row.appendChild(right);

        row.onclick = () =>
          this.goMini(ctx.master.id, ctx.field.id, ctx.module.id, mm.id);

        miniList.appendChild(row);
      });

      card.appendChild(miniList);
      grid.appendChild(card);
      view.appendChild(grid);
    } else if (this.state.level === "mini" && ctx.mini && ctx.module && ctx.field && ctx.master) {
      const grid = document.createElement("div");
      grid.className = "grid";

      const card = LucenComponents.createCard({
        title: ctx.mini.name,
        summary: ctx.module.name,
        meta: `${ctx.master.name} • ${ctx.field.name}`,
        buttonLabel: "Back to module",
        onOpen: () => this.goModule(ctx.master.id, ctx.field.id, ctx.module.id)
      });

      const body = document.createElement("div");
      body.className = "mini-body-detail";
      body.textContent = ctx.mini.body;

      card.appendChild(body);
      grid.appendChild(card);
      view.appendChild(grid);
    }

    this.app.appendChild(view);
  }
};
