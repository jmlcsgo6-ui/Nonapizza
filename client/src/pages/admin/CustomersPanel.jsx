import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    ShoppingBag,
    DollarSign,
    Phone,
    Mail,
    ChevronRight,
    ChevronDown,
    X,
    RefreshCw,
    User,
    MapPin,
    Clock,
    Hash,
} from 'lucide-react';

const STATUS_CFG = {
    PENDING:    { label: 'Recebido',   color: '#f97316' },
    COOKING:    { label: 'No Forno',   color: '#eab308' },
    DELIVERING: { label: 'Em Entrega', color: '#3b82f6' },
    COMPLETED:  { label: 'Concluído',  color: '#22c55e' },
    CANCELLED:  { label: 'Cancelado',  color: '#ef4444' },
};

function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function CustomerDetailModal({ customer, onClose }) {
    if (!customer) return null;
    return (
        <motion.div
            className="fixed inset-0 z-[8000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <button
                type="button"
                aria-label="Fechar"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                role="dialog"
                aria-modal="true"
                className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-white/[0.08] bg-[#0c0c18] shadow-2xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-6 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/20">
                            <User size={20} className="text-orange-400" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">{customer.name}</p>
                            <p className="text-xs text-white/40 font-medium">{customer.orders.length} pedido{customer.orders.length !== 1 ? 's' : ''} · Total R$ {customer.totalSpent.toFixed(2)}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-white/40 transition hover:bg-white/[0.05] hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Contact Info */}
                <div className="flex gap-4 px-8 py-5 border-b border-white/[0.04]">
                    {customer.phone && (
                        <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm">
                            <Phone size={14} className="text-orange-400 shrink-0" />
                            <span className="text-white/70 font-medium">{customer.phone}</span>
                        </div>
                    )}
                    {customer.email && (
                        <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm">
                            <Mail size={14} className="text-blue-400 shrink-0" />
                            <span className="text-white/70 font-medium">{customer.email}</span>
                        </div>
                    )}
                </div>

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/25 mb-4">Histórico de Pedidos</p>
                    {customer.orders.length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-center">
                            <ShoppingBag size={32} className="text-white/10 mb-3" />
                            <p className="text-sm text-white/25">Nenhum pedido registrado</p>
                        </div>
                    ) : (
                        customer.orders.map((order) => {
                            const sc = STATUS_CFG[order.status] || { label: order.status, color: '#f97316' };
                            return (
                                <div
                                    key={order.id}
                                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold" style={{ color: sc.color }}>#{order.id}</span>
                                            <span
                                                className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                                                style={{ background: `${sc.color}18`, color: sc.color }}
                                            >
                                                {sc.label}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-black tabular-nums text-white">R$ {Number(order.total).toFixed(2)}</p>
                                            <p className="text-[11px] text-white/30 mt-0.5">{timeAgo(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        {order.items?.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                                                <span className="text-orange-400/70 font-semibold">{item.qty}×</span>
                                                <span className="truncate">{item.productName}</span>
                                            </div>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <p className="text-xs text-white/25">+{order.items.length - 3} itens</p>
                                        )}
                                    </div>
                                    {order.address && (
                                        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                                            <MapPin size={13} className="text-white/25 mt-0.5 shrink-0" />
                                            <p className="text-xs text-white/35 leading-relaxed">{order.address}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function CustomersPanel({ token, search }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [token]);

    // Aggregate customers from orders
    const customers = useMemo(() => {
        const map = new Map();
        for (const o of orders) {
            const key = o.phone || o.customerName;
            if (!map.has(key)) {
                map.set(key, {
                    name: o.customerName,
                    phone: o.phone,
                    email: null,
                    orders: [],
                    totalSpent: 0,
                    lastOrder: o.createdAt,
                });
            }
            const c = map.get(key);
            c.orders.push(o);
            if (o.status === 'COMPLETED') c.totalSpent += Number(o.total);
            if (new Date(o.createdAt) > new Date(c.lastOrder)) c.lastOrder = o.createdAt;
        }
        return Array.from(map.values()).sort((a, b) => new Date(b.lastOrder) - new Date(a.lastOrder));
    }, [orders]);

    const filtered = useMemo(() => {
        const q = (search || '').trim().toLowerCase();
        if (!q) return customers;
        return customers.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.phone?.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
        );
    }, [customers, search]);

    const totalRevenue = customers.reduce((a, c) => a + c.totalSpent, 0);
    const avgOrders = customers.length > 0 ? (orders.length / customers.length).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-5 sm:grid-cols-3">
                {[
                    { title: 'Total de Clientes', value: String(customers.length), icon: Users, color: '#a78bfa', glow: 'rgba(167,139,250,0.12)' },
                    { title: 'Receita Gerada', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#22c55e', glow: 'rgba(34,197,94,0.12)' },
                    { title: 'Pedidos / Cliente', value: String(avgOrders), icon: ShoppingBag, color: '#f97316', glow: 'rgba(249,115,22,0.12)' },
                ].map((c, i) => (
                    <motion.div
                        key={c.title}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18] p-7"
                        style={{ boxShadow: `0 0 40px ${c.glow}` }}
                    >
                        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full opacity-10 blur-2xl" style={{ background: c.color }} />
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">{c.title}</p>
                                <p className="mt-2 text-2xl font-black tabular-nums text-white">{c.value}</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${c.color}18` }}>
                                <c.icon size={18} style={{ color: c.color }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18]">
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-8 py-5">
                    <div>
                        <p className="text-base font-bold text-white">Lista de Clientes</p>
                        <p className="text-xs text-white/30 mt-0.5">{filtered.length} de {customers.length} clientes</p>
                    </div>
                    {loading && <RefreshCw size={16} className="animate-spin text-white/30" />}
                </div>

                {loading && customers.length === 0 ? (
                    <div className="flex items-center justify-center gap-3 py-24 text-white/25">
                        <RefreshCw size={18} className="animate-spin" />
                        <span className="text-sm">Carregando clientes…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <Users size={36} className="mb-3 text-white/10" />
                        <p className="text-sm text-white/25">Nenhum cliente encontrado</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.04]">
                                    {['Cliente', 'Telefone', 'Pedidos', 'Gasto Total', 'Último Pedido', ''].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-6 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-white/20 ${i >= 2 && i < 4 ? 'text-right' : ''}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                <AnimatePresence initial={false}>
                                    {filtered.map((c, idx) => (
                                        <motion.tr
                                            key={c.phone || c.name}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="cursor-pointer transition hover:bg-white/[0.02]"
                                            onClick={() => setSelectedCustomer(c)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 font-bold text-sm">
                                                        {(c.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-white/85">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white/50">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={13} className="text-white/25" />
                                                    {c.phone || '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="rounded-xl px-3 py-1.5 text-xs font-bold bg-white/[0.06] text-white/60">
                                                    {c.orders.length}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold tabular-nums text-white/75">
                                                R$ {c.totalSpent.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-white/35 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    {timeAgo(c.lastOrder)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ChevronRight size={16} className="text-white/20" />
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <CustomerDetailModal
                        customer={selectedCustomer}
                        onClose={() => setSelectedCustomer(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
