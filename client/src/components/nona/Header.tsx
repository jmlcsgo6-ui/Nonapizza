import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Header() {
    const navigate = useNavigate();
    const { cart, setIsCartOpen } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const customerToken = localStorage.getItem('customer_token');

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_name');
        window.location.reload();
    };

    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <>
            <header className={`header ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
                <div className="container nav-container">
                    <div className="logo">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); setIsMobileMenuOpen(false); }}>
                            <div className="logo-icon"><i className="fa-solid fa-pizza-slice"></i></div>
                            NONA <span>PIZZA</span>
                        </a>
                    </div>
                    
                    <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>
                        <ul>
                            <li><a href="#home" onClick={(e) => { e.preventDefault(); navigate('/'); setIsMobileMenuOpen(false); }}>Início</a></li>
                            <li><a href="#menu" onClick={(e) => { e.preventDefault(); document.dispatchEvent(new CustomEvent('open-menu')); setIsMobileMenuOpen(false); }}>Cardápio</a></li>
                            <li><a href="#orders" className="nav-pill" onClick={(e) => { e.preventDefault(); navigate('/meu-pedido'); setIsMobileMenuOpen(false); }}>MEUS PEDIDOS</a></li>
                            {!customerToken ? (
                                <li><a href="#login" className="nav-btn-primary" onClick={(e) => { e.preventDefault(); navigate('/login'); setIsMobileMenuOpen(false); }}>ENTRAR</a></li>
                            ) : (
                                <>
                                    <li><a href="#logout" className="nav-btn-primary logout-btn" onClick={(e) => { e.preventDefault(); handleLogout(); setIsMobileMenuOpen(false); }}>SAIR</a></li>
                                    <li>
                                        <button className="nav-btn-primary cart-btn" onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}>
                                            <i className="fa-solid fa-cart-shopping"></i> {cartCount > 0 ? `(${cartCount})` : ''}
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>

                    <button 
                        className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            {customerToken && (
                <button id="mobile-cart-btn" className="mobile-cart-btn" onClick={() => setIsCartOpen(true)}>
                    <div className="mcb-left">
                        <i className="fa-solid fa-cart-shopping"></i> <span id="mcb-qty" className="badge">{cartCount}</span>
                    </div>
                    <div className="mcb-right">Ver Carrinho &rarr;</div>
                </button>
            )}
        </>
    );
}
