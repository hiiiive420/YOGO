import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
    <div className="mobile-page-shell mobile-min-screen min-h-screen bg-obsidian pb-[calc(8.5rem+env(safe-area-inset-bottom))] text-pearl md:pb-0">
      <Navbar />
      <MobileHeader />
      <main className="mobile-main-shell">
        <Outlet />
      </main>
     
      <Footer />
      <FloatingSocialButtons />
      <MobileBottomNavigation />
    </div>
  );
}
