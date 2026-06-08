import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchPublicItineraries } from '../api/itineraryPlans.js';
import { fetchLocations, fetchTopLocations } from '../api/locations.js';
import { sriLankaVisuals } from '../data/visuals.js';
import Itineraries from './Itineraries.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

const titleLetterVariants = {
  enter: {
    filter: 'blur(12px)',
    opacity: 0,
    rotateX: -72,
    y: 86,
  },
  center: {
    filter: 'blur(0px)',
    opacity: 1,
    rotateX: 0,
    y: 0,
  },
  exit: {
    filter: 'blur(10px)',
    opacity: 0,
    rotateX: 42,
    y: -44,
  },
};

const fallbackHeroSlides = [
  {
    _id: 'fallback-1',
    description: 'Private routes shaped around ancient cities, soft coastlines, and hill country calm.',
    image: '',
    name: 'Sri Lanka',
  },
  {
    _id: 'fallback-2',
    description: 'Slow luxury journeys with room for temples, tea, wildlife, and warm island evenings.',
    image: '',
    name: 'Island Journey',
  },
  {
    _id: 'fallback-3',
    description: 'A cinematic travel plan for guests who want Sri Lanka handled with taste and care.',
    image: '',
    name: 'YOGO Route',
  },
];

const discoveryRouteStops = [
  {
    description:
      'Ancient rock fortress rising above the jungle, shaped by kings, frescoes, and mirror walls.',
    desktop: { left: 8.5, size: 88, top: 44 },
    name: 'Sigiriya',
    region: 'Lion Rock Fortress',
    image: sriLankaVisuals.hero,
  },
  {
    description:
      'A sacred hill-country city where temple rituals, lake walks, and old kingdoms still breathe.',
    desktop: { left: 24, size: 78, top: 60 },
    name: 'Kandy',
    region: 'Temple of the Tooth',
    image: sriLankaVisuals.train,
  },
  {
    description:
      'Misty tea hills, railway curves, forest trails, and slow mornings above the valleys.',
    desktop: { left: 44, size: 96, top: 71 },
    name: 'Ella',
    region: 'Nine Arch Bridge',
    image: sriLankaVisuals.hillTrain,
  },
  {
    description:
      'Dry-zone wilderness with leopards, elephants, wetlands, and golden evening safaris.',
    desktop: { left: 62, size: 76, top: 70 },
    name: 'Yala',
    region: 'National Park',
    image: sriLankaVisuals.elephants,
  },
  {
    description:
      'A fortified coastal city of ramparts, courtyards, boutiques, and Indian Ocean light.',
    desktop: { left: 78, size: 82, top: 59 },
    name: 'Galle',
    region: 'Dutch Fort',
    image: sriLankaVisuals.coast,
  },
  {
    description:
      'A crescent beach mood with soft surf, sunrise boats, coconut hills, and whale watching.',
    desktop: { left: 93, size: 88, top: 44 },
    name: 'Mirissa',
    region: 'South Coast',
    image: sriLankaVisuals.coast,
  },
];

function getLocationDescription(location) {
  return (
    location.shortDescription ||
    location.description ||
    'A curated Sri Lankan stop from the YOGO location collection.'
  );
}

function getPackageThemeName(pkg) {
  return pkg?.travelTheme?.title || pkg?.categoryId?.title || 'Sri Lanka';
}

function getPackageTourPlanHref(pkg) {
  const themeSlug = pkg?.travelTheme?.slug || pkg?.categoryId?.slug;

  return themeSlug ? `/tour-plans/${themeSlug}` : '/travel-themes';
}

function getPackageDuration(pkg) {
  const days = Number(pkg?.totalDays || 0);

  if (!days) return 'Custom journey';
  if (days === 1) return '1 Day';

  return `${Math.max(days - 1, 1)} Nights / ${days} Days`;
}

function getPackageLocations(pkg) {
  const names = [];

  (pkg?.days || []).forEach((day) => {
    (day?.locations || day?.selectedLocations || []).forEach((location) => {
      if (location?.name && !names.includes(location.name)) {
        names.push(location.name);
      }
    });
  });

  return names;
}

function getPackageImage(pkg) {
  if (pkg?.heroImage) return pkg.heroImage;

  const dayHero = (pkg?.days || []).find((day) => day?.heroImage)?.heroImage;
  if (dayHero) return dayHero;

  const locationWithImage = (pkg?.days || [])
    .flatMap((day) => day?.locations || day?.selectedLocations || [])
    .find((location) => location?.image);

  return locationWithImage?.image || '';
}

function getTopPackageSlotStyle(offset) {
  const slots = {
    '-2': {
      opacity: 0.36,
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%) translateX(-140%) translateY(-40px) scale(0.76) rotate(-3.5deg)',
      zIndex: 10,
    },
    '-1': {
      opacity: 0.82,
      pointerEvents: 'auto',
      transform: 'translate(-50%, -50%) translateX(-70%) translateY(-10px) scale(0.92) rotate(-1.5deg)',
      zIndex: 20,
    },
    0: {
      opacity: 1,
      pointerEvents: 'auto',
      transform: 'translate(-50%, -50%) translateX(0) translateY(42px) scale(1.12) rotate(0deg)',
      zIndex: 30,
    },
    1: {
      opacity: 0.82,
      pointerEvents: 'auto',
      transform: 'translate(-50%, -50%) translateX(70%) translateY(-10px) scale(0.92) rotate(1.5deg)',
      zIndex: 20,
    },
    2: {
      opacity: 0.36,
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%) translateX(140%) translateY(-40px) scale(0.76) rotate(3.5deg)',
      zIndex: 10,
    },
  };

  return slots[offset] || slots[0];
}

function getMobileTopPackageSlotStyle(offset) {
  const slots = {
    '-2': {
      opacity: 0.3,
      pointerEvents: 'none',
      transform:
        'translate(-50%, -50%) translateX(-76%) translateY(-22px) scale(0.7) rotate(-4deg)',
      zIndex: 10,
    },
    '-1': {
      opacity: 0.76,
      pointerEvents: 'auto',
      transform:
        'translate(-50%, -50%) translateX(-43%) translateY(-8px) scale(0.84) rotate(-2deg)',
      zIndex: 20,
    },
    0: {
      opacity: 1,
      pointerEvents: 'auto',
      transform:
        'translate(-50%, -50%) translateX(0) translateY(24px) scale(1) rotate(0deg)',
      zIndex: 30,
    },
    1: {
      opacity: 0.76,
      pointerEvents: 'auto',
      transform:
        'translate(-50%, -50%) translateX(43%) translateY(-8px) scale(0.84) rotate(2deg)',
      zIndex: 20,
    },
    2: {
      opacity: 0.3,
      pointerEvents: 'none',
      transform:
        'translate(-50%, -50%) translateX(76%) translateY(-22px) scale(0.7) rotate(4deg)',
      zIndex: 10,
    },
  };

  return slots[offset] || slots[0];
}

