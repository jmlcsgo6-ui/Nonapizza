import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function FlavorsManager({ token }) {
    const [ingredients, setIngredients] = useState([]);
    
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/ingredients');
            setIngredients(res.data);
        } catch(e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/ingredients', {
                name, description: desc, price: parseFloat(price)
            }, { headers: { Authorization: `Bearer ${token}` } });
            setName(''); setDesc(''); setPrice('');
            fetchData();
        } catch(e) { console.error(e); alert('Erro ao salvar ingrediente'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Tem certeza?')) return;
        try {
            await axios.delete(`http://localhost:3001/api/ingredients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch(e) { console.error(e); alert('Erro ao deletar ingrediente'); }
    };

    return (
        <div>
            <h3>Gerenciamento de Sabores do Pizza Builder</h3>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Esses ingredientes aparecem na gaveta flutuante durante a montagem fracionada da pizza do usuário.</p>

            <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1, background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                    <h4>Novo Sabor / Ingrediente</h4>
                    <form onSubmit={handleCreate} style={{ marginTop: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Nome do Sabor</label>
                            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Adicional no Preço (R$)</label>
                            <input type="number" step="0.01" className="form-input" value={price} onChange={e => setPrice(e.target.value)} required />
                            <small style={{ color: '#666' }}>O valor base da pizza é definido pelo Tamanho. Esse valor é cobrado no custo da fração.</small>
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Habilitar Sabor</button>
                    </form>
                </div>
                
                <div style={{ flex: 2 }}>
                    <h4>Sabores Liberados na Plataforma</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: '#fff' }}>
                        <thead>
                            <tr style={{ background: '#eee', textAlign: 'left' }}>
                                <th style={{ padding: '0.8rem' }}>ID</th>
                                <th>Sabor</th>
                                <th>Adicional (+R$)</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map(i => (
                                <tr key={i.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.8rem' }}>{i.id}</td>
                                    <td><strong>{i.name}</strong></td>
                                    <td style={i.price > 0 ? {color: '#d32f2f', fontWeight: 'bold'} : {}}>{i.price > 0 ? '+ R$ ' + i.price.toFixed(2) : 'Sem custo'}</td>
                                    <td>
                                        <button className="btn btn-sm" style={{ background: '#d32f2f', color: '#fff' }} onClick={() => handleDelete(i.id)}>Excluir</button>
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
