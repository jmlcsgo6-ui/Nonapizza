import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Flame, Leaf, Award, MapPin } from 'lucide-react';

export default function Hero() {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const context = canvas.getContext('2d');
        const frameCount = 144;
        
        const currentFrame = index => `/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`;

        const images = [];
        let imagesLoaded = 0;

        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === 1) resizeCanvas();
            };
            images.push(img);
        }

        const renderFrame = (index) => {
            if (images[index] && images[index].complete) {
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = images[index].width / images[index].height;
                let renderWidth, renderHeight, x, y;

                if (canvasAspect > imgAspect) {
                    renderWidth = canvas.width;
                    renderHeight = canvas.width / imgAspect;
                    x = 0;
                    y = (canvas.height - renderHeight) / 2;
                } else {
                    renderHeight = canvas.height;
                    renderWidth = canvas.height * imgAspect;
                    y = 0;
                    const focusX = window.innerWidth <= 768 ? 0.75 : 0.5;
                    x = (canvas.width * 0.5) - (renderWidth * focusX);
                    x = Math.max(canvas.width - renderWidth, Math.min(0, x));
                }

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(images[index], x, y, renderWidth, renderHeight);
            }
        };

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const parentWrapper = wrapper.parentElement;
            if (!parentWrapper) return;

            const startScroll = parentWrapper.offsetTop; 
            const maxScroll = parentWrapper.offsetHeight - window.innerHeight; 
            
            let scrollFraction = (scrollTop - startScroll) / maxScroll;
            if (scrollFraction < 0) scrollFraction = 0;
            if (scrollFraction > 1) scrollFraction = 1;

            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(scrollFraction * frameCount)
            );

            requestAnimationFrame(() => renderFrame(frameIndex));
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            handleScroll();
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <section id="home" className="hero relative overflow-hidden" ref={wrapperRef}>
            <canvas id="hero-canvas" className="hero-canvas fixed top-0 left-0 w-full h-screen pointer-events-none" ref={canvasRef} style={{ zIndex: 0 }}></canvas>
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-1"></div>

            <div className={`container mx-auto px-6 relative z-10 min-h-screen flex items-center`}>
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6">
                            A pizza perfeita, montada diante dos seus olhos.
                        </h1>
                        <p className="text-xl text-white/60 mb-10 max-w-xl font-medium leading-relaxed">
                            Ingredientes frescos caindo em tempo real, sabor incomparável e entrega rápida direto na sua porta.
                        </p>

                        <ul className="mb-12 space-y-4 list-none p-0">
                            {[
                                { icon: <Flame size={14} />, text: "Ingredientes selecionados diariamente" },
                                { icon: <Flame size={14} />, text: "Entrega rápida e sempre quente" },
                                { icon: <Award size={14} />, text: "Qualidade artesanal com sabor premium" }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-white font-medium">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                        {item.icon}
                                    </div>
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary hover:bg-[#FF7A00] px-10 py-4 rounded-full font-black text-white shadow-2xl shadow-primary/40 flex items-center gap-3 transition-all"
                                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                FAZER PEDIDO <div className="mt-1">↓</div>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Floating Ingredients Decoration (Client side effect) */}
            <AnimateIngredients />
        </section>
    );
}

function AnimateIngredients() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-2">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -100, rotate: 0, opacity: 0 }}
                    animate={{ 
                        y: [null, window.innerHeight + 100], 
                        rotate: 360, 
                        opacity: [0, 0.4, 0] 
                    }}
                    transition={{
                        duration: 8 + Math.random() * 5,
                        repeat: Infinity,
                        delay: i * 2,
                        ease: "linear"
                    }}
                    className="absolute"
                    style={{ left: `${Math.random() * 100}%` }}
                >
                    <div className="w-8 h-8 opacity-20 filter grayscale invert">
                        {/* Simplified ingredient placeholders */}
                        <i className="fa-solid fa-leaf text-primary"></i>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
