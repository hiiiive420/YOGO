import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Loader2,
  Route,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchItineraryCategories } from '../api/itineraryCategories';
import { fetchItineraryPlans } from '../api/itineraryPlans';

export default function ItineraryCategory() {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    setError('');

    async function loadCategoryPlans() {
      try {
        const categories = await fetchItineraryCategories();
        const selectedCategory = categories.find(
          (item) => item.slug === categorySlug,
        );

        if (!selectedCategory) {
          throw new Error('Itinerary category not found');
        }

        const categoryPlans = await fetchItineraryPlans({
          categoryId: selectedCategory._id,
        });

        if (!isMounted) return;
        setCategory(selectedCategory);
        setPlans(categoryPlans);
        setStatus('success');
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.message);
        setStatus('error');
      }
    }

    loadCategoryPlans();

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  if (status === 'loading') {
    return (
      <section className="grid min-h-screen place-items-center bg-obsidian px-4 pt-28 text-pearl">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-champagne" size={32} />
          <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.22em] text-pearl/52">
            Loading itinerary plans
          </p>
        </div>
      </section>
    );
  }

  if (status === 'error' || !category) {
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
            Category unavailable
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-pearl/66">
            {error || 'This itinerary category could not be loaded right now.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-obsidian pb-20 pt-28 text-pearl sm:pt-32">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={category.thumbnailImage}
            alt={category.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/24" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/25" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Link
            to="/travel-themes"
            className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/28 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pearl/74 backdrop-blur-md transition hover:border-champagne hover:text-champagne"
          >
            <ArrowLeft size={16} />
            Travel Themes
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 max-w-3xl"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-champagne">
              Private routes
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
              {category.title} Itineraries
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-pearl/72 sm:text-lg">
              {category.description}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {plans.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-8">
            <Route className="text-champagne" size={30} />
            <h2 className="mt-5 font-display text-4xl font-semibold">
              No plans in this category yet.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-pearl/62">
              Plans created in admin for {category.title} will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {plans.map((plan, index) => (
              <motion.article
                key={plan._id}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.55 }}
                className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
              >
                <Link to={`/itineraries/${plan.slug}`}>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={plan.heroImage}
                      alt={plan.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/48 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-champagne backdrop-blur-md">
                      <CalendarDays size={15} />
                      {plan.totalDays} days
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.24em] text-pearl/48">
                      <Sparkles size={15} className="text-champagne" />
                      {category.title}
                    </div>
                    <h2 className="mt-4 font-display text-4xl font-semibold">
                      {plan.title}
                    </h2>
                    <p className="mt-4 text-pretty text-sm leading-7 text-pearl/62">
                      {plan.shortDescription}
                    </p>
                    <div className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.16em] text-champagne">
                      View plan
                      <ArrowRight
                        size={17}
                        className="transition group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
