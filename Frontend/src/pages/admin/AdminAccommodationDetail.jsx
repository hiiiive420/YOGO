import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Loader2, MapPinned, Star } from 'lucide-react';
import { fetchAccommodationById } from '../../api/accommodations';
import { getApiError } from '../../api/client';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useToast } from '../../context/ToastContext';

export default function AdminAccommodationDetail() {
  const { id } = useParams();
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

  const gallery = useMemo(() => {
    if (!stay) return [];
    return [stay.heroImage, ...(stay.gallery || [])].filter(Boolean);
  }, [stay]);

  return (
    <section>
      <AdminPageHeader
        kicker="Accommodations"
        title={stay?.title || 'Accommodation Detail'}
        description="Read-only admin preview of the stay content and linked locations."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/accommodations"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.16em] text-obsidian transition hover:border-cinnamon hover:text-cinnamon"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
            {stay && (
              <Link
                to={`/admin/accommodations/${stay._id}/edit`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-obsidian px-4 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
              >
                <Edit3 size={18} />
                Edit
              </Link>
            )}
          </div>
        }
      />

      {isLoading && (
        <div className="grid min-h-72 place-items-center rounded-lg border border-black/10 bg-white">
          <Loader2 className="animate-spin text-cinnamon" size={28} />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          {errorMessage}
        </div>
      )}

      {!isLoading && stay && (
        <article className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="relative min-h-[28rem]">
            <img
              src={stay.heroImage}
              alt={stay.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="relative flex min-h-[28rem] flex-col justify-end p-6 text-white sm:p-8">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-champagne">
                <MapPinned size={16} />
                {stay.location?.name}
              </p>
              <h2 className="mt-3 font-display text-5xl font-semibold">
                {stay.title}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
                {stay.shortDescription}
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <div className="flex flex-wrap gap-3">
                <Badge icon={<Star size={15} />} label={`${stay.starRating} stars`} />
                <Badge label={stay.priceRange} />
                <Badge label={stay.address} />
              </div>
              <p className="mt-6 text-sm leading-7 text-black/62">
                {stay.fullDescription}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoList title="Amenities" items={stay.amenities} />
              <InfoList title="Highlights" items={stay.highlights} />
              <InfoList title="Policies" items={stay.policies} />
              <InfoList
                title="Nearby"
                items={stay.nearbyAttractions?.map((item) => item.name)}
              />
            </div>
          </div>

          {gallery.length > 0 && (
            <div className="grid gap-3 border-t border-black/10 p-6 sm:grid-cols-3 sm:p-8">
              {gallery.slice(0, 6).map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${stay.title} ${index + 1}`}
                  className="aspect-[4/3] rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </article>
      )}
    </section>
  );
}

function Badge({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-black/58">
      {icon}
      {label}
    </span>
  );
}

function InfoList({ items = [], title }) {
  if (!items?.length) return null;

  return (
    <div className="rounded-lg border border-black/10 bg-pearl p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cinnamon">
        {title}
      </p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-black/62">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
