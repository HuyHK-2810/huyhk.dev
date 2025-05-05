"use client"
import clsx from 'clsx';
import { useState } from 'react';
import { SectionTitle } from '../sections/section-title';
import SectionContent from '../sections/section-content';
import { SectionButton } from '../sections/section-button';
import { GitHubIcon } from '@/components/ui/icons';
import AppWindow from '../wireframes/AppWindow';
import GitHubWireframe from '../wireframes/GitHub';
import Container from '@/components/ui/container';

const projects = [
  {
    title: "LeapIn - AI-Powered Talent Acquisition",
    caption: "leapin.co",
    description: "Accelerate your hiring process with AI-driven tools that intelligently source, assess, and onboard talent.",
    button: {
      title: "Explore LeapIn",
      href: "https://leapin.co/",
    },
    extraInfo: {
      title: "LeapIn - Trusted by 100+ global companies",
      description: "Experience up to 30% savings on manpower expenses with no upfront fees and a 90-day guarantee.",
    },
     iconUrl: "/logo/leapin.svg"
  },
  {
    title: "Nashpush - Push Notifications Platform",
    caption: "nashpush.com",
    description: "Engage your audience with real-time, personalized push notifications across web and mobile platforms.",
    button: {
      title: "Get Started",
      href: "https://www.nashpush.com/",
    },
    extraInfo: {
      title: "Nashpush - Boost Customer Engagement",
      description: "Utilize segmentation and automation to deliver timely messages that convert browsers into buyers.",
    },
    // iconUrl: "/logo/nashpush.png"
  },
  {
    title: "Alma - Flexible Payment Solutions",
    caption: "Almapay",
    description: "Offer your customers the freedom to pay in installments or later, enhancing their purchasing experience.",
    button: {
      title: "Discover Alma",
      href: "https://almapay.com/",
    },
    extraInfo: {
      title: "Almapay - Increase Sales by 20%",
      description: "Join over 19,800 merchants who trust Alma to boost conversions and average order value.",
    },
    iconUrl: "/logo/alma-icon.svg"
  },
];

function ProjectsContents() {
    const [currentProject, setCurrentProject] = useState<any>(projects[0]);


    return (
        <>
            <Container>
                <SectionTitle
                    title={currentProject.title}
                    description={currentProject.description}
                    button={{
                        title: currentProject.button.title,
                        href: currentProject.button.href,
                    }}
                    caption={currentProject.caption}
                   
                />
            </Container>
            <SectionContent>
                <Container>
                    <div className={clsx('flex', 'lg:gap-12')}>
                        <div className={clsx('hidden flex-1 flex-col gap-3 pt-8', 'lg:flex')}>
                            <div className={clsx('flex flex-col gap-3')}>
                                {projects.map((project, index) => (
                                  <SectionButton
                                    title={project.extraInfo.title}
                                    key={index}
                                    icon={ !project.iconUrl ?  <GitHubIcon className="my-2 h-16 w-16 object-contain"/> :<img src={project.iconUrl} alt={project.caption} className="my-2 h-16 w-16 object-contain" />}
                                    description={project.extraInfo.description}
                                    active={currentProject.caption === project.caption}
                                    onClick={() => setCurrentProject(project)}
                                />

                                ))}
                               
                            </div>
                        </div>
                        <div className={clsx('w-full', 'lg:w-auto')}>
                            <div className={clsx('-mt-[41px]')}>
                                <div className={clsx('w-full', 'lg:h-[400px] lg:w-[600px]')}>
                                    <AppWindow
                                        type="browser"
                                        browserTabs={[
                                            {
                                                icon: <GitHubIcon className="h-4 w-4" />,
                                                title: 'HuyHK-2810/leapin',
                                                isActive: currentProject.caption==="leapin.co",
                                            },
                                             {
                                                icon: <GitHubIcon className="h-4 w-4" />,
                                                title: 'HuyHK-2810/nashpush',
                                             isActive: currentProject.caption==="nashpush.com",
                                            },
                                             {
                                                icon: <GitHubIcon className="h-4 w-4" />,
                                                title: 'HuyHK-2810/almapay',
                                                isActive: currentProject.caption==="Almapay",   
                                            },
                                           
                                        ]}
                                    >
                                             <GitHubWireframe
                                                author="HuyHK-2810"
                                                license="MIT"
                                                repository={currentProject.caption}
                                                description={currentProject.description}
                                            />
                                    </AppWindow>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </SectionContent>
        </>
    );
}

export default ProjectsContents;
