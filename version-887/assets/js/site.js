(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchParams = new URLSearchParams(window.location.search);
    var searchInput = document.getElementById("movieSearch");
    if (searchInput && searchParams.get("q")) {
      searchInput.value = searchParams.get("q");
    }

    var catalog = document.querySelector("[data-catalog]");
    if (catalog) {
      var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));
      var typeFilter = document.getElementById("typeFilter");
      var yearFilter = document.getElementById("yearFilter");
      var regionFilter = document.getElementById("regionFilter");
      var emptyState = document.querySelector("[data-empty-state]");

      function valueOf(control) {
        return control ? control.value : "all";
      }

      function filterCards() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var type = valueOf(typeFilter);
        var year = valueOf(yearFilter);
        var region = valueOf(regionFilter);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-keywords"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (type !== "all" && card.getAttribute("data-type") !== type) {
            matched = false;
          }
          if (year !== "all" && card.getAttribute("data-year") !== year) {
            matched = false;
          }
          if (region !== "all" && card.getAttribute("data-region") !== region) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [searchInput, typeFilter, yearFilter, regionFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });
      filterCards();
    }
  });
}());
