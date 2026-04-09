import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import { motion } from 'framer-motion';
import {
    DollarSign,
    ShoppingBag,
    Flame,
    Activity,
    ArrowRight,
} from 'lucide-react';

function startOfLocalDay() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

export default function DashboardOverview({ token, onNavigate }) {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/api/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(res.data);
            } catch (e) {
                console.error('Error fetching admin stats', e);
            }
        };
        fetchOrders();
    }, [token]);

    const stats = useMemo(() => {
        const t0 = startOfLocalDay();
        const todayOrders = orders.filter((o) => new Date(o.createdAt) >= t0);
        const revenueToday = todayOrders
            .filter((o) => o.status === 'COMPLETED')
            .reduce((acc, o) => acc + Number(o.total), 0);
        const revenueAll = orders
            .filter((o) => o.status === 'COMPLETED')
            .reduce((acc, o) => acc + Number(o.total), 0);
        const pipeline = orders.filter((o) =>
            ['PENDING', 'COOKING', 'DELIVERING'].includes(o.status)
        ).length;
        const todayCount = todayOrders.length;

        const recent = [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6);

        return { revenueToday, revenueAll, pipeline, todayCount, recent };
    }, [orders]);

    const cards = [
        {
            title: 'Receita hoje',
            value: `R$ ${stats.revenueToday.toFixed(2)}`,
            hint: 'Pedidos concluídos hoje',
            icon: DollarSign,
            delay: 0,
        },
        {
            title: 'Pedidos hoje',
            value: String(stats.todayCount),
            hint: 'Novos pedidos no dia',
            icon: ShoppingBag,
            delay: 0.05,
        },
        {
            title: 'Em andamento',
            value: String(stats.pipeline),
            hint: 'Recebido, forno ou entrega',
            icon: Flame,
            delay: 0.1,
        },
        {
            title: 'Receita total (hist.)',
            value: `R$ ${stats.revenueAll.toFixed(2)}`,
            hint: 'Todos os pedidos concluídos',
            icon: Activity,
            delay: 0.15,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((c) => (
                    <motion.div
                        key={c.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: c.delay, duration: 0.25 }}
                        className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wide text-white/40">{c.title}</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-primary">
                                <c.icon size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-semibold tabular-nums tracking-tight text-white">{c.value}</p>
                        <p className="mt-2 text-xs text-white/40">{c.hint}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] lg:col-span-3"
                >
                    <div className="border-b border-white/[0.06] px-5 py-4">
                        <h2 className="text-sm font-semibold text-white">Pedidos recentes</h2>
                        <p className="mt-0.5 text-xs text-white/45">Últimas movimentações na loja</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wide text-white/35">
                                    <th className="px-5 py-3">Pedido</th>
                                    <th className="px-5 py-3">Cliente</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {stats.recent.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-white/35">
                                            Nenhum pedido ainda.
                                        </td>
                                    </tr>
                                ) : (
                                    stats.recent.map((o) => (
                                        <tr key={o.id} className="text-white/80 hover:bg-white/[0.02]">
                                            <td className="px-5 py-3 font-medium text-primary">#{o.id}</td>
                                            <td className="px-5 py-3">{o.customerName}</td>
                                            <td className="px-5 py-3 text-xs text-white/55">{o.status}</td>
                                            <td className="px-5 py-3 text-right tabular-nums font-medium">
                                                R$ {Number(o.total).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-col rounded-xl border border-white/[0.06] bg-gradient-to-br from-primary/20 via-[#0c0c0c] to-[#0c0c0c] p-5 lg:col-span-2"
                >
                    <h2 className="text-sm font-semibold text-white">Atalhos</h2>
                    <p className="mt-1 text-xs text-white/50">Acesse as áreas mais usadas do painel.</p>
                    <ul className="mt-5 space-y-2">
                        {[
                            { label: 'Fila de pedidos', tab: 'orders' },
                            { label: 'Catálogo de produtos', tab: 'products' },
                            { label: 'Sabores do builder', tab: 'flavors' },
                        ].map((item) => (
                            <li key={item.tab}>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-black/20 px-4 py-3 text-left text-sm font-medium text-white/90 transition hover:border-primary/40 hover:bg-primary/10"
                                    onClick={() => onNavigate?.(item.tab)}
                                >
                                    {item.label}
                                    <ArrowRight size={16} className="text-white/35" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-[11px] leading-relaxed text-white/35">
                        Dica: em <strong className="text-white/55">Pedidos</strong>, use busca e exporte CSV para
                        conferência no final do dia.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
