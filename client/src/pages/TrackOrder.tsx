import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/nona/Header';

const STATUS_STEPS = [
    { key: 'PENDING',    label: 'Recebido',      desc: 'Sua ordem está na fila.' },
    { key: 'COOKING',    label: 'No Forno',      desc: 'Assando perfeitamente.' },
    { key: 'DELIVERING', label: 'A Caminho',     desc: 'Saindo para entrega.' },
    { key: 'COMPLETED',  label: 'Entregue',      desc: 'Bom apetite!' },
];

export default function TrackOrder() {
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const customerToken = localStorage.getItem('customer_token');

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
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        const state = location.state as any;
        const focusId = state?.focusOrderId;
        if (focusId == null || orders.length === 0) return;
        const match = orders.find((o) => o.id === focusId);
        if (match) setSelectedOrder(match);
    }, [orders, location.state]);

    useEffect(() => {
        if (!selectedOrder || selectedOrder.status === 'COMPLETED') return;
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/api/track/${selectedOrder.id}`);
                if (res.data.status !== selectedOrder.status) {
                    setSelectedOrder(res.data);
                    setOrders(prev => prev.map(o => o.id === res.data.id ? res.data : o));
                }
            } catch(e) {}
        }, 8000);
        return () => clearInterval(interval);
    }, [selectedOrder?.id, selectedOrder?.status]);

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>Carregando seus pedidos...</div>;

    const currentStepIdx = selectedOrder ? STATUS_STEPS.findIndex(s => s.key === selectedOrder.status) : -1;

    return (
        <div className="track-page">
            <Header />
            
            <div className="container track-container">
                <div className="section-header auth-header" style={{ paddingTop: '100px' }}>
                    <h2 className="section-title">Acompanhar Pedido</h2>
                    <p className="section-subtitle">Veja o status da sua pizza em tempo real.</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center" style={{ padding: '3rem 0' }}>
                        <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1.5rem', display: 'block' }}></i>
                        <p style={{ opacity: 0.5 }}>Você ainda não realizou nenhum pedido.</p>
                        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>Ir para o Cardápio</button>
                    </div>
                ) : (
                    <div className="track-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
                        <div className="orders-sidebar">
                            <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#b0b0b0', letterSpacing: '1px' }}>HISTÓRICO RECENTE</h4>
                            {orders.map(o => (
                                <div 
                                    key={o.id} 
                                    className={`order-card ${selectedOrder?.id === o.id ? 'active' : ''}`}
                                    onClick={() => setSelectedOrder(o)}
                                    style={{ background: selectedOrder?.id === o.id ? 'rgba(255,94,0,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selectedOrder?.id === o.id ? 'rgba(255,94,0,0.3)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '12px', padding: '1.2rem', marginBottom: '0.75rem', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>#{o.id.toString().padStart(4, '0')}</span>
                                        <span style={{ fontSize: '0.8rem', color: o.status === 'COMPLETED' ? '#4cd964' : '#ff5e00' }}>
                                            {STATUS_STEPS.find(s => s.key === o.status)?.label || o.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#b0b0b0', marginTop: '0.5rem' }}>
                                        {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} itens
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-detail">
                            {selectedOrder && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Pedido #{selectedOrder.id}</h3>
                                    <p style={{ color: '#b0b0b0', marginBottom: '2rem' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '8px' }}></i> {selectedOrder.address}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
                                        {STATUS_STEPS.map((step, idx) => (
                                            <div key={step.key} style={{ textAlign: 'center', opacity: idx <= currentStepIdx ? 1 : 0.3 }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: idx <= currentStepIdx ? '#ff5e00' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                                                    {idx < currentStepIdx ? <i className="fa-solid fa-check" style={{ color: '#fff' }}></i> : null}
                                                    {idx === currentStepIdx ? <div className="pulse-dot" style={{ position: 'relative' }}></div> : null}
                                                </div>
                                                <span style={{ fontSize: '0.8rem' }}>{step.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1.5rem' }}>
                                        <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#b0b0b0', letterSpacing: '1px' }}>RESUMO DO PEDIDO</h4>
                                        {selectedOrder.items.map((item: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <span><span style={{ color: '#ff5e00', marginRight: '8px' }}>{item.qty}x</span> {item.productName}</span>
                                                <span>R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                            <span style={{ fontWeight: 700 }}>Total</span>
                                            <span style={{ fontWeight: 800, color: '#ff5e00' }}>R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
