import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';

const STATUS_STEPS = [
    { key: 'PENDING',    label: 'Recebido',      desc: 'Sua ordem está na fila.' },
    { key: 'COOKING',    label: 'No Forno',      desc: 'Assando perfeitamente.' },
    { key: 'DELIVERING', label: 'A Caminho',     desc: 'Saindo para entrega.' },
    { key: 'COMPLETED',  label: 'Entregue',      desc: 'Bom apetite!' },
];

export default function TrackOrder() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        const focusId = location.state?.focusOrderId;
        if (focusId == null || orders.length === 0) return;
        const match = orders.find((o) => o.id === focusId);
        if (match) setSelectedOrder(match);
    }, [orders, location.state?.focusOrderId]);

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

    if (loading) return <div className="loading-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: '#fff' }}>Carregando seus pedidos...</div>;

    const currentStepIdx = selectedOrder ? STATUS_STEPS.findIndex(s => s.key === selectedOrder.status) : -1;

    return (
        <div className="track-page" style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: '#fff' }}>
            <Header />
            
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
                <div className="section-header" style={{ marginBottom: '3rem' }}>
                    <h2 className="section-title">Acompanhar Pedido</h2>
                    <p className="section-subtitle">Veja o status da sua pizza em tempo real.</p>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-orders text-center" style={{ padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1.5rem', display: 'block' }}></i>
                        <p style={{ opacity: 0.5 }}>Você ainda não realizou nenhum pedido.</p>
                        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>Ir para o Cardápio</button>
                    </div>
                ) : (
                    <div className="track-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                        {/* Sidebar */}
                        <div className="orders-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ fontSize: '0.8rem', opacity: 0.3, letterSpacing: '2px', marginBottom: '0.5rem' }}>HISTÓRICO RECENTE</h4>
                            {orders.map(o => (
                                <div 
                                    key={o.id} 
                                    className={`order-card ${selectedOrder?.id === o.id ? 'active' : ''}`}
                                    style={{ 
                                        padding: '1.5rem', 
                                        borderRadius: '12px', 
                                        background: selectedOrder?.id === o.id ? 'rgba(255,95,0,0.1)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${selectedOrder?.id === o.id ? 'var(--primary)' : 'transparent'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onClick={() => setSelectedOrder(o)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold' }}># {o.id.toString().padStart(4, '0')}</span>
                                        <span style={{ fontSize: '0.7rem', color: o.status === 'COMPLETED' ? '#44ff44' : 'var(--primary)' }}>
                                            {STATUS_STEPS.find(s => s.key === o.status)?.label || o.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                                        {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} itens
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Detail */}
                        <div className="order-detail">
                            {selectedOrder && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '15px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Pedido #{selectedOrder.id}</h3>
                                        <p style={{ opacity: 0.5, fontSize: '0.9rem' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '8px' }}></i> {selectedOrder.address}</p>
                                    </div>

                                    {/* Status Timeline */}
                                    <div className="status-timeline" style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '15px', left: '0', width: '100%', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
                                        <div style={{ position: 'absolute', top: '15px', left: '0', width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.5s' }}></div>
                                        
                                        {STATUS_STEPS.map((step, idx) => (
                                            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                                                <div style={{ 
                                                    width: '32px', 
                                                    height: '32px', 
                                                    borderRadius: '50%', 
                                                    background: idx <= currentStepIdx ? 'var(--primary)' : 'var(--bg-dark)',
                                                    border: `2px solid ${idx <= currentStepIdx ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                                    marginBottom: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {idx < currentStepIdx ? <i className="fa-solid fa-check" style={{ fontSize: '0.8rem' }}></i> : null}
                                                    {idx === currentStepIdx ? <div className="pulse" style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }}></div> : null}
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: idx <= currentStepIdx ? '#fff' : 'rgba(255,255,255,0.2)' }}>{step.label}</div>
                                                    {idx === currentStepIdx && <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.2rem' }}>{step.desc}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Items List */}
                                    <div className="order-summary" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '2rem' }}>
                                        <h4 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', opacity: 0.5, letterSpacing: '1px' }}>RESUMO DO PEDIDO</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedOrder.items.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                                    <span><span style={{ opacity: 0.3 }}>{item.qty}x</span> {item.productName}</span>
                                                    <span>R$ {(item.price * item.qty).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                <span>Total</span>
                                                <span style={{ color: 'var(--primary)' }}>R$ {selectedOrder.total.toFixed(2)}</span>
                                            </div>
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