function getTopPackageOffsets(length) {
  if (length >= 5) return [-2, -1, 0, 1, 2];
  if (length === 4) return [-1, 0, 1, 2];
  if (length === 3) return [-1, 0, 1];
  if (length === 2) return [0, 1];
  return [0];
}

function PlaceholderVisual({ label }) {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center border-[1.5px] border-[#283A2C] bg-[#DADDC5] text-[#283A2C]">
      <div className="px-6 text-center">
        <p className="font-display text-3xl font-semibold">{label}</p>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.22em]">
          Adventure Is Calling
        </p>
      </div>
    </div>
  );
}

function AnimatedLocationTitle({ name }) {
  const characters = name.toUpperCase().split('');

  return (
    <AnimatePresence mode="wait">
      <motion.h1
        key={name}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ staggerChildren: 0.038 }}
        className="mt-4 max-w-[38rem] font-display text-4xl font-semibold uppercase leading-[0.96] text-[#FFFFFF] sm:text-5xl lg:text-6xl xl:text-7xl"
      >
        {characters.map((character, index) =>
          character === ' ' ? (
            <span
              key={`space-${index}`}
              aria-hidden="true"
              className="inline-block w-[0.28em]"
            />
          ) : (
            <motion.span
              key={`${character}-${index}`}
              variants={titleLetterVariants}
              transition={{ duration: 0.66, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block origin-bottom will-change-transform"
            >
              {character}
            </motion.span>
          ),
        )}
      </motion.h1>
    </AnimatePresence>
  );
}

