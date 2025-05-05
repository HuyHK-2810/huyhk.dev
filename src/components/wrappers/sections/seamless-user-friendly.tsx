"use client"
import clsx from 'clsx';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { SectionTitle } from './section-title';
import SectionContent from './section-content';
import { SectionButton } from './section-button';
import { TodoItemState } from '../cards/todo-item';
import Container from '@/components/ui/container';
import { m } from 'framer-motion'
import ResponsibilitiesCard from '../cards/responsibilities-card';
import { Pagination } from 'swiper/modules';

type Content = {
    state: TodoItemState;
    shows: Array<TodoItemState>;
    title: string;
    description: string;
    cardTitle?: string;
    KeyTasks?: Array<string>;
    TechStack?: Array<string>;
};

const content: Array<Content> = [
    {
        state: 'REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT',
        shows: ['REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT'],
        title: 'REMOLUTION COMPANY | FEBRUARY 2023 - PRESENT',
        description: 'A platform that automates talent acquisition, recruitment, and onboarding processes, trusted by over 100 global companies',
        cardTitle: 'FULLSTACK DEVELOPER | (12-14 MEMBERS)',
        KeyTasks: ['Developed the frontend using React.js, Tailwind CSS, shadcnUI, and Next.js. Built backend services with Node.js, including features like exporting PDFs from CVs, data extraction from PDFs, email integration using Nodemailer, and API development with Express.', 'Integrated automated testing workflows with Playwright and conducted manual testing to ensure quality. '],
        TechStack: ['ReactJS, ', 'NextJS, ', 'Tailwind CSS, ', 'Node.js, ', 'Express.js, ', 'PostgreSQL, ', 'Playwright'],
    },
    {
        state: 'NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023',
        shows: ['REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT', 'NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023'],
        title: 'NASHPUSH - REMOLUTION COMPANY | MAY 2021 - FEBRUARY 2023',
        description: 'A push notification system with real-time data delivery and management capabilities ',
        cardTitle: 'FRONTEND DEVELOPER | 6-8 MEMBERS',
        KeyTasks: ['Engineered and optimized frontend features using JavaScript, React.js, and Ag-Grid. ',
            'Developed responsive and user-friendly interfaces, integrating Ag-Grid for effective data display and management. '
        ],
        TechStack: ['ReactJS, ', 'NextJS, ', 'Tailwind CSS, ', 'Ag-Grid, ', 'Playwright'],
    },
    {
        state: 'ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021',
        shows: ['REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT', 'NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023', 'ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021'],
        title: 'ALMAPAY - REMOLUTION COMPANY | JULY 2020 - MAY 2021',
        description: 'A web application supporting seamless payment processing and transaction management. ',
        cardTitle: 'FRONTEND DEVELOPER | 12-14 MEMBERS',
        KeyTasks: ['Developed and maintained web applications using Next.js and Gatsby.', 'Integrated APIs and third-party services for improved payment processing capabilities.'],
        TechStack: ['NextJS, ', 'Tailwind CSS, ', 'Gatsby'],
    },
    {
        state: 'FPT SOFTWARE HO CHI MINH (5-20 MEMBERS) | NOVEMBER 2016 - JULY 2020',
        shows: ['REMOLUTION COMPANY (12-14 MEMBERS) | FEBRUARY 2023 - PRESENT', 'NASHPUSH - REMOLUTION COMPANY (6-8 MEMBERS) | MAY 2021 - FEBRUARY 2023', 'ALMAPAY - REMOLUTION COMPANY (3-5 MEMBERS) | JULY 2020 - MAY 2021', 'FPT SOFTWARE HO CHI MINH (5-20 MEMBERS) | NOVEMBER 2016 - JULY 2020'],
        title: 'FPT SOFTWARE HO CHI MINH | NOVEMBER 2016 - JULY 2020',
        description: 'Various web applications aimed at enhancing system stability and user experiences through feature development and bug resolution.',
        cardTitle: 'DEVELOPER/TEST LEADER | 5-20 MEMBERS',
        KeyTasks: ['Developed and enhanced web applications, adding new functionalities and integrating third-party systems.',
            'Designed and executed comprehensive testing strategies, leading manual and automated testing efforts to reduce production issues by 30%.',
            'Reviewed and optimized test cases, streamlining testing processes and improving coverage for critical modules.',
            'Managed project planning and task distribution to ensure timely delivery.'
        ],
        TechStack: ['Java, ', '.Net, ', 'Manual Testing, ', 'Playwright'],
    },
];

