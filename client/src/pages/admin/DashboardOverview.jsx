import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardOverview({ token }) {
    const [orders, setOrders] = useState([]);
    
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch(e) { console.error("Error fetching admin stats", e); }
        };
        fetchOrders();
    }, [token]);

    const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((acc, curr) => acc + curr.total, 0);
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const completedCount = orders.filter(o => o.status === 'COMPLETED').length;

    const MetricCard = ({ title, value, icon, color }) => (
        <div style={{ flex: 1, background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: color, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.5rem' }}>
                <i className={icon}></i>
            </div>
            <div>
                <h4 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>{title}</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#222' }}>{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <h3>Visão Geral do Hub</h3>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Métricas rápidas e desempenho do delivery.</p>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <MetricCard title="Receita (Concluídos)" value={`R$ ${totalRevenue.toFixed(2)}`} icon="fa-solid fa-money-bill-wave" color="#2ecc71" />
                <MetricCard title="Aguardando Ação" value={pendingCount} icon="fa-solid fa-clock" color="#e74c3c" />
                <MetricCard title="Pedidos Entregues" value={completedCount} icon="fa-solid fa-box-open" color="#3498db" />
            </div>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <h4>Operação Atual</h4>
                <p style={{ marginTop: '1rem', color: '#555' }}>
                    Utilize o menu lateral para gerenciar as especialidades da casa. O "Painel Kanban" irá ditar o sequenciamento na central de envios.
                    Sempre que novos clientes realizarem checkout através da API de cart, a fila Kanban e a aba de Receita atualizarão em Real-time via polling.
                </p>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
                        <h5>Front-end Status</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'green', borderRadius: '50%' }}></span> React Vite Application Ativo</div>
                    </div>
                    <div style={{ flex: 1, background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
                        <h5>Back-end Status</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'green', borderRadius: '50%' }}></span> Express.js + SQLite Ativo</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
