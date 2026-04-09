import React, { useState } from 'react';
import api from '../api/api';
import OrdersPanel from './admin/OrdersPanel';
import ProductsManager from './admin/ProductsManager';
import FlavorsManager from './admin/FlavorsManager';
import DashboardOverview from './admin/DashboardOverview';

export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('admin_token', res.data.token);
            setToken(res.data.token);
        } catch(err) {
            setError('Credenciais inválidas');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    if (!token) {
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#fff' }}>
                <form onSubmit={handleLogin} style={{ background: '#111', padding: '2.5rem', borderRadius: '16px', width: '340px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary, #e07b39)' }}>Nona Admin</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Acesso Restrito</p>
                    </div>
                    {error && <div style={{ color: '#e74c3c', marginBottom: '1rem', textAlign: 'center', background: 'rgba(231,76,60,0.1)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}>{error}</div>}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <input type="email" placeholder="Email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required 
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <input type="password" placeholder="Senha" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required 
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" style={{ padding: '0.8rem', fontWeight: 700 }}>Entrar no Painel</button>
                    <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>← Voltar ao site</a>
                </form>
            </div>
        );
    }

    const navItemStyle = (tabId) => ({
        padding: '0.9rem 1.2rem', 
        cursor: 'pointer', 
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: activeTab === tabId ? '700' : '500',
        color: activeTab === tabId ? '#fff' : 'rgba(255,255,255,0.5)',
        background: activeTab === tabId ? 'rgba(224,123,57,0.15)' : 'transparent',
        borderLeft: activeTab === tabId ? '4px solid var(--primary, #e07b39)' : '4px solid transparent',
        transition: 'all 0.2s',
        marginBottom: '0.5rem',
        borderRadius: '0 8px 8px 0'
    });

    return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <header style={{ background: '#111', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'var(--primary, #e07b39)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-pizza-slice" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>NONA <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>ADMIN</span></h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Logado como <strong>Admin</strong></span>
                    <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>Sair</button>
                </div>
            </header>
            
            <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 70px)' }}>
                <nav style={{ width: '280px', background: '#111', padding: '1.5rem 0', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={navItemStyle('dashboard')} onClick={() => setActiveTab('dashboard')}><i className="fa-solid fa-chart-line"></i> Dashboard</li>
                        <li style={navItemStyle('orders')} onClick={() => setActiveTab('orders')}><i className="fa-solid fa-motorcycle"></i> Pedidos</li>
                        <li style={navItemStyle('products')} onClick={() => setActiveTab('products')}><i className="fa-solid fa-boxes-stacked"></i> Cardápio</li>
                        <li style={navItemStyle('flavors')} onClick={() => setActiveTab('flavors')}><i className="fa-solid fa-seedling"></i> Sabores Builder</li>
                    </ul>
                </nav>
                
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#0f0f0f' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {activeTab === 'dashboard' && <DashboardOverview token={token} />}
                        {activeTab === 'orders' && <OrdersPanel token={token} />}
                        {activeTab === 'products' && <ProductsManager token={token} />}
                        {activeTab === 'flavors' && <FlavorsManager token={token} />}
                    </div>
                </main>
            </div>
        </div>
    );
}
