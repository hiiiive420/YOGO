import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  HelpCircle,
  Loader2,
  MapPinned,
  MessageCircle,
  Navigation,
  Sparkles,
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[27rem] bg-[#283A2C]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[27rem] bg-[radial-gradient(circle_at_50%_0%,rgba(218,221,197,0.18),transparent_28rem),linear-gradient(180deg,rgba(0,0,0,0.20)_0%,rgba(40,58,44,0)_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[27rem] h-28 bg-gradient-to-b from-[#283A2C] to-[#F1EFEC]" />
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
          className="relative isolate flex min-h-[16rem] w-full max-w-full flex-col justify-end gap-5 overflow-hidden rounded-[1.5rem] border border-[#FFFFFF]/14 bg-[#1f3024] px-5 py-8 text-[#FFFFFF] shadow-[0_28px_84px_rgba(0,0,0,0.22)] sm:min-h-[18rem] sm:px-8 lg:min-h-[26rem] lg:flex-row lg:items-end lg:justify-between"
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
            <div className="mt-10 flex w-full max-w-full gap-3 overflow-x-auto pb-3 md:flex-wrap md:justify-center md:overflow-visible">
              {locationGroups.map((group) => {
                const isActive = getId(group.location) === selectedLocationId;

                return (
                  <button
                    key={getId(group.location)}
                    type="button"
                    onClick={() => handleLocationSelect(group)}
                    className={`max-w-[82vw] shrink-0 overflow-hidden whitespace-normal break-words rounded-full border px-5 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${
                      isActive
                        ? 'border-[#283A2C] bg-[#283A2C] text-[#DADDC5] shadow-[0_14px_34px_rgba(40,58,44,0.18)]'
                        : 'border-[#283A2C] bg-[#DADDC5] text-[#283A2C] transition duration-300 ease-out hover:bg-[#283A2C] hover:text-[#DADDC5]'
                    }`}
                  >
                    {group.location.name}
                  </button>
                );
              })}
            </div>

            {selectedGroup?.tours?.length > 1 && (
              <div className="mt-4 flex w-full max-w-full gap-3 overflow-x-auto pb-3 md:flex-wrap md:justify-center md:overflow-visible">
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
                      className={`max-w-[82vw] shrink-0 rounded-sm border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                        isActive
                          ? 'border-[#283A2C] bg-[#283A2C] text-[#DADDC5]'
                          : 'border-[#283A2C] bg-[#DADDC5] text-[#283A2C] transition duration-300 ease-out hover:bg-[#283A2C] hover:text-[#DADDC5]'
                      }`}
                    >
                      {tour.title}
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
