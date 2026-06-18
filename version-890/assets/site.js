(function () {
  const ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  const text = function (value) {
    return String(value || "").toLowerCase().trim();
  };

  ready(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
      const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
      const prev = carousel.querySelector("[data-hero-prev]");
      const next = carousel.querySelector("[data-hero-next]");
      let index = 0;
      let timer = null;

      const show = function (nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      };

      const schedule = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          schedule();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          schedule();
        });
      });

      show(0);
      schedule();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      const searchInput = panel.querySelector("[data-search-input]");
      const selects = Array.from(panel.querySelectorAll("[data-filter-select]"));
      const cards = Array.from(panel.querySelectorAll("[data-movie-card]"));
      const empty = panel.querySelector("[data-empty-result]");
      const params = new URLSearchParams(window.location.search);
      const incoming = params.get("q");

      if (searchInput && incoming) {
        searchInput.value = incoming;
      }

      const update = function () {
        const query = text(searchInput ? searchInput.value : "");
        const activeFilters = selects.map(function (select) {
          return {
            key: select.getAttribute("data-filter-key"),
            value: text(select.value)
          };
        }).filter(function (filter) {
          return filter.value;
        });
        let visible = 0;

        cards.forEach(function (card) {
          const haystack = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-category"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          const queryMatch = !query || haystack.includes(query);
          const filterMatch = activeFilters.every(function (filter) {
            return text(card.getAttribute("data-" + filter.key)) === filter.value;
          });
          const keep = queryMatch && filterMatch;
          card.classList.toggle("is-hidden", !keep);
          if (keep) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      };

      if (searchInput) {
        searchInput.addEventListener("input", update);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", update);
      });

      update();
    });
  });
})();
