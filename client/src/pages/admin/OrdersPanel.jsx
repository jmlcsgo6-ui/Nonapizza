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
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tight">Fila de <span className="text-primary italic">Produção</span></h2>
                    <p className="text-white/40 mt-1 font-medium">Gerencie o fluxo de pedidos em tempo real</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Servidor Online</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar pt-2">
                {columns.map(statusKey => {
                    const { label, color, next, icon: Icon } = STATUS_CONFIG[statusKey];
                    const list = orders.filter(o => o.status === statusKey);
                    
                    return (
                        <div key={statusKey} className="flex-1 min-w-[320px] max-w-[400px] flex flex-col gap-6">
                            <div className={`p-4 rounded-2xl flex justify-between items-center bg-white/[0.03] border-l-4 ${color.replace('bg-', 'border-')}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                                        <Icon size={16} className="text-white" />
                                    </div>
                                    <h4 className="text-sm font-bold text-white tracking-tight">{label}</h4>
                                </div>
                                <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-white/40">{list.length}</span>
                            </div>
                            
                            <div className="flex-1 space-y-4 min-h-[60vh]">
                                <AnimatePresence mode="popLayout">
                                    {list.map(o => (
                                        <motion.div 
                                            layout
                                            key={o.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group bg-[#0c0c0c] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all shadow-xl hover:shadow-2xl hover:translate-y-[-2px]"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-base font-black text-white italic tracking-tighter uppercase">{o.customerName}</p>
                                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mt-1">Pedido #{o.id}</span>
                                                </div>
                                                <div className="px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-xs font-bold text-white/40">
                                                    {new Date(o.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-6 text-xs font-medium text-white/40">
                                                <div className="flex items-center gap-2"><Phone size={12} className="text-primary/50" /> {o.phone}</div>
                                                <div className="flex items-center gap-2"><MapPin size={12} className="text-primary/50" /> {o.address}</div>
                                            </div>
                                            
                                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6 space-y-3">
                                                {o.items.map((i, idx) => (
                                                    <div key={idx} className="text-xs flex justify-between items-center text-white/60">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-primary font-bold text-[10px]">{i.qty}</span>
                                                            <span className="font-bold tracking-tight">{i.productName}</span>
                                                        </span>
                                                        <span className="text-white/20">R$ {(i.price * i.qty).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Total</span>
                                                    <span className="text-2xl font-black text-white italic tracking-tight italic">R$ {o.total.toFixed(2)}</span>
                                                </div>
                                                {next && (
                                                    <button
                                                        onClick={() => updateStatus(o.id, next)}
                                                        className="h-12 px-6 bg-primary text-white rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-all shadow-lg shadow-primary/20"
                                                    >
                                                        Avançar <ChevronRight size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {list.length === 0 && (
                                    <div className="h-32 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10">
                                        <Inbox size={24} className="mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Vazio</span>
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

