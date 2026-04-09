import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const endpoint = isLogin ? '/api/customer/login' : '/api/customer/register';
            const res = await api.post(endpoint, formData);
            localStorage.setItem('customer_token', res.data.token);
            localStorage.setItem('customer_name', res.data.name);
            navigate('/');
        } catch(err) {
            setError(err.response?.data?.error || 'Erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '0.9rem 1.2rem', color: '#fff', fontSize: '1rem', outline: 'none',
        marginBottom: '1rem', boxSizing: 'border-box'
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <a href="/" style={{ color: 'var(--primary, #e07b39)', textDecoration: 'none', fontSize: '0.9rem', display: 'block', marginBottom: '1.5rem' }}>← Voltar para a Home</a>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--primary, #e07b39)' }}>Nona</span> Auth
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                        {isLogin ? 'Faça login para gerenciar seus pedidos' : 'Crie sua conta na melhor pizzaria'}
                    </p>
                </div>

                <div style={{ background: '#111', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <button onClick={() => setIsLogin(true)} style={{
                            flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700,
                            background: isLogin ? 'var(--primary, #e07b39)' : 'transparent',
                            color: isLogin ? '#fff' : 'rgba(255,255,255,0.5)',
                            transition: 'all 0.3s'
                        }}>Entrar</button>
                        <button onClick={() => setIsLogin(false)} style={{
                            flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700,
                            background: !isLogin ? 'var(--primary, #e07b39)' : 'transparent',
                            color: !isLogin ? '#fff' : 'rgba(255,255,255,0.5)',
                            transition: 'all 0.3s'
                        }}>Cadastrar</button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div style={{ color: '#e74c3c', background: 'rgba(231,76,60,0.1)', padding: '0.8rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}
                        
                        {!isLogin && (
                            <input style={inputStyle} placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        )}
                        
                        <input style={inputStyle} type="email" placeholder="Seu melhor e-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        
                        {!isLogin && (
                            <input style={inputStyle} placeholder="Telefone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        )}
                        
                        <input style={inputStyle} type="password" placeholder="Sua senha" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />

                        <button type="submit" className="btn btn-primary w-100" style={{ padding: '1rem', fontWeight: 800, fontSize: '1rem', marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Carregando...' : (isLogin ? 'Entrar Agora' : 'Finalizar Cadastro')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
