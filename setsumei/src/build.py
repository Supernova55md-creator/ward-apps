#!/usr/bin/env python3
"""神経疾患 説明用紙：src から病棟ナビ版（setsumei/index.html）を作る。
カルテ端末（院内共有フォルダ）用の単体HTMLは、できあがった index.html から
  python3 tools/karte.py setsumei
で作る（全アプリ共通の手順）。
使い方： python3 setsumei/src/build.py
"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
ROOT = os.path.dirname(APP)
DATA = ["data1.js", "data2.js", "data3.js", "data4.js", "data5.js", "data6.js", "data7.js"]

t = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
d = "".join(open(os.path.join(HERE, f), encoding="utf-8").read() for f in DATA)
assert "</script" not in d

head = """<meta name="theme-color" content="#2f6b5e">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="説明用紙">"""

# 入力クリア（共通ブロック）：lab/index.html のブロックを流用し、KEYS とヘッダーのセレクタだけ変える
lab = open(os.path.join(ROOT, "lab", "index.html"), encoding="utf-8").read()
m = re.search(r"<!-- wc-clear:start.*?<!-- wc-clear:end -->", lab, re.S)
wc = m.group(0)
wc = re.sub(r"var KEYS=\[[^\]]*\];", "var KEYS=[];", wc)          # 入力（氏名・説明文など）は保存していない。設定（施設名など）は消さない
wc = wc.replace('document.querySelectorAll("header .bar")', 'document.querySelectorAll("header.top")')

sw = """<script>
(function(){
  try{
    var h=location.hostname;
    var secure = location.protocol==='https:' || h==='localhost' || h==='127.0.0.1';
    var onClaude = /(^|\\.)claude\\.ai$/.test(h) || /claudeusercontent|claude\\.site/.test(h) || !!window.claude;
    if(!('serviceWorker' in navigator) || !secure || onClaude) return;
    navigator.serviceWorker.register("../sw.js",{scope:"../"}).then(function(reg){
      reg.addEventListener('updatefound', function(){
        var w=reg.installing; if(!w) return;
        w.addEventListener('statechange', function(){
          if(w.state==='installed' && navigator.serviceWorker.controller && window.pisToast) pisToast('新しい版を取り込みました。次に開いたときに反映されます');
        });
      });
    }).catch(function(){});
    var u=document.createElement('button');u.className='btn';u.type='button';u.textContent='最新版に更新';u.style.marginLeft='8px';
    u.onclick=async function(){try{var r=await navigator.serviceWorker.getRegistration("../");if(r)await r.update();}catch(e){}try{await fetch(location.href,{cache:"reload"});}catch(e){if(window.pisToast)pisToast("通信できないため更新を確認できません");return;}setTimeout(function(){location.reload();},800);};
    var dsc=document.querySelector('.disc');if(dsc)dsc.appendChild(u);
  }catch(e){}
})();
</script>"""

body = wc + "\n" + sw + '\n<script src="../share.js" defer></script>'
out = t.replace("/*DATA*/", d).replace("<!--WARD_HEAD-->", head).replace("<!--WARD_BODY-->", body)
open(os.path.join(APP, "index.html"), "w", encoding="utf-8").write(out)
print("wrote", os.path.join(APP, "index.html"), len(out))
