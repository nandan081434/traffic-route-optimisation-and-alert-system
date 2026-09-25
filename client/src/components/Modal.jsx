import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdrop, modalContent } from '../animations/variants.js';

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Dialog Container: Bottom Sheet on Mobile, Centered Modal on Tablet/Desktop */}
          <motion.div
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative w-full ${maxWidth} glass-panel-elevated rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-700/80 bg-slate-900/98 p-4 sm:p-6 shadow-2xl z-10 max-h-[92vh] sm:max-h-[85vh] overflow-y-auto`}
            style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Mobile drag handle indicator */}
            <div className="sm:hidden w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 sm:mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
