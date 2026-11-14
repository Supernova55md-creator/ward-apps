/* 病棟アプリ共通：患者プロファイル（ward-apps/profile.js）
   各アプリの </body> 直前に <script src="../profile.js" defer></script>（入口は src="profile.js"）。
   - localStorage "ward-profile" に {v:1, age, sex, weight, renal, liver, preg, at, updatedAt} を保存。氏名・IDは入れない。
   - ヘッダー直下に1行の帯で常に表示。12時間を過ぎたら「別の患者ですか？」。帯をタップで編集、「新しい患者」で全消去。
   - API：WardProfile.get() / set(patch|null) / onChange(fn) / clear() / open() / label(p) / FIELDS
   - data属性だけで各アプリの入力と連動する（書き方は下の「data属性」）。

   値（コード）
     age    : "lt65"（65未満） "65-74" "ge75"（75以上）
     sex    : "m" "f"
     weight : 数値（kg、任意）
     renal  : "ge60" "30-59" "15-29" "lt15"（15未満・透析）   ※eGFR・CCr のどちらでも同じ区分
     liver  : "normal"（正常・Child-Pugh A）"cpB" "cpC"
     preg   : "none" "preg"（妊娠中） "lact"（授乳中）
     at     : "none" "ap"（抗血小板） "ac"（抗凝固） "both"（両方）
     未設定の項目は null。

   data属性
     data-wp="項目" data-wp-v="コード[,コード]"
       <input type=radio|checkbox> … プロファイルが一致すれば checked にする
       <option>（親の <select data-wp="項目"> 側でも可） … 一致する option を選ぶ
       ボタンなどその他の要素 … 一致して未選択（aria-pressed/aria-checked/aria-selected が true、
                               または class に on/active/sel/selected/is-on が無い）なら click() する
     data-wp="weight" を <input type=number|text> に … 体重を入れる
     data-wp-show="項目:コード[,コード]" … 一致するときだけ表示（それ以外は hidden）
     data-wp-ro … アプリ側で変えてもプロファイルに書き戻さない（読み取り専用）
     data-wp-host … 帯を置く場所（無ければ header.top → body>header → header → .bar の順に探す）
   アプリ側で利用者が変えたとき（radio・select・数値・ボタン）は、最初のコードでプロファイルに書き戻す。
   checkbox は書き戻さない（読み取りのみ）。すでに一致している選択肢は触らない（例 Child-Pugh A と B を
   どちらも "normal" に割り当てると、A を選んでいても上書きしない）。 */
