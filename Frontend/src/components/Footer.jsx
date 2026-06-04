import { Link } from 'react-router-dom';
import {
  ArrowUp,
  Clock,
  Compass,
  Facebook,
  Instagram,
  Luggage,
  Mail,
  MessageCircle,
  Phone,
  UserRound,
  Youtube,
} from 'lucide-react';

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Tour Plans', href: '/#interactive-travel-themes' },
  { label: 'Day Tour Plans', href: '/day-tours' },
  { label: 'About', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Booking Terms', href: '/terms-and-conditions' },
];

const resourceLinks = [
  { label: 'Top Packages', href: '/#interactive-travel-themes' },
  { label: 'Day Tours', href: '/day-tours' },
  { label: 'Custom Planning', href: '/contact' },
  { label: 'Travel Support', href: '/contact' },
];

const policyLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms and Conditions', href: '/terms-and-conditions' },
  { label: 'Booking Terms', href: '/terms-and-conditions' },
  { label: 'Contact Support', href: '/contact' },
];

const supportLinks = [
  {
    href: 'https://wa.me/94770000000',
    icon: MessageCircle,
    label: 'Live Chat Support',
  },
  {
    icon: Clock,
    label: '24 Hours Service',
  },
  {
    href: 'tel:+94770000000',
    icon: Phone,
    label: '+94 77 000 0000',
  },
  {
    href: 'mailto:hello@yogotravels.com',
    icon: Mail,
    label: 'hello@yogotravels.com',
  },
];

const socialLinks = [
  { href: 'https://twitter.com/', icon: MessageCircle, label: 'X' },
  { href: 'https://www.facebook.com/', icon: Facebook, label: 'Facebook' },
  { href: 'https://www.instagram.com/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.youtube.com/', icon: Youtube, label: 'YouTube' },
];

function LogoMark() {
  return (
    <Link
      to="/"
      aria-label="YOGO Tours"
      className="group inline-flex w-fit items-end transition hover:opacity-90"
    >
      <span className="font-display text-[2.85rem] font-semibold uppercase leading-none tracking-[-0.045em] text-[#F1EFEC] sm:text-[3.65rem] lg:text-[4.1rem]">
        <span className="bg-gradient-to-b from-[#FFFFFF] via-[#DADDC5] to-[#F1EFEC] bg-clip-text text-transparent">
          YOGO
        </span>
        <span className="ml-3 bg-gradient-to-b from-[#DADDC5] via-[#F1EFEC] to-[#FFFFFF] bg-clip-text text-transparent">
          TOURS
        </span>
      </span>
    </Link>
  );
}

function TravelIconCluster() {
  const travelIcons = [
    { icon: Compass, label: 'Compass' },
    { icon: Luggage, label: 'Travel bag' },
    { icon: UserRound, label: 'Traveller' },
  ];

  return (
    <div className="mt-7 flex w-fit items-center gap-3 rounded-full border border-[#F1EFEC]/14 bg-[#F1EFEC]/8 px-3 py-2 text-[#DADDC5] shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-md">
      {travelIcons.map(({ icon: Icon, label }) => (
        <span
          key={label}
          aria-label={label}
          className="grid h-10 w-10 place-items-center rounded-full border border-transparent bg-[#F1EFEC]/10 text-[#F1EFEC] transition duration-300 ease-out hover:border-[#283A2C] hover:bg-[#DADDC5] hover:text-[#283A2C]"
        >
          <Icon size={20} />
        </span>
      ))}
    </div>
  );
}

function BulletLink({ label, href }) {
  function handleClick() {
    const hash = href.split('#')[1];

    window.setTimeout(() => {
      if (hash) {
        document
          .getElementById(hash)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }

  return (
    <Link
      to={href}
      onClick={handleClick}
      className="group flex w-fit items-start gap-3 text-sm font-semibold leading-5 text-[#F1EFEC]/72 transition hover:text-[#FFFFFF]"
    >
      <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-[#DADDC5] transition group-hover:bg-[#FFFFFF]" />
      <span>{label}</span>
    </Link>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[#FFFFFF] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-6 grid gap-4">
        {links.map((link) => (
          <BulletLink key={`${title}-${link.label}`} {...link} />
        ))}
      </div>
    </div>
  );
}

function SupportItem({ href, icon: Icon, label }) {
  const className =
    'group flex w-fit items-center gap-3 text-sm font-semibold text-[#F1EFEC]/72 transition hover:text-[#FFFFFF]';
  const content = (
    <>
      <span className="grid h-9 w-9 place-items-center rounded-full border border-[#DADDC5]/30 bg-[#F1EFEC]/10 text-[#DADDC5] transition duration-300 ease-out group-hover:border-[#283A2C] group-hover:bg-[#DADDC5] group-hover:text-[#283A2C]">
        <Icon size={18} />
      </span>
      <span>{label}</span>
    </>
  );

  if (!href) return <span className={className}>{content}</span>;

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className={className}
    >
      {content}
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer className="relative overflow-hidden border-t border-[#DADDC5]/20 bg-[#283A2C] text-[#F1EFEC]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#283A2C_0%,rgba(40,58,44,0.92)_30%,rgba(40,58,44,0.72)_53%,rgba(40,58,44,0.92)_78%,#283A2C_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-[29%] hidden w-px bg-[#F1EFEC]/12 lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-[27%] hidden w-px bg-[#F1EFEC]/12 lg:block" />

      <div className="relative mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-[#F1EFEC]/28 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <LogoMark />

          <div className="flex items-center gap-3">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-11 w-11 place-items-center rounded-full border border-transparent text-[#FFFFFF] transition duration-300 ease-out hover:border-[#283A2C] hover:bg-[#DADDC5] hover:text-[#283A2C]"
              >
                <Icon size={21} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-[0.95fr_0.9fr_1.1fr_1.05fr] lg:gap-x-16">
          <div>
            <FooterColumn title="Navigation Links" links={navigationLinks} />
            <TravelIconCluster />
          </div>
          <FooterColumn title="Resources" links={resourceLinks} />
          <FooterColumn title="Terms and Policies" links={policyLinks} />

          <div>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] sm:text-2xl">
              Customer Support
            </h2>
            <div className="mt-6 grid gap-4">
              {supportLinks.map((item) => (
                <SupportItem key={item.label} {...item} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#F1EFEC]/18 pt-4 text-[0.68rem] font-semibold text-[#F1EFEC]/72 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Developed for YOGO Tours</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#DADDC5] sm:block" />
            <span>Copyright {year}. All rights reserved.</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#F1EFEC]/22 px-4 py-2 text-[#FFFFFF] transition duration-300 ease-out hover:border-[#283A2C] hover:bg-[#DADDC5] hover:text-[#283A2C]"
          >
            Back To Top
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
