#!/usr/bin/env python3
"""Tell IndexNow (Bing, Yandex, Seznam, Naver...) which URLs changed.

    python3 scripts/indexnow.py <delay_seconds> [<before_sha> <after_sha>] [--dry-run]

With two commit SHAs it submits only the indexable pages changed between them, plus
any removed pages (so engines see their redirect). Without them, or if the diff can't
be computed, it submits every URL in the sitemaps. Runs in GitHub Actions after each
push to main; 429 and 5xx responses are retried with backoff."""
import json, re, subprocess, sys, time, urllib.error, urllib.request

SITE = "https://usfreetools.com"
KEY = "8db665c423885e2852c351d66a804286"
DRY = "--dry-run" in sys.argv
args = [a for a in sys.argv[1:] if a != "--dry-run"]


def sitemap_urls():
    urls = []
    for f in ("sitemap-main.xml", "sitemap-convert.xml"):
        try:
            urls += re.findall(r"<loc>([^<]+)</loc>", open(f, encoding="utf-8").read())
        except FileNotFoundError:
            pass
    return urls


def url_for(path):
    p = path[:-5]
    return SITE + "/" if p == "index" else SITE + "/" + p


def changed_urls(before, after):
    out = subprocess.run(["git", "diff", "--name-status", "--no-renames", before, after],
                         capture_output=True, text=True, check=True).stdout
    indexable = set(sitemap_urls())
    urls = set()
    for line in out.splitlines():
        status, path = line.split("\t", 1)
        if not path.endswith(".html") or path.startswith("embed/"):
            continue
        u = url_for(path)
        if status == "D" or u in indexable:
            urls.add(u)
    return sorted(urls)


urls = None
if len(args) >= 3 and args[1] and set(args[1]) != {"0"}:
    try:
        urls = changed_urls(args[1], args[2])
        print(len(urls), "changed urls")
    except Exception as e:  # shallow clone, force-push, etc.
        print("diff failed, falling back to the sitemaps:", e)
if urls is None:
    urls = sitemap_urls()
    print(len(urls), "urls from the sitemaps")
if not urls:
    print("nothing to submit")
    sys.exit(0)
if DRY:
    print("\n".join(urls))
    sys.exit(0)

time.sleep(int(args[0]) if args else 0)  # let Cloudflare finish deploying
for i in range(0, len(urls), 10000):
    body = json.dumps({"host": "usfreetools.com", "key": KEY, "keyLocation": f"{SITE}/{KEY}.txt",
                       "urlList": urls[i:i + 10000]}).encode()
    for attempt in range(4):
        req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                                     headers={"Content-Type": "application/json; charset=utf-8"})
        try:
            r = urllib.request.urlopen(req, timeout=60)
            print("batch", i, "->", r.status)
            break
        except urllib.error.HTTPError as e:
            msg = e.read()[:200]
            if e.code == 429 or e.code >= 500:
                print("batch", i, "->", e.code, msg, "- retrying")
                time.sleep(60 * (attempt + 1))
                continue
            print("batch", i, "->", e.code, msg)
            sys.exit(1)
        except urllib.error.URLError as e:
            print("network error:", e, "- retrying")
            time.sleep(30 * (attempt + 1))
    else:
        print("gave up after retries")
        sys.exit(1)
