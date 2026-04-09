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
        <div style={{ 
            flex: 1, 
            background: '#1a1a1a', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem', 
            border: `1px solid rgba(255,255,255,0.05)`, 
            minWidth: '220px' 
        }}>
            <div style={{ 
                background: `${color}22`, 
                width: '56px', 
                height: '56px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: color, 
                fontSize: '1.4rem', 
                flexShrink: 0 
            }}>
                <i className={icon}></i>
            </div>
            <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{title}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dashboard</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Visão geral da operação Nona</p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <MetricCard title="Receita (Total)" value={`R$ ${totalRevenue.toFixed(2)}`} icon="fa-solid fa-money-bill-trend-up" color="#27ae60" />
                <MetricCard title="Pendentes" value={pendingCount} icon="fa-solid fa-bell" color="#e74c3c" />
                <MetricCard title="No Forno" value={cookingCount} icon="fa-solid fa-fire-flame-curved" color="#e67e22" />
                <MetricCard title="Concluídos" value={completedCount} icon="fa-solid fa-check-double" color="#3498db" />
            </div>

            <div style={{ 
                background: 'linear-gradient(145deg, #111, #161616)', 
                padding: '2.5rem', 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem' }}>Status da Unidade</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                                O painel está conectado ao cluster Neon Postgres. Todos os pedidos realizados via frontend aparecem instantaneamente na fila Kanban.
                                Utilize o menu lateral para gerenciar as especialidades e os ingredientes do Builder.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>API Server</span>
                                    <span style={{ background: '#27ae6022', color: '#27ae60', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>ONLINE</span>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Banco Neon</span>
                                    <span style={{ background: '#27ae6022', color: '#27ae60', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>CONNECTED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
