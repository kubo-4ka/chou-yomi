(() => {
  'use strict';

  const M = window.Music;
  const Sound = M.Sound;
  const INFO = window.KEY_INFO;
  const VIEWS = ['quiz', 'keys', 'listen', 'circle', 'learn', 'record'];
  const CLEF_OPTS = { treble: 'ト音記号', bass: 'ヘ音記号', both: '両方' };
  const KMODE_OPTS = { both: '長調と短調', major: '長調だけ', minor: '短調だけ' };
  const CLUES = { mood: '響きの明暗', final: '終わりの音', lead: '導音の臨時記号', phrase: 'メロディーの断片' };
  const RELS = { relative: '平行調', parallel: '同主調', dominant: '属調', subdominant: '下属調' };
  const REL_DESC = {
    relative: '調号が同じで、長調と短調が入れかわった調',
    parallel: '主音が同じで、長調と短調が入れかわった調',
    dominant: '5度上の音を主音にする、同じ種類の調',
    subdominant: '5度下（4度上）の音を主音にする、同じ種類の調'
  };
  const TEMPO = { slow: 0.62, mid: 0.46, fast: 0.32 };

  const QMODES = [
    { id: 'sig', title: '調号を読む', desc: '調号を見て、その調号を使う長調と短調の組を答える', icon: 'sig' },
    { id: 'clue', title: '手がかりで調を特定', desc: '調号と、明暗・終わりの音などの手がかりから調を決める', icon: 'clue' },
    { id: 'pick', title: '調号を選ぶ', desc: '調の名前を見て、その調号を4つから選ぶ', icon: 'pick' },
    { id: 'earKey', title: '聴いて調を当てる', desc: '流れる音階（構成音）や和音から調を答える', icon: 'earKey' },
    { id: 'earMode', title: '長調？短調？', desc: '流れた曲が、明るい長調か暗い短調かを聴き分ける', icon: 'earMode' },
    { id: 'rel', title: '関係調', desc: '平行調・同主調・属調・下属調を答える', icon: 'rel' }
  ];
  const EAR = ['earKey', 'earMode'];

  // 初めての人向けの順番。押すと設定が切り替わってクイズが始まる
  const STEPS = [
    { t: '調号を読む①', d: '♯・♭1つまで', mode: 'sig', s: { range: 1 } },
    { t: '調号を読む②', d: '♯・♭2つまで', mode: 'sig', s: { range: 2 } },
    { t: '調号を選ぶ', d: '調の名前→調号', mode: 'pick', s: { range: 2 } },
    { t: '平行調', d: '調号が同じ長調と短調', mode: 'rel', s: { range: 3, rels: ['relative'] } },
    { t: '明暗で決める', d: '明るい？暗い？', mode: 'clue', s: { range: 2, clues: ['mood'] } },
    { t: '終わりの音で', d: '曲は主音で終わる', mode: 'clue', s: { range: 2, clues: ['final'] } },
    { t: '導音で決める', d: '短調の臨時記号', mode: 'clue', s: { range: 2, clues: ['lead'] } },
    { t: '長調？短調？', d: '耳で明暗を聴き分ける', mode: 'earMode', s: { range: 3 } },
    { t: '楽譜の断片', d: 'メロディーから判断', mode: 'clue', s: { range: 3, clues: ['phrase'] } },
    { t: '調号を読む③', d: '♯・♭4つまで', mode: 'sig', s: { range: 4 } },
    { t: '聴いて調を当てる', d: '調号を見ながら', mode: 'earKey', s: { range: 3, earSig: true } },
    { t: '同主調・属調', d: '関係調の仕上げ', mode: 'rel', s: { range: 4, rels: ['parallel', 'dominant', 'subdominant'] } },
    { t: '総まとめ', d: '♯・♭7つまで・手がかりすべて', mode: 'clue', s: { range: 7, clues: ['mood', 'final', 'lead', 'phrase'] } }
  ];

  // メロディーの型（主音からの度数。0 = 主音、-1 = 1つ下の導音）
  const PHRASES = [
    [0, 2, 4, 2, 3, 1, -1, 0],
    [4, 3, 2, 1, 2, 0, -1, 0],
    [2, 4, 3, 1, 0, 1, -1, 0],
    [0, -1, 0, 2, 1, 3, -1, 0],
    [4, 2, 0, 2, 3, 1, -1, 0]
  ];
  const FINAL_PAT = [4, 2, 1, 0];
  const LEAD_PAT = [2, 1, -1, 1];
  const FROG = [0, 1, 2, 3, 2, 1, 0, 2, 3, 4, 5, 4, 3, 2]; // かえるの合唱（ドイツ民謡）

  // ---------- storage (always optional) ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('cy.' + key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('cy.' + key, JSON.stringify(value)); } catch (e) { /* private mode etc. */ }
    }
  };

  const settings = Object.assign(
    {
      clef: 'treble', kmode: 'both', range: 2, count: '10', ksys: 'ja',
      clues: ['mood', 'final', 'lead', 'phrase'], rels: ['relative', 'parallel'],
      earPlay: 'both', tempo: 'mid', earSig: true, ref: false,
      weak: true, auto: false, sound: true, tone: 'piano', volume: '0.55', goal: '20',
      listClef: 'treble', circleSel: 'C', step: -1, song: 'happy', songAcc: true,
      lsMode: 'single', lsKey: 'C', lsList: ['Cm', 'C'], lsLoop: false, lsGap: '0.8', lsSpeed: '1', lsClef: 'treble'
    },
    store.get('settings', {})
  );
  if (!CLEF_OPTS[settings.clef]) settings.clef = 'treble';
  if (!KMODE_OPTS[settings.kmode]) settings.kmode = 'both';
  if (!M.KEY_SYSTEMS[settings.ksys]) settings.ksys = 'ja';
  settings.range = Math.max(1, Math.min(7, +settings.range || 2));
  if (!Array.isArray(settings.clues) || !settings.clues.length) settings.clues = Object.keys(CLUES);
  if (!Array.isArray(settings.rels) || !settings.rels.length) settings.rels = ['relative'];
  if (!Array.isArray(settings.lsList)) settings.lsList = ['Cm', 'C'];
  if (!['single', 'list'].includes(settings.lsMode)) settings.lsMode = 'single';
  if (!M.key(settings.circleSel)) settings.circleSel = 'C';
  let stats = store.get('stats', {}); // "D": { a, c }
  let days = store.get('days', {});   // "2026-10-08": { a, c }
  const saveSettings = () => { store.set('settings', settings); renderSummary(); };
  Sound.setVolume(+settings.volume);
  Sound.setType(settings.tone);
  Sound.setDur(0.9);

  // ---------- helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pad = (v) => String(v).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const pct = (s) => (s && s.a ? Math.round((100 * s.c) / s.a) : null);
  const kn = (k, sys = settings.ksys) => M.keyName(k, sys);
  const tn = (k) => M.tonicName(k, 'doremi');
  const nmD = (n) => M.name(n, 'doremi');
  const modeTag = (k) => `<span class="tag ${k.minor ? 'min' : 'maj'}">${M.MODE_JA[k.mode]}</span>`;
  const PLAY_IC = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z"/></svg>';
  const playBtn = (label, cls = '') => `<button class="play-btn ${cls}" type="button">${PLAY_IC}${label}</button>`;
  const sigShort = (sig) => (sig ? `${sig > 0 ? '♯' : '♭'}${Math.abs(sig)}` : '調号なし');
  /** よく使う順の目安 */
  const useDots = (k) => {
    const u = (INFO[k.id] || {}).use;
    return u == null ? '' : ['ほとんど使わない', 'ときどき使う', 'よく使う', 'とてもよく使う'][u];
  };
  const keySub = (k) => (settings.ksys === 'doremi' ? kn(k, 'ja') : `${tn(k)}が主音`);

  function segmented(container, options, current, onChange) {
    container.innerHTML = '';
    Object.entries(options).forEach(([value, label]) => {
      const b = el('button', null, label);
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(value === String(current)));
      b.addEventListener('click', () => {
        container.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', 'false'));
        b.setAttribute('aria-checked', 'true');
        onChange(value);
      });
      container.appendChild(b);
    });
  }

  // 最初の操作で音を使えるようにする（ブラウザの自動再生の制限のため）
  document.addEventListener('pointerdown', () => Sound.unlock(), { once: true, capture: true });
  document.addEventListener('keydown', () => Sound.unlock(), { once: true, capture: true });

  // ---------- theme ----------
  const isDark = () => {
    const t = document.documentElement.dataset.theme;
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  $('#themeBtn').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('cy.theme', next); } catch (e) { /* ignore */ }
  });

  // ---------- 音楽の部品 ----------
  /** フレーズを書く高さ（五線の中に収まりやすいように） */
  const phraseOct = (k, clef) => (clef === 'bass' ? (k.l <= 4 ? 3 : 2) : (k.l <= 1 ? 5 : 4));
  /** 度数の並びを音にする。短調の導音（第7音）は半音上げる */
  function degNotes(k, pat, oct, kind) {
    const alter = kind ? M.SCALES[kind].alter : null;
    return pat.map((d) => {
      const dd = ((d % 7) + 7) % 7;
      const raise = alter ? alter[dd] : k.minor && dd === 6 ? 1 : 0;
      return M.degree(k, d, oct, raise);
    });
  }
  const sigSpan = [-1, 9];

  function sigStaff(sig, clef, o = {}) {
    return M.staffSVG(Object.assign({ clef, sig, width: M.sigWidth(sig, o.extra || 22), span: sigSpan, label: M.sigText(sig) }, o, { cls: 'sig-staff ' + (o.cls || '') }));
  }
  /** 音階の五線譜（主音を色付け） */
  function scaleStaff(k, clef, kind, o = {}) {
    const notes = M.scale(k, kind, M.homeOct(k, clef));
    const sc = M.SCALES[kind || (k.minor ? 'natural' : 'major')];
    const items = notes.map((n, i) => ({ n, whole: true, cls: i === 0 || i === 7 ? 'tonic' : sc.alter[i % 7] ? 'raised' : '' }));
    return {
      notes,
      svg: M.staffSVG(Object.assign({ clef, sig: o.nosig ? null : k.sig, items, width: M.sigWidth(o.nosig ? 0 : k.sig) + 8 * 27, span: [-2, 10], label: kn(k) + 'の音階' }, o))
    };
  }
  /** フレーズの五線譜。last で最後の音を全音符にして終止線 */
  function phraseStaff(k, clef, pat, o = {}) {
    const notes = degNotes(k, pat, phraseOct(k, clef));
    const items = notes.map((n, i) => ({
      n, bar: o.barAt != null && i === o.barAt, whole: o.final && i === notes.length - 1 ? true : undefined,
      cls: o.mark ? (n.l === k.l && n.a === k.a ? 'tonic' : k.minor && n.a !== M.keyAcc(k.sig, n.l) ? 'raised' : '') : ''
    }));
    return {
      notes,
      svg: M.staffSVG({ clef, sig: k.sig, items, width: M.sigWidth(k.sig) + notes.length * (o.slot || 30), span: [-2, 10], end: o.final ? 'final' : null, cls: o.cls, label: o.label || 'メロディー' })
    };
  }

  // ---------- 再生 ----------
  const gap = () => TEMPO[settings.tempo] || 0.46;
  function playScale(notes, at = 0) {
    const g = gap();
    notes.forEach((n, i) => Sound.play(n.midi, at + i * g, g * 0.95));
    return at + notes.length * g;
  }
  function playCadence(k, at = 0) {
    const g = gap() * 2;
    M.cadence(k).forEach((c, i) => M.playChord(c.midis, at + i * g, i === 3 ? g * 2 : g * 0.95));
    return at + 4 * g + g;
  }
  /** メロディー。最後の音に主和音を重ねる */
  function playPhrase(k, notes, at = 0) {
    const g = gap();
    notes.forEach((n, i) => {
      const last = i === notes.length - 1;
      Sound.play(n.midi, at + i * g, last ? g * 3 : g * 0.95);
      if (last) {
        const c = M.cadence(k)[3];
        M.playChord([c.midis[0], ...c.midis.slice(1).map((m) => (m >= n.midi ? m - 12 : m))], at + i * g, g * 3);
      }
    });
    return at + (notes.length + 2) * g;
  }
  function playChordNotes(notes, at = 0, dur = 1.4) {
    notes.forEach((n, i) => Sound.play(n.midi, at, dur, i === 0 ? 1 : 0.7));
  }

  // ---------- views ----------
  let current = store.get('view', 'quiz');
  if (!VIEWS.includes(current)) current = 'quiz';
  function show(view) {
    if (quiz && view !== 'quiz') stopQuiz();
    stopSong();
    Sound.stop();
    current = view;
    store.set('view', view);
    VIEWS.forEach((v) => { $('#view-' + v).hidden = v !== view; });
    document.querySelectorAll('.nav-item').forEach((b) => b.setAttribute('aria-current', String(b.dataset.view === view)));
    if (view === 'quiz') renderToday();
    if (view === 'keys') renderKeys();
    if (view === 'circle') renderCircle();
    if (view === 'learn') renderLearn();
    if (view === 'record') renderRecord();
    if (view === 'listen') renderListen();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.nav-item').forEach((b) => b.addEventListener('click', () => show(b.dataset.view)));

  // ---------- 記録 ----------
  function record(k, ok) {
    const s = stats[k.id] || (stats[k.id] = { a: 0, c: 0 });
    s.a++; if (ok) s.c++;
    const d = dayKey();
    const t = days[d] || (days[d] = { a: 0, c: 0 });
    t.a++; if (ok) t.c++;
    store.set('stats', stats);
    store.set('days', days);
  }
  function streak() {
    let n = 0;
    const d = new Date();
    if (!days[dayKey(d)]) d.setDate(d.getDate() - 1); // 今日まだなら昨日から数える
    while (days[dayKey(d)] && days[dayKey(d)].a > 0) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  // ---------- Quiz setup ----------
  const ICONS = {
    sig: '<svg viewBox="0 0 48 28"><path d="M2 4h44M2 9h44M2 14h44M2 19h44M2 24h44"/><path d="M16 1.5v20M20 .5v20"/><path class="f" d="M13.5 8.5l9-2.4v2l-9 2.4zM13.5 14l9-2.4v2l-9 2.4z"/><path d="M30 6v20M34 5v20"/><path class="f" d="M27.5 13l9-2.4v2l-9 2.4zM27.5 18.5l9-2.4v2l-9 2.4z"/></svg>',
    clue: '<svg viewBox="0 0 48 28"><circle cx="20" cy="12" r="8"/><path d="M26 18l9 8"/><path class="hl" d="M16.5 12.5l2.5 2.5 4.5-6"/></svg>',
    pick: '<svg viewBox="0 0 48 28"><rect x="3" y="3" width="18" height="10" rx="2"/><rect x="27" y="3" width="18" height="10" rx="2"/><rect x="3" y="16" width="18" height="10" rx="2"/><rect class="hl" x="27" y="16" width="18" height="10" rx="2"/><path d="M34 18.5v6M36.5 18v6"/><path class="f" d="M32.5 20.5l5.5-1.5v1.2l-5.5 1.5zM32.5 23l5.5-1.5v1.2l-5.5 1.5z"/></svg>',
    earKey: '<svg viewBox="0 0 48 28"><path d="M6 11h4l6-5v16l-6-5H6z"/><path d="M20 9c2 2.6 2 7.4 0 10M24 6c3.6 4.4 3.6 11.6 0 16"/><text x="30" y="19" class="t">ニ?</text></svg>',
    earMode: '<svg viewBox="0 0 48 28"><circle cx="13" cy="14" r="5"/><path d="M13 4.5v2M13 21.5v2M3.5 14h2M20.5 14h2M6.3 7.3l1.4 1.4M18.3 19.3l1.4 1.4M6.3 20.7l1.4-1.4M18.3 8.7l1.4-1.4"/><path d="M41 18.5A7 7 0 0 1 32 9.5a7 7 0 1 0 9 9z"/></svg>',
    rel: '<svg viewBox="0 0 48 28"><circle cx="24" cy="14" r="11"/><circle cx="24" cy="14" r="5.5"/><circle class="f" cx="24" cy="3" r="2.4"/><circle class="f" cx="33.5" cy="8.5" r="2.4"/><circle class="f" cx="24" cy="8.5" r="1.8"/></svg>'
  };

  function keyPool(s = settings) {
    return M.KEYS.filter((k) => Math.abs(k.sig) <= s.range && (s.kmode === 'both' || k.mode === s.kmode));
  }
  const stepActive = (st) => Object.entries(st.s).every(([k, v]) => JSON.stringify(settings[k]) === JSON.stringify(v));

  function renderSteps() {
    const box = $('#stepBox');
    box.innerHTML = '<p class="steps-head">はじめての人は、ステップ1から順に（押すとすぐ始まります）</p>';
    const row = el('div', 'steps');
    STEPS.forEach((st, i) => {
      const b = el('button', 'step' + (settings.step === i && stepActive(st) ? ' on' : ''));
      b.type = 'button';
      b.innerHTML = `<span class="step-no">${i + 1}</span><span class="step-t">${st.t}</span><span class="step-d">${st.d}</span>`;
      b.addEventListener('click', () => {
        Object.assign(settings, { kmode: 'both' }, st.s, { step: i });
        saveSettings();
        syncSettingsUI();
        startQuiz(st.mode);
      });
      row.appendChild(b);
    });
    box.appendChild(row);
    const on = row.querySelector('.step.on');
    if (on) row.scrollLeft = on.offsetLeft - 16;
  }

  function renderModes() {
    const list = $('#modeList');
    list.innerHTML = '';
    QMODES.forEach((m) => {
      const b = el('button', 'mode');
      b.type = 'button';
      b.innerHTML = `<span class="mode-icon" aria-hidden="true">${ICONS[m.icon]}</span><span class="mode-title">${m.title}</span><span class="mode-desc">${m.desc}</span>`;
      b.addEventListener('click', () => startQuiz(m.id));
      list.appendChild(b);
    });
  }

  function renderToday() {
    const t = days[dayKey()] || { a: 0, c: 0 };
    const goal = +settings.goal;
    const s = streak();
    const done = t.a >= goal;
    $('#todayBox').innerHTML = `
      <div class="today-main">
        <span class="today-label">今日の練習</span>
        <span class="today-count"><b>${t.a}</b> / ${goal} 問</span>
        <span class="today-sub">${t.a ? `正答率 ${pct(t)}%` : 'まだ練習していません'}${done ? ' · 目標達成' : ''}</span>
      </div>
      <div class="today-streak"><b>${s}</b><span>日連続</span></div>
      <div class="today-bar" aria-hidden="true"><span style="width:${Math.min(100, (100 * t.a) / goal)}%"></span></div>`;
    $('#todayBox').classList.toggle('done', done);
    renderSteps();
    renderModes();
  }

  function renderSummary() {
    $('#settingsSummary').textContent = [
      CLEF_OPTS[settings.clef], `♯♭${settings.range}つまで`, settings.kmode === 'both' ? null : KMODE_OPTS[settings.kmode],
      M.KEY_SYSTEMS[settings.ksys].label, settings.count + '問'
    ].filter(Boolean).join(' · ');
  }

  const syncers = [];
  function syncSettingsUI() { syncers.forEach((f) => f()); renderSummary(); }

  function checkGroup(container, options, key) {
    const sync = () => {
      container.innerHTML = '';
      Object.entries(options).forEach(([v, label]) => {
        const l = el('label', 'check', `<input type="checkbox" value="${v}"> ${label}`);
        const inp = l.querySelector('input');
        inp.checked = settings[key].includes(v);
        inp.addEventListener('change', () => {
          const on = [...container.querySelectorAll('input:checked')].map((x) => x.value);
          if (!on.length) { inp.checked = true; return; } // 1つは残す
          settings[key] = on;
          saveSettings();
          renderSteps();
        });
        container.appendChild(l);
      });
    };
    syncers.push(sync);
  }

  function initSettings() {
    const ksysHint = () => {
      const k = M.key('D'), m = M.key('Bm');
      $('#ksysHint').textContent = `例：${kn(k)}・${kn(m)}` + (settings.ksys === 'de' ? '（ドイツ式は長調 Dur を大文字、短調 Moll を小文字で書きます。シは H、シ♭は B）' : settings.ksys === 'doremi' ? '（ドレミの音名で呼ぶ言い方。正式な日本式の名前もあわせて覚えましょう）' : '');
    };
    syncers.push(
      () => segmented($('#clefSeg'), CLEF_OPTS, settings.clef, (v) => { settings.clef = v; saveSettings(); }),
      () => segmented($('#modeSeg'), KMODE_OPTS, settings.kmode, (v) => { settings.kmode = v; saveSettings(); renderSteps(); }),
      () => segmented($('#ksysSeg'), Object.fromEntries(Object.entries(M.KEY_SYSTEMS).map(([k, v]) => [k, v.label])), settings.ksys, (v) => { settings.ksys = v; saveSettings(); ksysHint(); }),
      ksysHint
    );
    checkGroup($('#clueChecks'), CLUES, 'clues');
    checkGroup($('#relChecks'), RELS, 'rels');
    $('#optTone').innerHTML = Object.entries(M.TONES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
    const bind = (id, key, isCheck, after) => {
      const n = $(id);
      const sync = () => { if (isCheck) n.checked = !!settings[key]; else n.value = String(settings[key]); };
      syncers.push(sync);
      n.addEventListener('change', () => {
        settings[key] = isCheck ? n.checked : n.value;
        if (key === 'range') settings.range = +n.value;
        saveSettings();
        if (after) after();
      });
    };
    bind('#optRange', 'range', false, renderSteps);
    bind('#optCount', 'count');
    bind('#optEarPlay', 'earPlay');
    bind('#optTempo', 'tempo');
    bind('#optEarSig', 'earSig', true, renderSteps);
    bind('#optRef', 'ref', true);
    bind('#optWeak', 'weak', true);
    bind('#optAuto', 'auto', true);
    bind('#optSound', 'sound', true);
    bind('#optTone', 'tone', false, () => { Sound.setType(settings.tone); Sound.stop(); playCadence(M.key('C')); });
    bind('#optVolume', 'volume', false, () => { Sound.setVolume(+settings.volume); Sound.stop(); Sound.play(67); });
    bind('#optGoal', 'goal', false, renderToday);
    syncSettingsUI();
  }

  // ---------- Quiz ----------
  let quiz = null;
  let advanceTimer = null;

  function pickKey(pool, prev) {
    const weights = pool.map((k) => {
      let w = 1;
      const s = stats[k.id];
      if (settings.weak && s && s.a) w += 3 * (1 - s.c / s.a);
      if (prev && k.id === prev.id) w *= 0.15;
      return w;
    });
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }
  const pickClef = () => (settings.clef === 'both' ? pick(['treble', 'bass']) : settings.clef);

  /** 調号の選択肢（正解と、間違えやすい近い調号） */
  function sigChoices(sig) {
    const R = settings.range;
    const near = [-sig, sig + 1, sig - 1, sig + 2, sig - 2, -sig + 1, -sig - 1, sig + 3, sig - 3];
    const valid = (s) => s >= -7 && s <= 7 && s !== sig;
    const inR = shuffle([...new Set(near.filter((s) => valid(s) && Math.abs(s) <= R))]);
    const outR = [...new Set(near.filter((s) => valid(s) && Math.abs(s) > R))];
    const all = [...new Set([...inR, ...outR])].slice(0, 3);
    return shuffle([sig, ...all]);
  }
  /** 調の選択肢（正解・平行調・同主調・もう1つ） */
  function keyChoices(k, pool) {
    const r = M.related(k);
    const extra = shuffle([r.dominant, r.subdominant, M.related(r.parallel).relative, M.related(r.dominant).relative]);
    const list = [k, r.relative, r.parallel, ...extra, ...shuffle(pool)];
    const out = [];
    list.forEach((x) => { if (x && out.length < 4 && !out.some((y) => y.id === x.id)) out.push(x); });
    return shuffle(out);
  }

  function makeQuestion(mode, prev, fixed) {
    const pool = keyPool(mode === 'earMode' ? Object.assign({}, settings, { kmode: 'both' }) : settings);
    const k = fixed ? M.key(fixed.key) : pickKey(pool, prev && prev.k);
    const q = { mode, k, clef: fixed ? fixed.clef : pickClef(), answered: false };
    if (mode === 'sig') { q.choices = sigChoices(k.sig); q.ans = k.sig; }
    if (mode === 'pick') { q.choices = sigChoices(k.sig); q.ans = k.sig; }
    if (mode === 'clue') {
      q.clue = fixed && fixed.clue ? fixed.clue : pick(settings.clues);
      q.pat = pick(PHRASES);
      q.choices = keyChoices(k, pool);
      q.ans = k.id;
    }
    if (mode === 'earKey') {
      q.play = settings.earPlay;
      q.pat = pick(PHRASES);
      q.choices = keyChoices(k, pool);
      q.ans = k.id;
    }
    if (mode === 'earMode') {
      q.mat = pick(['phrase', 'phrase', 'cadence', 'scale']);
      q.pat = pick(PHRASES);
      q.choices = ['major', 'minor'];
      q.ans = k.mode;
    }
    if (mode === 'rel') {
      q.rel = fixed && fixed.rel ? fixed.rel : pick(settings.rels);
      const r = M.related(k);
      q.target = r[q.rel];
      const others = Object.keys(RELS).filter((x) => x !== q.rel).map((x) => r[x]);
      const list = [q.target, ...shuffle(others), M.related(q.target).relative, ...shuffle(pool)];
      const out = [];
      list.forEach((x) => { if (x && x.id !== k.id && out.length < 4 && !out.some((y) => y.id === x.id)) out.push(x); });
      q.choices = shuffle(out);
      q.ans = q.target.id;
    }
    return q;
  }

  function startQuiz(mode, fixedList) {
    clearTimeout(advanceTimer);
    Sound.stop();
    quiz = {
      mode, i: 0, score: 0, log: [], q: null,
      total: fixedList ? fixedList.length : +settings.count,
      fixed: fixedList || null
    };
    if (current !== 'quiz') show('quiz');
    $('#quizSetup').hidden = true;
    $('#quizResult').hidden = true;
    $('#quizPlay').hidden = false;
    document.body.classList.add('quizzing');
    nextQuestion();
  }
  function stopQuiz() {
    clearTimeout(advanceTimer);
    Sound.stop();
    quiz = null;
    document.body.classList.remove('quizzing');
    $('#quizPlay').hidden = true;
    $('#quizResult').hidden = true;
    $('#quizSetup').hidden = false;
    renderToday();
    window.scrollTo(0, 0);
  }

  function nextQuestion() {
    clearTimeout(advanceTimer);
    Sound.stop();
    if (!quiz) return;
    if (quiz.i >= quiz.total) { finishQuiz(); return; }
    const prev = quiz.q;
    quiz.q = makeQuestion(quiz.mode, prev, quiz.fixed ? quiz.fixed[quiz.i] : null);
    renderQuestion();
    if (EAR.includes(quiz.mode)) setTimeout(() => { if (quiz && quiz.q && !quiz.q.answered) playQuestionSound(quiz.q); }, 250);
  }

  /** 聴き取り問題の音 */
  function playQuestionSound(q) {
    Sound.stop();
    let t = 0;
    if (settings.ref) { Sound.play(60, 0, 0.9); t = 1.2; }
    const k = q.k;
    if (q.mode === 'earKey') {
      const sc = M.scale(k, k.minor ? 'harmonic' : 'major', 4);
      if (q.play === 'scale') playScale(sc, t);
      else if (q.play === 'cadence') playCadence(k, t);
      else if (q.play === 'phrase') playPhrase(k, degNotes(k, q.pat, phraseOct(k, 'treble')), t);
      else playCadence(k, playScale(sc, t) + 0.4);
    } else if (q.mode === 'earMode') {
      if (q.mat === 'cadence') playCadence(k, t);
      else if (q.mat === 'scale') playScale(M.scale(k, k.minor ? 'natural' : 'major', 4), t);
      else playPhrase(k, degNotes(k, q.pat, phraseOct(k, 'treble')), t);
    } else if (q.mode === 'clue' && q.clue === 'phrase') {
      playPhrase(k, degNotes(k, q.pat, phraseOct(k, q.clef)), t);
    } else {
      playCadence(k, t);
    }
  }

  const SPEAKER = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 19h7l10-8v26l-10-8H9z"/><path d="M32 17c3 4 3 10 0 14M37 12c5.5 6.5 5.5 17.5 0 24"/></svg>';

  /** 問題の五線譜（答えたあとは mark で主音・導音を色付け） */
  function clueStaff(q, mark) {
    const k = q.k;
    if (q.clue === 'final') return phraseStaff(k, q.clef, FINAL_PAT, { final: true, barAt: 3, mark, slot: 34, cls: 'stage-staff', label: '曲の終わり' }).svg;
    if (q.clue === 'lead') return phraseStaff(k, q.clef, LEAD_PAT, { mark, slot: 34, cls: 'stage-staff', label: '曲の途中' }).svg;
    if (q.clue === 'phrase') return phraseStaff(k, q.clef, q.pat, { final: true, barAt: 4, mark, cls: 'stage-staff wide', label: 'メロディー' }).svg;
    return sigStaff(k.sig, q.clef, { cls: 'stage-staff' });
  }

  function renderClue(q) {
    const box = $('#clue');
    const k = q.k;
    box.className = 'clue';
    box.hidden = q.mode !== 'clue';
    if (q.mode !== 'clue') return;
    const lab = `<span class="clue-label">手がかり：${CLUES[q.clue]}</span>`;
    if (q.clue === 'mood') {
      box.classList.add(k.minor ? 'dark' : 'bright');
      const ic = k.minor
        ? '<svg class="mood-ic min" viewBox="0 0 24 24"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/></svg>'
        : '<svg class="mood-ic maj" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>';
      box.innerHTML = `${lab}${ic}<span>この曲の響きは <b class="${k.minor ? 'min' : 'maj'}">${k.minor ? '暗い・さびしい' : '明るい'}</b></span>${playBtn('響きを聴く')}`;
      box.querySelector('.play-btn').addEventListener('click', () => { Sound.stop(); playCadence(k); });
    } else if (q.clue === 'final') {
      box.innerHTML = `${lab}<span>上の譜面は<b>曲の最後</b>の部分です。最後の音（いちばん低いパートも同じ音）に注目</span>`;
    } else if (q.clue === 'lead') {
      box.innerHTML = `${lab}<span>${k.minor
        ? 'この曲の中には、上の譜面のような<b>臨時記号の付いた音</b>が何度も出てきます'
        : 'この曲の中には、<b>臨時記号がほとんど出てきません</b>（上の譜面は曲の途中の一部です）'}</span>`;
    } else if (q.clue === 'phrase') {
      box.innerHTML = `${lab}<span>曲の最初のメロディーです（終わりの和音つき）</span>${playBtn('聴く')}`;
      box.querySelector('.play-btn').addEventListener('click', () => playQuestionSound(q));
    }
  }

  function renderQuestion() {
    const q = quiz.q;
    const k = q.k;
    $('#progressLabel').textContent = `${quiz.i + 1} / ${quiz.total}`;
    $('#scoreLabel').textContent = `${quiz.score} 正解`;
    $('#progressBar').style.width = `${(100 * quiz.i) / quiz.total}%`;
    $('#gloss').innerHTML = '';
    $('#nextBtn').hidden = true;
    $('#detailBtn').hidden = true;
    $('#replayBtn').hidden = !EAR.includes(q.mode) && !(q.mode === 'clue' && q.clue === 'phrase');
    const stage = $('#stage');
    stage.classList.remove('flash-good', 'flash-bad');
    stage.onclick = null;
    let prompt = '';
    if (q.mode === 'sig') {
      prompt = 'この調号を使う調は？（長調と短調の組）';
      stage.innerHTML = sigStaff(k.sig, q.clef, { cls: 'stage-staff' });
    } else if (q.mode === 'clue') {
      prompt = '調号と手がかりから、調を特定しよう';
      stage.innerHTML = clueStaff(q, false);
    } else if (q.mode === 'pick') {
      prompt = 'この調の調号は？';
      stage.innerHTML = `<div class="big-key">${kn(k)}<small>${keySub(k)}・${M.MODE_JA[k.mode]}</small></div>`;
    } else if (q.mode === 'earKey') {
      prompt = '流れた音の調は？';
      stage.innerHTML = `<div class="stage-col"><button class="speaker" type="button" aria-label="もう一度聴く">${SPEAKER}</button>${settings.earSig ? sigStaff(k.sig, q.clef, { cls: 'stage-staff' }) : '<p class="stage-cap">調号のヒントなし</p>'}</div>`;
      stage.querySelector('.speaker').addEventListener('click', () => playQuestionSound(q));
    } else if (q.mode === 'earMode') {
      prompt = '流れた曲は、長調？短調？';
      stage.innerHTML = `<div class="stage-col"><button class="speaker" type="button" aria-label="もう一度聴く">${SPEAKER}</button><p class="stage-cap">${{ phrase: '短いメロディー', cadence: '和音（終止形）', scale: '音階' }[q.mat]}</p></div>`;
      stage.querySelector('.speaker').addEventListener('click', () => playQuestionSound(q));
    } else if (q.mode === 'rel') {
      prompt = `<b>${RELS[q.rel]}</b>は？<small class="hint-inline">（${REL_DESC[q.rel]}）</small>`;
      stage.innerHTML = `<div class="big-key">${kn(k)}<small>の ${RELS[q.rel]} は？</small></div>`;
    }
    $('#prompt').innerHTML = prompt;
    renderClue(q);
    renderChoices(q);
    $('#kbdHint').textContent = `1〜${q.choices.length} で回答${EAR.includes(q.mode) ? ' · Space でもう一度聴く' : ''} · Enter で次へ · Esc でやめる`;
  }

  function choiceBtn(html, num, cls = '') {
    const b = el('button', 'choice ' + cls, html);
    b.type = 'button';
    b.dataset.num = num;
    return b;
  }

  function renderChoices(q) {
    const box = $('#choices');
    box.innerHTML = '';
    box.className = 'choices four';
    q.choices.forEach((c, i) => {
      let b;
      if (q.mode === 'sig') {
        const maj = M.keyOf(c, 'major'), min = M.keyOf(c, 'minor');
        b = choiceBtn(`<span class="nm pair"><span class="maj">${kn(maj)}</span>／<span class="min">${kn(min)}</span></span>`, i + 1);
      } else if (q.mode === 'pick') {
        box.className = 'choices staves';
        b = choiceBtn(sigStaff(c, q.clef), i + 1);
      } else if (q.mode === 'earMode') {
        box.className = 'choices two';
        b = choiceBtn(c === 'major'
          ? '<span class="nm maj">長調</span><span class="sub">明るい</span>'
          : '<span class="nm min">短調</span><span class="sub">暗い・さびしい</span>', i + 1, c === 'major' ? 'maj-c' : 'min-c');
      } else {
        b = choiceBtn(`<span class="nm">${kn(c)}</span><span class="sub">${keySub(c)}</span>`, i + 1, c.minor ? 'min-c' : 'maj-c');
      }
      const val = typeof c === 'object' ? c.id : c;
      b.dataset.val = String(val);
      if (String(val) === String(q.ans)) b.dataset.ans = '1';
      b.addEventListener('click', () => answer(b));
      box.appendChild(b);
    });
  }

  function flashStage(ok) {
    const stage = $('#stage');
    stage.classList.remove('flash-good', 'flash-bad');
    void stage.offsetWidth;
    stage.classList.add(ok ? 'flash-good' : 'flash-bad');
  }

  /** 調号から長調・短調を見つける説明 */
  function sigReason(sig) {
    const maj = M.keyOf(sig, 'major'), min = M.keyOf(sig, 'minor');
    const n = Math.abs(sig);
    let s;
    if (sig === 0) s = '調号なし → ';
    else if (sig > 0) s = `${M.sigText(sig)}：最後の♯は <b>${nmD({ l: M.SHARP_ORDER[n - 1], a: 1 })}</b>。そのすぐ上の <b>${tn(maj)}</b> が長調の主音 → `;
    else if (sig === -1) s = '♭1つはヘ長調（そのまま覚える） → ';
    else s = `${M.sigText(sig)}：右から2番目の♭ <b>${nmD({ l: M.FLAT_ORDER[n - 2], a: -1 })}</b> が長調の主音 → `;
    return `${s}<b>${kn(maj)}</b>。平行調（3つ下の <b>${tn(min)}</b> が主音）は <b>${kn(min)}</b>`;
  }
  function clueReason(q) {
    const k = q.k;
    const lead = M.degree(k, 6, 4, 1);
    const parts = [];
    if (q.clue === 'mood') parts.push(`響きが${k.minor ? '暗い → <b>短調</b>' : '明るい → <b>長調</b>'}`);
    if (q.clue === 'final' || q.clue === 'phrase') parts.push(`最後の音が <b>${tn(k)}</b> → ${tn(k)}が主音`);
    if (q.clue === 'lead' || (q.clue === 'phrase' && k.minor)) {
      parts.push(k.minor
        ? `調号にない <b>${nmD(lead)}</b> は短調の導音（主音 ${tn(k)} の半音下） → <b>短調</b>`
        : '導音の臨時記号が出てこない → <b>長調</b>');
    }
    return parts.join('。');
  }
  function relReason(q) {
    const k = q.k, t = q.target;
    const r = M.related(k);
    const enh = (q.rel === 'parallel' && r.parallelEnh) || (q.rel === 'dominant' && r.dominantEnh) || (q.rel === 'subdominant' && r.subdominantEnh);
    const base = {
      relative: `調号が同じ（${M.sigText(k.sig, 'doremi', false)}）${k.minor ? '長調' : '短調'}`,
      parallel: `主音が同じ（${tn(k)}）${k.minor ? '長調' : '短調'}`,
      dominant: `${tn(k)}の5度上の${M.tonicName(M.related(k).dominant, 'doremi')}が主音。${sigShort(k.sig)} → ${sigShort(t.sig)}`,
      subdominant: `${tn(k)}の5度下の${M.tonicName(M.related(k).subdominant, 'doremi')}が主音。${sigShort(k.sig)} → ${sigShort(t.sig)}`
    }[q.rel];
    return base + (enh ? '（調号が7つを超えるので、同じ音の調で表しています）' : '');
  }

  function answer(btn) {
    const q = quiz && quiz.q;
    if (!q || q.answered) return;
    q.answered = true;
    const ok = btn.dataset.ans === '1';
    q.ok = ok;
    q.chosen = btn.dataset.val;
    if (ok) quiz.score++;
    record(q.k, ok);
    quiz.log.push({ q, ok });
    const buttons = [...document.querySelectorAll('#choices .choice')];
    btn.classList.add(ok ? 'is-correct' : 'is-wrong');
    buttons.forEach((x) => {
      x.disabled = true;
      if (x.dataset.ans === '1') x.classList.add('is-correct');
      else if (x !== btn) x.classList.add('dim');
    });
    flashStage(ok);

    const k = q.k;
    const head = ok ? '<span class="ok">正解</span>' : '<span class="ng">正解は</span>';
    let body = '', why = '';
    const stage = $('#stage');
    if (q.mode === 'sig') {
      body = `${kn(M.keyOf(k.sig, 'major'))}／${kn(M.keyOf(k.sig, 'minor'))}`;
      why = sigReason(k.sig);
    } else if (q.mode === 'pick') {
      body = `${M.sigText(k.sig)}（${kn(k)}）`;
      why = sigReason(k.sig);
      stage.innerHTML = `<div class="stage-col"><div class="big-key">${kn(k)}</div>${scaleStaff(k, q.clef).svg}</div>`;
      stage.querySelector('svg').classList.add('stage-staff');
    } else if (q.mode === 'clue') {
      body = kn(k);
      why = `${sigReason(k.sig)}<br>${clueReason(q)}`;
      stage.innerHTML = clueStaff(q, true);
    } else if (q.mode === 'earKey') {
      body = kn(k);
      why = `主音は <b>${tn(k)}</b>、響きは${k.minor ? '暗い（短調）' : '明るい（長調）'}。${M.sigText(k.sig)}`;
      stage.innerHTML = `<div class="stage-col"><button class="speaker" type="button" aria-label="もう一度聴く">${SPEAKER}</button>${scaleStaff(k, q.clef, k.minor ? 'harmonic' : 'major').svg}</div>`;
      stage.querySelector('svg.staff').classList.add('stage-staff');
      stage.querySelector('.speaker').addEventListener('click', () => playQuestionSound(q));
    } else if (q.mode === 'earMode') {
      const third = M.degree(k, 2, 4);
      body = `${M.MODE_JA[k.mode]}（${kn(k)}）`;
      why = `主音 ${tn(k)} から3番目の音が <b>${nmD(third)}</b>（主音から半音${k.minor ? 3 : 4}つ上＝${k.minor ? '短3度' : '長3度'}）`;
      stage.innerHTML = `<div class="stage-col"><button class="speaker" type="button" aria-label="もう一度聴く">${SPEAKER}</button>${q.mat === 'phrase'
        ? phraseStaff(k, 'treble', q.pat, { final: true, barAt: 4, mark: true, cls: 'stage-staff wide' }).svg
        : scaleStaff(k, 'treble').svg}</div>`;
      stage.querySelector('.speaker').addEventListener('click', () => playQuestionSound(q));
    } else if (q.mode === 'rel') {
      body = `${kn(q.target)}`;
      why = `${RELS[q.rel]}は、${relReason(q)}`;
    }
    $('#gloss').innerHTML = `${head}　<b>${body}</b><span class="why">${why}</span>`;
    if (!ok && q.mode === 'clue') {
      const chosen = M.key(q.chosen);
      if (chosen) $('#gloss').insertAdjacentHTML('beforeend', `<span class="why">選んだのは ${kn(chosen)}（${M.sigText(chosen.sig, 'doremi', false)}）</span>`);
    }
    if (settings.sound && !EAR.includes(q.mode)) { Sound.stop(); playCadence(q.mode === 'rel' ? q.target : k); }
    if (!ok && q.mode === 'earMode') { /* もう一度聴けるように音はそのまま */ }

    $('#scoreLabel').textContent = `${quiz.score} 正解`;
    quiz.i++;
    $('#nextBtn').hidden = false;
    $('#nextBtn').textContent = quiz.i >= quiz.total ? '結果を見る' : '次へ';
    $('#detailBtn').hidden = false;
    $('#detailBtn').onclick = () => openKey((q.mode === 'rel' ? q.target : k).id);
    if (ok && settings.auto) advanceTimer = setTimeout(nextQuestion, EAR.includes(q.mode) ? 1800 : 1400);
  }

  $('#nextBtn').addEventListener('click', nextQuestion);
  $('#replayBtn').addEventListener('click', () => { if (quiz && quiz.q) playQuestionSound(quiz.q); });
  $('#quitBtn').addEventListener('click', stopQuiz);

  function finishQuiz() {
    clearTimeout(advanceTimer);
    if (!quiz) return;
    const done = quiz;
    $('#quizPlay').hidden = true;
    $('#quizResult').hidden = false;
    document.body.classList.remove('quizzing');
    const total = done.log.length;
    $('#resultScore').textContent = done.score;
    $('#resultTotal').textContent = ` / ${total}`;
    const r = total ? done.score / total : 0;
    const mode = QMODES.find((m) => m.id === done.mode);
    $('#resultTitle').innerHTML = (r === 1 ? 'パーフェクト！' : r >= 0.8 ? 'よく読めています' : r >= 0.5 ? 'その調子です' : 'くり返して慣れていきましょう') +
      `<br><small>${mode.title} · ♯♭${settings.range}つまで</small>`;
    const misses = done.log.filter((x) => !x.ok);
    $('#retryMissBtn').hidden = !misses.length;
    $('#retryMissBtn').onclick = () => startQuiz(done.mode, shuffle(misses.map((x) => ({ key: x.q.k.id, clef: x.q.clef, clue: x.q.clue, rel: x.q.rel }))));
    $('#againBtn').onclick = () => startQuiz(done.mode);
    const review = $('#review');
    review.innerHTML = '';
    done.log.forEach(({ q, ok }) => {
      const k = q.mode === 'rel' ? q.target : q.k;
      const it = el('button', 'review-item ' + (ok ? 'ok' : 'ng'));
      it.type = 'button';
      const label = q.mode === 'sig' ? `${kn(M.keyOf(q.k.sig, 'major'))}／${kn(M.keyOf(q.k.sig, 'minor'))}`
        : q.mode === 'rel' ? `${kn(q.k)} の${RELS[q.rel]} → ${kn(k)}` : kn(k);
      const sub = q.mode === 'clue' ? `手がかり：${CLUES[q.clue]}` : q.mode === 'earMode' ? M.MODE_JA[k.mode] : M.sigText(k.sig, 'doremi', false);
      it.innerHTML = `${sigStaff(k.sig, q.clef)}<span class="ans"><b>${label}</b><small>${sub}</small></span><span class="mark">${ok ? '○' : '×'}</span>`;
      it.addEventListener('click', () => openKey(k.id));
      review.appendChild(it);
    });
    quiz = null;
    window.scrollTo(0, 0);
  }
  $('#backBtn').addEventListener('click', stopQuiz);

  // キーボード操作
  document.addEventListener('keydown', (e) => {
    if ($('#keySheet').open) return;
    if (!quiz || !quiz.q || e.ctrlKey || e.metaKey || e.altKey) return;
    const q = quiz.q;
    if (e.key === 'Escape') { stopQuiz(); return; }
    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      if (q.answered) { e.preventDefault(); nextQuestion(); }
      return;
    }
    if (e.key === ' ') { e.preventDefault(); playQuestionSound(q); return; }
    if (q.answered) return;
    if (/^[1-9]$/.test(e.key)) {
      const b = document.querySelector(`#choices .choice[data-num="${e.key}"]`);
      if (b) { e.preventDefault(); b.click(); }
    }
  });

  // ---------- この調で曲を聴く ----------
  const MELS = window.MELODIES;
  let songTimers = [];
  function stopSong() {
    songTimers.forEach(clearTimeout);
    songTimers = [];
    document.querySelectorAll('.score .note.playing').forEach((n) => n.classList.remove('playing'));
    document.querySelectorAll('.song-play').forEach((b) => { b.classList.remove('on'); b.innerHTML = PLAY_IC + '再生'; });
    document.querySelectorAll('.ls-chip.now').forEach((c) => c.classList.remove('now'));
  }
  /** 曲を調 k の音にする（同じ度数のまま。短調では導音を半音上げる） */
  function songMeasures(mel, k, clef) {
    const ms = mel.m.map(M.parseMeasure);
    const oct = M.fitOct(k, clef, ms.flat().filter((e) => !e.rest).map((e) => e.deg));
    let i = 0;
    ms.forEach((m) => m.forEach((e) => {
      e.i = i++;
      if (e.rest) return;
      const dd = ((e.deg % 7) + 7) % 7;
      e.n = M.degree(k, e.deg, oct, (k.minor && dd === 6 ? 1 : 0) + e.alt);
    }));
    return ms;
  }
  /** 曲の音を予約して、長さ（秒）を返す。root の中の音符を、鳴っている間だけ色付けする */
  function scheduleSong(mel, k, ms, root, speed = 1) {
    const q = mel.q / speed;
    let t = 0.08, prev = null;
    ms.forEach((m, mi) => {
      const mStart = t;
      const mBeats = m.reduce((s, e) => s + M.evBeats(e), 0);
      const chords = settings.songAcc ? mel.chords[mi] || [] : [];
      chords.forEach(([b, d], ci) => {
        const endB = ci + 1 < chords.length ? chords[ci + 1][0] : mBeats;
        const c = M.chordMidis(k, d, prev);
        prev = c.upper;
        c.midis.forEach((x, j) => Sound.play(x, mStart + b * q, (endB - b) * q * 0.95, j === 0 ? 0.5 : 0.3));
      });
      m.forEach((e) => {
        const len = M.evBeats(e) * q;
        if (!e.rest) Sound.play(e.n.midi, t, len * 0.92);
        const at = t;
        songTimers.push(setTimeout(() => {
          root.querySelectorAll('.note.playing').forEach((n) => n.classList.remove('playing'));
          root.querySelectorAll(`.note[data-i="${e.i}"]`).forEach((n) => n.classList.add('playing'));
        }, at * 1000));
        t += len;
      });
    });
    return t;
  }
  function songBtnOn(btn) {
    btn.classList.add('on');
    btn.innerHTML = '■ 止める';
  }
  function playSong(mel, k, ms, root, btn) {
    stopSong();
    Sound.stop();
    const t = scheduleSong(mel, k, ms, root);
    songTimers.push(setTimeout(stopSong, (t + 0.6) * 1000));
    songBtnOn(btn);
  }
  /** 原曲との関係の説明 */
  function songNote(mel, k) {
    const orig = M.key(mel.orig);
    return `原曲は${kn(orig)}。${orig.id === k.id ? 'この調が原曲と同じ調です。' : orig.mode !== k.mode
      ? `<b>${M.MODE_JA[orig.mode]}の曲を${M.MODE_JA[k.mode]}に置きかえています</b>（主音からの度数はそのまま）。明るさの違いを聴きくらべてみましょう。`
      : `${kn(k)}に移調しています（音の並び方はそのまま、高さだけ変わります）。`}`;
  }
  const songSVGs = (mel, k, clef, ms) => {
    const per = window.innerWidth < 600 ? 2 : 4;
    return M.scoreSVG({ clef, sig: k.sig, time: mel.time, pickup: !!mel.pickup, measures: ms, perLine: per, width: 110 + per * 150, label: `${mel.title}（${kn(k)}）` }).join('');
  };
  function renderSong(box, k, clef) {
    stopSong();
    const mel = MELS.find((x) => x.id === settings.song) || MELS[0];
    const ms = songMeasures(mel, k, clef);
    const bars = ms.length - (mel.pickup ? 1 : 0);
    box.innerHTML = `
      <div class="seg song-seg"></div>
      <div class="ks-card song">
        <div class="ks-cap"><b>${mel.title}<span class="song-sub">${mel.sub}</span></b><span>${bars}小節</span></div>
        <p class="song-note">${songNote(mel, k)}</p>
        <div class="song-score">${songSVGs(mel, k, clef, ms)}</div>
        <div class="song-ctl">
          <button class="play-btn song-play" type="button">${PLAY_IC}再生</button>
          <label class="check small"><input type="checkbox" class="song-acc"${settings.songAcc ? ' checked' : ''}> 伴奏の和音も鳴らす</label>
        </div>
        <p class="hint">${mel.by}${mel.note ? '。' + mel.note : ''}<br><a href="#" class="to-listen">「聴く」タブで、いろいろな調に移して聴きくらべる →</a></p>
      </div>`;
    box.querySelector('.to-listen').addEventListener('click', (e) => {
      e.preventDefault();
      settings.lsMode = 'single';
      settings.lsKey = k.id;
      saveSettings();
      sheet.close();
      show('listen');
    });
    segmented(box.querySelector('.song-seg'), Object.fromEntries(MELS.map((x) => [x.id, x.title])), mel.id, (v) => { settings.song = v; saveSettings(); renderSong(box, k, clef); });
    const btn = box.querySelector('.song-play');
    btn.addEventListener('click', () => { if (btn.classList.contains('on')) { stopSong(); Sound.stop(); } else playSong(mel, k, ms, box, btn); });
    box.querySelector('.song-acc').addEventListener('change', (e) => { settings.songAcc = e.target.checked; saveSettings(); });
  }

  // ---------- 聴く（曲を選んで、いろいろな調で聴きくらべる） ----------
  const SPEEDS = { 0.75: 'ゆっくり', 1: 'ふつう', 1.25: '少し速く', 1.5: '速く' };
  const GAPS = { 0: 'すぐ続けて', 0.8: '少し間をあける', 2: '長めに間をあける' };
  const LS_PRESETS = [
    { t: '暗い → 明るい', d: '同主調（主音が同じ）', ids: ['Cm', 'C'] },
    { t: '明るい → 暗い', d: '同主調で暗転', ids: ['C', 'Cm'] },
    { t: '平行調を行き来', d: '調号が同じ短調と長調', ids: ['Am', 'C'] },
    { t: '半音ずつ上げて盛り上げる', d: 'ラストの転調でよく使う', ids: ['C', 'Db', 'D'] },
    { t: '五度圏をめぐる', d: '♯が1つずつ増える', ids: ['C', 'G', 'D', 'A'] },
    { t: '沈んで、また明るく', d: '物語の起伏', ids: ['C', 'Am', 'Dm', 'G', 'C'] }
  ];
  const curMel = () => MELS.find((x) => x.id === settings.song) || MELS[0];
  /** 同じ長調・短調のまま、主音を半音 semi だけずらす（調号の少ないほうの書き方を選ぶ） */
  function shiftKey(k, semi) {
    const pc = (((k.tonic.midi + semi) % 12) + 12) % 12;
    return M.KEYS.filter((x) => x.mode === k.mode && ((x.tonic.midi % 12) + 12) % 12 === pc)
      .sort((a, b) => Math.abs(a.sig) - Math.abs(b.sig))[0];
  }
  const lsIds = () => settings.lsList.filter((id) => M.key(id));

  function renderListen() {
    stopSong();
    const mel = curMel();
    segmented($('#lsSong'), Object.fromEntries(MELS.map((x) => [x.id, x.title])), mel.id, (v) => { settings.song = v; saveSettings(); renderListen(); });
    segmented($('#lsMode'), { single: '1つの調で聴く', list: '選んだ調を順に聴く' }, settings.lsMode, (v) => { settings.lsMode = v; saveSettings(); renderListen(); });
    segmented($('#lsClef'), { treble: 'ト音記号', bass: 'ヘ音記号' }, settings.lsClef, (v) => { settings.lsClef = v; saveSettings(); renderListen(); });
    $('#lsMelInfo').innerHTML = `${mel.sub} · ${mel.by}`;
    const single = settings.lsMode === 'single';
    $('#lsSingle').hidden = !single;
    $('#lsList').hidden = single;
    $('#lsListOpts').hidden = single;
    $('#lsListMore').hidden = single;
    if (single) renderListenSingle(); else renderListenList();
  }

  function renderListenSingle() {
    const k = M.key(settings.lsKey) || M.key(curMel().orig);
    const opt = (x) => `<option value="${x.id}"${x.id === k.id ? ' selected' : ''}>${kn(x)}（${sigShort(x.sig)}）</option>`;
    const bySig = (mode) => M.KEYS.filter((x) => x.mode === mode).sort((a, b) => SIG_ORDER.indexOf(a.sig) - SIG_ORDER.indexOf(b.sig));
    $('#lsKey').innerHTML = `<optgroup label="長調">${bySig('major').map(opt).join('')}</optgroup><optgroup label="短調">${bySig('minor').map(opt).join('')}</optgroup>`;
    const r = M.related(k);
    const moves = [
      ['◀ 半音下', shiftKey(k, -1)], ['半音上 ▶', shiftKey(k, 1)],
      [k.minor ? '長調にする（同主調）' : '短調にする（同主調）', r.parallel],
      ['平行調', r.relative], ['5度上（属調）', r.dominant], ['5度下（下属調）', r.subdominant],
      ['原曲の調', M.key(curMel().orig)]
    ];
    const box = $('#lsMoves');
    box.innerHTML = moves.map(([label, x], i) => `<button class="ls-move" type="button" data-i="${i}">${label}<small>${kn(x)}</small></button>`).join('');
    box.querySelectorAll('.ls-move').forEach((b) => b.addEventListener('click', () => setListenKey(moves[+b.dataset.i][1].id)));
    renderListenStage(k);
  }
  function setListenKey(id) {
    const was = $('#lsPlay').classList.contains('on');
    stopSong();
    Sound.stop();
    settings.lsKey = id;
    saveSettings();
    renderListenSingle();
    if (was) startListen();
  }
  $('#lsKey').addEventListener('change', (e) => setListenKey(e.target.value));

  function renderListenStage(k, pos, total) {
    const mel = curMel();
    const clef = settings.lsClef;
    const ms = songMeasures(mel, k, clef);
    $('#lsNow').innerHTML = `${total ? `<span class="ls-count">${pos + 1} / ${total}</span>` : ''}${modeTag(k)}<b class="ls-key-name">${kn(k)}</b><span class="ls-sig">${M.sigText(k.sig)}</span>`;
    $('#lsNote').innerHTML = songNote(mel, k);
    $('#lsScore').innerHTML = songSVGs(mel, k, clef, ms);
    return ms;
  }

  function renderListenList() {
    const ids = lsIds();
    // 再生順（並べかえ・削除）
    const chips = $('#lsChips');
    chips.innerHTML = ids.length
      ? ids.map((id, i) => `<span class="ls-chip" data-i="${i}"><span class="n">${i + 1}</span><b class="${M.key(id).minor ? 'min' : 'maj'}">${kn(M.key(id))}</b>
          <button type="button" data-act="up" aria-label="前へ"${i === 0 ? ' disabled' : ''}>↑</button><button type="button" data-act="down" aria-label="後ろへ"${i === ids.length - 1 ? ' disabled' : ''}>↓</button><button type="button" data-act="del" aria-label="外す">×</button></span>`).join('<span class="ls-arrow">→</span>')
      : '<p class="hint">下の一覧で、聴きたい調にチェックを入れてください。チェックした順に並びます。</p>';
    chips.querySelectorAll('.ls-chip button').forEach((b) => b.addEventListener('click', () => {
      const i = +b.closest('.ls-chip').dataset.i;
      const list = lsIds();
      if (b.dataset.act === 'up') [list[i - 1], list[i]] = [list[i], list[i - 1]];
      if (b.dataset.act === 'down') [list[i + 1], list[i]] = [list[i], list[i + 1]];
      if (b.dataset.act === 'del') list.splice(i, 1);
      settings.lsList = list;
      saveSettings();
      stopSong(); Sound.stop();
      renderListenList();
    }));
    // おすすめの並び
    $('#lsPresets').innerHTML = LS_PRESETS.map((p, i) => `<button class="ls-preset" type="button" data-i="${i}"><b>${p.t}</b><small>${p.d}：${p.ids.map((id) => kn(M.key(id))).join('→')}</small></button>`).join('');
    $('#lsPresets').querySelectorAll('.ls-preset').forEach((b) => b.addEventListener('click', () => {
      settings.lsList = LS_PRESETS[+b.dataset.i].ids.slice();
      saveSettings();
      stopSong(); Sound.stop();
      renderListenList();
    }));
    // 調のチェック
    const grid = $('#lsGrid');
    grid.innerHTML = SIG_ORDER.map((sig) => {
      const cell = (k) => {
        const n = ids.indexOf(k.id);
        return `<label class="ls-key ${k.mode}${n >= 0 ? ' on' : ''}"><input type="checkbox" value="${k.id}"${n >= 0 ? ' checked' : ''}><span>${kn(k)}</span>${n >= 0 ? `<i>${n + 1}</i>` : ''}</label>`;
      };
      return `<div class="ls-row"><span class="ls-row-sig">${sigShort(sig)}</span>${cell(M.keyOf(sig, 'major'))}${cell(M.keyOf(sig, 'minor'))}</div>`;
    }).join('');
    grid.querySelectorAll('input').forEach((inp) => inp.addEventListener('change', () => {
      const list = lsIds().filter((id) => id !== inp.value);
      if (inp.checked) list.push(inp.value);
      settings.lsList = list;
      saveSettings();
      stopSong(); Sound.stop();
      renderListenList();
    }));
    $('#lsPlay').disabled = !ids.length;
    if (ids.length) renderListenStage(M.key(ids[0]), 0, ids.length);
    else { $('#lsNow').innerHTML = ''; $('#lsNote').innerHTML = ''; $('#lsScore').innerHTML = ''; }
  }

  /** 選んだ調を順に鳴らす。i 番目の調の楽譜に切りかえてから鳴らす */
  function playQueue(i) {
    const ids = lsIds();
    if (!ids.length) { stopSong(); return; }
    if (i >= ids.length) {
      if (!settings.lsLoop) { stopSong(); return; }
      i = 0;
    }
    const k = M.key(ids[i]);
    const ms = renderListenStage(k, i, ids.length);
    document.querySelectorAll('.ls-chip').forEach((c) => c.classList.toggle('now', +c.dataset.i === i));
    const t = scheduleSong(curMel(), k, ms, $('#lsScore'), +settings.lsSpeed);
    songTimers.push(setTimeout(() => playQueue(i + 1), (t + +settings.lsGap + 0.3) * 1000));
  }
  function startListen() {
    stopSong();
    Sound.stop();
    const btn = $('#lsPlay');
    if (settings.lsMode === 'single') {
      const k = M.key(settings.lsKey) || M.key(curMel().orig);
      const ms = renderListenStage(k);
      const t = scheduleSong(curMel(), k, ms, $('#lsScore'), +settings.lsSpeed);
      songTimers.push(setTimeout(stopSong, (t + 0.6) * 1000));
    } else {
      playQueue(0);
    }
    songBtnOn(btn);
  }
  $('#lsPlay').addEventListener('click', () => {
    if ($('#lsPlay').classList.contains('on')) { stopSong(); Sound.stop(); } else startListen();
  });

  function initListenOptions() {
    $('#lsTone').innerHTML = Object.entries(M.TONES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
    $('#lsSpeed').innerHTML = Object.entries(SPEEDS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    $('#lsGap').innerHTML = Object.entries(GAPS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    const sync = () => {
      $('#lsTone').value = settings.tone;
      $('#lsSpeed').value = String(settings.lsSpeed);
      $('#lsGap').value = String(settings.lsGap);
      $('#lsAcc').checked = !!settings.songAcc;
      $('#lsLoop').checked = !!settings.lsLoop;
    };
    syncers.push(sync);
    sync();
    // 音色・速さ・伴奏は、次に鳴らすときから反映される
    $('#lsTone').addEventListener('change', (e) => { settings.tone = e.target.value; Sound.setType(settings.tone); saveSettings(); syncSettingsUI(); });
    $('#lsSpeed').addEventListener('change', (e) => { settings.lsSpeed = e.target.value; saveSettings(); });
    $('#lsGap').addEventListener('change', (e) => { settings.lsGap = e.target.value; saveSettings(); });
    $('#lsAcc').addEventListener('change', (e) => { settings.songAcc = e.target.checked; saveSettings(); });
    $('#lsLoop').addEventListener('change', (e) => { settings.lsLoop = e.target.checked; saveSettings(); });
    $('#lsClear').addEventListener('click', () => { settings.lsList = []; saveSettings(); stopSong(); Sound.stop(); renderListenList(); });
  }

  // ---------- 調の詳細（シート） ----------
  const sheet = $('#keySheet');
  $('#sheetClose').addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
  sheet.addEventListener('close', () => { stopSong(); Sound.stop(); });

  function openKey(id) {
    const k = M.key(id);
    if (!k) return;
    stopSong();
    Sound.stop();
    const clef = settings.listClef;
    const info = INFO[k.id] || {};
    const r = M.related(k);
    const body = $('#sheetBody');
    const names = Object.entries(M.KEY_SYSTEMS).filter(([s]) => s !== settings.ksys).map(([s, v]) => `<span>${v.label} <b>${kn(k, s)}</b></span>`).join('');
    const enh = Math.abs(k.sig) >= 5 ? M.keyOf(k.sig - 12 * Math.sign(k.sig), k.mode) : null;

    // 音階
    const kinds = k.minor ? ['natural', 'harmonic', 'melodic'] : ['major'];
    const scales = kinds.map((kind) => {
      const s = scaleStaff(k, clef, kind);
      const alter = M.SCALES[kind].alter;
      const nm = s.notes.map((n, i) => `<span class="${i === 0 || i === 7 ? 't' : alter[i % 7] ? 'r' : ''}">${nmD(n)}</span>`).join(' ');
      return `<div class="ks-card" data-kind="${kind}"><div class="ks-cap"><b>${M.SCALES[kind].label}</b>${playBtn('音階')}</div>${s.svg}<p class="ks-scale-names">${nm}</p></div>`;
    }).join('');

    // 主要三和音
    const chordDegs = [0, 3, 4];
    const chords = chordDegs.map((d) => {
      const tri = M.triad(k, d, M.homeOct(k, clef));
      const roman = k.minor && d !== 4 ? M.ROMAN[d].toLowerCase() : M.ROMAN[d];
      const role = ['主和音', '下属和音', '属和音'][chordDegs.indexOf(d)];
      const svg = M.staffSVG({ clef, sig: k.sig, items: tri.map((n, i) => ({ n, whole: true, chord: i > 0, cls: i === 0 ? 'tonic' : '' })), width: M.sigWidth(k.sig) + 34, span: [-2, 11] });
      return `<button class="ks-chord" type="button" data-deg="${d}">${svg}<b>${roman}（${role}）</b><small>${tri.map(nmD).join('・')}</small></button>`;
    }).join('');

    const relBtn = (key, label, enhNote) => `<button type="button" data-key="${key.id}"><small>${label}${enhNote ? '（異名同音）' : ''}</small><b>${kn(key)}</b></button>`;
    const imslpUrl = (title) => 'https://imslp.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
    const pieces = (info.pieces || []).map(([t, c, en, note]) =>
      `<li><b>${t}</b><span class="by">${c}</span>${note ? `<span class="note-s">${note}</span>` : ''}<a href="${imslpUrl(en)}" target="_blank" rel="noopener">楽譜を見る（IMSLP）</a></li>`).join('');

    body.innerHTML = `
      <div class="ks-head">
        ${modeTag(k)} <span class="use-dots">${useDots(k)}</span>
        <h3 class="ks-name">${kn(k)}</h3>
        <p class="ks-names">${names}</p>
      </div>
      <div class="ks-sec">
        <h4>調号 <span class="seg" id="ksClef"></span></h4>
        <div class="ks-card">${sigStaff(k.sig, clef)}<p>${M.sigText(k.sig)}${enh ? `。同じ音の調：<b>${kn(enh)}</b>（${M.sigText(enh.sig, 'doremi', false)}）` : ''}</p><p class="hint">${sigReason(k.sig)}</p></div>
      </div>
      <div class="ks-sec">
        <h4>この調で曲を聴いてみる</h4>
        <div id="ksSong"></div>
      </div>
      <div class="ks-sec">
        <h4>音階 ${playBtn('和音（終止形）を聴く', 'cad')}</h4>
        ${scales}
        ${k.minor ? '<p class="hint">オレンジの音は、調号から半音上げた音です。短調の曲では、和声的短音階の「導音」（7番目の音）がよく臨時記号で出てきます。</p>' : ''}
      </div>
      <div class="ks-sec">
        <h4>主要三和音</h4>
        <div class="ks-chords">${chords}</div>
      </div>
      <div class="ks-sec">
        <h4>関係する調</h4>
        <div class="ks-rel">${relBtn(r.relative, '平行調')}${relBtn(r.parallel, '同主調', r.parallelEnh)}${relBtn(r.dominant, '属調', r.dominantEnh)}${relBtn(r.subdominant, '下属調', r.subdominantEnh)}</div>
      </div>
      <div class="ks-sec">
        <h4>イメージと使いどころ</h4>
        <div class="ks-card"><dl class="ks-mood">
          <dt>よく言われるイメージ</dt><dd>${info.mood || ''}</dd>
          <dt>ゲームに曲を付けるなら</dt><dd>${info.game || ''}</dd>
          <dt>演奏・楽器から見ると</dt><dd>${info.play || ''}</dd>
        </dl></div>
        <p class="hint">イメージは主観や歴史的な連想を含む目安です（「学ぶ」の「調のイメージは本当にある？」参照）。</p>
      </div>
      <div class="ks-sec">
        <h4>この調の有名な曲</h4>
        ${pieces ? `<ul class="pieces">${pieces}</ul><p class="hint">作曲者の没後、長い年月がたった曲です。楽章や部分によって調が変わる曲もあります。編曲・校訂版の楽譜や録音には別の権利がある場合があります。</p>` : '<p class="hint">この調で書かれた有名な曲はほとんどありません。</p>'}
      </div>`;
    segmented(body.querySelector('#ksClef'), { treble: 'ト音', bass: 'ヘ音' }, clef, (v) => { settings.listClef = v; saveSettings(); openKey(id); if (current === 'keys') renderKeys(); });
    renderSong(body.querySelector('#ksSong'), k, clef);
    body.querySelector('.play-btn.cad').addEventListener('click', () => { stopSong(); Sound.stop(); playCadence(k); });
    body.querySelectorAll('.ks-card[data-kind] .play-btn').forEach((b) => b.addEventListener('click', () => {
      stopSong();
      Sound.stop();
      const kind = b.closest('[data-kind]').dataset.kind;
      const notes = M.scale(k, kind, M.homeOct(k, clef));
      const end = playScale(notes);
      if (kind === 'melodic') playScale(M.scale(k, 'natural', M.homeOct(k, clef)).reverse().slice(1), end);
    }));
    body.querySelectorAll('.ks-chord').forEach((b) => b.addEventListener('click', () => {
      stopSong();
      Sound.stop();
      playChordNotes(M.triad(k, +b.dataset.deg, M.homeOct(k, clef)));
    }));
    body.querySelectorAll('.ks-rel button').forEach((b) => b.addEventListener('click', () => { openKey(b.dataset.key); body.closest('.sheet').scrollTop = 0; }));
    if (!sheet.open) {
      if (sheet.showModal) sheet.showModal(); else sheet.setAttribute('open', '');
    }
    sheet.scrollTop = 0;
  }

  // ---------- 調の一覧 ----------
  const SIG_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, -1, -2, -3, -4, -5, -6, -7];
  function renderKeys() {
    const clef = settings.listClef;
    segmented($('#listClefSeg'), { treble: 'ト音記号', bass: 'ヘ音記号' }, clef, (v) => { settings.listClef = v; saveSettings(); renderKeys(); });
    segmented($('#listSysSeg'), Object.fromEntries(Object.entries(M.KEY_SYSTEMS).map(([k, v]) => [k, v.label])), settings.ksys, (v) => { settings.ksys = v; saveSettings(); syncSettingsUI(); renderKeys(); });
    const rows = $('#keyRows');
    rows.innerHTML = '';
    SIG_ORDER.forEach((sig) => {
      const maj = M.keyOf(sig, 'major'), min = M.keyOf(sig, 'minor');
      const row = el('div', 'key-row');
      const kbtn = (k) => {
        const s = stats[k.id];
        const p = pct(s);
        const rare = (INFO[k.id] || {}).use === 0;
        return `<button class="key-btn ${k.mode}${rare ? ' rare' : ''}" type="button" data-key="${k.id}">${kn(k)}<small>${keySub(k)}${p != null ? ` · 正答率 ${p}%` : ''}</small></button>`;
      };
      const enh = Math.abs(sig) >= 5 ? `<span>　＝ ${kn(M.keyOf(sig - 12 * Math.sign(sig), 'major'))}・${kn(M.keyOf(sig - 12 * Math.sign(sig), 'minor'))} と同じ音</span>` : '';
      row.innerHTML = `<button class="key-row-staff" type="button" aria-label="${M.sigText(sig)}の響きを聴く">${sigStaff(sig, clef)}</button>
        <div class="key-row-body"><span class="key-row-sig">${M.sigText(sig)}${enh}</span><div class="key-row-keys">${kbtn(maj)}${kbtn(min)}</div></div>`;
      row.querySelector('.key-row-staff').addEventListener('click', () => { Sound.stop(); playCadence(maj); });
      row.querySelectorAll('.key-btn').forEach((b) => b.addEventListener('click', () => openKey(b.dataset.key)));
      rows.appendChild(row);
    });

    // 早見表
    const t = $('#keyTable');
    t.className = 'name-table key-table';
    t.innerHTML = `<thead><tr><th>調号</th><th>長調</th><th>短調</th><th>長調の主音の見つけ方</th></tr></thead><tbody>${SIG_ORDER.map((sig) => {
      const maj = M.keyOf(sig, 'major'), min = M.keyOf(sig, 'minor');
      const n = Math.abs(sig);
      const how = sig === 0 ? '—' : sig > 0 ? `最後の♯ ${nmD({ l: M.SHARP_ORDER[n - 1], a: 1 })} の上` : sig === -1 ? '♭1つはヘ' : `右から2番目 ${nmD({ l: M.FLAT_ORDER[n - 2], a: -1 })}`;
      return `<tr><th>${sigShort(sig)}</th><td class="k maj" data-key="${maj.id}">${kn(maj)}<small>${tn(maj)}</small></td><td class="k min" data-key="${min.id}">${kn(min)}<small>${tn(min)}</small></td><td>${how}</td></tr>`;
    }).join('')}</tbody>`;
    t.querySelectorAll('td.k').forEach((td) => td.addEventListener('click', () => openKey(td.dataset.key)));
  }

  // ---------- 五度圏 ----------
  function renderCircle() {
    const C = 200, R1 = 176, R2 = 120, R3 = 68;
    const pos = (i, r) => { const a = ((i * 30 - 90) * Math.PI) / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
    const arc = (i, r0, r1) => {
      const a0 = ((i * 30 - 105) * Math.PI) / 180, a1 = ((i * 30 - 75) * Math.PI) / 180;
      const p = (r, a) => `${(C + r * Math.cos(a)).toFixed(2)},${(C + r * Math.sin(a)).toFixed(2)}`;
      return `M${p(r1, a0)} A${r1},${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 0 0 ${p(r0, a0)}Z`;
    };
    const sel = M.key(settings.circleSel);
    const r = M.related(sel);
    const cls = (k) => {
      const ids = (x) => [x.id, ...(Math.abs(x.sig) >= 5 ? [M.keyOf(x.sig - 12 * Math.sign(x.sig), x.mode).id] : [])];
      if (ids(sel).includes(k.id)) return ' sel';
      if (ids(r.relative).includes(k.id)) return ' r-rel';
      if (ids(r.dominant).includes(k.id)) return ' r-dom';
      if (ids(r.subdominant).includes(k.id)) return ' r-sub';
      if (ids(r.parallel).includes(k.id)) return ' r-par';
      return '';
    };
    const sysShort = (k) => {
      const s = settings.ksys;
      if (s === 'en') return M.LETTERS[k.l] + ({ 1: '♯', '-1': '♭', 0: '' })[k.a] + (k.minor ? 'm' : '');
      if (s === 'de') { const n = M.name({ l: k.l, a: k.a }, 'de'); return k.minor ? n.toLowerCase() : n; }
      if (s === 'doremi') return M.tonicName(k, 'doremi');
      return M.tonicName(k, 'haniho');
    };
    let svg = `<svg viewBox="0 0 400 400" role="img" aria-label="五度圏">`;
    for (let i = 0; i < 12; i++) {
      const sig = i <= 6 ? i : i - 12;
      [['major', R2, R1, 0], ['minor', R3, R2, 0]].forEach(([mode, r0, r1]) => {
        const k = M.keyOf(sig, mode);
        const alt = i >= 5 && i <= 7 ? M.keyOf(sig - 12 * Math.sign(sig || 1), mode) : null;
        const [x, y] = pos(i, (r0 + r1) / 2);
        const big = mode === 'major' ? 17 : 14;
        let txt;
        if (alt && Math.abs(alt.sig) <= 7) {
          txt = `<text x="${x}" y="${y - 3}" font-size="${big - 3}">${sysShort(k)}</text><text class="sub" x="${x}" y="${y + big - 4}" font-size="${big - 5}">${sysShort(alt)}</text>`;
        } else {
          txt = `<text x="${x}" y="${y + big / 3}" font-size="${big}">${sysShort(k)}</text>`;
        }
        svg += `<g class="cof-seg ${mode}${cls(k)}${alt ? cls(alt) : ''}" data-key="${k.id}" tabindex="0" role="button" aria-label="${kn(k)}"><path d="${arc(i, r0, r1)}"/>${txt}</g>`;
      });
      const [sx, sy] = pos(i, R1 + 13);
      svg += `<text class="cof-sig" x="${sx}" y="${sy + 4}">${i === 6 ? '♯6/♭6' : i === 5 ? '♯5/♭7' : i === 7 ? '♭5/♯7' : sigShort(sig).replace('調号なし', '0')}</text>`;
    }
    svg += `<text class="cof-center" x="${C}" y="${C - 4}" font-size="15">Circle</text><text class="cof-center" x="${C}" y="${C + 14}" font-size="15">of Fifths</text></svg>`;
    const box = $('#circleBox');
    box.innerHTML = svg;
    box.querySelectorAll('.cof-seg').forEach((g) => {
      const go = () => { settings.circleSel = g.dataset.key; saveSettings(); renderCircle(); Sound.stop(); playCadence(M.key(g.dataset.key)); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });

    // 右のパネル
    const enh = Math.abs(sel.sig) >= 5 ? M.keyOf(sel.sig - 12 * Math.sign(sel.sig), sel.mode) : null;
    const li = (sw, label, k, note) => `<li><span class="sw ${sw}"></span><small>${label}</small><button type="button" data-key="${k.id}">${kn(k)}</button><small>${note || ''}</small></li>`;
    $('#circlePanel').innerHTML = `
      ${modeTag(sel)}
      <h3 class="ks-name">${kn(sel)}</h3>
      <p class="ks-names"><span>${M.sigText(sel.sig)}</span>${enh ? `<span>同じ音：<b>${kn(enh)}</b></span>` : ''}</p>
      ${sigStaff(sel.sig, settings.listClef)}
      <div class="cp-actions">${playBtn('和音', 'c-cad')}${playBtn('音階', 'c-scale')}<button class="btn ghost small" type="button" id="cpMore" style="margin-top:0">詳しく</button></div>
      <ul class="cp-rel">
        ${li('sw-rel', '平行調', r.relative)}
        ${li('sw-dom', '属調', r.dominant, '右どなり')}
        ${li('sw-dom', '下属調', r.subdominant, '左どなり')}
        ${li('sw-par', '同主調', r.parallel, r.parallelEnh ? '（異名同音）' : '')}
      </ul>`;
    const p = $('#circlePanel');
    p.querySelector('.c-cad').addEventListener('click', () => { Sound.stop(); playCadence(sel); });
    p.querySelector('.c-scale').addEventListener('click', () => { Sound.stop(); playScale(M.scale(sel, sel.minor ? 'harmonic' : 'major', 4)); });
    p.querySelector('#cpMore').addEventListener('click', () => openKey(sel.id));
    p.querySelectorAll('.cp-rel button').forEach((b) => b.addEventListener('click', () => { settings.circleSel = b.dataset.key; saveSettings(); renderCircle(); Sound.stop(); playCadence(M.key(b.dataset.key)); }));
    $('#circleLegend').innerHTML = '<span><i class="sw-sel"></i>選んだ調</span><span><i class="sw-rel"></i>平行調</span><span><i class="sw-dom"></i>属調・下属調</span><span><i class="sw-par"></i>同主調</span><span>外側：長調　内側：短調</span>';
  }

  // ---------- 学ぶ ----------
  const MODE_DEMO = [
    { kind: 'major', vamp: [0, 4], d: '明るく安定した、いちばん基本の音階。', g: '町・フィールド・勝利' },
    { kind: 'natural', vamp: [0, 6], d: '素朴で、少しあいまいな暗さ。', g: '切ない場面・荒野' },
    { kind: 'harmonic', vamp: [0, 4], d: '7番目を上げた短音階。終わった感じが強く、異国風の響きも。', g: '砂漠・古代遺跡・ボス' },
    { kind: 'dorian', vamp: [0, 3], d: '短調の6番目を半音上げた音階。暗すぎず、凛とした響き。', g: 'ケルト風・旅・フィールド' },
    { kind: 'phrygian', vamp: [0, 1], d: '短調の2番目を半音下げた音階。緊張感があり、スペイン風にも。', g: '敵地・不穏・情熱' },
    { kind: 'lydian', vamp: [0, 1], d: '長調の4番目を半音上げた音階。ふわっと浮いた、夢のような明るさ。', g: '空・宇宙・ファンタジー' },
    { kind: 'mixolydian', vamp: [0, 6], d: '長調の7番目を半音下げた音階。明るいけれど、ちょっとワイルド。', g: '海賊・冒険・ロック' }
  ];
  const SCENES = [
    ['タイトル画面', '長調（壮大）／短調（謎めいた）', 'ニ長調・変ホ長調・ニ短調', 'ゆったり。物語の第一印象を決める'],
    ['町・村', '長調', 'ヘ長調・ト長調・ハ長調', '中くらいのテンポ。木管や撥弦楽器の音色'],
    ['フィールド', '長調／ドリア旋法', 'ト長調・ニ長調・イ長調', '歩く速さ〜やや速め。のびやかな旋律'],
    ['ダンジョン', '短調', 'イ短調・ホ短調・ニ短調', 'ゆっくり。低音と短い音型のくり返し'],
    ['通常の戦闘', '短調（長調も多い）', 'ホ短調・イ短調・ト短調', '速め。リズムを強く'],
    ['ボス戦', '短調', 'ニ短調・ハ短調・ト短調', '速く重く。和声的短音階やオルガン・低音で迫力'],
    ['勝利・ファンファーレ', '長調', 'ハ長調・ニ長調・変ロ長調', '短く。最後は主和音でしっかり終わる'],
    ['ゲームオーバー', '短調', 'ニ短調・ハ短調', 'ゆっくり下がっていくメロディー'],
    ['悲しい場面・回想', '短調', 'ロ短調・ヘ短調・嬰ハ短調', 'ゆっくり。ピアノや弦の音色'],
    ['エンディング', '長調', '変イ長調・変ニ長調・ニ長調', 'あたたかく。最後に同主調や転調で高揚させても']
  ];
  let learnBuilt = false;
  function renderLearn() {
    const view = $('#view-learn');
    $('#learnToc').innerHTML = [...view.querySelectorAll('h3[id]')].map((h) => `<a href="#${h.id}">${h.textContent}</a>`).join('');
    $('#learnToc').querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(a.getAttribute('href').slice(1)).scrollIntoView({ behavior: 'smooth' });
    }));
    $('#sceneList').innerHTML = SCENES.map((x) => `<div class="scene"><b>${x[0]}</b><span class="scene-mode">${x[1]}</span><span class="scene-keys">${x[2]}</span><span class="scene-tip">${x[3]}</span></div>`).join('');
    view.querySelectorAll('.demo').forEach(renderDemo);
    learnBuilt = true;
  }

  function demoCard(svg, caption, buttons) {
    return `<div class="demo-card"><div class="ks-cap"><b>${caption}</b><span>${buttons}</span></div>${svg}</div>`;
  }
  function renderDemo(box) {
    const type = box.dataset.demo;
    const clef = 'treble';
    if (type === 'scale') {
      const k = M.key(box.dataset.key);
      const s = scaleStaff(k, clef, null, { nosig: !!box.dataset.nosig });
      box.innerHTML = demoCard(s.svg, `${kn(k)}の音階${box.dataset.nosig ? '（調号なしで書いた場合）' : ''}`, playBtn('聴く'));
      box.querySelector('.play-btn').onclick = () => { Sound.stop(); playScale(s.notes); };
    } else if (type === 'compare') {
      const ks = [M.key('C'), M.key('Cm')];
      box.innerHTML = `<div class="demo-grid">${ks.map((k) => {
        const tri = M.triad(k, 0, 4);
        const svg = M.staffSVG({ clef, sig: null, items: [...M.scale(k, 'natural', 4).slice(0, 3).map((n) => ({ n, whole: true })), ...tri.map((n, i) => ({ n, whole: true, chord: i > 0, bar: i === 0 }))], width: 200, span: [-2, 9] });
        return demoCard(svg, `${kn(k)}：ド・レ・${nmD(tri[1])}`, playBtn('聴く'));
      }).join('')}</div>`;
      box.querySelectorAll('.play-btn').forEach((b, i) => { b.onclick = () => { Sound.stop(); const k = ks[i]; const sc = M.scale(k, 'natural', 4).slice(0, 3); const end = playScale(sc); playChordNotes(M.triad(k, 0, 4), end + 0.1, 1.6); }; });
    } else if (type === 'melody') {
      const ks = [M.key('C'), M.key('Cm')];
      box.innerHTML = `<div class="demo-grid">${ks.map((k) => {
        const notes = degNotes(k, FROG, 4, 'natural');
        const svg = M.staffSVG({ clef, sig: k.sig, items: notes.map((n, i) => ({ n, bar: i === 7 })), width: M.sigWidth(k.sig) + notes.length * 22, span: [-2, 9], end: 'final' });
        return demoCard(svg, `かえるの合唱（ドイツ民謡）を${kn(k)}で`, playBtn('聴く'));
      }).join('')}</div>`;
      box.querySelectorAll('.play-btn').forEach((b, i) => { b.onclick = () => { Sound.stop(); playScale(degNotes(ks[i], FROG, 4, 'natural')); }; });
    } else if (type === 'sigorder') {
      box.innerHTML = `<div class="demo-grid">${[7, -7].map((sig) => demoCard(sigStaff(sig, clef, { extra: 10 }), sig > 0 ? '♯：ファ・ド・ソ・レ・ラ・ミ・シ' : '♭：シ・ミ・ラ・レ・ソ・ド・ファ', '')).join('')}</div>`;
    } else if (type === 'pair') {
      const sig = +box.dataset.sig;
      const ks = [M.keyOf(sig, 'major'), M.keyOf(sig, 'minor')];
      box.innerHTML = `<div class="demo-grid">${ks.map((k) => {
        const s = scaleStaff(k, clef);
        return demoCard(s.svg, `${kn(k)}（${tn(k)}が主音）`, playBtn('音階') + ' ' + playBtn('和音'));
      }).join('')}</div>`;
      box.querySelectorAll('.demo-card').forEach((card, i) => {
        const [b1, b2] = card.querySelectorAll('.play-btn');
        b1.onclick = () => { Sound.stop(); playScale(M.scale(ks[i], null, M.homeOct(ks[i], clef))); };
        b2.onclick = () => { Sound.stop(); playCadence(ks[i]); };
      });
    } else if (type === 'lead') {
      const k = M.key(box.dataset.key);
      const rel = M.related(k).relative;
      const pat = PHRASES[0];
      box.innerHTML = `<div class="demo-grid">${[rel, k].map((x) => demoCard(phraseStaff(x, clef, pat, { final: true, barAt: 4, mark: true }).svg, `${kn(x)}のメロディー`, playBtn('聴く'))).join('')}</div>
        <p class="hint">同じ調号（調号なし）でも、イ短調ではソ♯（導音）が臨時記号で出てきて、最後はラで終わります。</p>`;
      box.querySelectorAll('.play-btn').forEach((b, i) => { const x = [rel, k][i]; b.onclick = () => { Sound.stop(); playPhrase(x, degNotes(x, pat, phraseOct(x, clef))); }; });
    } else if (type === 'minors') {
      const k = M.key(box.dataset.key);
      box.innerHTML = ['natural', 'harmonic', 'melodic'].map((kind) => {
        const s = scaleStaff(k, clef, kind);
        return `<div class="demo-card" data-kind="${kind}"><div class="ks-cap"><b>${M.SCALES[kind].label}</b>${playBtn('聴く')}</div>${s.svg}</div>`;
      }).join('');
      box.querySelectorAll('.demo-card').forEach((card) => {
        card.querySelector('.play-btn').onclick = () => {
          Sound.stop();
          const kind = card.dataset.kind;
          const end = playScale(M.scale(k, kind, 4));
          if (kind === 'melodic') playScale(M.scale(k, 'natural', 4).reverse().slice(1), end);
        };
      });
    } else if (type === 'modes') {
      box.innerHTML = `<div class="demo-modes">${MODE_DEMO.map((m) => `<div class="demo-mode" data-kind="${m.kind}"><b>${M.SCALES[m.kind].label}</b><p>${m.d}<br><span class="hint-inline">使いどころの例：${m.g}</span></p><div class="row">${playBtn('音階')}${playBtn('和音の行き来')}</div></div>`).join('')}</div>
        <p class="hint">どれもドを主音にしています。長音階・自然短音階との違い（半音上げ下げした音）に注目して聴きくらべてみましょう。</p>`;
      box.querySelectorAll('.demo-mode').forEach((card) => {
        const m = MODE_DEMO.find((x) => x.kind === card.dataset.kind);
        const base = M.key(M.SCALES[m.kind].base === 'minor' ? 'Cm' : 'C');
        const [b1, b2] = card.querySelectorAll('.play-btn');
        b1.onclick = () => { Sound.stop(); playScale(M.scale(base, m.kind, 4)); };
        b2.onclick = () => {
          Sound.stop();
          const sc = M.scale(base, m.kind, 3);
          const tri = (d) => [0, 2, 4].map((x) => sc[(d + x) % 7]);
          let prev = null;
          const g = gap() * 2.4;
          [0, 1, 0, 1, 0].forEach((j, i) => {
            const d = m.vamp[j];
            const t = tri(d);
            const v = M.voicing(t.map((n) => ((n.midi % 12) + 12) % 12), prev);
            prev = v;
            let bass = t[0].midi;
            while (bass >= 55) bass -= 12;
            while (bass < 40) bass += 12;
            M.playChord([bass, ...v], i * g, i === 4 ? g * 1.6 : g * 0.95);
          });
        };
      });
    }
  }

  // ---------- 記録 ----------
  function renderRecord() {
    const today = days[dayKey()] || { a: 0, c: 0 };
    const total = Object.values(days).reduce((acc, d) => ({ a: acc.a + d.a, c: acc.c + d.c }), { a: 0, c: 0 });
    const nDays = Object.values(days).filter((d) => d.a > 0).length;
    $('#recTiles').innerHTML = `
      <div class="tile"><span class="tile-v">${streak()}<small>日</small></span><span class="tile-k">連続で練習</span></div>
      <div class="tile"><span class="tile-v">${today.a}<small>問</small></span><span class="tile-k">今日${today.a ? `（正答率 ${pct(today)}%）` : ''}</span></div>
      <div class="tile"><span class="tile-v">${total.a}<small>問</small></span><span class="tile-k">これまで（${nDays}日・正答率 ${total.a ? pct(total) + '%' : '—'}）</span></div>`;

    const bars = $('#recBars');
    const list = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); list.push(d); }
    const max = Math.max(+settings.goal, ...list.map((d) => (days[dayKey(d)] || { a: 0 }).a));
    bars.innerHTML = list.map((d) => {
      const v = days[dayKey(d)] || { a: 0, c: 0 };
      const h = (100 * v.a) / max, hc = (100 * v.c) / max;
      const wd = '日月火水木金土'[d.getDay()];
      return `<div class="bar${dayKey(d) === dayKey() ? ' is-today' : ''}" title="${d.getMonth() + 1}/${d.getDate()}：${v.a}問（正解 ${v.c}）">
        <div class="bar-col"><span class="bar-all" style="height:${h}%"></span><span class="bar-ok" style="height:${hc}%"></span></div>
        <span class="bar-v">${v.a || ''}</span><span class="bar-d">${d.getDate()}<small>${wd}</small></span></div>`;
    }).join('');
    bars.style.setProperty('--goal', (100 * settings.goal) / max + '%');

    // 苦手な調
    const weak = Object.entries(stats)
      .filter(([id, s]) => M.key(id) && s.a >= 3 && s.c < s.a)
      .map(([id, s]) => ({ k: M.key(id), s, p: s.c / s.a }))
      .sort((a, b) => a.p - b.p || b.s.a - a.s.a)
      .slice(0, 8);
    const w = $('#recWeak');
    w.innerHTML = weak.length ? '' : '<p class="hint">3回以上出題されて、間違えたことのある調がここに並びます。</p>';
    if (weak.length) {
      const g = el('div', 'weak-list');
      weak.forEach((x) => {
        const b = el('button', 'weak');
        b.type = 'button';
        b.innerHTML = `${sigStaff(x.k.sig, settings.listClef)}<span class="weak-body"><b>${kn(x.k)}</b> <small>${M.sigText(x.k.sig, 'doremi', false)}</small><span class="weak-p">正答率 ${Math.round(x.p * 100)}%（${x.s.c}/${x.s.a}）</span></span>`;
        b.addEventListener('click', () => openKey(x.k.id));
        g.appendChild(b);
      });
      w.appendChild(g);
      const btn = el('button', 'btn small', '苦手な調を「手がかり」で練習する');
      btn.type = 'button';
      btn.addEventListener('click', () => {
        const listQ = [];
        while (listQ.length < 10) listQ.push(...shuffle(weak.map((x) => ({ key: x.k.id, clef: pickClef(), clue: pick(settings.clues) }))));
        startQuiz('clue', listQ.slice(0, 10));
      });
      w.appendChild(btn);
    }

    // 調ごとの正答率
    const heat = $('#recHeat');
    heat.innerHTML = '';
    [['調号なし・♯の調', [0, 1, 2, 3, 4, 5, 6, 7]], ['♭の調', [-1, -2, -3, -4, -5, -6, -7]]].forEach(([title, sigs]) => {
      heat.appendChild(el('p', 'heat-group', title));
      sigs.forEach((sig) => ['major', 'minor'].forEach((mode) => {
        const k = M.keyOf(sig, mode);
        const s = stats[k.id];
        const p = pct(s);
        const c = el('button', 'heat-cell');
        c.type = 'button';
        c.dataset.lvl = p == null ? 'none' : p >= 90 ? 'g4' : p >= 75 ? 'g3' : p >= 50 ? 'g2' : 'g1';
        c.innerHTML = `<b class="${k.minor ? 'min' : 'maj'}">${kn(k)}</b><span>${p == null ? '—' : `${p}%（${s.c}/${s.a}）`}</span>`;
        c.addEventListener('click', () => openKey(k.id));
        heat.appendChild(c);
      }));
    });
  }
  $('#resetStats').addEventListener('click', () => {
    if (!confirm('正答率と練習した日の記録をすべて消します。よろしいですか？')) return;
    stats = {}; days = {};
    store.set('stats', stats); store.set('days', days);
    renderRecord();
  });

  // ---------- install (PWA) ----------
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; $('#installBtn').hidden = false; });
  $('#installBtn').addEventListener('click', async () => {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice;
    installEvt = null;
    $('#installBtn').hidden = true;
  });
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  // ---------- 記号のフォントが届いたら描き直す ----------
  function redraw() {
    M.resetMetrics();
    if (current === 'keys') renderKeys();
    if (current === 'circle') renderCircle();
    if (current === 'learn' || learnBuilt) renderLearn();
    if (current === 'record') renderRecord();
    if (current === 'listen') renderListen();
    if (quiz && quiz.q && !quiz.q.answered) renderQuestion();
  }
  if (document.fonts && document.fonts.load) {
    document.fonts.load('40px "Noto Music"', '\u{1D11E}\u{1D122}').then(redraw).catch(() => {});
  }

  // ---------- start ----------
  initSettings();
  initListenOptions();
  show(current);
})();
