(() => {
  "use strict";
  window.StoreReady = Promise.resolve();
  if (new URLSearchParams(location.search).get("preview") !== "admin") return;
  function script(path) {
    return new Promise((resolve, reject) => {
      const element = document.createElement("script");
      element.src = path; element.onload = resolve; element.onerror = reject; document.head.append(element);
    });
  }
  window.StoreReady = (async () => {
    try {
      await script("./assets/admin-model.js"); await script("./assets/admin-storage.js");
      const snapshot = await window.AdminStorage.read();
      if (!snapshot?.data) throw new Error("Nenhum rascunho salvo neste navegador.");
      const data = window.AdminModel.validate(window.AdminModel.normalize(snapshot.data));
      const assets = new Map((snapshot.files || []).map(([path, blob]) => [path, URL.createObjectURL(blob)]));
      const media = (path) => assets.get(String(path || "").replace(/^\.\//, "")) || path;
      for (const item of [...data.products, ...data.packages]) {
        item.image = media(item.image); item.videoPoster = media(item.videoPoster);
        item.images = item.images.map((image) => ({ ...image, src: media(image.src) }));
      }
      data.config.home.heroImage = media(data.config.home.heroImage);
      window.AdminModel.bindGlobals(data);
      const note = document.createElement("div"); note.className = "store-preview-notice";
      note.textContent = "Prévia do rascunho · estas alterações ainda não estão publicadas.";
      document.body.append(note);
    } catch (error) {
      const note = document.createElement("div"); note.className = "store-preview-notice";
      note.textContent = "Não foi possível abrir a prévia. Salve o rascunho no painel.";
      document.body.append(note);
    }
  })();
})();
