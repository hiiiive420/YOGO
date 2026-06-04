import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BedDouble,
  Check,
  ExternalLink,
  MapPinned,
  MessageCircle,
  Phone,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAccommodationBySlug } from '../services/accommodationApi.js';
import ContactInquiryModal from '../components/contact/ContactInquiryModal.jsx';

const CinematicSriLankaMap = lazy(
  () => import('../components/maps/CinematicSriLankaMap.jsx'),
);

function locationToStop(location, index, badge) {
  return {
    badge: badge || `Stop ${index + 1}`,
    description: location?.description,
    id: location?._id,
    image: location?.image,
    latitude: Number(location?.latitude),
    longitude: Number(location?.longitude),
    name: location?.name,
    subtitle: `${location?.latitude}, ${location?.longitude}`,
  };
}

export default function AccommodationDetail() {
  const { slug } = useParams();
  const [contactContext, setContactContext] = useState(null);
  const [stay, setStay] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    fetchAccommodationBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        setStay(data);
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
  }, [slug]);

  const gallery = useMemo(() => {
    if (!stay) return [];
    return [stay.heroImage, ...(stay.gallery || [])].filter(Boolean);
  }, [stay]);
  const mapStops = useMemo(() => {
    if (!stay) return [];
    return [
      locationToStop(stay.location, 0, 'Stay'),
      ...(stay.nearbyAttractions || []).map((location, index) =>
        locationToStop(location, index + 1, 'Nearby'),
      ),
    ].filter((location) => location.id);
  }, [stay]);

  if (status === 'loading') {
    return (
      <section className="min-h-screen bg-soft-noise px-4 pt-32 text-pearl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-[32rem] animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
      </section>
    );
  }

  if (status === 'error' || !stay) {
    return (
      <section className="min-h-screen bg-soft-noise px-4 pt-32 text-pearl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/accommodations"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-champagne"
          >
            <ArrowLeft size={16} />
            Accommodations
          </Link>
          <h1 className="mt-8 font-display text-5xl font-semibold">
            Stay unavailable
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-pearl/66">
            {error || 'This accommodation could not be loaded right now.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <article className="bg-obsidian pb-20 text-pearl">
      <section className="relative min-h-[80vh] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <img
            src={stay.heroImage}
            alt={stay.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/66 to-black/12" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/32" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(80vh-7rem)] max-w-7xl flex-col justify-end">
          <Link
            to="/accommodations"
            className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-black/28 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pearl/74 backdrop-blur-md transition hover:border-champagne hover:text-champagne"
          >
            <ArrowLeft size={16} />
            Accommodations
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.28em] text-champagne">
              <MapPinned size={16} />
              {stay.location?.name}
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] sm:text-7xl lg:text-[7rem] lg:leading-[0.88]">
              {stay.title}
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-base leading-8 text-pearl/76 sm:text-lg">
              {stay.shortDescription}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {[
            [Star, `${stay.starRating} stars`, 'Rating'],
            [BedDouble, stay.priceRange, 'Price'],
            [Check, stay.checkInTime || 'Flexible', 'Check-in'],
            [Check, stay.checkOutTime || 'Flexible', 'Check-out'],
          ].map(([Icon, value, label]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
            >
              <Icon size={20} className="text-champagne" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.24em] text-pearl/42">
                {label}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              The stay
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              A composed base for the journey.
            </h2>
            <p className="mt-6 text-pretty text-base leading-8 text-pearl/66">
              {stay.fullDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {stay.contactNumber && (
                <a
                  href={`tel:${stay.contactNumber}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-pearl px-5 text-sm font-extrabold uppercase tracking-[0.16em] text-obsidian transition hover:bg-champagne"
                >
                  <Phone size={18} />
                  Call
                </a>
              )}
              {stay.whatsappNumber && (
                <a
                  href={`https://wa.me/${stay.whatsappNumber.replace(/\D/g, '')}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-extrabold uppercase tracking-[0.16em] text-pearl transition hover:border-champagne hover:text-champagne"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              )}
              {stay.website && (
                <a
                  href={stay.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-extrabold uppercase tracking-[0.16em] text-pearl transition hover:border-champagne hover:text-champagne"
                >
                  <ExternalLink size={18} />
                  Website
                </a>
              )}
              <button
                type="button"
                onClick={() =>
                  setContactContext({
                    inquiryType: 'Accommodation',
                    relatedLocation: stay.location?.name || '',
                    selectedItemSlug: stay.slug,
                    selectedItemTitle: stay.title,
                  })
                }
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-pearl px-5 text-sm font-extrabold uppercase tracking-[0.16em] text-obsidian transition hover:bg-champagne"
              >
                <MessageCircle size={18} />
                Contact
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stay.highlights?.map((highlight, index) => (
              <motion.div
                key={highlight}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.04, duration: 0.45 }}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pearl text-obsidian">
                  <Check size={17} />
                </span>
                <p className="mt-5 text-sm font-semibold leading-7 text-pearl/72">
                  {highlight}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pearl px-4 py-16 text-obsidian sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-cinnamon">
              Gallery
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Light, texture, and atmosphere.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {gallery.slice(0, 6).map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`overflow-hidden rounded-lg ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${stay.title} gallery ${index + 1}`}
                  className="h-full min-h-64 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <InfoList title="Amenities" items={stay.amenities} />
          <InfoList title="Policies" items={stay.policies} />
        </div>

        {stay.roomTypes?.length > 0 && (
          <div className="mx-auto mt-12 max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              Room types
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {stay.roomTypes.map((room) => (
                <div
                  key={room.name}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-6"
                >
                  <h3 className="font-display text-3xl font-semibold">
                    {room.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-pearl/62">
                    {room.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.18em] text-champagne">
                    {room.priceRange && <span>{room.priceRange}</span>}
                    {room.maxGuests && <span>{room.maxGuests} guests</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {(stay.nearbyAttractions?.length > 0 || stay.featuredReviews?.length > 0) && (
        <section className="bg-black px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <InfoList
              title="Nearby attractions"
              items={stay.nearbyAttractions?.map((location) => location.name)}
            />
            <InfoList
              title="Featured reviews"
              items={stay.featuredReviews?.map(
                (review) => `${review.guestName}: ${review.comment}`,
              )}
            />
          </div>
        </section>
      )}

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="min-h-[42rem] animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
            }
          >
            <CinematicSriLankaMap
              description="The stay and nearby attractions are drawn from existing location records, ready for concierge route planning."
              emptyMessage="Map pins will appear after this accommodation is connected to a location."
              kicker="Stay map"
              routeStops={mapStops}
              stops={mapStops}
              title="Stay, surroundings, and nearby highlights."
            />
          </Suspense>
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

function InfoList({ title, items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-champagne">
        {title}
      </p>
      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <div key={item} className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-champagne text-obsidian">
              <Check size={14} />
            </span>
            <p className="text-sm leading-7 text-pearl/68">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
