(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');

    if (!root) {
      return;
    }

    var slides = all('[data-hero-slide]', root);
    var dots = all('[data-hero-dot]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    start();
  }

  function initHomeSearch() {
    var form = document.querySelector('[data-home-search]');

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';

      if (query) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      }
    });
  }

  function initFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var result = scope.querySelector('[data-filter-result]');
      var grid = scope.querySelector('[data-card-grid]');
      var cards = all('.filter-card', scope);

      function cardText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' '));
      }

      function applyFilters() {
        var query = normalize(input && input.value);
        var selectedRegion = region ? region.value : '';
        var selectedType = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
          var matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
          var matchesType = !selectedType || card.dataset.type === selectedType;
          var show = matchesQuery && matchesRegion && matchesType;

          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (grid && year && year.value) {
          var sorted = cards.slice().sort(function (a, b) {
            var first = Number(a.dataset.year || 0);
            var second = Number(b.dataset.year || 0);
            return year.value === 'desc' ? second - first : first - second;
          });
          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }

        if (result) {
          result.textContent = visible ? '当前筛选显示 ' + visible + ' 部作品。' : '没有匹配的作品，换一个关键词试试。';
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });
    });
  }

  function createResultCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).join(' · ') : '';

    return '' +
      '<a class="movie-card wide-card" href="' + escapeHtml(movie.detail) + '">' +
        '<span class="wide-card__image">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span>' + escapeHtml(movie.region) + '</span>' +
        '</span>' +
        '<span class="wide-card__body">' +
          '<strong>' + escapeHtml(movie.title) + '</strong>' +
          '<em>' + escapeHtml(movie.oneLine) + '</em>' +
          '<small>' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(tags) + '</small>' +
        '</span>' +
      '</a>';
  }

  function initSearchPage() {
    var panel = document.querySelector('[data-search-page]');
    var data = window.SEARCH_MOVIES || [];

    if (!panel || !data.length) {
      return;
    }

    var input = panel.querySelector('[data-search-input]');
    var button = panel.querySelector('[data-search-button]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var defaults = document.querySelector('[data-search-default]');
    var tags = all('[data-quick-tags] button');

    function setQuery(value) {
      if (input) {
        input.value = value;
      }
      search();
    }

    function search() {
      var query = normalize(input && input.value);

      if (!query) {
        if (results) {
          results.innerHTML = '';
        }
        if (status) {
          status.textContent = '输入关键词后显示搜索结果。';
        }
        if (defaults) {
          defaults.hidden = false;
        }
        return;
      }

      var matched = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' '));
        return haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      if (results) {
        results.innerHTML = matched.map(createResultCard).join('');
      }
      if (status) {
        status.textContent = matched.length ? '已找到 ' + matched.length + ' 个匹配结果。' : '没有找到匹配结果。';
      }
      if (defaults) {
        defaults.hidden = true;
      }
    }

    if (button) {
      button.addEventListener('click', search);
    }
    if (input) {
      input.addEventListener('input', search);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          search();
        }
      });
    }
    tags.forEach(function (tag) {
      tag.addEventListener('click', function () {
        setQuery(tag.textContent.trim());
      });
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      setQuery(initial);
    }
  }

  function attachHls(video, source) {
    if (!video || !source || video.dataset.hlsReady === 'true') {
      return;
    }

    video.dataset.hlsReady = 'true';
    video.crossOrigin = 'anonymous';

    if (window.Hls && window.Hls.isSupported()) {
      try {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        if (window.Hls.Events) {
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          });
        }

        video._hls = hls;
        return;
      } catch (error) {
        video.src = source;
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function initPlayers() {
    all('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.play-overlay');
      var source = video ? video.dataset.src : '';

      attachHls(video, source);

      if (!video || !overlay) {
        return;
      }

      overlay.addEventListener('click', function () {
        attachHls(video, source);
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });

      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });

      video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initHomeSearch();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
