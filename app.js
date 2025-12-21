/* =========================================================
   Quantiva — app.js (full)
   - i18n (EN/DE/RU) for ALL visible text (no hardcoded UI)
   - Header hide-on-scroll (Safari-like)
   - Scroll reveal (IntersectionObserver)
   - Scenario demo (Student/Freelancer/Family)
   - Fake skeleton loading (Overview panel)
   - AI reasoning tooltip ("Why?")
   - Language floating switcher
   - Modals (Sign in / Create account) + toast
   ========================================================= */

(() => {
  "use strict";

  /* -----------------------------
     Helpers
  ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const safeText = (el, val) => {
    if (!el) return;
    el.textContent = String(val ?? "");
  };

  const safeHTML = (el, val) => {
    if (!el) return;
    el.innerHTML = String(val ?? "");
  };

  /* -----------------------------
     i18n dictionary
  ----------------------------- */
  const translations = {
    en: {
      langLabel: "EN",
      langName: "English",

      // Header
      navFeatures: "Features",
      navSecurity: "Security",
      navPricing: "Pricing",
      navFaq: "FAQ",
      signIn: "Sign in",
      getStarted: "Get started",

      // Hero
      pill: "Next-gen AI accounting",
      heroTitleA: "Track income and expenses.",
      heroTitleB: " Get AI-powered savings advice.",
      heroSubtitle:
        "Quantiva helps you log transactions, see daily/monthly analytics, and turn spending chaos into a clear plan.",
      heroCtaPrimary: "Create account",
      heroCtaSecondary: "Explore features",

      stat1Value: "30 sec",
      stat1Label: "to your first report",
      stat2Value: "1 click",
      stat2Label: "fast transaction logging",
      stat3Value: "AI",
      stat3Label: "personalized recommendations",

      // Overview panel
      overview: "Overview",
      monthDecember: "December",
      scenarioStudent: "Student",
      scenarioFreelancer: "Freelancer",
      scenarioFamily: "Family",

      balance: "Balance",
      spending: "Spending",
      over30days: "+8.4% over 30 days",
      thisWeek: "-2.1% this week",

      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",

      aiTip: "AI tip",
      why: "Why?",
      aiTipText:
        "Try limiting food delivery to once a week — estimated savings ≈ €65/month.",
      enableAiAssistant: "Enable AI assistant",
      tipTitle: "Why this suggestion?",
      tipText:
        "Based on your food & transport spending over the last 30 days and recent weekly trends.",

      emptyTitle: "No data yet",
      emptyText: "Add your first transaction to unlock insights.",

      // Features section
      featuresTitle: "Features built for clarity",
      featuresDesc:
        "Fast logging, smart categories, and AI insights that stay understandable.",
      f1Title: "Categories",
      f1Text: "Auto-detect categories and keep your budgeting consistent.",
      f2Title: "Basic reports",
      f2Text: "Daily and monthly summaries with clean trends.",
      f3Title: "AI suggestions",
      f3Text: "Practical tips based on aggregated spending patterns.",

      // Security section + roadmap
      securityTitle: "Security by design",
      securityDesc:
        "We structure the system so it can scale safely from day one. Today it’s a landing page — next it becomes a full product.",
      secBullet1: "Clear separation between public pages and your private app",
      secBullet2: "Session-based auth and protected forms",
      secBullet3: "Ready for database storage and audit logging",

      roadmapTitle: "Product roadmap",
      r1Title: "Landing + Auth",
      r1Text: "Sign up / sign in and basic navigation.",
      r2Title: "Transactions + Analytics",
      r2Text: "Income/expense logging, filters, daily/monthly reports.",
      r3Title: "AI Assistant",
      r3Text: "AI-powered advice using aggregated transaction context.",

      trust1Title: "How AI works",
      trust1b1: "AI uses aggregated totals and category trends (not raw bank credentials).",
      trust1b2: "You can enable/disable AI at any time.",
      trust1b3: "Advice is actionable, not generic.",

      trust2Title: "Privacy first",
      trust2b1: "No bank login required.",
      trust2b2: "Built with secure storage and audit-ready structure.",
      trust2b3: "EU-ready approach (GDPR-aligned by design).",

      trust3Title: "What’s next",
      trust3b1: "Budgets, goals and spending limits.",
      trust3b2: "Exports (CSV/PDF) and reporting.",
      trust3b3: "Smarter AI insights with weekly summaries.",

      // Pricing
      pricingTitle: "Pricing",
      pricingDesc: "Start free. Upgrade when you need more automation.",
      pFreeTag: "Free",
      pFreeTitle: "Starter",
      pFreeValue: "€0",
      pFreePer: "/mo",
      pFreeB1: "Basic reports",
      pFreeB2: "Manual categories",
      pFreeB3: "Limited insights",
      pFreeCta: "Try it",

      pProTag: "Popular",
      pProTitle: "Pro",
      pProValue: "€9",
      pProPer: "/mo",
      pProB1: "Smart categories",
      pProB2: "Goals & limits",
      pProB3: "Exports (CSV/PDF)",
      pProCta: "Start Pro",

      pAiTag: "New",
      pAiTitle: "AI",
      pAiValue: "€19",
      pAiPer: "/mo",
      pAiB1: "Personalized insights",
      pAiB2: "Weekly summaries",
      pAiB3: "Reasoning preview",
      pAiCta: "Enable AI",

      // FAQ
      faqTitle: "FAQ",
      faqDesc: "Quick answers to common questions.",
      q1: "Is this a finished product?",
      a1: "Not yet — it’s a polished demo that shows the product direction clearly.",
      q2: "Can we add a dashboard quickly?",
      a2: "Yes. The UI is ready for an /app prototype or a real backend later.",
      q3: "How will the AI assistant work?",
      a3: "AI uses aggregated context (categories & trends) and explains the “why”.",

      readyTitle: "Ready to begin?",
      readyText: "Create an account and we’ll build the dashboard next.",
      readyCta: "Get started",

      // Footer
      footerRights: "© 2025 Quantiva. All rights reserved.",
      footerMicro:
        "Privacy-first. No bank credentials required. We never store raw transaction descriptions.",

      // Modals
      modalSignInTitle: "Sign in",
      modalSignInHint: "Use any email/password (demo).",
      email: "Email",
      password: "Password",
      submit: "Continue",
      noAccount: "No account?",
      createAccountLink: "Create one",

      modalCreateTitle: "Create account",
      modalCreateHint: "We’ll send nothing — this is a demo.",
      alreadyAccount: "Already have an account?",
      signInLink: "Sign in",

      toastCreated: "Account created (demo).",
      toastSigned: "Signed in (demo).",

      // Language menu
      langMenuTitle: "Language",
      langEn: "English",
      langDe: "Deutsch",
      langRu: "Русский",
    },

    de: {
      langLabel: "DE",
      langName: "Deutsch",

      navFeatures: "Funktionen",
      navSecurity: "Sicherheit",
      navPricing: "Preise",
      navFaq: "FAQ",
      signIn: "Anmelden",
      getStarted: "Starten",

      pill: "Next‑Gen AI‑Buchhaltung",
      heroTitleA: "Einnahmen und Ausgaben tracken.",
      heroTitleB: " AI‑Spar‑Tipps erhalten.",
      heroSubtitle:
        "Quantiva hilft dir, Transaktionen zu erfassen, Tages/Monats‑Analysen zu sehen und Chaos in einen klaren Plan zu verwandeln.",
      heroCtaPrimary: "Konto erstellen",
      heroCtaSecondary: "Funktionen ansehen",

      stat1Value: "30 Sek",
      stat1Label: "bis zum ersten Report",
      stat2Value: "1 Klick",
      stat2Label: "schnelles Erfassen",
      stat3Value: "AI",
      stat3Label: "personalisierte Tipps",

      overview: "Übersicht",
      monthDecember: "Dezember",
      scenarioStudent: "Student",
      scenarioFreelancer: "Freelancer",
      scenarioFamily: "Familie",

      balance: "Kontostand",
      spending: "Ausgaben",
      over30days: "+8,4% in 30 Tagen",
      thisWeek: "-2,1% diese Woche",

      mon: "Mo",
      tue: "Di",
      wed: "Mi",
      thu: "Do",
      fri: "Fr",

      aiTip: "AI‑Tipp",
      why: "Warum?",
      aiTipText:
        "Reduziere Lieferessen auf 1× pro Woche — geschätzte Ersparnis ≈ 65€/Monat.",
      enableAiAssistant: "AI‑Assistent aktivieren",
      tipTitle: "Warum dieser Vorschlag?",
      tipText:
        "Basierend auf Ausgaben für Essen & Transport der letzten 30 Tage und den aktuellen Wochen‑Trends.",

      emptyTitle: "Noch keine Daten",
      emptyText: "Füge die erste Transaktion hinzu, um Insights zu sehen.",

      featuresTitle: "Funktionen für Klarheit",
      featuresDesc:
        "Schnelles Logging, smarte Kategorien und verständliche AI‑Insights.",
      f1Title: "Kategorien",
      f1Text: "Automatische Kategorien und konsistentes Budgeting.",
      f2Title: "Reports",
      f2Text: "Tages‑ und Monats‑Übersichten mit Trends.",
      f3Title: "AI‑Vorschläge",
      f3Text: "Praktische Tipps auf Basis aggregierter Muster.",

      securityTitle: "Security by design",
      securityDesc:
        "Wir strukturieren das System so, dass es von Tag eins an sicher skalieren kann. Heute Landing — morgen Vollprodukt.",
      secBullet1: "Klare Trennung zwischen Public‑Bereich und privater App",
      secBullet2: "Session‑Auth und geschützte Formulare",
      secBullet3: "Bereit für DB‑Speicherung und Audit‑Logging",

      roadmapTitle: "Roadmap",
      r1Title: "Landing + Auth",
      r1Text: "Registrierung / Login und Navigation.",
      r2Title: "Transaktionen + Analytics",
      r2Text: "Einnahmen/Ausgaben, Filter, Tages/Monats‑Reports.",
      r3Title: "AI Assistant",
      r3Text: "AI‑Tipps auf Basis aggregierten Kontexts.",

      trust1Title: "So funktioniert AI",
      trust1b1: "AI nutzt aggregierte Summen & Kategorie‑Trends (keine Bank‑Credentials).",
      trust1b2: "AI kann jederzeit an/aus geschaltet werden.",
      trust1b3: "Tipps sind konkret, nicht generisch.",

      trust2Title: "Privacy first",
      trust2b1: "Kein Bank‑Login nötig.",
      trust2b2: "Sichere Struktur, audit‑ready.",
      trust2b3: "EU‑ready (GDPR‑aligned by design).",

      trust3Title: "Was als Nächstes kommt",
      trust3b1: "Budgets, Ziele und Limits.",
      trust3b2: "Export (CSV/PDF) und Reporting.",
      trust3b3: "Smartere AI‑Insights mit Wochen‑Zusammenfassungen.",

      pricingTitle: "Preise",
      pricingDesc: "Kostenlos starten. Upgraden, wenn du mehr brauchst.",
      pFreeTag: "Gratis",
      pFreeTitle: "Starter",
      pFreeValue: "0€",
      pFreePer: "/Monat",
      pFreeB1: "Basis‑Reports",
      pFreeB2: "Manuelle Kategorien",
      pFreeB3: "Limitierte Insights",
      pFreeCta: "Testen",

      pProTag: "Beliebt",
      pProTitle: "Pro",
      pProValue: "9€",
      pProPer: "/Monat",
      pProB1: "Smarte Kategorien",
      pProB2: "Ziele & Limits",
      pProB3: "Export (CSV/PDF)",
      pProCta: "Pro starten",

      pAiTag: "Neu",
      pAiTitle: "AI",
      pAiValue: "19€",
      pAiPer: "/Monat",
      pAiB1: "Personalisierte Insights",
      pAiB2: "Wochen‑Summary",
      pAiB3: "Reasoning‑Preview",
      pAiCta: "AI aktivieren",

      faqTitle: "FAQ",
      faqDesc: "Kurze Antworten auf häufige Fragen.",
      q1: "Ist das ein fertiges Produkt?",
      a1: "Noch nicht — aber ein polierter Demo‑Stand mit klarer Vision.",
      q2: "Kann man schnell ein Dashboard bauen?",
      a2: "Ja. Das UI ist bereit für einen /app‑Prototyp oder später ein Backend.",
      q3: "Wie funktioniert der AI‑Assistent?",
      a3: "AI nutzt aggregierte Trends und erklärt das „Warum“.",

      readyTitle: "Bereit?",
      readyText: "Erstelle ein Konto — als Nächstes bauen wir das Dashboard.",
      readyCta: "Starten",

      footerRights: "© 2025 Quantiva. Alle Rechte vorbehalten.",
      footerMicro:
        "Privacy‑first. Keine Bank‑Credentials nötig. Wir speichern keine rohen Transaktionsbeschreibungen.",

      modalSignInTitle: "Anmelden",
      modalSignInHint: "Beliebige E‑Mail/Passwort (Demo).",
      email: "E‑Mail",
      password: "Passwort",
      submit: "Weiter",
      noAccount: "Kein Konto?",
      createAccountLink: "Erstellen",

      modalCreateTitle: "Konto erstellen",
      modalCreateHint: "Wir senden nichts — Demo.",
      alreadyAccount: "Schon ein Konto?",
      signInLink: "Anmelden",

      toastCreated: "Konto erstellt (Demo).",
      toastSigned: "Angemeldet (Demo).",

      langMenuTitle: "Sprache",
      langEn: "English",
      langDe: "Deutsch",
      langRu: "Русский",
    },

    ru: {
      langLabel: "RU",
      langName: "Русский",

      navFeatures: "Функции",
      navSecurity: "Безопасность",
      navPricing: "Цены",
      navFaq: "FAQ",
      signIn: "Войти",
      getStarted: "Начать",

      pill: "Новая AI‑бухгалтерия",
      heroTitleA: "Учитывай доходы и расходы.",
      heroTitleB: " Получай AI‑советы по экономии.",
      heroSubtitle:
        "Quantiva помогает быстро добавлять транзакции, смотреть аналитику по дням/месяцам и превращать хаос в план.",
      heroCtaPrimary: "Создать аккаунт",
      heroCtaSecondary: "Смотреть функции",

      stat1Value: "30 сек",
      stat1Label: "до первого отчёта",
      stat2Value: "1 клик",
      stat2Label: "быстрый ввод",
      stat3Value: "AI",
      stat3Label: "персональные рекомендации",

      overview: "Обзор",
      monthDecember: "Декабрь",
      scenarioStudent: "Студент",
      scenarioFreelancer: "Фрилансер",
      scenarioFamily: "Семья",

      balance: "Баланс",
      spending: "Расходы",
      over30days: "+8,4% за 30 дней",
      thisWeek: "-2,1% на этой неделе",

      mon: "Пн",
      tue: "Вт",
      wed: "Ср",
      thu: "Чт",
      fri: "Пт",

      aiTip: "AI‑совет",
      why: "Почему?",
      aiTipText:
        "Попробуй ограничить доставку еды до 1 раза в неделю — экономия ≈ 65€/мес.",
      enableAiAssistant: "Включить AI‑ассистента",
      tipTitle: "Почему именно так?",
      tipText:
        "На основе трат на еду и транспорт за последние 30 дней и текущих недельных трендов.",

      emptyTitle: "Пока нет данных",
      emptyText: "Добавь первую транзакцию, чтобы открыть инсайты.",

      featuresTitle: "Функции для ясности",
      featuresDesc:
        "Быстрый ввод, умные категории и AI‑инсайты без «магии».",
      f1Title: "Категории",
      f1Text: "Подсказки категорий и стабильный учёт бюджета.",
      f2Title: "Отчёты",
      f2Text: "Сводки по дням и месяцам с понятными трендами.",
      f3Title: "AI‑рекомендации",
      f3Text: "Практичные советы на основе агрегированных паттернов.",

      securityTitle: "Безопасность по умолчанию",
      securityDesc:
        "Мы строим структуру так, чтобы продукт безопасно масштабировался. Сегодня это лендинг — завтра полноценный продукт.",
      secBullet1: "Разделение публичной части и приватной app‑зоны",
      secBullet2: "Сессии и защищённые формы",
      secBullet3: "Готово к БД и аудит‑логам",

      roadmapTitle: "Roadmap",
      r1Title: "Лендинг + Auth",
      r1Text: "Регистрация/вход и навигация.",
      r2Title: "Транзакции + Аналитика",
      r2Text: "Ввод, фильтры, отчёты по дням/месяцам.",
      r3Title: "AI‑ассистент",
      r3Text: "Советы на основе агрегированного контекста.",

      trust1Title: "Как работает AI",
      trust1b1: "AI использует агрегированные суммы и тренды категорий (без банковских логинов).",
      trust1b2: "AI можно включать/выключать в любой момент.",
      trust1b3: "Советы конкретные, а не «общие слова».",

      trust2Title: "Privacy first",
      trust2b1: "Подключение банка не требуется.",
      trust2b2: "Безопасная структура и готовность к аудиту.",
      trust2b3: "EU‑ready подход (GDPR‑aligned by design).",

      trust3Title: "Что дальше",
      trust3b1: "Бюджеты, цели и лимиты.",
      trust3b2: "Экспорт (CSV/PDF) и отчётность.",
      trust3b3: "Умные AI‑сводки по неделям.",

      pricingTitle: "Цены",
      pricingDesc: "Начни бесплатно. Обновляйся, когда понадобится больше автоматизации.",
      pFreeTag: "Бесплатно",
      pFreeTitle: "Starter",
      pFreeValue: "0€",
      pFreePer: "/мес",
      pFreeB1: "Базовые отчёты",
      pFreeB2: "Ручные категории",
      pFreeB3: "Ограниченные инсайты",
      pFreeCta: "Попробовать",

      pProTag: "Популярно",
      pProTitle: "Pro",
      pProValue: "9€",
      pProPer: "/мес",
      pProB1: "Умные категории",
      pProB2: "Цели и лимиты",
      pProB3: "Экспорт (CSV/PDF)",
      pProCta: "Start Pro",

      pAiTag: "Новое",
      pAiTitle: "AI",
      pAiValue: "19€",
      pAiPer: "/мес",
      pAiB1: "Персональные инсайты",
      pAiB2: "Еженедельные сводки",
      pAiB3: "Пояснение «почему»",
      pAiCta: "Включить AI",

      faqTitle: "FAQ",
      faqDesc: "Короткие ответы на частые вопросы.",
      q1: "Это готовый продукт?",
      a1: "Пока нет — но это отполированная демо‑версия, показывающая направление продукта.",
      q2: "Можно быстро добавить дашборд?",
      a2: "Да. UI уже готов для /app‑прототипа или реального бэкенда позже.",
      q3: "Как будет работать AI‑ассистент?",
      a3: "AI использует агрегированные тренды и объясняет «почему».",

      readyTitle: "Готов начать?",
      readyText: "Создай аккаунт — дальше соберём дашборд.",
      readyCta: "Начать",

      footerRights: "© 2025 Quantiva. Все права защищены.",
      footerMicro:
        "Privacy‑first. Банковские доступы не нужны. Мы не храним сырые описания транзакций.",

      modalSignInTitle: "Войти",
      modalSignInHint: "Любой email/пароль (демо).",
      email: "Email",
      password: "Пароль",
      submit: "Продолжить",
      noAccount: "Нет аккаунта?",
      createAccountLink: "Создать",

      modalCreateTitle: "Создать аккаунт",
      modalCreateHint: "Мы ничего не отправляем — демо.",
      alreadyAccount: "Уже есть аккаунт?",
      signInLink: "Войти",

      toastCreated: "Аккаунт создан (демо).",
      toastSigned: "Вход выполнен (демо).",

      langMenuTitle: "Язык",
      langEn: "English",
      langDe: "Deutsch",
      langRu: "Русский",
    },
  };

  const LANGS = ["en", "de", "ru"];

  function getInitialLang() {
    const saved = localStorage.getItem("quantiva_lang");
    if (saved && translations[saved]) return saved;

    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (translations[nav]) return nav;

    return "en";
  }

  let state = {
    lang: getInitialLang(),
    scenario: "student", // student|freelancer|family
    aiEnabled: false,
    loading: true,
  };

  function t(key) {
    const dict = translations[state.lang] || translations.en;
    return dict[key] ?? translations.en[key] ?? `{{${key}}}`;
  }

  /* -----------------------------
     i18n apply
  ----------------------------- */
  function applyI18n() {
    // text nodes
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      safeText(el, t(key));
    });

    // html nodes (allow <strong> etc)
    $$("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      safeHTML(el, t(key));
    });

    // placeholders
    $$("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });

    // aria-label
    $$("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      el.setAttribute("aria-label", t(key));
    });

    // lang float label
    const langBtn = $("#langBtn");
    if (langBtn) safeText(langBtn, `${t("langLabel")} · 🌐`);

    // document title (optional)
    if (!document.title || document.title.toLowerCase().includes("quantiva")) {
      document.title = "Quantiva";
    }
  }

  /* -----------------------------
     Header hide-on-scroll
  ----------------------------- */
  function initHeaderHide() {
    const header = $(".header");
    if (!header) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    const threshold = 10; // minimal scroll before reacting
    const showAtTop = 24;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const dy = y - lastY;

      if (Math.abs(dy) < threshold) return;

      // Always show near top
      if (y < showAtTop) {
        header.classList.remove("is-hidden");
        lastY = y;
        return;
      }

      // Scroll down -> hide, scroll up -> show
      if (dy > 0) header.classList.add("is-hidden");
      else header.classList.remove("is-hidden");

      lastY = y;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* -----------------------------
     Mobile nav toggle
  ----------------------------- */
  function initMobileNav() {
    const burger = $("#burgerBtn");
    const mobile = $("#mobileNav");
    if (!burger || !mobile) return;

    const toggle = () => {
      const isOpen = mobile.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
      mobile.style.display = isOpen ? "block" : "none";
    };

    burger.addEventListener("click", toggle);

    // close on link click
    $$(".mobile-nav__link", mobile).forEach((a) =>
      a.addEventListener("click", () => {
        mobile.classList.remove("is-open");
        mobile.style.display = "none";
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* -----------------------------
     Scroll reveal
  ----------------------------- */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (prefersReducedMotion()) {
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
      { threshold: 0.12 }
    );

    items.forEach((el) => io.observe(el));
  }

  /* -----------------------------
     Overview panel demo data
  ----------------------------- */
  const scenarios = {
    student: {
      balance: 1284.2,
      spending: 642.1,
      over30: "+8.4%",
      week: "-2.1%",
      bars: [56, 34, 78, 46, 62],
      tipKey: "aiTipText",
    },
    freelancer: {
      balance: 3920.75,
      spending: 1210.4,
      over30: "+12.1%",
      week: "+1.6%",
      bars: [42, 63, 58, 80, 55],
      tipKey: "aiTipText",
    },
    family: {
      balance: 2450.9,
      spending: 1844.35,
      over30: "+3.9%",
      week: "-0.8%",
      bars: [70, 66, 74, 72, 68],
      tipKey: "aiTipText",
    },
  };

  function formatEUR(value) {
    try {
      return new Intl.NumberFormat(state.lang === "en" ? "en-GB" : state.lang, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }).format(value);
    } catch {
      return `€ ${Number(value).toFixed(2)}`;
    }
  }

  function applyScenario() {
    const data = scenarios[state.scenario] || scenarios.student;

    safeText($("#kpiBalance"), formatEUR(data.balance));
    safeText($("#kpiSpending"), formatEUR(data.spending));

    // those lines are translated base + numbers (keeps your style)
    const over = $("#kpiOver30");
    const week = $("#kpiWeek");

    if (over) {
      // Use translated tail but keep numeric
      // (If you want fully numeric-free strings, we can make separate keys.)
      const base = t("over30days");
      safeText(over, base.replace(/^[+-]?\d+([.,]\d+)?%/, data.over30));
    }
    if (week) {
      const base = t("thisWeek");
      safeText(week, base.replace(/^[+-]?\d+([.,]\d+)?%/, data.week));
    }

    // bars
    const fills = $$(".bar__fill");
    fills.forEach((el, i) => {
      const v = data.bars[i] ?? 50;
      el.style.width = `${clamp(v, 8, 92)}%`;
    });
  }

  function setScenario(next) {
    state.scenario = next;

    // buttons
    $$(".seg__btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.scenario === next);
    });

    applyScenario();
  }

  function initScenarioTabs() {
    const btns = $$(".seg__btn");
    if (!btns.length) return;

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = btn.dataset.scenario;
        if (!s) return;
        setScenario(s);
      });
    });

    setScenario(state.scenario);
  }

  /* -----------------------------
     Skeleton loading
  ----------------------------- */
  function setLoading(isLoading) {
    state.loading = isLoading;
    const panel = $("#overviewPanel");
    if (!panel) return;

    panel.classList.toggle("is-loading", isLoading);
  }

  function fakeBoot() {
    // short premium delay, not annoying
    setLoading(true);
    const delay = prefersReducedMotion() ? 0 : 520;
    window.setTimeout(() => {
      setLoading(false);
      applyScenario();
    }, delay);
  }

  /* -----------------------------
     AI enable + empty state
  ----------------------------- */
  function initAiToggle() {
    const btn = $("#aiEnableBtn");
    const empty = $("#emptyState");
    const tip = $("#aiTipBox");

    if (!btn) return;

    const apply = () => {
      if (empty) empty.classList.toggle("is-on", !state.aiEnabled);
      if (tip) tip.style.opacity = state.aiEnabled ? "1" : "0.55";
      btn.classList.toggle("btn--primary", !state.aiEnabled);
      safeText(btn, state.aiEnabled ? t("enableAiAssistant") : t("enableAiAssistant"));
    };

    btn.addEventListener("click", () => {
      state.aiEnabled = !state.aiEnabled;
      apply();
    });

    apply();
  }

  /* -----------------------------
     Tooltip ("Why?")
  ----------------------------- */
  function initTooltip() {
    const whyBtn = $("#aiWhyBtn");
    const tip = $("#aiTipPopover");
    if (!whyBtn || !tip) return;

    const close = () => tip.classList.remove("is-open");

    whyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tip.classList.toggle("is-open");
    });

    document.addEventListener("click", close);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
  }

  /* -----------------------------
     Language float
  ----------------------------- */
  function initLanguage() {
    const wrap = $("#langFloat");
    const btn = $("#langBtn");
    const menu = $("#langMenu");
    if (!wrap || !btn || !menu) return;

    const open = () => menu.classList.add("is-open");
    const close = () => menu.classList.remove("is-open");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("is-open");
    });

    // menu items
    $$(".lang-float__item", menu).forEach((item) => {
      item.addEventListener("click", () => {
        const next = item.dataset.lang;
        if (!next || !translations[next]) return;
        state.lang = next;
        localStorage.setItem("quantiva_lang", next);
        applyI18n();
        applyScenario();
        close();
      });
    });

    // close on outside click
    document.addEventListener("click", close);

    // escape closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* -----------------------------
     Modals + Toast
  ----------------------------- */
  function initModals() {
    const signInBtn = $("#signInBtn");
    const getStartedBtn = $("#getStartedBtn");
    const openCreateBtns = $$("[data-open-create]");

    const modalSign = $("#modalSignIn");
    const modalCreate = $("#modalCreate");

    const toast = $("#toast");

    const openModal = (m) => {
      if (!m) return;
      m.classList.add("is-open");
      const firstInput = $("input", m);
      if (firstInput) firstInput.focus({ preventScroll: true });
    };

    const closeModal = (m) => {
      if (!m) return;
      m.classList.remove("is-open");
    };

    const showToast = (text) => {
      if (!toast) return;
      safeText(toast, text);
      toast.style.display = "block";
      toast.style.opacity = "1";
      window.setTimeout(() => {
        toast.style.opacity = "0";
        window.setTimeout(() => (toast.style.display = "none"), 200);
      }, 1600);
    };

    // open handlers
    if (signInBtn) signInBtn.addEventListener("click", () => openModal(modalSign));
    if (getStartedBtn) getStartedBtn.addEventListener("click", () => openModal(modalCreate));

    openCreateBtns.forEach((b) =>
      b.addEventListener("click", () => openModal(modalCreate))
    );

    // backdrop + close buttons
    $$(".modal").forEach((m) => {
      const backdrop = $(".modal__backdrop", m);
      const closeBtn = $("[data-modal-close]", m);
      if (backdrop) backdrop.addEventListener("click", () => closeModal(m));
      if (closeBtn) closeBtn.addEventListener("click", () => closeModal(m));
    });

    // switch links
    const toCreate = $("#toCreateLink");
    const toSign = $("#toSignInLink");
    if (toCreate) {
      toCreate.addEventListener("click", () => {
        closeModal(modalSign);
        openModal(modalCreate);
      });
    }
    if (toSign) {
      toSign.addEventListener("click", () => {
        closeModal(modalCreate);
        openModal(modalSign);
      });
    }

    // submit demo
    const signForm = $("#signInForm");
    const createForm = $("#createForm");

    if (signForm) {
      signForm.addEventListener("submit", (e) => {
        e.preventDefault();
        closeModal(modalSign);
        showToast(t("toastSigned"));
      });
    }

    if (createForm) {
      createForm.addEventListener("submit", (e) => {
        e.preventDefault();
        closeModal(modalCreate);
        showToast(t("toastCreated"));
      });
    }

    // escape closes
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeModal(modalSign);
      closeModal(modalCreate);
      const menu = $("#langMenu");
      if (menu) menu.classList.remove("is-open");
      const tip = $("#aiTipPopover");
      if (tip) tip.classList.remove("is-open");
    });
  }

  /* -----------------------------
     Anchor smoothing (optional)
  ----------------------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const el = document.getElementById(id.slice(1));
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      });
    });
  }

  /* -----------------------------
     Boot
  ----------------------------- */
  function boot() {
    // Ensure lang items text in menu always matches translations
    // (You can put data-i18n on menu items too; this is just a safe extra.)
    applyI18n();

    initHeaderHide();
    initMobileNav();
    initReveal();
    initScenarioTabs();
    initTooltip();
    initLanguage();
    initModals();
    initAiToggle();
    initAnchors();

    // Set scenario labels (if you used data-i18n in HTML, this is enough)
    fakeBoot();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
