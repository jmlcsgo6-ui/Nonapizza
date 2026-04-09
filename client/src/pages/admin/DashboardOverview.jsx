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
            title: 'Receita total',
            value: `R$ ${stats.revenueAll.toFixed(2)}`,
            hint: 'Histórico concluído',
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
                        className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
                                {c.title}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-primary">
                                <c.icon size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold tabular-nums tracking-tight text-stone-900">{c.value}</p>
                        <p className="mt-2 text-xs text-stone-500">{c.hint}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm lg:col-span-3"
                >
                    <div className="border-b border-stone-200 bg-stone-50/80 px-5 py-4">
                        <h2 className="text-sm font-bold text-stone-900">Pedidos recentes</h2>
                        <p className="mt-0.5 text-xs text-stone-500">Últimas movimentações</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-stone-100 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                                    <th className="px-5 py-3">Pedido</th>
                                    <th className="px-5 py-3">Cliente</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {stats.recent.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-stone-400">
                                            Nenhum pedido ainda.
                                        </td>
                                    </tr>
                                ) : (
                                    stats.recent.map((o) => (
                                        <tr key={o.id} className="text-stone-700 hover:bg-stone-50/80">
                                            <td className="px-5 py-3 font-bold text-primary">#{o.id}</td>
                                            <td className="px-5 py-3 font-medium">{o.customerName}</td>
                                            <td className="px-5 py-3 text-xs text-stone-500">{o.status}</td>
                                            <td className="px-5 py-3 text-right font-semibold tabular-nums">
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
                    className="flex flex-col rounded-2xl border border-stone-200/90 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 p-5 shadow-sm lg:col-span-2"
                >
                    <h2 className="text-sm font-bold text-stone-900">Atalhos</h2>
                    <p className="mt-1 text-xs text-stone-600">Áreas mais usadas.</p>
                    <ul className="mt-5 space-y-2">
                        {[
                            { label: 'Fila de pedidos', tab: 'orders' },
                            { label: 'Catálogo de produtos', tab: 'products' },
                            { label: 'Sabores do builder', tab: 'flavors' },
                        ].map((item) => (
                            <li key={item.tab}>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 text-left text-sm font-semibold text-stone-800 shadow-sm transition hover:border-primary/30 hover:bg-orange-50/50"
                                    onClick={() => onNavigate?.(item.tab)}
                                >
                                    {item.label}
                                    <ArrowRight size={16} className="text-stone-400" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-[11px] leading-relaxed text-stone-500">
                        Use a busca no topo em Pedidos, Produtos e Sabores.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