function MobileHomeHero({
  activeSlideIndex,
  heroSlides,
  onNext,
  onPrevious,
  onSelect,
}) {
  const activeSlide = heroSlides[activeSlideIndex % heroSlides.length];
  const previousSlide =
    heroSlides[(activeSlideIndex - 1 + heroSlides.length) % heroSlides.length];
  const nextSlide = heroSlides[(activeSlideIndex + 1) % heroSlides.length];

  function handleDragEnd(_, info) {
    if (info.offset.x < -55 || info.velocity.x < -450) {
      onNext();
      return;
    }

    if (info.offset.x > 55 || info.velocity.x > 450) {
      onPrevious();
    }
  }

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#F1EFEC] pb-10 pt-[6.4rem] text-[#FFFFFF] md:hidden">
      <div className="relative mx-auto flex w-full max-w-[25rem] flex-col items-center">
        <div className="relative h-[calc(100svh-9.25rem)] min-h-[32rem] max-h-[39rem] w-full">
          {heroSlides.length > 1 && (
            <>
              <div className="pointer-events-none absolute inset-y-3 left-[3%] w-[88%] overflow-hidden rounded-lg border border-[#FFFFFF]/70 bg-[#283A2C] opacity-55 shadow-[0_18px_42px_rgba(40,58,44,0.18)]">
                {previousSlide.image ? (
                  <img
                    src={previousSlide.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderVisual label={previousSlide.name} />
                )}
                <div className="absolute inset-0 bg-black/50" />
              </div>

              <div className="pointer-events-none absolute inset-y-3 right-[3%] w-[88%] overflow-hidden rounded-lg border border-[#FFFFFF]/70 bg-[#283A2C] opacity-55 shadow-[0_18px_42px_rgba(40,58,44,0.18)]">
                {nextSlide.image ? (
                  <img
                    src={nextSlide.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderVisual label={nextSlide.name} />
                )}
                <div className="absolute inset-0 bg-black/50" />
              </div>
            </>
          )}

          <AnimatePresence initial={false} mode="wait">
            <motion.article
              key={activeSlide._id}
              drag={heroSlides.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.96, x: 36 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.96, x: -36 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-[6%] z-20 w-[88%] cursor-grab touch-pan-y overflow-hidden rounded-lg border border-[#FFFFFF]/20 bg-[#283A2C] shadow-[0_28px_70px_rgba(40,58,44,0.30)] active:cursor-grabbing"
            >
              {activeSlide.image ? (
                <motion.img
                  src={activeSlide.image}
                  alt={activeSlide.name}
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <PlaceholderVisual label={activeSlide.name} />
              )}

              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-transparent to-black/62" />

              <div className="relative flex h-full flex-col px-5 pb-5 pt-14">
                <div className="max-w-[88%]">
                  <p className="text-[0.58rem] font-black uppercase tracking-[0.28em] text-[#DADDC5]">
                    YOGO Destination
                  </p>
                  <h1 className="mt-3 break-words font-display text-[2.35rem] font-semibold leading-[0.98] text-[#FFFFFF]">
                    {activeSlide.name}
                  </h1>
                  <p className="mt-4 line-clamp-5 text-pretty text-xs leading-5 text-[#FFFFFF]/88">
                    {activeSlide.description}
                  </p>
                </div>

                <Link
                  to="/travel-themes"
                  className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#F1EFEC] px-5 text-center text-xs font-black uppercase tracking-[0.12em] text-[#283A2C] shadow-[0_12px_28px_rgba(0,0,0,0.30)] transition duration-300 active:scale-[0.98] active:bg-[#DADDC5]"
                >
                  Explore Our Packages
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.article>
          </AnimatePresence>

          {heroSlides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous destination"
                onClick={onPrevious}
                className="absolute left-0 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#FFFFFF]/22 bg-[#283A2C]/88 text-[#F1EFEC] shadow-[0_10px_24px_rgba(0,0,0,0.24)] backdrop-blur-md active:scale-95"
              >
                <ChevronLeft size={21} />
              </button>
              <button
                type="button"
                aria-label="Next destination"
                onClick={onNext}
                className="absolute right-0 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#FFFFFF]/22 bg-[#283A2C]/88 text-[#F1EFEC] shadow-[0_10px_24px_rgba(0,0,0,0.24)] backdrop-blur-md active:scale-95"
              >
                <ChevronRight size={21} />
              </button>
            </>
          )}
        </div>

        <div
          className="mt-3 flex min-h-5 items-center justify-center gap-2"
          aria-label="Destination slides"
        >
          {heroSlides.map((slide, index) => (
            <button
              key={slide._id}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Show ${slide.name}`}
              aria-current={index === activeSlideIndex ? 'true' : undefined}
              className={`h-2 rounded-full border border-[#283A2C] transition-all duration-300 ${
                index === activeSlideIndex
                  ? 'w-7 bg-[#283A2C]'
                  : 'w-2 bg-[#DADDC5]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeTravelThemesSection() {
  return (
    <div id="interactive-travel-themes" className="scroll-mt-28">
      <Itineraries embedded syncUrl={false} />
    </div>
  );
}

function DiscoverSriLankaRouteSection() {
  const [hoveredStop, setHoveredStop] = useState(null);
  const routePath =
    'M -130 64 C 170 218 440 248 622 238 C 815 228 1018 176 1330 50';
  const mobileRoutePath =
    'M -130 135 C 170 192 440 209 622 205 C 815 201 1018 181 1330 128';
  const planePath =
    'M20 6C22 6 24 8 24 10C24 12 22 13.2 20 12.6L13.5 10L8.5 18.5H6L9.8 10L3.5 11L2 14H0L1 10L0 6H2L3.5 9L9.8 10L6 1.5H8.5L13.5 10Z';

  return (
    <section className="relative overflow-hidden bg-[#283A2C] px-4 py-14 text-[#F1EFEC] sm:px-6 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-22%,rgba(218,221,197,0.12),transparent_24rem),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_48%)]" />
      <div className="pointer-events-none absolute -bottom-14 right-4 h-28 w-40 rounded-t-[5rem] bg-[#DADDC5]/14 md:h-36 md:w-56" />
      <div className="pointer-events-none absolute -bottom-12 right-36 hidden h-20 w-32 rounded-t-[4rem] bg-[#DADDC5]/9 md:block" />

      <div className="relative mx-auto max-w-[94rem]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-[0.66rem] font-black uppercase tracking-[0.42em] text-[#DADDC5]">
            DISCOVER
          </p>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-4xl font-semibold leading-[0.98] text-[#FFFFFF] sm:text-5xl lg:text-[3.35rem]">
            Discover Sri Lanka
            <span className="block">Through Local Eyes</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-[#F1EFEC]/70 sm:text-base">
            From ancient kingdoms and misty mountains to golden beaches and
            wildlife encounters, explore the island&apos;s most unforgettable
            places.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-1 hidden h-[21rem] max-w-[88rem] overflow-visible md:block lg:mt-2 lg:h-[22rem]">
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 1200 340"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={routePath}
              stroke="#DADDC5"
              strokeDasharray="6 10"
              strokeLinecap="round"
              strokeOpacity="0.38"
              strokeWidth="1.55"
            />
            <motion.path
              d={routePath}
              stroke="#DADDC5"
              strokeDasharray="6 10"
              strokeLinecap="round"
              strokeOpacity="0.82"
              strokeWidth="1.7"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-160px' }}
              transition={{ duration: 1.45, ease: 'easeInOut' }}
            />

            <g opacity="0.9">
              <path
                d={planePath}
                fill="#F1EFEC"
                transform="translate(-12 -10) scale(0.82)"
              />
              <animateMotion
                dur="9s"
                path={routePath}
                repeatCount="indefinite"
                rotate="auto"
              />
            </g>
            <g opacity="0.48">
              <path
                d={planePath}
                fill="#F1EFEC"
                transform="translate(-12 -10) scale(0.62)"
              />
              <animateMotion
                begin="3s"
                dur="9s"
                path={routePath}
                repeatCount="indefinite"
                rotate="auto"
              />
            </g>
          </svg>

          {discoveryRouteStops.map((stop, index) => {
            const isHovered = hoveredStop === index;

            return (
              <div
                key={stop.name}
                className="absolute z-10"
                style={{
                  left: `${stop.desktop.left}%`,
                  top: `${stop.desktop.top}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 22, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-120px' }}
                  transition={{
                    delay: 0.18 + index * 0.08,
                    duration: 0.56,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onMouseEnter={() => setHoveredStop(index)}
                  onMouseLeave={() => setHoveredStop(null)}
                  className="flex cursor-pointer flex-col items-center text-center"
                >
                  <span className="mb-2 h-2.5 w-2.5 rounded-full border border-[#283A2C] bg-[#DADDC5] shadow-[0_0_0_8px_rgba(218,221,197,0.12)]" />
                  <motion.div
                    animate={{
                      scale: isHovered ? 1.06 : 1,
                    }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="overflow-hidden rounded-full border-[1.5px] border-[#283A2C] bg-[#DADDC5] p-1 text-[#283A2C] shadow-[0_18px_42px_rgba(0,0,0,0.26)]"
                    style={{
                      height: stop.desktop.size,
                      width: stop.desktop.size,
                    }}
                  >
                    <img
                      src={stop.image}
                      alt={stop.name}
                      className="h-full w-full rounded-full object-cover"
                      style={{
                        filter: isHovered
                          ? 'grayscale(0%) contrast(1.03)'
                          : 'grayscale(100%) contrast(1.08)',
                        transition: 'filter 0.45s ease',
                      }}
                    />
                  </motion.div>
                  <p className="mt-2 text-sm font-bold leading-none text-[#FFFFFF]">
                    {stop.name}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="relative mx-auto mt-2 h-[18rem] w-full overflow-visible md:hidden">
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 1200 340"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={mobileRoutePath}
              stroke="#DADDC5"
              strokeDasharray="6 10"
              strokeLinecap="round"
              strokeOpacity="0.38"
              strokeWidth="2"
            />
            <motion.path
              d={mobileRoutePath}
              stroke="#DADDC5"
              strokeDasharray="6 10"
              strokeLinecap="round"
              strokeOpacity="0.82"
              strokeWidth="2.2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.45, ease: 'easeInOut' }}
            />

            <g opacity="0.9">
              <path
                d={planePath}
                fill="#F1EFEC"
                transform="translate(-12 -10) scale(1.15)"
              />
              <animateMotion
                dur="9s"
                path={mobileRoutePath}
                repeatCount="indefinite"
                rotate="auto"
              />
            </g>
            <g opacity="0.48">
              <path
                d={planePath}
                fill="#F1EFEC"
                transform="translate(-12 -10) scale(0.9)"
              />
              <animateMotion
                begin="3s"
                dur="9s"
                path={mobileRoutePath}
                repeatCount="indefinite"
                rotate="auto"
              />
            </g>
          </svg>

          {discoveryRouteStops.map((stop, index) => {
            const isHovered = hoveredStop === index;
            const mobileSize = Math.round(stop.desktop.size * 0.56);
            const mobileTop = 43 + (stop.desktop.top - 44) * 0.42;

            return (
              <div
                key={stop.name}
                className="absolute z-10"
                style={{
                  left: `${stop.desktop.left}%`,
                  top: `${mobileTop}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 14, scale: 0.88 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    delay: 0.12 + index * 0.07,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() =>
                    setHoveredStop((current) => (current === index ? null : index))
                  }
                  className="flex flex-col items-center text-center"
                >
                  <span className="mb-2 h-2 w-2 rounded-full border border-[#283A2C] bg-[#DADDC5] shadow-[0_0_0_6px_rgba(218,221,197,0.12)]" />
                  <motion.span
                    animate={{ scale: isHovered ? 1.08 : 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="block overflow-hidden rounded-full border-[1.5px] border-[#283A2C] bg-[#DADDC5] p-1 shadow-[0_14px_32px_rgba(0,0,0,0.28)]"
                    style={{ height: mobileSize, width: mobileSize }}
                  >
                    <img
                      src={stop.image}
                      alt={stop.name}
                      className="h-full w-full rounded-full object-cover"
                      style={{
                        filter: isHovered
                          ? 'grayscale(0%) contrast(1.03)'
                          : 'grayscale(100%) contrast(1.08)',
                        transition: 'filter 0.4s ease',
                      }}
                    />
                  </motion.span>
                  <span className="mt-2 whitespace-nowrap text-[0.64rem] font-bold leading-none text-[#FFFFFF]">
                    {stop.name}
                  </span>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TopLocationsSection({ locations = [], status = 'idle' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (activeIndex >= locations.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, locations.length]);

  useEffect(() => {
    if (isCarouselPaused || locations.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % locations.length);
    }, 4600);

    return () => window.clearInterval(timer);
  }, [isCarouselPaused, locations.length]);

  const visibleLocations = useMemo(() => {
    if (!locations.length) return [];

    if (locations.length === 1) {
      return [
        {
          index: activeIndex,
          isActive: true,
          location: locations[activeIndex],
          position: 'active',
        },
      ];
    }

    if (locations.length === 2) {
      return [
        {
          index: activeIndex,
          isActive: true,
          location: locations[activeIndex],
          position: 'active',
        },
        {
          index: (activeIndex + 1) % locations.length,
          isActive: false,
          location: locations[(activeIndex + 1) % locations.length],
          position: 'next',
        },
      ];
    }

    return [
      {
        index: (activeIndex - 1 + locations.length) % locations.length,
        isActive: false,
        location: locations[(activeIndex - 1 + locations.length) % locations.length],
        position: 'previous',
      },
      {
        index: activeIndex,
        isActive: true,
        location: locations[activeIndex],
        position: 'active',
      },
      {
        index: (activeIndex + 1) % locations.length,
        isActive: false,
        location: locations[(activeIndex + 1) % locations.length],
        position: 'next',
      },
    ];
  }, [activeIndex, locations]);

  if (status !== 'loading' && locations.length === 0) return null;

  function goToPreviousLocation() {
    if (!locations.length) return;
    setActiveIndex(
      (current) => (current - 1 + locations.length) % locations.length,
    );
  }

  function goToNextLocation() {
    if (!locations.length) return;
    setActiveIndex((current) => (current + 1) % locations.length);
  }

  function handleMobileLocationDragEnd(_, info) {
    if (info.offset.x < -55 || info.velocity.x < -450) {
      goToNextLocation();
      return;
    }

    if (info.offset.x > 55 || info.velocity.x > 450) {
      goToPreviousLocation();
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#283A2C] px-4 pb-[5.5rem] pt-[4.5rem] text-[#FFFFFF] sm:px-6 sm:py-16 lg:px-8 lg:py-[4.5rem]">
      <div className="mx-auto grid max-w-[92rem] gap-8 lg:min-h-[34rem] lg:grid-cols-[minmax(15rem,0.28fr)_minmax(0,0.72fr)] lg:items-center lg:gap-10">
        <div className="lg:self-start lg:pt-4">
          <div className="max-w-[20rem] sm:max-w-sm">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#DADDC5]">
              Popularly
            </p>
            <h2 className="mt-3 font-display text-[2.65rem] font-semibold leading-[0.98] text-[#F1EFEC] sm:text-5xl lg:text-[3.45rem]">
              <span className="block sm:inline">Most Popular</span>{' '}
              <span className="block sm:inline">Sri Lankan</span>
              <span className="block">Destinations</span>
            </h2>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-8 flex items-center justify-end gap-5 sm:mb-7">
            {locations.length > 0 && (
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#F1EFEC]/72">
                <span className="text-[#DADDC5]">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-12 bg-[#F1EFEC]/32" />
                <span>{String(locations.length).padStart(2, '0')}</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous top location"
                onClick={goToPreviousLocation}
                disabled={locations.length < 2}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF]/20 bg-[#FFFFFF]/8 text-[#FFFFFF] backdrop-blur-md transition hover:bg-[#FFFFFF] hover:text-[#283A2C] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                aria-label="Next top location"
                onClick={goToNextLocation}
                disabled={locations.length < 2}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF]/20 bg-[#FFFFFF]/8 text-[#FFFFFF] backdrop-blur-md transition hover:bg-[#FFFFFF] hover:text-[#283A2C] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <motion.div
            drag={locations.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={handleMobileLocationDragEnd}
            className="relative h-[26rem] cursor-grab touch-pan-y overflow-visible active:cursor-grabbing md:hidden"
            onPointerEnter={() => setIsCarouselPaused(true)}
            onPointerLeave={() => setIsCarouselPaused(false)}
          >
            {status === 'loading' && (
              <>
                <div className="absolute left-[-48vw] top-8 h-[21rem] w-[62vw] animate-pulse rounded-lg bg-[#DADDC5]/12" />
                <div className="absolute left-[6vw] top-0 h-[25rem] w-[80vw] animate-pulse rounded-lg bg-[#DADDC5]/20" />
                <div className="absolute right-[-48vw] top-8 h-[21rem] w-[62vw] animate-pulse rounded-lg bg-[#DADDC5]/12" />
              </>
            )}

            {status !== 'loading' &&
              visibleLocations.map(({ index, isActive, location, position }) => (
                <motion.button
                  key={location._id || index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  initial={{
                    opacity: 0,
                    scale: isActive ? 0.96 : 0.86,
                    y: 18,
                  }}
                  animate={{
                    opacity: isActive ? 1 : 0.52,
                    scale: isActive ? 1 : 0.9,
                    y: isActive ? 0 : 24,
                  }}
                  exit={{ opacity: 0, scale: 0.88, y: 18 }}
                  transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute top-0 overflow-hidden rounded-lg border-[1.5px] border-[#283A2C] bg-[#DADDC5] text-left text-[#283A2C] shadow-[0_24px_70px_rgba(0,0,0,0.28)] ${
                    isActive
                      ? 'left-[6vw] z-20 h-[25rem] w-[80vw]'
                      : position === 'previous'
                        ? 'left-[-48vw] z-10 h-[21rem] w-[62vw]'
                        : 'right-[-48vw] z-10 h-[21rem] w-[62vw]'
                  }`}
                >
                  {location.image ? (
                    <motion.img
                      src={location.image}
                      alt={location.name}
                      animate={{ scale: isActive ? 1.045 : 1.01 }}
                      transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PlaceholderVisual label={location.name} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#283A2C]/92 via-[#283A2C]/16 to-transparent" />
                  <div
                    className={`absolute inset-x-0 bottom-0 ${
                      isActive ? 'p-4' : 'p-3'
                    }`}
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#F1EFEC]/92 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#283A2C]">
                      <MapPin size={13} />
                      Top Location
                    </div>
                    <h3
                      className={`mt-3 line-clamp-2 break-words font-display font-semibold text-[#FFFFFF] ${
                        isActive
                          ? 'text-[2rem] leading-none'
                          : 'text-2xl leading-tight'
                      }`}
                    >
                      {location.name}
                    </h3>
                    <p
                      className={`mt-2 break-words text-[0.78rem] leading-5 text-[#F1EFEC]/78 ${
                        isActive ? 'line-clamp-2' : 'line-clamp-1'
                      }`}
                    >
                      {getLocationDescription(location)}
                    </p>
                    {isActive && (
                      <span className="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#DADDC5]">
                        Discover More
                        <ArrowRight size={15} />
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
          </motion.div>

          <div
            className="relative hidden h-[25rem] overflow-hidden md:block lg:h-[28rem] xl:h-[29rem]"
            onPointerEnter={() => setIsCarouselPaused(true)}
            onPointerLeave={() => setIsCarouselPaused(false)}
          >
            {status === 'loading' && (
              <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center gap-6 md:gap-8 lg:gap-10">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className={`shrink-0 animate-pulse rounded-lg bg-[#DADDC5]/18 ${
                      item === 1
                        ? 'h-[20rem] w-[min(82vw,34rem)] sm:h-[23rem] md:w-[34rem] lg:h-[24.5rem] lg:w-[34rem] xl:h-[25.5rem] xl:w-[37rem]'
                        : 'hidden h-[16rem] w-[12rem] md:block lg:h-[18.5rem] lg:w-[13.5rem] xl:h-[19.5rem] xl:w-[14.5rem]'
                    }`}
                  />
                ))}
              </div>
            )}

            {status !== 'loading' && visibleLocations.length > 0 && (
              <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center gap-6 md:gap-8 lg:gap-10 xl:gap-12">
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleLocations.map(({ index, isActive, location, position }) => (
                    <motion.button
                      key={location._id || index}
                      layout="position"
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      initial={{
                        opacity: 0,
                        scale: isActive ? 0.96 : 0.88,
                        x: position === 'previous' ? -90 : 90,
                      }}
                      animate={{
                        opacity: isActive ? 1 : 0.72,
                        scale: isActive ? 1 : 0.94,
                        y: isActive ? 0 : 18,
                        zIndex: isActive ? 30 : 10,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        x: position === 'previous' ? -90 : 90,
                      }}
                      whileHover={{
                        opacity: 1,
                        scale: isActive ? 1.015 : 0.97,
                      }}
                      transition={{
                        duration: 0.62,
                        ease: 'easeInOut',
                        layout: { duration: 0.62, ease: 'easeInOut' },
                      }}
                      className={`group relative shrink-0 overflow-hidden rounded-lg border-[1.5px] border-[#283A2C] bg-[#DADDC5] text-left text-[#283A2C] shadow-[0_24px_70px_rgba(0,0,0,0.24)] ${
                        isActive
                          ? 'h-[20rem] w-[min(82vw,34rem)] sm:h-[23rem] md:w-[34rem] lg:h-[24.5rem] lg:w-[34rem] xl:h-[25.5rem] xl:w-[37rem]'
                          : 'hidden h-[16rem] w-[12rem] md:block lg:h-[18.5rem] lg:w-[13.5rem] xl:h-[19.5rem] xl:w-[14.5rem]'
                      }`}
                    >
                      {location.image ? (
                        <motion.img
                          src={location.image}
                          alt={location.name}
                          animate={{ scale: isActive ? 1.045 : 1.01 }}
                          transition={{ duration: 0.62, ease: 'easeInOut' }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <PlaceholderVisual label={location.name} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#283A2C]/90 via-[#283A2C]/18 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#F1EFEC]/92 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#283A2C] sm:text-[0.62rem]">
                          <MapPin size={13} />
                          Top Location
                        </div>
                        <h3
                          className={`mt-3 line-clamp-1 break-words font-display font-semibold text-[#FFFFFF] ${
                            isActive ? 'text-3xl sm:text-4xl lg:text-[2.55rem]' : 'text-2xl'
                          }`}
                        >
                          {location.name}
                        </h3>
                        <p
                          className={`mt-2 max-w-lg break-words text-sm leading-6 text-[#F1EFEC]/78 ${
                            isActive ? 'line-clamp-2' : 'line-clamp-1'
                          }`}
                        >
                          {getLocationDescription(location)}
                        </p>
                        {isActive && (
                          <span className="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#DADDC5] sm:text-xs">
                            Discover More
                            <ArrowRight size={15} />
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TopPackagesSection({ packages = [], status = 'idle' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const length = packages.length;

  useEffect(() => {
    if (activeIndex >= length) {
      setActiveIndex(0);
    }
  }, [activeIndex, length]);

  useEffect(() => {
    if (isCarouselPaused || length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [isCarouselPaused, length]);

  if (status !== 'loading' && length === 0) return null;

  function goToPreviousPackage() {
    if (!length) return;
    setActiveIndex((current) => (current - 1 + length) % length);
  }

  function goToNextPackage() {
    if (!length) return;
    setActiveIndex((current) => (current + 1) % length);
  }

  const offsets = getTopPackageOffsets(length);

  return (
    <section className="relative overflow-hidden bg-[#283A2C] px-4 py-16 text-[#F1EFEC] sm:px-6 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(218,221,197,0.12),transparent_24rem),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_45%)]" />
      <div className="pointer-events-none absolute left-[18%] top-[36%] h-72 w-72 rounded-full bg-[#DADDC5]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-14 right-[18%] h-80 w-80 rounded-full bg-[#FFFFFF]/5 blur-3xl" />

      <div className="relative mx-auto max-w-[78rem]">
        <div className="flex flex-col gap-6 border-b border-[#FFFFFF]/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#DADDC5]">
              Packages
            </p>
            <h2 className="mt-2 max-w-md text-balance font-display text-4xl font-semibold uppercase leading-[0.95] text-[#FFFFFF] sm:text-5xl lg:text-[3.25rem]">
              Top Packages That
              <span className="block">For You</span>
            </h2>
          </div>

          <div className="flex items-center gap-5">
            {length > 0 && (
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#F1EFEC]/60">
                <span className="text-[#DADDC5]">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className="relative h-px w-14 overflow-hidden bg-[#FFFFFF]/18">
                  <span
                    className="absolute inset-y-0 left-0 bg-[#DADDC5] transition-all duration-500"
                    style={{ width: `${((activeIndex + 1) / length) * 100}%` }}
                  />
                </span>
                <span>{String(length).padStart(2, '0')}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous top package"
                onClick={goToPreviousPackage}
                disabled={length < 2}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#FFFFFF]/18 bg-[#FFFFFF]/6 text-[#FFFFFF] transition hover:bg-[#FFFFFF] hover:text-[#283A2C] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next top package"
                onClick={goToNextPackage}
                disabled={length < 2}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#FFFFFF]/18 bg-[#FFFFFF]/6 text-[#FFFFFF] transition hover:bg-[#FFFFFF] hover:text-[#283A2C] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div
          className="relative mt-14 min-h-[31rem] md:min-h-[35rem]"
          onPointerEnter={() => setIsCarouselPaused(true)}
          onPointerLeave={() => setIsCarouselPaused(false)}
        >
          {status === 'loading' && (
            <div className="flex h-[28rem] items-center justify-center">
              <div className="h-[23rem] w-[18rem] animate-pulse rounded-[2rem] bg-[#DADDC5]/14 shadow-[0_24px_80px_rgba(0,0,0,0.24)]" />
            </div>
          )}

          {status !== 'loading' && length > 0 && (
            <>
              <div className="hidden md:block">
                {offsets.map((offset) => {
                  const targetIndex = (activeIndex + offset + length) % length;
                  const pkg = packages[targetIndex];
                  const isSelected = offset === 0;
                  const routeLocations = getPackageLocations(pkg);
                  const themeName = getPackageThemeName(pkg);
                  const image = getPackageImage(pkg);

                  return (
                    <div
                      key={pkg._id || pkg.slug || targetIndex}
                      role="button"
                      tabIndex={isSelected ? -1 : 0}
                      onClick={() => {
                        if (isSelected) return;
                        setActiveIndex(targetIndex);
                      }}
                      onKeyDown={(event) => {
                        if (isSelected) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setActiveIndex(targetIndex);
                        }
                      }}
                      className={`group absolute left-1/2 top-1/2 h-[24.5rem] w-[18rem] will-change-transform overflow-hidden rounded-[2rem] border text-left shadow-[0_28px_80px_rgba(0,0,0,0.38)] transition-[transform,opacity,filter,border-color,box-shadow] duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isSelected
                          ? 'border-[#DADDC5]/50 shadow-[0_38px_100px_rgba(0,0,0,0.46)] ring-4 ring-[#FFFFFF]/10'
                          : 'border-[#FFFFFF]/8 hover:brightness-110'
                      }`}
                      style={getTopPackageSlotStyle(offset)}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={pkg.title}
                          className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110"
                        />
                      ) : (
                        <PlaceholderVisual label={pkg.title} />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#07160D] via-[#07160D]/62 to-[#283A2C]/10" />
                      <div className="absolute left-5 top-5 rounded-full border border-[#FFFFFF]/10 bg-black/38 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#DADDC5] backdrop-blur-md">
                        {themeName}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-5 text-[#FFFFFF]">
                        <div className="mb-3 flex gap-1 text-[#DADDC5]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-3.5 w-3.5 fill-current stroke-none"
                            />
                          ))}
                        </div>

                        <h3 className="line-clamp-2 text-xl font-black uppercase leading-tight tracking-[-0.02em] text-[#FFFFFF] transition group-hover:text-[#DADDC5]">
                          {pkg.title}
                        </h3>

                        <div className="mt-3 space-y-2 text-xs font-semibold text-[#F1EFEC]/78">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-[#DADDC5]" />
                            <span>{getPackageDuration(pkg)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#DADDC5]" />
                            <span className="truncate">
                              {routeLocations.length
                                ? routeLocations.slice(0, 3).join(' / ')
                                : themeName}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-[#FFFFFF]/10 pt-4">
                          <div>
                            <span className="block text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#F1EFEC]/42">
                              Journey
                            </span>
                            <span className="text-sm font-black text-[#FFFFFF]">
                              {pkg.totalDays || 'Custom'} Days
                            </span>
                          </div>

                          {isSelected ? (
                            <Link
                              to={getPackageTourPlanHref(pkg)}
                              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#283A2C] bg-[#DADDC5] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#283A2C] transition duration-300 ease-out hover:bg-[#283A2C] hover:text-[#DADDC5]"
                              onClick={(event) => event.stopPropagation()}
                            >
                              View Tour
                              <ArrowRight size={13} />
                            </Link>
                          ) : (
                            <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#DADDC5]/74">
                              Select
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mx-auto w-full max-w-[25rem] md:hidden">
                <div className="relative h-[23rem] w-full">
                  {offsets.map((offset) => {
                    const targetIndex = (activeIndex + offset + length) % length;
                    const pkg = packages[targetIndex];
                    const isSelected = offset === 0;
                    const routeLocations = getPackageLocations(pkg);
                    const themeName = getPackageThemeName(pkg);
                    const image = getPackageImage(pkg);

                    return (
                      <div
                        key={pkg._id || pkg.slug || targetIndex}
                        role="button"
                        tabIndex={isSelected ? -1 : 0}
                        onClick={() => {
                          if (isSelected) return;
                          setActiveIndex(targetIndex);
                        }}
                        onKeyDown={(event) => {
                          if (isSelected) return;
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setActiveIndex(targetIndex);
                          }
                        }}
                        className={`group absolute left-1/2 top-1/2 h-[20rem] w-[14.5rem] will-change-transform overflow-hidden rounded-[1.35rem] border text-left shadow-[0_24px_64px_rgba(0,0,0,0.38)] transition-[transform,opacity,filter,border-color,box-shadow] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isSelected
                            ? 'border-[#DADDC5]/60 shadow-[0_32px_82px_rgba(0,0,0,0.48)] ring-4 ring-[#FFFFFF]/10'
                            : 'border-[#FFFFFF]/10'
                        }`}
                        style={getMobileTopPackageSlotStyle(offset)}
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={pkg.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <PlaceholderVisual label={pkg.title} />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#07160D] via-[#07160D]/62 to-[#283A2C]/10" />
                        <div className="absolute left-3.5 top-3.5 rounded-full border border-[#FFFFFF]/10 bg-black/38 px-2 py-1 text-[0.5rem] font-black uppercase tracking-[0.12em] text-[#DADDC5] backdrop-blur-md">
                          {themeName}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4 text-[#FFFFFF]">
                          <div className="mb-2 flex gap-0.5 text-[#DADDC5]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-3 w-3 fill-current stroke-none"
                              />
                            ))}
                          </div>

                          <h3 className="line-clamp-2 text-base font-black uppercase leading-tight text-[#FFFFFF]">
                            {pkg.title}
                          </h3>

                          <div className="mt-2.5 space-y-1.5 text-[0.62rem] font-semibold text-[#F1EFEC]/78">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="h-3 w-3 text-[#DADDC5]" />
                              <span>{getPackageDuration(pkg)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 shrink-0 text-[#DADDC5]" />
                              <span className="truncate">
                                {routeLocations.length
                                  ? routeLocations.slice(0, 2).join(' / ')
                                  : themeName}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3.5 flex items-center justify-between border-t border-[#FFFFFF]/10 pt-3">
                            <span className="text-xs font-black text-[#FFFFFF]">
                              {pkg.totalDays || 'Custom'} Days
                            </span>
                            {isSelected ? (
                              <Link
                                to={getPackageTourPlanHref(pkg)}
                                onClick={(event) => event.stopPropagation()}
                                className="rounded-full border-[1.5px] border-[#283A2C] bg-[#DADDC5] px-3 py-1.5 text-[0.5rem] font-black uppercase tracking-[0.1em] text-[#283A2C]"
                              >
                                View Tour
                              </Link>
                            ) : (
                              <span className="text-[0.5rem] font-black uppercase tracking-[0.14em] text-[#DADDC5]/76">
                                Select
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-center gap-2">
                  {packages.map((pkg, index) => (
                    <button
                      key={pkg._id || pkg.slug}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Show ${pkg.title}`}
                      className={`h-1.5 rounded-full transition-all ${
                        index === activeIndex
                          ? 'w-7 bg-[#DADDC5]'
                          : 'w-1.5 bg-[#FFFFFF]/24'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [locations, setLocations] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [topLocationsStatus, setTopLocationsStatus] = useState('loading');
  const [topPackages, setTopPackages] = useState([]);
  const [topPackagesStatus, setTopPackagesStatus] = useState('loading');
  const adminHeroSlides = useMemo(
    () =>
      locations
        .filter((location) => location?.image)
        .slice(0, 8)
        .map((location) => ({
          _id: location._id,
          description: getLocationDescription(location),
          image: location.image,
          name: location.name,
        })),
    [locations],
  );
  const heroSlides =
    adminHeroSlides.length > 0 ? adminHeroSlides : fallbackHeroSlides;
  const activeSlide = heroSlides[activeSlideIndex % heroSlides.length];
  const visibleCardCount = Math.min(3, heroSlides.length);
  const previewSlides = useMemo(
    () =>
      Array.from({ length: visibleCardCount }, (_, index) => {
        return heroSlides[(activeSlideIndex + index) % heroSlides.length];
      }),
    [activeSlideIndex, heroSlides, visibleCardCount],
  );

  useEffect(() => {
    let isMounted = true;

    fetchLocations()
      .then((data) => {
        if (!isMounted) return;
        setLocations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setLocations([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setTopLocationsStatus('loading');
    fetchTopLocations()
      .then((data) => {
        if (!isMounted) return;
        setTopLocations(Array.isArray(data) ? data : []);
        setTopLocationsStatus('success');
      })
      .catch(() => {
        if (!isMounted) return;
        setTopLocations([]);
        setTopLocationsStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setTopPackagesStatus('loading');
    fetchPublicItineraries({
      isTopActivityPackage: 'true',
      status: 'published',
    })
      .then((data) => {
        if (!isMounted) return;
        setTopPackages(Array.isArray(data) ? data : []);
        setTopPackagesStatus('success');
      })
      .catch(() => {
        if (!isMounted) return;
        setTopPackages([]);
        setTopPackagesStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeSlideIndex >= heroSlides.length) {
      setActiveSlideIndex(0);
    }
  }, [activeSlideIndex, heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  function goToPreviousSlide() {
    setActiveSlideIndex(
      (current) => (current - 1 + heroSlides.length) % heroSlides.length,
    );
  }

  function goToNextSlide() {
    setActiveSlideIndex((current) => (current + 1) % heroSlides.length);
  }

  return (
    <div className="overflow-hidden bg-obsidian">
      <MobileHomeHero
        activeSlideIndex={activeSlideIndex}
        heroSlides={heroSlides}
        onNext={goToNextSlide}
        onPrevious={goToPreviousSlide}
        onSelect={setActiveSlideIndex}
      />

      <section className="relative hidden min-h-screen overflow-hidden bg-[#283A2C] px-4 pb-12 pt-28 text-[#FFFFFF] md:block md:px-6 lg:px-8 lg:pb-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide._id}
            initial={{ opacity: 0, scale: 1.08, x: 72 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: -72 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {activeSlide.image ? (
              <motion.img
                src={activeSlide.image}
                alt={activeSlide.name}
                initial={{ scale: 1.14 }}
                animate={{ scale: 1.04 }}
                transition={{ duration: 5.2, ease: 'linear' }}
                className="h-full w-full object-cover"
              />
            ) : (
              <PlaceholderVisual label={activeSlide.name} />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[#283A2C]/42" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#283A2C]/92 via-[#283A2C]/52 to-[#283A2C]/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#283A2C]/76 via-transparent to-[#283A2C]/32" />

        <div className="pointer-events-none absolute bottom-16 left-6 top-28 hidden w-px bg-[#FFFFFF]/22 lg:block">
          <span className="absolute -left-3 top-1/3 grid h-7 w-7 place-items-center rounded-full bg-[#FFFFFF]/18 text-xs font-black backdrop-blur-md">
            {String(activeSlideIndex + 1).padStart(2, '0')}
          </span>
          <span className="absolute bottom-0 left-1/2 h-1/4 w-px -translate-x-1/2 bg-[#FFFFFF]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-[92rem] items-center gap-6 lg:grid-cols-12 lg:gap-10">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
            className="relative z-10 lg:col-span-6"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="text-xs font-black uppercase tracking-[0.28em] text-[#F1EFEC] sm:text-sm"
            >
              YOGO Tours
            </motion.p>
            <AnimatedLocationTitle name={activeSlide.name} />
            <AnimatePresence mode="wait">
              <motion.p
                key={`${activeSlide._id}-description`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 max-w-[32.5rem] text-pretty text-sm leading-7 text-[#F1EFEC]/84 sm:text-base"
              >
                {activeSlide.description}
              </motion.p>
            </AnimatePresence>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/travel-themes"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border-[1.5px] border-transparent bg-[#F1EFEC] px-6 text-sm font-black uppercase tracking-[0.12em] text-[#283A2C] transition duration-300 ease-out hover:border-[#283A2C] hover:bg-[#DADDC5]"
              >
                Explore
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/day-tours"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#FFFFFF]/28 bg-[#283A2C]/24 px-6 text-sm font-black uppercase tracking-[0.12em] text-[#FFFFFF] backdrop-blur-md transition hover:bg-[#FFFFFF] hover:text-[#283A2C]"
              >
                Day Tour Plans
                <CalendarDays size={18} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 mt-6 min-w-0 lg:col-span-6 lg:mt-0"
          >
            <div
              className="flex snap-x items-center justify-start gap-4 overflow-x-auto px-1 pb-5 sm:gap-5 lg:justify-center lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0"
              style={{ perspective: '1200px' }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {previewSlides.map((slide, index) => (
                  <motion.button
                    key={slide._id}
                    layout="position"
                    type="button"
                    onClick={() =>
                      setActiveSlideIndex(
                        (activeSlideIndex + index) % heroSlides.length,
                      )
                    }
                    initial={{ opacity: 0, scale: 0.9, x: 130, y: 24, rotateY: -10 }}
                    animate={{
                      filter:
                        index === 0
                          ? 'saturate(1.08) brightness(1.04)'
                          : 'saturate(0.92) brightness(0.94)',
                      opacity: 1,
                      rotateY: index === 0 ? 0 : -3,
                      scale: index === 0 ? 1.04 : 0.98,
                      x: 0,
                      y: index === 0 ? -16 : 0,
                      z: index === 0 ? 36 : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.86, x: -130, y: 24, rotateY: 10 }}
                    whileHover={{
                      scale: index === 0 ? 1.06 : 1.02,
                      y: index === 0 ? -18 : -6,
                    }}
                    transition={{
                      delay: index * 0.04,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                      layout: {
                        duration: 0.76,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      zIndex: index === 0 ? 40 : 20 - index,
                    }}
                    className={`group relative shrink-0 snap-center overflow-hidden rounded-lg border-[1.5px] bg-[#DADDC5] text-left text-[#283A2C] ${
                      index === 0
                        ? 'h-64 w-[68vw] max-w-[17rem] border-[#283A2C] shadow-[0_28px_78px_rgba(0,0,0,0.40)] sm:h-72 sm:w-56 lg:h-[21rem] lg:w-[13.75rem]'
                        : 'h-56 w-[58vw] max-w-[14rem] border-[#283A2C] shadow-[0_20px_54px_rgba(40,58,44,0.32)] sm:h-64 sm:w-48 lg:h-[19rem] lg:w-[12rem]'
                    }`}
                  >
                    {slide.image ? (
                      <motion.img
                        src={slide.image}
                        alt={slide.name}
                        animate={{ scale: index === 0 ? 1.06 : 1.01 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PlaceholderVisual label={slide.name} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#283A2C]/76 via-[#283A2C]/10 to-transparent" />
                    <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[#FFFFFF] text-[#283A2C]">
                      <MapPin size={17} />
                    </span>
                    <span className="absolute left-4 top-4 max-w-[70%] text-sm font-black uppercase tracking-[0.08em] text-[#FFFFFF]">
                      {slide.name}
                    </span>
                    {index === 0 && (
                      <motion.span
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.35 }}
                        className="absolute bottom-4 left-4 rounded-full bg-[#FFFFFF] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#283A2C]"
                      >
                        Now Showing
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-5 flex justify-center gap-3 lg:mt-6">
              <button
                type="button"
                aria-label="Previous hero image"
                onClick={goToPreviousSlide}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF]/20 bg-[#FFFFFF]/18 text-[#FFFFFF] backdrop-blur-md transition hover:bg-[#FFFFFF] hover:text-[#283A2C]"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next hero image"
                onClick={goToNextSlide}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFFFFF]/20 bg-[#FFFFFF]/18 text-[#FFFFFF] backdrop-blur-md transition hover:bg-[#FFFFFF] hover:text-[#283A2C]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="relative mx-auto mt-2 flex max-w-[92rem] items-center justify-end gap-4 text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#FFFFFF]/72">
          <span>{String(activeSlideIndex + 1).padStart(2, '0')}</span>
          <span className="h-px w-16 bg-[#FFFFFF]/40" />
          <span>{String(heroSlides.length).padStart(2, '0')}</span>
        </div>
      </section>

      <HomeTravelThemesSection />

      <TopLocationsSection
        locations={topLocations}
        status={topLocationsStatus}
      />

      <DiscoverSriLankaRouteSection />

      <TopPackagesSection
        packages={topPackages}
        status={topPackagesStatus}
      />
    </div>
  );
}
