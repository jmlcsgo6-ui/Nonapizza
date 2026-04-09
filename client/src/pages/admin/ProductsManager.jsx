import React, { useState, useEffect } from 'react';
import api from '../../api/api';

export default function ProductsManager({ token }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', desc: '', price: '', categoryId: '' });

    const fetchData = async () => {
        try {
            const [p, c] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories')
            ]);
            setProducts(p.data);
            setCategories(c.data);
            if(c.data.length > 0) setForm(f => ({...f, categoryId: c.data[0].id}));
        } catch(e) {}
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
        if(!window.confirm('Excluir este produto?')) return;
        try {
            await api.delete(`/api/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch(e) {}
    };

    const inputStyle = {
        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '0.8rem 1rem', color: '#fff', marginBottom: '1rem', outline: 'none', fontFamily: 'inherit'
    };

    return (
        <div style={{ color: '#fff' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Cardápio Fixo</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Gerencie os produtos prontos (entradas, bebidas, etc)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2.5rem', alignItems: 'start' }}>
                {/* Form Card */}
                <div style={{ background: '#111', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ marginBottom: '1.2rem', fontSize: '1rem', color: 'var(--primary, #e07b39)' }}>Novo Produto</h4>
                    <form onSubmit={handleAdd}>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Nome</label>
                        <input style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Coca-Cola 2L" required />
                        
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Categoria</label>
                        <select style={inputStyle} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                            {categories.map(c => <option key={c.id} value={c.id} style={{background:'#111'}}>{c.name}</option>)}
                        </select>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{flex: 1}}>
                                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Preço (R$)</label>
                                <input style={inputStyle} type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" required />
                            </div>
                        </div>

                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Descrição Pequena</label>
                        <textarea style={{...inputStyle, height: '80px', resize: 'none'}} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Breve resumo..." required></textarea>
                        
                        <button type="submit" className="btn btn-primary w-100" style={{ padding: '0.8rem', fontWeight: 700 }}>Adicionar ao Cardápio</button>
                    </form>
                </div>

                {/* List Table */}
                <div style={{ background: '#111', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '1rem 1.5rem' }}>Produto</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Categoria</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Preço</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{p.desc}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}><span style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{p.category.name}</span></td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--primary, #e07b39)', fontWeight: 700 }}>R$ {p.price.toFixed(2)}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>Nenhum produto cadastrado</div>}
                </div>
            </div>
        </div>
    );
}
