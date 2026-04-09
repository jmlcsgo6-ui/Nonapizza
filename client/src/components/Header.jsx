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
            <header className={`header-glass hidden md:flex items-center transition-all duration-500 ${scrolled ? 'h-[65px] bg-[#050505]/90' : 'h-[80px]'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-12">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 cursor-pointer" 
                            onClick={() => navigate('/')}
                        >
                            <div className="bg-primary w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <Utensils size={18} color="#fff" strokeWidth={3} />
                            </div>
                            <span className="text-xl font-display font-black tracking-tighter text-white">
                                NONA<span className="text-primary">PIZZA</span>
                            </span>
                        </motion.div>

                        <nav>
                            <ul className="flex gap-8 list-none m-0 p-0">
                                {['Início', 'Cardápio', 'Sobre'].map((item) => (
                                    <li key={item}>
                                        <a href={`#${item.toLowerCase()}`} className="text-sm font-bold text-white/60 hover:text-primary transition-colors no-underline uppercase tracking-widest text-[0.7rem]">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative bg-white/5 hover:bg-white/10 p-2.5 rounded-full border border-white/10 transition-all"
                        >
                            <ShoppingBag size={20} strokeWidth={2.5} />
                            {cartCount > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-primary text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </button>

                        {customerToken ? (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-10">
                                <div className="text-right">
                                    <p className="text-[10px] text-white/40 uppercase font-black leading-none">Bem-vindo</p>
                                    <p className="text-sm font-black text-white leading-tight">{customerName.split(' ')[0]}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => navigate('/meu-pedido')}
                                        className="bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/10"
                                    >
                                        <ClipboardList size={18} />
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg border border-red-500/20 text-red-500"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => navigate('/login')}
                                className="group flex items-center gap-2 bg-primary hover:bg-[#FF7A00] px-6 py-2.5 rounded-full font-black text-xs transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5"
                            >
                                <User size={16} strokeWidth={3} />
                                ENTRAR
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
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
