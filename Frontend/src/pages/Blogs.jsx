import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenText,
  MapPin,
  MapPinned,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchBlogs } from '../api/blogs';

function stripHtml(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSummary(blog) {
  return blog.seoDescription || stripHtml(blog.content);
}

function getLocationLabel(blog) {
  const count = blog.relatedLocations?.length || 0;
  if (!count) return 'Sri Lanka';
  return `${count} ${count === 1 ? 'place' : 'places'}`;
}

function ArticleMeta({ blog, light = false }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.62rem] font-black uppercase tracking-[0.18em] ${
        light ? 'text-[#F1EFEC]/72' : 'text-[#283A2C]/58'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        <MapPin size={12} />
        {getLocationLabel(blog)}
      </span>
      <span>{blog.slug?.replaceAll('-', ' ') || 'Travel story'}</span>
    </div>
  );
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    fetchBlogs()
      .then((data) => {
        if (!isMounted) return;
        setBlogs(Array.isArray(data) ? data : []);
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

  const featuredBlog = blogs[0] || null;
  const remainingBlogs = useMemo(() => blogs.slice(1), [blogs]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F1EFEC] pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-28 text-[#283A2C] md:pb-20 md:pt-32">
      <section className="px-4 pb-10 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-7xl text-center"
        >
          <p className="text-[0.64rem] font-black uppercase tracking-[0.4em] text-[#283A2C]/55">
            Yogo Journal
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl font-display text-[clamp(2.7rem,12vw,4.3rem)] font-semibold leading-[0.92] md:text-7xl lg:text-[5.8rem]">
            Stories From
            <span className="block">Sri Lanka</span>
          </h1>
          <span className="mx-auto mt-5 block h-px w-16 bg-[#283A2C]/55" />
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#283A2C]/66 md:text-base md:leading-8">
            Destination notes, local perspectives, and thoughtful travel
            stories published from the Yogo admin journal.
          </p>
        </motion.div>
      </section>

      {status === 'loading' && <LoadingState />}

      {status === 'error' && (
        <EmptyState title="Stories unavailable" description={error} />
      )}

      {status === 'success' && blogs.length === 0 && (
        <EmptyState
          title="The journal is being prepared."
          description="Published articles from the admin panel will appear here."
        />
      )}

      {status === 'success' && featuredBlog && (
        <>
          <section className="px-4 sm:px-6 lg:px-8">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.6rem] bg-[#283A2C] text-[#F1EFEC] md:grid-cols-[1.08fr_0.92fr] md:rounded-[2rem]"
            >
              <Link
                to={`/blogs/${featuredBlog.slug}`}
                className="group relative min-h-[22rem] overflow-hidden md:min-h-[36rem]"
              >
                {featuredBlog.featuredImage ? (
                  <img
                    src={featuredBlog.featuredImage}
                    alt={featuredBlog.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#DADDC5]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#283A2C]/72 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#283A2C]/30" />
                <span className="absolute left-4 top-4 rounded-full bg-[#F1EFEC] px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#283A2C] md:left-6 md:top-6">
                  Featured story
                </span>
              </Link>

              <div className="flex flex-col justify-center px-5 py-8 sm:px-8 md:px-10 lg:px-14">
                <ArticleMeta blog={featuredBlog} light />
                <h2 className="mt-5 text-balance font-display text-4xl font-semibold leading-[0.98] md:text-5xl lg:text-[4.2rem]">
                  {featuredBlog.title}
                </h2>
                <p className="mt-5 line-clamp-4 text-sm leading-7 text-[#F1EFEC]/72 md:text-base md:leading-8">
                  {getSummary(featuredBlog)}
                </p>
                <Link
                  to={`/blogs/${featuredBlog.slug}`}
                  className="mt-7 inline-flex w-fit items-center gap-3 rounded-full border border-[#DADDC5]/60 px-5 py-3 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#DADDC5] transition hover:bg-[#DADDC5] hover:text-[#283A2C]"
                >
                  Read story
                  <ArrowRight size={15} />
                </Link>
              </div>
            </motion.article>
          </section>

          {remainingBlogs.length > 0 && (
            <section className="px-4 py-14 sm:px-6 md:py-20 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <div className="text-center md:text-left">
                  <p className="text-[0.64rem] font-black uppercase tracking-[0.34em] text-[#283A2C]/50">
                    More from the journal
                  </p>
                  <h2 className="mt-3 font-display text-4xl font-semibold leading-none md:text-5xl">
                    Continue Exploring
                  </h2>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2 lg:mt-10 lg:grid-cols-3">
                  {remainingBlogs.map((blog, index) => (
                    <motion.article
                      key={blog._id}
                      initial={{ opacity: 0, y: 22 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.18 }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="group overflow-hidden rounded-[1.4rem] border border-[#283A2C]/12 bg-[#FFFFFF]"
                    >
                      <Link to={`/blogs/${blog.slug}`} className="block">
                        <div className="relative aspect-[1.42/1] overflow-hidden bg-[#DADDC5]">
                          {blog.featuredImage && (
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                          )}
                          <span className="absolute bottom-3 left-3 rounded-full bg-[#283A2C] px-3 py-1.5 text-[0.55rem] font-black uppercase tracking-[0.15em] text-[#F1EFEC]">
                            Travel journal
                          </span>
                        </div>
                        <div className="p-5">
                          <ArticleMeta blog={blog} />
                          <h3 className="mt-3 line-clamp-2 font-display text-[1.9rem] font-semibold leading-[1.02]">
                            {blog.title}
                          </h3>
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#283A2C]/62">
                            {getSummary(blog)}
                          </p>
                          <span className="mt-5 inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#283A2C]">
                            Read story
                            <ArrowRight
                              size={14}
                              className="transition group-hover:translate-x-1"
                            />
                          </span>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
        <div className="h-[24rem] animate-pulse rounded-[1.6rem] bg-[#DADDC5]/70 md:h-[36rem]" />
        <div className="h-[24rem] animate-pulse rounded-[1.6rem] bg-[#283A2C]/12 md:h-[36rem]" />
      </div>
    </section>
  );
}

function EmptyState({ description, title }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-[#283A2C]/12 bg-[#FFFFFF] p-7 text-center md:p-10">
        <BookOpenText className="mx-auto text-[#283A2C]" size={32} />
        <h2 className="mt-5 font-display text-4xl font-semibold">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#283A2C]/62">
          {description}
        </p>
        <span className="mx-auto mt-6 inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#283A2C]/55">
          <MapPinned size={14} />
          Yogo Journal
        </span>
      </div>
    </section>
  );
}
