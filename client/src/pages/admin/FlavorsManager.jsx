import React, { useState, useEffect } from 'react';
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
        } catch(e) { console.error(e); }
    };

    useEffect(() => { fetchFlavors(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/ingredients', { name, price: parseFloat(price) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setName(''); setPrice('');
            fetchFlavors();
        } catch(e) { alert('Erro ao adicionar sabor'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Excluir este sabor do builder?')) return;
        try {
            await api.delete(`/api/admin/ingredients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFlavors();
        } catch(e) {}
    };

    const filtered = flavors.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    const inputStyle = "w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/10";

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tight">Gerenciar <span className="text-primary italic">Sabores</span></h2>
                <p className="text-white/40 mt-1 font-medium">Configure as opções disponíveis no construtor</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-4 bg-[#0c0c0c] border border-white/5 p-8 rounded-3xl shadow-xl space-y-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-xl">
                            <Plus size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-white tracking-tight">Novo Sabor</h4>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Nome do Sabor</label>
                            <input className={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Calabresa, Frango..." required />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Preço Adicional (R$)</label>
                            <input className={inputStyle} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" required />
                        </div>
                        
                        <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-bold text-white hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                            Cadastrar Sabor
                        </button>
                    </form>
                </motion.div>

                {/* List Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-8 space-y-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                            className="w-full bg-[#0c0c0c] border border-white/5 py-5 pl-12 pr-4 rounded-3xl text-sm text-white outline-none transition-all focus:border-primary shadow-xl"
                            placeholder="Buscar sabores cadastrados..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/20">Sabor</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/20 text-center">Acréscimo</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/20 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map(f => (
                                        <motion.tr 
                                            layout
                                            key={f.id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{f.name}</h4>
                                                <p className="text-[10px] text-white/10 mt-1">ID #{f.id}</p>
                                            </td>
                                            <td className="px-6 py-5 font-bold text-white text-center group-hover:text-primary transition-colors">+ R$ {f.price.toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button 
                                                    onClick={() => handleDelete(f.id)}
                                                    className="w-10 h-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all inline-flex items-center justify-center p-0"
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
                            <div className="py-20 text-center">
                                <FlaskConical size={40} className="mx-auto mb-4 text-white/5" />
                                <p className="text-sm font-bold uppercase tracking-widest text-white/10">Nenhum sabor encontrado</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
