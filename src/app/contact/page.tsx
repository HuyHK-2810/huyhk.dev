import Footer from '@/components/wrappers/footer/footer';
import HeaderOne from '@/components/wrappers/header/header-one';
import PageHeader from '@/components/wrappers/headings/page-header';
import PageImage from '@/components/wrappers/projects/page-image';

import Content from './components/content';


export default function Page() {

    return (
        <>
            <HeaderOne />
            <main className='py-20 flex flex-col gap-12'>
                <PageHeader title="contact"
                    description="Get in touch with me anytime, through social media, e-mail, or phone number."
                    headerImage={<PageImage />}
                />
                <Content />

            </main>
            <Footer />
        </>
    );
}
