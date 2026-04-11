import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    Package,
    X,
    Edit3,
    ToggleLeft,
    ToggleRight,
    CheckCircle2,
    AlertCircle,
    Image as ImageIcon,
    Save,
} from 'lucide-react';

function categoryAccent(name) {
    let h = 0;
    for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * 11) % 360;
    return h;
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl ${
                type === 'success'
                    ? 'border-emerald-500/30 bg-[#0c1a14] text-emerald-400'
                    : 'border-red-500/30 bg-[#1a0c0c] text-red-400'
            }`}
        >
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-semibold">{msg}</span>
            <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={14} /></button>
        </motion.div>
    );
}

const inp = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/20';

export default function ProductsManager({ token, search, onSearchChange }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', desc: '', price: '', categoryId: '' });
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [addOpen, setAddOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

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
            showToast('Produto adicionado com sucesso!');
            fetchData();
        } catch (err) {
            showToast('Erro ao adicionar produto', 'error');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editProduct) return;
        try {
            await api.put(
                `/api/admin/products/${editProduct.id}`,
                {
                    name: editProduct.name,
                    desc: editProduct.desc,
                    price: parseFloat(editProduct.price),
                    categoryId: parseInt(editProduct.categoryId, 10),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditProduct(null);
            showToast('Produto atualizado!');
            fetchData();
        } catch {
            showToast('Erro ao atualizar produto', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este produto permanentemente?')) return;
        try {
            await api.delete(`/api/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showToast('Produto excluído.');
            fetchData();
        } catch (e) {
            showToast('Erro ao excluir', 'error');
        }
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-white/40">
                        Total de <strong className="font-semibold text-white/80">{filtered.length}</strong> itens
                        {categoryFilter !== 'all' ? ' nesta categoria' : ' no catálogo'}.
                    </p>
                </div>
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (categories.length && !form.categoryId)
                            setForm((f) => ({ ...f, categoryId: String(categories[0].id) }));
                        setAddOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Adicionar produto
                </motion.button>
            </div>

            {/* Category Chips */}
            <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.06)_transparent]">
                <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`flex min-w-[110px] shrink-0 flex-col items-center rounded-2xl border-2 p-4 text-center transition ${
                        categoryFilter === 'all'
                            ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
                    }`}
                >
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-lg">
                        📋
                    </div>
                    <span className="text-xs font-semibold text-white/80">Todos</span>
                    <span className="mt-0.5 text-[11px] text-white/35">{products.length} itens</span>
                </button>
                {categories.map((c) => {
                    const active = categoryFilter === String(c.id);
                    const h = categoryAccent(c.name);
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategoryFilter(String(c.id))}
                            className={`flex min-w-[110px] shrink-0 flex-col items-center rounded-2xl border-2 p-4 text-center transition ${
                                active
                                    ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
                            }`}
                        >
                            <div
                                className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-inner"
                                style={{
                                    background: `linear-gradient(145deg, hsl(${h} 50% 30%), hsl(${h} 40% 22%))`,
                                }}
                            >
                                {(c.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="line-clamp-2 text-xs font-semibold leading-tight text-white/80">
                                {c.name}
                            </span>
                            <span className="mt-0.5 text-[11px] text-white/35">
                                {countsByCat[c.id] || 0} itens
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-24">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-orange-400" />
                    <span className="text-sm text-white/30">Carregando…</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.08] py-20 text-center">
                    <Package size={40} className="mb-3 text-white/10" />
                    <p className="text-sm font-medium text-white/30">Nenhum produto encontrado</p>
                    <button
                        type="button"
                        onClick={() => {
                            onSearchChange?.('');
                            setCategoryFilter('all');
                        }}
                        className="mt-4 text-sm font-semibold text-orange-400 hover:underline"
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
                                    className="group overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18] transition hover:border-white/[0.1] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                                >
                                    {/* Image Area */}
                                    <div
                                        className="relative flex h-40 items-center justify-center"
                                        style={{
                                            background: `linear-gradient(160deg, hsl(${h} 40% 18%), hsl(${h} 30% 12%))`,
                                        }}
                                    >
                                        <span className="text-5xl opacity-80 drop-shadow-sm">🍕</span>

                                        {/* Action buttons */}
                                        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => setEditProduct({
                                                    ...p,
                                                    categoryId: String(p.category?.id || ''),
                                                })}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/50 text-white/70 shadow-lg backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
                                                aria-label="Editar"
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(p.id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/30 text-red-300 shadow-lg backdrop-blur-sm transition hover:bg-red-500/60 hover:text-white"
                                                aria-label="Excluir"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-base font-bold text-white">{p.name}</h3>
                                            <span className="shrink-0 text-base font-black tabular-nums text-orange-400">
                                                R$ {Number(p.price).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 line-clamp-2 text-sm text-white/40">{p.desc}</p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <span
                                                className="rounded-xl px-2.5 py-1 text-[11px] font-bold"
                                                style={{
                                                    background: `hsl(${h} 40% 18%)`,
                                                    color: `hsl(${h} 60% 65%)`,
                                                }}
                                            >
                                                {p.category?.name}
                                            </span>
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Product Modal */}
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setAddOpen(false)}
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0c0c18] p-7 shadow-2xl"
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 8 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Novo Produto</h2>
                                    <p className="mt-1 text-sm text-white/35">Preencha os dados do cardápio.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddOpen(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-white/40 transition hover:bg-white/[0.05] hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Nome</label>
                                    <input
                                        className={inp}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex.: Pizza média"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Categoria</label>
                                        <select
                                            className={inp}
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
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Preço (R$)</label>
                                        <input
                                            className={inp}
                                            type="number"
                                            step="0.01"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Descrição</label>
                                    <textarea
                                        className={`${inp} min-h-[88px] resize-none`}
                                        value={form.desc}
                                        onChange={(e) => setForm({ ...form, desc: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setAddOpen(false)}
                                        className="flex-1 rounded-xl border border-white/[0.1] py-3 text-sm font-semibold text-white/50 transition hover:bg-white/[0.04] hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Product Modal */}
            <AnimatePresence>
                {editProduct && (
                    <motion.div
                        className="fixed inset-0 z-[7000] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <button
                            type="button"
                            aria-label="Fechar"
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setEditProduct(null)}
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0c0c18] p-7 shadow-2xl"
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 8 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Editar Produto</h2>
                                    <p className="mt-1 text-sm text-white/35">Altere os dados do produto.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditProduct(null)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-white/40 transition hover:bg-white/[0.05] hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Nome</label>
                                    <input
                                        className={inp}
                                        value={editProduct.name}
                                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Categoria</label>
                                        <select
                                            className={inp}
                                            value={editProduct.categoryId}
                                            onChange={(e) => setEditProduct({ ...editProduct, categoryId: e.target.value })}
                                        >
                                            {categories.map((c) => (
                                                <option key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Preço (R$)</label>
                                        <input
                                            className={inp}
                                            type="number"
                                            step="0.01"
                                            value={editProduct.price}
                                            onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Descrição</label>
                                    <textarea
                                        className={`${inp} min-h-[88px] resize-none`}
                                        value={editProduct.desc}
                                        onChange={(e) => setEditProduct({ ...editProduct, desc: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditProduct(null)}
                                        className="flex-1 rounded-xl border border-white/[0.1] py-3 text-sm font-semibold text-white/50 transition hover:bg-white/[0.04] hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
                                    >
                                        <Save size={15} />
                                        Atualizar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}