(function(){
"use strict";
if(window.WardProfile)return;
var KEY="ward-profile",STALE_MS=12*3600*1000;
var FIELDS=[
  {k:"age",lb:"年齢",o:[["lt65","65未満"],["65-74","65〜74"],["ge75","75以上"]]},
  {k:"sex",lb:"性別",o:[["m","男性"],["f","女性"]]},
  {k:"renal",lb:"腎機能（eGFR・CCr）",o:[["ge60","60以上"],["30-59","30〜59"],["15-29","15〜29"],["lt15","15未満・透析"]]},
  {k:"liver",lb:"肝機能",o:[["normal","正常"],["cpB","Child-Pugh B"],["cpC","Child-Pugh C"]]},
  {k:"preg",lb:"妊娠・授乳",o:[["none","なし"],["preg","妊娠中"],["lact","授乳中"]]},
  {k:"at",lb:"抗血栓薬",o:[["none","なし"],["ap","抗血小板"],["ac","抗凝固"],["both","両方"]]},
  {k:"weight",lb:"体重（任意）",num:1}
];
var KS=FIELDS.map(function(f){return f.k;});
var listeners=[];

function blank(){var o={v:1};KS.forEach(function(k){o[k]=null;});o.updatedAt=null;return o;}
function read(){
  var o=blank();
  try{var s=JSON.parse(localStorage.getItem(KEY)||"null");
    if(s&&s.v===1){KS.forEach(function(k){if(s[k]!==undefined&&s[k]!=="")o[k]=s[k];});o.updatedAt=s.updatedAt||null;}}catch(e){}
  if(o.weight!=null){var w=parseFloat(o.weight);o.weight=(isFinite(w)&&w>0)?w:null;}
  return o;
}
function empty(p){return KS.every(function(k){return p[k]==null;});}
function valid(k,v){
  if(v==null)return true;
  var f=FIELDS.filter(function(x){return x.k===k;})[0];if(!f)return false;
  if(f.num){var n=parseFloat(v);return isFinite(n)&&n>0&&n<400;}
  return f.o.some(function(x){return x[0]===v;});
}
function write(p){
  try{if(empty(p))localStorage.removeItem(KEY);else localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}
  fire(p);
}
function fire(p){listeners.slice().forEach(function(fn){try{fn(copy(p));}catch(e){}});}
function copy(p){var o={};for(var k in p)o[k]=p[k];return o;}

var API={
  KEY:KEY,FIELDS:FIELDS,
  get:function(){return copy(read());},
  set:function(patch){
    if(patch===null){write(blank());return API.get();}
    var p=read(),ch=false;
    for(var k in patch){if(KS.indexOf(k)<0)continue;var v=patch[k];if(v===""||v===undefined)v=null;
      if(k==="weight"&&v!=null)v=Math.round(parseFloat(v)*10)/10;
      if(!valid(k,v))continue;
      if(p[k]!==v){p[k]=v;ch=true;}}
    if(p.sex==="m"&&p.preg!=null&&p.preg!=="none"){p.preg=null;ch=true;}
    if(ch){p.updatedAt=Date.now();write(p);}
    return copy(p);
  },
  touch:function(){var p=read();if(empty(p))return;p.updatedAt=Date.now();write(p);},
  clear:function(){write(blank());},
  onChange:function(fn){listeners.push(fn);return function(){var i=listeners.indexOf(fn);if(i>=0)listeners.splice(i,1);};},
  isStale:function(p){p=p||read();return !empty(p)&&!!p.updatedAt&&(Date.now()-p.updatedAt>STALE_MS);},
  label:function(p){
    p=p||read();var t=[];
    function L(k){var f=FIELDS.filter(function(x){return x.k===k;})[0],v=p[k];if(v==null)return null;var o=f.o.filter(function(x){return x[0]===v;})[0];return o?o[1]:null;}
    if(p.age)t.push({"lt65":"65歳未満","65-74":"65〜74歳","ge75":"75歳以上"}[p.age]);
    if(p.sex)t.push(p.sex==="m"?"男":"女");
    if(p.renal)t.push(p.renal==="lt15"?"eGFR 15未満・透析":"eGFR "+L("renal"));
    if(p.liver)t.push(p.liver==="normal"?"肝 正常":L("liver"));
    if(p.at)t.push(p.at==="none"?"抗血栓なし":p.at==="both"?"抗血小板＋抗凝固":L("at"));
    if(p.preg&&p.preg!=="none")t.push(L("preg"));
    if(p.weight!=null)t.push(p.weight+"kg");
    return t.join("・");
  },
  ago:function(ts){
    if(!ts)return"";var m=Math.floor((Date.now()-ts)/60000);
    if(m<1)return"たった今";if(m<60)return m+"分前";var h=Math.floor(m/60);if(h<48)return h+"時間前";return Math.floor(h/24)+"日前";
  },
  open:function(){openSheet();}
};
window.WardProfile=API;
window.addEventListener("storage",function(e){if(e.key===KEY||e.key===null)fire(read());});

/* ---------- data属性との連動 ---------- */
var applying=false;
function codes(el){var s=el.getAttribute("data-wp-v");return s==null?null:s.split(",").map(function(x){return x.trim();}).filter(Boolean);}
function isSel(el){
  var a=["aria-pressed","aria-checked","aria-selected"];
  for(var i=0;i<a.length;i++)if(el.getAttribute(a[i])==="true")return true;
  return /\b(on|active|sel|selected|is-on)\b/.test(el.className||"");
}
function ev(el,t){try{el.dispatchEvent(new Event(t,{bubbles:true}));}catch(e){}}
function apply(p){
  p=p||read();applying=true;
  try{
    /* select */
    each("select[data-wp]",function(s){
      var k=s.getAttribute("data-wp"),v=p[k];if(v==null)return;
      var cur=s.options[s.selectedIndex];if(cur&&match(cur,v,true))return;
      for(var i=0;i<s.options.length;i++){if(match(s.options[i],v,true)){s.selectedIndex=i;ev(s,"input");ev(s,"change");break;}}
    });
    /* radio */
    var done={};
    each("input[type=radio][data-wp][data-wp-v]",function(r){
      var k=r.getAttribute("data-wp"),v=p[k];if(v==null)return;
      var g=(r.form?"f":"d")+":"+r.name+":"+k;if(done[g])return;
      var grp=r.name?Array.prototype.filter.call(document.querySelectorAll('input[type=radio][name="'+cssEsc(r.name)+'"]'),function(x){return x.form===r.form;}):[r];
      var chk=grp.filter(function(x){return x.checked;})[0];
      if(chk&&chk.hasAttribute("data-wp-v")&&codes(chk).indexOf(v)>=0){done[g]=1;return;}
      var t=grp.filter(function(x){return x.getAttribute("data-wp")===k&&codes(x)&&codes(x).indexOf(v)>=0;})[0];
      if(t){done[g]=1;t.checked=true;ev(t,"input");ev(t,"change");}
    });
    /* checkbox（読み取りのみ） */
    each("input[type=checkbox][data-wp][data-wp-v]",function(c){
      var k=c.getAttribute("data-wp"),v=p[k];if(v==null)return;
      var want=codes(c).indexOf(v)>=0;if(c.checked!==want){c.checked=want;ev(c,"input");ev(c,"change");}
    });
    /* 数値 */
    each("input[data-wp=weight]:not([type=radio]):not([type=checkbox])",function(i){
      if(p.weight==null||i===document.activeElement)return;
      if(parseFloat(i.value)!==p.weight){i.value=String(p.weight);ev(i,"input");ev(i,"change");}
    });
    /* ボタンなど */
    each("[data-wp][data-wp-v]:not(input):not(option):not(select)",function(b){
      var k=b.getAttribute("data-wp"),v=p[k];if(v==null)return;
      if(codes(b).indexOf(v)>=0&&!isSel(b)){try{b.click();}catch(e){}}
    });
    /* 表示切替 */
    each("[data-wp-show]",function(e){
      var m=/^\s*(\w+)\s*:\s*(.+)$/.exec(e.getAttribute("data-wp-show")||"");if(!m)return;
      var v=p[m[1]];var on=v!=null&&m[2].split(",").map(function(x){return x.trim();}).indexOf(String(v))>=0;e.hidden=!on;
    });
  }finally{applying=false;}
}
function match(opt,v,useVal){var c=codes(opt);if(c)return c.indexOf(v)>=0;return useVal&&opt.value===v;}
function each(sel,fn){try{Array.prototype.forEach.call(document.querySelectorAll(sel),fn);}catch(e){}}
function cssEsc(s){return (window.CSS&&CSS.escape)?CSS.escape(s):String(s).replace(/"/g,'\\"');}

/* アプリ側の変更をプロファイルへ書き戻す（利用者の操作だけ） */
var wTimer=null;
function onUser(e){
  if(applying||!e.isTrusted)return;
  var el=e.target;if(!el||!el.closest)return;
  if(el.closest("#wpSheet"))return;
  var h=el.closest("[data-wp]");if(!h||h.hasAttribute("data-wp-ro"))return;
  var k=h.getAttribute("data-wp");if(KS.indexOf(k)<0)return;
  var patch={};
  if(h.tagName==="SELECT"){if(e.type!=="change")return;var o=h.options[h.selectedIndex];if(!o||o.hasAttribute("data-wp-ro"))return;var c=codes(o)||(valid(k,o.value)?[o.value]:null);if(!c)return;patch[k]=c[0];}
  else if(h.tagName==="INPUT"&&h.type==="radio"){if(e.type!=="change"||!h.checked)return;var c2=codes(h);if(!c2)return;patch[k]=c2[0];}
  else if(h.tagName==="INPUT"&&h.type==="checkbox")return;
  else if(h.tagName==="INPUT"){if(k!=="weight"||(e.type!=="input"&&e.type!=="change"))return;
    var val=h.value;clearTimeout(wTimer);wTimer=setTimeout(function(){var n=parseFloat(val);API.set({weight:isFinite(n)&&n>0?n:null});},e.type==="change"?0:500);return;}
  else{if(e.type!=="click")return;var c3=codes(h);if(!c3)return;
    /* クリック後に選択状態になったときだけ書き戻す（トグルで外したときは何もしない） */
    setTimeout(function(){var aria=["aria-pressed","aria-checked","aria-selected"].some(function(a){return h.hasAttribute(a);});
      if(isSel(h)||!aria){var o={};o[k]=c3[0];API.set(o);}},0);return;}
  API.set(patch);
}
document.addEventListener("change",onUser,true);
document.addEventListener("input",onUser,true);
document.addEventListener("click",function(e){
  if(applying||!e.isTrusted)return;var t=e.target&&e.target.closest&&e.target.closest("[data-wp][data-wp-v]:not(input):not(option):not(select)");
  if(t)onUser({type:"click",isTrusted:true,target:t});
},true);

/* ---------- 帯と編集シート ---------- */
var css=''
+'#wpBand{display:flex;align-items:center;gap:6px;width:100%;box-sizing:border-box;margin:6px 0 0;padding:5px 10px;min-height:30px;border:0;border-radius:8px;background:rgba(255,255,255,.94);color:#1B2428;font:600 12.5px/1.3 -apple-system,"Hiragino Sans","Noto Sans JP",system-ui,sans-serif;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 0 0 1px rgba(0,0,0,.08)}'
+'#wpBand .tx{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
+'#wpBand .tm{flex:none;color:#5B666B;font-weight:500}'
+'#wpBand .ic{flex:none;font-size:13px}'
+'#wpBand.em{background:rgba(255,255,255,.8);color:#5B666B;font-weight:500}'
+'#wpBand.st{background:#FFF4CC;color:#7A4B00;box-shadow:0 0 0 1.5px #E0A800}'
+'#wpBand.st .tm{color:#7A4B00}'
+'#wpBandWrap{display:block;box-sizing:border-box}'
+'#wpBandWrap.solo{position:sticky;top:0;z-index:20;background:inherit;padding:calc(4px + env(safe-area-inset-top)) calc(10px + env(safe-area-inset-right)) 4px calc(10px + env(safe-area-inset-left))}'
+'#wpSheet{position:fixed;inset:0;z-index:2147483002;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45)}'
+'#wpSheet.on{display:flex}'
+'#wpSheet .bx{background:#fff;color:#1B2428;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:16px 16px 0 0;padding:14px calc(14px + env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) calc(14px + env(safe-area-inset-left));font:15px/1.5 -apple-system,"Hiragino Sans","Noto Sans JP",system-ui,sans-serif;box-shadow:0 -8px 30px rgba(0,0,0,.3)}'
+'#wpSheet h2{font-size:17px;margin:0 0 2px}'
+'#wpSheet .nt{font-size:12px;color:#5B666B;margin:0 0 10px}'
+'#wpSheet .wn{font-size:13px;background:#FFF4CC;color:#7A4B00;border-radius:8px;padding:8px 10px;margin:0 0 10px;font-weight:600}'
+'#wpSheet .q{margin:0 0 10px}'
+'#wpSheet .lb{display:block;font-size:12.5px;font-weight:700;color:#3A4A55;margin:0 0 4px}'
+'#wpSheet .sg{display:flex;flex-wrap:wrap;gap:6px}'
+'#wpSheet .sg button{flex:1 1 auto;min-width:64px;min-height:42px;padding:8px 10px;border-radius:10px;border:1.5px solid #C9D3D8;background:#fff;color:#1B2428;font:inherit;font-size:14px;cursor:pointer}'
+'#wpSheet .sg button[aria-pressed=true]{background:#0b5cad;border-color:#0b5cad;color:#fff;font-weight:700}'
+'#wpSheet .sg button:disabled{opacity:.35}'
+'#wpSheet input{font:inherit;font-size:16px;width:120px;min-height:42px;padding:6px 10px;border-radius:10px;border:1.5px solid #C9D3D8;box-sizing:border-box}'
+'#wpSheet .rw{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}'
+'#wpSheet .rw button{flex:1 1 30%;min-height:46px;border-radius:10px;border:1px solid #C9D3D8;background:#fff;color:#1B2428;font:inherit;font-size:14.5px;cursor:pointer}'
+'#wpSheet .rw .dg{border-color:#B42318;color:#B42318;font-weight:700}'
+'#wpSheet .rw .dg.cf{background:#B42318;color:#fff}'
+'#wpSheet .rw .pr{background:#0b5cad;border-color:#0b5cad;color:#fff;font-weight:700}'
+'#wcClrDlg .wpChk{display:flex;gap:8px;align-items:flex-start;font-size:13.5px;margin:-4px 0 14px;padding:8px 10px;border-radius:8px;background:#F2F5F7}'
+'#wcClrDlg .wpChk input{width:20px;height:20px;margin:1px 0 0;flex:none}'
+'body.wpOpen #wcClrBtn,body.wpOpen #wcQrBtn{display:none!important}'
+'@media (prefers-color-scheme: dark){'
+'#wpBand{background:rgba(20,26,30,.9);color:#ECEFF0;box-shadow:0 0 0 1px rgba(255,255,255,.12)}#wpBand .tm{color:#A9B3B6}#wpBand.em{background:rgba(20,26,30,.75);color:#A9B3B6}'
+'#wpBand.st{background:#4A3A00;color:#FFE08A;box-shadow:0 0 0 1.5px #E0A800}#wpBand.st .tm{color:#FFE08A}'
+'#wpSheet .bx{background:#1F2427;color:#ECEFF0}#wpSheet .nt{color:#A9B3B6}#wpSheet .lb{color:#C9D3D8}#wpSheet .wn{background:#4A3A00;color:#FFE08A}'
+'#wpSheet .sg button,#wpSheet .rw button,#wpSheet input{background:#2A3034;color:#ECEFF0;border-color:#3A4246}'
+'#wpSheet .sg button[aria-pressed=true],#wpSheet .rw .pr{background:#5AA0E6;border-color:#5AA0E6;color:#0B1620}'
+'#wpSheet .rw .dg{color:#FF8A80;border-color:#FF8A80}#wpSheet .rw .dg.cf{background:#D9534F;color:#fff}'
+'#wcClrDlg .wpChk{background:#2A3034}}'
+'@media print{#wpSheet{display:none!important}#wpBand{box-shadow:none;border:1px solid #999}}';

var band=null,wrap=null,sheet=null;
function host(){
  return document.querySelector("[data-wp-host]")||document.querySelector("header.top")||document.querySelector("body>header")||document.querySelector("header")||document.querySelector(".bar");
}
function mountBand(){
  if(document.getElementById("wpBand"))return;
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  wrap=document.createElement("div");wrap.id="wpBandWrap";
  band=document.createElement("button");band.type="button";band.id="wpBand";
  band.setAttribute("aria-label","患者プロファイル（タップで編集）");
  wrap.appendChild(band);
  var h=host();
  if(h){var sum=h.querySelector("#wcSum");if(sum)h.insertBefore(wrap,sum);else h.appendChild(wrap);}
  else{wrap.className="solo";document.body.insertBefore(wrap,document.body.firstChild);}
  band.addEventListener("click",openSheet);
  render();
}
function render(){
  if(!band)return;var p=read();
  if(empty(p)){band.className="em";band.innerHTML='<span class="ic">👤</span><span class="tx">患者プロファイル未設定（タップで年齢・腎・肝・妊娠・抗血栓）</span>';return;}
  var stale=API.isStale(p);
  band.className=stale?"st":"";
  band.innerHTML='<span class="ic">'+(stale?"⚠️":"👤")+'</span><span class="tx"></span><span class="tm"></span>';
  band.querySelector(".tx").textContent=(stale?"別の患者ですか？ ":"")+API.label(p);
  band.querySelector(".tm").textContent="／"+API.ago(p.updatedAt);
}
var newArmed=false;
function openSheet(){
  if(!sheet){
    sheet=document.createElement("div");sheet.id="wpSheet";sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");sheet.setAttribute("aria-labelledby","wpSheetT");
    document.body.appendChild(sheet);
    sheet.addEventListener("click",function(e){
      if(e.target===sheet){closeSheet();return;}
      var b=e.target.closest&&e.target.closest("button");if(!b)return;
      if(b.dataset.k){var p=read(),k=b.dataset.k,v=b.dataset.v,o={};o[k]=(p[k]===v)?null:v;API.set(o);drawSheet();return;}
      var a=b.dataset.a;
      if(a==="close")closeSheet();
      else if(a==="same"){API.touch();drawSheet();}
      else if(a==="new"){if(!newArmed){newArmed=true;b.classList.add("cf");b.textContent="もう一度押すと全消去";setTimeout(function(){newArmed=false;if(sheet.classList.contains("on"))drawSheet();},4000);return;}
        newArmed=false;API.clear();drawSheet();}
    });
    sheet.addEventListener("input",function(e){if(e.target.id==="wpW"){var n=parseFloat(e.target.value);clearTimeout(wTimer);wTimer=setTimeout(function(){API.set({weight:isFinite(n)&&n>0?n:null});drawHead();},400);}});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"&&sheet.classList.contains("on"))closeSheet();});
  }
  newArmed=false;drawSheet();sheet.classList.add("on");document.body.classList.add("wpOpen");
}
function drawHead(){
  if(!sheet)return;var p=read(),h=sheet.querySelector(".hd");if(!h)return;
  h.innerHTML=API.isStale(p)?'<p class="wn">最後の設定から12時間以上たっています（'+API.ago(p.updatedAt)+'）。別の患者なら「新しい患者」を押してください。</p>':"";
}
function drawSheet(){
  var p=read(),stale=API.isStale(p);
  var h='<div class="bx"><h2 id="wpSheetT">患者プロファイル</h2><p class="nt">この端末の病棟アプリすべてで共有します。氏名・IDは入れません。もう一度押すと選択を外せます。</p><div class="hd"></div>';
  FIELDS.forEach(function(f){
    h+='<div class="q"><span class="lb">'+f.lb+'</span>';
    if(f.num)h+='<div class="sg"><input id="wpW" type="number" inputmode="decimal" step="0.1" min="1" max="399" placeholder="kg" value="'+(p.weight!=null?p.weight:"")+'"> <span style="align-self:center;font-size:13px">kg</span></div>';
    else{h+='<div class="sg">';f.o.forEach(function(o){
      var dis=(f.k==="preg"&&p.sex==="m"&&o[0]!=="none")?" disabled":"";
      h+='<button type="button" data-k="'+f.k+'" data-v="'+o[0]+'" aria-pressed="'+(p[f.k]===o[0])+'"'+dis+'>'+o[1]+'</button>';});h+='</div>';}
    h+='</div>';
  });
  h+='<div class="rw">'+(stale?'<button type="button" class="pr" data-a="same">同じ患者（時刻を更新）</button>':'')+'<button type="button" class="dg" data-a="new">新しい患者（全消去）</button><button type="button" data-a="close"'+(stale?'':' class="pr"')+'>閉じる</button></div></div>';
  var ae=document.activeElement&&document.activeElement.id==="wpW";
  sheet.innerHTML=h;drawHead();
  if(ae){var w=document.getElementById("wpW");w.focus();try{w.setSelectionRange(w.value.length,w.value.length);}catch(e){}}
}
function closeSheet(){if(sheet)sheet.classList.remove("on");document.body.classList.remove("wpOpen");}

/* 入力クリア（wc-clear）の確認ダイアログに「プロファイルも消す」を足す */
function hookClear(){
  var dlg=document.getElementById("wcClrDlg");if(!dlg||dlg.querySelector(".wpChk"))return;
  var rw=dlg.querySelector(".rw");if(!rw)return;
  var lab=document.createElement("label");lab.className="wpChk";
  lab.innerHTML='<input type="checkbox" id="wpClrChk"><span>患者プロファイルも消す<br><small class="wpCur"></small></span>';
  rw.parentNode.insertBefore(lab,rw);
  var btn=document.getElementById("wcClrBtn");
  if(btn)btn.addEventListener("click",function(){var p=read(),c=document.getElementById("wpClrChk");c.checked=false;
    lab.style.display=empty(p)?"none":"";lab.querySelector(".wpCur").textContent=API.label(p);});
  document.addEventListener("click",function(e){
    if(e.target&&e.target.closest&&e.target.closest("#wcClrYes")){var c=document.getElementById("wpClrChk");if(c&&c.checked){try{localStorage.removeItem(KEY);}catch(_){}}}
  },true);
}

API.onChange(function(p){render();apply(p);});
setInterval(render,60000);
document.addEventListener("visibilitychange",function(){if(!document.hidden)render();});
function init(){mountBand();hookClear();apply();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.addEventListener("load",function(){apply();});
})();
