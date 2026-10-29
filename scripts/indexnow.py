#!/usr/bin/env python3
"""Submit every URL in the sitemaps to IndexNow (Bing, Yandex, Seznam, Naver...).
Runs in GitHub Actions after each push to main."""
import json, re, sys, time, urllib.request
SITE = "https://usfreetools.com"
KEY = "8db665c423885e2852c351d66a804286"
urls = []
for f in ["sitemap-main.xml","sitemap-convert.xml"]:
    try: urls += re.findall(r"<loc>([^<]+)</loc>", open(f, encoding="utf-8").read())
    except FileNotFoundError: pass
print(len(urls), "urls")
time.sleep(int(sys.argv[1]) if len(sys.argv) > 1 else 0)  # let Cloudflare finish deploying
for i in range(0, len(urls), 10000):
    body = json.dumps({"host": "usfreetools.com", "key": KEY, "keyLocation": f"{SITE}/{KEY}.txt", "urlList": urls[i:i+10000]}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        r = urllib.request.urlopen(req, timeout=60); print("batch", i, "->", r.status)
    except urllib.error.HTTPError as e:
        print("batch", i, "->", e.code, e.read()[:200]); sys.exit(1)
