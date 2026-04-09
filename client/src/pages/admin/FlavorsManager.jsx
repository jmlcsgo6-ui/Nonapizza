import React, { useState, useEffect } from 'react';
import api from '../../api/api';

export default function FlavorsManager({ token }) {
    const [flavors, setFlavors] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const fetchFlavors = async () => {
        try {
            const res = await api.get('/api/ingredients');
            setFlavors(res.data);
        } catch(e) {}
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
        if(!window.confirm('Excluir este sabor?')) return;
        try {
            await api.delete(`/api/admin/ingredients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFlavors();
        } catch(e) {}
    };

    const inputStyle = {
        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '0.8rem 1rem', color: '#fff', marginBottom: '1rem', outline: 'none'
    };

    return (
        <div style={{ color: '#fff' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sabores do Builder</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Gerencie os ingredientes que aparecem na montagem da pizza</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem', alignItems: 'start' }}>
                {/* Form Card */}
                <div style={{ background: '#111', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ marginBottom: '1.2rem', fontSize: '1rem', color: 'var(--primary, #e07b39)' }}>Novo Sabor</h4>
                    <form onSubmit={handleAdd}>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Nome do Sabor</label>
                        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Calabresa Especial" required />
                        
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Adicional (R$)</label>
                        <input style={inputStyle} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" required />
                        
                        <button type="submit" className="btn btn-primary w-100" style={{ padding: '0.8rem', fontWeight: 700 }}>Habilitar Sabor</button>
                    </form>
                </div>

                {/* List Table */}
                <div style={{ background: '#111', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '1rem 1.5rem' }}>ID</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Sabor</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Adicional</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flavors.map(f => (
                                <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '1rem 1.5rem', opacity: 0.4 }}>#{f.id}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{f.name}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--primary, #e07b39)', fontWeight: 700 }}>R$ {f.price.toFixed(2)}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(f.id)} style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {flavors.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>Nenhum sabor cadastrado</div>}
                </div>
            </div>
        </div>
    );
}
