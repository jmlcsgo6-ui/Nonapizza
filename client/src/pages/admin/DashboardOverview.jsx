import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    ShoppingBag,
    Flame,
    TrendingUp,
    ArrowRight,
    Clock,
    CheckCircle2,
    Truck,
    Users,
    XCircle,
    Calendar,
    BarChart3,
    Receipt,
} from 'lucide-react';

function startOfLocalDay(daysAgo = 0) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
}

const STATUS_LABELS = {
    PENDING:    { label: 'Recebido',   color: '#f97316', icon: Clock },
    COOKING:    { label: 'No Forno',   color: '#eab308', icon: Flame },
    DELIVERING: { label: 'Em Entrega', color: '#3b82f6', icon: Truck },
    COMPLETED:  { label: 'Concluído',  color: '#22c55e', icon: CheckCircle2 },
    CANCELLED:  { label: 'Cancelado',  color: '#ef4444', icon: XCircle },
};

export default function DashboardOverview({ token, onNavigate }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('today'); // today | week | month

    useEffect(() => {
        const fetch = async (silent = false) => {
            if (!silent) setLoading(true);
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
        const interval = setInterval(() => fetch(true), 10000);
        return () => clearInterval(interval);
    }, [token]);

    const stats = useMemo(() => {
        const t0Today = startOfLocalDay(0);
        const t0Week = startOfLocalDay(7);
        const t0Month = startOfLocalDay(30);

        const today = orders.filter(o => new Date(o.createdAt) >= t0Today);
        const week = orders.filter(o => new Date(o.createdAt) >= t0Week);
        const month = orders.filter(o => new Date(o.createdAt) >= t0Month);

        const getRevenue = (arr) => arr.filter(o => o.status === 'COMPLETED').reduce((a, o) => a + Number(o.total), 0);
        const getTicket = (arr) => {
            const completed = arr.filter(o => o.status === 'COMPLETED');
            return completed.length > 0 ? getRevenue(arr) / completed.length : 0;
        };

        // Status distribution
        const dist = { PENDING: 0, COOKING: 0, DELIVERING: 0, COMPLETED: 0, CANCELLED: 0 };
        orders.forEach(o => { if (dist[o.status] !== undefined) dist[o.status]++; });

        const periodOrders = period === 'today' ? today : period === 'week' ? week : month;
        const revenue = getRevenue(periodOrders);
        const ticket = getTicket(periodOrders);
        const pipeline = orders.filter(o => ['PENDING', 'COOKING', 'DELIVERING'].includes(o.status)).length;
        const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

        // Unique customers
        const customerSet = new Set();
        orders.forEach(o => customerSet.add(o.phone || o.customerName));

        // Week chart data (7 days)
        const weekChart = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = startOfLocalDay(i);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            const dayOrders = orders.filter(o => {
                const d = new Date(o.createdAt);
                return d >= dayStart && d < dayEnd;
            });
            weekChart.push({
                label: dayStart.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
                count: dayOrders.length,
                revenue: dayOrders.filter(o => o.status === 'COMPLETED').reduce((a, o) => a + Number(o.total), 0),
            });
        }

        return {
            revenue,
            ticket,
            pipeline,
            periodCount: periodOrders.length,
            recent,
            dist,
            totalCustomers: customerSet.size,
            revenueAll: getRevenue(orders),
            weekChart,
        };
    }, [orders, period]);

    const periodLabel = period === 'today' ? 'Hoje' : period === 'week' ? 'Esta semana' : 'Este mês';

    const statCards = [
        {
            title: `Receita ${periodLabel.toLowerCase()}`,
            value: `R$ ${stats.revenue.toFixed(2)}`,
            sub: `${stats.periodCount} pedidos no período`,
            icon: DollarSign,
            accent: '#22c55e',
            glow: 'rgba(34,197,94,0.12)',
            delay: 0,
        },
        {
            title: `Pedidos ${periodLabel.toLowerCase()}`,
            value: String(stats.periodCount),
            sub: 'Novos pedidos no período',
            icon: ShoppingBag,
            accent: '#f97316',
            glow: 'rgba(249,115,22,0.12)',
            delay: 0.05,
        },
        {
            title: 'Ticket Médio',
            value: `R$ ${stats.ticket.toFixed(2)}`,
            sub: 'Valor médio por pedido',
            icon: Receipt,
            accent: '#a78bfa',
            glow: 'rgba(167,139,250,0.12)',
            delay: 0.1,
        },
        {
            title: 'Em andamento',
            value: String(stats.pipeline),
            sub: 'Forno + entrega ativos',
            icon: Flame,
            accent: '#eab308',
            glow: 'rgba(234,179,8,0.12)',
            delay: 0.15,
        },
    ];

    const statusDistCards = Object.entries(STATUS_LABELS)
        .filter(([key]) => key !== 'CANCELLED')
        .map(([key, cfg]) => ({
            ...cfg,
            count: stats.dist[key] || 0,
            key,
        }));

    const maxChartCount = Math.max(...stats.weekChart.map(d => d.count), 1);

    return (
        <div className="space-y-8">
            {/* Period Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Dashboard</h2>
                    <p className="text-sm text-white/30 mt-1">Visão geral da operação Nona Pizza</p>
                </div>
                <div className="flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
                    {[
                        { id: 'today', label: 'Hoje', icon: Clock },
                        { id: 'week', label: 'Semana', icon: Calendar },
                        { id: 'month', label: 'Mês', icon: BarChart3 },
                    ].map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setPeriod(p.id)}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                                period === p.id
                                    ? 'bg-orange-500/15 text-orange-400 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.25)]'
                                    : 'text-white/35 hover:text-white/60'
                            }`}
                        >
                            <p.icon size={14} />
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((c) => (
                    <motion.div
                        key={c.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: c.delay, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18] p-7"
                        style={{ boxShadow: `0 0 40px ${c.glow}` }}
                    >
                        <div
                            className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full opacity-10 blur-2xl"
                            style={{ background: c.accent }}
                        />
                        <div className="relative flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">{c.title}</p>
                                <p className="mt-2 text-2xl font-black tabular-nums tracking-tight text-white">{c.value}</p>
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

            {/* Week Chart + Pipeline */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* 7 Day Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18] p-8 lg:col-span-3"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-lg font-bold text-white tracking-tight">Pedidos nos Últimos 7 Dias</p>
                            <p className="text-sm text-white/30 mt-1">Volume diário de pedidos</p>
                        </div>
                        <span className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                            Semanal
                        </span>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex items-end gap-3 h-48">
                        {stats.weekChart.map((day, i) => {
                            const pct = (day.count / maxChartCount) * 100;
                            return (
                                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                                    <span className="text-xs font-bold tabular-nums text-white/50">{day.count}</span>
                                    <motion.div
                                        className="w-full rounded-xl min-h-[4px]"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(pct, 3)}%` }}
                                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        style={{
                                            background: i === 6
                                                ? 'linear-gradient(180deg, #f97316, #ea580c)'
                                                : 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                                            boxShadow: i === 6 ? '0 0 20px rgba(249,115,22,0.3)' : 'none',
                                        }}
                                    />
                                    <span className="text-[11px] font-semibold text-white/25 capitalize">{day.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Pipeline Status */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-3xl border border-white/[0.06] bg-[#0c0c18] p-8 lg:col-span-2"
                >
                    <div className="mb-6">
                        <p className="text-lg font-bold text-white tracking-tight">Pipeline</p>
                        <p className="text-sm text-white/30 mt-1">Status em tempo real</p>
                    </div>
                    <div className="space-y-4">
                        {statusDistCards.map((s) => {
                            const pct = orders.length > 0 ? (s.count / orders.length) * 100 : 0;
                            return (
                                <div key={s.key} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="flex h-7 w-7 items-center justify-center rounded-lg"
                                                style={{ background: `${s.color}18` }}
                                            >
                                                <s.icon size={13} style={{ color: s.color }} />
                                            </div>
                                            <span className="text-sm font-semibold text-white/60">{s.label}</span>
                                        </div>
                                        <span className="text-sm font-bold tabular-nums text-white">{s.count}</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                            className="h-full rounded-full"
                                            style={{ background: s.color, minWidth: s.count > 0 ? '4px' : '0' }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary row */}
                    <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-5 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
                            <Users size={16} className="text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-white/30">Total de clientes</p>
                            <p className="text-sm font-bold text-white">{stats.totalCustomers}</p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-xs text-white/30">Receita total</p>
                            <p className="text-sm font-bold text-emerald-400">R$ {stats.revenueAll.toFixed(2)}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Orders + Quick Access */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* Recent Orders Table */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
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
                                                <td className="px-8 py-4 font-bold" style={{ color: sc?.color || '#f97316' }}>#{o.id}</td>
                                                <td className="px-8 py-4 font-medium text-white/70">{o.customerName}</td>
                                                <td className="px-8 py-4">
                                                    <span
                                                        className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                                                        style={{ background: `${sc?.color || '#f97316'}18`, color: sc?.color || '#f97316' }}
                                                    >
                                                        {sc?.label || o.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right font-bold tabular-nums text-white/70">
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
                    transition={{ delay: 0.35 }}
                    className="flex flex-col gap-5 rounded-3xl border border-white/[0.06] bg-[#0c0c18] p-8 lg:col-span-2"
                >
                    <div>
                        <p className="text-lg font-bold text-white tracking-tight">Acesso Rápido</p>
                        <p className="text-sm text-white/30 mt-1">Navegação agilizada</p>
                    </div>
                    <div className="mt-1 space-y-3">
                        {[
                            { label: 'Fila de Pedidos', tab: 'orders', icon: ShoppingBag, color: '#f97316' },
                            { label: 'Gerenciar Produtos', tab: 'products', icon: Clock, color: '#3b82f6' },
                            { label: 'Personalizar Sabores', tab: 'flavors', icon: CheckCircle2, color: '#22c55e' },
                            { label: 'Ver Clientes', tab: 'customers', icon: Users, color: '#a78bfa' },
                        ].map((item) => (
                            <motion.button
                                key={item.tab}
                                type="button"
                                whileHover={{ x: 6, scale: 1.01 }}
                                onClick={() => onNavigate?.(item.tab)}
                                className="flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 transition hover:border-white/[0.1] hover:bg-white/[0.05]"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
                                        style={{ background: `${item.color}15`, boxShadow: `0 8px 20px ${item.color}10` }}
                                    >
                                        <item.icon size={17} style={{ color: item.color }} />
                                    </div>
                                    <span className="text-sm font-bold text-white/80">{item.label}</span>
                                </div>
                                <ArrowRight size={16} className="text-white/20" />
                            </motion.button>
                        ))}
                    </div>
                    <div className="mt-auto rounded-2xl border border-orange-500/15 bg-orange-500/5 p-5">
                        <p className="text-xs leading-relaxed text-white/30 font-medium">
                            💡 Status: O sistema está operando normalmente. Dados sincronizados em tempo real com a cozinha.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Alerts Section */}
            {stats.dist.PENDING > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-3xl border border-orange-500/20 bg-orange-500/5 px-8 py-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 animate-pulse">
                            <ShoppingBag size={20} className="text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-orange-400">
                                🔔 {stats.dist.PENDING} pedido{stats.dist.PENDING > 1 ? 's' : ''} aguardando confirmação
                            </p>
                            <p className="text-xs text-white/35 mt-0.5">Clique para gerenciar a fila de pedidos</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('orders')}
                            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
                        >
                            Ver Pedidos
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
