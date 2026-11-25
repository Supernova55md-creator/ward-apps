/* ===== 模式図（すべて自作のSVG。実際の画像ではない） =====
   座標系：1パネル 240×270。画像の左＝患者の右（放射線学的表示）。
   半球の図形は「画像の右側（患者の左）」の座標で定義し、患者の右は鏡像にする。 */
var IMG = (function () {
  var CX = 120, CY = 138, RX = 92, RY = 116;
  var PAL = {
    ct:    { bg: "#000", skull: "#efefef", br: "#8b8b8b", deep: "#a3a3a3", wm: "#848484", csf: "#262626", early: "#6c6c6c", old: "#3e3e3e", blood: "#ececec", vessel: "#d6d6d6", ic: "#7c7c7c" },
    cta:   { bg: "#000", skull: "#efefef", br: "#8f8f8f", deep: "#989898", wm: "#888", csf: "#2a2a2a", early: "#6c6c6c", old: "#3e3e3e", blood: "#ececec", vessel: "#f4f4f4", ic: "#808080" },
    dwi:   { bg: "#000", skull: "#1c1c1c", br: "#4e4e4e", deep: "#5f5f5f", wm: "#4a4a4a", csf: "#121212", lesion: "#f5f5f5", ic: "#4a4a4a" },
    flair: { bg: "#000", skull: "#202020", br: "#6a6a6a", deep: "#7b7b7b", wm: "#666", csf: "#111", lesion: "#dadada", ic: "#666" },
    ctp:   { bg: "#000", skull: "#3a3a3a", br: "#2c2c2c", deep: "#303030", wm: "#2a2a2a", csf: "#0c0c0c", core: "#ff2d95", pen: "#2bd46b", ic: "#2a2a2a" }
  };
  function P(r) { return Math.round(r * 10) / 10; }
  function ell(s, th) { var t = th * Math.PI / 180; return [CX + RX * s * Math.cos(t), CY + RY * s * Math.sin(t)]; }
  /* 皮質のくさび（画像の右側＝患者の左） */
  function wedge(a1, a2, s1, s2) {
    var d = "", n = 14, i, p;
    for (i = 0; i <= n; i++) { p = ell(s2, a1 + (a2 - a1) * i / n); d += (i ? "L" : "M") + P(p[0]) + "," + P(p[1]); }
    for (i = n; i >= 0; i--) { p = ell(s1, a1 + (a2 - a1) * i / n); d += "L" + P(p[0]) + "," + P(p[1]); }
    return d + "Z";
  }
  /* ASPECTS 領域（患者の左側の座標） */
  var REG = {
    C: "M130,101 Q138,97 144,104 Q146,114 141,122 Q134,124 131,117 Q129,108 130,101Z",
    L: "M152,112 Q171,123 170,160 Q160,168 154,152 Q149,132 152,112Z",
    IC: "M144,123 L149,117 L153,136 L158,166 L151,170 L146,141 Z",
    I: "M173,110 Q182,140 173,172 L178,172 Q188,140 178,110 Z",
    M1: wedge(-62, -22, 0.76, 0.985), M2: wedge(-22, 28, 0.76, 0.985), M3: wedge(28, 62, 0.76, 0.985),
    M4: wedge(-62, -20, 0.42, 0.985), M5: wedge(-20, 25, 0.42, 0.985), M6: wedge(25, 62, 0.42, 0.985),
    ACA_g: wedge(-90, -62, 0.5, 0.985), PCA_g: wedge(62, 90, 0.5, 0.985),
    ACA_s: wedge(-90, -62, 0.2, 0.985), PCA_s: wedge(62, 90, 0.3, 0.985),
    TH: "M122,146 Q140,141 145,157 Q142,172 126,172 Q122,160 122,146Z"
  };
  var LAB = { C: [137, 112], L: [161, 142], IC: [150, 128], I: [181, 152], M1: ell(0.87, -42), M2: ell(0.87, 3), M3: ell(0.87, 45), M4: ell(0.72, -41), M5: ell(0.72, 2), M6: ell(0.72, 43) };
  function mir(svg) { return '<g transform="translate(240,0) scale(-1,1)">' + svg + "</g>"; }
  function side(s, svg) { return s === "R" ? mir(svg) : svg; }
  function both(svg) { return svg + mir(svg); }
  function head(c, mod) {
    var h = '<rect x="0" y="0" width="240" height="270" fill="' + c.bg + '"/>';
    if (mod === "ct" || mod === "cta") h += '<ellipse cx="' + CX + '" cy="' + CY + '" rx="' + (RX + 6) + '" ry="' + (RY + 6) + '" fill="none" stroke="' + c.skull + '" stroke-width="7"/>';
    else h += '<ellipse cx="' + CX + '" cy="' + CY + '" rx="' + (RX + 7) + '" ry="' + (RY + 7) + '" fill="none" stroke="' + c.skull + '" stroke-width="5"/>';
    return h;
  }
  function brainBase(c) {
    return '<ellipse cx="' + CX + '" cy="' + CY + '" rx="' + RX + '" ry="' + RY + '" fill="' + c.br + '"/>' +
      '<path d="M120,22 L120,58 M120,216 L120,254" stroke="' + c.csf + '" stroke-width="2.4"/>';
  }
  /* 脳溝（皮質の目安） */
  function sulci(c) {
    var s = "", a = [-72, -46, -24, -2, 20, 42, 66];
    a.forEach(function (t) { var p = ell(0.985, t), q = ell(0.945, t); s += '<path d="M' + P(p[0]) + "," + P(p[1]) + " L" + P(q[0]) + "," + P(q[1]) + '" stroke="' + c.csf + '" stroke-width="1.6"/>'; });
    return both(s);
  }
  /* 基底核レベル */
  function sliceBG(c, o) {
    var dx = o.shift || 0, sq = o.squeeze || "";
    var vent = function (sd) {
      var comp = (sq === sd) ? 0.45 : 1;
      var fh = "M121,90 Q" + (121 + 13 * comp) + ",93 " + (121 + 14 * comp) + ",107 Q" + (121 + 13 * comp) + ",121 " + (121 + 5 * comp) + ",128 L121,128 Z";
      var at = "M124,184 Q" + (124 + 16 * comp) + ",186 " + (124 + 18 * comp) + ",198 Q" + (124 + 12 * comp) + ",205 124,201 Z";
      return '<path d="' + fh + '" fill="' + (o.ivh ? c.blood : c.csf) + '"/><path d="' + at + '" fill="' + (o.ivh ? c.blood : c.csf) + '"/>';
    };
    var hemi = '<path d="' + REG.C + '" fill="' + c.deep + '"/><path d="' + REG.L + '" fill="' + c.deep + '"/><path d="' + REG.IC + '" fill="' + c.ic + '"/>' +
      '<path d="' + REG.TH + '" fill="' + c.deep + '"/><path d="' + REG.I + '" fill="' + c.deep + '"/>' +
      '<path d="M182,106 Q192,140 182,176" fill="none" stroke="' + c.csf + '" stroke-width="2.6"/><path d="M186,124 L208,116" stroke="' + c.csf + '" stroke-width="2"/>';
    var g = '<g transform="translate(' + dx + ',0)">' + vent("L") + mir(vent("R")) +
      '<rect x="118.5" y="140" width="3" height="26" rx="1.5" fill="' + (o.ivh ? c.blood : c.csf) + '"/></g>';
    return hemi + mir(hemi) + g;
  }
  /* 放線冠レベル */
  function sliceSup(c, o) {
    var dx = o.shift || 0;
    var v = '<path d="M121,98 Q133,104 134,140 Q133,176 121,186 Z" fill="' + (o.ivh ? c.blood : c.csf) + '"/>';
    return '<g transform="translate(' + dx + ',0)">' + v + mir(v) + "</g>";
  }
  /* 鞍上部（中脳）レベル */
  function sliceMid(c, o) {
    var sah = o.sah, f = sah ? c.blood : c.csf;
    var h = '<path d="M120,104 L136,114 L132,132 L108,132 L104,114 Z" fill="' + f + '"/>';
    var sy = '<path d="M134,116 Q160,110 196,98" fill="none" stroke="' + f + '" stroke-width="' + (sah ? 5 : 2.6) + '" stroke-linecap="round"/>';
    h += sy + mir(sy);
    h += '<path d="M120,168 Q100,168 98,150 Q100,134 110,136 L120,146 L130,136 Q140,134 142,150 Q140,168 120,168Z" fill="' + c.deep + '"/>';
    var amb = '<path d="M141,138 Q150,152 140,172" fill="none" stroke="' + f + '" stroke-width="' + (sah ? 4 : 2) + '"/>';
    h += amb + mir(amb) + '<path d="M108,176 Q120,184 132,176" fill="none" stroke="' + f + '" stroke-width="' + (sah ? 5 : 2.4) + '"/>';
    if (o.hdmca) { var m = '<path d="M136,117 Q158,112 184,104" fill="none" stroke="' + c.blood + '" stroke-width="3.2" stroke-linecap="round"/>'; h += side(o.hdmca, m); }
    h += '<path d="M44,150 Q60,190 80,214 M196,150 Q180,190 160,214" stroke="' + c.csf + '" stroke-width="1.5" fill="none" opacity=".6"/>';
    return h;
  }
  /* 後頭蓋窩レベル */
  function slicePF(c, o) {
    var h = '<rect x="0" y="0" width="240" height="270" fill="' + c.bg + '"/>';
    h += '<ellipse cx="120" cy="150" rx="' + (RX + 4) + '" ry="' + (RY - 4) + '" fill="none" stroke="' + c.skull + '" stroke-width="7"/>';
    h += '<ellipse cx="120" cy="150" rx="' + (RX - 4) + '" ry="' + (RY - 12) + '" fill="' + c.br + '"/>';
    var pet = '<path d="M150,52 L196,118" stroke="' + c.skull + '" stroke-width="8" stroke-linecap="round"/>';
    h += pet + mir(pet);
    h += '<path d="M120,50 L120,86" stroke="' + c.skull + '" stroke-width="5"/>';
    h += '<ellipse cx="120" cy="112" rx="24" ry="18" fill="' + c.deep + '"/>';
    h += '<path d="M110,138 Q120,130 130,138 Q126,148 120,150 Q114,148 110,138Z" fill="' + (o.v4 === "cmp" ? c.br : c.csf) + '"/>';
    h += '<path d="M120,152 L120,248" stroke="' + c.csf + '" stroke-width="1.6"/>';
    var fol = ""; [0, 1, 2, 3].forEach(function (i) { fol += '<path d="M' + (138 + i * 3) + "," + (176 + i * 14) + " Q" + (170 + i * 2) + "," + (168 + i * 14) + " " + (196 - i * 6) + "," + (186 + i * 12) + '" fill="none" stroke="' + c.csf + '" stroke-width="1.2" opacity=".8"/>'; });
    h += fol + mir(fol);
    return h;
  }
  function blob(b, c) {
    var col = b.f === "blood" ? c.blood : b.f === "old" ? c.old : b.f === "early" ? c.early : b.f === "core" ? c.core : b.f === "pen" ? c.pen : c.lesion;
    var s = '<ellipse cx="' + b.x + '" cy="' + b.y + '" rx="' + b.rx + '" ry="' + (b.ry || b.rx) + '" fill="' + col + '"' + (b.rot ? ' transform="rotate(' + b.rot + " " + b.x + " " + b.y + ')"' : "") + (b.op ? ' opacity="' + b.op + '"' : "") + "/>";
    return side(b.side || "L", s);
  }
  function regFill(o, c) {
    var col = o.f === "early" ? c.early : o.f === "old" ? c.old : o.f === "core" ? c.core : o.f === "pen" ? c.pen : o.f === "blood" ? c.blood : c.lesion;
    var s = o.r.map(function (k) { return '<path d="' + REG[k] + '" fill="' + col + '"' + (o.op ? ' opacity="' + o.op + '"' : "") + "/>"; }).join("");
    return side(o.side || "L", s);
  }
  function labels(keys, sd, col) {
    return keys.map(function (k) {
      var p = LAB[k]; var x = sd === "R" ? 240 - p[0] : p[0];
      return '<text x="' + P(x) + '" y="' + P(p[1] + 3) + '" font-size="8.5" font-weight="700" text-anchor="middle" fill="' + (col || "#ffd34d") + '" stroke="#000" stroke-width="2.2" paint-order="stroke">' + k + "</text>";
    }).join("");
  }
  /* 1枚の軸位断 */
  function axial(sp, after) {
    var mod = sp.mod || "ct", c = PAL[mod], sl = sp.sl || "bg", o = sp.o || {};
    var h;
    if (sl === "pf") h = slicePF(c, o);
    else {
      h = head(c, mod) + brainBase(c) + sulci(c);
      if (sl === "bg") h += sliceBG(c, o);
      else if (sl === "sup") h += sliceSup(c, o);
      else if (sl === "mid") h += sliceMid(c, o);
    }
    (sp.reg || []).forEach(function (r) { h += regFill(r, c); });
    if (sl === "bg" || sl === "sup") {
      /* 脳室など領域の上に重ねる構造（梗塞の塗りで脳室が消えないように） */
      if (sl === "bg") { var dx = o.shift || 0; if ((sp.reg || []).length) h += '<g transform="translate(' + dx + ',0)">' + sliceBGvent(c, o) + "</g>"; }
      if (sl === "sup" && (sp.reg || []).length) h += sliceSup(c, o);
    }
    (sp.blob || []).forEach(function (b) { h += blob(b, c); });
    if (o.delta) {
      h += '<path d="M120,226 L102,254 L138,254 Z" fill="#f2f2f2"/><path d="M120,236 L110,250 L130,250 Z" fill="#5a5a5a"/>';
    }
    if (o.cal) o.cal.forEach(function (k) {
      h += '<line x1="' + k[0] + '" y1="' + k[1] + '" x2="' + k[2] + '" y2="' + k[3] + '" stroke="#ffd34d" stroke-width="1.4" stroke-dasharray="3 2"/>' +
        '<text x="' + k[4] + '" y="' + k[5] + '" font-size="10" font-weight="700" fill="#ffd34d" stroke="#000" stroke-width="2" paint-order="stroke">' + k[6] + "</text>";
    });
    if (after && sp.lab) sp.lab.forEach(function (l) { h += labels(l.k, l.side || "L", l.col); });
    if (after && sp.mark) sp.mark.forEach(function (m) {
      var x = m.side === "R" ? 240 - m.x : m.x;
      h += '<circle cx="' + x + '" cy="' + m.y + '" r="' + (m.r || 14) + '" fill="none" stroke="#ffd34d" stroke-width="2" stroke-dasharray="4 3"/>';
      var ty = m.y + (m.r || 14) + 11; if (ty > 262) ty = m.y - (m.r || 14) - 5;
      if (m.t) h += '<text x="' + x + '" y="' + ty + '" font-size="9" font-weight="700" text-anchor="middle" fill="#ffd34d" stroke="#000" stroke-width="2" paint-order="stroke">' + m.t + "</text>";
    });
    if (mod === "ctp" && sp.vol) {
      h += '<rect x="6" y="226" width="228" height="40" rx="5" fill="#111" stroke="#444"/>' +
        '<rect x="12" y="233" width="10" height="10" fill="' + c.core + '"/><text x="26" y="242" font-size="9.5" fill="#eee">rCBF&lt;30%：' + sp.vol[0] + ' mL</text>' +
        '<rect x="122" y="233" width="10" height="10" fill="' + c.pen + '"/><text x="136" y="242" font-size="9.5" fill="#eee">Tmax&gt;6秒：' + sp.vol[1] + ' mL</text>' +
        '<text x="12" y="259" font-size="9.5" fill="#eee">ミスマッチ体積 ' + (sp.vol[1] - sp.vol[0]) + ' mL ／ 比 ' + (sp.vol[1] / sp.vol[0]).toFixed(1) + "</text>";
    }
    return h;
  }
  function sliceBGvent(c, o) {
    var sq = o.squeeze || "";
    var vent = function (sd) {
      var comp = (sq === sd) ? 0.45 : 1;
      var fh = "M121,90 Q" + (121 + 13 * comp) + ",93 " + (121 + 14 * comp) + ",107 Q" + (121 + 13 * comp) + ",121 " + (121 + 5 * comp) + ",128 L121,128 Z";
      var at = "M124,184 Q" + (124 + 16 * comp) + ",186 " + (124 + 18 * comp) + ",198 Q" + (124 + 12 * comp) + ",205 124,201 Z";
      return '<path d="' + fh + '" fill="' + (o.ivh ? c.blood : c.csf) + '"/><path d="' + at + '" fill="' + (o.ivh ? c.blood : c.csf) + '"/>';
    };
    return vent("L") + mir(vent("R"));
  }
  /* MRA（ウィリス動脈輪の軸位MIP） */
  function mra(sp) {
    var oc = sp.occ || [], st = sp.sten || [];
    var W = '<rect x="0" y="0" width="240" height="270" fill="#000"/>';
    var seg = {
      BA: "M120,218 L120,160", VAr: "M104,262 Q106,238 117,220", VAl: "M136,262 Q134,238 123,220",
      P1r: "M120,160 Q108,156 100,154", P2r: "M100,154 Q78,162 74,190 Q72,212 82,232", P1l: "M120,160 Q132,156 140,154", P2l: "M140,154 Q162,162 166,190 Q168,212 158,232",
      PCr: "M100,154 L98,132", PCl: "M140,154 L142,132",
      ICAr: "M88,160 Q84,146 94,138 L98,132", ICAl: "M152,160 Q156,146 146,138 L142,132",
      M1r: "M98,132 Q76,128 58,126", M1l: "M142,132 Q164,128 182,126",
      M2r: "M58,126 Q44,112 30,96 M58,126 Q44,142 32,160", M2l: "M182,126 Q196,112 210,96 M182,126 Q196,142 208,160",
      A1r: "M98,132 Q106,120 115,114", A1l: "M142,132 Q134,120 125,114", ACo: "M115,114 L125,114",
      A2r: "M116,114 Q114,90 116,52", A2l: "M124,114 Q126,90 124,52"
    };
    var wid = { BA: 5.5, VAr: 4.5, VAl: 4.5, ICAr: 6, ICAl: 6, M1r: 4.6, M1l: 4.6, M2r: 3, M2l: 3, A1r: 3.4, A1l: 3.4, A2r: 3.2, A2l: 3.2, ACo: 2, P1r: 3.4, P1l: 3.4, P2r: 3, P2l: 3, PCr: 1.8, PCl: 1.8 };
    Object.keys(seg).forEach(function (k) {
      if (oc.indexOf(k) >= 0) return;
      W += '<path d="' + seg[k] + '" fill="none" stroke="#f2f2f2" stroke-width="' + wid[k] + '" stroke-linecap="round" stroke-linejoin="round"/>';
    });
    if (sp.stub) sp.stub.forEach(function (s) { W += '<path d="' + s + '" fill="none" stroke="#f2f2f2" stroke-width="4.6" stroke-linecap="round"/>'; });
    st.forEach(function (s) { W += '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="4.5" fill="#000"/><path d="' + s[2] + '" stroke="#f2f2f2" stroke-width="1.4" fill="none"/>'; });
    return W;
  }
  /* 頸動脈造影（側面）とNASCET計測 */
  function angio(sp) {
    var h = '<rect x="0" y="0" width="240" height="270" fill="#e9e9e9"/>';
    var v = "#202020";
    h += '<path d="M92,262 L92,170 Q92,150 104,138" fill="none" stroke="' + v + '" stroke-width="20" stroke-linecap="round"/>';
    h += '<path d="M104,138 Q112,126 112,110 L112,104 Q112,96 113,88 L114,22" fill="none" stroke="' + v + '" stroke-width="13" stroke-linecap="round"/>';
    h += '<ellipse cx="112" cy="104" rx="10" ry="9" fill="#e9e9e9"/><path d="M110,96 L110,112" stroke="' + v + '" stroke-width="3.6"/>';
    h += '<path d="M90,152 Q80,130 64,112 Q56,96 58,70" fill="none" stroke="' + v + '" stroke-width="9" stroke-linecap="round"/>';
    h += '<path d="M72,118 Q52,118 44,102" fill="none" stroke="' + v + '" stroke-width="4"/>';
    h += '<line x1="150" y1="104" x2="122" y2="104" stroke="#c0392b" stroke-width="1.4"/><text x="146" y="98" font-size="10.5" fill="#c0392b" font-weight="700">a＝' + sp.a + ' mm</text><text x="146" y="118" font-size="9" fill="#c0392b">最狭窄部の径</text>';
    h += '<line x1="150" y1="40" x2="124" y2="40" stroke="#1f5fa8" stroke-width="1.4"/><text x="146" y="34" font-size="10.5" fill="#1f5fa8" font-weight="700">b＝' + sp.b + ' mm</text><text x="146" y="54" font-size="9" fill="#1f5fa8">遠位の正常ICA径</text>';
    h += '<text x="18" y="252" font-size="11" fill="#333">CCA</text><text x="120" y="70" font-size="11" fill="#333">ICA</text><text x="26" y="66" font-size="11" fill="#333">ECA</text>';
    return h;
  }
  function panel(sp, after) {
    if (sp.kind === "mra") return mra(sp);
    if (sp.kind === "angio") return angio(sp);
    return axial(sp, after);
  }
  function render(spec, after) {
    /* 複数パネルは縦に並べる（スマホで1枚ずつ大きく見えるように） */
    var ps = spec.panels || [spec], n = ps.length, gap = 6, H = 270 * n + gap * (n - 1);
    var s = '<svg viewBox="0 0 240 ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (spec.alt || "模式図") + '" font-family="-apple-system,Hiragino Sans,Noto Sans JP,sans-serif">';
    ps.forEach(function (p, i) {
      var y = i * (270 + gap), id = "cp" + Math.random().toString(36).slice(2, 8);
      s += '<g transform="translate(0,' + y + ')"><clipPath id="' + id + '"><rect x="0" y="0" width="240" height="270" rx="6"/></clipPath><g clip-path="url(#' + id + ')">' + panel(p, after);
      var dark = p.kind !== "angio";
      s += '<text x="8" y="16" font-size="10.5" font-weight="700" fill="' + (dark ? "#fff" : "#111") + '" stroke="' + (dark ? "#000" : "#e9e9e9") + '" stroke-width="2.5" paint-order="stroke">' + (p.t || "") + "</text>";
      if (p.kind !== "angio") s += '<text x="8" y="142" font-size="10" fill="#9fd3ff" font-weight="700">R</text><text x="226" y="142" font-size="10" fill="#9fd3ff" font-weight="700">L</text>';
      s += "</g></g>";
    });
    return s + "</svg>";
  }
  return { render: render, REG: REG };
})();
