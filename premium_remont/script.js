(function () {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const menuButton = document.querySelector("[data-menu-button]");
  const form = document.querySelector("[data-calc-form]");
  const estimateNode = document.querySelector("[data-estimate]");
  const durationNode = document.querySelector("[data-duration]");

  const rates = {
    standard: { price: 12000, days: 30 },
    comfort: { price: 18000, days: 50 },
    premium: { price: 25000, days: 75 },
    exclusive: { price: 34000, days: 95 }
  };

  const objectFactor = {
    flat: 1,
    house: 1.15,
    cottage: 1.22
  };

  const rubFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  });

  function formatRoundedRub(value) {
    const rounded = Math.round(value / 10000) * 10000;
    return rubFormatter.format(rounded).replace("RUB", "₽");
  }

  function updateEstimate() {
    if (!form || !estimateNode || !durationNode) return;

    const areaValue = Number(form.elements.area.value);
    const area = Math.min(600, Math.max(20, Number.isFinite(areaValue) ? areaValue : 80));
    const packageValue = form.elements.package.value;
    const objectValue = form.elements.object.value;
    const rate = rates[packageValue] || rates.comfort;
    const factor = objectFactor[objectValue] || 1;
    const total = area * rate.price * factor;
    const duration = rate.days + Math.max(0, Math.ceil((area - 80) / 18));

    estimateNode.textContent = "от " + formatRoundedRub(total);
    durationNode.textContent = String(duration);
  }

  function formatPhone(value) {
    const onlyDigits = value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
    const normalized = onlyDigits.startsWith("7") ? onlyDigits : "7" + onlyDigits;
    const code = normalized.slice(1, 4);
    const first = normalized.slice(4, 7);
    const second = normalized.slice(7, 9);
    const third = normalized.slice(9, 11);

    let result = "+7";
    if (code) result += " (" + code;
    if (code.length === 3) result += ")";
    if (first) result += " " + first;
    if (second) result += "-" + second;
    if (third) result += "-" + third;

    return result;
  }

  menuButton?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open") || false;
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav?.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    nav.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });

  window.addEventListener(
    "scroll",
    () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 8);
    },
    { passive: true }
  );

  form?.addEventListener("input", (event) => {
    if (event.target === form.elements.phone) {
      form.elements.phone.value = formatPhone(form.elements.phone.value);
    }
    updateEstimate();
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    updateEstimate();
    estimateNode?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.045)" },
        { transform: "scale(1)" }
      ],
      { duration: 280, easing: "ease-out" }
    );
  });

  document.querySelectorAll("[data-faq] details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      document.querySelectorAll("[data-faq] details").forEach((other) => {
        if (other !== item) {
          other.open = false;
        }
      });
    });
  });

  updateEstimate();
})();
