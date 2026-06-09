// USFreeTools.com - Core JS

// ─── NAV MOBILE TOGGLE ──────────────────────────
(function() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
  // Active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
})();

// ─── SEARCH ─────────────────────────────────────
function initSearch() {
  const input = document.getElementById('heroSearch');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch(e.target.value);
  });
  const btn = document.getElementById('heroSearchBtn');
  if (btn) btn.addEventListener('click', () => doSearch(input.value));
}

function doSearch(q) {
  if (!q.trim()) return;
  window.location.href = `tools.html?q=${encodeURIComponent(q.trim())}`;
}

// ─── COPY TO CLIPBOARD ──────────────────────────
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}

// ─── TABS ───────────────────────────────────────
function initTabs(container) {
  const tabs = container.querySelectorAll('.tab');
  const panels = container.querySelectorAll('.tab-panel');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      if (panels[i]) panels[i].classList.add('active');
    });
  });
}
document.querySelectorAll('.tabs-container').forEach(initTabs);

// ─── WORD COUNTER TOOL ──────────────────────────
const STOPWORDS = new Set('the of to and a in is it you that he was for on are with as i his they be at one have this from or had by hot word but what some we can out other were all there when up use your how said an each she which do their time if will way about many then them write would like so these her long make thing see him two has look more day could go come did number sound no most people my over know water than call first who may down side been now find any new work part take get place made live where after back little only round man year came show every good me give our under name very through just form sentence great think say help low line differ turn cause much mean before move right boy old too same tell does set three want air well also play small end put home read hand port large spell add even land here must big high such follow act why ask men change went light kind off need house picture try us again animal point mother world near build self earth father'.split(' '));

