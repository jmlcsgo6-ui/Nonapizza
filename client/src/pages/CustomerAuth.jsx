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
    const inputStyle = "w-full bg-black border border-white/10 p-4 pl-12 pr-4 text-[11px] text-white focus:border-primary outline-none transition-all placeholder:text-white/5 uppercase font-mono tracking-widest";

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-mono">
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[420px]"
            >
                <div className="text-center mb-10">
                    <button 
                        onClick={() => navigate('/')} 
                        className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5em] hover:text-white transition-colors flex items-center gap-2 mx-auto mb-8"
                    >
                        <ArrowLeft size={10} /> TERMINATE_SESSION
                    </button>
                    
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-1 h-8 bg-primary"></div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase italic">ACCESS <span className="text-primary italic">PROTOCOLS</span></h2>
                    </div>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">VERIFICAÇÃO DE IDENTIDADE ALQUIMIA</p>
                </div>

                <div className="bg-black border border-white/10 p-1">
                    <div className="bg-black p-8 space-y-8 relative">
                        {/* Decorative segments */}
                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/10"></div>
                        
                        {/* Toggle Switch Sharp */}
                        <div className="flex border border-white/5 p-1 bg-white/[0.02]">
                            <button 
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-3 font-black text-[10px] tracking-[0.2em] transition-all ${isLogin ? 'bg-primary text-black' : 'text-white/30 hover:text-white'}`}
                            >
                                LOGIN_v1
                            </button>
                            <button 
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-3 font-black text-[10px] tracking-[0.2em] transition-all ${!isLogin ? 'bg-primary text-black' : 'text-white/30 hover:text-white'}`}
                            >
                                REGISTER_v2
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'login' : 'register'}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 5 }}
                                    className="space-y-4"
                                >
                                    {error && (
                                        <div className="bg-red-500/5 border border-red-500/20 p-4 text-red-500 text-[9px] font-bold text-center uppercase tracking-widest leading-relaxed">
                                            {error}
                                        </div>
                                    )}
                                    
                                    {!isLogin && (
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                            <input className={inputStyle} placeholder="NOME_COMPLETO" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                        </div>
                                    )}
                                    
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <input className={inputStyle} type="email" placeholder="ENDEREÇO_EMAIL" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                    
                                    {!isLogin && (
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                            <input className={inputStyle} placeholder="TELEFONE_CONTATO" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                        </div>
                                    )}
                                    
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <input className={inputStyle} type="password" placeholder="CHAVE_ACESSO" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <button 
                                type="submit" 
                                className="w-full bg-primary py-5 font-black text-[11px] uppercase tracking-[0.4em] text-black hover:bg-white transition-all flex items-center justify-center gap-3"
                                disabled={loading}
                            >
                                {loading ? 'INITIATING...' : (isLogin ? 'GRANT_ACCESS' : 'INITIALIZE_CORE')}
                                <ChevronRight size={14} strokeWidth={3} />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 text-center opacity-20">
                    <p className="text-[8px] font-bold uppercase tracking-[0.5em] leading-loose">
                        SECURE_CONNECTION_48H_ALQUIMIA<br/>
                        &copy; {new Date().getFullYear()} NONA_OS v2.0
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
