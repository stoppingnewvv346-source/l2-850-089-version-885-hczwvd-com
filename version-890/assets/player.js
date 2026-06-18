(function () {
  const ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (root) {
      const video = root.querySelector("video");
      const cover = root.querySelector(".player-cover");
      const trigger = root.querySelector(".player-trigger");
      const stream = video ? video.getAttribute("data-stream") : "";
      let prepared = false;
      let hls = null;

      if (!video || !stream) {
        return;
      }

      const hideCover = function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      };

      const prepare = function () {
        if (prepared) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        prepared = true;
      };

      const start = function () {
        prepare();
        hideCover();
        const result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            video.controls = true;
          });
        }
      };

      if (trigger) {
        trigger.addEventListener("click", start);
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!prepared) {
          start();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
