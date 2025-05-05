import clsx from 'clsx';

import { CalendarIcon } from '@/components/ui/icons';

export type TodoItemState = 'NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023' | 'REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT' | 'ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021' | 'FPT SOFTWARE HO CHI MINH (5-20 MEMBERS) | NOVEMBER 2016 - JULY 2020';

interface TodoItemProps {
    state: Array<TodoItemState>;
    title?: string;
    description?: string;
    date?: string;
    tag1?: string;
    tag2?: string;
}

const TodoItem = ({
    state,
    title = 'Create Documentations',
    description = 'It is good to create early documentation for our new library.',
    date = '10:00 AM · Tomorrow',
    tag1 = 'Docs',
    tag2 = 'Support',
}: TodoItemProps) => {
    return (
        <div
            className={clsx(
                'pointer-events-none w-full select-none border p-6',
                'lg:w-96',
                state.includes('FPT SOFTWARE HO CHI MINH (5-20 MEMBERS) | NOVEMBER 2016 - JULY 2020') && ['rounded-xl '],
                state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && [''],
                state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') ? ['text-sm'] : ['font-serif'],
                state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                    ? [
                        'border-divider-light bg-white',
                        'dark:border-divider-dark dark:bg-slate-900',
                    ]
                    : ['border-black bg-white', 'dark:border-white dark:bg-[#050914]']
            )}
            role="presentation"
        >
            <div
                className={clsx(
                    'flex items-center',
                    state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['mb-4 justify-between']
                )}
            >
                <div className={clsx('flex')}>
                    <div
                        className={clsx(
                            'relative flex h-8 w-8 items-center justify-center',
                            state.includes('FPT SOFTWARE HO CHI MINH (5-20 MEMBERS) | NOVEMBER 2016 - JULY 2020') && ['rounded-full'],
                            state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && [''],
                            state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && ['font-bold'],
                            state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                                ? ['border-white bg-sky-400 text-white']
                                : [
                                    'border-white bg-[#050914] text-white',
                                    'dark:bg-white dark:text-black',
                                ]
                        )}
                    >
                        E
                    </div>
                </div>
                <div
                    className={clsx(
                        state.includes('FPT SOFTWARE HO CHI MINH (5-20 MEMBERS) | NOVEMBER 2016 - JULY 2020') && ['rounded-full'],
                        state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['px-2 py-0.5'],
                        state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && ['text-xs font-bold'],
                        state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                            ? [
                                'bg-red-100 text-red-800',
                                'dark:bg-red-500/20 dark:text-red-300',
                            ]
                            : ['bg-[#ff0000] text-white']
                    )}
                >
                    High
                </div>
            </div>
            <div
                className={clsx(
                    state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['mb-1'],
                    state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && ['text-lg font-bold'],
                    state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                        ? ['text-slate-700', 'dark:text-slate-300']
                        : ['text-black', 'dark:text-white']
                )}
            >
                {title}
            </div>
            <div
                className={clsx(
                    state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['mb-4'],
                    state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && [''],
                    state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                        ? ['text-slate-600', 'dark:text-slate-400']
                        : ['text-black', 'dark:text-white']
                )}
            >
                {description}
            </div>
            <div
                className={clsx(
                    'flex',
                    state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['mb-6 gap-2'],
                    state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && ['text-xs font-bold'],
                    state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021') && ['']
                )}
            >
                <div
                    className={clsx(
                        state.includes('FPT SOFTWARE HO CHI MINH (5-20 MEMBERS) | NOVEMBER 2016 - JULY 2020') && ['rounded-full'],
                        state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['px-2 py-0.5'],
                        state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && [''],
                        state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                            ? [
                                'bg-blue-100 text-blue-700',
                                'dark:bg-blue-500/20 dark:text-blue-300',
                            ]
                            : ['bg-[#0000ff] text-white']
                    )}
                >
                    {tag1}
                </div>
                <div
                    className={clsx(
                        state.includes('FPT SOFTWARE HO CHI MINH (5-20 MEMBERS) | NOVEMBER 2016 - JULY 2020') && ['rounded-full'],
                        state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['px-2 py-0.5'],
                        state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && [''],
                        state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                            ? [
                                'bg-yellow-100 text-yellow-700',
                                'dark:bg-yellow-500/20 dark:text-yellow-300',
                            ]
                            : ['bg-[#ffff00] text-black']
                    )}
                >
                    {tag2}
                </div>
            </div>
            <div
                className={clsx(
                    'flex items-center',
                    state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['gap-1 '],
                    state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && ['text-xs font-medium'],
                    state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021') && ['']
                )}
            >
                <CalendarIcon
                    className={clsx(
                        'h-4 w-4',
                        state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && ['-mt-1'],
                        state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && [''],
                        state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                            ? ['text-slate-400', 'dark:text-slate-600']
                            : ['h-4 w-4 text-black', 'dark:text-white']
                    )}
                />
                <div
                    className={clsx(
                        state.includes('NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023') && [''],
                        state.includes('REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT') && [''],
                        state.includes('ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021')
                            ? ['text-slate-600', 'dark:text-slate-400']
                            : ['text-black', 'dark:text-white']
                    )}
                >
                    {date}
                </div>
            </div>
        </div>
    );
}

export default TodoItem;
