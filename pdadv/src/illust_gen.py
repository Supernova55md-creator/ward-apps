#!/usr/bin/env python3
"""PD生活アドバイスナビ用のオリジナル線画（教科書の図は使わず一から描く）。
出力：illus.json（id → SVG文字列）と確認用の preview.html"""
import json, math
INK="#2b2b2b"; GREY="#9aa3a8"; OK="#0f766e"; NG="#b42318"; TAPE="#e0a800"; SOFT="#e8f3f1"
FONT='font-family="Hiragino Sans,Yu Gothic,Meiryo,Noto Sans JP,sans-serif"'
W=170; H=170; CAP=40

def line(pts,c=INK,w=4,extra=""):
    d="M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in pts)
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def circle(x,y,r,c=INK,w=4,fill="#fff"):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{c}" stroke-width="{w}"/>'
def text(x,y,s,size=13,c=INK,anchor="middle",weight="700"):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{c}" text-anchor="{anchor}" {FONT}>{s}</text>'
def person(J,c=INK,back=None):
    """J: head, neck, hip, knee, foot, toe, elbow, hand（横向き・右向き）。back: 奥側の脚と腕（灰色）"""
    s=""
    if back:
        s+=line([J["hip"],back["knee"],back["foot"],back["toe"]],GREY)
        if "hand" in back: s+=line([J["neck"],back["elbow"],back["hand"]],GREY)
    s+=line([J["neck"],J["hip"]],c,5)
    s+=line([J["hip"],J["knee"],J["foot"],J["toe"]],c)
    s+=line([J["neck"],J["elbow"],J["hand"]],c)
    s+=circle(*J["head"],11,c)
    return s
def floor(y=142,x0=6,x1=W-6): return line([(x0,y),(x1,y)],GREY,2)
def chair(x=34,seat=104):
    return line([(x,seat-46),(x,142)],INK,3)+line([(x,seat),(x+44,seat)],INK,4)+line([(x+42,seat),(x+42,142)],INK,3)
def num(x,y,n):
    return f'<circle cx="{x}" cy="{y}" r="11" fill="{OK}"/>'+text(x,y+4.5,str(n),12,"#fff")
def mark(x,y,ok):
    if ok: return f'<circle cx="{x}" cy="{y}" r="12" fill="none" stroke="{OK}" stroke-width="4"/>'
    return line([(x-10,y-10),(x+10,y+10)],NG,4)+line([(x-10,y+10),(x+10,y-10)],NG,4)
def strip(panels,caps,title=""):
    n=len(panels); w=W*n; h=H+CAP
    s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}">'
    s+=f'<rect x="0" y="0" width="{w}" height="{h}" fill="#fff"/>'
    for i,(p,cp) in enumerate(zip(panels,caps)):
        s+=f'<g transform="translate({i*W},0)">'+p
        lines=cp.split("|")
        for k,l in enumerate(lines): s+=text(W/2,H+10+k*16,l,12.5,INK,"middle","700" if k==0 else "500")
        s+='</g>'
        if i: s+=line([(i*W,14),(i*W,H+CAP-6)],"#d6dcdc",1.5)
    return s+'</svg>'
def wide(body,cap,wmul=2,title=""):
    w=W*wmul; h=H+CAP
    s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}"><rect width="{w}" height="{h}" fill="#fff"/>'+body
    for k,l in enumerate(cap.split("|")): s+=text(w/2,H+10+k*16,l,12.5,INK,"middle","700" if k==0 else "500")
    return s+'</svg>'

ILL={}
# ---------- 立ち上がり（bed） ----------
def sit(hip,neck,head,knee,foot,elbow,hand):
    return dict(hip=hip,neck=neck,head=head,knee=knee,foot=foot,toe=(foot[0]+12,foot[1]),elbow=elbow,hand=hand)
