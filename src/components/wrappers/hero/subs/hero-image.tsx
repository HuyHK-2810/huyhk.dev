"use client"
import clsx from 'clsx'
import { useAnimationControls, m } from 'framer-motion';
import Image from 'next/image'
import React from 'react'
import ImageAnimation from './image-animation';

const HeroImage = () => {

    const controlsImage = useAnimationControls();
    const controlsOutline = useAnimationControls();

    return (
        <div
          className={clsx('relative h-[590px] w-[603px]')}
          
        >
          <div
            className={clsx(
              'bg-gradient-to-b from-slate-100 via-slate-100 absolute top-0 right-0 h-[590px] w-[500px] rounded-full bg-gradient-to-t',
              'dark:from-accent-600/10 dark:via-accent-600/0 '
            )}
          >
            <div className={clsx('absolute right-0 bottom-0 overflow-hidden')}>
              <m.div
                className={clsx('absolute z-[10]')}
                initial={{ opacity: 1 }}
                animate={controlsOutline}
              >
                <ImageAnimation
                  onAnimationComplete={() => {
                    controlsOutline.start({
                      opacity: 0,
                      transition: {
                        duration: 0.2,
                        delay: 0.15,
                      },
                    });
    
                    controlsImage.start({
                      opacity: 1,
                      transition: {
                        duration: 0.15,
                      },
                    });
                  }}
                />
              </m.div>
              <m.div
                className={clsx('')}
                initial={{ opacity: 0 }}
                animate={controlsImage}
              >
                <Image
                  alt="HuyHK dev Illustration"
                  src="/images/me.png"
                  width={500}
                  height={500}
                  className={clsx(
                    'hidden max-w-none',
                    'lg:block',
                    'dark:brightness-[.82]'
                  )}
                  quality={100}
                  priority
                />
              </m.div>
            </div>
          </div>
        </div>
      );
}

export default HeroImage
