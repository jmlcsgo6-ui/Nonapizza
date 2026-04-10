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
        <div className="track-page">
            <Header />
            
            <div className="container track-container">
                <div className="section-header auth-header">
                    <h2 className="section-title">Acompanhar Pedido</h2>
                    <p className="section-subtitle">Veja o status da sua pizza em tempo real.</p>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-orders text-center">
                        <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1.5rem', display: 'block' }}></i>
                        <p style={{ opacity: 0.5 }}>Você ainda não realizou nenhum pedido.</p>
                        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>Ir para o Cardápio</button>
                    </div>
                ) : (
                    <div className="track-grid">
                        {/* Sidebar */}
                        <div className="orders-sidebar">
                            <h4 className="sidebar-title">HISTÓRICO RECENTE</h4>
                            {orders.map(o => (
                                <div 
                                    key={o.id} 
                                    className={`order-card ${selectedOrder?.id === o.id ? 'active' : ''}`}
                                    onClick={() => setSelectedOrder(o)}
                                >
                                    <div className="order-card-header">
                                        <span className="order-id"># {o.id.toString().padStart(4, '0')}</span>
                                        <span className={`order-status-badge ${o.status === 'COMPLETED' ? 'completed' : 'active'}`}>
                                            {STATUS_STEPS.find(s => s.key === o.status)?.label || o.status}
                                        </span>
                                    </div>
                                    <div className="order-card-meta">
                                        {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} itens
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Detail */}
                        <div className="order-detail">
                            {selectedOrder && (
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <h3 className="detail-title">Pedido #{selectedOrder.id}</h3>
                                        <p className="detail-subtitle"><i className="fa-solid fa-location-dot" style={{ marginRight: '8px' }}></i> {selectedOrder.address}</p>
                                    </div>

                                    {/* Status Timeline */}
                                    <div className="status-timeline-container">
                                        <div className="timeline-track"></div>
                                        <div className="timeline-progress" style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}></div>
                                        
                                        {STATUS_STEPS.map((step, idx) => (
                                            <div key={step.key} className={`timeline-step ${idx <= currentStepIdx ? 'completed' : ''}`}>
                                                <div className="step-node">
                                                    {idx < currentStepIdx ? <i className="fa-solid fa-check"></i> : null}
                                                    {idx === currentStepIdx ? <div className="pulse-dot"></div> : null}
                                                </div>
                                                <div className="step-info">
                                                    <div className="step-label">{step.label}</div>
                                                    {idx === currentStepIdx && <div className="step-description">{step.desc}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Items List */}
                                    <div className="order-summary-box">
                                        <h4 className="summary-title">RESUMO DO PEDIDO</h4>
                                        <div className="summary-list">
                                            {selectedOrder.items.map((item, i) => (
                                                <div key={i} className="summary-item">
                                                    <span><span className="qty-ref">{item.qty}x</span> {item.productName}</span>
                                                    <span>R$ {(item.price * item.qty).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="summary-total">
                                                <span>Total</span>
                                                <span className="total-value">R$ {selectedOrder.total.toFixed(2)}</span>
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


