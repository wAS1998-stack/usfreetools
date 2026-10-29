#!/usr/bin/env python3
"""Generate category hub pages (/finance-calculators, /text-tools, ...) from the
home-improvement.html shell, and point breadcrumbs/footers at them.
Idempotent. Run from the repo root, then run scripts/postprocess.py:
    python3 scripts/hubs.py && python3 scripts/postprocess.py
"""
import glob, html, json, re

SITE = "https://usfreetools.com"

HUBS = [
 {"slug": "finance-calculators", "name": "Finance Calculators", "short": "Finance",
  "title": "Free Finance Calculators — Mortgage, Loan, Interest, Salary & Tax",
  "desc": "Free money calculators: mortgage payment, loan, compound interest, down payment, salary, overtime, discount, sales tax and tip. Instant results, no signup.",
  "lead": "Run the numbers before you borrow, save, negotiate or buy. Each calculator shows the formula it uses, so you can check the math yourself.",
  "groups": [
   ("Home & borrowing", ["mortgage-calculator", "down-payment-calculator", "loan-calculator", "compound-interest-calculator"]),
   ("Pay & work", ["hourly-to-salary-calculator", "overtime-pay-calculator", "pay-raise-calculator", "freelance-rate-calculator"]),
   ("Shopping & business", ["discount-calculator", "sales-tax-calculator", "tip-calculator", "profit-margin-calculator", "cpm-calculator"]),
  ],
  "guide": ("How to use these together",
   ["<strong>Buying a home:</strong> start with the down payment you can afford, then put the remaining loan into the mortgage calculator to see the monthly principal and interest. Property tax, insurance and HOA fees come on top.",
    "<strong>Comparing a job offer:</strong> convert the hourly rate to a yearly salary, add expected overtime, and compare the raise as a percentage of your current pay.",
    "<strong>Saving for a goal:</strong> the compound interest calculator shows how monthly contributions grow; small changes in the rate or the number of years make a large difference.",
    "These calculators give estimates for planning. Lenders, employers and tax authorities apply their own rules, so confirm the final figures with them before you commit."])},
 {"slug": "health-calculators", "name": "Health & Fitness Calculators", "short": "Health",
  "title": "Free Health & Fitness Calculators — BMI, Calories, Ideal Weight, Pace",
  "desc": "Free health and fitness calculators: BMI, calorie deficit (TDEE), ideal weight, daily water intake, running pace, heat index and wind chill. General guidance only.",
  "lead": "Quick, private estimates for everyday health and training questions. Every result is general guidance, not medical advice — talk to a doctor about anything specific to you.",
  "groups": [
   ("Body & nutrition", ["bmi-calculator", "ideal-weight-calculator", "calorie-deficit-calculator", "water-intake-calculator"]),
   ("Training & weather", ["pace-calculator", "heat-index-calculator", "wind-chill-calculator"]),
   ("Pets", ["dog-age-calculator"]),
  ],
  "guide": ("What these numbers can and can't tell you",
   ["<strong>BMI</strong> is a quick screening number based on height and weight. It does not separate muscle from fat, so athletes and older adults can be misclassified.",
    "<strong>Calorie targets</strong> use the Mifflin-St Jeor equation, the formula most dietitians start from. Treat the result as a starting point and adjust after a few weeks of real-world results.",
    "<strong>Heat index and wind chill</strong> use the US National Weather Service formulas, so the numbers match the ones in weather forecasts.",
    "Nothing you enter leaves your browser."])},
 {"slug": "math-calculators", "name": "Math Calculators", "short": "Math",
  "title": "Free Math Calculators — Percentage, Fraction, Average, GPA & More",
  "desc": "Free math calculators with worked steps: percentage, percentage change, fractions, average, ratio, square root, scientific, GPA and grade calculators.",
  "lead": "Get the answer and the working. These calculators show the steps, so they double as a quick refresher for homework, exams and everyday math.",
  "groups": [
   ("Percentages & ratios", ["percentage-calculator", "percentage-increase-calculator", "ratio-calculator", "aspect-ratio-calculator"]),
   ("Arithmetic", ["fraction-calculator", "average-calculator", "square-root-calculator", "scientific-calculator", "number-base-converter", "roman-numeral-converter"]),
   ("School & grades", ["gpa-calculator", "grade-calculator", "gpa-to-percentage-converter"]),
  ],
  "guide": ("Answers people look up most",
   ["Need a specific percentage, like 15% of 200? The <a href=\"/percent\">percentage tables</a> have ready-made answers with the steps written out.",
    "<strong>Percentage change</strong> is (new − old) ÷ old × 100. A rise from 80 to 100 is +25%, but a fall from 100 to 80 is −20%. The base matters.",
    "<strong>GPA</strong> calculators here use the standard US 4.0 scale. Schools that weight honors or AP classes may add extra points, so check your school's own policy."])},
 {"slug": "unit-converters", "name": "Unit Converters", "short": "Units",
  "title": "Free Unit Converters — Length, Weight, Temperature, Speed & Volume",
  "desc": "Free unit converters: cm to inches, kg to lbs, Celsius to Fahrenheit, km to miles, liters to gallons, speed, time and data storage. Exact factors, instant results.",
  "lead": "Convert between metric and US customary units using exact conversion factors. For a specific value, like 170 cm in feet, the conversion charts have the answer ready.",
  "groups": [
   ("Length & distance", ["length-converter", "cm-to-inches", "inches-to-cm", "km-to-miles", "miles-to-km"]),
   ("Weight & volume", ["weight-converter", "kg-to-lbs", "pounds-to-kg", "liters-to-gallons"]),
   ("Temperature, speed & more", ["temperature-converter", "celsius-to-fahrenheit", "fahrenheit-to-celsius", "speed-converter", "time-converter", "data-storage-converter"]),
  ],
  "guide": ("Ready-made answers",
   ["<a href=\"/convert\">Conversion charts</a>: about 1,900 pages like \"150 lbs to kg\" and \"100 °F to °C\", each with the exact result and the formula.",
    "<a href=\"/height\">Height chart</a>: every height from 4 ft to 7 ft in centimeters, and back.",
    "The factors are exact by definition: 1 inch = 2.54 cm, 1 lb = 0.45359237 kg, 1 US gallon = 3.785411784 L."])},
 {"slug": "text-tools", "name": "Text Tools", "short": "Text",
  "title": "Free Text Tools — Word Counter, Case Converter, Remove Duplicates & More",
  "desc": "Free online text tools: word and character counter, case converter, remove duplicate lines and line breaks, find and replace, bold and italic text generators.",
  "lead": "Count, clean up, reformat and style text in your browser. Paste your text in; nothing is uploaded or stored.",
  "groups": [
   ("Count", ["word-counter", "character-counter", "sentence-counter", "paragraph-counter", "line-counter", "twitter-character-counter", "string-length-calculator", "reading-time-calculator", "word-frequency-counter"]),
   ("Change case & style", ["case-converter", "uppercase-converter", "lowercase-converter", "title-case-converter", "headline-case-converter", "bold-text-generator", "italic-text-generator", "strikethrough-text"]),
   ("Clean up & transform", ["remove-duplicate-lines", "remove-line-breaks", "whitespace-remover", "find-and-replace", "duplicate-word-finder", "text-repeater", "text-reverser", "lorem-ipsum-generator", "morse-code-translator", "binary-translator"]),
  ],
  "guide": ("Common limits worth knowing",
   ["X (Twitter) posts: 280 characters. Google titles show about 50–60 characters, and meta descriptions about 150–160.",
    "Most people read about 200–250 words a minute, so a 1,000-word article takes four to five minutes.",
    "Bold, italic and strikethrough generators use Unicode characters, so they work in bios and posts that don't support formatting. Some screen readers read them letter by letter, so use them sparingly."])},
 {"slug": "developer-tools", "name": "Developer Tools", "short": "Developer",
  "title": "Free Developer Tools — JSON Formatter, Base64, Regex, JWT, UUID & More",
  "desc": "Free browser-based developer tools: JSON, XML and SQL formatters, CSV/JSON converters, Base64, URL and HTML encoding, regex tester, JWT decoder, UUID and hash generators.",
  "lead": "Format, convert, encode and debug without pasting data into a server. Every tool runs locally in your browser, which matters when the input is an API response or a token.",
  "groups": [
   ("Format & convert data", ["json-formatter", "xml-formatter", "sql-formatter", "csv-to-json", "json-to-csv", "html-to-markdown", "markdown-preview"]),
   ("Encode & decode", ["base64-encode-decode", "url-encode-decode", "html-encode-decode", "jwt-decoder", "epoch-converter"]),
   ("Generate & test", ["regex-tester", "uuid-generator", "hash-generator", "cron-expression-generator", "css-minifier", "js-minifier"]),
   ("Colors", ["color-converter", "hex-to-rgb", "rgb-to-hex", "color-picker", "color-palette-generator", "random-color-generator"]),
  ],
  "guide": ("Why browser-only matters",
   ["JWTs, API keys and customer data shouldn't be pasted into tools that send them to a server. These tools do all the work in your browser tab; you can disconnect from the internet after the page loads and they keep working.",
    "The JWT decoder only decodes the token. It does not verify the signature, so never trust a token's contents without checking the signature on your server."])},
 {"slug": "seo-tools", "name": "SEO & Marketing Tools", "short": "SEO",
  "title": "Free SEO Tools — Meta Tags, Open Graph, Robots.txt, UTM Builder & More",
  "desc": "Free SEO and marketing tools: meta tag and Open Graph generators, meta description length checker, robots.txt generator, URL slugs, UTM links, keyword density and QR codes.",
  "lead": "Small tools for the parts of SEO and campaign setup that are easy to get wrong: tags, snippets, crawl rules and tracking links.",
  "groups": [
   ("On-page", ["meta-tag-generator", "meta-description-counter", "open-graph-generator", "keyword-density-checker", "slug-generator"]),
   ("Crawling & tracking", ["robots-txt-generator", "utm-builder", "qr-code-generator"]),
  ],
  "guide": ("Quick checklist for a new page",
   ["Write a unique title (about 50–60 characters) and a meta description (about 150–160) that answers the searcher's question.",
    "Use a short, readable URL slug, add Open Graph tags so shared links show a proper preview, and tag campaign links with UTM parameters so you can see what worked in analytics.",
    "Keyword density is a rough check, not a target. Write for the reader first."])},
 {"slug": "everyday-tools", "name": "Everyday Tools", "short": "Everyday",
  "title": "Free Everyday Tools — Age, Date, Timer, Random Picker, Passwords & Images",
  "desc": "Free everyday tools: age and date calculators, countdown timer, stopwatch, random number and name pickers, password and PIN generators, image resizer and kitchen ratios.",
  "lead": "The small jobs that come up every week: dates and times, picking at random, making a strong password, resizing a photo, or getting a recipe ratio right.",
  "groups": [
   ("Dates & time", ["age-calculator", "date-difference-calculator", "time-duration-calculator", "countdown-timer", "stopwatch"]),
   ("Random & games", ["random-number-generator", "random-name-picker", "random-picker", "list-randomizer", "coin-flip", "dice-roller"]),
   ("Passwords & security", ["password-generator", "password-strength-checker", "pin-generator", "username-generator"]),
   ("Images", ["image-resizer", "image-compressor", "jpg-to-png", "png-to-jpg"]),
   ("Kitchen", ["coffee-ratio-calculator", "rice-to-water-ratio-calculator", "pizza-dough-hydration-calculator"]),
   ("Cars & screens", ["mpg-calculator", "tire-size-calculator", "ppi-calculator"]),
  ],
  "guide": ("Good to know",
   ["Random tools use your browser's cryptographic random number generator (crypto.getRandomValues), the same source used for passwords, so results are fair and can't be predicted.",
    "Images are resized and compressed on your device; the files are never uploaded."])},
]
HOME_SLUG, HOME_NAME = "home-improvement", "Home & Garden"

