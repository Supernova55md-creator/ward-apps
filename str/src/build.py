#!/usr/bin/env python3
"""str（脳卒中トレーニング）の病棟ナビ版 index.html を src から作る。"""
import pathlib,re
S=pathlib.Path(__file__).resolve().parent
R=S.parent
t=(S/"template.html").read_text()
ltr=(R.parent/"ltr"/"index.html").read_text()
m=re.search(r"<!-- wc-clear:start.*?<!-- wc-clear:end -->",ltr,re.S)
clr=m.group(0)
clr=re.sub(r'var KEYS=\[.*?\];','var KEYS=[{"k":"str-v1","keep":["st","hist","cnt","ok","streak","set"]}];',clr,count=1)
assert '"str-v1"' in clr
for k,f in (("IMG","img.js"),("DATA","data.js"),("APP","app.js")):
    t=t.replace("/*@@%s@@*/"%k,(S/f).read_text())
t=t.replace("/*@@CLEAR@@*/",clr)
(R/"index.html").write_text(t)
print("built",len(t))
