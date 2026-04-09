import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, UtensilsCrossed, Sparkles, ShoppingCart, Info } from 'lucide-react';

export default function MenuModal() {
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { addToCart, setIsCartOpen } = useCart();
    
    useEffect(() => {
        const handleOpenMenu = () => setIsOpen(true);
        document.addEventListener('open-menu', handleOpenMenu);
        return () => document.removeEventListener('open-menu', handleOpenMenu);
    }, []);
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/categories');
                setCategories(res.data);
                if (res.data.length > 0) setActiveTab(0);
            } catch(e) { 
                console.error(e); 
            } finally {
                setLoading(false);
            }
        }
        if (isOpen) fetchCategories();
    }, [isOpen]);

    const activeCategoryProducts = categories[activeTab]?.products || [];

    const handleAddToCart = (p) => {
        addToCart({ productId: p.id, productName: p.name, price: p.price, qty: 1 });
        setIsOpen(false);
        setTimeout(() => setIsCartOpen(true), 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 md:p-8">
                    {/* Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-2xl"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#080808] border border-white/10 w-full max-w-6xl h-[85vh] md:h-[80vh] rounded-[48px] flex flex-col relative z-10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-10 md:p-14 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent relative">
                            <button 
                                className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-20" 
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-10 bg-primary rounded-full"></div>
                                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                                            Nosso <span className="text-primary italic">Cardápio</span>
                                        </h2>
                                    </div>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] ml-2">Escolha sua Experiência Gastronômica</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="px-10 py-6 border-b border-white/5 bg-black/50 overflow-x-auto no-scrollbar">
                            <div className="flex gap-4">
                                {categories.map((c, i) => (
                                    <button 
                                        key={c.id}
                                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === i ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                                        onClick={() => setActiveTab(i)}
                                    >
                                        <UtensilsCrossed size={14} />
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 md:p-14">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-20">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
                                    />
                                    <p className="text-xs font-bold uppercase tracking-[0.5em]">Carregando Menu...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                    <AnimatePresence mode="popLayout">
                                        {activeCategoryProducts.map((p, idx) => (
                                            <motion.div 
                                                layout
                                                key={p.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group relative bg-[#0c0c0c] border border-white/5 rounded-[40px] p-8 md:p-10 hover:border-primary/30 transition-all cursor-pointer shadow-xl"
                                                onClick={() => handleAddToCart(p)}
                                            >
                                                <div className="flex justify-between items-start gap-6">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors tracking-tight uppercase italic">{p.name}</h4>
                                                                <Sparkles size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <p className="text-xs font-medium text-white/30 leading-relaxed line-clamp-2">
                                                                {p.description || 'Sabor tradicional com ingredientes selecionados.'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-2xl font-black text-white italic tracking-tighter">R$ {p.price.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(255,95,0,0.3)] transition-all shrink-0">
                                                        <Plus size={28} />
                                                    </div>
                                                </div>
                                                
                                                {/* Mini tag */}
                                                <div className="absolute -top-3 left-10 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
                                                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                                                        <ShoppingCart size={10} /> Adicionar
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="px-14 py-8 bg-[#0a0a0a] border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.5em] flex items-center gap-3">
                                <Info size={12} className="text-primary/20" /> Selecione o produto para adicionar ao seu carrinho
                            </p>
                            <div className="flex items-center gap-5 text-[9px] font-black text-primary uppercase tracking-[0.3em]">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Sistema Pronto
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