def tool_meta(slug):
    s = open(f"tools/{slug}.html", encoding="utf-8").read()
    h1 = re.search(r"<h1>([^<]*)</h1>", s).group(1).strip()
    icon, _, name = h1.partition(" ")
    desc = ""
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try: d = json.loads(b)
        except Exception: continue
        if isinstance(d, dict) and d.get("@type") in ("WebApplication", "SoftwareApplication"):
            desc = d.get("description", ""); break
    if len(desc) > 115:
        desc = desc[:115].rsplit(" ", 1)[0].rstrip(",;:—-") + "…"
    return icon, html.unescape(name), desc

def card(slug):
    icon, name, desc = tool_meta(slug)
    return (f'<a href="/tools/{slug}" class="cat-card"><span class="cat-icon">{icon}</span>'
            f'<h3>{html.escape(name)}</h3><span>{html.escape(desc)}</span></a>')

shell = open("home-improvement.html", encoding="utf-8").read()
head_end = shell.index('<div class="page-header">')
foot_start = shell.index('<footer class="footer">')
HEAD, FOOT = shell[:head_end], shell[foot_start:]

def other_hubs(cur):
    links = [(h["slug"], h["name"]) for h in HUBS if h["slug"] != cur] + [(HOME_SLUG, "Home & Garden Calculators")]
    return " · ".join(f'<a href="/{s}">{html.escape(n)}</a>' for s, n in links)

