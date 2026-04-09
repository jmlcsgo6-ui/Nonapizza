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

            <div className="container mx-auto px-6 relative z-10 min-h-screen flex items-center">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="nona-badge mb-6 inline-block tracking-widest">Alquimia Italiana</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6">
                            A alquimia entre a <span className="text-gradient">fermentação de 48h</span> e o calor do forno.
                        </h1>
                        <p className="text-xl text-white/60 mb-10 max-w-xl font-medium leading-relaxed">
                            Simplesmente a pizza perfeita. Ingredientes San Marzano frescos caindo em sincronia com seu apetite.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-premium"
                                onClick={() => document.dispatchEvent(new CustomEvent('open-menu'))}
                            >
                                EXPLORAR CARDÁPIO <ChevronRight size={18} strokeWidth={3} />
                            </motion.button>
                            
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
                            >
                                <div className="flex -space-x-3">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-deep overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-white/80">4.9/5 <span className="text-white/40 font-normal">baseado em +2k pedidos</span></span>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="flex flex-col gap-2">
                                <Flame className="text-primary" size={24} />
                                <span className="text-xs font-black uppercase tracking-widest text-white/40">Forno a Lenha</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Leaf className="text-primary" size={24} />
                                <span className="text-xs font-black uppercase tracking-widest text-white/40">San Marzano</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Award className="text-primary" size={24} />
                                <span className="text-xs font-black uppercase tracking-widest text-white/40">Premium 48h</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <MapPin className="text-primary" size={24} />
                                <span className="text-xs font-black uppercase tracking-widest text-white/40">Entrega Veloz</span>
                            </div>
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
