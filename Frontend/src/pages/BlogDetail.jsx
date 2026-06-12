import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpenText,
  MapPin,
  MapPinned,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchBlogBySlug } from '../api/blogs';

const CinematicSriLankaMap = lazy(
  () => import('../components/maps/CinematicSriLankaMap.jsx'),
);

function locationToStop(location) {
  return {
    badge: 'Story location',
    description: location?.description,
    id: location?._id,
    image: location?.image,
    latitude: Number(location?.latitude),
    longitude: Number(location?.longitude),
    name: location?.name,
  };
}

function getIntro(blog) {
  if (blog.seoDescription) return blog.seoDescription;

  const content =
    blog.content
      ?.replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || '';

  return content.length > 280 ? `${content.slice(0, 277).trim()}...` : content;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    window.scrollTo({ top: 0, behavior: 'auto' });
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
      (blog?.relatedLocations || [])
        .map((location) => locationToStop(location))
        .filter(
          (stop) =>
            Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude),
        ),
    [blog?.relatedLocations],
  );

  if (status === 'loading') {
    return <DetailLoading />;
  }

  if (status === 'error' || !blog) {
    return (
      <main className="min-h-screen bg-[#F1EFEC] px-4 pb-20 pt-32 text-[#283A2C] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-[#283A2C]/12 bg-[#FFFFFF] p-7 text-center md:p-10">
          <BookOpenText className="mx-auto" size={34} />
          <h1 className="mt-5 font-display text-5xl font-semibold">
            Story unavailable
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#283A2C]/62">
            {error || 'This article could not be loaded right now.'}
          </p>
          <Link
            to="/blogs"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#283A2C] px-5 py-3 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#F1EFEC]"
          >
            <ArrowLeft size={15} />
            Back to journal
          </Link>
        </div>
      </main>
    );
  }

  return (
    <article className="overflow-hidden bg-[#F1EFEC] pb-[calc(8.5rem+env(safe-area-inset-bottom))] text-[#283A2C] md:pb-20">
      <section className="px-4 pt-28 sm:px-6 md:pt-32 lg:px-8">
        <div className="relative mx-auto min-h-[32rem] max-w-7xl overflow-hidden rounded-b-[1.5rem] rounded-t-[2.6rem] bg-[#283A2C] text-[#F1EFEC] md:min-h-[42rem] md:rounded-[2.5rem]">
          {blog.featuredImage ? (
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#283A2C]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14231A] via-[#283A2C]/30 to-[#283A2C]/12" />

          <Link
            to="/blogs"
            className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-[#F1EFEC]/92 px-4 py-2 text-[0.6rem] font-black uppercase tracking-[0.16em] text-[#283A2C] backdrop-blur md:left-7 md:top-7"
          >
            <ArrowLeft size={14} />
            Journal
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:max-w-5xl md:p-12 lg:p-14"
          >
            <p className="inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.28em] text-[#DADDC5]">
              <BookOpenText size={14} />
              Yogo Journal
            </p>
            <h1 className="mt-4 text-balance font-display text-[clamp(2.7rem,12vw,4.5rem)] font-semibold leading-[0.93] md:text-7xl lg:text-[6.4rem]">
              {blog.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#F1EFEC]/72">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} />
                {blog.relatedLocations?.length || 0} story places
              </span>
              <span>{blog.slug?.replaceAll('-', ' ')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
          <div>
            {getIntro(blog) && (
              <p className="border-l-2 border-[#D7BD8B] pl-5 font-display text-2xl leading-snug text-[#283A2C]/82 md:pl-7 md:text-3xl">
                {getIntro(blog)}
              </p>
            )}
            <div
              className="mt-9 text-pretty text-base leading-8 text-[#283A2C]/76 [&_a]:font-bold [&_a]:text-[#283A2C] [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-[#D7BD8B] [&_blockquote]:pl-5 [&_h1]:mt-10 [&_h1]:font-display [&_h1]:text-4xl [&_h1]:font-semibold [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-semibold [&_li]:mb-2 [&_ol]:my-6 [&_ol]:pl-5 [&_p]:mb-6 [&_strong]:text-[#283A2C] [&_ul]:my-6 [&_ul]:pl-5 md:text-lg md:leading-9"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          <aside className="content-start lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[1.4rem] bg-[#283A2C] p-5 text-[#F1EFEC]">
              <p className="flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#DADDC5]">
                <MapPinned size={14} />
                Places in this story
              </p>
              {blog.relatedLocations?.length > 0 ? (
                <div className="mt-5 grid gap-4">
                  {blog.relatedLocations.map((location) => (
                    <div
                      key={location._id}
                      className="grid grid-cols-[4.5rem_1fr] items-center gap-3 border-b border-[#F1EFEC]/12 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="h-16 overflow-hidden rounded-xl bg-[#DADDC5]">
                        {location.image && (
                          <img
                            src={location.image}
                            alt={location.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-display text-xl font-semibold leading-tight">
                          {location.name}
                        </p>
                        <p className="mt-1 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-[#F1EFEC]/52">
                          Sri Lanka
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[#F1EFEC]/62">
                  No related locations were selected for this story.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>

      {gallery.length > 1 && (
        <section className="bg-[#DADDC5] px-4 py-12 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.32em] text-[#283A2C]/55">
                Visual journal
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
                Moments From The Story
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-3 md:gap-5">
              {gallery.slice(0, 6).map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`overflow-hidden rounded-[1.2rem] bg-[#F1EFEC] ${
                    index === 0 ? 'col-span-2 aspect-[1.7/1]' : 'aspect-square'
                  } md:col-span-1 md:aspect-[4/3]`}
                >
                  <img
                    src={image}
                    alt={`${blog.title} gallery ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {mapStops.length > 0 && (
        <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Suspense
              fallback={
                <div className="min-h-[32rem] animate-pulse rounded-[1.5rem] bg-[#DADDC5]/70" />
              }
            >
              <CinematicSriLankaMap
                connectStops={false}
                description="Explore the Sri Lankan locations selected for this journal story."
                kicker="Story map"
                routeStops={mapStops}
                showMapMeta={false}
                showSequence={false}
                stops={mapStops}
                title="Places Behind The Story"
                variant="journal"
              />
            </Suspense>
          </div>
        </section>
      )}
    </article>
  );
}

function DetailLoading() {
  return (
    <main className="min-h-screen bg-[#F1EFEC] px-4 pb-20 pt-28 sm:px-6 md:pt-32 lg:px-8">
      <div className="mx-auto h-[32rem] max-w-7xl animate-pulse rounded-[2rem] bg-[#DADDC5]/75 md:h-[42rem]" />
      <div className="mx-auto mt-10 h-72 max-w-4xl animate-pulse rounded-[1.5rem] bg-[#283A2C]/10" />
    </main>
  );
}