all_slugs = []
for h in HUBS:
    slugs = [s for _, g in h["groups"] for s in g]
    all_slugs += slugs
    n = len(slugs)
    head = HEAD
    head = re.sub(r"<title>.*?</title>", f"<title>{html.escape(h['title'])}</title>", head, count=1)
    head = re.sub(r'<meta name="description" content="[^"]*"', f'<meta name="description" content="{html.escape(h["desc"])}"', head, count=1)
    head = head.replace(f"{SITE}/home-improvement", f"{SITE}/{h['slug']}")
    head = re.sub(r'<meta property="og:title" content="[^"]*"', f'<meta property="og:title" content="{html.escape(h["name"])}"', head, count=1)
    head = re.sub(r'<meta property="og:description" content="[^"]*"', f'<meta property="og:description" content="{html.escape(h["lead"][:150])}"', head, count=1)
    head = re.sub(r'<meta property="og:image" content="[^"]*"', f'<meta property="og:image" content="{SITE}/og/{slugs[0]}.png"', head, count=1)
    il = {"@context": "https://schema.org", "@type": "ItemList", "name": h["name"],
          "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": f"{SITE}/tools/{s}", "name": tool_meta(s)[1]} for i, s in enumerate(slugs)]}
    bc = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
          {"@type": "ListItem", "position": 2, "name": h["name"], "item": f"{SITE}/{h['slug']}"}]}
    head = re.sub(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "ItemList".*?</script>',
                  lambda m: '<script type="application/ld+json">' + json.dumps(il, ensure_ascii=False) + "</script>", head, count=1, flags=re.S)
    head = re.sub(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "BreadcrumbList".*?</script>',
                  lambda m: '<script type="application/ld+json">' + json.dumps(bc, ensure_ascii=False) + "</script>", head, count=1, flags=re.S)
    body = [f'<div class="page-header"><h1>{html.escape(h["name"])}</h1><p>{html.escape(h["lead"])}</p>'
            f'<p style="font-size:.95rem;opacity:.85">{n} free tools · no signup · runs in your browser</p></div>']
    for i, (gname, g) in enumerate(h["groups"]):
        body.append(f'<section class="section" id="g{i+1}"><div class="section-inner"><h2 style="margin-bottom:18px">{html.escape(gname)}</h2>'
                    f'<div class="categories-grid">{"".join(card(s) for s in g)}</div></div></section>')
    gt, items = h["guide"]
    body.append('<section class="section"><div class="section-inner"><div class="content-inner" style="max-width:100%;border:1px solid var(--border)">'
                f'<h2>{html.escape(gt)}</h2><ul>' + "".join(f"<li>{x}</li>" for x in items) + "</ul>"
                f'<h3>More categories</h3><p>{other_hubs(h["slug"])} · <a href="/tools">All tools</a></p></div></div></section>\n')
    open(f"{h['slug']}.html", "w", encoding="utf-8").write(head + "\n".join(body) + FOOT)

