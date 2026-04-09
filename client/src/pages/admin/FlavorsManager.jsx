import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, PieChart, Info, Search, FlaskConical } from 'lucide-react';

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
    const inputStyle = "w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/20";

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Laboratório de <span className="text-primary italic">Sabores</span></h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Configurações para o Pizza Builder</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Form Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 bg-card border border-white/5 rounded-[2.5rem] p-8 space-y-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                            <Plus size={20} strokeWidth={3} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Novo Sabor</h4>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Nome do Ingrediente</label>
                            <input className={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Burrata Trufada" required />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Adicional (R$)</label>
                            <input className={inputStyle} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0,00" required />
                        </div>
                        
                        <button type="submit" className="btn-premium w-full py-4 rounded-2xl text-xs">
                            HABILITAR SABOR
                        </button>
                    </form>
                </motion.div>

                {/* List Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 space-y-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                            className="w-full bg-white/5 border border-white/5 focus:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none transition-all uppercase tracking-widest"
                            placeholder="Buscar sabor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 w-20">ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Nomenclatura</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Adicional</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Ações</th>
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
                                            className="group hover:bg-white/[0.01] transition-colors"
                                        >
                                            <td className="px-8 py-6 text-xs font-mono text-white/20">#{f.id}</td>
                                            <td className="px-8 py-6">
                                                <h4 className="font-black text-sm text-white group-hover:text-primary transition-colors italic uppercase">{f.name}</h4>
                                            </td>
                                            <td className="px-8 py-6 font-black text-sm text-white tracking-tighter italic">+ R$ {f.price.toFixed(2)}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => handleDelete(f.id)}
                                                    className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 border border-red-500/10 transition-all flex items-center justify-center p-0 ml-auto"
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
                            <div className="py-24 text-center">
                                <FlaskConical size={48} className="mx-auto mb-6 text-white/10" />
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Sem compostos químicos</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