p1=chair()+floor()+num(20,20,1)+person(sit((74,98),(70,54),(70,40),(108,98),(108,140),(84,74),(102,94)))
p2=chair()+floor()+num(20,20,2)+person(sit((70,98),(70,54),(70,40),(102,98),(88,140),(84,74),(98,94)))+line([(112,128),(98,128)],OK,3,'marker-end="url(#ar)"')
p3=chair()+floor()+num(20,20,3)+person(sit((70,98),(102,66),(112,56),(102,98),(88,140),(102,84),(102,100)))
p4=chair()+floor()+num(20,20,4)+person(dict(hip=(92,90),neck=(94,46),head=(94,32),knee=(93,116),foot=(92,140),toe=(104,140),elbow=(96,68),hand=(98,88)))
arrow='<defs><marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="'+OK+'"/></marker></defs>'
ILL["standup"]=strip([arrow+p1,p2,p3,p4],["浅く座り直す","足を少し後ろに引く","おじぎをするように|前かがみに","お尻を上げて立つ"],"椅子からの立ち上がり")

# ---------- 立ちくらみ（oh） ----------
bed=lambda: f'<rect x="10" y="104" width="96" height="14" rx="3" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+line([(14,118),(14,142)],INK,3)+line([(102,118),(102,142)],INK,3)
q1=floor()+bed()+num(20,20,1)+person(dict(head=(26,92),neck=(40,96),hip=(74,98),knee=(96,98),foot=(118,98),toe=(120,88),elbow=(56,100),hand=(70,102)))
q2=floor()+bed()+num(20,20,2)+person(dict(head=(82,42),neck=(82,56),hip=(86,100),knee=(116,100),foot=(116,140),toe=(128,140),elbow=(92,78),hand=(100,100)))+text(140,40,"少し",12,OK)+text(140,55,"待つ",12,OK)
q3=floor()+bed()+num(20,20,3)+person(dict(head=(124,32),neck=(124,46),hip=(124,90),knee=(125,116),foot=(124,140),toe=(136,140),elbow=(112,64),hand=(104,104)))+text(150,40,"少し",12,OK)+text(150,55,"待つ",12,OK)
q4=floor()+num(20,20,4)+line([(84,46),(84,90)],INK,5)+line([(84,90),(80,116),(94,140),(104,140)],INK)+line([(84,90),(90,116),(74,140),(64,140)],INK)+line([(84,52),(74,70),(76,88)],INK)+circle(84,33,11)+text(128,90,"ぎゅっと",11.5,OK)+text(128,104,"力を入れる",11.5,OK)
ILL["oh"]=strip([q1,q2,q3,q4],["寝た状態から","起き上がって座る","立ち上がる|すぐに歩き出さない","ふらっとしたら|足を交差・しゃがむ"],"立ちくらみを防ぐ起き上がり方")

# ---------- すくみ足（fall） ----------
tapes="".join(f'<rect x="{x}" y="139" width="22" height="6" rx="2" fill="{TAPE}"/>' for x in (20,80,140,200,260,320))
walk=person(dict(head=(150,30),neck=(150,43),hip=(146,90),knee=(166,112),foot=(176,138),toe=(188,136),elbow=(162,62),hand=(170,80)),
            back=dict(knee=(140,116),foot=(126,140),toe=(136,141),elbow=(138,64),hand=(130,82)))
bub=f'<path d="M196,18 h86 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-62 l-14,12 l2,-12 h-12 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10 z" fill="#fff" stroke="{OK}" stroke-width="2.5"/>'+text(239,45,"いち、に",15,OK)
ILL["freeze"]=wide(floor(142,6,W*2-6)+tapes+walk+bub,"床に歩幅ごとにテープを貼り、|「いち、に」と声に出してまたぐ",2,"すくみ足の対処")

# ---------- 方向転換（fall, 上から見た図） ----------
def foot(x,y,ang,c=INK):
    return f'<ellipse cx="{x}" cy="{y}" rx="5" ry="10" transform="rotate({ang} {x} {y})" fill="#fff" stroke="{c}" stroke-width="2.5"/>'
ng=foot(78,92,0,NG)+foot(92,92,0,NG)+foot(80,96,60,NG)+foot(94,98,60,NG)+foot(84,102,120,NG)
ng+=f'<path d="M58,60 A34,34 0 1 1 52,98" fill="none" stroke="{NG}" stroke-width="3" stroke-dasharray="6 5"/>'+mark(140,26,False)
okp=""
for k,a in enumerate(range(200,350,22)):
    r=56; cx,cy=85,118
    x=cx+r*math.cos(math.radians(a)); y=cy+r*math.sin(math.radians(a))
    off=7 if k%2 else -7
    nx=x+off*math.cos(math.radians(a)); ny=y+off*math.sin(math.radians(a))
    okp+=foot(nx,ny,a+90,OK)
