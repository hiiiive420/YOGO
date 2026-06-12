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
      className={`pointer-events-none fixed left-1/2 top-0 z-[70] w-full max-w-[26.875rem] -translate-x-1/2 transform-gpu overflow-hidden transition-transform duration-500 ease-out md:hidden ${
        isVisible ? 'translate-y-0' : '-translate-y-[calc(100%+1rem)]'
      }`}
    >
      <Link
        to="/"
        aria-label="YOGO Tours home"
        style={{
          height:
            'calc(clamp(3.75rem, 17.84vw, 4.8rem) + env(safe-area-inset-top))',
          paddingTop: 'env(safe-area-inset-top)',
        }}
        className="pointer-events-auto relative z-10 mx-0 block w-full rounded-b-[clamp(3.5rem,17.44vw,4.7rem)] bg-[#283A2C] text-[#FFFFFF] focus-visible:outline-none"
      >
        <span className="absolute inset-x-0 bottom-0 block h-[clamp(3.75rem,17.84vw,4.8rem)]">
          <span
            className="absolute left-[12.56%] top-1/2 h-[clamp(3.25rem,16.96vw,4.5rem)] w-[clamp(3.25rem,16.96vw,4.5rem)] -translate-y-1/2 rounded-full shadow-[0_4px_72.4px_-35px_rgba(147,148,137,0.55)]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-2 rounded-full bg-[#939489]/30 blur-xl"
            />
            <img
              src={logoMark}
              alt="YOGO Tours"
              className="relative h-full w-full rounded-full object-contain drop-shadow-[0_4px_18px_rgba(147,148,137,0.55)]"
            />
          </span>

          <span className="absolute left-[35.76%] top-[calc(50%-0.2rem)] flex w-[41.12%] min-w-0 -translate-y-1/2 flex-col items-center justify-center text-center">
            <span className="relative block h-[clamp(1.35rem,6.6vw,1.75rem)] w-full overflow-hidden">
              <img
                src={sloganMark}
                alt="Adventure is calling"
                className="absolute left-1/2 top-0 h-[clamp(8rem,37.4vw,10rem)] w-[clamp(8rem,37.4vw,10rem)] max-w-none -translate-x-1/2 -translate-y-[45.2%] object-contain"
              />
            </span>
            <span className="block whitespace-nowrap font-['Bree_Serif'] text-[clamp(1.5rem,7.68vw,2.065rem)] font-normal leading-none tracking-normal text-[#FFFFFF]">
              Yo-Go Tours
            </span>
          </span>
        </span>
      </Link>
    </header>
  );
}
