import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpenText,
  House,
  Info,
  Luggage,
  MapPinned,
  MessageCircle,
  Route,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const navigationItems = [
  {
    icon: House,
    isActive: (pathname) => pathname === '/',
    label: 'Home',
    to: '/',
  },
  {
    icon: Info,
    isActive: (pathname) => pathname.startsWith('/about'),
    label: 'About',
    to: '/about',
  },
  {
    icon: BookOpenText,
    isActive: (pathname) => pathname.startsWith('/blogs'),
    label: 'Blog',
    to: '/blogs',
  },
  {
    icon: MessageCircle,
    isActive: (pathname) => pathname.startsWith('/contact'),
    label: 'Contact',
    to: '/contact',
  },
];

const packageOptions = [
  {
    icon: Route,
    label: 'Multi-Day Tours',
    to: '/travel-themes',
  },
  {
    icon: MapPinned,
    label: 'Day Tours',
    to: '/day-tours',
  },
];

function isPackagesPath(pathname) {
  return ['/travel-themes', '/tour-plans', '/itineraries', '/day-tours'].some(
    (path) => pathname.startsWith(path),
  );
}

function NavigationItem({ icon: Icon, isActive, label, to }) {
  return (
    <Link
      to={to}
      aria-current={isActive ? 'page' : undefined}
      className={`group relative flex min-h-[clamp(4rem,17vw,4.5rem)] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-full px-1 text-center text-[#F1FAEE] transition duration-300 ${
        isActive
          ? 'bg-[#FFFFFF]/10 text-[#F1FAEE] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]'
          : 'text-[#F1FAEE] active:bg-[#FFFFFF]/8'
      }`}
    >
      <Icon
        size={23}
        strokeWidth={isActive ? 2.5 : 2}
        className="shrink-0"
      />
      <span className="max-w-full truncate text-[0.68rem] font-bold leading-none text-[#F1FAEE] md:text-[0.72rem]">
        {label}
      </span>
      {isActive && (
        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#DADDC5]" />
      )}
    </Link>
  );
}

export default function MobileBottomNavigation() {
  const [isMapOverlapping, setIsMapOverlapping] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const packagesActive = isPackagesPath(location.pathname);

  useEffect(() => {
    setIsPackagesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsPackagesOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let frameId;

    function updateMapOverlap() {
      const nav = navRef.current;

      if (!nav || window.matchMedia('(min-width: 768px)').matches) {
        setIsMapOverlapping(false);
        return;
      }

      const navZoneTop = window.innerHeight - nav.offsetHeight - 24;
      const overlapsNavigation = [...document.querySelectorAll('[data-mobile-map]')].some(
        (mapElement) => {
          const bounds = mapElement.getBoundingClientRect();

          return bounds.top < window.innerHeight && bounds.bottom > navZoneTop;
        },
      );

      setIsMapOverlapping(overlapsNavigation);
    }

    function scheduleOverlapUpdate() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateMapOverlap);
    }

    const mutationObserver = new MutationObserver(scheduleOverlapUpdate);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', scheduleOverlapUpdate);
    window.addEventListener('scroll', scheduleOverlapUpdate, { passive: true });
    scheduleOverlapUpdate();

    return () => {
      window.cancelAnimationFrame(frameId);
      mutationObserver.disconnect();
      window.removeEventListener('resize', scheduleOverlapUpdate);
      window.removeEventListener('scroll', scheduleOverlapUpdate);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (isMapOverlapping) setIsPackagesOpen(false);
  }, [isMapOverlapping]);

  return (
    <>
      <AnimatePresence>
        {isPackagesOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close packages menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPackagesOpen(false)}
              className="fixed inset-0 z-[80] bg-[#101A13]/10 md:hidden"
            />

            <motion.div
              id="mobile-packages-menu"
              initial={{ opacity: 0, x: '-50%', y: 20, scale: 0.72 }}
              animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
              exit={{ opacity: 0, x: '-50%', y: 16, scale: 0.76 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                bottom: 'calc(6.2rem + env(safe-area-inset-bottom))',
              }}
              className="fixed left-1/2 z-[110] flex w-[min(calc(100vw-2rem),18rem)] origin-bottom items-end justify-center gap-5 md:hidden"
            >
              {packageOptions.map((option, index) => {
                const Icon = option.icon;

                return (
                  <motion.div
                    key={option.to}
                    initial={{ opacity: 0, y: 18, scale: 0.78 }}
                    animate={{ opacity: 1, y: index === 0 ? -10 : 0, scale: 1 }}
                    exit={{ opacity: 0, y: 14, scale: 0.78 }}
                    transition={{
                      delay: index * 0.04,
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      to={option.to}
                      onClick={() => setIsPackagesOpen(false)}
                      className="flex h-[5.6rem] w-[5.6rem] flex-col items-center justify-center gap-1.5 rounded-full border border-[#FFFFFF]/15 bg-[#283A2C] px-2 text-center text-[#F1FAEE] shadow-[0_18px_42px_rgba(0,0,0,0.30)] transition duration-300 active:scale-95 active:bg-[#DADDC5] active:text-[#283A2C]"
                    >
                      <Icon size={22} strokeWidth={2.2} />
                      <span className="text-[0.58rem] font-black leading-3">
                        {option.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        ref={navRef}
        aria-label="Mobile navigation"
        style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        className={`fixed left-1/2 z-[100] flex w-[clamp(18.5rem,92vw,24.375rem)] -translate-x-1/2 items-center rounded-full border border-[#FFFFFF]/15 bg-[#283A2C] p-1.5 text-[#F1FAEE] shadow-[0_20px_55px_rgba(0,0,0,0.30)] transition duration-300 md:hidden ${
          isMapOverlapping
            ? 'pointer-events-none translate-y-[calc(100%+2rem)] opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <NavigationItem
          {...navigationItems[0]}
          isActive={navigationItems[0].isActive(location.pathname)}
        />
        <NavigationItem
          {...navigationItems[1]}
          isActive={navigationItems[1].isActive(location.pathname)}
        />

        <button
          type="button"
          aria-controls="mobile-packages-menu"
          aria-expanded={isPackagesOpen}
          onClick={() => setIsPackagesOpen((current) => !current)}
          className={`group flex min-h-[clamp(4rem,17vw,4.5rem)] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-full px-1 text-center text-[#F1FAEE] transition duration-300 ${
            isPackagesOpen
              ? 'bg-[#FFFFFF]/14 text-[#F1FAEE] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]'
              : packagesActive
                ? 'bg-[#FFFFFF]/10 text-[#F1FAEE] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]'
                : 'text-[#F1FAEE] active:bg-[#FFFFFF]/8'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isPackagesOpen ? 'close' : 'packages'}
              initial={{ opacity: 0, rotate: -70, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 70, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="grid place-items-center"
            >
              {isPackagesOpen ? (
                <X size={24} strokeWidth={2.5} />
              ) : (
                <Luggage
                  size={23}
                  strokeWidth={packagesActive ? 2.5 : 2}
                />
              )}
            </motion.span>
          </AnimatePresence>
          <span
            className="max-w-full truncate text-[0.68rem] font-bold leading-none text-[#F1FAEE] md:text-[0.72rem]"
          >
            Packages
          </span>
        </button>

        <NavigationItem
          {...navigationItems[2]}
          isActive={navigationItems[2].isActive(location.pathname)}
        />
        <NavigationItem
          {...navigationItems[3]}
          isActive={navigationItems[3].isActive(location.pathname)}
        />
      </nav>
    </>
  );
}
