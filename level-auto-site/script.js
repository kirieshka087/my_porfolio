const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const tabs = document.querySelectorAll("[data-filter]");
const portfolioGrid = document.querySelector("[data-portfolio-grid]");
const servicesDialog = document.querySelector("[data-services-dialog]");
const openServicesButtons = document.querySelectorAll("[data-open-services]");
const closeServicesButton = document.querySelector("[data-close-services]");
const serviceTabs = document.querySelectorAll("[data-service-tab]");
const servicePanels = document.querySelectorAll("[data-service-panel]");
const reviewsTrack = document.querySelector("[data-reviews-track]");
const reviewPrev = document.querySelector("[data-review-prev]");
const reviewNext = document.querySelector("[data-review-next]");
const reviewDots = document.querySelector("[data-review-dots]");

const portfolioSets = {
  exterior: [
    ["./assets/portfolio-wrap.webp", "Матовый BMW после бронирования и оклейки", "Бронирование и оклейка"],
    ["./assets/portfolio-polishing-lkp.webp", "Полировка лакокрасочного покрытия бампера", "Полировка ЛКП"],
    ["./assets/portfolio-protective-coating.webp", "Защитное покрытие на кузове автомобиля", "Защитное покрытие"],
    ["./assets/portfolio-ceramic-lkp.png", "Нанесение керамики на лакокрасочное покрытие", "Керамика ЛКП"],
  ],
  interior: [
    ["./assets/portfolio-dry-cleaning.png", "Химчистка руля и элементов салона", "Химчистка"],
    ["./assets/portfolio-leather-care.png", "Обработка кожаных сидений автомобиля", "Обработка кожи"],
    ["./assets/portfolio-ozonation.png", "Озонирование салона автомобиля", "Озонирование"],
    ["./assets/portfolio-final-inspection.webp", "Финальный осмотр чистого салона", "Финальный осмотр"],
  ],
  protection: [
    ["./assets/portfolio-polyurethane.png", "Оклейка кузова цветным полиуретаном", "Цветной полиуретан"],
    ["./assets/portfolio-antirain.png", "Нанесение антидождя на стекло", "Антидождь"],
    ["./assets/portfolio-wheels-tires.png", "Защита дисков и резины", "Диски и резина"],
    ["./assets/portfolio-wheel-protection.png", "Защитная обработка колесных дисков", "Защита дисков"],
  ],
};

const portfolioOrder = Object.keys(portfolioSets);
let currentPortfolioIndex = 0;

function renderPortfolio(filter, direction = 1) {
  if (!portfolioGrid) return;

  const items = portfolioSets[filter] || portfolioSets.exterior;
  portfolioGrid.classList.remove("is-line-next", "is-line-prev");
  portfolioGrid.innerHTML = items
    .map(
      ([src, alt, caption]) => `
        <figure class="work-item">
          <img src="${src}" alt="${alt}">
          <figcaption>${caption}</figcaption>
        </figure>
      `
    )
    .join("");

  portfolioGrid.scrollLeft = 0;
  void portfolioGrid.offsetWidth;
  portfolioGrid.classList.add(direction >= 0 ? "is-line-next" : "is-line-prev");
}

function activatePortfolio(targetFilter) {
  const nextIndex = portfolioOrder.indexOf(targetFilter);
  const safeNextIndex = nextIndex === -1 ? 0 : nextIndex;
  const direction = safeNextIndex >= currentPortfolioIndex ? 1 : -1;
  currentPortfolioIndex = safeNextIndex;

  tabs.forEach((item) => {
    const isActive = item.dataset.filter === portfolioOrder[currentPortfolioIndex];
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  renderPortfolio(portfolioOrder[currentPortfolioIndex], direction);
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    const icon = menuToggle.querySelector("svg");

    if (icon) {
      icon.setAttribute("data-lucide", isOpen ? "x" : "menu");
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activatePortfolio(tab.dataset.filter);
  });
});

openServicesButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!servicesDialog) return;

    if (typeof servicesDialog.showModal === "function") {
      servicesDialog.showModal();
    } else {
      servicesDialog.setAttribute("open", "");
    }

    document.body.classList.add("dialog-open");
  });
});

function closeServicesDialog() {
  if (!servicesDialog) return;
  servicesDialog.close();
  document.body.classList.remove("dialog-open");
}

closeServicesButton?.addEventListener("click", closeServicesDialog);

servicesDialog?.addEventListener("click", (event) => {
  if (event.target === servicesDialog) {
    closeServicesDialog();
  }
});

servicesDialog?.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

serviceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.serviceTab;

    serviceTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    servicePanels.forEach((panel) => {
      panel.hidden = panel.dataset.servicePanel !== target;
      panel.classList.toggle("is-active", panel.dataset.servicePanel === target);
    });
  });
});

const originalReviews = reviewsTrack
  ? Array.from(reviewsTrack.children).map((card) => card.cloneNode(true))
  : [];

let reviewIndex = 0;
let reviewStep = 0;
let reviewCloneCount = 3;
let isReviewAnimating = false;
let reviewPageSize = 3;

function getReviewPageSize() {
  return window.matchMedia("(max-width: 560px)").matches ? 1 : 3;
}

function getVisibleReviewCount() {
  if (window.matchMedia("(max-width: 560px)").matches) return 1;
  if (window.matchMedia("(max-width: 820px)").matches) return 2;
  return 3;
}

function getReviewGap() {
  if (!reviewsTrack) return 0;
  const styles = getComputedStyle(reviewsTrack);
  return Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
}

function moveReviews(withTransition = true) {
  if (!reviewsTrack) return;
  reviewsTrack.style.transition = withTransition ? "transform 280ms ease" : "none";
  reviewsTrack.style.transform = `translateX(-${reviewIndex * reviewStep}px)`;
  updateReviewDots();
}

function getLogicalReviewIndex() {
  if (originalReviews.length === 0) return 0;
  return (reviewIndex - reviewCloneCount + originalReviews.length) % originalReviews.length;
}

function updateReviewDots() {
  if (!reviewDots || originalReviews.length === 0) return;
  const activeDot = Math.floor(getLogicalReviewIndex() / reviewPageSize);

  reviewDots.querySelectorAll("[data-review-dot]").forEach((dot) => {
    dot.classList.toggle("is-active", Number(dot.dataset.reviewDot) === activeDot);
  });
}

function renderReviewDots() {
  if (!reviewDots || originalReviews.length === 0) return;

  const dotCount = Math.ceil(originalReviews.length / reviewPageSize);
  reviewDots.innerHTML = Array.from({ length: dotCount }, (_, index) => {
    const start = index * reviewPageSize + 1;
    const end = Math.min(start + reviewPageSize - 1, originalReviews.length);
    const label = start === end ? `Отзыв ${start}` : `Отзывы ${start}-${end}`;
    return `<button type="button" aria-label="${label}" data-review-dot="${index}"></button>`;
  }).join("");

  reviewDots.querySelectorAll("[data-review-dot]").forEach((dot) => {
    dot.addEventListener("click", () => {
      if (!reviewsTrack || isReviewAnimating) return;
      reviewIndex = reviewCloneCount + Number(dot.dataset.reviewDot) * reviewPageSize;
      moveReviews(true);
    });
  });
}

function setupReviews() {
  if (!reviewsTrack || originalReviews.length === 0) return;

  reviewPageSize = getReviewPageSize();
  renderReviewDots();
  reviewCloneCount = Math.min(reviewPageSize, originalReviews.length);
  const prefix = originalReviews.slice(-reviewCloneCount).map((card) => card.cloneNode(true));
  const suffix = originalReviews.slice(0, reviewCloneCount).map((card) => card.cloneNode(true));

  reviewsTrack.innerHTML = "";
  [...prefix, ...originalReviews.map((card) => card.cloneNode(true)), ...suffix].forEach((card) => {
    reviewsTrack.appendChild(card);
  });

  const firstCard = reviewsTrack.querySelector(".review-card");
  reviewStep = firstCard ? firstCard.getBoundingClientRect().width + getReviewGap() : 0;
  reviewIndex = reviewCloneCount;
  moveReviews(false);
}

function slideReviews(direction) {
  if (!reviewsTrack || isReviewAnimating) return;
  isReviewAnimating = true;
  reviewIndex += direction * reviewPageSize;
  moveReviews(true);
}

reviewsTrack?.addEventListener("transitionend", () => {
  if (!reviewsTrack) return;

  const originalCount = originalReviews.length;

  if (reviewIndex >= originalCount + reviewCloneCount) {
    reviewIndex = reviewCloneCount + ((reviewIndex - reviewCloneCount) % originalCount);
    moveReviews(false);
  }

  if (reviewIndex < reviewCloneCount) {
    reviewIndex = originalCount + reviewIndex;
    moveReviews(false);
  }

  isReviewAnimating = false;
  updateReviewDots();
});

reviewPrev?.addEventListener("click", () => slideReviews(-1));
reviewNext?.addEventListener("click", () => slideReviews(1));

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(setupReviews, 120);
});

setupReviews();

if (window.lucide) {
  window.lucide.createIcons();
}
