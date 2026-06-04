import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Luggage, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import carSvg from '../../utils/Page-1.svg';
import highRoofVanImage from '../../utils/mini-van.png';
import luxuryCarImage from '../../utils/Car.png';
import vanImage from '../../utils/Van.png';

const vehicles = [
  {
    id: 'comfort-car',
    capacity: '2-3 guests',
    image: carSvg,
    imageClassName: 'w-[min(40%,10rem)] max-h-16 sm:w-[min(38%,10.5rem)] sm:max-h-20',
    luggage: '2 bags',
    subtitle: 'Ideal for couples and short routes',
    title: 'Comfort Car',
  },
  {
    id: 'luxury-car',
    capacity: '2 guests',
    image: luxuryCarImage,
    imageClassName: 'w-[min(74%,16.5rem)] max-h-24 sm:w-[min(74%,17.5rem)] sm:max-h-32',
    luggage: '2 bags',
    subtitle: 'Premium comfort for private journeys',
    title: 'Luxury Car',
  },
  {
    id: 'high-roof-van',
    capacity: '8-12 guests',
    image: highRoofVanImage,
    imageClassName: 'w-[min(44%,10.5rem)] max-h-16 sm:w-[min(42%,11rem)] sm:max-h-20',
    luggage: '8 bags',
    subtitle: 'Spacious travel for families and groups',
    title: 'High Roof Van',
  },
  {
    id: 'mini-van',
    capacity: '5-7 guests',
    image: vanImage,
    imageClassName: 'w-[min(74%,16.5rem)] max-h-24 sm:w-[min(74%,17.5rem)] sm:max-h-32',
    luggage: '5 bags',
    subtitle: 'Flexible group travel across Sri Lanka',
    title: 'Mini Van',
  },
];

export default function VehicleRoadCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const activeVehicle = vehicles[activeIndex];

  useEffect(() => {
    if (isPaused) return undefined;

    const intervalId = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((currentIndex) => (currentIndex + 1) % vehicles.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  function showVehicle(nextIndex, nextDirection = 1) {
    setDirection(nextDirection);
    setActiveIndex((nextIndex + vehicles.length) % vehicles.length);
  }

  function showPrevious() {
    showVehicle(activeIndex - 1, -1);
  }

  function showNext() {
    showVehicle(activeIndex + 1, 1);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55 }}
      className="mt-16"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#283A2C]/50">
            Private Transport
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[#283A2C] sm:text-5xl">
            Travel in Comfort
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#283A2C]/62">
            Private vehicles selected for smooth Sri Lankan journeys.
          </p>
        </div>
      </div>

      <div
        className="mt-8 overflow-hidden rounded-[2rem] border border-[#FFFFFF]/18 bg-[#283A2C] p-4 text-[#F1EFEC] shadow-[0_28px_76px_rgba(40,58,44,0.20)] sm:p-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-stretch">
          <div className="relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-[#FFFFFF]/10 bg-[#1f3024] shadow-[inset_0_0_60px_rgba(0,0,0,0.16)] sm:min-h-[21rem]">
            <div className="absolute inset-x-0 top-1/2 h-16 -translate-y-1/2 bg-[#F1EFEC]/7" />
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed border-[#DADDC5]/58" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(218,221,197,0.20),transparent_22rem),linear-gradient(90deg,rgba(40,58,44,0.95)_0%,rgba(40,58,44,0)_18%,rgba(40,58,44,0)_82%,rgba(40,58,44,0.95)_100%)]" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeVehicle.id}
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction > 0 ? '-78%' : '78%',
                  y: '-50%',
                }}
                animate={{ opacity: 1, x: '-50%', y: '-50%' }}
                exit={{
                  opacity: 0,
                  x: direction > 0 ? '74%' : '-74%',
                  y: '-50%',
                }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-1/2 top-1/2 z-10 w-[min(76%,24rem)]"
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative mx-auto grid h-32 w-full place-items-center sm:h-40"
                >
                  <img
                    src={activeVehicle.image}
                    alt={activeVehicle.title}
                    className={`h-auto object-contain opacity-95 drop-shadow-[0_18px_20px_rgba(0,0,0,0.34)] [filter:brightness(0)_invert(1)_sepia(12%)_saturate(420%)_hue-rotate(29deg)] ${activeVehicle.imageClassName}`}
                    draggable="false"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.28 }}
                    className="absolute right-[12%] top-0 rounded-full border border-[#283A2C]/10 bg-[#FFFFFF] px-4 py-2 text-sm font-black text-[#283A2C] shadow-[0_16px_34px_rgba(0,0,0,0.18)]"
                  >
                    Hi!
                    <span className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 bg-[#FFFFFF]" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.aside
              key={activeVehicle.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ delay: 0.22, duration: 0.35 }}
              className="flex min-h-[18rem] flex-col justify-between rounded-[1.5rem] border border-[#FFFFFF]/16 bg-[#F1EFEC] p-5 text-[#283A2C] shadow-[0_22px_54px_rgba(0,0,0,0.14)] sm:p-6"
            >
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#283A2C]/48">
                  Vehicle {activeIndex + 1} / {vehicles.length}
                </p>
                <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-[#283A2C] sm:text-4xl">
                  {activeVehicle.title}
                </h3>
                <p className="mt-4 text-sm font-semibold leading-7 text-[#283A2C]/64">
                  {activeVehicle.subtitle}
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="flex min-h-12 items-center justify-between gap-4 rounded-xl border-[1.5px] border-[#283A2C] bg-[#DADDC5] px-4 text-[#283A2C]">
                  <span className="inline-flex items-center gap-2 text-[0.64rem] font-black uppercase tracking-[0.16em]">
                    <Users size={16} />
                    Capacity
                  </span>
                  <span className="text-sm font-black">{activeVehicle.capacity}</span>
                </div>
                <div className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-[#283A2C]/14 bg-[#FFFFFF] px-4 text-[#283A2C]">
                  <span className="inline-flex items-center gap-2 text-[0.64rem] font-black uppercase tracking-[0.16em] text-[#283A2C]/58">
                    <Luggage size={16} />
                    Luggage
                  </span>
                  <span className="text-sm font-black">{activeVehicle.luggage}</span>
                </div>
              </div>
            </motion.aside>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex justify-center gap-2 sm:justify-start">
            {vehicles.map((vehicle, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={vehicle.id}
                  type="button"
                  aria-label={`Show ${vehicle.title}`}
                  onClick={() => showVehicle(index, index > activeIndex ? 1 : -1)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-9 bg-[#DADDC5]'
                      : 'w-2.5 bg-[#FFFFFF]/35 hover:bg-[#FFFFFF]/70'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex justify-center gap-3 sm:justify-end">
            <button
              type="button"
              aria-label="Previous vehicle"
              onClick={showPrevious}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF]/20 bg-[#FFFFFF]/10 text-[#FFFFFF] transition hover:bg-[#F1EFEC] hover:text-[#283A2C]"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next vehicle"
              onClick={showNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF]/20 bg-[#DADDC5] text-[#283A2C] transition hover:bg-[#F1EFEC]"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