okp+=f'<path d="M38,118 A47,47 0 0 1 132,118" fill="none" stroke="{OK}" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#ar3)"/><defs><marker id="ar3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{OK}"/></marker></defs>'+mark(140,26,True)
ILL["turn"]=strip([ng,okp],["その場で回る","大きく弧を描いて回る"],"向きの変え方（上から見た図）")

# ---------- 飲み込み（swl） ----------
HEAD='M-6,17 C-20,12 -22,-14 -4,-19 C10,-21 19,-11 17,-2 L22,5 L17,7 L18,10 L15,12 C14,17 8,19 3,18 L2,24'
def prof(x,y,ang,c=INK):
    return f'<g transform="translate({x},{y}) rotate({ang})"><path d="{HEAD}" fill="#fff" stroke="{c}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="8" cy="-4" r="2.2" fill="{c}"/></g>'
def body(c=INK): return line([(72,84),(66,148)],c,5)+line([(72,90),(84,118),(104,106)],c)
s1=body()+prof(78,62,14)+line([(104,106),(102,74)],INK,3)+f'<ellipse cx="101" cy="72" rx="6" ry="3" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'+mark(140,26,True)
s1+=line([(98,92),(112,92)],OK,0)+text(130,128,"少しうつむき",11,OK)+text(130,142,"加減",11,OK)
s2=body()+prof(76,62,-32)+f'<rect x="86" y="24" width="16" height="26" rx="2" transform="rotate(-55 94 37)" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'+mark(140,26,False)+text(122,128,"首を反らすと",11,NG)+text(122,142,"むせやすい",11,NG)
cup=f'<path d="M46,86 Q56,58 78,58 L122,58 L112,140 H58 Z" fill="#fff" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>'
cup+=f'<path d="M30,52 Q40,62 46,80" fill="none" stroke="{OK}" stroke-width="2.5" marker-end="url(#ar2)"/>'+'<defs><marker id="ar2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="'+OK+'"/></marker></defs>'
cup+=text(56,40,"鼻側を切ってある",11.5,OK)
ILL["swallow"]=strip([s1,s2,cup],["あごを少し引く","あごが上がる|（むせやすい）","縁の一部を切ったコップ|首を反らさずに飲める"],"飲み込みやすい姿勢")

# ---------- 寝室の安全（rbd, 上から見た図） ----------
room=f'<rect x="20" y="16" width="300" height="140" fill="#fff" stroke="{INK}" stroke-width="4"/>'
room+=line([(110,16),(230,16)],"#7fb3d5",8)+text(170,34,"窓（ベッドから離す）",12,INK,"middle","500")
room+=f'<rect x="150" y="70" width="70" height="74" rx="4" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+f'<rect x="160" y="76" width="50" height="14" rx="4" fill="#fff" stroke="{INK}" stroke-width="2"/>'+text(185,122,"低いベッド",11.5)
room+=f'<rect x="92" y="78" width="52" height="66" fill="none" stroke="{OK}" stroke-width="2.5" stroke-dasharray="5 4"/>'+text(118,108,"床に",11,OK)+text(118,122,"マット",11,OK)
room+=f'<rect x="232" y="94" width="34" height="30" fill="#fff" stroke="{INK}" stroke-width="3"/>'+"".join(circle(x,y,4,OK,2,SOFT) for x,y in ((232,94),(266,94),(232,124),(266,124)))+text(290,140,"角にクッション",11,OK)
room+=f'<g transform="translate(40,60)">'+f'<path d="M0,30 L10,0 L20,30 z" fill="#fff" stroke="{GREY}" stroke-width="2"/>'+line([(-4,-4),(24,34)],NG,3)+'</g>'+text(52,112,"割れ物・",11,NG,"middle","500")+text(52,126,"危ない物は",11,NG,"middle","500")+text(52,140,"置かない",11,NG,"middle","500")
ILL["rbd"]=wide(room,"寝室の安全（上から見た図）|夢で手足が動いても、けがをしにくい配置に",2,"寝室の安全")

