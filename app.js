(() => {
  "use strict";

  // -----------------------------
  // Helpers
  // -----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function clampStr(v) {
    return typeof v === "string" ? v : "";
  }

  // -----------------------------
  // Year
  // -----------------------------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // -----------------------------
  // Toast
  // -----------------------------
  const toastEl = $("#toast");
  let toastTimer = null;

  function toast(message, ms = 2200) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.style.display = "none";
      toastEl.textContent = "";
    }, ms);
  }
  // -----------------------------
// Header hide-on-scroll (Safari-like)
// -----------------------------
const header = document.querySelector(".header");
let lastY = window.scrollY;
let ticking = false;

function onScroll() {
  const y = window.scrollY;

  // show at top
  if (y < 20) {
    header?.classList.remove("is-hidden");
    lastY = y;
    return;
  }

  // if scrolling down -> hide, up -> show
  if (y > lastY + 6) header?.classList.add("is-hidden");
  else if (y < lastY - 6) header?.classList.remove("is-hidden");

  lastY = y;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
});


  // -----------------------------
  // Mobile menu (burger)
  // -----------------------------
  const burger = $("[data-burger]");
  const mobileNav = $("[data-mobile-nav]");

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.style.display = "none";
    if (burger) burger.setAttribute("aria-expanded", "false");
  }

  function toggleMobileNav() {
    if (!mobileNav) return;
    const isOpen = mobileNav.style.display === "block";
    mobileNav.style.display = isOpen ? "none" : "block";
    if (burger) burger.setAttribute("aria-expanded", String(!isOpen));
  }

  if (burger && mobileNav) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileNav();
    });

    document.addEventListener("click", (e) => {
      // закрываем меню при клике вне
      if (!mobileNav.contains(e.target) && e.target !== burger) closeMobileNav();
    });

    // закрываем при клике по ссылке
    $$(".mobile-nav__link", mobileNav).forEach((a) => {
      a.addEventListener("click", () => closeMobileNav());
    });
  }

  // -----------------------------
  // Modals
  // -----------------------------
  const modals = $$("[data-modal]");
  const openBtns = $$("[data-open]");
  const swapBtns = $$("[data-swap]");
  const closeTargets = $$("[data-close]");

  function getModal(name) {
    return $(`[data-modal="${name}"]`);
  }

  function closeAllModals() {
    modals.forEach((m) => m.classList.remove("is-open"));
    document.body.style.overflow = "";
  }

  function openModal(name) {
    closeAllModals();
    const m = getModal(name);
    if (!m) return;
    m.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-open")));
  });

  swapBtns.forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-swap")));
  });

  closeTargets.forEach((el) => {
    el.addEventListener("click", () => closeAllModals());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
  });

  // Fake submit handlers (пока без backend)
  const loginForm = $("#loginForm");
  const signupForm = $("#signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      toast(t("toast.login"), 2200);
      closeAllModals();
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      toast(t("toast.signup"), 2200);
      closeAllModals();
    });
  }

  // -----------------------------
  // i18n (EN/DE/RU)
  // -----------------------------
  const STORAGE_KEY = "quantiva_lang";

  const I18N = {
    en: {
      // nav
      "nav.features": "Features",
      "nav.security": "Security",
      "nav.pricing": "Pricing",
      "nav.faq": "FAQ",
      "nav.signin": "Sign in",
      "nav.getstarted": "Get started",

      // hero
      "hero.pill": "Next-gen AI accounting",
      "hero.title1": "Track income and expenses.",
      "hero.title2": "Get AI-powered savings advice.",
      "hero.subtitle":
        "Quantiva helps you log transactions, see daily/monthly analytics, and turn spending chaos into a clear plan.",
      "hero.cta1": "Create account",
      "hero.cta2": "Explore features",
      "hero.stat1.value": "30 sec",
      "hero.stat1.label": "to your first report",
      "hero.stat2.value": "1 click",
      "hero.stat2.label": "fast transaction logging",
      "hero.stat3.value": "AI",
      "hero.stat3.label": "personalized recommendations",

      // panel
      "panel.title": "Overview",
      "panel.chip": "December",
      "panel.balance.label": "Balance",
      "panel.balance.hint": "+8.4% over 30 days",
      "panel.spend.label": "Spending",
      "panel.spend.hint": "−2.1% this week",
      "panel.chart.mon": "Mon",
      "panel.chart.tue": "Tue",
      "panel.chart.wed": "Wed",
      "panel.chart.thu": "Thu",
      "panel.chart.fri": "Fri",
      "panel.aitip.badge": "AI tip",
      "panel.aitip.text":
        "Try limiting food delivery to once a week — estimated savings ≈ €65/month.",
      "panel.aitip.cta": "Enable AI assistant",

      // features section
      "features.title": "What Quantiva does",
      "features.desc": "Minimal clicks. Maximum clarity.",
      "features.f1.title": "Income & expenses",
      "features.f1.text": "Add transactions quickly with categories and notes. No busywork.",
      "features.f2.title": "Analytics",
      "features.f2.text": "Daily and monthly trends, clear summaries, and budget control.",
      "features.f3.title": "AI recommendations",
      "features.f3.text":
        "The assistant reviews your spending patterns and suggests concrete savings actions.",

      // security section
      "security.title": "Security by design",
      "security.desc":
        "We structure the system so it can scale safely from day one. Today it’s a landing page—next it becomes a full product.",
      "security.b1": "Clear separation between public pages and your private app",
      "security.b2": "Session-based auth and protected forms",
      "security.b3": "Ready for database storage and audit logging",

      // roadmap
      "roadmap.title": "Product roadmap",
      "roadmap.s1.title": "Landing + Auth",
      "roadmap.s1.text": "Sign up / sign in and basic navigation.",
      "roadmap.s2.title": "Transactions + Analytics",
      "roadmap.s2.text": "Income/expense logging, filters, daily/monthly reports.",
      "roadmap.s3.title": "AI Assistant",
      "roadmap.s3.text": "OpenAI-powered advice, using aggregated transaction context.",

      // pricing
      "pricing.title": "Pricing",
      "pricing.desc": "Simple tiers, straightforward upgrades.",
      "pricing.free.title": "Free",
      "pricing.free.l1": "Transactions",
      "pricing.free.l2": "Categories",
      "pricing.free.l3": "Basic reports",
      "pricing.free.cta": "Try it",

      "pricing.pro.tag": "Recommended",
      "pricing.pro.title": "Pro",
      "pricing.per": "/mo",
      "pricing.pro.l1": "Advanced analytics",
      "pricing.pro.l2": "Export",
      "pricing.pro.l3": "Goals & limits",
      "pricing.pro.cta": "Start Pro",

      "pricing.ai.title": "AI",
      "pricing.ai.l1": "AI savings advice",
      "pricing.ai.l2": "Category suggestions",
      "pricing.ai.l3": "Personalized insights",
      "pricing.ai.cta": "Enable AI",

      // faq
      "faq.title": "FAQ",
      "faq.desc": "Quick answers to common questions.",
      "faq.q1": "Is this a finished product?",
      "faq.a1":
        "This is the landing page. Next we’ll add auth, transaction storage, analytics, and the AI assistant.",
      "faq.q2": "Can we add a dashboard quickly?",
      "faq.a2": "Yes. Next step is backend + database, and protected routes like /app.",
      "faq.q3": "How will the AI assistant work?",
      "faq.a3":
        "We’ll send aggregated data (categories, totals, timeframe) and return actionable advice—without sending unnecessary personal details.",

      // cta
      "cta.title": "Ready to begin?",
      "cta.text": "Create an account and we’ll build the dashboard next.",
      "cta.button": "Get started",

      // footer
      "footer.rights": "Quantiva. All rights reserved.",

      // auth modals
      "login.title": "Sign in",
      "login.email": "Email",
      "login.password": "Password",
      "login.submit": "Sign in",
      "login.hint1": "New here?",
      "login.hint2": "Create an account",

      "signup.title": "Create your account",
      "signup.name": "Name",
      "signup.email": "Email",
      "signup.password": "Password",
      "signup.submit": "Create account",
      "signup.hint1": "Already have an account?",
      "signup.hint2": "Sign in",

      // toasts
      "toast.login": "Signed in (demo). Next: connect backend.",
      "toast.signup": "Account created (demo). Next: connect backend.",
    },

    de: {
      "nav.features": "Funktionen",
      "nav.security": "Sicherheit",
      "nav.pricing": "Preise",
      "nav.faq": "FAQ",
      "nav.signin": "Anmelden",
      "nav.getstarted": "Loslegen",

      "hero.pill": "Next‑Gen KI‑Buchhaltung",
      "hero.title1": "Einnahmen und Ausgaben erfassen.",
      "hero.title2": "KI‑basierte Spartipps erhalten.",
      "hero.subtitle":
        "Quantiva hilft dir, Transaktionen zu erfassen, Tages-/Monatsanalysen zu sehen und Ausgaben in einen klaren Plan zu verwandeln.",
      "hero.cta1": "Konto erstellen",
      "hero.cta2": "Funktionen ansehen",
      "hero.stat1.value": "30 Sek",
      "hero.stat1.label": "bis zum ersten Bericht",
      "hero.stat2.value": "1 Klick",
      "hero.stat2.label": "schnelles Erfassen",
      "hero.stat3.value": "KI",
      "hero.stat3.label": "personalisierte Tipps",

      "panel.title": "Übersicht",
      "panel.chip": "Dezember",
      "panel.balance.label": "Saldo",
      "panel.balance.hint": "+8,4% in 30 Tagen",
      "panel.spend.label": "Ausgaben",
      "panel.spend.hint": "−2,1% diese Woche",
      "panel.chart.mon": "Mo",
      "panel.chart.tue": "Di",
      "panel.chart.wed": "Mi",
      "panel.chart.thu": "Do",
      "panel.chart.fri": "Fr",
      "panel.aitip.badge": "KI‑Tipp",
      "panel.aitip.text":
        "Begrenze Lieferessen auf einmal pro Woche — geschätzte Ersparnis ≈ 65 €/Monat.",
      "panel.aitip.cta": "KI‑Assistent aktivieren",

      "features.title": "Was Quantiva kann",
      "features.desc": "Wenig Klicks. Maximale Klarheit.",
      "features.f1.title": "Einnahmen & Ausgaben",
      "features.f1.text": "Transaktionen schnell mit Kategorien und Notizen erfassen.",
      "features.f2.title": "Analysen",
      "features.f2.text": "Tages- und Monatstrends, klare Zusammenfassungen, Budgetkontrolle.",
      "features.f3.title": "KI‑Empfehlungen",
      "features.f3.text": "Der Assistent erkennt Muster und schlägt konkrete Sparmaßnahmen vor.",

      "security.title": "Sicherheit von Anfang an",
      "security.desc":
        "Wir strukturieren das System so, dass es sicher skalieren kann. Heute Landingpage—morgen ein vollständiges Produkt.",
      "security.b1": "Klare Trennung zwischen öffentlicher Seite und privater App",
      "security.b2": "Session‑basierte Auth und geschützte Formulare",
      "security.b3": "Bereit für Datenbank und Audit‑Logging",

      "roadmap.title": "Produkt‑Roadmap",
      "roadmap.s1.title": "Landing + Auth",
      "roadmap.s1.text": "Registrieren/Anmelden und Navigation.",
      "roadmap.s2.title": "Transaktionen + Analysen",
      "roadmap.s2.text": "Einnahmen/Ausgaben, Filter, Tages-/Monatsberichte.",
      "roadmap.s3.title": "KI‑Assistent",
      "roadmap.s3.text": "OpenAI‑Tipps mit aggregiertem Kontext.",

      "pricing.title": "Preise",
      "pricing.desc": "Einfach, transparent, upgrade‑freundlich.",
      "pricing.free.title": "Free",
      "pricing.free.l1": "Transaktionen",
      "pricing.free.l2": "Kategorien",
      "pricing.free.l3": "Basis‑Reports",
      "pricing.free.cta": "Testen",

      "pricing.pro.tag": "Empfohlen",
      "pricing.pro.title": "Pro",
      "pricing.per": "/Mon",
      "pricing.pro.l1": "Erweiterte Analysen",
      "pricing.pro.l2": "Export",
      "pricing.pro.l3": "Ziele & Limits",
      "pricing.pro.cta": "Pro starten",

      "pricing.ai.title": "KI",
      "pricing.ai.l1": "KI‑Spartipps",
      "pricing.ai.l2": "Kategorie‑Vorschläge",
      "pricing.ai.l3": "Personalisierte Insights",
      "pricing.ai.cta": "KI aktivieren",

      "faq.title": "FAQ",
      "faq.desc": "Kurze Antworten auf häufige Fragen.",
      "faq.q1": "Ist das ein fertiges Produkt?",
      "faq.a1":
        "Das ist die Landingpage. Als Nächstes kommen Auth, Speicherung, Analysen und der KI‑Assistent.",
      "faq.q2": "Können wir schnell ein Dashboard bauen?",
      "faq.a2": "Ja. Nächster Schritt: Backend + Datenbank und geschützte Routen wie /app.",
      "faq.q3": "Wie funktioniert der KI‑Assistent?",
      "faq.a3":
        "Wir senden aggregierte Daten (Kategorien, Summen, Zeitraum) und erhalten umsetzbare Tipps—ohne unnötige persönliche Details.",

      "cta.title": "Bereit loszulegen?",
      "cta.text": "Erstelle ein Konto — als Nächstes bauen wir das Dashboard.",
      "cta.button": "Loslegen",

      "footer.rights": "Quantiva. Alle Rechte vorbehalten.",

      "login.title": "Anmelden",
      "login.email": "E‑Mail",
      "login.password": "Passwort",
      "login.submit": "Anmelden",
      "login.hint1": "Neu hier?",
      "login.hint2": "Konto erstellen",

      "signup.title": "Konto erstellen",
      "signup.name": "Name",
      "signup.email": "E‑Mail",
      "signup.password": "Passwort",
      "signup.submit": "Konto erstellen",
      "signup.hint1": "Schon ein Konto?",
      "signup.hint2": "Anmelden",

      "toast.login": "Angemeldet (Demo). Nächster Schritt: Backend.",
      "toast.signup": "Konto erstellt (Demo). Nächster Schritt: Backend.",
    },

    ru: {
      "nav.features": "Функции",
      "nav.security": "Безопасность",
      "nav.pricing": "Тарифы",
      "nav.faq": "FAQ",
      "nav.signin": "Войти",
      "nav.getstarted": "Начать",

      "hero.pill": "AI‑бухгалтер нового поколения",
      "hero.title1": "Учитывай доходы и расходы.",
      "hero.title2": "Получай советы по экономии от AI.",
      "hero.subtitle":
        "Quantiva помогает фиксировать операции, видеть аналитику по дням/месяцам и превращать хаос расходов в понятный план.",
      "hero.cta1": "Создать аккаунт",
      "hero.cta2": "Посмотреть функции",
      "hero.stat1.value": "30 сек",
      "hero.stat1.label": "до первого отчёта",
      "hero.stat2.value": "1 клик",
      "hero.stat2.label": "быстрое добавление",
      "hero.stat3.value": "AI",
      "hero.stat3.label": "персональные рекомендации",

      "panel.title": "Сводка",
      "panel.chip": "Декабрь",
      "panel.balance.label": "Баланс",
      "panel.balance.hint": "+8,4% за 30 дней",
      "panel.spend.label": "Расходы",
      "panel.spend.hint": "−2,1% за неделю",
      "panel.chart.mon": "Пн",
      "panel.chart.tue": "Вт",
      "panel.chart.wed": "Ср",
      "panel.chart.thu": "Чт",
      "panel.chart.fri": "Пт",
      "panel.aitip.badge": "AI‑совет",
      "panel.aitip.text":
        "Попробуй ограничить доставку еды до 1 раза в неделю — экономия ≈ €65/мес.",
      "panel.aitip.cta": "Включить AI‑ассистента",

      "features.title": "Что умеет Quantiva",
      "features.desc": "Минимум кликов. Максимум ясности.",
      "features.f1.title": "Доходы и расходы",
      "features.f1.text": "Быстро добавляй операции с категориями и заметками.",
      "features.f2.title": "Аналитика",
      "features.f2.text": "Тренды по дням и месяцам, понятные итоги и контроль бюджета.",
      "features.f3.title": "AI‑рекомендации",
      "features.f3.text": "Ассистент замечает паттерны и предлагает конкретные действия для экономии.",

      "security.title": "Безопасность по дизайну",
      "security.desc":
        "Мы строим систему так, чтобы она безопасно масштабировалась. Сегодня лендинг — завтра полноценный продукт.",
      "security.b1": "Чёткое разделение публичной части и приватного кабинета",
      "security.b2": "Сессионная авторизация и защищённые формы",
      "security.b3": "Готовность к БД и аудит‑логированию",

      "roadmap.title": "Роадмап продукта",
      "roadmap.s1.title": "Лендинг + Auth",
      "roadmap.s1.text": "Регистрация/вход и базовая навигация.",
      "roadmap.s2.title": "Операции + Аналитика",
      "roadmap.s2.text": "Доходы/расходы, фильтры, отчёты по дням/месяцам.",
      "roadmap.s3.title": "AI‑ассистент",
      "roadmap.s3.text": "Советы через OpenAI на основе агрегированного контекста.",

      "pricing.title": "Тарифы",
      "pricing.desc": "Просто, прозрачно, легко апгрейдить.",
      "pricing.free.title": "Free",
      "pricing.free.l1": "Операции",
      "pricing.free.l2": "Категории",
      "pricing.free.l3": "Базовые отчёты",
      "pricing.free.cta": "Попробовать",

      "pricing.pro.tag": "Рекомендуем",
      "pricing.pro.title": "Pro",
      "pricing.per": "/мес",
      "pricing.pro.l1": "Расширенная аналитика",
      "pricing.pro.l2": "Экспорт",
      "pricing.pro.l3": "Цели и лимиты",
      "pricing.pro.cta": "Подключить Pro",

      "pricing.ai.title": "AI",
      "pricing.ai.l1": "AI‑советы по экономии",
      "pricing.ai.l2": "Подсказки по категориям",
      "pricing.ai.l3": "Персональные инсайты",
      "pricing.ai.cta": "Включить AI",

      "faq.title": "FAQ",
      "faq.desc": "Быстрые ответы на популярные вопросы.",
      "faq.q1": "Это уже готовый продукт?",
      "faq.a1":
        "Сейчас это лендинг. Далее добавим auth, хранение операций, аналитику и AI‑ассистента.",
      "faq.q2": "Можно быстро сделать dashboard?",
      "faq.a2": "Да. Следующий шаг — backend + база данных и защищённые страницы типа /app.",
      "faq.q3": "Как будет работать AI‑ассистент?",
      "faq.a3":
        "Мы отправим агрегированные данные (категории, суммы, период) и получим понятные действия — без лишних личных деталей.",

      "cta.title": "Готов начать?",
      "cta.text": "Создай аккаунт — дальше соберём dashboard.",
      "cta.button": "Начать",

      "footer.rights": "Quantiva. Все права защищены.",

      "login.title": "Вход",
      "login.email": "Email",
      "login.password": "Пароль",
      "login.submit": "Войти",
      "login.hint1": "Впервые здесь?",
      "login.hint2": "Создать аккаунт",

      "signup.title": "Регистрация",
      "signup.name": "Имя",
      "signup.email": "Email",
      "signup.password": "Пароль",
      "signup.submit": "Создать аккаунт",
      "signup.hint1": "Уже есть аккаунт?",
      "signup.hint2": "Войти",

      "toast.login": "Вход выполнен (демо). Дальше подключим backend.",
      "toast.signup": "Аккаунт создан (демо). Дальше подключим backend.",
    },
  };

  function normalizeLang(lang) {
    const v = String(lang || "").toLowerCase();
    return v === "de" || v === "ru" || v === "en" ? v : "en";
  }

  function t(key) {
    const lang = normalizeLang(localStorage.getItem(STORAGE_KEY) || "en");
    const dict = I18N[lang] || I18N.en;
    return dict[key] || (I18N.en[key] ?? key);
  }

  function applyLang(lang) {
    const L = normalizeLang(lang);
    const dict = I18N[L] || I18N.en;

    // translate all marked nodes
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      if (dict[key]) el.textContent = dict[key];
      else if (I18N.en[key]) el.textContent = I18N.en[key];
    });

    // update all language labels (there are 2: desktop + mobile)
    $$("[data-lang-label]").forEach((el) => {
      el.textContent = L.toUpperCase();
    });

    document.documentElement.lang = L;
    localStorage.setItem(STORAGE_KEY, L);
  }

  // -----------------------------
  // Language UI (supports multiple switchers)
  // -----------------------------
  function setupLangSwitcher(root = document) {
    const btn = $("[data-lang-btn]", root);
    const menu = $("[data-lang-menu]", root);
    if (!btn || !menu) return;

    const close = () => menu.classList.remove("is-open");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("is-open");
    });

    menu.addEventListener("click", (e) => {
      const target = e.target.closest("[data-set-lang]");
      if (!target) return;
      const lang = target.getAttribute("data-set-lang");
      applyLang(lang);
      close();
    });

    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  // Setup both desktop and mobile language blocks (if both exist)
  setupLangSwitcher(document);

  // -----------------------------
  // Init language
  // -----------------------------
  applyLang(normalizeLang(localStorage.getItem(STORAGE_KEY) || "en"));

  // expose for debugging if needed (optional)
  // window.Quantiva = { applyLang };
})();


