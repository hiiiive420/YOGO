import { BedDouble, BookOpenText, Map, MapPinned, Route } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';

const cards = [
  ['Locations', 'Manage destination coordinates and imagery.', MapPinned],
  ['Day Tours', 'Build location-based one-day tour maps.', Map],
  ['Activity Packages', 'Build theme packages, daily routes, and FAQ.', Route],
  ['Stays', 'Curate luxury hotels, villas, and resorts.', BedDouble],
  ['Blogs', 'Publish editorial travel stories.', BookOpenText],
];

export default function AdminDashboard() {
  return (
    <section>
      <AdminPageHeader
        kicker="Overview"
        title="Dashboard"
        description="A focused control room for the YOGO Travels content platform."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, description, Icon]) => (
          <div
            key={title}
            className="rounded-lg border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
          >
            <Icon className="text-cinnamon" size={24} />
            <h3 className="mt-5 font-display text-3xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-black/56">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
