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
        <div className="auth-page" style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container auth-container" style={{ maxWidth: '450px' }}>
                <div className="section-header text-center auth-header">
                    <h2 className="section-title">{isLogin ? 'Bem-vindo de Volta' : 'Criar sua Conta'}</h2>
                    <p className="section-subtitle">Acesse a melhor experiência em pizza artesanal.</p>
                </div>

                <div className="auth-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', marginTop: '2rem' }}>
                    <div style={{ display: 'flex', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', padding: '4px' }}>
                        <button 
                            onClick={() => setIsLogin(true)} 
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', background: isLogin ? '#ff5e00' : 'transparent', color: isLogin ? '#fff' : '#b0b0b0' }}
                        >
                            Entrar
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)} 
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', background: !isLogin ? '#ff5e00' : 'transparent', color: !isLogin ? '#fff' : '#b0b0b0' }}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {error && <div style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#ff3b30', fontSize: '0.9rem' }}>{error}</div>}

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
                        <button className="btn btn-primary w-100" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                        </button>
                    </form>
                </div>

                <div className="text-center" style={{ marginTop: '2rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#b0b0b0', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i> Voltar ao Início
                    </button>
                </div>
            </div>
        </div>
    );
}
