const header = document.querySelector("#site-header");
const progressBar = document.querySelector(".scroll-progress span");
const menuToggle = document.querySelector("#menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateScrollUi() {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(scrollTop / scrollRange, 1) : 0;

  header.classList.toggle("is-scrolled", scrollTop > 16);
  progressBar.style.width = `${progress * 100}%`;
}

updateScrollUi();
window.addEventListener("scroll", updateScrollUi, { passive: true });

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  mobileNav.hidden = !open;
  header.classList.toggle("menu-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7%" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const projectDialog = document.querySelector("#project-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogTitle = document.querySelector("#dialog-title");
const dialogMeta = document.querySelector("#dialog-meta");
const dialogClose = document.querySelector("#dialog-close");

document.querySelectorAll("[data-project]").forEach((button) => {
  button.addEventListener("click", () => {
    dialogImage.src = button.dataset.image;
    dialogImage.alt = button.dataset.title;
    dialogTitle.textContent = button.dataset.title;
    dialogMeta.textContent = button.dataset.meta;
    projectDialog.showModal();
    document.body.classList.add("dialog-open");
  });
});

function closeProjectDialog() {
  projectDialog.close();
}

dialogClose.addEventListener("click", closeProjectDialog);
projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) closeProjectDialog();
});
projectDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

const calculatorForm = document.querySelector("#calculator-form");
const priceValue = document.querySelector("#price-value");
const numberFormatter = new Intl.NumberFormat("ru-RU");
let currentPrice = 486000;

function animatePrice(nextPrice) {
  const startPrice = currentPrice;
  currentPrice = nextPrice;

  if (reducedMotion) {
    priceValue.textContent = numberFormatter.format(nextPrice);
    return;
  }

  const startedAt = performance.now();
  const duration = 520;

  function frame(now) {
    const elapsed = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    const displayed = Math.round((startPrice + (nextPrice - startPrice) * eased) / 5000) * 5000;
    priceValue.textContent = numberFormatter.format(displayed);

    if (elapsed < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

calculatorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const base = Number(document.querySelector("#furniture-type").value);
  const material = Number(document.querySelector("#material").value);
  const size = Number(document.querySelector("#project-size").value);
  const finish = Number(document.querySelector("#finish").value);
  const estimate = Math.round((base * material * size * finish) / 5000) * 5000;

  animatePrice(estimate);
});

const contactForm = document.querySelector("#contact-form");
const toast = document.querySelector("#toast");
let toastTimer;

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(toastTimer);
  toast.classList.add("is-visible");
  contactForm.reset();
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4400);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (menuToggle.getAttribute("aria-expanded") === "true") setMenu(false);
});
