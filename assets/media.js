/* Players de apresentação. Sem bibliotecas, sem autoplay no catálogo.
 * YouTube/Vimeo só são carregados após a ação de assistir.
 */
(() => {
  "use strict";
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>';
  let currentGallery = null;
  function thumbnail(product, className = "") {
    if (product.image) return `<img class="${escape(className)}" src="${escape(product.image)}" alt="${escape(product.imageAlt || product.name)}" width="960" height="540" loading="lazy">`;
    return `<span class="${className === "media-image" ? "media-no-image" : "thumbnail-placeholder"}">Thumbnail em breve</span>`;
  }

  function startTime(value) {
    const raw = String(value || "");
    if (/^\d+$/.test(raw)) return Math.min(Number(raw), 86400);
    const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    return match ? Math.min(Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0), 86400) : 0;
  }
  function resolveSource(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    const raw = value.trim();
    // Caminhos locais relativos preservam a subpasta do GitHub Pages.
    const relative = !/^[a-z][a-z\d+.-]*:/i.test(raw) && !raw.startsWith("/") && !raw.includes("\\");
    let url;
    try { url = new URL(raw, location.href); } catch { return null; }
    if (url.username || url.password || (!relative && url.protocol !== "https:")) return null;
    if (relative && !["https:", "http:", "file:"].includes(url.protocol)) return null;
    const youtubeHosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"];
    const parts = url.pathname.split("/").filter(Boolean);
    if (!relative && youtubeHosts.includes(url.hostname)) {
      const id = url.hostname.endsWith("youtu.be") ? parts[0] : url.searchParams.get("v") || (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : "");
      if (!/^[\w-]{11}$/.test(id || "")) return null;
      const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
      embed.searchParams.set("playsinline", "1");
      embed.searchParams.set("rel", "0");
      const start = startTime(url.searchParams.get("start") || url.searchParams.get("t"));
      if (start) embed.searchParams.set("start", String(start));
      return { type: "embed", provider: "YouTube", src: embed.href, original: url.href };
    }
    if (!relative && ["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
      const id = /^\d+$/.test(parts[0] || "") ? parts[0] : parts.filter((part) => /^\d+$/.test(part)).at(-1);
      if (!id) return null;
      const embed = new URL(`https://player.vimeo.com/video/${id}`);
      const hash = url.searchParams.get("h") || (parts[0] === id ? parts[1] : "");
      if (hash && /^[a-z\d]+$/i.test(hash)) embed.searchParams.set("h", hash);
      embed.searchParams.set("dnt", "1");
      return { type: "embed", provider: "Vimeo", src: embed.href, original: url.href };
    }
    const extension = url.pathname.match(/\.(mp4|webm|ogv)$/i)?.[1].toLowerCase();
    if (extension) return { type: "file", provider: "Vídeo", src: relative ? raw : url.href, original: relative ? raw : url.href };
    // Outros provedores continuam disponíveis como link; não recebem iframe arbitrário.
    if (!relative && url.protocol === "https:") return { type: "external", provider: "Vídeo externo", original: url.href };
    return null;
  }
  function safeCaption(value) {
    if (!value) return "";
    try {
      const url = new URL(value, location.href);
      if (!url.pathname.endsWith(".vtt") || url.username || url.password) return "";
      if (/^[a-z][a-z\d+.-]*:/i.test(value) && url.protocol !== "https:") return "";
      if (String(value).startsWith("//") || !["https:", "http:", "file:"].includes(url.protocol)) return "";
      return value;
    } catch { return ""; }
  }
  function videos(product) {
    const entries = [{ url: product.videoUrl, title: product.videoTitle || "Apresentação do produto", poster: product.videoPoster, captions: product.videoCaptions }];
    return entries.map((entry) => ({ ...entry, source: resolveSource(entry.url), poster: entry.poster || product.image || "", captions: safeCaption(entry.captions) })).filter((entry) => entry.source);
  }
  function images(product) {
    const entries = product.image ? [{ src: product.image, alt: product.imageAlt, title: "Imagem de apresentação" }] : [];
    entries.push(...(Array.isArray(product.images) ? product.images : []));
    const seen = new Set();
    return entries.flatMap((entry) => {
      const image = typeof entry === "string" ? { src: entry } : entry;
      if (!image || typeof image.src !== "string" || !image.src.trim()) return [];
      const src = image.src.trim();
      if (seen.has(src)) return [];
      seen.add(src);
      return [{ type: "image", src, alt: image.alt || `${product.name} — imagem ${seen.size}`, title: image.title || `Imagem ${seen.size} do resource` }];
    });
  }
  function slides(product) {
    const videoItems = videos(product).map((item, index) => ({ ...item, type: "video", title: item.title || (index === 0 ? "Apresentação do resource" : `Vídeo adicional ${index}`) }));
    const imageItems = images(product);
    if (!imageItems.length) imageItems.push({ type: "image", src: "", title: `Imagens do ${product.kind === "package" ? "pacote" : "resource"}`, alt: "" });
    // Avançar a partir do vídeo principal leva diretamente às imagens.
    return videoItems.length ? [videoItems[0], ...imageItems, ...videoItems.slice(1)] : imageItems;
  }
  const arrowIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  function html(product) {
    const items = slides(product);
    const multiple = items.length > 1;
    return `<section class="detail-media-section" data-media-gallery role="region" aria-roledescription="carrossel" aria-label="Apresentação de ${escape(product.name)}" tabindex="0">
      <div class="media-carousel">
        <div class="media-panel" id="media-panel" role="group" aria-roledescription="slide"></div>
        ${multiple ? `<button class="media-arrow media-arrow-prev" data-media-prev aria-label="Mídia anterior" aria-controls="media-panel">${arrowIcon}</button><button class="media-arrow media-arrow-next" data-media-next aria-label="Próxima mídia" aria-controls="media-panel">${arrowIcon}</button>` : ""}
      </div>
      ${multiple ? `<div class="media-dots" role="group" aria-label="Escolher mídia">${items.map((item, index) => `<button class="media-dot${index === 0 ? " active" : ""}" data-media-go="${index}" aria-pressed="${index === 0}" aria-controls="media-panel" aria-label="Ver ${item.type === "video" ? "vídeo" : "imagem"} ${index + 1}: ${escape(item.title)}"></button>`).join("")}</div>` : ""}
      <div class="media-caption"><div class="media-caption-info"><span class="media-position" aria-hidden="true"></span><p class="media-current-title" aria-live="polite" aria-atomic="true"></p></div><a class="media-external-link" hidden target="_blank" rel="noopener noreferrer"></a></div>
      ${window.STORE_CONFIG.demoMode ? '<p class="detail-demo-note">CONTEÚDO DEMONSTRATIVO · Produtos, preços e vídeos de exemplo. Os clipes incluídos não mostram um resource real em execução.</p>' : ""}
    </section>`;
  }
  function stopPlayer(root) {
    root.querySelectorAll("video").forEach((video) => { video.pause(); video.removeAttribute("src"); video.load(); });
    root.querySelectorAll("iframe").forEach((iframe) => iframe.remove());
  }
  function stop() {
    if (!currentGallery) return;
    stopPlayer(currentGallery.root);
    currentGallery.root.querySelector(".media-panel").replaceChildren();
    currentGallery = null;
  }
  function mount(root, product, autoPlay = false) {
    const gallery = { root, product, items: slides(product), index: 0 };
    currentGallery = gallery;
    const panel = root.querySelector(".media-panel");
    const caption = root.querySelector(".media-current-title");
    const external = root.querySelector(".media-external-link");
    function renderPanel() {
      stopPlayer(root);
      external.hidden = true;
      const item = gallery.items[gallery.index];
      panel.dataset.mediaType = item.type;
      panel.setAttribute("aria-label", `Mídia ${gallery.index + 1} de ${gallery.items.length}: ${item.title}`);
      root.querySelector(".media-position").textContent = `${gallery.index + 1} / ${gallery.items.length}`;
      root.querySelectorAll("[data-media-go]").forEach((button) => {
        const selected = Number(button.dataset.mediaGo) === gallery.index;
        button.classList.toggle("active", selected); button.setAttribute("aria-pressed", String(selected));
      });
      caption.textContent = item.title;
      if (item.type === "image") {
        panel.innerHTML = item.src ? `<img class="media-image" src="${escape(item.src)}" alt="${escape(item.alt)}" width="960" height="540" loading="lazy" decoding="async">` : `<span class="media-no-image">Imagens do ${product.kind === "package" ? "pacote" : "resource"} em breve</span>`;
        return;
      }
      external.href = item.source.original; external.hidden = false;
      external.textContent = item.source.type === "file" ? "Abrir arquivo de vídeo ↗" : `Abrir ${item.source.provider === "Vídeo externo" ? "vídeo" : "no " + item.source.provider} ↗`;
      const poster = item.poster ? `<img class="media-poster" src="${escape(item.poster)}" alt="" width="960" height="540">` : '<span class="media-poster-placeholder" aria-hidden="true"></span>';
      if (item.source.type === "external") {
        panel.innerHTML = `<a class="media-play" href="${escape(item.source.original)}" target="_blank" rel="noopener noreferrer">${poster}<span class="media-play-content"><span class="media-play-circle">${playIcon}</span><strong>Assistir em outra aba</strong><small>${escape(item.title || product.name)}</small></span></a>`;
      } else {
        panel.innerHTML = `<button class="media-play" data-play-media aria-label="Reproduzir ${escape(item.title || product.name)}">${poster}<span class="media-play-content"><span class="media-play-circle">${playIcon}</span><strong>Assistir à apresentação</strong><small>${escape(item.source.provider)} · ${escape(item.title || product.name)}</small></span></button>`;
      }
    }
    function goTo(index) {
      gallery.index = (index + gallery.items.length) % gallery.items.length;
      renderPanel();
    }
    function play() {
      const item = gallery.items[gallery.index];
      if (!item || item.type !== "video" || item.source.type === "external") return;
      stopPlayer(root); panel.replaceChildren();
      if (item.source.type === "embed") {
        const iframe = document.createElement("iframe");
        const url = new URL(item.source.src); url.searchParams.set("autoplay", "1");
        iframe.src = url.href;
        iframe.title = `${item.title || "Apresentação"} — ${product.name}`;
        iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.className = "media-player";
        panel.append(iframe);
      } else {
        const video = document.createElement("video");
        video.className = "media-player"; video.controls = true; video.playsInline = true;
        video.preload = "metadata"; if (item.poster) video.poster = item.poster;
        video.setAttribute("aria-label", `${item.title || "Apresentação"} — ${product.name}`);
        if (item.captions) {
          const track = document.createElement("track");
          track.kind = "captions"; track.src = item.captions; track.srclang = "pt-BR"; track.label = "Português"; track.default = true;
          video.append(track);
        }
        video.addEventListener("error", () => {
          if (!video.isConnected || currentGallery !== gallery) return;
          const message = document.createElement("div"); message.className = "media-error"; message.setAttribute("role", "status");
          message.innerHTML = `<strong>Não foi possível carregar este vídeo.</strong><p>Você pode tentar abri-lo diretamente pelo link abaixo.</p><button class="button button-lime" data-retry-media>Tentar novamente</button>`;
          panel.querySelector(".media-error")?.remove(); panel.append(message);
        }, { once: true });
        video.src = item.source.src; panel.append(video);
        video.play().catch(() => { if (video.isConnected) caption.textContent = `${item.title || "Apresentação"} · use o botão de reprodução para iniciar.`; });
      }
    }
    root.addEventListener("click", (event) => {
      if (event.target.closest("[data-media-prev]")) { goTo(gallery.index - 1); return; }
      if (event.target.closest("[data-media-next]")) { goTo(gallery.index + 1); return; }
      const choice = event.target.closest("[data-media-go]");
      if (choice) { goTo(Number(choice.dataset.mediaGo)); return; }
      if (event.target.closest("[data-play-media], [data-retry-media]")) play();
    });
    root.addEventListener("keydown", (event) => {
      // Os controles nativos do vídeo mantêm seus próprios atalhos.
      if ((event.target !== root && !event.target.closest("[data-media-prev], [data-media-next], [data-media-go]")) || event.altKey || event.ctrlKey || event.metaKey || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const index = event.key === "Home" ? 0 : event.key === "End" ? gallery.items.length - 1 : gallery.index + (event.key === "ArrowRight" ? 1 : -1);
      goTo(index);
    });
    renderPanel();
    if (autoPlay) play();
  }
  window.StoreMedia = { resolveSource, videos, images, slides, html, mount, stop, playIcon, thumbnail };
})();
