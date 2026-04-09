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

export default function OrdersPanel({ token, search }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
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
        const q = (search || '').trim().toLowerCase();
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
                <p className="text-sm text-stone-600">
                    Use <strong className="font-semibold text-stone-800">Próximo</strong> para mover o pedido na fila de
                    produção.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            fetchOrders();
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                    <button
                        type="button"
                        onClick={exportFiltered}
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                    >
                        <Download size={14} />
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200/90 bg-white p-3 shadow-sm">
                <button
                    type="button"
                    onClick={() => setHideCompleted((v) => !v)}
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                        hideCompleted
                            ? 'border-primary/40 bg-orange-50 text-primary'
                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                >
                    {hideCompleted ? <Eye size={14} /> : <EyeOff size={14} />}
                    {hideCompleted ? 'Mostrar concluídos' : 'Ocultar concluídos'}
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex items-center justify-center rounded-xl border border-stone-200 bg-white py-20 text-sm text-stone-500 shadow-sm">
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
                                    className={`flex items-center justify-between rounded-xl border border-y border-r border-stone-200 bg-white px-3 py-3 shadow-sm border-l-4 ${left}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${badge} text-white shadow-md`}
                                        >
                                            <Icon size={15} />
                                        </div>
                                        <span className="text-sm font-semibold text-stone-900">{label}</span>
                                    </div>
                                    <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-stone-500">
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
                                                className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm transition hover:shadow-md"
                                            >
                                                <div className="mb-3 flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[15px] font-semibold text-stone-900">
                                                            {o.customerName}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-stone-500">
                                                            <span className="font-semibold text-primary">#{o.id}</span>
                                                            <span className="mx-1.5 text-stone-300">·</span>
                                                            {new Date(o.createdAt).toLocaleString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-3 space-y-1.5 text-xs text-stone-600">
                                                    <div className="flex items-start gap-2 rounded-lg bg-stone-50 px-2.5 py-2">
                                                        <Phone size={13} className="mt-0.5 shrink-0 text-primary" />
                                                        <span className="break-all">{o.phone || '—'}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 rounded-lg bg-stone-50 px-2.5 py-2">
                                                        <MapPin size={13} className="mt-0.5 shrink-0 text-primary" />
                                                        <span className="line-clamp-3">{o.address || '—'}</span>
                                                    </div>
                                                </div>

                                                <div className="mb-3 space-y-2 rounded-lg border border-stone-100 bg-stone-50/80 p-3">
                                                    {o.items.map((i, idx) => (
                                                        <div key={idx} className="flex justify-between gap-2 text-xs">
                                                            <span className="min-w-0 text-stone-700">
                                                                <span className="mr-1.5 font-medium text-stone-400">
                                                                    {i.qty}×
                                                                </span>
                                                                {i.productName}
                                                            </span>
                                                            <span className="shrink-0 tabular-nums text-stone-500">
                                                                R$ {(i.price * i.qty).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex items-end justify-between gap-3">
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                                                            Total
                                                        </p>
                                                        <p className="text-lg font-bold tabular-nums text-stone-900">
                                                            R$ {Number(o.total).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    {next && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStatus(o.id, next)}
                                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-stone-800"
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
                                        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white/60 py-12 text-center">
                                            <Inbox size={28} className="mb-2 text-stone-300" />
                                            <span className="text-xs font-medium text-stone-400">Nenhum pedido</span>
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
