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

    return (
        <>
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
