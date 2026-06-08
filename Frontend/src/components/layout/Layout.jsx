import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Footer from '../Footer.jsx';
import MobileHeader from './MobileHeader.jsx';
import Navbar from './Navbar.jsx';
import MobileBottomNavigation from './MobileBottomNavigation.jsx';
import FloatingSocialButtons from '../shared/FloatingSocialButtons.jsx';



export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (location.hash) {
        const targetId = decodeURIComponent(location.hash.slice(1));
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-obsidian pb-[calc(6.75rem+env(safe-area-inset-bottom))] text-pearl md:pb-0">
      <Navbar />
      <MobileHeader />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
     
      <Footer />
      <FloatingSocialButtons />
      <MobileBottomNavigation />
    </div>
  );
}
