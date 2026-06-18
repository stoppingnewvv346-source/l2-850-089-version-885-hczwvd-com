(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.site-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[type="search"]');
      if (!input) {
        return;
      }
      var q = input.value.trim();
      if (!q) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter(root) {
    var input = root.querySelector('.js-search');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var active = root.querySelector('.filter-chip.is-active');
    var query = input ? normalize(input.value) : '';
    var extra = active ? normalize(active.getAttribute('data-filter')) : '';
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      var ok = (!query || text.indexOf(query) !== -1) && (!extra || text.indexOf(extra) !== -1);
      card.classList.toggle('is-hidden', !ok);
      if (ok) {
        visible += 1;
      }
    });
    var existing = root.querySelector('.no-result');
    if (!visible && cards.length) {
      if (!existing) {
        var box = document.createElement('div');
        box.className = 'no-result';
        box.textContent = '没有找到匹配影片';
        var holder = root.querySelector('.movie-grid, .ranking-list');
        if (holder) {
          holder.appendChild(box);
        }
      }
    } else if (existing) {
      existing.remove();
    }
  }

  document.querySelectorAll('.listing-page').forEach(function (root) {
    var input = root.querySelector('.js-search');
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
      input.addEventListener('input', function () {
        applyFilter(root);
      });
    }
    root.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        root.querySelectorAll('.filter-chip').forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        applyFilter(root);
      });
    });
    applyFilter(root);
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movieVideo');
  var start = document.getElementById('playerStart');
  if (!video || !start || !streamUrl) {
    return;
  }
  var attached = false;
  var hls = null;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attach();
    start.classList.add('is-hidden');
    video.controls = true;
    var attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        start.classList.remove('is-hidden');
      });
    }
  }

  start.addEventListener('click', function (event) {
    event.preventDefault();
    play();
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    start.classList.add('is-hidden');
  });

  video.addEventListener('ended', function () {
    start.classList.remove('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
