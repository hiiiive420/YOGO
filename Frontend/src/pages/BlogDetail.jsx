import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpenText, MapPinned } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchBlogBySlug } from '../api/blogs';

const CinematicSriLankaMap = lazy(
  () => import('../components/maps/CinematicSriLankaMap.jsx'),
);

function locationToStop(location, index) {
  return {
    badge: `Story stop ${index + 1}`,
    description: location?.description,
    id: location?._id,
    image: location?.image,
    latitude: Number(location?.latitude),
    longitude: Number(location?.longitude),
    name: location?.name,
    subtitle: `${location?.latitude}, ${location?.longitude}`,
  };
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    fetchBlogBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        setBlog(data);
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
    if (!blog) return [];
    return [blog.featuredImage, ...(blog.gallery || [])].filter(Boolean);
  }, [blog]);
  const mapStops = useMemo(
    () =>
      (blog?.relatedLocations || []).map((location, index) =>
        locationToStop(location, index),
      ),
    [blog?.relatedLocations],
  );

  if (status === 'loading') {
    return (
      <section className="min-h-screen bg-soft-noise px-4 pt-32 text-pearl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-[32rem] animate-pulse rounded-lg bg-white/[0.06]" />
        </div>
      </section>
    );
  }

  if (status === 'error' || !blog) {
    return (
      <section className="min-h-screen bg-soft-noise px-4 pt-32 text-pearl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-champagne"
          >
            <ArrowLeft size={16} />
            Blogs
          </Link>
          <h1 className="mt-8 font-display text-5xl font-semibold">
            Article unavailable
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-pearl/66">
            {error || 'This article could not be loaded right now.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <article className="bg-obsidian pb-20 text-pearl">
      <section className="relative min-h-[78vh] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/68 to-black/18" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/30" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(78vh-7rem)] max-w-7xl flex-col justify-end">
          <Link
            to="/blogs"
            className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-black/28 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pearl/74 backdrop-blur-md transition hover:border-champagne hover:text-champagne"
          >
            <ArrowLeft size={16} />
            Blogs
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.28em] text-champagne">
              <BookOpenText size={16} />
              Travel journal
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] sm:text-7xl lg:text-[7rem] lg:leading-[0.88]">
              {blog.title}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_20rem]">
          <div
            className="text-pretty text-base leading-8 text-pearl/72 [&_a]:text-champagne [&_em]:text-pearl [&_li]:mb-2 [&_p]:mb-5 [&_strong]:text-pearl"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          <aside className="grid content-start gap-5">
            {blog.relatedLocations?.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.24em] text-champagne">
                  <MapPinned size={15} />
                  Related
                </p>
                <div className="mt-5 grid gap-3">
                  {blog.relatedLocations.map((location) => (
                    <div key={location._id} className="flex gap-3">
                      <img
                        src={location.image}
                        alt={location.name}
                        className="h-14 w-16 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-display text-xl font-semibold">
                          {location.name}
                        </p>
                        <p className="mt-1 text-xs text-pearl/48">
                          {location.latitude}, {location.longitude}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {gallery.length > 1 && (
        <section className="bg-pearl px-4 py-16 text-obsidian sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-cinnamon">
              Gallery
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Visual notes from the story.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {gallery.slice(0, 6).map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${blog.title} gallery ${index + 1}`}
                  className="h-full min-h-64 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {mapStops.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <Suspense
              fallback={
                <div className="min-h-[42rem] animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
              }
            >
              <CinematicSriLankaMap
                description="This article map highlights the related locations selected in the blog editor."
                kicker="Story map"
                routeStops={mapStops}
                stops={mapStops}
                title="Places behind the article."
              />
            </Suspense>
          </div>
        </section>
      )}
    </article>
  );
}
