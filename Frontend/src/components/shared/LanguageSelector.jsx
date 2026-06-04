import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Globe2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { languages } from '../../i18n/languages';

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage =
    languages.find((language) => language.code === i18n.language) || languages[0];

  function changeLanguage(language) {
    if (!language.enabled) return;

    i18n.changeLanguage(language.code);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('language.label')}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-extrabold uppercase tracking-[0.14em] text-pearl transition hover:border-champagne hover:text-champagne"
      >
        <Globe2 size={16} />
        {currentLanguage.code}
        <ChevronDown
          size={15}
          className={`transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-lg border border-white/10 bg-obsidian/96 p-2 shadow-luxury backdrop-blur-xl"
          >
            {languages.map((language) => {
              const isActive = language.code === currentLanguage.code;

              return (
                <button
                  key={language.code}
                  type="button"
                  disabled={!language.enabled}
                  onClick={() => changeLanguage(language)}
                  className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left transition ${
                    language.enabled
                      ? 'text-pearl hover:bg-white/[0.08]'
                      : 'cursor-not-allowed text-pearl/34'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-bold">
                      {language.nativeLabel}
                    </span>
                    <span className="mt-1 block text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-pearl/40">
                      {language.enabled
                        ? language.label
                        : `${language.label} / ${t('language.comingSoon')}`}
                    </span>
                  </span>
                  {isActive ? (
                    <Check
                      size={17}
                      className="text-champagne"
                      aria-label={t('language.active')}
                    />
                  ) : (
                    !language.enabled && (
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em] text-pearl/34">
                        Soon
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
