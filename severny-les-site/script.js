const areaInput = document.querySelector("#area");
const areaOutput = document.querySelector("#areaOutput");
const packageSelect = document.querySelector("#packageSelect");
const totalPrice = document.querySelector("#totalPrice");
const objectRadios = document.querySelectorAll('input[name="objectType"]');
const menuToggle = document.querySelector(".menu-toggle");
const body = document.body;
const filterButtons = document.querySelectorAll("[data-filter]");
const projectTrack = document.querySelector(".project-track");
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const prevButton = document.querySelector(".carousel-prev");
const nextButton = document.querySelector(".carousel-next");

let activeFilter = "all";
let isCarouselMoving = false;

const formatCurrency = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

const updateCalculator = () => {
  if (!areaInput || !areaOutput || !packageSelect || !totalPrice) return;

  const area = Number(areaInput.value);
  const pricePerMeter = Number(packageSelect.value);
  const activeType = document.querySelector('input[name="objectType"]:checked')?.value;
  const typeFactor = activeType === "sauna" ? 0.78 : 1;
  const total = Math.round(area * pricePerMeter * typeFactor);

  areaOutput.textContent = `${area} м²`;
  totalPrice.textContent = formatCurrency(total);
};

const getVisibleCards = () =>
  Array.from(projectTrack?.querySelectorAll(".project-card") || []).filter((card) => !card.classList.contains("is-hidden"));

const getCarouselStep = () => {
  const firstCard = getVisibleCards()[0];
  if (!firstCard || !projectTrack) return 0;

  const styles = getComputedStyle(projectTrack);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  return firstCard.getBoundingClientRect().width + gap;
};

const moveCarousel = (direction) => {
  if (!projectTrack || isCarouselMoving) return;

  const visibleCards = getVisibleCards();
  if (visibleCards.length < 2) return;

  const step = getCarouselStep();
  if (!step) return;

  isCarouselMoving = true;
  projectTrack.classList.add("is-animating");

  if (direction === "next") {
    projectTrack.style.transform = `translateX(-${step}px)`;
    window.setTimeout(() => {
      projectTrack.classList.remove("is-animating");
      projectTrack.append(visibleCards[0]);
      projectTrack.style.transform = "translateX(0)";
      isCarouselMoving = false;
    }, 330);
  } else {
    const firstVisible = visibleCards[0];
    const lastVisible = visibleCards[visibleCards.length - 1];
    projectTrack.classList.remove("is-animating");
    projectTrack.insertBefore(lastVisible, firstVisible);
    projectTrack.style.transform = `translateX(-${step}px)`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        projectTrack.classList.add("is-animating");
        projectTrack.style.transform = "translateX(0)";
        window.setTimeout(() => {
          projectTrack.classList.remove("is-animating");
          isCarouselMoving = false;
        }, 330);
      });
    });
  }
};

const applyProjectFilter = (filter) => {
  activeFilter = filter;

  projectCards.forEach((card) => projectTrack?.append(card));

  projectCards.forEach((card) => {
    const shouldShow = activeFilter === "all" || card.dataset.type === activeFilter;
    card.classList.toggle("is-hidden", !shouldShow);
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  projectTrack?.classList.remove("is-animating");
  if (projectTrack) projectTrack.style.transform = "translateX(0)";
};

areaInput?.addEventListener("input", updateCalculator);
packageSelect?.addEventListener("change", updateCalculator);
objectRadios.forEach((radio) => radio.addEventListener("change", updateCalculator));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyProjectFilter(button.dataset.filter || "all"));
});

prevButton?.addEventListener("click", () => moveCarousel("prev"));
nextButton?.addEventListener("click", () => moveCarousel("next"));

menuToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a, .header-actions a").forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});

updateCalculator();
applyProjectFilter(activeFilter);
