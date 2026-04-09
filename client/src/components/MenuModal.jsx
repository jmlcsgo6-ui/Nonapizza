import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ShoppingBag, Search, Flame, Leaf, Award } from 'lucide-react';

export default function MenuModal() {
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
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
                setLoading(false);
            } catch(e) { console.error(e); setLoading(false); }
        }
        if (isOpen) fetchCategories();
    }, [isOpen]);

    const filteredProducts = (categories[activeTab]?.products || []).filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[5000] bg-deep/95 backdrop-blur-2xl flex flex-col"
                >
                    {/* Header: Experience Title */}
                    <div className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-deep/50">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={28} />
                            </button>
                            <div className="h-8 w-[1px] bg-white/10"></div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">NOSSO <span className="text-primary italic">CARDÁPIO</span></h3>
                        </div>

                        <div className="relative hidden md:block w-full max-w-md mx-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input 
                                type="text"
                                placeholder="O que você deseja hoje? (Ex: Pepperoni, Trufada...)"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-primary outline-none transition-all"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <button 
                            onClick={() => { setIsOpen(false); setIsCartOpen(true); }}
                            className="bg-primary hover:bg-[#FF7A00] p-3 rounded-2xl transition-all shadow-lg shadow-primary/20"
                        >
                            <ShoppingBag size={20} color="#fff" strokeWidth={3} />
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-deep/30 border-b border-white/5 overflow-x-auto no-scrollbar">
                        <div className="container mx-auto px-8 flex gap-10">
                            {categories.map((c, i) => (
                                <button 
                                    key={c.id} 
                                    onClick={() => { setActiveTab(i); setSearch(''); }}
                                    className={`py-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === i ? 'text-primary' : 'text-white/30 hover:text-white'}`}
                                >
                                    {c.name}
                                    {activeTab === i && (
                                        <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_0_15px_rgba(255,95,0,0.8)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <div className="container mx-auto">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[1,2,3,4,5,6].map(i => (
                                        <div key={i} className="h-40 rounded-[2.5rem] bg-white/5 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    <motion.div 
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                                    >
                                        {filteredProducts.map((p, idx) => (
                                            <motion.div 
                                                key={p.id}
                                                whileHover={{ y: -5 }}
                                                className="group relative bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-300"
                                            >
                                                {/* Visual indicator based on index for variety */}
                                                <div className="h-32 bg-gradient-to-br from-[#111] to-[#0c0c0c] flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute top-4 right-4 text-white/5 group-hover:text-primary/20 transition-colors">
                                                        {idx % 3 === 0 ? <Flame size={60} /> : idx % 3 === 1 ? <Leaf size={60} /> : <Award size={60} />}
                                                    </div>
                                                    <h4 className="text-3xl font-black italic text-white/10 group-hover:text-primary/10 transition-colors uppercase tracking-widest">{p.name.substring(0, 3)}</h4>
                                                </div>

                                                <div className="p-8">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors">{p.name}</h4>
                                                        <span className="text-xs font-black text-primary">R$ {p.price.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-xs font-medium text-white/30 leading-relaxed mb-8 line-clamp-2">{p.description || 'Uma receita exclusiva da Nona, preparada com ingredientes selecionados.'}</p>
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            addToCart({ productId: p.id, productName: p.name, price: p.price, qty: 1 });
                                                            setIsOpen(false);
                                                            setTimeout(() => setIsCartOpen(true), 150);
                                                        }}
                                                        className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-primary group-hover:border-primary text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 text-white"
                                                    >
                                                        <Plus size={16} strokeWidth={3} /> ADICIONAR AO PEDIDO
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
