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
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md z-10"
                >
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-6 rounded-2xl">
                            <ChefHat size={40} />
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-white italic">Nona <span className="text-primary italic">Admin</span></h2>
                        <p className="text-white/40 mt-2 font-medium">Painel de Gerenciamento Alquimia</p>
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/5 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-semibold text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full bg-white/[0.03] border border-white/10 py-4 px-6 rounded-2xl text-white focus:border-primary outline-none transition-all placeholder:text-white/10"
                                    placeholder="seu@email.com"
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Senha</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-white/[0.03] border border-white/10 py-4 px-6 rounded-2xl text-white focus:border-primary outline-none transition-all placeholder:text-white/10"
                                    placeholder="••••••••"
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary py-4 rounded-2xl flex justify-center items-center gap-3 font-bold text-white hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                                Entrar no Painel <ChevronRight size={18} />
                            </button>
                        </form>
                    </div>

                    <a href="/" className="block text-center mt-8 text-sm font-medium text-white/30 hover:text-white transition-colors">
                        Sair do terminal
                    </a>
                </motion.div>
            </div>
        );
    }

    const navItems = [
        { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
        { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
        { id: 'products', label: 'Produtos', icon: Pizza },
        { id: 'flavors', label: 'Sabores', icon: PieChart },
    ];

    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Sidebar Revert */}
            <aside className="w-72 bg-[#0c0c0c] border-r border-white/5 flex flex-col m-4 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 mb-4 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                            <ChefHat size={20} />
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-white italic">NONA <span className="text-primary italic">HUB</span></h2>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                        >
                            <item.icon size={20} />
                            <span className="font-bold tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 bg-black/20 m-4 rounded-2xl space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <User size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white leading-none">Administrador</p>
                            <p className="text-[10px] font-medium text-green-500 uppercase mt-1 tracking-widest">Online</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all text-sm font-bold"
                    >
                        <LogOut size={16} /> Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Main Content Area Revert */}
            <main className="flex-1 overflow-y-auto p-4 relative">
                <header className="h-20 px-8 bg-[#0c0c0c]/50 backdrop-blur-xl border border-white/5 rounded-3xl flex items-center justify-between sticky top-0 z-20 shadow-xl mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h1 className="text-lg font-bold text-white tracking-tight">
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/40 hover:text-primary transition-all">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto pb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
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

