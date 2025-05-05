import Container from '@/components/ui/container'
import React from 'react'
import HeroTitle from './subs/hero-title'
import HeroCta from './subs/hero-cta'
import HeroTeck from './subs/hero-teck'
import HeroImage from './subs/hero-image'
import clsx from 'clsx'
import { CodeIcon, HeartIcon, SparklesIcon } from '@/components/ui/icons'
import FeaturedCard from '../cards/featured-card'

const HeroOne = () => {
    return (
        <div className={clsx('pt-36 bg-grid-slate-100/100 [mask-image:linear-gradient(black,black,black)] ', 'dark:bg-grid-slate-900/100')}>
            <Container>
                <div className='grid grid-cols-1 lg:grid-cols-2 h-full w-full'>
                    <div className='flex flex-col gap-8 h-full justify-center'>
                        <HeroTitle />
                        <HeroCta />
                        <HeroTeck />
                    </div>
                    <div className='hidden lg:block'>
                        <HeroImage />
                    </div>
                </div>
                <div className='flex gap-4 justify-center flex-wrap lg:flex-nowrap mt-20 lg:mt-0'>
                    <FeaturedCard
                        icon={
                            <div
                                className={clsx(
                                    'rounded-full bg-amber-300 p-3.5',
                                    'dark:bg-amber-900'
                                )}
                            >
                                <SparklesIcon className={clsx('h-5 w-5 text-white')} />
                            </div>
                        }
                        title="Seamless & User-Friendly"
                        desc="Create a clean, responsive UI and ensure smooth front-end to back-end integration for a seamless experience."
                    />

                    <FeaturedCard
                        icon={
                            <div
                                className={clsx(
                                    'rounded-full bg-pink-300 p-3.5',
                                    'dark:bg-pink-900'
                                )}
                            >
                                <HeartIcon className={clsx('h-5 w-5 text-white')} />
                            </div>
                        }
                        title="Focused & Optimized"
                        desc="Ensure UI/UX consistency and optimize both front-end and back-end for performance."
                    />
                    <FeaturedCard
                        icon={
                            <div
                                className={clsx(
                                    'rounded-full bg-sky-300 p-3.5',
                                    'dark:bg-sky-900'
                                )}
                            >
                                <CodeIcon className={clsx('h-5 w-5 text-white')} />
                            </div>
                        }
                        title="Refined & Scalable"
                        desc="Write efficient, maintainable code with optimized back-end services and scalable APIs."
                    />

                </div>
            </Container>
        </div>
    )
}

export default HeroOne
