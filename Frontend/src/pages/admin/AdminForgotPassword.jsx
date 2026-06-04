import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { AdminAuthShell } from '../AdminLogin';
import TextInput from '../../components/admin/form/TextInput';
import { useToast } from '../../context/ToastContext';

export default function AdminForgotPassword() {
  const { showToast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({ defaultValues: { email: '' } });

  async function onSubmit() {
    showToast({
      type: 'info',
      title: 'Password reset UI ready',
      message: 'API connection will be enabled after the login and locations pass.',
    });
  }

  return (
    <AdminAuthShell
      kicker="Recovery"
      title="Forgot Password"
      description="Request a secure reset link for your admin account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <TextInput
          error={errors.email}
          label="Email"
          register={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: 'Enter a valid email address',
            },
          })}
          type="email"
          placeholder="admin@yogo.com"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-obsidian px-5 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black"
        >
          <Mail size={18} />
          Send reset link
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
