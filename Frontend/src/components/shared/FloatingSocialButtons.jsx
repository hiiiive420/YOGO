import { MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

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
  return (
    <div className="fixed bottom-[calc(12.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col gap-3 md:bottom-6 md:right-6">
      {socialButtons.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.a
            key={item.label}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.12, duration: 0.45 }}
            className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-luxury transition sm:h-14 sm:w-14 ${item.className}`}
          >
            <Icon size={22} strokeWidth={2.4} />
          </motion.a>
        );
      })}
    </div>
  );
}