function initWordCounter() {
  const area = document.getElementById('wcInput');
  if (!area) return;
  function update() {
    const text = area.value;
    const wordArr = text.trim() ? text.trim().split(/\s+/) : [];
    const words = wordArr.length;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const lines = text ? text.split(/\n/).length : 0;
    const readTime = Math.ceil(words / 200) || 0;
    const speakTime = Math.ceil(words / 130) || 0;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('wcWords', words.toLocaleString());
    set('wcChars', chars.toLocaleString());
    set('wcCharsNS', charsNoSpace.toLocaleString());
    set('wcSentences', sentences.toLocaleString());
    set('wcParas', paragraphs.toLocaleString());
    set('wcLines', lines.toLocaleString());
    set('wcRead', readTime + ' min');
    set('wcSpeak', speakTime + ' min');

    // Keyword density (top 5, stopwords removed)
    const densityEl = document.getElementById('wcDensity');
    if (densityEl) {
      const freq = {};
      wordArr.forEach(w => {
        const clean = w.toLowerCase().replace(/[^a-z0-9']/g, '');
        if (clean && clean.length > 2 && !STOPWORDS.has(clean)) freq[clean] = (freq[clean] || 0) + 1;
      });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
      if (sorted.length === 0) {
        densityEl.innerHTML = '<p style="color:var(--gray);font-size:0.85rem;">Start typing to see keyword density…</p>';
      } else {
        densityEl.innerHTML = sorted.map(([w, c]) => {
          const pct = ((c / words) * 100).toFixed(1);
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.85rem;"><span style="font-weight:600;">${w}</span><span style="color:var(--gray);">${c}× · ${pct}%</span></div>`;
        }).join('');
      }
    }
  }
  area.addEventListener('input', update);
  update();
}

// ─── CASE CONVERTER ─────────────────────────────
function initCaseConverter() {
  const input = document.getElementById('caseInput');
  const output = document.getElementById('caseOutput');
  if (!input) return;

  window.convertCase = function(type) {
    const t = input.value;
    let result = '';
    switch(type) {
      case 'upper': result = t.toUpperCase(); break;
      case 'lower': result = t.toLowerCase(); break;
      case 'title': result = t.replace(/\b\w/g, c => c.toUpperCase()); break;
      case 'sentence': result = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(); break;
      case 'camel': result = t.replace(/\s(.)/g, m => m.trim().toUpperCase()).replace(/\s/g,'').replace(/^./,c=>c.toLowerCase()); break;
      case 'snake': result = t.toLowerCase().replace(/\s+/g,'_'); break;
      case 'kebab': result = t.toLowerCase().replace(/\s+/g,'-'); break;
      case 'alternate': result = t.split('').map((c,i) => i%2===0 ? c.toLowerCase() : c.toUpperCase()).join(''); break;
      case 'reverse': result = t.split('').reverse().join(''); break;
      default: result = t;
    }
    output.value = result;
  };
}

// ─── PASSWORD GENERATOR ─────────────────────────
function initPasswordGenerator() {
  const output = document.getElementById('pwOutput');
  if (!output) return;

  window.generatePassword = function() {
    const len = parseInt(document.getElementById('pwLength').value) || 16;
    const upper = document.getElementById('pwUpper').checked;
    const lower = document.getElementById('pwLower').checked;
    const numbers = document.getElementById('pwNumbers').checked;
    const symbols = document.getElementById('pwSymbols').checked;
    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
    let pw = '';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) pw += chars[arr[i] % chars.length];
    output.value = pw;
    updateStrength(pw);
  };

  window.updatePwLength = function(v) {
    document.getElementById('pwLengthVal').textContent = v;
  };

  function updateStrength(pw) {
    let score = 0;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const bar = document.getElementById('pwStrengthBar');
    const label = document.getElementById('pwStrengthLabel');
    if (!bar) return;
    const levels = [
      {pct: 16, color: '#EF4444', text: 'Very Weak'},
      {pct: 32, color: '#F97316', text: 'Weak'},
      {pct: 50, color: '#EAB308', text: 'Fair'},
      {pct: 68, color: '#84CC16', text: 'Good'},
      {pct: 84, color: '#22C55E', text: 'Strong'},
      {pct: 100, color: '#10B981', text: 'Very Strong'},
    ];
    const lvl = levels[Math.min(score, 5)];
    bar.style.width = lvl.pct + '%';
    bar.style.background = lvl.color;
    if (label) label.textContent = lvl.text;
  }

  generatePassword();
}

// ─── JSON FORMATTER ─────────────────────────────
function initJsonFormatter() {
  const input = document.getElementById('jsonInput');
  const output = document.getElementById('jsonOutput');
  if (!input) return;

  window.formatJSON = function() {
    try {
      const parsed = JSON.parse(input.value);
      output.value = JSON.stringify(parsed, null, 2);
      document.getElementById('jsonMsg').className = 'alert alert-success';
      document.getElementById('jsonMsg').textContent = '✅ Valid JSON — formatted successfully!';
    } catch(e) {
      document.getElementById('jsonMsg').className = 'alert alert-error';
      document.getElementById('jsonMsg').textContent = '❌ Invalid JSON: ' + e.message;
      output.value = '';
    }
  };

  window.minifyJSON = function() {
    try {
      const parsed = JSON.parse(input.value);
      output.value = JSON.stringify(parsed);
      document.getElementById('jsonMsg').className = 'alert alert-success';
      document.getElementById('jsonMsg').textContent = '✅ JSON minified!';
    } catch(e) {
      document.getElementById('jsonMsg').className = 'alert alert-error';
      document.getElementById('jsonMsg').textContent = '❌ Invalid JSON: ' + e.message;
    }
  };
}

// ─── BASE64 ENCODER ─────────────────────────────
function initBase64() {
  window.encodeBase64 = function() {
    const input = document.getElementById('b64Input').value;
    try {
      document.getElementById('b64Output').value = btoa(unescape(encodeURIComponent(input)));
    } catch(e) {
      document.getElementById('b64Output').value = 'Error: ' + e.message;
    }
  };
  window.decodeBase64 = function() {
    const input = document.getElementById('b64Input').value;
    try {
      document.getElementById('b64Output').value = decodeURIComponent(escape(atob(input)));
    } catch(e) {
      document.getElementById('b64Output').value = 'Error: Invalid Base64 string';
    }
  };
}

// ─── URL ENCODER ────────────────────────────────
function initUrlEncoder() {
  window.encodeURL = function() {
    const input = document.getElementById('urlInput').value;
    document.getElementById('urlOutput').value = encodeURIComponent(input);
  };
  window.decodeURL = function() {
    const input = document.getElementById('urlInput').value;
    try {
      document.getElementById('urlOutput').value = decodeURIComponent(input);
    } catch(e) {
      document.getElementById('urlOutput').value = 'Error: Invalid URI component';
    }
  };
}

// ─── LOREM IPSUM ────────────────────────────────
function initLoremIpsum() {
  const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

  window.generateLorem = function() {
    const type = document.getElementById('loremType').value;
    const count = parseInt(document.getElementById('loremCount').value) || 3;
    const output = document.getElementById('loremOutput');
    let result = '';

    if (type === 'words') {
      result = Array.from({length: count}, () => words[Math.floor(Math.random()*words.length)]).join(' ');
    } else if (type === 'sentences') {
      for (let i = 0; i < count; i++) {
        const len = 8 + Math.floor(Math.random()*12);
        const sent = Array.from({length: len}, () => words[Math.floor(Math.random()*words.length)]).join(' ');
        result += sent.charAt(0).toUpperCase() + sent.slice(1) + '. ';
      }
    } else {
      for (let i = 0; i < count; i++) {
        const sCount = 3 + Math.floor(Math.random()*4);
        let para = '';
        for (let j = 0; j < sCount; j++) {
          const len = 8 + Math.floor(Math.random()*10);
          const sent = Array.from({length: len}, () => words[Math.floor(Math.random()*words.length)]).join(' ');
          para += sent.charAt(0).toUpperCase() + sent.slice(1) + '. ';
        }
        result += para.trim() + '\n\n';
      }
    }
    output.value = result.trim();
  };
}

// ─── MD5 / HASH HELPER ──────────────────────────
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function initHashGenerator() {
  window.generateHash = async function() {
    const input = document.getElementById('hashInput').value;
    if (!input.trim()) return;
    const hash = await sha256(input);
    document.getElementById('hashOutput').value = hash;
  };
}

// ─── COLOR CONVERTER ────────────────────────────
function initColorConverter() {
  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? {r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16)} : null;
  }
  function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min) h=s=0;
    else {
      const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
      h/=6;
    }
    return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
  }
  window.convertColor = function() {
    const hex = document.getElementById('colorHex').value;
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    document.getElementById('colorPreview').style.background = hex;
    document.getElementById('colorRgb').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('colorHsl').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    document.getElementById('colorRgbValues').textContent = `R:${rgb.r} G:${rgb.g} B:${rgb.b}`;
  };
}

// ─── INIT ALL ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initWordCounter();
  initCaseConverter();
  initPasswordGenerator();
  initJsonFormatter();
  initBase64();
  initUrlEncoder();
  initLoremIpsum();
  initHashGenerator();
  initColorConverter();
});
