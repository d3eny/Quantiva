/* =========================================================
   Quantiva — app.js (FULL i18n + moustache renderer)
   - Renders {{path.to.key}} placeholders in HTML text nodes
   - Also supports data-i18n / data-i18n-placeholder / data-i18n-html
   - Full EN/DE/RU dictionary (RU uses "ИИ")
   - Header hide-on-scroll, smooth anchors, reveal, demo scenario, skeleton
   - Safe: won't crash if some elements are missing
   ========================================================= */

(() => {
  "use strict";

  /* -----------------------------
     Helpers
  ----------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const safeText = (el, v) => el && (el.textContent = String(v ?? ""));
  const safeHTML = (el, v) => el && (el.innerHTML = String(v ?? ""));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function interpolate(str, vars = {}) {
    return String(str).replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] != null ? String(vars[k]) : `{${k}}`
    );
  }

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

  function deepMerge(base, extra) {
    if (!extra || typeof extra !== "object") return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(extra).forEach((k) => {
      const bv = out[k];
      const ev = extra[k];
      if (bv && typeof bv === "object" && !Array.isArray(bv) && ev && typeof ev === "object" && !Array.isArray(ev)) {
        out[k] = deepMerge(bv, ev);
      } else {
        out[k] = ev;
      }
    });
    return out;
  }

  /* -----------------------------
     FULL dictionary
     (If you have your own bigger dictionary later, you can add it as:
      window.QUANTIVA_TRANSLATIONS = { en:{...}, de:{...}, ru:{...} } BEFORE app.js runs,
      and it will merge without losing anything.)
  ----------------------------- */
  const DEFAULT_TRANSLATIONS = {
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
        seg: { student: "Student", freelancer: "Freelancer", family: "Family" },

        balance: { label: "Balance", hint: "+8.4% over 30 days" },
        spend: { label: "Spending", hint: "-2.1% this week" },

        chart: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri" },

        aitip: {
          badge: "AI tip",
          text: "Try limiting food delivery to once a week — estimated savings ≈ €{v}/month.",
          cta: "Enable AI assistant",
        },
      },

      ai: {
        why: "Why?",
        whyTitle: "Why this suggestion?",
        whyText:
          "Based on your food & transport spending over the last 30 days and weekly trends. Demo explanation.",
      },

      sections: {
        features: {
          title: "Features built for clarity",
          desc: "Fast logging, smart categories, and insights that stay understandable.",
          card1: { title: "Categories", text: "Auto-detect categories and keep your budgeting consistent." },
          card2: { title: "Reports", text: "Daily and monthly summaries with clean trends." },
          card3: { title: "AI suggestions", text: "Practical tips based on aggregated spending patterns." },
        },

        security: {
          title: "Security by design",
          lead:
            "We structure the system so it can scale safely from day one. Today it’s a landing page — next it becomes a full product.",
          bullets: [
            "Clear separation between public pages and your private app",
            "Session-based auth and protected forms",
            "Ready for database storage and audit logging",
          ],
        },

        roadmap: {
          title: "Product roadmap",
          step1: { title: "Landing + Auth", text: "Sign up / sign in and basic navigation." },
          step2: { title: "Transactions + Analytics", text: "Income/expense logging, filters, daily/monthly reports." },
          step3: { title: "AI Assistant", text: "AI-powered advice, using aggregated transaction context." },
        },

        trust: {
          card1: {
            title: "How AI works",
            bullets: [
              "AI uses aggregated totals and category trends (not raw bank credentials).",
              "You can enable/disable AI at any time.",
              "Advice is actionable, not generic.",
            ],
          },
          card2: {
            title: "Privacy first",
            bullets: [
              "No bank login required.",
              "Built with secure storage and audit-ready structure.",
              "EU-ready approach (GDPR-aligned by design).",
            ],
          },
          card3: {
            title: "What’s next",
            bullets: [
              "Budgets, goals and spending limits.",
              "Exports (CSV/PDF) and reporting.",
              "Smarter AI insights with weekly summaries.",
            ],
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
            bullets: ["Basic reports", "Manual categories", "Limited insights"],
            cta: "Try it",
          },
          pro: {
            tag: "Popular",
            title: "Pro",
            price: "€9",
            per: "/mo",
            bullets: ["Smart categories", "Goals & limits", "Exports (CSV/PDF)"],
            cta: "Start Pro",
          },
          ai: {
            tag: "New",
            title: "AI",
            price: "€19",
            per: "/mo",
            bullets: ["Personalized insights", "Weekly summaries", "Reasoning preview"],
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
      },

      footer: {
        rights: "© 2025 Quantiva. All rights reserved.",
        micro:
          "Privacy-first. No bank credentials required. We never store raw transaction descriptions.",
      },

      modals: {
        signin: { title: "Sign in", hint: "Use any email/password (demo)." },
        signup: { title: "Create account", hint: "We’ll send nothing — this is a demo." },
        fields: { email: "Email", password: "Password" },
        submit: "Continue",
        links: { noAccount: "No account?", create: "Create one", haveAccount: "Already have an account?", signin: "Sign in" },
      },

      empty: { title: "No data yet", text: "Add your first transaction to unlock insights." },

      lang: { menuTitle: "Language", en: "English", de: "Deutsch", ru: "Русский" },
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
        seg: { student: "Student", freelancer: "Freelancer", family: "Familie" },

        balance: { label: "Kontostand", hint: "+8,4% in 30 Tagen" },
        spend: { label: "Ausgaben", hint: "-2,1% diese Woche" },

        chart: { mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr" },

        aitip: {
          badge: "KI‑Tipp",
          text: "Begrenze Lieferessen auf 1× pro Woche — Ersparnis ≈ €{v}/Monat.",
          cta: "KI‑Assistent aktivieren",
        },
      },

      ai: {
        why: "Warum?",
        whyTitle: "Warum dieser Vorschlag?",
        whyText:
          "Basierend auf Ausgaben für Essen & Transport (30 Tage) und Wochen‑Trends. Demo‑Erklärung.",
      },

      sections: {
        features: {
          title: "Funktionen für Klarheit",
          desc: "Schnelles Logging, smarte Kategorien und verständliche Insights.",
          card1: { title: "Kategorien", text: "Automatische Kategorien und konsistentes Budgeting." },
          card2: { title: "Reports", text: "Tages- und Monatsübersichten mit Trends." },
          card3: { title: "KI‑Vorschläge", text: "Praktische Tipps auf Basis aggregierter Muster." },
        },

        security: {
          title: "Security by design",
          lead:
            "Wir strukturieren das System so, dass es sicher skalieren kann. Heute Landing — morgen Vollprodukt.",
          bullets: [
            "Klare Trennung zwischen öffentlichem Bereich und privater App",
            "Session‑Auth und geschützte Formulare",
            "Bereit für Datenbank & Audit‑Logs",
          ],
        },

        roadmap: {
          title: "Roadmap",
          step1: { title: "Landing + Auth", text: "Registrierung/Anmelden und Navigation." },
          step2: { title: "Transaktionen + Analysen", text: "Einnahmen/Ausgaben, Filter, Tages/Monats‑Reports." },
          step3: { title: "KI‑Assistent", text: "Tipps auf Basis aggregierten Kontexts." },
        },

        trust: {
          card1: {
            title: "So arbeitet die KI",
            bullets: [
              "KI nutzt aggregierte Summen & Kategorie‑Trends (keine Bank‑Credentials).",
              "KI lässt sich jederzeit an/aus schalten.",
              "Tipps sind konkret, nicht generisch.",
            ],
          },
          card2: {
            title: "Privacy first",
            bullets: [
              "Kein Bank‑Login nötig.",
              "Sichere Struktur, audit‑ready.",
              "EU‑ready (GDPR‑aligned by design).",
            ],
          },
          card3: {
            title: "Was als Nächstes kommt",
            bullets: ["Budgets, Ziele und Limits.", "Export (CSV/PDF) und Reporting.", "Bessere KI‑Insights mit Wochen‑Summaries."],
          },
        },

        pricing: {
          title: "Preise",
          desc: "Kostenlos starten. Upgraden, wenn du mehr brauchst.",
          free: {
            tag: "Gratis",
            title: "Starter",
            price: "0€",
            per: "/Monat",
            bullets: ["Basis‑Reports", "Manuelle Kategorien", "Limitierte Insights"],
            cta: "Testen",
          },
          pro: {
            tag: "Beliebt",
            title: "Pro",
            price: "9€",
            per: "/Monat",
            bullets: ["Smarte Kategorien", "Ziele & Limits", "Export (CSV/PDF)"],
            cta: "Pro starten",
          },
          ai: {
            tag: "Neu",
            title: "KI",
            price: "19€",
            per: "/Monat",
            bullets: ["Personalisierte Insights", "Wochen‑Summary", "Reasoning‑Preview"],
            cta: "KI aktivieren",
          },
        },

        faq: {
          title: "FAQ",
          desc: "Kurze Antworten auf häufige Fragen.",
          q1: "Ist das ein fertiges Produkt?",
          a1: "Noch nicht — aber eine polierte Demo mit klarer Vision.",
          q2: "Kann man schnell ein Dashboard bauen?",
          a2: "Ja. Das UI ist bereit für einen /app‑Prototyp oder später ein Backend.",
          q3: "Wie funktioniert der KI‑Assistent?",
          a3: "KI nutzt aggregierte Trends und erklärt das „Warum“.",
        },

        cta: {
          title: "Bereit zu starten?",
          text: "Erstelle ein Konto — als Nächstes bauen wir das Dashboard.",
          button: "Starten",
        },
      },

      footer: {
        rights: "© 2025 Quantiva. Alle Rechte vorbehalten.",
        micro:
          "Privacy‑first. Keine Bank‑Credentials nötig. Keine Speicherung roher Transaktionsbeschreibungen.",
      },

      modals: {
        signin: { title: "Anmelden", hint: "Beliebige E‑Mail/Passwort (Demo)." },
        signup: { title: "Konto erstellen", hint: "Wir senden nichts — Demo." },
        fields: { email: "E‑Mail", password: "Passwort" },
        submit: "Weiter",
        links: { noAccount: "Kein Konto?", create: "Erstellen", haveAccount: "Schon ein Konto?", signin: "Anmelden" },
      },

      empty: { title: "Noch keine Daten", text: "Füge die erste Transaktion hinzu, um Insights zu sehen." },

      lang: { menuTitle: "Sprache", en: "English", de: "Deutsch", ru: "Русский" },
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
        seg: { student: "Студент", freelancer: "Фрилансер", family: "Семья" },

        balance: { label: "Баланс", hint: "+8,4% за 30 дней" },
        spend: { label: "Расходы", hint: "-2,1% на этой неделе" },

        chart: { mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт" },

        aitip: {
          badge: "ИИ‑совет",
          text: "Ограничь доставку еды до 1 раза в неделю — экономия ≈ €{v}/мес.",
          cta: "Включить ИИ‑ассистента",
        },
      },

      ai: {
        why: "Почему?",
        whyTitle: "Почему такая рекомендация?",
        whyText:
          "На основе тренда трат на еду/транспорт за 30 дней и недельных изменений. Демо‑объяснение.",
      },

      sections: {
        features: {
          title: "Функции для ясности",
          desc: "Быстрый ввод, умные категории и инсайты без «магии».",
          card1: { title: "Категории", text: "Подсказки категорий и стабильный учёт бюджета." },
          card2: { title: "Отчёты", text: "Сводки по дням и месяцам с понятными трендами." },
          card3: { title: "ИИ‑рекомендации", text: "Практичные советы на основе агрегированных паттернов." },
        },

        security: {
          title: "Безопасность по умолчанию",
          lead:
            "Мы строим структуру так, чтобы продукт безопасно масштабировался. Сегодня это лендинг — завтра полноценный продукт.",
          bullets: [
            "Разделение публичной части и приватной app‑зоны",
            "Сессии и защищённые формы",
            "Готово к БД и аудит‑логам",
          ],
        },

        roadmap: {
          title: "Roadmap",
          step1: { title: "Лендинг + Auth", text: "Регистрация/вход и навигация." },
          step2: { title: "Транзакции + Аналитика", text: "Ввод, фильтры, отчёты по дням/месяцам." },
          step3: { title: "ИИ‑ассистент", text: "Советы на основе агрегированного контекста." },
        },

        trust: {
          card1: {
            title: "Как работает ИИ",
            bullets: [
              "ИИ использует агрегированные суммы и тренды категорий (без банковских логинов).",
              "ИИ можно включать/выключать в любой момент.",
              "Советы конкретные, а не «общие слова».",
            ],
          },
          card2: {
            title: "Privacy first",
            bullets: [
              "Подключение банка не требуется.",
              "Безопасная структура и готовность к аудиту.",
              "EU‑ready подход (GDPR‑aligned by design).",
            ],
          },
          card3: {
            title: "Что дальше",
            bullets: ["Бюджеты, цели и лимиты.", "Экспорт (CSV/PDF) и отчётность.", "Умные ИИ‑сводки по неделям."],
          },
        },

        pricing: {
          title: "Цены",
          desc: "Начни бесплатно. Обновляйся, когда понадобится больше автоматизации.",
          free: {
            tag: "Бесплатно",
            title: "Starter",
            price: "0€",
            per: "/мес",
            bullets: ["Базовые отчёты", "Ручные категории", "Ограниченные инсайты"],
            cta: "Попробовать",
          },
          pro: {
            tag: "Популярно",
            title: "Pro",
            price: "9€",
            per: "/мес",
            bullets: ["Умные категории", "Цели и лимиты", "Экспорт (CSV/PDF)"],
            cta: "Start Pro",
          },
          ai: {
            tag: "Новое",
            title: "ИИ",
            price: "19€",
            per: "/мес",
            bullets: ["Персональные инсайты", "Еженедельные сводки", "Пояснение «почему»"],
            cta: "Включить ИИ",
          },
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

        cta: {
          title: "Готов начать?",
          text: "Создай аккаунт — дальше соберём дашборд.",
          button: "Начать",
        },
      },

      footer: {
        rights: "© 2025 Quantiva. Все права защищены.",
        micro:
          "Privacy‑first. Банковские логины не нужны. Мы не храним «сырые» описания транзакций.",
      },

      modals: {
        signin: { title: "Войти", hint: "Любой email/пароль (демо)." },
        signup: { title: "Создать аккаунт", hint: "Мы ничего не отправляем — демо." },
        fields: { email: "Email", password: "Пароль" },
        submit: "Продолжить",
        links: { noAccount: "Нет аккаунта?", create: "Создать", haveAccount: "Уже есть аккаунт?", signin: "Войти" },
      },

      empty: { title: "Пока нет данных", text: "Добавь первую транзакцию, чтобы открыть инсайты." },

      lang: { menuTitle: "Язык", en: "English", de: "Deutsch", ru: "Русский" },
      toast: { saved: "Сохранено", lang: "Язык изменён" },
    },
  };

  // Merge with optional external translations (won't lose anything)
  const translations = deepMerge(DEFAULT_TRANSLATIONS, window.QUANTIVA_TRANSLATIONS);

  const LANGS = ["en", "de", "ru"];
  const state = {
    lang: "en",
    scenario: "student",
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

  const missingKeys = new Set();

  function t(path) {
    const dict = translations[state.lang] || translations.en;
    const v = getPath(dict, path);
    if (v != null) return v;

    const fb = getPath(translations.en, path);
    if (fb != null) return fb;

    missingKeys.add(path);
    return `{{${path}}}`;
  }

  /* -----------------------------
     Render {{...}} placeholders in TEXT nodes
  ----------------------------- */
  function renderTemplatesInText() {
    const re = /\{\{\s*([^}]+?)\s*\}\}/g;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const s = node.nodeValue;
        if (!s) return NodeFilter.FILTER_REJECT;
        re.lastIndex = 0;
        return re.test(s) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      re.lastIndex = 0;
      node.nodeValue = node.nodeValue.replace(re, (_, key) => {
        const val = t(key.trim());
        return typeof val === "string" ? val : String(val ?? "");
      });
    });
  }

  /* -----------------------------
     Render {{...}} placeholders inside common ATTRIBUTES
     (important when placeholders live in aria-label / placeholder / title)
  ----------------------------- */
  function renderTemplatesInAttrs() {
    const re = /\{\{\s*([^}]+?)\s*\}\}/g;
    const attrList = ["placeholder", "title", "aria-label", "alt"];

    $$("*").forEach((el) => {
      attrList.forEach((attr) => {
        const v = el.getAttribute(attr);
        if (!v || !v.includes("{{")) return;
        re.lastIndex = 0;
        const next = v.replace(re, (_, key) => {
          const val = t(key.trim());
          return typeof val === "string" ? val : String(val ?? "");
        });
        el.setAttribute(attr, next);
      });
    });
  }

  /* -----------------------------
     Also support data-i18n (compat)
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

  function renderAllTexts() {
    missingKeys.clear();
    applyDataI18n();
    renderTemplatesInText();
    renderTemplatesInAttrs();

    if (missingKeys.size) {
      // shows ONLY keys that exist in HTML but missing in dictionary
      console.warn("Missing i18n keys:", [...missingKeys].sort());
    }
  }

  /* -----------------------------
     Demo scenario (numbers + bars + AI tip)
  ----------------------------- */
  const scenarioData = {
    student: { balance: 1284.2, spending: 642.1, savings: 65, bars: [0.52, 0.34, 0.76, 0.45, 0.62] },
    freelancer: { balance: 3920.55, spending: 1210.4, savings: 110, bars: [0.32, 0.58, 0.41, 0.66, 0.49] },
    family: { balance: 5640.9, spending: 2385.75, savings: 180, bars: [0.61, 0.43, 0.71, 0.54, 0.69] },
  };

  function fakeLoading(done) {
    const panel = $("#overviewPanel") || $(".panel");
    if (!panel || prefersReducedMotion()) return done?.();
    panel.classList.add("is-loading");
    setTimeout(() => {
      panel.classList.remove("is-loading");
      done?.();
    }, 520);
  }

  function renderScenario() {
    const d = scenarioData[state.scenario] || scenarioData.student;

    const bal = $("#kpiBalance") || $('[data-kpi="balance"]');
    const sp = $("#kpiSpending") || $('[data-kpi="spending"]');
    if (bal) safeText(bal, formatEUR(d.balance, state.lang));
    if (sp) safeText(sp, formatEUR(d.spending, state.lang));

    const tipText = $("#aiTipText") || $('[data-ai="tip-text"]');
    if (tipText) safeText(tipText, interpolate(t("panel.aitip.text"), { v: d.savings }));

    const fills = $$("[data-bar-fill], .bar__fill");
    fills.forEach((el, i) => {
      const v = d.bars[i] ?? 0.3;
      el.style.width = `${clamp(v, 0.08, 0.98) * 100}%`;
    });

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
     Header hide-on-scroll (Safari-like)
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
     Reveal
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
    window.addEventListener("resize", close);
  }

  /* -----------------------------
     Language switch (floating)
  ----------------------------- */
  function setLang(next) {
    state.lang = normalizeLang(next);
    document.documentElement.setAttribute("lang", state.lang);
    localStorage.setItem("quantiva_lang", state.lang);

    renderAllTexts();
    renderScenario();
  }

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
        const next = item.dataset.lang || item.getAttribute("data-lang");
        setLang(next);
        close();
      });
    });

    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
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
    state.lang = normalizeLang(localStorage.getItem("quantiva_lang") || navigator.language);
    state.scenario = (localStorage.getItem("quantiva_scenario") || "student").toLowerCase();
    if (!scenarioData[state.scenario]) state.scenario = "student";

    document.documentElement.setAttribute("lang", state.lang);

    renderAllTexts();

    initHeaderHide();
    initReveal();
    initScenarioTabs();
    initTooltip();
    initLanguage();
    initAnchors();

    fakeLoading(() => renderScenario());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
