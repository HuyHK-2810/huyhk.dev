import clsx from 'clsx'
import React from 'react'

const Logo = ({ active = false }: { active?: boolean }) => {
    return (
        <div className={clsx('flex items-center gap-1.5 font-bold')}>
            <div
                className={clsx(
                    'flex items-center justify-center  h-6 w-6 rounded-lg'
                    ,
                    [
                        active
                            ? 'border-[#980341] bg-[#980341] dark:border-[#ff289b] dark:bg-[#ff289b]'
                            : 'border border-2 border-[#980341] dark:border-white',
                    ]
                )}
            >
                <div
                    className={clsx(
                        'h-3.5 w-0.5 rotate-12 rounded-full',
                        'sm:h-3 sm:w-0.5',
                        [active ? 'bg-white' : 'bg-[#980341] dark:bg-white']
                    )}
                />
            </div>
            <div className={clsx('block text-xl tracking-tightest')}>
                <span className={clsx('text-black font-bold', 'dark:text-slate-100')}>HuyHK</span>
                <span className={clsx('text-[#980341] font-bold', 'dark:text-slate-100')}>dev</span>
            </div>
        </div>
    )
}

export default Logo
