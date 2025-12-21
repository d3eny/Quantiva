/* =========================================================
   Quantiva — app.js (FULL + stable moustache i18n)
   Works with index.html that uses {{path.to.key}} placeholders.
   Also supports data-i18n attributes (optional).
   ========================================================= */

(() => {
  "use strict";

  /* -----------------------------
     Helpers
  ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const safeText = (el, v) => el && (el.textContent = String(v ?? ""));
  const safeHTML = (el, v) => el && (el.innerHTML = String(v ?? ""));

  function formatEUR(value, lang) {
    const locale = lang === "de" ? "de-DE" : lang === "ru" ? "ru-RU" : "en-GB";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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

  function deepGet(obj, path) {
    const parts = String(path).split(".");
    let cur = obj;
    for (const p of parts) {
      if (!cur || typeof cur !== "object") return undefined;
      cur = cur[p];
    }
    return cur;
  }

  function normalizeLang(x) {
    const v = String(x || "").toLowerCase();
    if (v === "en" || v.startsWith("en")) return "en";
    if (v === "de" || v.startsWith("de")) return "de";
    if (v === "ru" || v.startsWith("ru")) return "ru";
    return "en";
  }

  /* -----------------------------
     Dictionary (FULL)
     Keys match index.html placeholders like {{features.title}}
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

      ai: {
        why: "Why?",
        whyTitle: "Why this suggestion?",
        whyText:
          "Based on your food & transport spending over the last 30 days and weekly trends. Demo explanation.",
      },

      empty: {
        title: "No data yet",
        text: "Add your first transaction to unlock insights.",
      },

      features: {
        title: "Features built for clarity",
        desc: "Fast logging, smart categories, and AI insights that stay understandable.",
        cards: {
          c1: { title: "Categories", text: "Auto-detect categories and keep budgeting consistent." },
          c2: { title: "Reports", text: "Daily and monthly summaries with clean trends." },
          c3: { title: "AI suggestions", text: "Practical tips based on aggregated patterns." },
        },
      },

      security: {
        title: "Security by design",
        lead:
          "We structure the system so it can scale safely from day one. Today it’s a landing page — next it becomes a full product.",
        bullets: {
          b1: "Clear separation between public pages and your private app",
          b2: "Session-based auth and protected forms",
          b3: "Ready for database storage and audit logging",
        },
      },

      trust: {
        t1: {
          title: "How AI works",
          b1: "AI uses aggregated totals and category trends (not raw bank credentials).",
          b2: "You can enable/disable AI at any time.",
          b3: "Advice is actionable, not generic.",
        },
        t2: {
          title: "Privacy first",
          b1: "No bank login required.",
          b2: "Built with secure storage and audit-ready structure.",
          b3: "EU-ready approach (GDPR-aligned by design).",
        },
        t3: {
          title: "What’s next",
          b1: "Budgets, goals and spending limits.",
          b2: "Exports (CSV/PDF) and reporting.",
          b3: "Smarter AI insights with weekly summaries.",
        },
      },

      roadmap: {
        title: "Product roadmap",
        steps: {
          s1: { title: "Landing + Auth", text: "Sign up / sign in and basic navigation." },
          s2: { title: "Transactions + Analytics", text: "Income/expense logging, filters, daily/monthly reports." },
          s3: { title: "AI Assistant", text: "AI-powered advice, using aggregated transaction context." },
        },
      },

      pricing: {
        title: "Pricing",
        desc: "Start free. Upgrade when you need more automation.",
        free: {
          tag: "Free",
          title: "Starter",
          price: "€0",
          per: "/mo",
          b1: "Basic reports",
          b2: "Manual categories",
          b3: "Limited insights",
          cta: "Try it",
        },
        pro: {
          tag: "Popular",
          title: "Pro",
          price: "€9",
          per: "/mo",
          b1: "Smart categories",
          b2: "Goals & limits",
          b3: "Exports (CSV/PDF)",
          cta: "Start Pro",
        },
        ai: {
          tag: "New",
          title: "AI",
          price: "€19",
          per: "/mo",
          b1: "Personalized insights",
          b2: "Weekly summaries",
          b3: "Reasoning preview",
          cta: "Enable AI",
        },
      },

      faq: {
        title: "FAQ",
        desc: "Quick answers to common questions.",
        q1: "Is this a finished product?",
        a1: "Not yet — it’s a polished demo that shows the product direction clearly.",
        q2: "Can we add a dashboard quickly?",
        a2: "Yes. The UI is ready for an /app prototype or a real backend later.",
        q3: "How will the AI assistant work?",
        a3: "AI uses aggregated context (categories & trends) and explains the “why”.",
      },

      cta: {
        title: "Ready to begin?",
        text: "Create an account and we’ll build the dashboard next.",
        button: "Get started",
      },

      footer: {
        rights: "© 2025 Quantiva. All rights reserved.",
        micro:
          "Privacy-first. No bank credentials required. We never store raw transaction descriptions.",
      },

      modal: {
        signin: { title: "Sign in", hint: "Use any email/password (demo)." },
        signup: { title: "Create account", hint: "We’ll send nothing — this is a demo." },
        email: "Email",
        password: "Password",
        submit: "Continue",
        noAccount: "No account?",
        createLink: "Create one",
        already: "Already have an account?",
        signLink: "Sign in",
      },

      lang: { title: "Language", en: "English", de: "Deutsch", ru: "Русский" },

      toast: {
        created: "Account created (demo).",
        signed: "Signed in (demo).",
        aiOn: "AI enabled (demo).",
        aiOff: "AI disabled (demo).",
      },
    },

    de: {
      nav: { features: "Funktionen", security: "Sicherheit", pricing: "Preise", faq: "FAQ", signin: "Anmelden", getstarted: "Starten" },

      hero: {
        pill: "Next‑Gen KI‑Buchhaltung",
        title1: "Einnahmen und Ausgaben verfolgen.",
        title2: "KI‑Spar‑Tipps erhalten.",
        subtitle:
          "Quantiva hilft dir, Transaktionen schnell zu erfassen, Tages/Monats‑Analysen zu sehen und Chaos in einen klaren Plan zu verwandeln.",
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
        aitip: { badge: "KI‑Tipp", text: "Reduziere Lieferessen auf 1× pro Woche — Ersparnis ≈ €{v}/Monat.", cta: "KI‑Assistent aktivieren" },
      },

      demo: { student: "Student", freelancer: "Freelancer", family: "Familie" },

      ai: { why: "Warum?", whyTitle: "Warum dieser Vorschlag?", whyText: "Basierend auf Essen/Transport‑Ausgaben (30 Tage) und Wochen‑Trends. Demo‑Erklärung." },

      empty: { title: "Noch keine Daten", text: "Füge die erste Transaktion hinzu, um Insights zu sehen." },

      features: {
        title: "Funktionen für Klarheit",
        desc: "Schnelles Logging, smarte Kategorien und verständliche KI‑Insights.",
        cards: {
          c1: { title: "Kategorien", text: "Auto‑Kategorien und konsistentes Budgeting." },
          c2: { title: "Reports", text: "Tages‑/Monats‑Übersichten mit Trends." },
          c3: { title: "KI‑Vorschläge", text: "Praktische Tipps auf Basis aggregierter Muster." },
        },
      },

      security: {
        title: "Security by design",
        lead: "Wir strukturieren das System so, dass es sicher skalieren kann. Heute Landing — morgen Vollprodukt.",
        bullets: { b1: "Klare Trennung zwischen Public‑Bereich und privater App", b2: "Session‑Auth und geschützte Formulare", b3: "Bereit für DB‑Speicherung und Audit‑Logging" },
      },

      trust: {
        t1: { title: "So arbeitet KI", b1: "KI nutzt aggregierte Summen & Trends (keine Bank‑Credentials).", b2: "KI jederzeit an/aus.", b3: "Tipps sind konkret." },
        t2: { title: "Privacy first", b1: "Kein Bank‑Login nötig.", b2: "Audit‑ready Struktur.", b3: "EU‑ready (GDPR‑aligned)." },
        t3: { title: "Was als Nächstes kommt", b1: "Budgets, Ziele und Limits.", b2: "Export (CSV/PDF).", b3: "Wochen‑Summaries." },
      },

      roadmap: {
        title: "Roadmap",
        steps: {
          s1: { title: "Landing + Auth", text: "Registrierung/Anmeldung und Navigation." },
          s2: { title: "Transaktionen + Analysen", text: "Einnahmen/Ausgaben, Filter, Tages/Monats‑Reports." },
          s3: { title: "KI‑Assistent", text: "Tipps auf Basis aggregierten Kontexts." },
        },
      },

      pricing: {
        title: "Preise",
        desc: "Kostenlos starten. Upgraden, wenn du mehr brauchst.",
        free: { tag: "Gratis", title: "Starter", price: "0€", per: "/Monat", b1: "Basis‑Reports", b2: "Manuelle Kategorien", b3: "Limitierte Insights", cta: "Testen" },
        pro:  { tag: "Beliebt", title: "Pro", price: "9€", per: "/Monat", b1: "Smarte Kategorien", b2: "Ziele & Limits", b3: "Export (CSV/PDF)", cta: "Pro starten" },
        ai:   { tag: "Neu", title: "KI", price: "19€", per: "/Monat", b1: "Personalisierte Insights", b2: "Wochen‑Summary", b3: "Reasoning‑Preview", cta: "KI aktivieren" },
      },

      faq: {
        title: "FAQ",
        desc: "Kurze Antworten auf häufige Fragen.",
        q1: "Ist das ein fertiges Produkt?",
        a1: "Noch nicht — aber eine polierte Demo mit klarer Vision.",
        q2: "Schnell ein Dashboard?",
        a2: "Ja. UI ist bereit für /app‑Prototyp oder später Backend.",
        q3: "Wie arbeitet der KI‑Assistent?",
        a3: "KI nutzt Trends und erklärt das „Warum“.",
      },

      cta: { title: "Bereit?", text: "Konto erstellen — als Nächstes bauen wir das Dashboard.", button: "Starten" },

      footer: { rights: "© 2025 Quantiva. Alle Rechte vorbehalten.", micro: "Privacy‑first. Keine Bank‑Credentials nötig. Keine rohen Transaktionsbeschreibungen." },

      modal: {
        signin: { title: "Anmelden", hint: "Beliebige E‑Mail/Passwort (Demo)." },
        signup: { title: "Konto erstellen", hint: "Wir senden nichts — Demo." },
        email: "E‑Mail",
        password: "Passwort",
        submit: "Weiter",
        noAccount: "Kein Konto?",
        createLink: "Erstellen",
        already: "Schon ein Konto?",
        signLink: "Anmelden",
      },

      lang: { title: "Sprache", en: "English", de: "Deutsch", ru: "Русский" },

      toast: { created: "Konto erstellt (Demo).", signed: "Angemeldet (Demo).", aiOn: "KI aktiviert (Demo).", aiOff: "KI deaktiviert (Demo)." },
    },

    ru: {
      nav: { features: "Функции", security: "Безопасность", pricing: "Цены", faq: "FAQ", signin: "Войти", getstarted: "Начать" },

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
        aitip: { badge: "ИИ‑совет", text: "Ограничь доставку еды до 1 раза в неделю — экономия ≈ €{v}/мес.", cta: "Включить ИИ‑ассистента" },
      },

      demo: { student: "Студент", freelancer: "Фрилансер", family: "Семья" },

      ai: { why: "Почему?", whyTitle: "Почему такая рекомендация?", whyText: "На основе тренда трат на еду/транспорт за 30 дней и недельных изменений. Демо‑объяснение." },

      empty: { title: "Пока нет данных", text: "Добавь первую транзакцию, чтобы открыть инсайты." },

      features: {
        title: "Функции для ясности",
        desc: "Быстрый ввод, умные категории и ИИ‑инсайты без «магии».",
        cards: {
          c1: { title: "Категории", text: "Подсказки категорий и стабильный учёт бюджета." },
          c2: { title: "Отчёты", text: "Сводки по дням и месяцам с понятными трендами." },
          c3: { title: "ИИ‑рекомендации", text: "Практичные советы на основе агрегированных паттернов." },
        },
      },

      security: {
        title: "Безопасность по умолчанию",
        lead: "Мы строим структуру так, чтобы продукт безопасно масштабировался. Сегодня это лендинг — завтра полноценный продукт.",
        bullets: { b1: "Разделение публичной части и приватной app‑зоны", b2: "Сессии и защищённые формы", b3: "Готово к БД и аудит‑логам" },
      },

      trust: {
        t1: { title: "Как работает ИИ", b1: "ИИ использует агрегированные суммы и тренды категорий (без банковских логинов).", b2: "ИИ можно включать/выключать в любой момент.", b3: "Советы конкретные, а не «общие слова»." },
        t2: { title: "Privacy first", b1: "Подключение банка не требуется.", b2: "Безопасная структура и готовность к аудиту.", b3: "EU‑ready подход (GDPR‑aligned)." },
        t3: { title: "Что дальше", b1: "Бюджеты, цели и лимиты.", b2: "Экспорт (CSV/PDF) и отчётность.", b3: "Умные ИИ‑сводки по неделям." },
      },

      roadmap: {
        title: "Roadmap",
        steps: {
          s1: { title: "Лендинг + Auth", text: "Регистрация/вход и навигация." },
          s2: { title: "Транзакции + Аналитика", text: "Ввод, фильтры, отчёты по дням/месяцам." },
          s3: { title: "ИИ‑ассистент", text: "Советы на основе агрегированного контекста." },
        },
      },

      pricing: {
        title: "Цены",
        desc: "Начни бесплатно. Обновляйся, когда понадобится больше автоматизации.",
        free: { tag: "Бесплатно", title: "Starter", price: "0€", per: "/мес", b1: "Базовые отчёты", b2: "Ручные категории", b3: "Ограниченные инсайты", cta: "Попробовать" },
        pro:  { tag: "Популярно", title: "Pro", price: "9€", per: "/мес", b1: "Умные категории", b2: "Цели и лимиты", b3: "Экспорт (CSV/PDF)", cta: "Start Pro" },
        ai:   { tag: "Новое", title: "ИИ", price: "19€", per: "/мес", b1: "Персональные инсайты", b2: "Еженедельные сводки", b3: "Пояснение «почему»", cta: "Включить ИИ" },
      },

      faq: {
        title: "FAQ",
        desc: "Короткие ответы на частые вопросы.",
        q1: "Это готовый продукт?",
        a1: "Пока нет — но это отполированная демо‑версия, показывающая направление продукта.",
        q2: "Можно быстро добавить дашборд?",
        a2: "Да. UI уже готов для /app‑прототипа или реального бэкенда позже.",
        q3: "Как будет работать ИИ‑ассистент?",
        a3: "ИИ использует агрегированные тренды и объясняет «почему».",
      },

      cta: { title: "Готов начать?", text: "Создай аккаунт — дальше соберём дашборд.", button: "Начать" },

      footer: { rights: "© 2025 Quantiva. Все права защищены.", micro: "Privacy‑first. Банковские доступы не нужны. Мы не храним сырые описания транзакций." },

      modal: {
        signin: { title: "Войти", hint: "Любой email/пароль (демо)." },
        signup: { title: "Создать аккаунт", hint: "Мы ничего не отправляем — демо." },
        email: "Email",
        password: "Пароль",
        submit: "Продолжить",
        noAccount: "Нет аккаунта?",
        createLink: "Создать",
        already: "Уже есть аккаунт?",
        signLink: "Войти",
      },

      lang: { title: "Язык", en: "English", de: "Deutsch", ru: "Русский" },

      toast: { created: "Аккаунт создан (демо).", signed: "Вход выполнен (демо).", aiOn: "ИИ включён (демо).", aiOff: "ИИ выключен (демо)." },
    },
  };

  /* -----------------------------
     State
  ----------------------------- */
  const state = {
    lang: "en",
    scenario: "student", // student | freelancer | family
    aiEnabled: true,     // demo toggle
  };

  const SCENARIOS = {
    student:   { balance: 1284.2,  spending: 642.1,  savings: 65,  bars: [0.52, 0.34, 0.76, 0.45, 0.62] },
    freelancer:{ balance: 3920.55, spending: 1210.4, savings: 110, bars: [0.32, 0.58, 0.41, 0.66, 0.49] },
    family:    { balance: 5640.9,  spending: 2385.75,savings: 180, bars: [0.61, 0.43, 0.71, 0.54, 0.69] },
  };

  function t(path) {
    const dict = translations[state.lang] || translations.en;
    const v = deepGet(dict, path);
    if (v != null) return v;

    const fb = deepGet(translations.en, path);
    if (fb != null) return fb;

    // leave placeholder if missing (so you see what key is missing)
    return `{{${path}}}`;
  }

  /* -----------------------------
     Stable moustache renderer
     IMPORTANT: never use /g regex in test() (it skips randomly).
  ----------------------------- */
  const MUSTACHE_REPLACE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const MUSTACHE_TEST = /\{\{\s*[^}]+?\s*\}\}/; // no "g"

  function replaceMustacheInString(str) {
    if (!str || typeof str !== "string") return str;
    return str.replace(MUSTACHE_REPLACE, (_, key) => {
      const val = t(key.trim());
      return (typeof val === "string" || typeof val === "number") ? String(val) : String(val ?? "");
    });
  }

  function renderMustacheInTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const s = node.nodeValue;
        if (!s) return NodeFilter.FILTER_REJECT;
        return MUSTACHE_TEST.test(s) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      node.nodeValue = replaceMustacheInString(node.nodeValue);
    });
  }

  function renderMustacheInAttributes() {
    const ATTRS = ["placeholder", "title", "aria-label", "aria-describedby", "value", "alt"];
    $$("*").forEach((el) => {
      for (const a of ATTRS) {
        const v = el.getAttribute(a);
        if (!v || !MUSTACHE_TEST.test(v)) continue;
        el.setAttribute(a, replaceMustacheInString(v));
      }
    });
  }

  function applyDataI18nCompat() {
    $$("[data-i18n]").forEach((el) => safeText(el, t(el.getAttribute("data-i18n"))));
    $$("[data-i18n-html]").forEach((el) => safeHTML(el, t(el.getAttribute("data-i18n-html"))));
    $$("[data-i18n-placeholder]").forEach((el) =>
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")))
    );
  }

  function renderAllTexts() {
    // 1) optional old system
    applyDataI18nCompat();
    // 2) moustache system
    renderMustacheInTextNodes();
    renderMustacheInAttributes();
  }

  /* -----------------------------
     UI: Scenario demo
  ----------------------------- */
  function renderScenario() {
    const d = SCENARIOS[state.scenario] || SCENARIOS.student;

    const bal = $("#kpiBalance");
    const sp = $("#kpiSpending");
    if (bal) safeText(bal, formatEUR(d.balance, state.lang));
    if (sp) safeText(sp, formatEUR(d.spending, state.lang));

    const tipText = $("#aiTipText");
    if (tipText) {
      const base = t("panel.aitip.text");
      safeText(tipText, interpolate(base, { v: d.savings }));
    }

    const fills = $$("[data-bar-fill], .bar__fill");
    fills.forEach((el, i) => {
      const v = d.bars[i] ?? 0.3;
      el.style.width = `${clamp(v, 0.08, 0.98) * 100}%`;
    });

    $$(".seg__btn").forEach((btn) => {
      const s = (btn.dataset.scenario || "").toLowerCase();
      const active = s === state.scenario;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function fakeLoading(done) {
    const panel = $("#overviewPanel");
    if (!panel || prefersReducedMotion()) return done?.();

    panel.classList.add("is-loading");
    setTimeout(() => {
      panel.classList.remove("is-loading");
      done?.();
    }, 520);
  }

  function initScenarioTabs() {
    const btns = $$(".seg__btn");
    if (!btns.length) return;

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = (btn.dataset.scenario || "").toLowerCase();
        if (!SCENARIOS[s]) return;
        state.scenario = s;
        localStorage.setItem("quantiva_scenario", s);
        fakeLoading(() => renderScenario());
      });
    });
  }

  /* -----------------------------
     UI: Tooltip "Why?"
  ----------------------------- */
  function initTooltip() {
    const btn = $("#aiWhyBtn");
    const pop = $("#aiTipPopover");
    if (!btn || !pop) return;

    const close = () => pop.classList.remove("is-open");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      pop.classList.toggle("is-open");
    });

    document.addEventListener("click", close);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
  }

  /* -----------------------------
     UI: Floating language menu
  ----------------------------- */
  function updateLangChip() {
    const chip = $("#langBtn");
    const label = $('[data-lang-label]');
    if (chip) chip.setAttribute("data-lang", state.lang);
    if (label) safeText(label, state.lang.toUpperCase());
  }

  function setLang(next) {
    state.lang = normalizeLang(next);
    localStorage.setItem("quantiva_lang", state.lang);
    document.documentElement.setAttribute("lang", state.lang);

    renderAllTexts();
    updateLangChip();

    // re-render dynamic pieces
    renderScenario();

    // refresh tooltip content if it has text nodes
    // (it is also moustache-rendered, but this keeps it safe even if DOM changes)
    const pop = $("#aiTipPopover");
    if (pop) {
      // nothing required; kept for future extension
    }
  }

  function initLanguage() {
    const btn = $("#langBtn");
    const menu = $("#langMenu");
    if (!btn || !menu) return;

    const close = () => menu.classList.remove("is-open");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle("is-open");
    });

    $$(".lang-float__item", menu).forEach((item) => {
      item.addEventListener("click", () => {
        const next = item.dataset.lang;
        setLang(next);
        close();
      });
    });

    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  /* -----------------------------
     UI: Header hide-on-scroll (Safari-like)
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
     UI: Reveal on scroll
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
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.14 }
    );

    items.forEach((el) => io.observe(el));
  }

  /* -----------------------------
     UI: Smooth anchors
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
     UI: Burger mobile nav (optional)
  ----------------------------- */
  function initBurger() {
    const burger = $("#burger");
    const mobileNav = $(".mobile-nav");
    if (!burger || !mobileNav) return;

    const setOpen = (open) => {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      mobileNav.style.display = open ? "block" : "none";
      mobileNav.classList.toggle("is-open", open);
    };

    let open = false;

    burger.addEventListener("click", () => {
      open = !open;
      setOpen(open);
    });

    $$(".mobile-nav__link", mobileNav).forEach((l) => {
      l.addEventListener("click", () => {
        open = false;
        setOpen(open);
      });
    });

    window.addEventListener("resize", () => {
      // auto-close when leaving mobile
      if (window.innerWidth > 920 && open) {
        open = false;
        setOpen(false);
      }
    });
  }

  /* -----------------------------
     Toast + Modals
  ----------------------------- */
  function toast(msg) {
    const el = $("#toast");
    if (!el || !msg) return;

    el.style.display = "block";
    el.style.opacity = "0";
    safeText(el, msg);

    el.style.transition = "opacity 220ms cubic-bezier(0.22,0.61,0.36,1)";
    requestAnimationFrame(() => (el.style.opacity = "1"));

    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => (el.style.display = "none"), 260);
    }, 1500);
  }

  function initModals() {
    const modals = $$(".modal");
    if (!modals.length) return;

    const getModal = (name) => $(`[data-modal="${name}"]`);
    const open = (m) => {
      if (!m) return;
      m.classList.add("is-open");
      document.body.style.overflow = "hidden";
      const first = $("input, button", m);
      first && first.focus?.({ preventScroll: true });
    };
    const close = (m) => {
      if (!m) return;
      m.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    // openers
    $$("[data-modal-open]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const name = btn.getAttribute("data-modal-open");
        open(getModal(name));
      });
    });

    // close buttons + backdrop
    modals.forEach((m) => {
      const backdrop = $(".modal__backdrop", m);
      const closeBtn = $("[data-modal-close]", m);
      backdrop && backdrop.addEventListener("click", () => close(m));
      closeBtn && closeBtn.addEventListener("click", () => close(m));
    });

    // switch links
    const toCreate = $("#toCreateLink");
    const toSign = $("#toSignInLink");
    toCreate &&
      toCreate.addEventListener("click", (e) => {
        e.preventDefault();
        close(getModal("signin"));
        open(getModal("signup"));
      });
    toSign &&
      toSign.addEventListener("click", (e) => {
        e.preventDefault();
        close(getModal("signup"));
        open(getModal("signin"));
      });

    // forms (demo)
    const signForm = $("#signInForm");
    const createForm = $("#createForm");

    signForm &&
      signForm.addEventListener("submit", (e) => {
        e.preventDefault();
        close(getModal("signin"));
        toast(t("toast.signed"));
      });

    createForm &&
      createForm.addEventListener("submit", (e) => {
        e.preventDefault();
        close(getModal("signup"));
        toast(t("toast.created"));
      });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      close(getModal("signin"));
      close(getModal("signup"));
      const menu = $("#langMenu");
      menu && menu.classList.remove("is-open");
      const tip = $("#aiTipPopover");
      tip && tip.classList.remove("is-open");
    });
  }

  /* -----------------------------
     AI toggle (demo)
  ----------------------------- */
  function initAiToggle() {
    $$('[data-action="toggle-ai"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        state.aiEnabled = !state.aiEnabled;
        toast(state.aiEnabled ? t("toast.aiOn") : t("toast.aiOff"));

        // Optional visual dim if you style it in CSS
        const panel = $("#overviewPanel");
        panel && panel.classList.toggle("ai-off", !state.aiEnabled);
      });
    });
  }

  /* -----------------------------
     Boot
  ----------------------------- */
  function boot() {
    state.lang = normalizeLang(localStorage.getItem("quantiva_lang") || navigator.language);
    state.scenario = (localStorage.getItem("quantiva_scenario") || "student").toLowerCase();
    if (!SCENARIOS[state.scenario]) state.scenario = "student";

    document.documentElement.setAttribute("lang", state.lang);

    // Translate once
    renderAllTexts();
    updateLangChip();

    // Init UI
    initHeaderHide();
    initReveal();
    initAnchors();
    initScenarioTabs();
    initTooltip();
    initLanguage();
    initBurger();
    initModals();
    initAiToggle();

    // First render with premium fake loading
    fakeLoading(() => renderScenario());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
