"use client"
import { Dialog } from '@headlessui/react';
import clsx from 'clsx';
import { m } from 'framer-motion';
import { useRef } from 'react';

import { ActionCenter } from '@/components/ui/action-center';
import TipShortcuts from '@/components/ui/tip-shortcuts';
import useGlobal from '@/hooks/useGloal';
import { X } from 'lucide-react';


const animation = {
  hide: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
};

function QuickAccess() {
  const closeButtonRef = useRef(null);
  const { isQuickAccessOpen, setQuickAccessOpen } = useGlobal();

  return isQuickAccessOpen ? (
    <Dialog
      static
      initialFocus={closeButtonRef}
      open={isQuickAccessOpen}
      onClose={() => setQuickAccessOpen(false)}
      className={clsx('relative z-[1001] ')}
    >
      <m.div
        variants={animation}
        initial="hide"
        animate="show"
        className={clsx(
          'fixed inset-0 z-[-1] bg-slate-200/[.95]',
          'dark:bg-slate-900/[.98]'
        )}
        aria-hidden={!isQuickAccessOpen}
      />
      <div className={clsx('fixed inset-0 bg-slate-200/[.95] dark:bg-slate-900/[.98]')}>
        <Dialog.Panel>
          <div
            className={clsx(
              'absolute right-4 sm:right-8 top-8 flex'
            )}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className={clsx(
                'pointer-events-auto ml-1 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-300/50 text-slate-800',
                'hover:bg-slate-300/70 sm:ml-0',
                'dark:bg-slate-800/50 dark:text-slate-100 dark:hover:bg-slate-700/50'
              )}
              aria-label="Close Quick Access"
              title="Close Quick Access"
              onClick={() => setQuickAccessOpen(false)}
            >
              <X className={clsx('h-5 w-5')} />
            </button>
          </div>
          <div
            data-accent="violet"
            className={clsx(
              'fixed left-2 right-2 bottom-0 top-20 flex flex-col gap-6',
              'sm:left-auto sm:right-6 sm:top-24 sm:w-[320px]'
            )}
          >
            <div className={clsx('')}>
              <ActionCenter />
            </div>

            <div
              className={clsx(
                'fixed left-8 bottom-10 hidden w-[320px]',
                'md:block'
              )}
            >
              <m.div
                initial={{ x: -36, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  ease: 'easeOut',
                  delay: 0.6,
                }}
              >
                <TipShortcuts />
              </m.div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  ) : null;
}

export default QuickAccess;
