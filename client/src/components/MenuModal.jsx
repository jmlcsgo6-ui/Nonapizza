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

    if (!isOpen) return null;

    return (
        <div id="full-menu-modal" className={`modal-overlay ${isOpen ? 'active' : ''}`} style={{ display: 'flex' }}>
            <div className="modal-content modal-fullscreen">
                <div className="modal-header">
                    <h3>Cardápio Artesanal</h3>
                    <button id="close-menu-modal" className="close-modal" onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
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

                <div id="menu-container" className="menu-grid">
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', gridColumn: '1/-1', opacity: 0.5 }}>Carregando sabores...</div>
                    ) : (
                        activeCategoryProducts.map(p => (
                            <div key={p.id} className="menu-item" onClick={() => handleAddToCart(p)}>
                                <div className="menu-item-info">
                                    <h4>{p.name}</h4>
                                    <p>{p.description || 'Sabor tradicional com ingredientes selecionados.'}</p>
                                </div>
                                <div className="menu-item-action">
                                    <span className="price">R$ {p.price.toFixed(2)}</span>
                                    <button className="add-btn"><i className="fa-solid fa-plus"></i></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}


