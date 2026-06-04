import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const policySections = [
  {
    title: 'Information We Collect',
    body:
      'We may collect your name, email address, phone number, travel dates, destination interests, inquiry details, and any information you choose to share through our forms or direct communication.',
  },
  {
    title: 'How We Use Information',
    body:
      'We use your information to respond to inquiries, prepare travel suggestions, manage booking conversations, improve our website experience, and provide customer support before and during your journey.',
  },
  {
    title: 'Sharing Information',
    body:
      'We only share information when needed to arrange requested services, comply with legal obligations, protect our business, or work with trusted travel partners who help deliver your experience.',
  },
  {
    title: 'Data Care',
    body:
      'We take reasonable steps to keep your information secure and only retain it for as long as needed for travel planning, support, legal, or business record purposes.',
  },
  {
    title: 'Cookies And Analytics',
    body:
      'Our website may use cookies or similar technologies to understand visitor behavior, improve performance, and support a smoother browsing experience.',
  },
  {
    title: 'Your Choices',
    body:
      'You may contact us to request access, correction, or deletion of your personal information, subject to booking, legal, and operational requirements.',
  },
];

export default function PrivacyPolicy() {
  return (
    <section className="min-h-screen bg-[#F1EFEC] px-4 pb-20 pt-28 text-[#283A2C] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.header
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2rem] bg-[#283A2C] px-6 py-12 text-[#FFFFFF] shadow-[0_24px_74px_rgba(40,58,44,0.18)] sm:px-9 lg:px-11"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(218,221,197,0.18),transparent_24rem)]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#DADDC5]">
              <ShieldCheck size={16} />
              Legal
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#F1EFEC]/78">
              This policy explains how YOGO Tours handles information shared
              through our website, inquiries, and travel planning conversations.
            </p>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#DADDC5]">
              Last updated: June 2, 2026
            </p>
          </div>
        </motion.header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {policySections.map((section, index) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
              className="rounded-2xl border border-[#283A2C]/10 bg-[#FFFFFF] p-6 shadow-[0_18px_46px_rgba(40,58,44,0.07)]"
            >
              <Lock size={21} className="text-[#283A2C]" />
              <h2 className="mt-4 font-display text-2xl font-semibold">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#283A2C]/64">
                {section.body}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border-[1.5px] border-[#283A2C] bg-[#DADDC5] p-6 text-[#283A2C] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#283A2C]/58">
                Privacy Questions
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                Contact our team for privacy requests.
              </h2>
            </div>
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#283A2C] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#F1EFEC] transition hover:bg-black"
            >
              <Mail size={17} />
              Contact
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
