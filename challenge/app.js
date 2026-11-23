(() => {
  'use strict';
  const GAS_EXEC_URL = 'https://script.google.com/macros/s/AKfycbxfQVAGf79pvIgcSy5_MyfU4jjsQDdTYxQaT2eQj0qHs-YBajlebQNaEuhfq14MGN5r/exec';
  const SESSION_TOKEN_KEY = 'christmas-creative-challenge:2026:session-token';
  const SESSION_CODE_KEY = 'christmas-creative-challenge:2026:session-code';
  const LANG_KEY = 'christmas-creative-challenge:2026:lang';
  const CLIENT_ID_KEY = 'christmas-creative-challenge:2026:client-id';
  const PREFILL_ID_KEY = 'christmas_challenge_prefill_id';

  const C = window.Challenge;
  const assetVersion = document.querySelector('meta[name="application-version"]')?.content || 'prod-ch-v1';
  const assetUrl = path => `${path}?v=${encodeURIComponent(assetVersion)}`;
  const app = document.querySelector('#app');
  const dialog = document.querySelector('#day-preview');
  const reveal = document.querySelector('#gift-reveal');
  const modebarEl = document.querySelector('#modebar-el');
  const userBadgeEl = document.querySelector('#user-badge');
  const logoutBtnEl = document.querySelector('#logout-btn');
  const langToggleBtnEl = document.querySelector('#lang-toggle-btn');
  const motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: true };

  const storage = {
    getItem: key => { try { return window.localStorage.getItem(key); } catch { return null; } },
    setItem: (key, value) => { try { window.localStorage.setItem(key, value); return true; } catch { return false; } },
    removeItem: key => { try { window.localStorage.removeItem(key); } catch {} }
  };

  // Clean up any legacy debug/preview URL parameters so production cannot bypass date restrictions
  const initParams = new URLSearchParams(location.search);
  let initialPrefillId = initParams.get('id') || '';
  if (!initialPrefillId) {
    try {
      initialPrefillId = window.sessionStorage.getItem(PREFILL_ID_KEY) || '';
    } catch {}
  }
  const urlLang = initParams.get('lang');
  let lang = (urlLang === 'zh' || urlLang === 'en')
    ? urlLang
    : (storage.getItem(LANG_KEY) === 'zh' ? 'zh' : 'en');
  storage.setItem(LANG_KEY, lang);

  if (initParams.has('preview') || initParams.has('v') || initParams.has('full22') || initParams.has('id')) {
    const cleanUrl = new URL(location.href);
    cleanUrl.searchParams.delete('preview');
    cleanUrl.searchParams.delete('v');
    cleanUrl.searchParams.delete('full22');
    cleanUrl.searchParams.delete('id');
    history.replaceState(null, '', cleanUrl);
  }

  const I18N = {
    en: {
      brandTitle: 'Christmas Creative Challenge',
      skipLink: 'Skip to the gifts',
      switchLang: '中文',
      switchId: 'Switch ID',
      eventMode: 'Event mode',
      eventNote: 'Gifts unlock each day at midnight (New York time).',
      footer1: 'Progress stays in this browser for your Registration ID. It does not sync across devices.',
      footer2: '“I\'m done” is your own local check-in. It does not equal teacher review or automatically award event points.',
      gateBadge: 'DECEMBER 1–22, 2026',
      gateTitle: '🎄 Christmas Creative Challenge',
      gateSub: 'Enter your official Registration ID to access the 22-day challenge calendar.',
      gateLabel: 'Registration ID',
      gatePlaceholder: 'e.g. Ch004',
      gateSubmit: 'Enter Challenge',
      gateSubmitting: 'Verifying…',
      gateInvalid: 'Invalid registration ID. Please check your ID or register first.',
      gateSessionExpired: 'Your session has expired. Please enter your Registration ID again.',
      gateRateLimited: 'Too many attempts. Please wait a minute and try again.',
      gateRegisterPrompt: 'Not registered yet? ',
      gateRegisterLinkText: 'Register now',
      gateRegisterHref: '../',
      backToGifts: 'Back to Gifts',
      countdownBeforeDec: (serverDate) => `Countdown to December 1: Gifts begin unlocking on Dec 1, 2026 at midnight (New York time). Current server date: ${serverDate}.`,
      lockedState: 'Locked',
      doneState: 'Done',
      openAgainState: 'Open again',
      unwrapState: 'Unwrap me',
      howItWorksLink: 'How it works & prizes',
      daysDoneSuffix: ' / 22 days done',
      calendarHeadingEyebrow: 'Something to look forward to',
      calendarHeadingTitle: 'Your gift calendar',
      calendarNote: 'A new gift opens each day. Earlier gifts stay open.',
      imDoneBtn: 'I\'m done',
      youDidIt: 'You did it!',
      bonusBtn: 'Bonus Challenge',
      undoBtn: 'Mark as not done',
      letsCreate: 'Let’s Create!',
      giveHint: 'Give Me a Hint',
      hideHints: 'Hide Hints',
      showMeHow: 'Show me how',
      moreHelp: 'A little more help',
      earlyTitle: 'A little early!',
      earlyBody: (d) => `Day ${d} opens December ${d}, 2026 at midnight in New York.`,
      previewDialogDate: (d) => `December ${d}, 2026`,
      previewDialogDesc: (d) => `This gift opens December ${d}, 2026 at midnight in New York.`,
      previewDialogNotice: 'This gift opens on its December date.'
    },
    zh: {
      brandTitle: '圣诞创意挑战',
      skipLink: '跳转到挑战日历',
      switchLang: 'English',
      switchId: '切换编号 / 退出',
      eventMode: '正式活动模式',
      eventNote: '每日礼盒于纽约时间午夜 00:00 自动解锁。',
      footer1: '打卡进度仅保存在当前浏览器的该报名编号下，不同设备之间不会自动同步。',
      footer2: '点击“我完成了”仅代表本地自我打卡，不等于老师审核通过，也不会自动获得活动积分。',
      gateBadge: '2026年12月1日至22日',
      gateTitle: '🎄 圣诞创意挑战',
      gateSub: '请输入你的正式报名编号，进入 22 天圣诞创意挑战日历。',
      gateLabel: '报名编号',
      gatePlaceholder: '例如 Ch004',
      gateSubmit: '进入挑战',
      gateSubmitting: '正在验证……',
      gateInvalid: '编号无效，请检查或先报名。',
      gateSessionExpired: '登录会话已过期，请重新输入你的报名编号。',
      gateRateLimited: '尝试次数过多，请稍候一分钟再试。',
      gateRegisterPrompt: '尚未报名？',
      gateRegisterLinkText: '立即报名',
      gateRegisterHref: '../zh/',
      backToGifts: '返回礼盒日历',
      countdownBeforeDec: (serverDate) => `距离 12 月 1 日挑战开启还有倒计时：第 1 天礼盒将于纽约时间 2026 年 12 月 1 日午夜解锁（当前服务器日期：${serverDate}）。`,
      lockedState: '未解锁',
      doneState: '已完成',
      openAgainState: '再次打开',
      unwrapState: '拆开礼盒',
      howItWorksLink: '活动规则与奖项说明',
      daysDoneSuffix: ' / 22 天已完成',
      calendarHeadingEyebrow: '每天一份创意惊喜',
      calendarHeadingTitle: '你的圣诞礼盒日历',
      calendarNote: '每天解锁一个新礼盒，已解锁的礼盒可随时回看。',
      imDoneBtn: '我完成了 (I\'m done)',
      youDidIt: '太棒了，你完成了今日挑战！',
      bonusBtn: '加码挑战 (Bonus)',
      undoBtn: '取消完成标记',
      letsCreate: '开始创作 (Let’s Create!)',
      giveHint: '给我一点提示',
      hideHints: '收起提示',
      showMeHow: '看看怎么做',
      moreHelp: '更多分步提示',
      earlyTitle: '还没到解锁时间哦！',
      earlyBody: (d) => `第 ${d} 天挑战将于纽约时间 2026 年 12 月 ${d} 日午夜 00:00 解锁。`,
      previewDialogDate: (d) => `2026年12月${d}日`,
      previewDialogDesc: (d) => `该礼盒将于纽约时间 2026 年 12 月 ${d} 日午夜 00:00 解锁。`,
      previewDialogNotice: '请在该日期到达后再来拆开这份礼盒。'
    }
  };

  const t = () => I18N[lang] || I18N.en;

  function getClientId() {
    let cid = storage.getItem(CLIENT_ID_KEY);
    if (!cid) {
      cid = 'cid_' + Math.random().toString(36).slice(2, 12) + '_' + Date.now().toString(36);
      storage.setItem(CLIENT_ID_KEY, cid);
    }
    return cid;
  }

  // Client-side pre-normalization: trim whitespace and format ch004 / CH004 / Ch004 / H004 -> Ch004
  function normalizeDisplayInput(raw) {
    const trimmed = String(raw || '').trim();
    const match = /^(?:ch|h)(\d+)$/i.exec(trimmed);
    if (!match) return trimmed;
    const num = parseInt(match[1], 10);
    if (isNaN(num) || num <= 0) return trimmed;
    return 'Ch' + String(num).padStart(3, '0');
  }

  let sessionToken = storage.getItem(SESSION_TOKEN_KEY) || '';
  let activeCode = storage.getItem(SESSION_CODE_KEY) || '';
  let serverDays = [];
  let serverDate = '2026-11-23';
  let isAuthenticated = false;
  let isCheckingSession = false;
  let gateNoticeMessage = '';

  let progress = { days: {}, error: false };
  let opened = { days: {}, error: false };
  let hint = 0;
  let bonus = false;
  let revealTimer = null;
  let celebrationTimer = null;
  let pendingDay = null;

  const builtDay = day => serverDays.find(item => item.day === day);
  const currentDay = () => Number(/^#day\/([1-9]|1\d|2[0-2])$/.exec(location.hash)?.[1]);
  const canOpen = (day = currentDay()) => {
    const item = builtDay(day);
    return Boolean(isAuthenticated && item && item.unlocked === true && Array.isArray(item.task));
  };
  const isDone = day => Boolean(isAuthenticated && activeCode && progress.days[day] === true);
  const isOpened = day => Boolean(isAuthenticated && activeCode && (opened.days[day] === true || isDone(day)));

  function loadUserLocalState(code) {
    if (!code) {
      progress = { days: {}, error: false };
      opened = { days: {}, error: false };
      return;
    }
    progress = C.readAllProgress(storage, code);
    opened = C.readAllOpened(storage, code);
  }

  function clearSession(noticeMsg = '') {
    cancelReveal();
    isAuthenticated = false;
    sessionToken = '';
    activeCode = '';
    serverDays = [];
    progress = { days: {}, error: false };
    opened = { days: {}, error: false };
    storage.removeItem(SESSION_TOKEN_KEY);
    storage.removeItem(SESSION_CODE_KEY);
    gateNoticeMessage = noticeMsg;
  }

  function updateChromeText() {
    const copy = t();
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelector('#brand-title').textContent = copy.brandTitle;
    document.querySelector('#skip-link-el').textContent = copy.skipLink;
    langToggleBtnEl.textContent = copy.switchLang;
    logoutBtnEl.textContent = copy.switchId;
    document.querySelector('#mode-label').textContent = copy.eventMode;
    document.querySelector('#mode-note').textContent = copy.eventNote;
    document.querySelector('#footer-line-1').textContent = copy.footer1;
    document.querySelector('#footer-line-2').textContent = copy.footer2;
    document.querySelector('#close-preview').textContent = copy.backToGifts;

    if (isAuthenticated && activeCode) {
      userBadgeEl.textContent = 'ID: ' + activeCode;
      userBadgeEl.hidden = false;
      logoutBtnEl.hidden = false;
      modebarEl.hidden = false;
    } else {
      userBadgeEl.textContent = '';
      userBadgeEl.hidden = true;
      logoutBtnEl.hidden = true;
      modebarEl.hidden = true;
    }
  }

  function renderGate() {
    updateChromeText();
    const copy = t();
    document.title = copy.brandTitle;
    const prefill = initialPrefillId ? normalizeDisplayInput(initialPrefillId) : '';

    app.innerHTML = `
      <section class="gate-wrap" aria-labelledby="gate-heading">
        <span class="eyebrow" id="gate-badge"></span>
        <h1 id="gate-heading"></h1>
        <p class="gate-sub" id="gate-sub"></p>
        <form id="gate-form" novalidate>
          <div class="gate-field">
            <label for="gate-code-input" id="gate-label"></label>
            <input
              type="text"
              id="gate-code-input"
              name="code"
              maxlength="20"
              autocomplete="off"
              required
            />
          </div>
          <button type="submit" id="gate-submit-btn" class="gate-submit"></button>
        </form>
        <div id="gate-error-box" class="gate-error" role="alert"></div>
        <p class="gate-register-link">
          <span id="gate-reg-prompt"></span>
          <a id="gate-reg-link" href="../"></a>
        </p>
      </section>
    `;

    document.querySelector('#gate-badge').textContent = copy.gateBadge;
    document.querySelector('#gate-heading').textContent = copy.gateTitle;
    document.querySelector('#gate-sub').textContent = copy.gateSub;
    document.querySelector('#gate-label').textContent = copy.gateLabel;
    const inputEl = document.querySelector('#gate-code-input');
    inputEl.placeholder = copy.gatePlaceholder;
    if (prefill) {
      inputEl.value = prefill;
    }
    const submitBtnEl = document.querySelector('#gate-submit-btn');
    submitBtnEl.textContent = copy.gateSubmit;
    document.querySelector('#gate-reg-prompt').textContent = copy.gateRegisterPrompt;
    const regLinkEl = document.querySelector('#gate-reg-link');
    regLinkEl.textContent = copy.gateRegisterLinkText;
    regLinkEl.href = copy.gateRegisterHref;

    const errBox = document.querySelector('#gate-error-box');
    if (gateNoticeMessage) {
      errBox.textContent = gateNoticeMessage;
      errBox.style.display = 'block';
    }

    const formEl = document.querySelector('#gate-form');
    formEl.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (isCheckingSession) return;
      const rawVal = inputEl.value.trim();
      if (!rawVal) {
        errBox.textContent = copy.gateInvalid;
        errBox.style.display = 'block';
        inputEl.focus();
        return;
      }
      const normalizedPreview = normalizeDisplayInput(rawVal);
      inputEl.value = normalizedPreview;

      isCheckingSession = true;
      submitBtnEl.disabled = true;
      inputEl.disabled = true;
      submitBtnEl.textContent = copy.gateSubmitting;
      errBox.style.display = 'none';

      try {
        const resp = await fetch(GAS_EXEC_URL, {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'verify',
            code: rawVal,
            clientId: getClientId()
          })
        });
        const data = await resp.json();
        isCheckingSession = false;

        if (!data || !data.ok || !data.code || !data.sessionToken || !Array.isArray(data.days)) {
          submitBtnEl.disabled = false;
          inputEl.disabled = false;
          submitBtnEl.textContent = copy.gateSubmit;
          errBox.textContent = data && data.rateLimited ? copy.gateRateLimited : copy.gateInvalid;
          errBox.style.display = 'block';
          return;
        }

        // Valid official session established
        initialPrefillId = '';
        try { window.sessionStorage.removeItem(PREFILL_ID_KEY); } catch {}
        gateNoticeMessage = '';
        activeCode = String(data.code).trim();
        sessionToken = String(data.sessionToken).trim();
        serverDate = String(data.serverDate || '2026-11-23');
        serverDays = data.days;
        isAuthenticated = true;

        storage.setItem(SESSION_TOKEN_KEY, sessionToken);
        storage.setItem(SESSION_CODE_KEY, activeCode);
        loadUserLocalState(activeCode);
        render();
      } catch (err) {
        isCheckingSession = false;
        submitBtnEl.disabled = false;
        inputEl.disabled = false;
        submitBtnEl.textContent = copy.gateSubmit;
        errBox.textContent = copy.gateInvalid;
        errBox.style.display = 'block';
      }
    });
  }

  function rememberOpened(day) {
    if (!isAuthenticated || !activeCode) return;
    if (!opened.days[day]) {
      opened.days[day] = true;
      opened.error = !C.saveOpened(storage, activeCode, day);
    }
  }

  const warning = () => progress.error || opened.error
    ? '<p class="storage-warning" role="alert">Progress is not saved right now. Keep this page open; reloading may lose your marks.</p>'
    : '';

  function giftDrawing(day, open) {
    return `<svg class="gift-art" viewBox="0 0 160 142" aria-hidden="true" focusable="false">
    <ellipse cx="80" cy="130" rx="54" ry="6" fill="currentColor" opacity=".08"/>
    <g class="gift-body"><rect x="28" y="57" width="104" height="69" rx="7" fill="var(--wrap)"/>
    ${day%3===0?'<path d="m35 81 12-8m-8 30 12-8m60-12 12-8m-13 30 12-8" stroke="var(--pattern)" stroke-width="3" stroke-linecap="round"/>':day%3===1?'<g fill="var(--pattern)"><circle cx="41" cy="79" r="3"/><circle cx="53" cy="110" r="3"/><circle cx="112" cy="78" r="3"/><circle cx="120" cy="110" r="3"/></g>':'<path d="M29 79h102M29 108h102" stroke="var(--pattern)" stroke-width="2"/>'}
    <rect x="69" y="57" width="22" height="69" fill="var(--ribbon)"/></g>
    <g class="gift-lid" ${open?'transform="translate(4 -19) rotate(-9 80 48)"':''}><rect x="21" y="45" width="118" height="21" rx="5" fill="var(--lid)"/><path d="M69 45h22v21H69z" fill="var(--ribbon)"/><path d="M80 46C24 43 38 4 61 24c10 9 19 22 19 22Zm0 0c55-3 42-43 19-22-9 8-19 22-19 22Z" fill="var(--ribbon)" stroke="var(--bow-line)" stroke-width="1.5"/></g>
    <path d="m80 76 20 8-3 27H63l-3-27z" fill="#fff7e6" stroke="#e3cba7"/><text x="80" y="101" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="bold" fill="#294e40">${day}</text></svg>`;
  }

  function gift(day) {
    const copy = t();
    const item = builtDay(day);
    const built = Boolean(item);
    const unlocked = Boolean(item && item.unlocked === true);
    const open = built && unlocked && isOpened(day);
    const done = built && unlocked && isDone(day);
    const state = !unlocked ? copy.lockedState : done ? copy.doneState : open ? copy.openAgainState : copy.unwrapState;
    const titleStr = item ? item.title : `Day ${day}`;
    const label = `December ${day}. ${titleStr} ${state}.`;
    const inside = `<span class="gift-date">Dec ${day}</span><span class="gift-picture">${giftDrawing(day,open)}${done?'<span class="done-sticker" aria-hidden="true">✓</span>':''}${!unlocked?'<svg class="lock-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="10" width="16" height="12" rx="3" fill="currentColor"/><circle cx="12" cy="15" r="1.5" fill="#fff8e9"/></svg>':''}</span><span class="gift-status">${state}</span>`;
    const classes = `day gift gift-style-${(day-1)%4} ${built?'implemented':''} ${open?'is-open':''} ${done?'is-done':''} ${!unlocked?'is-locked':''}`;
    if (built && unlocked) return `<a class="${classes}" href="#day/${day}" data-open-gift="${day}" aria-label="${label}">${inside}</a>`;
    return `<button class="${classes}" type="button" data-locked-day="${day}" aria-label="${label}">${inside}</button>`;
  }

  function calendar() {
    const copy = t();
    document.title = copy.brandTitle;
    const countdownHtml = serverDate < '2026-12-01'
      ? `<div class="countdown-banner" role="status">${copy.countdownBeforeDec(serverDate)}</div>`
      : '';
    return `<section class="intro"><div class="intro-copy"><span class="eyebrow">${lang === 'zh' ? '2026年12月1日至22日' : 'December 1–22, 2026'}</span><h1>${lang === 'zh' ? '每天一份小礼物，<br>点亮一个<span>大创意。</span>' : 'A little gift.<br>A big <span>idea.</span>'}</h1><p>${lang === 'zh' ? '每天拆开一份圣诞创意挑战，使用 Tinkercad 和 Scratch 完成作品。' : 'Unwrap a little Christmas creativity each day.'}</p><span class="hero-tag">${lang === 'zh' ? '22项每日挑战 · 4个主题作品 · 发挥你的想象力' : '22 days · 4 creations · Your imagination'}</span></div><img class="hero-art" src="${assetUrl('assets/christmas-gifts.svg')}" alt="Three ribbon-wrapped Christmas gifts beside a little pine tree" width="540" height="340"></section>
    ${countdownHtml}
    <section aria-labelledby="calendar-title"><div class="section-heading"><div><span class="eyebrow">${copy.calendarHeadingEyebrow}</span><h2 id="calendar-title">${copy.calendarHeadingTitle}</h2></div><span class="progress-count">${Object.values(progress.days).filter(Boolean).length}${copy.daysDoneSuffix}</span></div>
    <p class="calendar-note">${copy.calendarNote} <a href="#about">${copy.howItWorksLink}</a></p>
    <div class="themes">${C.themes.map((theme,index)=>`<section class="theme theme-${index}" aria-labelledby="theme-${index}"><div class="theme-heading"><h3 id="theme-${index}">${lang === 'zh' ? theme.titleZh : theme.title}</h3><span>${theme.tool} · Dec ${theme.start}–${theme.end}</span></div><div class="days">${Array.from({length:theme.end-theme.start+1},(_,i)=>gift(theme.start+i)).join('')}</div></section>`).join('')}</div></section>`;
  }

  const escapeHtml = text => String(text || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

  function hints(challenge) {
    const copy = t();
    return `<div class="help-area"><button id="hint-button" class="secondary" type="button" aria-expanded="${hint>0}" aria-controls="hints">${hint?copy.hideHints:copy.giveHint}</button><div id="hints" ${hint===0?'hidden':''}>
    ${hint>=1?`<div class="hint"><span class="note-pin" aria-hidden="true"></span><span class="eyebrow">A little nudge</span><p>${challenge.nudge}</p></div>`:''}
    ${hint>=2?`<div class="hint"><span class="eyebrow">Try this</span><ol>${(challenge.steps||[]).map(step=>`<li>${step}</li>`).join('')}</ol></div>`:''}
    ${hint>=3?`<div class="hint"><span class="eyebrow">${challenge.helpTitle}</span><img class="help-diagram" src="${assetUrl(challenge.image)}" alt="${challenge.helpCaption}" width="340" height="290" loading="lazy"><p>${challenge.help}</p><p>${challenge.saveNote}</p>${(challenge.recipes||[]).length?`<p class="recipe-note">Block guides, not text to paste. Indented lines go inside the block above. The word end marks the bottom of a loop or if; it is not another block.</p>${challenge.recipes.map(recipe=>`<details class="recipe"><summary>${recipe.who}</summary><pre>${escapeHtml(recipe.blocks)}</pre></details>`).join('')}`:''}<details class="catchup"><summary>Missing earlier pieces?</summary><p>${challenge.catchup}</p>${challenge.catchupDay?`<a href="#day/${challenge.catchupDay}">See Day ${challenge.catchupDay} hints</a>`:''}</details></div>`:''}
    ${hint>0&&hint<3?`<button class="text-button" id="more-hint" type="button">${hint===1?copy.showMeHow:copy.moreHelp}</button>`:''}</div></div>`;
  }

  function completion(challenge) {
    const copy = t();
    if (!isDone(challenge.day)) return `<div class="completion"><button id="complete" class="complete-button" type="button">${copy.imDoneBtn}</button></div>`;
    return `<div class="completion completed"><div class="done-message" role="status"><div class="sticker-wrap"><img src="${assetUrl('assets/made-by-me.svg')}" alt="Made by me: a just-for-fun sticker" width="104" height="104">${Array.from({length:8},(_,i)=>`<i class="confetti piece-${i}" aria-hidden="true"></i>`).join('')}</div><h2>${copy.youDidIt}</h2></div><div class="next-actions"><a class="primary" id="back-to-gifts" href="#home">${copy.backToGifts}</a><button class="secondary" id="bonus-button" type="button" aria-expanded="${bonus}" aria-controls="bonus-content">${copy.bonusBtn}</button></div><p id="bonus-content" class="bonus-note" ${bonus?'':'hidden'}>${challenge.bonus}</p><button class="text-button undo" id="undo" type="button">${copy.undoBtn}</button></div>`;
  }

  function challengeView(day) {
    const copy = t();
    const data = builtDay(day);
    document.title = `Day ${day} · ${data ? data.title : ''}`;
    if (!canOpen(day)) {
      return `<section class="locked-card"><a class="back" href="#home">${copy.backToGifts}</a><img src="${assetUrl('assets/christmas-gifts.svg')}" alt="A Christmas gift waiting to be opened" width="270" height="170"><h1>${copy.earlyTitle}</h1><p>${copy.earlyBody(day)}</p></section>`;
    }
    rememberOpened(day);
    return `<section class="challenge"><a class="back" href="#home">${copy.backToGifts}</a><article class="challenge-card"><div class="card-ribbon" aria-hidden="true"></div><div class="card-heading"><span class="day-badge">Day ${day}</span><span class="card-theme">${data.continuation}</span></div><div class="challenge-main"><figure class="ornament-example"><img src="${assetUrl(data.image)}" alt="${data.alt}" width="340" height="290"><figcaption>One idea, not a rule.<br>Drawing, not a ${data.tool} screenshot.</figcaption></figure><div class="challenge-copy"><h1>${data.titleLines.join(' <br>')}</h1><p class="task">${data.task.join('<br>')}</p><a class="primary tool-link" href="${data.tool==='Scratch'?'https://scratch.mit.edu/projects/editor/':'https://www.tinkercad.com/'}" target="_blank" rel="noopener noreferrer" aria-describedby="tool-note">${copy.letsCreate}</a><p class="tool-note" id="tool-note">Opens ${data.tool==='Scratch'?'Scratch editor':'Tinkercad'} in a new tab.</p>${hints(data)}</div></div>${completion(data)}</article>${warning()}</section>`;
  }

  function about() {
    const copy = t();
    document.title = `${copy.howItWorksLink} · ${copy.brandTitle}`;
    if (lang === 'zh') {
      return `<section class="about"><a class="back" href="#home">${copy.backToGifts}</a><h1>圣诞创意挑战<br>规则与奖项说明</h1><p>2026年12月1日至22日 · 适合 7–11 岁学生</p>
      <section class="about-card"><h2>拆开礼盒 · 动手创作 · 记录进度</h2><p>纽约时间每天午夜 00:00 解锁一份新礼盒。在 Tinkercad 或 Scratch 中完成你的创意作品，然后回到这里标记你自己的完成进度。</p><p>每个主题维护同一个作品项目。请务必在 Tinkercad 或 Scratch 工具中保存你的作品；本网站不会自动上传、保存或检查你的 3D 模型与 Scratch 项目。</p></section>
      <section class="about-card"><h2>奖项设置</h2><div class="prizes"><p><strong>第1名</strong><span>+600积分 + 奖杯</span></p><p><strong>第2名</strong><span>+400积分 + 奖杯</span></p><p><strong>第3名</strong><span>+200积分 + 奖牌</span></p><p><strong>第4名</strong><span>+50积分</span></p><p><strong>第5名</strong><span>+30积分</span></p></div><p><strong>完成基础项目：</strong> +10积分。</p><p><strong>完成全部4个主题：</strong> 经老师确认完成全部 4 个主题，可获得 3D打印圣诞作品 + 证书。</p><p><strong>12月24日公布获奖名单。</strong></p></section>
      <section class="about-card"><h2>关于本地打卡与积分</h2><p>页面上的“我完成了 (I'm done)”仅作为你在当前浏览器中的个人打卡记录，<strong>不等于老师审核通过，也不会自动获得活动积分或确认获奖资格</strong>。最终活动积分、完成情况与奖项均由老师核对作品后确认。</p><p>同一设备上的不同报名编号分别独立保存进度，互不串号；退出后不会显示上一位学生的进度。</p></section><a class="primary" href="#home">${copy.backToGifts}</a></section>`;
    }
    return `<section class="about"><a class="back" href="#home">${copy.backToGifts}</a><h1>A little making.<br>A lot to celebrate.</h1><p>December 1–22, 2026 · Ages 7–11</p>
    <section class="about-card"><h2>Open. Make. Come back.</h2><p>A gift opens at midnight each day in New York. Make your idea in Tinkercad or Scratch, then mark your own progress here.</p><p>Keep one project for each theme. Save your work in the tool. This site cannot find, save, or check your models or Scratch projects.</p></section>
    <section class="about-card"><h2>Prizes & Awards</h2><div class="prizes"><p><strong>1st:</strong><span>+600 points + trophy</span></p><p><strong>2nd:</strong><span>+400 points + trophy</span></p><p><strong>3rd:</strong><span>+200 points + medal</span></p><p><strong>4th:</strong><span>+50 points</span></p><p><strong>5th:</strong><span>+30 points</span></p></div><p><strong>Complete the Basic Project:</strong> +10 points.</p><p><strong>Complete all 4 themes:</strong> Teacher-confirmed completion of all four themes earns a 3D-printed Christmas creation + certificate.</p><p><strong>Winners announced Dec 24.</strong></p></section>
    <section class="about-card"><h2>Your marks are yours</h2><p>“I'm done” is your own local check-in record in this browser. <strong>It does not equal teacher review, nor does it automatically award event points or confirm prize eligibility.</strong> Teachers confirm final points, completion, and awards.</p><p>Progress is stored separately for each Registration ID on this device and cleared from view when you switch ID.</p></section><a class="primary" href="#home">${copy.backToGifts}</a></section>`;
  }

  function render(focusId) {
    if (!isAuthenticated || !activeCode || !sessionToken || !serverDays.length) {
      renderGate();
      return;
    }
    updateChromeText();
    const route = location.hash;
    const day = currentDay();
    app.innerHTML = builtDay(day)
      ? challengeView(day)
      : route === '#about'
        ? about()
        : (!route || route === '#home')
          ? calendar() + warning()
          : `<section class="locked-card"><h1>We can’t find that gift.</h1><a class="primary" href="#home">${t().backToGifts}</a></section>`;
    if (focusId) document.getElementById(focusId)?.focus();
  }

  function cancelReveal() {
    if (revealTimer !== null) clearTimeout(revealTimer);
    revealTimer = null;
    pendingDay = null;
    reveal.hidden = true;
    app.removeAttribute('inert');
    document.querySelector('.topbar').removeAttribute('inert');
    modebarEl.removeAttribute('inert');
    document.querySelector('footer').removeAttribute('inert');
    document.querySelector('.skip-link').removeAttribute('inert');
  }

  function enterDay() {
    const day = pendingDay;
    if (!canOpen(day)) { cancelReveal(); render(); return; }
    cancelReveal();
    rememberOpened(day);
    location.hash = `#day/${day}`;
  }

  function openGift(event, day) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!canOpen(day) || revealTimer !== null) return;
    pendingDay = day;
    reveal.setAttribute('aria-label', `Opening your Day ${day} gift`);
    if (isOpened(day) || motion.matches) { enterDay(); return; }
    reveal.hidden = false;
    for (const element of [app, document.querySelector('.topbar'), modebarEl, document.querySelector('footer'), document.querySelector('.skip-link')]) {
      element.setAttribute('inert', '');
    }
    revealTimer = setTimeout(enterDay, 1000);
  }

  // Verify existing stored session token with the server on page load or refresh
  async function restoreSessionFromServer() {
    if (!sessionToken) {
      clearSession('');
      render();
      return;
    }
    updateChromeText();
    app.innerHTML = `<section class="gate-wrap"><p class="gate-sub">${lang === 'zh' ? '正在验证登录会话……' : 'Verifying your session…'}</p></section>`;
    try {
      const resp = await fetch(GAS_EXEC_URL, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'get_challenge_data',
          sessionToken: sessionToken
        })
      });
      const data = await resp.json();
      if (!data || !data.ok || !data.code || !Array.isArray(data.days)) {
        clearSession(t().gateSessionExpired);
        render();
        return;
      }
      activeCode = String(data.code).trim();
      serverDate = String(data.serverDate || '2026-11-23');
      serverDays = data.days;
      isAuthenticated = true;
      storage.setItem(SESSION_CODE_KEY, activeCode);
      loadUserLocalState(activeCode);
      render();
    } catch (err) {
      clearSession(t().gateSessionExpired);
      render();
    }
  }

  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    app.focus();
  });

  langToggleBtnEl.addEventListener('click', () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    storage.setItem(LANG_KEY, lang);
    render();
  });

  logoutBtnEl.addEventListener('click', () => {
    if (dialog.open) dialog.close();
    clearSession('');
    if (location.hash && location.hash !== '#home') {
      history.replaceState(null, '', location.pathname + location.search);
    }
    render();
  });

  app.addEventListener('click', event => {
    if (!isAuthenticated) return;
    const giftLink = event.target.closest('[data-open-gift]');
    if (giftLink) { openGift(event, Number(giftLink.dataset.openGift)); return; }
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.lockedDay) {
      const day = Number(target.dataset.lockedDay);
      const copy = t();
      const item = builtDay(day);
      document.querySelector('#preview-date').textContent = copy.previewDialogDate(day);
      document.querySelector('#preview-title').textContent = item ? item.title : `Day ${day}`;
      document.querySelector('#preview-description').textContent = copy.previewDialogDesc(day);
      document.querySelector('#preview-notice').textContent = copy.previewDialogNotice;
      dialog.showModal();
      return;
    }
    if (target.id === 'hint-button') { hint = hint ? 0 : 1; render('hint-button'); }
    if (target.id === 'more-hint') { hint++; render(hint < 3 ? 'more-hint' : 'hint-button'); }
    if ((target.id === 'complete' || target.id === 'undo') && canOpen()) {
      if (!isAuthenticated || !activeCode || !sessionToken) {
        clearSession(t().gateSessionExpired);
        render();
        return;
      }
      const day = currentDay();
      const celebrate = target.id === 'complete' && !isDone(day);
      progress.days[day] = target.id === 'complete';
      progress.error = !C.saveProgress(storage, isDone(day), activeCode, day);
      bonus = false;
      render(isDone(day) ? 'back-to-gifts' : 'complete');
      if (celebrationTimer !== null) clearTimeout(celebrationTimer);
      if (celebrate && !motion.matches) {
        const area = document.querySelector('.done-message');
        area?.classList.add('celebrating');
        celebrationTimer = setTimeout(() => {
          area?.classList.remove('celebrating');
          celebrationTimer = null;
        }, 1100);
      }
    }
    if (target.id === 'bonus-button') { bonus = !bonus; render('bonus-button'); }
  });

  document.querySelector('#close-preview').addEventListener('click', () => dialog.close());
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && revealTimer !== null) enterDay(); });
  motion.addEventListener?.('change', () => {
    if (motion.matches && revealTimer !== null) enterDay();
    if (motion.matches) document.querySelector('.celebrating')?.classList.remove('celebrating');
  });

  window.addEventListener('hashchange', () => {
    cancelReveal();
    if (dialog.open) dialog.close();
    hint = 0;
    bonus = false;
    render();
    const heading = document.querySelector('h1');
    heading?.classList.add('route-heading');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  });

  window.addEventListener('storage', event => {
    if (event.key === SESSION_TOKEN_KEY || event.key === SESSION_CODE_KEY) {
      const nextToken = storage.getItem(SESSION_TOKEN_KEY) || '';
      if (!nextToken) {
        clearSession('');
        render();
      }
      return;
    }
    if (isAuthenticated && activeCode) {
      const pKey = C.progressKeyForUser(activeCode);
      const oKey = C.openedKeyForUser(activeCode);
      if ([pKey, oKey, null].includes(event.key)) {
        loadUserLocalState(activeCode);
        render();
      }
    }
  });

  restoreSessionFromServer();
})();
