import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [view, setView] = useState('cart'); // 'cart' | 'checkout'
    const [successOrder, setSuccessOrder] = useState(null);
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

        const payload = {
            customerName: customerName || 'Cliente Nona',
            phone: form.phone,
            address: form.address,
            cep: form.cep,
            reference: form.reference,
            payment: form.payment,
            total: cartTotal,
            items: cart.map(i => ({
                productName: i.productName,
                price: Number(i.price),
                qty: Number(i.qty),
                obs: i.obs || '',
                desc: i.segments ? i.segments.join(' • ') : ''
            })),
        };

        setSubmitting(true);
        try {
            const { data } = await api.post('/api/orders', payload, {
                headers: { Authorization: `Bearer ${customerToken}` }
            });

            clearCart();
            setView('cart');
            setIsCartOpen(false);
            setSuccessOrder({
                id: data.id,
                total: data.total,
            });
        } catch(err) {
            console.error('Checkout Error:', err.response?.data || err.message);
            alert('Erro ao processar pedido: ' + (err.response?.data?.error || 'Erro interno do servidor.'));
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
                    <h3>{view === 'checkout' ? 'Checkout' : 'Seu Carrinho'}</h3>
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

            </div>

            {isCartOpen && (
                <div
                    className="modal-overlay"
                    style={{ zIndex: 1900, opacity: 1, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            <AnimatePresence mode="wait">
                {successOrder && (
                    <motion.div
                        key="order-success-dialog"
                        className="order-success-layer"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 5500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.25rem',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                    >
                        <motion.div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.82)',
                                backdropFilter: 'blur(14px)',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSuccessOrder(null)}
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="order-success-title"
                            style={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '440px',
                                borderRadius: '20px',
                                padding: '2.25rem 1.85rem 2rem',
                                background: 'linear-gradient(145deg, rgba(22,22,22,0.98) 0%, #0a0a0a 100%)',
                                border: '1px solid rgba(255,102,0,0.35)',
                                boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 24px 80px rgba(0,0,0,0.65), 0 0 60px rgba(255,102,0,0.12)',
                                overflow: 'hidden',
                            }}
                            initial={{ opacity: 0, scale: 0.86, y: 44 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.2 } }}
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                aria-hidden
                                style={{
                                    position: 'absolute',
                                    top: '-40%',
                                    left: '50%',
                                    width: '120%',
                                    height: '80%',
                                    transform: 'translateX(-50%)',
                                    background: 'radial-gradient(ellipse at center, rgba(255,102,0,0.22) 0%, transparent 65%)',
                                    pointerEvents: 'none',
                                }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.05, duration: 0.5 }}
                            />
                            <motion.div
                                initial={{ scale: 0, rotate: -25 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                                style={{
                                    fontSize: '4.25rem',
                                    color: '#4cd964',
                                    textAlign: 'center',
                                    marginBottom: '1.25rem',
                                    filter: 'drop-shadow(0 0 20px rgba(76,217,100,0.45))',
                                }}
                            >
                                <i className="fa-solid fa-circle-check" />
                            </motion.div>
                            <motion.h3
                                id="order-success-title"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 28 }}
                                style={{
                                    fontSize: '1.65rem',
                                    fontWeight: 800,
                                    textAlign: 'center',
                                    marginBottom: '0.65rem',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Pedido confirmado!
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    color: 'var(--text-muted)',
                                    textAlign: 'center',
                                    fontSize: '0.98rem',
                                    lineHeight: 1.55,
                                    marginBottom: '1.5rem',
                                }}
                            >
                                Recebemos seu pedido{' '}
                                <strong style={{ color: 'var(--primary)' }}>
                                    #{String(successOrder.id).padStart(4, '0')}
                                </strong>
                                . Em instantes começamos o preparo — acompanhe o status quando quiser.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.28 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '1.75rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {['Recebido', 'Preparo', 'Entrega'].map((label, i) => (
                                    <motion.span
                                        key={label}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.32 + i * 0.08 }}
                                        style={{
                                            fontSize: '0.72rem',
                                            letterSpacing: '0.12em',
                                            textTransform: 'uppercase',
                                            padding: '0.45rem 0.75rem',
                                            borderRadius: '999px',
                                            background: i === 0 ? 'rgba(255,102,0,0.2)' : 'rgba(255,255,255,0.06)',
                                            border: `1px solid ${i === 0 ? 'rgba(255,102,0,0.45)' : 'rgba(255,255,255,0.08)'}`,
                                            color: i === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.45)',
                                        }}
                                    >
                                        {label}
                                    </motion.span>
                                ))}
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.42, type: 'spring', stiffness: 280, damping: 26 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                            >
                                <motion.button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '1rem 1.25rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 28px rgba(255,102,0,0.35)',
                                    }}
                                    onClick={() => {
                                        const id = successOrder.id;
                                        setSuccessOrder(null);
                                        navigate('/meu-pedido', { state: { focusOrderId: id } });
                                    }}
                                >
                                    <i className="fa-solid fa-location-dot" /> Rastrear pedido
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="btn-text w-100"
                                    whileHover={{ opacity: 1 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '0.85rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        fontSize: '0.82rem',
                                        opacity: 0.85,
                                    }}
                                    onClick={() => setSuccessOrder(null)}
                                >
                                    Continuar
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}



