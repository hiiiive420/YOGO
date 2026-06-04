import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import {
  fetchDayTourById,
  updateDayTour,
} from '../../api/dayTours';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import DayTourForm from '../../components/admin/dayTours/DayTourForm';
import { useToast } from '../../context/ToastContext';

export default function AdminDayTourEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dayTour, setDayTour] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDayTour = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchDayTourById(id);
      setDayTour(data);
    } catch (error) {
      const message = getApiError(error);
      setErrorMessage(message);
      showToast({
        type: 'error',
        title: 'Could not load Day Tour',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadDayTour();
  }, [loadDayTour]);

  async function handleUpdate(formData) {
    try {
      await updateDayTour(id, formData);
      showToast({ type: 'success', title: 'Day Tour updated' });
      navigate('/admin/day-tours');
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
        kicker="Day Tours"
        title={dayTour?.title ? `Edit ${dayTour.title}` : 'Edit Day Tour'}
        description="Update the main location, places, Sri Lanka-only pins, imagery, and FAQ."
        action={<BackLink />}
      />

      {isLoading && (
        <div className="grid min-h-72 place-items-center rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-cinnamon" size={28} />
            <p className="mt-3 text-sm font-bold text-black/50">
              Loading Day Tour
            </p>
          </div>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-display text-3xl font-semibold text-red-950">
            Day Tour unavailable
          </p>
          <p className="mt-2 text-sm leading-7 text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={loadDayTour}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            <RefreshCcw size={17} />
            Retry
          </button>
        </div>
      )}

      {!isLoading && dayTour && (
        <DayTourForm
          initialValues={dayTour}
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
      to="/admin/day-tours"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
