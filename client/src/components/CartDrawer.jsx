import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight, CreditCard, Wallet, Apple, Landmark, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function CartDrawer() {
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('cart'); // 'cart' | 'form' | 'success'
    const [form, setForm] = useState({ 
        address: '', 
        phone: localStorage.getItem('customer_phone') || '',
        cep: '',
        reference: '',
        payment: 'Apple Pay' 
    });
    const [placedOrder, setPlacedOrder] = useState(null);
    const navigate = useNavigate();

    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');

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
            
            setPlacedOrder(res.data);
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
        if (step === 'success') {
            setStep('cart');
            setPlacedOrder(null);
        }
    };

    const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/20";

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-deep/80 backdrop-blur-md z-[5500]"
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-card border-l border-white/5 z-[6000] flex flex-col shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-deep/20">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">
                                    {step === 'form' ? 'Checkout' : step === 'success' ? 'Confirmado' : 'Meu Carrinho'}
                                </h3>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{cart.length} ITENS SELECIONADOS</p>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {step === 'cart' && (
                                <div className="p-8 space-y-6">
                                    {cart.length === 0 ? (
                                        <div className="py-20 text-center flex flex-col items-center">
                                            <ShoppingBag size={60} strokeWidth={1} className="text-white/10 mb-6" />
                                            <p className="text-white/40 font-black uppercase tracking-widest text-sm">Seu carrinho está vazio</p>
                                        </div>
                                    ) : (
                                        cart.map((item, idx) => (
                                            <motion.div 
                                                layout
                                                key={idx} 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-black text-white group-hover:text-primary transition-colors italic uppercase tracking-tight">{item.productName}</h4>
                                                        <p className="text-[10px] text-white/40 font-bold uppercase mt-1">{item.qty} UNIDADES</p>
                                                    </div>
                                                    <button onClick={() => removeFromCart(idx)} className="text-white/10 hover:text-red-500 transition-colors p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs font-medium text-white/40 max-w-[70%] leading-relaxed">{item.desc}</span>
                                                    <span className="font-black text-white tracking-tighter">R$ {(item.price * item.qty).toFixed(2)}</span>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}

                                    {cart.length > 0 && (
                                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-white/40">Progresso Frete Grátis</span>
                                                <span className="text-[10px] font-black text-primary">R$ {cartTotal.toFixed(2)} / R$ 100.00</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressPercent}%` }}
                                                    className="h-full bg-primary shadow-[0_0_15px_rgba(255,95,0,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 'form' && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-8 space-y-8"
                                >
                                    <button onClick={() => setStep('cart')} className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/30 hover:text-white transition-colors">
                                        <ChevronLeft size={14} /> VOLTAR AO CARRINHO
                                    </button>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Phone *</label>
                                                <input className={inputStyle} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">CEP *</label>
                                                <input className={inputStyle} value={form.cep} onChange={e => setForm(f => ({...f, cep: e.target.value}))} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Endereço de Entrega *</label>
                                            <input className={inputStyle} value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-4">Pagamento Express</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'Apple Pay', icon: Apple, color: 'bg-white text-black' },
                                                { id: 'Pix', icon: Landmark, color: 'bg-[#32bcad] text-white' },
                                                { id: 'Cartão', icon: CreditCard, color: 'bg-white/5 text-white' },
                                                { id: 'Wallet', icon: Wallet, color: 'bg-white/5 text-white' }
                                            ].map(m => (
                                                <button 
                                                    key={m.id}
                                                    onClick={() => setForm(f => ({...f, payment: m.id}))}
                                                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl transition-all border-2 ${form.payment === m.id ? 'border-primary' : 'border-transparent'} ${m.color}`}
                                                >
                                                    <m.icon size={20} />
                                                    <span className="text-xs font-black uppercase tracking-tighter">{m.id}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'success' && placedOrder && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 h-full flex flex-col items-center justify-center text-center space-y-8"
                                >
                                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
                                        <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Pedido <span className="text-green-500">Confirmado!</span></h2>
                                        <p className="text-white/40 font-medium">Sua alquimia começou. O chef já está no forno.</p>
                                    </div>
                                    <div className="bg-white/5 rounded-3xl p-8 w-full border border-white/10">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Protocolo</span>
                                        <h1 className="text-5xl font-black text-primary italic mt-2">#{placedOrder.id}</h1>
                                    </div>
                                    <button onClick={() => { setIsCartOpen(false); navigate('/meu-pedido'); }} className="btn-premium w-full">ACOMPANHAR AGORA</button>
                                </motion.div>
                            )}
                        </div>

                        {step !== 'success' && cart.length > 0 && (
                            <div className="p-8 bg-deep border-t border-white/5 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total do Pedido</p>
                                        <p className="text-4xl font-black italic tracking-tighter text-white">R$ {cartTotal.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Taxa de entrega</p>
                                        <p className="text-lg font-bold text-white/60">GRÁTIS</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleCheckout} 
                                    disabled={submitting}
                                    className="btn-premium w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-sm"
                                >
                                    {submitting ? 'PROCESSANDO...' : (step === 'cart' ? 'CONTINUAR PARA PAGAMENTO' : 'CONFIRMAR COMPRA')}
                                    <ArrowRight size={20} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
