import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { deleteLocation, fetchLocations } from '../../api/locations';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminLocations() {
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [locations, setLocations] = useState([]);

  const loadLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Could not load locations',
        message: getApiError(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteLocation(deleteTarget._id);
      showToast({ type: 'success', title: 'Location deleted' });
      setDeleteTarget(null);
      await loadLocations();
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
        kicker="Content"
        title="Locations"
        description="Create and maintain reusable Sri Lankan destination records for maps, discover pages, itineraries, stays, and blogs."
        action={
          <Link
            to="/admin/locations/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
          >
            <Plus size={18} />
            Add location
          </Link>
        }
      />

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10">
            <thead className="bg-black/[0.03]">
              <tr>
                {['Image', 'Name', 'Map Pin', 'Gallery', 'Actions'].map(
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
              {isLoading && (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-cinnamon" />
                    <p className="mt-3 text-sm font-bold text-black/50">
                      Loading locations
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading && locations.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <p className="font-display text-3xl font-semibold">
                      No locations yet.
                    </p>
                    <p className="mt-2 text-sm text-black/52">
                      Add the first reusable destination record.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                locations.map((location) => (
                  <tr key={location._id} className="align-middle">
                    <td className="min-w-28 px-4 py-4">
                      {location.image ? (
                        <img
                          src={location.image}
                          alt={location.name}
                          className="h-16 w-20 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-16 w-20 rounded-md bg-black/[0.06]" />
                      )}
                    </td>
                    <td className="min-w-64 px-4 py-4">
                      <p className="font-display text-2xl font-semibold">
                        {location.name}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-black/38">
                        {location.slug || 'Reusable destination'}
                      </p>
                    </td>
                    <td className="min-w-40 px-4 py-4">
                      <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-emerald-50 px-3 text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
                        <MapPin size={14} />
                        Pin saved
                      </span>
                    </td>
                    <td className="min-w-36 px-4 py-4 text-sm font-bold text-black/58">
                      {location.gallery?.length
                        ? `${location.gallery.length} images`
                        : 'No gallery'}
                    </td>
                    <td className="min-w-36 px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/locations/${location._id}/edit`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-black/64 transition hover:border-cinnamon hover:text-cinnamon"
                          aria-label={`Edit ${location.name}`}
                        >
                          <Edit3 size={17} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(location)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-red-600 transition hover:border-red-400 hover:bg-red-50"
                          aria-label={`Delete ${location.name}`}
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

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDeleteModal
            isDeleting={isDeleting}
            location={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ConfirmDeleteModal({ isDeleting, location, onCancel, onConfirm }) {
  return (
    <ModalShell onClose={onCancel} maxWidth="max-w-md">
      <h3 className="font-display text-4xl font-semibold">Delete location?</h3>
      <p className="mt-4 text-sm leading-7 text-black/58">
        This will delete <strong>{location.name}</strong>. This action cannot be
        undone.
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
