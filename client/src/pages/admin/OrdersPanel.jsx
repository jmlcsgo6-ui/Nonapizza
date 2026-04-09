import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, Truck, CheckCircle2, ChevronRight, Phone, MapPin, Inbox, AlertCircle } from 'lucide-react';

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
        const interval = setInterval(fetchOrders, 6000);
        return () => clearInterval(interval);
    }, [token]);

    const updateStatus = async (id, status) => {
        try {
            // Optimistic update
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
        <div className="space-y-10">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Fluxo de <span className="text-primary italic">Operações</span></h3>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Sincronização em tempo real ativa</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Servidor Online</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar snap-x">
                {columns.map(statusKey => {
                    const { label, color, next, icon: Icon } = STATUS_CONFIG[statusKey];
                    const list = orders.filter(o => o.status === statusKey);
                    
                    return (
                        <div key={statusKey} className="flex-1 min-w-[320px] snap-start flex flex-col gap-6">
                            <div className="flex justify-between items-center px-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${color}`}>
                                        <Icon size={18} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</h4>
                                </div>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{list.length} PEDIDOS</span>
                            </div>
                            
                            <div className="flex-1 space-y-4 bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] min-h-[60vh] backdrop-blur-sm">
                                <AnimatePresence mode="popLayout">
                                    {list.map(o => (
                                        <motion.div 
                                            layout
                                            key={o.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            className="group bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 hover:border-primary/40 transition-all duration-300 shadow-xl"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xl font-black italic tracking-tighter text-white uppercase">#{o.id}</span>
                                                    <p className="text-xs font-black text-primary uppercase mt-1 tracking-tighter">{o.customerName}</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-white/20 font-mono">
                                                    {new Date(o.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-6 text-[10px] font-bold text-white/40 uppercase tracking-tight">
                                                <div className="flex items-center gap-2"><Phone size={12} /> {o.phone || 'N/A'}</div>
                                                <div className="flex items-center gap-2 line-clamp-1"><MapPin size={12} /> {o.address}</div>
                                            </div>
                                            
                                            <div className="bg-white/5 p-4 rounded-2xl mb-6 space-y-2 border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                                                {o.items.map((i, idx) => (
                                                    <p key={idx} className="text-[10px] font-black text-white/70 uppercase flex justify-between">
                                                        <span>{i.qty}x {i.productName}</span>
                                                        <span className="text-white/20">R$ {(i.price * i.qty).toFixed(2)}</span>
                                                    </p>
                                                ))}
                                                {o.reference && (
                                                    <div className="pt-2 mt-2 border-t border-white/5 flex items-start gap-2 text-primary/60 text-[9px] font-bold">
                                                        <AlertCircle size={10} /> {o.reference}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Total</span>
                                                    <span className="text-lg font-black text-white italic tracking-tighter">R$ {o.total.toFixed(2)}</span>
                                                </div>
                                                {next && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => updateStatus(o.id, next)}
                                                        className={`px-4 py-2.5 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg ${color} group-hover:shadow-[0_0_20px_rgba(255,95,0,0.3)] transition-all`}
                                                    >
                                                        AVANÇAR <ChevronRight size={14} strokeWidth={3} />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {list.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20 group">
                                        <Inbox size={40} className="mb-4 text-white group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">SEM REGISTROS</span>
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
