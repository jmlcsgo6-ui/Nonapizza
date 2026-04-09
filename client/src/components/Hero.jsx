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

    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_name');
        window.location.reload();
    };

    return (
        <section id="home" className="hero" ref={wrapperRef}>
            <nav style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, padding: '1.5rem 2rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: 'var(--primary, #e07b39)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-pizza-slice" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>NONA PIZZA</h2>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <a href="/meu-pedido" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Meus Pedidos</a>
                        {customerToken ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Olá, <strong>{customerName}</strong></span>
                                <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>Sair</button>
                            </div>
                        ) : (
                            <a href="/login" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}>Entrar / Criar Conta</a>
                        )}
                    </div>
                </div>
            </nav>

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
