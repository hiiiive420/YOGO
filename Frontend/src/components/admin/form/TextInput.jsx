import AdminField from './AdminField';

export default function TextInput({ error, label, register, type = 'text', ...props }) {
  return (
    <AdminField error={error} label={label}>
      <input
        type={type}
        {...register}
        {...props}
        className="min-h-12 w-full rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-obsidian outline-none transition placeholder:text-black/50 focus:border-obsidian"
      />
    </AdminField>
  );
}
