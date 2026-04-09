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
            <div className="min-h-screen bg-[#000] flex items-center justify-center p-6 relative overflow-hidden font-mono">
                {/* Tactical grid background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md z-10"
                >
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-6">
                            <ChefHat size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Nona <span className="text-primary italic">Admin</span></h2>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-2">SISTEMA INTEGRADO DE ALQUIMIA</p>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/10 p-10 shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary"></div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-500/10 border-l-2 border-red-500 p-4 text-red-500 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    {error}
                                </motion.div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] block">ID DO OPERADOR</label>
                                <input 
                                    type="email" 
                                    className="w-full bg-white/[0.03] border border-white/10 py-4 px-6 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/5 uppercase"
                                    placeholder="EMAIL@NONA.COM"
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] block">CHAVE CRIPTOGRÁFICA</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-white/[0.03] border border-white/10 py-4 px-6 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-white/5"
                                    placeholder="••••••••"
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary py-4 flex justify-center items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] text-black hover:bg-white transition-all group">
                                AUTENTICAR SESSÃO <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    <a href="/" className="block text-center mt-10 text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] hover:text-white transition-colors">
                        Sair do terminal
                    </a>
                </motion.div>
            </div>
        );
    }

    const navItems = [
        { id: 'dashboard', label: 'OVERVIEW_STATS', icon: LayoutDashboard },
        { id: 'orders', label: 'ORDERS_QUEUE', icon: ShoppingBag },
        { id: 'products', label: 'FIXED_INVENTORY', icon: Pizza },
        { id: 'flavors', label: 'FLAVOR_MODULES', icon: PieChart },
    ];

    return (
        <div className="min-h-screen bg-[#050505] flex font-mono">
            {/* Sidebar Sharp Redesign */}
            <aside className="w-64 bg-black border-r border-white/10 flex flex-col">
                <div className="p-8 mb-4 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary text-black flex items-center justify-center">
                            <ChefHat size={16} strokeWidth={3} />
                        </div>
                        <h2 className="text-lg font-black italic tracking-tighter text-white uppercase">NONA <span className="text-primary italic">HUB</span></h2>
                    </div>
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">ADMIN-CORE-V2</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-3 transition-all border-l-2 ${activeTab === item.id ? 'bg-primary/5 text-primary border-primary' : 'text-white/40 hover:text-white hover:bg-white/[0.02] border-transparent'}`}
                        >
                            <item.icon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/10 bg-black/50 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                            <User size={14} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-bold text-white uppercase tracking-widest leading-none">ROOT_USER</p>
                            <p className="text-[8px] font-medium text-green-500 uppercase mt-1 tracking-widest">ONLINE</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                    >
                        <LogOut size={12} /> TERMINAR SESSÃO
                    </button>
                </div>
            </aside>

            {/* Main Content Area Sharp Redesign */}
            <main className="flex-1 overflow-y-auto bg-[#080808] relative">
                {/* Technical background effect */}
                <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>

                <header className="h-20 px-10 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-0.5 h-6 bg-primary"></div>
                        <h1 className="text-[10px] font-black text-white uppercase tracking-[0.5em]">
                            SYSTEM_NODE / {navItems.find(i => i.id === activeTab)?.id.toUpperCase()}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest hidden md:block">
                            COORD_X: 48.293 / Y: 12.002
                        </div>
                        <button className="p-2 border border-white/10 text-white/40 hover:text-primary transition-all">
                            <Settings size={16} />
                        </button>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto z-10 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
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
