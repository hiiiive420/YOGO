import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import {
  fetchAccommodationById,
  updateAccommodation,
} from '../../api/accommodations';
import { getApiError } from '../../api/client';
import AccommodationForm from '../../components/admin/accommodations/AccommodationForm';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminAccommodationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stay, setStay] = useState(null);

  const loadStay = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchAccommodationById(id);
      setStay(data);
    } catch (error) {
      const message = getApiError(error);
      setErrorMessage(message);
      showToast({
        type: 'error',
        title: 'Could not load accommodation',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadStay();
  }, [loadStay]);

  async function handleUpdate(formData) {
    try {
      await updateAccommodation(id, formData);
      showToast({ type: 'success', title: 'Accommodation updated' });
      navigate('/admin/accommodations');
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
        kicker="Accommodations"
        title={stay?.title ? `Edit ${stay.title}` : 'Edit Accommodation'}
        description="Update stay details, images, location references, room types, and reviews."
        action={<BackLink />}
      />

      {isLoading && <LoadingPanel label="Loading accommodation" />}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-display text-3xl font-semibold text-red-950">
            Accommodation unavailable
          </p>
          <p className="mt-2 text-sm leading-7 text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={loadStay}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            <RefreshCcw size={17} />
            Retry
          </button>
        </div>
      )}

      {!isLoading && stay && (
        <AccommodationForm
          initialValues={stay}
          mode="edit"
          onSubmit={handleUpdate}
        />
      )}
    </section>
  );
}

function LoadingPanel({ label }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-cinnamon" size={28} />
        <p className="mt-3 text-sm font-bold text-black/50">{label}</p>
      </div>
    </div>
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
