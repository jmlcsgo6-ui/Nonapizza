import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Search, Package } from 'lucide-react';

export default function ProductsManager({ token }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', desc: '', price: '', categoryId: '' });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [p, c] = await Promise.all([api.get('/api/products'), api.get('/api/categories')]);
            setProducts(p.data);
            setCategories(c.data);
            if (c.data.length > 0 && !form.categoryId) setForm((f) => ({ ...f, categoryId: c.data[0].id }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post(
                '/api/admin/products',
                { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId, 10) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setForm({ name: '', desc: '', price: '', categoryId: categories[0]?.id || '' });
            fetchData();
        } catch (e) {
            alert('Erro ao adicionar produto');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este produto permanentemente?')) return;
        try {
            await api.delete(`/api/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (e) {}
    };

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchCat = categoryFilter === 'all' || String(p.category?.id) === categoryFilter;
            const q = search.trim().toLowerCase();
            const matchText =
                !q ||
                p.name.toLowerCase().includes(q) ||
                (p.category?.name && p.category.name.toLowerCase().includes(q));
            return matchCat && matchText;
        });
    }, [products, search, categoryFilter]);

    const inputStyle =
        'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary';

    return (
        <div className="space-y-6">
            <p className="text-sm text-white/50">
                Cadastre tamanhos e itens do cardápio. A lista à esquerda atualiza em tempo real após salvar.
            </p>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 lg:col-span-7"
                >
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                size={16}
                            />
                            <input
                                className="w-full rounded-lg border border-white/[0.08] bg-[#0c0c0c] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-primary"
                                placeholder="Buscar por nome ou categoria…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="rounded-lg border border-white/[0.08] bg-[#0c0c0c] px-3 py-2.5 text-sm text-white outline-none focus:border-primary"
                        >
                            <option value="all">Todas categorias</option>
                            {categories.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c0c]">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-medium uppercase tracking-wide text-white/40">
                                    <th className="px-4 py-3">Produto</th>
                                    <th className="hidden px-4 py-3 sm:table-cell">Categoria</th>
                                    <th className="px-4 py-3 text-right">Preço</th>
                                    <th className="w-14 px-2 py-3 text-right"> </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                <AnimatePresence initial={false} mode="popLayout">
                                    {filtered.map((p) => (
                                        <motion.tr
                                            layout
                                            key={p.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02]"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-white">{p.name}</p>
                                                <p className="mt-0.5 line-clamp-1 text-xs text-white/35">{p.desc}</p>
                                                <p className="mt-1 text-[10px] text-white/25 sm:hidden">{p.category?.name}</p>
                                            </td>
                                            <td className="hidden px-4 py-3 sm:table-cell">
                                                <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/55">
                                                    {p.category?.name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium tabular-nums text-white/90">
                                                R$ {Number(p.price).toFixed(2)}
                                            </td>
                                            <td className="px-2 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(p.id)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {!loading && filtered.length === 0 && (
                            <div className="flex flex-col items-center py-16 text-center">
                                <Package size={36} className="mb-3 text-white/10" />
                                <p className="text-sm text-white/35">Nenhum produto encontrado</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5 lg:col-span-5 lg:sticky lg:top-4 lg:self-start"
                >
                    <div className="mb-5 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                            <Plus size={18} />
                        </div>
                        <h2 className="text-sm font-semibold text-white">Novo produto</h2>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/45">Nome</label>
                            <input
                                className={inputStyle}
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Ex.: Pizza média"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/45">Categoria</label>
                                <select
                                    className={inputStyle}
                                    value={form.categoryId}
                                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-[#0c0c0c]">
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/45">Preço (R$)</label>
                                <input
                                    className={inputStyle}
                                    type="number"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/45">Descrição</label>
                            <textarea
                                className={`${inputStyle} min-h-[88px] resize-none`}
                                value={form.desc}
                                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                                placeholder="Detalhes para o cardápio"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
                        >
                            Cadastrar produto
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
