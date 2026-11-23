(function (root) {
  'use strict';
  const STORAGE_BASE = 'christmas-creative-challenge:2026:progress:v1';
  const themes = [
    {
      start: 1,
      end: 5,
      title: 'Your own ornament',
      titleZh: '专属圣诞挂饰',
      tool: 'Tinkercad 3D',
      description: 'Make a Christmas ornament that feels like you.'
    },
    {
      start: 6,
      end: 10,
      title: 'A tiny winter world',
      titleZh: '小小冬日世界',
      tool: 'Tinkercad 3D',
      description: 'Build a snowy little scene, one detail at a time.'
    },
    {
      start: 11,
      end: 16,
      title: 'Christmas lights',
      titleZh: '圣诞灯光秀',
      tool: 'Scratch',
      description: 'Make a light show that responds to you.'
    },
    {
      start: 17,
      end: 22,
      title: 'Catch the gifts',
      titleZh: '接住圣诞礼物',
      tool: 'Scratch',
      description: 'Build a game with falling gifts and a moving basket.'
    }
  ];

  function progressKeyForUser(code) {
    if (!code) return null;
    return STORAGE_BASE + ':' + String(code).trim();
  }

  function openedKeyForUser(code) {
    if (!code) return null;
    return STORAGE_BASE + ':opened:' + String(code).trim();
  }

  function validDays(days) {
    return days && typeof days === 'object' && !Array.isArray(days) &&
      Object.entries(days).every(([key, value]) =>
        Number.isInteger(Number(key)) &&
        String(Number(key)) === key &&
        Number(key) >= 1 &&
        Number(key) <= 22 &&
        typeof value === 'boolean'
      );
  }

  function readAllProgress(storage, userCode) {
    const key = progressKeyForUser(userCode);
    if (!key) return { days: {}, error: false };
    try {
      const raw = storage.getItem(key);
      if (raw === null) return { days: {}, error: false };
      const parsed = JSON.parse(raw);
      if (parsed?.version !== 2 || !validDays(parsed.days)) throw new Error('Invalid progress');
      return { days: parsed.days, error: false };
    } catch {
      return { days: {}, error: true };
    }
  }

  function saveProgress(storage, done, userCode, day) {
    const key = progressKeyForUser(userCode);
    if (!key || !Number.isInteger(day) || day < 1 || day > 22) return false;
    try {
      const days = readAllProgress(storage, userCode).days;
      days[day] = done === true;
      storage.setItem(key, JSON.stringify({ version: 2, days }));
      return true;
    } catch {
      return false;
    }
  }

  function readAllOpened(storage, userCode) {
    const key = openedKeyForUser(userCode);
    if (!key) return { days: {}, error: false };
    try {
      const raw = storage.getItem(key);
      if (raw === null) return { days: {}, error: false };
      const parsed = JSON.parse(raw);
      if (parsed?.version !== 2 || !validDays(parsed.days)) throw new Error('Invalid opened state');
      return { days: parsed.days, error: false };
    } catch {
      return { days: {}, error: true };
    }
  }

  function saveOpened(storage, userCode, day) {
    const key = openedKeyForUser(userCode);
    if (!key || !Number.isInteger(day) || day < 1 || day > 22) return false;
    try {
      const days = readAllOpened(storage, userCode).days;
      days[day] = true;
      storage.setItem(key, JSON.stringify({ version: 2, days }));
      return true;
    } catch {
      return false;
    }
  }

  const api = {
    themes,
    STORAGE_BASE,
    progressKeyForUser,
    openedKeyForUser,
    readAllProgress,
    saveProgress,
    readAllOpened,
    saveOpened
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Challenge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
