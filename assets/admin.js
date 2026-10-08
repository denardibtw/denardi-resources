(() => {
  "use strict";
  const M = window.AdminModel;
  const session = window.AdminSession;
  const $ = (selector) => document.querySelector(selector);
  const E = M.escape;
  const seed = M.fromGlobals();
  let data = M.clone(seed), baseData = M.clone(seed), baseSha = null;
  let files = new Map(), urls = new Map(), section = "products", selected = 0, dirty = false, busy = false;
  let authPending = false;
  let publicationSequence = 0;
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const titles = { products: "Produtos", packages: "Pacotes", categories: "Categorias", store: "Loja e home" };
  function message(text, type = "") {
    const element = $("#admin-message");
    element.textContent = text; element.className = "admin-message " + type; element.hidden = !text;
  }
  function changed() { dirty = true; $("#draft-state").textContent = "Alterações não salvas"; }
  function media(path) {
    const key = String(path || "").replace(/^\.\//, "");
    if (!files.has(key)) return path;
    if (!urls.has(key)) urls.set(key, URL.createObjectURL(files.get(key)));
    return urls.get(key);
  }
  function field(name, label, value, options = {}) {
    const input = options.textarea
      ? '<textarea name="' + name + '" rows="' + (options.rows || 3) + '">' + E(value || "") + '</textarea>'
      : '<input name="' + name + '" value="' + E(value ?? "") + '" ' + (options.number ? 'inputmode="decimal"' : 'type="text"') + (options.required ? ' required' : '') + '>';
    return '<label class="admin-field' + (options.full ? " full" : "") + '">' + E(label) + input + '</label>';
  }
  function select(name, label, value, choices, full = false) {
    return '<label class="admin-field' + (full ? " full" : "") + '">' + E(label) + '<select name="' + name + '">' + choices.map(([key, title]) => '<option value="' + E(key) + '"' + (key === value ? " selected" : "") + '>' + E(title) + '</option>').join("") + '</select></label>';
  }
  function applyItem() {
    const form = $("#item-form");
    if (!form || !["products", "packages"].includes(section)) return;
    const item = data[section][selected];
    const oldId = item.id, newId = form.elements.id.value.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newId) || data[section].some((other) => other !== item && other.id === newId)) {
      throw new Error("Use um identificador único, com letras minúsculas, números e hífens.");
    }
    const value = (name) => form.elements[name]?.value.trim() || "";
    const lines = (name) => value(name).split(/\n/).map((line) => line.trim()).filter(Boolean);
    for (const key of ["name", "description", "longDescription", "image", "imageAlt", "videoUrl", "videoTitle", "videoPoster", "videoCaptions", "delivery", "version", "badge"]) item[key] = value(key);
    item.id = newId; item.price = Number(value("price").replace(",", "."));
    item.sold = form.elements.sold.checked; item.featured = form.elements.featured.checked;
    item.features = lines("features"); item.requirements = lines("requirements"); item.tags = value("tags").split(",").map((tag) => tag.trim()).filter(Boolean);
    item.extraVideos = [];
    if (section === "products") {
      item.category = value("category");
      if (oldId !== newId) {
        for (const pack of data.packages) pack.includedProducts = pack.includedProducts.map((id) => id === oldId ? newId : id);
        if (data.config.home.highlightProductId === oldId) data.config.home.highlightProductId = newId;
        data.config.home.featuredProductIds = data.config.home.featuredProductIds.map((id) => id === oldId ? newId : id);
      }
    } else {
      item.license = value("license");
      item.includedProducts = Array.from(form.querySelectorAll('[name="included"]:checked'), (checkbox) => checkbox.value);
    }
  }
  function applyCategories() {
    document.querySelectorAll("[data-category-row]").forEach((row) => {
      const category = data.categories[Number(row.dataset.categoryRow)], old = category.id;
      const next = row.querySelector('[name="category-id"]').value.trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(next) || data.categories.some((other) => other !== category && other.id === next)) throw new Error("Cada categoria precisa de um identificador válido e único.");
      category.id = next; category.name = row.querySelector('[name="category-name"]').value.trim(); category.icon = row.querySelector('[name="category-icon"]').value;
      if (old !== next) data.products.forEach((item) => { if (item.category === old) item.category = next; });
    });
  }
  function applyStore() {
    const form = $("#store-form");
    if (!form) return;
    const value = (name) => form.elements[name].value.trim();
    for (const key of ["name", "pageTitle", "catalogTitle", "packagesTitle", "description", "discordUsername", "discordId", "discordUrl"]) data.config[key] = value(key);
    for (const key of ["welcome", "title", "description", "heroImage", "highlightProductId", "highlightLabel"]) data.config.home[key] = value("home-" + key);
    data.config.home.featuredProductIds = Array.from(form.querySelectorAll('[name="home-featured"]:checked'), (checkbox) => checkbox.value);
  }
  function applyActive() {
    if (section === "categories") applyCategories();
    else if (section === "store") applyStore();
    else applyItem();
  }
  async function save() {
    applyActive();
    data = M.validate(M.normalize(data));
    const needed = M.referencedPaths(data);
    files = new Map([...files].filter(([path]) => needed.has(path)));
    await window.AdminStorage.write({ data, baseData, baseSha, files: [...files], savedAt: Date.now() });
    dirty = false; $("#draft-state").textContent = "Rascunho salvo";
    updateTotals();
  }
  function updateTotals() { $("#products-total").textContent = data.products.length; $("#packages-total").textContent = data.packages.length; }
  function itemList(query = "") {
    const normalized = M.slug(query);
    $("#admin-item-list").innerHTML = data[section].map((item, index) => ({ item, index })).filter(({ item }) => !normalized || M.slug(item.name + " " + item.id).includes(normalized)).map(({ item, index }) =>
      '<button class="admin-item' + (index === selected ? " selected" : "") + '" data-select-item="' + index + '">' +
      (item.image ? '<img class="admin-item-thumb" src="' + E(media(item.image)) + '" alt="">' : '<span class="admin-item-thumb" aria-hidden="true">DR</span>') +
      '<span class="admin-item-text"><strong>' + E(item.name || "Novo produto") + '</strong><small>' + currency.format(item.price || 0) + ' · ' + (item.sold ? "Vendido" : "Disponível") + '</small></span><span class="admin-item-status' + (item.sold ? " sold" : "") + '" aria-hidden="true"></span></button>'
    ).join("") || '<p class="admin-help">Nenhum item encontrado.</p>';
  }
  function gallery(item) {
    return '<div class="admin-gallery">' + item.images.map((image, index) =>
      '<div class="admin-gallery-item"><img src="' + E(media(image.src)) + '" alt="' + E(image.alt) + '"><p>' + E(image.title || "Imagem " + (index + 1)) + '</p><div class="admin-gallery-controls"><button type="button" data-gallery-up="' + index + '" aria-label="Mover imagem ' + (index + 1) + ' para cima">↑</button><button type="button" data-gallery-down="' + index + '" aria-label="Mover imagem ' + (index + 1) + ' para baixo">↓</button><button type="button" data-gallery-remove="' + index + '">Remover</button></div></div>'
    ).join("") + '</div>';
  }
  function renderEditor() {
    const item = data[section][selected];
    if (!item) { $("#admin-editor").innerHTML = '<div class="admin-empty">Seu catálogo começa aqui.<br>Use o botão acima para cadastrar um produto.</div>'; return; }
    const isPackage = section === "packages";
    $("#admin-editor").innerHTML =
      '<form id="item-form"><div class="admin-editor-title"><h2>' + E(item.name || (isPackage ? "Novo pacote" : "Novo produto")) + '</h2><span class="admin-eyebrow">' + (item.sold ? "VENDIDO" : "DISPONÍVEL") + '</span></div>' +
      '<div class="admin-checks"><label class="admin-check"><input name="sold" type="checkbox"' + (item.sold ? " checked" : "") + '>Marcar como vendido</label><label class="admin-check"><input name="featured" type="checkbox"' + (item.featured ? " checked" : "") + '>Destacar produto</label></div>' +
      '<div class="admin-fields">' + field("name", "Título do " + (isPackage ? "pacote" : "produto"), item.name, { full: true, required: true }) +
      field("id", "Identificador do link", item.id, { required: true }) + field("price", "Preço (R$)", item.price, { number: true, required: true }) +
      (isPackage ? select("license", "Licença", item.license, [["protected", "Código protegido"], ["open", "Código aberto"]], true) : select("category", "Categoria", item.category, data.categories.map((category) => [category.id, category.name]), true)) +
      field("description", "Descrição curta para a vitrine", item.description, { full: true, textarea: true, rows: 2 }) +
      field("longDescription", "Descrição completa", item.longDescription, { full: true, textarea: true, rows: 5 }) + '</div>' +
      (isPackage ? '<div class="admin-section-divider"></div><h3 class="admin-subheading">Resources incluídos</h3><div class="admin-included">' + data.products.map((product) => '<label class="admin-check"><input type="checkbox" name="included" value="' + E(product.id) + '"' + (item.includedProducts.includes(product.id) ? " checked" : "") + '>' + E(product.name) + '</label>').join("") + '</div>' : "") +
      '<div class="admin-section-divider"></div><h3 class="admin-subheading">Vídeo de apresentação</h3><div class="admin-fields">' +
      field("videoUrl", "Link do vídeo", item.videoUrl, { full: true }) + field("videoTitle", "Título do vídeo", item.videoTitle, { full: true }) +
      '</div><p class="admin-help">Um único vídeo por produto. Use YouTube, Vimeo ou uma URL HTTPS direta de vídeo.</p>' +
      '<div class="admin-section-divider"></div><h3 class="admin-subheading">Thumbnail</h3><div class="admin-fields">' +
      field("image", "Link ou caminho da thumbnail", item.image, { full: true }) + field("imageAlt", "Descrição da imagem", item.imageAlt, { full: true }) + '</div>' +
      '<div class="admin-upload-row"><label class="admin-button" for="thumbnail-file">Enviar sua thumbnail</label><input id="thumbnail-file" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><button class="admin-button" type="button" data-clear-thumbnail>Remover thumbnail</button></div>' +
      (item.image ? '<img class="admin-media-preview" src="' + E(media(item.image)) + '" alt="' + E(item.imageAlt || item.name) + '">' : '<div class="admin-media-preview">Sua imagem aparece aqui</div>') +
      '<p class="admin-help">PNG, JPG, WebP ou GIF, até 10 MB. Sua thumbnail é usada como enviada.</p>' +
      '<div class="admin-section-divider"></div><h3 class="admin-subheading">Galeria de imagens</h3><div class="admin-upload-row"><label class="admin-button" for="gallery-files">Enviar imagens</label><input id="gallery-files" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple></div>' +
      '<div class="admin-inline-add"><input id="gallery-link" aria-label="Link de imagem da galeria" placeholder="Ou cole o link de uma imagem"><button class="admin-button" type="button" data-add-gallery-link>Adicionar</button></div>' +
      '<p class="admin-help">O carrossel mostra primeiro o vídeo, depois a thumbnail e as imagens nesta ordem.</p>' + gallery(item) +
      '<details class="admin-details"><summary>Funcionalidades, requisitos e entrega</summary><div class="admin-fields">' +
      field("features", "Funcionalidades — uma por linha", item.features.join("\n"), { full: true, textarea: true }) +
      field("requirements", "Requisitos — um por linha", item.requirements.join("\n"), { full: true, textarea: true }) +
      field("delivery", "Informações de entrega", item.delivery, { full: true, textarea: true }) +
      field("version", "Versão", item.version) + field("badge", "Etiqueta opcional", item.badge) +
      field("tags", "Palavras-chave, separadas por vírgula", item.tags.join(", "), { full: true }) +
      field("videoPoster", "Capa opcional do vídeo", item.videoPoster, { full: true }) +
      field("videoCaptions", "Caminho das legendas VTT (opcional)", item.videoCaptions, { full: true }) + '</div></details>' +
      '<div class="admin-editor-footer"><button class="admin-button danger" type="button" data-delete-item>Excluir do rascunho</button><button class="admin-button primary" type="submit">Salvar produto</button></div></form>';
  }
  function renderCategories() {
    $("#admin-workspace").innerHTML = '<div class="admin-category-list">' + data.categories.map((category, index) =>
      '<div class="admin-category" data-category-row="' + index + '">' + field("category-id", "Identificador", category.id) + field("category-name", "Nome da categoria", category.name) +
      select("category-icon", "Ícone", category.icon, [["layout", "Interface"], ["layers", "Sistema"], ["car", "Veículo"], ["map", "Mapa"], ["grid", "Grade"]]) +
      '<button class="admin-button danger" data-delete-category="' + index + '">Excluir</button></div>'
    ).join("") + '</div><p class="admin-help">Renomear o identificador atualiza os produtos desta categoria. Uma categoria em uso precisa ser reatribuída antes de excluir.</p>';
  }
  function renderStore() {
    const config = data.config, home = config.home;
    $("#admin-workspace").innerHTML = '<form class="admin-editor admin-store-editor" id="store-form"><h2>Identidade e contato</h2><div class="admin-section-divider"></div><div class="admin-fields">' +
      field("name", "Nome da loja", config.name) + field("pageTitle", "Título da aba", config.pageTitle) +
      field("catalogTitle", "Título do catálogo", config.catalogTitle) + field("packagesTitle", "Título dos pacotes", config.packagesTitle) +
      field("description", "Descrição da loja", config.description, { full: true, textarea: true }) +
      field("discordUsername", "Usuário do Discord", config.discordUsername) + field("discordId", "ID do Discord", config.discordId) +
      field("discordUrl", "Link do perfil do Discord", config.discordUrl, { full: true }) +
      '</div><div class="admin-section-divider"></div><h3 class="admin-subheading">Home</h3><div class="admin-fields">' +
      field("home-welcome", "Texto de boas-vindas", home.welcome) + field("home-title", "Título principal", home.title) +
      field("home-description", "Descrição da home", home.description, { full: true, textarea: true }) +
      field("home-heroImage", "Imagem de fundo da home", home.heroImage, { full: true }) +
      select("home-highlightProductId", "Produto em destaque com vídeo", home.highlightProductId, [["", "Automático"], ...data.products.map((item) => [item.id, item.name])]) +
      field("home-highlightLabel", "Etiqueta do destaque", home.highlightLabel) +
      '</div><div class="admin-section-divider"></div><h3 class="admin-subheading">Produtos mostrados na home</h3><div class="admin-included">' +
      data.products.map((item) => '<label class="admin-check"><input type="checkbox" name="home-featured" value="' + E(item.id) + '"' + (home.featuredProductIds.includes(item.id) ? " checked" : "") + '>' + E(item.name) + '</label>').join("") +
      '</div><div class="admin-editor-footer"><span></span><button class="admin-button primary" type="submit">Salvar loja</button></div></form>';
  }
  function render() {
    updateTotals();
    $("#admin-section-title").textContent = titles[section];
    $("#admin-section-description").textContent = { products: "Organize o catálogo, a apresentação e a disponibilidade.", packages: "Reúna resources, configure a composição e o preço.", categories: "Organize seus produtos por categorias.", store: "Personalize a identidade, o contato e os destaques da home." }[section];
    $("#add-item").hidden = section === "store";
    $("#add-item").textContent = "+ " + { products: "Novo produto", packages: "Novo pacote", categories: "Nova categoria" }[section];
    document.querySelectorAll("[data-admin-section]").forEach((button) => button.classList.toggle("selected", button.dataset.adminSection === section));
    if (section === "categories") return renderCategories();
    if (section === "store") return renderStore();
    selected = Math.max(0, Math.min(selected, data[section].length - 1));
    $("#admin-workspace").innerHTML = '<div class="admin-catalog-layout"><aside class="admin-items"><div class="admin-items-search"><input id="admin-search" type="search" aria-label="Buscar no catálogo do painel" placeholder="Buscar no catálogo…"></div><div class="admin-item-list" id="admin-item-list"></div></aside><section class="admin-editor" id="admin-editor"></section></div>';
    itemList(); renderEditor();
  }
  async function upload(input, galleryUpload) {
    applyActive();
    const item = data[section][selected];
    const types = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
    for (const file of input.files) {
      if (!types[file.type]) throw new Error("Use uma imagem PNG, JPG, WebP ou GIF.");
      if (file.size > 10 * 1024 * 1024) throw new Error("Cada imagem pode ter até 10 MB.");
      const path = "assets/img/uploads/" + Date.now().toString(36) + "-" + crypto.randomUUID().slice(0, 8) + "-" + (M.slug(file.name.replace(/\.[^.]+$/, "")).slice(0, 50) || "imagem") + "." + types[file.type];
      files.set(path, file);
      if (galleryUpload) item.images.push({ src: "./" + path, alt: item.name, title: "Imagem " + (item.images.length + 1) });
      else { item.image = "./" + path; item.imageAlt = item.imageAlt || item.name; }
    }
    changed(); renderEditor(); message("Imagem adicionada ao rascunho. Ela será enviada ao publicar.", "success");
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function backup() {
    await save();
    const entries = [["assets/data.js", M.serialize(data)], ["painel-backup.json", JSON.stringify({ schemaVersion: 1, data, baseData, baseSha }, null, 2)]];
    const needed = M.referencedPaths(data);
    entries.push(...[...files].filter(([path]) => needed.has(path)));
    download(await window.AdminZip.create(entries), "denardi-catalogo-" + new Date().toISOString().slice(0, 10) + ".zip");
    message("Backup exportado. O ZIP contém o catálogo e as imagens adicionadas no painel.", "success");
  }
  async function importBackup(file) {
    if (file.size > 200 * 1024 * 1024) throw new Error("O backup é grande demais.");
    let imported, importedFiles = new Map();
    if (file.name.toLowerCase().endsWith(".zip")) {
      const entries = await window.AdminZip.read(file);
      if (!entries.has("painel-backup.json")) throw new Error("Use um backup exportado pelo painel.");
      imported = JSON.parse(new TextDecoder().decode(entries.get("painel-backup.json")));
      for (const [path, bytes] of entries) {
        if (/^assets\/img\/uploads\/[a-zA-Z0-9._-]+\.(png|jpg|webp|gif)$/.test(path)) {
          const extension = path.split(".").at(-1);
          importedFiles.set(path, new Blob([bytes], { type: { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif" }[extension] }));
        }
      }
    } else imported = JSON.parse(await file.text());
    const next = M.validate(M.normalize(imported.data || imported));
    for (const url of urls.values()) URL.revokeObjectURL(url);
    urls = new Map(); files = importedFiles; data = next;
    baseData = M.normalize(imported.baseData || seed); baseSha = /^[a-f0-9]{40}$/.test(imported.baseSha || "") ? imported.baseSha : null;
    selected = 0; dirty = true; render(); await save();
    message("Backup importado como rascunho. Confira a prévia antes de publicar.", "success");
  }
  function setBusy(value) {
    busy = value;
    document.querySelectorAll(".admin-header button,.admin-sidebar button,#admin-workspace input,#admin-workspace select,#admin-workspace textarea,#admin-workspace button,#publish-submit").forEach((element) => { element.disabled = value; });
  }
  async function guard(action) {
    if (busy || !session.signedIn()) return;
    try { await action(); } catch (error) {
      if (!session.signedIn()) lock(error.message);
      else message(error.message || "Não foi possível concluir esta ação.", "error");
    }
  }
  document.addEventListener("input", (event) => {
    if (!session.signedIn() || busy) return;
    if (event.target.id === "admin-search") itemList(event.target.value);
    else if (event.target.closest("#admin-workspace") && event.target.id !== "gallery-link") changed();
  });
  document.addEventListener("change", (event) => {
    if (!session.signedIn() || busy) return;
    if (event.target.id === "thumbnail-file") guard(() => upload(event.target, false));
    else if (event.target.id === "gallery-files") guard(() => upload(event.target, true));
    else if (event.target.id === "import-backup" && event.target.files[0]) guard(() => importBackup(event.target.files[0]));
    else if (event.target.closest("#admin-workspace")) changed();
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || busy || !session.signedIn()) return;
    guard(async () => {
      if (button.id === "logout") {
        if (dirty && !confirm("Sair sem salvar as alterações? Use Salvar rascunho antes de sair para preservá-las.")) return;
        lock();
      } else if (button.dataset.adminSection) { applyActive(); section = button.dataset.adminSection; selected = 0; message(""); render(); }
      else if (button.dataset.selectItem !== undefined) { applyActive(); selected = Number(button.dataset.selectItem); message(""); itemList($("#admin-search").value); renderEditor(); }
      else if (button.id === "add-item") {
        applyActive();
        if (section === "categories") data.categories.push({ id: "categoria-" + Date.now().toString(36), name: "", icon: "grid" });
        else {
          if (section === "products" && !data.categories.length) data.categories.push({ id: "resources", name: "Resources", icon: "grid" });
          const item = M.normalize({ products: [{ id: "resource-" + Date.now().toString(36), name: "", category: data.categories[0]?.id || "", price: 0 }] }).products[0];
          if (section === "packages") { item.includedProducts = []; item.license = "protected"; }
          data[section].push(item); selected = data[section].length - 1;
        }
        changed(); render();
      } else if (button.id === "save-draft") { await save(); itemListIfPresent(); message("Rascunho salvo neste navegador.", "success"); }
      else if (button.id === "preview-draft") { await save(); $("#draft-frame").src = "./index.html?preview=admin"; $("#preview-dialog").showModal(); }
      else if (button.id === "open-publish") { await save(); publicationSequence++; $("#publish-status").textContent = ""; $("#publication-link").hidden = true; $("#published-store-link").hidden = true; $("#publish-dialog").showModal(); $("#publish-submit").focus(); }
      else if (button.id === "export-backup") await backup();
      else if (button.id === "load-published") {
        if ((dirty || JSON.stringify(M.normalize(data)) !== JSON.stringify(M.normalize(baseData))) && !confirm("Carregar o catálogo publicado no lugar do rascunho? Exporte um backup para preservar suas alterações.")) return;
        const remote = await session.published();
        data = remote.data; baseData = M.clone(remote.data); baseSha = remote.sha; files = new Map(); selected = 0; render(); await save();
        message("Versão publicada carregada.", "success");
      } else if (button.hasAttribute("data-clear-thumbnail")) { applyActive(); data[section][selected].image = ""; changed(); renderEditor(); }
      else if (button.hasAttribute("data-add-gallery-link")) {
        applyActive(); const link = $("#gallery-link").value.trim();
        if (!link || !M.safeMedia(link)) throw new Error("Informe uma URL HTTPS válida de imagem.");
        data[section][selected].images.push({ src: link, alt: data[section][selected].name, title: "Imagem " + (data[section][selected].images.length + 1) }); changed(); renderEditor();
      } else if (button.dataset.galleryRemove !== undefined || button.dataset.galleryUp !== undefined || button.dataset.galleryDown !== undefined) {
        applyActive(); const images = data[section][selected].images;
        if (button.dataset.galleryRemove !== undefined) images.splice(Number(button.dataset.galleryRemove), 1);
        else { const index = Number(button.dataset.galleryUp ?? button.dataset.galleryDown), next = index + (button.dataset.galleryUp !== undefined ? -1 : 1); if (next >= 0 && next < images.length) [images[index], images[next]] = [images[next], images[index]]; }
        changed(); renderEditor();
      } else if (button.hasAttribute("data-delete-item")) {
        if (!confirm("Excluir este item do rascunho? O catálogo público só muda depois de publicar.")) return;
        const id = data[section][selected].id; data[section].splice(selected, 1);
        if (section === "products") { data.packages.forEach((pack) => { pack.includedProducts = pack.includedProducts.filter((value) => value !== id); }); data.config.home.featuredProductIds = data.config.home.featuredProductIds.filter((value) => value !== id); if (data.config.home.highlightProductId === id) data.config.home.highlightProductId = ""; }
        changed(); render();
      } else if (button.dataset.deleteCategory !== undefined) {
        applyCategories(); const index = Number(button.dataset.deleteCategory), category = data.categories[index];
        if (data.products.some((item) => item.category === category.id)) throw new Error("Esta categoria está em uso. Escolha outra categoria nos produtos antes de excluir.");
        if (!confirm("Excluir esta categoria do rascunho?")) return;
        data.categories.splice(index, 1); changed(); render();
      } else if (button.hasAttribute("data-admin-close")) {
        button.closest("dialog").close();
        if (button.closest("#preview-dialog")) $("#draft-frame").src = "about:blank";
      }
    });
  });
  function itemListIfPresent() { if ($("#admin-item-list")) { itemList($("#admin-search").value); renderEditor(); } }
  document.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "login-form") { signIn(); return; }
    if (!session.signedIn()) return;
    if (event.target.id !== "publish-form") return guard(async () => { await save(); itemListIfPresent(); message("Rascunho salvo.", "success"); });
    if (busy) return;
    const publication = ++publicationSequence;
    setBusy(true);
    (async () => {
      try {
        await save();
        const result = await session.publish({ data, files, baseSha, baseData, progress: (text) => { $("#publish-status").textContent = text; } });
        data = result.data; baseData = M.clone(result.data); baseSha = result.sha;
        await window.AdminStorage.write({ data, baseData, baseSha, files: [...files], savedAt: Date.now() });
        dirty = false; $("#draft-state").textContent = "Publicado no GitHub";
        $("#publish-status").textContent = "Catálogo salvo no GitHub. Aguardando a atualização da loja…";
        $("#publication-link").hidden = false;
        render(); message("Catálogo e imagens enviados ao GitHub.", "success");
        watchDeployment(result, publication);
      } catch (error) {
        if (!session.signedIn()) lock(error.message);
        else $("#publish-status").textContent = error.message || "Não foi possível publicar.";
      }
      finally { setBusy(false); }
    })();
  });
  $("#publish-dialog").addEventListener("cancel", (event) => { if (busy) event.preventDefault(); });
  $("#preview-dialog").addEventListener("close", () => { $("#draft-frame").src = "about:blank"; });
  window.addEventListener("beforeunload", (event) => { if (dirty || busy) { event.preventDefault(); event.returnValue = ""; } });
  function loginStatus(text, error = false) {
    $("#login-status").textContent = text || "";
    $("#login-status").hidden = !text;
    $("#login-status").classList.toggle("error", error);
  }
  function lock(reason = "") {
    session.logout();
    publicationSequence++;
    for (const id of ["#publish-dialog", "#preview-dialog"]) if ($(id).open) $(id).close();
    $("#draft-frame").src = "about:blank";
    $("#admin-shell").hidden = true; $("#admin-login").hidden = false;
    $("#admin-workspace").innerHTML = ""; $("#session-user").textContent = "";
    $("#login-token").value = ""; dirty = false;
    for (const url of urls.values()) URL.revokeObjectURL(url);
    files = new Map(); urls = new Map(); data = M.clone(seed); baseData = M.clone(seed); baseSha = null;
    section = "products"; selected = 0; message("");
    loginStatus(reason, Boolean(reason)); $("#login-token").focus();
  }
  async function watchDeployment(result, publication) {
    const isCurrent = () => publication === publicationSequence && session.signedIn();
    try {
      const ready = await window.AdminDeployment.waitForCatalog({ sha: result.sha, commit: result.commit, isCurrent });
      if (!isCurrent()) return;
      if (ready) {
        $("#publish-status").textContent = "Publicação concluída. Sua loja já está atualizada.";
        const url = new URL("./index.html", location.href);
        url.searchParams.set("v", result.commit); url.hash = "catalogo";
        $("#published-store-link").href = url.href; $("#published-store-link").hidden = false;
      } else $("#publish-status").textContent = "Catálogo salvo no GitHub. A publicação está demorando; acompanhe o andamento pelo link abaixo.";
    } catch {
      if (isCurrent()) $("#publish-status").textContent = "Catálogo salvo no GitHub. Confira a conclusão da publicação pelo link abaixo.";
    }
  }
  async function signIn() {
    if (authPending) return;
    let credential = $("#login-token").value.trim();
    $("#login-token").value = "";
    if (!credential) { loginStatus("Informe seu token do GitHub.", true); return; }
    authPending = true; $("#login-submit").disabled = true; $("#login-token").disabled = true;
    $("#login-submit").textContent = "Verificando acesso…"; loginStatus("Conferindo sua conta e a permissão de publicação…");
    try {
      const result = await session.login(credential);
      await initialize(result.catalog);
      $("#session-user").textContent = "@" + result.login;
      $("#admin-login").hidden = true; $("#admin-shell").hidden = false;
      $("#admin-section-title").focus(); loginStatus("");
    } catch (error) { lock(error.message || "Não foi possível verificar o acesso. Confira sua conexão e tente novamente."); }
    finally {
      credential = ""; authPending = false;
      $("#login-submit").disabled = false; $("#login-token").disabled = false;
      $("#login-submit").textContent = "Entrar no painel ↗";
      if (!session.signedIn()) $("#login-token").focus();
    }
  }
  async function initialize(remote) {
    data = M.clone(remote.data); baseData = M.clone(remote.data); baseSha = remote.sha;
    try {
      const snapshot = await window.AdminStorage.read();
      if (snapshot?.data) {
        data = M.validate(M.normalize(snapshot.data)); baseData = M.normalize(snapshot.baseData || seed); baseSha = snapshot.baseSha || null;
        files = new Map(snapshot.files || []); $("#draft-state").textContent = "Rascunho carregado";
      } else {
        $("#draft-state").textContent = "Catálogo carregado";
      }
      render();
    } catch (error) { render(); message(error.message, "error"); $("#draft-state").textContent = "Rascunho em memória"; }
  }
})();
