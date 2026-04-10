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
        <div className="auth-page">
            <div className="container auth-container">
                <div className="section-header text-center auth-header">
                    <h2 className="section-title">{isLogin ? 'Bem-vindo de Volta' : 'Criar sua Conta'}</h2>
                    <p className="section-subtitle">Acesse a melhor experiência em pizza artesanal.</p>
                </div>

                <div className="auth-card">
                    <div className="auth-tabs">
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
                        {error && <div className="auth-error">{error}</div>}
                        
                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Nome Completo</label>
                                <input 
                                    className="form-input" 
                                    placeholder="Ex: João Silva" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">E-mail</label>
                            <input 
                                type="email"
                                className="form-input" 
                                placeholder="seu@email.com" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Telefone</label>
                                <input 
                                    className="form-input" 
                                    placeholder="(00) 00000-0000" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                />
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label">Senha</label>
                            <input 
                                type="password"
                                className="form-input" 
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
