/* Modelo compartilhado: nenhum JavaScript importado é executado. */
(() => {
  "use strict";
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const textValue = (value, fallback = "") => typeof value === "string" ? value : fallback;
  const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  const slug = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  function safeMedia(value) {
    if (!value) return true;
    try {
      const raw = String(value).trim();
      if (/^(?:\.\/)?assets\/[a-zA-Z0-9/_().-]+$/.test(raw) && !raw.split("/").includes("..")) return true;
      const url = new URL(raw);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch { return false; }
  }
  function normalizeItem(item) {
    const result = {
      id: textValue(item.id), name: textValue(item.name), category: textValue(item.category),
      price: typeof item.price === "number" ? item.price : 0, sold: item.sold === true,
      image: textValue(item.image), imageAlt: textValue(item.imageAlt),
      images: (Array.isArray(item.images) ? item.images : []).map((image) => typeof image === "string" ? { src: image, alt: "", title: "" } : { src: textValue(image.src), alt: textValue(image.alt), title: textValue(image.title) }),
      description: textValue(item.description), longDescription: textValue(item.longDescription),
      features: list(item.features), requirements: list(item.requirements), delivery: textValue(item.delivery),
      tags: list(item.tags), badge: textValue(item.badge), featured: item.featured === true, version: textValue(item.version),
      videoUrl: textValue(item.videoUrl), videoTitle: textValue(item.videoTitle), videoPoster: textValue(item.videoPoster),
      videoCaptions: textValue(item.videoCaptions), extraVideos: [],
    };
    if (Array.isArray(item.includedProducts)) {
      result.includedProducts = [...new Set(list(item.includedProducts))];
      result.license = item.license === "open" ? "open" : "protected";
    }
    return result;
  }
  function normalize(input) {
    const config = input.config || {};
    const home = config.home || {};
    return {
      schemaVersion: 1,
      config: {
        name: textValue(config.name, "Denardi Resources"),
        pageTitle: textValue(config.pageTitle, "Denardi Resources"),
        catalogTitle: textValue(config.catalogTitle, "Produtos"), packagesTitle: textValue(config.packagesTitle, "Pacotes"),
        description: textValue(config.description), demoMode: config.demoMode === true,
        currency: textValue(config.currency, "BRL"), locale: textValue(config.locale, "pt-BR"),
        discordUrl: textValue(config.discordUrl), discordUsername: textValue(config.discordUsername, "denardi"),
        discordId: textValue(config.discordId),
        home: {
          welcome: textValue(home.welcome, "Bem-vindo à"), title: textValue(home.title, "DENARDI RESOURCES"),
          description: textValue(home.description), heroImage: textValue(home.heroImage),
          highlightProductId: textValue(home.highlightProductId), highlightLabel: textValue(home.highlightLabel, "EM DESTAQUE"),
          featuredProductIds: list(home.featuredProductIds),
        },
      },
      categories: (Array.isArray(input.categories) ? input.categories : []).map((category) => ({ id: textValue(category.id), name: textValue(category.name), icon: ["layout", "layers", "car", "map", "grid"].includes(category.icon) ? category.icon : "grid" })),
      products: (Array.isArray(input.products) ? input.products : []).map(normalizeItem),
      packages: (Array.isArray(input.packages) ? input.packages : []).map(normalizeItem),
    };
  }
  function validate(data) {
    const errors = [];
    const unique = (items, label) => {
      const seen = new Set();
      for (const item of items) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) errors.push(label + ": identificador inválido em " + (item.name || "item sem nome") + ".");
        if (seen.has(item.id)) errors.push(label + ": identificador repetido " + item.id + ".");
        if (!item.name.trim()) errors.push(label + ": preencha o nome.");
        seen.add(item.id);
      }
    };
    unique(data.categories, "Categorias"); unique(data.products, "Produtos"); unique(data.packages, "Pacotes");
    const categories = new Set(data.categories.map((item) => item.id));
    const products = new Set(data.products.map((item) => item.id));
    for (const item of [...data.products, ...data.packages]) {
      if (!Number.isFinite(item.price) || item.price < 0) errors.push(item.name + ": informe um preço válido.");
      if (data.products.includes(item) && !categories.has(item.category)) errors.push(item.name + ": escolha uma categoria existente.");
      for (const media of [item.image, item.videoUrl, item.videoPoster, item.videoCaptions, ...item.images.map((image) => image.src)]) {
        if (!safeMedia(media)) errors.push(item.name + ": use uma URL HTTPS ou um caminho dentro de assets.");
      }
      if (item.videoUrl && window.StoreMedia && !window.StoreMedia.resolveSource(item.videoUrl)) errors.push(item.name + ": o link do vídeo não foi reconhecido.");
      if (item.includedProducts?.some((id) => !products.has(id))) errors.push(item.name + ": há um resource incluído que não existe.");
    }
    if (!data.config.name.trim()) errors.push("Informe o nome da loja.");
    try { new Intl.NumberFormat(data.config.locale, { style: "currency", currency: data.config.currency }); }
    catch { errors.push("Confira a moeda e o idioma da loja."); }
    if (!safeMedia(data.config.home.heroImage)) errors.push("O fundo da home precisa ser uma URL HTTPS ou um caminho em assets.");
    try {
      const url = new URL(data.config.discordUrl);
      if (url.protocol !== "https:" || !["discord.com", "www.discord.com"].includes(url.hostname) || url.username || url.password) throw new Error();
    } catch { errors.push("Informe um perfil HTTPS do Discord para as compras."); }
    if (errors.length) throw new Error(errors.slice(0, 6).join("\n"));
    return data;
  }
  function fromGlobals(scope = window) {
    return normalize({ config: scope.STORE_CONFIG, categories: scope.STORE_CATEGORIES, products: scope.STORE_PRODUCTS, packages: scope.STORE_PACKAGES });
  }
  function serialize(input) {
    const data = validate(normalize(input));
    return "/* Catálogo gerado pelo painel Denardi Resources. */\n" +
      [["CONFIG", data.config], ["CATEGORIES", data.categories], ["PRODUCTS", data.products], ["PACKAGES", data.packages]]
        .map(([name, value]) => "window.STORE_" + name + " = " + JSON.stringify(value, null, 2) + ";").join("\n\n") + "\n";
  }
  function parseSource(source) {
    const output = {};
    const keys = { CONFIG: "config", CATEGORIES: "categories", PRODUCTS: "products", PACKAGES: "packages" };
    const pattern = /(?:^|\n)window\.STORE_(CONFIG|CATEGORIES|PRODUCTS|PACKAGES)\s*=\s*([\s\S]*?);\s*(?=\nwindow\.STORE_|$)/g;
    let match;
    while ((match = pattern.exec(source))) output[keys[match[1]]] = JSON.parse(match[2]);
    if (Object.keys(output).length !== 4) throw new Error("Formato do catálogo não reconhecido. Use o arquivo gerado pelo painel.");
    return validate(normalize(output));
  }
  function referencedPaths(data) {
    const paths = [data.config.home.heroImage];
    for (const item of [...data.products, ...data.packages]) paths.push(item.image, item.videoPoster, ...item.images.map((image) => image.src));
    return new Set(paths.filter(Boolean).map((path) => path.replace(/^\.\//, "")));
  }
  function bindGlobals(data, scope = window) {
    scope.STORE_CONFIG = data.config; scope.STORE_CATEGORIES = data.categories;
    scope.STORE_PRODUCTS = data.products; scope.STORE_PACKAGES = data.packages;
  }
  window.AdminModel = { clone, slug, escape, safeMedia, normalize, validate, fromGlobals, serialize, parseSource, referencedPaths, bindGlobals };
})();
