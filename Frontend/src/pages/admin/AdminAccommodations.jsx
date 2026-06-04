import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Edit3, Eye, Loader2, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  deleteAccommodation,
  fetchAccommodations,
} from '../../api/accommodations';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminAccommodations() {
  const { showToast } = useToast();
  const [accommodations, setAccommodations] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccommodations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAccommodations();
      setAccommodations(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Could not load accommodations',
        message: getApiError(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAccommodations();
  }, [loadAccommodations]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteAccommodation(deleteTarget._id);
      showToast({ type: 'success', title: 'Accommodation deleted' });
      setDeleteTarget(null);
      await loadAccommodations();
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
        kicker="Luxury stays"
        title="Accommodations"
        description="Manage hotels, villas, resorts, and stays while reusing the central locations collection."
        action={
          <Link
            to="/admin/accommodations/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
          >
            <Plus size={18} />
            Add stay
          </Link>
        }
      />

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[30rem] animate-pulse rounded-lg bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
            />
          ))}
        </div>
      )}

      {!isLoading && accommodations.length === 0 && (
        <div className="rounded-lg border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <BedDouble className="mx-auto text-cinnamon" size={34} />
          <h3 className="mt-5 font-display text-4xl font-semibold">
            No accommodations yet.
          </h3>
          <p className="mt-3 text-sm leading-7 text-black/56">
            Add the first luxury stay and connect it to a reusable location.
          </p>
        </div>
      )}

      {!isLoading && accommodations.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {accommodations.map((stay, index) => (
            <motion.article
              key={stay._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.45 }}
              className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={stay.heroImage}
                  alt={stay.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 rounded-full bg-pearl px-3 py-1 text-[0.66rem] font-black uppercase tracking-[0.16em] text-obsidian">
                  {stay.starRating} stars
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cinnamon">
                  {stay.location?.name || 'Location'}
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold">
                  {stay.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-black/58">
                  {stay.shortDescription}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/10 pt-4">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-black/38">
                    {stay.priceRange}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/accommodations/${stay._id}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-black/64 transition hover:border-cinnamon hover:text-cinnamon"
                      aria-label={`View ${stay.title}`}
                    >
                      <Eye size={17} />
                    </Link>
                    <Link
                      to={`/admin/accommodations/${stay._id}/edit`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-black/64 transition hover:border-cinnamon hover:text-cinnamon"
                      aria-label={`Edit ${stay.title}`}
                    >
                      <Edit3 size={17} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(stay)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-red-600 transition hover:border-red-400 hover:bg-red-50"
                      aria-label={`Delete ${stay.title}`}
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
            isDeleting={isDeleting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            stay={deleteTarget}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ConfirmDeleteModal({ isDeleting, onCancel, onConfirm, stay }) {
  return (
    <ModalShell onClose={onCancel} maxWidth="max-w-md">
      <h3 className="font-display text-4xl font-semibold">Delete stay?</h3>
      <p className="mt-4 text-sm leading-7 text-black/58">
        This will delete <strong>{stay.title}</strong>. Connected locations will
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
