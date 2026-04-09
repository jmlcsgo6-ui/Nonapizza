import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, setIsCartOpen } = useCart();
    
    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_name');
        window.location.reload();
    };

    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <>
            <header className="header">
                <div className="container nav-container">
                    <div className="logo">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                            <div className="logo-icon"><i className="fa-solid fa-pizza-slice"></i></div>
                            NONA <span>PIZZA</span>
                        </a>
                    </div>
                    <nav className="nav">
                        <ul>
                            <li><a href="#home" className="active" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Início</a></li>
                            <li><a href="#menu" onClick={(e) => { e.preventDefault(); document.dispatchEvent(new CustomEvent('open-menu')); }}>Cardápio</a></li>
                            <li><a href="#orders" className="nav-pill" onClick={(e) => { e.preventDefault(); navigate('/meu-pedido'); }}>MEUS PEDIDOS</a></li>
                            {!customerToken ? (
                                <li><a href="#login" className="nav-btn-primary" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>ENTRAR</a></li>
                            ) : (
                                <li><a href="#logout" className="nav-btn-primary" style={{ background: '#333' }} onClick={(e) => { e.preventDefault(); handleLogout(); }}>SAIR</a></li>
                            )}
                            <li>
                                <button className="nav-btn-primary" onClick={() => setIsCartOpen(true)} style={{ background: '#222', border: 'none', cursor: 'pointer', marginLeft: '10px' }}>
                                    <i className="fa-solid fa-cart-shopping"></i> {cartCount > 0 ? `(${cartCount})` : ''}
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Mobile Sticky Cart Button */}
            <button id="mobile-cart-btn" className="mobile-cart-btn" onClick={() => setIsCartOpen(true)}>
                <div className="mcb-left">
                    <i className="fa-solid fa-cart-shopping"></i> <span id="mcb-qty" className="badge">{cartCount}</span>
                </div>
                <div className="mcb-right">Ver Carrinho &rarr;</div>
            </button>
        </>
    );
}
