import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Package, X } from 'lucide-react';

function categoryAccent(name) {
    let h = 0;
    for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * 11) % 360;
    return h;
}

export default function ProductsManager({ token, search, onSearchChange }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', desc: '', price: '', categoryId: '' });
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [addOpen, setAddOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [p, c] = await Promise.all([api.get('/api/products'), api.get('/api/categories')]);
            setProducts(p.data);
            setCategories(c.data);
            if (c.data.length > 0 && !form.categoryId)
                setForm((f) => ({ ...f, categoryId: String(c.data[0].id) }));
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
            setForm({ name: '', desc: '', price: '', categoryId: String(categories[0]?.id || '') });
            setAddOpen(false);
            fetchData();
        } catch (err) {
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

    const countsByCat = useMemo(() => {
        const m = {};
        for (const p of products) {
            const id = p.category?.id;
            if (id != null) m[id] = (m[id] || 0) + 1;
        }
        return m;
    }, [products]);

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchCat = categoryFilter === 'all' || String(p.category?.id) === categoryFilter;
            const q = (search || '').trim().toLowerCase();
            const matchText =
                !q ||
                p.name.toLowerCase().includes(q) ||
                (p.category?.name && p.category.name.toLowerCase().includes(q));
            return matchCat && matchText;
        });
    }, [products, search, categoryFilter]);

    const inputModal =
        'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/20';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-600">
                    Total de <strong className="font-semibold text-stone-900">{filtered.length}</strong> itens
                    {categoryFilter !== 'all' ? ' nesta categoria' : ' no catálogo'}.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        if (categories.length && !form.categoryId)
                            setForm((f) => ({ ...f, categoryId: String(categories[0].id) }));
                        setAddOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Adicionar produto
                </button>
            </div>

            <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`flex min-w-[120px] shrink-0 flex-col items-center rounded-2xl border-2 bg-white p-4 text-center shadow-sm transition ${
                        categoryFilter === 'all'
                            ? 'border-amber-300 ring-2 ring-amber-200/60'
                            : 'border-stone-200 hover:border-stone-300'
                    }`}
                >
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-stone-100 to-stone-200 text-xl">
                        📋
                    </div>
                    <span className="text-xs font-semibold text-stone-800">Todos</span>
                    <span className="mt-0.5 text-[11px] text-stone-500">{products.length} itens</span>
                </button>
                {categories.map((c) => {
                    const active = categoryFilter === String(c.id);
                    const h = categoryAccent(c.name);
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategoryFilter(String(c.id))}
                            className={`flex min-w-[120px] shrink-0 flex-col items-center rounded-2xl border-2 bg-white p-4 text-center shadow-sm transition ${
                                active
                                    ? 'border-amber-300 ring-2 ring-amber-200/60'
                                    : 'border-stone-200 hover:border-stone-300'
                            }`}
                        >
                            <div
                                className="mb-2 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-stone-800 shadow-inner"
                                style={{
                                    background: `linear-gradient(145deg, hsl(${h} 65% 88%), hsl(${h} 50% 78%))`,
                                }}
                            >
                                {(c.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="line-clamp-2 text-xs font-semibold leading-tight text-stone-800">
                                {c.name}
                            </span>
                            <span className="mt-0.5 text-[11px] text-stone-500">
                                {countsByCat[c.id] || 0} itens
                            </span>
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-stone-500">Carregando…</div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/70 py-20 shadow-sm">
                    <Package size={40} className="mb-3 text-stone-300" />
                    <p className="text-sm font-medium text-stone-500">Nenhum produto encontrado</p>
                    <button
                        type="button"
                        onClick={() => {
                            onSearchChange?.('');
                            setCategoryFilter('all');
                        }}
                        className="mt-4 text-sm font-semibold text-primary hover:underline"
                    >
                        Limpar filtros
                    </button>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((p) => {
                            const h = categoryAccent(p.category?.name);
                            return (
                                <motion.article
                                    layout
                                    key={p.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="group overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <div
                                        className="relative flex h-40 items-center justify-center"
                                        style={{
                                            background: `linear-gradient(160deg, hsl(${h} 60% 90%), hsl(${h} 45% 82%))`,
                                        }}
                                    >
                                        <span className="text-5xl opacity-90 drop-shadow-sm">🍕</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(p.id)}
                                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-red-500 shadow-md opacity-0 transition group-hover:opacity-100 hover:bg-red-50"
                                            aria-label="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-base font-bold text-stone-900">{p.name}</h3>
                                            <span className="shrink-0 text-base font-bold text-stone-900">
                                                R$ {Number(p.price).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm text-stone-500">{p.desc}</p>
                                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                                            {p.category?.name}
                                        </p>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {addOpen && (
                    <motion.div
                        className="fixed inset-0 z-[7000] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <button
                            type="button"
                            aria-label="Fechar"
                            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                            onClick={() => setAddOpen(false)}
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            className="relative z-10 w-full max-w-md rounded-2xl border border-stone-200 bg-[#f9f5f0] p-6 shadow-2xl"
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 8 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-stone-900">Novo produto</h2>
                                    <p className="mt-1 text-sm text-stone-500">Preencha os dados do cardápio.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddOpen(false)}
                                    className="rounded-xl p-2 text-stone-400 transition hover:bg-stone-200/80 hover:text-stone-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-stone-600">Nome</label>
                                    <input
                                        className={inputModal}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex.: Pizza média"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-stone-600">Categoria</label>
                                        <select
                                            className={inputModal}
                                            value={form.categoryId}
                                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                            required
                                        >
                                            {categories.map((c) => (
                                                <option key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-stone-600">Preço (R$)</label>
                                        <input
                                            className={inputModal}
                                            type="number"
                                            step="0.01"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-stone-600">Descrição</label>
                                    <textarea
                                        className={`${inputModal} min-h-[88px] resize-none`}
                                        value={form.desc}
                                        onChange={(e) => setForm({ ...form, desc: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setAddOpen(false)}
                                        className="flex-1 rounded-xl border border-stone-300 bg-white py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
