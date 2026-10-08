(() => {
  "use strict";
  const base = new URL(".", location.href).pathname;
  let connection;
  function open() {
    if (!connection) connection = new Promise((resolve, reject) => {
      const request = indexedDB.open("denardi-resources-admin:" + base, 1);
      request.onupgradeneeded = () => request.result.createObjectStore("workspace");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("O navegador não permitiu salvar o rascunho."));
    });
    return connection;
  }
  async function read() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction("workspace").objectStore("workspace").get("current");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Não foi possível carregar o rascunho."));
    });
  }
  async function write(snapshot) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("workspace", "readwrite");
      transaction.objectStore("workspace").put(snapshot, "current");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Não foi possível salvar. Exporte um backup e confira o espaço do navegador."));
      transaction.onabort = () => reject(new Error("O armazenamento do rascunho foi interrompido."));
    });
  }
  window.AdminStorage = { read, write };
})();
