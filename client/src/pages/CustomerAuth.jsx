import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, ChevronRight, Utensils, ArrowLeft } from 'lucide-react';

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

    const inputStyle = "w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/20";

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '450px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <ArrowLeft size={14} /> Voltar ao Início
                    </button>
                    
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(255, 94, 0, 0.1)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Utensils size={30} />
                    </div>
                    
                    <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ENTRADA <span style={{ color: 'var(--primary)' }}>Membro</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Acesso à Alquimia</p>
                </div>

                <div className="step-card" style={{ padding: '2.5rem 2rem', textAlign: 'left' }}>
                    
                    {/* Toggle Switch */}
                    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.3rem', marginBottom: '2rem' }}>
                        <button 
                            onClick={() => setIsLogin(true)}
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', background: isLogin ? 'var(--primary)' : 'none', color: isLogin ? '#fff' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', transition: '0.3s' }}
                        >
                            LOGIN
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)}
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', background: !isLogin ? 'var(--primary)' : 'none', color: !isLogin ? '#fff' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', transition: '0.3s' }}
                        >
                            CADASTRO
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                            >
                                {error && (
                                    <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.2)', padding: '1rem', borderRadius: '8px', color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                                        {error}
                                    </div>
                                )}
                                
                                {!isLogin && (
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                        <input className="form-input" style={{ paddingLeft: '3rem' }} placeholder="NOME COMPLETO" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                    </div>
                                )}
                                
                                <div className="form-group" style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                    <input className="form-input" style={{ paddingLeft: '3rem' }} type="email" placeholder="E-MAIL" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                
                                {!isLogin && (
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                        <input className="form-input" style={{ paddingLeft: '3rem' }} placeholder="TELEFONE" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                )}
                                
                                <div className="form-group" style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                    <input className="form-input" style={{ paddingLeft: '3rem' }} type="password" placeholder="SENHA" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100"
                            style={{ padding: '1.2rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? 'PROCESSANDO...' : (isLogin ? 'ENTRAR AGORA' : 'FINALIZAR CADASTRO')}
                            <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </form>
                </div>

                <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    &copy; Nona Pizza Alquimia de 48h
                </p>
            </motion.div>
        </div>
    );
}
