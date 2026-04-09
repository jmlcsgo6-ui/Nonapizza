import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, ChevronRight, ArrowLeft, LogIn, UserPlus } from 'lucide-react';

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

    const inputStyle = "w-full bg-white/[0.03] border border-white/10 p-5 pl-14 rounded-2xl text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/10";

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <button 
                        onClick={() => navigate('/')} 
                        className="group mb-8 inline-flex items-center gap-2 text-xs font-bold text-white/20 hover:text-white uppercase tracking-widest transition-all"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Voltar para Home
                    </button>
                    
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-1.5 h-10 bg-primary rounded-full mb-2"></div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                            Bem-<span className="text-primary italic">Vindo</span>
                        </h2>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Autenticação Exclusiva Nona Pizza</p>
                    </div>
                </div>

                {/* Main Auth Card */}
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[40px] p-2 shadow-2xl overflow-hidden">
                    <div className="bg-[#080808] rounded-[38px] p-10 relative overflow-hidden">
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-white/[0.02] border border-white/5 p-1.5 rounded-[24px] mb-10">
                            <button 
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${isLogin ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                            >
                                <LogIn size={14} /> Entrar
                            </button>
                            <button 
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${!isLogin ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                            >
                                <UserPlus size={14} /> Cadastro
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'login' : 'register'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">
                                            {error}
                                        </div>
                                    )}
                                    
                                    {!isLogin && (
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                            <input className={inputStyle} placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                        </div>
                                    )}
                                    
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                        <input className={inputStyle} type="email" placeholder="Seu melhor e-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                    
                                    {!isLogin && (
                                        <div className="relative group">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                            <input className={inputStyle} placeholder="Seu telefone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                        </div>
                                    )}
                                    
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                        <input className={inputStyle} type="password" placeholder="Sua senha secreta" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <button 
                                type="submit" 
                                className="w-full h-20 bg-primary rounded-[28px] font-black text-xs uppercase tracking-[0.3em] text-white hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                    </motion.div>
                                ) : (
                                    <>
                                        {isLogin ? 'Entrar Agora' : 'Criar minha Conta'}
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="mt-12 text-center opacity-20">
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] leading-relaxed">
                        Sistema Seguro Nona Pizza<br/>
                        &copy; {new Date().getFullYear()} PREMIUM EXPERIENCE
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
