(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const toast = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 2600);
  }

  function openModal(name) {
    const modal = document.querySelector(`[data-modal="${name}"]`);
    if (!modal) return;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModals() {
    document.querySelectorAll(".modal.is-open").forEach((m) => m.classList.remove("is-open"));
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-open]");
    if (openBtn) {
      openModal(openBtn.getAttribute("data-open"));
      return;
    }

    const closeBtn = e.target.closest("[data-close]");
    if (closeBtn) {
      closeModals();
      return;
    }

    const swapBtn = e.target.closest("[data-swap]");
    if (swapBtn) {
      const target = swapBtn.getAttribute("data-swap");
      closeModals();
      openModal(target);
      return;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModals();
  });

  const burger = document.querySelector("[data-burger]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  function toggleMobileNav(force) {
    if (!mobileNav) return;
    const isOpen = mobileNav.style.display === "block";
    const next = typeof force === "boolean" ? force : !isOpen;
    mobileNav.style.display = next ? "block" : "none";
  }

  if (burger) burger.addEventListener("click", () => toggleMobileNav());

  document.querySelectorAll(".mobile-nav a").forEach((a) => {
    a.addEventListener("click", () => toggleMobileNav(false));
  });

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = new FormData(loginForm).get("email");
      closeModals();
      showToast(`Demo: signed in as ${email}. Next we’ll add FastAPI + DB.`);
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(signupForm);
      const name = data.get("name");
      closeModals();
      showToast(`Demo: account created for "${name}". Next we’ll add FastAPI + DB.`);
    });
  }
})();