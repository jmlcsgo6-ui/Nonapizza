import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import OrdersPanel from './admin/OrdersPanel';
import ProductsManager from './admin/ProductsManager';
import FlavorsManager from './admin/FlavorsManager';
import DashboardOverview from './admin/DashboardOverview';
import AdminSettingsModal from '../components/admin/AdminSettingsModal';

const NAV = [
    { id: 'dashboard', label: 'Visão geral', short: 'Início', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', short: 'Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Produtos', short: 'Produtos', icon: Pizza },
    { id: 'flavors', label: 'Sabores', short: 'Sabores', icon: PieChart },
];

const SEARCH_PLACEHOLDER = {
    orders: 'Buscar pedidos por nome, telefone ou #…',
    products: 'Buscar itens do cardápio…',
    flavors: 'Buscar sabores cadastrados…',
};

export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [headerSearch, setHeaderSearch] = useState('');

    useEffect(() => {
        setHeaderSearch('');
    }, [activeTab]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('admin_token', res.data.token);
            setToken(res.data.token);
        } catch (err) {
            setError('Credenciais inválidas ou acesso negado');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    const currentNav = NAV.find((i) => i.id === activeTab) || NAV[0];
    const showHeaderSearch = ['orders', 'products', 'flavors'].includes(activeTab);

    if (!token) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] p-6">
                <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                            <ChefHat size={36} />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight text-white">
                            Nona <span className="text-primary">Admin</span>
                        </h2>
                        <p className="mt-2 text-sm text-white/45">Acesso ao painel da loja</p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-8 shadow-xl">
                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-xs font-medium text-red-400">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-medium uppercase tracking-wide text-white/45">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-medium uppercase tracking-wide text-white/45">
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
                            >
                                Entrar
                            </button>
                        </form>
                    </div>

                    <a
                        href="/"
                        className="mt-8 block text-center text-sm text-white/35 transition hover:text-white/60"
                    >
                        Voltar ao site
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#e8e4dd] font-sans text-stone-800 antialiased">
            <aside className="flex w-[232px] shrink-0 flex-col bg-[#1a1a1a] text-white">
                <div className="flex items-center gap-3 px-5 py-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                        <ChefHat size={22} />
                    </div>
                    <div className="min-w-0 leading-tight">
                        <p className="font-semibold tracking-tight text-white">Nona Hub</p>
                        <p className="text-xs text-white/45">Admin</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3 pb-4">
                    {NAV.map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                                    active
                                        ? 'bg-white/12 text-white shadow-inner'
                                        : 'text-white/50 hover:bg-white/[0.06] hover:text-white/90'
                                }`}
                            >
                                <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} className="opacity-90" />
                                {item.short}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-white/10 px-4 py-4">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white/45 transition hover:bg-white/[0.06] hover:text-white"
                    >
                        <LogOut size={18} strokeWidth={1.75} />
                        Sair
                    </button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="shrink-0 border-b border-stone-200/80 bg-[#f9f5f0] px-4 py-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:px-6">
                    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                        <div className="min-w-0 shrink-0 lg:max-w-[240px]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                Painel · {currentNav.label}
                            </p>
                            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-stone-900">
                                {currentNav.label}
                            </h1>
                        </div>

                        {showHeaderSearch && (
                            <div className="w-full flex-1 lg:max-w-xl lg:mx-auto">
                                <div className="relative">
                                    <Search
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                        size={18}
                                        strokeWidth={2}
                                    />
                                    <input
                                        type="search"
                                        value={headerSearch}
                                        onChange={(e) => setHeaderSearch(e.target.value)}
                                        placeholder={SEARCH_PLACEHOLDER[activeTab] || 'Buscar…'}
                                        className="h-11 w-full rounded-xl border border-stone-200/90 bg-white pl-11 pr-4 text-sm text-stone-800 shadow-sm outline-none ring-primary/20 placeholder:text-stone-400 focus:border-primary focus:ring-2"
                                    />
                                </div>
                            </div>
                        )}

                        {!showHeaderSearch && <div className="hidden flex-1 lg:block" />}

                        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 sm:inline-flex"
                            >
                                <Store size={16} />
                                Ver loja
                            </a>
                            <button
                                type="button"
                                onClick={() => setSettingsOpen(true)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800"
                                aria-label="Ajustes"
                            >
                                <Settings size={18} />
                            </button>
                            <button
                                type="button"
                                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover"
                                aria-label="Notificações"
                            >
                                <Bell size={18} />
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-primary bg-red-500" />
                            </button>
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-stone-200 shadow-sm"
                                title="Administrador"
                            >
                                <User size={18} className="text-stone-600" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="custom-scrollbar flex-1 overflow-y-auto bg-[#e8e4dd] p-4 sm:p-6">
                    <div className="mx-auto max-w-[1400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="font-['DM_Sans',system-ui,sans-serif]"
                            >
                                {activeTab === 'dashboard' && (
                                    <DashboardOverview token={token} onNavigate={setActiveTab} />
                                )}
                                {activeTab === 'orders' && (
                                    <OrdersPanel token={token} search={headerSearch} />
                                )}
                                {activeTab === 'products' && (
                                    <ProductsManager
                                        token={token}
                                        search={headerSearch}
                                        onSearchChange={setHeaderSearch}
                                    />
                                )}
                                {activeTab === 'flavors' && (
                                    <FlavorsManager
                                        token={token}
                                        search={headerSearch}
                                        onSearchChange={setHeaderSearch}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <AdminSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
