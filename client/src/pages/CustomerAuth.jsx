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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Immersive Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] z-10"
            >
                <div className="text-center mb-10">
                    <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all mx-auto">
                        <ArrowLeft size={14} /> Voltar ao Início
                    </button>
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Utensils size={32} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">ENTRADA <span className="text-primary">Membro</span></h2>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-2">Acesso exclusivo à alquimia Nona</p>
                </div>

                <div className="bg-card border border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                    
                    {/* Toggle Switch */}
                    <div className="flex bg-white/5 p-1 rounded-2xl mb-10 border border-white/5">
                        <button 
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                        >
                            LOGIN
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                        >
                            CADASTRO
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                                className="space-y-4"
                            >
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase text-center tracking-widest">
                                        {error}
                                    </div>
                                )}
                                
                                {!isLogin && (
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input className={inputStyle} placeholder="NOME COMPLETO" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input className={inputStyle} type="email" placeholder="E-MAIL" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                
                                {!isLogin && (
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input className={inputStyle} placeholder="TELEFONE" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input className={inputStyle} type="password" placeholder="SENHA" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <button 
                            type="submit" 
                            className="btn-premium w-full py-5 rounded-2xl flex justify-center items-center gap-4 text-xs tracking-widest"
                            disabled={loading}
                        >
                            {loading ? 'PROCESSANDO...' : (isLogin ? 'ENTRAR AGORA' : 'FINALIZAR CADASTR0')}
                            <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-[10px] font-black text-white/20 uppercase tracking-widest">
                    &copy; Nona Pizza Alquimia de 48h
                </p>
            </motion.div>
        </div>
    );
}
