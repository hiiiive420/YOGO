import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flower2,
  Gem,
  Leaf,
  Luggage,
  Loader2,
  MapPin,
  MessageCircle,
  Mountain,
  Navigation,
  PawPrint,
  Route,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchItineraryDays } from '../api/itineraryDays';
import { fetchPublicItineraries } from '../api/itineraryPlans';
import { fetchTravelThemes } from '../api/travelThemes';
import ContactInquiryModal from '../components/contact/ContactInquiryModal.jsx';
import VehicleRoadCarousel from '../components/tourPlans/VehicleRoadCarousel.jsx';

const TravelThemeRouteMap = lazy(
  () => import('../components/maps/TravelThemeRouteMap.jsx'),
);

const fallbackPackageFaqs = [
  {
    question: 'Can this tour be customized?',
    answer:
      'Yes, our team can customize route, hotels, pacing, and experiences around your travel style.',
  },
  {
    question: 'Are private vehicles included?',
    answer:
      'Private transport can be arranged for the full journey with a driver who understands the route.',
  },
  {
    question: 'Is this tour suitable for families?',
    answer:
      'Yes, the itinerary can be adjusted for families, couples, friends, and private groups.',
  },
];

function getId(value) {
  return typeof value === 'string' ? value : value?._id || value?.id || '';
}

function getDurationLabel(plan) {
  const days = Number(plan?.totalDays || 0);

  if (!days) return '';

  const nights = Math.max(days - 1, 0);

  if (!nights) return `${days} Day`;

  return `${nights} Nights / ${days} Days`;
}

function normalizeStop(location, day, locationIndex) {
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id: `${day._id}-${getId(location)}-${locationIndex}`,
    locationId: getId(location),
    name: location.name,
    slug: location.slug,
    image: location.image,
    description: location.description,
    latitude,
    longitude,
    dayNumber: day.dayNumber,
    dayTitle: day.title,
    daySummary: day.description,
    travelTime: day.travelTime,
  };
}

function getDayLocations(day) {
  return day.locations || day.selectedLocations || [];
}

function buildRouteStops(days) {
  return [...days]
    .sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber))
    .flatMap((day) =>
      getDayLocations(day)
        .map((location, index) => normalizeStop(location, day, index))
        .filter(Boolean),
    );
}

function getThemeHeroImage(theme) {
  return theme?.heroImage || theme?.thumbnailImage || '';
}

function getThemeDialIcon(theme) {
  const label = `${theme?.title || ''} ${theme?.slug || ''}`.toLowerCase();

  if (/(wildlife|safari|animal)/.test(label)) return PawPrint;
  if (/(nature|eco|forest|green)/.test(label)) return Leaf;
  if (/(wellness|yoga|spa|meditation)/.test(label)) return Flower2;
  if (/(luxury|premium|exclusive)/.test(label)) return Gem;
  if (/(sport|adventure|hike|trek|active)/.test(label)) return Mountain;

  return Sparkles;
}

