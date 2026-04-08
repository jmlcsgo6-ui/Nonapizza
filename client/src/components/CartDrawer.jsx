import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/api';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [submitting, setSubmitting] = useState(false);

    const missingFrete = Math.max(0, 100 - cartTotal);
    const progressPercent = Math.min(100, (cartTotal / 100) * 100);

    const handleCheckout = async () => {
        if(cart.length === 0) return;
        setSubmitting(true);
        try {
            await api.post('/api/orders', {
                customerName: 'Cliente via Web (SPA)',
                customerPhone: '11999999999',
                customerAddress: 'Rua das Pizzas, 1000',
                total: cartTotal,
                items: cart
            });
            alert('Pedido enviado com sucesso para a Cozinha!');
            clearCart();
            setIsCartOpen(false);
        } catch(e) {
            console.error(e);
            alert('Erro ao processar pedido. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Drawer */}
            <div id="cart-drawer" className={`cart-drawer ${isCartOpen ? 'active' : ''}`}>
                <div className="cart-header">
                    <h3>Seu Pedido</h3>
                    <button onClick={() => setIsCartOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div className="progress-indicator">
                    <p className="frete-text">
                        {missingFrete > 0 ? `Adicione mais R$ ${missingFrete.toFixed(2)} para frete grátis` : 'Parabéns! Você ganhou frete grátis.'}
                    </p>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart-msg">Seu carrinho está vazio.</div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} className="cart-item">
                                <div className="ci-info">
                                    <h4>{item.qty}x {item.productName}</h4>
                                    <p>R$ {(item.price * item.qty).toFixed(2)}</p>
                                </div>
                                <button className="remove-item" onClick={() => removeFromCart(idx)}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="cart-total">
                        <span>Total</span>
                        <strong>R$ {cartTotal.toFixed(2)}</strong>
                    </div>
                    <button 
                        className="btn btn-primary w-100" 
                        onClick={handleCheckout} 
                        disabled={submitting || cart.length === 0}
                    >
                        {submitting ? 'Enviando Pedido...' : 'Finalizar Compra'}
                    </button>
                </div>
            </div>

            {/* Mobile Float Icon */}
            <button id="mobile-cart-btn" className="mobile-cart-btn" onClick={() => setIsCartOpen(true)} style={{ display: cart.length > 0 ? 'flex' : 'none' }}>
                <div className="mcb-left">
                    <i className="fa-solid fa-cart-shopping"></i> <span className="badge">{cart.reduce((a,c) => a + c.qty, 0)}</span>
                </div>
                <div className="mcb-right">Ver Carrinho &rarr;</div>
            </button>
        </>
    );
}
