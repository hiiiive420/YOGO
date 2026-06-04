import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createDiscoverPage } from '../../api/discover';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DiscoverForm from '../../components/admin/discover/DiscoverForm';
import { useToast } from '../../context/ToastContext';

export default function AdminDiscoverCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleCreate(formData) {
    try {
      await createDiscoverPage(formData);
      showToast({ type: 'success', title: 'Discover place created' });
      navigate('/admin/discover');
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
        kicker="Discover Sri Lanka"
        title="Create Discover Place"
        description="Create a luxury editorial destination page connected to one existing reusable location."
        action={<BackLink />}
      />
      <DiscoverForm mode="create" onSubmit={handleCreate} />
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/discover"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
