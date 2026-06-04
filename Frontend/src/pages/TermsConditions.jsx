import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  FileText,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

const termsSections = [
  {
    title: 'Use Of Our Website',
    body:
      'You agree to use this website for lawful travel planning purposes and not to interfere with website operation, content, or security.',
  },
  {
    title: 'Travel Inquiries',
    body:
      'Submitting an inquiry does not confirm a booking. A booking is confirmed only after agreed travel details, availability, pricing, and payment terms are accepted.',
  },
  {
    title: 'Pricing And Availability',
    body:
      'Tour prices, accommodation, vehicles, activities, and partner services may change based on availability, season, route changes, and supplier conditions.',
  },
  {
    title: 'Custom Travel Plans',
    body:
      'Custom routes may require additional planning time. Final itineraries may be adjusted for weather, safety, road conditions, local closures, or guest preferences.',
  },
  {
    title: 'Cancellations And Changes',
    body:
      'Cancellation, refund, and amendment terms may vary by package, partner, and booking stage. Confirmed booking terms will be shared before final payment.',
  },
  {
    title: 'Responsibility',
    body:
      'YOGO Tours aims to provide clear planning and support, but travel involves external conditions such as weather, transport, local rules, and supplier availability.',
  },
];

export default function TermsConditions() {
  return (
    <section className="min-h-screen bg-[#F1EFEC] px-4 pb-20 pt-28 text-[#283A2C] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.header
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2rem] bg-[#283A2C] px-6 py-12 text-[#FFFFFF] shadow-[0_24px_74px_rgba(40,58,44,0.18)] sm:px-9 lg:px-11"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(218,221,197,0.18),transparent_24rem)]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#DADDC5]">
              <FileText size={16} />
              Legal
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Terms And Conditions
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#F1EFEC]/78">
              These terms outline the general conditions for using the YOGO
              Tours website and starting travel planning conversations with us.
            </p>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#DADDC5]">
              Last updated: June 2, 2026
            </p>
          </div>
        </motion.header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {termsSections.map((section, index) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
              className="rounded-2xl border border-[#283A2C]/10 bg-[#FFFFFF] p-6 shadow-[0_18px_46px_rgba(40,58,44,0.07)]"
            >
              <ShieldCheck size={21} className="text-[#283A2C]" />
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
              <p className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#283A2C]/58">
                <CalendarDays size={16} />
                Booking Support
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                Need help before confirming a tour?
              </h2>
            </div>
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#283A2C] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#F1EFEC] transition hover:bg-black"
            >
              <MessageCircle size={17} />
              Ask Us
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
