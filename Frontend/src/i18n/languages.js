export const languages = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    enabled: true,
    direction: 'ltr',
  },
  {
    code: 'de',
    label: 'German',
    nativeLabel: 'Deutsch',
    enabled: false,
    direction: 'ltr',
  },
  {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Francais',
    enabled: false,
    direction: 'ltr',
  },
  {
    code: 'nl',
    label: 'Dutch',
    nativeLabel: 'Nederlands',
    enabled: false,
    direction: 'ltr',
  },
  {
    code: 'it',
    label: 'Italian',
    nativeLabel: 'Italiano',
    enabled: false,
    direction: 'ltr',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Espanol',
    enabled: false,
    direction: 'ltr',
  },
  {
    code: 'ru',
    label: 'Russian',
    nativeLabel: 'Russian',
    enabled: false,
    direction: 'ltr',
  },
  {
    code: 'zh-CN',
    label: 'Chinese Simplified',
    nativeLabel: 'Chinese Simplified',
    enabled: false,
    direction: 'ltr',
  },
];

export const languageCodes = languages.map((language) => language.code);

export const enabledLanguageCodes = languages
  .filter((language) => language.enabled)
  .map((language) => language.code);

export const defaultLanguage = 'en';

export function getLanguageByCode(code) {
  return languages.find((language) => language.code === code) || languages[0];
}
