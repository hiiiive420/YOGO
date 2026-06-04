import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createLocation } from '../../api/locations';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import LocationForm from '../../components/admin/locations/LocationForm';
import { useToast } from '../../context/ToastContext';

export default function AdminLocationCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleCreate(formData) {
    try {
      await createLocation(formData);
      showToast({ type: 'success', title: 'Location created' });
      navigate('/admin/locations');
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
        kicker="Locations"
        title="Create Location"
        description="Add a reusable destination record. Upload the image here; Cloudinary processing and URL storage happen in the backend."
        action={<BackLink />}
      />
      <LocationForm mode="create" onSubmit={handleCreate} />
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/locations"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
