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
    Users,
    Menu,
} from 'lucide-react';
import OrdersPanel from './admin/OrdersPanel';
import ProductsManager from './admin/ProductsManager';
import FlavorsManager from './admin/FlavorsManager';
import DashboardOverview from './admin/DashboardOverview';
import CustomersPanel from './admin/CustomersPanel';
import SettingsPanel from './admin/SettingsPanel';

const NAV = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Produtos', icon: Pizza },
    { id: 'flavors', label: 'Sabores', icon: PieChart },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
];

const SEARCH_PLACEHOLDER = {
    orders: 'Buscar por nome, telefone, #id…',
    products: 'Buscar produtos…',
    flavors: 'Buscar sabores…',
    customers: 'Buscar clientes…',
};

export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [headerSearch, setHeaderSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [newOrderCount, setNewOrderCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);

    useEffect(() => { setHeaderSearch(''); }, [activeTab]);

    // Close sidebar on tab change (mobile)
    const handleNav = (id) => {
        setActiveTab(id);
        setSidebarOpen(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');
        try {
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('admin_token', res.data.token);
            setToken(res.data.token);
        } catch {
            setLoginError('Credenciais inválidas ou acesso negado');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    const showSearch = ['orders', 'products', 'flavors', 'customers'].includes(activeTab);

    // ----- LOGIN PAGE -----
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#040408] p-4">
                {/* Background ambient */}
                <div className="pointer-events-none fixed inset-0">
                    <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-orange-600/8 blur-[120px]" />
                    <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-[100px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative w-full max-w-[420px]"
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex mb-4 p-4 rounded-3xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.15)]">
                            <ChefHat size={32} className="text-orange-400" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Nona Hub</h1>
                        <p className="text-sm text-white/30 mt-1">Acesso restrito ao painel administrativo</p>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c18] p-8 shadow-2xl">
                        <form onSubmit={handleLogin}>
                            <AnimatePresence>
                                {loginError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-5 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400"
                                    >
                                        {loginError}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 block">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/20"
                                        placeholder="admin@nonapizza.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 block">
                                        Senha
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/20"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                disabled={loginLoading}
                                className="mt-6 w-full rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 disabled:opacity-50"
                            >
                                {loginLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Entrando...
                                    </span>
                                ) : (
                                    'Entrar no Painel'
                                )}
                            </motion.button>
                        </form>
                    </div>

                    <div className="text-center mt-6">
                        <a href="/" className="text-sm font-semibold text-white/30 transition hover:text-white/60">
                            ← Voltar ao site
                        </a>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ----- MAIN DASHBOARD -----
    return (
        <div className="flex h-screen overflow-hidden bg-[#040408] font-sans text-white antialiased">

            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col border-r border-white/[0.06] bg-[#07070f]
                transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                lg:relative lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Subtle sidebar glow */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />

                {/* Logo */}
                <div className="relative flex items-center gap-4 border-b border-white/[0.06] px-6 py-7">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/30">
                        <ChefHat size={22} className="text-white" />
                    </div>
                    <div className="min-w-0 leading-tight">
                        <p className="font-bold text-lg tracking-tight text-white">Nona Hub</p>
                        <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest">Admin Panel</p>
                    </div>
                    {/* Mobile close button */}
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition hover:text-white lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="relative flex-1 space-y-1.5 px-4 py-6 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.06)_transparent]">
                    <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">Menu Principal</p>
                    {NAV.map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                type="button"
                                onClick={() => handleNav(item.id)}
                                whileHover={{ x: active ? 0 : 4 }}
                                transition={{ duration: 0.2 }}
                                className={`relative flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all ${
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
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white animate-pulse">
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
                <header className="relative z-20 shrink-0 border-b border-white/[0.06] bg-[#07070f]/80 px-4 py-4 sm:px-8 sm:py-5 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:text-white lg:hidden"
                        >
                            <Menu size={18} />
                        </button>

                        {/* Title */}
                        <div className="min-w-0 shrink-0">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={activeTab}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-lg font-bold tracking-tight text-white sm:text-xl"
                                >
                                    {NAV.find(n => n.id === activeTab)?.label}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        {/* Search */}
                        {showSearch && (
                            <div className="hidden flex-1 max-w-lg mx-auto sm:block">
                                <div className="relative">
                                    <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                                    <input
                                        type="search"
                                        value={headerSearch}
                                        onChange={(e) => setHeaderSearch(e.target.value)}
                                        placeholder={SEARCH_PLACEHOLDER[activeTab] || 'Buscar…'}
                                        className="h-11 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/15"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-3">
                            {/* Notifications */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:border-white/15 hover:text-white"
                                >
                                    <Bell size={17} />
                                    <span className="absolute right-2.5 top-2.5 h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                                </motion.button>

                                {/* Notification dropdown */}
                                <AnimatePresence>
                                    {notifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-[320px] rounded-2xl border border-white/[0.08] bg-[#0c0c18] p-2 shadow-2xl"
                                        >
                                            <div className="px-4 py-3 border-b border-white/[0.06]">
                                                <p className="text-sm font-bold text-white">Notificações</p>
                                            </div>
                                            <div className="py-3 px-4 text-center">
                                                <p className="text-xs text-white/30">Nenhuma notificação no momento</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setNotifOpen(false)}
                                                className="w-full text-center py-2 text-xs font-semibold text-orange-400 hover:underline"
                                            >
                                                Fechar
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Avatar */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                                <User size={17} />
                            </div>
                        </div>
                    </div>

                    {/* Mobile search (below header) */}
                    {showSearch && (
                        <div className="mt-3 sm:hidden">
                            <div className="relative">
                                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                                <input
                                    type="search"
                                    value={headerSearch}
                                    onChange={(e) => setHeaderSearch(e.target.value)}
                                    placeholder={SEARCH_PLACEHOLDER[activeTab] || 'Buscar…'}
                                    className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/40 focus:bg-white/[0.06]"
                                />
                            </div>
                        </div>
                    )}
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#040408] p-4 sm:p-8 lg:p-10 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]">
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
                                {activeTab === 'customers' && <CustomersPanel token={token} search={headerSearch} />}
                                {activeTab === 'settings' && <SettingsPanel />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
