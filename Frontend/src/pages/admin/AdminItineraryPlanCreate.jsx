import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getApiError } from '../../api/client';
import { createItineraryPlan } from '../../api/itineraryPlans';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ItineraryPlanForm from '../../components/admin/itineraryPlans/ItineraryPlanForm';
import { useToast } from '../../context/ToastContext';

export default function AdminItineraryPlanCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleCreate(formData) {
    try {
      await createItineraryPlan(formData);
      showToast({ type: 'success', title: 'Activity Package saved' });
      navigate('/admin/itineraries');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Create failed',
        message: getApiError(error),
      });
    }
  }

  return (
    <section>
      <AdminPageHeader
        kicker="Activity / Itinerary Package"
        title="Create Activity Package"
        description="Create the Travel Theme, package details, day plans, route locations, and FAQ from one place."
        action={<BackLink />}
      />
      <ItineraryPlanForm mode="create" onSubmit={handleCreate} />
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
