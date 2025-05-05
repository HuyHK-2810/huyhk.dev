'use client'
import Footer from '@/components/wrappers/footer/footer';
import HeaderOne from '@/components/wrappers/header/header-one';
import HeroOne from '@/components/wrappers/hero/hero-one';
import QuotoOne from '@/components/wrappers/quotes/quote-one';
import SeamlessAndUserFriendly from '@/components/wrappers/sections/seamless-user-friendly';
import FocusedAndOptimized from '@/components/wrappers/sections/focused-optimized';
import RefinedAndScalable from '@/components/wrappers/sections/refined-scalable';

export default function Home() {
  return (
    <>
      <HeaderOne />
      <HeroOne />
      <main className='py-20 flex flex-col gap-12'>
        <QuotoOne />
        <SeamlessAndUserFriendly />
        <FocusedAndOptimized />
        <RefinedAndScalable />
      </main>
      <Footer />
    </>
  );
}

