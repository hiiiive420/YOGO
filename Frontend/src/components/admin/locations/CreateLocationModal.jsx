import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getApiError } from '../../../api/client';
import { createLocation } from '../../../api/locations';
import { useToast } from '../../../context/ToastContext';
import LocationForm from './LocationForm';

export default function CreateLocationModal({ isOpen, onClose, onCreated }) {
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  async function handleCreate(formData) {
    try {
      const location = await createLocation(formData);

      showToast({
        type: 'success',
        title: 'Location created',
        message: `${location.name} is now available in this form.`,
      });
      onCreated?.(location);
      onClose?.();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Location create failed',
        message: getApiError(error),
      });
    }
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
        >
          <button
            type="button"
            aria-label="Close create location modal"
            onClick={onClose}
            className="absolute inset-0"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-[0_30px_100px_rgba(0,0,0,0.38)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-black/10 bg-white px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cinnamon">
                  Inline Location
                </p>
                <h2 className="font-display text-3xl font-semibold text-obsidian">
                  Create Location
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-pearl text-black/70 transition hover:border-cinnamon hover:text-cinnamon"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto p-3 sm:p-6">
              <LocationForm mode="create" onSubmit={handleCreate} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
