import { Link } from 'react-router-dom';
import { ArrowRight, Home, MapPinned, Route } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <section className="grid min-h-screen place-items-center bg-[#F1EFEC] px-4 py-28 text-[#283A2C] sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-[#283A2C] px-6 py-12 text-center text-[#FFFFFF] shadow-[0_28px_84px_rgba(40,58,44,0.22)] sm:px-10 sm:py-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(218,221,197,0.2),transparent_28rem)]" />
        <div className="relative mx-auto max-w-2xl">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F1EFEC] text-[#283A2C]">
            <MapPinned size={30} />
          </span>
          <p className="mt-7 text-[0.7rem] font-black uppercase tracking-[0.32em] text-[#DADDC5]">
            404
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            This route is not on the map.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#F1EFEC]/74">
            The page may have moved, or the link may be incorrect. Start again
            from the home page or browse our tour plans.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-transparent bg-[#F1EFEC] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#283A2C] transition duration-300 ease-out hover:border-[#283A2C] hover:bg-[#DADDC5]"
            >
              <Home size={17} />
              Home
            </Link>
            <Link
              to="/#interactive-travel-themes"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#FFFFFF]/22 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#FFFFFF] transition hover:bg-[#FFFFFF] hover:text-[#283A2C]"
            >
              <Route size={17} />
              Tour Plans
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
