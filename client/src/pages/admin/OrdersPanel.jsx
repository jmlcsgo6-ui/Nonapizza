import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Flame,
    Truck,
    CheckCircle2,
    ChevronRight,
    Phone,
    MapPin,
    Inbox,
    RefreshCw,
    Download,
    Eye,
    EyeOff,
    UtensilsCrossed,
} from 'lucide-react';

// ── Config ──────────────────────────────────────────────────────────────────
const COLUMNS = [
    {
        key: 'PENDING',
        label: 'Recebido',
        icon: Clock,
        color: 'orange',
        accent: '#f97316',
        glow: 'rgba(249,115,22,0.15)',
        border: 'rgba(249,115,22,0.2)',
        bg: 'rgba(249,115,22,0.05)',
        badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/25',
        headerBg: 'bg-orange-500/10',
        next: 'COOKING',
        nextLabel: 'Enviar ao Forno',
        dot: 'bg-orange-400',
        progress: 1,
    },
    {
        key: 'COOKING',
        label: 'No forno',
        icon: Flame,
        color: 'yellow',
        accent: '#eab308',
        glow: 'rgba(234,179,8,0.12)',
        border: 'rgba(234,179,8,0.2)',
        bg: 'rgba(234,179,8,0.05)',
        badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/25',
        headerBg: 'bg-yellow-500/10',
        next: 'DELIVERING',
        nextLabel: 'Saiu para entrega',
        dot: 'bg-yellow-400',
        progress: 2,
    },
    {
        key: 'DELIVERING',
        label: 'Em entrega',
        icon: Truck,
        color: 'blue',
        accent: '#3b82f6',
        glow: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.2)',
        bg: 'rgba(59,130,246,0.04)',
        badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/25',
        headerBg: 'bg-blue-500/10',
        next: 'COMPLETED',
        nextLabel: 'Marcar entregue',
        dot: 'bg-blue-400',
        progress: 3,
    },
    {
        key: 'COMPLETED',
        label: 'Concluído',
        icon: CheckCircle2,
        color: 'green',
        accent: '#22c55e',
        glow: 'rgba(34,197,94,0.1)',
        border: 'rgba(34,197,94,0.2)',
        bg: 'rgba(34,197,94,0.04)',
        badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25',
        headerBg: 'bg-emerald-500/10',
        next: null,
        nextLabel: null,
        dot: 'bg-emerald-400',
        progress: 4,
    },
];

// ── Progress Bar ─────────────────────────────────────────────────────────────
function OrderProgress({ currentStep }) {
    const steps = [
        { label: 'Recebido', color: '#f97316' },
        { label: 'Forno', color: '#eab308' },
        { label: 'Entrega', color: '#3b82f6' },
        { label: 'Entregue', color: '#22c55e' },
    ];
    return (
        <div className="flex items-center gap-0.5">
            {steps.map((s, i) => (
                <React.Fragment key={s.label}>
                    <div
                        className="h-1 flex-1 rounded-full transition-all duration-500"
                        style={{
                            background: i + 1 <= currentStep ? s.color : 'rgba(255,255,255,0.08)',
                        }}
                    />
                    {i < steps.length - 1 && <div className="h-1 w-0.5 bg-transparent" />}
                </React.Fragment>
            ))}
        </div>
    );
}

