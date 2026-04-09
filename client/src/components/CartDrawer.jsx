import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('cart'); // 'cart' | 'form' | 'success'
    const [form, setForm] = useState({ address: '', payment: 'Dinheiro' });
    const [placedOrder, setPlacedOrder] = useState(null);
    const navigate = useNavigate();

    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');

    const missingFrete = Math.max(0, 100 - cartTotal);
    const progressPercent = Math.min(100, (cartTotal / 100) * 100);

    const handleCheckout = async () => {
        if (!customerToken) {
            setIsCartOpen(false);
            navigate('/login');
            return;
        }

        if (step === 'cart') {
            setStep('form');
            return;
        }

        if (!form.address.trim()) {
            alert('Por favor, informe o endereço de entrega ou digite "Retirada".');
            return;
        }

        setSubmitting(true);
        try {
            // Decode token safely or just send it (backend will verify)
            const res = await api.post('/api/orders', {
                customerName: customerName,
                address: form.address,
                payment: form.payment,
                total: cartTotal,
                items: cart,
                // The backend can extract userId from token if we use the middleware, 
                // but let's simplify and send it if we had it. 
                // Better: Backend should extract from JWT for security.
            }, {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            
            setPlacedOrder(res.data);
            clearCart();
            setStep('success');
        } catch(e) {
            console.error(e);
            alert('Erro ao processar pedido. Sua sessão pode ter expirado.');
            localStorage.removeItem('customer_token');
            navigate('/login');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsCartOpen(false);
        setStep('cart');
        setForm({ address: '', payment: 'Dinheiro' });
    };

    const inputStyle = {
        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.93rem', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '0.75rem'
    };

    return (
        <>
            <div id="cart-drawer" className={`cart-drawer ${isCartOpen ? 'active' : ''}`}>
                <div className="cart-header">
                    <h3>{step === 'form' ? 'Finalizar Pedido' : step === 'success' ? 'Pedido Confirmado!' : 'Seu Pedido'}</h3>
                    <button onClick={handleClose}><i className="fa-solid fa-xmark"></i></button>
                </div>

                {/* STEP: Cart */}
                {step === 'cart' && (
                    <>
                        <div className="progress-indicator">
                            <p className="frete-text" style={{ fontSize: '0.85rem' }}>
                                {customerName ? `Olá, ${customerName}!` : 'Olá! Faça login para finalizar.'}
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
                                disabled={cart.length === 0}
                            >
                                {!customerToken ? 'Fazer Login para Comprar' : 'Continuar para Entrega →'}
                            </button>
                        </div>
                    </>
                )}

                {/* STEP: Form */}
                {step === 'form' && (
                    <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                        <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: '1.25rem', padding: 0, fontSize: '0.9rem' }}>
                            ← Voltar ao carrinho
                        </button>

                        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Cliente Logado</p>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{customerName}</p>
                        </div>

                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Endereço de Entrega *</label>
                        <input style={inputStyle} placeholder="Rua..., Nº, Bairro" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />

                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Forma de Pagamento</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            {['Dinheiro','Cartão','Pix'].map(m => (
                                <button key={m} onClick={() => setForm(f => ({...f, payment: m}))} style={{
                                    padding: '0.5rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                    background: form.payment === m ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.08)',
                                    color: form.payment === m ? '#fff' : 'rgba(255,255,255,0.6)',
                                }}>{m}</button>
                            ))}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                                <span>Total Final</span>
                                <span style={{ color: 'var(--primary, #e07b39)' }}>R$ {cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="btn btn-primary w-100" onClick={handleCheckout} disabled={submitting}>
                            {submitting ? 'Confirmando...' : '🔥 Finalizar Pedido'}
                        </button>
                    </div>
                )}

                {/* STEP: Success */}
                {step === 'success' && placedOrder && (
                    <div style={{ padding: '2rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '3.5rem' }}>🍕</div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Sucesso!</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>Seu pedido está sendo preparado.</p>
                        <div style={{ background: 'var(--primary, #e07b39)', color: '#fff', borderRadius: '12px', padding: '0.75rem 2rem', fontSize: '1.8rem', fontWeight: 900 }}>
                            #{placedOrder.id}
                        </div>
                        <button className="btn btn-primary w-100" onClick={() => navigate('/meu-pedido')}>
                            Ver Status em Tempo Real →
                        </button>
                    </div>
                )}
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
