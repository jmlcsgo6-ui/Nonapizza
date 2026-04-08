import React, { useState } from 'react';
import axios from 'axios';
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
            const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
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
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#111', color: '#fff' }}>
                <form onSubmit={handleLogin} style={{ background: '#222', padding: '2rem', borderRadius: '12px', width: '300px' }}>
                    <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Nona Admin</h2>
                    {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <input type="email" placeholder="Email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <input type="password" placeholder="Senha" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Entrar</button>
                </form>
            </div>
        );
    }

    const navItemStyle = (tabId) => ({
        padding: '0.8rem', 
        borderBottom: '1px solid #eee', 
        cursor: 'pointer', 
        fontWeight: activeTab === tabId ? 'bold' : 'normal',
        background: activeTab === tabId ? '#f5f5f5' : 'transparent',
        borderRadius: '4px'
    });

    return (
        <div style={{ background: '#f4f4f4', minHeight: '100vh', color: '#333' }}>
            <header style={{ background: '#111', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>NONA Admin</h2>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sair</button>
            </header>
            
            <div style={{ padding: '2rem', display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <nav style={{ width: '250px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={navItemStyle('dashboard')} onClick={() => setActiveTab('dashboard')}><i className="fa-solid fa-chart-line" style={{marginRight: '8px'}}></i> Painel Geral</li>
                        <li style={navItemStyle('orders')} onClick={() => setActiveTab('orders')}><i className="fa-solid fa-motorcycle" style={{marginRight: '8px'}}></i> Pedidos (Real-time)</li>
                        <li style={navItemStyle('products')} onClick={() => setActiveTab('products')}><i className="fa-solid fa-box" style={{marginRight: '8px'}}></i> Produtos Fixos</li>
                        <li style={navItemStyle('flavors')} onClick={() => setActiveTab('flavors')}><i className="fa-solid fa-pizza-slice" style={{marginRight: '8px'}}></i> Sabores (Builder)</li>
                    </ul>
                </nav>
                
                <main style={{ flex: 1, background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minHeight: '70vh' }}>
                    {activeTab === 'dashboard' && <DashboardOverview token={token} />}
                    {activeTab === 'orders' && <OrdersPanel token={token} />}
                    {activeTab === 'products' && <ProductsManager token={token} />}
                    {activeTab === 'flavors' && <FlavorsManager token={token} />}
                </main>
            </div>
        </div>
    );
}
