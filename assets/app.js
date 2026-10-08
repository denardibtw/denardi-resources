(() => {
  "use strict";
  const config = window.STORE_CONFIG;
  const categories = window.STORE_CATEGORIES;
  const products = window.STORE_PRODUCTS;
  const $ = (selector) => document.querySelector(selector);
  const grid = $("#product-grid");
  const dialog = $("#product-dialog");
  const infoDialog = $("#info-dialog");
  const state = { category: "all", query: "", sort: "featured", presentation: "all" };
  let activeProduct = null;
  let restoreFocus = null;
  let toastTimeout;
  const money = new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency });
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const normalize = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const categoryName = (id) => categories.find((category) => category.id === id)?.name || id;
  const iconPaths = {
    grid: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',
    car: '<path d="m5 7 2-4h10l2 4 2 3v8H3v-8Zm-2 3h18M6 14h2m8 0h2M5 18v3m14-3v3"/>',
    map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
    discord: '<path d="M8 5 5 6 2 17l5 2 1-2m8-12 3 1 3 11-5 2-1-2M8 6c2-1 6-1 8 0M7 16c3 2 7 2 10 0"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.grid}</svg>`;

  // Só links https conhecidos são aceitos nos canais externos.
  function safeExternal(value, hosts) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password) return "";
      if (hosts && !hosts.includes(url.hostname)) return "";
      return url.href;
    } catch { return ""; }
  }
  function discordContact() {
    const url = safeExternal(config.discordUrl, ["discord.com", "www.discord.com"]);
    const username = escape(config.discordUsername || "Discord");
    const profile = url
      ? `<a class="discord-profile" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir perfil de ${username} no Discord">${username}<span aria-hidden="true"> ↗</span></a>`
      : `<strong class="discord-profile">${username}</strong>`;
    return `<div class="discord-contact"><div class="discord-contact-heading">${icon("discord")}<span>Discord</span></div>${profile}${config.discordId ? `<p class="discord-contact-id">id: ${escape(config.discordId)}</p>` : ""}</div>`;
  }
  function productLink(id) {
    const url = new URL(location.href);
    url.hash = `resource/${encodeURIComponent(id)}`;
    return url.href;
  }
  document.querySelectorAll("[data-brand]").forEach((element) => { element.textContent = config.name; });
  document.querySelectorAll("a.brand").forEach((element) => element.setAttribute("aria-label", `${config.name}, início`));
  document.title = config.pageTitle;
  $("meta[name='description']").content = config.description;
  $("#year").textContent = new Date().getFullYear();
  $("#catalog-title").textContent = config.catalogTitle || "Scripts";
  document.querySelectorAll("[data-icon]").forEach((element) => { element.innerHTML = icon(element.dataset.icon); });
  if (!config.demoMode) ["#demo-banner", "#catalog-demo-note", "#demo-faq", "#footer-demo"].forEach((selector) => { $(selector).hidden = true; });
  $("#store-discord-contact").innerHTML = discordContact();
  $("#category-filters").innerHTML = [{ id: "all", name: "Todos", icon: "grid" }, ...categories].map((category) =>
    `<button class="category-tab${category.id === "all" ? " active" : ""}" data-category="${escape(category.id)}" aria-pressed="${category.id === "all"}">${icon(category.icon)}${escape(category.name)}</button>`
  ).join("");
  function render() {
    const query = normalize(state.query.trim());
    const filtered = products.filter((product) => (state.category === "all" || product.category === state.category)
      && (state.presentation === "all" || (window.StoreMedia.videos(product).length > 0) === (state.presentation === "video"))
      && normalize([product.name, product.description, categoryName(product.category), ...(product.tags || [])].join(" ")).includes(query));
    if (state.sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (state.sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (state.sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name, config.locale));
    else filtered.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    $("#results-count").textContent = `${filtered.length} ${filtered.length === 1 ? "resource" : "resources"}${state.category !== "all" ? ` em ${categoryName(state.category)}` : " na coleção"}`;
    $("#empty-state").hidden = filtered.length > 0;
    grid.hidden = filtered.length === 0;
    grid.innerHTML = filtered.map((product) => {
      const hasVideo = window.StoreMedia.videos(product).length > 0;
      return `<article class="product-card" data-category="${escape(product.category)}">
        <button class="product-image-button" data-product="${escape(product.id)}" data-play="${hasVideo}" aria-label="${hasVideo ? "Assistir à apresentação" : "Ver detalhes"} de ${escape(product.name)}">
          ${window.StoreMedia.thumbnail(product)}
          <span class="image-labels">${product.badge ? `<span class="product-badge">${escape(product.badge)}</span>` : ""}${config.demoMode ? '<span class="demo-badge">DEMO</span>' : ""}</span>
          ${hasVideo ? `<span class="product-watch-badge"><span>${window.StoreMedia.playIcon}</span><span>Assistir à apresentação</span></span>` : ""}
        </button>
        <div class="product-body">
          <div class="product-title-row"><h3><button data-product="${escape(product.id)}">${escape(product.name)}</button></h3><p class="product-price">${money.format(product.price)}</p></div>
          <div class="product-tags"><span class="tag-${escape(product.category)}">${escape(categoryName(product.category))}</span><span class="tag-mta">MTA:SA</span>${hasVideo ? `<span class="tag-video">${window.StoreMedia.playIcon} Vídeo</span>` : ""}${config.demoMode ? '<span class="tag-demo">Demo</span>' : ""}</div>
          <p class="product-description">${escape(product.longDescription || product.description)}</p>
          <div class="product-bottom"><button class="details-button" data-product="${escape(product.id)}" aria-label="Ver detalhes de ${escape(product.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4Zm3 0V5a4 4 0 0 1 8 0v2M9 12h6"/></svg>Ver produto</button></div>
        </div>
      </article>`;
    }).join("");
  }
  $("#category-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    $("#category-filters").querySelectorAll("button").forEach((tab) => { const active = tab === button; tab.classList.toggle("active", active); tab.setAttribute("aria-pressed", String(active)); });
    render();
  });
  $("#presentation-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-presentation]");
    if (!button) return;
    state.presentation = button.dataset.presentation;
    $("#presentation-filters").querySelectorAll("button").forEach((tab) => { const active = tab === button; tab.classList.toggle("active", active); tab.setAttribute("aria-pressed", String(active)); });
    render();
  });
  $("#menu-toggle").addEventListener("click", () => {
    const open = $("#main-nav").classList.toggle("is-open");
    $("#menu-toggle").setAttribute("aria-expanded", String(open));
    $("#menu-toggle").setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  $("#main-nav").addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    $("#main-nav").classList.remove("is-open"); $("#menu-toggle").setAttribute("aria-expanded", "false"); $("#menu-toggle").setAttribute("aria-label", "Abrir menu");
  });
  $("#search").addEventListener("input", (event) => { state.query = event.target.value; render(); });
  $("#sort").addEventListener("change", (event) => { state.sort = event.target.value; render(); });
  $("#reset-filters").addEventListener("click", () => {
    state.query = ""; state.sort = "featured"; $("#search").value = ""; $("#sort").value = "featured";
    $("[data-presentation='all']").click(); $("[data-category='all']").click(); $("#search").focus();
  });
  function showProduct(id, trigger, autoPlay = false) {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    window.StoreMedia.stop();
    activeProduct = product;
    if (trigger) restoreFocus = trigger;
    const list = (items) => (items || []).map((item) => `<li>${escape(item)}</li>`).join("");
    $("#product-detail").innerHTML = `<p class="detail-breadcrumb"><span>Scripts</span><span aria-hidden="true">›</span><span>${escape(product.name)}</span></p>
      <div class="detail-top">
        ${window.StoreMedia.html({ ...product, categoryLabel: categoryName(product.category) })}
        <aside class="detail-summary">
          <div class="detail-tags"><span>${escape(categoryName(product.category))}</span><span>MTA:SA</span>${config.demoMode ? '<span>Demo</span>' : ""}</div>
          <h2 id="detail-title">${escape(product.name)}</h2>
          <div class="detail-price-row"><span class="detail-price">${money.format(product.price)}</span><small>${config.demoMode ? "Valor demonstrativo · confirme as condições" : "Confirme as condições de compra"}</small></div>
          ${discordContact()}
          <div class="detail-contact-note"><h3>Vamos conversar?</h3><p>Confirme compatibilidade, licença, entrega e suporte diretamente com o criador.</p></div>
          <div class="detail-share"><button id="share-product">Copiar link do resource ↗</button><small>${escape(product.version || "")}</small></div>
        </aside>
      </div>
      <section class="detail-description"><h3>Conheça o resource</h3><p class="detail-long-description">${escape(product.longDescription || product.description)}</p>
        <div class="detail-info-grid"><div><h3>${config.demoMode ? "Funcionalidades de exemplo" : "Funcionalidades"}</h3><ul>${list(product.features)}</ul></div><div><h3>Requisitos e compatibilidade</h3><ul>${list(product.requirements)}</ul></div><div><h3>Sobre a entrega</h3><p class="detail-delivery">${escape(product.delivery)}</p></div></div>
      </section>`;
    if (!dialog.open) { dialog.showModal(); document.body.classList.add("modal-open"); }
    dialog.scrollTop = 0;
    window.StoreMedia.mount($("[data-media-gallery]"), product, autoPlay);
  }
  function syncHash(trigger = null) {
    if (location.hash.startsWith("#resource/")) {
      let id;
      try { id = decodeURIComponent(location.hash.slice(10)); } catch { return; }
      if (products.some((product) => product.id === id)) showProduct(id, trigger);
      else { if (dialog.open) dialog.close(); toast("Este resource não está mais no catálogo."); }
    } else if (dialog.open) dialog.close();
  }
  function openFromClick(id, trigger, autoPlay = false) {
    if (!products.some((product) => product.id === id)) return;
    const hash = `#resource/${encodeURIComponent(id)}`;
    if (location.hash !== hash) history.pushState({ product: id }, "", hash);
    showProduct(id, trigger, autoPlay);
  }
  function closeProduct() {
    window.StoreMedia.stop();
    if (location.hash.startsWith("#resource/")) history.replaceState(null, "", `${location.pathname}${location.search}#catalogo`);
    if (dialog.open) dialog.close();
  }
  function toast(message) {
    const element = $("#toast");
    const visibleDialog = [dialog, infoDialog].find((item) => item.open);
    (visibleDialog || document.body).append(element);
    clearTimeout(toastTimeout); element.textContent = message; element.classList.add("visible");
    toastTimeout = setTimeout(() => element.classList.remove("visible"), 4200);
  }
  async function copyProduct() {
    if (!activeProduct) return;
    const value = productLink(activeProduct.id);
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement("textarea"); input.value = value; input.setAttribute("aria-label", "Link do resource");
        input.style.cssText = "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
        dialog.append(input); input.select();
        const copied = document.execCommand("copy"); input.remove(); if (!copied) throw new Error("copy unavailable");
      }
      toast("Link do resource copiado!");
    } catch { toast("Não foi possível copiar. Copie o endereço da barra do navegador."); }
  }
  document.addEventListener("click", (event) => {
    const informationLink = event.target.closest("[data-info]");
    if (informationLink) {
      event.preventDefault();
      const section = informationLink.dataset.info;
      $("#info-title").textContent = {compra:"Como comprar", duvidas:"Dúvidas frequentes", sobre:"Sobre a loja"}[section] || "Informações";
      infoDialog.querySelectorAll("[data-info-panel]").forEach((panel) => { panel.hidden = panel.dataset.infoPanel !== section; });
      infoDialog.showModal(); document.body.classList.add("modal-open");
      return;
    }
    if (event.target.closest("[data-show-videos]")) {
      $("#search").value = ""; state.query = ""; $("[data-category='all']").click(); $("[data-presentation='video']").click();
      return;
    }
    const productButton = event.target.closest("[data-product]");
    if (productButton) { openFromClick(productButton.dataset.product, productButton, productButton.dataset.play === "true"); return; }
    if (event.target.closest("#share-product")) { copyProduct(); return; }
    const closeButton = event.target.closest("[data-close]");
    if (closeButton) { const parentDialog = closeButton.closest("dialog"); if (parentDialog === dialog) closeProduct(); else parentDialog.close(); }
  });
  [dialog, infoDialog].forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target !== element) return;
      const bounds = element.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        if (element === dialog) closeProduct(); else element.close();
      }
    });
    element.addEventListener("close", () => {
      if (!dialog.open && !infoDialog.open) document.body.classList.remove("modal-open");
      if (element === dialog) {
        window.StoreMedia.stop();
        if (location.hash.startsWith("#resource/")) history.replaceState(null, "", `${location.pathname}${location.search}#catalogo`);
        if (restoreFocus?.isConnected) restoreFocus.focus({ preventScroll: true });
        restoreFocus = null; activeProduct = null;
      }
    });
    element.addEventListener("cancel", (event) => { if (element === dialog) { event.preventDefault(); closeProduct(); } });
  });
  window.addEventListener("hashchange", () => syncHash());
  window.addEventListener("popstate", () => syncHash());
  // Uma thumbnail ausente ou inválida mantém o espaço reservado, sem gerar capa.
  document.addEventListener("error", (event) => {
    const img = event.target;
    if (img.tagName !== "IMG" || (!img.closest(".product-image-button") && !img.matches(".media-image,.media-poster"))) return;
    const placeholder = document.createElement("span");
    placeholder.className = img.closest(".product-image-button") ? "thumbnail-placeholder" : img.matches(".media-poster") ? "media-poster-placeholder" : "media-no-image";
    placeholder.textContent = "Thumbnail indisponível";
    img.replaceWith(placeholder);
  }, true);
  render(); syncHash();
})();
