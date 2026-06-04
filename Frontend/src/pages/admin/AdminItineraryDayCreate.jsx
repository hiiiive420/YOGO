import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ItineraryDayForm from '../../components/admin/itineraryDays/ItineraryDayForm';

export default function AdminItineraryDayCreate() {
  return (
    <section>
      <AdminPageHeader
        kicker="Day Plans"
        title="Manage Plan Days"
        description="Select an itinerary plan, move between generated day tabs, and save each day as its own journey record."
        action={<BackLink />}
      />
      <ItineraryDayForm />
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
