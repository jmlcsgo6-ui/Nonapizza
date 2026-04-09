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
    Search,
    Download,
    RefreshCw,
    Eye,
    EyeOff,
} from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: { label: 'Recebido', left: 'border-l-orange-500', badge: 'bg-orange-500', next: 'COOKING', icon: Clock },
    COOKING: { label: 'No forno', left: 'border-l-[#FF5F00]', badge: 'bg-primary', next: 'DELIVERING', icon: Flame },
    DELIVERING: { label: 'Em entrega', left: 'border-l-blue-500', badge: 'bg-blue-500', next: 'COMPLETED', icon: Truck },
    COMPLETED: { label: 'Concluído', left: 'border-l-emerald-500', badge: 'bg-emerald-500', next: null, icon: CheckCircle2 },
};

const COLS = ['PENDING', 'COOKING', 'DELIVERING', 'COMPLETED'];

function downloadCsv(rows, filename) {
    const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const header = ['id', 'cliente', 'telefone', 'status', 'total', 'criado_em'];
    const lines = [header.join(',')];
    for (const o of rows) {
        lines.push(
            [o.id, o.customerName, o.phone, o.status, o.total, new Date(o.createdAt).toISOString()]
                .map(esc)
                .join(',')
        );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function OrdersPanel({ token }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [hideCompleted, setHideCompleted] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
        } catch (e) {
            console.error('Error fetching orders', e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateStatus = async (id, status) => {
        try {
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
            await api.put(
                `/api/admin/orders/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (e) {
            console.error('Failed to update status', e);
            fetchOrders();
        }
    };

    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        return orders.filter((o) => {
            if (hideCompleted && o.status === 'COMPLETED') return false;
            if (!q) return true;
            const idMatch = String(o.id).includes(q.replace('#', ''));
            return (
                idMatch ||
                (o.customerName && o.customerName.toLowerCase().includes(q)) ||
                (o.phone && o.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')))
            );
        });
    }, [orders, search, hideCompleted]);

    const exportFiltered = () => {
        const list = filteredOrders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        downloadCsv(list, `pedidos-nona-${new Date().toISOString().slice(0, 10)}.csv`);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white/50">
                    Arraste visualmente por coluna. Use <strong className="text-white/70">Próximo</strong> para avançar o
                    status.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            fetchOrders();
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.06]"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                    <button
                        type="button"
                        onClick={exportFiltered}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.06]"
                    >
                        <Download size={14} />
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-4 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                        className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-primary"
                        placeholder="Buscar por nome, telefone ou #pedido…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setHideCompleted((v) => !v)}
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition ${
                        hideCompleted
                            ? 'border-primary/40 bg-primary/15 text-primary'
                            : 'border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white'
                    }`}
                >
                    {hideCompleted ? <Eye size={14} /> : <EyeOff size={14} />}
                    {hideCompleted ? 'Mostrar concluídos' : 'Ocultar concluídos'}
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex items-center justify-center rounded-xl border border-white/[0.06] py-20 text-sm text-white/40">
                    Carregando pedidos…
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {COLS.map((statusKey) => {
                        const { label, left, next, badge, icon: Icon } = STATUS_CONFIG[statusKey];
                        const list = filteredOrders.filter((o) => o.status === statusKey);

                        return (
                            <div key={statusKey} className="flex w-[min(100%,340px)] shrink-0 flex-col gap-3">
                                <div
                                    className={`flex items-center justify-between rounded-xl border border-y border-r border-white/[0.06] border-l-4 bg-[#0f0f0f] px-3 py-3 ${left}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${badge} text-white shadow-md`}
                                        >
                                            <Icon size={15} />
                                        </div>
                                        <span className="text-sm font-semibold text-white">{label}</span>
                                    </div>
                                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-medium tabular-nums text-white/55">
                                        {list.length}
                                    </span>
                                </div>

                                <div className="flex min-h-[52vh] flex-col gap-3">
                                    <AnimatePresence initial={false} mode="popLayout">
                                        {list.map((o) => (
                                            <motion.div
                                                layout
                                                key={o.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-4 shadow-sm transition hover:border-white/[0.1]"
                                            >
                                                <div className="mb-3 flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[15px] font-semibold text-white">
                                                            {o.customerName}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-white/40">
                                                            <span className="font-medium text-primary/90">#{o.id}</span>
                                                            <span className="mx-1.5 text-white/20">·</span>
                                                            {new Date(o.createdAt).toLocaleString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-3 space-y-1.5 text-xs text-white/55">
                                                    <div className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-2.5 py-2">
                                                        <Phone size={13} className="mt-0.5 shrink-0 text-primary/80" />
                                                        <span className="break-all">{o.phone || '—'}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-2.5 py-2">
                                                        <MapPin size={13} className="mt-0.5 shrink-0 text-primary/80" />
                                                        <span className="line-clamp-3">{o.address || '—'}</span>
                                                    </div>
                                                </div>

                                                <div className="mb-3 space-y-2 rounded-lg border border-white/[0.04] bg-black/30 p-3">
                                                    {o.items.map((i, idx) => (
                                                        <div key={idx} className="flex justify-between gap-2 text-xs">
                                                            <span className="min-w-0 text-white/75">
                                                                <span className="mr-1.5 font-medium text-white/35">{i.qty}×</span>
                                                                {i.productName}
                                                            </span>
                                                            <span className="shrink-0 tabular-nums text-white/40">
                                                                R$ {(i.price * i.qty).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex items-end justify-between gap-3">
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
                                                            Total
                                                        </p>
                                                        <p className="text-lg font-semibold tabular-nums text-primary">
                                                            R$ {Number(o.total).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    {next && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStatus(o.id, next)}
                                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover"
                                                        >
                                                            Próximo
                                                            <ChevronRight size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {list.length === 0 && (
                                        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] py-12 text-center">
                                            <Inbox size={28} className="mb-2 text-white/15" />
                                            <span className="text-xs font-medium text-white/30">Nenhum pedido</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
