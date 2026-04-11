import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    FlaskConical,
    X,
    Edit3,
    Save,
    CheckCircle2,
    AlertCircle,
    DollarSign,
} from 'lucide-react';

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

export default function FlavorsManager({ token, search, onSearchChange }) {
    const [flavors, setFlavors] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [editFlavor, setEditFlavor] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchFlavors = async () => {
        try {
            const res = await api.get('/api/ingredients');
            setFlavors(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchFlavors();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post(
                '/api/admin/ingredients',
                { name, price: parseFloat(price) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setName('');
            setPrice('');
            setAddOpen(false);
            showToast('Sabor adicionado com sucesso!');
            fetchFlavors();
        } catch (err) {
            showToast('Erro ao adicionar sabor', 'error');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editFlavor) return;
        try {
            await api.put(
                `/api/admin/ingredients/${editFlavor.id}`,
                { name: editFlavor.name, price: parseFloat(editFlavor.price) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditFlavor(null);
            showToast('Sabor atualizado!');
            fetchFlavors();
        } catch {
            showToast('Erro ao atualizar', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este sabor do builder?')) return;
        try {
            await api.delete(`/api/admin/ingredients/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showToast('Sabor excluído.');
            fetchFlavors();
        } catch (e) {
            showToast('Erro ao excluir', 'error');
        }
    };

    const filtered = useMemo(
        () => flavors.filter((f) => f.name.toLowerCase().includes((search || '').toLowerCase())),
        [flavors, search]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white/40">
                    <strong className="font-semibold text-white/80">{filtered.length}</strong> sabores no montador.
                </p>
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAddOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Adicionar sabor
                </motion.button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18]">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">Sabor</th>
                            <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">Acréscimo</th>
                            <th className="w-28 px-4 py-5 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        <AnimatePresence initial={false} mode="popLayout">
                            {filtered.map((f) => (
                                <motion.tr
                                    layout
                                    key={f.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="transition hover:bg-white/[0.02]"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                                <FlaskConical size={15} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{f.name}</p>
                                                <p className="text-[11px] text-white/25">id {f.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums bg-emerald-500/10 text-emerald-400">
                                            <DollarSign size={13} />
                                            + R$ {Number(f.price).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditFlavor({ ...f })}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(f.id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center py-20 text-center">
                        <FlaskConical size={40} className="mb-3 text-white/10" />
                        <p className="text-sm font-medium text-white/30">Nenhum sabor encontrado</p>
                        <button
                            type="button"
                            onClick={() => onSearchChange?.('')}
                            className="mt-4 text-sm font-semibold text-orange-400 hover:underline"
                        >
                            Limpar busca
                        </button>
                    </div>
                )}
            </div>

            {/* Add Modal */}
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
                                    <h2 className="text-lg font-bold text-white">Novo Sabor</h2>
                                    <p className="mt-1 text-sm text-white/35">Ingrediente no builder.</p>
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
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex.: Calabresa"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Preço adicional (R$)</label>
                                    <input
                                        className={inp}
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
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

            {/* Edit Modal */}
            <AnimatePresence>
                {editFlavor && (
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
                            onClick={() => setEditFlavor(null)}
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
                                    <h2 className="text-lg font-bold text-white">Editar Sabor</h2>
                                    <p className="mt-1 text-sm text-white/35">Altere os dados do sabor.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditFlavor(null)}
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
                                        value={editFlavor.name}
                                        onChange={(e) => setEditFlavor({ ...editFlavor, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Preço adicional (R$)</label>
                                    <input
                                        className={inp}
                                        type="number"
                                        step="0.01"
                                        value={editFlavor.price}
                                        onChange={(e) => setEditFlavor({ ...editFlavor, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditFlavor(null)}
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
