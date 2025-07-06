import Footer from '@/components/wrappers/footer/footer';
import HeaderOne from '@/components/wrappers/header/header-one';
import PageHeader from '@/components/wrappers/headings/page-header';
import PageImage from '@/components/wrappers/projects/page-image';
import PricingContent from './components/pricing-content';


export default function PricingPage() {
    return (
        <>
            <HeaderOne />
            <main className='py-20 flex flex-col gap-12'>
                <PageHeader
                    title="pricing"
                    description="Dịch vụ phát triển website chuyên nghiệp với giá cả cạnh tranh"
                    headerImage={<PageImage />}
                />
                <PricingContent />
            </main>
            <Footer />
        </>
    );
} 