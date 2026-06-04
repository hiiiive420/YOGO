import AdminPageHeader from './AdminPageHeader';

export default function AdminPlaceholder({ title }) {
  return (
    <section>
      <AdminPageHeader
        kicker="Module"
        title={title}
        description="This module is registered in the admin navigation. Full CRUD will be connected after the priority Location workflow."
      />
      <div className="rounded-lg border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/42">
          Coming next
        </p>
      </div>
    </section>
  );
}
