import Footer from '@/components/wrappers/footer/footer';
import HeaderOne from '@/components/wrappers/header/header-one';
import PageHeader from '@/components/wrappers/headings/page-header';
import ProjectsContents from '@/components/wrappers/projects/page-contents';
import PageImage from '@/components/wrappers/projects/page-image';


export default function Home() {
    return (
        <>
            <HeaderOne />
            <main className='py-20 flex flex-col gap-12'>
                <PageHeader title="projects"
                    description="Showcase of my front-end related work."
                    headerImage={<PageImage />}
                />
                <ProjectsContents />
            </main>
            <Footer />
        </>
    );
}
