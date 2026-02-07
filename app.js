

/* ================================
   Supabase safe init
================================ */

// --- Supabase client (single init) ---
/* ================================
   Supabase safe init (guarded)
================================ */



const SUPABASE_URL = "https://towzwaximnwmkeyvthvk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvd3p3YXhpbW53bWtleXZ0aHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTgxMjQsImV4cCI6MjA4MjA5NDEyNH0.UcR2Vo4zQnQSmxG2TfiQvkHK9qRb_3W6g3knXG8PsrI";
const sb =
  window.supabase && typeof window.supabase.createClient === "function"
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
window.sb = sb; // чтобы можно было дебажить в консоли
// Optional debug helper (does NOT break the page)
window.testSignup = async () => {
  if (!sb) return console.error("Supabase SDK not loaded (check script order).");
  const { data, error } = await sb.auth.signUp({
    email: "test+" + Date.now() + "@mail.com",
    password: "12345678",
  });
  console.log({ data, error });
};
(() => {
  "use strict";

  /* -----------------------------
     Helpers
  ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  const LANG_KEY = "quantiva_lang";

  /* -----------------------------
     Header hide on scroll (Safari-like)
  ----------------------------- */
  const header = $("[data-header]");
  let lastY = window.scrollY || 0;
  let acc = 0; // accumulate scroll to avoid jitter
  const HIDE_AFTER = 90; // px
  const SHOW_AFTER = 24; // px

  function onScrollHeader() {
    if (!header) return;
    const y = window.scrollY || 0;
    const dy = y - lastY;

    if (y < 8) {
      header.classList.remove("is-hidden");
      acc = 0;
      lastY = y;
      return;
    }

    if (Math.abs(dy) < 2) {
      lastY = y;
      return;
    }

    if (dy > 0) {
      acc = clamp(acc + dy, 0, 999);
      if (acc > HIDE_AFTER) header.classList.add("is-hidden");
    } else {
      acc = clamp(acc + dy, -999, 999);
      if (acc < -SHOW_AFTER) header.classList.remove("is-hidden");
    }

    lastY = y;
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* -----------------------------
     Mobile menu
  ----------------------------- */
  const burger = $("[data-burger]");
  const mobileNav = $("[data-mobile-nav]");

  function setMobile(open) {
    if (!mobileNav) return;
    mobileNav.style.display = open ? "block" : "none";
    if (burger) burger.setAttribute("aria-expanded", String(open));
  }

  if (burger && mobileNav) {
    setMobile(false);

    burger.addEventListener("click", () => {
      const isOpen = mobileNav.style.display === "block";
      setMobile(!isOpen);
    });

    $$(".mobile-nav a", mobileNav).forEach((a) => {
      a.addEventListener("click", () => setMobile(false));
    });

    document.addEventListener("click", (e) => {
      if (mobileNav.style.display !== "block") return;
      const t = e.target;
      if (t === burger || (burger && burger.contains(t))) return;
      if (t === mobileNav || mobileNav.contains(t)) return;
      setMobile(false);
    });
  }

  /* -----------------------------
     Scroll reveal (IntersectionObserver)
  ----------------------------- */
  const revealEls = $$("[data-reveal]");
  if (!prefersReducedMotion() && "IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* -----------------------------
     Preview panel: Skeleton + demo states
  ----------------------------- */
  const panel = $("[data-panel]");
  const empty = $("[data-empty]");
  const chart = $("[data-chart]");
  const kpiBalance = $('[data-kpi="balance"] [data-kpi-text]');
  const kpiSpending = $('[data-kpi="spending"] [data-kpi-text]');
  const barFills = $$(".bar__fill", chart || document);

  const scenarios = {
    student: {
      balance: "€ 1,284.20",
      spending: "€ 642.10",
      bars: [55, 32, 78, 46, 66],
      showEmpty: false,
      tip: {
        en: "Try limiting food delivery to once a week — estimated savings ≈ €65/month.",
        de: "Begrenze Lieferdienste auf 1×/Woche — geschätzte Ersparnis ≈ 65 €/Monat.",
        ru: "Ограничь доставку еды до 1 раза в неделю — экономия ≈ €65/мес.",
      },
      hints: {
        balance: { en: "+4.2% over 30 days", de: "+4,2% in 30 Tagen", ru: "+4,2% за 30 дней" },
        spending: { en: "−1.1% this week", de: "−1,1% diese Woche", ru: "−1,1% на этой неделе" },
      },
    },
    family: {
      balance: "€ 2,105.70",
      spending: "€ 1,534.30",
      bars: [62, 58, 71, 66, 74],
      showEmpty: false,
      tip: {
        en: "Create a weekly grocery cap — small limits reduce month-end overspend without feeling restrictive.",
        de: "Setze ein wöchentliches Haushaltslimit – kleine Grenzen senken das Monatsende ohne Verzichtsgefühl.",
        ru: "Ставь недельный лимит на продукты — небольшие рамки снижают перерасход в конце месяца.",
      },
      hints: {
        balance: { en: "+6.8% over 30 days", de: "+6,8% in 30 Tagen", ru: "+6,8% за 30 дней" },
        spending: { en: "−1.7% this week", de: "−1,7% diese Woche", ru: "−1,7% на этой неделе" },
      },
    },
    business: {
      balance: "€ 18,450.75",
      spending: "€ 7,320.40",
      bars: [55, 72, 68, 80, 74],
      showEmpty: false,
      tip: {
        en: "Maintain a 3–6 month cash buffer to stabilize operating expenses.",
        de: "Halte eine Cash-Reserve für 3–6 Monate, um Betriebskosten zu stabilisieren.",
        ru: "Держите резерв 3–6 месяцев оборотки, чтобы сглаживать операционные расходы.",
      },
      hints: {
        balance: { en: "+12.6% over 30 days", de: "+12,6% in 30 Tagen", ru: "+12,6% за 30 дней" },
        spending: { en: "+3.9% this week", de: "+3,9% diese Woche", ru: "+3,9% на этой неделе" },
      },
    },
  };

  const aiText = $(".ai-tip__text", panel || document);
  const kpiBalanceHint = $(`[data-i18n="panel.balance.hint"]`, panel || document);
  const kpiSpendingHint = $(`[data-i18n="panel.spend.hint"]`, panel || document);

  let currentScenario = "student";

  function setBars(percentArr) {
    if (!barFills.length) return;
    barFills.forEach((fill, idx) => {
      const v = percentArr[idx] ?? 50;
      fill.style.width = `${clamp(v, 6, 96)}%`;
    });
  }

  function setKPIs({ balance, spending }) {
    if (kpiBalance) kpiBalance.textContent = balance;
    if (kpiSpending) kpiSpending.textContent = spending;
  }

  function setTip(text) {
    if (aiText) aiText.textContent = text;
  }

  function setHints(key) {
    const sc = scenarios[key];
    const lang = localStorage.getItem(LANG_KEY) || "en";
    if (kpiBalanceHint && sc?.hints?.balance?.[lang]) kpiBalanceHint.textContent = sc.hints.balance[lang];
    if (kpiSpendingHint && sc?.hints?.spending?.[lang]) kpiSpendingHint.textContent = sc.hints.spending[lang];
  }

  function setEmptyState(on) {
    if (!empty) return;
    empty.classList.toggle("is-on", !!on);
    if (chart) chart.classList.toggle("is-empty", !!on);
  }

  function applyScenario(key) {
    const sc = scenarios[key] || scenarios.student;
    currentScenario = key;
    setKPIs(sc);
    setBars(sc.bars);
    const L = localStorage.getItem(LANG_KEY) || "en";
    setTip(sc.tip?.[L] || sc.tip);
    setHints(key);
    setEmptyState(sc.showEmpty);
  }

  function fakeLoadPanel() {
    if (!panel) return;
    panel.classList.add("is-loading");
    setEmptyState(false);
    const t = prefersReducedMotion() ? 0 : 1100;
    window.setTimeout(() => {
      panel.classList.remove("is-loading");
    }, t);
  }

  const seg = $("[data-seg]");
  if (seg) {
    seg.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-scenario]");
      if (!btn) return;
      const key = btn.getAttribute("data-scenario");

      $$(".seg__btn", seg).forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });

      if (panel && !prefersReducedMotion()) {
        panel.classList.add("is-loading");
        window.setTimeout(() => {
          applyScenario(key);
          panel.classList.remove("is-loading");
        }, 520);
      } else {
        applyScenario(key);
      }
    });
  }

  applyScenario("student");
  fakeLoadPanel();

  /* -----------------------------
     AI "Why?" tooltip
  ----------------------------- */
  const whyBtn = $("[data-ai-why]");
  const whyTip = $("[data-ai-tip]");

  function closeTip() {
    if (!whyTip) return;
    whyTip.classList.remove("is-open");
  }
  function toggleTip() {
    if (!whyTip) return;
    whyTip.classList.toggle("is-open");
  }

  if (whyBtn && whyTip) {
    whyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTip();
    });

    document.addEventListener("click", (e) => {
      if (!whyTip.classList.contains("is-open")) return;
      const t = e.target;
      if (t === whyBtn || whyBtn.contains(t)) return;
      if (t === whyTip || whyTip.contains(t)) return;
      closeTip();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeTip();
    });
  }

  /* -----------------------------
     Language switch (EN/DE/RU)
  ----------------------------- */
  const langBtn = $("[data-lang-btn]");
  const langMenu = $("[data-lang-menu]");
  const langLabel = $("[data-lang-label]");

  const dict = {
    en: {
      "nav.features": "Features",
      "nav.security": "Security",
      "nav.pricing": "Pricing",
      "nav.faq": "FAQ",
      "nav.signin": "Sign in",
      "nav.getstarted": "Get started",
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
      "panel.title": "Overview",
      "panel.chip": "December",
      "demo.student": "Student",
      "demo.family": "Family",
      "demo.business": "Business",
      "panel.balance.label": "Balance",
      "panel.balance.hint": "+4.2% over 30 days",
      "panel.spend.label": "Spending",
      "panel.spend.hint": "−1.1% this week",
      "panel.chart.mon": "Mon",
      "panel.chart.tue": "Tue",
      "panel.chart.wed": "Wed",
      "panel.chart.thu": "Thu",
      "panel.chart.fri": "Fri",
      "panel.aitip.badge": "AI tip",
      "panel.aitip.cta": "Enable AI assistant",
      "panel.aitip.text": "Try limiting food delivery to once a week — estimated savings ≈ €65/month.",
      "ai.why": "Why?",
      "ai.tip.title": "Reasoning preview",
      "ai.tip.text":
        "Based on your food & transport categories over the last 30 days, delivery spikes are driving most of the variance.",
      "empty.title": "No data yet",
      "empty.text": "Add your first transaction to unlock insights and AI recommendations.",
      "how.title": "How Quantiva works",
      "how.desc": "Three steps from chaos to clarity.",
      "how.s1.title": "Add income & expenses",
      "how.s1.text": "Log transactions in seconds with categories and notes.",
      "how.s2.title": "See daily & monthly analytics",
      "how.s2.text": "Understand trends and stay in control of your budget.",
      "how.s3.title": "Get AI savings advice",
      "how.s3.text": "Receive practical actions based on your aggregated patterns.",
      "features.title": "What Quantiva does",
      "features.desc": "Minimal clicks. Maximum clarity.",
      "features.f1.title": "Income & expenses",
      "features.f1.text": "Add transactions quickly with categories and notes. No busywork.",
      "features.f2.title": "Analytics",
      "features.f2.text": "Daily and monthly trends, clear summaries, and budget control.",
      "features.f3.title": "AI recommendations",
      "features.f3.text": "The assistant reviews your spending patterns and suggests concrete savings actions.",
      "aud.title": "Who it’s built for",
      "aud.desc": "Designed for real-life money routines.",
      "aud.a1.title": "Students",
      "aud.a1.text": "Control daily spending and avoid surprises.",
      "aud.a2.title": "Business",
      "aud.a2.text": "Track revenue, expenses and cash flow with clarity.",
      "aud.a3.title": "Families",
      "aud.a3.text": "Budget monthly expenses with clarity and goals.",
      "security.title": "Security by design",
      "security.desc":
        "We structure the system so it can scale safely from day one. Today it’s a landing page — next it becomes a full product.",
      "security.b1": "Clear separation between public pages and your private app",
      "security.b2": "Session-based auth and protected forms",
      "security.b3": "Ready for database storage and audit logging",
      "roadmap.title": "Product roadmap",
      "roadmap.s1.title": "Landing + Auth",
      "roadmap.s1.text": "Sign up / sign in and basic navigation.",
      "roadmap.s2.title": "Transactions + Analytics",
      "roadmap.s2.text": "Income/expense logging, filters, daily/monthly reports.",
      "roadmap.s3.title": "AI Assistant",
      "roadmap.s3.text": "OpenAI-powered advice, using aggregated transaction context.",
      "ai.title": "How AI works",
      "ai.b1": "AI uses aggregated totals and category trends (not raw bank credentials).",
      "ai.b2": "You can enable/disable AI at any time.",
      "ai.b3": "Advice is actionable, not generic.",
      "privacy.title": "Privacy first",
      "privacy.b1": "No bank login required.",
      "privacy.b2": "Built with secure storage and audit-ready structure.",
      "privacy.b3": "EU-ready approach (GDPR-aligned by design).",
      "next.title": "What’s next",
      "next.b1": "Budgets, goals and spending limits.",
      "next.b2": "Exports (CSV/PDF) and reporting.",
      "next.b3": "Smarter AI insights with weekly summaries.",
      "pricing.title": "Pricing",
      "pricing.desc": "Simple tiers, straightforward upgrades.",
      "pricing.free.title": "Student",
      "pricing.free.l1": "Transactions + categories",
      "pricing.free.l2": "Basic analytics (monthly/daily)",
      "pricing.free.l3": "1 user, single device sync",
      "pricing.free.l4": "Made affordable for students",
      "pricing.free.price": "€2.99",
      "pricing.free.cta": "Start Student",
      "pricing.pro.tag": "Recommended",
      "pricing.pro.title": "Family",
      "pricing.pro.l1": "Up to 5 users",
      "pricing.pro.l2": "Shared budgets and goals",
      "pricing.pro.l3": "Exports (CSV/PDF)",
      "pricing.pro.l4": "Priority support light",
      "pricing.pro.l5": "Priced for multi-user access",
      "pricing.pro.price": "€11.99",
      "pricing.pro.cta": "Start Family",
      "pricing.ai.title": "Business",
      "pricing.ai.l1": "Advanced analytics + cash-flow",
      "pricing.ai.l2": "Team roles & multi-account workspace",
      "pricing.ai.l3": "AI insights and weekly summaries",
      "pricing.ai.l4": "Exports and reporting",
      "pricing.ai.l5": "Priced for deep analytics and AI",
      "pricing.ai.price": "€29.99",
      "pricing.ai.cta": "Start Business",
      "pricing.per": "/mo",
      "faq.title": "FAQ",
      "faq.desc": "Quick answers to common questions.",
      "faq.q1": "Is this a finished product?",
      "faq.a1": "This is the landing page. Next we’ll add auth, transaction storage, analytics, and the AI assistant.",
      "faq.q2": "Can we add a dashboard quickly?",
      "faq.a2": "Yes. Next step is backend + database, and protected routes like /app.",
      "faq.q3": "How will the AI assistant work?",
      "faq.a3":
        "We’ll send aggregated data (categories, totals, timeframe) and return actionable advice—without sending unnecessary personal details.",
      "faq.q4": "Do I need to connect my bank account?",
      "faq.a4": "No. You can start by manually logging transactions. Bank integrations can be added later as an optional feature.",
      "faq.q5": "Is my data secure?",
      "faq.a5": "The architecture is designed for secure storage, protected sessions, and audit-ready logging as the product evolves.",
      "faq.q6": "Is there a low-cost plan?",
      "faq.a6": "Yes. Student is €2.99/mo, with Family and Business upgrades when you need more collaboration or AI insights.",
      "cta.title": "Ready to begin?",
      "cta.text": "Create an account and we’ll build the dashboard next.",
      "cta.button": "Get started",
      "footer.rights": "Quantiva. All rights reserved.",
      "footer.micro": "Privacy-first • No bank credentials required • EU-ready",
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
    },
    de: {
      "nav.features": "Funktionen",
      "nav.security": "Sicherheit",
      "nav.pricing": "Preise",
      "nav.faq": "FAQ",
      "nav.signin": "Anmelden",
      "nav.getstarted": "Loslegen",
      "hero.pill": "KI-Buchhaltung der nächsten Generation",
      "hero.title1": "Einnahmen und Ausgaben im Blick.",
      "hero.title2": "KI‑Sparvorschläge, die wirken.",
      "hero.subtitle":
        "Quantiva hilft dir, Transaktionen schnell zu erfassen, Tages-/Monatsanalysen zu sehen und aus Chaos einen Plan zu machen.",
      "hero.cta1": "Konto erstellen",
      "hero.cta2": "Funktionen ansehen",
      "hero.stat1.value": "30 Sek.",
      "hero.stat1.label": "bis zum ersten Report",
      "hero.stat2.value": "1 Klick",
      "hero.stat2.label": "schnelles Erfassen",
      "hero.stat3.value": "KI",
      "hero.stat3.label": "personalisierte Insights",
      "panel.title": "Übersicht",
      "panel.chip": "Dezember",
      "demo.student": "Student",
      "demo.family": "Familie",
      "demo.business": "Business",
      "panel.balance.label": "Kontostand",
      "panel.balance.hint": "+4,2% in 30 Tagen",
      "panel.spend.label": "Ausgaben",
      "panel.spend.hint": "−1,1% diese Woche",
      "panel.chart.mon": "Mo",
      "panel.chart.tue": "Di",
      "panel.chart.wed": "Mi",
      "panel.chart.thu": "Do",
      "panel.chart.fri": "Fr",
      "panel.aitip.badge": "KI‑Tipp",
      "panel.aitip.cta": "KI‑Assistent aktivieren",
      "panel.aitip.text": "Begrenze Lieferdienste auf 1×/Woche — geschätzte Ersparnis ≈ 65 €/Monat.",
      "ai.why": "Warum?",
      "ai.tip.title": "Begründung (Vorschau)",
      "ai.tip.text":
        "Basierend auf deinen Kategorien Essen & Transport der letzten 30 Tage treiben Lieferdienste die größten Schwankungen.",
      "empty.title": "Noch keine Daten",
      "empty.text": "Füge deine erste Transaktion hinzu, um Insights und KI‑Empfehlungen zu erhalten.",
      "how.title": "So funktioniert Quantiva",
      "how.desc": "Drei Schritte von Chaos zu Klarheit.",
      "how.s1.title": "Einnahmen & Ausgaben erfassen",
      "how.s1.text": "In Sekunden mit Kategorien und Notizen speichern.",
      "how.s2.title": "Tages- & Monatsanalysen sehen",
      "how.s2.text": "Trends verstehen und Budget steuern.",
      "how.s3.title": "KI‑Sparvorschläge erhalten",
      "how.s3.text": "Praktische Aktionen aus aggregierten Mustern.",
      "features.title": "Was Quantiva macht",
      "features.desc": "Wenige Klicks. Maximale Klarheit.",
      "features.f1.title": "Einnahmen & Ausgaben",
      "features.f1.text": "Transaktionen schnell erfassen – ohne unnötigen Aufwand.",
      "features.f2.title": "Analysen",
      "features.f2.text": "Tages- und Monatstrends, klare Zusammenfassungen und Budgetkontrolle.",
      "features.f3.title": "KI‑Empfehlungen",
      "features.f3.text": "Die KI analysiert Muster und liefert konkrete Sparaktionen.",
      "aud.title": "Für wen gebaut",
      "aud.desc": "Für echte Finanz‑Routinen im Alltag.",
      "aud.a1.title": "Studierende",
      "aud.a1.text": "Tägliche Ausgaben kontrollieren, Überraschungen vermeiden.",
      "aud.a2.title": "Business",
      "aud.a2.text": "Einnahmen, Ausgaben und Cashflow klar verfolgen.",
      "aud.a3.title": "Familien",
      "aud.a3.text": "Monatsbudget mit Zielen und Klarheit managen.",
      "security.title": "Sicherheit by design",
      "security.desc":
        "Wir bauen die Struktur so, dass sie sicher skalieren kann. Heute Landing Page — morgen ein Produkt.",
      "security.b1": "Klare Trennung zwischen öffentlichen Seiten und privater App",
      "security.b2": "Sessions & geschützte Formulare",
      "security.b3": "Bereit für Datenbank & Audit‑Logging",
      "roadmap.title": "Roadmap",
      "roadmap.s1.title": "Landing + Auth",
      "roadmap.s1.text": "Registrieren/Anmelden und Navigation.",
      "roadmap.s2.title": "Transaktionen + Analysen",
      "roadmap.s2.text": "Erfassung, Filter, Tages-/Monatsreports.",
      "roadmap.s3.title": "KI‑Assistent",
      "roadmap.s3.text": "Beratung auf Basis aggregierter Daten.",
      "ai.title": "So arbeitet die KI",
      "ai.b1": "Die KI nutzt aggregierte Summen und Kategorien‑Trends (keine Bank‑Logins).",
      "ai.b2": "Du kannst KI jederzeit an/aus schalten.",
      "ai.b3": "Empfehlungen sind konkret, nicht generisch.",
      "privacy.title": "Privacy first",
      "privacy.b1": "Kein Bank‑Login nötig.",
      "privacy.b2": "Sichere Speicherung & auditfähige Struktur.",
      "privacy.b3": "EU‑ready (GDPR‑aligned by design).",
      "next.title": "Als Nächstes",
      "next.b1": "Budgets, Ziele und Limits.",
      "next.b2": "Exporte (CSV/PDF) & Reporting.",
      "next.b3": "Wöchentliche KI‑Zusammenfassungen.",
      "pricing.title": "Preise",
      "pricing.desc": "Einfache Pakete, klare Upgrades.",
      "pricing.free.title": "Student",
      "pricing.free.l1": "Transaktionen + Kategorien",
      "pricing.free.l2": "Basis-Analysen (monatlich/täglich)",
      "pricing.free.l3": "1 Nutzer, Sync auf einem Gerät",
      "pricing.free.l4": "Preiswert für Studierende",
      "pricing.free.price": "€2.99",
      "pricing.free.cta": "Student starten",
      "pricing.pro.tag": "Empfohlen",
      "pricing.pro.title": "Family",
      "pricing.pro.l1": "Bis zu 5 Nutzer",
      "pricing.pro.l2": "Geteilte Budgets und Ziele",
      "pricing.pro.l3": "Exporte (CSV/PDF)",
      "pricing.pro.l4": "Priority Support light",
      "pricing.pro.l5": "Preis wegen Multi-User-Zugang",
      "pricing.pro.price": "€11.99",
      "pricing.pro.cta": "Family starten",
      "pricing.ai.title": "Business",
      "pricing.ai.l1": "Erweiterte Analysen + Cashflow",
      "pricing.ai.l2": "Teamrollen & Multi-Account-Workspace",
      "pricing.ai.l3": "KI-Insights und Wochen-Reports",
      "pricing.ai.l4": "Exporte und Reporting",
      "pricing.ai.l5": "Preis wegen tiefer Analytik & KI",
      "pricing.ai.price": "€29.99",
      "pricing.ai.cta": "Business starten",
      "pricing.per": "/Monat",
      "faq.title": "FAQ",
      "faq.desc": "Kurze Antworten auf häufige Fragen.",
      "faq.q1": "Ist das ein fertiges Produkt?",
      "faq.a1": "Das ist die Landing Page. Als Nächstes kommen Auth, Speicherung, Analysen und der KI‑Assistent.",
      "faq.q2": "Können wir schnell ein Dashboard bauen?",
      "faq.a2": "Ja. Nächster Schritt: Backend + Datenbank und geschützte Routen wie /app.",
      "faq.q3": "Wie arbeitet der KI‑Assistent?",
      "faq.a3": "Wir senden aggregierte Daten (Kategorien, Summen, Zeitraum) und erhalten konkrete Empfehlungen zurück.",
      "faq.q4": "Muss ich mein Bankkonto verbinden?",
      "faq.a4": "Nein. Du kannst manuell starten. Bank‑Integrationen sind optional später möglich.",
      "faq.q5": "Sind meine Daten sicher?",
      "faq.a5": "Die Architektur ist für sichere Speicherung, Sessions und auditfähige Logs ausgelegt.",
      "faq.q6": "Gibt es einen günstigen Einstieg?",
      "faq.a6": "Ja. Student kostet 2,99 €/Monat, Family und Business sind für Zusammenarbeit und KI‑Insights erweiterbar.",
      "cta.title": "Bereit zu starten?",
      "cta.text": "Erstelle ein Konto – als Nächstes bauen wir das Dashboard.",
      "cta.button": "Loslegen",
      "footer.rights": "Quantiva. Alle Rechte vorbehalten.",
      "footer.micro": "Privacy-first • Kein Bank‑Login • EU‑ready",
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
    },
    ru: {
      "nav.features": "Функции",
      "nav.security": "Безопасность",
      "nav.pricing": "Цены",
      "nav.faq": "FAQ",
      "nav.signin": "Войти",
      "nav.getstarted": "Начать",
      "hero.pill": "Новая ИИ‑бухгалтерия",
      "hero.title1": "Учитывай доходы и расходы.",
      "hero.title2": "Получай ИИ‑советы по экономии.",
      "hero.subtitle":
        "Quantiva помогает быстро добавлять транзакции, смотреть аналитику по дням/месяцам и превращать хаос в план.",
      "hero.cta1": "Создать аккаунт",
      "hero.cta2": "Смотреть функции",
      "hero.stat1.value": "30 сек",
      "hero.stat1.label": "до первого отчёта",
      "hero.stat2.value": "1 клик",
      "hero.stat2.label": "быстрый ввод",
      "hero.stat3.value": "ИИ",
      "hero.stat3.label": "персональные рекомендации",
      "panel.title": "Overview",
      "panel.chip": "December",
      "demo.student": "Student",
      "demo.family": "Family",
      "demo.business": "Business",
      "panel.balance.label": "Баланс",
      "panel.balance.hint": "+4,2% за 30 дней",
      "panel.spend.label": "Расходы",
      "panel.spend.hint": "−1,1% на этой неделе",
      "panel.chart.mon": "Пн",
      "panel.chart.tue": "Вт",
      "panel.chart.wed": "Ср",
      "panel.chart.thu": "Чт",
      "panel.chart.fri": "Пт",
      "panel.aitip.badge": "ИИ‑совет",
      "panel.aitip.cta": "Включить ИИ‑ассистента",
      "panel.aitip.text": "Ограничь доставку еды до 1 раза в неделю — экономия ≈ €65/мес.",
      "ai.why": "Почему?",
      "ai.tip.title": "Причина (превью)",
      "ai.tip.text":
        "По категориям Еда и Транспорт за последние 30 дней видно, что пики доставки создают основные колебания.",
      "empty.title": "Пока нет данных",
      "empty.text": "Добавь первую транзакцию, чтобы открыть инсайты и ИИ‑рекомендации.",
      "how.title": "Как работает Quantiva",
      "how.desc": "Три шага от хаоса к ясности.",
      "how.s1.title": "Добавь доходы и расходы",
      "how.s1.text": "Вводи транзакции за секунды с категориями и заметками.",
      "how.s2.title": "Смотри аналитику по дням и месяцам",
      "how.s2.text": "Понимай тренды и держи бюджет од контролем.",
      "how.s3.title": "Получай ИИ‑советы по экономии",
      "how.s3.text": "Практичные действия на основе агрегированных паттернов.",
      "features.title": "Что умеет Quantiva",
      "features.desc": "Минимум кликов. Максимум ясности.",
      "features.f1.title": "Доходы и расходы",
      "features.f1.text": "Быстро добавляй транзакции — без лишней рутины.",
      "features.f2.title": "Аналитика",
      "features.f2.text": "Тренды по дням/месяцам, понятные сводки и контроль бюджета.",
      "features.f3.title": "ИИ‑рекомендации",
      "features.f3.text": "Ассистент анализирует паттерны и предлагает конкретные шаги экономии.",
      "aud.title": "Для кого сделано",
      "aud.desc": "Под реальные финансовые привычки.",
      "aud.a1.title": "Студенты",
      "aud.a1.text": "Контроль расходов и никаких сюрпризов.",
      "aud.a2.title": "Бизнес",
      "aud.a2.text": "Отслеживайте выручку, расходы и денежный поток без хаоса.",
      "aud.a3.title": "Семьи",
      "aud.a3.text": "Понятный месячный бюджет и цели.",
      "security.title": "Безопасность по умолчанию",
      "security.desc":
        "Мы строим структуру так, чтобы продукт безопасно масштабировался. Сегодня лендинг — завтра полноценный продукт.",
      "security.b1": "Разделение публичной части и приватной app",
      "security.b2": "Сессии и защищённые формы",
      "security.b3": "Готово к БД и аудит‑логам",
      "roadmap.title": "Roadmap",
      "roadmap.s1.title": "Landing + Auth",
      "roadmap.s1.text": "Регистрация/вход и навигация.",
      "roadmap.s2.title": "Транзакции + Аналитика",
      "roadmap.s2.text": "Ввод, фильтры, отчеты по дням/месяцам.",
      "roadmap.s3.title": "ИИ‑ассистент",
      "roadmap.s3.text": "Советы на основе агрегированного контекста.",
      "ai.title": "Как работает ИИ",
      "ai.b1": "ИИ использует агрегированные суммы и тренды категорий (без банковских логинов).",
      "ai.b2": "ИИ можно включать/выключать в любой момент.",
      "ai.b3": "Советы конкретные, а не «общие слова».",
      "privacy.title": "Privacy first",
      "privacy.b1": "Подключение банка не требуется.",
      "privacy.b2": "Безопасное хранение и структура для аудита.",
      "privacy.b3": "EU‑ready подход (GDPR‑aligned).",
      "next.title": "Что дальше",
      "next.b1": "Бюджеты, цели и лимиты.",
      "next.b2": "Экспорт (CSV/PDF) и отчётность.",
      "next.b3": "Умные недельные ИИ‑сводки.",
      "pricing.title": "Цены",
      "pricing.desc": "Простые планы и понятные апгрейды.",
      "pricing.free.title": "Student",
      "pricing.free.l1": "Транзакции и категории",
      "pricing.free.l2": "Базовая аналитика (месяц/день)",
      "pricing.free.l3": "1 пользователь, синхрон на одном устройстве",
      "pricing.free.l4": "Доступно для студентов",
      "pricing.free.price": "€2.99",
      "pricing.free.cta": "Начать Student",
      "pricing.pro.tag": "Рекомендуем",
      "pricing.pro.title": "Family",
      "pricing.pro.l1": "До 5 пользователей",
      "pricing.pro.l2": "Общие бюджеты и цели",
      "pricing.pro.l3": "Экспорт (CSV/PDF)",
      "pricing.pro.l4": "Лёгкий приоритетный саппорт",
      "pricing.pro.l5": "Цена за мультидоступ",
      "pricing.pro.price": "€11.99",
      "pricing.pro.cta": "Начать Family",
      "pricing.ai.title": "Business",
      "pricing.ai.l1": "Расширенная аналитика и cash-flow",
      "pricing.ai.l2": "Роли команды и рабочие области",
      "pricing.ai.l3": "ИИ‑инсайты и недельные сводки",
      "pricing.ai.l4": "Экспорты и отчётность",
      "pricing.ai.l5": "Цена за глубокую аналитику и ИИ",
      "pricing.ai.price": "€29.99",
      "pricing.ai.cta": "Начать Business",
      "pricing.per": "/мес",
      "faq.title": "FAQ",
      "faq.desc": "Короткие ответы на частые вопросы.",
      "faq.q1": "Это уже готовый продукт?",
      "faq.a1": "Это лендинг. Дальше — auth, хранение транзакций, аналитика и ИИ‑ассистент.",
      "faq.q2": "Можно быстро сделать dashboard?",
      "faq.a2": "Да. Следующий шаг — backend + база данных и защищённые роуты типа /app.",
      "faq.q3": "Как будет работать ИИ‑ассистент?",
      "faq.a3": "Мы отправляем агрегированные данные (категории, суммы, период) и возвращаем конкретные рекомендации.",
      "faq.q4": "Нужно подключать банк?",
      "faq.a4": "Нет. Можно начать с ручного ввода. Интеграции банка — опционально позже.",
      "faq.q5": "Данные безопасны?",
      "faq.a5": "Архитектура рассчитана на безопасное хранение, сессии и аудит‑логи по мере развития продукта.",
      "faq.q6": "Есть недорогой план?",
      "faq.a6": "Да. Student стоит €2,99/мес, Family и Business — для совместной работы и ИИ‑инсайтов.",
      "cta.title": "Готов начать?",
      "cta.text": "Создай аккаунт — и дальше мы строим dashboard.",
      "cta.button": "Начать",
      "footer.rights": "Quantiva. Все права защищены.",
      "footer.micro": "Privacy-first • Без банковских логинов • EU‑ready",
      "login.title": "Вход",
      "login.email": "Email",
      "login.password": "Пароль",
      "login.submit": "Войти",
      "login.hint1": "Впервые здесь?",
      "login.hint2": "Создать аккаунт",
      "signup.title": "Создать аккаунт",
      "signup.name": "Имя",
      "signup.email": "Email",
      "signup.password": "Пароль",
      "signup.submit": "Создать",
      "signup.hint1": "Уже есть аккаунт?",
      "signup.hint2": "Войти",
    },
  };

  function setLang(lang) {
    const L = dict[lang] ? lang : "en";
    localStorage.setItem(LANG_KEY, L);
    if (langLabel) langLabel.textContent = L.toUpperCase();
    const nodes = $$("[data-i18n]");
    nodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = dict[L][key];
      if (typeof val === "string") el.textContent = val;
    });
    setHints(currentScenario);
    const sc = scenarios[currentScenario] || scenarios.student;
    setTip(sc.tip?.[L] || sc.tip);
  }

  function toggleLangMenu(open) {
    if (!langMenu) return;
    langMenu.classList.toggle("is-open", open);
  }

  if (langBtn && langMenu) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLangMenu(!langMenu.classList.contains("is-open"));
    });
    langMenu.addEventListener("click", (e) => {
      const item = e.target.closest("[data-set-lang]");
      if (!item) return;
      setLang(item.getAttribute("data-set-lang"));
      toggleLangMenu(false);
    });
    document.addEventListener("click", () => toggleLangMenu(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggleLangMenu(false);
    });
  }

  setLang(localStorage.getItem(LANG_KEY) || "en");
  setHints(currentScenario);

  /* -----------------------------
     Year in footer
  ----------------------------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* -----------------------------
     Modals + toast
  ----------------------------- */
  const toast = $("#toast");
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.style.display = "none";
    }, 2600);
  }

  const modals = $$("[data-modal]");

  function openModal(name) {
    const m = $(`[data-modal="${name}"]`);
    if (!m) return;
    m.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
  }

  function closeAllModals() {
    modals.forEach((m) => m.classList.remove("is-open"));
    document.documentElement.style.overflow = "";
  }

  // open buttons
  $$("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-open");
      openModal(name);
      setMobile(false);
    });
  });

  // close/swap handlers
  document.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (close) closeAllModals();

    const swap = e.target.closest("[data-swap]");
    if (swap) {
      const to = swap.getAttribute("data-swap");
      closeAllModals();
      openModal(to);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals();
      closeTip();
    }
  });

  /* -----------------------------
     ✅ Supabase Auth wiring (REAL)
  ----------------------------- */
