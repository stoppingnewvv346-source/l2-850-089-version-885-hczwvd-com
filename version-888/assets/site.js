document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupFilters();
  setupShareButtons();
});

function setupMobileMenu() {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", function () {
    panel.classList.toggle("is-open");
    toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let current = 0;
  let timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const index = Number(dot.getAttribute("data-hero-dot"));
      showSlide(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  showSlide(0);
  start();
}

function setupFilters() {
  const panel = document.querySelector("[data-filter-panel]");
  const results = document.querySelector("[data-movie-results]");

  if (!panel || !results) {
    return;
  }

  const searchInput = panel.querySelector("[data-filter-search]");
  const regionSelect = panel.querySelector("[data-filter-region]");
  const typeSelect = panel.querySelector("[data-filter-type]");
  const yearSelect = panel.querySelector("[data-filter-year]");
  const tagButtons = Array.from(panel.querySelectorAll("[data-filter-tag]"));
  const counter = panel.querySelector("[data-result-count]");
  const empty = document.querySelector("[data-empty-state]");
  const cards = Array.from(results.querySelectorAll(".movie-card"));
  const viewButtons = Array.from(panel.querySelectorAll("[data-view]"));
  const params = new URLSearchParams(window.location.search);
  let activeTag = params.get("tag") || "全部";

  if (searchInput && params.get("q")) {
    searchInput.value = params.get("q");
  }

  setSelectFromParam(regionSelect, params.get("region"));
  setSelectFromParam(typeSelect, params.get("type"));
  setSelectFromParam(yearSelect, params.get("year"));

  function setSelectFromParam(select, value) {
    if (!select || !value) {
      return;
    }

    const option = Array.from(select.options).find(function (item) {
      return item.value === value;
    });

    if (option) {
      select.value = value;
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function updateTagButtons() {
    tagButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-filter-tag") === activeTag);
    });
  }

  function applyFilters() {
    const keyword = normalize(searchInput ? searchInput.value : "");
    const region = regionSelect ? regionSelect.value : "全部";
    const type = typeSelect ? typeSelect.value : "全部";
    const year = yearSelect ? yearSelect.value : "全部";
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = normalize(card.getAttribute("data-search"));
      const tags = card.getAttribute("data-tags") || "";
      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesRegion = region === "全部" || card.getAttribute("data-region") === region;
      const matchesType = type === "全部" || card.getAttribute("data-type") === type;
      const matchesYear = year === "全部" || card.getAttribute("data-year") === year;
      const matchesTag = activeTag === "全部" || tags.split(",").includes(activeTag);
      const isVisible = matchesKeyword && matchesRegion && matchesType && matchesYear && matchesTag;

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (counter) {
      counter.textContent = visibleCount + " 个视频";
    }

    if (empty) {
      empty.hidden = visibleCount !== 0;
    }
  }

  [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  tagButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeTag = button.getAttribute("data-filter-tag") || "全部";
      updateTagButtons();
      applyFilters();
    });
  });

  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const view = button.getAttribute("data-view");
      viewButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      results.classList.toggle("is-list-view", view === "list");
    });
  });

  updateTagButtons();
  applyFilters();
}

function setupShareButtons() {
  const buttons = document.querySelectorAll("[data-share-button]");

  buttons.forEach(function (button) {
    button.addEventListener("click", async function () {
      const payload = {
        title: document.title,
        text: document.querySelector("meta[name='description']")?.content || document.title,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(payload);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      button.textContent = "链接已复制";
      window.setTimeout(function () {
        button.textContent = "分享影片";
      }, 1800);
    });
  });
}
