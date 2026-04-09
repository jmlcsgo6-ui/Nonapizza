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
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-mono">
            <Header />
            
            <div className="container mx-auto px-6 max-w-6xl">
                <header className="mb-12">
                    <motion.button 
                        whileHover={{ x: -5 }}
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mb-4 transition-colors hover:text-white"
                    >
                        <ChevronLeft size={12} /> ABORT_TO_MAIN_TERMINAL
                    </motion.button>
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-10 bg-primary"></div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">TRACKING_SYSTEM <span className="text-primary italic">v1.2</span></h1>
                    </div>
                </header>

                {orders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bg-black border border-white/5"
                    >
                        <Search size={40} className="mx-auto mb-8 text-white/10" />
                        <p className="text-[10px] text-white/20 mb-8 font-black uppercase tracking-[0.5em]">NO_ORDER_HISTORY_DETECTED_IN_DATABASE</p>
                        <button onClick={() => navigate('/')} className="bg-primary px-10 py-4 text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white transition-all">RE_INITIALIZE_ALCHEMY</button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* List - Sharp Industrial */}
                        <div className="lg:col-span-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-2 block mb-4">SEQUENTIAL_CHRONOLOGY</span>
                            {orders.map(o => (
                                <motion.div 
                                    key={o.id} 
                                    onClick={() => setSelectedOrder(o)} 
                                    className={`p-6 cursor-pointer transition-all border ${selectedOrder?.id === o.id ? 'bg-primary/5 border-primary' : 'bg-black border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-black italic tracking-tighter">ID_{o.id.toString().padStart(6, '0')}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${o.status === 'COMPLETED' ? 'bg-green-500 text-black' : 'bg-primary text-black animate-pulse'}`}>
                                            {STATUS_STEPS.find(s => s.key === o.status)?.label.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                                        TS: {new Date(o.createdAt).toLocaleDateString()} | UNITS: {o.items.length} | VAL: R$ {o.total.toFixed(2)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Tracker - Sharp Industrial */}
                        <div className="lg:col-span-8">
                            <AnimatePresence mode="wait">
                                {selectedOrder && (
                                    <motion.div 
                                        key={selectedOrder.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-black border border-white/10 relative overflow-hidden"
                                    >
                                        <div className="p-8 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-black italic tracking-tighter uppercase italic">CORE_DETAILS <span className="text-primary italic">#{selectedOrder.id}</span></h3>
                                                <div className="flex items-center gap-2 mt-2 text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">
                                                    <MapPin size={10} className="text-primary" /> DEST: {selectedOrder.address}
                                                </div>
                                            </div>
                                            <Package size={30} className="text-white/10" />
                                        </div>

                                        <div className="p-10 space-y-12">
                                            {STATUS_STEPS.map((step, idx) => {
                                                const isDone = idx <= currentStepIdx;
                                                const isActive = idx === currentStepIdx;
                                                const Icon = step.icon;
                                                
                                                return (
                                                    <div key={step.key} className="flex gap-10 relative">
                                                        {idx < STATUS_STEPS.length - 1 && (
                                                            <div className="absolute left-[19px] top-[40px] w-[2px] h-[calc(100%+32px)] bg-white/[0.05]">
                                                                <div className={`w-full h-full transition-all duration-1000 ${isDone && idx < currentStepIdx ? 'bg-primary' : 'bg-transparent'}`} />
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`w-10 h-10 flex items-center justify-center transition-all duration-500 z-10 border ${isActive ? 'bg-primary text-black border-primary scale-110' : (isDone ? 'bg-black border-primary text-primary' : 'bg-black border-white/10 text-white/10')}`}>
                                                            <Icon size={18} strokeWidth={3} />
                                                        </div>

                                                        <div className={`transition-all duration-500 ${isDone ? 'opacity-100' : 'opacity-20 translate-x-4'}`}>
                                                            <p className={`text-xs font-black uppercase tracking-[0.2em] ${isActive ? 'text-primary' : 'text-white'}`}>{step.label.toUpperCase()}</p>
                                                            <p className="text-[9px] font-bold text-white/30 mt-2 uppercase tracking-widest">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="bg-white/[0.02] p-8 border-t border-white/10">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 block">MANIFESTO_DA_ORDEM</span>
                                            <div className="space-y-3 mb-8">
                                                {selectedOrder.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                        <span className="text-white/40">{item.qty}X <span className="text-white">{item.productName}</span></span>
                                                        <span className="text-primary">R$ {(item.price * item.qty).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-8 border-t border-white/5 flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">FINAL_SETTLEMENT</span>
                                                    <span className="text-4xl font-black italic tracking-tighter text-white italic">R$ {selectedOrder.total.toFixed(2)}</span>
                                                </div>
                                                <button className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10 hover:text-white transition-all flex items-center gap-2">
                                                    SYSTEM_ASSISTANCE <i className="fa-solid fa-headset"></i>
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
