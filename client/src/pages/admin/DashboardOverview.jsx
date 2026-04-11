import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import { motion } from 'framer-motion';
import {
    DollarSign,
    ShoppingBag,
    Flame,
    TrendingUp,
    ArrowRight,
    Clock,
    CheckCircle2,
    Truck,
} from 'lucide-react';

function startOfLocalDay() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

const STATUS_LABELS = {
    PENDING: { label: 'Recebido', color: '#f97316' },
    COOKING: { label: 'No Forno', color: '#eab308' },
    DELIVERING: { label: 'Em Entrega', color: '#3b82f6' },
    COMPLETED: { label: 'Concluído', color: '#22c55e' },
};

export default function DashboardOverview({ token, onNavigate }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/api/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(res.data);
            } catch (e) {
                console.error('Dashboard stats error', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [token]);

    const stats = useMemo(() => {
        const t0 = startOfLocalDay();
        const today = orders.filter((o) => new Date(o.createdAt) >= t0);
        const revenueToday = today.filter(o => o.status === 'COMPLETED').reduce((a, o) => a + Number(o.total), 0);
        const revenueAll = orders.filter(o => o.status === 'COMPLETED').reduce((a, o) => a + Number(o.total), 0);
        const pipeline = orders.filter(o => ['PENDING', 'COOKING', 'DELIVERING'].includes(o.status)).length;
        const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

        // Status distribution
        const dist = { PENDING: 0, COOKING: 0, DELIVERING: 0, COMPLETED: 0 };
        orders.forEach(o => { if (dist[o.status] !== undefined) dist[o.status]++; });

        return { revenueToday, revenueAll, pipeline, todayCount: today.length, recent, dist };
    }, [orders]);

    const statCards = [
        {
            title: 'Receita hoje',
            value: `R$ ${stats.revenueToday.toFixed(2)}`,
            sub: 'Pedidos concluídos hoje',
            icon: DollarSign,
            accent: '#22c55e',
            glow: 'rgba(34,197,94,0.12)',
            delay: 0,
        },
        {
            title: 'Pedidos hoje',
            value: String(stats.todayCount),
            sub: 'Novos pedidos no dia',
            icon: ShoppingBag,
            accent: '#f97316',
            glow: 'rgba(249,115,22,0.12)',
            delay: 0.05,
        },
        {
            title: 'Em andamento',
            value: String(stats.pipeline),
            sub: 'Forno + entrega ativos',
            icon: Flame,
            accent: '#eab308',
            glow: 'rgba(234,179,8,0.12)',
            delay: 0.1,
        },
        {
            title: 'Receita total',
            value: `R$ ${stats.revenueAll.toFixed(2)}`,
            sub: 'Histórico total concluído',
            icon: TrendingUp,
            accent: '#3b82f6',
            glow: 'rgba(59,130,246,0.12)',
            delay: 0.15,
        },
    ];

    const statusDistCards = Object.entries(STATUS_LABELS).map(([key, cfg]) => ({
        ...cfg,
        count: stats.dist[key] || 0,
        key,
    }));

    return (
        <div className="space-y-10">
            {/* Stat Cards */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((c) => (
                    <motion.div
                        key={c.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: c.delay, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18] p-8"
                        style={{ boxShadow: `0 0 40px ${c.glow}` }}
                    >
                        {/* bg accent */}
                        <div
                            className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full opacity-10 blur-2xl"
                            style={{ background: c.accent }}
                        />
                        <div className="relative flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">{c.title}</p>
                                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-white">{c.value}</p>
                                <p className="mt-1 text-xs text-white/35">{c.sub}</p>
                            </div>
                            <div
                                className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{ background: `${c.accent}18`, boxShadow: `0 0 20px ${c.glow}` }}
                            >
                                <c.icon size={18} style={{ color: c.accent }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Status distribution mini-bar */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-white/[0.06] bg-[#0c0c18] p-8"
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-lg font-bold text-white tracking-tight">Pipeline de Produção</p>
                        <p className="text-sm text-white/30 mt-1">Status atual da cozinha em tempo real</p>
                    </div>
                    <span className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-xs font-bold text-white/40 uppercase tracking-widest">
                        {orders.length} Pedidos Ativos
                    </span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full gap-1 bg-white/[0.02]">
                    {statusDistCards.map((s) => {
                        const pct = orders.length > 0 ? (s.count / orders.length) * 100 : 0;
                        return (
                            <motion.div
                                key={s.key}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="h-full rounded-full"
                                style={{ background: s.color, minWidth: s.count > 0 ? '4px' : '0px' }}
                                title={`${s.label}: ${s.count}`}
                            />
                        );
                    })}
                </div>
                <div className="mt-6 flex flex-wrap gap-6">
                    {statusDistCards.map((s) => (
                        <div key={s.key} className="flex items-center gap-2.5">
                            <div className="h-3 w-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ background: s.color }} />
                            <span className="text-sm font-medium text-white/40">{s.label}</span>
                            <span className="text-sm font-bold text-white/70">{s.count}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Bottom grid */}
            <div className="grid gap-8 lg:grid-cols-5">
                {/* Recent Orders Table */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18] lg:col-span-3"
                >
                    <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-8 py-6">
                        <div>
                            <p className="text-lg font-bold text-white tracking-tight">Pedidos Recentes</p>
                            <p className="text-xs text-white/30 mt-1">Últimas movimentações do sistema</p>
                        </div>
                        <button
                            onClick={() => onNavigate?.('orders')}
                            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                        >
                            Gerenciar Fila <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.04]">
                                    {['Pedido', 'Cliente', 'Status', 'Total'].map((h, i) => (
                                        <th key={h} className={`px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/20 ${i === 3 ? 'text-right' : ''}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {stats.recent.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-sm text-white/20">
                                            Nenhum pedido ainda.
                                        </td>
                                    </tr>
                                ) : (
                                    stats.recent.map((o) => {
                                        const sc = STATUS_LABELS[o.status];
                                        return (
                                            <tr key={o.id} className="border-b border-white/[0.03] transition hover:bg-white/[0.02]">
                                                <td className="px-5 py-3 font-bold" style={{ color: sc?.color || '#f97316' }}>#{o.id}</td>
                                                <td className="px-5 py-3 font-medium text-white/70">{o.customerName}</td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className="rounded-lg px-2 py-1 text-[10px] font-bold"
                                                        style={{ background: `${sc?.color || '#f97316'}18`, color: sc?.color || '#f97316' }}
                                                    >
                                                        {sc?.label || o.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right font-bold tabular-nums text-white/70">
                                                    R$ {Number(o.total).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Quick Access */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-6 rounded-3xl border border-white/[0.06] bg-[#0c0c18] p-8 lg:col-span-2"
                >
                    <div>
                        <p className="text-lg font-bold text-white tracking-tight">Acesso Rápido</p>
                        <p className="text-sm text-white/30 mt-1">Navegação agilizada</p>
                    </div>
                    <div className="mt-2 space-y-3">
                        {[
                            { label: 'Fila de Pedidos', tab: 'orders', icon: ShoppingBag, color: '#f97316' },
                            { label: 'Gerenciar Produtos', tab: 'products', icon: Clock, color: '#3b82f6' },
                            { label: 'Personalizar Sabores', tab: 'flavors', icon: CheckCircle2, color: '#22c55e' },
                        ].map((item) => (
                            <motion.button
                                key={item.tab}
                                type="button"
                                whileHover={{ x: 6, scale: 1.01 }}
                                onClick={() => onNavigate?.(item.tab)}
                                className="flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-4 transition hover:border-white/[0.1] hover:bg-white/[0.05]"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg"
                                        style={{ background: `${item.color}15`, boxShadow: `0 8px 20px ${item.color}10` }}
                                    >
                                        <item.icon size={18} style={{ color: item.color }} />
                                    </div>
                                    <span className="text-base font-bold text-white/80">{item.label}</span>
                                </div>
                                <ArrowRight size={16} className="text-white/20" />
                            </motion.button>
                        ))}
                    </div>
                    <div className="mt-auto rounded-2xl border border-orange-500/15 bg-orange-500/5 p-5">
                        <p className="text-xs leading-relaxed text-white/30 font-medium">
                            💡 Status: O sistema está operando normalmente. Todos os dados são sincronizados em tempo real com a cozinha.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
