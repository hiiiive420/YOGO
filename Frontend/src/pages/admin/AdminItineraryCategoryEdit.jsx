import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import {
  fetchItineraryCategoryById,
  updateItineraryCategory,
} from '../../api/itineraryCategories';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ItineraryCategoryForm from '../../components/admin/itineraryCategories/ItineraryCategoryForm';
import { useToast } from '../../context/ToastContext';

export default function AdminItineraryCategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [category, setCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCategory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchItineraryCategoryById(id);
      setCategory(data);
    } catch (error) {
      const message = getApiError(error);
      setErrorMessage(message);
      showToast({
        type: 'error',
        title: 'Could not load category',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  async function handleUpdate(formData) {
    try {
      await updateItineraryCategory(id, formData);
      showToast({ type: 'success', title: 'Category updated' });
      navigate('/admin/itinerary-categories');
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
        kicker="Travel Themes"
        title={category?.title ? `Edit ${category.title}` : 'Edit Travel Theme'}
        description="Update the theme title, slug, thumbnail, or public Travel Themes description."
        action={<BackLink />}
      />

      {isLoading && (
        <div className="grid min-h-72 place-items-center rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-cinnamon" size={28} />
            <p className="mt-3 text-sm font-bold text-black/50">
              Loading category
            </p>
          </div>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-display text-3xl font-semibold text-red-950">
            Category unavailable
          </p>
          <p className="mt-2 text-sm leading-7 text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={loadCategory}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            <RefreshCcw size={17} />
            Retry
          </button>
        </div>
      )}

      {!isLoading && category && (
        <ItineraryCategoryForm
          initialValues={category}
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
      to="/admin/itinerary-categories"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
