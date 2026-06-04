export default function AdminField({ error, label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-black/70">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </label>
  );
}
