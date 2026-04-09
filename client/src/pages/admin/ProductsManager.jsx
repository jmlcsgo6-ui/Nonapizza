import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, Box, Info, Search, Package } from 'lucide-react';

export default function ProductsManager({ token }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', desc: '', price: '', categoryId: '' });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [p, c] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories')
            ]);
            setProducts(p.data);
            setCategories(c.data);
            if(c.data.length > 0 && !form.categoryId) setForm(f => ({...f, categoryId: c.data[0].id}));
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/products', { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForm({ name: '', desc: '', price: '', categoryId: categories[0]?.id || '' });
            fetchData();
        } catch(e) { alert('Erro ao adicionar produto'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Excluir este produto permanentemente?')) return;
        try {
            await api.delete(`/api/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch(e) {}
    };

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.category.name.toLowerCase().includes(search.toLowerCase())
    );

    const inputStyle = "w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/20";

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Inventário de <span className="text-primary italic">Produtos</span></h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Controle o cardápio fixo e complementos</p>
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
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Novo Produto</h4>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Identificação</label>
                            <input className={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Coca-Cola 2L" required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Categoria</label>
                                <select className={inputStyle} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                                    {categories.map(c => <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Valor (R$)</label>
                                <input className={inputStyle} type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0,00" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Descrição Técnica</label>
                            <textarea className={`${inputStyle} h-24 resize-none`} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Ingredientes ou detalhes..." required></textarea>
                        </div>
                        
                        <button type="submit" className="btn-premium w-full py-4 rounded-2xl text-xs">
                            SALVAR NO CARDÁPIO
                        </button>
                    </form>
                </motion.div>

                {/* List Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 space-y-6"
                >
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input 
                                className="w-full bg-white/5 border border-white/5 focus:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none transition-all uppercase tracking-widest"
                                placeholder="Filtrar por nome ou categoria..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Produto & Detalhes</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Categoria</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Valor</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map(p => (
                                        <motion.tr 
                                            layout
                                            key={p.id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-white/[0.01] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <h4 className="font-black text-sm text-white group-hover:text-primary transition-colors italic uppercase">{p.name}</h4>
                                                <p className="text-[10px] font-medium text-white/40 mt-1 uppercase tracking-tight line-clamp-1">{p.desc}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60">
                                                    <Tag size={10} /> {p.category.name}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-black text-sm text-white tracking-tighter italic">R$ {p.price.toFixed(2)}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
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
                        
                        {(filtered.length === 0 && !loading) && (
                            <div className="py-24 text-center">
                                <Package size={48} className="mx-auto mb-6 text-white/10" />
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Vazio Absoluto</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
