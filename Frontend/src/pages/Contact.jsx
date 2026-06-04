import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Clock,
  Compass,
  Mail,
  MapPinned,
  MessageCircle,
  Phone,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import ContactForm from '../components/contact/ContactForm.jsx';

const contactMethods = [
  {
    href: 'https://wa.me/94770000000',
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+94 77 000 0000',
  },
  {
    href: 'mailto:hello@yogotravels.com',
    icon: Mail,
    label: 'Email',
    value: 'hello@yogotravels.com',
  },
  {
    href: 'tel:+94770000000',
    icon: Phone,
    label: 'Phone',
    value: '+94 77 000 0000',
  },
];

const planningSteps = [
  [Compass, 'Tell us your travel style'],
  [Route, 'We shape the route'],
  [ShieldCheck, 'Confirm with confidence'],
];

export default function Contact() {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedTourPackage =
    searchParams.get('selectedTourPackage') ||
    searchParams.get('package') ||
    searchParams.get('tour') ||
    '';
  const inquiryContext = {
    inquiryType: searchParams.get('inquiryType') || 'General',
    relatedLocation: searchParams.get('relatedLocation') || '',
    relatedTheme: searchParams.get('relatedTheme') || '',
    selectedItemSlug: searchParams.get('selectedItemSlug') || '',
    selectedItemTitle: searchParams.get('selectedItemTitle') || selectedTourPackage,
    selectedPlace: searchParams.get('selectedPlace') || '',
    totalDays: searchParams.get('totalDays') || '',
  };
  const sourcePage = searchParams.get('source') || location.pathname;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F1EFEC] px-4 pb-20 pt-24 text-[#283A2C] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[#283A2C]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(218,221,197,0.18),transparent_30rem),linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(40,58,44,0)_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[34rem] h-28 bg-gradient-to-b from-[#283A2C] to-[#F1EFEC]" />

      <div className="relative mx-auto max-w-[92rem]">
        <motion.header
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative isolate overflow-hidden rounded-[2rem] bg-[#283A2C] px-6 py-10 text-[#FFFFFF] shadow-[0_28px_84px_rgba(40,58,44,0.22)] sm:px-9 lg:px-11"
        >
          <div className="absolute bottom-[-1px] right-[-1px] hidden h-20 w-72 rounded-tl-[5.5rem] border-l border-t border-[#283A2C]/20 bg-[#F1EFEC] sm:block" />
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_0.65fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.34em] text-[#DADDC5]">
                <MessageCircle size={16} />
                {t('pages.contact.kicker')}
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-[2.7rem] font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">
                {t('pages.contact.title')}
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-[#F1EFEC]/78 sm:text-lg">
                {t('pages.contact.description')}
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-[#FFFFFF]/12 bg-black/18 p-4 backdrop-blur-md">
              {planningSteps.map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#F1EFEC] text-[#283A2C]">
                    <Icon size={19} />
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-[#F1EFEC]/78">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        <div className="mt-8 grid gap-7 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <motion.aside
            initial={{ opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="grid gap-5 lg:sticky lg:top-28"
          >
            <div className="rounded-[2rem] border border-[#283A2C]/10 bg-[#FFFFFF] p-6 shadow-[0_22px_58px_rgba(40,58,44,0.08)] sm:p-7">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.26em] text-[#283A2C]/50">
                Direct Lines
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-[#283A2C]">
                Reach the travel planning desk.
              </h2>
              <div className="mt-6 grid gap-3">
                {contactMethods.map(({ href, icon: Icon, label, value }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noreferrer' : undefined}
                    className="group flex items-center gap-4 rounded-2xl border border-[#283A2C] bg-[#F1EFEC] p-4 transition duration-300 ease-out hover:bg-[#DADDC5]"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#283A2C] text-[#F1EFEC] transition group-hover:bg-black">
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.64rem] font-black uppercase tracking-[0.18em] text-[#283A2C]/48">
                        {label}
                      </span>
                      <span className="mt-1 block break-words text-sm font-bold text-[#283A2C]">
                        {value}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border-[1.5px] border-[#283A2C] bg-[#DADDC5] p-6 text-[#283A2C] shadow-[0_22px_58px_rgba(40,58,44,0.08)] sm:p-7">
              <Clock size={26} />
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight">
                Calm replies, clear next steps.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#283A2C]/66">
                Share your dates, guest count, travel pace, and must-see places.
                We will use those details to guide your inquiry with context.
              </p>
              <div className="mt-5 flex items-center gap-3 rounded-full bg-[#F1EFEC] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#283A2C]/64">
                <MapPinned size={16} />
                Sri Lanka route support
              </div>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="[&_.contact-input]:border-[#283A2C]/12 [&_.contact-input]:bg-[#FFFFFF] [&_.contact-input]:text-[#283A2C] [&_.contact-input:focus]:border-[#283A2C] [&_.contact-input:focus]:shadow-[0_0_0_3px_rgba(218,221,197,0.5)] [&_.contact-textarea]:border-[#283A2C]/12 [&_.contact-textarea]:bg-[#FFFFFF] [&_.contact-textarea]:text-[#283A2C] [&_.contact-textarea:focus]:border-[#283A2C] [&_.contact-textarea:focus]:shadow-[0_0_0_3px_rgba(218,221,197,0.5)] [&_form]:rounded-[2rem] [&_form]:border [&_form]:border-[#283A2C]/10 [&_form]:bg-[#FFFFFF] [&_form]:text-[#283A2C] [&_form]:shadow-[0_28px_76px_rgba(40,58,44,0.12)] [&_form_button[type='submit']]:rounded-full [&_form_button[type='submit']]:bg-[#283A2C] [&_form_button[type='submit']]:text-[#F1EFEC] [&_form_button[type='submit']:hover]:bg-black [&_form_h2]:text-[#283A2C] [&_form_p:first-child]:text-[#283A2C]/50"
          >
            <ContactForm
              inquiryContext={inquiryContext}
              selectedTourPackage={selectedTourPackage}
              sourcePage={sourcePage}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
