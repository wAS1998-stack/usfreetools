// js/tool-logic.js — implementations for every tool, dispatched by data-impl attribute
(function(){
'use strict';

function $(id){return document.getElementById(id);}
function copyText(text, btn){
  navigator.clipboard.writeText(text).then(()=>{
    const o=btn.textContent; btn.textContent='✅ Copied!'; setTimeout(()=>btn.textContent=o,1500);
  });
}
window.copyText = copyText;

// Helper to build standard input/output UI
function ui(html){ const c=$('toolContainer'); if(!c) return; c.innerHTML=html;
  c.querySelectorAll('input,select,textarea').forEach((el,i)=>{ if(!el.id) el.id='tc_f'+i;
    const g=el.closest('.form-group'), l=g&&g.querySelector('label');
    if(l&&!l.htmlFor&&!l.contains(el)) l.htmlFor=el.id;
    else if(!(l&&(l.htmlFor===el.id||l.contains(el)))&&!el.getAttribute('aria-label')) el.setAttribute('aria-label',(el.placeholder||(g&&g.textContent.trim())||el.id).slice(0,60)); }); }


// Cost add-on: turns a quantity into a budget. Prices are editable defaults —
// typical US figures, not quotes; every supplier differs.
function costUI(id, unit, def, note){
  return `<div class="cost-addon" style="margin-top:18px;padding:14px;border:1px solid var(--border);border-radius:10px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end;">
      <div class="form-group" style="margin:0;"><label for="${id}_price">Your price ${unit}</label>
        <input type="number" id="${id}_price" value="${def}" min="0" step="0.01" oninput="RUN()"></div>
      <div class="stat-box" style="margin:0;"><strong id="${id}_cost">—</strong><span>Estimated material cost</span></div>
    </div>
    <p style="font-size:.82rem;color:var(--text-muted);margin:10px 0 0;">${note} Materials only — delivery, tools and labour are extra.</p>
  </div>`;
}
function costOut(id, qty){
  const p = +$(id+'_price').value || 0;
  const el = $(id+'_cost'); if(!el) return;
  el.textContent = (qty > 0 && p > 0)
    ? '$' + (qty*p).toLocaleString('en-US', {maximumFractionDigits:0})
    : '—';
}

const IMPL = {

  // ─── WORD / CHARACTER COUNTER (also line, sentence, paragraph, string length) ───
  wordCounter(){
    ui(`
      <textarea class="tool-input-area" id="t_in" placeholder="Type or paste your text here…" rows="9" style="min-height:200px;"></textarea>
      <div class="tool-stats">
        <div class="stat-box"><strong id="s_words">0</strong><span>Words</span></div>
        <div class="stat-box"><strong id="s_chars">0</strong><span>Characters</span></div>
        <div class="stat-box"><strong id="s_charsns">0</strong><span>No Spaces</span></div>
        <div class="stat-box"><strong id="s_sent">0</strong><span>Sentences</span></div>
        <div class="stat-box"><strong id="s_para">0</strong><span>Paragraphs</span></div>
        <div class="stat-box"><strong id="s_lines">0</strong><span>Lines</span></div>
        <div class="stat-box"><strong id="s_read">0 min</strong><span>Read Time</span></div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-outline" onclick="document.getElementById('t_in').value='';document.getElementById('t_in').dispatchEvent(new Event('input'))">🗑️ Clear</button>
      </div>`);
    const a=$('t_in');
    function upd(){
      const t=a.value;
      const words=t.trim()?t.trim().split(/\s+/).length:0;
      $('s_words').textContent=words.toLocaleString();
      $('s_chars').textContent=t.length.toLocaleString();
      $('s_charsns').textContent=t.replace(/\s/g,'').length.toLocaleString();
      $('s_sent').textContent=(t.trim()?t.split(/[.!?]+/).filter(s=>s.trim()).length:0).toLocaleString();
      $('s_para').textContent=(t.trim()?t.split(/\n\s*\n/).filter(p=>p.trim()).length:0).toLocaleString();
      $('s_lines').textContent=(t?t.split(/\n/).length:0).toLocaleString();
      $('s_read').textContent=Math.ceil(words/200)+' min';
    }
    a.addEventListener('input',upd); upd();
  },

  // ─── CASE CONVERTER ───
  caseConverter(){
    ui(`
      <textarea class="tool-input-area" id="t_in" placeholder="Type or paste text here…" rows="5"></textarea>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:14px 0;">
        <button class="btn btn-primary" onclick="CC('upper')">UPPERCASE</button>
        <button class="btn btn-outline" onclick="CC('lower')">lowercase</button>
        <button class="btn btn-outline" onclick="CC('title')">Title Case</button>
        <button class="btn btn-outline" onclick="CC('sentence')">Sentence case</button>
        <button class="btn btn-outline" onclick="CC('camel')">camelCase</button>
        <button class="btn btn-outline" onclick="CC('snake')">snake_case</button>
        <button class="btn btn-outline" onclick="CC('kebab')">kebab-case</button>
        <button class="btn btn-outline" onclick="CC('alt')">aLtErNaTe</button>
      </div>
      <textarea class="tool-output-area" id="t_out" readonly rows="5"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.CC=function(type){
      const t=$('t_in').value; let r='';
      switch(type){
        case 'upper':r=t.toUpperCase();break;
        case 'lower':r=t.toLowerCase();break;
        case 'title':r=t.replace(/\b\w/g,c=>c.toUpperCase());break;
        case 'sentence':r=t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g,c=>c.toUpperCase());break;
        case 'camel':r=t.toLowerCase().replace(/[^a-z0-9]+(.)/g,(m,c)=>c.toUpperCase());break;
        case 'snake':r=t.trim().toLowerCase().replace(/\s+/g,'_');break;
        case 'kebab':r=t.trim().toLowerCase().replace(/\s+/g,'-');break;
        case 'alt':r=t.split('').map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join('');break;
      }
      $('t_out').value=r;
    };
  },

  // ─── LOREM IPSUM ───
  lorem(){
    const W='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div class="form-group"><label>Type</label><select id="l_type"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div>
        <div class="form-group"><label>Count</label><input type="number" id="l_count" value="3" min="1" max="50"></div>
      </div>
      <button class="btn btn-primary" onclick="LO()">✨ Generate</button>
      <textarea class="tool-output-area" id="t_out" readonly rows="10" style="margin-top:14px;min-height:220px;"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    const rnd=n=>Math.floor(Math.random()*n);
    const sent=()=>{const n=8+rnd(10);let s=Array.from({length:n},()=>W[rnd(W.length)]).join(' ');return s.charAt(0).toUpperCase()+s.slice(1)+'.';};
    window.LO=function(){
      const t=$('l_type').value,c=Math.min(parseInt($('l_count').value)||3,50);let r='';
      if(t==='words')r=Array.from({length:c},()=>W[rnd(W.length)]).join(' ');
      else if(t==='sentences')r=Array.from({length:c},sent).join(' ');
      else r=Array.from({length:c},()=>Array.from({length:3+rnd(3)},sent).join(' ')).join('\n\n');
      $('t_out').value=r;
    };
    LO();
  },

  // ─── TEXT REVERSER ───
  textReverser(){
    ui(io('Reverse'));
    window.RUN=()=>{ $('t_out').value=$('t_in').value.split('').reverse().join(''); };
  },

  // ─── REMOVE DUPLICATE LINES ───
  removeDuplicates(){
    ui(io('Remove Duplicates'));
    window.RUN=()=>{
      const seen=new Set(),out=[];
      $('t_in').value.split('\n').forEach(l=>{if(!seen.has(l)){seen.add(l);out.push(l);}});
      $('t_out').value=out.join('\n');
    };
  },

  // ─── TEXT REPEATER ───
  textRepeater(){
    ui(`
      <textarea class="tool-input-area" id="t_in" placeholder="Text to repeat…" rows="3"></textarea>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0;">
        <div class="form-group"><label>Times</label><input type="number" id="r_times" value="10" min="1" max="10000"></div>
        <div class="form-group"><label>Separator</label><select id="r_sep"><option value="\n">New line</option><option value=" ">Space</option><option value=", ">Comma</option><option value="">None</option></select></div>
      </div>
      <button class="btn btn-primary" onclick="RUN()">🔁 Repeat</button>
      <textarea class="tool-output-area" id="t_out" readonly rows="8" style="margin-top:14px;"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.RUN=()=>{
      const t=$('t_in').value,n=Math.min(parseInt($('r_times').value)||1,10000),sep=$('r_sep').value;
      $('t_out').value=Array(n).fill(t).join(sep);
    };
  },

  // ─── WHITESPACE / LINE BREAK REMOVER ───
  whitespaceRemover(){
    ui(`
      <textarea class="tool-input-area" id="t_in" placeholder="Paste messy text…" rows="6"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0;">
        <button class="btn btn-primary" onclick="WS('spaces')">Trim Extra Spaces</button>
        <button class="btn btn-outline" onclick="WS('breaks')">Remove Line Breaks</button>
        <button class="btn btn-outline" onclick="WS('blank')">Remove Blank Lines</button>
        <button class="btn btn-outline" onclick="WS('all')">Clean All</button>
      </div>
      <textarea class="tool-output-area" id="t_out" readonly rows="6"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.WS=function(m){
      let t=$('t_in').value;
      if(m==='spaces'||m==='all')t=t.replace(/[ \t]+/g,' ').replace(/^ +| +$/gm,'');
      if(m==='breaks')t=t.replace(/\r?\n/g,' ').replace(/\s+/g,' ').trim();
      if(m==='blank'||m==='all')t=t.replace(/\n\s*\n+/g,'\n').trim();
      $('t_out').value=t;
    };
  },

  // ─── FIND & REPLACE ───
  findReplace(){
    ui(`
      <textarea class="tool-input-area" id="t_in" placeholder="Paste your text…" rows="6"></textarea>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0;">
        <div class="form-group"><label>Find</label><input type="text" id="fr_find" placeholder="word to find"></div>
        <div class="form-group"><label>Replace with</label><input type="text" id="fr_rep" placeholder="replacement"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;margin-bottom:14px;"><input type="checkbox" id="fr_case"> Case sensitive</label>
      <button class="btn btn-primary" onclick="RUN()">🔎 Replace All</button>
      <textarea class="tool-output-area" id="t_out" readonly rows="6" style="margin-top:14px;"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.RUN=()=>{
      const f=$('fr_find').value;if(!f)return;
      const flags=$('fr_case').checked?'g':'gi';
      const esc=f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      $('t_out').value=$('t_in').value.replace(new RegExp(esc,flags),$('fr_rep').value);
    };
  },

  // ─── WORD FREQUENCY ───
  wordFrequency(){
    ui(`
      <textarea class="tool-input-area" id="t_in" placeholder="Paste text to analyze…" rows="6"></textarea>
      <button class="btn btn-primary" onclick="RUN()" style="margin:14px 0;">📊 Analyze</button>
      <div id="t_out" style="font-size:.9rem;"></div>`);
    window.RUN=()=>{
      const words=$('t_in').value.toLowerCase().match(/\b[a-z']+\b/g)||[];
      const freq={};words.forEach(w=>freq[w]=(freq[w]||0)+1);
      const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,30);
      const max=sorted.length?sorted[0][1]:1;
      $('t_out').innerHTML=sorted.map(([w,c])=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><span style="width:120px;font-weight:600;">${w}</span><div class="progress" style="flex:1;"><div class="progress-bar" style="width:${c/max*100}%;"></div></div><span style="width:40px;text-align:right;">${c}</span></div>`).join('')||'<p class="text-gray">No words found.</p>';
    };
  },

  // ─── JSON FORMATTER ───
  jsonFormatter(){
    ui(`
      <div id="t_msg" class="alert" style="display:none;"></div>
      <div class="tool-row">
        <div class="tool-col"><label>Input JSON</label><textarea class="tool-input-area" id="t_in" placeholder='{"name":"John","age":30}' rows="11" style="min-height:240px;font-family:monospace;font-size:.85rem;"></textarea></div>
        <div class="tool-col"><label>Output</label><textarea class="tool-output-area" id="t_out" readonly rows="11" style="min-height:240px;font-size:.85rem;"></textarea></div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="JF(2)">✨ Beautify</button>
        <button class="btn btn-outline" onclick="JF(0)">🗜️ Minify</button>
        <button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button>
      </div>`);
    window.JF=function(indent){
      const m=$('t_msg');
      try{
        const p=JSON.parse($('t_in').value);
        $('t_out').value=JSON.stringify(p,null,indent);
        m.className='alert alert-success';m.textContent='✅ Valid JSON';m.style.display='flex';
      }catch(e){
        m.className='alert alert-error';m.textContent='❌ Invalid JSON: '+e.message;m.style.display='flex';
      }
    };
  },

  // ─── BASE64 ───
  base64(){
    ui(io2('Encode to Base64','Decode from Base64'));
    window.E=()=>{try{$('t_out').value=btoa(unescape(encodeURIComponent($('t_in').value)));}catch(e){$('t_out').value='Error: '+e.message;}};
    window.D=()=>{try{$('t_out').value=decodeURIComponent(escape(atob($('t_in').value.trim())));}catch(e){$('t_out').value='Error: invalid Base64';}};
  },

  // ─── URL ENCODER ───
  urlEncoder(){
    ui(io2('Encode URL','Decode URL'));
    window.E=()=>{$('t_out').value=encodeURIComponent($('t_in').value);};
    window.D=()=>{try{$('t_out').value=decodeURIComponent($('t_in').value);}catch(e){$('t_out').value='Error: invalid URI';}};
  },

  // ─── HTML ENCODER ───
  htmlEncoder(){
    ui(io2('Encode HTML','Decode HTML'));
    window.E=()=>{const d=document.createElement('div');d.textContent=$('t_in').value;$('t_out').value=d.innerHTML;};
    window.D=()=>{const d=document.createElement('div');d.innerHTML=$('t_in').value;$('t_out').value=d.textContent;};
  },

  // ─── HASH GENERATOR ───
  hashGenerator(){
    ui(`
      <textarea class="tool-input-area" id="t_in" placeholder="Enter text to hash…" rows="4"></textarea>
      <button class="btn btn-primary" onclick="RUN()" style="margin:14px 0;">#️⃣ Generate SHA-256</button>
      <textarea class="tool-output-area" id="t_out" readonly rows="3" style="word-break:break-all;"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.RUN=async()=>{
      const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode($('t_in').value));
      $('t_out').value=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    };
  },

  // ─── UUID GENERATOR ───
  uuidGenerator(){
    ui(`
      <div class="form-group" style="max-width:200px;"><label>How many?</label><input type="number" id="u_n" value="5" min="1" max="100"></div>
      <button class="btn btn-primary" onclick="RUN()" style="margin:14px 0;">🆔 Generate UUIDs</button>
      <textarea class="tool-output-area" id="t_out" readonly rows="6"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.RUN=()=>{
      const n=Math.min(parseInt($('u_n').value)||1,100);
      $('t_out').value=Array.from({length:n},()=>crypto.randomUUID()).join('\n');
    };
    RUN();
  },

  // ─── PASSWORD GENERATOR ───
  passwordGenerator(){
    ui(`
      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <input type="text" id="p_out" readonly style="flex:1;border:1.5px solid var(--border);border-radius:8px;padding:14px;font-family:monospace;font-size:1rem;background:var(--gray-light);">
        <button class="btn btn-primary" onclick="copyText(document.getElementById('p_out').value,this)">📋</button>
        <button class="btn btn-outline" onclick="PW()">🔄</button>
      </div>
      <div class="progress" style="margin-bottom:6px;"><div class="progress-bar" id="p_bar" style="width:0;"></div></div>
      <div style="font-size:.82rem;color:var(--gray);margin-bottom:16px;" id="p_lbl">—</div>
      <label style="display:flex;justify-content:space-between;font-size:.85rem;font-weight:600;margin-bottom:6px;">Length <span class="range-val" id="p_lv">16</span></label>
      <input type="range" id="p_len" min="4" max="64" value="16" oninput="document.getElementById('p_lv').textContent=this.value;PW()" style="margin-bottom:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <label style="display:flex;gap:8px;font-size:.9rem;background:var(--gray-light);padding:12px;border-radius:8px;"><input type="checkbox" id="p_u" checked onchange="PW()"> Uppercase</label>
        <label style="display:flex;gap:8px;font-size:.9rem;background:var(--gray-light);padding:12px;border-radius:8px;"><input type="checkbox" id="p_l" checked onchange="PW()"> Lowercase</label>
        <label style="display:flex;gap:8px;font-size:.9rem;background:var(--gray-light);padding:12px;border-radius:8px;"><input type="checkbox" id="p_n" checked onchange="PW()"> Numbers</label>
        <label style="display:flex;gap:8px;font-size:.9rem;background:var(--gray-light);padding:12px;border-radius:8px;"><input type="checkbox" id="p_s" checked onchange="PW()"> Symbols</label>
      </div>
      <button class="btn btn-primary" onclick="PW()">🔑 Generate Password</button>`);
    window.PW=function(){
      const len=parseInt($('p_len').value)||16;let chars='';
      if($('p_u').checked)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if($('p_l').checked)chars+='abcdefghijklmnopqrstuvwxyz';
      if($('p_n').checked)chars+='0123456789';
      if($('p_s').checked)chars+='!@#$%^&*()_+-=[]{}|;:,.<>?';
      if(!chars)chars='abcdefghijklmnopqrstuvwxyz';
      const arr=new Uint32Array(len);crypto.getRandomValues(arr);
      let pw='';for(let i=0;i<len;i++)pw+=chars[arr[i]%chars.length];
      $('p_out').value=pw;
      let s=0;if(pw.length>=12)s++;if(pw.length>=16)s++;if(/[A-Z]/.test(pw))s++;if(/[a-z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;
      const L=[['16%','#EF4444','Very Weak'],['32%','#F97316','Weak'],['50%','#EAB308','Fair'],['68%','#84CC16','Good'],['84%','#22C55E','Strong'],['100%','#10B981','Very Strong']][Math.min(s,5)];
      $('p_bar').style.width=L[0];$('p_bar').style.background=L[1];$('p_lbl').textContent=L[2];
    };
    PW();
  },

  // ─── PASSWORD STRENGTH ───
  passwordStrength(){
    ui(`
      <div class="form-group"><label>Enter a password to test</label><input type="text" id="t_in" placeholder="type a password…"></div>
      <div class="progress" style="margin:14px 0 6px;"><div class="progress-bar" id="p_bar" style="width:0;"></div></div>
      <div style="font-weight:600;" id="p_lbl">—</div>
      <div id="p_tips" style="font-size:.85rem;color:var(--gray);margin-top:12px;"></div>`);
    $('t_in').addEventListener('input',function(){
      const pw=this.value;let s=0;const tips=[];
      if(pw.length>=12)s++;else tips.push('Use at least 12 characters');
      if(pw.length>=16)s++;
      if(/[A-Z]/.test(pw))s++;else tips.push('Add uppercase letters');
      if(/[a-z]/.test(pw))s++;
      if(/[0-9]/.test(pw))s++;else tips.push('Add numbers');
      if(/[^A-Za-z0-9]/.test(pw))s++;else tips.push('Add symbols');
      const L=[['16%','#EF4444','Very Weak'],['32%','#F97316','Weak'],['50%','#EAB308','Fair'],['68%','#84CC16','Good'],['84%','#22C55E','Strong'],['100%','#10B981','Very Strong']][Math.min(s,5)];
      $('p_bar').style.width=pw?L[0]:'0';$('p_bar').style.background=L[1];$('p_lbl').textContent=pw?L[2]:'—';
      $('p_tips').innerHTML=tips.length?'💡 '+tips.join(' · '):'✅ Great password!';
    });
  },

  // ─── RANDOM NUMBER ───
  randomNumber(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px;">
        <div class="form-group"><label>Min</label><input type="number" id="r_min" value="1"></div>
        <div class="form-group"><label>Max</label><input type="number" id="r_max" value="100"></div>
        <div class="form-group"><label>Count</label><input type="number" id="r_n" value="1" min="1" max="1000"></div>
      </div>
      <button class="btn btn-primary" onclick="RUN()">🎲 Generate</button>
      <div id="t_out" style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary);text-align:center;margin-top:20px;padding:20px;background:var(--primary-light);border-radius:12px;"></div>`);
    window.RUN=()=>{
      const min=parseInt($('r_min').value),max=parseInt($('r_max').value),n=Math.min(parseInt($('r_n').value)||1,1000);
      const arr=Array.from({length:n},()=>min+Math.floor(Math.random()*(max-min+1)));
      $('t_out').textContent=arr.join(', ');
    };
    RUN();
  },

  // ─── COLOR CONVERTER / PICKER / RGB-HEX ───
  colorConverter(){
    ui(`
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
        <input type="color" id="c_pick" value="#0057FF" style="width:80px;height:80px;border:none;border-radius:12px;cursor:pointer;">
        <div id="c_preview" style="flex:1;min-width:120px;height:80px;border-radius:12px;background:#0057FF;"></div>
      </div>
      <div class="form-group"><label>HEX</label><div style="display:flex;gap:8px;"><input type="text" id="c_hex" value="#0057FF"><button class="btn btn-outline" onclick="copyText(document.getElementById('c_hex').value,this)">📋</button></div></div>
      <div class="form-group"><label>RGB</label><div style="display:flex;gap:8px;"><input type="text" id="c_rgb" readonly><button class="btn btn-outline" onclick="copyText(document.getElementById('c_rgb').value,this)">📋</button></div></div>
      <div class="form-group"><label>HSL</label><div style="display:flex;gap:8px;"><input type="text" id="c_hsl" readonly><button class="btn btn-outline" onclick="copyText(document.getElementById('c_hsl').value,this)">📋</button></div></div>`);
    function h2r(h){const m=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:null;}
    function r2h(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h,s,l=(mx+mn)/2;if(mx===mn)h=s=0;else{const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;}h/=6;}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
    function upd(hex){const rgb=h2r(hex);if(!rgb)return;const hsl=r2h(rgb.r,rgb.g,rgb.b);$('c_preview').style.background=hex;$('c_hex').value=hex.toUpperCase();$('c_rgb').value=`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;$('c_hsl').value=`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;}
    $('c_pick').addEventListener('input',e=>upd(e.target.value));
    $('c_hex').addEventListener('input',e=>{if(h2r(e.target.value)){$('c_pick').value=e.target.value;upd(e.target.value);}});
    upd('#0057FF');
  },
  colorPicker(){ IMPL.colorConverter(); },

  // ─── TEMPERATURE ───
  temperature(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Celsius °C</label><input type="number" id="tc" value="0" oninput="TT('c')"></div>
        <div class="form-group"><label>Fahrenheit °F</label><input type="number" id="tf" value="32" oninput="TT('f')"></div>
        <div class="form-group"><label>Kelvin K</label><input type="number" id="tk" value="273.15" oninput="TT('k')"></div>
      </div>`);
    const _c=$('toolContainer'),_pv=_c&&_c.getAttribute('data-value'),_pf=_c&&_c.getAttribute('data-from');
    window.TT=function(src){
      let c;
      if(src==='c')c=parseFloat($('tc').value);
      else if(src==='f')c=(parseFloat($('tf').value)-32)*5/9;
      else c=parseFloat($('tk').value)-273.15;
      if(isNaN(c))return;
      if(src!=='c')$('tc').value=Math.round(c*100)/100;
      if(src!=='f')$('tf').value=Math.round((c*9/5+32)*100)/100;
      if(src!=='k')$('tk').value=Math.round((c+273.15)*100)/100;
    };
    if(_pv!==null&&_pv!==''){const id=_pf==='f'?'tf':'tc';$(id).value=_pv;TT(_pf==='f'?'f':'c');}
  },

  // ─── NUMBER BASE ───
  numberBase(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Decimal (Base 10)</label><input type="text" id="nb_dec" placeholder="255" oninput="NB('dec')"></div>
        <div class="form-group"><label>Binary (Base 2)</label><input type="text" id="nb_bin" placeholder="11111111" oninput="NB('bin')"></div>
        <div class="form-group"><label>Hexadecimal (Base 16)</label><input type="text" id="nb_hex" placeholder="FF" oninput="NB('hex')"></div>
        <div class="form-group"><label>Octal (Base 8)</label><input type="text" id="nb_oct" placeholder="377" oninput="NB('oct')"></div>
      </div>`);
    window.NB=function(src){
      let n;
      try{
        if(src==='dec')n=parseInt($('nb_dec').value,10);
        else if(src==='bin')n=parseInt($('nb_bin').value,2);
        else if(src==='hex')n=parseInt($('nb_hex').value,16);
        else n=parseInt($('nb_oct').value,8);
      }catch(e){return;}
      if(isNaN(n))return;
      if(src!=='dec')$('nb_dec').value=n.toString(10);
      if(src!=='bin')$('nb_bin').value=n.toString(2);
      if(src!=='hex')$('nb_hex').value=n.toString(16).toUpperCase();
      if(src!=='oct')$('nb_oct').value=n.toString(8);
    };
  },

  // ─── ROMAN NUMERAL ───
  romanNumeral(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Number</label><input type="number" id="rn_num" placeholder="2024" min="1" max="3999" oninput="RN('num')"></div>
        <div class="form-group"><label>Roman Numeral</label><input type="text" id="rn_rom" placeholder="MMXXIV" oninput="RN('rom')"></div>
      </div>`);
    const map=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    window.RN=function(src){
      if(src==='num'){let n=parseInt($('rn_num').value);if(isNaN(n)||n<1||n>3999){$('rn_rom').value='';return;}let r='';for(const[v,s]of map){while(n>=v){r+=s;n-=v;}}$('rn_rom').value=r;}
      else{const s=$('rn_rom').value.toUpperCase();let i=0,n=0;for(const[v,sym]of map){while(s.substr(i,sym.length)===sym){n+=v;i+=sym.length;}}$('rn_num').value=n||'';}
    };
  },

  // ─── META TAG / OPEN GRAPH ───
  metaTag(){
    ui(`
      <div class="form-group"><label>Page Title</label><input type="text" id="m_title" placeholder="My Awesome Page" oninput="MT()"></div>
      <div class="form-group"><label>Description</label><textarea id="m_desc" rows="2" placeholder="A short description…" oninput="MT()"></textarea></div>
      <div class="form-group"><label>URL</label><input type="text" id="m_url" placeholder="https://example.com" oninput="MT()"></div>
      <div class="form-group"><label>Image URL</label><input type="text" id="m_img" placeholder="https://example.com/image.png" oninput="MT()"></div>
      <label style="font-size:.85rem;font-weight:600;">Generated Meta Tags</label>
      <textarea class="tool-output-area" id="t_out" readonly rows="9" style="font-size:.8rem;"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.MT=function(){
      const t=$('m_title').value,d=$('m_desc').value,u=$('m_url').value,i=$('m_img').value;
      $('t_out').value=`<title>${t}</title>
<meta name="description" content="${d}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${u}">
<meta property="og:image" content="${i}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">`;
    };
    MT();
  },

  // ─── SLUG GENERATOR ───
  slugGenerator(){
    ui(`
      <div class="form-group"><label>Title or Phrase</label><input type="text" id="t_in" placeholder="My Awesome Blog Post Title!" oninput="RUN()"></div>
      <div class="form-group"><label>URL Slug</label><div style="display:flex;gap:8px;"><input type="text" id="t_out" readonly><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋</button></div></div>`);
    window.RUN=()=>{$('t_out').value=$('t_in').value.toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'');};
  },

  // ─── KEYWORD DENSITY ───
  keywordDensity(){ IMPL.wordFrequency(); },

  // ─── ROBOTS.TXT ───
  robotsTxt(){
    ui(`
      <div class="form-group"><label>Sitemap URL</label><input type="text" id="rb_site" placeholder="https://example.com/sitemap.xml" oninput="RUN()"></div>
      <label style="display:flex;gap:8px;font-size:.9rem;margin-bottom:14px;"><input type="checkbox" id="rb_all" checked onchange="RUN()"> Allow all crawlers</label>
      <textarea class="tool-output-area" id="t_out" readonly rows="6"></textarea>
      <div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.RUN=()=>{
      const s=$('rb_site').value,all=$('rb_all').checked;
      $('t_out').value=`User-agent: *\n${all?'Allow: /':'Disallow: /'}\n${s?'\nSitemap: '+s:''}`;
    };
    RUN();
  },

  // ─── UTM BUILDER ───
  utmBuilder(){
    ui(`
      <div class="form-group"><label>Website URL</label><input type="text" id="u_url" placeholder="https://example.com" oninput="RUN()"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Source</label><input type="text" id="u_src" placeholder="google" oninput="RUN()"></div>
        <div class="form-group"><label>Medium</label><input type="text" id="u_med" placeholder="cpc" oninput="RUN()"></div>
        <div class="form-group"><label>Campaign</label><input type="text" id="u_cmp" placeholder="spring_sale" oninput="RUN()"></div>
        <div class="form-group"><label>Term (optional)</label><input type="text" id="u_trm" placeholder="keyword" oninput="RUN()"></div>
      </div>
      <label style="font-size:.85rem;font-weight:600;">Tracking URL</label>
      <div style="display:flex;gap:8px;"><input type="text" id="t_out" readonly style="flex:1;border:1.5px solid var(--border);border-radius:8px;padding:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋</button></div>`);
    window.RUN=()=>{
      const u=$('u_url').value;if(!u){$('t_out').value='';return;}
      const p=[];if($('u_src').value)p.push('utm_source='+encodeURIComponent($('u_src').value));
      if($('u_med').value)p.push('utm_medium='+encodeURIComponent($('u_med').value));
      if($('u_cmp').value)p.push('utm_campaign='+encodeURIComponent($('u_cmp').value));
      if($('u_trm').value)p.push('utm_term='+encodeURIComponent($('u_trm').value));
      $('t_out').value=u+(p.length?(u.includes('?')?'&':'?')+p.join('&'):'');
    };
  },

  // ─── PERCENTAGE ───
  percentage(){
    ui(`
      <div class="tabs-container">
        <div class="tabs">
          <button class="tab active">% of number</button>
          <button class="tab">X is what % of Y</button>
          <button class="tab">% change</button>
        </div>
        <div class="tab-panel active">
          <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
            <div class="form-group"><label>What is</label><input type="number" id="pa_p" value="20" oninput="PA()"></div>
            <span style="padding-bottom:12px;">% of</span>
            <div class="form-group"><label>Number</label><input type="number" id="pa_n" value="150" oninput="PA()"></div>
          </div>
          <div class="tool-result-bar" id="pa_r"></div>
        </div>
        <div class="tab-panel">
          <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
            <div class="form-group"><label>Value</label><input type="number" id="pb_x" value="30" oninput="PB()"></div>
            <span style="padding-bottom:12px;">is what % of</span>
            <div class="form-group"><label>Total</label><input type="number" id="pb_y" value="150" oninput="PB()"></div>
          </div>
          <div class="tool-result-bar" id="pb_r"></div>
        </div>
        <div class="tab-panel">
          <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
            <div class="form-group"><label>From</label><input type="number" id="pc_a" value="100" oninput="PC()"></div>
            <span style="padding-bottom:12px;">to</span>
            <div class="form-group"><label>To</label><input type="number" id="pc_b" value="125" oninput="PC()"></div>
          </div>
          <div class="tool-result-bar" id="pc_r"></div>
        </div>
      </div>`);
    initTabsIn($('toolContainer'));
    const _pc=$('toolContainer');if(_pc&&_pc.getAttribute('data-p')){$('pa_p').value=_pc.getAttribute('data-p');$('pa_n').value=_pc.getAttribute('data-n');}
    window.PA=()=>{$('pa_r').textContent=`${$('pa_p').value}% of ${$('pa_n').value} = ${(($('pa_p').value*$('pa_n').value)/100).toLocaleString()}`;};
    window.PB=()=>{const r=($('pb_x').value/$('pb_y').value*100);$('pb_r').textContent=`${$('pb_x').value} is ${isFinite(r)?r.toFixed(2):0}% of ${$('pb_y').value}`;};
    window.PC=()=>{const a=parseFloat($('pc_a').value),b=parseFloat($('pc_b').value),r=((b-a)/a*100);$('pc_r').textContent=`Change: ${isFinite(r)?(r>0?'+':'')+r.toFixed(2):0}% (${r>=0?'increase':'decrease'})`;};
    PA();PB();PC();
  },

  // ─── AVERAGE ───
  average(){
    ui(`
      <div class="form-group"><label>Numbers (comma, space or newline separated)</label><textarea class="tool-input-area" id="t_in" placeholder="10, 20, 30, 40" rows="4" oninput="RUN()"></textarea></div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="a_avg">0</strong><span>Average</span></div>
        <div class="stat-box"><strong id="a_sum">0</strong><span>Sum</span></div>
        <div class="stat-box"><strong id="a_cnt">0</strong><span>Count</span></div>
        <div class="stat-box"><strong id="a_min">0</strong><span>Min</span></div>
        <div class="stat-box"><strong id="a_max">0</strong><span>Max</span></div>
      </div>`);
    window.RUN=()=>{
      const nums=($('t_in').value.match(/-?\d+\.?\d*/g)||[]).map(Number);
      if(!nums.length){['a_avg','a_sum','a_cnt','a_min','a_max'].forEach(i=>$(i).textContent='0');return;}
      const sum=nums.reduce((a,b)=>a+b,0);
      $('a_avg').textContent=(sum/nums.length).toLocaleString(undefined,{maximumFractionDigits:4});
      $('a_sum').textContent=sum.toLocaleString();$('a_cnt').textContent=nums.length;
      $('a_min').textContent=Math.min(...nums);$('a_max').textContent=Math.max(...nums);
    };
  },

  // ─── BMI ───
  bmi(){
    ui(`
      <div class="tabs-container"><div class="tabs"><button class="tab active">Metric</button><button class="tab">Imperial</button></div>
        <div class="tab-panel active">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div class="form-group"><label>Height (cm)</label><input type="number" id="bm_h" value="170" oninput="BM('m')"></div>
            <div class="form-group"><label>Weight (kg)</label><input type="number" id="bm_w" value="70" oninput="BM('m')"></div>
          </div>
        </div>
        <div class="tab-panel">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
            <div class="form-group"><label>Feet</label><input type="number" id="bi_ft" value="5" oninput="BM('i')"></div>
            <div class="form-group"><label>Inches</label><input type="number" id="bi_in" value="7" oninput="BM('i')"></div>
            <div class="form-group"><label>Pounds</label><input type="number" id="bi_lb" value="154" oninput="BM('i')"></div>
          </div>
        </div>
      </div>
      <div class="tool-result-bar" id="bm_r" style="font-size:1.1rem;"></div>`);
    initTabsIn($('toolContainer'));
    window.BM=function(sys){
      let bmi;
      if(sys==='m'){const h=$('bm_h').value/100;bmi=$('bm_w').value/(h*h);}
      else{const tin=parseInt($('bi_ft').value)*12+parseInt($('bi_in').value);bmi=703*$('bi_lb').value/(tin*tin);}
      if(!isFinite(bmi)||isNaN(bmi)){$('bm_r').textContent='';return;}
      let cat=bmi<18.5?'Underweight':bmi<25?'Normal weight':bmi<30?'Overweight':'Obese';
      $('bm_r').innerHTML=`Your BMI: <strong>${bmi.toFixed(1)}</strong> — ${cat}`;
    };
    BM('m');
  },

  // ─── AGE CALCULATOR ───
  ageCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Date of Birth</label><input type="date" id="ag_dob" oninput="RUN()"></div>
        <div class="form-group"><label>Age at Date</label><input type="date" id="ag_to" oninput="RUN()"></div>
      </div>
      <div class="tool-result-bar" id="t_out" style="font-size:1.05rem;"></div>`);
    $('ag_to').value=new Date().toISOString().slice(0,10);
    window.RUN=()=>{
      const dob=new Date($('ag_dob').value),to=new Date($('ag_to').value);
      if(isNaN(dob)||isNaN(to)||dob>to){$('t_out').textContent='';return;}
      let y=to.getFullYear()-dob.getFullYear(),m=to.getMonth()-dob.getMonth(),d=to.getDate()-dob.getDate();
      if(d<0){m--;d+=new Date(to.getFullYear(),to.getMonth(),0).getDate();}
      if(m<0){y--;m+=12;}
      const days=Math.floor((to-dob)/864e5);
      $('t_out').innerHTML=`<strong>${y}</strong> years, <strong>${m}</strong> months, <strong>${d}</strong> days &nbsp;·&nbsp; ${days.toLocaleString()} total days`;
    };
  },

  // ─── LOAN / MORTGAGE ───
  loanCalc(){ loanImpl('Loan'); },
  mortgageCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Home price ($)</label><input type="number" id="mg_price" value="400000" min="0" step="1000" oninput="RUN()"></div>
        <div class="form-group"><label>Down payment (%)</label><input type="number" id="mg_down" value="20" min="0" max="100" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Interest rate (% APR)</label><input type="number" id="mg_rate" value="6.5" min="0" step="0.05" oninput="RUN()"></div>
        <div class="form-group"><label>Loan term</label><select id="mg_term" onchange="RUN()"><option value="30" selected>30 years</option><option value="20">20 years</option><option value="15">15 years</option><option value="10">10 years</option></select></div>
        <div class="form-group"><label>Property tax (% of price per year)</label><input type="number" id="mg_tax" value="1" min="0" step="0.05" oninput="RUN()"></div>
        <div class="form-group"><label>Home insurance ($ per year)</label><input type="number" id="mg_ins" value="1800" min="0" step="50" oninput="RUN()"></div>
        <div class="form-group"><label>PMI (% of loan per year)</label><input type="number" id="mg_pmi" value="0.5" min="0" step="0.05" oninput="RUN()"></div>
        <div class="form-group"><label>HOA dues ($ per month)</label><input type="number" id="mg_hoa" value="0" min="0" step="10" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="mg_total">—</strong><span>Monthly payment</span></div>
        <div class="stat-box"><strong id="mg_pi">—</strong><span>Principal &amp; interest</span></div>
        <div class="stat-box"><strong id="mg_loan">—</strong><span>Loan amount</span></div>
        <div class="stat-box"><strong id="mg_int">—</strong><span>Total interest</span></div>
      </div>
      <div class="tool-stats" style="margin-top:8px;">
        <div class="stat-box"><strong id="mg_t">—</strong><span>Tax / month</span></div>
        <div class="stat-box"><strong id="mg_i">—</strong><span>Insurance / month</span></div>
        <div class="stat-box"><strong id="mg_p">—</strong><span>PMI / month</span></div>
        <div class="stat-box"><strong id="mg_h">—</strong><span>HOA / month</span></div>
      </div>
      <p class="tool-note" id="mg_note">—</p>
      <details><summary>Show the amortization schedule (by year)</summary>
        <div class="ref-wrap"><table class="ref-table"><thead><tr><th>Year</th><th>Principal paid</th><th>Interest paid</th><th>Balance</th></tr></thead><tbody id="mg_sched"></tbody></table></div>
      </details>`);
    const usd=x=>'$'+Math.round(x).toLocaleString('en-US');
    window.RUN=()=>{
      const price=+$('mg_price').value||0, down=Math.min(Math.max(+$('mg_down').value||0,0),100);
      const loan=price*(1-down/100), r=(+$('mg_rate').value||0)/100/12, n=(+$('mg_term').value||30)*12;
      const pi=loan<=0?0:(r>0?loan*r/(1-Math.pow(1+r,-n)):loan/n);
      const tax=price*(+$('mg_tax').value||0)/100/12, ins=(+$('mg_ins').value||0)/12, hoa=+$('mg_hoa').value||0;
      const pmiRate=(+$('mg_pmi').value||0)/100, needPmi=down<20&&loan>0, pmi=needPmi?loan*pmiRate/12:0;
      // amortize; PMI ends automatically once the balance reaches 78% of the original price
      let bal=loan, totInt=0, pmiMonths=0, rows='', yP=0, yI=0;
      for(let m=1;m<=n&&bal>0.005;m++){
        if(needPmi&&bal>0.78*price) pmiMonths++;
        const it=bal*r, pr=Math.min(pi-it,bal); bal-=pr; totInt+=it; yP+=pr; yI+=it;
        if(m%12===0||bal<=0.005){ rows+=`<tr><td>${Math.ceil(m/12)}</td><td>${usd(yP)}</td><td>${usd(yI)}</td><td>${usd(Math.max(bal,0))}</td></tr>`; yP=0; yI=0; }
      }
      $('mg_total').textContent=usd(pi+tax+ins+pmi+hoa);
      $('mg_pi').textContent=usd(pi); $('mg_loan').textContent=usd(loan); $('mg_int').textContent=usd(totInt);
      $('mg_t').textContent=usd(tax); $('mg_i').textContent=usd(ins); $('mg_p').textContent=usd(pmi); $('mg_h').textContent=usd(hoa);
      $('mg_sched').innerHTML=rows;
      $('mg_note').textContent='Down payment '+usd(price*down/100)+'. '+(needPmi?'PMI applies because the down payment is under 20%; in this estimate it drops off after about '+Math.round(pmiMonths/12)+' years, when the balance reaches 78% of the price. ':'No PMI at 20% or more down. ')+'Total of all '+(n)+' principal-and-interest payments: '+usd(pi*n)+'. Estimate only — your lender’s Loan Estimate is the real number.';
    };
    RUN();
  },










  // ─── DECK BOARDS ───
  deckBoardCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Deck length (ft)</label><input type="number" id="db_l" value="16" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Deck width (ft)</label><input type="number" id="db_w" value="12" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Board width (in)</label><input type="number" id="db_bw" value="5.5" min="1" step="0.25" oninput="RUN()"></div>
        <div class="form-group"><label>Gap (in)</label><input type="number" id="db_gap" value="0.25" min="0" step="0.125" oninput="RUN()"></div>
        <div class="form-group"><label>Joist spacing (in)</label><input type="number" id="db_joist" value="16" min="8" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="db_boards">26</strong><span>Boards (deck length)</span></div>
        <div class="stat-box"><strong id="db_lf">416 lin ft</strong><span>Total linear feet</span></div>
        <div class="stat-box"><strong id="db_screws">~676</strong><span>Screws (2 per joist)</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Boards run the deck length. Add 5-10% (15% diagonal). 5/4×6 boards are 5.5" wide.</p>` + costUI('db','per board','15.00','A 5/4×6×16 pressure-treated board typically runs about $12–20.') + ``);
    window.RUN=()=>{
      const l=+$('db_l').value||0,w=+$('db_w').value||0;
      const bw=+$('db_bw').value||5.5,g=+$('db_gap').value||0,js=Math.max(+$('db_joist').value||16,8);
      const rows=w>0?Math.ceil(w*12/(bw+g)):0;
      const joists=Math.floor(l*12/js)+1;
      $('db_boards').textContent=rows;
      $('db_lf').textContent=(rows*l).toFixed(0)+' lin ft';
      $('db_screws').textContent='~'+(rows*joists*2);
      costOut('db', rows);
    };
    RUN();
  },

  // ─── FIREWOOD ───
  firewoodCalc(){
    // Utah State University Forestry Extension: [species, green lb/cord, dry lb/cord, million BTU/cord]
    const SP=[['Oak, red',4888,3528,24.6],['Oak, white',5573,4200,29.1],['Oak, bur',4960,3768,26.2],['Maple (other than silver)',4685,3680,25.5],['Maple, silver',3904,2752,19],['Ash, white',3952,3472,24.2],['Ash, green',4184,2880,20],['Beech',0,3760,27.5],['Birch',4312,2992,20.8],['Cherry',3696,2928,20.4],['Locust, black',4616,4016,27.9],['Apple',4850,3888,27],['Walnut, black',4584,3192,22.2],['Elm, American',4456,2872,20],['Osage-orange',5120,4728,32.9],['Douglas-fir',3319,2970,20.7],['Pine, ponderosa',3600,2336,16.2],['Pine, white',0,2250,15.9],['Spruce',2800,2240,15.5],['Aspen',0,2160,18.2],['Cottonwood',4640,2272,15.8]];
    ui(`
      <div class="cols-keep" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Stack length (ft)</label><input type="number" id="fw_l" value="8" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Stack height (ft)</label><input type="number" id="fw_h" value="4" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Stack depth (ft)</label><input type="number" id="fw_d" value="4" min="0" step="0.25" oninput="RUN()"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Piece length (inches)</label><input type="number" id="fw_len" value="16" min="6" max="48" oninput="RUN()"></div>
        <div class="form-group"><label>Wood species</label><select id="fw_sp" onchange="RUN()">${SP.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join('')}</select></div>
        <div class="form-group"><label>Condition</label><select id="fw_dry" onchange="RUN()"><option value="1" selected>Seasoned (air-dry)</option><option value="0">Green (fresh cut)</option></select></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="fw_cords">1.00</strong><span>Full cords</span></div>
        <div class="stat-box"><strong id="fw_face">3.00</strong><span>Face cords (ricks)</span></div>
        <div class="stat-box"><strong id="fw_cuft">128</strong><span>Cubic feet (stacked)</span></div>
        <div class="stat-box"><strong id="fw_wt">—</strong><span>Approx. weight</span></div>
        <div class="stat-box"><strong id="fw_btu">—</strong><span>Heat (million BTU)</span></div>
      </div>
      <p class="tool-note" id="fw_note">1 cord = 128 cu ft stacked (4 × 4 × 8 ft). A face cord is a 4 × 8 ft stack one piece deep.</p>` + costUI('fw','per cord','325.00','Seasoned hardwood typically runs about $250–450 a cord delivered.') + ``);
    window.RUN=()=>{
      const l=+$('fw_l').value||0,hh=+$('fw_h').value||0,d=+$('fw_d').value||0;
      const cf=l*hh*d, cords=cf/128, s=SP[+$('fw_sp').value]||SP[0], dry=$('fw_dry').value==='1';
      $('fw_cords').textContent=cords.toFixed(2);
      const len=Math.max(+$('fw_len').value||16,1), fcf=32*len/12;
      $('fw_face').textContent=(cf/fcf).toFixed(2);
      $('fw_cuft').textContent=cf.toFixed(0);
      const lb=dry?s[2]:s[1];
      $('fw_wt').textContent=lb?Math.round(cords*lb).toLocaleString('en-US')+' lb':'n/a';
      $('fw_btu').textContent=dry?(cords*s[3]).toFixed(1):'season first';
      $('fw_note').textContent='A face cord of '+len+'-inch pieces is 4 × 8 ft × '+len+'″ = '+fcf.toFixed(1)+' cu ft, or '+(fcf/128).toFixed(2)+' of a full cord. Weight and heat use Utah State University Extension figures for '+s[0].toLowerCase()+'.';
      costOut('fw', cords);
    };
    RUN();
  },

  // ─── TOPSOIL ───
  topsoilCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Area (sq ft)</label><input type="number" id="ts2_area" value="100" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Depth (inches)</label><input type="number" id="ts2_depth" value="6" min="0" step="0.25" oninput="RUN()"></div>
        <div class="form-group"><label>Bag size</label><select id="ts2_bag" onchange="RUN()"><option value="0.75" selected>0.75 cu ft (≈40 lb)</option><option value="1">1 cu ft</option><option value="1.5">1.5 cu ft</option><option value="2">2 cu ft</option></select></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="ts2_yd">1.85</strong><span>Cubic yards</span></div>
        <div class="stat-box"><strong id="ts2_tons">~2.0</strong><span>Tons (approx)</span></div>
        <div class="stat-box"><strong id="ts2_bags">67</strong><span id="ts2_bagl">Bags (0.75 cu ft)</span></div>
      </div>
      <p class="tool-note">New lawns 4–6″, beds 6–12″, topdressing ¼–½″. Weight assumes about 1.1 tons per cubic yard; wet soil weighs more. Order 5–10% extra for settling.</p>` + costUI('ts2','per cubic yard','35.00','Screened topsoil typically runs about $25–45 a yard.') + ``);
    window.RUN=()=>{
      const a=+$('ts2_area').value||0, d=+$('ts2_depth').value||0, bag=+$('ts2_bag').value||0.75;
      const cf=a*d/12, yd=cf/27;
      $('ts2_yd').textContent=yd.toFixed(2);
      $('ts2_tons').textContent='~'+(yd*1.1).toFixed(1);
      $('ts2_bags').textContent=Math.ceil(cf/bag-1e-9);
      $('ts2_bagl').textContent='Bags ('+bag+' cu ft)';
      costOut('ts2', yd);
    };
    RUN();
  },

  // ─── PROPANE ───
  propaneCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Tank size</label><select id="pr_tank" onchange="RUN()">
          <option value="430000" selected>20 lb (grill standard, ~430k BTU)</option>
          <option value="645000">30 lb (~645k BTU)</option>
          <option value="860000">40 lb (~860k BTU)</option>
          <option value="2150000">100 lb (~2.15M BTU)</option>
        </select></div>
        <div class="form-group"><label>Appliance rating (BTU/hr)</label><input type="number" id="pr_btu" value="30000" min="1000" step="1000" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="pr_hours">14.3 hrs</strong><span>Burn time (full output)</span></div>
        <div class="stat-box"><strong id="pr_half">~28.7 hrs</strong><span>At half setting</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Check remaining fuel by weight: scale reading − stamped TW = propane lbs (× 21,500 BTU).</p>`);
    window.RUN=()=>{
      const tank=parseFloat($('pr_tank').value), btu=Math.max(+$('pr_btu').value||1,1);
      const hrs=tank/btu;
      $('pr_hours').textContent=hrs.toFixed(1)+' hrs';
      $('pr_half').textContent='~'+(hrs*2).toFixed(1)+' hrs';
    };
    RUN();
  },

  // ─── PAVER ───
  paverCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Area (sq ft)</label><input type="number" id="pv2_area" value="120" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Waste (%)</label><input type="number" id="pv2_waste" value="10" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Paver width (in)</label><input type="number" id="pv2_w" value="12" min="1" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Paver height (in)</label><input type="number" id="pv2_h" value="12" min="1" step="0.5" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="pv2_count">132</strong><span>Pavers to buy</span></div>
        <div class="stat-box"><strong id="pv2_base">1.5 yd³</strong><span>Base gravel (4")</span></div>
        <div class="stat-box"><strong id="pv2_sand">0.37 yd³</strong><span>Bedding sand (1")</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Section: 4-6" compacted gravel, 1" sand, pavers, edge restraint. Keep spare pavers.</p>` + costUI('pv2','per paver','3.50','Concrete pavers typically run about $2–6 each.') + ``);
    window.RUN=()=>{
      const a=+$('pv2_area').value||0, ws=+$('pv2_waste').value||0;
      const w=Math.max(+$('pv2_w').value||1,0.5), hh=Math.max(+$('pv2_h').value||1,0.5);
      const base=Math.ceil(a*144/(w*hh));
      $('pv2_count').textContent=Math.ceil(base*(1+ws/100));
      $('pv2_base').textContent=(a*4/12/27).toFixed(1)+' yd³';
      $('pv2_sand').textContent=(a*1/12/27).toFixed(2)+' yd³';
      costOut('pv2', Math.ceil(base*(1+ws/100)));
    };
    RUN();
  },

  // ─── WALLPAPER ───
  wallpaperCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Total wall length (ft)</label><input type="number" id="wp_len" value="40" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Wall height (ft)</label><input type="number" id="wp_h" value="8" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Roll type</label><select id="wp_roll" onchange="RUN()">
          <option value="28" selected>US single roll (~28 sq ft usable)</option>
          <option value="50">European roll (~50 sq ft usable)</option>
        </select></div>
        <div class="form-group"><label>Doors</label><input type="number" id="wp_d" value="1" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Windows</label><input type="number" id="wp_w" value="1" min="0" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="wp_area">284 sq ft</strong><span>Paperable area</span></div>
        <div class="stat-box"><strong id="wp_rolls">11</strong><span>Rolls to buy</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Large pattern repeats waste more — add a roll for bold repeats. Buy all rolls + 1 spare from one batch.</p>` + costUI('wp','per roll','40.00','Wallpaper typically runs about $30–60 a single roll.') + ``);
    window.RUN=()=>{
      const len=+$('wp_len').value||0,hh=+$('wp_h').value||0;
      const d=+$('wp_d').value||0,w=+$('wp_w').value||0,cov=parseFloat($('wp_roll').value);
      const area=Math.max(len*hh - d*21 - w*15, 0);
      $('wp_area').textContent=area.toFixed(0)+' sq ft';
      $('wp_rolls').textContent=area>0?Math.ceil(area/cov):0;
      costOut('wp', area>0?Math.ceil(area/cov):0);
    };
    RUN();
  },

  // ─── SOD ───
  sodCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Lawn area (sq ft)</label><input type="number" id="sd_area" value="2000" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Waste margin (%)</label><input type="number" id="sd_waste" value="10" min="0" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="sd_rolls">220</strong><span>Rolls (10 sq ft each)</span></div>
        <div class="stat-box"><strong id="sd_pallets">4.9</strong><span>Pallets (~450 sq ft)</span></div>
        <div class="stat-box"><strong id="sd_wt">~4.4 tons</strong><span>Approx. weight</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Confirm your farm\u2019s pallet size (400-500 sq ft). Prep first; lay the same day it arrives.</p>` + costUI('sd','per roll (10 sq ft)','4.50','Sod typically runs about $0.35–0.60 a square foot.') + ``);
    window.RUN=()=>{
      const a=+$('sd_area').value||0, ws=+$('sd_waste').value||0;
      const total=a*(1+ws/100);
      $('sd_rolls').textContent=Math.ceil(total/10);
      $('sd_pallets').textContent=(total/450).toFixed(1);
      $('sd_wt').textContent='~'+(Math.ceil(total/10)*40/2000).toFixed(1)+' tons';
      costOut('sd', Math.ceil(total/10));
    };
    RUN();
  },

  // ─── ROOF PITCH ───
  roofPitchCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Rise (inches per 12" run)</label><input type="number" id="rp_rise" value="6" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Footprint area (sq ft, optional)</label><input type="number" id="rp_area" value="" min="0" placeholder="1500" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="rp_deg">26.6°</strong><span>Angle</span></div>
        <div class="stat-box"><strong id="rp_factor">1.118</strong><span>Pitch factor</span></div>
        <div class="stat-box"><strong id="rp_true">—</strong><span>True roof area</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Walkable to ~6/12 with care. Shingles need ≥2/12. Add 10-15% waste for the roof style.</p>`);
    window.RUN=()=>{
      const r=+$('rp_rise').value||0, a=+$('rp_area').value||0;
      const deg=Math.atan(r/12)*180/Math.PI;
      const f=Math.sqrt(r*r+144)/12;
      $('rp_deg').textContent=deg.toFixed(1)+'°';
      $('rp_factor').textContent=f.toFixed(3);
      $('rp_true').textContent=a>0?Math.round(a*f).toLocaleString('en-US')+' sq ft':'—';
    };
    RUN();
  },

  // ─── HEAT INDEX ───
  heatIndexCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Air temperature (°F)</label><input type="number" id="hi_t" value="90" step="1" oninput="RUN()"></div>
        <div class="form-group"><label>Relative humidity (%)</label><input type="number" id="hi_r" value="70" min="0" max="100" step="1" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="hi_val">105°F</strong><span>Heat index (NWS)</span></div>
        <div class="stat-box"><strong id="hi_cat">Danger</strong><span>NWS category</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;" >Designed for ≥80°F and ≥40% RH, in shade — full sun can add up to 15°F.</p>`);
    window.RUN=()=>{
      const T=+$('hi_t').value, R=+$('hi_r').value||0;
      if(T>=80&&R>=40){
        let HI=-42.379+2.04901523*T+10.14333127*R-0.22475541*T*R-0.00683783*T*T-0.05481717*R*R+0.00122874*T*T*R+0.00085282*T*R*R-0.00000199*T*T*R*R;
        const v=Math.round(HI);
        $('hi_val').textContent=v+'°F';
        $('hi_cat').textContent=v>=125?'Extreme danger':v>=103?'Danger':v>=90?'Extreme caution':'Caution';
      } else {
        $('hi_val').textContent='N/A';
        $('hi_cat').textContent='Outside index range';
      }
    };
    RUN();
  },

  // ─── DRYWALL ───
  drywallCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Length (ft)</label><input type="number" id="dw_l" value="12" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Width (ft)</label><input type="number" id="dw_w" value="12" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Wall height (ft)</label><input type="number" id="dw_h" value="8" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Doors</label><input type="number" id="dw_d" value="1" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Windows</label><input type="number" id="dw_win" value="1" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Sheet size</label><select id="dw_sheet" onchange="RUN()">
          <option value="32" selected>4×8 (32 sq ft)</option>
          <option value="48">4×12 (48 sq ft)</option>
        </select></div>
      </div>
      <div class="form-group"><label><input type="checkbox" id="dw_ceil" checked onchange="RUN()"> Include ceiling</label></div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="dw_area">492 sq ft</strong><span>Total surface</span></div>
        <div class="stat-box"><strong id="dw_sheets">16</strong><span>Sheets needed</span></div>
        <div class="stat-box"><strong id="dw_screws">~512</strong><span>Screws (approx)</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Add 5-10% for cuts. Ceilings: 5/8" board; hang ceilings first, stagger joints.</p>` + costUI('dw','per sheet','16.00','A 4×8 sheet of 1/2″ drywall typically runs about $14–18.') + ``);
    window.RUN=()=>{
      const l=+$('dw_l').value||0,w=+$('dw_w').value||0,hh=+$('dw_h').value||0;
      const d=+$('dw_d').value||0,win=+$('dw_win').value||0,sheet=parseFloat($('dw_sheet').value);
      let area=Math.max(2*(l+w)*hh - d*21 - win*15,0);
      if($('dw_ceil').checked) area+=l*w;
      const sheets=area>0?Math.ceil(area/sheet):0;
      $('dw_area').textContent=area.toFixed(0)+' sq ft';
      $('dw_sheets').textContent=sheets;
      $('dw_screws').textContent='~'+(sheets*(sheet===32?32:48));
      costOut('dw', sheets);
    };
    RUN();
  },

  // ─── POOL VOLUME ───
  poolVolumeCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Shape</label><select id="pv_shape" onchange="PVSHAPE();RUN()">
          <option value="rect">Rectangular</option><option value="round">Round</option>
        </select></div>
        <div class="form-group"><label>Average depth (ft)</label><input type="number" id="pv_d" value="5" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group" id="pv_lwrap"><label>Length (ft)</label><input type="number" id="pv_l" value="32" min="0" oninput="RUN()"></div>
        <div class="form-group" id="pv_wwrap"><label id="pv_wlbl">Width (ft)</label><input type="number" id="pv_w" value="16" min="0" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="pv_gal">19,148</strong><span>Gallons</span></div>
        <div class="stat-box"><strong id="pv_lit">72,475</strong><span>Liters</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Sloped pools: average depth = (shallow + deep) ÷ 2. Chemical labels dose per 10,000 gallons.</p>`);
    window.PVSHAPE=()=>{
      const round=$('pv_shape').value==='round';
      $('pv_lwrap').style.display=round?'none':'';
      $('pv_wlbl').textContent=round?'Diameter (ft)':'Width (ft)';
    };
    window.RUN=()=>{
      const shape=$('pv_shape').value, d=+$('pv_d').value||0;
      let area=0;
      if(shape==='rect') area=(+$('pv_l').value||0)*(+$('pv_w').value||0);
      else { const r=(+$('pv_w').value||0)/2; area=Math.PI*r*r; }
      const gal=area*d*7.48;
      $('pv_gal').textContent=Math.round(gal).toLocaleString('en-US');
      $('pv_lit').textContent=Math.round(gal*3.785).toLocaleString('en-US');
    };
    RUN();
  },

  // ─── STAIR ───
  stairCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Total rise (inches)</label><input type="number" id="st2_rise" value="108" min="0" step="0.25" oninput="RUN()"></div>
        <div class="form-group"><label>Tread depth (inches)</label><input type="number" id="st2_tread" value="10" min="8" step="0.25" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="st2_n">14</strong><span>Risers (steps)</span></div>
        <div class="stat-box"><strong id="st2_h">7.71"</strong><span>Riser height</span></div>
        <div class="stat-box"><strong id="st2_run">130"</strong><span>Total run</span></div>
        <div class="stat-box"><strong id="st2_comfort">17.7</strong><span>Riser + tread (aim 17-18)</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">US residential code: risers ≤ 7.75", treads ≥ 10", variation ≤ 3/8". Check local amendments.</p>`);
    window.RUN=()=>{
      const rise=+$('st2_rise').value||0, tread=Math.max(+$('st2_tread').value||10,1);
      if(rise>0){
        const n=Math.ceil(rise/7.75), hh=rise/n, treads=n-1;
        $('st2_n').textContent=n;
        $('st2_h').textContent=hh.toFixed(2)+'"';
        $('st2_run').textContent=(treads*tread).toFixed(0)+'" ('+treads+' treads)';
        $('st2_comfort').textContent=(hh+tread).toFixed(1);
      }
    };
    RUN();
  },

  // ─── DOWN PAYMENT ───
  downPaymentCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Home price ($)</label><input type="number" id="dp_price" value="400000" min="0" step="1000" oninput="RUN()"></div>
        <div class="form-group"><label>Down payment (%)</label><input type="number" id="dp_pct" value="20" min="0" max="100" step="0.5" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="dp_amt">$80,000</strong><span>Down payment</span></div>
        <div class="stat-box"><strong id="dp_loan">$320,000</strong><span>Loan amount</span></div>
        <div class="stat-box"><strong id="dp_pmi">No PMI (≥20%)</strong><span>PMI status</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Budget 2-5% of price for closing costs on top. General information, not financial advice.</p>`);
    window.RUN=()=>{
      const p=+$('dp_price').value||0, pct=+$('dp_pct').value||0;
      const dpv=p*pct/100;
      $('dp_amt').textContent='$'+Math.round(dpv).toLocaleString('en-US');
      $('dp_loan').textContent='$'+Math.round(p-dpv).toLocaleString('en-US');
      $('dp_pmi').textContent=pct>=20?'No PMI (≥20%)':'PMI likely (<20%)';
    };
    RUN();
  },

  // ─── GRASS SEED ───
  grassSeedCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Lawn area (sq ft)</label><input type="number" id="gs_area" value="5000" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Seeding rate</label><select id="gs_rate" onchange="RUN()">
          <option value="8" selected>Tall fescue — new lawn (8 lb/1000)</option>
          <option value="4">Tall fescue — overseed (4 lb/1000)</option>
          <option value="3">Kentucky bluegrass — new (3 lb/1000)</option>
          <option value="9">Perennial rye — new (9 lb/1000)</option>
          <option value="2">Bermuda — new (2 lb/1000)</option>
        </select></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="gs_lbs">40.0 lbs</strong><span>Seed needed</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">If your seed bag lists a rate, use the bag&#39;s number. More than the rate grows weaker turf, not thicker.</p>` + costUI('gs','per lb of seed','5.50','Quality cool-season seed typically runs about $4–8 a pound.') + ``);
    window.RUN=()=>{
      const a=+$('gs_area').value||0, r=parseFloat($('gs_rate').value);
      $('gs_lbs').textContent=(a/1000*r).toFixed(1)+' lbs';
      costOut('gs', (a/1000*r));
    };
    RUN();
  },

  // ─── WIND CHILL ───
  windChillCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Air temperature (°F)</label><input type="number" id="wc_t" value="20" step="1" oninput="RUN()"></div>
        <div class="form-group"><label>Wind speed (mph)</label><input type="number" id="wc_v" value="15" min="0" step="1" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="wc_chill">6°F</strong><span>Wind chill (NWS)</span></div>
        <div class="stat-box"><strong id="wc_c">−14°C</strong><span>In Celsius</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Valid for ≤50°F and ≥3 mph. Frostbite: ~30 min exposed skin at −18°F chill.</p>`);
    window.RUN=()=>{
      const t=+$('wc_t').value, v=+$('wc_v').value||0;
      if(t<=50&&v>=3){
        const wc=35.74+0.6215*t-35.75*Math.pow(v,0.16)+0.4275*t*Math.pow(v,0.16);
        $('wc_chill').textContent=Math.round(wc)+'°F';
        $('wc_c').textContent=((Math.round(wc)-32)*5/9).toFixed(0).replace('-','−')+'°C';
      } else {
        $('wc_chill').textContent='N/A';
        $('wc_c').textContent='—';
      }
    };
    RUN();
  },

  // ─── GRAVEL ───
  gravelCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Area (sq ft)</label><input type="number" id="gv_area" value="100" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Depth (inches)</label><input type="number" id="gv_depth" value="3" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Tons per cubic yard</label><input type="number" id="gv_den" value="1.4" min="0.5" max="3" step="0.05" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="gv_yd">0.93</strong><span>Cubic yards</span></div>
        <div class="stat-box"><strong id="gv_tons">1.30</strong><span>Tons (approx)</span></div>
        <div class="stat-box"><strong id="gv_lb">2,593</strong><span>Pounds (approx)</span></div>
      </div>
      <p class="tool-note">Most gravel and crushed stone weighs 1.3–1.5 tons per cubic yard; ask your supplier for theirs. Depths: 2–3″ decorative, 3–4″ paths, 6–12″ driveways in layers.</p>` + costUI('gv','per ton','45.00','Crushed gravel typically runs about $30–60 a ton.') + `
      <div class="tool-sub">
        <h3>Convert tons ↔ cubic yards</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div class="form-group"><label>Amount</label><input type="number" id="gv_cv" value="10" min="0" step="0.5" oninput="RUN()"></div>
          <div class="form-group"><label>Direction</label><select id="gv_dir" onchange="RUN()"><option value="t2y" selected>Tons → cubic yards</option><option value="y2t">Cubic yards → tons</option></select></div>
        </div>
        <div class="tool-result-bar" id="gv_cvout">10 tons ≈ 7.14 cubic yards</div>
      </div>`);
    window.RUN=()=>{
      const a=+$('gv_area').value||0, d=+$('gv_depth').value||0, den=+$('gv_den').value||1.4;
      const yd=a*d/12/27, t=yd*den;
      $('gv_yd').textContent=yd.toFixed(2);
      $('gv_tons').textContent=t.toFixed(2);
      $('gv_lb').textContent=Math.round(t*2000).toLocaleString('en-US');
      costOut('gv', t);
      const v=+$('gv_cv').value||0, y2t=$('gv_dir').value==='y2t';
      const out=y2t?v*den:v/den, f=x=>(Math.round(x*100)/100).toLocaleString('en-US');
      $('gv_cvout').textContent=y2t?f(v)+' cubic yard'+(v===1?'':'s')+' ≈ '+f(out)+' tons':f(v)+' ton'+(v===1?'':'s')+' ≈ '+f(out)+' cubic yards';
    };
    RUN();
  },

  // ─── TILE ───
  tileCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Area (sq ft)</label><input type="number" id="tl_area" value="120" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Waste (%)</label><input type="number" id="tl_waste" value="10" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Tile width (in)</label><input type="number" id="tl_w" value="12" min="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Tile height (in)</label><input type="number" id="tl_h" value="12" min="0.5" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="tl_base">120</strong><span>Tiles (exact)</span></div>
        <div class="stat-box"><strong id="tl_total">132</strong><span>Buy (with waste)</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Use 10% waste for straight lay, 15% for diagonal or herringbone. Round up to whole boxes.</p>`);
    window.RUN=()=>{
      const a=+$('tl_area').value||0, ws=+$('tl_waste').value||0;
      const tw=+$('tl_w').value||1, th=+$('tl_h').value||1;
      const base=Math.ceil(a*144/(tw*th));
      $('tl_base').textContent=base;
      $('tl_total').textContent=Math.ceil(base*(1+ws/100));
    };
    RUN();
  },

  // ─── FENCE ───
  fenceCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Fence length (ft)</label><input type="number" id="fc_len" value="100" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Post spacing (ft)</label><input type="number" id="fc_sp" value="8" min="1" oninput="RUN()"></div>
        <div class="form-group"><label>Rails per section</label><input type="number" id="fc_rails" value="2" min="1" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="fc_sections">13</strong><span>Sections</span></div>
        <div class="stat-box"><strong id="fc_posts">14</strong><span>Posts</span></div>
        <div class="stat-box"><strong id="fc_railtotal">26</strong><span>Rails</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Corners share posts between runs; gates add posts. Bury 1/3 of height, 2 ft minimum.</p>`);
    window.RUN=()=>{
      const len=+$('fc_len').value||0, sp=Math.max(+$('fc_sp').value||8,1), r=Math.max(+$('fc_rails').value||2,1);
      const sec=Math.ceil(len/sp);
      $('fc_sections').textContent=sec;
      $('fc_posts').textContent=sec>0?sec+1:0;
      $('fc_railtotal').textContent=sec*r;
    };
    RUN();
  },

  // ─── BOARD FOOT ───
  boardFootCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Thickness (in)</label><input type="number" id="bf_t" value="1" min="0" step="0.25" oninput="RUN()"></div>
        <div class="form-group"><label>Width (in)</label><input type="number" id="bf_w" value="6" min="0" step="0.25" oninput="RUN()"></div>
        <div class="form-group"><label>Length (ft)</label><input type="number" id="bf_l" value="8" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Quantity</label><input type="number" id="bf_q" value="10" min="1" oninput="RUN()"></div>
      </div>
      <div class="form-group"><label>Price per board foot ($, optional)</label><input type="number" id="bf_p" value="" min="0" step="0.01" placeholder="8.50" oninput="RUN()"></div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="bf_each">4.0</strong><span>Board feet each</span></div>
        <div class="stat-box"><strong id="bf_total">40.0</strong><span>Total board feet</span></div>
        <div class="stat-box"><strong id="bf_cost">—</strong><span>Total cost</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Use actual dimensions (4/4 = 1\"). Add 20-30% waste for hardwood projects.</p>`);
    window.RUN=()=>{
      const t=+$('bf_t').value||0,w=+$('bf_w').value||0,l=+$('bf_l').value||0,q=Math.max(+$('bf_q').value||1,1),p=+$('bf_p').value||0;
      const each=t*w*l/12, tot=each*q;
      $('bf_each').textContent=each.toFixed(1);
      $('bf_total').textContent=tot.toFixed(1);
      $('bf_cost').textContent=p>0?'$'+(tot*p).toFixed(2):'—';
    };
    RUN();
  },

  // ─── DOG AGE ───
  dogAgeCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr;gap:14px;">
        <div class="form-group"><label>Dog's age (years)</label><input type="number" id="da_age" value="5" min="0.5" step="0.5" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="da_sci">57</strong><span>Human years (research formula)</span></div>
        <div class="stat-box"><strong id="da_myth">35</strong><span>Old ×7 myth (for comparison)</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Formula: 16 × ln(age) + 31, from 2020 epigenetic research on Labradors. Breed size shifts the picture; your vet knows your dog best.</p>`);
    window.RUN=()=>{
      const a=Math.max(+$('da_age').value||0.5,0.5);
      $('da_sci').textContent=Math.round(16*Math.log(a)+31);
      $('da_myth').textContent=Math.round(a*7);
    };
    RUN();
  },

  // ─── TIRE SIZE ───
  tireSizeCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Tire 1 width (mm)</label><input type="number" id="ts_w1" value="225" oninput="RUN()"></div>
        <div class="form-group"><label>Aspect (%)</label><input type="number" id="ts_a1" value="45" oninput="RUN()"></div>
        <div class="form-group"><label>Wheel (in)</label><input type="number" id="ts_r1" value="17" oninput="RUN()"></div>
        <div class="form-group"><label>Tire 2 width (mm)</label><input type="number" id="ts_w2" value="235" oninput="RUN()"></div>
        <div class="form-group"><label>Aspect (%)</label><input type="number" id="ts_a2" value="40" oninput="RUN()"></div>
        <div class="form-group"><label>Wheel (in)</label><input type="number" id="ts_r2" value="18" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="ts_d1">25.0 in</strong><span>Tire 1 diameter</span></div>
        <div class="stat-box"><strong id="ts_d2">25.4 in</strong><span>Tire 2 diameter</span></div>
        <div class="stat-box"><strong id="ts_diff">+1.7%</strong><span>Difference</span></div>
        <div class="stat-box"><strong id="ts_speed">60 → 61.0</strong><span>Speedo reads 60, true speed</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Guideline: keep the new diameter within ~3% of original.</p>`);
    window.RUN=()=>{
      const d=(w,a,r)=>r*25.4+2*(w*a/100);
      const d1=d(+$('ts_w1').value||0,+$('ts_a1').value||0,+$('ts_r1').value||0);
      const d2=d(+$('ts_w2').value||0,+$('ts_a2').value||0,+$('ts_r2').value||0);
      if(d1>0&&d2>0){
        $('ts_d1').textContent=(d1/25.4).toFixed(1)+' in';
        $('ts_d2').textContent=(d2/25.4).toFixed(1)+' in';
        const pct=(d2-d1)/d1*100;
        $('ts_diff').textContent=(pct>=0?'+':'')+pct.toFixed(1)+'%';
        $('ts_speed').textContent='60 → '+(60*d2/d1).toFixed(1);
      }
    };
    RUN();
  },

  // ─── MULCH ───
  mulchCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Bed area (sq ft)</label><input type="number" id="mu_area" value="100" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Depth (inches)</label><input type="number" id="mu_depth" value="3" min="0" step="0.5" oninput="RUN()"></div>
        <div class="form-group"><label>Bag size</label><select id="mu_bag" onchange="RUN()"><option value="1.5">1.5 cu ft</option><option value="2" selected>2 cu ft</option><option value="3">3 cu ft</option></select></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="mu_cuft">25.0</strong><span>Cubic feet</span></div>
        <div class="stat-box"><strong id="mu_yd">0.93</strong><span>Cubic yards</span></div>
        <div class="stat-box"><strong id="mu_bags">13</strong><span id="mu_bagl">Bags (2 cu ft)</span></div>
      </div>
      <p class="tool-note">Use 2–4 inches; keep mulch a few inches off trunks and stems. One cubic yard = 27 cubic feet = 13.5 bags of 2 cu ft.</p>` + costUI('mu','per cubic yard','38.00','Bulk mulch typically runs about $30–45 a yard delivered.') + ``);
    window.RUN=()=>{
      const a=+$('mu_area').value||0, dep=+$('mu_depth').value||0, bag=+$('mu_bag').value||2;
      const cf=a*dep/12;
      $('mu_cuft').textContent=cf.toFixed(1);
      $('mu_yd').textContent=(cf/27).toFixed(2);
      $('mu_bags').textContent=Math.ceil(cf/bag-1e-9);
      $('mu_bagl').textContent='Bags ('+bag+' cu ft)';
      costOut('mu', (cf/27));
    };
    RUN();
  },

  // ─── CONCRETE ───
  concreteCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Length (ft)</label><input type="number" id="cc_l" value="10" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Width (ft)</label><input type="number" id="cc_w" value="10" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Thickness (in)</label><input type="number" id="cc_t" value="4" min="0" step="0.5" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="cc_yd">1.23</strong><span>Cubic yards</span></div>
        <div class="stat-box"><strong id="cc_b80">56</strong><span>80 lb bags</span></div>
        <div class="stat-box"><strong id="cc_b60">75</strong><span>60 lb bags</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Order 5-10% extra. Past ~1 yard, consider ready-mix delivery.</p>` + costUI('cc','per 80 lb bag','7.00','Typical US bag price is about $6–8.') + ``);
    window.RUN=()=>{
      const l=+$('cc_l').value||0,w=+$('cc_w').value||0,t=+$('cc_t').value||0;
      const cf=l*w*t/12;
      $('cc_yd').textContent=(cf/27).toFixed(2);
      $('cc_b80').textContent=Math.ceil(cf/0.6);
      $('cc_b60').textContent=Math.ceil(cf/0.45);
      costOut('cc', Math.ceil(cf/0.6));
    };
    RUN();
  },

  // ─── ACREAGE ───
  acreageCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Length (ft)</label><input type="number" id="ac_l" value="660" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Width (ft)</label><input type="number" id="ac_w" value="66" min="0" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="ac_sqft">43,560</strong><span>Square feet</span></div>
        <div class="stat-box"><strong id="ac_acres">1.00</strong><span>Acres</span></div>
        <div class="stat-box"><strong id="ac_ha">0.40</strong><span>Hectares</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">1 acre = 43,560 sq ft ≈ a square 209 ft per side. Legal boundaries: see the plat/surveyor.</p>`);
    window.RUN=()=>{
      const l=+$('ac_l').value||0,w=+$('ac_w').value||0;
      const sf=l*w;
      $('ac_sqft').textContent=Math.round(sf).toLocaleString('en-US');
      $('ac_acres').textContent=(sf/43560).toFixed(2);
      $('ac_ha').textContent=(sf/43560*0.404686).toFixed(2);
    };
    RUN();
  },

  // ─── BTU ───
  btuCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Room area (sq ft)</label><input type="number" id="bt_area" value="300" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Sun exposure</label><select id="bt_sun" onchange="RUN()">
          <option value="0.9">Heavily shaded (−10%)</option>
          <option value="1" selected>Average</option>
          <option value="1.1">Very sunny (+10%)</option>
        </select></div>
        <div class="form-group"><label>Typical occupants</label><input type="number" id="bt_ppl" value="2" min="1" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="bt_btu">6,000 BTU</strong><span>Recommended capacity</span></div>
        <div class="stat-box"><strong id="bt_ton">0.50</strong><span>Tons</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Rule-of-thumb for room units (+~4,000 BTU if it is a kitchen). Whole homes need a Manual J calculation.</p>`);
    window.RUN=()=>{
      const a=+$('bt_area').value||0, sun=parseFloat($('bt_sun').value), ppl=Math.max(+$('bt_ppl').value||2,1);
      let btu=a*20*sun + Math.max(ppl-2,0)*600;
      $('bt_btu').textContent=Math.round(btu).toLocaleString('en-US')+' BTU';
      $('bt_ton').textContent=(btu/12000).toFixed(2);
    };
    RUN();
  },

  // ─── SALES TAX ───
  salesTaxCalc(){
    // Tax Foundation, rates as of July 1, 2026: [state, state rate, avg combined state+local, max local]
    const S=[['Alabama',4,9.46,8],['Alaska',0,1.82,7.85],['Arizona',5.6,8.54,5.3],['Arkansas',6.5,9.48,6.13],['California',7.25,9.03,5.25],['Colorado',2.9,7.89,9.1],['Connecticut',6.35,6.35,0],['Delaware',0,0,0],['District of Columbia',6,6,0],['Florida',6,6.98,2],['Georgia',4,7.56,5],['Hawaii',4,4.5,0.5],['Idaho',6,6.03,3],['Illinois',6.25,8.98,4.75],['Indiana',7,7,0],['Iowa',6,6.94,1],['Kansas',6.5,8.71,4.25],['Kentucky',6,6,0],['Louisiana',5,10.13,7],['Maine',5.5,5.5,0],['Maryland',6,6,0],['Massachusetts',6.25,6.25,0],['Michigan',6,6,0],['Minnesota',6.875,8.14,3],['Mississippi',7,7.06,1],['Missouri',4.225,8.44,6.25],['Montana',0,0,0],['Nebraska',5.5,6.98,2],['Nevada',6.85,8.24,1.53],['New Hampshire',0,0,0],['New Jersey',6.625,6.6,3.31],['New Mexico',4.875,7.68,4.56],['New York',4,8.54,4.88],['North Carolina',4.75,7.1,3.5],['North Dakota',5,7.09,3.75],['Ohio',5.75,7.29,2.25],['Oklahoma',4.5,9.06,7],['Oregon',0,0,0],['Pennsylvania',6,6.34,2],['Rhode Island',7,7,0],['South Carolina',6,7.49,3],['South Dakota',4.2,6.11,4.5],['Tennessee',7,9.61,2.75],['Texas',6.25,8.2,2],['Utah',6.1,7.42,4.7],['Vermont',6,6.43,1],['Virginia',5.3,5.77,2.7],['Washington',6.5,9.57,4.2],['West Virginia',6,6.6,1.4],['Wisconsin',5,5.72,2.9],['Wyoming',4,5.39,3]];
    const p=x=>(+x).toFixed(3).replace(/\.?0+$/,'')+'%';
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>State (fills in the rate)</label><select id="st_state" onchange="STATE()">
          <option value="">Enter my own rate</option>${S.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join('')}
        </select></div>
        <div class="form-group"><label>Rate to use</label><select id="st_which" onchange="STATE()">
          <option value="c" selected>Average state + local</option><option value="s">State rate only</option>
        </select></div>
        <div class="form-group"><label>Mode</label><select id="st_mode" onchange="RUN()">
          <option value="add">Add tax to price</option><option value="remove">Back out tax from total</option>
        </select></div>
        <div class="form-group"><label id="st_lbl">Price ($)</label><input type="number" id="st_amt" value="50" min="0" step="0.01" oninput="RUN()"></div>
      </div>
      <div class="form-group"><label>Tax rate (%)</label><input type="number" id="st_rate" value="8.25" min="0" step="0.001" oninput="RUN()"></div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="st_pre">$50.00</strong><span>Pre-tax price</span></div>
        <div class="stat-box"><strong id="st_tax">$4.13</strong><span>Sales tax</span></div>
        <div class="stat-box"><strong id="st_total">$54.13</strong><span>Total</span></div>
      </div>
      <p class="tool-note" id="st_info">Pick a state to fill in its rate, or type the exact rate for your city — local taxes vary by address. Not tax advice.</p>`);
    window.STATE=()=>{
      const i=$('st_state').value; if(i===''){ $('st_info').textContent='Type the exact rate for your city — local taxes vary by address. Not tax advice.'; return RUN(); }
      const s=S[+i], useC=$('st_which').value==='c';
      $('st_rate').value=useC?s[2]:s[1];
      $('st_info').textContent = s[1]===0&&s[2]===0 ? s[0]+' has no general sales tax.'
        : s[0]==='New Jersey' ? 'New Jersey: 6.625% state rate. Certain sellers in Urban Enterprise Zones charge a reduced rate. Rates as of July 2026.'
        : s[0]+': '+p(s[1])+' state rate'+(s[2]>s[1]?' + local taxes averaging '+p(Math.round((s[2]-s[1])*100)/100)+' = '+p(s[2])+' on average (local add-ons up to '+p(s[3])+').':(s[3]>0?' (some areas add up to '+p(s[3])+').':', with no local add-ons.'))+' Rates as of July 2026 — check your exact address.';
      RUN();
    };
    window.RUN=()=>{
      const mode=$('st_mode').value, a=parseFloat($('st_amt').value)||0, r=(parseFloat($('st_rate').value)||0)/100;
      $('st_lbl').textContent = mode==='add'?'Price ($)':'Total paid ($)';
      let pre, tax, total;
      if(mode==='add'){ pre=a; tax=a*r; total=a+tax; }
      else { pre=a/(1+r); tax=a-pre; total=a; }
      const m=x=>'$'+x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
      $('st_pre').textContent=m(pre); $('st_tax').textContent=m(tax); $('st_total').textContent=m(total);
    };
    RUN();
  },

  // ─── HOURLY TO SALARY ───
  hourlySalaryCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Mode</label><select id="hs_mode" onchange="RUN()">
          <option value="h2s">Hourly → Salary</option><option value="s2h">Salary → Hourly</option>
        </select></div>
        <div class="form-group"><label id="hs_lbl">Hourly rate ($)</label><input type="number" id="hs_amt" value="25" min="0" step="0.01" oninput="RUN()"></div>
        <div class="form-group"><label>Hours per week</label><input type="number" id="hs_hrs" value="40" min="1" oninput="RUN()"></div>
        <div class="form-group"><label>Weeks per year</label><input type="number" id="hs_wks" value="52" min="1" max="52" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="hs_hr">$25.00</strong><span>Hourly</span></div>
        <div class="stat-box"><strong id="hs_wk">$1,000</strong><span>Weekly</span></div>
        <div class="stat-box"><strong id="hs_mo">$4,333</strong><span>Monthly</span></div>
        <div class="stat-box"><strong id="hs_yr">$52,000</strong><span>Annual</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Gross pay (before taxes and deductions).</p>`);
    const money=(n)=>'$'+Math.round(n).toLocaleString('en-US');
    window.RUN=()=>{
      const mode=$('hs_mode').value, a=parseFloat($('hs_amt').value)||0;
      const hrs=parseFloat($('hs_hrs').value)||40, wks=parseFloat($('hs_wks').value)||52;
      $('hs_lbl').textContent = mode==='h2s'?'Hourly rate ($)':'Annual salary ($)';
      let hourly, annual;
      if(mode==='h2s'){ hourly=a; annual=a*hrs*wks; }
      else { annual=a; hourly=a/(hrs*wks); }
      $('hs_hr').textContent='$'+hourly.toFixed(2);
      $('hs_wk').textContent=money(hourly*hrs);
      $('hs_mo').textContent=money(annual/12);
      $('hs_yr').textContent=money(annual);
    };
    RUN();
  },

  // ─── OVERTIME ───
  overtimePayCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Hourly rate ($)</label><input type="number" id="ot_rate" value="20" min="0" step="0.01" oninput="RUN()"></div>
        <div class="form-group"><label>Regular hours</label><input type="number" id="ot_reg" value="40" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Overtime hours</label><input type="number" id="ot_hrs" value="8" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Multiplier</label><select id="ot_mult" onchange="RUN()">
          <option value="1.5">Time and a half (1.5x)</option><option value="2">Double time (2x)</option>
        </select></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="ot_orate">$30.00</strong><span>Overtime rate</span></div>
        <div class="stat-box"><strong id="ot_opay">$240</strong><span>Overtime pay</span></div>
        <div class="stat-box"><strong id="ot_total">$1,040</strong><span>Total pay</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">General FLSA baseline: 1.5x beyond 40 hrs/week for non-exempt roles. Not legal advice.</p>`);
    window.RUN=()=>{
      const r=parseFloat($('ot_rate').value)||0, reg=parseFloat($('ot_reg').value)||0;
      const oh=parseFloat($('ot_hrs').value)||0, m=parseFloat($('ot_mult').value)||1.5;
      const orate=r*m, opay=orate*oh, total=r*reg+opay;
      $('ot_orate').textContent='$'+orate.toFixed(2);
      $('ot_opay').textContent='$'+Math.round(opay).toLocaleString('en-US');
      $('ot_total').textContent='$'+Math.round(total).toLocaleString('en-US');
    };
    RUN();
  },

  // ─── MPG ───
  mpgCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Miles driven</label><input type="number" id="mp_mi" value="342" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Gallons used</label><input type="number" id="mp_gal" value="11.4" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Gas price ($/gal)</label><input type="number" id="mp_price" value="3.50" min="0" step="0.01" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="mp_mpg">30.0</strong><span>MPG</span></div>
        <div class="stat-box"><strong id="mp_cpm">11.7¢</strong><span>Cost per mile</span></div>
        <div class="stat-box"><strong id="mp_trip">$39.90</strong><span>Fuel cost (this tank)</span></div>
      </div>`);
    window.RUN=()=>{
      const mi=parseFloat($('mp_mi').value)||0, g=parseFloat($('mp_gal').value)||0, p=parseFloat($('mp_price').value)||0;
      if(mi>0&&g>0){
        const mpg=mi/g;
        $('mp_mpg').textContent=mpg.toFixed(1);
        $('mp_cpm').textContent=p>0?(p/mpg*100).toFixed(1)+'¢':'—';
        $('mp_trip').textContent=p>0?'$'+(g*p).toFixed(2):'—';
      } else { $('mp_mpg').textContent='—';$('mp_cpm').textContent='—';$('mp_trip').textContent='—'; }
    };
    RUN();
  },

  // ─── SQUARE FOOTAGE ───
  sqftCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Length (ft)</label><input type="number" id="sf_l" value="12.5" min="0" step="0.01" oninput="RUN()"></div>
        <div class="form-group"><label>Width (ft)</label><input type="number" id="sf_w" value="10.25" min="0" step="0.01" oninput="RUN()"></div>
        <div class="form-group"><label>Price per sq ft ($, optional)</label><input type="number" id="sf_p" value="" min="0" step="0.01" placeholder="4.50" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="sf_sqft">128.1 sq ft</strong><span>Square feet</span></div>
        <div class="stat-box"><strong id="sf_sqyd">14.2 sq yd</strong><span>Square yards</span></div>
        <div class="stat-box"><strong id="sf_sqm">11.9 m²</strong><span>Square meters</span></div>
        <div class="stat-box"><strong id="sf_cost">—</strong><span>Total cost</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Tip: inches ÷ 12 = decimal feet (6" = 0.5'). Buy ~10% extra material.</p>`);
    window.RUN=()=>{
      const l=parseFloat($('sf_l').value)||0, w=parseFloat($('sf_w').value)||0, p=parseFloat($('sf_p').value)||0;
      const sqft=l*w;
      $('sf_sqft').textContent=sqft.toFixed(1)+' sq ft';
      $('sf_sqyd').textContent=(sqft/9).toFixed(1)+' sq yd';
      $('sf_sqm').textContent=(sqft*0.092903).toFixed(1)+' m²';
      $('sf_cost').textContent=p>0?'$'+(sqft*p).toFixed(2):'—';
    };
    RUN();
  },

  // ─── PIZZA DOUGH ───
  pizzaDoughCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Flour (g)</label><input type="number" id="pd_flour" value="500" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Hydration (%)</label><input type="number" id="pd_hyd" value="65" min="40" max="100" oninput="RUN()"></div>
        <div class="form-group"><label>Salt (%)</label><input type="number" id="pd_salt" value="2" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Instant yeast (%)</label><input type="number" id="pd_yeast" value="0.3" min="0" step="0.1" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="pd_water">325 g</strong><span>Water</span></div>
        <div class="stat-box"><strong id="pd_saltg">10 g</strong><span>Salt</span></div>
        <div class="stat-box"><strong id="pd_yeastg">1.5 g</strong><span>Yeast</span></div>
        <div class="stat-box"><strong id="pd_total">836.5 g</strong><span>Total dough</span></div>
      </div>`);
    window.RUN=()=>{
      const f=parseFloat($('pd_flour').value)||0,h=parseFloat($('pd_hyd').value)||0,s=parseFloat($('pd_salt').value)||0,y=parseFloat($('pd_yeast').value)||0;
      const w=f*h/100, sg=f*s/100, yg=f*y/100;
      $('pd_water').textContent=w.toFixed(0)+' g';
      $('pd_saltg').textContent=sg.toFixed(1).replace(/\.0$/,'')+' g';
      $('pd_yeastg').textContent=yg.toFixed(1).replace(/\.0$/,'')+' g';
      $('pd_total').textContent=(f+w+sg+yg).toFixed(1).replace(/\.0$/,'')+' g';
    };
    RUN();
  },

  // ─── CALORIE DEFICIT ───
  calorieDeficitCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Weight (kg)</label><input type="number" id="cd_wt" value="70" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Height (cm)</label><input type="number" id="cd_ht" value="170" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Age</label><input type="number" id="cd_age" value="30" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Sex</label><select id="cd_sex" onchange="RUN()"><option value="m">Male</option><option value="f">Female</option></select></div>
      </div>
      <div class="form-group"><label>Activity level</label><select id="cd_act" onchange="RUN()">
        <option value="1.2">Sedentary (little exercise)</option>
        <option value="1.375">Light (1-3 days/week)</option>
        <option value="1.55" selected>Moderate (3-5 days/week)</option>
        <option value="1.725">Very active (6-7 days/week)</option>
      </select></div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="cd_tdee">0</strong><span>Maintenance (TDEE)</span></div>
        <div class="stat-box"><strong id="cd_mild">0</strong><span>Mild -250 (~0.25 kg/wk)</span></div>
        <div class="stat-box"><strong id="cd_mod">0</strong><span>Moderate -500 (~0.5 kg/wk)</span></div>
        <div class="stat-box"><strong id="cd_agg">0</strong><span>Aggressive -750 (~0.75 kg/wk)</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Mifflin-St Jeor estimate. General guidance for healthy adults — not medical advice.</p>`);
    window.RUN=()=>{
      const w=parseFloat($('cd_wt').value)||0,h=parseFloat($('cd_ht').value)||0,a=parseFloat($('cd_age').value)||0;
      const s=$('cd_sex').value, act=parseFloat($('cd_act').value);
      const bmr=10*w+6.25*h-5*a+(s==='m'?5:-161);
      const tdee=Math.round(bmr*act);
      $('cd_tdee').textContent=tdee+' kcal';
      $('cd_mild').textContent=Math.max(tdee-250,0)+' kcal';
      $('cd_mod').textContent=Math.max(tdee-500,0)+' kcal';
      $('cd_agg').textContent=Math.max(tdee-750,0)+' kcal';
    };
    RUN();
  },

  // ─── IDEAL WEIGHT ───
  idealWeightCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Height (cm)</label><input type="number" id="iw_ht" value="170" min="120" oninput="RUN()"></div>
        <div class="form-group"><label>Sex</label><select id="iw_sex" onchange="RUN()"><option value="m">Male</option><option value="f">Female</option></select></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="iw_dev">0</strong><span>Devine formula</span></div>
        <div class="stat-box"><strong id="iw_rob">0</strong><span>Robinson formula</span></div>
        <div class="stat-box"><strong id="iw_bmi">0</strong><span>Healthy BMI range</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Formula estimates for general reference — build and muscle matter more. Not medical advice.</p>`);
    window.RUN=()=>{
      const ht=parseFloat($('iw_ht').value)||0, s=$('iw_sex').value;
      const inches=ht/2.54, over=Math.max(inches-60,0), m2=(ht/100)*(ht/100);
      const dev=(s==='m'?50:45.5)+2.3*over;
      const rob=(s==='m'?52+1.9*over:49+1.7*over);
      const lo=18.5*m2, hi=24.9*m2;
      const kg2lb=(k)=>Math.round(k*2.20462);
      $('iw_dev').textContent=dev.toFixed(1)+' kg ('+kg2lb(dev)+' lb)';
      $('iw_rob').textContent=rob.toFixed(1)+' kg ('+kg2lb(rob)+' lb)';
      $('iw_bmi').textContent=lo.toFixed(0)+'-'+hi.toFixed(0)+' kg';
    };
    RUN();
  },

  // ─── PPI ───
  ppiCalc(){
    ui(`
      <div class="form-group"><label>Common resolution</label><select id="pp_pre" onchange="PRESET()">
        <option value="">Custom</option>
        <option value="1366x768">1366 × 768 (HD)</option>
        <option value="1920x1080">1920 × 1080 (Full HD, 1080p)</option>
        <option value="1920x1200">1920 × 1200 (WUXGA)</option>
        <option value="2560x1440" selected>2560 × 1440 (QHD, 1440p)</option>
        <option value="2560x1600">2560 × 1600 (WQXGA)</option>
        <option value="3440x1440">3440 × 1440 (ultrawide QHD)</option>
        <option value="3840x2160">3840 × 2160 (4K UHD)</option>
        <option value="5120x2880">5120 × 2880 (5K)</option>
        <option value="7680x4320">7680 × 4320 (8K)</option>
      </select></div>
      <div class="cols-keep" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Width (px)</label><input type="number" id="pp_w" value="2560" min="0" oninput="$('pp_pre').value='';RUN()"></div>
        <div class="form-group"><label>Height (px)</label><input type="number" id="pp_h" value="1440" min="0" oninput="$('pp_pre').value='';RUN()"></div>
        <div class="form-group"><label>Diagonal (inches)</label><input type="number" id="pp_d" value="27" min="0" step="0.1" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="pp_ppi">109</strong><span>PPI</span></div>
        <div class="stat-box"><strong id="pp_dot">0.233 mm</strong><span>Dot pitch</span></div>
        <div class="stat-box"><strong id="pp_size">—</strong><span>Screen width × height</span></div>
        <div class="stat-box"><strong id="pp_ret">—</strong><span>Pixels blend beyond</span></div>
        <div class="stat-box"><strong id="pp_total">3.7 MP</strong><span>Total pixels</span></div>
        <div class="stat-box"><strong id="pp_ar">16:9</strong><span>Aspect ratio</span></div>
      </div>
      <p class="tool-note">“Pixels blend beyond” is the viewing distance where one pixel shrinks below one arcminute — the limit of 20/20 vision.</p>`);
    const gcd=(a,b)=>b?gcd(b,a%b):a;
    window.PRESET=()=>{ const v=$('pp_pre').value; if(!v)return; const [w,h]=v.split('x'); $('pp_w').value=w; $('pp_h').value=h; RUN(); };
    window.RUN=()=>{
      const w=parseFloat($('pp_w').value)||0,h=parseFloat($('pp_h').value)||0,d=parseFloat($('pp_d').value)||0;
      if(w>0&&h>0&&d>0){
        const diagpx=Math.sqrt(w*w+h*h), ppi=diagpx/d, dist=3438/ppi;
        $('pp_ppi').textContent=Math.round(ppi);
        $('pp_dot').textContent=(25.4/ppi).toFixed(3)+' mm';
        $('pp_size').textContent=(d*w/diagpx).toFixed(1)+'″ × '+(d*h/diagpx).toFixed(1)+'″';
        $('pp_ret').textContent=Math.round(dist)+'″ ('+Math.round(dist*2.54)+' cm)';
        $('pp_total').textContent=((w*h)/1e6).toFixed(1)+' MP';
        const g=gcd(Math.round(w),Math.round(h)); let a=(Math.round(w)/g)+':'+(Math.round(h)/g);
        if(a==='64:27'||a==='43:18') a+=' (21:9)'; else if(a==='8:5') a='16:10';
        $('pp_ar').textContent=a;
      } else ['pp_ppi','pp_dot','pp_size','pp_ret','pp_total','pp_ar'].forEach(i=>$(i).textContent='—');
    };
    RUN();
  },

  // ─── PAINT ───
  paintCalc(){
    ui(`
      <div class="form-group"><label>Units</label><select id="pt_u" onchange="UNITS()"><option value="ft" selected>Feet (US)</option><option value="m">Meters</option></select></div>
      <div class="cols-keep" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label id="pt_ll">Room length (ft)</label><input type="number" id="pt_l" value="12" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label id="pt_wl">Room width (ft)</label><input type="number" id="pt_w" value="12" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label id="pt_hl">Wall height (ft)</label><input type="number" id="pt_h" value="8" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Doors</label><input type="number" id="pt_doors" value="1" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Windows</label><input type="number" id="pt_win" value="2" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Coats</label><input type="number" id="pt_coats" value="2" min="1" oninput="RUN()"></div>
      </div>
      <label class="check"><input type="checkbox" id="pt_ceil" onchange="RUN()"> Paint the ceiling too</label>
      <div class="tool-stats">
        <div class="stat-box"><strong id="pt_area">0 sq ft</strong><span>Wall area to paint</span></div>
        <div class="stat-box"><strong id="pt_gal">0 gal</strong><span>Paint needed</span></div>
        <div class="stat-box"><strong id="pt_buy">—</strong><span>What to buy</span></div>
        <div class="stat-box"><strong id="pt_lit">0 L</strong><span>In liters</span></div>
      </div>
      <p class="tool-note" id="pt_note">Assumes about 350 sq ft per gallon per coat, 20 sq ft per door and 15 sq ft per window.</p>` + costUI('pt','per gallon','40.00','Mid-grade interior paint typically runs about $30–55 a gallon.') + ``);
    window.UNITS=()=>{
      const m=$('pt_u').value==='m', f=m?0.3048:1/0.3048;
      ['pt_l','pt_w','pt_h'].forEach(id=>{ const v=+$(id).value; if(v>0) $(id).value=(Math.round(v*f*10)/10); });
      const u=m?'m':'ft'; $('pt_ll').textContent='Room length ('+u+')'; $('pt_wl').textContent='Room width ('+u+')'; $('pt_hl').textContent='Wall height ('+u+')';
      RUN();
    };
    window.RUN=()=>{
      const m=$('pt_u').value==='m';
      const l=parseFloat($('pt_l').value)||0,w=parseFloat($('pt_w').value)||0,h=parseFloat($('pt_h').value)||0;
      const d=parseInt($('pt_doors').value)||0,wi=parseInt($('pt_win').value)||0,c=Math.max(parseInt($('pt_coats').value)||1,1);
      // work in square feet internally
      const k=m?10.7639:1, L=l*(m?3.28084:1), W=w*(m?3.28084:1), H=h*(m?3.28084:1);
      const walls=Math.max(2*(L+W)*H - d*20 - wi*15, 0), ceil=$('pt_ceil').checked?L*W:0;
      const gal=(walls+ceil)*c/350, lit=gal*3.78541;
      $('pt_area').textContent=m?(walls/k).toFixed(1)+' m²':Math.round(walls)+' sq ft';
      $('pt_gal').textContent=gal.toFixed(1)+' gal';
      $('pt_lit').textContent=lit.toFixed(1)+' L';
      let g=Math.floor(gal), q=Math.ceil((gal-g)*4-1e-9); if(q===4){g++;q=0;}
      $('pt_buy').textContent=gal<=0?'—':(g?g+' gal':'')+(g&&q?' + ':'')+(q?q+' qt':'');
      $('pt_note').textContent='Walls'+(ceil?' and ceiling':'')+', '+c+' coat'+(c>1?'s':'')+'. Assumes about 350 sq ft per gallon per coat (8.6 m² per liter), '+(m?'1.9 m²':'20 sq ft')+' per door and '+(m?'1.4 m²':'15 sq ft')+' per window.'+(ceil?' Ceiling adds '+(ceil*c/350).toFixed(1)+' gal.':'');
      costOut('pt', gal>0?Math.ceil(gal):0);
    };
    RUN();
  },

  // ─── RICE RATIO ───
  riceRatioCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Rice (cups)</label><input type="number" id="rr_rice" value="1" min="0" step="0.25" oninput="RUN()"></div>
        <div class="form-group"><label>Rice type</label><select id="rr_type" onchange="RUN()">
          <option value="2">White long-grain (1:2)</option>
          <option value="1.5">Jasmine (1:1.5)</option>
          <option value="1.5">Basmati (1:1.5)</option>
          <option value="2.5">Brown (1:2.5)</option>
          <option value="1.25">Sushi (1:1.25)</option>
        </select></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="rr_cups">2 cups</strong><span>Water needed</span></div>
        <div class="stat-box"><strong id="rr_ml">473 ml</strong><span>In milliliters</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">Stovetop guideline. Rice cookers often need slightly less — adjust once for your setup.</p>`);
    window.RUN=()=>{
      const r=parseFloat($('rr_rice').value)||0, ratio=parseFloat($('rr_type').value)||2;
      const cups=r*ratio;
      $('rr_cups').textContent=cups.toFixed(2).replace(/\.00$/,'')+' cups';
      $('rr_ml').textContent=Math.round(cups*236.588)+' ml';
    };
    RUN();
  },

  // ─── PACE ───
  paceCalc(){
    const MI=1.609344;
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Distance</label><input type="number" id="pc_dist" value="5" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Unit</label><select id="pc_unit" onchange="RUN()"><option value="km">km</option><option value="mi">miles</option></select></div>
      </div>
      <div class="cols-keep" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Hours</label><input type="number" id="pc_h" value="0" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Minutes</label><input type="number" id="pc_m" value="30" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Seconds</label><input type="number" id="pc_s" value="0" min="0" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="pc_km">6:00</strong><span>Pace / km</span></div>
        <div class="stat-box"><strong id="pc_mi">9:39</strong><span>Pace / mile</span></div>
        <div class="stat-box"><strong id="pc_speed">10.0 km/h</strong><span>Speed</span></div>
      </div>
      <p class="tool-note" style="margin:16px 0 0;">Finish times at this pace</p>
      <div class="tool-stats" style="margin-top:8px;">
        <div class="stat-box"><strong id="pc_5k">—</strong><span>5K</span></div>
        <div class="stat-box"><strong id="pc_10k">—</strong><span>10K</span></div>
        <div class="stat-box"><strong id="pc_hm">—</strong><span>Half marathon</span></div>
        <div class="stat-box"><strong id="pc_fm">—</strong><span>Marathon</span></div>
      </div>
      <div class="tool-sub">
        <h3>Pace converter: min/mile ↔ min/km</h3>
        <div class="cols-keep" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
          <div class="form-group"><label>Minutes</label><input type="number" id="pv_m" value="8" min="0" oninput="RUN()"></div>
          <div class="form-group"><label>Seconds</label><input type="number" id="pv_s" value="0" min="0" max="59" oninput="RUN()"></div>
          <div class="form-group"><label>Pace is per</label><select id="pv_u" onchange="RUN()"><option value="mi">mile</option><option value="km">km</option></select></div>
        </div>
        <div class="tool-stats">
          <div class="stat-box"><strong id="pv_out">—</strong><span id="pv_lbl">Pace / km</span></div>
          <div class="stat-box"><strong id="pv_mph">—</strong><span>mph</span></div>
          <div class="stat-box"><strong id="pv_kmh">—</strong><span>km/h</span></div>
        </div>
      </div>`);
    // Round the total first so 359.6 s shows as 6:00, never 5:60
    const fmt=(sec)=>{if(!isFinite(sec)||sec<=0)return'—';let t=Math.round(sec);const h=Math.floor(t/3600);t-=h*3600;const m=Math.floor(t/60),s=t%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0');};
    window.RUN=()=>{
      const d=parseFloat($('pc_dist').value)||0, u=$('pc_unit').value;
      const t=(parseFloat($('pc_h').value)||0)*3600+(parseFloat($('pc_m').value)||0)*60+(parseFloat($('pc_s').value)||0);
      const km=u==='mi'?d*MI:d;
      if(km>0&&t>0){
        const spk=t/km, kmh=3600/spk;
        $('pc_km').textContent=fmt(spk);
        $('pc_mi').textContent=fmt(spk*MI);
        $('pc_speed').textContent=kmh.toFixed(1)+' km/h ('+(kmh/MI).toFixed(1)+' mph)';
        $('pc_5k').textContent=fmt(spk*5); $('pc_10k').textContent=fmt(spk*10);
        $('pc_hm').textContent=fmt(spk*21.0975); $('pc_fm').textContent=fmt(spk*42.195);
      } else ['pc_km','pc_mi','pc_speed','pc_5k','pc_10k','pc_hm','pc_fm'].forEach(i=>$(i).textContent='—');
      const ps=(parseFloat($('pv_m').value)||0)*60+(parseFloat($('pv_s').value)||0), pu=$('pv_u').value;
      if(ps>0){
        const spk2=pu==='mi'?ps/MI:ps, kmh2=3600/spk2;
        $('pv_out').textContent=fmt(pu==='mi'?spk2:ps*MI);
        $('pv_lbl').textContent=pu==='mi'?'Pace / km':'Pace / mile';
        $('pv_mph').textContent=(kmh2/MI).toFixed(2);
        $('pv_kmh').textContent=kmh2.toFixed(2);
      } else ['pv_out','pv_mph','pv_kmh'].forEach(i=>$(i).textContent='—');
    };
    RUN();
  },

  // ─── GPA TO PERCENTAGE ───
  gpaPercentCalc(){
    // Common US plus/minus scale: [minimum %, letter, 4.0 points]
    const PM=[[97,'A+',4.0],[93,'A',4.0],[90,'A−',3.7],[87,'B+',3.3],[83,'B',3.0],[80,'B−',2.7],[77,'C+',2.3],[73,'C',2.0],[70,'C−',1.7],[67,'D+',1.3],[65,'D',1.0],[0,'F',0.0]];
    const RANGE={'A+':'97–100%','A':'93–96%','A−':'90–92%','B+':'87–89%','B':'83–86%','B−':'80–82%','C+':'77–79%','C':'73–76%','C−':'70–72%','D+':'67–69%','D':'65–66%','F':'below 65%'};
    ui(`
      <div class="form-group"><label>Convert</label><select id="gp_dir" onchange="RUN()">
        <option value="g2p" selected>GPA → percentage</option>
        <option value="p2g">Percentage → GPA</option>
        <option value="s2s">GPA on one scale → another scale</option>
      </select></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label id="gp_vlbl">GPA / CGPA</label><input type="number" id="gp_val" value="8.0" min="0" step="0.01" oninput="RUN()"></div>
        <div class="form-group"><label id="gp_slbl">Scale</label><select id="gp_scale" onchange="RUN()">
          <option value="10" selected>10-point CGPA</option>
          <option value="4">4.0 scale</option>
          <option value="5">5.0 scale</option>
        </select></div>
      </div>
      <div class="form-group" id="gp_towrap" style="display:none"><label>To scale</label><select id="gp_to" onchange="RUN()">
        <option value="4" selected>4.0 scale</option><option value="4.33">4.33 scale</option><option value="5">5.0 scale</option><option value="10">10-point scale</option>
      </select></div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="gp_pct">76%</strong><span id="gp_olbl">Percentage</span></div>
        <div class="stat-box"><strong id="gp_alt">80%</strong><span id="gp_altlbl">Using × 10</span></div>
      </div>
      <p class="tool-note" id="gp_note">CBSE formula: CGPA × 9.5. If your university prints its own formula on the marksheet, use that one.</p>`);
    const pct=x=>(Math.round(x*10)/10).toString()+'%';
    const g2=x=>(Math.round(x*100)/100).toFixed(2);
    window.RUN=()=>{
      const dir=$('gp_dir').value, v=parseFloat($('gp_val').value), sc=parseFloat($('gp_scale').value);
      $('gp_towrap').style.display=dir==='s2s'?'':'none';
      $('gp_vlbl').textContent=dir==='p2g'?'Percentage (%)':'GPA / CGPA';
      $('gp_slbl').textContent=dir==='p2g'?'Convert to':(dir==='s2s'?'From scale':'Scale');
      let main='—', alt='—', olbl='Percentage', altlbl='—', note='';
      if(isFinite(v)&&v>=0){
        if(dir==='g2p'){
          if(v>sc){ main='Above scale'; }
          else if(sc===10){ main=pct(v*9.5); alt=pct(v*10); altlbl='Using × 10'; note='CBSE formula: CGPA × 9.5. Some universities use × 10 or their own formula — if your marksheet prints one, use that.'; }
          else if(sc===4){
            main=pct(v*25); olbl='Percentage (GPA ÷ 4 × 100)';
            const hit=PM.find(r=>Math.abs(r[2]-v)<0.001);
            if(hit){ alt=hit[1]; altlbl='Letter grade ('+RANGE[hit[1]]+')'; }
            else { const up=PM.slice().reverse().find(r=>r[2]>v), lo=PM.find(r=>r[2]<v);
              alt=(lo?lo[1]:'F')+' to '+(up?up[1]:'A'); altlbl='Between '+(lo?RANGE[lo[1]]:'')+' and '+(up?RANGE[up[1]]:''); }
            note='A straight conversion divides by the 4.0 maximum. Schools that grade on a letter scale map grades to percentages differently — see the chart below.';
          } else { main=pct(v*20); olbl='Percentage (GPA ÷ 5 × 100)'; note='Straight proportional conversion on a 5.0 scale.'; }
        } else if(dir==='p2g'){
          if(v>100){ main='Above 100%'; }
          else if(sc===4){ const r=PM.find(r=>v>=r[0]); main=r[2].toFixed(1)+' ('+r[1]+')'; olbl='GPA, letter-grade method'; alt=g2(v/25); altlbl='Straight-line (% ÷ 25)'; note='Most US high schools convert by letter grade: 90–92% is an A− (3.7), 83–86% a B (3.0). The straight-line figure is what some international evaluators use.'; }
          else if(sc===10){ main=g2(v/9.5); olbl='CGPA (% ÷ 9.5)'; alt=g2(v/10); altlbl='Using ÷ 10'; note='Reverse of the CBSE formula. Use your own university’s formula if it publishes one.'; }
          else { main=g2(v/20); olbl='GPA on 5.0 scale (% ÷ 20)'; note='Straight proportional conversion on a 5.0 scale.'; }
        } else {
          const to=parseFloat($('gp_to').value);
          if(v>sc){ main='Above scale'; }
          else { main=g2(v/sc*to); olbl='GPA on '+(to===10?'10-point':to+'')+' scale'; alt=pct(v/sc*100); altlbl='Share of maximum'; note='Proportional conversion: (GPA ÷ old maximum) × new maximum. Credential evaluators such as WES convert course by course, so an official result can differ.'; }
        }
      }
      $('gp_pct').textContent=main; $('gp_olbl').textContent=olbl;
      $('gp_alt').textContent=alt; $('gp_altlbl').textContent=altlbl; $('gp_note').textContent=note;
    };
    RUN();
  },

  // ─── WATER INTAKE ───
  waterIntakeCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Weight</label><input type="number" id="wi_wt" value="70" oninput="RUN()"></div>
        <div class="form-group"><label>Unit</label><select id="wi_unit" onchange="RUN()"><option value="kg">kg</option><option value="lb">lbs</option></select></div>
        <div class="form-group"><label>Exercise (min/day)</label><input type="number" id="wi_ex" value="30" min="0" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="wi_l">0 L</strong><span>Liters / day</span></div>
        <div class="stat-box"><strong id="wi_oz">0 oz</strong><span>Fluid ounces</span></div>
        <div class="stat-box"><strong id="wi_cups">0</strong><span>Cups (8 oz)</span></div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:10px;">General guideline (~33 ml per kg + ~350 ml per 30 min exercise). Not medical advice.</p>`);
    window.RUN=()=>{
      let w=parseFloat($('wi_wt').value)||0; const u=$('wi_unit').value, ex=parseFloat($('wi_ex').value)||0;
      const kg=u==='lb'?w*0.453592:w;
      const ml=kg*33+(ex/30)*350;
      $('wi_l').textContent=(ml/1000).toFixed(2)+' L';
      $('wi_oz').textContent=Math.round(ml/29.5735)+' oz';
      $('wi_cups').textContent=(ml/236.588).toFixed(1);
    };
    RUN();
  },

  // ─── ASPECT RATIO ───
  aspectRatioCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Original width</label><input type="number" id="ar_w1" value="1920" oninput="AR('w1')"></div>
        <div class="form-group"><label>Original height</label><input type="number" id="ar_h1" value="1080" oninput="AR('h1')"></div>
        <div class="form-group"><label>New width</label><input type="number" id="ar_w2" value="1280" oninput="AR('w2')"></div>
        <div class="form-group"><label>New height</label><input type="number" id="ar_h2" value="720" oninput="AR('h2')"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="ar_ratio">16:9</strong><span>Aspect ratio</span></div>
        <div class="stat-box"><strong id="ar_dims">1280 × 720</strong><span>New size</span></div>
      </div>`);
    const gcd=(a,b)=>b?gcd(b,a%b):a;
    window.AR=(src)=>{
      const w1=parseFloat($('ar_w1').value)||0,h1=parseFloat($('ar_h1').value)||0;
      let w2=parseFloat($('ar_w2').value)||0,h2=parseFloat($('ar_h2').value)||0;
      if(w1>0&&h1>0){
        if(src==='w2'&&w2>0){h2=Math.round(w2*h1/w1);$('ar_h2').value=h2;}
        else if(src==='h2'&&h2>0){w2=Math.round(h2*w1/h1);$('ar_w2').value=w2;}
        else if((src==='w1'||src==='h1')&&w2>0){h2=Math.round(w2*h1/w1);$('ar_h2').value=h2;}
        const g=gcd(Math.round(w1),Math.round(h1));
        $('ar_ratio').textContent=g?`${Math.round(w1)/g}:${Math.round(h1)/g}`:'—';
        $('ar_dims').textContent=`${w2||'?'} × ${h2||'?'}`;
      }
    };
    AR('w2');
  },

  // ─── COFFEE RATIO ───
  coffeeRatioCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Water (ml)</label><input type="number" id="cf_water" value="240" oninput="RUN()"></div>
        <div class="form-group"><label>Ratio (1:X)</label><select id="cf_ratio" onchange="RUN()">
          <option value="15">1:15 — strong</option><option value="16" selected>1:16 — balanced</option>
          <option value="17">1:17 — lighter</option><option value="14">1:14 — French press</option>
        </select></div>
        <div class="form-group"><label>Cups (240 ml)</label><input type="number" id="cf_cups" value="1" min="0" step="0.5" oninput="CUPS()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="cf_coffee">15 g</strong><span>Coffee needed</span></div>
        <div class="stat-box"><strong id="cf_tbsp">~2.5</strong><span>Tablespoons (approx)</span></div>
      </div>`);
    window.RUN=()=>{
      const w=parseFloat($('cf_water').value)||0,r=parseFloat($('cf_ratio').value)||16;
      const g=w/r;
      $('cf_coffee').textContent=g.toFixed(1)+' g';
      $('cf_tbsp').textContent='~'+(g/6).toFixed(1);
      $('cf_cups').value=(w/240).toFixed(1).replace(/\.0$/,'');
    };
    window.CUPS=()=>{
      const c=parseFloat($('cf_cups').value)||0;
      $('cf_water').value=Math.round(c*240); RUN();
    };
    RUN();
  },

  // ─── TIP ───
  tipCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Bill ($)</label><input type="number" id="tp_bill" value="50" oninput="RUN()"></div>
        <div class="form-group"><label>Tip %</label><input type="number" id="tp_pct" value="18" oninput="RUN()"></div>
        <div class="form-group"><label>Split</label><input type="number" id="tp_split" value="1" min="1" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="tp_tip">$0</strong><span>Tip</span></div>
        <div class="stat-box"><strong id="tp_total">$0</strong><span>Total</span></div>
        <div class="stat-box"><strong id="tp_each">$0</strong><span>Per Person</span></div>
      </div>`);
    window.RUN=()=>{
      const b=parseFloat($('tp_bill').value)||0,p=parseFloat($('tp_pct').value)||0,s=parseInt($('tp_split').value)||1;
      const tip=b*p/100,total=b+tip;
      $('tp_tip').textContent='$'+tip.toFixed(2);$('tp_total').textContent='$'+total.toFixed(2);$('tp_each').textContent='$'+(total/s).toFixed(2);
    };
    RUN();
  },

  // ─── DISCOUNT ───
  discountCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Original Price ($)</label><input type="number" id="d_price" value="100" oninput="RUN()"></div>
        <div class="form-group"><label>Discount %</label><input type="number" id="d_pct" value="25" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="d_final">$0</strong><span>Final Price</span></div>
        <div class="stat-box"><strong id="d_save">$0</strong><span>You Save</span></div>
      </div>`);
    window.RUN=()=>{
      const p=parseFloat($('d_price').value)||0,d=parseFloat($('d_pct').value)||0;
      const save=p*d/100;
      $('d_final').textContent='$'+(p-save).toFixed(2);$('d_save').textContent='$'+save.toFixed(2);
    };
    RUN();
  },

  // ─── COMPOUND INTEREST ───
  compoundInterest(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Principal ($)</label><input type="number" id="ci_p" value="1000" oninput="RUN()"></div>
        <div class="form-group"><label>Annual Rate (%)</label><input type="number" id="ci_r" value="5" oninput="RUN()"></div>
        <div class="form-group"><label>Years</label><input type="number" id="ci_y" value="10" oninput="RUN()"></div>
        <div class="form-group"><label>Monthly Contribution ($)</label><input type="number" id="ci_m" value="0" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="ci_fv">$0</strong><span>Final Value</span></div>
        <div class="stat-box"><strong id="ci_int">$0</strong><span>Total Interest</span></div>
      </div>`);
    window.RUN=()=>{
      const p=parseFloat($('ci_p').value)||0,r=(parseFloat($('ci_r').value)||0)/100/12,n=(parseInt($('ci_y').value)||0)*12,m=parseFloat($('ci_m').value)||0;
      let fv=p*Math.pow(1+r,n);
      if(r>0)fv+=m*((Math.pow(1+r,n)-1)/r);else fv+=m*n;
      const contrib=p+m*n;
      $('ci_fv').textContent='$'+fv.toLocaleString(undefined,{maximumFractionDigits:0});
      $('ci_int').textContent='$'+(fv-contrib).toLocaleString(undefined,{maximumFractionDigits:0});
    };
    RUN();
  },

  // ─── GPA ───
  gpaCalc(){
    ui(`
      <p style="font-size:.9rem;color:var(--gray);margin-bottom:12px;">Enter grade points (A=4, B=3, C=2, D=1, F=0) and credit hours.</p>
      <div id="gpa_rows"></div>
      <button class="btn btn-outline" onclick="GR()" style="margin:10px 0;">➕ Add Course</button>
      <div class="tool-result-bar" id="t_out" style="font-size:1.1rem;"></div>`);
    let rows=0;
    window.GR=()=>{rows++;const d=document.createElement('div');d.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;';d.innerHTML=`<input type="number" class="gp" placeholder="Grade points (0-4)" step="0.1" oninput="GC()"><input type="number" class="gc" placeholder="Credit hours" oninput="GC()">`;$('gpa_rows').appendChild(d);};
    window.GC=()=>{const gp=[...document.querySelectorAll('.gp')],gc=[...document.querySelectorAll('.gc')];let tp=0,tc=0;gp.forEach((e,i)=>{const p=parseFloat(e.value)||0,c=parseFloat(gc[i].value)||0;tp+=p*c;tc+=c;});$('t_out').innerHTML=tc?`GPA: <strong>${(tp/tc).toFixed(2)}</strong> (${tc} credits)`:'';};
    GR();GR();GR();
  },

  // ─── FRACTION ───
  fractionCalc(){
    ui(`
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input type="number" id="f_a" value="1" style="width:70px;"> <span>/</span> <input type="number" id="f_b" value="2" style="width:70px;">
        <select id="f_op" style="width:60px;"><option>+</option><option>−</option><option>×</option><option>÷</option></select>
        <input type="number" id="f_c" value="1" style="width:70px;"> <span>/</span> <input type="number" id="f_d" value="3" style="width:70px;">
        <button class="btn btn-primary" onclick="RUN()">=</button>
      </div>
      <div class="tool-result-bar" id="t_out" style="font-size:1.2rem;"></div>`);
    const gcd=(a,b)=>b?gcd(b,a%b):a;
    window.RUN=()=>{
      let a=+$('f_a').value,b=+$('f_b').value,c=+$('f_c').value,d=+$('f_d').value,op=$('f_op').value,n,den;
      if(op==='+'){n=a*d+c*b;den=b*d;}else if(op==='−'){n=a*d-c*b;den=b*d;}else if(op==='×'){n=a*c;den=b*d;}else{n=a*d;den=b*c;}
      const g=Math.abs(gcd(n,den))||1;
      $('t_out').innerHTML=`= <strong>${n/g}/${den/g}</strong> (${(n/den).toFixed(4)})`;
    };
    RUN();
  },

  // ─── SQRT ───
  sqrtCalc(){
    ui(`<div class="form-group"><label>Number</label><input type="number" id="t_in" value="144" oninput="RUN()"></div><div class="tool-result-bar" id="t_out" style="font-size:1.2rem;"></div>`);
    window.RUN=()=>{const n=parseFloat($('t_in').value);$('t_out').innerHTML=n>=0?`√${n} = <strong>${Math.sqrt(n).toLocaleString(undefined,{maximumFractionDigits:6})}</strong>`:'Enter a non-negative number';};
    RUN();
  },

  // ─── SCIENTIFIC CALCULATOR ───
  sciCalc(){
    ui(`
      <input type="text" id="sc_d" readonly style="width:100%;border:1.5px solid var(--border);border-radius:8px;padding:14px;font-size:1.3rem;text-align:right;font-family:monospace;margin-bottom:10px;background:var(--gray-light);">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;" id="sc_keys"></div>`);
    const keys=['sin','cos','tan','(',')','7','8','9','/','√','4','5','6','*','^','1','2','3','-','C','0','.','π','+','='];
    let expr='';
    $('sc_keys').innerHTML=keys.map(k=>`<button class="btn ${k==='='?'btn-primary':'btn-outline'}" style="padding:12px 0;" data-k="${k}">${k}</button>`).join('');
    $('sc_keys').addEventListener('click',e=>{
      const k=e.target.dataset.k;if(!k)return;
      if(k==='C'){expr='';}
      else if(k==='='){try{let s=expr.replace(/√/g,'Math.sqrt').replace(/π/g,'Math.PI').replace(/\^/g,'**').replace(/sin/g,'Math.sin').replace(/cos/g,'Math.cos').replace(/tan/g,'Math.tan');expr=String(Function('return '+s)());}catch{expr='Error';}}
      else expr+=k;
      $('sc_d').value=expr;
    });
  },

  // ─── DICE / COIN / RANDOM PICKER / LIST RANDOMIZER ───
  diceRoller(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Number of dice</label><input type="number" id="dr_n" value="2" min="1" max="20"></div>
        <div class="form-group"><label>Sides</label><input type="number" id="dr_s" value="6" min="2" max="100"></div>
      </div>
      <button class="btn btn-primary" onclick="RUN()">🎲 Roll</button>
      <div id="t_out" style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary);text-align:center;margin-top:20px;padding:20px;background:var(--primary-light);border-radius:12px;"></div>`);
    window.RUN=()=>{const n=Math.min(+$('dr_n').value,20),s=+$('dr_s').value;const r=Array.from({length:n},()=>1+Math.floor(Math.random()*s));$('t_out').innerHTML=`${r.join(' + ')} = ${r.reduce((a,b)=>a+b,0)}`;};
    RUN();
  },
  coinFlip(){
    ui(`<button class="btn btn-primary" onclick="RUN()">🪙 Flip Coin</button><div id="t_out" style="font-family:var(--font-head);font-size:2.5rem;font-weight:800;color:var(--primary);text-align:center;margin-top:20px;padding:30px;background:var(--primary-light);border-radius:12px;"></div>`);
    window.RUN=()=>{$('t_out').textContent=Math.random()<.5?'🦅 Heads':'🪙 Tails';};
    RUN();
  },
  randomPicker(){
    ui(`
      <div class="form-group"><label>Enter items (one per line)</label><textarea class="tool-input-area" id="t_in" placeholder="Alice\nBob\nCharlie" rows="6"></textarea></div>
      <button class="btn btn-primary" onclick="RUN()">🎯 Pick Winner</button>
      <div id="t_out" style="font-family:var(--font-head);font-size:1.8rem;font-weight:800;color:var(--accent);text-align:center;margin-top:20px;padding:24px;background:var(--primary-light);border-radius:12px;"></div>`);
    window.RUN=()=>{const items=$('t_in').value.split('\n').map(s=>s.trim()).filter(Boolean);if(!items.length){$('t_out').textContent='Add some items first';return;}$('t_out').textContent='🏆 '+items[Math.floor(Math.random()*items.length)];};
  },
  listRandomizer(){
    ui(`
      <div class="form-group"><label>List (one per line)</label><textarea class="tool-input-area" id="t_in" placeholder="Item 1\nItem 2\nItem 3" rows="6"></textarea></div>
      <button class="btn btn-primary" onclick="RUN()">🔀 Shuffle</button>
      <textarea class="tool-output-area" id="t_out" readonly rows="6" style="margin-top:14px;"></textarea>`);
    window.RUN=()=>{const a=$('t_in').value.split('\n').filter(Boolean);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}$('t_out').value=a.join('\n');};
  },
  randomColor(){
    ui(`<button class="btn btn-primary" onclick="RUN()">🌈 Generate Color</button><div id="cc" style="height:120px;border-radius:12px;margin:16px 0;"></div><div class="tool-result-bar" id="t_out"></div>`);
    window.RUN=()=>{const h='#'+Array.from({length:6},()=>'0123456789ABCDEF'[Math.floor(Math.random()*16)]).join('');$('cc').style.background=h;$('t_out').textContent='HEX: '+h;};
    RUN();
  },
  pinGenerator(){
    ui(`<div class="form-group" style="max-width:200px;"><label>PIN length</label><input type="number" id="pn_l" value="6" min="3" max="12"></div><button class="btn btn-primary" onclick="RUN()" style="margin:14px 0;">🔢 Generate PIN</button><div id="t_out" style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary);text-align:center;padding:20px;background:var(--primary-light);border-radius:12px;letter-spacing:6px;"></div>`);
    window.RUN=()=>{const l=Math.min(+$('pn_l').value,12);const a=new Uint32Array(l);crypto.getRandomValues(a);$('t_out').textContent=Array.from(a,x=>x%10).join('');};
    RUN();
  },
  usernameGenerator(){
    const adj=['Cool','Swift','Epic','Cyber','Mega','Ninja','Shadow','Turbo','Pixel','Cosmic','Neon','Vivid','Quantum','Rapid','Solar'];
    const noun=['Tiger','Wolf','Eagle','Hawk','Phoenix','Dragon','Falcon','Panda','Raptor','Fox','Lion','Viper','Comet','Storm','Blaze'];
    ui(`<button class="btn btn-primary" onclick="RUN()">👤 Generate Usernames</button><textarea class="tool-output-area" id="t_out" readonly rows="6" style="margin-top:14px;"></textarea>`);
    window.RUN=()=>{$('t_out').value=Array.from({length:8},()=>adj[Math.floor(Math.random()*adj.length)]+noun[Math.floor(Math.random()*noun.length)]+Math.floor(Math.random()*100)).join('\n');};
    RUN();
  },

  // ─── DATE / TIME ───
  dateDiff(){
    ui(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;"><div class="form-group"><label>Start Date</label><input type="date" id="dd_a" oninput="RUN()"></div><div class="form-group"><label>End Date</label><input type="date" id="dd_b" oninput="RUN()"></div></div><div class="tool-result-bar" id="t_out" style="font-size:1.05rem;"></div>`);
    window.RUN=()=>{const a=new Date($('dd_a').value),b=new Date($('dd_b').value);if(isNaN(a)||isNaN(b))return;const days=Math.abs(Math.round((b-a)/864e5));$('t_out').innerHTML=`<strong>${days.toLocaleString()}</strong> days · ${Math.floor(days/7)} weeks · ~${(days/30.44).toFixed(1)} months`;};
  },
  timeDuration(){
    ui(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;"><div class="form-group"><label>Start Time</label><input type="time" id="td_a" value="09:00" oninput="RUN()"></div><div class="form-group"><label>End Time</label><input type="time" id="td_b" value="17:30" oninput="RUN()"></div></div><div class="tool-result-bar" id="t_out" style="font-size:1.1rem;"></div>`);
    window.RUN=()=>{const[ah,am]=$('td_a').value.split(':').map(Number),[bh,bm]=$('td_b').value.split(':').map(Number);let mins=(bh*60+bm)-(ah*60+am);if(mins<0)mins+=1440;$('t_out').innerHTML=`Duration: <strong>${Math.floor(mins/60)}h ${mins%60}m</strong>`;};
    RUN();
  },
  epochConverter(){
    ui(`
      <div class="form-group"><label>Unix Timestamp (seconds)</label><input type="number" id="ep_ts" oninput="E2D()"></div>
      <div class="form-group"><label>Human Date</label><input type="datetime-local" id="ep_dt" oninput="D2E()"></div>
      <button class="btn btn-outline" onclick="NOW()">Use Current Time</button>`);
    window.E2D=()=>{const raw=$('ep_ts').value.trim();if(raw==='')return;const t=Number(raw);if(!isFinite(t))return;$('ep_dt').value=new Date(t*1000).toISOString().slice(0,16);};
    window.D2E=()=>{const d=new Date($('ep_dt').value);if(isNaN(d))return;$('ep_ts').value=Math.floor(d.getTime()/1000);};
    window.NOW=()=>{$('ep_ts').value=Math.floor(Date.now()/1000);E2D();};
    NOW();
  },

  // ─── UNIT CONVERTERS (length, weight, speed, data, time, volume) ───
  lengthConverter(){ unitConv('length'); },
  weightConverter(){ unitConv('weight'); },
  speedConverter(){ unitConv('speed'); },
  dataConverter(){ unitConv('data'); },
  timeConverter(){ unitConv('time'); },
  volumeConverter(){ unitConv('volume'); },

  // ─── RATIO ───
  ratioCalc(){
    ui(`<div style="display:flex;gap:8px;align-items:center;"><input type="number" id="r_a" value="16" style="width:90px;"><span>:</span><input type="number" id="r_b" value="9" style="width:90px;"><button class="btn btn-primary" onclick="RUN()">Simplify</button></div><div class="tool-result-bar" id="t_out" style="font-size:1.1rem;"></div>`);
    const gcd=(a,b)=>b?gcd(b,a%b):a;
    window.RUN=()=>{const a=+$('r_a').value,b=+$('r_b').value,g=gcd(a,b)||1;$('t_out').innerHTML=`Simplified: <strong>${a/g} : ${b/g}</strong>`;};
    RUN();
  },

  // ─── BINARY TEXT / MORSE / UNICODE STYLE ───
  binaryText(){
    ui(io2('Text → Binary','Binary → Text'));
    window.E=()=>{$('t_out').value=$('t_in').value.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');};
    window.D=()=>{try{$('t_out').value=$('t_in').value.trim().split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join('');}catch{$('t_out').value='Invalid binary';}};
  },
  morseCode(){
    const M={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',' ':'/'};
    const R=Object.fromEntries(Object.entries(M).map(([k,v])=>[v,k]));
    ui(io2('Text → Morse','Morse → Text'));
    window.E=()=>{$('t_out').value=$('t_in').value.toUpperCase().split('').map(c=>M[c]||'').join(' ');};
    window.D=()=>{$('t_out').value=$('t_in').value.trim().split(' ').map(c=>R[c]||'').join('').replace(/\//g,' ');};
  },
  unicodeStyle(){
    ui(`<textarea class="tool-input-area" id="t_in" placeholder="Type text…" rows="3" oninput="RUN()"></textarea>
      <div style="margin-top:14px;"><label style="font-size:.85rem;font-weight:600;">Styled Output</label><div style="display:flex;gap:8px;"><input type="text" id="t_out" readonly style="flex:1;border:1.5px solid var(--border);border-radius:8px;padding:12px;font-size:1.1rem;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋</button></div></div>`);
    window.RUN=()=>{
      const t=$('t_in').value;
      // bold sans-serif unicode
      const out=t.split('').map(c=>{
        const code=c.charCodeAt(0);
        if(code>=65&&code<=90)return String.fromCodePoint(0x1D5D4+code-65);
        if(code>=97&&code<=122)return String.fromCodePoint(0x1D5EE+code-97);
        if(code>=48&&code<=57)return String.fromCodePoint(0x1D7EC+code-48);
        return c;
      }).join('');
      $('t_out').value=out;
    };
  },

  // ─── QR CODE ───
  qrCode(){
    ui(`
      <div class="form-group"><label>URL or Text</label><input type="text" id="t_in" value="https://usfreetools.com" oninput="RUN()"></div>
      <div id="qr_box" style="text-align:center;padding:20px;background:white;border-radius:12px;border:1px solid var(--border);"></div>`);
    window.RUN=()=>{const v=encodeURIComponent($('t_in').value||'');$('qr_box').innerHTML=v?`<img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${v}" alt="QR Code" width="240" height="240" loading="lazy">`:'';};
    RUN();
  },

  // ─── REGEX TESTER ───
  regexTester(){
    ui(`
      <div class="form-group"><label>Regular Expression</label><input type="text" id="rx_p" placeholder="\\d+" oninput="RUN()"></div>
      <div class="form-group"><label>Flags</label><input type="text" id="rx_f" value="g" oninput="RUN()" style="max-width:120px;"></div>
      <div class="form-group"><label>Test String</label><textarea class="tool-input-area" id="rx_s" placeholder="Test your text here…" rows="5" oninput="RUN()"></textarea></div>
      <div class="tool-result-bar" id="t_out"></div>`);
    window.RUN=()=>{
      try{const re=new RegExp($('rx_p').value,$('rx_f').value);const m=$('rx_s').value.match(re);$('t_out').textContent=m?`✅ ${m.length} match(es): ${m.slice(0,10).join(', ')}`:'No matches';}
      catch(e){$('t_out').textContent='❌ '+e.message;}
    };
  },

  // ─── JWT DECODER ───
  jwtDecoder(){
    ui(`
      <div class="form-group"><label>JWT Token</label><textarea class="tool-input-area" id="t_in" placeholder="eyJhb..." rows="4" oninput="RUN()"></textarea></div>
      <label style="font-size:.85rem;font-weight:600;">Decoded Payload</label>
      <textarea class="tool-output-area" id="t_out" readonly rows="8"></textarea>`);
    window.RUN=()=>{
      try{const parts=$('t_in').value.split('.');const dec=s=>JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))))),null,2);$('t_out').value='HEADER:\n'+dec(parts[0])+'\n\nPAYLOAD:\n'+dec(parts[1]);}
      catch(e){$('t_out').value='Invalid JWT token';}
    };
  },

  // ─── JSON ⇄ CSV ───
  jsonToCsv(){
    ui(`<div class="form-group"><label>JSON Array</label><textarea class="tool-input-area" id="t_in" placeholder='[{"name":"A","age":1}]' rows="6"></textarea></div><button class="btn btn-primary" onclick="RUN()">Convert to CSV</button><textarea class="tool-output-area" id="t_out" readonly rows="6" style="margin-top:14px;"></textarea><div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.RUN=()=>{try{const arr=JSON.parse($('t_in').value);const keys=[...new Set(arr.flatMap(o=>Object.keys(o)))];const rows=[keys.join(',')];arr.forEach(o=>rows.push(keys.map(k=>JSON.stringify(o[k]??'')).join(',')));$('t_out').value=rows.join('\n');}catch(e){$('t_out').value='Invalid JSON: '+e.message;}};
  },
  csvToJson(){
    ui(`<div class="form-group"><label>CSV Data</label><textarea class="tool-input-area" id="t_in" placeholder="name,age\nA,1" rows="6"></textarea></div><button class="btn btn-primary" onclick="RUN()">Convert to JSON</button><textarea class="tool-output-area" id="t_out" readonly rows="6" style="margin-top:14px;"></textarea><div class="tool-actions" style="margin-top:10px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`);
    window.RUN=()=>{const lines=$('t_in').value.trim().split('\n');const keys=lines[0].split(',').map(s=>s.trim());const out=lines.slice(1).map(l=>{const v=l.split(',');return Object.fromEntries(keys.map((k,i)=>[k,(v[i]||'').trim()]));});$('t_out').value=JSON.stringify(out,null,2);};
  },

  // ─── MINIFIERS / FORMATTERS ───
  cssMinifier(){ ui(io('Minify CSS')); window.RUN=()=>{$('t_out').value=$('t_in').value.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,])\s*/g,'$1').replace(/;}/g,'}').trim();}; },
  jsMinifier(){ ui(io('Minify JS')); window.RUN=()=>{$('t_out').value=$('t_in').value.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').trim();}; },
  sqlFormatter(){ ui(io('Format SQL')); window.RUN=()=>{let s=$('t_in').value.replace(/\s+/g,' ');['SELECT','FROM','WHERE','AND','OR','ORDER BY','GROUP BY','LEFT JOIN','INNER JOIN','JOIN','HAVING','LIMIT','INSERT INTO','VALUES','UPDATE','SET','DELETE'].forEach(k=>{s=s.replace(new RegExp('\\b'+k+'\\b','gi'),'\n'+k);});$('t_out').value=s.trim();}; },
  xmlFormatter(){ ui(io('Format XML')); window.RUN=()=>{let s=$('t_in').value.replace(/>\s*</g,'><');let f='',pad=0;s.split(/(<[^>]+>)/).filter(Boolean).forEach(n=>{if(n.match(/^<\//))pad--;f+='  '.repeat(Math.max(pad,0))+n.trim()+'\n';if(n.match(/^<[^/!?][^>]*[^/]>$/))pad++;});$('t_out').value=f.trim();}; },
  htmlMarkdown(){ ui(io('Convert to Markdown')); window.RUN=()=>{let s=$('t_in').value;s=s.replace(/<h1[^>]*>(.*?)<\/h1>/gi,'# $1\n').replace(/<h2[^>]*>(.*?)<\/h2>/gi,'## $1\n').replace(/<h3[^>]*>(.*?)<\/h3>/gi,'### $1\n').replace(/<strong[^>]*>(.*?)<\/strong>/gi,'**$1**').replace(/<b>(.*?)<\/b>/gi,'**$1**').replace(/<em[^>]*>(.*?)<\/em>/gi,'*$1*').replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,'[$2]($1)').replace(/<li[^>]*>(.*?)<\/li>/gi,'- $1\n').replace(/<[^>]+>/g,'').trim();$('t_out').value=s;}; },
  markdownPreview(){
    ui(`<div class="tool-row"><div class="tool-col"><label>Markdown</label><textarea class="tool-input-area" id="t_in" rows="10" placeholder="# Hello\n**bold** and *italic*" oninput="RUN()"></textarea></div><div class="tool-col"><label>Preview</label><div id="t_out" style="border:1.5px solid var(--border);border-radius:8px;padding:14px;min-height:200px;"></div></div></div>`);
    window.RUN=()=>{
      const safeUrl=u=>{const t=u.trim();return /^(https?:|mailto:|\/|#|\.)/i.test(t)?t.replace(/"/g,'%22'):'#';};
      let s=$('t_in').value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g,(m,txt,url)=>`<a href="${safeUrl(url)}" rel="nofollow noopener">${txt}</a>`)
        .replace(/^- (.*)$/gm,'<li>$1</li>').replace(/\n/g,'<br>');
      $('t_out').innerHTML=s;
    };
    RUN();
  },
  cronGenerator(){
    ui(`
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">
        <div class="form-group"><label>Min</label><input type="text" id="cr_min" value="*" oninput="RUN()"></div>
        <div class="form-group"><label>Hour</label><input type="text" id="cr_hr" value="*" oninput="RUN()"></div>
        <div class="form-group"><label>Day</label><input type="text" id="cr_dom" value="*" oninput="RUN()"></div>
        <div class="form-group"><label>Month</label><input type="text" id="cr_mon" value="*" oninput="RUN()"></div>
        <div class="form-group"><label>Weekday</label><input type="text" id="cr_dow" value="*" oninput="RUN()"></div>
      </div>
      <label style="font-size:.85rem;font-weight:600;">Cron Expression</label>
      <div style="display:flex;gap:8px;"><input type="text" id="t_out" readonly style="flex:1;border:1.5px solid var(--border);border-radius:8px;padding:12px;font-family:monospace;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋</button></div>`);
    window.RUN=()=>{$('t_out').value=`${$('cr_min').value} ${$('cr_hr').value} ${$('cr_dom').value} ${$('cr_mon').value} ${$('cr_dow').value}`;};
    RUN();
  },

  // ─── STOPWATCH ───
  stopwatch(){
    ui(`
      <div id="sw_disp" style="font-family:var(--font-head);font-size:3.2rem;font-weight:800;text-align:center;color:var(--primary);padding:24px;background:var(--primary-light);border-radius:14px;letter-spacing:2px;">00:00:00.0</div>
      <div class="tool-actions" style="justify-content:center;margin-top:16px;">
        <button class="btn btn-primary" id="sw_start" onclick="SW.toggle()">▶ Start</button>
        <button class="btn btn-outline" onclick="SW.lap()">⚑ Lap</button>
        <button class="btn btn-outline" onclick="SW.reset()">↺ Reset</button>
      </div>
      <div id="sw_laps" style="margin-top:16px;"></div>`);
    const d=$('sw_disp'), btn=$('sw_start');
    let t0=0, acc=0, timer=null, laps=[];
    function fmt(ms){const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),t=Math.floor(ms%1000/100);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${t}`;}
    function tick(){d.textContent=fmt(acc+(Date.now()-t0));}
    window.SW={
      toggle(){ if(timer){clearInterval(timer);timer=null;acc+=Date.now()-t0;btn.textContent='▶ Start';btn.className='btn btn-primary';} else {t0=Date.now();timer=setInterval(tick,100);btn.textContent='⏸ Pause';btn.className='btn btn-outline';} },
      lap(){ const cur=acc+(timer?Date.now()-t0:0); laps.unshift(fmt(cur)); $('sw_laps').innerHTML=laps.map((l,i)=>`<div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border);"><span>Lap ${laps.length-i}</span><span style="font-family:var(--font-mono);">${l}</span></div>`).join(''); },
      reset(){ clearInterval(timer);timer=null;acc=0;laps=[];d.textContent='00:00:00.0';$('sw_laps').innerHTML='';btn.textContent='▶ Start';btn.className='btn btn-primary'; }
    };
  },

  // ─── COUNTDOWN TIMER ───
  countdownTimer(){
    ui(`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
        <div class="form-group"><label>Hours</label><input type="number" id="cd_h" value="0" min="0" max="99"></div>
        <div class="form-group"><label>Minutes</label><input type="number" id="cd_m" value="5" min="0" max="59"></div>
        <div class="form-group"><label>Seconds</label><input type="number" id="cd_s" value="0" min="0" max="59"></div>
      </div>
      <div id="cd_disp" style="font-family:var(--font-head);font-size:3.2rem;font-weight:800;text-align:center;color:var(--primary);padding:24px;background:var(--primary-light);border-radius:14px;margin-top:14px;">05:00</div>
      <div class="tool-actions" style="justify-content:center;">
        <button class="btn btn-primary" id="cd_btn" onclick="CD.toggle()">▶ Start</button>
        <button class="btn btn-outline" onclick="CD.reset()">↺ Reset</button>
      </div>`);
    const d=$('cd_disp'),btn=$('cd_btn'); let remain=0,timer=null,running=false;
    function fmt(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');}
    function setFromInputs(){remain=(+$('cd_h').value||0)*3600+(+$('cd_m').value||0)*60+(+$('cd_s').value||0);d.textContent=fmt(remain);}
    ['cd_h','cd_m','cd_s'].forEach(id=>$(id).addEventListener('input',()=>{if(!running)setFromInputs();}));
    setFromInputs();
    window.CD={
      toggle(){ if(running){clearInterval(timer);running=false;btn.textContent='▶ Start';} else { if(remain<=0)setFromInputs(); if(remain<=0)return; running=true;btn.textContent='⏸ Pause'; timer=setInterval(()=>{remain--;d.textContent=fmt(remain);if(remain<=0){clearInterval(timer);running=false;btn.textContent='▶ Start';d.style.color='var(--accent)';d.textContent="Time is up!";}},1000); } },
      reset(){ clearInterval(timer);running=false;d.style.color='var(--primary)';btn.textContent='▶ Start';setFromInputs(); }
    };
  },

  // ─── IMAGE RESIZER ───
  imageResizer(){
    ui(`
      <input type="file" id="ir_file" accept="image/*" style="margin-bottom:14px;">
      <div id="ir_ctrls" style="display:none;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div class="form-group"><label>Width (px)</label><input type="number" id="ir_w"></div>
          <div class="form-group"><label>Height (px)</label><input type="number" id="ir_h"></div>
        </div>
        <label style="display:flex;align-items:center;gap:8px;margin:8px 0;"><input type="checkbox" id="ir_lock" checked> Maintain aspect ratio</label>
        <button class="btn btn-primary" onclick="IR.go()">Resize & Download</button>
      </div>
      <canvas id="ir_cv" style="display:none;"></canvas>
      <div id="ir_prev" style="margin-top:14px;"></div>`);
    let img=new Image(),ratio=1;
    $('ir_file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{img.onload=()=>{ratio=img.width/img.height;$('ir_w').value=img.width;$('ir_h').value=img.height;$('ir_ctrls').style.display='block';$('ir_prev').innerHTML=`<p style="color:var(--gray);font-size:.85rem;">Original: ${img.width}×${img.height}px</p>`;};img.src=ev.target.result;};r.readAsDataURL(f);});
    $('ir_w').addEventListener('input',()=>{if($('ir_lock').checked)$('ir_h').value=Math.round($('ir_w').value/ratio);});
    $('ir_h').addEventListener('input',()=>{if($('ir_lock').checked)$('ir_w').value=Math.round($('ir_h').value*ratio);});
    window.IR={go(){const w=+$('ir_w').value,h=+$('ir_h').value,cv=$('ir_cv');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(img,0,0,w,h);const a=document.createElement('a');a.download=`resized-${w}x${h}.png`;a.href=cv.toDataURL('image/png');a.click();}};
  },

  // ─── IMAGE COMPRESSOR ───
  imageCompressor(){
    ui(`
      <input type="file" id="ic_file" accept="image/*" style="margin-bottom:14px;">
      <div id="ic_ctrls" style="display:none;">
        <label style="display:block;font-weight:600;font-size:.85rem;margin-bottom:6px;">Quality: <span id="ic_qv">80</span>%</label>
        <input type="range" id="ic_q" min="10" max="100" value="80" style="width:100%;" oninput="document.getElementById('ic_qv').textContent=this.value">
        <button class="btn btn-primary" style="margin-top:12px;" onclick="IC.go()">Compress & Download</button>
        <div id="ic_info" style="margin-top:12px;color:var(--gray);font-size:.85rem;"></div>
      </div>
      <canvas id="ic_cv" style="display:none;"></canvas>`);
    let img=new Image(),origSize=0;
    $('ic_file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;origSize=f.size;const r=new FileReader();r.onload=ev=>{img.onload=()=>{$('ic_ctrls').style.display='block';$('ic_info').textContent=`Original size: ${(origSize/1024).toFixed(1)} KB`;};img.src=ev.target.result;};r.readAsDataURL(f);});
    window.IC={go(){const cv=$('ic_cv');cv.width=img.width;cv.height=img.height;cv.getContext('2d').drawImage(img,0,0);const q=+$('ic_q').value/100;cv.toBlob(blob=>{const a=document.createElement('a');a.download='compressed.jpg';a.href=URL.createObjectURL(blob);a.click();$('ic_info').textContent=`Original: ${(origSize/1024).toFixed(1)} KB → Compressed: ${(blob.size/1024).toFixed(1)} KB (${Math.round((1-blob.size/origSize)*100)}% smaller)`;},'image/jpeg',q);}};
  },

  // ─── IMAGE FORMAT CONVERT (png<->jpg) ───
  imageConvert(){
    const cont=$('toolContainer'); const target=(cont&&cont.getAttribute('data-target'))||'image/png';
    const ext=target==='image/jpeg'?'jpg':'png';
    ui(`
      <input type="file" id="im_file" accept="image/*" style="margin-bottom:14px;">
      <div id="im_ctrls" style="display:none;">
        <p style="color:var(--gray);font-size:.9rem;margin-bottom:12px;">Your image will be converted to <strong>.${ext}</strong>, processed entirely in your browser.</p>
        <button class="btn btn-primary" onclick="IM.go()">Convert & Download .${ext}</button>
      </div>
      <canvas id="im_cv" style="display:none;"></canvas>`);
    let img=new Image();
    $('im_file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{img.onload=()=>{$('im_ctrls').style.display='block';};img.src=ev.target.result;};r.readAsDataURL(f);});
    window.IM={go(){const cv=$('im_cv');cv.width=img.width;cv.height=img.height;const ctx=cv.getContext('2d');if(target==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);}ctx.drawImage(img,0,0);const a=document.createElement('a');a.download='converted.'+ext;a.href=cv.toDataURL(target,0.92);a.click();}};
  },

  // ─── COLOR PALETTE GENERATOR ───
  colorPalette(){
    ui(`
      <div class="tool-actions"><button class="btn btn-primary" onclick="CP.gen()">🎨 Generate Palette</button>
      <button class="btn btn-outline" onclick="CP.gen()">↻ Shuffle</button></div>
      <div id="cp_out" style="display:grid;grid-template-columns:repeat(5,1fr);gap:0;margin-top:16px;border-radius:12px;overflow:hidden;"></div>
      <p style="color:var(--gray);font-size:.82rem;margin-top:10px;text-align:center;">Click any swatch to copy its HEX code.</p>`);
    function rc(){return '#'+Array.from({length:3},()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('');}
    window.CP={gen(){const cols=Array.from({length:5},rc);$('cp_out').innerHTML=cols.map(c=>`<div onclick="copyText('${c}',this)" style="background:${c};height:150px;display:flex;align-items:flex-end;justify-content:center;cursor:pointer;"><span style="background:rgba(255,255,255,.9);padding:3px 8px;margin-bottom:10px;border-radius:5px;font-family:var(--font-mono);font-size:.8rem;font-weight:600;">${c}</span></div>`).join('');}};
    CP.gen();
  },

  // ─── GRADE CALCULATOR ───
  gradeCalc(){
    ui(`
      <p style="color:var(--gray);font-size:.9rem;margin-bottom:10px;">Enter each score and its weight (%).</p>
      <div id="gc_rows"></div>
      <div class="tool-actions"><button class="btn btn-outline" onclick="GC.add()">+ Add Row</button>
      <button class="btn btn-primary" onclick="GC.calc()">Calculate Grade</button></div>
      <div id="gc_out" style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary);text-align:center;margin-top:18px;padding:20px;background:var(--primary-light);border-radius:12px;display:none;"></div>`);
    function row(s='',w=''){return `<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:8px;"><input type="number" placeholder="Score %" class="gc_s" value="${s}"><input type="number" placeholder="Weight %" class="gc_w" value="${w}"><button class="btn btn-outline" onclick="this.parentElement.remove()">✕</button></div>`;}
    $('gc_rows').innerHTML=row('90','40')+row('85','60');
    window.GC={
      add(){$('gc_rows').insertAdjacentHTML('beforeend',row());},
      calc(){const ss=[...document.querySelectorAll('.gc_s')].map(e=>+e.value||0),ws=[...document.querySelectorAll('.gc_w')].map(e=>+e.value||0);const tw=ws.reduce((a,b)=>a+b,0);if(!tw){$('gc_out').style.display='block';$('gc_out').textContent='Enter weights';return;}const g=ss.reduce((a,s,i)=>a+s*ws[i],0)/tw;const L=g>=93?'A':g>=90?'A-':g>=87?'B+':g>=83?'B':g>=80?'B-':g>=77?'C+':g>=73?'C':g>=70?'C-':g>=60?'D':'F';$('gc_out').style.display='block';$('gc_out').innerHTML=`${g.toFixed(2)}% &nbsp;(${L})`;}
    };
  },

  // ─── READING TIME CALCULATOR ───
  readingTime(){
    ui(`
      <textarea class="tool-input-area" id="rt_in" placeholder="Paste your text here…" rows="8"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin:12px 0;"><label style="font-weight:600;font-size:.85rem;">Reading speed:</label>
      <select id="rt_wpm"><option value="200">Average (200 wpm)</option><option value="150">Slow (150 wpm)</option><option value="265">Fast (265 wpm)</option></select></div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="rt_words">0</strong><span>Words</span></div>
        <div class="stat-box"><strong id="rt_read">0 min</strong><span>Reading Time</span></div>
        <div class="stat-box"><strong id="rt_speak">0 min</strong><span>Speaking Time</span></div>
      </div>`);
    const a=$('rt_in');
    function upd(){const t=a.value.trim();const w=t?t.split(/\s+/).length:0;const wpm=+$('rt_wpm').value;$('rt_words').textContent=w.toLocaleString();$('rt_read').textContent=Math.max(1,Math.ceil(w/wpm))+' min';$('rt_speak').textContent=Math.max(1,Math.ceil(w/130))+' min';}
    a.addEventListener('input',upd);$('rt_wpm').addEventListener('change',upd);upd();
  },

  // ─── WHEEL SPINNER / RANDOM NAME PICKER ───
  wheelSpinner(){
    ui(`
      <textarea class="tool-input-area" id="ws_in" placeholder="Enter names or options, one per line…" rows="6">Alice
Bob
Charlie
Dana</textarea>
      <div class="tool-actions"><button class="btn btn-primary" onclick="WS.spin()">🎡 Pick a Winner</button></div>
      <div id="ws_out" style="font-family:var(--font-head);font-size:2.2rem;font-weight:800;color:var(--accent);text-align:center;margin-top:18px;padding:28px;background:var(--primary-light);border-radius:12px;min-height:40px;">—</div>`);
    window.WS={spin(){const items=$('ws_in').value.split(/\n/).map(s=>s.trim()).filter(Boolean);if(!items.length){$('ws_out').textContent='Add some options';return;}let n=0;const max=18+Math.floor(Math.random()*8);const iv=setInterval(()=>{$('ws_out').textContent=items[Math.floor(Math.random()*items.length)];if(++n>=max){clearInterval(iv);$('ws_out').textContent='🎉 '+items[Math.floor(Math.random()*items.length)];}},80);}};
  },

  // ─── PROFIT MARGIN CALCULATOR ───
  profitMargin(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label>Cost ($)</label><input type="number" id="pm_cost" value="40" oninput="RUN()"></div>
        <div class="form-group"><label>Revenue / Selling Price ($)</label><input type="number" id="pm_rev" value="100" oninput="RUN()"></div>
      </div>
      <div class="tool-stats" style="margin-top:8px;">
        <div class="stat-box"><strong id="pm_profit">—</strong><span>Profit</span></div>
        <div class="stat-box"><strong id="pm_margin">—</strong><span>Margin</span></div>
        <div class="stat-box"><strong id="pm_markup">—</strong><span>Markup</span></div>
      </div>`);
    window.RUN=()=>{
      const cost=+$('pm_cost').value||0, rev=+$('pm_rev').value||0;
      const profit=rev-cost;
      const margin=rev?(profit/rev*100):0;
      const markup=cost?(profit/cost*100):0;
      $('pm_profit').textContent='$'+profit.toFixed(2);
      $('pm_margin').textContent=margin.toFixed(1)+'%';
      $('pm_markup').textContent=markup.toFixed(1)+'%';
    };
    RUN();
  },

  // ─── PAY RAISE CALCULATOR ───
  payRaise(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Pay type</label><select id="pr_type" onchange="TYPE()"><option value="yr" selected>Annual salary</option><option value="hr">Hourly wage</option></select></div>
        <div class="form-group"><label id="pr_curlbl">Current salary ($ per year)</label><input type="number" id="pr_cur" value="50000" min="0" oninput="RUN()"></div>
        <div class="form-group"><label>Raise given as</label><select id="pr_mode" onchange="RUN()"><option value="pct" selected>Percent (%)</option><option value="amt">Dollar amount ($)</option></select></div>
        <div class="form-group"><label id="pr_pctlbl">Raise (%)</label><input type="number" id="pr_pct" value="4" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Hours per week</label><input type="number" id="pr_hrs" value="40" min="1" max="100" oninput="RUN()"></div>
        <div class="form-group"><label>Project over (years)</label><input type="number" id="pr_yrs" value="5" min="1" max="40" oninput="RUN()"></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="pr_new">—</strong><span>New annual pay</span></div>
        <div class="stat-box"><strong id="pr_newhr">—</strong><span>New hourly rate</span></div>
        <div class="stat-box"><strong id="pr_inc">—</strong><span>Raise per year</span></div>
        <div class="stat-box"><strong id="pr_month">—</strong><span>Raise per month</span></div>
        <div class="stat-box"><strong id="pr_check">—</strong><span>Per biweekly check</span></div>
        <div class="stat-box"><strong id="pr_eff">—</strong><span>Raise as a %</span></div>
      </div>
      <p class="tool-note" id="pr_proj">—</p>`);
    const usd=(x,d)=>'$'+x.toLocaleString('en-US',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});
    window.TYPE=()=>{
      const hr=$('pr_type').value==='hr', cur=$('pr_cur');
      $('pr_curlbl').textContent=hr?'Current wage ($ per hour)':'Current salary ($ per year)';
      if(hr&&+cur.value>500) cur.value=(+cur.value/(+$('pr_hrs').value||40)/52).toFixed(2);
      else if(!hr&&+cur.value<=500) cur.value=Math.round(+cur.value*(+$('pr_hrs').value||40)*52);
      RUN();
    };
    window.RUN=()=>{
      const hr=$('pr_type').value==='hr', hrs=+$('pr_hrs').value||40, yrs=Math.min(Math.max(Math.round(+$('pr_yrs').value||1),1),40);
      const cur=+$('pr_cur').value||0, mode=$('pr_mode').value, val=+$('pr_pct').value||0;
      $('pr_pctlbl').textContent=mode==='pct'?'Raise (%)':(hr?'Raise ($ per hour)':'Raise ($ per year)');
      const annual=hr?cur*hrs*52:cur;
      const incAnnual=mode==='pct'?annual*val/100:(hr?val*hrs*52:val);
      const nw=annual+incAnnual, rate=annual>0?incAnnual/annual:0;
      $('pr_new').textContent=usd(nw); $('pr_newhr').textContent=usd(nw/hrs/52,2);
      $('pr_inc').textContent=usd(incAnnual); $('pr_month').textContent=usd(incAnnual/12);
      $('pr_check').textContent=usd(incAnnual/26); $('pr_eff').textContent=(Math.round(rate*1000)/10)+'%';
      if(annual>0&&rate>0){
        let pay=annual, extra=0; for(let k=1;k<=yrs;k++){ pay*=1+rate; extra+=pay-annual; }
        $('pr_proj').textContent='If you got the same '+(Math.round(rate*1000)/10)+'% raise every year, your pay would reach '+usd(pay)+' a year after '+yrs+' raise'+(yrs>1?'s':'')+' — '+usd(extra)+' more earned in total than with no raises. Figures are before tax.';
      } else $('pr_proj').textContent='Enter your current pay and a raise to see the result. Figures are before tax.';
    };
    RUN();
  },

  // ─── FREELANCE HOURLY RATE CALCULATOR ───
  freelanceRate(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label>Desired Annual Income ($)</label><input type="number" id="fr_income" value="80000" oninput="RUN()"></div>
        <div class="form-group"><label>Annual Business Expenses ($)</label><input type="number" id="fr_exp" value="10000" oninput="RUN()"></div>
        <div class="form-group"><label>Billable Hours per Week</label><input type="number" id="fr_hours" value="25" oninput="RUN()"></div>
        <div class="form-group"><label>Working Weeks per Year</label><input type="number" id="fr_weeks" value="48" oninput="RUN()"></div>
      </div>
      <div class="tool-stats" style="margin-top:8px;">
        <div class="stat-box"><strong id="fr_rate">—</strong><span>Hourly Rate</span></div>
        <div class="stat-box"><strong id="fr_day">—</strong><span>Day Rate (8h)</span></div>
        <div class="stat-box"><strong id="fr_total">—</strong><span>Billable Hrs/Yr</span></div>
      </div>`);
    window.RUN=()=>{
      const income=+$('fr_income').value||0, exp=+$('fr_exp').value||0;
      const hours=+$('fr_hours').value||0, weeks=+$('fr_weeks').value||0;
      const billable=hours*weeks;
      const rate=billable?((income+exp)/billable):0;
      $('fr_rate').textContent='$'+rate.toFixed(2);
      $('fr_day').textContent='$'+(rate*8).toFixed(2);
      $('fr_total').textContent=billable.toLocaleString();
    };
    RUN();
  },

  // ─── CPM CALCULATOR ───
  cpmCalc(){
    ui(`
      <p style="color:var(--gray);font-size:.88rem;margin-bottom:10px;">Enter any two values and the third is calculated. CPM = cost per 1,000 impressions.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
        <div class="form-group"><label>Total Cost ($)</label><input type="number" id="cpm_cost" value="500" oninput="CPM.calc('cost')"></div>
        <div class="form-group"><label>Impressions</label><input type="number" id="cpm_imp" value="100000" oninput="CPM.calc('imp')"></div>
        <div class="form-group"><label>CPM ($)</label><input type="number" id="cpm_cpm" value="5" oninput="CPM.calc('cpm')"></div>
      </div>
      <div id="cpm_out" style="font-family:var(--font-head);font-size:1.3rem;font-weight:700;color:var(--primary);text-align:center;margin-top:14px;padding:16px;background:var(--primary-light);border-radius:12px;"></div>`);
    window.CPM={calc(changed){
      let cost=+$('cpm_cost').value||0, imp=+$('cpm_imp').value||0, cpm=+$('cpm_cpm').value||0;
      // recompute the field NOT being edited, preferring to solve for the empty/derived one
      if(changed==='cost'||changed==='imp'){ if(imp>0){ cpm=cost/imp*1000; $('cpm_cpm').value=cpm.toFixed(2);} }
      else if(changed==='cpm'){ if(imp>0){ cost=cpm*imp/1000; $('cpm_cost').value=cost.toFixed(2);} }
      $('cpm_out').textContent=`CPM $${cpm.toFixed(2)} · ${imp.toLocaleString()} impressions · $${cost.toFixed(2)} total`;
    }};
    CPM.calc('cost');
  },
  cubicYardCalc(){
    ui(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group"><label>Shape</label><select id="cy_shape" onchange="SHAPE()"><option value="rect" selected>Rectangle or square</option><option value="circle">Circle (round bed, column, hole)</option><option value="tri">Triangle</option></select></div>
        <div class="form-group"><label>Add for waste / settling (%)</label><input type="number" id="cy_extra" value="10" min="0" max="50" oninput="RUN()"></div>
        <div class="form-group" id="cy_a_g"><label id="cy_a_l">Length (ft)</label><input type="number" id="cy_a" value="10" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group" id="cy_b_g"><label id="cy_b_l">Width (ft)</label><input type="number" id="cy_b" value="10" min="0" step="0.1" oninput="RUN()"></div>
        <div class="form-group"><label>Depth or thickness</label><input type="number" id="cy_d" value="4" min="0" step="0.25" oninput="RUN()"></div>
        <div class="form-group"><label>Depth unit</label><select id="cy_du" onchange="RUN()"><option value="in" selected>inches</option><option value="ft">feet</option></select></div>
      </div>
      <div class="tool-stats">
        <div class="stat-box"><strong id="cy_yd">—</strong><span>Cubic yards</span></div>
        <div class="stat-box"><strong id="cy_yd2">—</strong><span id="cy_yd2l">With 10% extra</span></div>
        <div class="stat-box"><strong id="cy_ft">—</strong><span>Cubic feet</span></div>
        <div class="stat-box"><strong id="cy_m">—</strong><span>Cubic meters</span></div>
        <div class="stat-box"><strong id="cy_area">—</strong><span>Area (sq ft)</span></div>
      </div>
      <p class="tool-note">Cubic yards = length × width × depth (all in feet) ÷ 27. One cubic yard is a 3 × 3 × 3 ft cube.</p>`);
    window.SHAPE=()=>{
      const s=$('cy_shape').value;
      $('cy_a_l').textContent=s==='circle'?'Diameter (ft)':(s==='tri'?'Base (ft)':'Length (ft)');
      $('cy_b_l').textContent=s==='tri'?'Height of triangle (ft)':'Width (ft)';
      $('cy_b_g').style.display=s==='circle'?'none':'';
      RUN();
    };
    window.RUN=()=>{
      const s=$('cy_shape').value, a=+$('cy_a').value||0, b=+$('cy_b').value||0;
      const d=(+$('cy_d').value||0)/($('cy_du').value==='in'?12:1), ex=Math.max(+$('cy_extra').value||0,0);
      const area=s==='circle'?Math.PI*a*a/4:(s==='tri'?a*b/2:a*b), cf=area*d, yd=cf/27;
      const f=(x,p)=>x>0?x.toLocaleString('en-US',{minimumFractionDigits:p,maximumFractionDigits:p}):'—';
      $('cy_yd').textContent=f(yd,2); $('cy_yd2').textContent=f(yd*(1+ex/100),2); $('cy_yd2l').textContent='With '+ex+'% extra';
      $('cy_ft').textContent=f(cf,1); $('cy_m').textContent=f(cf*0.0283168,2); $('cy_area').textContent=f(area,1);
    };
    RUN();
  },
  placeholderImg(){
    ui(`
      <div class="form-group"><label>Preset size</label><select id="ph_pre" onchange="PRE()">
        <option value="">Custom</option>
        <option value="1200x630" selected>1200 × 630 — Open Graph / link preview</option>
        <option value="1600x900">1600 × 900 — 16:9 image</option>
        <option value="1280x720">1280 × 720 — YouTube thumbnail</option>
        <option value="1080x1080">1080 × 1080 — square post</option>
        <option value="1080x1350">1080 × 1350 — portrait post (4:5)</option>
        <option value="1080x1920">1080 × 1920 — story / reel (9:16)</option>
        <option value="1500x500">1500 × 500 — X header</option>
        <option value="728x90">728 × 90 — leaderboard banner</option>
        <option value="300x250">300 × 250 — medium rectangle</option>
        <option value="160x600">160 × 600 — wide skyscraper</option>
        <option value="512x512">512 × 512 — app icon</option>
      </select></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;">
        <div class="form-group"><label>Width (px)</label><input type="number" id="ph_w" value="1200" min="1" max="4000" oninput="$('ph_pre').value='';RUN()"></div>
        <div class="form-group"><label>Height (px)</label><input type="number" id="ph_h" value="630" min="1" max="4000" oninput="$('ph_pre').value='';RUN()"></div>
        <div class="form-group"><label>Background</label><input type="color" id="ph_bg" value="#d9dde5" oninput="RUN()" style="width:100%;height:46px;padding:4px;border-radius:11px;border:1px solid var(--border-strong);"></div>
        <div class="form-group"><label>Text color</label><input type="color" id="ph_fg" value="#4a5160" oninput="RUN()" style="width:100%;height:46px;padding:4px;border-radius:11px;border:1px solid var(--border-strong);"></div>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:14px;">
        <div class="form-group"><label>Text (leave blank to show the size)</label><input type="text" id="ph_t" value="" placeholder="1200 × 630" oninput="RUN()"></div>
        <div class="form-group"><label>Format</label><select id="ph_f" onchange="RUN()"><option value="png" selected>PNG</option><option value="jpeg">JPG</option><option value="webp">WebP</option></select></div>
      </div>
      <canvas id="ph_c" width="1200" height="630" aria-label="Placeholder image preview"></canvas>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
        <button type="button" id="ph_dl" onclick="DL()">Download image</button>
      </div>
      <p class="tool-note" id="ph_info">Made in your browser — nothing is uploaded.</p>`);
    window.PRE=()=>{ const v=$('ph_pre').value; if(!v)return; const [w,h]=v.split('x'); $('ph_w').value=w; $('ph_h').value=h; RUN(); };
    window.RUN=()=>{
      const c=$('ph_c'), x=c.getContext('2d');
      const w=Math.min(Math.max(Math.round(+$('ph_w').value||1),1),4000), h=Math.min(Math.max(Math.round(+$('ph_h').value||1),1),4000);
      c.width=w; c.height=h;
      x.fillStyle=$('ph_bg').value; x.fillRect(0,0,w,h);
      const t=$('ph_t').value.trim()||(w+' × '+h);
      let fs=Math.max(Math.round(Math.min(w/(t.length*0.62),h*0.5)),8);
      x.fillStyle=$('ph_fg').value; x.font='600 '+fs+'px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      x.textAlign='center'; x.textBaseline='middle'; x.fillText(t,w/2,h/2);
      $('ph_info').textContent=w+' × '+h+' px · '+$('ph_f').value.toUpperCase().replace('JPEG','JPG')+' · made in your browser — nothing is uploaded.';
    };
    window.DL=()=>{
      const f=$('ph_f').value, a=document.createElement('a');
      a.download='placeholder-'+$('ph_c').width+'x'+$('ph_c').height+'.'+(f==='jpeg'?'jpg':f);
      a.href=$('ph_c').toDataURL('image/'+f,0.92); document.body.appendChild(a); a.click(); a.remove();
    };
    RUN();
  },
};

// ─── Shared UI builders ───
function io(btnLabel){
  return `<textarea class="tool-input-area" id="t_in" placeholder="Enter text…" rows="5"></textarea>
    <div class="tool-actions"><button class="btn btn-primary" onclick="RUN()">${btnLabel}</button>
    <button class="btn btn-outline" onclick="document.getElementById('t_in').value='';document.getElementById('t_out').value='';">🗑️ Clear</button></div>
    <textarea class="tool-output-area" id="t_out" readonly rows="5" style="margin-top:8px;"></textarea>
    <div class="tool-actions" style="margin-top:8px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`;
}
function io2(b1,b2){
  return `<textarea class="tool-input-area" id="t_in" placeholder="Enter text…" rows="5"></textarea>
    <div class="tool-actions"><button class="btn btn-primary" onclick="E()">${b1}</button>
    <button class="btn btn-outline" onclick="D()">${b2}</button>
    <button class="btn btn-outline" onclick="document.getElementById('t_in').value='';document.getElementById('t_out').value='';">🗑️ Clear</button></div>
    <textarea class="tool-output-area" id="t_out" readonly rows="5" style="margin-top:8px;"></textarea>
    <div class="tool-actions" style="margin-top:8px;"><button class="btn btn-outline" onclick="copyText(document.getElementById('t_out').value,this)">📋 Copy</button></div>`;
}
function initTabsIn(c){
  const tabs=c.querySelectorAll('.tab'),panels=c.querySelectorAll('.tab-panel');
  tabs.forEach((t,i)=>t.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));panels.forEach(p=>p.classList.remove('active'));t.classList.add('active');if(panels[i])panels[i].classList.add('active');}));
}
function loanImpl(label){
  ui(`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
      <div class="form-group"><label>Amount ($)</label><input type="number" id="ln_p" value="20000" oninput="RUN()"></div>
      <div class="form-group"><label>Rate (% APR)</label><input type="number" id="ln_r" value="6.5" step="0.1" oninput="RUN()"></div>
      <div class="form-group"><label>Term (years)</label><input type="number" id="ln_y" value="5" oninput="RUN()"></div>
    </div>
    <div class="tool-stats">
      <div class="stat-box"><strong id="ln_m">$0</strong><span>Monthly</span></div>
      <div class="stat-box"><strong id="ln_t">$0</strong><span>Total Paid</span></div>
      <div class="stat-box"><strong id="ln_i">$0</strong><span>Total Interest</span></div>
    </div>`);
  window.RUN=()=>{
    const p=parseFloat($('ln_p').value)||0,r=(parseFloat($('ln_r').value)||0)/100/12,n=(parseInt($('ln_y').value)||0)*12;
    let m=r>0?p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):p/n;
    if(!isFinite(m))m=0;
    $('ln_m').textContent='$'+m.toLocaleString(undefined,{maximumFractionDigits:2});
    $('ln_t').textContent='$'+(m*n).toLocaleString(undefined,{maximumFractionDigits:0});
    $('ln_i').textContent='$'+(m*n-p).toLocaleString(undefined,{maximumFractionDigits:0});
  };
  RUN();
}
function unitConv(type){
  const UNITS={
    length:{m:1,km:1000,cm:0.01,mm:0.001,mi:1609.34,yd:0.9144,ft:0.3048,in:0.0254},
    weight:{kg:1,g:0.001,mg:1e-6,lb:0.453592,oz:0.0283495,st:6.35029,t:1000},
    speed:{'m/s':1,'km/h':0.277778,mph:0.44704,knot:0.514444},
    data:{B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776},
    time:{sec:1,min:60,hour:3600,day:86400,week:604800},
    volume:{L:1,mL:0.001,gal:3.78541,qt:0.946353,pt:0.473176,cup:0.236588}
  };
  const u=UNITS[type],keys=Object.keys(u);
  const cont=$('toolContainer');
  const df=(cont&&cont.getAttribute('data-from'))||keys[0];
  const dt=(cont&&cont.getAttribute('data-to'))||keys[1];
  const dv=(cont&&cont.getAttribute('data-value'))||'1';
  ui(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end;">
      <div class="form-group"><label>From</label><input type="number" id="uc_v" value="${dv}" oninput="RUN()"><select id="uc_f" onchange="RUN()" style="margin-top:8px;">${keys.map(k=>`<option ${k===df?'selected':''}>${k}</option>`).join('')}</select></div>
      <div class="form-group"><label>To</label><input type="text" id="uc_o" readonly><select id="uc_t" onchange="RUN()" style="margin-top:8px;">${keys.map(k=>`<option ${k===dt?'selected':''}>${k}</option>`).join('')}</select></div>
    </div>`);
  window.RUN=()=>{const v=parseFloat($('uc_v').value)||0;const base=v*u[$('uc_f').value];$('uc_o').value=(base/u[$('uc_t').value]).toLocaleString(undefined,{maximumFractionDigits:6});};
  RUN();
}

// ─── BOOT ───
document.addEventListener('DOMContentLoaded',()=>{
  const c=$('toolContainer');
  if(!c)return;
  const impl=c.getAttribute('data-impl');
  if(impl&&IMPL[impl])IMPL[impl]();
});
})();
