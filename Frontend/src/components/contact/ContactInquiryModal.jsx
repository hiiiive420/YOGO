import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Route, ShieldCheck, X } from 'lucide-react';
import ContactForm from './ContactForm.jsx';

export default function ContactInquiryModal({
  inquiryContext,
  isOpen,
  onClose,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-black/72 px-4 py-6 backdrop-blur-md sm:px-6"
        >
          <button
            type="button"
            aria-label="Close contact form"
            onClick={onClose}
            className="fixed inset-0 h-full w-full cursor-default"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="relative z-10 mx-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-[#F1EFEC] shadow-[0_30px_90px_rgba(0,0,0,0.34)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close contact form"
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-transparent bg-[#F1EFEC] text-[#283A2C] shadow-[0_14px_32px_rgba(0,0,0,0.16)] transition duration-300 ease-out hover:border-[#283A2C] hover:bg-[#DADDC5]"
            >
              <X size={20} />
            </button>
            <div className="grid lg:grid-cols-[0.72fr_1fr]">
              <div className="relative overflow-hidden bg-[#283A2C] px-6 py-8 text-[#FFFFFF] sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(218,221,197,0.22),transparent_24rem)]" />
                <div className="relative flex h-full min-h-[18rem] flex-col justify-between gap-8">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#DADDC5]">
                      <MessageCircle size={16} />
                      Inquiry
                    </p>
                    <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">
                      Plan it with YOGO.
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-[#F1EFEC]/74">
                      Send us the route, package, or day tour you are exploring.
                      We will reply with clear next steps.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {[
                      [Route, 'Route guidance'],
                      [ShieldCheck, 'Private planning support'],
                    ].map(([Icon, label]) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-full border border-[#FFFFFF]/12 bg-black/18 px-4 py-3 backdrop-blur-md"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#F1EFEC] text-[#283A2C]">
                          <Icon size={17} />
                        </span>
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#F1EFEC]/72">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 [&_.contact-input]:border-[#283A2C]/12 [&_.contact-input]:bg-[#FFFFFF] [&_.contact-input]:text-[#283A2C] [&_.contact-input:focus]:border-[#283A2C] [&_.contact-input:focus]:shadow-[0_0_0_3px_rgba(218,221,197,0.5)] [&_.contact-textarea]:border-[#283A2C]/12 [&_.contact-textarea]:bg-[#FFFFFF] [&_.contact-textarea]:text-[#283A2C] [&_.contact-textarea:focus]:border-[#283A2C] [&_.contact-textarea:focus]:shadow-[0_0_0_3px_rgba(218,221,197,0.5)] [&_form]:rounded-[1.5rem] [&_form]:border [&_form]:border-[#283A2C]/10 [&_form]:bg-[#FFFFFF] [&_form]:text-[#283A2C] [&_form]:shadow-none [&_form_button[type='submit']]:rounded-full [&_form_button[type='submit']]:bg-[#283A2C] [&_form_button[type='submit']]:text-[#F1EFEC] [&_form_button[type='submit']:hover]:bg-black [&_form_h2]:text-[#283A2C] [&_form_p:first-child]:text-[#283A2C]/50">
                <ContactForm
                  inquiryContext={inquiryContext}
                  onSuccess={onClose}
                  sourcePage={window.location.pathname + window.location.search}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
