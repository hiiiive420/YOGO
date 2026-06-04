import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  MessageCircle,
  Navigation,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchDiscoverPage } from '../services/discoverApi.js';
import ContactInquiryModal from '../components/contact/ContactInquiryModal.jsx';

const CinematicSriLankaMap = lazy(
  () => import('../components/maps/CinematicSriLankaMap.jsx'),
);

function locationToStop(location, badge = 'Destination') {
  return {
    badge,
    description: location?.description,
    id: location?._id,
    image: location?.image,
    latitude: Number(location?.latitude),
    longitude: Number(location?.longitude),
    name: location?.name,
    subtitle: `${location?.latitude}, ${location?.longitude}`,
  };
}

export default function DestinationDetail() {
  const { slug } = useParams();
  const [contactContext, setContactContext] = useState(null);
  const [destination, setDestination] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    fetchDiscoverPage(slug)
      .then((data) => {
        if (!isMounted) return;
        setDestination(data);
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

  if (status === 'loading') {
    return (
      <section className="min-h-screen bg-soft-noise px-4 pt-32 text-pearl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
            Loading destination
          </p>
          <div className="mt-8 h-72 animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
      </section>
    );
  }

  if (status === 'error' || !destination) {
    return (
      <section className="min-h-screen bg-soft-noise px-4 pt-32 text-pearl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/discover-sri-lanka"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-champagne"
          >
            <ArrowLeft size={16} />
            Discover Sri Lanka
          </Link>
          <h1 className="mt-8 font-display text-5xl font-semibold">
            Destination unavailable
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-pearl/66">
            {error || 'This destination could not be loaded right now.'}
          </p>
        </div>
      </section>
    );
  }

  const heroImage =
    destination.heroImage || destination.gallery[0] || destination.location.image;
  const gallery = [
    heroImage,
    ...(destination.gallery || []).filter((image) => image !== heroImage),
  ];

  return (
    <article className="bg-obsidian pb-20 text-pearl">
      <section className="relative min-h-[78vh] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={destination.location.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/68 to-black/12" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/30" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(78vh-7rem)] max-w-7xl flex-col justify-end">
          <Link
            to="/discover-sri-lanka"
            className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-black/28 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pearl/74 backdrop-blur-md transition hover:border-champagne hover:text-champagne"
          >
            <ArrowLeft size={16} />
            Discover Sri Lanka
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              {destination.location.name}
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] sm:text-7xl lg:text-[7rem] lg:leading-[0.88]">
              {destination.title}
            </h1>
            <div
              className="mt-7 max-w-2xl text-pretty text-base leading-8 text-pearl/76 sm:text-lg [&_a]:text-champagne [&_em]:text-pearl [&_strong]:text-pearl"
              dangerouslySetInnerHTML={{ __html: destination.description }}
            />
            <button
              type="button"
              onClick={() =>
                setContactContext({
                  inquiryType: 'Destination',
                  relatedLocation: destination.location?.name || '',
                  selectedItemSlug: destination.slug,
                  selectedItemTitle: destination.title,
                })
              }
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pearl px-6 text-sm font-extrabold uppercase tracking-[0.16em] text-obsidian transition hover:bg-champagne"
            >
              <MessageCircle size={18} />
              Contact
            </button>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ['Latitude', destination.location.latitude],
            ['Longitude', destination.location.longitude],
            ['Gallery', `${gallery.length} images`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
            >
              <Navigation size={20} className="text-champagne" />
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
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              Highlights
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              What makes this place unforgettable.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {destination.highlights.map((highlight, index) => (
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
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-cinnamon">
                Gallery
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
                Visual notes from the destination.
              </h2>
            </div>
            <ImageIcon className="hidden text-cinnamon sm:block" size={34} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {gallery.slice(0, 6).map((image, index) => (
              <motion.div
                key={`${image}-${index}`}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.04, duration: 0.45 }}
                className={`overflow-hidden rounded-lg ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${destination.location.name} gallery ${index + 1}`}
                  className="h-full min-h-64 w-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              Travel tips
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Before you go.
            </h2>
          </div>
          <div className="grid gap-4">
            {destination.travelTips.map((tip, index) => (
              <div
                key={tip}
                className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-champagne/50 text-xs font-black text-champagne">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-pearl/68">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="min-h-[42rem] animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
            }
          >
            <CinematicSriLankaMap
              description="This destination map is generated from the connected reusable location record."
              kicker="Destination map"
              stops={[locationToStop(destination.location)]}
              title="A focused island pin."
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
