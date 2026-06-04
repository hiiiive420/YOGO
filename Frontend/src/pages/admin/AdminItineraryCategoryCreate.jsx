import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createItineraryCategory } from '../../api/itineraryCategories';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ItineraryCategoryForm from '../../components/admin/itineraryCategories/ItineraryCategoryForm';
import { useToast } from '../../context/ToastContext';

export default function AdminItineraryCategoryCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleCreate(formData) {
    try {
      await createItineraryCategory(formData);
      showToast({ type: 'success', title: 'Category created' });
      navigate('/admin/itinerary-categories');
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
        kicker="Travel Themes"
        title="Create Travel Theme"
        description="Add a public travel theme button with a thumbnail image and editorial description."
        action={<BackLink />}
      />
      <ItineraryCategoryForm mode="create" onSubmit={handleCreate} />
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/itinerary-categories"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
