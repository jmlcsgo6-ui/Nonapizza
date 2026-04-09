import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('cart'); // 'cart' | 'form' | 'success'
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
            
            // Artificial delay for cinematic effect
            await new Promise(r => setTimeout(r, 2000));
            
            clearCart();
            setStep('success');
        } catch(e) {
            console.error(e);
            alert('Erro ao processar pedido.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsCartOpen(false);
        if (step !== 'success') setStep('cart');
    };

    const inputStyle = "w-full bg-black border border-white/10 p-4 text-[11px] text-white focus:border-primary outline-none transition-all placeholder:text-white/5 uppercase font-mono tracking-widest";

    return (
        <>
            <div id="cart-drawer" className={`cart-drawer font-mono ${isCartOpen ? 'open' : ''}`} style={{ borderRadius: 0 }}>
                <div className="cart-header border-b border-white/10 h-[80px] px-8 flex justify-between items-center bg-black">
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-6 bg-primary"></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">{step === 'cart' ? 'ACTIVE_CART' : step === 'form' ? 'CHECKOUT_PROTOCOL' : 'TRANSMission_SUCCESS'}</h3>
                    </div>
                    <button id="close-cart" onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'cart' && (
                        <motion.div 
                            key="step-cart"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full"
                        >
                            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                                <p id="frete-text" className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">
                                    {cartTotal < 100 ? `REMAINING_FOR_FREE_SHIPPING: R$ ${(100 - cartTotal).toFixed(2)}` : 'ESTATUS: FREE_SHIPPING_GRANTED'}
                                </p>
                                <div className="h-1 bg-white/5 w-full">
                                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(100, (cartTotal / 100) * 100)}%` }}></div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                                        <i className="fa-solid fa-box-open text-4xl mb-4"></i>
                                        <p className="text-[10px] font-black uppercase tracking-widest">DRIVE_EMPTY</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {cart.map((item, idx) => (
                                            <div key={idx} className="p-8 hover:bg-white/[0.02] transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-white">{item.productName}</h4>
                                                        <span className="text-[9px] font-bold text-primary mt-1 block">X{item.qty.toString().padStart(2, '0')}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-white italic tracking-tighter">R$ {(item.price * item.qty).toFixed(2)}</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-white/20 uppercase leading-relaxed mb-6">{item.desc || item.segments?.join(' | ') || 'NO_DETAILS'}</p>
                                                <button onClick={() => removeFromCart(idx)} className="text-[8px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2">
                                                    <i className="fa-solid fa-trash-can"></i> REMOVE_UNIT
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-black border-t border-white/10">
                                <div className="flex justify-between items-end mb-8">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] leading-none mb-1">TOTAL_CALCULATED</span>
                                        <strong className="text-3xl font-black italic tracking-tighter">R$ {cartTotal.toFixed(2)}</strong>
                                    </div>
                                </div>
                                <button 
                                    id="checkout-btn" 
                                    className="w-full bg-primary py-5 text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-white transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                                    onClick={() => {
                                        if(cart.length > 0){
                                            if(!customerToken) { setIsCartOpen(false); navigate('/login'); }
                                            else { setStep('form'); }
                                        }
                                    }}
                                    disabled={cart.length === 0}
                                >
                                    EXECUTE_CHECKOUT <i className="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'form' && (
                        <motion.div 
                            key="step-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 flex-1 overflow-y-auto custom-scrollbar h-full flex flex-col"
                        >
                              <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }} className="space-y-6 flex-1 flex flex-col">
                                  <div className="space-y-6 flex-1">
                                      <div className="space-y-4">
                                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">RECIPIENT_IDENTITY</label>
                                          <input type="text" className={inputStyle + " opacity-50 cursor-not-allowed"} value={customerName || ''} disabled />
                                      </div>

                                      <div className="space-y-4">
                                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">COMMUNICATION_LINE</label>
                                          <input type="text" className={inputStyle} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="PHONE_NUMBER" required />
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-4">
                                              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">POSTAL_CODE</label>
                                              <input type="text" className={inputStyle} value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} placeholder="CEP" required />
                                          </div>
                                          <div className="space-y-4">
                                              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">PAYMENT_METHOD</label>
                                              <select className={inputStyle} value={form.payment} onChange={e => setForm({...form, payment: e.target.value})} required>
                                                  <option value="pix">PIX_TRANSFER</option>
                                                  <option value="credit">CREDIT_VAL</option>
                                                  <option value="cash">FIAT_CURRENCY</option>
                                              </select>
                                          </div>
                                      </div>

                                      <div className="space-y-4">
                                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">GEO_LOCATION_COORDINATES</label>
                                          <input type="text" className={inputStyle} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="FULL_ADDRESS" required />
                                      </div>
                                      
                                      <div className="bg-white/[0.02] border border-white/5 p-6 mt-6">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">EST_PROCD_TIME</span>
                                              <span className="text-xs font-black text-white">~50_MIN</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">FINAL_QUOTATION</span>
                                              <span className="text-xl font-black text-primary italic tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="pt-8 space-y-4">
                                      <button type="submit" disabled={submitting} className="w-full bg-primary py-5 text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-white transition-all disabled:opacity-20 flex items-center justify-center gap-3 relative overflow-hidden group">
                                          {submitting ? (
                                              <span className="flex items-center gap-3">
                                                  <i className="fa-solid fa-spinner animate-spin"></i>
                                                  SYNCHRONIZING_PROTOCOL...
                                              </span>
                                          ) : (
                                              <>CONFIRM_TRANSACTION <i className="fa-solid fa-lock"></i></>
                                          )}
                                          {submitting && <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-white/20" />}
                                      </button>
                                      
                                      <button type="button" onClick={() => setStep('cart')} className="w-full py-4 text-[9px] font-black text-white/20 hover:text-white uppercase tracking-[0.3em] transition-all">ABORT_AND_RETURN</button>
                                  </div>
                              </form>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div 
                            key="step-success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-12 flex-1 flex flex-col items-center justify-center text-center h-full"
                        >
                            <motion.div 
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="w-32 h-32 border-2 border-primary flex items-center justify-center text-primary mb-12 relative"
                            >
                                <i className="fa-solid fa-check text-5xl"></i>
                                <motion.div 
                                    animate={{ 
                                        opacity: [0.2, 0.5, 0.2],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 border-4 border-primary/20 scale-125"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h4 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">ORDER_COMMITTED</h4>
                                <p className="text-[11px] font-bold text-primary uppercase tracking-[0.4em] mb-12">ALCHEMY_IN_PROGRESS // NODE_TRANSFER_STABLE</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.6, duration: 1 }}
                                className="w-full space-y-4 mb-20 px-8"
                            >
                                <div className="h-[2px] bg-white/5 w-full relative">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: 1, duration: 2 }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em]">
                                    <span className="text-white/20">PREPARATION_PHASE</span>
                                    <span className="text-primary animate-pulse">KITCHEN_OVEN_ACTIVE</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="w-full space-y-4"
                            >
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8 max-w-[300px] mx-auto leading-relaxed">
                                    SEU PEDIDO JÁ ESTÁ SENDO PREPARADO PELA NOSSA ALQUIMIA. ACOMPANHE CADA FASE EM TEMPO REAL.
                                </p>
                                
                                <button 
                                    className="w-full bg-primary py-6 text-black font-black text-xs uppercase tracking-[0.5em] hover:bg-white transition-all flex items-center justify-center gap-4 group"
                                    onClick={() => { 
                                        setIsCartOpen(false); 
                                        setStep('cart'); 
                                        navigate('/meu-pedido'); 
                                    }}
                                >
                                    ACCESS_TRACKING_SYSTEM <i className="fa-solid fa-satellite-dish group-hover:rotate-12 transition-transform"></i>
                                </button>
                                
                                <p className="text-[7px] font-black text-white/10 uppercase tracking-[0.5em] pt-8">
                                    SYSTEM_LOG: TRACE_ID_{Math.random().toString(36).substr(2, 9).toUpperCase()}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Overlay Sharp */}
            {isCartOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay active" 
                    onClick={handleClose} 
                    style={{ zIndex: 1999, background: 'rgba(0,0,0,0.95)' }} 
                />
            )}
        </>
    );
}