/* -----------------------------
   ✅ Supabase Auth wiring (REAL)
----------------------------- */
const loginForm = $("#loginForm");
const signupForm = $("#signupForm");
const signinBtns = $$('[data-open="login"]'); // will become Sign out when authed
const signupBtns = $$('[data-open="signup"]');

function langText(key, fallback) {
  const L = localStorage.getItem(LANG_KEY) || "en";
  return dict?.[L]?.[key] || fallback;
}

async function getSessionSafe() {
  if (!sb) return null;
  try {
    const { data, error } = await sb.auth.getSession();
    if (error) return null;
    return data?.session || null;
  } catch {
    return null;
  }
}

async function refreshAuthUI(session) {
  const isAuthed = !!session?.user;

  signinBtns.forEach((btn) => {
    btn.textContent = isAuthed ? langText("nav.signout", "Sign out") : langText("nav.signin", "Sign in");
  });

  signupBtns.forEach((btn) => {
    btn.textContent = isAuthed ? langText("nav.account", "Account") : langText("nav.getstarted", "Get started");
  });

   // Intercept click on "Get started / Account":
// - if NOT authed: keep old behavior (open signup modal)
// - if authed: go to account.html
signupBtns.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const session = await getSessionSafe();
    if (!session?.user) return; // обычный клик откроет модалку (как и было)
    e.preventDefault();
    e.stopPropagation();
    window.location.href = "account.html";
  });
});

}
   


