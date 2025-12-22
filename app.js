/* =========================================================
   Quantiva — app.js (FULL, aligned with index.html you got)
   Features:
   - i18n via data-i18n + floating language menu (EN/RU/DE)
   - Scenario switcher (Student/Freelancer/Family) updates KPIs + chart + AI tip
   - Fake skeleton loading on first paint + when switching scenario
   - Hide header on scroll (Safari-like)
   - Mobile burger menu
   - Modals (Sign in / Get started) + switch between them
   - AI tip tooltip ("Why?") + AI on/off (shows empty state)
   - Scroll-reveal (IntersectionObserver)
   - Toast notifications
   ========================================================= */

(() => {
  "use strict";

  // -----------------------------
  // Helpers
  // -----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function formatEUR(amount, locale) {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount);
    } catch {
      // fallback
      return `€${amount.toFixed(2)}`;
    }
  }

  // -----------------------------
  // i18n dictionary (KEEP FULL)
  // -----------------------------
  const I18N = {
    en: {
      "brand.name": "Quantiva",

      "nav.features": "Features",
      "nav.security": "Security",
      "nav.pricing": "Pricing",
      "nav.faq": "FAQ",

      "cta.signIn": "Sign in",
      "cta.getStarted": "Get started",

      "hero.pill": "Next-gen AI accounting",
      "hero.title": "Track income and expenses. Get AI-powered savings advice.",
      "hero.subtitle": "Quantiva helps you log transactions, see daily/monthly analytics, and turn spending chaos into a clear plan.",
      "hero.primary": "Create account",
      "hero.secondary": "Explore features",

      "stats.one.value": "30 sec",
      "stats.one.label": "to your first report",
      "stats.two.value": "1 click",
      "stats.two.label": "fast transaction logging",
      "stats.three.value": "AI",
      "stats.three.label": "personalized recommendations",

      "panel.overview": "Overview",
      "panel.month": "December",

      "seg.student": "Student",
      "seg.freelancer": "Freelancer",
      "seg.family": "Family",

      "kpi.balance.label": "Balance",
      "kpi.balance.hint": "+8.4% over 30 days",
      "kpi.spending.label": "Spending",
      "kpi.spending.hint": "-2.1% this week",

      "chart.title": "Weekly",
      "days.mon": "Mon",
      "days.tue": "Tue",
      "days.wed": "Wed",
      "days.thu": "Thu",
      "days.fri": "Fri",

      "ai.badge": "AI tip",
      "ai.why": "Why?",
      "ai.tip": "Try limiting food delivery to once a week — estimated savings ≈ €65/month.",
      "ai.toggle": "Enable AI assistant",
      "ai.tooltip.title": "Why this suggestion?",
      "ai.tooltip.text": "Based on your food & transport spending over the last 30 days, we estimate a weekly cap would reduce volatility.",

      "empty.title": "No data yet",
      "empty.text": "Add your first transaction to unlock insights and weekly summaries.",

      "features.title": "Features built for clarity",
      "features.desc": "Fast logging, smart categories, and AI insights that stay understandable.",
      "features.cards.one.title": "Categories",
      "features.cards.one.text": "Auto-detect categories and keep budgeting consistent.",
      "features.cards.two.title": "Reports",
      "features.cards.two.text": "Daily and monthly summaries with clean trends.",
      "features.cards.three.title": "AI suggestions",
      "features.cards.three.text": "Practical tips based on aggregated patterns.",

      "security.title": "Security by design",
      // IMPORTANT: keep spaces around em dash
      "security.desc": "We structure the system so it can scale safely from day one. Today it’s a landing page — next it becomes a full product.",
      "security.bullets.one": "Clear separation between public pages and your private app",
      "security.bullets.two": "Session-based auth and protected forms",
      "security.bullets.three": "Ready for database storage and audit logging",

      "trust.one.title": "How AI works",
      "trust.one.a": "AI uses aggregated totals and category trends (not raw bank credentials).",
      "trust.one.b": "You can enable/disable AI at any time.",
      "trust.one.c": "Advice is actionable, not generic.",

      "trust.two.title": "Privacy first",
      "trust.two.a": "No bank login required.",
      "trust.two.b": "Built with secure storage and audit-ready structure.",
      "trust.two.c": "EU-ready approach (GDPR-aligned by design).",

      "trust.three.title": "What’s next",
      "trust.three.a": "Budgets, goals and spending limits.",
      "trust.three.b": "Exports (CSV/PDF) and reporting.",
      "trust.three.c": "Smarter AI insights with weekly summaries.",

      "roadmap.title": "Product roadmap",
      "roadmap.desc": "A clear path from landing page to a real, daily-use product.",
      "roadmap.one.title": "Landing + Auth",
      "roadmap.one.text": "Sign up / sign in and basic navigation.",
      "roadmap.two.title": "Transactions + Analytics",
      "roadmap.two.text": "Income/expense logging, filters, daily/monthly reports.",
      "roadmap.three.title": "AI Assistant",
      "roadmap.three.text": "AI-powered advice, using aggregated transaction context.",

      "pricing.title": "Pricing",
      "pricing.desc": "Start free. Upgrade when you need more automation.",
      "pricing.per": "/mo",

      "pricing.free.tag": "Free",
      "pricing.free.title": "Starter",
      "pricing.free.a": "Basic reports",
      "pricing.free.b": "Manual categories",
      "pricing.free.c": "Limited insights",
      "pricing.free.cta": "Try it",

      "pricing.pro.tag": "Popular",
      "pricing.pro.title": "Pro",
      "pricing.pro.a": "Smart categories",
      "pricing.pro.b": "Goals & limits",
      "pricing.pro.c": "Exports (CSV/PDF)",
      "pricing.pro.cta": "Start Pro",

      "pricing.ai.tag": "New",
      "pricing.ai.title": "AI",
      "pricing.ai.a": "Personalized insights",
      "pricing.ai.b": "Weekly summaries",
      "pricing.ai.c": "Reasoning preview",
      "pricing.ai.cta": "Enable AI",

      "faq.title": "FAQ",
      "faq.desc": "Short answers to common questions.",
      "faq.q1": "Do I need to connect my bank account?",
      "faq.a1": "No. Quantiva can work without bank login. You stay in control.",
      "faq.q2": "What does “AI” actually use?",
      "faq.a2": "Aggregated totals and category trends, not raw credentials.",
      "faq.q3": "Can I turn AI off?",
      "faq.a3": "Yes — one tap. The UI shows what changes when AI is off.",

      "ctaBox.title": "Ready to try Quantiva?",
      "ctaBox.text": "Create an account and get your first overview in under a minute.",

      "footer.copy": "Privacy-first. No bank credentials required. We never store raw transaction descriptions.",
      "footer.micro": "EU-ready • GDPR-aligned by design.",

      "modal.signIn.title": "Sign in",
      "modal.signIn.desc": "Demo form — we’ll wire up real auth later.",
      "modal.signIn.submit": "Sign in",
      "modal.signIn.alt": "No account?",
      "modal.signIn.toGetStarted": "Create one",

      "modal.getStarted.title": "Create account",
      "modal.getStarted.desc": "Demo signup — we’ll add real onboarding soon.",
      "modal.getStarted.submit": "Create account",
      "modal.getStarted.alt": "Already have an account?",
      "modal.getStarted.toSignIn": "Sign in",

      "form.name": "Name",
      "form.email": "Email",
      "form.password": "Password",
    },

    ru: {
      "brand.name": "Quantiva",

      "nav.features": "Функции",
      "nav.security": "Безопасность",
      "nav.pricing": "Тарифы",
      "nav.faq": "FAQ",

      "cta.signIn": "Войти",
      "cta.getStarted": "Начать",

      "hero.pill": "Бухгалтерия нового поколения",
      "hero.title": "Учитывай доходы и расходы. Получай ИИ‑советы по экономии.",
      "hero.subtitle": "Quantiva помогает быстро добавлять транзакции, смотреть аналитику по дням/месяцам и превращать хаос в понятный план.",
      "hero.primary": "Создать аккаунт",
      "hero.secondary": "Смотреть функции",

      note: "",
      "stats.one.value": "30 сек",
      "stats.one.label": "до первого отчёта",
      "stats.two.value": "1 клик",
      "stats.two.label": "быстрый ввод",
      "stats.three.value": "ИИ",
      "stats.three.label": "персональные рекомендации",

      "panel.overview": "Обзор",
      "panel.month": "Декабрь",

      "seg.student": "Студент",
      "seg.freelancer": "Фрилансер",
      "seg.family": "Семья",

      "kpi.balance.label": "Баланс",
      "kpi.balance.hint": "+8,4% за 30 дней",
      "kpi.spending.label": "Расходы",
      "kpi.spending.hint": "-2,1% на этой неделе",

      "chart.title": "Неделя",
      "days.mon": "Пн",
      "days.tue": "Вт",
      "days.wed": "Ср",
      "days.thu": "Чт",
      "days.fri": "Пт",

      "ai.badge": "ИИ‑совет",
      "ai.why": "Почему?",
      "ai.tip": "Ограничь доставку еды до 1 раза в неделю — экономия ≈ €65/мес.",
      "ai.toggle": "Включить ИИ‑ассистента",
      "ai.tooltip.title": "Почему такая рекомендация?",
      "ai.tooltip.text": "На основе ваших трат на еду и транспорт за последние 30 дней — недельный лимит снижает «скачки» расходов.",

      "empty.title": "Пока нет данных",
      "empty.text": "Добавь первую транзакцию, чтобы открыть инсайты и недельные отчёты.",

      "features.title": "Функции для ясности",
      "features.desc": "Быстрый ввод, умные категории и понятные ИИ‑инсайты.",
      "features.cards.one.title": "Категории",
      "features.cards.one.text": "Авто‑категоризация и стабильный бюджет.",
      "features.cards.two.title": "Отчёты",
      "features.cards.two.text": "Дневные и месячные сводки с чистыми трендами.",
      "features.cards.three.title": "ИИ‑подсказки",
      "features.cards.three.text": "Практичные советы на основе агрегированных паттернов.",

      "security.title": "Безопасность по дизайну",
      "security.desc": "Мы строим систему так, чтобы она безопасно масштабировалась с первого дня. Сегодня это лендинг — дальше станет полноценным продуктом.",
      "security.bullets.one": "Чёткое разделение публичной части и личного кабинета",
      "security.bullets.two": "Сессионная авторизация и защищённые формы",
      "security.bullets.three": "Готовность к базе данных и аудит‑логам",

      "trust.one.title": "Как работает ИИ",
      "trust.one.a": "ИИ использует агрегированные суммы и тренды по категориям (не банковские данные).",
      "trust.one.b": "ИИ можно включать/выключать в любой момент.",
      "trust.one.c": "Советы конкретные, а не «общие слова».",

      "trust.two.title": "Приватность",
      "trust.two.a": "Вход в банк не нужен.",
      "trust.two.b": "Архитектура готова к безопасному хранению и аудитам.",
      "trust.two.c": "EU‑подход (GDPR‑aligned by design).",

      "trust.three.title": "Что дальше",
      "trust.three.a": "Бюджеты, цели и лимиты трат.",
      "trust.three.b": "Экспорт (CSV/PDF) и отчётность.",
      "trust.three.c": "Умнее ИИ‑инсайты и недельные сводки.",

      "roadmap.title": "Дорожная карта",
      "roadmap.desc": "Понятный путь от лендинга к реальному продукту.",
      "roadmap.one.title": "Лендинг + вход",
      "roadmap.one.text": "Регистрация/вход и базовая навигация.",
      "roadmap.two.title": "Транзакции + аналитика",
      "roadmap.two.text": "Учёт доходов/расходов, фильтры, дневные/месячные отчёты.",
      "roadmap.three.title": "ИИ‑ассистент",
      "roadmap.three.text": "ИИ‑советы на основе агрегированного контекста.",

      "pricing.title": "Тарифы",
      "pricing.desc": "Начни бесплатно. Обновляйся, когда понадобится больше автоматизации.",
      "pricing.per": "/мес",

      "pricing.free.tag": "Free",
      "pricing.free.title": "Starter",
      "pricing.free.a": "Базовые отчёты",
      "pricing.free.b": "Ручные категории",
      "pricing.free.c": "Ограниченные инсайты",
      "pricing.free.cta": "Попробовать",

      "pricing.pro.tag": "Popular",
      "pricing.pro.title": "Pro",
      "pricing.pro.a": "Умные категории",
      "pricing.pro.b": "Цели и лимиты",
      "pricing.pro.c": "Экспорт (CSV/PDF)",
      "pricing.pro.cta": "Старт Pro",

      "pricing.ai.tag": "New",
      "pricing.ai.title": "ИИ",
      "pricing.ai.a": "Персональные инсайты",
      "pricing.ai.b": "Недельные сводки",
      "pricing.ai.c": "Пояснение логики",
      "pricing.ai.cta": "Включить ИИ",

      "faq.title": "FAQ",
      "faq.desc": "Короткие ответы на частые вопросы.",
      "faq.q1": "Нужно подключать банк?",
      "faq.a1": "Нет. Quantiva может работать без входа в банк — контроль у тебя.",
      "faq.q2": "Что использует «ИИ»?",
      "faq.a2": "Агрегированные суммы и тренды по категориям, а не «сырые» данные.",
      "faq.q3": "Можно выключить ИИ?",
      "faq.a3": "Да — одним нажатием. Интерфейс покажет, что меняется.",

      "ctaBox.title": "Готов попробовать Quantiva?",
      "ctaBox.text": "Создай аккаунт и получи первый обзор меньше чем за минуту.",

      "footer.copy": "Privacy‑first. Вход в банк не нужен. Мы не храним «сырые» описания транзакций.",
      "footer.micro": "EU‑ready • GDPR‑aligned by design.",

      "modal.signIn.title": "Войти",
      "modal.signIn.desc": "Демо‑форма — подключим реальную авторизацию позже.",
      "modal.signIn.submit": "Войти",
      "modal.signIn.alt": "Нет аккаунта?",
      "modal.signIn.toGetStarted": "Создать",

      "modal.getStarted.title": "Создать аккаунт",
      "modal.getStarted.desc": "Демо‑регистрация — скоро добавим онбординг.",
      "modal.getStarted.submit": "Создать аккаунт",
      "modal.getStarted.alt": "Уже есть аккаунт?",
      "modal.getStarted.toSignIn": "Войти",

      "form.name": "Имя",
      "form.email": "Почта",
      "form.password": "Пароль",
    },

    de: {
      "brand.name": "Quantiva",

      "nav.features": "Funktionen",
      "nav.security": "Sicherheit",
      "nav.pricing": "Preise",
      "nav.faq": "FAQ",

      "cta.signIn": "Anmelden",
      "cta.getStarted": "Loslegen",

      "hero.pill": "Next‑Gen KI‑Accounting",
      "hero.title": "Einnahmen & Ausgaben im Blick. KI‑Spar‑Tipps inklusive.",
      "hero.subtitle": "Quantiva hilft beim schnellen Erfassen von Transaktionen, bietet Tages/Monats‑Analysen und macht aus Chaos einen Plan.",
      "hero.primary": "Account erstellen",
      "hero.secondary": "Funktionen ansehen",

      "stats.one.value": "30 Sek",
      "stats.one.label": "bis zum ersten Report",
      "stats.two.value": "1 Klick",
      "stats.two.label": "schnelles Logging",
      "stats.three.value": "KI",
      "stats.three.label": "personalisierte Empfehlungen",

      "panel.overview": "Übersicht",
      "panel.month": "Dezember",

      "seg.student": "Student",
      "seg.freelancer": "Freelancer",
      "seg.family": "Familie",

      "kpi.balance.label": "Saldo",
      "kpi.balance.hint": "+8,4% in 30 Tagen",
      "kpi.spending.label": "Ausgaben",
      "kpi.spending.hint": "-2,1% diese Woche",

      "chart.title": "Woche",
      "days.mon": "Mo",
      "days.tue": "Di",
      "days.wed": "Mi",
      "days.thu": "Do",
      "days.fri": "Fr",

      "ai.badge": "KI‑Tipp",
      "ai.why": "Warum?",
      "ai.tip": "Lieferessen auf 1× pro Woche begrenzen — geschätzte Ersparnis ≈ €65/Monat.",
      "ai.toggle": "KI‑Assistent aktivieren",
      "ai.tooltip.title": "Warum dieser Vorschlag?",
      "ai.tooltip.text": "Basierend auf Ausgaben für Essen & Transport der letzten 30 Tage — ein Wochenlimit reduziert Volatilität.",

      "empty.title": "Noch keine Daten",
      "empty.text": "Füge deine erste Transaktion hinzu, um Insights und Wochen‑Summaries freizuschalten.",

      "features.title": "Funktionen für Klarheit",
      "features.desc": "Schnelles Logging, smarte Kategorien und verständliche KI‑Insights.",
      "features.cards.one.title": "Kategorien",
      "features.cards.one.text": "Automatische Kategorien und konsistentes Budgeting.",
      "features.cards.two.title": "Reports",
      "features.cards.two.text": "Tägliche und monatliche Zusammenfassungen mit klaren Trends.",
      "features.cards.three.title": "KI‑Vorschläge",
      "features.cards.three.text": "Praktische Tipps auf Basis aggregierter Muster.",

      "security.title": "Sicherheit by design",
      "security.desc": "Wir bauen so, dass es von Tag eins sicher skaliert. Heute ist es eine Landing Page — als Nächstes ein echtes Produkt.",
      "security.bullets.one": "Klare Trennung zwischen öffentlichen Seiten und privater App",
      "security.bullets.two": "Session‑basierte Auth & geschützte Formulare",
      "security.bullets.three": "Bereit für DB‑Storage und Audit‑Logging",

      "trust.one.title": "Wie KI arbeitet",
      "trust.one.a": "KI nutzt aggregierte Summen & Kategorien‑Trends (keine Bank‑Credentials).",
      "trust.one.b": "KI jederzeit aktivierbar/deaktivierbar.",
      "trust.one.c": "Tipps sind konkret, nicht generisch.",

      "trust.two.title": "Privacy first",
      "trust.two.a": "Kein Bank‑Login nötig.",
      "trust.two.b": "Sichere Speicherung & audit‑ready Struktur.",
      "trust.two.c": "EU‑ready (GDPR‑aligned by design).",

      "trust.three.title": "Was als Nächstes kommt",
      "trust.three.a": "Budgets, Ziele & Ausgabenlimits.",
      "trust.three.b": "Export (CSV/PDF) und Reporting.",
      "trust.three.c": "Smartere KI‑Insights mit Wochen‑Summaries.",

      "roadmap.title": "Roadmap",
      "roadmap.desc": "Ein klarer Weg von Landing Page zu Daily‑Use‑Produkt.",
      "roadmap.one.title": "Landing + Auth",
      "roadmap.one.text": "Sign up / sign in und Basis‑Navigation.",
      "roadmap.two.title": "Transaktionen + Analytics",
      "roadmap.two.text": "Einnahmen/Ausgaben, Filter, Tages/Monats‑Reports.",
      "roadmap.three.title": "KI‑Assistent",
      "roadmap.three.text": "KI‑Beratung auf Basis aggregiertem Kontext.",

      "pricing.title": "Preise",
      "pricing.desc": "Starte kostenlos. Upgrade, wenn du mehr Automatisierung brauchst.",
      "pricing.per": "/Monat",

      "pricing.free.tag": "Free",
      "pricing.free.title": "Starter",
      "pricing.free.a": "Basis‑Reports",
      "pricing.free.b": "Manuelle Kategorien",
      "pricing.free.c": "Begrenzte Insights",
      "pricing.free.cta": "Testen",

      "pricing.pro.tag": "Popular",
      "pricing.pro.title": "Pro",
      "pricing.pro.a": "Smarte Kategorien",
      "pricing.pro.b": "Ziele & Limits",
      "pricing.pro.c": "Export (CSV/PDF)",
      "pricing.pro.cta": "Pro starten",

      "pricing.ai.tag": "New",
      "pricing.ai.title": "KI",
      "pricing.ai.a": "Personalisierte Insights",
      "pricing.ai.b": "Wochen‑Summaries",
      "pricing.ai.c": "Reasoning‑Preview",
      "pricing.ai.cta": "KI aktivieren",

      "faq.title": "FAQ",
      "faq.desc": "Kurze Antworten auf häufige Fragen.",
      "faq.q1": "Muss ich mein Bankkonto verbinden?",
      "faq.a1": "Nein. Quantiva funktioniert auch ohne Bank‑Login.",
      "faq.q2": "Was nutzt „KI“?",
      "faq.a2": "Aggregierte Summen und Kategorien‑Trends.",
      "faq.q3": "Kann ich KI ausschalten?",
      "faq.a3": "Ja — mit einem Tap. Die UI zeigt den Unterschied.",

      "ctaBox.title": "Bereit für Quantiva?",
      "ctaBox.text": "Erstelle einen Account und erhalte deine Übersicht in unter einer Minute.",

      "footer.copy": "Privacy‑first. Kein Bank‑Login nötig. Wir speichern keine Roh‑Transaktionsbeschreibungen.",
      "footer.micro": "EU‑ready • GDPR‑aligned by design.",

      "modal.signIn.title": "Anmelden",
      "modal.signIn.desc": "Demo‑Formular — echte Auth folgt später.",
      "modal.signIn.submit": "Anmelden",
      "modal.signIn.alt": "Noch kein Account?",
      "modal.signIn.toGetStarted": "Erstellen",

      "modal.getStarted.title": "Account erstellen",
      "modal.getStarted.desc": "Demo‑Signup — Onboarding folgt bald.",
      "modal.getStarted.submit": "Account erstellen",
      "modal.getStarted.alt": "Schon einen Account?",
      "modal.getStarted.toSignIn": "Anmelden",

      "form.name": "Name",
      "form.email": "E‑Mail",
      "form.password": "Passwort",
    },
  };

  const LANGS = ["en", "ru", "de"];
  const LOCALES = { en: "en-US", ru: "ru-RU", de: "de-DE" };

  function getSavedLang() {
    const fromStorage = localStorage.getItem("quantiva_lang");
    if (fromStorage && LANGS.includes(fromStorage)) return fromStorage;

    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (LANGS.includes(nav)) return nav;
    return "en";
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) return;
    state.lang = lang;
    localStorage.setItem("quantiva_lang", lang);
    applyI18n();
    updateLangUI();
    // scenario refresh (to update translated hints/tips)
    renderScenario(state.scenario, { withSkeleton: false });
  }

  function t(key) {
    const table = I18N[state.lang] || I18N.en;
    return table[key] ?? (I18N.en[key] ?? key);
  }

  function applyI18n() {
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = t(key);
      if (value == null) return;
      el.textContent = value;
    });
    // year
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  // -----------------------------
  // State + Scenario data
  // -----------------------------
  const state = {
    lang: getSavedLang(),
    scenario: "student",
    aiEnabled: true,
    tooltipOpen: false,
    mobileNavOpen: false,
  };

  const scenarios = {
    student: {
      balance: 1284.2,
      spending: 642.1,
      balanceHintKey: "kpi.balance.hint",
      spendHintKey: "kpi.spending.hint",
      bars: { mon: 62, tue: 38, wed: 84, thu: 52, fri: 74 },
      aiTipKey: "ai.tip",
    },
    freelancer: {
      balance: 3240.5,
      spending: 1189.3,
      balanceHintCustom: { en: "+12.1% over 30 days", ru: "+12,1% за 30 дней", de: "+12,1% in 30 Tagen" },
      spendHintCustom: { en: "+3.4% this week", ru: "+3,4% на этой неделе", de: "+3,4% diese Woche" },
      bars: { mon: 48, tue: 72, wed: 63, thu: 81, fri: 55 },
      aiTipCustom: {
        en: "Set aside 20% of income weekly — keeps taxes predictable and stress low.",
        ru: "Откладывай 20% дохода каждую неделю — так налоги становятся предсказуемыми.",
        de: "Lege wöchentlich 20% zurück — so bleiben Steuern planbar.",
      },
    },
    family: {
      balance: 2105.9,
      spending: 1540.6,
      balanceHintCustom: { en: "+4.9% over 30 days", ru: "+4,9% за 30 дней", de: "+4,9% in 30 Tagen" },
      spendHintCustom: { en: "-5.2% this week", ru: "-5,2% на этой неделе", de: "-5,2% diese Woche" },
      bars: { mon: 58, tue: 66, wed: 44, thu: 77, fri: 69 },
      aiTipCustom: {
        en: "Create a weekly grocery cap — families save most when food is planned.",
        ru: "Поставь недельный лимит на продукты — семьи больше всего экономят на планировании еды.",
        de: "Setze ein Wochenlimit für Einkäufe — Planung spart am meisten.",
      },
    },
  };

  // -----------------------------
  // Elements
  // -----------------------------
  const els = {
    header: $("#header"),
    burger: $("#burger"),
    mobileNav: $("#mobileNav"),

    // buttons opening modals
    openSignIn: $("#openSignIn"),
    openGetStarted: $("#openGetStarted"),
    openSignInMobile: $("#openSignInMobile"),
    openGetStartedMobile: $("#openGetStartedMobile"),
    heroPrimary: $("#heroPrimary"),
    ctaGetStarted: $("#ctaGetStarted"),
    pricingAI: $("#pricingAI"),
    openGetStarted2: $("#openGetStarted2"),

    // panel
    panel: $("#overviewPanel"),
    monthLabel: $("#monthLabel"),
    balanceValue: $("#balanceValue"),
    spendValue: $("#spendValue"),
    balanceHint: $("#balanceHint"),
    spendHint: $("#spendHint"),
    barMon: $("#barMon"),
    barTue: $("#barTue"),
    barWed: $("#barWed"),
    barThu: $("#barThu"),
    barFri: $("#barFri"),

    // seg
    segButtons: $$("[data-scenario]"),

    // AI
    aiTipCard: $("#aiTipCard"),
    aiTipText: $("#aiTipText"),
    toggleAI: $("#toggleAI"),
    aiWhyBtn: $("#aiWhyBtn"),
    aiTipTooltip: $("#aiTipTooltip"),
    emptyState: $("#emptyState"),

    // lang
    langBtn: $("#langBtn"),
    langLabel: $("#langLabel"),
    langMenu: $("#langMenu"),
    langItems: $$("#langMenu [data-lang]"),

    // modals
    signInModal: $("#signInModal"),
    getStartedModal: $("#getStartedModal"),
    signInForm: $("#signInForm"),
    getStartedForm: $("#getStartedForm"),
    switchToGetStarted: $("#switchToGetStarted"),
    switchToSignIn: $("#switchToSignIn"),

    // toast
    toast: $("#toast"),
  };

  // -----------------------------
  // Toast
  // -----------------------------
  let toastTimer = null;
  function showToast(text) {
    if (!els.toast) return;
    els.toast.textContent = text;
    els.toast.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.style.display = "none";
    }, 2200);
  }

  // -----------------------------
  // Mobile nav
  // -----------------------------
  function setMobileNav(open) {
    state.mobileNavOpen = !!open;
    if (!els.mobileNav || !els.burger) return;

    els.mobileNav.style.display = open ? "block" : "none";
    els.burger.setAttribute("aria-expanded", String(open));
  }

  // -----------------------------
  // Modals
  // -----------------------------
  function openModal(which) {
    const modal = which === "signIn" ? els.signInModal : els.getStartedModal;
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(which) {
    const modal = which === "signIn" ? els.signInModal : els.getStartedModal;
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function closeAllModals() {
    closeModal("signIn");
    closeModal("getStarted");
  }

  // -----------------------------
  // Tooltip
  // -----------------------------
  function setTooltip(open) {
    state.tooltipOpen = !!open;
    if (!els.aiTipTooltip || !els.aiWhyBtn) return;

    els.aiTipTooltip.classList.toggle("is-open", open);
    els.aiWhyBtn.setAttribute("aria-expanded", String(open));
  }

  // -----------------------------
  // AI enabled / empty state
  // -----------------------------
  function setAIEnabled(enabled) {
    state.aiEnabled = !!enabled;

    if (!els.emptyState || !els.toggleAI || !els.aiTipText) return;

    // When AI disabled: show empty state + change button text
    if (!state.aiEnabled) {
      els.emptyState.classList.add("is-on");
      els.aiTipText.style.opacity = "0.45";
      els.toggleAI.textContent = state.lang === "ru" ? "Включить ИИ‑ассистента" : t("ai.toggle");
    } else {
      els.emptyState.classList.remove("is-on");
      els.aiTipText.style.opacity = "";
      els.toggleAI.textContent = state.lang === "ru" ? "Выключить ИИ‑ассистента" : "Disable AI assistant";
      // We avoid adding a new i18n key; keep it simple & consistent
      // If you want: add i18n key for "Disable..."
    }
  }

  // -----------------------------
  // Skeleton loading
  // -----------------------------
  function setPanelLoading(loading) {
    if (!els.panel) return;
    els.panel.classList.toggle("is-loading", !!loading);
  }

  function withFakeLoading(fn, ms = 520) {
    if (prefersReducedMotion) {
      fn();
      return;
    }
    setPanelLoading(true);
    window.setTimeout(() => {
      fn();
      // let bars animate to new width
      window.setTimeout(() => setPanelLoading(false), 180);
    }, ms);
  }

  // -----------------------------
  // Scenario rendering
  // -----------------------------
  function renderScenario(scenarioKey, opts = { withSkeleton: true }) {
    const sc = scenarios[scenarioKey] || scenarios.student;
    const locale = LOCALES[state.lang] || "en-US";

    const apply = () => {
      // KPIs
      if (els.balanceValue) els.balanceValue.textContent = formatEUR(sc.balance, locale);
      if (els.spendValue) els.spendValue.textContent = formatEUR(sc.spending, locale);

      // Hints
      if (els.balanceHint) {
        if (sc.balanceHintCustom) els.balanceHint.textContent = sc.balanceHintCustom[state.lang] || sc.balanceHintCustom.en;
        else els.balanceHint.textContent = t(sc.balanceHintKey || "kpi.balance.hint");
      }
      if (els.spendHint) {
        if (sc.spendHintCustom) els.spendHint.textContent = sc.spendHintCustom[state.lang] || sc.spendHintCustom.en;
        else els.spendHint.textContent = t(sc.spendHintKey || "kpi.spending.hint");
      }

      // Bars
      const bars = sc.bars || scenarios.student.bars;
      const setW = (el, w) => {
        if (!el) return;
        const safe = clamp(Number(w) || 0, 6, 100);
        el.style.width = `${safe}%`;
      };
      setW(els.barMon, bars.mon);
      setW(els.barTue, bars.tue);
      setW(els.barWed, bars.wed);
      setW(els.barThu, bars.thu);
      setW(els.barFri, bars.fri);

      // AI tip
      if (els.aiTipText) {
        if (sc.aiTipCustom) els.aiTipText.textContent = sc.aiTipCustom[state.lang] || sc.aiTipCustom.en;
        else els.aiTipText.textContent = t(sc.aiTipKey || "ai.tip");
      }

      // Seg buttons states
      els.segButtons.forEach((btn) => {
        const isActive = btn.getAttribute("data-scenario") === scenarioKey;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    };

    if (opts.withSkeleton) withFakeLoading(apply, 420);
    else apply();
  }

  // -----------------------------
  // Header hide on scroll
  // -----------------------------
  function setupHeaderHideOnScroll() {
    if (!els.header) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const delta = y - lastY;

        // small scrolls ignored
        if (Math.abs(delta) > 6) {
          const goingDown = delta > 0;
          const pastHero = y > 80;

          if (goingDown && pastHero) {
            els.header.classList.add("is-hidden");
            // also close tooltips / menus while scrolling
            setTooltip(false);
            closeLangMenu();
          } else {
            els.header.classList.remove("is-hidden");
          }
        }

        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // -----------------------------
  // Scroll reveal
  // -----------------------------
  function setupReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
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

  // -----------------------------
  // Language menu
  // -----------------------------
  function closeLangMenu() {
    if (!els.langMenu || !els.langBtn) return;
    els.langMenu.classList.remove("is-open");
    els.langBtn.setAttribute("aria-expanded", "false");
  }

  function toggleLangMenu() {
    if (!els.langMenu || !els.langBtn) return;
    const open = !els.langMenu.classList.contains("is-open");
    els.langMenu.classList.toggle("is-open", open);
    els.langBtn.setAttribute("aria-expanded", String(open));
    if (open) setTooltip(false);
  }

  function updateLangUI() {
    if (!els.langLabel) return;
    els.langLabel.textContent = state.lang.toUpperCase();
  }

  // -----------------------------
  // Wiring events
  // -----------------------------
  function wireEvents() {
    // burger
    if (els.burger) {
      els.burger.addEventListener("click", () => {
        setMobileNav(!state.mobileNavOpen);
      });
    }

    // close mobile nav when clicking a link
    if (els.mobileNav) {
      $$("#mobileNav a").forEach((a) => {
        a.addEventListener("click", () => setMobileNav(false));
      });
    }

    // open modals (desktop)
    const openSignInAll = [els.openSignIn, els.openSignInMobile].filter(Boolean);
    openSignInAll.forEach((btn) =>
      btn.addEventListener("click", () => {
        setMobileNav(false);
        openModal("signIn");
      })
    );

    const openGetStartedAll = [
      els.openGetStarted,
      els.openGetStartedMobile,
      els.heroPrimary,
      els.ctaGetStarted,
      els.openGetStarted2,
    ].filter(Boolean);

    openGetStartedAll.forEach((btn) =>
      btn.addEventListener("click", () => {
        setMobileNav(false);
        openModal("getStarted");
      })
    );

    if (els.pricingAI) {
      els.pricingAI.addEventListener("click", () => {
        setMobileNav(false);
        // quick premium feel
        showToast(state.lang === "ru" ? "ИИ включён в Pro/AI планах (демо)" : "AI is included in Pro/AI plans (demo)");
        openModal("getStarted");
      });
    }

    // close modals by backdrop / close buttons
    $$("[data-close]").forEach((el) => {
      el.addEventListener("click", () => {
        const which = el.getAttribute("data-close");
        if (which === "signIn" || which === "getStarted") closeModal(which);
      });
    });

    // ESC closes
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllModals();
        closeLangMenu();
        setTooltip(false);
        setMobileNav(false);
      }
    });

    // switch between modals
    if (els.switchToGetStarted) {
      els.switchToGetStarted.addEventListener("click", () => {
        closeModal("signIn");
        openModal("getStarted");
      });
    }
    if (els.switchToSignIn) {
      els.switchToSignIn.addEventListener("click", () => {
        closeModal("getStarted");
        openModal("signIn");
      });
    }

    // submit demo forms
    if (els.signInForm) {
      els.signInForm.addEventListener("submit", (e) => {
        e.preventDefault();
        closeModal("signIn");
        showToast(state.lang === "ru" ? "Вход выполнен (демо)" : state.lang === "de" ? "Anmeldung (Demo)" : "Signed in (demo)");
      });
    }
    if (els.getStartedForm) {
      els.getStartedForm.addEventListener("submit", (e) => {
        e.preventDefault();
        closeModal("getStarted");
        showToast(state.lang === "ru" ? "Аккаунт создан (демо)" : state.lang === "de" ? "Account erstellt (Demo)" : "Account created (demo)");
      });
    }

    // scenario seg
    els.segButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-scenario");
        if (!key || key === state.scenario) return;
        state.scenario = key;
        setTooltip(false);
        renderScenario(key, { withSkeleton: true });
      });
    });

    // AI tooltip
    if (els.aiWhyBtn) {
      els.aiWhyBtn.addEventListener("click", () => {
        toggleLangMenu(false);
        setTooltip(!state.tooltipOpen);
      });
    }

    // close tooltip by click outside
    document.addEventListener("click", (e) => {
      const target = e.target;

      // lang
      if (els.langMenu && els.langBtn) {
        const insideLang = els.langMenu.contains(target) || els.langBtn.contains(target);
        if (!insideLang) closeLangMenu();
      }

      // tooltip
      if (els.aiTipTooltip && els.aiWhyBtn) {
        const insideTip = els.aiTipTooltip.contains(target) || els.aiWhyBtn.contains(target);
        if (!insideTip) setTooltip(false);
      }
    });

    // toggle AI
    if (els.toggleAI) {
      els.toggleAI.addEventListener("click", () => {
        setAIEnabled(!state.aiEnabled);
        showToast(
          state.aiEnabled
            ? state.lang === "ru"
              ? "ИИ включён"
              : state.lang === "de"
              ? "KI aktiviert"
              : "AI enabled"
            : state.lang === "ru"
            ? "ИИ выключен"
            : state.lang === "de"
            ? "KI deaktiviert"
            : "AI disabled"
        );
      });
    }

    // language
    if (els.langBtn) {
      els.langBtn.addEventListener("click", () => {
        setTooltip(false);
        toggleLangMenu();
      });
    }
    els.langItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        closeLangMenu();
        if (lang) setLang(lang);
        showToast(state.lang === "ru" ? "Язык: Русский" : state.lang === "de" ? "Sprache: Deutsch" : "Language: English");
      });
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  function init() {
    // set initial lang label
    updateLangUI();

    // i18n text fill
    applyI18n();

    // month label text (kept via i18n)
    if (els.monthLabel) els.monthLabel.textContent = t("panel.month");

    // initial states
    setMobileNav(false);
    setTooltip(false);

    // AI default: ON (no empty state)
    setAIEnabled(true);

    // initial scenario with "premium" fake loading once
    setPanelLoading(true);
    window.setTimeout(() => {
      renderScenario(state.scenario, { withSkeleton: false });
      setPanelLoading(false);
    }, prefersReducedMotion ? 0 : 520);

    // reveal + header behavior
    setupReveal();
    setupHeaderHideOnScroll();

    // events
    wireEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
