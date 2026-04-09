import React, { useState, useEffect } from 'react';
import api from '../api/api';

const STATUS_STEPS = [
    { key: 'PENDING',    icon: '📋', label: 'Pedido Recebido',      desc: 'Seu pedido foi recebido e aguarda preparo.' },
    { key: 'COOKING',    icon: '🔥', label: 'Em Preparo',           desc: 'Nossa equipe está preparando a sua pizza.' },
    { key: 'DELIVERING', icon: '🏍️', label: 'Saiu para Entrega',   desc: 'Seu pedido está a caminho! Aguarde.' },
    { key: 'COMPLETED',  icon: '✅', label: 'Entregue',             desc: 'Pedido entregue. Bom apetite! 🍕' },
];

export default function TrackOrder() {
    const [phone, setPhone] = useState('');
    const [orderId, setOrderId] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('phone'); // 'phone' or 'id'

    // Auto-load saved order from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('nona_last_order');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.id) {
                    fetchById(parsed.id);
                }
            } catch(e) {}
        }
    }, []);

    // Poll selected order every 8 seconds
    useEffect(() => {
        if (!selectedOrder) return;
        const interval = setInterval(() => fetchById(selectedOrder.id), 8000);
        return () => clearInterval(interval);
    }, [selectedOrder?.id]);

    const fetchById = async (id) => {
        try {
            const res = await api.get(`/api/track/${id}`);
            setSelectedOrder(res.data);
            setError('');
        } catch(e) {
            setError('Pedido não encontrado.');
        }
    };

    const searchByPhone = async () => {
        if (!phone.trim()) return;
        setLoading(true);
        setError('');
        try {
            const clean = phone.replace(/\D/g, '');
            const res = await api.get(`/api/track/phone/${clean}`);
            if (res.data.length === 0) {
                setError('Nenhum pedido encontrado para este número.');
                setOrders([]);
            } else {
                setOrders(res.data);
                setSelectedOrder(res.data[0]);
            }
        } catch(e) {
            setError('Erro ao buscar pedidos.');
        } finally {
            setLoading(false);
        }
    };

    const searchById = async () => {
        if (!orderId.trim()) return;
        setLoading(true);
        setError('');
        try {
            await fetchById(parseInt(orderId));
            setOrders([]);
        } catch(e) {
            setError('Pedido não encontrado.');
        } finally {
            setLoading(false);
        }
    };

    const currentStepIdx = selectedOrder
        ? STATUS_STEPS.findIndex(s => s.key === selectedOrder.status)
        : -1;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'inherit', padding: '2rem 1rem' }}>
            {/* Header */}
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <a href="/" style={{ color: 'var(--primary, #e07b39)', textDecoration: 'none', fontSize: '0.9rem', display: 'block', marginBottom: '1.5rem' }}>
                        ← Voltar ao site
                    </a>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--primary, #e07b39)' }}>Nona</span> — Rastrear Pedido
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Acompanhe o status do seu pedido em tempo real</p>
                </div>

                {/* Search Box */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                        {[['phone','Por Telefone'],['id','Por Nº do Pedido']].map(([k, l]) => (
                            <button key={k} onClick={() => setTab(k)} style={{
                                flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
                                background: tab === k ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.08)',
                                color: tab === k ? '#fff' : 'rgba(255,255,255,0.6)',
                                transition: 'all 0.2s'
                            }}>{l}</button>
                        ))}
                    </div>

                    {tab === 'phone' ? (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <input
                                type="tel"
                                placeholder="(11) 99999-9999"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchByPhone()}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.8rem 1rem', color: '#fff', fontSize: '1rem', outline: 'none' }}
                            />
                            <button onClick={searchByPhone} disabled={loading} style={{ background: 'var(--primary, #e07b39)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.8rem 1.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                                {loading ? '...' : 'Buscar'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <input
                                type="number"
                                placeholder="Número do pedido (ex: 42)"
                                value={orderId}
                                onChange={e => setOrderId(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchById()}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.8rem 1rem', color: '#fff', fontSize: '1rem', outline: 'none' }}
                            />
                            <button onClick={searchById} disabled={loading} style={{ background: 'var(--primary, #e07b39)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.8rem 1.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                                {loading ? '...' : 'Buscar'}
                            </button>
                        </div>
                    )}

                    {error && <p style={{ color: '#e74c3c', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}
                </div>

                {/* Multiple orders list */}
                {orders.length > 1 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Selecione um pedido:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {orders.map(o => (
                                <button key={o.id} onClick={() => setSelectedOrder(o)} style={{
                                    background: selectedOrder?.id === o.id ? 'rgba(224,123,57,0.2)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${selectedOrder?.id === o.id ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: '10px', padding: '0.8rem 1rem', cursor: 'pointer', color: '#fff', textAlign: 'left',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span>Pedido #{o.id} — R$ {o.total.toFixed(2)}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(o.createdAt).toLocaleDateString('pt-BR')}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Order Status Card */}
                {selectedOrder && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        {/* Order Header */}
                        <div style={{ background: 'rgba(224,123,57,0.15)', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>Pedido #{selectedOrder.id}</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                        {new Date(selectedOrder.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'var(--primary, #e07b39)', fontSize: '1.3rem', fontWeight: 800 }}>R$ {selectedOrder.total.toFixed(2)}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{selectedOrder.customerName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {STATUS_STEPS.map((step, idx) => {
                                    const isDone = idx <= currentStepIdx;
                                    const isActive = idx === currentStepIdx;
                                    return (
                                        <div key={step.key} style={{ display: 'flex', gap: '1rem', paddingBottom: idx < STATUS_STEPS.length - 1 ? '1.5rem' : '0', position: 'relative' }}>
                                            {/* Line */}
                                            {idx < STATUS_STEPS.length - 1 && (
                                                <div style={{
                                                    position: 'absolute', left: '19px', top: '40px', width: '2px', height: 'calc(100% - 8px)',
                                                    background: idx < currentStepIdx ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.1)'
                                                }} />
                                            )}
                                            {/* Icon Ball */}
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                                background: isDone ? (isActive ? 'var(--primary, #e07b39)' : 'rgba(224,123,57,0.3)') : 'rgba(255,255,255,0.06)',
                                                border: `2px solid ${isDone ? 'var(--primary, #e07b39)' : 'rgba(255,255,255,0.1)'}`,
                                                transition: 'all 0.4s'
                                            }}>
                                                {step.icon}
                                            </div>
                                            {/* Text */}
                                            <div style={{ paddingTop: '0.4rem' }}>
                                                <p style={{ fontWeight: isActive ? 700 : 500, color: isDone ? '#fff' : 'rgba(255,255,255,0.35)', marginBottom: '0.2rem', fontSize: '0.98rem' }}>
                                                    {step.label}
                                                    {isActive && <span style={{ marginLeft: '8px', background: 'var(--primary, #e07b39)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', verticalAlign: 'middle' }}>ATUAL</span>}
                                                </p>
                                                {isActive && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem' }}>{step.desc}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Items */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 1.5rem' }}>
                            <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Itens do Pedido</h4>
                            {selectedOrder.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{item.qty}x {item.productName}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>R$ {(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <p style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>
                            Atualização automática a cada 8 segundos
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
