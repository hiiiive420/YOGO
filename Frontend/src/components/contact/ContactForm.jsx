import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  User,
} from 'lucide-react';
import { getApiError } from '../../api/client.js';
import { createInquiry } from '../../api/inquiries.js';
import { useToast } from '../../context/ToastContext.jsx';

const defaultContext = {};

function normalizeInquiryContext(context = {}, selectedTourPackage = '') {
  const inquiryType = context.inquiryType || 'General';

  return {
    inquiryType,
    relatedLocation: context.relatedLocation || context.location || '',
    relatedTheme: context.relatedTheme || context.theme || '',
    selectedItemSlug: context.selectedItemSlug || context.slug || '',
    selectedItemTitle:
      context.selectedItemTitle ||
      context.title ||
      selectedTourPackage ||
      '',
    selectedPlace: context.selectedPlace || '',
    totalDays: context.totalDays || '',
  };
}

function compactPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;

      return true;
    }),
  );
}

function getSuggestedMessage(context) {
  if (!hasContextSummary(context) || !context.selectedItemTitle) return '';

  const placeLine = context.selectedPlace
    ? ` I would also like to know more about ${context.selectedPlace}.`
    : '';

  return `I'm interested in ${context.selectedItemTitle}.${placeLine}`;
}

function getFormDefaults(context) {
  return {
    email: '',
    message: getSuggestedMessage(context),
    name: '',
    phone: '',
  };
}

function hasContextSummary(context) {
  return Boolean(
    context.inquiryType !== 'General' ||
      context.selectedItemTitle ||
      context.selectedItemSlug ||
      context.relatedTheme ||
      context.relatedLocation ||
      context.totalDays ||
      context.selectedPlace,
  );
}

function getSelectedItemLabel(type) {
  if (type === 'Activity Package' || type === 'Travel Theme') {
    return 'Package Title';
  }

  if (type === 'Day Tour') return 'Day Tour Title';
  if (type === 'Accommodation') return 'Accommodation Title';
  if (type === 'Destination') return 'Destination Title';

  return 'Selected Item';
}

function getLocationLabel(type) {
  if (type === 'Day Tour') return 'Main Location';
  if (type === 'Destination') return 'Related Location';

  return 'Location';
}

function getSummaryRows(context) {
  const rows = [
    ['Type', context.inquiryType],
    [getSelectedItemLabel(context.inquiryType), context.selectedItemTitle],
  ];

  if (context.relatedTheme) rows.push(['Travel Theme', context.relatedTheme]);
  if (context.relatedLocation) {
    rows.push([getLocationLabel(context.inquiryType), context.relatedLocation]);
  }
  if (context.totalDays) rows.push(['Total Days', context.totalDays]);
  if (context.selectedPlace) rows.push(['Selected Place', context.selectedPlace]);

  return rows.filter(([, value]) => value !== undefined && value !== null && value !== '');
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-bold text-red-700">{message}</p>;
}

export default function ContactForm({
  inquiryContext = defaultContext,
  onSuccess,
  selectedTourPackage = '',
  sourcePage = '',
}) {
  const { showToast } = useToast();
  const contextKey = JSON.stringify(inquiryContext || defaultContext);
  const normalizedContext = useMemo(
    () => normalizeInquiryContext(JSON.parse(contextKey), selectedTourPackage),
    [contextKey, selectedTourPackage],
  );
  const summaryRows = useMemo(
    () => getSummaryRows(normalizedContext),
    [normalizedContext],
  );
  const showSummary = hasContextSummary(normalizedContext);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: getFormDefaults(normalizedContext),
  });

  useEffect(() => {
    reset(getFormDefaults(normalizedContext));
  }, [normalizedContext, reset]);

  async function onSubmit(values) {
    const payload = compactPayload({
      email: values.email,
      inquiryType: normalizedContext.inquiryType || 'General',
      message: values.message,
      name: values.name,
      phone: values.phone,
      relatedLocation: normalizedContext.relatedLocation,
      relatedTheme: normalizedContext.relatedTheme,
      selectedItemSlug: normalizedContext.selectedItemSlug,
      selectedItemTitle: normalizedContext.selectedItemTitle,
      selectedPlace: normalizedContext.selectedPlace,
      sourcePage,
      totalDays: normalizedContext.totalDays,
    });

    try {
      await createInquiry(payload);
      showToast({
        type: 'success',
        title: 'Inquiry sent',
        message: 'Thank you. Our team will get back to you shortly.',
      });
      reset(getFormDefaults(normalizedContext));
      onSuccess?.();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Inquiry failed',
        message: getApiError(error),
      });
    }
  }

  return (
    <motion.form
      id="contact-form"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg bg-pearl p-5 text-obsidian shadow-luxury sm:p-7"
    >
      <div className="pr-12">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cinnamon">
          Inquiry
        </p>
        <h2 className="mt-2 font-display text-4xl font-semibold leading-tight">
          Talk to YOGO Travels
        </h2>
      </div>

      {showSummary && (
        <div className="mt-6 rounded-lg border border-black/10 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-black/42">
            Inquiry About
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {summaryRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-black/38">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-bold text-black/76">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-black/48">
            <User size={14} />
            Name
          </span>
          <input
            className="contact-input"
            type="text"
            autoComplete="name"
            {...register('name', { required: 'Name is required' })}
          />
          <FieldError message={errors.name?.message} />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-black/48">
            <Mail size={14} />
            Email
          </span>
          <input
            className="contact-input"
            type="email"
            autoComplete="email"
            {...register('email', {
              pattern: {
                message: 'Enter a valid email address',
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              },
              required: 'Email is required',
            })}
          />
          <FieldError message={errors.email?.message} />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-black/48">
          <Phone size={14} />
          Phone
        </span>
        <input
          className="contact-input"
          type="tel"
          autoComplete="tel"
          {...register('phone', { required: 'Phone is required' })}
        />
        <FieldError message={errors.phone?.message} />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-black/48">
          <MessageCircle size={14} />
          Message
        </span>
        <textarea
          className="contact-textarea min-h-40"
          {...register('message', {
            minLength: {
              message: 'Message must be at least 10 characters',
              value: 10,
            },
            required: 'Message is required',
          })}
        />
        <FieldError message={errors.message?.message} />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-obsidian px-5 text-sm font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Send size={18} />
        )}
        Send Inquiry
      </button>
    </motion.form>
  );
}
