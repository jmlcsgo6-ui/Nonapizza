import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useCart } from '../context/CartContext';

export default function MenuModal() {
    const [categories, setCategories] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { addToCart, setIsCartOpen } = useCart();
    
    // Listen for events or manual toggles to open the menu
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
                setTimeout(() => {
                    setCategories(res.data);
                    setLoading(false);
                }, 800); // 800ms to preserve UX aesthetic skeleton transition
            } catch(e) { console.error("Error fetching menu", e); setLoading(false); }
        }
        fetchCategories();
    }, []);

    if (!isOpen) return null;

    return (
        <div id="full-menu-modal" className="modal-overlay active">
            <div className="modal-content modal-fullscreen">
                <button className="close-modal close-menu" onClick={() => setIsOpen(false)}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <div className="section-header text-center" style={{ marginBottom: '2rem' }}>
                    <h2 className="section-title">Nosso Cardápio</h2>
                    <p className="section-subtitle">Sabores inesquecíveis, qualidade premium.</p>
                </div>
                
                <div className="menu-tabs">
                    {categories.map((c, i) => (
                        <button key={c.id} className={`tab-btn ${i === 0 ? 'active' : ''}`}>{c.name}</button>
                    ))}
                </div>

                <div id="menu-container" className="menu-grid" style={{ marginTop: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={`skel-${i}`} className="menu-item-card skeleton" style={{ minHeight: '120px', border: 'none' }}></div>
                        ))
                    ) : (
                        categories.map(c => 
                            c.products.map(p => (
                                <div key={p.id} className="menu-item-card reveal-on-scroll is-revealed hover-scale" style={{ opacity: 0, animation: 'popIn 0.4s ease forwards' }}>
                                    <div className="mic-info">
                                        <h4>{p.name}</h4>
                                        <p>{p.description}</p>
                                    <div className="mic-bottom">
                                            <span className="price">R$ {p.price.toFixed(2)}</span>
                                            <button 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => {
                                                    addToCart({
                                                        productId: p.id,
                                                        productName: p.name,
                                                        price: p.price,
                                                        qty: 1
                                                    });
                                                    setIsOpen(false);
                                                    setIsCartOpen(true); // Open the cart to reflect success
                                                }}
                                            >
                                                <i className="fa-solid fa-plus"></i> Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
