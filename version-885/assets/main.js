(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilter(panel) {
    var scope = panel.closest('.page-stack') || document;
    var input = panel.querySelector('[data-filter-input]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var query = new URLSearchParams(window.location.search).get('q');

    if (query && input && scope.hasAttribute('data-search-page')) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        card.classList.toggle('is-hidden', !(matchesKeyword && matchesType && matchesYear));
      });
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, apply);
      }
      if (type) {
        type.addEventListener(eventName, apply);
      }
      if (year) {
        year.addEventListener(eventName, apply);
      }
    });

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilter);

  function setupPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');
    var url = box.getAttribute('data-play');
    var loaded = false;
    var hls = null;

    if (!video || !url) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      var promise = video.play();
      box.classList.add('is-playing');
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        box.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      box.classList.remove('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(setupPlayer);
})();
