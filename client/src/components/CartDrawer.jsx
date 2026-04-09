import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/api';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('cart'); // 'cart' | 'form' | 'success'
    const [form, setForm] = useState({ name: '', phone: '', address: '', payment: 'Dinheiro' });
    const [placedOrder, setPlacedOrder] = useState(null);

    const missingFrete = Math.max(0, 100 - cartTotal);
    const progressPercent = Math.min(100, (cartTotal / 100) * 100);

    const handleCheckout = async () => {
        if (!form.name.trim() || !form.phone.trim()) {
            alert('Por favor, preencha seu nome e telefone.');
            return;
        }
        setSubmitting(true);
        try {
            const cleanPhone = form.phone.replace(/\D/g, '');
            const res = await api.post('/api/orders', {
                customerName: form.name,
                phone: cleanPhone,
                address: form.address || 'Retirada no local',
                payment: form.payment,
                total: cartTotal,
                items: cart
            });
            // Save to localStorage for auto-load on tracking page
            localStorage.setItem('nona_last_order', JSON.stringify({ id: res.data.id, phone: cleanPhone }));
            setPlacedOrder(res.data);
            clearCart();
            setStep('success');
        } catch(e) {
            console.error(e);
            alert('Erro ao processar pedido. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsCartOpen(false);
        setStep('cart');
        setForm({ name: '', phone: '', address: '', payment: 'Dinheiro' });
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
                                onClick={() => setStep('form')}
                                disabled={cart.length === 0}
                            >
                                Ir para o Checkout →
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

                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seu Nome *</label>
                        <input style={inputStyle} placeholder="João Silva" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />

                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Telefone (WhatsApp) *</label>
                        <input style={inputStyle} type="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                            Use para acompanhar o pedido em /meu-pedido
                        </p>

                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Endereço de Entrega</label>
                        <input style={inputStyle} placeholder="Rua..., Nº, Bairro (ou vazio p/ retirada)" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />

                        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Forma de Pagamento</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            {['Dinheiro','Cartão Crédito','Cartão Débito','Pix'].map(m => (
                                <button key={m} onClick={() => setForm(f => ({...f, payment: m}))} style={{
                                    padding: '0.5rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                    background: form.payment === m ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.08)',
                                    color: form.payment === m ? '#fff' : 'rgba(255,255,255,0.6)',
                                }}>{m}</button>
                            ))}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                                <span>{cart.reduce((a,c) => a + c.qty, 0)} item(ns)</span>
                                <span>R$ {cartTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary, #e07b39)' }}>R$ {cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="btn btn-primary w-100" onClick={handleCheckout} disabled={submitting}>
                            {submitting ? 'Enviando...' : '🍕 Confirmar Pedido'}
                        </button>
                    </div>
                )}

                {/* STEP: Success */}
                {step === 'success' && placedOrder && (
                    <div style={{ padding: '2rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '3.5rem' }}>🎉</div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Pedido Confirmado!</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>Número do seu pedido:</p>
                        <div style={{ background: 'var(--primary, #e07b39)', color: '#fff', borderRadius: '12px', padding: '0.75rem 2rem', fontSize: '1.8rem', fontWeight: 900 }}>
                            #{placedOrder.id}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                            Acompanhe o status em tempo real em:<br/>
                            <a href="/meu-pedido" style={{ color: 'var(--primary, #e07b39)', fontWeight: 700 }}>/meu-pedido</a>
                        </p>
                        <button className="btn btn-primary w-100" onClick={() => window.location.href = '/meu-pedido'}>
                            Acompanhar Pedido →
                        </button>
                        <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}>
                            Fechar
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
