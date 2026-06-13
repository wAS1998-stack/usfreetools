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
function ui(html){ const c=$('toolContainer'); if(c) c.innerHTML=html; }

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
  mortgageCalc(){ loanImpl('Mortgage'); },

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
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label>Current Salary ($)</label><input type="number" id="pr_cur" value="50000" oninput="RUN()"></div>
        <div class="form-group"><label>Raise (%)</label><input type="number" id="pr_pct" value="5" oninput="RUN()"></div>
      </div>
      <div class="tool-stats" style="margin-top:8px;">
        <div class="stat-box"><strong id="pr_new">—</strong><span>New Salary</span></div>
        <div class="stat-box"><strong id="pr_inc">—</strong><span>Annual Increase</span></div>
        <div class="stat-box"><strong id="pr_month">—</strong><span>Extra per Month</span></div>
      </div>`);
    window.RUN=()=>{
      const cur=+$('pr_cur').value||0, pct=+$('pr_pct').value||0;
      const inc=cur*pct/100, nw=cur+inc;
      $('pr_new').textContent='$'+nw.toLocaleString(undefined,{maximumFractionDigits:0});
      $('pr_inc').textContent='$'+inc.toLocaleString(undefined,{maximumFractionDigits:0});
      $('pr_month').textContent='$'+(inc/12).toLocaleString(undefined,{maximumFractionDigits:0});
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
  ui(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end;">
      <div class="form-group"><label>From</label><input type="number" id="uc_v" value="1" oninput="RUN()"><select id="uc_f" onchange="RUN()" style="margin-top:8px;">${keys.map(k=>`<option ${k===df?'selected':''}>${k}</option>`).join('')}</select></div>
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
