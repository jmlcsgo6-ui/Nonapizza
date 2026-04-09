import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, Truck, CheckCircle2, ChevronLeft, Package, MapPin, Search } from 'lucide-react';
import Header from '../components/Header';

const STATUS_STEPS = [
    { key: 'PENDING',    icon: Clock, label: 'Recebido',      desc: 'Sua ordem está na fila da alquimia.' },
    { key: 'COOKING',    icon: Flame, label: 'No Forno',      desc: 'O calor do fogo transformando sabor.' },
    { key: 'DELIVERING', icon: Truck, label: 'A Caminho',     desc: 'O aroma da Nona voando até você.' },
    { key: 'COMPLETED',  icon: CheckCircle2, label: 'Entregue',  desc: 'Aproveite o momento. Buon appetito!' },
];

export default function TrackOrder() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const customerToken = localStorage.getItem('customer_token');

    useEffect(() => {
        if (!customerToken) {
            navigate('/login');
            return;
        }
        fetchUserOrders();
    }, [customerToken]);

    const fetchUserOrders = async () => {
        try {
            const res = await api.get('/api/customer/orders', {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            setOrders(res.data);
            if (res.data.length > 0) setSelectedOrder(res.data[0]);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        if (!selectedOrder || selectedOrder.status === 'COMPLETED') return;
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/api/track/${selectedOrder.id}`);
                if (res.data.status !== selectedOrder.status) {
                    setSelectedOrder(res.data);
                    setOrders(prev => prev.map(o => o.id === res.data.id ? res.data : o));
                }
            } catch(e) {}
        }, 8000);
        return () => clearInterval(interval);
    }, [selectedOrder?.id, selectedOrder?.status]);

    if (loading) return (
        <div className="min-h-screen bg-deep flex items-center justify-center">
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
        </div>
    );

    const currentStepIdx = selectedOrder ? STATUS_STEPS.findIndex(s => s.key === selectedOrder.status) : -1;

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20">
            <Header />
            
            <div className="container mx-auto px-6 max-w-6xl">
                <header className="mb-12">
                    <motion.button 
                        whileHover={{ x: -5 }}
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white/40 text-xs font-black uppercase tracking-widest mb-4 transition-colors hover:text-primary"
                    >
                        <ChevronLeft size={16} /> Voltar ao site
                    </motion.button>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">MEUS <span className="text-gradient">PEDIDOS</span></h1>
                </header>

                {orders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 px-8 bg-card border border-white/5 rounded-3xl"
                    >
                        <Search size={48} className="mx-auto mb-6 text-white/10" />
                        <p className="text-xl text-white/40 mb-8 font-medium">Nenhum rastro de pedidos ainda...</p>
                        <button onClick={() => navigate('/')} className="btn-premium">COMEÇAR MINHA JORNADA</button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* List - Desktop left */}
                        <div className="lg:col-span-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Cronologia Recente</span>
                            {orders.map(o => (
                                <motion.div 
                                    key={o.id} 
                                    whileHover={{ x: 5 }}
                                    onClick={() => setSelectedOrder(o)} 
                                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${selectedOrder?.id === o.id ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-lg font-black italic tracking-tighter">#{o.id}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full ${o.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-primary/20 text-primary animate-pulse'}`}>
                                            {STATUS_STEPS.find(s => s.key === o.status)?.label}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-white/30 uppercase tracking-tighter">
                                        {new Date(o.createdAt).toLocaleDateString('pt-BR')} • {o.items.length} itens • R$ {o.total.toFixed(2)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Tracker - Desktop right */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <AnimatePresence mode="wait">
                                {selectedOrder && (
                                    <motion.div 
                                        key={selectedOrder.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                                    >
                                        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Detalhes <span className="text-primary">#{selectedOrder.id}</span></h3>
                                                <div className="flex items-center gap-2 mt-2 text-white/40 text-xs font-medium uppercase tracking-widest">
                                                    <MapPin size={12} /> {selectedOrder.address}
                                                </div>
                                            </div>
                                            <Package size={40} className="text-white/5" />
                                        </div>

                                        <div className="p-10">
                                            <div className="space-y-12">
                                                {STATUS_STEPS.map((step, idx) => {
                                                    const isDone = idx <= currentStepIdx;
                                                    const isActive = idx === currentStepIdx;
                                                    const Icon = step.icon;
                                                    
                                                    return (
                                                        <div key={step.key} className="flex gap-8 relative">
                                                            {/* Vertical Line Connector */}
                                                            {idx < STATUS_STEPS.length - 1 && (
                                                                <div className="absolute left-[20px] top-[40px] w-0.5 h-[calc(100%+24px)] overflow-hidden">
                                                                    <div className={`w-full h-full transition-all duration-1000 ${isDone && idx < currentStepIdx ? 'bg-primary' : 'bg-white/10'}`} />
                                                                </div>
                                                            )}
                                                            
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 border-2 ${isActive ? 'bg-primary border-primary scale-125 shadow-xl shadow-primary/40 text-white' : (isDone ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-white/10')}`}>
                                                                <Icon size={isActive ? 22 : 18} strokeWidth={isActive ? 3 : 2} />
                                                            </div>

                                                            <div className={`transition-all duration-500 ${isDone ? 'opacity-100' : 'opacity-20 translate-x-4'}`}>
                                                                <p className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-white'}`}>{step.label}</p>
                                                                <p className="text-xs font-medium text-white/40 mt-1">{step.desc}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="bg-white/[0.03] p-8 border-t border-white/5 rounded-b-[2.5rem]">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6 block">Resumo do Pedido</span>
                                            <div className="space-y-3 mb-8">
                                                {selectedOrder.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm font-bold">
                                                        <span className="text-white/60">{item.qty}x <span className="text-white">{item.productName}</span></span>
                                                        <span className="tracking-tighter">R$ {(item.price * item.qty).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total Final</span>
                                                    <span className="text-4xl font-black italic tracking-tighter">R$ {selectedOrder.total.toFixed(2)}</span>
                                                </div>
                                                <button className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-2">
                                                    <Info size={14} /> Ajuda com o pedido
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
