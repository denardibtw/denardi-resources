/* O token é recebido pela sessão. Não é salvo nem incluído nos arquivos. */
(() => {
  "use strict";
  const repo = "denardibtw/denardi-resources";
  const branch = "main";
  const prefix = "/repos/" + repo;
  async function request(path, options = {}, token = "", account = false) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10" };
      if (token) headers.Authorization = "Bearer " + token;
      if (options.body) headers["Content-Type"] = "application/json";
      const response = await fetch("https://api.github.com" + (account ? "" : prefix) + path, {
        method: options.method || "GET", headers, cache: "no-store",
        body: options.body ? JSON.stringify(options.body) : undefined, signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const explanations = {
          401: "O token não foi aceito pelo GitHub.",
          403: "Confira o acesso ao repositório e a permissão Contents: Read and write. O GitHub também pode ter limitado as requisições.",
          404: "O repositório ou arquivo não foi encontrado. Confira o acesso do token.",
          409: "O catálogo mudou no GitHub. Carregue a versão publicada antes de tentar novamente.",
          422: "O GitHub recusou a atualização. A branch pode ter mudado ou exigir revisão.",
          429: "O GitHub limitou as requisições. Aguarde um pouco e tente novamente.",
        };
        const error = new Error(explanations[response.status] || "Não foi possível concluir a operação no GitHub.");
        error.status = response.status; throw error;
      }
      return data;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("A conexão demorou demais. Confira a publicação no GitHub antes de tentar novamente.");
      throw error;
    } finally { clearTimeout(timer); }
  }
  function decode(value) {
    const raw = atob(value.replace(/\s/g, ""));
    return new TextDecoder().decode(Uint8Array.from(raw, (char) => char.charCodeAt(0)));
  }
  async function catalogFile(token = "") {
    const file = await request("/contents/assets/data.js?ref=" + branch, {}, token);
    if (file.encoding !== "base64" || !file.content || !file.sha) throw new Error("O arquivo do catálogo não pôde ser lido.");
    return file;
  }
  async function published(token = "") {
    const file = await catalogFile(token);
    return { sha: file.sha, data: window.AdminModel.parseSource(decode(file.content)) };
  }
  async function authenticate(token) {
    if (!token?.trim()) throw new Error("Informe seu token do GitHub para entrar.");
    const identity = await request("/user", {}, token, true);
    if (identity.login?.toLowerCase() !== repo.split("/")[0]) throw new Error("Este painel está disponível somente para a conta denardibtw.");
    const access = await request("", {}, token);
    if (access.full_name !== repo || access.permissions?.push !== true) throw new Error("O token não tem acesso de escrita ao repositório da loja.");
    const file = await catalogFile(token);
    const data = window.AdminModel.parseSource(decode(file.content));
    // Reenvia o blob que já existe, com bytes idênticos. Confirma Contents: write
    // sem criar commit, alterar arquivos ou iniciar uma publicação.
    const probe = await request("/git/blobs", { method: "POST", body: { content: file.content.replace(/\s/g, ""), encoding: "base64" } }, token);
    if (probe.sha !== file.sha) throw new Error("Não foi possível confirmar a permissão de publicação.");
    return { login: identity.login, repo, catalog: { data, sha: file.sha } };
  }
  async function base64(blob) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    return btoa(binary);
  }
  async function publish({ data, files, baseSha, baseData, token, progress = () => {} }) {
    if (!token?.trim()) throw new Error("Informe seu token do GitHub para publicar.");
    const normalized = window.AdminModel.validate(window.AdminModel.normalize(data));
    progress("Conferindo a versão publicada…");
    const remote = await published(token);
    if (baseSha ? remote.sha !== baseSha : window.AdminModel.serialize(remote.data) !== window.AdminModel.serialize(baseData)) {
      throw new Error("O catálogo foi alterado em outra sessão. Exporte seu rascunho e carregue a versão publicada antes de continuar.");
    }
    const ref = await request("/git/ref/heads/" + branch, {}, token);
    const parent = ref.object.sha;
    const commit = await request("/git/commits/" + parent, {}, token);
    const lockedCatalog = await published(token);
    if (lockedCatalog.sha !== remote.sha) throw new Error("O catálogo mudou durante a conferência. Carregue a versão publicada antes de continuar.");
    const needed = window.AdminModel.referencedPaths(normalized);
    const tree = [];
    for (const [path, blob] of files) {
      if (!needed.has(path)) continue;
      if (!/^assets\/img\/uploads\/[a-zA-Z0-9._-]+$/.test(path)) throw new Error("Há uma imagem fora da pasta de uploads.");
      if (blob.size > 10 * 1024 * 1024) throw new Error("Use imagens de até 10 MB.");
      progress("Enviando imagem " + (tree.length + 1) + "…");
      const created = await request("/git/blobs", { method: "POST", body: { content: await base64(blob), encoding: "base64" } }, token);
      tree.push({ path, mode: "100644", type: "blob", sha: created.sha });
    }
    const catalog = await request("/git/blobs", { method: "POST", body: { content: window.AdminModel.serialize(normalized), encoding: "utf-8" } }, token);
    tree.push({ path: "assets/data.js", mode: "100644", type: "blob", sha: catalog.sha });
    progress("Publicando catálogo e imagens juntos…");
    const createdTree = await request("/git/trees", { method: "POST", body: { base_tree: commit.tree.sha, tree } }, token);
    const createdCommit = await request("/git/commits", { method: "POST", body: { message: "Atualizar catálogo pelo painel Denardi Resources", tree: createdTree.sha, parents: [parent] } }, token);
    try {
      await request("/git/refs/heads/" + branch, { method: "PATCH", body: { sha: createdCommit.sha, force: false } }, token);
    } catch (error) {
      // Uma resposta pode se perder depois de o GitHub concluir a atualização.
      const latest = await request("/git/ref/heads/" + branch, {}, token).catch(() => null);
      if (latest?.object.sha !== createdCommit.sha) throw error;
    }
    return { data: normalized, sha: catalog.sha, commit: createdCommit.sha, url: "https://github.com/" + repo + "/commit/" + createdCommit.sha };
  }
  window.AdminGitHub = { repo, branch, authenticate, published, publish };
})();
