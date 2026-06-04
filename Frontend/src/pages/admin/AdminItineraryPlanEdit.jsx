import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import { getApiError } from '../../api/client';
import {
  fetchItineraryPlanById,
  updateItineraryPlan,
} from '../../api/itineraryPlans';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ItineraryPlanForm from '../../components/admin/itineraryPlans/ItineraryPlanForm';
import { useToast } from '../../context/ToastContext';

export default function AdminItineraryPlanEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState(null);

  const loadPlan = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchItineraryPlanById(id);
      setPlan(data);
    } catch (error) {
      const message = getApiError(error);
      setErrorMessage(message);
      showToast({
        type: 'error',
        title: 'Could not load plan',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  async function handleUpdate(formData) {
    try {
      await updateItineraryPlan(id, formData);
      showToast({ type: 'success', title: 'Activity Package updated' });
      navigate('/admin/itineraries');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: getApiError(error),
      });
    }
  }

  return (
    <section>
      <AdminPageHeader
        kicker="Activity / Itinerary Package"
        title={plan?.title ? `Edit ${plan.title}` : 'Edit Activity Package'}
        description="Update package details, day plans, selected route locations, images, and FAQ from one page."
        action={<BackLink />}
      />

      {isLoading && (
        <div className="grid min-h-72 place-items-center rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-cinnamon" size={28} />
            <p className="mt-3 text-sm font-bold text-black/50">
              Loading Activity Package
            </p>
          </div>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-display text-3xl font-semibold text-red-950">
            Activity Package unavailable
          </p>
          <p className="mt-2 text-sm leading-7 text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={loadPlan}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            <RefreshCcw size={17} />
            Retry
          </button>
        </div>
      )}

      {!isLoading && plan && (
        <ItineraryPlanForm
          initialValues={plan}
          mode="edit"
          onSubmit={handleUpdate}
        />
      )}
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/itineraries"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
