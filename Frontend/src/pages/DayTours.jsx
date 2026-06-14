import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  HelpCircle,
  Landmark,
  Leaf,
  Loader2,
  MapPin,
  MapPinned,
  MessageCircle,
  Mountain,
  Navigation,
  Palmtree,
  Sparkles,
  Waves,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchDayTours } from '../api/dayTours';
import ContactInquiryModal from '../components/contact/ContactInquiryModal.jsx';

const DayTourMap = lazy(() => import('../components/maps/DayTourMap.jsx'));

function getId(value) {
  return typeof value === 'string' ? value : value?._id || value?.id || '';
}

function EmptyPanel({ icon: Icon = MapPinned, title, message }) {
  return (
    <div className="rounded-2xl border border-[#283A2C]/10 bg-[#FFFFFF] p-5 text-[#283A2C] shadow-[0_18px_46px_rgba(40,58,44,0.08)]">
      <Icon className="text-[#283A2C]" size={26} />
      <p className="mt-4 font-display text-2xl font-semibold">{title}</p>
      {message && (
        <p className="mt-3 break-words text-sm leading-7 text-[#283A2C]/62">
          {message}
        </p>
      )}
    </div>
  );
}

function buildLocationGroups(dayTours) {
  const groups = new Map();

  dayTours.forEach((tour) => {
    const locationId = getId(tour.mainLocation);
    if (!locationId) return;

    if (!groups.has(locationId)) {
      groups.set(locationId, {
        location: tour.mainLocation,
        tours: [],
      });
    }

    groups.get(locationId).tours.push(tour);
  });

  return Array.from(groups.values());
}

function getLocationDialIcon(location) {
  const label = `${location?.name || ''} ${location?.slug || ''}`.toLowerCase();

  if (/(beach|coast|bay|lagoon|sea|ocean)/.test(label)) return Waves;
  if (/(fort|temple|church|palace|heritage|city)/.test(label)) return Landmark;
  if (/(mountain|rock|hill|peak|adventure)/.test(label)) return Mountain;
  if (/(forest|garden|park|nature|wildlife)/.test(label)) return Leaf;
  if (/(island|tropical|palm)/.test(label)) return Palmtree;

  return MapPin;
}

