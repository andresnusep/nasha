# Cloudflare OAuth Worker for Decap CMS

Tiny Cloudflare Worker that handles GitHub login for the `/admin` page on the deployed site. Decap can't talk to GitHub directly because the OAuth flow needs a `client_secret` that must stay server-side — this worker is that server-side hop.

## One-time setup

### 1. Create a GitHub OAuth App

GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**.

- **Application name**: `Nasha CMS` (anything)
- **Homepage URL**: `https://nasha.fm` (or your Pages URL like `https://nasha.pages.dev`)
- **Authorization callback URL**: `https://nasha-oauth.YOUR-WORKER-SUBDOMAIN.workers.dev/callback`

Save. Copy the **Client ID**, then **Generate a new client secret** and copy that too.

### 2. Deploy the worker

```sh
cd cf-oauth-worker
npm install -g wrangler   # if you don't have it
wrangler login            # opens browser, signs into your CF account
wrangler deploy
```

Wrangler will print the worker URL (e.g. `https://nasha-oauth.you.workers.dev`).

### 3. Set the secrets

```sh
wrangler secret put GITHUB_CLIENT_ID
# paste the Client ID, hit enter

wrangler secret put GITHUB_CLIENT_SECRET
# paste the Client Secret, hit enter
```

### 4. Update the OAuth App callback URL

If the worker URL was different from what you guessed in step 1, go back to the GitHub OAuth App and update **Authorization callback URL** to the real worker URL + `/callback`.

### 5. Update `ORIGIN_ALLOWLIST` in `src/index.js`

Replace the placeholders with the actual origin(s) where `/admin` lives (your Cloudflare Pages domain). Re-deploy: `wrangler deploy`.

### 6. Update `public/admin/config.yml`

In the main project, switch from `local_backend` to `github`:

```yaml
backend:
  name: github
  repo: YOUR-GITHUB-USER/nasha-portfolio
  branch: main
  base_url: https://nasha-oauth.YOUR-WORKER-SUBDOMAIN.workers.dev
  auth_endpoint: auth
```

…and either delete `local_backend: true` or set it to `false`. Commit, push — Cloudflare Pages rebuilds.

## How auth flows after setup

1. Editor opens `https://nasha.fm/admin`.
2. Clicks "Login with GitHub" → opens popup to `https://YOUR-WORKER/auth`.
3. Worker redirects to `github.com/login/oauth/authorize`.
4. GitHub asks for permission, redirects back to `https://YOUR-WORKER/callback?code=…`.
5. Worker exchanges the code for an access token (using the client secret), then `postMessage`s it back to the parent `/admin` window.
6. Decap stores the token and uses it to read/write files in the GitHub repo.

## Inviting Nasha

She needs **push access to the GitHub repo**. Settings → Collaborators → invite her GitHub user. After she accepts she can sign into `/admin` with the same flow.
