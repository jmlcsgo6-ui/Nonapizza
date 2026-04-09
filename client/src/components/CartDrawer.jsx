import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [view, setView] = useState('cart'); // 'cart' | 'checkout' | 'success'
    const [form, setForm] = useState({ 
        address: '', 
        phone: localStorage.getItem('customer_phone') || '',
        cep: '',
        reference: '',
        payment: 'pix' 
    });
    
    const navigate = useNavigate();
    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');

    const handleCheckout = async (e) => {
        if (e) e.preventDefault();
        if (!customerToken) {
            setIsCartOpen(false);
            navigate('/login');
            return;
        }

        if (!form.phone.trim() || !form.address.trim() || !form.cep.trim()) {
            alert('Por favor, preencha telefone, endereço e CEP para a entrega.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/api/orders', {
                customerName: customerName,
                phone: form.phone,
                address: form.address,
                cep: form.cep,
                reference: form.reference,
                payment: form.payment,
                total: cartTotal,
                items: cart,
            }, {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            
            setView('success');
            setTimeout(() => {
                clearCart();
                setIsCartOpen(false);
                setTimeout(() => setView('cart'), 500);
            }, 3500);
        } catch(e) {
            console.error(e);
            alert('Erro ao processar pedido.');
        } finally {
            setSubmitting(false);
        }
    };

    const FRETE_GRATIS_TARGET = 150.00;
    const diff = Math.max(0, FRETE_GRATIS_TARGET - cartTotal);
    const pct = Math.min(100, (cartTotal / FRETE_GRATIS_TARGET) * 100);

    return (
        <>
            <div id="cart-drawer" className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3>{view === 'success' ? 'Pedido Confirmado' : view === 'checkout' ? 'Checkout' : 'Seu Carrinho'}</h3>
                    <button id="close-cart" onClick={() => setIsCartOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>

                {view === 'cart' && (
                    <>
                        <div className="progress-indicator">
                            <div className="frete-text" id="frete-text" style={{ color: cartTotal >= FRETE_GRATIS_TARGET ? '#4cd964' : 'var(--primary)' }}>
                                {cartTotal >= FRETE_GRATIS_TARGET ? 'Você ganhou frete grátis! 🎉' : `Faltam R$ ${diff.toFixed(2).replace('.', ',')} para frete grátis`}
                            </div>
                            <div className="progress-bar-bg">
                                <div id="frete-progress" className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                            </div>
                        </div>

                        <div className="cart-items" id="cart-items-container">
                            {cart.length === 0 ? (
                                <div className="empty-cart-msg">Seu carrinho está vazio.</div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="cart-item">
                                        <div className="ci-info">
                                            <h5>{item.qty}x {item.productName}</h5>
                                            {item.obs && <p>Obs: {item.obs}</p>}
                                            {item.segments && <p style={{ fontSize: '0.7rem' }}>{item.segments.join(' • ')}</p>}
                                            <div className="ci-price">R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</div>
                                        </div>
                                        <button className="ci-remove" onClick={() => removeFromCart(idx)}><i className="fa-solid fa-trash"></i></button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total</span>
                                <span id="cart-total-price">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <button 
                                id="checkout-btn" 
                                className="btn btn-primary w-100" 
                                disabled={cart.length === 0}
                                onClick={() => setView('checkout')}
                            >
                                Finalizar Pedido &rarr;
                            </button>
                        </div>
                    </>
                )}

                {view === 'checkout' && (
                    <div style={{ padding: '2rem', height: 'calc(100% - 70px)', overflowY: 'auto' }}>
                        <form id="checkout-form" onSubmit={handleCheckout}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Telefone</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={form.phone} 
                                    onChange={e => setForm({...form, phone: e.target.value})} 
                                    placeholder="(00) 00000-0000" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>CEP</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={form.cep} 
                                    onChange={e => setForm({...form, cep: e.target.value})} 
                                    placeholder="00000-000" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Endereço Completo</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={form.address} 
                                    onChange={e => setForm({...form, address: e.target.value})} 
                                    placeholder="Rua, número, complemento..." 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Pagamento</label>
                                <select 
                                    className="form-input" 
                                    value={form.payment} 
                                    onChange={e => setForm({...form, payment: e.target.value})}
                                >
                                    <option value="pix">PIX</option>
                                    <option value="credit">Cartão</option>
                                    <option value="cash">Dinheiro</option>
                                </select>
                            </div>
                            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                                    {submitting ? 'Processando...' : 'Confirmar Pedido'}
                                </button>
                                <button type="button" className="btn-text w-100 mt-2" onClick={() => setView('cart')}>Voltar ao Carrinho</button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'success' && (
                    <div id="order-success-fx" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <div className="success-checkmark" style={{ fontSize: '4rem', color: '#4cd964', marginBottom: '1.5rem' }}>
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Pedido Recebido!</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Sua pizza já está sendo preparada em nossa cozinha.</p>
                        <div className="order-timeline">
                            <div className="ot-step active"><i className="fa-solid fa-receipt"></i></div>
                            <div className="ot-line"></div>
                            <div className="ot-step"><i className="fa-solid fa-fire-burner"></i></div>
                            <div className="ot-line"></div>
                            <div className="ot-step"><i className="fa-solid fa-motorcycle"></i></div>
                        </div>
                        <button className="btn btn-primary mt-2 w-100" onClick={() => { setIsCartOpen(false); navigate('/meu-pedido'); }}>Ver Status do Pedido</button>
                    </div>
                )}
            </div>
            
            {isCartOpen && <div className="modal-overlay" style={{ zIndex: 1900, opacity: 1, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setIsCartOpen(false)}></div>}
        </>
    );
}



