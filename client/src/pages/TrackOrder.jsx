import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const STATUS_STEPS = [
    { key: 'PENDING',    icon: '📋', label: 'Pedido Recebido',      desc: 'Pedido aguardando preparo.' },
    { key: 'COOKING',    icon: '🔥', label: 'Em Preparo',           desc: 'Sua pizza está no forno.' },
    { key: 'DELIVERING', icon: '🏍️', label: 'Saiu para Entrega',   desc: 'Motoqueiro a caminho.' },
    { key: 'COMPLETED',  icon: '✅', label: 'Entregue',             desc: 'Pedido entregue. Bom apetite!' },
];

export default function TrackOrder() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');

    useEffect(() => {
        if (!customerToken) {
            navigate('/login');
            return;
        }
        fetchUserOrders();
    }, [customerToken]);

    const fetchUserOrders = async () => {
        try {
            const res = await api.get('/api/customer/orders', {
                headers: { Authorization: `Bearer ${customerToken}` }
            });
            setOrders(res.data);
            if (res.data.length > 0) setSelectedOrder(res.data[0]);
            setError('');
        } catch(e) {
            setError('Erro ao carregar seus pedidos.');
        } finally {
            setLoading(false);
        }
    };

    // Poll selected order status every 10s if not completed
    useEffect(() => {
        if (!selectedOrder || selectedOrder.status === 'COMPLETED') return;
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/api/track/${selectedOrder.id}`);
                if (res.data.status !== selectedOrder.status) {
                    setSelectedOrder(res.data);
                    // Also update in the list
                    setOrders(prev => prev.map(o => o.id === res.data.id ? res.data : o));
                }
            } catch(e) {}
        }, 10000);
        return () => clearInterval(interval);
    }, [selectedOrder?.id, selectedOrder?.status]);

    if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</div>;

    const currentStepIdx = selectedOrder ? STATUS_STEPS.findIndex(s => s.key === selectedOrder.status) : -1;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <a href="/" style={{ color: 'var(--primary, #e07b39)', textDecoration: 'none', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>← Voltar para a Home</a>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Meus <span style={{ color: 'var(--primary, #e07b39)' }}>Pedidos</span></h1>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#111', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', marginBottom: '2rem' }}>Você ainda não realizou nenhum pedido.</p>
                        <a href="/" className="btn btn-primary">Fazer meu primeiro pedido</a>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Sidebar: List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>Histórico Recente</p>
                            {orders.map(o => (
                                <div key={o.id} onClick={() => setSelectedOrder(o)} style={{
                                    background: selectedOrder?.id === o.id ? 'rgba(224,123,57,0.1)' : '#111',
                                    border: `1px solid ${selectedOrder?.id === o.id ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.05)'}`,
                                    padding: '1.25rem', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong style={{ fontSize: '1.1rem' }}>#{o.id}</strong>
                                        <span style={{ color: 'var(--primary, #e07b39)', fontSize: '0.85rem', fontWeight: 700 }}>{STATUS_STEPS.find(s => s.key === o.status)?.label}</span>
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString('pt-BR')} • R$ {o.total.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Detail/Timeline */}
                        {selectedOrder && (
                            <div style={{ background: '#111', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Detalhes do Pedido #{selectedOrder.id}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Status atualizado em tempo real</p>
                                </div>

                                <div style={{ padding: '2rem' }}>
                                    {STATUS_STEPS.map((step, idx) => {
                                        const isDone = idx <= currentStepIdx;
                                        const isActive = idx === currentStepIdx;
                                        return (
                                            <div key={step.key} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                                                {/* Line */}
                                                {idx < STATUS_STEPS.length - 1 && (
                                                    <div style={{ position: 'absolute', left: '16px', top: '32px', width: '2px', height: '1.5rem', background: isDone && idx < currentStepIdx ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.05)' }} />
                                                )}
                                                {/* Dot/Icon */}
                                                <div style={{ 
                                                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isActive ? 'var(--primary, #e07b39)' : (isDone ? 'rgba(224,123,57,0.2)' : 'rgba(255,255,255,0.03)'),
                                                    border: `2px solid ${isDone ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.05)'}`,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {isDone ? '✓' : ''}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 700, color: isDone ? '#fff' : 'rgba(255,255,255,0.2)', fontSize: '0.95rem' }}>{step.label}</p>
                                                    {isActive && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{step.desc}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', textTransform: 'uppercase' }}>Itens</p>
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                            <span>{item.qty}x {item.productName}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>R$ {(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                                        <span>Total</span>
                                        <span style={{ color: 'var(--primary, #e07b39)', fontSize: '1.1rem' }}>R$ {selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
