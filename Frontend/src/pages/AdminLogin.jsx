import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getApiError } from '../api/client';
import TextInput from '../components/admin/form/TextInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLogin() {
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(values) {
    try {
      await login(values);
      showToast({ type: 'success', title: 'Welcome back' });
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Login failed',
        message: getApiError(error),
      });
    }
  }

  return (
    <AdminAuthShell
      kicker="Secure access"
      title="Admin Login"
      description="Sign in to manage locations, itineraries, stays, and editorial content."
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
        <TextInput
          error={errors.password}
          label="Password"
          register={register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Minimum 8 characters' },
          })}
          type="password"
          placeholder="••••••••"
        />
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/admin/forgot-password"
            className="text-sm font-bold text-black/56 transition hover:text-obsidian"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-obsidian px-5 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in' : 'Login'}
          <ArrowRight size={18} />
        </button>
      </form>
    </AdminAuthShell>
  );
}

export function AdminAuthShell({ children, description, kicker, title }) {
  return (
    <main className="min-h-screen bg-soft-noise px-4 py-10 text-pearl sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_0.72fr]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pearl text-base font-black text-obsidian">
              Y
            </span>
            <span>
              <span className="block font-display text-3xl font-semibold">
                YOGO
              </span>
              <span className="block text-xs font-black uppercase tracking-[0.3em] text-champagne">
                Admin Console
              </span>
            </span>
          </Link>
          <p className="mt-12 text-xs font-black uppercase tracking-[0.34em] text-champagne">
            {kicker}
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[0.95] sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-pearl/66">
            {description}
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55 }}
          className="rounded-lg bg-pearl p-6 text-obsidian shadow-luxury sm:p-8"
        >
          {children}
        </motion.section>
      </div>
    </main>
  );
}
