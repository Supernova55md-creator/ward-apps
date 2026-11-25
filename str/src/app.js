(function(){
"use strict";
var APP_VER="ver1_2026-11-25d";
var KEY="str-v1";
var $=function(id){return document.getElementById(id);};
var st={st:{},hist:[],cnt:0,ok:0,streak:0,set:{cats:Object.keys(CATS),lv:3,img:false,hide:false,weak:true},cur:null};
try{var sv=JSON.parse(localStorage.getItem(KEY)||"null");if(sv){for(var k in sv)st[k]=sv[k];if(!st.set||!st.set.cats)st.set={cats:Object.keys(CATS),lv:3,img:false,hide:false,weak:true};}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
var QMAP={};QS.forEach(function(q){QMAP[q.id]=q;});
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function refLink(k){var r=REFS[k];if(!r)return"";var u=r[1];if(!u)return'<span>'+esc(r[2])+'</span>';
  if(!/^https?:/.test(u))u=u.indexOf("doi:")===0?"https://doi.org/"+u.slice(4):"https://pubmed.ncbi.nlm.nih.gov/"+u+"/";
  return'<a href="'+u+'" target="_blank" rel="noopener">'+esc(r[2])+'</a>';}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

/* ── 設定 ── */
function pool(){var s=st.set;return QS.filter(function(q){return s.cats.indexOf(q.c)>=0&&q.lv<=s.lv&&(!s.img||q.img);});}
function renderSet(){
  var s=st.set;
  $("catChips").innerHTML=Object.keys(CATS).map(function(c){var n=QS.filter(function(q){return q.c===c;}).length;var on=s.cats.indexOf(c)>=0;
    return'<label class="chip'+(on?" on":"")+'"><input type="checkbox" data-c="'+c+'"'+(on?" checked":"")+'>'+CATS[c]+' <span style="color:var(--muted);font-size:12px">'+n+'</span></label>';}).join("");
  Array.prototype.forEach.call(document.querySelectorAll("#catChips input"),function(i){i.onchange=function(){
    var c=i.getAttribute("data-c");var a=st.set.cats.filter(function(x){return x!==c;});if(i.checked)a.push(c);st.set.cats=a;st.cur=null;save();renderSet();renderQ();};});
  $("lvSel").value=String(s.lv);$("imgOpt").checked=!!s.img;$("hideOpt").checked=!!s.hide;$("weakOpt").checked=s.weak!==false;
  var p=pool();$("setSum").textContent="（"+p.length+"問）";
  $("setHint").textContent=p.length?"":"条件に合う問題がありません。範囲を広げてください。";
}
$("lvSel").onchange=function(){st.set.lv=+this.value;st.cur=null;save();renderSet();renderQ();};
$("imgOpt").onchange=function(){st.set.img=this.checked;st.cur=null;save();renderSet();renderQ();};
$("hideOpt").onchange=function(){st.set.hide=this.checked;save();renderQ();};
$("weakOpt").onchange=function(){st.set.weak=this.checked;save();};
$("catAll").onclick=function(){st.set.cats=Object.keys(CATS);st.cur=null;save();renderSet();renderQ();};
$("catNone").onclick=function(){st.set.cats=[];st.cur=null;save();renderSet();renderQ();};

/* ── 出題の選び方 ── */
function pick(){
  var p=pool();if(!p.length)return null;
  var last=st.hist.slice(-Math.min(6,Math.max(0,p.length-1)));
  var cand=p.filter(function(q){return last.indexOf(q.id)<0;});if(!cand.length)cand=p;
  if(st.set.weak!==false){
    var w=cand.map(function(q){var r=st.st[q.id];var wt=!r?4:(r[0]-r[1]>0?3+(r[0]-r[1]):1/(1+r[0]));return wt;});
    var tot=w.reduce(function(a,b){return a+b;},0),x=Math.random()*tot;
    for(var i=0;i<cand.length;i++){x-=w[i];if(x<=0)return cand[i];}
    return cand[cand.length-1];
  }
  return cand[Math.floor(Math.random()*cand.length)];
}
function newQ(id){var q=id?QMAP[id]:pick();if(!q){st.cur=null;return;}
  st.cur={id:q.id,ord:shuffle(q.o.map(function(_,i){return i;})),ans:null,show:!st.set.hide};save();}

function figHTML(q,after){
  if(!q.img)return"";
  return'<div class="fig">'+IMG.render(q.img,after)+'<p class="cap">模式図（自作）。画像の左＝患者の右'+(after&&hasMarks(q.img)?"。黄色は解答後の注記":"")+'</p></div><button type="button" class="zoombtn" id="zoomOpen">図を拡大する</button>';
}
function hasMarks(sp){var ps=sp.panels||[sp];return ps.some(function(p){return p.lab||p.mark;});}

function renderQ(){
  var a=$("qArea");
  if(!st.cur||!QMAP[st.cur.id])newQ();
  if(!st.cur){a.innerHTML='<div class="card empty">出題できる問題がありません。「出題範囲・設定」で範囲を選んでください。</div>';return;}
  var q=QMAP[st.cur.id],c=st.cur,done=c.ans!==null;
  var r=st.st[q.id];
  var h='<div class="card"><div class="qhead"><span class="lv">'+"★★★".slice(0,q.lv)+"☆☆☆".slice(0,3-q.lv)+'</span>'+(r?'<span>この問題 '+r[1]+'/'+r[0]+'</span>':'<span>はじめて</span>')+'<span class="regtag">'+CATS[q.c]+'</span></div>';
  h+='<p class="stem">'+esc(q.s)+'</p>'+figHTML(q,done);
  h+='<p class="ask">'+esc(q.q)+'</p>';
  if(!c.show&&!done){h+='<button type="button" class="btn primary" id="showOpt">選択肢を見る</button>';}
  else{
    h+='<div class="opts">'+c.ord.map(function(oi,n){var o=q.o[oi];var cls="";
      if(done){if(oi===0)cls=" ok";else if(oi===c.ans)cls=" ng";}
      return'<button type="button" class="opt'+cls+'" data-i="'+oi+'"'+(done?" disabled":"")+'><span class="n">'+(n+1)+'</span><span>'+esc(o[0])+(done&&(oi===0||oi===c.ans)&&o[1]?'<span class="why">'+esc(o[1])+'</span>':"")+'</span></button>';}).join("")+'</div>';
  }
  if(done){
    var ok=c.ans===0;
    h+='<div class="result '+(ok?"ok":"ng")+'">'+(ok?"正解":"不正解（正解は緑の選択肢）")+'</div>';
    h+='<p class="exp">'+esc(q.e)+'</p>';
    if(q.k&&q.k.length)h+='<ul class="kp">'+q.k.map(function(x){return"<li>"+esc(x)+"</li>";}).join("")+'</ul>';
    if(q.r&&q.r.length)h+='<div class="refs">出典：'+q.r.map(refLink).join("")+'</div>';
    h+='<div class="next"><button type="button" class="btn primary" id="nextQ">次の問題</button>'+(c.ans!==0?'<button type="button" class="btn" id="retryQ">もう一度解く</button>':"")+'</div>';
  }
  h+='</div>';
  a.innerHTML=h;
  if($("showOpt"))$("showOpt").onclick=function(){c.show=true;save();renderQ();};
  Array.prototype.forEach.call(a.querySelectorAll(".opt:not([disabled])"),function(b){b.onclick=function(){answer(+b.getAttribute("data-i"));};});
  if($("nextQ"))$("nextQ").onclick=function(){newQ();renderQ();window.scrollTo(0,0);};
  if($("retryQ"))$("retryQ").onclick=function(){newQ(q.id);renderQ();};
  if($("zoomOpen"))$("zoomOpen").onclick=function(){openZoom(q,done);};
}
function answer(i){
  var c=st.cur,q=QMAP[c.id];if(c.ans!==null)return;
  c.ans=i;var ok=i===0;
  var r=st.st[q.id]||[0,0];r[0]++;if(ok)r[1]++;r[2]=ok?1:0;st.st[q.id]=r;
  st.cnt++;if(ok){st.ok++;st.streak++;}else st.streak=0;
  st.hist.push(q.id);if(st.hist.length>60)st.hist=st.hist.slice(-60);
  save();renderTop();renderQ();
}
function renderTop(){$("sN").textContent=st.cnt;$("sR").textContent=st.cnt?Math.round(st.ok/st.cnt*100)+"%":"—";$("sS").textContent=st.streak;}

/* ── 拡大 ── */
function openZoom(q,after){$("zoomB").innerHTML=IMG.render(q.img,after);$("zoom").classList.add("on");document.body.classList.add("zoomon");}
$("zoomX").onclick=function(){$("zoom").classList.remove("on");document.body.classList.remove("zoomon");};

/* ── 一覧 ── */
function renderList(){
  var f=($("aQ").value||"").trim().toLowerCase();
  var h="";
  Object.keys(CATS).forEach(function(c){
    var qs=QS.filter(function(q){if(q.c!==c)return false;if(!f)return true;
      var t=(q.s+q.q+q.e+q.o.map(function(o){return o.join(" ");}).join(" ")+(q.k||[]).join(" ")).toLowerCase();return t.indexOf(f)>=0;});
    if(!qs.length)return;
    h+='<div class="card"><h2>'+CATS[c]+' <span style="font-weight:400;color:var(--muted);font-size:13px">'+qs.length+'問</span></h2>';
    qs.forEach(function(q){var r=st.st[q.id];
      h+='<details class="site"><summary><b>'+esc(q.q)+(r?'<span class="mk '+(r[2]?"ok":"ng")+'">'+(r[2]?"前回○":"前回×")+'</span>':"")+'</b><span>'+esc(q.s.slice(0,60))+(q.s.length>60?"…":"")+(q.img?"（画像あり）":"")+'</span></summary>'+
        '<div style="padding:0 0 10px"><p class="stem">'+esc(q.s)+'</p>'+(q.img?'<div class="fig">'+IMG.render(q.img,true)+'</div>':"")+
        '<p style="margin:8px 0 4px"><b>正解：</b>'+esc(q.o[0][0])+'</p><p class="exp">'+esc(q.e)+'</p>'+
        (q.r&&q.r.length?'<div class="refs">出典：'+q.r.map(refLink).join("")+'</div>':"")+
        '<button type="button" class="btn sm" data-go="'+q.id+'" style="margin-top:8px">この問題を解く</button></div></details>';});
    h+='</div>';
  });
  $("aList").innerHTML=h||'<div class="card empty">該当する問題がありません。</div>';
  Array.prototype.forEach.call(document.querySelectorAll("[data-go]"),function(b){b.onclick=function(){newQ(b.getAttribute("data-go"));show("v-q");renderQ();};});
}
$("aQ").oninput=renderList;

/* ── 成績 ── */
function renderStats(){
  var h='<div class="card"><h2>分野別の成績</h2><table class="st">';
  Object.keys(CATS).forEach(function(c){
    var qs=QS.filter(function(q){return q.c===c;}),n=0,o=0,tried=0;
    qs.forEach(function(q){var r=st.st[q.id];if(r){n+=r[0];o+=r[1];tried++;}});
    var pct=n?Math.round(o/n*100):0;
    h+='<tr><td>'+CATS[c]+'<div class="hint" style="margin:0">'+tried+'/'+qs.length+'問に回答</div></td><td><div class="bar"><i style="width:'+pct+'%"></i></div></td><td class="num">'+(n?pct+"%":"—")+'</td></tr>';
  });
  h+='</table></div>';
  var wrong=QS.filter(function(q){var r=st.st[q.id];return r&&r[2]===0;});
  h+='<div class="card"><h2>前回間違えた問題</h2>'+(wrong.length?wrong.map(function(q){return'<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding:6px 0"><span style="font-size:14px;flex:1">'+esc(q.q)+'</span><button type="button" class="btn sm" data-go="'+q.id+'">解く</button></div>';}).join(""):'<p class="empty">ありません。</p>')+'</div>';
  h+='<div class="card"><button type="button" class="btn" id="resetSt">成績を消す</button><p class="hint">成績（回答数・正答率・各問題の結果）を消します。</p></div>';
  $("sArea").innerHTML=h;
  Array.prototype.forEach.call(document.querySelectorAll("#sArea [data-go]"),function(b){b.onclick=function(){newQ(b.getAttribute("data-go"));show("v-q");renderQ();};});
  $("resetSt").onclick=function(){if(!confirm("成績をすべて消しますか？"))return;st.st={};st.hist=[];st.cnt=0;st.ok=0;st.streak=0;save();renderTop();renderStats();};
}

/* ── 出典 ── */
function renderRefs(){
  var li=function(k){var r=REFS[k];var u=r[1];var lab="";
    if(u&&!/^https?:/.test(u)){lab=u.indexOf("doi:")===0?u:"PMID "+u;u=u.indexOf("doi:")===0?"https://doi.org/"+u.slice(4):"https://pubmed.ncbi.nlm.nih.gov/"+u+"/";}
    else if(u)lab="PDF";
    return"<li>"+esc(r[0])+(u?' <a href="'+u+'" target="_blank" rel="noopener">'+lab+'</a>':"")+"</li>";};
  var gl=["GL","RT","EV"],tr=Object.keys(REFS).filter(function(k){return gl.indexOf(k)<0;});
  var h='<div class="card"><h2>指針・ガイドライン</h2><ul class="src">'+gl.map(li).join("")+'</ul></div>';
  h+='<div class="card"><h2>臨床試験・海外ガイドライン</h2><ul class="src">'+tr.map(li).join("")+'</ul></div>';
  h+='<div class="card"><h2>照合の状況</h2><p class="note">静注血栓溶解の適応外・慎重投与項目、用量、投与後の管理（神経評価・血圧測定の頻度、24時間の抗血栓療法の制限）、DOAC・ワルファリン・ダビガトランの扱い、発症時刻の定義は、rt-PA適正治療指針 第三版の本文と照合しました。血栓回収の推奨度（ASPECTS別・時間別・脳底動脈・M2）は、ガイドライン改訂2025の内容を反映した既存の「再開通療法 適応チェッカー」と同じ整理です。臨床試験の数値は各論文の要旨（または学会・誌面の要約）と照合しました。「最新の重要試験」は2022〜2026年の試験で、国内未承認の薬（テネクテプラーゼ、チロフィバン、アスンデキシアン）や承認外の使い方（動注血栓溶解）を含みます。国内の適応とは分けて読んでください。脳出血・くも膜下出血の手術適応（小脳出血3 cm、被殻出血31 mL）、脳梗塞急性期の降圧基準（220/120）、嚥下・DVT予防（CLOTS）・けいれん予防投与・分水嶺梗塞・分枝粥腫病・出血性変化の分類・ABC/2法の記載は、ガイドラインと一般的な知識による要約で、原典の頁と一つずつ照合したものではありません（未照合）。推奨度の細部は原典で確認してください。</p>';
  h+='<p class="note">図はすべて自作の模式図です。本や論文の画像は使っていません。Dropboxの脳卒中関連書籍は、この版ではrt-PA適正治療指針（第三版）を参照しました。</p>';
  h+='<div class="row" style="margin-top:10px;font-size:12px;color:var(--muted)">アプリの版：<b>'+APP_VER+'</b><button type="button" class="btn sm" id="forceUpdate">最新版に更新</button></div>';
  h+='<p class="hint">収録：'+QS.length+'問（画像つき '+QS.filter(function(q){return q.img;}).length+'問）</p></div>';
  $("rArea").innerHTML=h;
  $("forceUpdate").onclick=async function(){
    var b=this;b.textContent="確認しています…";
    try{if("serviceWorker" in navigator){var r=await navigator.serviceWorker.getRegistration("../");if(r)await r.update();}}catch(e){}
    try{await fetch(location.href,{cache:"reload"});}catch(e){b.textContent="通信できないため確認できません";return;}
    setTimeout(function(){location.reload();},800);
  };
}

/* ── タブ ── */
var tabs=document.querySelectorAll("nav.tabs button");
function show(v){
  Array.prototype.forEach.call(document.querySelectorAll("section.view"),function(s){s.classList.toggle("active",s.id===v);});
  Array.prototype.forEach.call(tabs,function(b){b.setAttribute("aria-selected",b.getAttribute("data-v")===v?"true":"false");});
  if(v==="v-a")renderList();if(v==="v-s")renderStats();if(v==="v-r")renderRefs();if(v==="v-q")renderQ();
  window.scrollTo(0,0);
}
Array.prototype.forEach.call(tabs,function(b){b.onclick=function(){show(b.getAttribute("data-v"));};});
var tt;function toast(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("on");},2600);}
window.__strToast=toast;

renderSet();renderTop();renderQ();
})();