// Если SDK/клиент не создался — НЕ роняем страницу
if (!sb) {
  console.warn("Supabase client not initialized. Check <script> order in index.html.");
} else {
  // initial auth state
  getSessionSafe().then((s) => refreshAuthUI(s));

  // auth changes
  sb.auth.onAuthStateChange((_event, session) => {
    refreshAuthUI(session);
  });

  // Intercept click on sign-in buttons when authed -> sign out
  signinBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const session = await getSessionSafe();
      if (!session?.user) return; // обычный клик откроет модалку (как и было)
      e.preventDefault();
      e.stopPropagation();
      try {
        const { error } = await sb.auth.signOut();
        if (error) return showToast(error.message || "Sign out failed.");
        closeAllModals();
        showToast("Signed out.");
      } catch {
        showToast("Sign out failed.");
      }
    });
  });

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");
      if (!email || !password) return showToast("Please enter email and password.");

      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) return showToast(error.message || "Sign in failed.");
        closeAllModals();
        await refreshAuthUI(data?.session || null);
        showToast("Signed in.");
      } catch {
        showToast("Sign in failed.");
      }
    });
  }

  // SIGNUP
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(signupForm);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");

      if (!name || !email || !password) return showToast("Please fill all fields.");
      if (password.length < 6) return showToast("Password must be at least 6 characters.");

      try {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: "https://d3eny.github.io/Quantiva/"
                   }
        });
        if (error) return showToast(error.message || "Sign up failed.");
        closeAllModals();

        if (!data?.session) showToast("Account created. Please confirm your email.");
        else {
          await refreshAuthUI(data.session);
          showToast("Account created & signed in.");
        }
      } catch {
        showToast("Sign up failed.");
      }
    });
  }
}

  /* -----------------------------
     Optional: demo empty state toggle on long idle
     (kept OFF by default; can be enabled in future)
  ----------------------------- */
  // setEmptyState(true);
})();

