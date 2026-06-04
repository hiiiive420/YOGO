export default function AdminPageHeader({ kicker, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-black/40">
          {kicker}
        </p>
        <h2 className="mt-2 font-display text-4xl font-semibold text-obsidian">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/58">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
