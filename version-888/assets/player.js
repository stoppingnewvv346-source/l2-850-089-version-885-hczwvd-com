document.addEventListener("DOMContentLoaded", function () {
  const players = Array.from(document.querySelectorAll("video[data-hls-src]"));

  if (players.length === 0) {
    return;
  }

  let hlsLoaderPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("HLS.js 加载失败"));
      };
      document.head.appendChild(script);
    });

    return hlsLoaderPromise;
  }

  async function initializePlayer(video) {
    if (video.dataset.ready === "true") {
      return;
    }

    const source = video.getAttribute("data-hls-src");
    const note = video.closest(".player-card")?.querySelector("[data-player-note]");

    if (!source) {
      if (note) {
        note.textContent = "未找到播放源。";
      }
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.ready = "true";
      if (note) {
        note.textContent = "已使用浏览器原生 HLS 播放。";
      }
      return;
    }

    try {
      const Hls = await loadHlsLibrary();

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          if (note) {
            note.textContent = "播放源已加载，可以开始观看。";
          }
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            if (note) {
              note.textContent = "播放器遇到无法恢复的错误，请刷新页面重试。";
            }
          }
        });
        video.dataset.ready = "true";
        video._hlsInstance = hls;
      } else {
        video.src = source;
        if (note) {
          note.textContent = "当前浏览器已尝试直接加载播放源。";
        }
      }
    } catch (error) {
      video.src = source;
      if (note) {
        note.textContent = "播放组件未能加载，已尝试直接播放。";
      }
    }
  }

  players.forEach(function (video) {
    const card = video.closest(".player-card");
    const overlay = card?.querySelector("[data-player-overlay]");

    if (overlay) {
      overlay.addEventListener("click", async function () {
        await initializePlayer(video);
        overlay.classList.add("is-hidden");
        video.play().catch(function () {
          video.controls = true;
        });
      });
    }

    video.addEventListener("play", async function () {
      await initializePlayer(video);
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }, { once: true });
  });
});
