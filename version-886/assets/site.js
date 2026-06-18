(function () {
  function closestForm(element) {
    while (element && element.nodeType === 1) {
      if (element.matches('[data-search-form]')) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('show');
      document.body.classList.toggle('menu-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = next;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  function renderSearchResults(input, resultsBox, items) {
    if (!items.length) {
      resultsBox.innerHTML = '<a href="categories.html"><strong>查看分类总览</strong><span>换个关键词继续浏览</span></a>';
      resultsBox.classList.add('show');
      return;
    }

    resultsBox.innerHTML = items.slice(0, 10).map(function (item) {
      return '<a href="' + item.link + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></a>';
    }).join('');
    resultsBox.classList.add('show');
  }

  function setupGlobalSearch() {
    var index = window.MOVIE_INDEX || [];
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));

    inputs.forEach(function (input) {
      var form = closestForm(input);
      var resultsBox = form ? form.querySelector('[data-search-results]') : null;

      if (!form || !resultsBox) {
        return;
      }

      function collect() {
        var query = normalize(input.value);
        if (!query) {
          resultsBox.classList.remove('show');
          resultsBox.innerHTML = '';
          return [];
        }

        var parts = query.split(/\s+/).filter(Boolean);
        var items = index.filter(function (item) {
          var haystack = normalize([item.title, item.year, item.region, item.genre, item.type, item.category].join(' '));
          return parts.every(function (part) {
            return haystack.indexOf(part) !== -1;
          });
        });

        renderSearchResults(input, resultsBox, items);
        return items;
      }

      input.addEventListener('input', collect);
      input.addEventListener('focus', collect);
      form.addEventListener('submit', function (event) {
        var items = collect();
        if (items.length) {
          event.preventDefault();
          window.location.href = items[0].link;
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-search-form]')) {
        document.querySelectorAll('[data-search-results]').forEach(function (box) {
          box.classList.remove('show');
        });
      }
    });
  }

  function setupLocalFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var search = document.querySelector('[data-filter-search]');
    var year = document.querySelector('[data-filter-year]');
    var type = document.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');

    if (!cards.length || (!search && !year && !type)) {
      return;
    }

    function apply() {
      var query = normalize(search ? search.value : '');
      var selectedYear = year ? year.value : 'all';
      var selectedType = type ? type.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = selectedYear === 'all' || card.getAttribute('data-year') === selectedYear;
        var matchesType = selectedType === 'all' || card.getAttribute('data-type') === selectedType;
        var show = matchesQuery && matchesYear && matchesType;

        card.classList.toggle('is-hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupPlayerScroll() {
    var link = document.querySelector('[data-scroll-player]');
    var video = document.querySelector('[data-player-video]');

    if (!link || !video) {
      return;
    }

    link.addEventListener('click', function (event) {
      event.preventDefault();
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var overlay = document.querySelector('[data-player-overlay]');
      if (overlay) {
        overlay.click();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilters();
    setupPlayerScroll();
  });
})();
