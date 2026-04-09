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
            setError(err.response?.data?.error || 'Credenciais inválidas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', paddingTop: '100px' }}>
            <div className="container" style={{ maxWidth: '450px' }}>
                <div className="section-header text-center" style={{ marginBottom: '2rem' }}>
                    <h2 className="section-title">{isLogin ? 'Bem-vindo de Volta' : 'Criar sua Conta'}</h2>
                    <p className="section-subtitle">Acesse a melhor experiência em pizza artesanal.</p>
                </div>

                <div className="auth-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px', padding: '2.5rem' }}>
                    <div className="auth-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                        <button 
                            className={`btn-text ${isLogin ? 'active' : ''}`} 
                            style={{ flex: 1, padding: '0.5rem', color: isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isLogin ? 'bold' : 'normal' }}
                            onClick={() => setIsLogin(true)}
                        >
                            LOGIN
                        </button>
                        <button 
                            className={`btn-text ${!isLogin ? 'active' : ''}`}
                            style={{ flex: 1, padding: '0.5rem', color: !isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: !isLogin ? 'bold' : 'normal' }}
                            onClick={() => setIsLogin(false)}
                        >
                            CADASTRO
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div style={{ color: '#ff4444', background: 'rgba(255,68,68,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}
                        
                        {!isLogin && (
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nome Completo</label>
                                <input 
                                    className="form-input" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '8px' }}
                                    placeholder="Ex: João Silva" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>E-mail</label>
                            <input 
                                type="email"
                                className="form-input" 
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '8px' }}
                                placeholder="seu@email.com" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Telefone</label>
                                <input 
                                    className="form-input" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '8px' }}
                                    placeholder="(00) 00000-0000" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                />
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Senha</label>
                            <input 
                                type="password"
                                className="form-input" 
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '8px' }}
                                placeholder="••••••••" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>

                        <button className="btn btn-primary w-100" style={{ padding: '1.2rem', fontSize: '1rem' }} disabled={loading}>
                            {loading ? 'Processando...' : isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
                        </button>
                    </form>

                    <button 
                        className="btn-text w-100" 
                        style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}
                        onClick={() => navigate('/')}
                    >
                        <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i> Voltar para Início
                    </button>
                </div>
            </div>
        </div>
    );
}