/* ---------------------------------------------------------
   Your existing overlay/register code (kept as-is, safe)
--------------------------------------------------------- */
const overlay = document.getElementById("auth-overlay");

function openRegister() {
  if (overlay) overlay.classList.remove("hidden");
}
function closeRegister() {
  if (overlay) overlay.classList.add("hidden");
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const passEl = document.getElementById("password");
    const repeatEl = document.getElementById("passwordRepeat");
    const pass = passEl ? passEl.value : "";
    const repeat = repeatEl ? repeatEl.value : "";

    if (pass.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (pass !== repeat) {
      alert("Passwords do not match");
      return;
    }
    alert("Form is valid (next: backend)");
  });
   async function loadProfile() {
  if (!sb) return;

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  const { data, error } = await sb
    .from("profiles")
    .select("email, subscription")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.querySelector("#accountEmail").textContent = data.email;
  document.querySelector("#accountPlan").textContent = data.subscription;
}
   loadProfile();

}
const changePasswordForm = document.getElementById("changePasswordForm");

if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(changePasswordForm);
    const oldPassword = fd.get("oldPassword");
    const newPassword = fd.get("newPassword");

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return alert("Not logged in");

    // 1. Проверяем старый пароль
    const { error: signInError } = await sb.auth.signInWithPassword({
      email: user.email,
      password: oldPassword
    });

    if (signInError) {
      return alert("Current password is incorrect");
    }

    // 2. Меняем пароль
    const { error } = await sb.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated");
      changePasswordForm.reset();
    }
  });
}
const SUBSCRIPTIONS = {
  student: {
    price: "€2.99",
    features: ["Basic analytics", "1 user"]
  },
  family: {
    price: "€11.99",
    features: ["Up to 5 users", "Shared budgets"]
  },
  business: {
    price: "€29.99",
    features: ["AI insights", "Advanced analytics"]
  }
};
async function adminSetSubscription(userId, plan) {
  const { error } = await sb
    .from("profiles")
    .update({ subscription: plan })
    .eq("id", userId);

  if (error) {
    alert(error.message);
  } else {
    alert("Subscription updated");
  }
}


  /* -----------------------------
     Helpers
  ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const toast = $("#toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return alert(msg);
    toast.textContent = msg;
    toast.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast.style.display = "none"), 2600);
  }

  function getBaseUrl() {
    // GitHub Pages friendly
    const url = new URL(window.location.href);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/[^/]*$/, "/");
  }

  async function getSessionSafe() {
    if (!sb) return null;
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) return null;
      return data?.session || null;
    } catch {
      return null;
    }
  }

  // ВАЖНО: email надёжнее брать через getUser()
  async function getUserSafe() {
    if (!sb) return null;
    try {
      const { data, error } = await sb.auth.getUser();
      if (error) return null;
      return data?.user || null;
    } catch {
      return null;
    }
  }

  async function requireAuthOrRedirect() {
    const session = await getSessionSafe();
    if (!session?.user) {
      // если на app/account — кидаем на landing
      const page = document.body?.getAttribute("data-page") || "";
      if (page === "app" || page === "account") window.location.href = "index.html#top";
      return null;
    }
    return session;
  }

  async function paintEmailEverywhere() {
    const emailNodes = $$("[data-account-email]");
    if (!emailNodes.length) return;

    const user = await getUserSafe();
    const email = user?.email || "—";
    emailNodes.forEach((n) => (n.textContent = email));
  }

  /* -----------------------------
     Header hide-on-scroll (оставляю безопасно)
  ----------------------------- */
  const header = $("[data-header]");
  let lastY = window.scrollY || 0;
  let acc = 0;
  const HIDE_AFTER = 90;
  const SHOW_AFTER = 24;
  function onScrollHeader() {
    if (!header) return;
    const y = window.scrollY || 0;
    const dy = y - lastY;
    if (y < 8) {
      header.classList.remove("is-hidden");
      acc = 0;
      lastY = y;
      return;
    }
    if (Math.abs(dy) < 2) {
      lastY = y;
      return;
    }
    if (dy > 0) {
      acc = Math.min(999, Math.max(0, acc + dy));
      if (acc > HIDE_AFTER) header.classList.add("is-hidden");
    } else {
      acc = Math.min(999, Math.max(-999, acc + dy));
      if (acc < -SHOW_AFTER) header.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* -----------------------------
     GLOBAL: Auth UI (Sign out buttons)
  ----------------------------- */
  async function wireSignOut() {
    const signOutBtn = $("#signOutBtn");
    const signOutBtnMobile = $("#signOutBtnMobile");
    const btns = [signOutBtn, signOutBtnMobile].filter(Boolean);

    btns.forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!sb) return showToast("Supabase not loaded.");
        try {
          const { error } = await sb.auth.signOut();
          if (error) return showToast(error.message || "Sign out failed.");
          showToast("Signed out.");
          window.location.href = "index.html#top";
        } catch {
          showToast("Sign out failed.");
        }
      });
    });
  }

  /* -----------------------------
     ACCOUNT PAGE: settings + subscriptions + password tools
  ----------------------------- */
  async function initAccountPage() {
    // 1) auth required
    const session = await requireAuthOrRedirect();
    if (!session) return;

    // 2) email render (фиксит вашу проблему с "—")
    await paintEmailEverywhere();

    if (!sb) return;

    // 3) загрузка профиля (display_name / locale)
    const profName = $("#accName");
    const profLocale = $("#accLocale");
    const profSave = $("#accSaveBtn");

    async function loadProfile() {
      const { data, error } = await sb.from("profiles").select("display_name, locale, is_admin").single();
      if (error) return;
      if (profName) profName.value = data?.display_name || "";
      if (profLocale) profLocale.value = data?.locale || "en";
      // можно показать, что вы админ:
      const adminBadge = $("#adminBadge");
      if (adminBadge) adminBadge.style.display = data?.is_admin ? "inline-flex" : "none";
    }

    async function saveProfile() {
      const display_name = profName ? String(profName.value || "").trim() : "";
      const locale = profLocale ? String(profLocale.value || "en") : "en";
      const { error } = await sb.from("profiles").update({ display_name, locale, updated_at: new Date().toISOString() }).eq("id", session.user.id);
      if (error) return showToast(error.message || "Save failed.");
      showToast("Saved.");
    }

    if (profSave) profSave.addEventListener("click", saveProfile);
    await loadProfile();

    // 4) текущая подписка + планы
    const planValue = $("#planValue");
    const statusValue = $("#statusValue");
    const upgradeBtn = $("#upgradeBtn");
    const cancelBtn = $("#cancelBtn");

    async function loadSubscription() {
      const { data: sub, error: subErr } = await sb
        .from("user_subscriptions")
        .select("plan_id,status")
        .single();

      if (!subErr && sub) {
        if (planValue) planValue.textContent = sub.plan_id;
        if (statusValue) statusValue.textContent = sub.status || "active";
      }
    }

    async function loadPlans() {
      const { data, error } = await sb
        .from("plans")
        .select("id,title,price_eur,period,features,sort")
        .eq("is_active", true)
        .order("sort", { ascending: true });

      if (error) return [];
      return data || [];
    }

    // modal (очень простой)
    const planModal = $("#planModal");
    const planModalList = $("#planModalList");
    const planModalClose = $("#planModalClose");

    function openPlanModal() {
      if (!planModal) return;
      planModal.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
    }
    function closePlanModal() {
      if (!planModal) return;
      planModal.classList.remove("is-open");
      document.documentElement.style.overflow = "";
    }

    if (planModalClose) planModalClose.addEventListener("click", closePlanModal);
    if (planModal) {
      planModal.addEventListener("click", (e) => {
        if (e.target?.matches?.("[data-modal-backdrop]")) closePlanModal();
      });
    }

    async function renderPlanChoices() {
      if (!planModalList) return;
      planModalList.innerHTML = "Loading…";

      const plans = await loadPlans();
      if (!plans.length) {
        planModalList.innerHTML = "<div class='muted'>No plans found.</div>";
        return;
      }

      planModalList.innerHTML = plans
        .map((p) => {
          const feats = Array.isArray(p.features) ? p.features : [];
          return `
            <div class="a-panel" style="padding:14px; border-radius:16px; border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.05); display:grid; gap:8px;">
              <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
                <div>
                  <div style="font-weight:800; font-size:16px;">${escapeHtml(p.title)}</div>
                  <div class="muted">${Number(p.price_eur).toFixed(2)}€ / ${escapeHtml(p.period)}</div>
                </div>
                <button class="btn btn--primary btn--sm" data-pick-plan="${escapeHtml(p.id)}">Choose</button>
              </div>
              <ul class="bullets bullets--tight">
                ${feats.map((f) => `<li>${escapeHtml(String(f))}</li>`).join("")}
              </ul>
            </div>
          `;
        })
        .join("");

      planModalList.addEventListener(
        "click",
        async (e) => {
          const btn = e.target.closest("[data-pick-plan]");
          if (!btn) return;
          const planId = btn.getAttribute("data-pick-plan");
          try {
            const { error } = await sb
              .from("user_subscriptions")
              .update({ plan_id: planId, status: "active", updated_at: new Date().toISOString() })
              .eq("user_id", session.user.id);

            if (error) return showToast(error.message || "Upgrade failed.");
            showToast("Plan updated.");
            closePlanModal();
            await loadSubscription();
          } catch {
            showToast("Upgrade failed.");
          }
        },
        { once: true }
      );
    }

    if (upgradeBtn) {
      upgradeBtn.disabled = false;
      upgradeBtn.addEventListener("click", async () => {
        openPlanModal();
        await renderPlanChoices();
      });
    }

    if (cancelBtn) {
      cancelBtn.disabled = false;
      cancelBtn.addEventListener("click", async () => {
        try {
          const { error } = await sb
            .from("user_subscriptions")
            .update({ status: "canceled", updated_at: new Date().toISOString() })
            .eq("user_id", session.user.id);
          if (error) return showToast(error.message || "Cancel failed.");
          showToast("Canceled.");
          await loadSubscription();
        } catch {
          showToast("Cancel failed.");
        }
      });
    }

    await loadSubscription();

    // 5) Reset password email
    const resetForm = $("#resetForm");
    if (resetForm) {
      resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(resetForm);
        const email = String(fd.get("email") || "").trim();
        if (!email) return showToast("Enter email.");
        try {
          const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: getBaseUrl() + "account.html",
          });
          if (error) return showToast(error.message || "Reset failed.");
          showToast("Reset email sent.");
        } catch {
          showToast("Reset failed.");
        }
      });
    }

    // 6) Change password (только зная старый)
    const changePassForm = $("#changePassForm");
    if (changePassForm) {
      changePassForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(changePassForm);
        const oldPass = String(fd.get("old_password") || "");
        const newPass = String(fd.get("new_password") || "");
        if (!oldPass || !newPass) return showToast("Fill both passwords.");
        if (newPass.length < 6) return showToast("New password must be at least 6 chars.");

        const user = await getUserSafe();
        const email = user?.email;
        if (!email) return showToast("No email in session.");

        try {
          // re-auth with old password
          const { error: signErr } = await sb.auth.signInWithPassword({ email, password: oldPass });
          if (signErr) return showToast("Old password is incorrect.");

          // update
          const { error: upErr } = await sb.auth.updateUser({ password: newPass });
          if (upErr) return showToast(upErr.message || "Password update failed.");

          showToast("Password updated.");
          changePassForm.reset();
        } catch {
          showToast("Password update failed.");
        }
      });
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* -----------------------------
     APP PAGE: transactions + analytics
  ----------------------------- */
  async function initAppPage() {
    const session = await requireAuthOrRedirect();
    if (!session) return;

    await paintEmailEverywhere();
    if (!sb) return;

    const txForm = $("#txForm");
    const txList = $("#txList");
    const txRefreshBtn = $("#txRefreshBtn");

    const kpiIncome = $("#kpiIncome");
    const kpiExpense = $("#kpiExpense");
    const kpiNet = $("#kpiNet");

    // default date today
    const dateInput = txForm?.querySelector('input[name="happened_on"]');
    if (dateInput && !dateInput.value) {
      const d = new Date();
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      dateInput.value = iso;
    }

    async function loadRecent() {
      if (!txList) return;

      txList.textContent = "Loading…";
      const { data, error } = await sb
        .from("transactions")
        .select("id,type,amount,currency,category,note,happened_on,created_at")
        .order("happened_on", { ascending: false })
        .order("id", { ascending: false })
        .limit(25);

      if (error) {
        txList.textContent = error.message || "Failed to load.";
        return;
      }

      if (!data?.length) {
        txList.innerHTML = "<div class='muted'>No transactions yet.</div>";
        return;
      }

      txList.innerHTML = `
        <div style="display:grid; gap:8px;">
          ${data
            .map((t) => {
              const sign = t.type === "expense" ? "−" : "+";
              return `
                <div style="display:flex; justify-content:space-between; gap:10px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); padding:10px 12px; border-radius:14px;">
                  <div style="display:grid;">
                    <b>${escapeHtml(t.category)}</b>
                    <span class="muted" style="font-size:13px;">
                      ${escapeHtml(t.happened_on)} · ${escapeHtml(t.type)}${t.note ? " · " + escapeHtml(t.note) : ""}
                    </span>
                  </div>
                  <div style="font-weight:800;">
                    ${sign}${Number(t.amount).toFixed(2)} ${escapeHtml(t.currency || "EUR")}
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    }

    async function loadMonthKpis() {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const startISO = start.toISOString().slice(0, 10);
      const endISO = end.toISOString().slice(0, 10);

      const { data, error } = await sb
        .from("transactions")
        .select("type,amount")
        .gte("happened_on", startISO)
        .lt("happened_on", endISO);

      if (error) return;

      let income = 0;
      let expense = 0;
      (data || []).forEach((t) => {
        const a = Number(t.amount || 0);
        if (t.type === "income") income += a;
        else expense += a;
      });

      const net = income - expense;
      if (kpiIncome) kpiIncome.textContent = `${income.toFixed(2)} EUR`;
      if (kpiExpense) kpiExpense.textContent = `${expense.toFixed(2)} EUR`;
      if (kpiNet) kpiNet.textContent = `${net.toFixed(2)} EUR`;
    }

    async function refreshAll() {
      await Promise.all([loadRecent(), loadMonthKpis()]);
    }

    if (txRefreshBtn) txRefreshBtn.addEventListener("click", refreshAll);

    if (txForm) {
      txForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(txForm);

        const payload = {
          user_id: session.user.id,
          type: String(fd.get("type") || "expense"),
          amount: Number(fd.get("amount") || 0),
          currency: String(fd.get("currency") || "EUR").trim() || "EUR",
          category: String(fd.get("category") || "").trim(),
          note: String(fd.get("note") || "").trim() || null,
          happened_on: String(fd.get("happened_on") || "").trim(),
        };

        if (!payload.category) return showToast("Category required.");
        if (!payload.happened_on) return showToast("Date required.");

        const { error } = await sb.from("transactions").insert(payload);
        if (error) return showToast(error.message || "Insert failed.");

        showToast("Added.");
        txForm.reset();

        // keep date as today
        if (dateInput) {
          const d = new Date();
          const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
          dateInput.value = iso;
        }

        await refreshAll();
      });
    }

    await refreshAll();
  }

  /* -----------------------------
     LANDING PAGE: (у вас уже было, можно оставить)
     Здесь я ничего не ломаю — просто не трогаю.
  ----------------------------- */

  /* -----------------------------
     Boot
  ----------------------------- */
  if (!sb) {
    console.warn("Supabase SDK not loaded (check script order).");
    return;
  }

  // обновлять email/состояние при изменении auth
  sb.auth.onAuthStateChange(async () => {
    await paintEmailEverywhere();
  });

  wireSignOut();

  const page = document.body?.getAttribute("data-page") || "";
  if (page === "account") initAccountPage();
  if (page === "app") initAppPage();

  // email на любых страницах, где есть [data-account-email]
  paintEmailEverywhere();
})();


















