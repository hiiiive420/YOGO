import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Loader2, Plus, Route, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  deleteItineraryCategory,
  fetchItineraryCategories,
} from '../../api/itineraryCategories';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminItineraryCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchItineraryCategories();
      setCategories(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Could not load categories',
        message: getApiError(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteItineraryCategory(deleteTarget._id);
      showToast({ type: 'success', title: 'Category deleted' });
      setDeleteTarget(null);
      await loadCategories();
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
        kicker="Travel Themes"
        title="Travel Themes"
        description="Manage the theme buttons that drive the public Travel Themes journey explorer."
        action={
          <Link
            to="/admin/itinerary-categories/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
          >
            <Plus size={18} />
            Add theme
          </Link>
        }
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-lg bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
            />
          ))}
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <div className="rounded-lg border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <Route className="mx-auto text-cinnamon" size={34} />
          <h3 className="mt-5 font-display text-4xl font-semibold">
            No travel themes yet.
          </h3>
          <p className="mt-3 text-sm leading-7 text-black/56">
            Create the first theme button for the public Travel Themes page.
          </p>
        </div>
      )}

      {!isLoading && categories.length > 0 && (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {categories.map((category, index) => (
              <motion.article
                key={category._id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.45 }}
                className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={category.thumbnailImage}
                    alt={category.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-champagne">
                      {category.slug}
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-semibold">
                      {category.title}
                    </h3>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/10">
                <thead className="bg-black/[0.03]">
                  <tr>
                    {['Image', 'Title', 'Slug', 'Description', 'Actions'].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-black/44"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {categories.map((category) => (
                    <tr key={category._id} className="align-middle">
                      <td className="min-w-28 px-4 py-4">
                        <img
                          src={category.thumbnailImage}
                          alt={category.title}
                          className="h-16 w-20 rounded-md object-cover"
                        />
                      </td>
                      <td className="min-w-48 px-4 py-4">
                        <p className="font-display text-2xl font-semibold">
                          {category.title}
                        </p>
                      </td>
                      <td className="min-w-44 px-4 py-4 text-sm font-semibold text-black/62">
                        {category.slug}
                      </td>
                      <td className="min-w-80 px-4 py-4">
                        <p className="line-clamp-2 text-sm leading-7 text-black/58">
                          {category.description}
                        </p>
                      </td>
                      <td className="min-w-36 px-4 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/itinerary-categories/${category._id}/edit`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-black/64 transition hover:border-cinnamon hover:text-cinnamon"
                            aria-label={`Edit ${category.title}`}
                          >
                            <Edit3 size={17} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(category)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-red-600 transition hover:border-red-400 hover:bg-red-50"
                            aria-label={`Delete ${category.title}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDeleteModal
            category={deleteTarget}
            isDeleting={isDeleting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ConfirmDeleteModal({ category, isDeleting, onCancel, onConfirm }) {
  return (
    <ModalShell onClose={onCancel} maxWidth="max-w-md">
      <h3 className="font-display text-4xl font-semibold">Delete category?</h3>
      <p className="mt-4 text-sm leading-7 text-black/58">
        This will delete <strong>{category.title}</strong>. Itinerary plans that
        reference this category may need to be reviewed.
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
