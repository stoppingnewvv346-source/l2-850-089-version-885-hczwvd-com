(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function buildCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"./" + escapeHtml(movie.file) + "\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-tags=\"" + escapeHtml([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ")) + "\">" +
            "<span class=\"poster-frame\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span>" +
            "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
            "<span class=\"play-bubble\">▶</span>" +
            "</span>" +
            "<span class=\"movie-info\">" +
            "<strong>" + escapeHtml(movie.title) + "</strong>" +
            "<em>" + escapeHtml(movie.oneLine || "") + "</em>" +
            "<span class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></span>" +
            "<span class=\"tag-row\">" + tags + "</span>" +
            "</span>" +
            "</a>";
    }

    function setupHeader() {
        var toggle = $("[data-mobile-toggle]");
        var panel = $("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }
        $$("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            });
        });
    }

    function setupHero() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = $$("[data-hero-slide]", hero);
        var dots = $$("[data-hero-dot]", hero);
        var prev = $("[data-hero-prev]", hero);
        var next = $("[data-hero-next]", hero);
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
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
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        $$("[data-filter-panel]").forEach(function (panel) {
            var section = panel.closest("section") || document;
            var cards = $$(".movie-card", section);
            var input = $("[data-filter-input]", panel);
            var year = $("[data-filter-year]", panel);
            var type = $("[data-filter-type]", panel);
            var grid = $("[data-movie-grid]", section);
            var empty = document.createElement("div");
            empty.className = "empty-state is-filter-hidden";
            empty.textContent = "没有匹配的影片";
            if (grid) {
                grid.appendChild(empty);
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-tags") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var ok = true;
                    if (query && text.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        ok = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        ok = false;
                    }
                    card.classList.toggle("is-filter-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                empty.classList.toggle("is-filter-hidden", visible !== 0);
            }
            [input, year, type].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
        });
    }

    function setupSearchPage() {
        var results = $("[data-search-results]");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = $("[data-search-page-input]");
        var title = $("[data-search-title]");
        if (input) {
            input.value = query;
        }
        if (!query.trim()) {
            return;
        }
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = window.SEARCH_INDEX.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        }).slice(0, 120);
        if (title) {
            title.textContent = "匹配结果";
        }
        results.innerHTML = matches.length ? matches.map(buildCard).join("") : "<div class=\"empty-state\">没有匹配的影片</div>";
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movie-player");
        var overlay = $("[data-player-overlay]");
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
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
            } else {
                video.src = source;
            }
            video.setAttribute("controls", "controls");
        }
        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupHeader();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
