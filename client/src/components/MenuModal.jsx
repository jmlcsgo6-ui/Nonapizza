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
        <div id="full-menu-modal" className={`modal-overlay ${isOpen ? 'active' : ''}`}>
            {isOpen && (
                <div className="modal-content modal-fullscreen" style={{ maxWidth: '900px', width: '95%' }}>
                    <button className="close-modal close-menu" onClick={() => setIsOpen(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    
                    <div className="section-header text-center" style={{ marginBottom: '2rem' }}>
                        <h2 className="section-title">Nosso Cardápio</h2>
                        <p className="section-subtitle">Sabores inesquecíveis, qualidade premium.</p>
                    </div>

                    <div className="menu-tabs">
                        {categories.map((c, i) => (
                            <button 
                                key={c.id}
                                className={`tab-btn ${activeTab === i ? 'active' : ''}`}
                                onClick={() => setActiveTab(i)}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div id="menu-container" className="menu-grid" style={{ marginTop: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 250px)', paddingBottom: '2rem', paddingRight: '0.5rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>Carregando...</div>
                        ) : (
                            activeCategoryProducts.map(p => (
                                <div key={p.id} className="menu-item" style={{ cursor: 'pointer' }} onClick={() => {
                                    addToCart({ productId: p.id, productName: p.name, price: p.price, qty: 1 });
                                    setIsOpen(false);
                                    setTimeout(() => setIsCartOpen(true), 150);
                                }}>
                                    <div className="menu-item-info">
                                        <h4>{p.name}</h4>
                                        <p>{p.description || 'Uma receita exclusiva da Nona, preparada com ingredientes selecionados.'}</p>
                                        <span className="price">R$ {p.price.toFixed(2)}</span>
                                    </div>
                                    <button className="btn btn-primary btn-sm"><i className="fa-solid fa-plus"></i></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
