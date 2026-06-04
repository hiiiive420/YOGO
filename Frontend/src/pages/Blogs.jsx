import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText, MapPinned } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchBlogs } from '../api/blogs';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    fetchBlogs()
      .then((data) => {
        if (!isMounted) return;
        setBlogs(data);
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
            Travel journal
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
            Blogs
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-pearl/68 sm:text-lg">
            Editorial notes, destination essays, and thoughtful travel guidance
            for luxury journeys across Sri Lanka.
          </p>
        </motion.div>

        {status === 'loading' && (
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[32rem] animate-pulse rounded-lg bg-white/[0.06]"
              />
            ))}
          </div>
        )}

        {status === 'error' && (
          <EmptyState title="Articles unavailable" description={error} />
        )}

        {status === 'success' && blogs.length === 0 && (
          <EmptyState
            title="No articles published yet."
            description="Travel articles will appear here once they are created in admin."
          />
        )}

        {status === 'success' && blogs.length > 0 && (
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog._id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.55 }}
                className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
              >
                <Link to={`/blogs/${blog.slug}`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/18 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5">
                      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-champagne">
                        <MapPinned size={15} />
                        {blog.relatedLocations?.length || 0} locations
                      </p>
                      <h2 className="mt-3 font-display text-4xl font-semibold">
                        {blog.title}
                      </h2>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="line-clamp-3 text-sm leading-7 text-pearl/62">
                      {stripHtml(blog.content)}
                    </p>
                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-pearl/42">
                        Read article
                      </span>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 text-champagne transition group-hover:border-champagne group-hover:bg-champagne group-hover:text-obsidian">
                        <ArrowRight size={18} />
                      </span>
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

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ');
}

function EmptyState({ description, title }) {
  return (
    <div className="mt-14 rounded-lg border border-white/10 bg-white/[0.04] p-8">
      <BookOpenText className="text-champagne" size={32} />
      <h2 className="mt-5 font-display text-4xl font-semibold">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-pearl/62">
        {description}
      </p>
    </div>
  );
}
