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
        <div className="min-h-screen bg-[#050505] flex text-white relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 z-0 pointer-events-none"></div>

            {/* Sidebar */}
            <aside className="w-80 bg-[#0a0a0a]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col m-6 rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 border border-white/[0.03]">
                <div className="p-10 mb-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
                            <ChefHat size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight italic">NONA <span className="text-primary">HUB</span></h2>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] transition-all group ${activeTab === item.id ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'text-white/30 hover:text-white hover:bg-white/[0.03]'}`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                            <span className="font-bold tracking-tight text-sm uppercase letter-spacing-1">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/5 bg-black/40 m-6 rounded-[32px] space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-white/10 to-primary/20">
                            <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center text-primary">
                                <User size={20} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white leading-none">Administrador</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
                                <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Sincronizado</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-4 text-white/40 bg-white/[0.03] hover:bg-red-500 hover:text-white rounded-2xl transition-all text-xs font-bold uppercase tracking-widest border border-white/5"
                    >
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-10 py-10 relative z-10 custom-scrollbar">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Dashboard</span>
                            <ChevronRight size={10} className="text-white/20" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">
                                {navItems.find(i => i.id === activeTab)?.label}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                            Painel de <span className="text-primary">Controle</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="h-14 px-8 bg-white/[0.03] border border-white/5 rounded-2xl text-white/60 hover:text-white hover:border-white/10 transition-all flex items-center gap-3 font-bold text-xs uppercase tracking-widest backdrop-blur-xl">
                            <Settings size={18} /> Configurações
                        </button>
                    </div>
                </header>

                <div className="max-w-7xl pb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
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