# ---------- 夜間のトイレ（uri, 上から見た図） ----------
t=f'<rect x="20" y="16" width="190" height="140" fill="#fff" stroke="{INK}" stroke-width="4"/>'+f'<rect x="210" y="56" width="110" height="60" fill="#fff" stroke="{INK}" stroke-width="4"/>'+line([(210,64),(210,108)],"#fff",8)
t+=f'<rect x="36" y="40" width="64" height="92" rx="4" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+text(68,92,"ベッド",11.5)
t+=f'<rect x="108" y="44" width="30" height="30" rx="4" fill="#fff" stroke="{OK}" stroke-width="2.5"/>'+text(123,63,"P",12,OK)+text(150,40,"ポータブル",10.5,OK,"start","500")+text(150,53,"トイレ",10.5,OK,"start","500")
t+=f'<ellipse cx="290" cy="86" rx="14" ry="18" fill="#fff" stroke="{INK}" stroke-width="3"/>'+text(258,134,"トイレ",11.5)
t+="".join(f'<circle cx="{x}" cy="{y}" r="5" fill="#f2c94c" stroke="{TAPE}" stroke-width="1.5"/>' for x,y in ((120,104),(150,96),(180,90),(214,86),(246,86)))
t+=f'<path d="M104,110 C140,104 180,92 270,86" fill="none" stroke="{OK}" stroke-width="2.5" stroke-dasharray="6 5"/>'+text(150,126,"足元灯",11,TAPE)
ILL["night"]=wide(t,"夜間のトイレ（上から見た図）|トイレに近い寝室・足元灯・ポータブルトイレ",2,"夜間のトイレ")

# ---------- 排便の姿勢（con） ----------
toilet=f'<path d="M40,96 h56 q4,0 4,6 l-8,22 h-40 l-8,-22 q-4,-6 0,-6 z" fill="#fff" stroke="{INK}" stroke-width="3"/>'+line([(52,124),(54,142),(82,142),(84,124)],INK,3)+f'<rect x="20" y="56" width="18" height="46" rx="3" fill="#fff" stroke="{INK}" stroke-width="3"/>'
stool=f'<rect x="96" y="120" width="40" height="22" rx="3" fill="{SOFT}" stroke="{OK}" stroke-width="3"/>'+text(116,160,"足台",11.5,OK)
po='<g transform="translate(85,0)">'+floor()+toilet+stool+person(dict(hip=(70,94),neck=(96,58),head=(104,46),knee=(102,86),foot=(112,118),toe=(124,118),elbow=(108,72),hand=(110,86)))+mark(150,24,True)+'</g>'
ILL["toilet"]=wide(po,"足台に足をのせ、少し前かがみに|（ひざがお尻より高くなる姿勢）",2,"出しやすい排便の姿勢")


