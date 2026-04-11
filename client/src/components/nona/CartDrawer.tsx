import React, { useState } from 'react';
import api from '../../api/api';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        const customerToken = localStorage.getItem('customer_token');
        if (!customerToken) {
            alert('Faça login para finalizar o pedido.');
            return;
        }
        if (!address.trim()) {
            alert('Informe o endereço de entrega.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/orders', {
                items: cart,
                address,
                paymentMethod,
                total: cartTotal
            }, {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            clearCart();
            setCheckoutStep('cart');
            setIsCartOpen(false);
            alert('Pedido realizado com sucesso!');
        } catch(e) {
            console.error(e);
            alert('Erro ao realizar pedido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {isCartOpen && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }} onClick={() => setIsCartOpen(false)} />}
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}><i className="fa-solid fa-cart-shopping" style={{ marginRight: '10px' }}></i> Carrinho</h3>
                    <button id="close-cart" onClick={() => setIsCartOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>

                {checkoutStep === 'cart' ? (
                    <>
                        <div className="cart-items">
                            {cart.length === 0 ? (
                                <div className="empty-cart-msg">
                                    <p>Seu carrinho está vazio.</p>
                                </div>
                            ) : (
                                cart.map((item, i) => (
                                    <div key={i} className="cart-item">
                                        <div className="ci-info">
                                            <h5>{item.productName}</h5>
                                            {item.segments && <p>{item.segments.join(', ')}</p>}
                                            <span className="ci-price">R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                        <button className="ci-remove" onClick={() => removeFromCart(i)}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total</span>
                                <span style={{ color: '#ff5e00', fontWeight: 800 }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <button className="btn btn-primary w-100" disabled={cart.length === 0} onClick={() => setCheckoutStep('checkout')}>
                                Finalizar Pedido
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="checkout-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, padding: '0 0 1rem' }}>
                            <h4 style={{ marginBottom: '1.5rem' }}>Dados da Entrega</h4>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b0b0b0' }}>Endereço completo</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Rua, número, bairro..."
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b0b0b0' }}>Pagamento</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['pix', 'cartao', 'dinheiro'].map(m => (
                                        <button 
                                            key={m}
                                            className={`tab-btn ${paymentMethod === m ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod(m)}
                                            style={{ flex: 1, fontSize: '0.85rem' }}
                                        >
                                            {m === 'pix' ? 'PIX' : m === 'cartao' ? 'Cartão' : 'Dinheiro'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="checkout-footer">
                            <div className="checkout-total-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', marginBottom: '1rem' }}>
                                <span>Total</span>
                                <span style={{ color: '#ff5e00', fontWeight: 800 }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" onClick={() => setCheckoutStep('cart')}>Voltar</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} disabled={loading} onClick={handleCheckout}>
                                    {loading ? 'Enviando...' : 'Confirmar Pedido'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