function MobileThemeDial({
  lockedTheme,
  onSelect,
  selectedThemeSlug,
  themeHero,
  themes,
}) {
  const railRef = useRef(null);
  const itemRefs = useRef(new Map());
  const frameRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const positionedLoopRef = useRef('');
  const themeBySlug = useMemo(
    () => new Map(themes.map((theme) => [theme.slug, theme])),
    [themes],
  );
  const loopedThemes = useMemo(() => {
    const copies = themes.length > 1 ? 3 : 1;

    return Array.from({ length: copies }, (_, copyIndex) =>
      themes.map((theme) => ({ copyIndex, theme })),
    ).flat();
  }, [themes]);
  const loopSignature = themes
    .map((theme) => theme._id || theme.slug)
    .join('|');

  const updateDialPositions = useCallback(() => {
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      if (!rail) return;

      const railCenter = rail.clientWidth / 2;
      const arcRadius = rail.clientWidth / 2;

      itemRefs.current.forEach((item) => {
        const itemCenter =
          item.offsetLeft + item.offsetWidth / 2 - rail.scrollLeft;
        const signedDistance = Math.min(
          Math.max((itemCenter - railCenter) / arcRadius, -1),
          1,
        );
        const distance = Math.abs(signedDistance);
        const y = (1 - distance * distance) * 28;
        const rotation = signedDistance * -4;

        item.style.transform = `translateY(${y}px) rotate(${rotation}deg)`;
      });
    });
  }, []);

  const keepLoopCentered = useCallback(() => {
    const rail = railRef.current;
    const anchorTheme = themes[0];

    if (!rail || themes.length < 2 || !anchorTheme) return;

    const anchorKey = anchorTheme._id || anchorTheme.slug;
    const middleAnchor = itemRefs.current.get(`1-${anchorKey}`);
    const trailingAnchor = itemRefs.current.get(`2-${anchorKey}`);

    if (!middleAnchor || !trailingAnchor) return;

    const cycleWidth = trailingAnchor.offsetLeft - middleAnchor.offsetLeft;
    const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;

    if (viewportCenter < middleAnchor.offsetLeft) {
      rail.scrollLeft += cycleWidth;
    } else if (viewportCenter >= trailingAnchor.offsetLeft) {
      rail.scrollLeft -= cycleWidth;
    }
  }, [themes]);

  useEffect(() => {
    const rail = railRef.current;
    const selectedTheme = themeBySlug.get(selectedThemeSlug);

    if (!rail || !selectedTheme) {
      updateDialPositions();
      return;
    }

    const matchingItems = [...itemRefs.current.values()].filter(
      (item) => item.dataset.themeSlug === selectedThemeSlug,
    );
    const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;
    const middleKey = `1-${selectedTheme._id || selectedTheme.slug}`;
    const shouldPositionMiddleCopy =
      themes.length > 1 && positionedLoopRef.current !== loopSignature;
    const selectedItem = shouldPositionMiddleCopy
      ? itemRefs.current.get(middleKey)
      : matchingItems.reduce((closest, item) => {
          if (!closest) return item;

          const itemDistance = Math.abs(
            item.offsetLeft + item.offsetWidth / 2 - viewportCenter,
          );
          const closestDistance = Math.abs(
            closest.offsetLeft + closest.offsetWidth / 2 - viewportCenter,
          );

          return itemDistance < closestDistance ? item : closest;
        }, null);

    if (selectedItem) {
      rail.scrollTo({
        behavior: shouldPositionMiddleCopy ? 'auto' : 'smooth',
        left:
          selectedItem.offsetLeft -
          (rail.clientWidth - selectedItem.offsetWidth) / 2,
      });
    }

    positionedLoopRef.current = loopSignature;
    updateDialPositions();
  }, [
    loopSignature,
    selectedThemeSlug,
    themeBySlug,
    themes.length,
    updateDialPositions,
  ]);

  useEffect(() => {
    updateDialPositions();
    window.addEventListener('resize', updateDialPositions);

    return () => {
      window.removeEventListener('resize', updateDialPositions);
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(scrollTimerRef.current);
    };
  }, [updateDialPositions]);

  function handleRailScroll() {
    keepLoopCentered();
    updateDialPositions();

    window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      const rail = railRef.current;
      if (!rail) return;

      const railBounds = rail.getBoundingClientRect();
      const center = railBounds.left + railBounds.width / 2;
      let closestTheme = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item) => {
        const theme = themeBySlug.get(item.dataset.themeSlug);
        if (!theme) return;

        const itemBounds = item.getBoundingClientRect();
        const distance = Math.abs(
          itemBounds.left + itemBounds.width / 2 - center,
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestTheme = theme;
        }
      });

      if (closestTheme && closestTheme.slug !== selectedThemeSlug) {
        onSelect(closestTheme);
      }
    }, 140);
  }

  function renderThemeContent(theme, isActive) {
    const Icon = getThemeDialIcon(theme);
    const iconImage = theme?.iconImage || theme?.icon || '';

    return (
      <motion.span
        animate={{
          opacity: isActive ? 1 : 0.72,
        }}
        initial={false}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="relative flex flex-col items-center"
      >
        <motion.span
          animate={{ scale: isActive ? 1 : 0.92 }}
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className={`relative z-10 grid place-items-center overflow-hidden rounded-full border transition duration-300 ${
            isActive
              ? 'h-12 w-12 border-[#283A2C] bg-[#283A2C] text-[#FFFFFF] shadow-[0_8px_20px_rgba(40,58,44,0.25)]'
              : 'h-12 w-12 border-transparent bg-transparent text-[#283A2C]/60'
          }`}
        >
          {iconImage ? (
            <img
              src={iconImage}
              alt=""
              className={`h-full w-full object-contain transition duration-300 ${
                isActive
                  ? 'p-3 brightness-0 invert'
                  : 'p-1 grayscale opacity-60'
              }`}
            />
          ) : (
            <Icon size={isActive ? 30 : 28} strokeWidth={isActive ? 2 : 2.2} />
          )}
        </motion.span>
        <span
          className={`relative z-10 line-clamp-2 min-h-[1.15rem] max-w-[4.5rem] text-center text-[0.5625rem] font-bold uppercase leading-[1.05] tracking-[0.055em] transition ${
            isActive
              ? 'mt-0 text-[#283A2C]'
              : 'mt-0 text-[#283A2C]/65'
          }`}
        >
          {theme.title}
        </span>
      </motion.span>
    );
  }

  return (
    <div className="mt-1 md:hidden">
      <div className="text-center">
        <h2 className="text-xl font-bold leading-none text-[#283A2C]">
          Select Your Package
        </h2>
        <span className="mx-auto mt-1 block h-0.5 w-16 bg-[#283A2C]" />
      </div>

      <div className="relative left-1/2 -mt-1 h-[6.75rem] w-[min(100vw,26.875rem)] -translate-x-1/2 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full">
          <svg
            aria-hidden="true"
            className="h-full w-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 420 108"
          >
            <path
              d="M-70 -34 Q210 78 490 -34"
              stroke="#283A2C"
              strokeWidth="2.25"
            />
            <path
              d="M-70 -30 Q210 82 490 -30"
              stroke="#283A2C"
              strokeOpacity="0.58"
              strokeWidth="1.25"
            />
            <path
              d="M-70 40 Q210 152 490 40"
              stroke="#283A2C"
              strokeOpacity="0.58"
              strokeWidth="1.25"
            />
            <path
              d="M-70 44 Q210 156 490 44"
              stroke="#283A2C"
              strokeOpacity="0.86"
              strokeWidth="2.25"
            />
            <path
              d="M203 18 L217 18 L210 30 Z"
              fill="#283A2C"
              stroke="#F1EFEC"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d="M203 104 L217 104 L210 92 Z"
              fill="#283A2C"
              stroke="#F1EFEC"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="pointer-events-none absolute -left-4 top-[3.4rem] z-20 text-[#283A2C]/40">
          <Leaf size={30} strokeWidth={1.8} />
        </div>
        <div className="pointer-events-none absolute -right-4 top-[3.4rem] z-20 text-[#283A2C]/40">
          <Gem size={30} strokeWidth={1.8} />
        </div>

        <div
          ref={railRef}
          onScroll={handleRailScroll}
          className="absolute inset-x-0 bottom-1 top-0 z-10 flex touch-pan-x snap-x snap-mandatory items-start gap-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain px-[calc(50%-2.25rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loopedThemes.map(({ copyIndex, theme }) => {
            const isActive = theme.slug === selectedThemeSlug;
            const instanceKey = `${copyIndex}-${theme._id || theme.slug}`;
            const sharedClassName =
              'flex w-[4.5rem] flex-col items-center transition duration-300';
            const setItemRef = (node) => {
              if (node) {
                itemRefs.current.set(instanceKey, node);
              } else {
                itemRefs.current.delete(instanceKey);
              }
            };

            if (lockedTheme && themeHero) {
              return (
                <div
                  key={instanceKey}
                  ref={setItemRef}
                  data-theme-slug={theme.slug}
                  className="w-[4.5rem] shrink-0 snap-center transition-transform duration-150 ease-out"
                >
                  <Link
                    to={`/tour-plans/${theme.slug}`}
                    className={sharedClassName}
                  >
                    {renderThemeContent(theme, isActive)}
                  </Link>
                </div>
              );
            }

            return (
              <div
                key={instanceKey}
                ref={setItemRef}
                data-theme-slug={theme.slug}
                className="w-[4.5rem] shrink-0 snap-center transition-transform duration-150 ease-out"
              >
                <button
                  type="button"
                  onClick={() => onSelect(theme)}
                  className={sharedClassName}
                >
                  {renderThemeContent(theme, isActive)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getDayHeroImage(day) {
  return day?.heroImage || getDayLocations(day).find((location) => location?.image)?.image || '';
}

function getLocationLabel(location) {
  return typeof location === 'string' ? location : location?.name || '';
}

function isCustomizableDay(day, itinerary) {
  const ctaText = String(itinerary?.contactCtaText || '').toLowerCase();

  return Boolean(
    day?.isCustomizable ||
      day?.customizable ||
      day?.canCustomize ||
      day?.customizeAvailable ||
      itinerary?.isCustomizable ||
      itinerary?.customizable ||
      itinerary?.canCustomize ||
      ctaText.includes('custom'),
  );
}

function EmptyPanel({ icon: Icon = Route, title, message }) {
  return (
    <div className="rounded-lg border border-[#283A2C]/10 bg-[#FFFFFF] p-5 shadow-[0_18px_50px_rgba(40,58,44,0.08)]">
      <Icon className="text-[#283A2C]" size={24} />
      <p className="mt-4 font-display text-3xl font-semibold text-[#283A2C]">
        {title}
      </p>
      {message && (
        <p className="mt-2 text-base leading-7 text-[#283A2C]/62">{message}</p>
      )}
    </div>
  );
}

function MobilePackagePills({
  itineraries,
  onSelect,
  selectedItinerary,
  status,
}) {
  if (itineraries.length === 0 && status !== 'loading') return null;

  return (
    <div className="mt-2.5 flex w-full flex-wrap items-center justify-center gap-2.5 px-1.5 pb-1.5 md:hidden">
      {status === 'loading' && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#283A2C]/20 bg-[#FFFFFF]">
          <Loader2 className="animate-spin text-[#283A2C]" size={16} />
        </span>
      )}

      {itineraries.map((itinerary) => {
        const isActive = selectedItinerary?._id === itinerary._id;

        return (
          <button
            key={itinerary._id}
            type="button"
            onClick={() => onSelect(itinerary._id)}
            className={`min-w-[6.5rem] max-w-full rounded-full border px-3.5 py-2 text-[0.68rem] font-bold transition duration-300 ${
              isActive
                ? 'border-[#283A2C] bg-[#283A2C] text-[#FFFFFF] shadow-[0_8px_22px_rgba(40,58,44,0.28)]'
                : 'border-[#283A2C]/45 bg-[#FFFFFF] text-[#283A2C] shadow-[0_4px_12px_rgba(40,58,44,0.06)]'
            }`}
          >
            <span className="line-clamp-1 break-words">{itinerary.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function ItineraryListPanel({
  itineraries,
  onSelect,
  selectedItinerary,
  status,
  theme,
}) {
  return (
    <motion.aside
      key={theme?._id || 'theme-list'}
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="grid w-full max-w-full min-w-0 gap-3 overflow-hidden"
    >
      <div className="hidden items-center justify-between gap-3 px-1 pb-1 md:flex">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.26em] text-[#283A2C]/50">
            Selected Theme
          </p>
          <h2 className="mt-1 break-words text-base font-black uppercase tracking-[0.1em] text-[#283A2C]">
            {theme?.title || 'Packages'}
          </h2>
        </div>
        {status === 'loading' && (
          <Loader2 className="animate-spin text-[#283A2C]" size={18} />
        )}
      </div>

      {status === 'success' && itineraries.length === 0 && (
        <div className="md:hidden">
          <EmptyPanel
            icon={CalendarDays}
            title="No itineraries yet"
            message={
              theme
                ? `${theme.title} Activity Packages are not published yet.`
                : 'Activity Packages are not published yet.'
            }
          />
        </div>
      )}

      <div className="hidden w-full max-w-full min-w-0 gap-3 md:grid md:grid-cols-2 xl:grid-cols-1">
        {status === 'success' && itineraries.length === 0 && (
          <EmptyPanel
            icon={CalendarDays}
            title="No itineraries yet"
            message={
              theme
                ? `${theme.title} Activity Packages are not published yet.`
                : 'Activity Packages are not published yet.'
            }
          />
        )}

        {itineraries.map((itinerary, index) => {
          const isActive = selectedItinerary?._id === itinerary._id;

          return (
            <motion.div
              key={itinerary._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.28 }}
              className={`group w-full max-w-full overflow-hidden rounded-sm border text-left transition ${
                isActive
                  ? 'border-[#283A2C] bg-[#283A2C] text-[#DADDC5] shadow-[0_16px_34px_rgba(40,58,44,0.18)]'
                  : 'border-[#283A2C] bg-[#DADDC5] text-[#283A2C] transition duration-300 ease-out hover:bg-[#283A2C] hover:text-[#DADDC5]'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(itinerary._id)}
                className="flex min-h-24 w-full max-w-full items-center justify-between gap-3 px-4 py-4 text-left sm:min-h-28"
              >
                <span className="min-w-0">
                  <span className="block text-[0.64rem] font-black uppercase tracking-[0.18em] opacity-55">
                    Package
                  </span>
                  <span className="mt-1 block whitespace-normal break-words text-sm font-black uppercase tracking-[0.06em]">
                    {itinerary.title}
                  </span>
                  {getDurationLabel(itinerary) && (
                    <span className="mt-2 block whitespace-normal break-words text-[0.68rem] font-bold uppercase tracking-[0.12em] opacity-64">
                      {getDurationLabel(itinerary)}
                    </span>
                  )}
                </span>
                <Navigation
                  size={15}
                  className={`shrink-0 transition ${
                    isActive ? 'rotate-45 text-[#DADDC5]' : 'opacity-35 group-hover:translate-x-1'
                  }`}
                />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.aside>
  );
}

function ItineraryDetailsPanel({
  itinerary,
  onContact,
  onStopSelect,
  routeStops,
  theme,
  viewTourHref,
}) {
  if (!itinerary) {
    return (
      <EmptyPanel
        icon={Sparkles}
        title="Select an itinerary"
        message="Journey details will appear after an itinerary is selected."
      />
    );
  }

  const duration = getDurationLabel(itinerary);
  const compactDuration = itinerary.totalDays
    ? `${itinerary.totalDays} Days`
    : duration;

  return (
    <motion.aside
      key={itinerary._id}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-full overflow-hidden rounded-sm border border-[#283A2C]/8 bg-[#FFFFFF] p-4 text-[#283A2C] shadow-[0_18px_48px_rgba(40,58,44,0.16)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#283A2C]/22 pb-4">
        <div className="min-w-0">
          <p className="text-[0.64rem] font-black uppercase tracking-[0.22em] text-[#283A2C]/58">
            Expedition Itinerary
          </p>
          <h2 className="mt-2 line-clamp-2 break-words text-xl font-black uppercase tracking-tight text-[#283A2C] sm:text-2xl">
            {itinerary.title}
          </h2>
        </div>
        {compactDuration && (
          <p className="shrink-0 rounded-full border-[1.5px] border-[#283A2C] bg-[#DADDC5] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#283A2C]">
            {compactDuration}
          </p>
        )}
      </div>

      <p className="mt-4 line-clamp-3 break-words text-sm italic leading-7 text-[#283A2C]/68 sm:mt-5 sm:line-clamp-none sm:text-base sm:leading-8">
        &ldquo;{itinerary.shortDescription || itinerary.fullDescription}&rdquo;
      </p>

      {(itinerary.fullDescription || theme?.description) && (
        <div className="mt-5 border-t border-[#283A2C]/12 pt-5">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#283A2C]/46">
            About This Journey
          </p>
          <p className="mt-3 line-clamp-3 break-words text-sm leading-7 text-[#283A2C]/62 sm:line-clamp-4 sm:text-base sm:leading-8">
            {itinerary.fullDescription || theme.description}
          </p>
        </div>
      )}

      {routeStops.length > 0 && (
        <div className="mt-5">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#283A2C]/46">
            Key Route Points
          </p>
          <div className="mt-3 grid gap-3">
            {routeStops.slice(0, 5).map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => onStopSelect(stop)}
                className="flex max-w-full items-start gap-2 text-left text-sm font-medium leading-6 text-[#283A2C]/72 sm:text-[0.95rem]"
              >
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0 text-[#283A2C]"
                />
                <span className="min-w-0 break-words">
                  Day {stop.dayNumber}: {stop.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-[#283A2C]/22 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#283A2C]/48">
            Customization Possible
          </span>
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#283A2C] opacity-30" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#283A2C]" />
          </span>
        </div>
        <div className="grid gap-3">
          <Link
            to={viewTourHref || (theme?.slug ? `/tour-plans/${theme.slug}` : '/travel-themes')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#283A2C] px-4 text-xs font-black uppercase tracking-[0.16em] text-[#F1EFEC] transition hover:bg-black sm:min-h-12 sm:text-sm"
          >
            View Tour
            <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            onClick={() =>
              onContact({
                inquiryType: 'Activity Package',
                relatedLocation: 'Sri Lanka',
                relatedTheme: theme?.title || '',
                selectedItemSlug: itinerary.slug,
                selectedItemTitle: itinerary.title,
                totalDays: itinerary.totalDays,
              })
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-[#283A2C] px-4 text-xs font-black uppercase tracking-[0.16em] text-[#283A2C] transition duration-300 ease-out hover:bg-[#DADDC5] sm:min-h-12 sm:text-sm"
          >
            <MessageCircle size={15} />
            {itinerary.contactCtaText || 'Contact'}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function MobileItinerarySummary({
  itinerary,
  onContact,
  showContactAction = false,
  theme,
  viewTourHref,
}) {
  if (!itinerary) return null;

  const days = Number(itinerary.totalDays || 0);
  const duration = days
    ? `${days} Day${days === 1 ? '' : 's'} / ${Math.max(days - 1, 0)} Night${
        days - 1 === 1 ? '' : 's'
      }`
    : getDurationLabel(itinerary);
  const description =
    itinerary.shortDescription ||
    itinerary.fullDescription ||
    theme?.description ||
    '';

  return (
    <motion.article
      key={itinerary._id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="relative mt-2 h-[clamp(8.25rem,32.48vw,8.75rem)] w-full overflow-hidden rounded-[clamp(0.55rem,2.48vw,0.7rem)] bg-[#FFFFFF] text-center text-[#283A2C] md:hidden"
    >
      <h2 className="absolute left-[3.52%] top-[5.17%] line-clamp-1 w-[52.37%] break-words text-left font-[Arial] text-[clamp(0.95rem,3.84vw,1.03rem)] font-black leading-[0.95] tracking-[0.08em]">
        {itinerary.title}
      </h2>

      {duration && (
        <span className="absolute right-[5.36%] top-[3.94%] grid h-[16.01%] w-[36.29%] place-items-center rounded-[clamp(0.55rem,2.48vw,0.7rem)] bg-[#D7BD8B] px-2 text-center font-[Arial] text-[clamp(0.48rem,1.92vw,0.52rem)] font-bold leading-none text-[#283A2C]">
          {duration}
        </span>
      )}

      {description && (
        <p className="absolute left-[3.25%] top-[26.35%] line-clamp-3 h-[40.89%] w-[91.39%] break-words font-[Arial] text-[clamp(0.625rem,2.56vw,0.69rem)] font-normal leading-[1.65] tracking-[0.12em] text-[#283A2C]">
          {description}
        </p>
      )}

      {showContactAction ? (
        <button
          type="button"
          onClick={onContact}
          className="absolute left-[31.9%] top-[70.94%] inline-flex h-[18.97%] w-[36.2%] items-center justify-center gap-1.5 rounded-[clamp(0.75rem,3.36vw,0.9rem)] bg-[#283A2C] px-3 font-[Arial] text-[clamp(0.66rem,2.64vw,0.72rem)] font-bold text-[#F1EFEC] shadow-[0_4px_24px_3px_rgba(0,0,0,0.30)] transition active:scale-[0.98]"
        >
          <MessageCircle size={13} />
          Contact Us
        </button>
      ) : (
        <Link
          to={viewTourHref}
          className="absolute left-[31.9%] top-[70.94%] inline-flex h-[18.97%] w-[36.2%] items-center justify-center rounded-[clamp(0.75rem,3.36vw,0.9rem)] bg-[#283A2C] px-3 font-[Arial] text-[clamp(0.66rem,2.64vw,0.72rem)] font-bold text-[#F1EFEC] shadow-[0_4px_24px_3px_rgba(0,0,0,0.30)] transition active:scale-[0.98]"
        >
          Explore More
        </Link>
      )}
    </motion.article>
  );
}

function DayActivityGrid({ days = [], daysStatus, itinerary, onContact }) {
  const sortedDays = useMemo(
    () => [...days].sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber)),
    [days],
  );

  if (daysStatus === 'loading') {
    return (
      <section className="mt-16 grid min-h-48 place-items-center rounded-2xl border border-[#283A2C]/10 bg-[#FFFFFF]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-[#283A2C]" size={28} />
          <p className="mt-3 text-sm font-bold text-[#283A2C]/52">
            Loading day activities
          </p>
        </div>
      </section>
    );
  }

  if (!sortedDays.length) {
    return (
      <section className="mt-16">
        <EmptyPanel
          icon={CalendarDays}
          title="Day activities unavailable"
          message="Day-by-day activities will appear once they are published."
        />
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55 }}
      className="mt-16"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#283A2C]/50">
            Day By Day
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-[#283A2C] md:text-5xl">
            Activity Highlights
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#283A2C]/62 md:mx-0">
            {itinerary?.title
              ? `${itinerary.title} arranged as clear daily experiences.`
              : 'A clear view of each daily experience in this tour plan.'}
          </p>
        </div>
        {itinerary && (
          <button
            type="button"
            onClick={onContact}
            className="hidden min-h-12 items-center justify-center gap-2 rounded-full bg-[#283A2C] px-6 text-xs font-black uppercase tracking-[0.16em] text-[#F1EFEC] transition hover:bg-black md:inline-flex md:w-auto"
          >
            <MessageCircle size={16} />
            Customize
          </button>
        )}
      </div>

      <div className="mt-7 grid min-w-0 grid-cols-2 items-start gap-2.5 md:mt-10 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
        {sortedDays.map((day, index) => {
          const image = getDayHeroImage(day);
          const locations = getDayLocations(day);
          const dayNumber = day.dayNumber || index + 1;
          const isCenteredLastCard =
            sortedDays.length % 2 === 1 && index === sortedDays.length - 1;
          const title = day.title || `Day ${dayNumber}`;
          const description =
            day.description || 'Daily activity details will be shared soon.';
          const locationNames = locations.map(getLocationLabel).filter(Boolean);
          const hasCustomizeBadge = isCustomizableDay(day, itinerary);

          return (
            <motion.article
              key={day._id || `${day.dayNumber}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
              className={`group relative mx-auto flex min-w-0 pb-4 pt-7 text-[#283A2C] md:max-w-none md:pt-12 ${
                isCenteredLastCard
                  ? 'col-span-2 w-[calc(50%_-_0.3125rem)] md:col-span-1 md:w-full'
                  : 'w-full'
              }`}
            >
              <div className="absolute left-1/2 top-0 z-0 h-11 w-[48%] -translate-x-1/2 rounded-t-[1.1rem] border-x-[5px] border-t-[5px] border-[#7B5A00] transition duration-300 md:h-16 md:max-w-40 md:rounded-t-[1.8rem] md:border-x-[8px] md:border-t-[8px] md:group-hover:-translate-y-1.5" />
              <span className="absolute bottom-0 left-[9%] z-0 h-5 w-4 rounded-b-full bg-[#D7BD8B] md:h-7 md:w-6" />
              <span className="absolute bottom-0 right-[9%] z-0 h-5 w-4 rounded-b-full bg-[#D7BD8B] md:h-7 md:w-6" />

              <div className="relative z-10 flex aspect-[554/691] min-w-0 w-full flex-col overflow-hidden rounded-b-[1rem] rounded-t-[2rem] border-[1.5px] border-[#283A2C]/24 bg-[linear-gradient(145deg,#42584A_0%,#283A2C_58%,#34493B_100%)] transition duration-300 md:rounded-b-[1.5rem] md:rounded-t-[3rem] md:group-hover:-translate-y-1">
                <div className="relative bg-transparent px-2.5 pb-2 pt-8 md:px-6 md:pb-4 md:pt-14">
                  <span className="absolute left-1/2 top-2.5 z-20 -translate-x-1/2 rounded-full border border-[#283A2C]/14 bg-[#F1EFEC] px-2.5 py-0.5 text-[0.4rem] font-black tracking-[0.12em] text-[#283A2C] md:top-5 md:px-4 md:py-1 md:text-[0.62rem]">
                    Yogo
                  </span>
                  {hasCustomizeBadge && (
                    <span className="hidden">
                      <span className="sm:hidden">Custom</span>
                      <span className="hidden sm:inline">Customizable</span>
                    </span>
                  )}

                  <div className="mx-auto grid aspect-[1.5/1] w-full place-items-center overflow-hidden rounded-[0.9rem] border-[2px] border-[#F1EFEC] bg-[#FFFFFF] md:rounded-[1.6rem] md:border-[3px]">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full rounded-[0.65rem] object-cover transition duration-500 md:rounded-[1.35rem]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center rounded-lg bg-[#DADDC5] text-[#283A2C]">
                        <div className="text-center">
                          <Luggage className="mx-auto" size={34} />
                          <p className="mt-3 text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#283A2C]/58">
                            Journey Preview
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex min-w-0 flex-1 flex-col px-3.5 pb-4 pt-1.5 text-center md:px-8 md:pb-8 md:pt-2">
                  <h3 className="line-clamp-2 break-words text-[0.72rem] font-black leading-tight tracking-[0.06em] text-[#FFFFFF] md:text-xl md:tracking-[0.08em]">
                    {title}
                  </h3>
                  <p className="mx-auto mt-1.5 line-clamp-6 max-w-[13rem] break-words text-[0.5rem] leading-[1.55] tracking-[0.08em] text-[#F1EFEC]/90 md:mt-3 md:max-w-[24rem] md:text-sm md:leading-7 md:tracking-[0.1em]">
                    {description}
                  </p>

                  <div className="hidden">
                    <div>
                      <p className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-[#283A2C]/46">
                        Locations
                      </p>
                      {locationNames.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {locationNames.slice(0, 4).map((locationName, locationIndex) => (
                            <span
                              key={`${getId(locations[locationIndex]) || locationName}-${locationIndex}`}
                              className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-[#F1EFEC] px-3 py-1.5 text-[0.68rem] font-bold text-[#283A2C]/70"
                            >
                              <MapPin size={12} className="shrink-0 text-[#283A2C]" />
                              <span className="min-w-0 truncate">{locationName}</span>
                            </span>
                          ))}
                          {locationNames.length > 4 && (
                            <span className="rounded-full bg-[#283A2C] px-3 py-1.5 text-[0.68rem] font-black text-[#F1EFEC]">
                              +{locationNames.length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm font-semibold text-[#283A2C]/54">
                          Locations will be assigned soon.
                        </p>
                      )}
                    </div>

                    <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DADDC5] bg-[#F1EFEC] px-4 py-3 sm:flex-nowrap">
                      <span className="inline-flex min-w-0 items-center gap-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-[#283A2C]/52 sm:text-[0.62rem] sm:tracking-[0.18em]">
                        <Clock3 size={15} className="text-[#283A2C]" />
                        Travel Time
                      </span>
                      <span className="min-w-0 break-words text-right text-sm font-black text-[#283A2C]">
                        {day.travelTime || 'Flexible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}

function PackageFaqSection({ faqs = [], itinerary, useFallback = false }) {
  const [openIndex, setOpenIndex] = useState(0);
  const packageFaqs = faqs.filter((faq) => faq?.question || faq?.answer);
  const visibleFaqs = packageFaqs.length || !useFallback
    ? packageFaqs
    : fallbackPackageFaqs;

  if (!visibleFaqs.length) return null;

  return (
    <motion.div
      key={itinerary?._id || 'package-faqs'}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-10 rounded-sm border border-[#283A2C]/10 bg-[#FFFFFF] p-5 shadow-[0_18px_50px_rgba(40,58,44,0.08)] sm:p-6"
    >
      <div className="flex flex-col gap-2 border-b border-[#283A2C]/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.64rem] font-black uppercase tracking-[0.26em] text-[#283A2C]/50">
            Travel Questions
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#283A2C]">
            {itinerary?.title ? `${itinerary.title} FAQ` : 'Package FAQ'}
          </h2>
        </div>
        <p className="text-sm font-semibold text-[#283A2C]/60">
          Answers from the selected Activity Package.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {visibleFaqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={`${faq.question}-${index}`}
              className="overflow-hidden rounded-sm border border-[#283A2C]/10"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 bg-[#F1EFEC] px-4 py-4 text-left"
              >
                <span className="text-sm font-black uppercase tracking-[0.08em] text-[#283A2C]">
                  {faq.question || `Question ${index + 1}`}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[#283A2C] transition ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24 }}
                  >
                    <p className="px-4 py-4 text-base leading-8 text-[#283A2C]/70">
                      {faq.answer || 'Answer will be updated from admin.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Itineraries({
  embedded = false,
  initialThemeSlug = '',
  lockedTheme = false,
  showFaq = false,
  showHeader = true,
  syncUrl = true,
  tourPlanDetail = false,
  themeHero = false,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeStop, setActiveStop] = useState(null);
  const [days, setDays] = useState([]);
  const [daysStatus, setDaysStatus] = useState('idle');
  const [error, setError] = useState('');
  const [itineraries, setItineraries] = useState([]);
  const [itinerariesStatus, setItinerariesStatus] = useState('idle');
  const [contactContext, setContactContext] = useState(null);
  const [selectedItineraryId, setSelectedItineraryId] = useState('');
  const [selectedThemeSlug, setSelectedThemeSlug] = useState(initialThemeSlug);
  const [themes, setThemes] = useState([]);
  const [themesStatus, setThemesStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setThemesStatus('loading');
    setError('');

    fetchTravelThemes()
      .then((data) => {
        if (!isMounted) return;

        setThemes(data);
        setThemesStatus('success');
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(requestError.message);
        setThemesStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!themes.length) return;

    const requestedTheme = initialThemeSlug || (syncUrl ? searchParams.get('theme') : '');
    const requestedMatch = themes.find((theme) => theme.slug === requestedTheme);
    const currentMatch = themes.find((theme) => theme.slug === selectedThemeSlug);
    const nextTheme = requestedMatch || currentMatch || themes[0];

    if (nextTheme?.slug && nextTheme.slug !== selectedThemeSlug) {
      setSelectedThemeSlug(nextTheme.slug);
    }
  }, [initialThemeSlug, searchParams, selectedThemeSlug, syncUrl, themes]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedThemeSlug) {
      setItineraries([]);
      setSelectedItineraryId('');
      setItinerariesStatus('idle');
      return undefined;
    }

    setItinerariesStatus('loading');
    setItineraries([]);
    setSelectedItineraryId('');
    setDays([]);
    setDaysStatus('idle');
    setActiveStop(null);

    fetchPublicItineraries({ status: 'published', theme: selectedThemeSlug })
      .then((data) => {
        if (!isMounted) return;
        setItineraries(data);
        setSelectedItineraryId(data[0]?._id || '');
        setItinerariesStatus('success');
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(requestError.message);
        setItinerariesStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [selectedThemeSlug]);

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.slug === selectedThemeSlug) || null,
    [selectedThemeSlug, themes],
  );
  const selectedItinerary = useMemo(
    () =>
      itineraries.find((itinerary) => itinerary._id === selectedItineraryId) ||
      null,
    [itineraries, selectedItineraryId],
  );

  useEffect(() => {
    let isMounted = true;

    if (!selectedItinerary?._id) {
      setDays([]);
      setDaysStatus('idle');
      return undefined;
    }

    setActiveStop(null);

    if (Array.isArray(selectedItinerary.days) && selectedItinerary.days.length > 0) {
      setDays(selectedItinerary.days);
      setDaysStatus('success');
      return undefined;
    }

    setDaysStatus('loading');
    setDays([]);
    fetchItineraryDays({ itineraryPlanId: selectedItinerary._id })
      .then((data) => {
        if (!isMounted) return;
        setDays(data);
        setDaysStatus('success');
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(requestError.message);
        setDaysStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [selectedItinerary?._id, selectedItinerary?.days]);

  const routeStops = useMemo(() => buildRouteStops(days), [days]);
  const themeHeroImage = getThemeHeroImage(selectedTheme);

  useEffect(() => {
    setActiveStop(null);
  }, [routeStops, selectedItinerary?._id]);

  function handleThemeSelect(theme) {
    if (!theme?.slug || theme.slug === selectedThemeSlug) return;

    if (lockedTheme) {
      navigate(`/tour-plans/${theme.slug}`);
      return;
    }

    setSelectedThemeSlug(theme.slug);
    if (syncUrl) {
      setSearchParams({ theme: theme.slug });
    }
  }

  function openContactModal(inquiryContext) {
    setContactContext(inquiryContext);
  }

  function openSelectedItineraryContact() {
    if (!selectedItinerary) return;

    openContactModal({
      inquiryType: 'Activity Package',
      relatedLocation: 'Sri Lanka',
      relatedTheme: selectedTheme?.title || '',
      selectedItemSlug: selectedItinerary.slug,
      selectedItemTitle: selectedItinerary.title,
      totalDays: selectedItinerary.totalDays,
    });
  }

  const listPanel = (
    <ItineraryListPanel
      itineraries={itineraries}
      onSelect={setSelectedItineraryId}
      selectedItinerary={selectedItinerary}
      status={itinerariesStatus}
      theme={selectedTheme}
    />
  );
  const mapPanel = (
    <Suspense
      fallback={
        <div className="h-[260px] w-full max-w-full animate-pulse rounded-xl border border-[#283A2C]/10 bg-[#DADDC5]/70 md:h-[30rem] xl:h-[33rem]" />
      }
    >
      <TravelThemeRouteMap
        activeStop={activeStop}
        containerClassName="relative h-[290px] w-full max-w-full overflow-hidden rounded-2xl border border-[#283A2C]/10 bg-[#283A2C] shadow-[0_20px_54px_rgba(40,58,44,0.16)] md:h-[30rem] md:rounded-xl md:shadow-[0_28px_90px_rgba(40,58,44,0.20)] xl:h-[33rem]"
        daysStatus={daysStatus}
        fitRouteToBounds={false}
        fitRouteToBoundsOnMobile
        onStopSelect={setActiveStop}
        pinSize="compact"
        showMapMeta={!embedded}
        stops={routeStops}
      />
    </Suspense>
  );
  const detailsPanel = (
    <ItineraryDetailsPanel
      itinerary={selectedItinerary}
      onContact={openContactModal}
      onStopSelect={setActiveStop}
      routeStops={routeStops}
      theme={selectedTheme}
      viewTourHref={
        lockedTheme && selectedItinerary?.slug
          ? `/itineraries/${selectedItinerary.slug}`
          : selectedTheme?.slug
            ? `/tour-plans/${selectedTheme.slug}`
            : '/travel-themes'
      }
    />
  );
  const mobileDetailsPanel = (
    <MobileItinerarySummary
      itinerary={selectedItinerary}
      onContact={openSelectedItineraryContact}
      showContactAction={lockedTheme}
      theme={selectedTheme}
      viewTourHref={
        lockedTheme && selectedItinerary?.slug
          ? `/itineraries/${selectedItinerary.slug}`
          : selectedTheme?.slug
            ? `/tour-plans/${selectedTheme.slug}`
            : '/travel-themes'
      }
    />
  );

  return (
    <section
      className={`relative w-full max-w-full overflow-x-hidden bg-[#F1EFEC] px-4 text-[#283A2C] md:px-6 lg:px-8 ${
        embedded
          ? 'pb-6 pt-7 md:py-16 lg:py-24'
          : 'min-h-screen pb-[calc(9rem+env(safe-area-inset-bottom))] pt-28 md:pb-16 md:pt-32 lg:pb-24'
      }`}
    >
      {!embedded && <div className="absolute inset-x-0 top-0 h-1 bg-[#283A2C]" />}

      <div className="relative mx-auto w-full max-w-6xl min-w-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className={`relative isolate overflow-hidden text-center ${
            showHeader ? '' : 'sr-only'
          } ${
            themeHero
              ? 'mx-auto min-h-[15rem] max-w-6xl rounded-lg px-5 py-10 text-[#FFFFFF] shadow-none md:min-h-[18rem] md:px-8 lg:flex lg:items-center lg:justify-center'
              : 'mx-auto max-w-3xl'
          }`}
        >
          {themeHero && (
            <>
              {themeHeroImage ? (
                <motion.img
                  key={themeHeroImage}
                  src={themeHeroImage}
                  alt={selectedTheme?.title || 'Travel Theme'}
                  initial={{ scale: 1.06, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 -z-20 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 -z-20 bg-[#283A2C]" />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#283A2C]/94 via-[#283A2C]/62 to-[#283A2C]/24" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#283A2C]/82 via-transparent to-[#283A2C]/38" />
            </>
          )}

          <div className={themeHero ? 'mx-auto max-w-3xl' : ''}>
            <p
              className={`text-[0.64rem] font-black uppercase tracking-[0.42em] ${
                themeHero ? 'text-[#DADDC5]' : 'text-[#283A2C]/48'
              }`}
            >
              Custom Curations
            </p>
            <h1
              className={`mt-2 text-[clamp(2rem,9vw,2.625rem)] font-black uppercase leading-[1.05] tracking-tight md:mt-3 md:text-5xl md:leading-tight ${
                themeHero ? 'text-[#FFFFFF]' : 'text-[#283A2C]'
              }`}
            >
              Interactive Travel Themes
            </h1>
            <div
              className={`mx-auto mt-3 h-px w-12 md:mt-4 ${
                themeHero ? 'bg-[#DADDC5]' : 'bg-[#283A2C]'
              }`}
            />
            <p
              className={`mx-auto mt-3 max-w-2xl text-pretty text-sm leading-6 md:mt-4 md:text-base md:leading-7 ${
                themeHero ? 'text-[#F1EFEC]/84' : 'text-[#283A2C]/62'
              }`}
            >
              {themeHero && selectedTheme?.description
                ? selectedTheme.description
                : 'Select a travel theme, explore its activity packages, and watch the Sri Lanka route update with admin-created locations and day pins.'}
            </p>
          </div>
        </motion.div>

        {themesStatus === 'loading' && (
          <div className="mt-12 grid min-h-52 place-items-center rounded-lg border border-[#283A2C]/10 bg-[#FFFFFF]">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-[#283A2C]" size={30} />
              <p className="mt-3 text-sm font-bold text-[#283A2C]/52">
                Loading travel themes
              </p>
            </div>
          </div>
        )}

        {themesStatus === 'error' && (
          <div className="mx-auto mt-12 max-w-2xl">
            <EmptyPanel title="Travel themes unavailable" message={error} />
          </div>
        )}

        {themesStatus === 'success' && themes.length === 0 && (
          <div className="mx-auto mt-12 max-w-2xl">
            <EmptyPanel
              icon={Sparkles}
              title="No travel themes yet"
              message="Travel themes are not published yet."
            />
          </div>
        )}

        {themes.length > 0 && (
          <>
            {(!lockedTheme || themeHero) && (
              <>
                <MobileThemeDial
                  lockedTheme={lockedTheme}
                  onSelect={handleThemeSelect}
                  selectedThemeSlug={selectedThemeSlug}
                  themeHero={themeHero}
                  themes={themes}
                />

                <MobilePackagePills
                  itineraries={itineraries}
                  onSelect={setSelectedItineraryId}
                  selectedItinerary={selectedItinerary}
                  status={itinerariesStatus}
                />

                <div className="mt-9 hidden w-full max-w-full gap-3 pb-3 md:flex md:flex-wrap md:justify-center md:overflow-visible">
                  {themes.map((theme) => {
                    const isActive = theme.slug === selectedThemeSlug;
                    const themeButtonClassName = `shrink-0 rounded-full border px-6 py-3.5 text-sm font-black uppercase tracking-[0.16em] shadow-none transition duration-300 ease-out ${
                      isActive
                        ? 'border-[#283A2C] bg-[#283A2C] text-[#DADDC5]'
                        : 'border-[#283A2C] bg-[#DADDC5] text-[#283A2C] hover:bg-[#283A2C] hover:text-[#DADDC5]'
                    }`;

                    if (lockedTheme && themeHero) {
                      return (
                        <Link
                          key={theme._id}
                          to={`/tour-plans/${theme.slug}`}
                          className={`${themeButtonClassName} max-w-[82vw] whitespace-normal break-words`}
                        >
                          {theme.title}
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={theme._id}
                        type="button"
                        onClick={() => handleThemeSelect(theme)}
                        className={`${themeButtonClassName} max-w-[82vw] whitespace-normal break-words`}
                      >
                        {theme.title}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {showHeader && !themeHero && selectedTheme?.description && (
              <AnimatePresence mode="wait">
                <motion.p
                  key={selectedTheme._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                  className="mx-auto mt-1 hidden max-w-2xl break-words px-2 text-center text-sm leading-6 text-[#283A2C]/58 sm:text-base sm:leading-7 md:mt-2 md:block md:px-0"
                >
                  {selectedTheme.description}
                </motion.p>
              </AnimatePresence>
            )}

            <div
              className={`mt-2.5 grid w-full max-w-full min-w-0 grid-cols-1 gap-5 overflow-hidden md:mt-10 md:gap-6 xl:items-start xl:justify-center xl:overflow-visible ${
                tourPlanDetail
                  ? 'xl:grid-cols-[minmax(15.5rem,18rem)_minmax(0,42rem)]'
                  : 'xl:grid-cols-[15.5rem_minmax(0,26rem)_21rem]'
              }`}
            >
              <div
                className={`order-1 min-w-0 max-w-full overflow-hidden xl:order-1 ${
                  itineraries.length > 0 ? 'hidden md:block' : ''
                }`}
              >
                {listPanel}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedItinerary?._id || selectedThemeSlug}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.3 }}
                  className="order-2 min-w-0 max-w-full overflow-hidden xl:order-2"
                >
                  {mapPanel}
                  {mobileDetailsPanel}
                </motion.div>
              </AnimatePresence>
              {!tourPlanDetail && (
                <div className="order-3 hidden min-w-0 max-w-full overflow-hidden md:block">
                  {detailsPanel}
                </div>
              )}
            </div>

            {tourPlanDetail && selectedItinerary && (
              <>
                <DayActivityGrid
                  days={days}
                  daysStatus={daysStatus}
                  itinerary={selectedItinerary}
                  onContact={openSelectedItineraryContact}
                />
                <VehicleRoadCarousel />
                <PackageFaqSection
                  faqs={selectedItinerary?.faqs || []}
                  itinerary={selectedItinerary}
                  useFallback
                />
              </>
            )}

            {showFaq && !tourPlanDetail && (
              <PackageFaqSection
                faqs={selectedItinerary?.faqs || []}
                itinerary={selectedItinerary}
              />
            )}
          </>
        )}
      </div>
      <ContactInquiryModal
        inquiryContext={contactContext}
        isOpen={Boolean(contactContext)}
        onClose={() => setContactContext(null)}
      />
    </section>
  );
}
