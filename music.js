/*
 * 音・調の理論、五線譜（調号つき）の描画、音源
 * window.Music に公開します。
 */
(() => {
  'use strict';

  // ---------- 音 ----------
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const SEMI = [0, 2, 4, 5, 7, 9, 11];
  const BASE = {
    doremi: ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'],
    cde: LETTERS,
    haniho: ['ハ', 'ニ', 'ホ', 'ヘ', 'ト', 'イ', 'ロ'],
    de: ['C', 'D', 'E', 'F', 'G', 'A', 'H']
  };
  const ACC_SIGN = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };

  /** l: 幹音（0=C〜6=B）、o: オクターブ（C4 = 真ん中のド）、a: 変化（-2〜+2） */
  function note(l, o, a = 0) {
    const acc = a === 2 ? 'x' : a === 1 ? '#' : a === -1 ? 'b' : a === -2 ? 'bb' : '';
    const pc = LETTERS[l] + acc;
    return { l, o, a, dia: o * 7 + l, midi: 12 * (o + 1) + SEMI[l] + a, pc, id: pc + o };
  }
  const fromDia = (dia, a = 0) => note(((dia % 7) + 7) % 7, Math.floor(dia / 7), a);

  /** 音名（オクターブなし） */
  function name(n, sys = 'doremi') {
    const b = BASE[sys][n.l];
    if (!n.a) return b;
    if (sys === 'haniho') return ({ 2: '重嬰', 1: '嬰', '-1': '変', '-2': '重変' })[n.a] + b;
    if (sys === 'de') {
      if (n.a > 0) return b + (n.a === 2 ? 'isis' : 'is');
      let s;
      if (n.l === 6) s = 'B';
      else if (n.l === 2) s = 'Es';
      else if (n.l === 5) s = 'As';
      else s = b + 'es';
      return n.a === -2 ? (n.l === 6 ? 'Heses' : s + 'es') : s;
    }
    return b + ACC_SIGN[n.a];
  }
  const sci = (n) => LETTERS[n.l] + ACC_SIGN[n.a] + n.o;

  // ---------- 調 ----------
  // 五度圏の並び。調号の数 s の長調の主音は FIFTHS の位置 s、短調は s + 3
  const FIFTHS = [3, 0, 4, 1, 5, 2, 6]; // F C G D A E B（幹音の番号）
  const SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6]; // ファ ド ソ レ ラ ミ シ
  const FLAT_ORDER = [6, 2, 5, 1, 4, 0, 3];  // シ ミ ラ レ ソ ド ファ
  const fifthNote = (i) => ({ l: FIFTHS[(((i + 1) % 7) + 7) % 7], a: Math.floor((i + 1) / 7) });

  /** 調号 sig（♯は正、♭は負）のときの幹音 l の変化 */
  function keyAcc(sig, l) {
    if (sig > 0) return SHARP_ORDER.indexOf(l) < sig ? 1 : 0;
    if (sig < 0) return FLAT_ORDER.indexOf(l) < -sig ? -1 : 0;
    return 0;
  }

  const MODE_JA = { major: '長調', minor: '短調' };
  const KEY_SYSTEMS = {
    ja: { label: '日本式', long: '日本式（ハ長調・イ短調）' },
    en: { label: '英語', long: '英語（C major・A minor）' },
    de: { label: 'ドイツ', long: 'ドイツ式（C-Dur・a-Moll）' },
    doremi: { label: 'ドレミ', long: 'ドレミで（ド長調・ラ短調）' }
  };

  function makeKey(sig, mode) {
    const t = fifthNote(mode === 'major' ? sig : sig + 3);
    const tonic = note(t.l, 4, t.a);
    const id = tonic.pc + (mode === 'minor' ? 'm' : '');
    return { id, sig, mode, minor: mode === 'minor', tonic, l: t.l, a: t.a };
  }
  const KEYS = [];
  for (let s = -7; s <= 7; s++) { KEYS.push(makeKey(s, 'major')); KEYS.push(makeKey(s, 'minor')); }
  const KEY_BY_ID = Object.fromEntries(KEYS.map((k) => [k.id, k]));
  const key = (id) => KEY_BY_ID[id];
  const keyOf = (sig, mode) => KEYS.find((k) => k.sig === sig && k.mode === mode);
  /** 調号が ±7 を超えたら、同じ音の（異名同音の）調に置きかえる */
  const wrapSig = (s) => (s > 7 ? s - 12 : s < -7 ? s + 12 : s);

  function keyName(k, sys = 'ja') {
    const t = { l: k.l, a: k.a };
    if (sys === 'en') return LETTERS[k.l] + ACC_SIGN[k.a] + (k.minor ? ' minor' : ' major');
    if (sys === 'de') {
      const n = name(t, 'de');
      return k.minor ? n.toLowerCase() + '-Moll' : n + '-Dur';
    }
    if (sys === 'doremi') return name(t, 'doremi') + MODE_JA[k.mode];
    return name(t, 'haniho') + MODE_JA[k.mode];
  }
  const tonicName = (k, sys = 'doremi') => name({ l: k.l, a: k.a }, sys);

  /** 関係する調 */
  function related(k) {
    const other = k.minor ? 'major' : 'minor';
    const par = wrapSig(k.sig + (k.minor ? 3 : -3));
    return {
      relative: keyOf(k.sig, other),                     // 平行調（調号が同じ）
      parallel: keyOf(par, other),                       // 同主調（主音が同じ）
      parallelEnh: Math.abs(k.sig + (k.minor ? 3 : -3)) > 7, // 同主調が異名同音で置きかわった
      dominant: keyOf(wrapSig(k.sig + 1), k.mode),       // 属調（5度上）
      dominantEnh: k.sig + 1 > 7,
      subdominant: keyOf(wrapSig(k.sig - 1), k.mode),    // 下属調（5度下）
      subdominantEnh: k.sig - 1 < -7
    };
  }

  /** 調号の説明（「♯2つ（ファ・ド）」など） */
  function sigText(sig, sys = 'doremi', withNotes = true) {
    if (!sig) return '調号なし';
    const order = sig > 0 ? SHARP_ORDER : FLAT_ORDER;
    const sign = sig > 0 ? '♯' : '♭';
    const notes = order.slice(0, Math.abs(sig)).map((l) => BASE[sys][l]).join('・');
    return `${sign}${Math.abs(sig)}つ` + (withNotes ? `（${notes}）` : '');
  }

  // 音階：主音からの各音の変化（調号に対して）
  const SCALES = {
    major: { label: '長音階', base: 'major', alter: [0, 0, 0, 0, 0, 0, 0] },
    natural: { label: '自然短音階', base: 'minor', alter: [0, 0, 0, 0, 0, 0, 0] },
    harmonic: { label: '和声的短音階', base: 'minor', alter: [0, 0, 0, 0, 0, 0, 1] },
    melodic: { label: '旋律的短音階（上行）', base: 'minor', alter: [0, 0, 0, 0, 0, 1, 1] },
    dorian: { label: 'ドリア旋法', base: 'minor', alter: [0, 0, 0, 0, 0, 1, 0] },
    phrygian: { label: 'フリギア旋法', base: 'minor', alter: [0, -1, 0, 0, 0, 0, 0] },
    lydian: { label: 'リディア旋法', base: 'major', alter: [0, 0, 0, 1, 0, 0, 0] },
    mixolydian: { label: 'ミクソリディア旋法', base: 'major', alter: [0, 0, 0, 0, 0, 0, -1] }
  };

  /** 調 k の第 deg 音（0 = 主音、7 = 1オクターブ上の主音、負もOK）。alter で半音上げ下げ */
  function degree(k, deg, oct = 4, alter = 0) {
    const d = k.l + deg;
    const l = ((d % 7) + 7) % 7;
    const o = oct + Math.floor(d / 7);
    return note(l, o, keyAcc(k.sig, l) + alter);
  }
  /** 音階（主音から1オクターブ上の主音まで8音） */
  function scale(k, kind, oct = 4) {
    const sc = SCALES[kind || (k.minor ? 'natural' : 'major')];
    return Array.from({ length: 8 }, (_, i) => degree(k, i, oct, sc.alter[i % 7]));
  }
  /** 第 deg 音の上の三和音。短調の V（属和音）は導音を半音上げた形 */
  function triad(k, deg, oct = 4) {
    return [0, 2, 4].map((x) => {
      const dd = deg + x;
      const raise = k.minor && ((dd % 7) + 7) % 7 === 6 && ((deg % 7) + 7) % 7 === 4 ? 1 : 0;
      return degree(k, dd, oct, raise);
    });
  }
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  /**
   * 譜面に書く高さ：ト音記号は主音を4オクターブ目、
   * ヘ音記号は低すぎ・高すぎないように主音を2〜3オクターブ目に置く
   */
  const homeOct = (k, clef) => (clef === 'bass' ? (k.l <= 1 ? 3 : 2) : 4);

  // ---------- 五線譜（SVG） ----------
  const CLEFS = {
    treble: { label: 'ト音記号', bottom: 30 }, // 第1線 = E4
    bass: { label: 'ヘ音記号', bottom: 18 }    // 第1線 = G2
  };
  const posOf = (n, clef) => n.dia - CLEFS[clef].bottom;
  // 調号の位置（ト音記号。ヘ音記号は2オクターブ下）
  const SIG_DIA = {
    sharp: [38, 35, 39, 36, 33, 37, 34], // F5 C5 G5 D5 A4 E5 B4
    flat: [34, 37, 33, 36, 32, 35, 31]   // B4 E5 A4 D5 G4 C5 F4
  };
  const SIG_STEP = 8.2;

  const SP = 10;
  const H = SP / 2;
  const CLEF_CH = { treble: '\u{1D11E}', bass: '\u{1D122}' };
  const CLEF_BOX = { treble: [-17, 56], bass: [-0.6, 32] };
  const CLEF_FONT = '"Noto Music", "Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols 2", serif';
  let metricCache = {};

  function metrics(ch) {
    if (metricCache[ch]) return metricCache[ch];
    try {
      const c = document.createElement('canvas').getContext('2d');
      c.font = '100px ' + CLEF_FONT;
      const m = c.measureText(ch);
      const r = { asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, left: m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight };
      if (r.asc + r.desc > 1) return (metricCache[ch] = r);
    } catch (e) { /* canvas が使えない */ }
    return { asc: 70, desc: 30, left: 0, right: 40 };
  }

  function clefSVG(clef, x, top) {
    const [t, b] = CLEF_BOX[clef];
    const m = metrics(CLEF_CH[clef]);
    const k = (b - t) / (m.asc + m.desc);
    return {
      svg: `<text class="clef" x="${(x + m.left * k).toFixed(2)}" y="${(top + t + m.asc * k).toFixed(2)}" font-size="${(100 * k).toFixed(2)}">${CLEF_CH[clef]}</text>`,
      width: (m.left + m.right) * k
    };
  }

  const GLYPH = {
    1: '<path class="acc-stroke" d="M-1.9,-12.5V11 M2,-13.5V10"/><path class="acc-fill" d="M-5,-3.2 L5,-6.2 V-3.6 L-5,-0.6Z M-5,4.2 L5,1.2 V3.8 L-5,6.8Z"/>',
    '-1': '<path class="acc-stroke" d="M-2.6,-16V4.6"/><path class="acc-fill" d="M-2.6,4.6 C1,2.6 5.2,-0.4 4.6,-3 C4.1,-5.2 0.6,-5.3 -2.6,-2.2 V-0.4 C-0.4,-2.8 2.4,-3.3 2.6,-1.8 C2.8,-0.2 0.4,2 -2.6,3.4Z"/>',
    0: '<path class="acc-stroke" d="M-2.6,-12V5.2 M2.6,-5.2V12"/><path class="acc-fill" d="M-2.6,-2.6 L2.6,-4.6 V-2 L-2.6,0Z M-2.6,4 L2.6,2 V4.6 L-2.6,6.6Z"/>',
    2: '<path class="acc-fill" d="M-4,-4 L-1.2,-4 L0,-1.4 L1.2,-4 L4,-4 L4,-1.2 L1.4,0 L4,1.2 L4,4 L1.2,4 L0,1.4 L-1.2,4 L-4,4 L-4,1.2 L-1.4,0 L-4,-1.2Z"/>',
    '-2': '<g transform="translate(-3.4 0)"><path class="acc-stroke" d="M-2.6,-16V4.6"/><path class="acc-fill" d="M-2.6,4.6 C1,2.6 5.2,-0.4 4.6,-3 C4.1,-5.2 0.6,-5.3 -2.6,-2.2 V-0.4 C-0.4,-2.8 2.4,-3.3 2.6,-1.8 C2.8,-0.2 0.4,2 -2.6,3.4Z"/></g><g transform="translate(3.4 0)"><path class="acc-stroke" d="M-2.6,-16V4.6"/><path class="acc-fill" d="M-2.6,4.6 C1,2.6 5.2,-0.4 4.6,-3 C4.1,-5.2 0.6,-5.3 -2.6,-2.2 V-0.4 C-0.4,-2.8 2.4,-3.3 2.6,-1.8 C2.8,-0.2 0.4,2 -2.6,3.4Z"/></g>'
  };

  function ellipsePath(cx, cy, rx, ry, deg) {
    const t = (deg * Math.PI) / 180;
    const dx = rx * Math.cos(t), dy = rx * Math.sin(t);
    return `M${(cx - dx).toFixed(2)},${(cy - dy).toFixed(2)} a${rx},${ry} ${deg} 1,0 ${(2 * dx).toFixed(2)},${(2 * dy).toFixed(2)} a${rx},${ry} ${deg} 1,0 ${(-2 * dx).toFixed(2)},${(-2 * dy).toFixed(2)}Z`;
  }

  /** 1つの音符。acc は書く臨時記号（null なら書かない） */
  function noteSVG(n, x, staff, opt) {
    const pos = posOf(n, staff.clef);
    const y = staff.yOf(pos);
    const mid = staff.top + 2 * SP;
    let s = `<g class="note ${opt.cls || ''}">`;
    for (let p = -2; p >= pos; p -= 2) s += `<line class="ledger" x1="${x - 10.5}" x2="${x + 10.5}" y1="${staff.yOf(p)}" y2="${staff.yOf(p)}"/>`;
    for (let p = 10; p <= pos; p += 2) s += `<line class="ledger" x1="${x - 10.5}" x2="${x + 10.5}" y1="${staff.yOf(p)}" y2="${staff.yOf(p)}"/>`;
    if (opt.whole) {
      s += `<path class="head" fill-rule="evenodd" d="${ellipsePath(x, y, 7, 4.7, 0)} ${ellipsePath(x, y, 3.6, 2.5, 55)}"/>`;
    } else {
      s += `<ellipse class="head" cx="${x}" cy="${y}" rx="6" ry="4.3" transform="rotate(-22 ${x} ${y})"/>`;
      if (!opt.noStem) {
        if (pos < 4) s += `<line class="stem" x1="${x + 5.3}" x2="${x + 5.3}" y1="${y - 1.5}" y2="${Math.min(y - 35, mid)}"/>`;
        else s += `<line class="stem" x1="${x - 5.3}" x2="${x - 5.3}" y1="${y + 1.5}" y2="${Math.max(y + 35, mid)}"/>`;
      }
    }
    if (opt.acc != null) {
      const w = opt.acc === -2 ? 21 : opt.acc === 2 ? 14 : 15.5;
      s += `<g class="acc" transform="translate(${x - (opt.whole ? w + 1.5 : w)} ${y})">${GLYPH[opt.acc]}</g>`;
    }
    return s + '</g>';
  }

  /**
   * 五線譜の SVG を返す
   *   clef: 'treble' | 'bass'
   *   sig: 調号（♯は正、♭は負）。null なら調号なしで、臨時記号を全部書く
   *   items: [{ n, cls, bar（この音の前に小節線）, whole, chord（前の音と同じ位置に重ねる） }]
   *   span: [lo, hi] 高さを揃えるための位置の範囲
   *   end: 'final'（終止線）| 'bar' | null
   */
  function staffSVG(o) {
    const clef = o.clef || 'treble';
    const items = o.items || [];
    const sig = o.sig || 0;
    const width = o.width || 200;
    const left = 2;
    const [rlo, rhi] = o.span || [-3, 11];
    const st = { clef, top: 0 };
    st.yOf = (p) => st.top + 4 * SP - p * H;

    let body = '';
    for (let i = 0; i < 5; i++) body += `<line class="line" x1="${left}" x2="${width - 2}" y1="${i * SP}" y2="${i * SP}"/>`;
    let x = left;
    if (o.clefs !== false) {
      const c = clefSVG(clef, left + 3, 0);
      body += c.svg;
      x = left + 3 + c.width + 7;
    } else x = left + 6;

    // 調号
    if (sig) {
      const kind = sig > 0 ? 'sharp' : 'flat';
      const shift = clef === 'bass' ? 14 : 0;
      for (let i = 0; i < Math.abs(sig); i++) {
        const p = SIG_DIA[kind][i] - shift - CLEFS[clef].bottom;
        const cls = o.sigHi != null && i === o.sigHi ? ' hi' : '';
        body += `<g class="acc sig${cls}" transform="translate(${(x + 5 + i * SIG_STEP).toFixed(1)} ${st.yOf(p)})">${GLYPH[sig > 0 ? 1 : -1]}</g>`;
      }
      x += Math.abs(sig) * SIG_STEP + 6;
    }
    const startX = x + 10;

    let yMin = Math.min(-17, st.yOf(rhi) - 8);
    let yMax = Math.max(clef === 'treble' ? 56 : 40, st.yOf(rlo) + 8);

    // 音符：調号と違う音にだけ臨時記号。同じ小節の中では一度付けた記号が続く
    const n = items.filter((it) => !it.chord).length;
    const endPad = o.end ? 14 : 6;
    const slot = n ? (width - startX - endPad) / n : 0;
    let carry = {};
    let idx = -1;
    let lastX = startX;
    items.forEach((it) => {
      if (!it.chord) idx++;
      const nx = it.chord ? lastX : startX + slot * (idx + 0.5) + (it.dx || 0);
      if (it.bar) {
        const bx = startX + slot * idx;
        body += `<line class="line" x1="${bx}" x2="${bx}" y1="0" y2="${4 * SP}"/>`;
        carry = {};
      }
      const p = posOf(it.n, clef);
      const expect = carry[it.n.dia] != null ? carry[it.n.dia] : keyAcc(o.sig == null ? 0 : sig, it.n.l);
      let acc = null;
      if (o.sig === null) acc = it.n.a ? it.n.a : null;
      else if (it.n.a !== expect) acc = it.n.a;
      if (it.forceAcc) acc = it.n.a;
      carry[it.n.dia] = it.n.a;
      const whole = it.whole != null ? it.whole : o.whole;
      const stemUp = whole || it.noStem ? 0 : p < 4 ? 30 : 0, stemDown = whole || it.noStem ? 0 : p >= 4 ? 30 : 0;
      yMin = Math.min(yMin, st.yOf(p) - 8 - stemUp - (acc != null ? 8 : 0));
      yMax = Math.max(yMax, st.yOf(p) + 8 + stemDown);
      body += noteSVG(it.n, nx, st, { cls: it.cls, whole, acc, noStem: it.noStem });
      lastX = nx;
    });
    if (o.end === 'final') {
      body += `<line class="line" x1="${width - 7}" x2="${width - 7}" y1="0" y2="${4 * SP}"/><rect class="bar-thick" x="${width - 4.5}" y="0" width="3.2" height="${4 * SP}"/>`;
    } else if (o.end === 'bar') {
      body += `<line class="line" x1="${width - 2}" x2="${width - 2}" y1="0" y2="${4 * SP}"/>`;
    }
    yMin = Math.floor(yMin - 3);
    yMax = Math.ceil(yMax + 3);
    return `<svg class="staff ${o.cls || ''}" viewBox="0 ${yMin} ${width} ${yMax - yMin}" role="img" aria-label="${o.label || '五線譜'}">${body}</svg>`;
  }
  /** 調号だけを書くのに必要な幅 */
  const sigWidth = (sig, extra = 0) => 46 + Math.abs(sig) * SIG_STEP + extra;

  // ---------- 音源（Web Audio で合成） ----------
  // sustain: 鳴らしている間は同じ大きさで続く音（鍵盤を押している間のばせる）
  const TONES = {
    piano: { label: 'ピアノ', sustain: false },
    sine: { label: '純音（サイン波）', sustain: true },
    organ: { label: 'オルガン', sustain: true },
    synth: { label: 'シンセ', sustain: true },
    strings: { label: 'ストリングス', sustain: true },
    bell: { label: 'オルゴール', sustain: false }
  };
  const SUSTAIN = {
    sine: { a: 0.02, r: 0.15, l: 0.34 },
    organ: { a: 0.012, r: 0.08, l: 0.3 },
    synth: { a: 0.02, r: 0.3, l: 0.26 },
    strings: { a: 0.16, r: 0.4, l: 0.24 }
  };

  const Sound = {
    ctx: null, out: null, volume: 0.8, type: 'piano', dur: 1, voices: new Set(),
    unlock() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        const ctx = new AC();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -14; comp.ratio.value = 4;
        this.out = ctx.createGain();
        this.out.gain.value = this.volume;
        this.out.connect(comp);
        comp.connect(ctx.destination);
        this.ctx = ctx;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    setVolume(v) { this.volume = v; if (this.out) this.out.gain.value = v; },
    setType(t) { this.type = TONES[t] ? t : 'piano'; },
    setDur(d) { this.dur = +d || 1; },
    stop() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.voices.forEach((v) => {
        try { v.gain.gain.cancelScheduledValues(t); v.gain.gain.setValueAtTime(v.gain.gain.value, t); v.gain.gain.linearRampToValueAtTime(0, t + 0.05); } catch (e) { /* noop */ }
        v.oscs.forEach((osc) => { try { osc.stop(t + 0.06); } catch (e) { /* noop */ } });
      });
      this.voices.clear();
    },
    /** 持続音を離す（ピアノ・オルゴールは自然に減衰するので何もしない） */
    release(v) {
      if (!v || !v.env || !this.ctx) return;
      const now = this.ctx.currentTime;
      try {
        v.env.gain.cancelScheduledValues(now);
        v.env.gain.setValueAtTime(v.env.gain.value, now);
        v.env.gain.setTargetAtTime(0, now, v.rel / 3);
      } catch (e) { /* noop */ }
      v.oscs.forEach((o) => { try { o.stop(now + v.rel * 1.6); } catch (e) { /* noop */ } });
    },
    /**
     * midi の音を when 秒後に鳴らす
     *   dur: 持続音の長さ（秒）。省略時は設定の長さ、'hold' は release() されるまで（最長 8 秒）
     */
    play(midi, when = 0, dur, vel = 1) {
      const ctx = this.unlock();
      if (!ctx) return null;
      const type = TONES[this.type] ? this.type : 'piano';
      const f = 440 * Math.pow(2, (midi - 69) / 12);
      const t = ctx.currentTime + 0.02 + when;
      const len = dur === 'hold' ? 8 : dur == null ? this.dur : dur;
      const voice = ctx.createGain();
      voice.gain.value = vel;
      voice.connect(this.out);
      const oscs = [];
      const osc = (wave, freq, dest, detune = 0) => {
        const o = ctx.createOscillator();
        o.type = wave;
        o.frequency.value = freq;
        o.detune.value = detune;
        o.connect(dest);
        o.start(t);
        oscs.push(o);
        return o;
      };
      let env = null, rel = 0, end;

      if (type === 'piano') {
        const decay = Math.min(3.2, Math.max(0.7, 2.2 * Math.pow(262 / f, 0.45)));
        voice.gain.value = vel * (f < 180 ? 1.35 : f > 900 ? 0.8 : 1);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(Math.min(14000, f * 12), t);
        lp.frequency.exponentialRampToValueAtTime(Math.max(f * 2.2, 500), t + decay);
        lp.connect(voice);
        [[1, 1], [2, 0.5], [3, 0.24], [4, 0.13], [5, 0.07], [6, 0.04], [8, 0.02]].forEach(([h, amp]) => {
          const fh = f * h * (1 + 0.00035 * h * h);
          if (fh > 16000) return;
          const g = ctx.createGain();
          const peak = 0.26 * amp;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(peak, t + 0.004);
          g.gain.exponentialRampToValueAtTime(peak * 0.45, t + 0.09);
          g.gain.exponentialRampToValueAtTime(0.0001, t + decay / (1 + 0.45 * (h - 1)));
          g.connect(lp);
          osc('sine', fh, g);
        });
        end = t + decay + 0.05;
      } else if (type === 'bell') {
        // オルゴール：澄んだ基音に、少しずれた高い倍音
        const d0 = Math.min(2.4, Math.max(0.6, 1.6 * Math.pow(523 / f, 0.3)));
        [[1, 1, 1], [2, 0.18, 0.6], [3, 0.3, 0.45], [4.2, 0.1, 0.3], [5.4, 0.06, 0.2]].forEach(([h, a, dk]) => {
          if (f * h > 16000) return;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.3 * a, t + 0.002);
          g.gain.exponentialRampToValueAtTime(0.0001, t + d0 * dk);
          g.connect(voice);
          osc('sine', f * h, g);
        });
        end = t + d0;
      } else {
        const P = SUSTAIN[type];
        rel = P.r;
        env = ctx.createGain();
        env.connect(voice);
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(P.l, t + P.a);
        if (type === 'synth') env.gain.setTargetAtTime(P.l * 0.7, t + P.a, 0.15);
        let dest = env;
        if (type === 'synth' || type === 'strings') {
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          if (type === 'synth') {
            lp.Q.value = 3;
            lp.frequency.setValueAtTime(Math.min(9000, f * 10), t);
            lp.frequency.setTargetAtTime(Math.min(6000, f * 3.5), t + 0.02, 0.18);
          } else {
            lp.Q.value = 0.7;
            lp.frequency.value = Math.min(5000, f * 4.5);
          }
          lp.connect(env);
          dest = lp;
        }
        if (type === 'sine') osc('sine', f, dest);
        if (type === 'organ') {
          const mix = ctx.createGain();
          mix.gain.value = 1 / 2.6;
          mix.connect(dest);
          [[1, 1], [2, 0.7], [3, 0.4], [4, 0.25], [6, 0.15], [8, 0.1]].forEach(([h, a]) => {
            if (f * h > 14000) return;
            const g = ctx.createGain();
            g.gain.value = a;
            g.connect(mix);
            osc('sine', f * h, g);
          });
        }
        if (type === 'synth') {
          const g = ctx.createGain();
          g.gain.value = 0.45;
          g.connect(dest);
          osc('sawtooth', f, g, -7);
          osc('sawtooth', f, g, 7);
          const sub = ctx.createGain();
          sub.gain.value = 0.25;
          sub.connect(dest);
          osc('square', f / 2, sub);
        }
        if (type === 'strings') {
          const g = ctx.createGain();
          g.gain.value = 0.33;
          g.connect(dest);
          // ゆるやかにかかるビブラート
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 5.3;
          const depth = ctx.createGain();
          depth.gain.setValueAtTime(0, t);
          depth.gain.linearRampToValueAtTime(6, t + 0.4);
          lfo.connect(depth);
          lfo.start(t);
          oscs.push(lfo);
          [-10, 0, 10].forEach((dt) => depth.connect(osc('sawtooth', f, g, dt).detune));
        }
        const relAt = t + Math.max(len, P.a + 0.05);
        env.gain.setTargetAtTime(0, relAt, rel / 3);
        end = relAt + rel * 1.6;
      }
      oscs.forEach((o) => o.stop(end));
      const v = { gain: voice, oscs, env, rel };
      v.release = () => this.release(v);
      this.voices.add(v);
      oscs[0].onended = () => this.voices.delete(v);
      return v;
    },
    seq(list, gap = 0.7) { list.forEach((m, i) => this.play(m, i * gap, Math.min(this.dur, gap * 0.9))); }
  };

  // ---------- 和音・フレーズの再生 ----------
  /** 和音の構成音（ピッチクラス）を、前の和音から近い位置に並べる（中声部の3音） */
  function voicing(pcs, prev) {
    let best = null, bestCost = Infinity;
    for (let inv = 0; inv < 3; inv++) {
      for (let base = 52; base <= 70; base++) {
        const order = pcs.slice(inv).concat(pcs.slice(0, inv));
        const v = [];
        let m = base - 1;
        let okRange = true;
        order.forEach((pc) => { m++; while (((m % 12) + 12) % 12 !== pc) m++; v.push(m); });
        if (((v[0] % 12) + 12) % 12 !== order[0] || v[0] !== base) okRange = false;
        if (!okRange || v[2] > 79) continue;
        const cost = prev ? v.reduce((s, x, i) => s + Math.abs(x - prev[i]), 0) : Math.abs(v[0] - 60) + Math.abs(v[2] - 67);
        if (cost < bestCost) { bestCost = cost; best = v; }
      }
    }
    return best;
  }
  /** 終止形（I–IV–V–I。短調は i–iv–V–i）の和音を midi の配列で返す。bass は根音 */
  function cadence(k) {
    const degs = [0, 3, 4, 0];
    let prev = null;
    return degs.map((d) => {
      const tri = triad(k, d, 3);
      const pcs = tri.map((n) => ((n.midi % 12) + 12) % 12);
      const v = voicing(pcs, prev);
      prev = v;
      let bass = tri[0].midi;
      while (bass >= 55) bass -= 12;
      while (bass < 40) bass += 12;
      return { deg: d, notes: tri, midis: [bass, ...v] };
    });
  }
  function playChord(midis, when = 0, dur) {
    midis.forEach((m, i) => Sound.play(m, when, dur, i === 0 ? 1 : 0.62));
  }

  // ---------- リズムつきの楽譜（曲を聴く用） ----------
  // 音価は dur（1=全音符 2=2分 4=4分 8=8分 16=16分）と付点 dot。拍は4分音符を1とする
  const BEATS = { 1: 4, 2: 2, 4: 1, 8: 0.5, 16: 0.25 };
  const evBeats = (e) => BEATS[e.dur] * (e.dot ? 1.5 : 1);

  /**
   * 1小節ぶんの書き方を読む。例：'[-3/8. -3/16] 0/4 r/16 3#/16'
   *   数字：主音からの度数（0 = 主音、負は下）。# / b でさらに半音上げ下げ
   *   /8 は音価、末尾の . は付点、r は休符、[ ] で囲んだ音を連桁でつなぐ
   */
  function parseMeasure(src) {
    const out = [];
    let beam = null, gid = 0;
    src.trim().split(/\s+/).forEach((tok) => {
      if (tok.startsWith('[')) { beam = 'b' + (++gid) + Math.random().toString(36).slice(2, 6); tok = tok.slice(1); }
      const end = tok.endsWith(']');
      if (end) tok = tok.slice(0, -1);
      const m = /^(r|-?\d+)(#|b)?\/(\d+)(\.)?$/.exec(tok);
      if (!m) throw new Error('bad token ' + tok);
      out.push({ rest: m[1] === 'r', deg: m[1] === 'r' ? null : +m[1], alt: m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0, dur: +m[3], dot: !!m[4], beam });
      if (end) beam = null;
    });
    return out;
  }

  function restSVG(e, x) {
    const d = e.dur;
    if (d === 1) return `<rect class="rest-f" x="${x - 5}" y="10" width="10" height="4.5"/>`;
    if (d === 2) return `<rect class="rest-f" x="${x - 5}" y="15.5" width="10" height="4.5"/>`;
    if (d === 4) return `<path class="rest-s" d="M${x - 2},8 L${x + 3.5},14.5 L${x - 1},20 L${x + 3.5},26 C${x - 1},23.5 ${x - 4},27 ${x},31.5"/>`;
    const dots = d === 8 ? [[x - 2.2, 15.5]] : [[x - 0.6, 12.5], [x - 2.6, 20.5]];
    const top = d === 8 ? [x + 3.6, 14] : [x + 5.4, 11];
    return dots.map(([cx, cy]) => `<circle class="rest-f" cx="${cx}" cy="${cy}" r="2.3"/><path class="rest-s thin" d="M${cx},${cy + 1} Q${(cx + top[0]) / 2},${cy + 2.5} ${top[0]},${cy - 1.5}"/>`).join('') +
      `<path class="rest-s thin" d="M${top[0]},${top[1]} L${x - 1.5},${d === 8 ? 30 : 33}"/>`;
  }
  /** 旗（符尾の先）。up は符尾が上向き */
  function flagSVG(sx, sy, up, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const y = up ? sy + i * 7 : sy - i * 7;
      s += up
        ? `<path class="flag" d="M${sx},${y} C${sx + 0.5},${y + 6} ${sx + 9},${y + 8} ${sx + 7},${y + 17} C${sx + 8},${y + 10} ${sx + 3},${y + 7.5} ${sx},${y + 5}Z"/>`
        : `<path class="flag" d="M${sx},${y} C${sx + 0.5},${y - 6} ${sx + 9},${y - 8} ${sx + 7},${y - 17} C${sx + 8},${y - 10} ${sx + 3},${y - 7.5} ${sx},${y - 5}Z"/>`;
    }
    return s;
  }

  /**
   * 複数段の楽譜。1段ごとの SVG 文字列の配列を返す
   *   measures: [[{ n | rest, dur, dot, beam, i }]]（i は再生中の色付け用の番号）
   *   pickup: 最初の小節が弱起（不完全小節）。1段目に余分に入れる
   */
  function scoreSVG(o) {
    const clef = o.clef || 'treble';
    const sig = o.sig || 0;
    const width = o.width || 600;
    const per = o.perLine || 4;
    const lines = [];
    let mi = 0;
    while (mi < o.measures.length) {
      const take = per + (mi === 0 && o.pickup ? 1 : 0);
      lines.push(o.measures.slice(mi, mi + take).map((m, j) => ({ evs: m, idx: mi + j })));
      mi += take;
    }
    const yOf = (p) => 4 * SP - p * H;
    const st = { clef, top: 0, yOf };
    // 高さはどの段もそろえる
    let pMin = 0, pMax = 8;
    o.measures.flat().forEach((e) => { if (!e.rest) { const p = posOf(e.n, clef); pMin = Math.min(pMin, p); pMax = Math.max(pMax, p); } });
    const yTop = Math.floor(Math.min(clef === 'treble' ? -17 : -4, yOf(pMax) - 40)) - 2;
    const yBot = Math.ceil(Math.max(clef === 'treble' ? 56 : 40, yOf(pMin) + 40)) + 2;

    return lines.map((line, li) => {
      let body = '';
      for (let i = 0; i < 5; i++) body += `<line class="line" x1="2" x2="${width - 2}" y1="${i * SP}" y2="${i * SP}"/>`;
      const c = clefSVG(clef, 5, 0);
      body += c.svg;
      let x = 5 + c.width + 7;
      if (sig) {
        const kind = sig > 0 ? 'sharp' : 'flat';
        const shift = clef === 'bass' ? 14 : 0;
        for (let i = 0; i < Math.abs(sig); i++) {
          const p = SIG_DIA[kind][i] - shift - CLEFS[clef].bottom;
          body += `<g class="acc sig" transform="translate(${(x + 5 + i * SIG_STEP).toFixed(1)} ${yOf(p)})">${GLYPH[sig > 0 ? 1 : -1]}</g>`;
        }
        x += Math.abs(sig) * SIG_STEP + 6;
      }
      if (li === 0 && o.time) {
        body += `<text class="timesig" x="${x + 9}" y="18.5">${o.time[0]}</text><text class="timesig" x="${x + 9}" y="38.5">${o.time[1]}</text>`;
        x += 22;
      }
      x += 4;

      // 臨時記号（小節ごとに調号と比べる）
      line.forEach((m) => {
        const carry = {};
        m.evs.forEach((e) => {
          e._acc = null;
          if (e.rest) return;
          const expect = carry[e.n.dia] != null ? carry[e.n.dia] : keyAcc(sig, e.n.l);
          if (e.n.a !== expect) e._acc = e.n.a;
          carry[e.n.dia] = e.n.a;
        });
      });
      const PADL = 7, PADR = 5;
      const w = (e) => 0.75 + 1.35 * Math.pow(evBeats(e), 0.6) + (e._acc != null ? 0.55 : 0);
      const sumW = line.reduce((s, m) => s + m.evs.reduce((a, e) => a + w(e), 0), 0);
      const unit = (width - 3 - x - line.length * (PADL + PADR)) / sumW;
      const placed = [];
      line.forEach((m, j) => {
        x += PADL;
        m.evs.forEach((e) => {
          const sw = w(e) * unit;
          const hx = x + (e._acc != null ? 11 : 3) + Math.min(6, sw * 0.12);
          placed.push({ e, x: hx });
          x += sw;
        });
        x += PADR;
        const last = li === lines.length - 1 && j === line.length - 1;
        if (last && o.final !== false) {
          body += `<line class="line" x1="${width - 7.5}" x2="${width - 7.5}" y1="0" y2="${4 * SP}"/><rect class="bar-thick" x="${width - 5}" y="0" width="3.2" height="${4 * SP}"/>`;
        } else {
          const bx = j === line.length - 1 ? width - 2 : x;
          body += `<line class="line" x1="${bx}" x2="${bx}" y1="0" y2="${4 * SP}"/>`;
        }
      });

      // 連桁のまとまりごとに、符尾の向きと長さを決める
      const groups = {};
      placed.forEach((p) => { if (p.e.beam && !p.e.rest) (groups[p.e.beam] = groups[p.e.beam] || []).push(p); });
      Object.values(groups).forEach((g) => {
        if (g.length < 2) { g[0].e._solo = true; return; }
        const ps = g.map((p) => posOf(p.e.n, clef));
        const up = ps.reduce((a, b) => a + b, 0) / ps.length < 4;
        const ys = ps.map(yOf);
        const by = up ? Math.min(Math.min(...ys) - 30, yOf(4) - 6) : Math.max(Math.max(...ys) + 30, yOf(4) + 6);
        g.forEach((p) => { p.up = up; p.stemEnd = by; });
        const sx = (p) => (up ? p.x + 5.3 : p.x - 5.3);
        const th = 4.4, gap2 = 7;
        const yb = (lvl) => (up ? by + lvl * gap2 : by - lvl * gap2 - th);
        body += `<rect class="beam" x="${sx(g[0])}" y="${yb(0)}" width="${sx(g[g.length - 1]) - sx(g[0]) + 1.25}" height="${th}"/>`;
        g.forEach((p, i) => {
          if (p.e.dur < 16) return;
          const next = g[i + 1], prev = g[i - 1];
          if (next && next.e.dur >= 16) body += `<rect class="beam" x="${sx(p)}" y="${yb(1)}" width="${sx(next) - sx(p) + 1.25}" height="${th}"/>`;
          else if (!(prev && prev.e.dur >= 16)) {
            const x1 = prev ? sx(p) - 8 : sx(p);
            body += `<rect class="beam" x="${x1}" y="${yb(1)}" width="${prev ? 9.25 : 9}" height="${th}"/>`;
          }
        });
      });

      // 音符・休符
      placed.forEach((p) => {
        const e = p.e;
        if (e.rest) { body += `<g class="note rest" data-i="${e.i}">${restSVG(e, p.x + 2)}</g>`; return; }
        const pos = posOf(e.n, clef);
        const y = yOf(pos);
        let s = `<g class="note" data-i="${e.i}">`;
        for (let q = -2; q >= pos; q -= 2) s += `<line class="ledger" x1="${p.x - 10.5}" x2="${p.x + 10.5}" y1="${yOf(q)}" y2="${yOf(q)}"/>`;
        for (let q = 10; q <= pos; q += 2) s += `<line class="ledger" x1="${p.x - 10.5}" x2="${p.x + 10.5}" y1="${yOf(q)}" y2="${yOf(q)}"/>`;
        if (e.dur === 1) s += `<path class="head" fill-rule="evenodd" d="${ellipsePath(p.x, y, 7, 4.7, 0)} ${ellipsePath(p.x, y, 3.6, 2.5, 55)}"/>`;
        else if (e.dur === 2) s += `<path class="head" fill-rule="evenodd" d="${ellipsePath(p.x, y, 6.2, 4.4, -22)} ${ellipsePath(p.x, y, 4.6, 2.2, -22)}"/>`;
        else s += `<ellipse class="head" cx="${p.x}" cy="${y}" rx="6" ry="4.3" transform="rotate(-22 ${p.x} ${y})"/>`;
        if (e.dur > 1) {
          const up = p.up != null ? p.up : pos < 4;
          const sx = up ? p.x + 5.3 : p.x - 5.3;
          const flags = p.stemEnd != null ? 0 : e.dur === 8 ? 1 : e.dur === 16 ? 2 : 0;
          const len = 35 + (flags === 2 ? 5 : 0);
          const end = p.stemEnd != null ? p.stemEnd : up ? Math.min(y - len, yOf(4)) : Math.max(y + len, yOf(4));
          s += `<line class="stem" x1="${sx}" x2="${sx}" y1="${up ? y - 1.5 : y + 1.5}" y2="${end}"/>`;
          if (flags) s += flagSVG(sx, end, up, flags);
        }
        if (e.dot) s += `<circle class="dot" cx="${p.x + 10}" cy="${pos % 2 === 0 ? y - 2.6 : y}" r="1.9"/>`;
        if (e._acc != null) {
          const ww = e._acc === -2 ? 21 : e._acc === 2 ? 14 : 15.5;
          s += `<g class="acc" transform="translate(${p.x - ww} ${y})">${GLYPH[e._acc]}</g>`;
        }
        body += s + '</g>';
      });
      return `<svg class="staff score ${o.cls || ''}" viewBox="0 ${yTop} ${width} ${yBot - yTop}" role="img" aria-label="${o.label || '楽譜'}${lines.length > 1 ? `（${li + 1}段目）` : ''}">${body}</svg>`;
    });
  }

  /** 度数の並びが五線に収まりやすいオクターブ（主音の位置）を選ぶ */
  function fitOct(k, clef, degs) {
    let best = null, bestCost = Infinity;
    const cands = clef === 'bass' ? [1, 2, 3, 4] : [3, 4, 5, 6];
    cands.forEach((oct) => {
      const ps = degs.map((d) => posOf(degree(k, d, oct), clef));
      const cost = ps.reduce((s, p) => s + Math.max(0, -1 - p) + Math.max(0, p - 9), 0) * 10 +
        Math.abs(ps.reduce((a, b) => a + b, 0) / ps.length - 4.5);
      if (cost < bestCost) { bestCost = cost; best = oct; }
    });
    return best;
  }
  /** 伴奏の和音（低め）。prev は前の和音の上3声 */
  function chordMidis(k, deg, prev) {
    const tri = triad(k, deg, 3);
    const v = voicing(tri.map((n) => ((n.midi % 12) + 12) % 12), prev).map((m) => (m > 64 ? m - 12 : m));
    let bass = tri[0].midi;
    while (bass >= 50) bass -= 12;
    while (bass < 38) bass += 12;
    return { upper: v, midis: [bass, ...v] };
  }

  window.Music = {
    LETTERS, SEMI, BASE, SHARP_ORDER, FLAT_ORDER, CLEFS, TONES, SCALES, KEYS, KEY_SYSTEMS, MODE_JA, ROMAN,
    note, fromDia, name, sci, keyAcc, key, keyOf, keyName, tonicName, related, sigText, degree, scale, triad,
    homeOct, posOf, staffSVG, sigWidth, cadence, voicing, playChord, Sound,
    BEATS, evBeats, parseMeasure, scoreSVG, fitOct, chordMidis,
    resetMetrics() { metricCache = {}; },
    CLEF_FONT
  };
})();
