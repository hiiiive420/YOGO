import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const socialButtons = [
  {
    label: 'WhatsApp',
    href: 'https://wa.me/',
    className: 'bg-[#25D366] text-obsidian hover:bg-[#35ef7a]',
    icon: MessageCircle,
  },
  {
    label: 'WeChat',
    href: '#wechat',
    className: 'bg-[#07C160] text-obsidian hover:bg-[#16dc74]',
    icon: Send,
  },
];

export default function FloatingSocialButtons() {
  const [isNearPageEnd, setIsNearPageEnd] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      const documentHeight = document.documentElement.scrollHeight;
      const viewportBottom = window.scrollY + window.innerHeight;

      setIsNearPageEnd(viewportBottom >= documentHeight - 240);
    }

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    const pageResizeObserver = new ResizeObserver(updateVisibility);
    pageResizeObserver.observe(document.body);

    return () => {
      pageResizeObserver.disconnect();
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isNearPageEnd && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
          className="mobile-shell-right fixed bottom-[calc(12.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col gap-3 md:bottom-6 md:right-6"
        >
          {socialButtons.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                initial={{ opacity: 0, x: 16, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-luxury transition md:h-14 md:w-14 ${item.className}`}
              >
                <Icon size={22} strokeWidth={2.4} />
              </motion.a>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
