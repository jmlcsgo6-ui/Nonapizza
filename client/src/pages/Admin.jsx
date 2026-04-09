import React, { useState } from 'react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Pizza, 
    PieChart, 
    LogOut, 
    User, 
    ChevronRight, 
    ChefHat, 
    Settings 
} from 'lucide-react';
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
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('admin_token', res.data.token);
            setToken(res.data.token);
        } catch(err) {
            setError('Credenciais inválidas ou acesso negado');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-card border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ChefHat size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Nona <span className="text-primary italic">Admin</span></h2>
                        <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-2">Painel de Alquimia</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Email Administrativo</label>
                            <input 
                                type="email" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-primary outline-none transition-all"
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Senha Mestra</label>
                            <input 
                                type="password" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-primary outline-none transition-all"
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-premium w-full py-5 rounded-2xl flex justify-center items-center gap-3">
                            ACESSAR PAINEL <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </form>

                    <a href="/" className="block text-center mt-10 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                        ← Retornar ao site público
                    </a>
                </motion.div>
            </div>
        );
    }

    const navItems = [
        { id: 'dashboard', label: 'Estatísticas', icon: LayoutDashboard },
        { id: 'orders', label: 'Gerenciar Pedidos', icon: ShoppingBag },
        { id: 'products', label: 'Cardápio Fixo', icon: Pizza },
        { id: 'flavors', label: 'Sabores Builder', icon: PieChart },
    ];

    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Sidebar */}
            <aside className="w-80 bg-card border-r border-white/5 flex flex-col pt-10">
                <div className="px-8 mb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                        <ChefHat size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter text-white">NONA <span className="text-white/20 italic">ADMIN</span></h2>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">v2.0 Premium</span>
                    </div>
                </div>

                <nav className="flex-1 px-4">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl mb-2 transition-all group ${activeTab === item.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                            <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div layoutId="admin-nav" className="ml-auto">
                                    <ChevronRight size={14} />
                                </motion.div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                            <User size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Administrador</p>
                            <p className="text-[9px] font-medium text-white/30 uppercase mt-1">Sessão Ativa</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        <LogOut size={16} /> ENCERRAR SESSÃO
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505]">
                <header className="h-24 px-12 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-10">
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-[0.3em]">
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <div className="p-12 max-w-7xl mx-auto min-h-[calc(100vh-6rem)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'dashboard' && <DashboardOverview token={token} />}
                            {activeTab === 'orders' && <OrdersPanel token={token} />}
                            {activeTab === 'products' && <ProductsManager token={token} />}
                            {activeTab === 'flavors' && <FlavorsManager token={token} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
