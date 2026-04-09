import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('cart'); // 'cart' | 'form'
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

    const handleCheckout = async () => {
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
            const res = await api.post('/api/orders', {
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
            
            clearCart();
            alert(`Pedido finalizado! Protocolo #${res.data.id}`);
            setIsCartOpen(false);
            setStep('cart');
            navigate('/meu-pedido');
        } catch(e) {
            console.error(e);
            alert('Erro ao processar pedido.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsCartOpen(false);
        setStep('cart');
    };

    return (
        <>
            <div id="cart-drawer" className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3>{step === 'cart' ? 'Seu Pedido' : 'Finalizar Pedido'}</h3>
                    <button id="close-cart" onClick={handleClose}><i className="fa-solid fa-xmark"></i></button>
                </div>

                {step === 'cart' ? (
                    <>
                        <div className="progress-indicator">
                            <p id="frete-text" className="frete-text">
                                {cartTotal < 100 ? `Adicione mais R$ ${(100 - cartTotal).toFixed(2)} para frete grátis` : 'Você ganhou frete grátis!'}
                            </p>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${Math.min(100, (cartTotal / 100) * 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="cart-items" id="cart-items-container" style={{ flex: 1, overflowY: 'auto' }}>
                            {cart.length === 0 ? (
                                <div className="empty-cart-msg">Seu carrinho está vazio.</div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="cart-item" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4 style={{ fontWeight: 'bold' }}>{item.productName} (x{item.qty})</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{item.desc}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ display: 'block', fontWeight: 'bold', color: 'var(--primary)' }}>R$ {(item.price * item.qty).toFixed(2)}</span>
                                            <button onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.8rem', marginTop: '10px' }}>Remover</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total</span>
                                <strong id="cart-total-price">R$ {cartTotal.toFixed(2)}</strong>
                            </div>
                            <button 
                                id="checkout-btn" 
                                className="btn btn-primary w-100"
                                onClick={() => {
                                    if(cart.length > 0){
                                        if(!customerToken) { setIsCartOpen(false); navigate('/login'); }
                                        else { setStep('form'); }
                                    }
                                }}
                                disabled={cart.length === 0}
                            >
                                Finalizar Compra
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                          <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }}>
                              <div className="form-group" style={{ marginBottom: '1rem' }}>
                                  <input type="text" className="form-input" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} placeholder="Nome Completo" disabled value={customerName || ''}/>
                              </div>
                              <div className="form-group" style={{ marginBottom: '1rem' }}>
                                  <input type="text" className="form-input" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Telefone" required />
                              </div>
                              <div className="form-group" style={{ marginBottom: '1rem' }}>
                                  <input type="text" className="form-input" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} placeholder="CEP" required />
                              </div>
                              <div className="form-group" style={{ marginBottom: '1rem' }}>
                                  <input type="text" className="form-input" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Endereço (Rua, Nº, Bairro)" required />
                              </div>
                              <div className="form-group" style={{ marginBottom: '1rem' }}>
                                  <select className="form-input" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} value={form.payment} onChange={e => setForm({...form, payment: e.target.value})} required>
                                      <option value="pix">PIX</option>
                                      <option value="credit">Cartão de Crédito</option>
                                      <option value="cash">Dinheiro</option>
                                  </select>
                              </div>
                              
                              <div className="checkout-summary" style={{ marginTop: '2rem' }}>
                                  <p style={{color: 'var(--text-muted)'}}>Tempo estimado: <strong style={{color: '#fff'}}>~50 min</strong></p>
                                  <h4 style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Total: R$ {cartTotal.toFixed(2)}</h4>
                              </div>

                              <button type="submit" disabled={submitting} className="btn btn-primary btn-checkout hover-scale" style={{ marginTop: '1.5rem', width: '100%' }}>
                                  {submitting ? 'Processando...' : 'Confirmar Pedido'}
                              </button>
                              
                              <button type="button" onClick={() => setStep('cart')} className="btn btn-secondary mt-2" style={{ marginTop: '1rem', width: '100%' }}>Voltar</button>
                          </form>
                    </div>
                )}
            </div>
            
            {/* Overlay */}
            {isCartOpen && <div className="modal-overlay active" onClick={handleClose} style={{ zIndex: 1999, background: 'rgba(0,0,0,0.8)' }}></div>}
        </>
    );
}
