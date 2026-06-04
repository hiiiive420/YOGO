import AdminField from './AdminField';

export default function TextArea({ error, label, register, rows = 5, ...props }) {
  return (
    <AdminField error={error} label={label}>
      <textarea
        rows={rows}
        {...register}
        {...props}
        className="w-full resize-y rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold leading-7 text-obsidian outline-none transition placeholder:text-black/50 focus:border-obsidian"
      />
    </AdminField>
  );
}
