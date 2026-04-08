import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrdersPanel({ token }) {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch(e) { console.error("Error fetching orders", e); }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [token]);

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`http://localhost:3001/api/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch(e) { console.error("Failed to update status", e); }
    };

    const groupedOrders = {
        PENDING: orders.filter(o => o.status === 'PENDING'),
        PREPARING: orders.filter(o => o.status === 'PREPARING'),
        DELIVERING: orders.filter(o => o.status === 'DELIVERING'),
        COMPLETED: orders.filter(o => o.status === 'COMPLETED')
    };

    const renderColumn = (title, list, nextStatus) => (
        <div style={{ flex: 1, background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #222', paddingBottom: '0.5rem' }}>{title} ({list.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {list.map(o => (
                    <div key={o.id} style={{ background: '#fff', padding: '1rem', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <strong>Pedido #{o.id} ({o.customerName})</strong>
                        <p style={{ margin: '0.5rem 0', color: '#555', fontSize: '0.9rem' }}>
                            {o.items.map(i => `${i.quantity}x ${i.productName}`).join(' | ')}
                        </p>
                        <strong style={{ color: '#d32f2f' }}>R$ {o.total.toFixed(2)}</strong>
                        {nextStatus && (
                            <button 
                                className="btn btn-primary btn-sm" 
                                style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.8rem' }}
                                onClick={() => updateStatus(o.id, nextStatus)}
                            >
                                Avançar <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <h3>Fila de Pedidos (Kanban)</h3>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Acompanhe e controle os pedidos em tempo real.</p>
            
            <div style={{ display: 'flex', gap: '1rem', minHeight: '60vh' }}>
                {renderColumn('Recebidos (Novos)', groupedOrders.PENDING, 'PREPARING')}
                {renderColumn('No Forno (Preparo)', groupedOrders.PREPARING, 'DELIVERING')}
                {renderColumn('Saiu p/ Entrega', groupedOrders.DELIVERING, 'COMPLETED')}
                {renderColumn('Concluídos', groupedOrders.COMPLETED, null)}
            </div>
        </div>
    );
}
