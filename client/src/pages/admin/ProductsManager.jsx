import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, Box, Info, Search, Package, DollarSign } from 'lucide-react';

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

    const inputStyle = "w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/10";

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tight">Gerenciar <span className="text-primary italic">Produtos</span></h2>
                <p className="text-white/40 mt-1 font-medium">Controle total do catálogo Alquimia</p>
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
                        <h4 className="text-lg font-bold text-white tracking-tight">Novo Produto</h4>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Nome do Produto</label>
                            <input className={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Pequena, Média, Grande..." required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Categoria</label>
                                <select className={inputStyle} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                                    {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0c0c0c] text-white">{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Preço (R$)</label>
                                <input className={inputStyle} type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Descrição</label>
                            <textarea className={`${inputStyle} h-24 resize-none`} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Detalhes técnicos sabor..." required></textarea>
                        </div>
                        
                        <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-bold text-white hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                            Cadastrar Produto
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
                            placeholder="Buscar produtos ou categorias..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/20">Produto</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/20 text-center">Categoria</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/20 text-center">Preço</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-white/20 text-right">Ações</th>
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
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{p.name}</h4>
                                                <p className="text-xs text-white/20 mt-1 line-clamp-1">{p.desc}</p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 border border-white/5">
                                                    {p.category.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 font-bold text-white text-center">R$ {p.price.toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
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
                        
                        {(filtered.length === 0 && !loading) && (
                            <div className="py-20 text-center">
                                <Package size={40} className="mx-auto mb-4 text-white/5" />
                                <p className="text-sm font-bold uppercase tracking-widest text-white/10">Nenhum produto encontrado</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

