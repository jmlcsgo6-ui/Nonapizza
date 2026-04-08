import React, { useEffect, useRef } from 'react';

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
            const startScroll = wrapper.offsetTop; 
            const maxScroll = wrapper.offsetHeight - window.innerHeight; 
            
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
        <section id="home" className="hero" ref={wrapperRef}>
            <canvas id="hero-canvas" className="hero-canvas" ref={canvasRef}></canvas>
            <div className="hero-overlay"></div>
            <div className="container hero-container" style={{ position: 'relative', zIndex: 2 }}>
                <div className="hero-left">
                    <h1 className="hero-title">A pizza perfeita, montada diante dos seus olhos.</h1>
                    <p className="hero-subtitle">Ingredientes frescos caindo em tempo real, sabor incomparável e entrega rápida direto na sua porta.</p>

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
                        <a href="#explore" className="btn btn-primary hover-scale" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                            Fazer Pedido <i className="fa-solid fa-arrow-down" style={{ marginLeft: '8px' }}></i>
                        </a>
                    </div>
                </div>

                <div className="hero-right">
                    {/* Right side remains empty for future animation as requested */}
                </div>
            </div>
        </section>
    );
}
