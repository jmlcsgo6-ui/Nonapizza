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

    const inputStyle = "w-full bg-white/[0.03] border border-white/10 p-3 text-xs text-white focus:border-primary outline-none transition-all placeholder:text-white/5 uppercase font-mono";

    return (
        <div className="space-y-12 font-mono">
            <div className="border-b border-white/10 pb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-1 h-6 bg-primary"></div>
                    <h3 className="text-2xl font-black uppercase tracking-widest text-white italic">INVENTORY_MANAGER</h3>
                </div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em] ml-6">CONTROLE DE ATIVOS E LOGÍSTICA DE CARDÁPIO</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 bg-black border border-white/10 p-8 space-y-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                            <Plus size={16} />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">ADD_PRODUCT_CORE</h4>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] block">LABEL_IDENTIFIER</label>
                            <input className={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="PRODUCT_NAME" required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] block">CATEGORY_ID</label>
                                <select className={inputStyle} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                                    {categories.map(c => <option key={c.id} value={c.id} className="bg-black text-white">{c.name.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] block">UNIT_PRICE (R$)</label>
                                <input className={inputStyle} type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] block">TECHNICAL_SPEC</label>
                            <textarea className={`${inputStyle} h-24 resize-none`} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="DATA_DETAILS..." required></textarea>
                        </div>
                        
                        <button type="submit" className="w-full bg-primary py-4 font-black text-[10px] uppercase tracking-[0.3em] text-black hover:bg-white transition-all">
                            REGISTER_RECORD
                        </button>
                    </form>
                </motion.div>

                {/* List Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 space-y-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <input 
                            className="w-full bg-black border border-white/10 py-4 pl-12 pr-4 text-[10px] text-white outline-none transition-all uppercase tracking-widest focus:border-primary"
                            placeholder="SEARCH_INVENTORY_TAGS..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="bg-black border border-white/10 overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-white/30 border-r border-white/10">PRODUCT_STREAM</th>
                                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-white/30 border-r border-white/10 text-center w-32">TAG</th>
                                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-white/30 border-r border-white/10 text-center w-32">VALUE</th>
                                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-white/30 text-right w-24">OPS</th>
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
                                            <td className="px-6 py-5 border-r border-white/10">
                                                <h4 className="font-bold text-[11px] text-white group-hover:text-primary transition-colors uppercase tracking-wider">{p.name}</h4>
                                                <p className="text-[8px] font-bold text-white/20 mt-1 uppercase tracking-widest line-clamp-1">{p.desc}</p>
                                            </td>
                                            <td className="px-6 py-5 border-r border-white/10 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-white/40">
                                                    {p.category.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 font-bold text-[11px] text-white text-center border-r border-white/10">R$ {p.price.toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
                                                    className="w-8 h-8 bg-red-500/5 text-red-500/40 hover:text-white hover:bg-red-500 border border-red-500/20 transition-all inline-flex items-center justify-center p-0"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        
                        {(filtered.length === 0 && !loading) && (
                            <div className="py-20 text-center border-t border-white/5">
                                <Package size={32} className="mx-auto mb-4 text-white/5" />
                                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/20">NO_DATA_AVAILABLE</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
