/* =========================================================
   Quantiva — app.js (template-safe i18n)
   FIX: renders {{...}} placeholders (mustache-like) in HTML
   + keeps support for data-i18n / placeholders
   ========================================================= */

(() => {
  "use strict";

  /* -----------------------------
     Helpers
  ----------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const safeText = (el, v) => el && (el.textContent = String(v ?? ""));
  const safeHTML = (el, v) => el && (el.innerHTML = String(v ?? ""));

  function formatEUR(value, lang) {
    const locale = lang === "de" ? "de-DE" : lang === "ru" ? "ru-RU" : "en-GB";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }).format(Number(value));
    } catch {
      return `€ ${Number(value).toFixed(2)}`;
    }
  }

  function interpolate(str, vars = {}) {
    return String(str).replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] != null ? String(vars[k]) : `{${k}}`
    );
  }

  /* -----------------------------
     i18n dictionary (keys match {{...}} in HTML)
     IMPORTANT: Keep keys identical across languages.
  ----------------------------- */
  const translations = {
    en: {
      nav: {
        features: "Features",
        security: "Security",
        pricing: "Pricing",
        faq: "FAQ",
        signin: "Sign in",
        getstarted: "Get started",
      },
      hero: {
        pill: "Next‑gen AI accounting",
        title1: "Track income and expenses.",
        title2: "Get AI‑powered savings advice.",
        subtitle:
          "Quantiva helps you log transactions, see daily/monthly analytics, and turn spending chaos into a clear plan.",
        cta1: "Create account",
        cta2: "Explore features",
        stat1: { value: "30 sec", label: "to your first report" },
        stat2: { value: "1 click", label: "fast transaction logging" },
        stat3: { value: "AI", label: "personalized recommendations" },
      },
      panel: {
        title: "Overview",
        chip: "December",
        balance: { label: "Balance", hint: "+8.4% over 30 days" },
        spend: { label: "Spending", hint: "-2.1% this week" },
        chart: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri" },
        aitip: {
          badge: "AI tip",
          text: "Try limiting food delivery to once a week — estimated savings ≈ €{v}/month.",
          cta: "Enable AI assistant",
        },
      },
      demo: { student: "Student", freelancer: "Freelancer", family: "Family" },
      ai: { why: "Why?", whyTitle: "Why this suggestion?", whyText:
        "Based on your food & transport spending over the last 30 days and weekly trends. Demo explanation." },
      empty: { title: "No data yet", text: "Add your first transaction to unlock insights." },

      security: {
        title: "Security by design",
        lead:
          "We structure the system so it can scale safely from day one. Today it’s a landing page — next it becomes a full product.",
      },

      lang: { en: "English", de: "Deutsch", ru: "Русский", menuTitle: "Language" },
      toast: { saved: "Saved", lang: "Language changed" },
    },

    de: {
      nav: {
        features: "Funktionen",
        security: "Sicherheit",
        pricing: "Preise",
        faq: "FAQ",
        signin: "Anmelden",
        getstarted: "Starten",
      },
      hero: {
        pill: "Next‑Gen KI‑Buchhaltung",
        title1: "Einnahmen und Ausgaben verfolgen.",
        title2: "KI‑Spar‑Tipps erhalten.",
        subtitle:
          "Quantiva hilft dir, Transaktionen zu erfassen, Tages/Monats‑Analysen zu sehen und Chaos in einen klaren Plan zu verwandeln.",
        cta1: "Konto erstellen",
        cta2: "Funktionen ansehen",
        stat1: { value: "30 Sek.", label: "bis zum ersten Report" },
        stat2: { value: "1 Klick", label: "schnelles Erfassen" },
        stat3: { value: "KI", label: "personalisierte Empfehlungen" },
      },
      panel: {
        title: "Übersicht",
        chip: "Dezember",
        balance: { label: "Kontostand", hint: "+8,4% in 30 Tagen" },
        spend: { label: "Ausgaben", hint: "-2,1% diese Woche" },
        chart: { mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr" },
        aitip: {
          badge: "KI‑Tipp",
          text: "Reduziere Lieferessen auf 1× pro Woche — Ersparnis ≈ €{v}/Monat.",
          cta: "KI‑Assistent aktivieren",
        },
      },
      demo: { student: "Student", freelancer: "Freelancer", family: "Familie" },
      ai: { why: "Warum?", whyTitle: "Warum dieser Vorschlag?", whyText:
        "Basierend auf deinen Ausgaben für Essen & Transport (30 Tage) und Wochen‑Trends. Demo‑Erklärung." },
      empty: { title: "Noch keine Daten", text: "Füge die erste Transaktion hinzu, um Insights zu sehen." },

      security: {
        title: "Security by design",
        lead:
          "Wir strukturieren das System so, dass es sicher skalieren kann. Heute Landing — morgen Vollprodukt.",
      },

      lang: { en: "English", de: "Deutsch", ru: "Русский", menuTitle: "Sprache" },
      toast: { saved: "Gespeichert", lang: "Sprache geändert" },
    },

    ru: {
      nav: {
        features: "Функции",
        security: "Безопасность",
        pricing: "Цены",
        faq: "FAQ",
        signin: "Войти",
        getstarted: "Начать",
      },
      hero: {
        pill: "Новая ИИ‑бухгалтерия",
        title1: "Учитывай доходы и расходы.",
        title2: "Получай ИИ‑советы по экономии.",
        subtitle:
          "Quantiva помогает быстро добавлять транзакции, смотреть аналитику по дням/месяцам и превращать хаос в план.",
        cta1: "Создать аккаунт",
        cta2: "Смотреть функции",
        stat1: { value: "30 сек", label: "до первого отчёта" },
        stat2: { value: "1 клик", label: "быстрый ввод" },
        stat3: { value: "ИИ", label: "персональные рекомендации" },
      },
      panel: {
        title: "Обзор",
        chip: "Декабрь",
        balance: { label: "Баланс", hint: "+8,4% за 30 дней" },
        spend: { label: "Расходы", hint: "-2,1% на этой неделе" },
        chart: { mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт" },
        aitip: {
          badge: "ИИ‑совет",
          text: "Ограничь доставку еды до 1 раза в неделю — экономия ≈ €{v}/мес.",
          cta: "Включить ИИ‑ассистента",
        },
      },
      demo: { student: "Студент", freelancer: "Фрилансер", family: "Семья" },
      ai: { why: "Почему?", whyTitle: "Почему такая рекомендация?", whyText:
        "На основе тренда трат на еду/транспорт за 30 дней и недельных изменений. Демо‑объяснение." },
      empty: { title: "Пока нет данных", text: "Добавь первую транзакцию, чтобы открыть инсайты." },

      security: {
        title: "Безопасность по умолчанию",
        lead:
          "Мы строим структуру так, чтобы продукт безопасно масштабировался. Сегодня это лендинг — завтра полноценный продукт.",
      },

      lang: { en: "English", de: "Deutsch", ru: "Русский", menuTitle: "Язык" },
      toast: { saved: "Сохранено", lang: "Язык изменён" },
    },
  };

  const LANGS = ["en", "de", "ru"];

  const state = {
    lang: "en",
    scenario: "student", // student|freelancer|family
    aiEnabled: true,
    hasData: true,
    loading: true,
  };

  function normalizeLang(x) {
    const v = String(x || "").toLowerCase();
    if (LANGS.includes(v)) return v;
    if (v.startsWith("de")) return "de";
    if (v.startsWith("ru")) return "ru";
    return "en";
  }

  function getPath(obj, path) {
    const parts = String(path).split(".");
    let cur = obj;
    for (const p of parts) {
      if (!cur || typeof cur !== "object") return undefined;
      cur = cur[p];
    }
    return cur;
  }

  function t(path) {
    const dict = translations[state.lang] || translations.en;
    const v = getPath(dict, path);
    if (v != null) return v;
    const fallback = getPath(translations.en, path);
    return fallback != null ? fallback : `{{${path}}}`;
  }

  /* -----------------------------
     Render {{...}} placeholders in text nodes
  ----------------------------- */
  function renderTemplates() {
    const re = /\{\{\s*([^}]+?)\s*\}\}/g;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const s = node.nodeValue;
          if (!s) return NodeFilter.FILTER_REJECT;
          return re.test(s) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      node.nodeValue = node.nodeValue.replace(re, (_, key) => {
        const val = t(key.trim());
        return typeof val === "string" ? val : String(val ?? "");
      });
    });
  }

  /* -----------------------------
     Also support data-i18n attributes (compat)
  ----------------------------- */
  function applyDataI18n() {
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      safeText(el, t(key));
    });
    $$("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      safeHTML(el, t(key));
    });
    $$("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });
  }

  /* -----------------------------
     Scenario demo (numbers + bars)
  ----------------------------- */
  const scenarioData = {
    student: { balance: 1284.2, spending: 642.1, savings: 65, bars: [0.52, 0.34, 0.76, 0.45, 0.62] },
    freelancer: { balance: 3920.55, spending: 1210.4, savings: 110, bars: [0.32, 0.58, 0.41, 0.66, 0.49] },
    family: { balance: 5640.9, spending: 2385.75, savings: 180, bars: [0.61, 0.43, 0.71, 0.54, 0.69] },
  };

  function renderScenario() {
    const data = scenarioData[state.scenario] || scenarioData.student;

    // These IDs/classes are optional — if not found, nothing crashes.
    const bal = $("#kpiBalance");
    const sp = $("#kpiSpending");
    if (bal) safeText(bal, formatEUR(data.balance, state.lang));
    if (sp) safeText(sp, formatEUR(data.spending, state.lang));

    // AI tip text with {v}
    const tipTextEl = $('[data-ai="tip-text"]') || $("#aiTipText");
    if (tipTextEl) safeText(tipTextEl, interpolate(t("panel.aitip.text"), { v: data.savings }));

    // bars
    const fills = $$("[data-bar-fill], .bar__fill");
    if (fills.length) {
      fills.forEach((el, i) => {
        const v = data.bars[i] ?? 0.3;
        el.style.width = `${clamp(v, 0.08, 0.98) * 100}%`;
      });
    }

    // scenario buttons active
    $$(".seg__btn").forEach((btn) => {
      const s = (btn.dataset.scenario || btn.getAttribute("data-scenario") || "").toLowerCase();
      btn.classList.toggle("is-active", s === state.scenario);
      btn.setAttribute("aria-pressed", s === state.scenario ? "true" : "false");
    });
  }

  function initScenarioTabs() {
    const btns = $$(".seg__btn");
    if (!btns.length) return;

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = (btn.dataset.scenario || btn.getAttribute("data-scenario") || "").toLowerCase();
        if (!scenarioData[s]) return;
        state.scenario = s;
        localStorage.setItem("quantiva_scenario", s);
        fakeLoading(() => renderScenario());
      });
    });
  }

  /* -----------------------------
     Fake skeleton loading (panel.is-loading)
  ----------------------------- */
  function fakeLoading(done) {
    const panel = $("#overviewPanel") || $(".panel");
    if (!panel || prefersReducedMotion()) {
      done?.();
      return;
    }
    panel.classList.add("is-loading");
    window.setTimeout(() => {
      panel.classList.remove("is-loading");
      done?.();
    }, 520);
  }

  /* -----------------------------
     Header hide-on-scroll
  ----------------------------- */
  function initHeaderHide() {
    const header = $(".header");
    if (!header) return;

    let lastY = window.scrollY || 0;
    let acc = 0;

    const showAtTop = 40;
    const hideAfter = 80;
    const delta = 10;

    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY || 0;
        const dy = y - lastY;
        lastY = y;

        if (y < showAtTop) {
          header.classList.remove("is-hidden");
          acc = 0;
          return;
        }

        if (Math.abs(dy) < 2) return;
        acc += dy;

        if (acc > delta && y > hideAfter) {
          header.classList.add("is-hidden");
          acc = 0;
        } else if (acc < -delta) {
          header.classList.remove("is-hidden");
          acc = 0;
        }
      },
      { passive: true }
    );
  }

  /* -----------------------------
     Scroll reveal
  ----------------------------- */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    items.forEach((el) => io.observe(el));
  }

  /* -----------------------------
     Tooltip "Why?"
  ----------------------------- */
  function initTooltip() {
    const btn = $("#aiWhyBtn") || $(".ai-why");
    const pop = $("#aiTipPopover") || $(".tip");
    if (!btn || !pop) return;

    // fill popover text if there are slots
    const tt = $(".tip__title", pop);
    const tx = $(".tip__text", pop);
    if (tt) safeText(tt, t("ai.whyTitle"));
    if (tx) safeText(tx, t("ai.whyText"));

    const close = () => pop.classList.remove("is-open");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      pop.classList.toggle("is-open");
    });

    document.addEventListener("click", close);
    window.addEventListener("scroll", close, { passive: true });
  }

  /* -----------------------------
     Language floating menu
  ----------------------------- */
  function initLanguage() {
    const btn = $("#langBtn") || $(".lang-float__btn");
    const menu = $("#langMenu") || $(".lang-float__menu");
    if (!btn || !menu) return;

    const close = () => menu.classList.remove("is-open");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle("is-open");
    });

    $$(".lang-float__item", menu).forEach((item) => {
      item.addEventListener("click", () => {
        const next = normalizeLang(item.dataset.lang || item.getAttribute("data-lang"));
        setLang(next);
        close();
      });
    });

    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  function setLang(next) {
    state.lang = normalizeLang(next);
    document.documentElement.setAttribute("lang", state.lang);
    localStorage.setItem("quantiva_lang", state.lang);

    // Re-render texts
    applyDataI18n();
    renderTemplates();

    // Update dynamic bits
    renderScenario();

    // Update language button label if you have it
    const langChip = $("#langBtn") || $(".lang-float__btn");
    if (langChip) {
      // keep your UI, just set attr for styling if needed
      langChip.setAttribute("data-lang", state.lang);
    }
  }

  /* -----------------------------
     Smooth anchors
  ----------------------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const el = document.getElementById(href.slice(1));
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      });
    });
  }

  /* -----------------------------
     Boot
  ----------------------------- */
  function boot() {
    // load saved state
    state.lang = normalizeLang(localStorage.getItem("quantiva_lang") || navigator.language);
    state.scenario = (localStorage.getItem("quantiva_scenario") || "student").toLowerCase();
    if (!scenarioData[state.scenario]) state.scenario = "student";

    document.documentElement.setAttribute("lang", state.lang);

    // Render texts (both modes)
    applyDataI18n();
    renderTemplates();

    // Init behaviors
    initHeaderHide();
    initReveal();
    initScenarioTabs();
    initTooltip();
    initLanguage();
    initAnchors();

    // Initial scenario render with premium fake loading
    fakeLoading(() => renderScenario());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
