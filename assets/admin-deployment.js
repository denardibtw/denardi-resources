(() => {
  "use strict";
  async function waitForCatalog({ sha, commit, timeoutMs = 120000, pollMs = 5000, isCurrent = () => true }) {
    if (!/^[a-f0-9]{40}$/.test(sha) || !/^[a-f0-9]{40}$/.test(commit)) throw new Error("Versão da publicação inválida.");
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && isCurrent()) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(10000, Math.max(1, deadline - Date.now())));
      try {
        const url = new URL("./index.html", location.href);
        url.searchParams.set("deployment", commit + "-" + Date.now());
        const response = await fetch(url.href, { cache: "no-store", credentials: "omit", signal: controller.signal });
        if (response.ok) {
          const page = new DOMParser().parseFromString(await response.text(), "text/html");
          if (page.querySelector('meta[name="catalog-version"]')?.content === sha) return isCurrent();
        }
      } catch { /* Uma falha temporária não significa que o envio ao GitHub falhou. */ }
      finally { clearTimeout(timer); }
      if (!isCurrent() || Date.now() >= deadline) break;
      await new Promise((resolve) => setTimeout(resolve, Math.min(pollMs, Math.max(1, deadline - Date.now()))));
    }
    return false;
  }
  window.AdminDeployment = { waitForCatalog };
})();