# ======== 追加（2026-11-26 夕） ========
AR='<defs><marker id="ar4" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="'+OK+'"/></marker></defs>'
def arc(d,c=OK,w=3): return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" marker-end="url(#ar4)"/>'
# ---- ながら動作（fall） ----
box=lambda x,y,c=INK: f'<rect x="{x-9}" y="{y-9}" width="18" height="16" rx="2" fill="#fff" stroke="{c}" stroke-width="3"/>'
c1=floor()+person(dict(head=(78,30),neck=(78,43),hip=(76,90),knee=(92,112),foot=(100,138),toe=(112,136),elbow=(92,60),hand=(106,66)),
   back=dict(knee=(68,116),foot=(56,140),toe=(66,141),elbow=(88,64),hand=(100,72)))+box(108,64)+box(100,74,GREY)+mark(140,26,False)
cart=f'<rect x="96" y="80" width="46" height="40" rx="4" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+line([(96,80),(88,62)],INK,3)+circle(104,130,7,INK,3)+circle(136,130,7,INK,3)+box(118,74)
c2=floor()+AR+cart+person(dict(head=(60,32),neck=(62,45),hip=(60,92),knee=(72,114),foot=(78,140),toe=(90,140),elbow=(74,60),hand=(88,62)),
   back=dict(knee=(54,116),foot=(46,140),toe=(56,141)))+mark(150,26,True)
ILL["carry"]=strip([c1,c2],["両手に物を持って歩く","物はワゴンで運ぶ|（せめて片手を空ける）"],"ながら動作を避ける")
# ---- 寝返り（bed）：上から見た図 ----
bedT=lambda: f'<rect x="38" y="10" width="94" height="150" rx="6" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+f'<rect x="58" y="16" width="54" height="18" rx="6" fill="#fff" stroke="{INK}" stroke-width="2"/>'
r1=AR+bedT()+num(20,20,1)+circle(85,30,10)+line([(62,50),(108,50)],INK,5)+line([(85,50),(85,98)],INK,5)+line([(72,98),(98,98)],INK,5)
r1+=line([(72,98),(70,122),(74,144)],INK)+line([(98,98),(100,122),(96,144)],INK)+f'<circle cx="70" cy="122" r="5" fill="{OK}"/><circle cx="100" cy="122" r="5" fill="{OK}"/>'
r1+=line([(62,50),(58,76)],INK)+line([(108,50),(112,76)],INK)
r2=AR+bedT()+num(20,20,2)+circle(92,30,10)+f'<circle cx="101" cy="30" r="3" fill="{INK}"/>'
r2+=line([(72,52),(106,48)],INK,5)+line([(88,50),(86,98)],INK,5)+line([(76,100),(98,96)],INK,5)
r2+=line([(76,100),(104,118),(106,142)],INK)+line([(98,96),(114,114),(112,140)],INK)
r2+=line([(72,52),(98,72)],INK)+line([(106,48),(116,68)],INK)
r2+=arc("M60,112 Q86,96 118,108")+arc("M58,62 Q80,44 110,54")+text(150,108,"ひざ",11,OK,"middle","500")+text(150,56,"肩",11,OK,"middle","500")
ILL["roll"]=strip([r1,r2],["あお向けで両ひざを立てる","向く方へ顔を向け、|ひざと肩を一緒に倒す"],"寝返りのこつ（上から見た図）")
# ---- 着替え（adl） ----
d1=chair()+floor()+person(sit((74,98),(72,54),(72,40),(108,98),(108,140),(92,82),(108,118)))
d1+=f'<path d="M100,112 L118,112 L116,138 L102,138 Z" fill="{SOFT}" stroke="{OK}" stroke-width="2.5"/>'+text(132,74,"座って",12,OK)+text(132,89,"はく",12,OK)
fx=85
def sleeve(pts): return line(pts,OK,15)+line(pts,SOFT,9)
def legs(): return line([(fx,110),(fx-10,142)],INK)+line([(fx,110),(fx+10,142)],INK)
# ① 動かしにくい腕（図の右）に袖を通す。反対側の身ごろは背中側に垂れている（点線）
d2=f'<path d="M{fx-24},50 C{fx-34},70 {fx-36},92 {fx-34},112 L{fx-14},112" fill="none" stroke="{OK}" stroke-width="2.5" stroke-dasharray="5 4"/>'
d2+=line([(fx,50),(fx,110)],INK,5)+line([(fx-23,52),(fx-38,80),(fx-42,104)],INK)+legs()
d2+=f'<path d="M{fx},50 L{fx+23},50 L{fx+28},112 L{fx},112 Z" fill="{SOFT}" stroke="{OK}" stroke-width="3" stroke-linejoin="round"/>'+line([(fx+2,50),(fx+12,74)],OK,2.5)
d2+=sleeve([(fx+23,52),(fx+37,82),(fx+40,106)])+circle(fx,32,12)+circle(fx+3,90,2.5,OK,0,OK)
d2+=text(fx+40,140,"先に",11,OK)+text(fx+40,154,"通す",11,OK)
# ② 反対の腕を後ろから通して完成
d3=line([(fx,50),(fx,110)],INK,5)+legs()
d3+=f'<path d="M{fx-23},50 L{fx+23},50 L{fx+28},112 L{fx-28},112 Z" fill="{SOFT}" stroke="{OK}" stroke-width="3" stroke-linejoin="round"/>'
d3+=line([(fx-10,50),(fx,74),(fx+10,50)],OK,2.5)+circle(fx,86,2.5,OK,0,OK)+circle(fx,100,2.5,OK,0,OK)
d3+=sleeve([(fx+23,52),(fx+37,82),(fx+40,106)])+sleeve([(fx-23,52),(fx-37,82),(fx-40,106)])+circle(fx,32,12)
d3+=AR+arc(f"M{fx-62},112 Q{fx-60},84 {fx-48},66")+text(fx-56,140,"後から",11,OK)+text(fx-56,154,"通す",11,OK)
ILL["dress"]=strip([d1,d2,d3],["ズボンは座ってはく","上着は動かしにくい腕を|先に袖へ通す","反対の腕を通す|（脱ぐ時は逆の順）"],"着替えのこつ")
# ---- 食事・身の回りの道具（adl） ----
u1=f'<rect x="22" y="66" width="78" height="28" rx="14" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+line([(100,80),(124,80)],INK,4)+f'<ellipse cx="140" cy="80" rx="17" ry="11" fill="#fff" stroke="{INK}" stroke-width="3"/>'
u2=f'<path d="M30,82 h110 l-8,26 h-94 z" fill="#fff" stroke="{INK}" stroke-width="3"/>'+line([(30,82),(30,66)],INK,3)+line([(140,82),(140,66)],INK,3)+f'<rect x="26" y="110" width="118" height="8" rx="3" fill="{SOFT}" stroke="{OK}" stroke-width="2"/>'+text(85,134,"すべり止め",11,OK,"middle","500")
u3=f'<path d="M58,60 h52 l-6,74 h-40 z" fill="#fff" stroke="{INK}" stroke-width="3"/>'+f'<rect x="54" y="52" width="60" height="10" rx="3" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+line([(96,52),(110,22)],INK,4)+f'<rect x="110" y="70" width="14" height="30" rx="7" fill="none" stroke="{INK}" stroke-width="3"/>'
u4=f'<rect x="70" y="40" width="22" height="90" rx="10" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+f'<rect x="74" y="20" width="14" height="22" rx="4" fill="#fff" stroke="{INK}" stroke-width="3"/>'+circle(81,80,5,OK,2,"#fff")
ILL["tools"]=strip([u1,u2,u3,u4],["持ち手の太い|スプーン","縁が高く|すべりにくい皿","ふた・ストロー付き|の重いコップ","電動歯ブラシ"],"便利な道具")
# ---- 顔と声の体操（spk・drl） ----
def face(extra,eyes="norm",brow=0):
    f=circle(85,80,46,INK,4)
    by=56-brow
    f+=line([(62,by),(76,by-3)],INK,3)+line([(94,by-3),(108,by)],INK,3)
    f+=circle(70,70,3.5,INK,0,INK)+circle(100,70,3.5,INK,0,INK)
    return f+extra
f1=AR+face(line([(74,104),(96,104)],INK,3),brow=10)+arc("M44,46 L44,30")+arc("M126,46 L126,30")
f2=face(f'<ellipse cx="85" cy="104" rx="10" ry="5" fill="#fff" stroke="{INK}" stroke-width="3"/>'+f'<circle cx="54" cy="96" r="12" fill="{SOFT}" stroke="{OK}" stroke-width="2"/><circle cx="116" cy="96" r="12" fill="{SOFT}" stroke="{OK}" stroke-width="2"/>')
f3=face(f'<ellipse cx="85" cy="106" rx="15" ry="14" fill="#fff" stroke="{INK}" stroke-width="3"/>')+text(146,40,"アー",13,OK)
f4=AR+face(f'<path d="M73,102 q12,6 24,0" fill="none" stroke="{INK}" stroke-width="3"/><path d="M78,104 v12 q7,10 14,0 v-12" fill="#f4b6b6" stroke="{INK}" stroke-width="2.5"/>')+arc("M60,128 L44,128")+arc("M110,128 L126,128")
ILL["face"]=strip([f1,f2,f3,f4],["眉を上げる","頬をふくらませる","口を大きく開けて|大きな声で「アー」","舌を出して|左右に動かす"],"顔と声の体操")
# ---- 壁で姿勢（pos） ----
wall=f'<rect x="40" y="14" width="14" height="128" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'
pw=floor()+wall+person(dict(head=(66,32),neck=(62,45),hip=(62,92),knee=(64,117),foot=(62,140),toe=(76,140),elbow=(62,66),hand=(64,88)))
for (x,y,l) in ((55,32,"後頭部"),(55,62,"背中"),(55,94,"お尻"),(55,138,"かかと")):
    pw+=f'<circle cx="{x}" cy="{y}" r="5" fill="{OK}"/>'+line([(x+6,y),(104,y)],OK,1.5)+text(108,y+4,l,12,OK,"start")
ILL["wall"]=wide('<g transform="translate(85,0)">'+pw+'</g>',"壁に4か所をつけて立つ練習|（胸を開くストレッチも）",2,"姿勢の体操")
# ---- 頭を高くして寝る・日中はソファで（oh） ----
h1=AR+line([(10,128),(150,128)],GREY,2)+f'<path d="M14,112 L150,96 L150,108 L14,124 Z" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+line([(18,124),(18,142)],INK,3)+line([(146,108),(146,142)],INK,3)
h1+=f'<g transform="rotate(-6.7 80 100)">'+circle(136,84,10)+line([(124,92),(40,100)],INK,5)+line([(40,100),(20,100)],INK)+'</g>'+text(64,52,"頭側を少し高く",12,OK)+arc("M156,118 L156,90")
sofa=f'<path d="M24,96 h110 v26 h-110 z" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+f'<rect x="20" y="56" width="18" height="66" rx="6" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+line([(30,122),(30,140)],INK,3)+line([(128,122),(128,140)],INK,3)
h2=floor()+sofa+person(sit((56,92),(52,50),(52,37),(92,94),(96,140),(64,72),(84,88)))+mark(146,26,True)
ILL["headup"]=strip([h1,h2],["夜はベッドの頭側を|少し高くして寝る","日中は横にならず|ソファや椅子で休む"],"立ちくらみを減らす休み方")
# ---- 足を高くして休む（edm・uri） ----
lu=floor()+chair()+f'<rect x="108" y="100" width="44" height="20" rx="4" fill="{SOFT}" stroke="{INK}" stroke-width="3"/>'+line([(112,120),(112,142)],INK,3)+line([(148,120),(148,142)],INK,3)
lu+=person(dict(hip=(64,98),neck=(52,56),head=(48,43),knee=(100,94),foot=(134,96),toe=(136,84),elbow=(62,76),hand=(78,94)))
ILL["legup"]=wide('<g transform="translate(85,0)">'+lu+'</g>',"夕方に足を高くして休む|（足のむくみ・夜間の尿を減らす）",2,"足を高くして休む")
# ---- 「の」の字マッサージ（con） ----
AR5='<defs><marker id="ar5" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="'+OK+'"/></marker></defs>'
tor=AR5+circle(85,18,12)+f'<path d="M48,40 Q85,30 122,40 C126,80 128,120 120,156 H50 C42,120 44,80 48,40 Z" fill="#fff" stroke="{INK}" stroke-width="3"/>'+circle(85,104,3,INK,0,INK)
tor+=f'<path d="M64,132 C54,110 56,84 72,78 C88,72 110,76 112,96 C114,114 110,126 104,134" fill="none" stroke="{OK}" stroke-width="4" stroke-linecap="round" marker-end="url(#ar5)"/>'
tor+=text(20,150,"本人の右",10.5,GREY,"middle","500")+text(150,150,"本人の左",10.5,GREY,"middle","500")
ILL["massage"]=wide('<g transform="translate(85,0)">'+tor+'</g>',"おへその周りを「の」の字に|（時計回りに、やさしく）",2,"おなかのマッサージ")

json.dump(ILL,open("illus.json","w"),ensure_ascii=False)
html='<html><body style="font-family:sans-serif;background:#eee">'+"".join(f'<h3>{k}</h3><div style="width:640px;background:#fff">{v}</div>' for k,v in ILL.items())+'</body></html>'
open("preview.html","w").write(html)
print({k:len(v) for k,v in ILL.items()})
