import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useCart } from '../context/CartContext';

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
                setLoading(false);
            } catch(e) { console.error(e); setLoading(false); }
        }
        if (isOpen) fetchCategories();
    }, [isOpen]);

    const activeCategoryProducts = categories[activeTab]?.products || [];

    return (
        <div id="full-menu-modal" className={`modal-overlay ${isOpen ? 'active' : ''}`} style={{ zIndex: 4000, background: 'rgba(0,0,0,0.95)' }}>
            {isOpen && (
                <div className="bg-black border border-white/10 w-full max-w-[1000px] h-[90vh] flex flex-col font-mono relative">
                    <button className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                    
                    <div className="p-12 border-b border-white/10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-1 h-8 bg-primary"></div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase italic">FIXED_INVENTORY <span className="text-primary italic">CARTE</span></h2>
                        </div>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">PRODUTOS DE PRONTA ENTREGA</p>
                    </div>

                    <div className="flex border-b border-white/5 bg-white/[0.01]">
                        {categories.map((c, i) => (
                            <button 
                                key={c.id}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === i ? 'bg-primary text-black' : 'text-white/30 hover:text-white'}`}
                                onClick={() => setActiveTab(i)}
                            >
                                {c.name.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div id="menu-container" className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-[10px] font-black uppercase tracking-[0.5em] text-white/20">FETCHING_DATA...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeCategoryProducts.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="border border-white/5 p-8 flex justify-between items-center group transition-all hover:bg-white/[0.02] cursor-pointer" 
                                        onClick={() => {
                                            addToCart({ productId: p.id, productName: p.name, price: p.price, qty: 1 });
                                            setIsOpen(false);
                                            setTimeout(() => setIsCartOpen(true), 150);
                                        }}
                                    >
                                        <div className="flex-1 pr-6">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors mb-2">{p.name}</h4>
                                            <p className="text-[9px] font-medium text-white/30 uppercase leading-loose mb-4">{p.description || 'RECIPE_ID: STANDARD_ALQUIMIA_PROCEDURE'}</p>
                                            <span className="text-sm font-black text-white italic tracking-tighter italic">R$ {p.price.toFixed(2)}</span>
                                        </div>
                                        <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">
                                            <i className="fa-solid fa-plus"></i>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-white/[0.01] border-t border-white/5 text-center">
                        <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.5em]">SYSTEM_VERSION: ALQUIMIA_CORE_v2.0 // STATUS: READY</p>
                    </div>
                </div>
            )}
        </div>
    );
}
