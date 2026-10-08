(() => {
  "use strict";
  const config = window.STORE_CONFIG;
  const categories = window.STORE_CATEGORIES;
  const products = window.STORE_PRODUCTS;
  const packages = (window.STORE_PACKAGES || []).map((item) => ({ ...item, kind: "package", category: "pacotes" }));
  const $ = (selector) => document.querySelector(selector);
  const grid = $("#product-grid");
  const dialog = $("#product-dialog");
  const infoDialog = $("#info-dialog");
  const state = { category: "all", query: "", sort: "featured", presentation: "all" };
  const packageState = { query: "", license: "all" };
  const homeSettings = config.home || {};
  const homeProduct = products.find((product) => product.id === homeSettings.highlightProductId) || products.find((product) => window.StoreMedia.videos(product).length) || products[0];
  const pageHash = (page) => ({ home: "#inicio", catalog: "#catalogo", packages: "#pacotes" })[page];
  let currentPage = /^(#pacotes|#pacote\/)/.test(location.hash) ? "packages" : /^(#catalogo|#categorias|#resource\/)/.test(location.hash) ? "catalog" : "home";
  let productReturnHash = pageHash(currentPage);
  let activeProduct = null;
  let restoreFocus = null;
  let toastTimeout;
  const money = new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency });
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const normalize = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const categoryName = (id) => categories.find((category) => category.id === id)?.name || id;
  const licenseName = (license) => ({ open: "Código aberto", protected: "Código protegido" })[license] || "Licença a confirmar";
  const findProduct = (id, kind = "resource") => (kind === "package" ? packages : products).find((item) => item.id === id);
  const productLabel = (product) => product.kind === "package" ? "pacote" : "resource";
  function packageComponents(product) {
    return [...new Set(product.includedProducts || [])].map((id) => products.find((item) => item.id === id)).filter(Boolean);
  }
  function packagePricing(product) {
    const total = packageComponents(product).reduce((sum, item) => sum + item.price, 0);
    return { total, savings: Math.max(0, Math.round((total - product.price) * 100) / 100) };
  }
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
  function productLink(product) {
    const url = new URL(location.href);
    url.hash = `${productLabel(product)}/${encodeURIComponent(product.id)}`;
    return url.href;
  }
  document.querySelectorAll("[data-brand]").forEach((element) => { element.textContent = config.name; });
  document.querySelectorAll("a.brand").forEach((element) => element.setAttribute("aria-label", `${config.name}, início`));
  document.title = config.pageTitle;
  $("meta[name='description']").content = config.description;
  $("#year").textContent = new Date().getFullYear();
  $("#catalog-title").textContent = config.catalogTitle || "Scripts";
  $("#packages-title").textContent = config.packagesTitle || "Pacotes";
  document.querySelectorAll("[data-package-demo]").forEach((el) => { el.hidden = !config.demoMode; });
  document.querySelectorAll("[data-icon]").forEach((element) => { element.innerHTML = icon(element.dataset.icon); });
  ["#demo-banner", "#catalog-demo-note", "#demo-faq", "#footer-demo"].forEach((selector) => { $(selector).hidden = !config.demoMode; });
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
    grid.innerHTML = filtered.map(productCard).join("");
  }
  function productCard(product) {
      const hasVideo = window.StoreMedia.videos(product).length > 0;
      const isPackage = product.kind === "package";
      const attr = `${isPackage ? "data-package" : "data-product"}="${escape(product.id)}"`;
      const pricing = isPackage && packagePricing(product);
      return `<article class="product-card${isPackage ? " package-card" : ""}" data-category="${escape(product.category)}">
        ${isPackage ? `<span class="package-deal">${pricing.savings > 0 ? `Pacote · Economize ${money.format(pricing.savings)}` : "Disponível como pacote"}</span>` : ""}
        <button class="product-image-button" ${attr} data-play="${hasVideo}" aria-label="${hasVideo ? "Assistir à apresentação" : "Ver detalhes"} de ${escape(product.name)}">
          ${window.StoreMedia.thumbnail(product)}
          <span class="image-labels">${product.badge ? `<span class="product-badge">${escape(product.badge)}</span>` : ""}${config.demoMode ? '<span class="demo-badge">DEMO</span>' : ""}</span>
          ${hasVideo ? `<span class="product-watch-badge"><span>${window.StoreMedia.playIcon}</span><span>Assistir à apresentação</span></span>` : ""}
        </button>
        <div class="product-body">
          <div class="product-title-row"><h3><button ${attr}>${escape(product.name)}</button></h3><p class="product-price">${money.format(product.price)}</p></div>
          <div class="product-tags">${isPackage ? `<span class="tag-license-${escape(product.license)}">${escape(licenseName(product.license))}</span><span class="tag-package-count">${packageComponents(product).length} resources</span>` : `<span class="tag-${escape(product.category)}">${escape(categoryName(product.category))}</span>`}<span class="tag-mta">MTA:SA</span>${hasVideo ? `<span class="tag-video">${window.StoreMedia.playIcon} Vídeo</span>` : ""}${config.demoMode ? '<span class="tag-demo">Demo</span>' : ""}</div>
          <p class="product-description">${escape(product.description || product.longDescription)}</p>
          <div class="product-bottom"><button class="details-button" ${attr} aria-label="Ver detalhes de ${escape(product.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4Zm3 0V5a4 4 0 0 1 8 0v2M9 12h6"/></svg>Ver ${isPackage ? "pacote" : "produto"}</button></div>
        </div>
      </article>`;
  }
  function renderPackages() {
    const query = normalize(packageState.query.trim());
    const filtered = packages.filter((product) => (packageState.license === "all" || product.license === packageState.license)
      && normalize([product.name, product.description, licenseName(product.license), ...packageComponents(product).map((item) => item.name)].join(" ")).includes(query));
    $("#package-results").textContent = `${filtered.length} ${filtered.length === 1 ? "pacote" : "pacotes"} na coleção`;
    $("#package-empty-state").hidden = filtered.length > 0;
    $("#package-grid").hidden = !filtered.length;
    $("#package-grid").innerHTML = filtered.map(productCard).join("");
  }
  function renderHomeMedia() {
    const root = $("#home-feature-media");
    if (!homeProduct) return;
    const item = window.StoreMedia.videos(homeProduct)[0];
    const poster = homeProduct.image ? `<img class="home-feature-poster" src="${escape(homeProduct.image)}" alt="">` : "";
    const content = `${poster}<span class="home-feature-play-icon">${window.StoreMedia.playIcon}</span><strong>${item ? "Assistir à apresentação" : "Ver o resource"}</strong><small>${config.demoMode ? "Apresentação demonstrativa" : escape(homeProduct.name)}</small>`;
    root.innerHTML = item?.source.type === "external"
      ? `<a class="home-feature-play" href="${escape(item.source.original)}" target="_blank" rel="noopener noreferrer">${content}</a>`
      : `<button class="home-feature-play" ${item ? 'data-home-play' : `data-product="${escape(homeProduct.id)}"`} aria-label="${item ? "Reproduzir apresentação" : "Ver detalhes"} de ${escape(homeProduct.name)}">${content}</button>`;
  }
  function stopHomeVideo() {
    const root = $("#home-feature-media");
    root.querySelectorAll("video").forEach((video) => { video.pause(); video.removeAttribute("src"); video.load(); });
    root.querySelectorAll("iframe").forEach((iframe) => iframe.remove());
    renderHomeMedia();
  }
  function playHomeVideo() {
    const item = homeProduct && window.StoreMedia.videos(homeProduct)[0];
    if (!item || item.source.type === "external") return;
    const root = $("#home-feature-media");
    root.replaceChildren();
    if (item.source.type === "embed") {
      const iframe = document.createElement("iframe");
      const url = new URL(item.source.src); url.searchParams.set("autoplay", "1");
      iframe.src = url.href; iframe.title = `Apresentação de ${homeProduct.name}`;
      iframe.className = "home-feature-player"; iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
      iframe.allowFullscreen = true; iframe.referrerPolicy = "strict-origin-when-cross-origin";
      root.append(iframe);
    } else {
      const video = document.createElement("video");
      video.className = "home-feature-player"; video.controls = true; video.playsInline = true;
      video.preload = "metadata"; video.src = item.source.src;
      video.setAttribute("aria-label", `Apresentação de ${homeProduct.name}`);
      if (item.poster) video.poster = item.poster;
      if (item.captions) { const track = document.createElement("track"); track.kind = "captions"; track.src = item.captions; track.srclang = "pt-BR"; track.label = "Português"; track.default = true; video.append(track); }
      video.addEventListener("error", () => { if (video.isConnected) root.innerHTML = `<p class="home-feature-error">Não foi possível carregar o vídeo.<br><a href="${escape(item.source.original)}" target="_blank" rel="noopener noreferrer">Abrir vídeo diretamente</a></p>`; }, { once: true });
      root.append(video); video.play().catch(() => {});
    }
  }
  function renderHome() {
    $("#home-welcome").textContent = homeSettings.welcome || "Bem-vindo à";
    $("#home-title").textContent = homeSettings.title || config.name;
    $("#home-description").textContent = homeSettings.description || config.description;
    if (homeSettings.heroImage) $("#home-hero-image").src = homeSettings.heroImage;
    const url = safeExternal(config.discordUrl, ["discord.com", "www.discord.com"]);
    const username = escape(config.discordUsername || "Discord");
    $("#home-discord").innerHTML = `${icon("discord")}<div>${url ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir perfil de ${username} no Discord">${username} ↗</a>` : `<strong>${username}</strong>`}${config.discordId ? `<small>id: ${escape(config.discordId)}</small>` : ""}</div>`;
    const benefitIcons = {
      cart: '<path d="M2 3h4l5 20h15l4-15H8v4h17l-2 7H14L10 3Z"/><circle cx="14" cy="28" r="3"/><circle cx="25" cy="28" r="3"/>',
      settings: '<path fill-rule="evenodd" d="m13 1-1 5-4 2-4-2-3 5 4 3v4l-4 3 3 5 4-2 4 2 1 5h6l1-5 4-2 4 2 3-5-4-3v-4l4-3-3-5-4 2-4-2-1-5Zm3 9a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"/>',
      support: '<path d="M16 1A14 14 0 0 0 2 15v8a5 5 0 0 0 5 5h3V15H6a10 10 0 0 1 20 0h-4v13h4v1H15v3h11a4 4 0 0 0 4-4V15A14 14 0 0 0 16 1Z"/>',
      delivery: '<path d="M1 4h19v18H1Zm20 6h6l4 7v5H21Z"/><circle cx="8" cy="25" r="5"/><circle cx="25" cy="25" r="5"/>',
    };
    document.querySelectorAll("[data-home-icon]").forEach((el) => { el.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${benefitIcons[el.dataset.homeIcon]}</svg>`; });
    $("#home-categories").innerHTML = categories.map((category) => `<a href="#catalogo" data-home-category="${escape(category.id)}" aria-label="Ver resources de ${escape(category.name)}" title="${escape(category.name)}">${icon(category.icon)}</a>`).join("");
    if (homeProduct) {
      $("#home-highlight-title").textContent = homeProduct.name;
      $("#home-highlight-description").textContent = homeProduct.description;
      $("#home-highlight-badge").textContent = config.demoMode ? "DESTAQUE DEMONSTRATIVO" : homeSettings.highlightLabel || "EM DESTAQUE";
      $("#home-highlight-product").dataset.product = homeProduct.id;
      renderHomeMedia();
    } else $("#home-highlight").hidden = true;
    const ids = Array.isArray(homeSettings.featuredProductIds) ? homeSettings.featuredProductIds : products.filter((product) => product.featured).slice(0, 3).map((product) => product.id);
    const featured = ids.map((id) => products.find((product) => product.id === id)).filter(Boolean);
    $("#home-featured-products").innerHTML = featured.map(productCard).join("");
    $(".home-featured").hidden = !featured.length;
    document.querySelectorAll("[data-home-demo]").forEach((el) => { el.hidden = !config.demoMode; });
  }
  function showPage(page) {
    if (page !== currentPage) stopHomeVideo();
    currentPage = page;
    $("#home-page").hidden = page !== "home";
    $("#catalogo").hidden = page !== "catalog";
    $("#pacotes").hidden = page !== "packages";
    document.body.classList.toggle("home-view", page === "home");
    $("#main-nav").querySelectorAll("a").forEach((link) => { const active = link.getAttribute("href") === pageHash(page); link.classList.toggle("active", active); if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current"); });
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
  $("#package-search").addEventListener("input", (event) => { packageState.query = event.target.value; renderPackages(); });
  $("#package-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-package-license]");
    if (!button) return;
    packageState.license = button.dataset.packageLicense;
    $("#package-filters").querySelectorAll("button").forEach((tab) => { const active = tab === button; tab.classList.toggle("active", active); tab.setAttribute("aria-pressed", String(active)); });
    renderPackages();
  });
  $("#reset-package-filters").addEventListener("click", () => {
    packageState.query = ""; $("#package-search").value = "";
    $("#package-filters [data-package-license='all']").click(); $("#package-search").focus();
  });
  function resetCatalogFilters() {
    state.query = ""; state.sort = "featured"; $("#search").value = ""; $("#sort").value = "featured";
    $("#presentation-filters [data-presentation='all']").click(); $("#category-filters [data-category='all']").click();
  }
  $("#reset-filters").addEventListener("click", () => { resetCatalogFilters(); $("#search").focus(); });
  function showProduct(id, trigger, autoPlay = false, kind = "resource") {
    const product = findProduct(id, kind);
    if (!product) return;
    stopHomeVideo();
    window.StoreMedia.stop();
    activeProduct = product;
    if (trigger && !dialog.open) restoreFocus = trigger;
    const isPackage = product.kind === "package";
    const components = isPackage ? packageComponents(product) : [];
    const pricing = isPackage && packagePricing(product);
    const label = productLabel(product);
    const list = (items) => (items || []).map((item) => `<li>${escape(item)}</li>`).join("");
    $("#product-detail").innerHTML = `<p class="detail-breadcrumb"><span>${isPackage ? "Pacotes" : "Scripts"}</span><span aria-hidden="true">›</span><span>${escape(product.name)}</span></p>
      <div class="detail-top">
        ${window.StoreMedia.html({ ...product, categoryLabel: isPackage ? "Pacotes" : categoryName(product.category) })}
        <aside class="detail-summary">
          <div class="detail-tags"><span>${escape(isPackage ? licenseName(product.license) : categoryName(product.category))}</span><span>MTA:SA</span>${config.demoMode ? '<span>Demo</span>' : ""}</div>
          <h2 id="detail-title">${escape(product.name)}</h2>
          <div class="detail-price-row"><span class="detail-price">${money.format(product.price)}</span><small>${config.demoMode ? "Valor demonstrativo · confirme as condições" : "Confirme as condições de compra"}</small></div>
          ${isPackage && pricing.savings > 0 ? `<p class="package-savings"><s>${money.format(pricing.total)} em resources avulsos</s><br>Economize ${money.format(pricing.savings)}${config.demoMode ? " · exemplo" : ""}</p>` : ""}
          ${discordContact()}
          <div class="detail-contact-note"><h3>Vamos conversar?</h3><p>Confirme compatibilidade, licença, entrega e suporte diretamente com o criador.</p></div>
          <div class="detail-share"><button id="share-product">Copiar link do ${label} ↗</button><small>${escape(product.version || "")}</small></div>
        </aside>
      </div>
      <section class="detail-description"><h3>Conheça o ${label}</h3><p class="detail-long-description">${escape(product.longDescription || product.description)}</p>
        ${isPackage ? `<section class="package-includes"><h3>Resources incluídos</h3><p>${config.demoMode ? "Composição demonstrativa. " : ""}Confira cada componente e confirme a compatibilidade do conjunto com denardi.</p><ul>${components.map((item) => `<li><button data-product="${escape(item.id)}" aria-label="Ver resource ${escape(item.name)}"><strong>${escape(item.name)}</strong><span aria-hidden="true">↗</span></button></li>`).join("")}</ul></section>` : ""}
        <div class="detail-info-grid"><div><h3>${config.demoMode ? "Funcionalidades de exemplo" : "Funcionalidades"}</h3><ul>${list(product.features)}</ul></div><div><h3>Requisitos e compatibilidade</h3><ul>${list(product.requirements)}</ul></div><div><h3>Sobre a entrega</h3><p class="detail-delivery">${escape(product.delivery)}</p></div></div>
      </section>`;
    if (!dialog.open) { dialog.showModal(); document.body.classList.add("modal-open"); }
    dialog.scrollTop = 0;
    window.StoreMedia.mount($("[data-media-gallery]"), product, autoPlay);
  }
  function syncHash(trigger = null) {
    if (/^#(resource|pacote)\//.test(location.hash)) {
      let id;
      const kind = location.hash.startsWith("#pacote/") ? "package" : "resource";
      try { id = decodeURIComponent(location.hash.split("/").slice(1).join("/")); } catch { return; }
      if (findProduct(id, kind)) showProduct(id, trigger, false, kind);
      else { if (dialog.open) dialog.close(); toast("Este produto não está mais no catálogo."); }
    } else {
      if (dialog.open) dialog.close();
      if (["#catalogo", "#categorias"].includes(location.hash)) showPage("catalog");
      else if (location.hash === "#pacotes") { showPage("packages"); window.scrollTo({ top: 0, behavior: "instant" }); }
      else if (["", "#inicio"].includes(location.hash)) showPage("home");
    }
  }
  function openFromClick(id, trigger, autoPlay = false, kind = "resource") {
    const product = findProduct(id, kind);
    if (!product) return;
    if (!dialog.open) productReturnHash = /^#(resource|pacote)\//.test(location.hash) ? pageHash(currentPage) : location.hash || "#inicio";
    const hash = `#${productLabel(product)}/${encodeURIComponent(id)}`;
    if (location.hash !== hash) history.pushState({ product: id }, "", hash);
    showProduct(id, trigger, autoPlay, kind);
  }
  function closeProduct() {
    window.StoreMedia.stop();
    if (/^#(resource|pacote)\//.test(location.hash)) history.replaceState(null, "", `${location.pathname}${location.search}${productReturnHash}`);
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
    const value = productLink(activeProduct);
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement("textarea"); input.value = value; input.setAttribute("aria-label", "Link do resource");
        input.style.cssText = "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
        dialog.append(input); input.select();
        const copied = document.execCommand("copy"); input.remove(); if (!copied) throw new Error("copy unavailable");
      }
      toast(`Link do ${productLabel(activeProduct)} copiado!`);
    } catch { toast("Não foi possível copiar. Copie o endereço da barra do navegador."); }
  }
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-home-catalog]")) { resetCatalogFilters(); showPage("catalog"); return; }
    if (event.target.closest("[data-home-play]")) { playHomeVideo(); return; }
    const homeCategory = event.target.closest("[data-home-category]");
    if (homeCategory) {
      state.query = ""; $("#search").value = "";
      $("#presentation-filters [data-presentation='all']").click();
      $("#category-filters").querySelectorAll("button").forEach((button) => { if (button.dataset.category === homeCategory.dataset.homeCategory) button.click(); });
      showPage("catalog"); return;
    }
    const informationLink = event.target.closest("[data-info]");
    if (informationLink) {
      stopHomeVideo();
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
    const packageButton = event.target.closest("[data-package]");
    if (packageButton) { openFromClick(packageButton.dataset.package, packageButton, packageButton.dataset.play === "true", "package"); return; }
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
        if (/^#(resource|pacote)\//.test(location.hash)) history.replaceState(null, "", `${location.pathname}${location.search}${productReturnHash}`);
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
  render(); renderPackages(); renderHome(); showPage(currentPage); syncHash();
})();
