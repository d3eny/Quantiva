/* =========================================================
   Quantiva — dashboard.js
   - Auth guard (must be logged in)
   - Sidebar navigation (views)
   - Language switch (EN/DE/RU) using data-i18n + localStorage
   - Sign out
   ========================================================= */

const SUPABASE_URL = "https://towzwaximnwmkeyvthvk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvd3p3YXhpbW53bWtleXZ0aHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTgxMjQsImV4cCI6MjA4MjA5NDEyNH0.UcR2Vo4zQnQSmxG2TfiQvkHK9qRb_3W6g3knXG8PsrI";

const sb =
  window.supabase && typeof window.supabase.createClient === "function"
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LANG_KEY = "quantiva_lang";

  const toast = $("#toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast.style.display = "none"), 2600);
  }

  const dict = {
    en: {
      "app.signout": "Sign out",
      "app.account": "Account",
      "app.back": "← Back to landing",
      "app.nav.dashboard": "Dashboard",
      "app.nav.settings": "Account settings",
      "app.nav.subs": "Manage subscriptions",
      "app.nav.security": "Security",

      "app.dashboard.title": "Dashboard",
      "app.dashboard.subtitle": "Your overview, insights, and quick actions.",
      "app.kpi.plan": "Plan",
      "app.kpi.planHint": "Current subscription tier",
      "app.kpi.status": "Status",
      "app.kpi.statusHint": "Billing state",
      "app.kpi.next": "Next step",
      "app.kpi.nextValue": "Connect features",
      "app.kpi.nextHint": "We’ll plug real data next",

      "app.todo.title": "Next: build the product",
      "app.todo.text": "Here we’ll add transactions, analytics, exports, and AI assistant.",

      "app.settings.title": "Account settings",
      "app.settings.subtitle": "Basic profile and preferences.",
      "app.settings.email": "Email",
      "app.settings.name": "Name",
      "app.settings.hint": "Name is taken from Supabase user metadata (options.data.name).",

      "app.subs.title": "Manage subscriptions",
      "app.subs.subtitle": "Hook Stripe later — for now this is the UI shell.",
      "app.subs.current": "Current",
      "app.subs.hint": "We’ll connect billing data from DB/Stripe.",
      "app.subs.upgrade": "Upgrade",
      "app.subs.cancel": "Cancel",

      "app.security.title": "Security",
      "app.security.subtitle": "Session info and safe defaults.",
      "app.security.session": "Session",
      "app.security.hint": "If you’re not logged in, you’ll be redirected to landing.",
    },
    de: {
      "app.signout": "Abmelden",
      "app.account": "Konto",
      "app.back": "← Zur Landing zurück",
      "app.nav.dashboard": "Dashboard",
      "app.nav.settings": "Kontoeinstellungen",
      "app.nav.subs": "Abos verwalten",
      "app.nav.security": "Sicherheit",

      "app.dashboard.title": "Dashboard",
      "app.dashboard.subtitle": "Übersicht, Insights und schnelle Aktionen.",
      "app.kpi.plan": "Plan",
      "app.kpi.planHint": "Aktueller Tarif",
      "app.kpi.status": "Status",
      "app.kpi.statusHint": "Zahlungsstatus",
      "app.kpi.next": "Nächster Schritt",
      "app.kpi.nextValue": "Features verbinden",
      "app.kpi.nextHint": "Echte Daten kommen als Nächstes",

      "app.todo.title": "Next: Produkt bauen",
      "app.todo.text": "Hier kommen Transaktionen, Analysen, Exporte und KI‑Assistent.",

      "app.settings.title": "Kontoeinstellungen",
      "app.settings.subtitle": "Profil und Präferenzen.",
      "app.settings.email": "E‑Mail",
      "app.settings.name": "Name",
      "app.settings.hint": "Name kommt aus Supabase User‑Metadata (options.data.name).",

      "app.subs.title": "Abos verwalten",
      "app.subs.subtitle": "Stripe später — aktuell ist das das UI‑Gerüst.",
      "app.subs.current": "Aktuell",
      "app.subs.hint": "Billing‑Daten verbinden wir über DB/Stripe.",
      "app.subs.upgrade": "Upgraden",
      "app.subs.cancel": "Kündigen",

      "app.security.title": "Sicherheit",
      "app.security.subtitle": "Session‑Infos und sichere Defaults.",
      "app.security.session": "Session",
      "app.security.hint": "Wenn du nicht eingeloggt bist, wirst du zur Landing geleitet.",
    },
    ru: {
      "app.signout": "Выйти",
      "app.account": "Аккаунт",
      "app.back": "← Назад на лендинг",
      "app.nav.dashboard": "Dashboard",
      "app.nav.settings": "Настройки аккаунта",
      "app.nav.subs": "Управление подпиской",
      "app.nav.security": "Безопасность",

      "app.dashboard.title": "Dashboard",
      "app.dashboard.subtitle": "Обзор, инсайты и быстрые действия.",
      "app.kpi.plan": "План",
      "app.kpi.planHint": "Текущий тариф",
      "app.kpi.status": "Статус",
      "app.kpi.statusHint": "Статус оплаты",
      "app.kpi.next": "Следующий шаг",
      "app.kpi.nextValue": "Подключить функции",
      "app.kpi.nextHint": "Дальше подключим реальные данные",

      "app.todo.title": "Дальше: строим продукт",
      "app.todo.text": "Здесь добавим транзакции, аналитику, экспорт и ИИ‑ассистента.",

      "app.settings.title": "Настройки аккаунта",
      "app.settings.subtitle": "Профиль и предпочтения.",
      "app.settings.email": "Email",
      "app.settings.name": "Имя",
      "app.settings.hint": "Имя берётся из Supabase user metadata (options.data.name).",

      "app.subs.title": "Управление подпиской",
      "app.subs.subtitle": "Stripe позже — сейчас это каркас интерфейса.",
      "app.subs.current": "Текущая",
      "app.subs.hint": "Данные подписки подключим из БД/Stripe.",
      "app.subs.upgrade": "Улучшить",
      "app.subs.cancel": "Отменить",

      "app.security.title": "Безопасность",
      "app.security.subtitle": "Сессия и безопасные настройки.",
      "app.security.session": "Сессия",
      "app.security.hint": "Если вы не вошли — будет редирект на лендинг.",
    },
  };

  function setLang(lang) {
    const L = dict[lang] ? lang : "en";
    localStorage.setItem(LANG_KEY, L);

    const langLabel = $("[data-lang-label]");
    if (langLabel) langLabel.textContent = L.toUpperCase();

    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = dict[L][key];
      if (typeof val === "string") el.textContent = val;
    });
  }

  // language UI
  const langBtn = $("[data-lang-btn]");
  const langMenu = $("[data-lang-menu]");
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
    document.addEventListener("keydown", (e) => e.key === "Escape" && toggleLangMenu(false));
  }

  // sidebar views
  function openView(key) {
    $$(".side-nav__link").forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-view") === key));
    $$("[data-view-panel]").forEach((p) => p.classList.toggle("is-active", p.getAttribute("data-view-panel") === key));
  }

  const sideNav = $(".side-nav");
  if (sideNav) {
    sideNav.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-view]");
      if (!btn) return;
      openView(btn.getAttribute("data-view"));
    });
  }

  async function requireSession() {
    if (!sb) {
      showToast("Supabase SDK not loaded.");
      window.location.href = "index.html";
      return null;
    }
    const { data, error } = await sb.auth.getSession();
    if (error || !data?.session?.user) {
      window.location.href = "index.html";
      return null;
    }
    return data.session;
  }

  function fillUser(session) {
    const user = session.user;
    const email = user.email || "—";
    const name = user.user_metadata?.name || "—";

    const userEmail = $("#userEmail");
    const settingsEmail = $("#settingsEmail");
    const settingsName = $("#settingsName");
    const sessionState = $("#sessionState");

    if (userEmail) userEmail.textContent = email;
    if (settingsEmail) settingsEmail.textContent = email;
    if (settingsName) settingsName.textContent = name;
    if (sessionState) sessionState.textContent = "Active";

    // пока мок — позже подключите таблицу subscriptions
    const planName = $("#planName");
    const subStatus = $("#subStatus");
    const subsCurrent = $("#subsCurrent");
    if (planName) planName.textContent = "Student";
    if (subStatus) subStatus.textContent = "Active";
    if (subsCurrent) subsCurrent.textContent = "Student • Active";
  }

  // sign out
  const signOutBtn = $("#appSignOut");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      if (!sb) return;
      const { error } = await sb.auth.signOut();
      if (error) {
        showToast(error.message || "Sign out failed.");
        return;
      }
      window.location.href = "index.html";
    });
  }

  // init
  setLang(localStorage.getItem(LANG_KEY) || "en");
  openView("dashboard");

  requireSession().then((session) => {
    if (!session) return;
    fillUser(session);
  });

  // placeholders
  $("#upgradeBtn")?.addEventListener("click", () => showToast("Stripe позже 🙂"));
  $("#cancelBtn")?.addEventListener("click", () => showToast("Stripe позже 🙂"));
})();
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

