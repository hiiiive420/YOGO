import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createDayTour } from '../../api/dayTours';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DayTourForm from '../../components/admin/dayTours/DayTourForm';
import { useToast } from '../../context/ToastContext';

export default function AdminDayTourCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleCreate(formData) {
    try {
      await createDayTour(formData);
      showToast({ type: 'success', title: 'Day Tour saved' });
      navigate('/admin/day-tours');
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
        kicker="Day Tours"
        title="Create Day Tour"
        description="Build a location-based day tour with Sri Lanka-only pins, places, imagery, and FAQ."
        action={<BackLink />}
      />
      <DayTourForm mode="create" onSubmit={handleCreate} />
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/day-tours"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
