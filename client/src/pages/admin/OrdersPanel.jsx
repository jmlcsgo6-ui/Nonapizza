import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, Truck, CheckCircle2, ChevronRight, Phone, MapPin, Inbox, ShoppingBag } from 'lucide-react';

const STATUS_CONFIG = {
    PENDING:    { label: 'Recebido',         color: 'bg-orange-500', next: 'COOKING',    icon: Clock },
    COOKING:    { label: 'No Forno',         color: 'bg-primary',    next: 'DELIVERING', icon: Flame },
    DELIVERING: { label: 'Em Entrega',       color: 'bg-blue-500',   next: 'COMPLETED',  icon: Truck },
    COMPLETED:  { label: 'Concluído',        color: 'bg-green-500',  next: null,         icon: CheckCircle2 },
};

export default function OrdersPanel({ token }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
            setLoading(false);
        } catch(e) { console.error('Error fetching orders', e); }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const updateStatus = async (id, status) => {
        try {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
            await api.put(`/api/admin/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch(e) { 
            console.error('Failed to update status', e); 
            fetchOrders(); 
        }
    };

    const columns = ['PENDING','COOKING','DELIVERING','COMPLETED'];

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Fila de <span className="text-primary">Produção</span></h2>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Gerencie o fluxo de pedidos em tempo real</p>
                </div>
                <div className="px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-xl">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Servidor Online</span>
                </div>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-10 custom-scrollbar pt-2 scroll-smooth">
                {columns.map(statusKey => {
                    const { label, color, next, icon: Icon } = STATUS_CONFIG[statusKey];
                    const list = orders.filter(o => o.status === statusKey);
                    
                    return (
                        <div key={statusKey} className="flex-1 min-w-[360px] max-w-[420px] flex flex-col gap-8">
                            <div className={`p-6 rounded-[32px] flex justify-between items-center bg-[#0c0c0c] border border-white/5 border-l-[6px] ${color.replace('bg-', 'border-')} shadow-xl`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-lg`}>
                                        <Icon size={18} className="text-white" />
                                    </div>
                                    <h4 className="text-base font-black text-white uppercase tracking-tight italic">{label}</h4>
                                </div>
                                <span className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-[10px] font-black text-white/40">{list.length}</span>
                            </div>
                            
                            <div className="flex-1 space-y-6 min-h-[60vh]">
                                <AnimatePresence mode="popLayout">
                                    {list.map(o => (
                                        <motion.div 
                                            layout
                                            key={o.id}
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="group bg-[#0c0c0c]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] hover:border-white/10 transition-all shadow-2xl hover:shadow-primary/5 hover:translate-y-[-4px]"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight">{o.customerName}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Pedido #{o.id}</span>
                                                        <span className="text-white/10">•</span>
                                                        <span className="text-[10px] font-bold text-white/30">{new Date(o.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</span>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 bg-white/[0.03] rounded-xl flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                                                    <ShoppingBag size={18} />
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-8 text-xs font-bold text-white/40 uppercase tracking-wider">
                                                <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-2xl"><Phone size={14} className="text-primary" /> {o.phone}</div>
                                                <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-2xl"><MapPin size={14} className="text-primary" /> {o.address}</div>
                                            </div>
                                            
                                            <div className="bg-black/40 border border-white/5 rounded-[32px] p-6 mb-8 space-y-4">
                                                {o.items.map((i, idx) => (
                                                    <div key={idx} className="text-xs flex justify-between items-center">
                                                        <span className="flex items-center gap-3">
                                                            <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-primary font-black text-[10px]">{i.qty}x</span>
                                                            <span className="font-bold text-white/70 tracking-tight">{i.productName}</span>
                                                        </span>
                                                        <span className="text-white/20 font-black">R$ {(i.price * i.qty).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-1">Total</span>
                                                    <span className="text-3xl font-black text-primary italic tracking-tighter">R$ {o.total.toFixed(2)}</span>
                                                </div>
                                                {next && (
                                                    <button
                                                        onClick={() => updateStatus(o.id, next)}
                                                        className="h-14 px-8 bg-primary hover:bg-white hover:text-black text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-primary/20 hover:shadow-white/10"
                                                    >
                                                        Próximo <ChevronRight size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {list.length === 0 && (
                                    <div className="h-40 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10">
                                        <Inbox size={32} className="mb-3 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sem pedidos</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

