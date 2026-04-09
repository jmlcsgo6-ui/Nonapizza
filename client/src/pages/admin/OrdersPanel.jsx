import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const STATUS_LABELS = {
    PENDING:    { label: 'Recebido',         color: '#e67e22', next: 'COOKING' },
    COOKING:    { label: 'No Forno',         color: '#8e44ad', next: 'DELIVERING' },
    DELIVERING: { label: 'Saiu p/ Entrega',  color: '#2980b9', next: 'COMPLETED' },
    COMPLETED:  { label: 'Concluído',        color: '#27ae60', next: null },
};

export default function OrdersPanel({ token }) {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch(e) { console.error('Error fetching orders', e); }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 8000);
        return () => clearInterval(interval);
    }, [token]);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/api/admin/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch(e) { console.error('Failed to update status', e); }
    };

    const columns = ['PENDING','COOKING','DELIVERING','COMPLETED'];

    const colStyle = (statusKey) => ({
        flex: 1,
        background: '#f9f9f9',
        padding: '1rem',
        borderRadius: '8px',
        border: `2px solid ${STATUS_LABELS[statusKey].color}22`,
        minWidth: '200px',
    });

    return (
        <div>
            <h3 style={{ color: '#111' }}>Fila de Pedidos — Kanban</h3>
            <p style={{ color: '#555', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Atualiza automaticamente a cada 8 segundos. Clique em "Avançar" para mover o pedido.
            </p>

            <div style={{ display: 'flex', gap: '1rem', minHeight: '60vh', overflowX: 'auto' }}>
                {columns.map(statusKey => {
                    const { label, color, next } = STATUS_LABELS[statusKey];
                    const list = orders.filter(o => o.status === statusKey);
                    return (
                        <div key={statusKey} style={colStyle(statusKey)}>
                            <h4 style={{ color: '#111', marginBottom: '1rem', borderBottom: `2px solid ${color}`, paddingBottom: '0.5rem', fontSize: '0.95rem' }}>
                                {label} <span style={{ background: color, color: '#fff', borderRadius: '50%', padding: '1px 7px', fontSize: '0.8rem', marginLeft: '4px' }}>{list.length}</span>
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {list.map(o => (
                                    <div key={o.id} style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <strong style={{ color: '#111', fontSize: '0.95rem' }}>Pedido #{o.id}</strong>
                                            <span style={{ color: '#666', fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</span>
                                        </div>
                                        <p style={{ color: '#333', fontWeight: 600, margin: '0 0 0.3rem' }}>{o.customerName}</p>
                                        {o.phone && <p style={{ color: '#555', fontSize: '0.82rem', margin: '0 0 0.3rem' }}>📱 {o.phone}</p>}
                                        <p style={{ color: '#555', fontSize: '0.83rem', margin: '0 0 0.5rem' }}>
                                            {o.items.map(i => `${i.qty}x ${i.productName}`).join(' · ')}
                                        </p>
                                        <strong style={{ color: '#d32f2f', fontSize: '1rem' }}>R$ {o.total.toFixed(2)}</strong>
                                        {next && (
                                            <button
                                                onClick={() => updateStatus(o.id, next)}
                                                style={{ marginTop: '0.75rem', width: '100%', background: color, color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                                            >
                                                Avançar → {STATUS_LABELS[next].label}
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {list.length === 0 && <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>Nenhum pedido aqui</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