# every tool belongs to exactly one hub (or Home & Garden)
home = set(re.findall(r'href="/tools/([a-z0-9-]+)"', shell[head_end:foot_start]))
tools = {f[6:-5] for f in glob.glob("tools/*.html")}
dupes = {s for s in all_slugs if all_slugs.count(s) > 1}
missing = tools - set(all_slugs) - home
unknown = set(all_slugs) - tools
assert not dupes and not missing and not unknown, (dupes, missing, unknown)
HUB_OF = {s: h for h in HUBS for _, g in h["groups"] for s in g}

# tool pages: breadcrumbs -> real hub URL
for slug, h in HUB_OF.items():
    f = f"tools/{slug}.html"; s = open(f, encoding="utf-8").read(); o = s
    s = re.sub(r'(<div class="tool-breadcrumb">\s*<a href="/">Home</a> › )<a href="/tools">Tools</a> › <a href="/tools\?cat=[a-z]+">[^<]*</a>',
               rf'\1<a href="/{h["slug"]}">{html.escape(h["name"])}</a>', s, count=1)
    def fix_ld(m):
        d = json.loads(m.group(1))
        if d.get("@type") != "BreadcrumbList": return m.group(0)
        last = d["itemListElement"][-1]
        d["itemListElement"] = [d["itemListElement"][0],
            {"@type": "ListItem", "position": 2, "name": h["name"], "item": f"{SITE}/{h['slug']}"},
            {"@type": "ListItem", "position": 3, "name": last["name"], "item": last["item"]}]
        return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + "</script>"
    s = re.sub(r'<script type="application/ld\+json">(\{"@context": "https://schema.org", "@type": "BreadcrumbList".*?)</script>', fix_ld, s, flags=re.S)
    if s != o: open(f, "w", encoding="utf-8").write(s)

