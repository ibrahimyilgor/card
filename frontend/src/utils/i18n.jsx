import React from 'react';

function getInitialLang() {
  let lang = localStorage.getItem('lang');
  if (!lang) {
    lang = 'en';
    localStorage.setItem('lang', lang);
  }
  return lang;
}

async function fetchTranslations(lang) {
  try {
    const res = await fetch(`/locales/${lang}.json`);
    if (!res.ok) throw new Error('Failed to load language file');
    return await res.json();
  } catch {
    // fallback to English
    const res = await fetch(`/locales/en.json`);
    return await res.json();
  }
}

export const I18nContext = React.createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children, lang, setLang }) {
  const [translations, setTranslations] = React.useState({});
  const actualLang = lang || getInitialLang();

  React.useEffect(() => {
    let mounted = true;
    fetchTranslations(actualLang).then(data => {
      if (mounted) setTranslations(data);
    });
    localStorage.setItem('lang', actualLang);
    return () => { mounted = false; };
  }, [actualLang]);

  const t = (key) => translations[key] || key;

  return (
    <I18nContext.Provider value={{ lang: actualLang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}
