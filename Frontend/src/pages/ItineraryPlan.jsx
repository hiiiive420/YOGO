import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Compass,
  Home,
  Loader2,
  MapPinned,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAccommodations } from '../api/accommodations';
import { fetchItineraryDays } from '../api/itineraryDays';
import { fetchPublicItineraryBySlug } from '../api/itineraryPlans';
import ContactInquiryModal from '../components/contact/ContactInquiryModal.jsx';

const ItineraryRouteMap = lazy(
  () => import('../components/maps/ItineraryRouteMap.jsx'),
);

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

function getDayLocations(day) {
  return day.locations || day.selectedLocations || [];
}

function hasDayContent(day) {
  return Boolean(
    day.title ||
      day.description ||
      day.heroImage ||
      day.travelTime ||
      day.activities?.length ||
      day.instructions?.length ||
      getDayLocations(day).length,
  );
}

export default function ItineraryPlan() {
  const { categorySlug, planSlug } = useParams();
  const effectivePlanSlug = planSlug;
  const [accommodations, setAccommodations] = useState([]);
  const [category, setCategory] = useState(null);
  const [contactContext, setContactContext] = useState(null);
  const [days, setDays] = useState([]);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    setError('');

    async function loadPlan() {
      try {
        const selectedPlan = await fetchPublicItineraryBySlug(effectivePlanSlug);
        const selectedCategory =
          typeof selectedPlan.categoryId === 'object'
            ? selectedPlan.categoryId
            : null;

        const planDays =
          Array.isArray(selectedPlan.days) && selectedPlan.days.length > 0
            ? selectedPlan.days
            : await fetchItineraryDays({
                itineraryPlanId: selectedPlan._id,
              });
        const accommodationData = await fetchAccommodations().catch(() => []);

        if (!isMounted) return;
        setCategory(selectedCategory);
        setPlan(selectedPlan);
        setDays(planDays);
        setAccommodations(accommodationData);
        setStatus('success');
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.message);
        setStatus('error');
      }
    }

    loadPlan();

    return () => {
      isMounted = false;
    };
  }, [effectivePlanSlug]);

  const activities = useMemo(
    () => [...new Set(days.flatMap((day) => day.activities || []))],
    [days],
  );
  const instructions = useMemo(
    () => [...new Set(days.flatMap((day) => day.instructions || []))],
    [days],
  );
  const accommodationReferences = useMemo(() => {
    const journeyLocationIds = new Set(
      days.flatMap((day) =>
        getDayLocations(day).map((location) => getId(location)),
      ),
    );

    return accommodations.filter((accommodation) =>
      journeyLocationIds.has(getId(accommodation.location)),
    );
  }, [accommodations, days]);
  const visibleDays = useMemo(
    () => days.filter((day) => hasDayContent(day)),
    [days],
  );
  const faqs = Array.isArray(plan?.faqs) ? plan.faqs : [];
  const themePath = category?.slug
    ? `/travel-themes?theme=${category.slug}`
    : categorySlug
      ? `/travel-themes?theme=${categorySlug}`
      : '/travel-themes';
  const activityInquiryContext = plan
    ? {
        inquiryType: 'Activity Package',
        relatedLocation: 'Sri Lanka',
        relatedTheme: category?.title || '',
        selectedItemSlug: plan.slug,
        selectedItemTitle: plan.title,
        totalDays: plan.totalDays || '',
      }
    : null;

  if (status === 'loading') {
    return (
      <section className="grid min-h-screen place-items-center bg-obsidian px-4 pt-28 text-pearl">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-champagne" size={32} />
          <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.22em] text-pearl/52">
            Loading itinerary
          </p>
        </div>
      </section>
    );
  }

  if (status === 'error' || !category || !plan) {
    return (
      <section className="min-h-screen bg-soft-noise px-4 pt-32 text-pearl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/travel-themes"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-champagne"
          >
            <ArrowLeft size={16} />
            Travel Themes
          </Link>
          <h1 className="mt-8 font-display text-5xl font-semibold">
            Itinerary unavailable
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-pearl/66">
            {error || 'This itinerary could not be loaded right now.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <article className="bg-obsidian pb-20 text-pearl">
      <section className="relative min-h-[76vh] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <img
            src={plan.heroImage}
            alt={plan.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/68 to-black/18" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/30" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(76vh-7rem)] max-w-7xl flex-col justify-end">
          <Link
            to={themePath}
            className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-black/28 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pearl/74 backdrop-blur-md transition hover:border-champagne hover:text-champagne"
          >
            <ArrowLeft size={16} />
            {category?.title || 'Travel Themes'}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              {category.title} itinerary
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] sm:text-7xl lg:text-[7rem] lg:leading-[0.88]">
              {plan.title}
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-base leading-8 text-pearl/76 sm:text-lg">
              {plan.shortDescription}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setContactContext(activityInquiryContext)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pearl px-6 text-sm font-extrabold uppercase tracking-[0.16em] text-obsidian transition hover:bg-champagne"
              >
                <MessageCircle size={18} />
                {plan.contactCtaText || 'Contact'}
              </button>
              <a
                href="#day-details"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/28 px-6 text-sm font-extrabold uppercase tracking-[0.16em] text-pearl transition hover:border-champagne hover:text-champagne"
              >
                <CalendarDays size={18} />
                Day Details
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          {[
            [CalendarDays, getDurationLabel(plan), 'Duration'],
            [Sparkles, `${visibleDays.length} day plans`, 'Published days'],
            [Compass, category?.title || 'Travel Theme', 'Theme'],
          ].map(([Icon, value, label]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
            >
              <Icon size={20} className="text-champagne" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.24em] text-pearl/42">
                {label}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.74fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              About This Journey
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {plan.title}
            </h2>
          </div>
          <p className="text-pretty text-base leading-8 text-pearl/66 sm:text-lg">
            {plan.fullDescription || plan.shortDescription}
          </p>
        </div>
      </section>

      <section id="day-details" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              Day timeline
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Day by Day
            </h2>
            {category?.description && (
              <p className="mt-5 text-pretty text-base leading-8 text-pearl/62">
                {category.description}
              </p>
            )}
          </div>

          <div className="relative">
            <div className="absolute bottom-6 left-[1.35rem] top-6 hidden w-px bg-gradient-to-b from-champagne via-white/20 to-transparent sm:block" />
            <div className="grid gap-5">
              {visibleDays.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-sm leading-7 text-pearl/64">
                    Day details are not published yet.
                  </p>
                </div>
              )}

              {visibleDays.map((day, index) => (
                <motion.div
                  key={day._id || day.dayNumber}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.04, duration: 0.5 }}
                  className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] sm:ml-14"
                >
                  <div className="absolute -left-[3.65rem] top-6 hidden h-9 w-9 items-center justify-center rounded-full border border-champagne/50 bg-black text-xs font-black text-champagne sm:flex">
                    {day.dayNumber}
                  </div>
                  {day.heroImage && (
                    <img
                      src={day.heroImage}
                      alt={day.title}
                      className="h-52 w-full object-cover"
                    />
                  )}
                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-champagne">
                      Day {day.dayNumber}
                      {day.travelTime ? ` / ${day.travelTime}` : ''}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-semibold">
                      {day.title}
                    </h3>
                    {day.description && (
                      <p className="mt-3 text-sm leading-7 text-pearl/62">
                        {day.description}
                      </p>
                    )}
                    {getDayLocations(day).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {getDayLocations(day).map((location) => (
                        <span
                          key={location._id}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-pearl/58"
                        >
                          {location.name}
                        </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {accommodationReferences.length > 0 && (
        <section className="bg-pearl px-4 py-16 text-obsidian sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-cinnamon">
                  Accommodation References
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
                  Stays connected to this route.
                </h2>
              </div>
              <Home className="text-cinnamon" size={28} />
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {accommodationReferences.map((accommodation, index) => (
                <motion.article
                  key={accommodation._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.05, duration: 0.45 }}
                  className="overflow-hidden rounded-lg bg-white shadow-[0_20px_70px_rgba(0,0,0,0.10)]"
                >
                  <img
                    src={accommodation.heroImage}
                    alt={accommodation.title}
                    className="h-56 w-full object-cover"
                  />
                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-black/42">
                      {accommodation.location?.name}
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-semibold">
                      {accommodation.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-black/60">
                      {accommodation.shortDescription}
                    </p>
                    <Link
                      to={`/accommodations/${accommodation.slug}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-cinnamon"
                    >
                      View Stay
                      <ArrowLeft size={16} className="rotate-180" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-pearl px-4 py-16 text-obsidian sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ duration: 0.55 }}
            className="rounded-lg bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.10)] sm:p-8"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-cinnamon">
              Activities
            </p>
            <div className="mt-6 grid gap-3">
              {activities.length === 0 && (
                <p className="text-sm leading-7 text-black/56">
                  Activities are not published yet.
                </p>
              )}
              {activities.map((activity) => (
                <div
                  key={activity}
                  className="flex items-center gap-3 rounded-lg border border-black/[0.08] bg-black/[0.03] p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-obsidian text-champagne">
                    <Check size={16} />
                  </span>
                  <span className="text-sm font-bold text-black/72">
                    {activity}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ delay: 0.08, duration: 0.55 }}
            className="rounded-lg bg-obsidian p-6 text-pearl shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:p-8"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-champagne">
              Instructions
            </p>
            <div className="mt-6 grid gap-4">
              {instructions.length === 0 && (
                <p className="text-sm leading-7 text-pearl/64">
                  Instructions are not published yet.
                </p>
              )}
              {instructions.map((instruction, index) => (
                <div key={instruction} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-champagne/50 text-xs font-black text-champagne">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-pearl/68">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
                Route map
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
                {plan.title}
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-pearl/52">
              <MapPinned size={15} />
              Route preview
            </div>
          </div>

          <Suspense
            fallback={
              <div className="min-h-[42rem] animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
            }
          >
            <ItineraryRouteMap
              categorySlug={category?.slug}
              days={days}
              description={plan.shortDescription}
              kicker={category?.title}
              planSlug={plan.slug}
              title={plan.title}
            />
          </Suspense>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="bg-pearl px-4 py-16 text-obsidian sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-cinnamon">
              FAQ
            </p>
            <div className="mt-8 grid gap-4">
              {faqs.map((faq) => (
                <div
                  key={`${faq.question}-${faq.answer}`}
                  className="rounded-lg bg-white p-5 shadow-[0_18px_54px_rgba(0,0,0,0.08)]"
                >
                  <h3 className="font-display text-2xl font-semibold">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-black/62">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-lg border border-white/10 bg-white/[0.05] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              Private Planning
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold">
              {plan.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setContactContext(activityInquiryContext)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pearl px-6 text-sm font-extrabold uppercase tracking-[0.16em] text-obsidian transition hover:bg-champagne"
          >
            <MessageCircle size={18} />
            {plan.contactCtaText || 'Contact'}
          </button>
        </div>
      </section>
      <ContactInquiryModal
        inquiryContext={contactContext}
        isOpen={Boolean(contactContext)}
        onClose={() => setContactContext(null)}
      />
    </article>
  );
}
