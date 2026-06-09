# 🚀 USFreeTools.com — Deployment Guide

Your site is **100% static** (HTML, CSS, JavaScript — no database, no server code).
That means the best hosting is **free static hosting on a global CDN**, not a paid VPS.
This guide uses **Cloudflare Pages** (free, fast, automatic HTTPS). Netlify and GitHub
Pages work the same way if you prefer them.

You already have a domain, so we'll connect that too.

---

## ✅ Before you start

- The whole site is in the `usfreetools` folder. That folder is what you upload.
- Ads are currently **hidden** (you're launching without AdSense). See the last section
  for how to turn them on later.
- Have your domain registrar login ready (where you bought your domain).

---

## OPTION A — Cloudflare Pages (recommended, free)

### Step 1 — Create a free Cloudflare account
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with your email (free, no card needed).

### Step 2 — Create a Pages project (drag-and-drop, no Git needed)
1. In the Cloudflare dashboard, click **Workers & Pages** in the left menu.
2. Click **Create application** → **Pages** tab → **Upload assets**.
3. Give it a project name, e.g. `usfreetools`.
4. **Drag the contents of the `usfreetools` folder** into the upload box.
   ⚠️ Important: upload the **files inside** the folder (index.html, tools/, css/, etc.),
   so that `index.html` is at the top level — not the folder itself nested one level down.
5. Click **Deploy**. In under a minute you'll get a live URL like
   `https://usfreetools.pages.dev` — open it to confirm everything works.

### Step 3 — Connect your own domain
1. In your new Pages project, go to the **Custom domains** tab.
2. Click **Set up a custom domain**, enter `usfreetools.com`, and follow the prompt.
3. Cloudflare will tell you to either:
   - **Move your domain's DNS to Cloudflare** (it walks you through changing your
     nameservers at your registrar — recommended, and it's free), **or**
   - Add a **CNAME record** at your current DNS provider pointing to your `.pages.dev` URL.
4. Repeat for `www.usfreetools.com` if you want the www version too.
5. **HTTPS is automatic** — Cloudflare issues and renews the SSL certificate for you.
   No Certbot, no renewals to remember.

DNS changes can take a few minutes to a few hours to take effect worldwide.

### Step 4 — You're live 🎉
Visit `https://usfreetools.com` and click through a few tools to confirm.

---

## OPTION B — Netlify (also free, equally easy)

1. Sign up at https://app.netlify.com/signup
2. Click **Add new site** → **Deploy manually**.
3. **Drag the `usfreetools` folder contents** into the drop zone → instant live URL.
4. **Domain settings** → **Add a custom domain** → enter `usfreetools.com`.
5. Follow Netlify's DNS instructions (point your registrar's records at Netlify, or use
   Netlify DNS). **HTTPS is automatic.**

---

## OPTION C — GitHub Pages (free, if you like Git)

1. Create a repo at https://github.com/new (e.g. `usfreetools`).
2. Upload all files from the `usfreetools` folder (web UI: **Add file → Upload files**,
   or `git push` if you use the command line).
3. Repo **Settings → Pages** → set Source to your main branch → **Save**.
4. **Settings → Pages → Custom domain** → enter `usfreetools.com` → check **Enforce HTTPS**.
5. At your registrar, add the DNS records GitHub shows you (A records for the apex domain,
   or a CNAME for www).

---

## 🔁 How to update the site later
- **Cloudflare/Netlify drag-and-drop:** re-upload the folder; it redeploys in seconds.
- **GitHub Pages:** upload/commit the changed files; it redeploys automatically.

---

## 📈 Recommended launch sequence (for AdSense success)

1. **Deploy now** with ads hidden (current state).
2. **Submit to Google Search Console** (https://search.google.com/search-console):
   - Add your property, verify ownership (DNS or HTML method),
   - Submit your sitemap: `https://usfreetools.com/sitemap.xml`.
3. **Let it run 2–4 weeks** and build some real traffic and a few backlinks.
4. **Then apply to AdSense** (https://adsense.google.com) — sites with real content +
   some traffic + HTTPS get approved far more reliably.

---

## 💰 How to turn ads ON later (after AdSense approval)

**Step 1 — Add your Publisher ID.** In every page, replace the placeholder
`ca-pub-XXXXXXXXXXXXXXXX` with your real AdSense Publisher ID. In `ads.txt`, replace
`pub-0000000000000000` with the same ID (without the `ca-` prefix).

**Step 2 — Un-hide the ad slots.** Open `css/style.css`, scroll to the very bottom, and
delete the **AD VISIBILITY TOGGLE** block (the last few lines). That makes ad spaces visible again.

**Step 3 — Insert real ad units.** Replace each `.ad-banner` placeholder `<div>` with the
`<ins class="adsbygoogle">…</ins>` code that AdSense gives you for each unit.

**Step 4 — Re-deploy** (re-upload the folder). Done.

---

## ❓ Why not a VPS?
A VPS (Hostinger, etc.) is a full server you must maintain — OS updates, security patches,
web-server config, manual SSL renewals — and it serves from one location. Your site has no
backend, so a VPS adds monthly cost and work for a result that's actually **slower** for
distant visitors than a free global CDN. Stick with free static hosting unless you later add
features that genuinely need a server (user accounts, a database, server-side code).

— Hosting cost: **$0**. Your only cost is the domain you already own.
