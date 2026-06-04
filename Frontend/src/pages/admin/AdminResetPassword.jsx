import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { AdminAuthShell } from '../AdminLogin';
import TextInput from '../../components/admin/form/TextInput';
import { useToast } from '../../context/ToastContext';

export default function AdminResetPassword() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({ defaultValues: { password: '' } });
  const token = searchParams.get('token');

  async function onSubmit() {
    showToast({
      type: 'info',
      title: 'Reset form ready',
      message: token
        ? 'Reset API connection will be enabled in the next auth pass.'
        : 'No reset token was found in the URL.',
    });
  }

  return (
    <AdminAuthShell
      kicker="Recovery"
      title="Reset Password"
      description="Create a new secure password for your admin account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <TextInput
          error={errors.password}
          label="New password"
          register={register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Minimum 8 characters' },
          })}
          type="password"
          placeholder="••••••••"
        />
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-obsidian px-5 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
        >
          <LockKeyhole size={18} />
          Reset password
        </button>
        <Link
          to="/admin-login"
          className="inline-flex items-center gap-2 text-sm font-bold text-black/56 transition hover:text-obsidian"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </form>
    </AdminAuthShell>
  );
}
