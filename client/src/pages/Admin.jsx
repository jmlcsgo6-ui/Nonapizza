import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingBag,
    Pizza,
    PieChart,
    LogOut,
    User,
    ChefHat,
    Settings,
    Store,
    Search,
    Bell,
    X,
} from 'lucide-react';
import OrdersPanel from './admin/OrdersPanel';
import ProductsManager from './admin/ProductsManager';
import FlavorsManager from './admin/FlavorsManager';
import DashboardOverview from './admin/DashboardOverview';
import AdminSettingsModal from '../components/admin/AdminSettingsModal';

const NAV = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Produtos', icon: Pizza },
    { id: 'flavors', label: 'Sabores', icon: PieChart },
];

const SEARCH_PLACEHOLDER = {
    orders: 'Buscar por nome, telefone, #id…',
    products: 'Buscar produtos…',
    flavors: 'Buscar sabores…',
};

export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState('orders');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [headerSearch, setHeaderSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [newOrderCount, setNewOrderCount] = useState(0);

    useEffect(() => { setHeaderSearch(''); }, [activeTab]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('admin_token', res.data.token);
            setToken(res.data.token);
        } catch {
            setLoginError('Credenciais inválidas ou acesso negado');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    const showSearch = ['orders', 'products', 'flavors'].includes(activeTab);

    // ----- LOGIN PAGE -----
    if (!token) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030308] p-6">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/10 blur-[120px]" />
                <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-600/8 blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative z-10 w-full max-w-sm"
                >
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 shadow-[0_0_40px_rgba(255,94,0,0.15)]">
                            <ChefHat size={32} className="text-orange-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Nona <span className="text-orange-400">Admin</span>
                        </h1>
                        <p className="mt-2 text-sm text-white/40">Acesso restrito ao painel da loja</p>
                    </div>

                    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-12 shadow-2xl backdrop-blur-xl">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <AnimatePresence>
                                {loginError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-center text-sm font-medium text-red-400"
                                    >
                                        {loginError}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Email</label>
                                <input
                                    type="email"
                                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-base text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/20"
                                    placeholder="admin@nonapizza.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Senha</label>
                                <input
                                    type="password"
                                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-base text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/20"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-base font-bold text-white shadow-xl shadow-orange-500/25 transition hover:bg-orange-400"
                            >
                                Entrar no Painel
                            </motion.button>
                        </form>
                    </div>
                    <a href="/" className="mt-6 block text-center text-xs text-white/25 transition hover:text-white/50">
                        ← Voltar ao site
                    </a>
                </motion.div>
            </div>
        );
    }

    // ----- MAIN DASHBOARD -----
    return (
        <div className="flex h-screen overflow-hidden bg-[#040408] font-sans text-white antialiased">

            {/* SIDEBAR */}
            <aside className="relative z-30 flex w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#07070f]">
                {/* Subtle sidebar glow */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />

                {/* Logo */}
                <div className="relative flex items-center gap-4 border-b border-white/[0.06] px-6 py-8">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/30">
                        <ChefHat size={22} className="text-white" />
                    </div>
                    <div className="min-w-0 leading-tight">
                        <p className="font-bold text-lg tracking-tight text-white">Nona Hub</p>
                        <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="relative flex-1 space-y-2 px-4 py-8">
                    <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">Menu Principal</p>
                    {NAV.map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                whileHover={{ x: active ? 0 : 5 }}
                                transition={{ duration: 0.2 }}
                                className={`relative flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                                    active
                                        ? 'bg-orange-500/15 text-orange-400 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.2)]'
                                        : 'text-white/40 hover:bg-white/[0.04] hover:text-white/80'
                                }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-orange-400"
                                    />
                                )}
                                <item.icon size={17} strokeWidth={active ? 2.5 : 1.75} className="shrink-0" />
                                {item.label}
                                {item.id === 'orders' && newOrderCount > 0 && (
                                    <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                                        {newOrderCount}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="relative border-t border-white/[0.06] px-3 py-4 space-y-0.5">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/35 transition hover:bg-white/[0.04] hover:text-white/70"
                    >
                        <Store size={17} strokeWidth={1.75} />
                        Ver loja
                    </a>
                    <button
                        type="button"
                        onClick={() => setSettingsOpen(true)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/35 transition hover:bg-white/[0.04] hover:text-white/70"
                    >
                        <Settings size={17} strokeWidth={1.75} />
                        Ajustes
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/35 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={17} strokeWidth={1.75} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* TOP HEADER */}
                <header className="relative z-20 shrink-0 border-b border-white/[0.06] bg-[#07070f]/80 px-10 py-6 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        {/* Title */}
                        <div className="min-w-0 shrink-0">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={activeTab}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-xl font-bold tracking-tight text-white"
                                >
                                    {NAV.find(n => n.id === activeTab)?.label}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        {/* Search */}
                        {showSearch && (
                            <div className="flex-1 max-w-lg mx-auto">
                                <div className="relative">
                                    <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                                    <input
                                        type="search"
                                        value={headerSearch}
                                        onChange={(e) => setHeaderSearch(e.target.value)}
                                        placeholder={SEARCH_PLACEHOLDER[activeTab] || 'Buscar…'}
                                        className="h-12 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 text-base text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/15"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-4">
                            {/* Notifications */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:border-white/15 hover:text-white"
                            >
                                <Bell size={18} />
                                <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                            </motion.button>

                            {/* Avatar */}
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                                <User size={18} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#040408] p-10 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]">
                    {/* Ambient background glow */}
                    <div className="pointer-events-none fixed inset-0 z-0">
                        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-600/5 blur-[120px]" />
                        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-600/4 blur-[120px]" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-[1600px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                {activeTab === 'dashboard' && <DashboardOverview token={token} onNavigate={setActiveTab} />}
                                {activeTab === 'orders' && <OrdersPanel token={token} search={headerSearch} />}
                                {activeTab === 'products' && <ProductsManager token={token} search={headerSearch} onSearchChange={setHeaderSearch} />}
                                {activeTab === 'flavors' && <FlavorsManager token={token} search={headerSearch} onSearchChange={setHeaderSearch} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <AdminSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
