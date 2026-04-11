import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { useCart } from '../../context/CartContext';

export default function MenuModal() {
    const [categories, setCategories] = useState<any[]>([]);
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
        };
        if (isOpen) fetchCategories();
    }, [isOpen]);

    const activeCategoryProducts = categories[activeTab]?.products || [];

    const handleAddToCart = (p: any) => {
        addToCart({ productId: p.id, productName: p.name, price: p.price, qty: 1 });
        setIsOpen(false);
        setTimeout(() => setIsCartOpen(true), 300);
    };

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} style={{ display: 'flex' }}>
            <div className="modal-content modal-fullscreen">
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cardápio Artesanal</h3>
                    <button className="close-modal" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#b0b0b0', fontSize: '1.5rem', cursor: 'pointer' }}><i className="fa-solid fa-xmark"></i></button>
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

                <div className="menu-items-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#b0b0b0' }}>Carregando...</div>
                    ) : activeCategoryProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#b0b0b0' }}>Nenhum produto nesta categoria.</div>
                    ) : (
                        <div className="menu-grid">
                            {activeCategoryProducts.map((p: any) => (
                                <div key={p.id} className="menu-item">
                                    <div className="menu-item-info">
                                        <h4>{p.name}</h4>
                                        <p>{p.description}</p>
                                        <span className="price">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(p)}>
                                        <i className="fa-solid fa-plus"></i> Adicionar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
