import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import logoMark from '../../utils/YogoTours_Logomark_Transparent.png';
import sloganMark from '../../utils/YogoTours_Slogan_Transparent.png';

const leftLinks = [
  { href: '/', label: 'Home' },
  { href: '/#interactive-travel-themes', label: 'Tour Plans' },
];

const rightLinks = [
  { href: '/day-tours', label: 'Day Tour Plans' },
  { href: '/about', label: 'About' },
];

const navLinks = [...leftLinks, ...rightLinks];

const navItemClass = ({ isActive }) =>
  [
    'group relative whitespace-nowrap px-1 py-2 text-[0.94rem] font-semibold uppercase tracking-[0.12em] text-[#F1EFEC]/82 transition duration-300 ease-out',
    isActive
      ? 'text-[#FFFFFF]'
      : 'hover:text-[#FFFFFF] hover:opacity-100',
  ].join(' ');

const mobileNavItemClass = (isActive) =>
  [
    'rounded-full px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] transition',
    isActive
      ? 'bg-[#F1EFEC] text-[#283A2C]'
      : 'text-[#F1EFEC]/78 hover:bg-[#FFFFFF]/10 hover:text-[#FFFFFF]',
  ].join(' ');

function isHashLink(href) {
  return href.includes('#');
}

function isHashLinkActive(href, location) {
  const [pathname, hash] = href.split('#');
  return location.pathname === (pathname || '/') && location.hash === `#${hash}`;
}

function scrollToHashTarget(href) {
  const hash = href.split('#')[1];
  if (!hash) return;

  window.setTimeout(() => {
    document
      .getElementById(hash)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 0);
}

function CenterLogo({ isScrolled = false } = {}) {
  return (
    <span
      className={`relative grid place-items-center overflow-visible transition-all duration-500 ease-out ${
        isScrolled
          ? 'h-[3.75rem] w-[4.5rem]'
          : 'h-[5.25rem] w-[5.2rem]'
      }`}
    >
      <span
        className={`pointer-events-none absolute left-1/2 top-[-1.02rem] block h-[1.75rem] w-[10.5rem] -translate-x-1/2 overflow-hidden transition-all duration-500 ${
          isScrolled ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <img
          src={sloganMark}
          alt="Adventure is calling"
          className="absolute left-1/2 top-0 h-[10.1rem] w-[10.1rem] max-w-none -translate-x-1/2 -translate-y-[4.48rem] object-contain"
        />
      </span>
      <span
        className={`grid place-items-center rounded-full transition-all duration-500 ease-out ${
          isScrolled
            ? 'h-[3.75rem] w-[3.75rem] drop-shadow-[0_12px_24px_rgba(0,0,0,0.22)]'
            : 'h-[3.85rem] w-[3.85rem] drop-shadow-[0_16px_30px_rgba(0,0,0,0.26)]'
        }`}
      >
        <img
          src={logoMark}
          alt="YOGO Tours"
          className="h-full w-full object-contain"
        />
      </span>
    </span>
  );
}

function NavUnderline() {
  return (
    <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#DADDC5] transition duration-300 group-hover:scale-x-100" />
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 28);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden bg-transparent px-4 pt-4 text-[#F1EFEC] transition duration-300 md:block md:px-6 lg:px-8">
      <nav
        className={[
          'mx-auto grid w-[min(92vw,78rem)] grid-cols-[1fr_auto_1fr] items-center rounded-full border border-[#FFFFFF]/20 bg-[#283A2C]/62 px-4 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-[20px] transition-all duration-500 ease-out sm:px-5 xl:w-[78vw]',
          isOpen
            ? 'h-[5.75rem] bg-[#283A2C]/88'
            : isScrolled
              ? 'h-[4.35rem] bg-[#283A2C]/74 shadow-[0_18px_52px_rgba(0,0,0,0.18)]'
              : 'h-[6.35rem]',
        ].join(' ')}
      >
        <span aria-hidden="true" />

        <Link
          to="/"
          aria-label="YOGO Tours home"
          className="justify-self-center xl:hidden"
        >
          <CenterLogo isScrolled={isScrolled || isOpen} />
        </Link>

        <div
          className="hidden grid-cols-[1fr_auto_1fr] items-center gap-1 px-0 py-0 transition duration-300 xl:grid"
        >
          <div className="flex items-center justify-end gap-10">
            {leftLinks.map((link) =>
              isHashLink(link.href) ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => scrollToHashTarget(link.href)}
                  className={navItemClass({
                    isActive: isHashLinkActive(link.href, location),
                  })}
                >
                  {link.label}
                  <NavUnderline />
                </Link>
              ) : (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  className={navItemClass}
                >
                  {link.label}
                  <NavUnderline />
                </NavLink>
              ),
            )}
          </div>

          <Link
            to="/"
            aria-label="YOGO Tours home"
            className="shrink-0 justify-self-center"
          >
            <CenterLogo isScrolled={isScrolled} />
          </Link>

          <div className="flex items-center justify-start gap-10">
            {rightLinks.map((link) =>
              isHashLink(link.href) ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => scrollToHashTarget(link.href)}
                  className={navItemClass({
                    isActive: isHashLinkActive(link.href, location),
                  })}
                >
                  {link.label}
                  <NavUnderline />
                </Link>
              ) : (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={navItemClass}
                >
                  {link.label}
                  <NavUnderline />
                </NavLink>
              ),
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label="Open navigation"
          className="inline-flex h-11 w-11 items-center justify-center justify-self-end rounded-full border border-[#FFFFFF]/24 bg-[#FFFFFF]/10 text-[#FFFFFF] shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:bg-[#FFFFFF] hover:text-[#283A2C] xl:hidden"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-3 w-[min(92vw,28rem)] rounded-[1.5rem] border border-[#FFFFFF]/18 bg-[#283A2C]/88 px-4 pb-5 pt-4 shadow-[0_24px_50px_rgba(0,0,0,0.24)] backdrop-blur-[20px] xl:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-2 text-[#FFFFFF]">
              {navLinks.map((link) =>
                isHashLink(link.href) ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => {
                      setIsOpen(false);
                      scrollToHashTarget(link.href);
                    }}
                    className={mobileNavItemClass(
                      isHashLinkActive(link.href, location),
                    )}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    end={link.href === '/'}
                    className={({ isActive }) =>
                      mobileNavItemClass(isActive)
                    }
                  >
                    {link.label}
                  </NavLink>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