function SeamlessAndUserFriendly() {
    const [currentState, setCurrentState] = useState<Content | null>(content[0]);
    const animation = {
        hide: { x: 100, opacity: 0 },
        show: {
            x: 0,
            opacity: 1,
        },
    };

    return (
        <>
            <section>
                <div className={clsx('mb-8')}>
                    <Container>
                        <SectionTitle
                            title="Fullstack Developer"
                            caption="Experience"
                            description="Create a clean, responsive UI and ensure smooth front-end to back-end integration for a seamless experience."
                        />
                    </Container>
                </div>
                <SectionContent>
                    <Container>
                        <div className={clsx('flex flex-col lg:flex-row gap-3', 'lg:gap-12')}>
                            <m.div
                                initial="hide"
                                animate="show"
                                transition={{ delayChildren: 0.7, staggerChildren: 0.34 }}
                                className={clsx('-mt-8 hidden  lg:flex-1 flex-col gap-3', 'lg:flex')}
                            >
                                {content.map((item, i) => (
                                    <SectionButton
                                        key={item.state}
                                        title={item.title}
                                        description={item.description}
                                        icon={i + 1}
                                        active={currentState?.state === item.state}
                                        onClick={() => setCurrentState(item)}
                                    />
                                ))}
                            </m.div>
                            <m.div
                                initial="hide"
                                animate="show"
                                transition={{ delayChildren: 0.7, staggerChildren: 0.34 }}
                                className={clsx('flex -mt-8 justify-center gap-3 swiper-container', 'lg:hidden')}
                            >
                                <Swiper spaceBetween={10} slidesPerView={1} onRealIndexChange={(swiper) => {
                                    setCurrentState(content[swiper.realIndex]);
                                }}
                                    pagination={{ clickable: true }}
                                    modules={[Pagination]}
                                    loop={true}
                                >
                                    {content.map((item, i) => (
                                        <SwiperSlide key={i} className='w-full'>
                                            <SectionButton
                                                key={item.state}
                                                title={item.title}
                                                description={item.description}
                                                icon={i + 1}
                                                active={currentState?.state === item.state}
                                                onClick={() => setCurrentState(item)}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                            </m.div>
                            <m.div
                                initial={animation.hide}
                                whileInView={animation.show}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}

                                className={clsx('relative flex flex-1 items-center justify-center')}
                            >
                                <div
                                    className={clsx(' flex gap-4', 'md:gap-6 lg:top-8 lg:mt-0')}
                                >
                                    <div>
                                        <ResponsibilitiesCard
                                            title={currentState?.cardTitle ?? "FULLSTACK DEVELOPER | (12-14 MEMBERS)"}
                                            responsibilities={currentState?.KeyTasks || ['Developed the frontend using React.js, Tailwind CSS, shadcnUI, and Next.js. Built backend services with Node.js, including features like exporting PDFs from CVs, data extraction from PDFs, email integration using Nodemailer, and API development with Express.', 'Integrated automated testing workflows with Playwright and conducted manual testing to ensure quality. ']}
                                            techStack={currentState?.TechStack || ['ReactJS, ', 'NextJS, ', 'Tailwind CSS, ', 'Node.js, ', 'Express.js, ', 'PostgreSQL, ', 'Playwright']}
                                        />
                                    </div>

                                </div>
                            </m.div>

                        </div>
                    </Container>
                </SectionContent>
            </section>
        </>
    );
}

export default SeamlessAndUserFriendly;
