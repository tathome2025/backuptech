(function () {
  function applyLanguage(lang) {
    const dict = (window.I18N && window.I18N[lang]) || {};
    const fallback = (window.I18N && window.I18N.zh) || {};

    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

    const title = dict.__title || fallback.__title;
    if (title) document.title = title;

    document.querySelectorAll('[data-i18n-key]').forEach((el) => {
      const key = el.getAttribute('data-i18n-key');
      const value = dict[key] || fallback[key];
      if (typeof value === 'string') el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = dict[key] || fallback[key];
      if (typeof value === 'string') el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang-switch') === lang);
    });

    localStorage.setItem('site_lang', lang);
    if (typeof window.onLanguageChange === 'function') window.onLanguageChange(lang);
  }

  function initLanguage() {
    const stored = localStorage.getItem('site_lang');
    const lang = stored === 'en' ? 'en' : 'zh';

    document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyLanguage(btn.getAttribute('data-lang-switch'));
      });
    });

    applyLanguage(lang);
    window.setLanguage = applyLanguage;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
  } else {
    initLanguage();
  }
})();
