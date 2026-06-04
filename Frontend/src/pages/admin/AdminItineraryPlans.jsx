import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Edit3, Loader2, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getApiError } from '../../api/client';
import {
  deleteItineraryPlan,
  fetchItineraryPlans,
} from '../../api/itineraryPlans';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminItineraryPlans() {
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchItineraryPlans();
      setPlans(data);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Could not load plans',
        message: getApiError(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteItineraryPlan(deleteTarget._id);
      showToast({ type: 'success', title: 'Activity Package deleted' });
      setDeleteTarget(null);
      await loadPlans();
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
        kicker="Activity / Itinerary Packages"
        title="Activity Packages"
        description="Create full Travel Theme packages with details, day plans, route locations, and FAQ from one page."
        action={
          <Link
            to="/admin/itineraries/create"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
          >
            <Plus size={18} />
            Add package
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
                  'Activity Package',
                  'Travel Theme',
                  'Total days',
                  'Status',
                  'Description',
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
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-cinnamon" />
                    <p className="mt-3 text-sm font-bold text-black/50">
                      Loading itineraries
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading && plans.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <CalendarDays className="mx-auto text-cinnamon" size={34} />
                    <p className="mt-5 font-display text-3xl font-semibold">
                      No Activity Packages yet.
                    </p>
                    <p className="mt-2 text-sm text-black/52">
                      Create the first Activity / Itinerary Package under a Travel Theme.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                plans.map((plan) => (
                  <tr key={plan._id} className="align-middle">
                    <td className="min-w-28 px-4 py-4">
                      <img
                        src={plan.heroImage}
                        alt={plan.title}
                        className="h-16 w-24 rounded-md object-cover"
                      />
                    </td>
                    <td className="min-w-56 px-4 py-4">
                      <p className="font-display text-2xl font-semibold">
                        {plan.title}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-black/38">
                        {plan.slug}
                      </p>
                    </td>
                    <td className="min-w-44 px-4 py-4 text-sm font-semibold text-black/62">
                      {plan.categoryId?.title || 'Unassigned'}
                    </td>
                    <td className="min-w-32 px-4 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-black/58">
                        <CalendarDays size={15} />
                        {plan.totalDays} days
                      </span>
                    </td>
                    <td className="min-w-32 px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                          plan.status === 'draft'
                            ? 'bg-cinnamon/12 text-cinnamon'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {plan.status === 'draft' ? 'Draft' : 'Published'}
                      </span>
                    </td>
                    <td className="min-w-80 px-4 py-4">
                      <p className="line-clamp-2 text-sm leading-7 text-black/58">
                        {plan.shortDescription}
                      </p>
                    </td>
                    <td className="min-w-36 px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/itineraries/${plan._id}/edit`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-black/64 transition hover:border-cinnamon hover:text-cinnamon"
                          aria-label={`Edit ${plan.title}`}
                        >
                          <Edit3 size={17} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(plan)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-red-600 transition hover:border-red-400 hover:bg-red-50"
                          aria-label={`Delete ${plan.title}`}
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
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            plan={deleteTarget}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ConfirmDeleteModal({ isDeleting, onCancel, onConfirm, plan }) {
  return (
    <ModalShell onClose={onCancel} maxWidth="max-w-md">
      <h3 className="font-display text-4xl font-semibold">
        Delete Activity Package?
      </h3>
      <p className="mt-4 text-sm leading-7 text-black/58">
        This will delete <strong>{plan.title}</strong> and its embedded Activity
        Package days.
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
