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
                        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-settings-title"
                        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#111] p-6 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 6 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 id="admin-settings-title" className="text-lg font-semibold text-white">
                                    Ajustes do painel
                                </h2>
                                <p className="mt-1 text-sm text-white/45">Links e comportamento da área admin.</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <ExternalLink className="mt-0.5 shrink-0 text-primary" size={18} />
                                <div>
                                    <p className="font-medium text-white">Loja pública</p>
                                    <a
                                        href="/"
                                        className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
                                    >
                                        Abrir site <span aria-hidden>→</span>
                                    </a>
                                </div>
                            </li>
                            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <RefreshCw className="mt-0.5 shrink-0 text-white/40" size={18} />
                                <div>
                                    <p className="font-medium text-white">Pedidos em tempo real</p>
                                    <p className="mt-1 text-white/50">
                                        Atualização automática a cada{' '}
                                        <strong className="text-white/80">10 segundos</strong>.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <Keyboard className="mt-0.5 shrink-0 text-white/40" size={18} />
                                <div>
                                    <p className="font-medium text-white">Busca na fila</p>
                                    <p className="mt-1 text-white/50">
                                        Filtre pedidos por nome, telefone ou número (#).
                                    </p>
                                </div>
                            </li>
                        </ul>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 w-full rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-white transition hover:bg-white/[0.1]"
                        >
                            Fechar
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
