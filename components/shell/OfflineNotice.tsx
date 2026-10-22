'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useSyncExternalStore } from 'react';
import { spring } from '@/lib/motion';

function subscribe(listener: () => void) {
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
}

/** A quiet pill while offline. Everything still works except tagging photos with Claude. */
export function OfflineNotice() {
  const offline = useSyncExternalStore(subscribe, () => !navigator.onLine, () => false);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[calc(var(--spacing-masthead)+env(safe-area-inset-top)+0.5rem)] z-(--z-toast) flex justify-center px-gutter lg:top-4">
      <AnimatePresence>
        {offline ? (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={spring.gentle}
            className="caps rounded-pill bg-ink px-4 py-2 text-center text-on-ink shadow-lift"
          >
            Offline · your wardrobe still works; photo tagging waits for a connection
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
