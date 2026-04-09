import React, { useEffect, useState } from 'react';
import api from '../../api/api';

export default function DashboardOverview({ token }) {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/api/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch(e) { console.error('Error fetching admin stats', e); }
        };
        fetchOrders();
    }, [token]);

    const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((acc, o) => acc + o.total, 0);
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const cookingCount = orders.filter(o => o.status === 'COOKING').length;
    const completedCount = orders.filter(o => o.status === 'COMPLETED').length;

    const MetricCard = ({ title, value, icon, color }) => (
        <div style={{ flex: 1, background: '#fff', padding: '1.5rem 2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '1.5rem', border: `1px solid #eee`, minWidth: '160px' }}>
            <div style={{ background: color, width: '52px', height: '52px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.3rem', flexShrink: 0 }}>
                <i className={icon}></i>
            </div>
            <div>
                <p style={{ color: '#666', marginBottom: '0.3rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111' }}>{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <h3 style={{ color: '#111', marginBottom: '0.3rem' }}>Painel Geral</h3>
            <p style={{ color: '#555', marginBottom: '2rem', fontSize: '0.9rem' }}>Métricas e status do delivery em tempo real.</p>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <MetricCard title="Receita (Concluídos)" value={`R$ ${totalRevenue.toFixed(2)}`} icon="fa-solid fa-money-bill-wave" color="#27ae60" />
                <MetricCard title="Aguardando" value={pendingCount} icon="fa-solid fa-clock" color="#e74c3c" />
                <MetricCard title="No Forno" value={cookingCount} icon="fa-solid fa-fire" color="#e67e22" />
                <MetricCard title="Entregues Hoje" value={completedCount} icon="fa-solid fa-box-open" color="#3498db" />
            </div>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.07)', border: '1px solid #eee' }}>
                <h4 style={{ color: '#111', marginBottom: '1rem' }}>Sobre o Sistema</h4>
                <p style={{ color: '#555', lineHeight: 1.7 }}>
                    O <strong>Painel Kanban</strong> (aba "Pedidos") permite mover cada pedido pelos estágios:
                    <strong> Recebido → No Forno → Saiu para Entrega → Concluído</strong>.
                    O cliente acompanha o status em tempo real na página <strong>/meu-pedido</strong>.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, background: '#f8f9fa', padding: '1rem', borderRadius: '8px', minWidth: '140px' }}>
                        <h5 style={{ color: '#111', marginBottom: '0.4rem' }}>Frontend</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333', fontSize: '0.88rem' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#27ae60', borderRadius: '50%' }}></span>
                            React + Vite — Online
                        </div>
                    </div>
                    <div style={{ flex: 1, background: '#f8f9fa', padding: '1rem', borderRadius: '8px', minWidth: '140px' }}>
                        <h5 style={{ color: '#111', marginBottom: '0.4rem' }}>Backend</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333', fontSize: '0.88rem' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#27ae60', borderRadius: '50%' }}></span>
                            Express + Neon Postgres — Online
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
