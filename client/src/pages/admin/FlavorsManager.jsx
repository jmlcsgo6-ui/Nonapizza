import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, FlaskConical, X } from 'lucide-react';

export default function FlavorsManager({ token, search, onSearchChange }) {
    const [flavors, setFlavors] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [addOpen, setAddOpen] = useState(false);

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
            fetchFlavors();
        } catch (err) {
            alert('Erro ao adicionar sabor');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este sabor do builder?')) return;
        try {
            await api.delete(`/api/admin/ingredients/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchFlavors();
        } catch (e) {}
    };

    const filtered = useMemo(
        () => flavors.filter((f) => f.name.toLowerCase().includes((search || '').toLowerCase())),
        [flavors, search]
    );

    const inputModal =
        'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/20';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-600">
                    <strong className="font-semibold text-stone-900">{filtered.length}</strong> sabores no montador.
                </p>
                <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Adicionar sabor
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                            <th className="px-5 py-4">Sabor</th>
                            <th className="px-5 py-4 text-right">Acréscimo</th>
                            <th className="w-16 px-3 py-4 text-right"> </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        <AnimatePresence initial={false} mode="popLayout">
                            {filtered.map((f) => (
                                <motion.tr
                                    layout
                                    key={f.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="hover:bg-stone-50/80"
                                >
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-stone-900">{f.name}</p>
                                        <p className="text-[11px] text-stone-400">id {f.id}</p>
                                    </td>
                                    <td className="px-5 py-4 text-right text-base font-bold tabular-nums text-stone-900">
                                        + R$ {Number(f.price).toFixed(2)}
                                    </td>
                                    <td className="px-3 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(f.id)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center py-16 text-center">
                        <FlaskConical size={40} className="mb-3 text-stone-300" />
                        <p className="text-sm font-medium text-stone-500">Nenhum sabor encontrado</p>
                        <button
                            type="button"
                            onClick={() => onSearchChange?.('')}
                            className="mt-3 text-sm font-semibold text-primary hover:underline"
                        >
                            Limpar busca
                        </button>
                    </div>
                )}
            </div>

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
                                    <h2 className="text-lg font-bold text-stone-900">Novo sabor</h2>
                                    <p className="mt-1 text-sm text-stone-500">Ingrediente no builder.</p>
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
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex.: Calabresa"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-stone-600">Preço adicional (R$)</label>
                                    <input
                                        className={inputModal}
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
