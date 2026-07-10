(function () {
  const STORAGE_KEY = "lp_auth_token";
  const gateId = "lp-auth-gate";

  function apiBase() {
    const proxy = (window.__LP_CLAUDE_PROXY_URL || "").trim();
    return proxy.replace(/\/api\/claude\/?$/i, "");
  }

  function authUrl() {
    return apiBase() + "/api/auth";
  }

  function getToken() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  }

  function setToken(token) {
    try {
      sessionStorage.setItem(STORAGE_KEY, token);
    } catch {}
    window.__LP_AUTH_TOKEN = token;
  }

  function unlock() {
    const gate = document.getElementById(gateId);
    const root = document.getElementById("root");
    if (gate) gate.remove();
    if (root) root.hidden = false;
    window.__LP_AUTHENTICATED = true;
  }

  function showGate() {
    if (document.getElementById(gateId)) return;

    const root = document.getElementById("root");
    if (root) root.hidden = true;

    const gate = document.createElement("div");
    gate.id = gateId;
    gate.className = "lp-auth-gate";
    gate.innerHTML =
      '<div class="lp-auth-card">' +
      '<h1 class="lp-auth-title">AI Discovery Assistant</h1>' +
      '<p class="lp-auth-sub">Enter the access password to continue.</p>' +
      '<form class="lp-auth-form" autocomplete="off">' +
      '<input class="lp-auth-input" type="password" name="password" placeholder="Password" required />' +
      '<p class="lp-auth-error" hidden></p>' +
      '<button class="lp-auth-btn" type="submit">Continue</button>' +
      "</form></div>";

    document.body.prepend(gate);

    const form = gate.querySelector(".lp-auth-form");
    const input = gate.querySelector(".lp-auth-input");
    const error = gate.querySelector(".lp-auth-error");
    const btn = gate.querySelector(".lp-auth-btn");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      error.hidden = true;
      btn.disabled = true;
      btn.textContent = "Checking…";

      try {
        const res = await fetch(authUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: input.value }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok || !data.token) {
          throw new Error(data.error || "Invalid password");
        }
        setToken(data.token);
        unlock();
      } catch (err) {
        error.textContent = err.message || "Invalid password";
        error.hidden = false;
        input.focus();
        input.select();
      } finally {
        btn.disabled = false;
        btn.textContent = "Continue";
      }
    });

    input.focus();
  }

  const existing = getToken();
  if (existing) {
    setToken(existing);
    unlock();
  } else {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showGate);
    } else {
      showGate();
    }
  }

  window.LabsterAuth = { getToken, authUrl };
})();
