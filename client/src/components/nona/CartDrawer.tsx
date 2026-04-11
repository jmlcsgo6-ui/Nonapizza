import React, { useState } from 'react';
import api from '../../api/api';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [loading, setLoading] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<number | null>(null);
    const navigate = useNavigate();

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
            const res = await api.post('/api/orders', {
                items: cart,
                address,
                paymentMethod,
                total: cartTotal
            }, {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            setLastOrderId(res.data.id);
            clearCart();
            setCheckoutStep('success');
        } catch(e) {
            console.error(e);
            alert('Erro ao realizar pedido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const closeAndReset = () => {
        setIsCartOpen(false);
        setTimeout(() => {
            setCheckoutStep('cart');
        }, 300);
    };

    return (
        <>
            <AnimatePresence>
                {isCartOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="drawer-overlay"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1999 }} 
                        onClick={closeAndReset} 
                    />
                )}
            </AnimatePresence>

            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {checkoutStep === 'success' ? 'Pedido Confirmado' : 'Carrinho de Compras'}
                    </h3>
                    <button id="close-cart" onClick={closeAndReset}><X size={24} /></button>
                </div>

                <div className="drawer-body custom-scrollbar">
                    {checkoutStep === 'cart' && (
                        <div className="cart-flow">
                            <div className="cart-items">
                                {cart.length === 0 ? (
                                    <div className="empty-cart-msg">
                                        <Package size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
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

                            {cart.length > 0 && (
                                <div className="cart-footer">
                                    <div className="cart-total">
                                        <span>Subtotal</span>
                                        <span style={{ color: '#ff5e00', fontWeight: 900, fontSize: '1.3rem' }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button className="btn btn-primary w-100 btn-large" onClick={() => setCheckoutStep('checkout')}>
                                        Finalizar Compra <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {checkoutStep === 'checkout' && (
                        <div className="checkout-flow">
                            <h4 className="flow-subtitle">Dados da Entrega</h4>
                            <div className="form-group">
                                <label>Endereço completo</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Rua, número, bairro..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Método de Pagamento</label>
                                <div className="payment-options">
                                    {['pix', 'cartao', 'dinheiro'].map(m => (
                                        <button 
                                            key={m}
                                            className={`tab-btn ${paymentMethod === m ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod(m)}
                                        >
                                            {m === 'pix' ? 'PIX' : m === 'cartao' ? 'Cartão' : 'Dinheiro'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="checkout-footer">
                                <div className="checkout-total-row">
                                    <span>Total a Pagar</span>
                                    <span style={{ color: '#ff5e00', fontWeight: 900, fontSize: '1.5rem' }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="cta-row">
                                    <button className="btn btn-secondary" onClick={() => setCheckoutStep('cart')}>Voltar</button>
                                    <button className="btn btn-primary" style={{ flex: 1 }} disabled={loading} onClick={handleCheckout}>
                                        {loading ? 'Confirmando...' : 'Confirmar Pedido'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {checkoutStep === 'success' && (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="success-flow"
                            style={{ textAlign: 'center', padding: '3rem 1rem' }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                style={{ color: '#4cd964', marginBottom: '2rem' }}
                            >
                                <CheckCircle size={80} style={{ margin: '0 auto' }} />
                            </motion.div>
                            
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>Sua pizza está a caminho!</h2>
                            <p style={{ color: '#b0b0b0', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                                O pedido <strong>#{lastOrderId?.toString().padStart(4, '0')}</strong> foi recebido com sucesso e já está sendo preparado.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button className="btn btn-primary w-100" onClick={() => {
                                    setIsCartOpen(false);
                                    navigate('/meu-pedido', { state: { focusOrderId: lastOrderId } });
                                }}>
                                    Acompanhar Pedido
                                </button>
                                <button className="btn btn-secondary w-100" onClick={closeAndReset}>
                                    Continuar Navegando
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
