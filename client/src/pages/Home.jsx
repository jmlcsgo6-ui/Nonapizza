import React from 'react';
import useRevealObserver from '../hooks/useRevealObserver';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Explore from '../components/Explore';
import WhyUs from '../components/WhyUs';
import Testimonials from '../components/Testimonials';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import PizzaBuilder from '../components/PizzaBuilder';
import MenuModal from '../components/MenuModal';
import CartDrawer from '../components/CartDrawer';

export default function Home() {
    useRevealObserver();

    return (
        <>
            <Header />
            <main>
                <div className="hero-wrapper">
                    <Hero />
                </div>
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
