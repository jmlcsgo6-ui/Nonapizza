import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, Truck, CheckCircle2, ChevronLeft, Package, MapPin, Search, Receipt, ArrowLeft, History } from 'lucide-react';
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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_30px_rgba(255,95,0,0.2)]"
            />
        </div>
    );

    const currentStepIdx = selectedOrder ? STATUS_STEPS.findIndex(s => s.key === selectedOrder.status) : -1;

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 overflow-x-hidden">
            <Header />
            
            <div className="container mx-auto px-6 max-w-7xl">
                <header className="mb-16">
                    <motion.button 
                        whileHover={{ x: -5 }}
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 text-white/20 text-xs font-bold uppercase tracking-[0.3em] mb-6 transition-colors hover:text-white"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
                    </motion.button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-1.5 h-12 bg-primary rounded-full"></div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white">Acompanhar <span className="text-primary italic">Pedido</span></h1>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.4em] mt-2">Experiência Gastronômica Realtime</p>
                            </div>
                        </div>
                    </div>
                </header>

                {orders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32 bg-white/[0.02] border border-white/5 rounded-[48px] backdrop-blur-xl"
                    >
                        <Search size={64} className="mx-auto mb-8 text-white/10" />
                        <p className="text-sm text-white/30 mb-10 font-bold uppercase tracking-[0.4em]">Nenhum pedido encontrado em sua conta</p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="bg-primary px-12 h-16 rounded-full text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all"
                        >
                            Ver Cardápio
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* Sidebar List */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="flex items-center gap-3 ml-2 mb-2">
                                <History size={16} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Seu Histórico</span>
                            </div>
                            
                            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                                {orders.map(o => (
                                    <motion.div 
                                        key={o.id} 
                                        onClick={() => setSelectedOrder(o)} 
                                        className={`p-8 cursor-pointer transition-all rounded-[32px] border-2 ${selectedOrder?.id === o.id ? 'bg-primary/5 border-primary shadow-[0_0_40px_rgba(255,95,0,0.1)]' : 'bg-[#080808] border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xl font-black italic tracking-tighter text-white"># {o.id.toString().padStart(4, '0')}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${o.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                                                {STATUS_STEPS.find(s => s.key === o.status)?.label || o.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} /> {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} itens • R$ {o.total.toFixed(2)}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Tracker Main */}
                        <div className="lg:col-span-8">
                            <AnimatePresence mode="wait">
                                {selectedOrder && (
                                    <motion.div 
                                        key={selectedOrder.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-[#080808] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl relative"
                                    >
                                        <div className="p-10 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div className="w-full">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="bg-primary/10 p-3 rounded-2xl">
                                                        <Package size={24} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Status do <span className="text-primary italic">Pedido</span></h3>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mt-1">Identificador #{selectedOrder.id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 text-white/40 text-xs font-medium">
                                                    <MapPin size={14} className="text-primary" /> <span className="uppercase">{selectedOrder.address}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex bg-white/5 px-6 py-4 rounded-3xl border border-white/10">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Previsão</p>
                                                    <p className="text-lg font-black text-white italic tracking-tight">45-60 min</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-12 space-y-12">
                                            {STATUS_STEPS.map((step, idx) => {
                                                const isDone = idx <= currentStepIdx;
                                                const isActive = idx === currentStepIdx;
                                                const Icon = step.icon;
                                                
                                                return (
                                                    <div key={step.key} className="flex gap-10 relative group">
                                                        {idx < STATUS_STEPS.length - 1 && (
                                                            <div className="absolute left-[24px] top-[50px] w-1 h-[calc(100%+30px)] bg-white/[0.05] rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: isDone && idx < currentStepIdx ? '100%' : '0%' }}
                                                                    transition={{ duration: 1 }}
                                                                    className="w-full bg-primary"
                                                                />
                                                            </div>
                                                        )}
                                                        
                                                        <motion.div 
                                                            animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-2 ${isActive ? 'bg-primary text-white border-primary shadow-[0_0_30px_rgba(255,95,0,0.3)]' : (isDone ? 'bg-black border-primary text-primary' : 'bg-black border-white/10 text-white/10')}`}
                                                        >
                                                            <Icon size={22} />
                                                        </motion.div>

                                                        <div className={`transition-all duration-500 ${isDone ? 'opacity-100' : 'opacity-20'}`}>
                                                            <p className={`text-base font-black uppercase tracking-[0.1em] ${isActive ? 'text-primary' : 'text-white'}`}>{step.label}</p>
                                                            <p className="text-xs font-medium text-white/30 mt-1">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="bg-white/[0.03] p-10 border-t border-white/5 backdrop-blur-3xl">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Receipt size={18} className="text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Resumo dos Sabores</span>
                                            </div>
                                            <div className="space-y-4 mb-10">
                                                {selectedOrder.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                                        <span className="text-white/30">{item.qty}X <span className="text-white ml-2">{item.productName}</span></span>
                                                        <span className="text-white font-black italic tracking-tight">R$ {(item.price * item.qty).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-end gap-6">
                                                <div className="flex flex-col w-full md:w-auto">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-2 ml-1">Total Consolidado</span>
                                                    <span className="text-5xl font-black italic tracking-tighter text-white">R$ {selectedOrder.total.toFixed(2)}</span>
                                                </div>
                                                <button className="h-14 px-8 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3 group">
                                                    Suporte Alquimia <i className="fa-solid fa-headset group-hover:rotate-12 transition-transform"></i>
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

