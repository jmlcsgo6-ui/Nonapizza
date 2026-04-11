import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    MapPin,
    Tag,
    Save,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    CheckCircle2,
    AlertCircle,
    Percent,
    DollarSign,
    Truck,
    X,
} from 'lucide-react';

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl ${
                type === 'success'
                    ? 'border-emerald-500/30 bg-[#0c1a14] text-emerald-400'
                    : 'border-red-500/30 bg-[#1a0c0c] text-red-400'
            }`}
        >
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-semibold">{msg}</span>
            <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">
                <X size={14} />
            </button>
        </motion.div>
    );
}

// ── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, icon: Icon, accent = '#f97316', children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0c18]"
        >
            <div className="flex items-center gap-4 border-b border-white/[0.06] bg-white/[0.02] px-8 py-6">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: `${accent}15` }}
                >
                    <Icon size={18} style={{ color: accent }} />
                </div>
                <div>
                    <p className="text-base font-bold text-white">{title}</p>
                    {subtitle && <p className="text-xs text-white/35 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-8">{children}</div>
        </motion.div>
    );
}

// ── Input ─────────────────────────────────────────────────────────────────────
const inp =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/20';

const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const DEFAULT_HOURS = DAYS_PT.map((d, i) => ({
    day: d,
    open: i > 0 && i < 7,
    start: '18:00',
    end: '23:00',
}));

const DEFAULT_ZONES = [
    { id: 1, name: 'Centro', fee: 5.0 },
    { id: 2, name: 'Bairros próximos', fee: 8.0 },
    { id: 3, name: 'Bairros distantes', fee: 12.0 },
];

const DEFAULT_COUPONS = [
    { id: 1, code: 'PRIMEIRAO', type: 'percent', value: 15, active: true, minOrder: 40 },
    { id: 2, code: 'FRETE0', type: 'free_shipping', value: 0, active: true, minOrder: 60 },
];

export default function SettingsPanel() {
    const [toast, setToast] = useState(null);
    const [hours, setHours] = useState(DEFAULT_HOURS);
    const [zones, setZones] = useState(DEFAULT_ZONES);
    const [coupons, setCoupons] = useState(DEFAULT_COUPONS);

    // Coupon form state
    const [couponForm, setCouponForm] = useState({ code: '', type: 'percent', value: '', minOrder: '' });
    const [addCouponOpen, setAddCouponOpen] = useState(false);

    // Zone form state
    const [zoneForm, setZoneForm] = useState({ name: '', fee: '' });
    const [addZoneOpen, setAddZoneOpen] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleDay = (idx) => {
        setHours((prev) => prev.map((h, i) => i === idx ? { ...h, open: !h.open } : h));
    };

    const updateHour = (idx, field, value) => {
        setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
    };

    const saveHours = () => {
        showToast('Horários salvos com sucesso!');
    };

    const addZone = (e) => {
        e.preventDefault();
        if (!zoneForm.name || !zoneForm.fee) return;
        setZones((prev) => [...prev, { id: Date.now(), name: zoneForm.name, fee: parseFloat(zoneForm.fee) }]);
        setZoneForm({ name: '', fee: '' });
        setAddZoneOpen(false);
        showToast('Zona de entrega adicionada!');
    };

    const removeZone = (id) => {
        setZones((prev) => prev.filter((z) => z.id !== id));
        showToast('Zona removida.', 'error');
    };

    const addCoupon = (e) => {
        e.preventDefault();
        if (!couponForm.code) return;
        setCoupons((prev) => [
            ...prev,
            {
                id: Date.now(),
                code: couponForm.code.toUpperCase(),
                type: couponForm.type,
                value: parseFloat(couponForm.value) || 0,
                minOrder: parseFloat(couponForm.minOrder) || 0,
                active: true,
            },
        ]);
        setCouponForm({ code: '', type: 'percent', value: '', minOrder: '' });
        setAddCouponOpen(false);
        showToast('Cupom criado com sucesso!');
    };

    const toggleCoupon = (id) => {
        setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
    };

    const removeCoupon = (id) => {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        showToast('Cupom removido.', 'error');
    };

    const couponTypeLabel = (type) => {
        if (type === 'percent') return 'Desconto %';
        if (type === 'fixed') return 'Valor Fixo';
        return 'Frete Grátis';
    };

    const couponValueLabel = (c) => {
        if (c.type === 'percent') return `${c.value}% off`;
        if (c.type === 'fixed') return `R$ ${c.value.toFixed(2)} off`;
        return 'Frete grátis';
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* ── Horários ── */}
            <SectionCard title="Horário de Funcionamento" subtitle="Configure os dias e horários de atendimento" icon={Clock} accent="#f97316">
                <div className="space-y-3">
                    {hours.map((h, idx) => (
                        <div
                            key={h.day}
                            className={`flex flex-wrap items-center gap-4 rounded-2xl border px-5 py-4 transition ${
                                h.open ? 'border-white/[0.07] bg-white/[0.02]' : 'border-white/[0.04] opacity-50'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => toggleDay(idx)}
                                className="flex items-center gap-3 min-w-[130px]"
                            >
                                {h.open ? (
                                    <ToggleRight size={24} className="text-orange-400" />
                                ) : (
                                    <ToggleLeft size={24} className="text-white/20" />
                                )}
                                <span className={`text-sm font-semibold ${h.open ? 'text-white' : 'text-white/35'}`}>
                                    {h.day}
                                </span>
                            </button>

                            {h.open && (
                                <div className="flex items-center gap-3 ml-auto">
                                    <span className="text-xs text-white/30">Abertura</span>
                                    <input
                                        type="time"
                                        value={h.start}
                                        onChange={(e) => updateHour(idx, 'start', e.target.value)}
                                        className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 [color-scheme:dark]"
                                    />
                                    <span className="text-xs text-white/30">Fechamento</span>
                                    <input
                                        type="time"
                                        value={h.end}
                                        onChange={(e) => updateHour(idx, 'end', e.target.value)}
                                        className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 [color-scheme:dark]"
                                    />
                                </div>
                            )}

                            {!h.open && (
                                <span className="ml-auto text-xs text-white/25 font-medium">Fechado</span>
                            )}
                        </div>
                    ))}
                </div>
                <motion.button
                    type="button"
                    onClick={saveHours}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="mt-6 flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
                >
                    <Save size={16} />
                    Salvar Horários
                </motion.button>
            </SectionCard>

            {/* ── Zonas de Entrega ── */}
            <SectionCard title="Zonas de Entrega" subtitle="Áreas de cobertura e taxas de entrega" icon={MapPin} accent="#3b82f6">
                <div className="space-y-3">
                    {zones.map((z) => (
                        <div
                            key={z.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                                    <Truck size={16} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{z.name}</p>
                                    <p className="text-xs text-white/35">Taxa: R$ {z.fee.toFixed(2)}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeZone(z.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}

                    <AnimatePresence>
                        {addZoneOpen && (
                            <motion.form
                                onSubmit={addZone}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex gap-3 pt-2">
                                    <input
                                        className={`${inp} flex-1`}
                                        placeholder="Nome da zona (ex: Centro)"
                                        value={zoneForm.name}
                                        onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        className={`${inp} w-32`}
                                        type="number"
                                        step="0.50"
                                        placeholder="Taxa R$"
                                        value={zoneForm.fee}
                                        onChange={(e) => setZoneForm({ ...zoneForm, fee: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
                                    >
                                        Adicionar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddZoneOpen(false)}
                                        className="rounded-xl border border-white/[0.08] px-3 py-3 text-white/40 transition hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {!addZoneOpen && (
                        <button
                            type="button"
                            onClick={() => setAddZoneOpen(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.1] py-4 text-sm font-semibold text-white/35 transition hover:border-blue-500/40 hover:text-blue-400"
                        >
                            <Plus size={16} />
                            Nova zona de entrega
                        </button>
                    )}
                </div>
            </SectionCard>

            {/* ── Cupons ── */}
            <SectionCard title="Promoções & Cupons" subtitle="Gerencie descontos e códigos promocionais" icon={Tag} accent="#a78bfa">
                <div className="space-y-3">
                    {coupons.map((c) => (
                        <div
                            key={c.id}
                            className={`flex flex-wrap items-center gap-4 rounded-2xl border px-5 py-4 transition ${
                                c.active ? 'border-white/[0.07] bg-white/[0.02]' : 'border-white/[0.04] opacity-50'
                            }`}
                        >
                            {/* Code badge */}
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                                    {c.type === 'percent' ? (
                                        <Percent size={15} className="text-violet-400" />
                                    ) : c.type === 'fixed' ? (
                                        <DollarSign size={15} className="text-violet-400" />
                                    ) : (
                                        <Truck size={15} className="text-violet-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white font-mono tracking-wider">{c.code}</p>
                                    <p className="text-xs text-white/35">{couponTypeLabel(c.type)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 ml-2">
                                <span
                                    className="rounded-xl px-3 py-1.5 text-xs font-bold"
                                    style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}
                                >
                                    {couponValueLabel(c)}
                                </span>
                                {c.minOrder > 0 && (
                                    <span className="text-xs text-white/30">Mín. R$ {c.minOrder.toFixed(2)}</span>
                                )}
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                <span className={`text-xs font-bold ${c.active ? 'text-emerald-400' : 'text-white/25'}`}>
                                    {c.active ? 'Ativo' : 'Inativo'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => toggleCoupon(c.id)}
                                    className="transition"
                                >
                                    {c.active ? (
                                        <ToggleRight size={24} className="text-emerald-400" />
                                    ) : (
                                        <ToggleLeft size={24} className="text-white/20" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeCoupon(c.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <AnimatePresence>
                        {addCouponOpen && (
                            <motion.form
                                onSubmit={addCoupon}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/25 block mb-1.5">Código</label>
                                        <input
                                            className={inp}
                                            placeholder="Ex: PIZZA20"
                                            value={couponForm.code}
                                            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/25 block mb-1.5">Tipo</label>
                                        <select
                                            className={inp}
                                            value={couponForm.type}
                                            onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                                        >
                                            <option value="percent">Desconto %</option>
                                            <option value="fixed">Valor Fixo</option>
                                            <option value="free_shipping">Frete Grátis</option>
                                        </select>
                                    </div>
                                    {couponForm.type !== 'free_shipping' && (
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-white/25 block mb-1.5">
                                                {couponForm.type === 'percent' ? 'Percentual (%)' : 'Valor (R$)'}
                                            </label>
                                            <input
                                                className={inp}
                                                type="number"
                                                step="0.01"
                                                placeholder={couponForm.type === 'percent' ? '15' : '10.00'}
                                                value={couponForm.value}
                                                onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-white/25 block mb-1.5">Pedido Mínimo (R$)</label>
                                        <input
                                            className={inp}
                                            type="number"
                                            step="1"
                                            placeholder="0"
                                            value={couponForm.minOrder}
                                            onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 flex gap-3 pt-1">
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-xl bg-violet-500 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
                                        >
                                            Criar Cupom
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAddCouponOpen(false)}
                                            className="rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-semibold text-white/40 transition hover:text-white"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {!addCouponOpen && (
                        <button
                            type="button"
                            onClick={() => setAddCouponOpen(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.1] py-4 text-sm font-semibold text-white/35 transition hover:border-violet-500/40 hover:text-violet-400"
                        >
                            <Plus size={16} />
                            Criar novo cupom
                        </button>
                    )}
                </div>
            </SectionCard>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
