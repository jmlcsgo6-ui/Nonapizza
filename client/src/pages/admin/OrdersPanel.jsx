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
        background: '#1a1a1a',
        padding: '1.25rem',
        borderRadius: '12px',
        border: `1px solid rgba(255,255,255,0.05)`,
        minWidth: '280px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    });

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Fila de Pedidos</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Acompanhamento em tempo real</p>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', minHeight: '70vh', overflowX: 'auto', paddingBottom: '1rem' }}>
                {columns.map(statusKey => {
                    const { label, color, next } = STATUS_LABELS[statusKey];
                    const list = orders.filter(o => o.status === statusKey);
                    return (
                        <div key={statusKey} style={colStyle(statusKey)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {label}
                                </h4>
                                <span style={{ background: color, color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 800 }}>
                                    {list.length}
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {list.map(o => (
                                    <div key={o.id} style={{ 
                                        background: '#222', 
                                        padding: '1.25rem', 
                                        borderRadius: '10px', 
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderTop: `4px solid ${color}`,
                                        transition: 'transform 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                            <strong style={{ color: '#fff', fontSize: '1rem' }}>#{o.id}</strong>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                                {new Date(o.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--primary, #e07b39)', fontWeight: 700, margin: '0 0 0.4rem', fontSize: '0.95rem' }}>{o.customerName}</p>
                                        {o.phone && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>📱 {o.phone}</p>}
                                        
                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '6px', margin: '0.8rem 0' }}>
                                            {o.items.map((i, idx) => (
                                                <p key={idx} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', margin: '0.2rem 0' }}>
                                                    • {i.qty}x <strong>{i.productName}</strong>
                                                </p>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>R$ {o.total.toFixed(2)}</strong>
                                            {next && (
                                                <button
                                                    onClick={() => updateStatus(o.id, next)}
                                                    style={{ 
                                                        background: color, 
                                                        color: '#fff', 
                                                        border: 'none', 
                                                        borderRadius: '6px', 
                                                        padding: '0.5rem 0.8rem', 
                                                        cursor: 'pointer', 
                                                        fontWeight: 700, 
                                                        fontSize: '0.75rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                >
                                                    Mover <i className="fa-solid fa-chevron-right"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {list.length === 0 && (
                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.15)', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <i className="fa-solid fa-inbox" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}></i>
                                        Vazio
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
