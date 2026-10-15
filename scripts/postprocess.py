#!/usr/bin/env python3
"""Idempotent site-wide HTML fixes. Run from the repo root after generating pages:
    python3 scripts/postprocess.py
- Non-blocking Google Fonts (preconnect + preload, trimmed weights) instead of a CSS @import
- defer on local scripts
- sidebar headings h4 -> h3 (heading order)
- accessible label on the embed textarea
- reserve measured widget height (scripts/widget-heights.json) to prevent layout shift
"""
import glob, json, re
HT = json.load(open("scripts/widget-heights.json"))

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" onload="this.onload=null;this.rel=\'stylesheet\'">\n'
         '  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"></noscript>\n  ')

files = (glob.glob("*.html") + glob.glob("tools/*.html") + glob.glob("blog/*.html") + glob.glob("convert/*.html")
         + glob.glob("percent/*.html") + glob.glob("height/*.html") + glob.glob("embed/*.html"))
changed = 0
for f in files:
    s = open(f, encoding="utf-8").read(); o = s
    if "fonts.gstatic.com" not in s and '<link rel="stylesheet" href="/css/style.css">' in s:
        s = s.replace('<link rel="stylesheet" href="/css/style.css">', FONTS + '<link rel="stylesheet" href="/css/style.css">', 1)
    s = re.sub(r'<script src="(/js/[a-z-]+\.js)"></script>', r'<script defer src="\1"></script>', s)
    s = re.sub(r'(<div class="sidebar-widget">\s*)<h4>(.*?)</h4>', r'\1<h3>\2</h3>', s)
    s = s.replace('<textarea readonly rows="4" style="width:100%;font-family:monospace',
                  '<textarea readonly rows="4" aria-label="Embed code" style="width:100%;font-family:monospace')
    m = re.search(r'<div id="toolContainer"([^>]*)>', s)
    if m and "--h-m" not in m.group(1):
        hv = HT["files"].get(f) or HT["keys"].get(re.sub(r'data-(value|p|n)="[^"]*"', '', m.group(1)))
        if hv:
            mob, desk = hv.get("412"), hv.get("1280")
            s = s[:m.start()] + f'<div id="toolContainer"{m.group(1)} style="--h-m:{mob}px;--h-d:{desk}px">' + s[m.end():]
    if s != o:
        open(f, "w", encoding="utf-8").write(s); changed += 1
print("postprocess: changed", changed, "of", len(files))
