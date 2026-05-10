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
  'https://nasha.fm',
  'https://nasha.pages.dev',
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

      // Decap listens for `authorization:github:success:{json}` from a popup.
      // We post to all allowlisted origins; the wrong-origin posts silently no-op.
      const message = data.access_token
        ? `authorization:github:success:${JSON.stringify(payload)}`
        : `authorization:github:error:${JSON.stringify(payload)}`;

      const html = `<!doctype html>
<html><body><script>
(function () {
  const allow = ${JSON.stringify(ORIGIN_ALLOWLIST)};
  const send = () => allow.forEach(o => {
    try { window.opener && window.opener.postMessage(${JSON.stringify(message)}, o); } catch (e) {}
  });
  // Decap pings us first to confirm origin; reply when asked, then send.
  window.addEventListener('message', send, false);
  send();
  document.body.textContent = ${data.access_token ? "'Login complete — you can close this tab.'" : "'Login failed: ' + ${JSON.stringify(payload.error || '')}"};
}());
</script></body></html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('Nasha OAuth proxy. Routes: /auth, /callback', { status: 200 });
  },
};
