import React from 'react';
import useRevealObserver from '../hooks/useRevealObserver';
import Header from '../components/nona/Header';
import Hero from '../components/nona/Hero';
import HowItWorks from '../components/nona/HowItWorks';
import Explore from '../components/nona/Explore';
import WhyUs from '../components/nona/WhyUs';
import Testimonials from '../components/nona/Testimonials';
import FinalCTA from '../components/nona/FinalCTA';
import Footer from '../components/nona/Footer';
import PizzaBuilder from '../components/nona/PizzaBuilder';
import MenuModal from '../components/nona/MenuModal';
import CartDrawer from '../components/nona/CartDrawer';

export default function Home() {
    useRevealObserver();

    React.useEffect(() => {
        const handleScroll = () => {
            const progressBar = document.querySelector('.scroll-progress') as HTMLElement;
            if (progressBar) {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = (window.pageYOffset / totalHeight) * 100;
                progressBar.style.width = `${progress}%`;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className="scroll-progress"></div>
            <Header />
            <main>
                <Hero />
                <HowItWorks />
                <Explore />
                <WhyUs />
                <Testimonials />
                <FinalCTA />
            </main>
            <Footer />
            <PizzaBuilder />
            <MenuModal />
            <CartDrawer />
        </>
    );
}