// ── CSV Export ────────────────────────────────────────────────────────────────
function downloadCsv(rows) {
    const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const header = ['id', 'cliente', 'telefone', 'status', 'total', 'criado_em'];
    const lines = [header.join(',')];
    for (const o of rows) {
        lines.push([o.id, o.customerName, o.phone, o.status, o.total, new Date(o.createdAt).toISOString()].map(esc).join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-nona-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, col, onAdvance, moving }) {
    const [hovered, setHovered] = useState(false);

    const timeAgo = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 1000);
        if (diff < 60) return 'Agora mesmo';
        if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
        return new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
                boxShadow: hovered
                    ? `0 8px 32px ${col.glow}, 0 2px 8px rgba(0,0,0,0.4)`
                    : `0 2px 8px rgba(0,0,0,0.3)`,
            }}
            className="relative overflow-hidden rounded-2xl border bg-[#0c0c18] transition-all duration-300"
            // Dynamic border color via inline
            // We use a wrapper trick with the accent
        >
            {/* Left accent line */}
            <div
                className="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl"
                style={{ background: col.accent }}
            />

            {/* Top glow strip */}
            <div
                className="absolute left-3 right-0 top-0 h-[1px]"
                style={{ background: `linear-gradient(to right, ${col.accent}60, transparent)` }}
            />

            <div
                className="border border-white/[0.06] rounded-3xl overflow-hidden"
                style={{ marginLeft: 0 }}
            >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                    <div className="min-w-0">
                        <p className="truncate text-base font-bold text-white leading-tight">
                            {order.customerName}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs font-bold" style={{ color: col.accent }}>
                                #{order.id}
                            </span>
                            <span className="text-white/20">·</span>
                            <span className="text-xs text-white/35 font-medium">{timeAgo(order.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="px-6 pb-4">
                    <OrderProgress currentStep={col.progress} />
                </div>

                {/* Contact info */}
                <div className="mx-6 mb-4 space-y-2">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 border border-white/[0.06]">
                        <Phone size={14} className="shrink-0" style={{ color: col.accent }} />
                        <span className="text-sm text-white/60 font-medium">{order.phone || '—'}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 border border-white/[0.06]">
                        <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: col.accent }} />
                        <span className="text-sm text-white/60 font-medium line-clamp-2 leading-relaxed">{order.address || '—'}</span>
                    </div>
                </div>

                {/* Items */}
                <div className="mx-6 mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <UtensilsCrossed size={12} className="text-white/30" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">Itens do Pedido</span>
                    </div>
                    <div className="space-y-2.5">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold"
                                        style={{ background: `${col.accent}20`, color: col.accent }}
                                    >
                                        {item.qty}×
                                    </span>
                                    <span className="truncate text-sm text-white/70 font-medium">{item.productName}</span>
                                </div>
                                <span className="shrink-0 text-sm font-semibold tabular-nums text-white/30">
                                    R$ {(item.price * item.qty).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 px-6 pb-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Total do Pedido</p>
                        <p className="text-2xl font-black tabular-nums text-white mt-0.5">
                            R$ {Number(order.total).toFixed(2)}
                        </p>
                    </div>

                    {col.next && (
                        <motion.button
                            type="button"
                            onClick={() => onAdvance(order.id, col.next)}
                            disabled={moving}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xl transition disabled:opacity-50"
                            style={{
                                background: col.accent,
                                boxShadow: `0 10px 25px ${col.glow}`,
                            }}
                        >
                            {col.nextLabel}
                            <ChevronRight size={14} strokeWidth={3} />
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ── Column Header ─────────────────────────────────────────────────────────────
function KanbanColumn({ col, orders, onAdvance, movingId }) {
    const { icon: Icon } = col;
    const isEmpty = orders.length === 0;

    return (
        <div className="flex w-[min(100%,360px)] shrink-0 flex-col gap-5">
            {/* Column Header */}
            <div
                className="flex items-center justify-between rounded-3xl border px-6 py-5"
                style={{
                    background: col.bg,
                    borderColor: col.border,
                    boxShadow: `0 0 40px ${col.glow}`,
                }}
            >
                <div className="flex items-center gap-3.5">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                        style={{ background: col.accent, boxShadow: `0 8px 20px ${col.glow}` }}
                    >
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-base font-bold text-white tracking-tight">{col.label}</span>
                </div>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={orders.length}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="rounded-xl px-3 py-1.5 text-xs font-bold tabular-nums"
                        style={{
                            background: `${col.accent}20`,
                            color: col.accent,
                        }}
                    >
                        {orders.length}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Cards Area */}
            <div className="flex min-h-[60vh] flex-col gap-4">
                <AnimatePresence initial={false} mode="popLayout">
                    {orders.map((o) => (
                        <OrderCard
                            key={o.id}
                            order={o}
                            col={col}
                            onAdvance={onAdvance}
                            moving={movingId === o.id}
                        />
                    ))}
                </AnimatePresence>

                {isEmpty && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.06] py-16 text-center"
                    >
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ background: `${col.accent}10` }}
                        >
                            <Inbox size={20} style={{ color: col.accent, opacity: 0.5 }} />
                        </div>
                        <span className="text-xs font-medium text-white/20">Nenhum pedido</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function OrdersPanel({ token, search }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [movingId, setMovingId] = useState(null);
    const [hideCompleted, setHideCompleted] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchOrders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
            setLastUpdated(new Date());
        } catch (e) {
            console.error('Error fetching orders', e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => fetchOrders(true), 10000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateStatus = async (id, status) => {
        setMovingId(id);
        try {
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
            await api.put(`/api/admin/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (e) {
            console.error('Failed to update status', e);
            fetchOrders();
        } finally {
            setMovingId(null);
        }
    };

    const filtered = useMemo(() => {
        const q = (search || '').trim().toLowerCase();
        return orders.filter((o) => {
            if (hideCompleted && o.status === 'COMPLETED') return false;
            if (!q) return true;
            return (
                String(o.id).includes(q.replace('#', '')) ||
                (o.customerName && o.customerName.toLowerCase().includes(q)) ||
                (o.phone && o.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')))
            );
        });
    }, [orders, search, hideCompleted]);

    const totalActive = orders.filter(o => ['PENDING','COOKING','DELIVERING'].includes(o.status)).length;

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Stats pip */}
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                    <span className="text-sm font-semibold text-white">
                        {totalActive}
                    </span>
                    <span className="text-xs text-white/35">pedidos ativos</span>
                </div>

                {lastUpdated && (
                    <span className="text-[11px] text-white/20">
                        Atualizado {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                )}

                <div className="ml-auto flex items-center gap-2">
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setHideCompleted((v) => !v)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            hideCompleted
                                ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                                : 'border-white/[0.08] bg-white/[0.03] text-white/45 hover:text-white/70'
                        }`}
                    >
                        {hideCompleted ? <Eye size={13} /> : <EyeOff size={13} />}
                        {hideCompleted ? 'Mostrar concluídos' : 'Ocultar concluídos'}
                    </motion.button>

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => downloadCsv(filtered)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/45 transition hover:text-white/70"
                    >
                        <Download size={13} />
                        CSV
                    </motion.button>

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.03, rotate: 180 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ rotate: { duration: 0.4 } }}
                        onClick={() => fetchOrders()}
                        disabled={loading}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:text-white/70 disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    </motion.button>
                </div>
            </div>

            {/* Loading state */}
            {loading && orders.length === 0 ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-24 text-white/30">
                    <RefreshCw size={18} className="animate-spin" />
                    <span className="text-sm font-medium">Carregando pedidos…</span>
                </div>
            ) : (
                /* Kanban Board */
                <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.06)_transparent]">
                    {COLUMNS.map((col) => (
                        <KanbanColumn
                            key={col.key}
                            col={col}
                            orders={filtered.filter((o) => o.status === col.key)}
                            onAdvance={updateStatus}
                            movingId={movingId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
