import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function PageShell({ kicker, title, description }) {
  const { t } = useTranslation();
  const shellCards = [
    t('pages.shellCards.privateAccess'),
    t('pages.shellCards.curatedStays'),
    t('pages.shellCards.islandRhythm'),
  ];

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-soft-noise px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
            {kicker}
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] text-pearl sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-pearl/68 sm:text-lg">
            {description}
          </p>
        </motion.div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shellCards.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-pearl/72">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
