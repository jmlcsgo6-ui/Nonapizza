import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Truck, MapPin, Phone, CreditCard, ArrowRight, Trash2, CheckCircle2, Clock, MapPinned } from 'lucide-react';

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
        if (step !== 'success') setTimeout(() => setStep('cart'), 500);
    };

    const inputStyle = "w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/10";

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200]"
                        onClick={handleClose}
                    />

                    {/* Drawer */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#080808] border-l border-white/5 z-[210] flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="h-24 px-8 flex justify-between items-center border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                                <div>
                                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
                                        {step === 'cart' ? 'Seu <span className="text-primary italic">Carrinho</span>' : 
                                         step === 'form' ? 'Dados para <span className="text-primary italic">Entrega</span>' : 
                                         'Pedido <span className="text-primary italic">Confirmado</span>'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">
                                        {step === 'cart' ? `Sua seleção (${cart.length} itens)` : 
                                         step === 'form' ? 'Onde entregamos sua pizza?' : 
                                         'Alquimia em andamento'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {step === 'cart' && (
                                    <motion.div 
                                        key="cart-list"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8 space-y-8"
                                    >
                                        {cart.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                                <ShoppingBag size={64} className="mb-6" />
                                                <p className="text-sm font-bold uppercase tracking-[0.4em]">Carrinho Vazio</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {cart.map((item, idx) => (
                                                    <div key={idx} className="group p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-white/10 transition-all">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="text-base font-bold text-white tracking-tight uppercase italic">{item.productName}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs font-black text-primary italic">Qtde {item.qty}</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-lg font-black text-white italic tracking-tight">R$ {(item.price * item.qty).toFixed(2)}</span>
                                                        </div>
                                                        <p className="text-[10px] font-medium text-white/30 leading-relaxed mb-6">
                                                            {item.segments?.join(' • ') || 'Sabor tradicional'}
                                                        </p>
                                                        <button 
                                                            onClick={() => removeFromCart(idx)} 
                                                            className="flex items-center gap-2 text-[10px] font-bold text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors"
                                                        >
                                                            <Trash2 size={12} /> Remover Item
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {step === 'form' && (
                                    <motion.div 
                                        key="checkout-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-8"
                                    >
                                        <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }} className="space-y-8">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Destinatário</label>
                                                    <input type="text" className={inputStyle + " opacity-50 cursor-not-allowed"} value={customerName || ''} disabled />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Telefone para Contato</label>
                                                    <input type="text" className={inputStyle} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(00) 00000-0000" required />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">CEP</label>
                                                        <input type="text" className={inputStyle} value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} placeholder="00000-000" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Pagamento</label>
                                                        <select className={inputStyle + " appearance-none cursor-pointer"} value={form.payment} onChange={e => setForm({...form, payment: e.target.value})} required>
                                                            <option value="pix">PIX Instantâneo</option>
                                                            <option value="credit">Cartão de Crédito</option>
                                                            <option value="cash">Dinheiro</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Endereço Completo</label>
                                                    <input type="text" className={inputStyle} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Rua, número, complemento..." required />
                                                </div>
                                            </div>

                                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4 shadow-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Tempo Estimado</span>
                                                    <span className="text-sm font-black text-white italic tracking-tight flex items-center gap-2">
                                                        <Clock size={14} className="text-primary"/> ~45-60 min
                                                    </span>
                                                </div>
                                                <div className="h-[1px] bg-white/5 w-full"></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Valor Final</span>
                                                    <span className="text-2xl font-black text-primary italic tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {step === 'success' && (
                                    <motion.div 
                                        key="success-message"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col items-center justify-center p-12 text-center space-y-12"
                                    >
                                        <div className="relative">
                                            <motion.div 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                                                className="w-32 h-32 rounded-[40px] bg-primary/10 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_50px_rgba(255,95,0,0.2)]"
                                            >
                                                <CheckCircle2 size={64} />
                                            </motion.div>
                                            <motion.div 
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 border-2 border-primary rounded-[40px]"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Pedido <span className="text-primary italic">Confirmado!</span></h4>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] max-w-[300px] mx-auto leading-relaxed">
                                                Nossa cozinha já recebeu sua ordem. O chef está preparando sua obra de arte.
                                            </p>
                                        </div>

                                        <div className="w-full space-y-6">
                                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary mb-4">
                                                    <span>Status: Preparando</span>
                                                    <span>Progresso: 15%</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full w-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '15%' }}
                                                        className="h-full bg-primary"
                                                    />
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => { 
                                                    handleClose();
                                                    navigate('/meu-pedido'); 
                                                }}
                                                className="w-full h-20 bg-white text-black font-black text-sm uppercase tracking-[0.3em] rounded-[24px] hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 group"
                                            >
                                                Acompanhar Entrega <Truck size={20} className="group-hover:translate-x-1 transition-all"/>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer (only for cart and form steps) */}
                        {step !== 'success' && (
                            <div className="p-10 bg-[#0c0c0c] border-t border-white/5">
                                <div className="flex justify-between items-end mb-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-1">Total do Pedido</span>
                                        <div className="text-4xl font-black text-white italic tracking-tighter">R$ {cartTotal.toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-500 font-bold text-[10px] uppercase tracking-widest mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Entrega Grátis
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        if (cart.length > 0) {
                                            if (step === 'cart') {
                                                if (!customerToken) { handleClose(); navigate('/login'); }
                                                else setStep('form');
                                            } else {
                                                handleCheckout();
                                            }
                                        }
                                    }}
                                    disabled={cart.length === 0 || submitting}
                                    className="w-full h-20 bg-primary rounded-[24px] text-white font-black italic tracking-widest uppercase hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-20 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                                >
                                    {submitting ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Clock size={24} />
                                        </motion.div>
                                    ) : (
                                        <>
                                            {step === 'cart' ? 'Finalizar Pedido' : 'Confirmar e Pagar'} 
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                                
                                {step === 'form' && (
                                    <button 
                                        onClick={() => setStep('cart')}
                                        className="w-full mt-4 py-2 text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-widest transition-all"
                                    >
                                        Voltar ao Carrinho
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


