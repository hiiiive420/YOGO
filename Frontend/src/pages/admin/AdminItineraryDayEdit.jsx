import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import { getApiError } from '../../api/client';
import { fetchItineraryDayById } from '../../api/itineraryDays';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ItineraryDayForm from '../../components/admin/itineraryDays/ItineraryDayForm';
import { useToast } from '../../context/ToastContext';

function getId(value) {
  return typeof value === 'string' ? value : value?._id || '';
}

export default function AdminItineraryDayEdit() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [day, setDay] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDay = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchItineraryDayById(id);
      setDay(data);
    } catch (error) {
      const message = getApiError(error);
      setErrorMessage(message);
      showToast({
        type: 'error',
        title: 'Could not load day plan',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadDay();
  }, [loadDay]);

  return (
    <section>
      <AdminPageHeader
        kicker="Day Plans"
        title={day?.title ? `Manage ${day.itineraryPlanId?.title || 'Plan'} Days` : 'Edit Day Plan'}
        description="Load the full plan day set, switch between generated tabs, and save each day independently."
        action={<BackLink />}
      />

      {isLoading && (
        <div className="grid min-h-72 place-items-center rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-cinnamon" size={28} />
            <p className="mt-3 text-sm font-bold text-black/50">
              Loading day plan
            </p>
          </div>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-display text-3xl font-semibold text-red-950">
            Day plan unavailable
          </p>
          <p className="mt-2 text-sm leading-7 text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={loadDay}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            <RefreshCcw size={17} />
            Retry
          </button>
        </div>
      )}

      {!isLoading && day && (
        <ItineraryDayForm
          initialActiveDay={day.dayNumber}
          initialPlanId={getId(day.itineraryPlanId)}
        />
      )}
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/day-plans"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
    >
      <ArrowLeft size={18} />
      Back
    </Link>
  );
}
