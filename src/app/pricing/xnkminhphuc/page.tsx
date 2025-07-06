import Footer from '@/components/wrappers/footer/footer';
import HeaderOne from '@/components/wrappers/header/header-one';
import PageHeader from '@/components/wrappers/headings/page-header';
import PageImage from '@/components/wrappers/projects/page-image';
import XNKMinhPhucPricingContent from './components/xnkminhphuc-pricing-content';


export default function XNKMinhPhucPricingPage() {
    return (
        <>
            <HeaderOne />
            <main className='py-20 flex flex-col gap-12'>
                <PageHeader
                    title="XNK Minh Phúc - Báo Giá Website Cơ Khí"
                    description="Báo giá thiết kế website chuyên nghiệp cho ngành cơ khí và thiết bị xây dựng - Ưu đãi 25% cho khách hàng quen"
                    headerImage={<PageImage />}
                />
                <XNKMinhPhucPricingContent />
            </main>
            <Footer />
        </>
    );
} 