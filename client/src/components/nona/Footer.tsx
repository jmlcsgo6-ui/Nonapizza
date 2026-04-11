import React from 'react';

export default function Footer() {
    return (
        <footer id="contact" className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div className="logo">
                            <a href="#">NONA<span>.</span></a>
                        </div>
                        <p style={{ marginTop: '1rem' }}>A pizza perfeita, montada diante dos seus olhos.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Menu Rápido</h4>
                        <ul>
                            <li><a href="#home">Início</a></li>
                            <li><a href="#how-it-works">Como Funciona</a></li>
                            <li><a href="#explore">Pedir Agora</a></li>
                            <li><a href="#why-us">Sobre</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contato</h4>
                        <p><i className="fa-solid fa-phone" style={{ marginRight: '8px' }}></i> (11) 99999-9999</p>
                        <p><i className="fa-solid fa-envelope" style={{ marginRight: '8px' }}></i> contato@nonapizza.etc</p>
                        <p><i className="fa-solid fa-location-dot" style={{ marginRight: '8px' }}></i> Rua das Pizzas Culturadas, 123</p>
                    </div>
                    <div className="footer-col">
                        <h4>Redes Sociais</h4>
                        <div className="social-links">
                            <a href="https://instagram.com/nonapizza" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
                            <a href="https://facebook.com/nonapizza" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="https://tiktok.com/@nonapizza" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-tiktok"></i></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Nona Pizza Premium. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
