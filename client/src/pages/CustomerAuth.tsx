import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const endpoint = isLogin ? '/api/customer/login' : '/api/customer/register';
            const res = await api.post(endpoint, formData);
            localStorage.setItem('customer_token', res.data.token);
            localStorage.setItem('customer_name', res.data.name);
            navigate('/');
        } catch(err: any) {
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
                            onClick={() => setIsLogin(true)} 
                            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
                        >
                            Entrar
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)} 
                            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Seu nome"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <input 
                                type="email" 
                                className="form-input" 
                                placeholder="E-mail"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="Senha"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                        {!isLogin && (
                            <div className="form-group">
                                <input 
                                    type="tel" 
                                    className="form-input" 
                                    placeholder="Telefone (opcional)"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        )}
                        <button className="btn btn-primary w-100 mt-2" type="submit" disabled={loading}>
                            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-4">
                    <button onClick={() => navigate('/')} className="btn-text">
                        <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i> Voltar ao Início
                    </button>
                </div>
            </div>
        </div>
    );
}
