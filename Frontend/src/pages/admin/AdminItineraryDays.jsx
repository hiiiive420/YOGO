import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Edit3, Loader2, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getApiError } from '../../api/client';
import {
  deleteItineraryDay,
  fetchItineraryDays,
} from '../../api/itineraryDays';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminItineraryDays() {
  const { showToast } = useToast();
  const [days, setDays] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDays = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchItineraryDays();
      setDays(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Could not load day plans',
        message: getApiError(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteItineraryDay(deleteTarget._id);
      showToast({ type: 'success', title: 'Day plan deleted' });
      setDeleteTarget(null);
      await loadDays();
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
        kicker="Itineraries"
        title="Day Plans"
        description="Manage daily journey records and connect them to reusable location pins for future maps."
        action={
          <Link
            to="/admin/day-plans/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
          >
            <Plus size={18} />
            Add day
          </Link>
        }
      />

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10">
            <thead className="bg-black/[0.03]">
              <tr>
                {[
                  'Image',
                  'Day',
                  'Plan',
                  'Travel time',
                  'Locations',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-black/44"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {isLoading && (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-cinnamon" />
                    <p className="mt-3 text-sm font-bold text-black/50">
                      Loading day plans
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading && days.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <CalendarDays className="mx-auto text-cinnamon" size={34} />
                    <p className="mt-5 font-display text-3xl font-semibold">
                      No day plans yet.
                    </p>
                    <p className="mt-2 text-sm text-black/52">
                      Choose an itinerary plan and create Day 1 through its total
                      day count.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                days.map((day) => (
                  <tr key={day._id} className="align-middle">
                    <td className="min-w-28 px-4 py-4">
                      <img
                        src={day.heroImage}
                        alt={day.title}
                        className="h-16 w-24 rounded-md object-cover"
                      />
                    </td>
                    <td className="min-w-64 px-4 py-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cinnamon">
                        Day {day.dayNumber}
                      </p>
                      <p className="mt-1 font-display text-2xl font-semibold">
                        {day.title}
                      </p>
                    </td>
                    <td className="min-w-56 px-4 py-4 text-sm font-semibold text-black/62">
                      {day.itineraryPlanId?.title || 'Plan'}
                    </td>
                    <td className="min-w-44 px-4 py-4 text-sm font-semibold text-black/62">
                      {day.travelTime}
                    </td>
                    <td className="min-w-72 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(day.selectedLocations || []).map((location) => (
                          <span
                            key={location._id}
                            className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold text-black/58"
                          >
                            {location.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="min-w-36 px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/day-plans/${day._id}/edit`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-black/64 transition hover:border-cinnamon hover:text-cinnamon"
                          aria-label={`Edit ${day.title}`}
                        >
                          <Edit3 size={17} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(day)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-red-600 transition hover:border-red-400 hover:bg-red-50"
                          aria-label={`Delete ${day.title}`}
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
            day={deleteTarget}
            isDeleting={isDeleting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ConfirmDeleteModal({ day, isDeleting, onCancel, onConfirm }) {
  return (
    <ModalShell onClose={onCancel} maxWidth="max-w-md">
      <h3 className="font-display text-4xl font-semibold">Delete day plan?</h3>
      <p className="mt-4 text-sm leading-7 text-black/58">
        This will delete <strong>Day {day.dayNumber}: {day.title}</strong> from
        the itinerary plan.
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
