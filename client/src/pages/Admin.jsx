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
    ChefHat,
    Settings,
    Store,
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

export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [settingsOpen, setSettingsOpen] = useState(false);

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
        <div className="flex min-h-screen bg-[#050505] font-sans text-white">
            <aside className="flex w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
                <div className="flex h-14 items-center gap-2 border-b border-white/[0.06] px-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-600 text-white shadow-md shadow-primary/25">
                        <ChefHat size={18} />
                    </div>
                    <div className="min-w-0 leading-tight">
                        <p className="truncate text-sm font-semibold tracking-tight">Nona Hub</p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">Admin</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-0.5 p-2">
                    {NAV.map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                                    active
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-white/50 hover:bg-white/[0.04] hover:text-white'
                                }`}
                            >
                                <item.icon size={18} strokeWidth={active ? 2.25 : 2} />
                                {item.short}
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-white/[0.06] p-3">
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-primary">
                            <User size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">Administrador</p>
                            <p className="flex items-center gap-1 text-[10px] text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Online
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.06] py-2.5 text-xs font-medium text-white/45 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut size={14} /> Sair
                    </button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#050505]/90 px-5 backdrop-blur-md">
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-white/35">
                            Painel · {currentNav.label}
                        </p>
                        <h1 className="truncate text-base font-semibold text-white">{currentNav.label}</h1>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                        >
                            <Store size={15} />
                            Ver loja
                        </a>
                        <button
                            type="button"
                            onClick={() => setSettingsOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                        >
                            <Settings size={15} />
                            Ajustes
                        </button>
                    </div>
                </header>

                <main className="custom-scrollbar flex-1 overflow-y-auto p-5 md:p-6">
                    <div className="mx-auto max-w-[1400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'dashboard' && (
                                    <DashboardOverview token={token} onNavigate={setActiveTab} />
                                )}
                                {activeTab === 'orders' && <OrdersPanel token={token} />}
                                {activeTab === 'products' && <ProductsManager token={token} />}
                                {activeTab === 'flavors' && <FlavorsManager token={token} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <AdminSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
