import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Utensils, ClipboardList, User, ShoppingBag, LogOut, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, setIsCartOpen } = useCart();
    const [scrolled, setScrolled] = useState(false);
    
    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_name');
        window.location.reload();
    };

    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <>
            {/* DESKTOP HEADER: Glassmorphism */}
            <header className={`fixed top-0 left-0 w-full z-[1000] flex items-center transition-all duration-300 ${scrolled ? 'h-[65px] bg-black/95 shadow-xl' : 'h-[80px] bg-black/80 backdrop-blur-md'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center w-full">
                    <div className="logo cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center gap-3">
                            <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
                                <Utensils size={18} color="#fff" strokeWidth={3} />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white">
                                NONA <span className="text-primary">PIZZA</span>
                            </span>
                        </div>
                    </div>

                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-6 m-0 p-0 list-none">
                            <li><a href="#home" className="text-[13px] font-bold text-white hover:text-primary transition-colors no-underline uppercase tracking-wide">Início</a></li>
                            <li><a href="#menu" className="text-[13px] font-bold text-white/60 hover:text-white transition-colors no-underline uppercase tracking-wide">Cardápio</a></li>
                            <li>
                                <button 
                                    onClick={() => navigate('/meu-pedido')}
                                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-[12px] font-bold text-white/80 transition-all uppercase tracking-wide"
                                >
                                    MEUS PEDIDOS
                                </button>
                            </li>
                            {!customerToken ? (
                                <li>
                                    <button 
                                        onClick={() => navigate('/login')}
                                        className="bg-primary hover:bg-[#FF7A00] px-6 py-2.5 rounded-full text-[12px] font-bold text-white transition-all shadow-lg shadow-primary/20 uppercase tracking-wide"
                                    >
                                        ENTRAR
                                    </button>
                                </li>
                            ) : (
                                <li className="flex items-center gap-3 border-l border-white/10 pl-6 ml-2">
                                    <span className="text-xs font-bold text-white/60 underline cursor-pointer" onClick={handleLogout}>Sair</span>
                                </li>
                            )}
                        </ul>
                    </nav>

                    {/* Shopping Bag Button for both mobile (header) and desktop if needed */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="md:hidden relative bg-white/5 p-2.5 rounded-full border border-white/10"
                    >
                        <ShoppingBag size={20} strokeWidth={2.5} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* MOBILE BOTTOM NAVIGATION: Thumb-Zone Optimized */}
            <nav className="mobile-nav md:hidden">
                <button 
                    onClick={() => navigate('/')} 
                    className={`mobile-nav-item border-none bg-transparent ${location.pathname === '/' ? 'active' : ''}`}
                >
                    <Home size={22} color={location.pathname === '/' ? '#FF5F00' : '#666'} />
                    <span>Início</span>
                </button>
                <button 
                    onClick={() => document.dispatchEvent(new CustomEvent('open-menu'))} 
                    className="mobile-nav-item border-none bg-transparent"
                >
                    <Utensils size={22} color="#666" />
                    <span>Menu</span>
                </button>
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="flex flex-col items-center gap-1 relative -top-4"
                >
                    <div className="bg-primary w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 text-white">
                        <ShoppingBag size={24} strokeWidth={2.5} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </button>
                <button 
                    onClick={() => navigate('/meu-pedido')} 
                    className="mobile-nav-item border-none bg-transparent"
                >
                    <ClipboardList size={22} color="#666" />
                    <span>Pedidos</span>
                </button>
                <button 
                    onClick={() => navigate('/login')} 
                    className="mobile-nav-item border-none bg-transparent"
                >
                    <User size={22} color="#666" />
                    <span>{customerToken ? 'Perfil' : 'Entrar'}</span>
                </button>
            </nav>
        </>
    );
}
