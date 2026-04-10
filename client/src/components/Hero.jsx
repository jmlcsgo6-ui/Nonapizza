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
        const images = [];
        let imagesLoaded = 0;
        
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            // Caminho relativo para melhor compatibilidade com subdiretórios
            img.src = `/ezgif-frame-${(i + 1).toString().padStart(3, '0')}.png`;
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === 1) {
                    resizeCanvas();
                }
            };
            img.onerror = () => {
                imagesLoaded++;
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
                    const focusX = window.innerWidth <= 768 ? 0.6 : 0.5; // Ajuste fino para mobile
                    x = (canvas.width * 0.5) - (renderWidth * focusX);
                    x = Math.max(canvas.width - renderWidth, Math.min(0, x));
                }

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(images[index], x, y, renderWidth, renderHeight);
            }
        };

        const handleScroll = () => {
            if (!wrapper || !images.length) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const startScroll = wrapper.offsetTop;
            const wrapperHeight = wrapper.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            const maxScroll = wrapperHeight - viewportHeight;
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
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            handleScroll();
        };

        window.addEventListener('resize', resizeCanvas, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Timer para garantir renderização mesmo se o carregamento demorar
        const initTimer = setTimeout(resizeCanvas, 500);

        return () => {
            clearTimeout(initTimer);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="hero-wrapper" ref={wrapperRef}>
            <section id="home" className="hero">
                <canvas 
                    id="hero-canvas" 
                    className="hero-canvas" 
                    ref={canvasRef}
                    style={{ background: '#000' }}
                ></canvas>
                <div className="hero-overlay" style={{ opacity: window.innerWidth <= 768 ? 0.6 : 0.8 }}></div>
                <div className="container hero-container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="hero-left">
                        <h1 className="hero-title">A pizza perfeita, montada diante dos seus olhos.</h1>
                        <p className="hero-subtitle">Ingredientes frescos caindo em tempo real, sabor incomparável e entrega
                            rápida direto na sua porta.</p>

                        <ul className="highlights">
                            <li>
                                <i className="fa-solid fa-check"></i>
                                <span>Ingredientes selecionados diariamente</span>
                            </li>
                            <li>
                                <i className="fa-solid fa-fire"></i>
                                <span>Entrega rápida e sempre quente</span>
                            </li>
                            <li>
                                <i className="fa-solid fa-medal"></i>
                                <span>Qualidade artesanal com sabor premium</span>
                            </li>
                        </ul>

                        <div className="cta-group">
                            <a href="#explore" className="btn btn-primary hover-scale"
                                style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
                                onClick={(e) => { e.preventDefault(); document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' }) }}
                            >
                                Fazer Pedido <i className="fa-solid fa-arrow-down" style={{ marginLeft: '8px' }}></i>
                            </a>
                        </div>
                    </div>

                    <div className="hero-right">
                        {/* Area for future interactions */}
                    </div>
                </div>
            </section>
        </div>
    );
}
