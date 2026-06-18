(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-site-nav]');
    var search = qs('.nav-search');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      if (search) {
        search.classList.toggle('is-open');
      }
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var type = qs('[data-filter-type]', panel);
      var year = qs('[data-filter-year]', panel);
      var count = qs('[data-filter-count]', panel);
      var list = panel.parentElement ? qs('[data-filter-list]', panel.parentElement) : null;
      var cards = list ? qsa('[data-search-card]', list) : qsa('[data-search-card]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (input && query) {
        input.value = query;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var q = normalize(input ? input.value : '');
        var t = normalize(type ? type.value : '');
        var y = normalize(year ? year.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([card.dataset.title, card.dataset.tags].join(' '));
          var cardType = normalize(card.dataset.type);
          var cardYear = normalize(card.dataset.year);
          var matched = (!q || text.indexOf(q) !== -1) && (!t || cardType === t) && (!y || cardYear === y);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部';
        }
      }

      [input, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('[data-play]', player);
      var hlsInstance = null;

      if (!video || !overlay) {
        return;
      }

      function bindSource() {
        var src = video.getAttribute('data-src');
        if (!src || video.dataset.ready === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.dataset.ready = '1';
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          video.dataset.ready = '1';
          return;
        }
        video.src = src;
        video.dataset.ready = '1';
      }

      function play() {
        bindSource();
        overlay.classList.add('is-hidden');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }

      overlay.addEventListener('click', play);
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
