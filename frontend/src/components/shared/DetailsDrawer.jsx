import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './DetailsDrawer.css';

const DetailsDrawer = ({ open, onClose, title, subtitle, children, width = 400 }) => {
  /* Lock body scroll when open */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else       document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="details-drawer"
            style={{ width }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="details-drawer__header">
              <div>
                <div className="details-drawer__title">{title}</div>
                {subtitle && <div className="details-drawer__subtitle">{subtitle}</div>}
              </div>
              <button className="details-drawer__close" onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="details-drawer__body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DetailsDrawer;
