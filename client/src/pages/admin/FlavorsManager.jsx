import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Search, FlaskConical } from 'lucide-react';

export default function FlavorsManager({ token }) {
    const [flavors, setFlavors] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [search, setSearch] = useState('');

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
            fetchFlavors();
        } catch (e) {
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
        () => flavors.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())),
        [flavors, search]
    );

    const inputStyle =
        'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary';

    return (
        <div className="space-y-6">
            <p className="text-sm text-white/50">
                Ingredientes e sabores exibidos no montador de pizza. Preço é somado ao total da pizza.
            </p>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 lg:col-span-7"
                >
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                            size={16}
                        />
                        <input
                            className="w-full rounded-lg border border-white/[0.08] bg-[#0c0c0c] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-primary"
                            placeholder="Buscar sabores…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c0c]">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-medium uppercase tracking-wide text-white/40">
                                    <th className="px-4 py-3">Sabor</th>
                                    <th className="px-4 py-3 text-right">Acréscimo</th>
                                    <th className="w-14 px-2 py-3 text-right"> </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                <AnimatePresence initial={false} mode="popLayout">
                                    {filtered.map((f) => (
                                        <motion.tr
                                            layout
                                            key={f.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02]"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-white">{f.name}</p>
                                                <p className="text-[10px] text-white/25">id {f.id}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium tabular-nums text-primary/95">
                                                + R$ {Number(f.price).toFixed(2)}
                                            </td>
                                            <td className="px-2 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(f.id)}
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
                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center py-16 text-center">
                                <FlaskConical size={36} className="mb-3 text-white/10" />
                                <p className="text-sm text-white/35">Nenhum sabor encontrado</p>
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
                        <h2 className="text-sm font-semibold text-white">Novo sabor</h2>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/45">Nome</label>
                            <input
                                className={inputStyle}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex.: Calabresa"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/45">Preço adicional (R$)</label>
                            <input
                                className={inputStyle}
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0,00"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
                        >
                            Cadastrar sabor
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
