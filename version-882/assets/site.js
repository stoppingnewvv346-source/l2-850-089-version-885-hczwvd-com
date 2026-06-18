(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var scope = document.querySelector("[data-filter-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      input.addEventListener("input", function () {
        var terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = terms.every(function (term) {
            return text.indexOf(term) !== -1;
          });
          card.hidden = terms.length > 0 && !matched;
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-player-button]");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hls;

      function load() {
        if (loaded || !stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          box._hls = hls;
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function play() {
        load();
        box.classList.add("is-playing");
        var started = video.play();
        if (started && typeof started.catch === "function") {
          started.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
