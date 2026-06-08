import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import logoMark from '../../utils/YogoTours_Logomark_Transparent.png';
import sloganMark from '../../utils/YogoTours_Slogan_Transparent.png';

export default function MobileHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const animationFrame = useRef(null);

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 768px)');
    if (!mobileViewport.matches) return undefined;

    lastScrollY.current = window.scrollY;

    function handleScroll() {
      if (animationFrame.current) return;

      animationFrame.current = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDistance = currentScrollY - lastScrollY.current;

        if (currentScrollY <= 24) {
          setIsVisible(true);
          lastScrollY.current = currentScrollY;
        } else if (Math.abs(scrollDistance) >= 8) {
          setIsVisible(scrollDistance < 0);
          lastScrollY.current = currentScrollY;
        }

        animationFrame.current = null;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (animationFrame.current) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-[70] w-full transform-gpu overflow-hidden transition-transform duration-500 ease-out md:hidden ${
        isVisible ? 'translate-y-0' : '-translate-y-[calc(100%+1rem)]'
      }`}
    >
      <Link
        to="/"
        aria-label="YOGO Tours home"
        className="pointer-events-auto relative z-10 mx-0 flex min-h-[5.25rem] w-full items-center justify-center gap-3 rounded-b-[4.5rem] bg-[#283A2C] px-4 pb-2 pt-[max(0.45rem,env(safe-area-inset-top))] text-[#FFFFFF] shadow-[0_12px_32px_rgba(40,58,44,0.26)] focus-visible:outline-none"
      >
        <span
          className="relative h-16 w-16 shrink-0 rounded-full shadow-[0_4px_72.4px_-35px_rgba(147,148,137,0.55)]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-2 rounded-full bg-[#939489]/30 blur-xl"
          />
          <img
            src={logoMark}
            alt="YOGO Tours"
            className="relative h-16 w-16 rounded-full object-contain drop-shadow-[0_4px_18px_rgba(147,148,137,0.55)]"
          />
        </span>

        <span className="flex min-w-0 flex-col justify-center">
          <span className="relative block h-[1.9rem] w-[10.25rem] overflow-hidden">
            <img
              src={sloganMark}
              alt="Adventure is calling"
              className="absolute left-1/2 top-0 h-[9.65rem] w-[9.65rem] max-w-none -translate-x-1/2 -translate-y-[4.36rem] object-contain"
            />
          </span>
          <span className="block whitespace-nowrap font-display text-[1.7rem] font-semibold leading-none text-[#FFFFFF]">
            Yo-Go Tours
          </span>
        </span>
      </Link>
    </header>
  );
}
