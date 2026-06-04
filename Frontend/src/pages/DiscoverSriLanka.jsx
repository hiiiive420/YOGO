import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPinned, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchDiscoverPages } from '../services/discoverApi.js';

export default function DiscoverSriLanka() {
  const [destinations, setDestinations] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchDiscoverPages()
      .then((data) => {
        if (!isMounted) return;
        setDestinations(data);
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

  return (
    <section className="min-h-screen bg-obsidian pb-20 pt-32 text-pearl sm:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
            Island guide
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
            Discover Sri Lanka
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-pearl/68 sm:text-lg">
            Explore curated destination stories with gallery moments, highlights,
            and practical travel notes for evocative places across the island.
          </p>
        </motion.div>

        {status === 'loading' && (
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[31rem] animate-pulse rounded-lg bg-white/[0.06]"
              />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-14 rounded-lg border border-white/10 bg-white/[0.04] p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-champagne">
              No destinations loaded
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold">
              Discover pages will appear here.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-pearl/62">
              {error}
            </p>
          </div>
        )}

        {status === 'success' && destinations.length === 0 && (
          <div className="mt-14 rounded-lg border border-white/10 bg-white/[0.04] p-8">
            <MapPinned className="text-champagne" size={30} />
            <h2 className="mt-5 font-display text-4xl font-semibold">
              No destinations published yet.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-pearl/62">
              Published discover pages connected to locations will appear here
              once they are created.
            </p>
          </div>
        )}

        {status === 'success' && destinations.length > 0 && (
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((destination, index) => {
              const image =
                destination.heroImage ||
                destination.gallery[0] ||
                destination.location?.image ||
                '';

              return (
                <motion.article
                  key={destination._id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
                >
                  <Link to={`/discover-sri-lanka/${destination.slug}`}>
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={image}
                        alt={destination.location.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/18 to-transparent" />
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-pearl px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-obsidian">
                        <Sparkles size={15} />
                        {destination.isFeatured ? 'Featured' : 'Guide'}
                      </div>
                      <div className="absolute bottom-0 left-0 p-5">
                        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-champagne">
                          {destination.location?.name}
                        </p>
                        <h2 className="mt-3 font-display text-4xl font-semibold">
                          {destination.title}
                        </h2>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="line-clamp-3 text-sm leading-7 text-pearl/62">
                        {stripHtml(destination.description)}
                      </p>
                      <div className="mt-6 flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-pearl/42">
                          <MapPinned size={15} />
                          {(destination.gallery?.length || 0) + 1} images
                        </span>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 text-champagne transition group-hover:border-champagne group-hover:bg-champagne group-hover:text-obsidian">
                          <ArrowRight size={18} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ');
}