# site-wide footer categories + homepage category cards -> real hub URLs
CAT_MAP = {"text": "text-tools", "developer": "developer-tools", "seo": "seo-tools", "math": "math-calculators",
           "unit": "unit-converters", "converter": "unit-converters", "security": "everyday-tools", "image": "everyday-tools",
           "business": "finance-calculators", "utility": "everyday-tools", "random": "everyday-tools", "design": "developer-tools"}
FOOTER_CATS = ('<div class="footer-col"><h4>Categories</h4>\n'
  + "".join(f'        <a href="/{h["slug"]}">{html.escape(h["name"])}</a>\n' for h in HUBS)
  + '        <a href="/home-improvement">Home &amp; Garden Calculators</a>\n'
  + '        <a href="/convert">Conversion Charts</a>\n        <a href="/percent">Percentage Tables</a>\n        <a href="/height">Height Chart</a>\n      </div>')
files = (glob.glob("*.html") + glob.glob("tools/*.html") + glob.glob("blog/*.html") + glob.glob("convert/*.html")
         + glob.glob("percent/*.html") + glob.glob("height/*.html"))
for f in files:
    s = open(f, encoding="utf-8").read(); o = s
    s = re.sub(r'<div class="footer-col"><h4>Categories</h4>.*?</div>', lambda m: FOOTER_CATS, s, count=1, flags=re.S)
    s = re.sub(r'href="/tools\?cat=([a-z]+)"', lambda m: f'href="/{CAT_MAP.get(m.group(1), "tools")}"', s)
    if s != o: open(f, "w", encoding="utf-8").write(s)

# sitemap
sm = open("sitemap-main.xml", encoding="utf-8").read()
for h in HUBS:
    loc = f"{SITE}/{h['slug']}"
    if f"<loc>{loc}</loc>" not in sm:
        sm = sm.replace("</urlset>", f"  <url><loc>{loc}</loc><lastmod>2026-10-29</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n</urlset>")
open("sitemap-main.xml", "w", encoding="utf-8").write(sm)
print("hubs:", len(HUBS), "tools mapped:", len(HUB_OF), "home&garden:", len(home & tools))
