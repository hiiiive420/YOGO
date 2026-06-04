import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Eye, Loader2, Plus, Trash2, BookOpenText } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { deleteBlog, fetchBlogs } from '../../api/blogs';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminBlogs() {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBlogs();
      setBlogs(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Could not load blogs',
        message: getApiError(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteBlog(deleteTarget._id);
      showToast({ type: 'success', title: 'Blog deleted' });
      setDeleteTarget(null);
      await loadBlogs();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Delete failed',
        message: getApiError(error),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section>
      <AdminPageHeader
        kicker="Editorial"
        title="Blogs"
        description="Manage travel blogs and tourism articles connected to reusable Sri Lankan locations."
        action={
          <Link
            to="/admin/blogs/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
          >
            <Plus size={18} />
            Add blog
          </Link>
        }
      />

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[28rem] animate-pulse rounded-lg bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
            />
          ))}
        </div>
      )}

      {!isLoading && blogs.length === 0 && (
        <div className="rounded-lg border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <BookOpenText className="mx-auto text-cinnamon" size={34} />
          <h3 className="mt-5 font-display text-4xl font-semibold">
            No blogs yet.
          </h3>
          <p className="mt-3 text-sm leading-7 text-black/56">
            Create the first article and connect related locations.
          </p>
        </div>
      )}

      {!isLoading && blogs.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog, index) => (
            <motion.article
              key={blog._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.45 }}
              className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cinnamon">
                  {blog.relatedLocations?.length || 0} related locations
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold">
                  {blog.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-black/58">
                  {stripHtml(blog.content)}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/10 pt-4">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-black/38">
                    {blog.slug}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/blogs/${blog._id}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-black/64 transition hover:border-cinnamon hover:text-cinnamon"
                      aria-label={`View ${blog.title}`}
                    >
                      <Eye size={17} />
                    </Link>
                    <Link
                      to={`/admin/blogs/${blog._id}/edit`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-black/64 transition hover:border-cinnamon hover:text-cinnamon"
                      aria-label={`Edit ${blog.title}`}
                    >
                      <Edit3 size={17} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(blog)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-red-600 transition hover:border-red-400 hover:bg-red-50"
                      aria-label={`Delete ${blog.title}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDeleteModal
            blog={deleteTarget}
            isDeleting={isDeleting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ');
}

function ConfirmDeleteModal({ blog, isDeleting, onCancel, onConfirm }) {
  return (
    <ModalShell onClose={onCancel} maxWidth="max-w-md">
      <h3 className="font-display text-4xl font-semibold">Delete blog?</h3>
      <p className="mt-4 text-sm leading-7 text-black/58">
        This will delete <strong>{blog.title}</strong>. Related locations will
        remain available.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-black uppercase tracking-[0.16em] text-white disabled:opacity-60"
        >
          {isDeleting && <Loader2 className="animate-spin" size={17} />}
          Delete
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-black/10 px-4 text-sm font-black uppercase tracking-[0.16em]"
        >
          Cancel
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, maxWidth = 'max-w-2xl', onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/62 p-4"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0"
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        className={`relative z-10 w-full ${maxWidth} rounded-lg bg-pearl p-6 text-obsidian shadow-luxury sm:p-8`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
