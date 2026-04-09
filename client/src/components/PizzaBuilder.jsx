import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, ShoppingBag, Flame, Info, CheckCircle2 } from 'lucide-react';
import api from '../api/api';
import { useBuilder } from '../context/BuilderContext';
import { useCart } from '../context/CartContext';
import PizzaSVG from './PizzaSVG';

const STEPS = [
    { id: 1, label: 'TAMANHO', icon: 'pizza-slice' },
    { id: 2, label: 'SABORES', icon: 'utensils' },
    { id: 3, label: 'REVISÃO', icon: 'clipboard-check' }
];

export default function PizzaBuilder() {
    const { 
        isBuilderOpen, setIsBuilderOpen, step, setStep,
        selectedSize, setSelectedSize, flavorsCount, setFlavorsCount,
        segments, setSegments, selectedCrust, setSelectedCrust,
        obs, setObs, resetBuilder
    } = useBuilder();
    const { addToCart, setIsCartOpen } = useCart();

    const [sizes, setSizes] = useState([]);
    const [crusts, setCrusts] = useState([]);
    const [flavors, setFlavors] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerTarget, setDrawerTarget] = useState(null);
    const [search, setSearch] = useState('');
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [szRes, cruRes, flavRes] = await Promise.all([
                    api.get('/api/sizes'),
                    api.get('/api/crusts'),
                    api.get('/api/ingredients')
                ]);
                setSizes(szRes.data);
                setCrusts(cruRes.data);
                setFlavors(flavRes.data);
                if (cruRes.data.length > 0) setSelectedCrust(cruRes.data[0]);
            } catch(e) { console.error("Error loading builder data:", e); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!segments || segments.length !== flavorsCount) {
             setSegments(Array(flavorsCount).fill(null));
        }
    }, [flavorsCount]);

    const calculateTotal = useMemo(() => {
        if (!selectedSize) return 0;
        let flavorTotal = 0;
        let totalCounted = 0;
        segments.forEach(f => { if(f) { flavorTotal += f.price; totalCounted++; } });
        const averageFlavor = totalCounted > 0 ? (flavorTotal / totalCounted) : 0;
        const crustPrice = selectedCrust ? selectedCrust.price : 0;
        return (selectedSize.price + averageFlavor + crustPrice) * qty;
    }, [selectedSize, segments, selectedCrust, qty]);

    const isComplete = selectedSize && segments.every(s => s !== null);

    const handleAddToCart = () => {
        if (!isComplete) return;
        addToCart({
            productId: `custom-${Date.now()}`,
            productName: `Pizza ${selectedSize.name} Personalizada`,
            qty: qty,
            price: calculateTotal() / qty,
            obs: obs,
            segments: segments.map(s => s.name)
        });
        resetBuilder();
        setIsBuilderOpen(false);
        setTimeout(() => setIsCartOpen(true), 300);
    };

    if (!isBuilderOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[4000] bg-deep/95 backdrop-blur-xl flex flex-col"
        >
            {/* Header: Progress Experience */}
            <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-deep/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsBuilderOpen(false)} className="text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                    <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                    <h3 className="text-xl font-black tracking-tighter hidden md:block">THE CHEF <span className="text-primary">EXPERIENCE</span></h3>
                </div>

                <div className="flex items-center gap-2 md:gap-8">
                    {STEPS.map(s => (
                        <div key={s.id} className={`flex items-center gap-2 transition-all ${step >= s.id ? 'opacity-100' : 'opacity-20'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/10 text-white'}`}>
                                {s.id}
                            </div>
                            <span className="text-[10px] font-black tracking-widest hidden lg:block uppercase">{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase font-black">Investimento</p>
                    <p className="text-xl font-black text-primary">R$ {calculateTotal().toFixed(2)}</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
                
                {/* Visualizer: Sticky left on Desktop */}
                <div className="flex-1 bg-gradient-to-b from-white/[0.02] to-transparent p-6 flex items-center justify-center overflow-hidden">
                    <motion.div 
                        initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        className="relative w-full max-w-[500px] aspect-square flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full"></div>
                        <div className="pizza-svg-wrapper w-full h-full relative z-10">
                            <PizzaSVG count={flavorsCount} segments={segments} onSliceClick={(idx) => { setDrawerTarget(idx); setDrawerOpen(true); }} />
                        </div>
                        
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <Info size={14} className="text-primary" />
                            <span className="text-xs font-bold text-white/60 italic">Toque nas fatias para escolher os sabores</span>
                        </div>
                    </motion.div>
                </div>

                {/* Controls: Scrollable right on Desktop */}
                <div className="w-full md:w-[450px] bg-[#0c0c0c] border-l border-white/5 overflow-y-auto custom-scrollbar p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-black mb-2 uppercase">Escolha a base</h2>
                                    <p className="text-white/40 text-sm font-medium">O tamanho define a jornada do seu paladar hoje.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {sizes.map(s => (
                                        <div 
                                            key={s.id} 
                                            onClick={() => setSelectedSize(s)}
                                            className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedSize?.id === s.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-xl transition-all ${selectedSize?.id === s.id ? 'bg-primary text-white' : 'bg-white/5 text-white/40'}`}>
                                                        <Flame size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg">{s.name}</h4>
                                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{s.maxSlices} Fatias</span>
                                                    </div>
                                                </div>
                                                {selectedSize?.id === s.id && <CheckCircle2 className="text-primary" size={24} />}
                                            </div>
                                            <p className="text-sm font-black text-primary">A partir de R$ {s.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 text-center">Quantos sabores você imagina?</h4>
                                    <div className="flex items-center justify-center gap-6">
                                        <button className="w-12 h-12 rounded-full border border-white/10 hover:border-primary transition-colors flex items-center justify-center font-black text-xl" onClick={() => setFlavorsCount(Math.max(1, flavorsCount - 1))}>-</button>
                                        <span className="text-4xl font-black">{flavorsCount}</span>
                                        <button className="w-12 h-12 rounded-full border border-white/10 hover:border-primary transition-colors flex items-center justify-center font-black text-xl" onClick={() => setFlavorsCount(Math.min(selectedSize?.maxSlices || 3, flavorsCount + 1))}>+</button>
                                    </div>
                                </div>

                                <button 
                                    className="btn-premium w-full py-5 rounded-2xl disabled:opacity-30 flex items-center justify-center gap-4"
                                    disabled={!selectedSize}
                                    onClick={() => setStep(2)}
                                >
                                    PRÓXIMA ETAPA <ChevronRight size={20} strokeWidth={3} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                className="space-y-8"
                            >
                                <button className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/30 hover:text-white transition-colors" onClick={() => setStep(1)}>
                                    <ChevronLeft size={14} /> VOLTAR AO TAMANHO
                                </button>

                                <div>
                                    <h2 className="text-3xl font-black mb-2 uppercase">Sabores</h2>
                                    <p className="text-white/40 text-sm font-medium">Toque nas fatias da pizza na esquerda para escolher cada sabor.</p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Sua Seleção</h4>
                                    {segments.map((seg, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => { setDrawerTarget(i); setDrawerOpen(true); }}
                                            className={`p-4 rounded-xl border border-dashed flex justify-between items-center cursor-pointer transition-all ${seg ? 'border-primary/30 bg-primary/5' : 'border-white/10 hover:border-white/30'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                                <span className={`text-sm font-bold ${seg ? 'text-white' : 'text-white/20'}`}>{seg?.name || 'Vazio...'}</span>
                                            </div>
                                            <ChevronRight size={14} className="text-white/20" />
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    className="btn-premium w-full py-5 rounded-2xl disabled:opacity-30" 
                                    disabled={!isComplete} 
                                    onClick={() => setStep(3)}
                                >
                                    CONFERIR FINALIZAÇÃO <ChevronRight size={20} strokeWidth={3} />
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                className="space-y-8"
                            >
                                <button className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/30 hover:text-white transition-colors" onClick={() => setStep(2)}>
                                    <ChevronLeft size={14} /> VOLTAR AOS SABORES
                                </button>

                                <div>
                                    <h2 className="text-3xl font-black mb-2 uppercase">REVISÃO</h2>
                                    <p className="text-white/40 text-sm font-medium">Quase lá, ajuste as observações finais do seu pedido.</p>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                                    <div className="flex justify-between items-center text-xs font-bold text-white/40 tracking-widest uppercase">
                                        <span>Configuração</span>
                                        <span>Preço</span>
                                    </div>
                                    <div className="flex justify-between font-black text-sm uppercase">
                                        <span>Pizza {selectedSize?.name}</span>
                                        <span>R$ {selectedSize?.price.toFixed(2)}</span>
                                    </div>
                                    {segments.map((s, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-white/60">
                                            <span>• {s?.name}</span>
                                            <span>+ R$ {s?.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                        <span className="text-xs font-black uppercase text-white/40">TOTAL</span>
                                        <span className="text-2xl font-black text-primary">R$ {calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Alguma Observação?</h4>
                                    <textarea 
                                        value={obs} 
                                        onChange={e => setObs(e.target.value)} 
                                        placeholder="Ex: Tirar cebola, massa bem crocante..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none min-h-[100px] transition-all"
                                    ></textarea>
                                </div>

                                <button 
                                    className="btn-premium w-full py-5 rounded-2xl flex items-center justify-center gap-3"
                                    onClick={handleAddToCart}
                                >
                                    ADICIONAR AO PEDIDO <ShoppingBag size={20} strokeWidth={3} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* OPTIONS DRAWER: Polymorphic Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 bg-deep/60 backdrop-blur-sm z-[4100]"
                        ></motion.div>
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-card border-l border-white/10 z-[4200] flex flex-col p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                                    Escolha o <span className="text-primary">{drawerTarget === 'crust' ? 'Borda' : 'Sabor'}</span>
                                </h3>
                                <button onClick={() => setDrawerOpen(false)} className="bg-white/5 p-2 rounded-full hover:bg-primary transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="relative mb-8">
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none pl-12"
                                    placeholder="Buscar sabor único..."
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                />
                                <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {(drawerTarget === 'crust' ? crusts : flavors)
                                    .filter(f => search ? f.name.toLowerCase().includes(search.toLowerCase()) : true)
                                    .map(item => (
                                    <motion.div 
                                        key={item.id} 
                                        whileHover={{ x: 10 }}
                                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/5 cursor-pointer flex justify-between items-center group"
                                        onClick={() => {
                                            if (drawerTarget === 'crust') setSelectedCrust(item);
                                            else {
                                                const newSegments = [...segments];
                                                newSegments[drawerTarget] = item;
                                                setSegments(newSegments);
                                            }
                                            setDrawerOpen(false);
                                            setSearch('');
                                        }}
                                    >
                                        <div>
                                            <h5 className="font-black text-sm uppercase group-hover:text-primary transition-colors">{item.name}</h5>
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic">{item.price > 0 ? `+ R$ ${item.price.toFixed(2)}` : 'Sabor Base'}</span>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-lg group-hover:bg-primary transition-colors">
                                            <ChevronRight size={14} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
