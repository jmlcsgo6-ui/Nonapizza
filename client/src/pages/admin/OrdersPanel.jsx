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
        <div className="space-y-12 font-mono">
            <div className="flex justify-between items-end border-b border-white/10 pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-1 h-6 bg-primary"></div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-white italic">OPERATIONAL_CONTROL</h3>
                    </div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em] ml-6">Sincronização de fluxo em tempo real</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-green-500"></div>
                        <span className="text-[9px] font-bold uppercase text-white/60 tracking-widest">SERVER_ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-10 custom-scrollbar snap-x">
                {columns.map(statusKey => {
                    const { label, color, next, icon: Icon } = STATUS_CONFIG[statusKey];
                    const list = orders.filter(o => o.status === statusKey);
                    
                    return (
                        <div key={statusKey} className="flex-1 min-w-[340px] snap-start flex flex-col gap-4">
                            <div className="flex justify-between items-center px-4 py-3 bg-white/5 border border-white/5 border-b-primary/50 border-b-2">
                                <div className="flex items-center gap-3">
                                    <Icon size={14} className={color.replace('bg-', 'text-')} />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{label}</h4>
                                </div>
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{list.length} UNIT(S)</span>
                            </div>
                            
                            <div className="flex-1 space-y-4 bg-black/40 border border-white/5 p-4 min-h-[65vh]">
                                <AnimatePresence mode="popLayout">
                                    {list.map(o => (
                                        <motion.div 
                                            layout
                                            key={o.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group bg-black border border-white/10 p-5 hover:border-primary/50 transition-all relative"
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-5 text-[8px] font-bold">#{o.id}</div>
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[11px] font-black text-primary uppercase tracking-wider">{o.customerName}</p>
                                                    <span className="text-[8px] font-bold text-white/20 uppercase mt-1 block">
                                                        SESSION_ID: {o.id.toString().padStart(6, '0')}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-bold text-white/40 font-mono">
                                                    {new Date(o.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}
                                                </span>
                                            </div>

                                            <div className="space-y-1 mb-6 text-[9px] font-bold text-white/30 uppercase tracking-tight">
                                                <div className="flex items-center gap-2"><Phone size={10} /> {o.phone || 'NO_DATA'}</div>
                                                <div className="flex items-center gap-2 truncate"><MapPin size={10} /> {o.address}</div>
                                            </div>
                                            
                                            <div className="bg-white/[0.02] border border-white/10 p-4 mb-6 space-y-2">
                                                {o.items.map((i, idx) => (
                                                    <div key={idx} className="text-[9px] font-bold text-white/60 uppercase flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                        <span className="flex items-center gap-2">
                                                            <span className="text-primary w-4">{i.qty}X</span>
                                                            <span className="truncate max-w-[150px]">{i.productName}</span>
                                                        </span>
                                                        <span className="text-white/20 whitespace-nowrap">R$ {(i.price * i.qty).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">TOTAL_CALC</span>
                                                    <span className="text-xl font-black text-white italic tracking-tighter italic">R$ {o.total.toFixed(2)}</span>
                                                </div>
                                                {next && (
                                                    <motion.button
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => updateStatus(o.id, next)}
                                                        className="px-6 py-2 bg-primary text-black font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all"
                                                    >
                                                        EVOLVE_PROCESS <ChevronRight size={12} strokeWidth={3} />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {list.length === 0 && (
                                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-10 border border-dashed border-white/20">
                                        <Inbox size={24} className="mb-2" />
                                        <span className="text-[8px] font-bold uppercase tracking-[0.3em]">NO_RECORDS_DETECTED</span>
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
