// Cloudflare Worker — GitHub OAuth proxy for Decap CMS.
//
// Why this exists: Decap CMS's `github` backend talks straight to GitHub OAuth,
// but GitHub never returns the access token to a static page (CORS + the
// `client_secret` must stay server-side). This worker is the small server-side
// hop: the user clicks "Login with GitHub" in /admin, gets bounced through
// /auth → GitHub → /callback, and the worker hands back the token via
// postMessage to the parent /admin window.
//
// Env / secrets (set via `wrangler secret put …`):
//   GITHUB_CLIENT_ID      — public client id from your GitHub OAuth App
//   GITHUB_CLIENT_SECRET  — secret from the same app
//
// Routes:
//   GET /auth     → 302 to GitHub authorize
//   GET /callback → exchange code for token, postMessage back to opener

const ORIGIN_ALLOWLIST = [
  // Add the deployed site origin(s) the /admin page will load from.
  // Wildcard not supported — list each explicitly.
  'https://nashabiggi.com',
  'https://www.nashabiggi.com',
  'https://nasha.andresnusep.workers.dev',
  'http://localhost:5173',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo,user',
        redirect_uri: `${url.origin}/callback`,
        // Decap accepts a `provider` query param it'll round-trip back to us
        // via state; we don't strictly need it but keeping it preserves intent.
        state: url.searchParams.get('site_id') || 'decap',
      });
      return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenResp.json();

      const payload = data.access_token
        ? { token: data.access_token, provider: 'github' }
        : { error: data.error || 'token_exchange_failed' };

      // Decap's external-auth handshake (matches Netlify's reference proxy):
      //   popup → opener:  "authorizing:github"
      //   opener → popup:  "authorizing:github"   (confirm)
      //   popup → opener:  "authorization:github:success:{json}"
      //   popup closes
      // Posting the success message before the handshake silently no-ops in
      // Decap, which is why the previous version logged "Login complete" but
      // the admin window never received the token.
      const status = data.access_token ? 'success' : 'error';
      const finalMessage = `authorization:github:${status}:${JSON.stringify(payload)}`;
      const handshake = 'authorizing:github';

      const html = `<!doctype html>
<html><body>
<p id="status">Completing login…</p>
<script>
(function () {
  var allow = ${JSON.stringify(ORIGIN_ALLOWLIST)};
  function send(msg) {
    allow.forEach(function (o) {
      try { if (window.opener) window.opener.postMessage(msg, o); } catch (e) {}
    });
  }

  // 1. Tell the opener we're authorizing (handshake).
  send(${JSON.stringify(handshake)});

  // 2. Wait for the opener's confirmation, then reply with the token.
  function onMsg(e) {
    if (e.data !== ${JSON.stringify(handshake)}) return;
    window.removeEventListener('message', onMsg);
    send(${JSON.stringify(finalMessage)});
    document.getElementById('status').textContent = 'Login complete — closing this tab…';
    setTimeout(function () {
      try { window.close(); } catch (e) {}
    }, 300);
  }
  window.addEventListener('message', onMsg, false);

  // Failsafe: if no confirmation arrives within 5s (e.g. popup blocker
  // chewed the parent listener), still close so the user isn't stranded.
  setTimeout(function () {
    document.getElementById('status').textContent =
      'No response from opener. You can close this tab.';
  }, 5000);
}());
</script>
</body></html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('Nasha OAuth proxy. Routes: /auth, /callback', { status: 200 });
  },
};
