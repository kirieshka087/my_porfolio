const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const calculator = document.querySelector("[data-calculator]");
const requestForm = document.querySelector("[data-request-form]");

const formatRub = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  nav?.classList.toggle("is-open", !expanded);
  body.classList.toggle("nav-open", !expanded);
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuToggle?.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    body.classList.remove("nav-open");
  }
});

if (calculator) {
  const roomOptions = calculator.querySelectorAll("[data-field='room']");
  const materialSelect = calculator.querySelector("[data-material]");
  const metersInput = calculator.querySelector("[data-meters]");
  const result = calculator.querySelector("[data-result] strong");

  const updateEstimate = () => {
    const activeRoom = calculator.querySelector("[data-field='room'].is-active");
    const base = Number(activeRoom?.dataset.price || 0);
    const materialMultiplier = Number(materialSelect?.value || 1);
    const meters = Number(metersInput?.value || 5);
    const scale = 0.72 + meters * 0.056;
    const estimate = Math.round((base * materialMultiplier * scale) / 10000) * 10000;

    if (result) {
      result.textContent = `от ${formatRub(estimate).replace(",00", "")}`;
    }
  };

  roomOptions.forEach((option) => {
    option.addEventListener("click", () => {
      roomOptions.forEach((item) => item.classList.remove("is-active"));
      option.classList.add("is-active");
      updateEstimate();
    });
  });

  materialSelect?.addEventListener("change", updateEstimate);
  metersInput?.addEventListener("input", updateEstimate);
  updateEstimate();
}

requestForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = requestForm.querySelector("[data-form-status]");
  const formData = new FormData(requestForm);
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !phone) {
    if (status) status.textContent = "Заполните имя и телефон.";
    return;
  }

  if (status) status.textContent = "Заявка подготовлена. Мы свяжемся с вами в ближайшее время.";
  requestForm.reset();
});
