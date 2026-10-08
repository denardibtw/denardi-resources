(() => {
  "use strict";
  let credential = "", identity = null, attempt = 0;
  function logout() { credential = ""; identity = null; attempt++; }
  function requireAccess() {
    if (!credential || !identity) throw new Error("Entre novamente para usar o painel.");
  }
  async function login(token) {
    logout();
    const current = attempt;
    try {
      const result = await window.AdminGitHub.authenticate(token.trim());
      if (current !== attempt) throw new Error("A verificação de acesso foi encerrada.");
      credential = token.trim(); identity = { login: result.login, repo: result.repo };
      return result;
    } finally { token = ""; }
  }
  async function authorized(action) {
    requireAccess();
    try { return await action(credential); }
    catch (error) { if (error.status === 401 || error.status === 403) logout(); throw error; }
  }
  window.AdminSession = {
    login, logout, signedIn: () => Boolean(credential && identity),
    user: () => identity ? { ...identity } : null,
    published: () => authorized((token) => window.AdminGitHub.published(token)),
    publish: (options) => authorized((token) => window.AdminGitHub.publish({ ...options, token })),
  };
})();
