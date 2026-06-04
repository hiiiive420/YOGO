import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { adminBrandIcon as BrandIcon, adminNavigation } from '../../data/adminNavigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const navClass = ({ isActive }) =>
  [
    'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition',
    isActive
      ? 'bg-pearl text-obsidian'
      : 'text-pearl/68 hover:bg-white/[0.08] hover:text-pearl',
  ].join(' ');

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { admin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    showToast({ type: 'success', title: 'Logged out' });
    navigate('/admin-login', { replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-black text-pearl">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-champagne text-obsidian">
          <BrandIcon size={22} />
        </span>
        <span>
          <span className="block font-display text-2xl font-semibold">YOGO</span>
          <span className="block text-[0.62rem] font-black uppercase tracking-[0.28em] text-champagne">
            Admin
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {adminNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/admin'}
              className={navClass}
              onClick={() => setIsOpen(false)}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-lg bg-white/[0.04] p-3">
          <p className="text-sm font-bold">{admin?.name || 'Admin'}</p>
          <p className="mt-1 truncate text-xs text-pearl/48">
            {admin?.email || 'Signed in'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-bold text-pearl/72 transition hover:border-champagne hover:text-champagne"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-obsidian">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        {sidebar}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close admin navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24 }}
              className="fixed inset-y-0 left-0 z-50 w-[min(20rem,88vw)] lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-black/10 bg-[#fdfbf7]/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open admin navigation"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 lg:hidden"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-black/40">
              YOGO Travels
            </p>
            <h1 className="font-display text-2xl font-semibold">
              Admin Console
            </h1>
          </div>
          <div className="hidden rounded-full border border-black/10 px-4 py-2 text-sm font-bold text-black/54 sm:block">
            {admin?.role || 'admin'}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
