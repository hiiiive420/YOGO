import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAccommodation } from '../../api/accommodations';
import { getApiError } from '../../api/client';
import AccommodationForm from '../../components/admin/accommodations/AccommodationForm';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminAccommodationCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleCreate(formData) {
    try {
      await createAccommodation(formData);
      showToast({ type: 'success', title: 'Accommodation created' });
      navigate('/admin/accommodations');
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
        kicker="Accommodations"
        title="Create Accommodation"
        description="Create a luxury stay and connect it to an existing Sri Lankan location."
        action={<BackLink />}
      />
      <AccommodationForm mode="create" onSubmit={handleCreate} />
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/accommodations"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
