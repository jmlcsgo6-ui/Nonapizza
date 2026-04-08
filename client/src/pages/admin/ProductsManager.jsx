import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductsManager({ token }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                axios.get('http://localhost:3001/api/products'),
                axios.get('http://localhost:3001/api/categories')
            ]);
            setProducts(pRes.data);
            setCategories(cRes.data);
            if(cRes.data.length > 0) setCategoryId(cRes.data[0].id);
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/products', {
                name, description: desc, price: parseFloat(price), categoryId: parseInt(categoryId)
            }, { headers: { Authorization: `Bearer ${token}` } });
            setName(''); setDesc(''); setPrice('');
            fetchData();
        } catch(e) { console.error(e); alert('Erro ao salvar produto'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Tem certeza?')) return;
        try {
            await axios.delete(`http://localhost:3001/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch(e) { console.error(e); alert('Erro ao deletar produto'); }
    };

    if (loading) return <div>Carregando Produtos...</div>;

    return (
        <div>
            <h3>Gerenciamento do Cardápio Fixo</h3>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Produtos que aparecem no Modal "Ver Cardápio".</p>

            <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1, background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                    <h4>Adicionar Novo Produto</h4>
                    <form onSubmit={handleCreate} style={{ marginTop: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Categoria</label>
                            <select className="form-input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Nome do Produto</label>
                            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Descrição</label>
                            <textarea className="form-input" value={desc} onChange={e => setDesc(e.target.value)} rows="3" required></textarea>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Preço (R$)</label>
                            <input type="number" step="0.01" className="form-input" value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Adicionar Cardápio</button>
                    </form>
                </div>
                
                <div style={{ flex: 2 }}>
                    <h4>Cardápio Atual</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: '#fff' }}>
                        <thead>
                            <tr style={{ background: '#eee', textAlign: 'left' }}>
                                <th style={{ padding: '0.8rem' }}>ID</th>
                                <th>Produto</th>
                                <th>Preço</th>
                                <th>Categoria</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.8rem' }}>{p.id}</td>
                                    <td><strong>{p.name}</strong><br/><small style={{color:'#666'}}>{p.description}</small></td>
                                    <td>R$ {p.price.toFixed(2)}</td>
                                    <td>{p.category?.name}</td>
                                    <td>
                                        <button className="btn btn-sm" style={{ background: '#d32f2f', color: '#fff' }} onClick={() => handleDelete(p.id)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
