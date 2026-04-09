import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Keyboard, RefreshCw } from 'lucide-react';

export default function AdminSettingsModal({ open, onClose }) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[6000] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <button
                        type="button"
                        aria-label="Fechar"
                        className="absolute inset-0 bg-stone-900/45 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-settings-title"
                        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-stone-200 bg-[#f9f5f0] p-6 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 6 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 id="admin-settings-title" className="text-lg font-bold text-stone-900">
                                    Ajustes do painel
                                </h2>
                                <p className="mt-1 text-sm text-stone-500">Links e comportamento.</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl p-2 text-stone-400 transition hover:bg-stone-200/80 hover:text-stone-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <ul className="space-y-3 text-sm text-stone-600">
                            <li className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                                <ExternalLink className="mt-0.5 shrink-0 text-primary" size={18} />
                                <div>
                                    <p className="font-semibold text-stone-900">Loja pública</p>
                                    <a
                                        href="/"
                                        className="mt-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                    >
                                        Abrir site <span aria-hidden>→</span>
                                    </a>
                                </div>
                            </li>
                            <li className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                                <RefreshCw className="mt-0.5 shrink-0 text-stone-400" size={18} />
                                <div>
                                    <p className="font-semibold text-stone-900">Pedidos</p>
                                    <p className="mt-1 text-stone-500">
                                        Atualização automática a cada{' '}
                                        <strong className="text-stone-800">10 segundos</strong>.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                                <Keyboard className="mt-0.5 shrink-0 text-stone-400" size={18} />
                                <div>
                                    <p className="font-semibold text-stone-900">Busca</p>
                                    <p className="mt-1 text-stone-500">Use o campo no topo do painel.</p>
                                </div>
                            </li>
                        </ul>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 w-full rounded-xl border border-stone-300 bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                        >
                            Fechar
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