function MobileLocationDial({
  locationGroups,
  onSelect,
  selectedLocationId,
}) {
  const railRef = useRef(null);
  const itemRefs = useRef(new Map());
  const frameRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const positionedLoopRef = useRef('');
  const groupById = useMemo(
    () =>
      new Map(
        locationGroups.map((group) => [getId(group.location), group]),
      ),
    [locationGroups],
  );
  const loopedGroups = useMemo(() => {
    const copies = locationGroups.length > 1 ? 3 : 1;

    return Array.from({ length: copies }, (_, copyIndex) =>
      locationGroups.map((group) => ({ copyIndex, group })),
    ).flat();
  }, [locationGroups]);
  const loopSignature = locationGroups
    .map((group) => getId(group.location))
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
        const y = (1 - distance * distance) * 24;
        const rotation = signedDistance * -4;

        item.style.transform = `translateY(${y}px) rotate(${rotation}deg)`;
      });
    });
  }, []);

  const keepLoopCentered = useCallback(() => {
    const rail = railRef.current;
    const anchorGroup = locationGroups[0];

    if (!rail || locationGroups.length < 2 || !anchorGroup) return;

    const anchorId = getId(anchorGroup.location);
    const middleAnchor = itemRefs.current.get(`1-${anchorId}`);
    const trailingAnchor = itemRefs.current.get(`2-${anchorId}`);

    if (!middleAnchor || !trailingAnchor) return;

    const cycleWidth = trailingAnchor.offsetLeft - middleAnchor.offsetLeft;
    const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;

    if (viewportCenter < middleAnchor.offsetLeft) {
      rail.scrollLeft += cycleWidth;
    } else if (viewportCenter >= trailingAnchor.offsetLeft) {
      rail.scrollLeft -= cycleWidth;
    }
  }, [locationGroups]);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail || !selectedLocationId) {
      updateDialPositions();
      return;
    }

    const matchingItems = [...itemRefs.current.values()].filter(
      (item) => item.dataset.locationId === selectedLocationId,
    );
    const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;
    const shouldPositionMiddleCopy =
      locationGroups.length > 1 &&
      positionedLoopRef.current !== loopSignature;
    const selectedItem = shouldPositionMiddleCopy
      ? itemRefs.current.get(`1-${selectedLocationId}`)
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
    locationGroups.length,
    loopSignature,
    selectedLocationId,
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
      let closestGroup = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item) => {
        const group = groupById.get(item.dataset.locationId);
        if (!group) return;

        const itemBounds = item.getBoundingClientRect();
        const distance = Math.abs(
          itemBounds.left + itemBounds.width / 2 - center,
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestGroup = group;
        }
      });

      if (
        closestGroup &&
        getId(closestGroup.location) !== selectedLocationId
      ) {
        onSelect(closestGroup);
      }
    }, 140);
  }

  return (
    <div className="mt-8 md:hidden">
      <div className="text-center">
        <h2 className="text-xl font-bold leading-none text-[#283A2C]">
          Select Your Location
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
            <path d="M-70 -34 Q210 78 490 -34" stroke="#283A2C" strokeWidth="2.25" />
            <path d="M-70 -30 Q210 82 490 -30" stroke="#283A2C" strokeOpacity="0.58" strokeWidth="1.25" />
            <path d="M-70 40 Q210 152 490 40" stroke="#283A2C" strokeOpacity="0.58" strokeWidth="1.25" />
            <path d="M-70 44 Q210 156 490 44" stroke="#283A2C" strokeOpacity="0.86" strokeWidth="2.25" />
            <path d="M203 18 L217 18 L210 30 Z" fill="#283A2C" stroke="#F1EFEC" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M203 104 L217 104 L210 92 Z" fill="#283A2C" stroke="#F1EFEC" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="pointer-events-none absolute -left-4 top-[3.4rem] z-20 text-[#283A2C]/40">
          <Leaf size={30} strokeWidth={1.8} />
        </div>
        <div className="pointer-events-none absolute -right-4 top-[3.4rem] z-20 text-[#283A2C]/40">
          <Landmark size={30} strokeWidth={1.8} />
        </div>

        <div
          ref={railRef}
          onScroll={handleRailScroll}
          className="absolute inset-x-0 bottom-1 top-0 z-10 flex touch-pan-x snap-x snap-mandatory items-start gap-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain px-[calc(50%-2.25rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loopedGroups.map(({ copyIndex, group }) => {
            const locationId = getId(group.location);
            const isActive = locationId === selectedLocationId;
            const Icon = getLocationDialIcon(group.location);
            const instanceKey = `${copyIndex}-${locationId}`;
            const setItemRef = (node) => {
              if (node) itemRefs.current.set(instanceKey, node);
              else itemRefs.current.delete(instanceKey);
            };

            return (
              <div
                key={instanceKey}
                ref={setItemRef}
                data-location-id={locationId}
                className="w-[4.5rem] shrink-0 snap-center transition-transform duration-150 ease-out"
              >
                <button
                  type="button"
                  onClick={() => onSelect(group)}
                  className="flex w-[4.5rem] flex-col items-center transition duration-300"
                >
                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0.72 }}
                    initial={false}
                    className="relative flex flex-col items-center"
                  >
                    <motion.span
                      animate={{ scale: isActive ? 1 : 0.92 }}
                      initial={false}
                      className={`relative z-10 grid h-11 w-11 place-items-center rounded-full border transition duration-300 ${
                        isActive
                          ? 'border-[#283A2C] bg-[#283A2C] text-[#FFFFFF] shadow-[0_8px_20px_rgba(40,58,44,0.25)]'
                          : 'border-transparent bg-transparent text-[#283A2C]/60'
                      }`}
                    >
                      <Icon size={isActive ? 24 : 21} strokeWidth={2} />
                    </motion.span>
                    <span
                      className={`relative z-10 mt-0.5 line-clamp-2 min-h-[1.15rem] max-w-[4.5rem] text-center text-[0.54rem] font-bold uppercase leading-[1.08] tracking-[0.035em] ${
                        isActive ? 'text-[#283A2C]' : 'text-[#283A2C]/65'
                      }`}
                    >
                      {group.location.name}
                    </span>
                  </motion.span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlacesPanel({ activePlace, onSelect, places = [] }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-[#283A2C]/10 bg-[#FFFFFF] p-4 text-[#283A2C] shadow-[0_22px_58px_rgba(40,58,44,0.08)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#283A2C]/10 pb-4">
        <div className="min-w-0">
          <p className="text-[0.66rem] font-black uppercase tracking-[0.24em] text-[#283A2C]/48">
            Places
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#283A2C]">
            To Visit
          </h2>
        </div>
        <MapPinned className="shrink-0 text-[#283A2C]" size={20} />
      </div>

      <div className="mt-4 grid gap-3">
        {places.length === 0 && (
          <EmptyPanel
            title="No places yet"
            message="Places will appear once they are added in admin."
          />
        )}

        {places.map((place, index) => {
          const isActive = activePlace?._id === place._id;

          return (
            <motion.button
              key={place._id || `${place.name}-${index}`}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.28 }}
              onClick={() => onSelect(place)}
              className={`group w-full max-w-full overflow-hidden rounded-sm border p-3 text-left transition ${
                isActive
                  ? 'border-[#283A2C] bg-[#283A2C] text-[#DADDC5] shadow-[0_16px_34px_rgba(40,58,44,0.18)]'
                  : 'border-[#283A2C] bg-[#DADDC5] text-[#283A2C] transition duration-300 ease-out hover:bg-[#283A2C] hover:text-[#DADDC5]'
              }`}
            >
              <div className="flex items-center gap-3">
                {place.image && (
                  <img
                    src={place.image}
                    alt={place.name}
                    className="h-14 w-16 shrink-0 rounded-md object-cover"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block whitespace-normal break-words font-display text-xl font-semibold leading-tight">
                    {place.name}
                  </span>
                  {place.description && (
                    <span className="mt-1 line-clamp-2 block break-words text-xs leading-5 opacity-68">
                      {place.description}
                    </span>
                  )}
                </span>
                <ArrowRight
                  size={16}
                  className={`shrink-0 transition ${
                    isActive ? '' : 'group-hover:translate-x-1'
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.aside>
  );
}

function DetailsPanel({ activePlace, onContact, tour }) {
  if (!tour) {
    return (
      <EmptyPanel
        icon={Sparkles}
        title="Select a Day Tour"
        message="Day Tour details will appear once a location is selected."
      />
    );
  }

  const image = activePlace?.image || tour.heroImage || tour.mainLocation?.image;
  const title = activePlace?.name || tour.title;
  const description =
    activePlace?.description || tour.fullDescription || tour.shortDescription;

  return (
    <motion.aside
      key={`${tour._id}-${activePlace?._id || 'tour'}`}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-full overflow-hidden rounded-2xl border border-[#283A2C]/10 bg-[#FFFFFF] text-[#283A2C] shadow-[0_22px_58px_rgba(40,58,44,0.10)]"
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="h-44 w-full object-cover sm:h-52"
        />
      )}
      <div className="p-4 sm:p-5">
        <p className="text-[0.64rem] font-black uppercase tracking-[0.22em] text-[#283A2C]/58">
          {activePlace ? 'Selected Place' : tour.mainLocation?.name}
        </p>
        <h2 className="mt-3 line-clamp-2 break-words font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 line-clamp-4 break-words text-sm leading-7 text-[#283A2C]/64 sm:mt-5">
            {description}
          </p>
        )}

        {!activePlace && tour.places?.length > 0 && (
          <div className="mt-6 border-t border-[#283A2C]/10 pt-5">
            <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-[#283A2C]/46">
              Route Preview
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tour.places.map((place, index) => (
                <span
                  key={place._id || `${place.name}-${index}`}
                  className="max-w-full rounded-full border border-[#283A2C]/10 bg-[#F1EFEC] px-3 py-1 text-xs font-bold text-[#283A2C]/62"
                >
                  <span className="line-clamp-1 break-words">{place.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            onContact({
              inquiryType: 'Day Tour',
              relatedLocation: tour.mainLocation?.name || '',
              selectedItemSlug: tour.slug,
              selectedItemTitle: tour.title,
              selectedPlace: activePlace?.name || '',
            })
          }
          className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#283A2C] px-4 text-xs font-black uppercase tracking-[0.16em] text-[#F1EFEC] transition hover:bg-black sm:min-h-12 sm:text-sm"
        >
          <MessageCircle size={17} />
          Contact
        </button>
      </div>
    </motion.aside>
  );
}

export default function DayTours() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePlace, setActivePlace] = useState(null);
  const [contactContext, setContactContext] = useState(null);
  const [dayTours, setDayTours] = useState([]);
  const [error, setError] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedTourId, setSelectedTourId] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    setError('');

    fetchDayTours({ status: 'published' })
      .then((data) => {
        if (!isMounted) return;
        setDayTours(data);
        setStatus('success');
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(requestError.message);
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const locationGroups = useMemo(() => buildLocationGroups(dayTours), [dayTours]);

  useEffect(() => {
    if (!locationGroups.length) return;

    const requestedLocation = searchParams.get('location');
    const requestedMatch = locationGroups.find(
      (group) => group.location?.slug === requestedLocation,
    );
    const currentMatch = locationGroups.find(
      (group) => getId(group.location) === selectedLocationId,
    );
    const nextGroup = requestedMatch || currentMatch || locationGroups[0];
    const nextLocationId = getId(nextGroup.location);

    if (nextLocationId && nextLocationId !== selectedLocationId) {
      setSelectedLocationId(nextLocationId);
    }
  }, [locationGroups, searchParams, selectedLocationId]);

  const selectedGroup = useMemo(
    () =>
      locationGroups.find(
        (group) => getId(group.location) === selectedLocationId,
      ) || null,
    [locationGroups, selectedLocationId],
  );

  useEffect(() => {
    const nextTour = selectedGroup?.tours?.[0] || null;
    setSelectedTourId(nextTour?._id || '');
    setActivePlace(null);
  }, [selectedGroup]);

  const selectedTour = useMemo(
    () =>
      selectedGroup?.tours?.find((tour) => tour._id === selectedTourId) ||
      selectedGroup?.tours?.[0] ||
      null,
    [selectedGroup, selectedTourId],
  );
  const places = useMemo(
    () =>
      [...(selectedTour?.places || [])].sort(
        (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
      ),
    [selectedTour?.places],
  );

  useEffect(() => {
    setActivePlace(null);
  }, [selectedTour?._id]);

  function handleLocationSelect(group) {
    setSelectedLocationId(getId(group.location));
    setSearchParams({ location: group.location.slug });
  }

  function openContactModal(inquiryContext) {
    setContactContext(inquiryContext);
  }

  const listPanel = (
    <PlacesPanel
      activePlace={activePlace}
      onSelect={setActivePlace}
      places={places}
    />
  );
  const mapPanel = (
    <Suspense
      fallback={
        <div className="h-[300px] w-full max-w-full animate-pulse rounded-2xl border border-[#283A2C]/10 bg-[#DADDC5]/40 sm:h-[26rem] lg:h-[30rem]" />
      }
    >
      <DayTourMap
        activePlace={activePlace}
        containerClassName="relative h-[300px] w-full max-w-full overflow-hidden rounded-2xl border border-[#283A2C]/10 bg-[#FFFFFF] shadow-[0_24px_70px_rgba(40,58,44,0.12)] sm:h-[26rem] lg:h-[30rem]"
        fitRouteToBounds={false}
        onPlaceSelect={setActivePlace}
        places={places}
        scrollWheelZoom={false}
      />
    </Suspense>
  );
  const detailsPanel = (
    <DetailsPanel
      activePlace={activePlace}
      onContact={openContactModal}
      tour={selectedTour}
    />
  );

  return (
    <section className="relative w-full max-w-full overflow-x-hidden bg-[#F1EFEC] px-4 pb-16 pt-28 text-[#283A2C] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[23rem] bg-[#283A2C] md:h-[27rem]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[23rem] bg-[radial-gradient(circle_at_50%_0%,rgba(218,221,197,0.18),transparent_28rem),linear-gradient(180deg,rgba(0,0,0,0.20)_0%,rgba(40,58,44,0)_72%)] md:h-[27rem]" />
      <div className="pointer-events-none absolute inset-x-0 top-[27rem] hidden h-28 bg-gradient-to-b from-[#283A2C] to-[#F1EFEC] md:block" />
      {selectedTour?.heroImage && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTour.heroImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.26 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-[34rem]"
          >
            <img
              src={selectedTour.heroImage}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/72 via-obsidian/76 to-obsidian" />
          </motion.div>
        </AnimatePresence>
      )}

      <div className="relative mx-auto w-full max-w-7xl min-w-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative isolate flex min-h-[16rem] w-full max-w-full flex-col justify-end gap-5 overflow-hidden rounded-[1.5rem] border border-[#FFFFFF]/14 bg-[#1f3024] px-5 py-8 text-[#FFFFFF] shadow-none sm:min-h-[18rem] sm:px-8 md:shadow-[0_28px_84px_rgba(0,0,0,0.22)] lg:min-h-[26rem] lg:flex-row lg:items-end lg:justify-between"
        >
          {selectedTour?.heroImage && (
            <>
              <motion.img
                key={selectedTour.heroImage}
                src={selectedTour.heroImage}
                alt=""
                initial={{ scale: 1.06, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 -z-20 h-full w-full object-cover"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101a13]/94 via-[#283A2C]/72 to-[#283A2C]/34" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101a13]/88 via-transparent to-[#283A2C]/38" />
            </>
          )}

          <div className="max-w-3xl">
            <p className="text-[0.64rem] font-black uppercase tracking-[0.42em] text-[#DADDC5]">
              Location Explorer
            </p>
            <h1 className="mt-3 font-display text-[2rem] font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Day Tours
            </h1>
            <div className="mt-4 h-px w-12 bg-[#DADDC5]" />
            <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-[#F1EFEC]/86 sm:text-base lg:text-[1.05rem]">
              Explore focused one-day journeys built around real Sri Lankan
              locations and the places connected to them.
            </p>
          </div>

          {selectedTour && (
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#FFFFFF]/14 bg-black/32 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#F1EFEC]/78 backdrop-blur-md">
                <Navigation size={15} className="text-[#DADDC5]" />
                {places.length} places
              </div>
              <button
                type="button"
                onClick={() =>
                  openContactModal({
                    inquiryType: 'Day Tour',
                    relatedLocation: selectedTour.mainLocation?.name || '',
                    selectedItemSlug: selectedTour.slug,
                    selectedItemTitle: selectedTour.title,
                    selectedPlace: activePlace?.name || '',
                  })
                }
                className="inline-flex min-h-9 items-center gap-2 rounded-full border-[1.5px] border-[#283A2C] bg-[#F1EFEC] px-4 text-xs font-black uppercase tracking-[0.16em] text-[#283A2C] transition duration-300 ease-out hover:bg-[#DADDC5]"
              >
                <MessageCircle size={15} />
                Contact
              </button>
            </div>
          )}
        </motion.div>

        {status === 'loading' && (
          <div className="mt-10 grid min-h-52 place-items-center rounded-lg border border-[#DADDC5]/24 bg-[#F1EFEC]">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-[#283A2C]" size={30} />
              <p className="mt-3 text-sm font-bold text-[#283A2C]/52">
                Loading Day Tours
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-10">
            <EmptyPanel title="Day Tours unavailable" message={error} />
          </div>
        )}

        {status === 'success' && dayTours.length === 0 && (
          <div className="mt-10">
            <EmptyPanel
              icon={Sparkles}
              title="No Day Tours yet"
              message="Day Tours are not published yet."
            />
          </div>
        )}

        {locationGroups.length > 0 && (
          <>
            <MobileLocationDial
              locationGroups={locationGroups}
              onSelect={handleLocationSelect}
              selectedLocationId={selectedLocationId}
            />

            <div className="mt-6 hidden w-full max-w-full flex-wrap items-center justify-center gap-3 px-0 pb-1.5 md:flex">
              {locationGroups.map((group) => {
                const isActive = getId(group.location) === selectedLocationId;

                return (
                  <button
                    key={getId(group.location)}
                    type="button"
                    onClick={() => handleLocationSelect(group)}
                    className={`min-w-[6.5rem] max-w-full overflow-hidden rounded-full border px-3.5 py-2 text-[0.68rem] font-bold transition duration-300 md:min-w-0 md:px-5 md:py-3 md:text-sm md:font-black md:uppercase md:tracking-[0.16em] ${
                      isActive
                        ? 'border-[#283A2C] bg-[#283A2C] text-[#FFFFFF] shadow-[0_8px_22px_rgba(40,58,44,0.28)]'
                        : 'border-[#283A2C]/45 bg-[#FFFFFF] text-[#283A2C] shadow-[0_4px_12px_rgba(40,58,44,0.06)] hover:border-[#283A2C] hover:bg-[#DADDC5]'
                    }`}
                  >
                    <span className="line-clamp-1 break-words">
                      {group.location.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedGroup?.tours?.length > 1 && (
              <div className="mt-3 flex w-full max-w-full flex-wrap items-center justify-center gap-2.5 px-1.5 pb-1.5 md:gap-3 md:px-0">
                {selectedGroup.tours.map((tour) => {
                  const isActive = tour._id === selectedTourId;

                  return (
                    <button
                      key={tour._id}
                      type="button"
                      onClick={() => {
                        setSelectedTourId(tour._id);
                        setActivePlace(null);
                      }}
                      className={`min-w-[6.5rem] max-w-full rounded-full border px-3.5 py-2 text-[0.68rem] font-bold transition duration-300 md:min-w-0 md:px-4 md:py-3 md:text-xs md:font-black md:uppercase md:tracking-[0.14em] ${
                        isActive
                          ? 'border-[#283A2C] bg-[#283A2C] text-[#FFFFFF] shadow-[0_8px_22px_rgba(40,58,44,0.28)]'
                          : 'border-[#283A2C]/45 bg-[#FFFFFF] text-[#283A2C] shadow-[0_4px_12px_rgba(40,58,44,0.06)] hover:border-[#283A2C] hover:bg-[#DADDC5]'
                      }`}
                    >
                      <span className="line-clamp-1 break-words">
                        {tour.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-8 grid w-full max-w-full min-w-0 grid-cols-1 gap-5 overflow-hidden md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,34rem)_23rem] xl:items-start xl:justify-center xl:overflow-visible">
              <div className="order-2 min-w-0 max-w-full overflow-hidden xl:order-1">
                {listPanel}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTour?._id || selectedLocationId}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.3 }}
                  className="order-1 min-w-0 max-w-full overflow-hidden lg:col-span-2 xl:order-2 xl:col-span-1"
                >
                  {mapPanel}
                </motion.div>
              </AnimatePresence>
              <div className="order-3 min-w-0 max-w-full overflow-hidden xl:order-3">
                {detailsPanel}
              </div>
            </div>

            {selectedTour?.faqs?.length > 0 && (
              <div className="mt-12 rounded-2xl border border-[#283A2C]/10 bg-[#FFFFFF] p-5 text-[#283A2C] shadow-[0_18px_50px_rgba(40,58,44,0.08)] sm:p-7">
                <p className="inline-flex items-center gap-2 text-[0.64rem] font-black uppercase tracking-[0.24em] text-[#283A2C]/50">
                  <HelpCircle size={16} />
                  FAQ
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {selectedTour.faqs.map((faq) => (
                    <div
                      key={`${faq.question}-${faq.answer}`}
                      className="rounded-sm border border-[#283A2C]/10 bg-[#F1EFEC] p-5"
                    >
                      <h3 className="break-words font-display text-2xl font-semibold">
                        {faq.question}
                      </h3>
                      <p className="mt-3 break-words text-sm leading-7 text-[#283A2C]/62">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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
