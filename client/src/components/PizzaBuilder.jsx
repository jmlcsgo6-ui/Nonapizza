import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/api';
import { useBuilder } from '../context/BuilderContext';
import { useCart } from '../context/CartContext';
import PizzaSVG from './PizzaSVG';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ChevronRight, Search, ShoppingBag, Plus, Minus } from 'lucide-react';

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
        
        const cartItem = {
            productId: `custom-${Date.now()}`,
            productName: `Pizza ${selectedSize.name} Personalizada`,
            qty: qty,
            price: calculateTotal / qty,
            price_original: calculateTotal / qty,
            obs: obs,
            segments: segments.map(s => s?.name || 'Sabor não escolhido')
        };
        
        addToCart(cartItem);
        resetBuilder();
        setIsBuilderOpen(false);
        setTimeout(() => setIsCartOpen(true), 300);
    };

    if (!isBuilderOpen) return null;

    const filteredOptions = (drawerTarget === 'crust' ? crusts : flavors).filter(f => 
        search ? f.name.toLowerCase().includes(search.toLowerCase()) : true
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 pointer-events-none">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-2xl pointer-events-auto"
                onClick={() => setIsBuilderOpen(false)}
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full h-full max-w-7xl bg-[#080808] border border-white/5 md:rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative z-10 pointer-events-auto"
            >
                <div className="flex items-center justify-between px-10 h-24 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Montagem <span className="text-primary italic">da Pizza</span></h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Sua alquimia, seu sabor</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsBuilderOpen(false)}
                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="max-w-4xl mx-auto space-y-16"
                            >
                                <div className="text-center">
                                    <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Tamanho e <span className="text-primary italic">Massa</span></h2>
                                    <p className="text-sm font-medium text-white/40">Defina o tamanho e a composição ideal para sua fome</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {sizes.map(s => (
                                        <button 
                                            key={s.id}
                                            onClick={() => setSelectedSize(s)}
                                            className={`group relative p-8 rounded-[32px] border-2 text-left transition-all ${selectedSize?.id === s.id ? 'bg-primary border-primary shadow-[0_20px_40px_rgba(255,95,0,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className={`text-sm font-black italic mb-2 tracking-tight ${selectedSize?.id === s.id ? 'text-white' : 'text-primary'}`}>
                                                {s.name === 'Pequena' ? 'BROTINHO' : s.name === 'Média' ? 'STANDARD' : 'MASTER'}
                                            </div>
                                            <h4 className={`text-3xl font-black uppercase mb-4 tracking-tighter italic ${selectedSize?.id === s.id ? 'text-white' : 'text-white'}`}>{s.name}</h4>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest mb-8 ${selectedSize?.id === s.id ? 'text-white/60' : 'text-white/20'}`}>
                                                {s.name === 'Pequena' ? '04 Fatias • 25cm' : s.name === 'Média' ? '06 Fatias • 30cm' : s.name === 'Grande' ? '08 Fatias • 35cm' : `${s.maxSlices} Fatias`}
                                            </div>
                                            <div className={`text-xl font-black tracking-tight ${selectedSize?.id === s.id ? 'text-white' : 'text-white'}`}>
                                                R$ {s.price.toFixed(2)}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-12 text-center">
                                    <h4 className="text-xs font-bold text-white/30 uppercase tracking-[0.4em] mb-10">Divisão de Sabores</h4>
                                    <div className="flex items-center justify-center gap-12">
                                        <button 
                                            onClick={() => setFlavorsCount(Math.max(1, flavorsCount - 1))}
                                            className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                                        >
                                            <Minus size={24} />
                                        </button>
                                        <div className="flex flex-col items-center">
                                            <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{flavorsCount}</span>
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-4 italic">Sabores Ativos</span>
                                        </div>
                                        <button 
                                            onClick={() => setFlavorsCount(Math.min(selectedSize?.maxSlices || 3, flavorsCount + 1))}
                                            className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] mt-10 italic">Limite para este tamanho: {selectedSize?.maxSlices || 3}</p>
                                </div>

                                <button 
                                    className="w-full h-24 bg-primary rounded-[32px] text-white text-lg font-black italic tracking-widest uppercase hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 disabled:opacity-20 flex items-center justify-center gap-4"
                                    disabled={!selectedSize}
                                    onClick={() => setStep(2)}
                                >
                                    Avançar para Sabores <ChevronRight size={24} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col lg:flex-row gap-12"
                            >
                                <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-[40px] flex flex-col items-center justify-center p-12 relative min-h-[500px] overflow-hidden">
                                    <div className="absolute top-8 left-8 flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Visualização em Tempo Real</span>
                                    </div>
                                    
                                    <div className="relative scale-110 md:scale-125">
                                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 opacity-20"></div>
                                        <div className="relative z-10 w-[300px] md:w-[400px]">
                                            <PizzaSVG count={flavorsCount} segments={segments} onSliceClick={(idx) => { setDrawerTarget(idx); setDrawerOpen(true); }} />
                                        </div>
                                    </div>

                                    <div className="mt-16 text-center space-y-2">
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Toque em uma fatia para escolher o sabor</p>
                                        <div className="w-20 h-1 bg-white/5 mx-auto rounded-full"></div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-[450px] space-y-6">
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="inline-flex items-center gap-2 text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors mb-4"
                                    >
                                        <ArrowLeft size={14} /> Voltar ao Tamanho
                                    </button>

                                    <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
                                        <button 
                                            onClick={() => { setDrawerTarget('crust'); setDrawerOpen(true); }}
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex justify-between items-center group hover:border-primary/50 transition-all"
                                        >
                                            <div className="text-left">
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] block mb-1">Sabores e Bordas</span>
                                                <span className="text-base font-black text-white italic tracking-tight uppercase group-hover:text-primary transition-colors">{selectedCrust?.name || 'Selecione a Borda'}</span>
                                            </div>
                                            <ChevronRight size={20} className="text-white/10 group-hover:translate-x-1 transition-all" />
                                        </button>

                                        <div className="space-y-3">
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] block ml-1">Fatias e Sabores</span>
                                            <div className="space-y-2">
                                                {segments.map((seg, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => { setDrawerTarget(i); setDrawerOpen(true); }}
                                                        className="w-full p-5 flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary font-black text-xs">0{i+1}</div>
                                                            <span className={`text-sm font-bold uppercase tracking-tight ${seg ? 'text-white' : 'text-red-500/40 italic'}`}>
                                                                {seg?.name || 'Aguardando Sabor...'}
                                                            </span>
                                                        </div>
                                                        {seg && <span className="text-xs font-black text-primary/50">+R$ {seg.price.toFixed(2)}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] block ml-1">Observações do Chef</span>
                                            <textarea 
                                                value={obs}
                                                onChange={e => setObs(e.target.value)}
                                                placeholder="Ex: sem cebola, bem passada..."
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-sm text-white outline-none focus:border-primary transition-all h-24 resize-none placeholder:text-white/5"
                                            />
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            <div className="flex justify-between items-end mb-8">
                                                <div>
                                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Total Previsto</span>
                                                    <div className="text-4xl font-black text-white italic tracking-tighter">R$ {calculateTotal.toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <button 
                                                disabled={!isComplete}
                                                onClick={handleAddToCart}
                                                className="w-full h-20 bg-primary rounded-2xl text-white font-black italic tracking-widest uppercase hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-10 transition-all flex items-center justify-center gap-3"
                                            >
                                                Adicionar ao Carrinho <ShoppingBag size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] pointer-events-auto"
                            onClick={() => setDrawerOpen(false)}
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0c0c0c] border-l border-white/5 z-[210] flex flex-col pointer-events-auto"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Catálogo de <span className="text-primary italic">Sabores</span></h3>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">
                                        {drawerTarget === 'crust' ? 'Escolha sua Borda' : `Sabor para a Fatia 0${drawerTarget + 1}`}
                                    </p>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><X size={20}/></button>
                            </div>

                            <div className="p-8">
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar sabor..." 
                                        value={search} 
                                        onChange={e => setSearch(e.target.value)} 
                                        className="w-full bg-white/[0.02] border border-white/5 py-5 pl-14 pr-6 rounded-2xl text-sm text-white outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8">
                                <div className="space-y-2">
                                    {filteredOptions.map(item => (
                                        <button 
                                            key={item.id}
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
                                            className="w-full p-6 text-left bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 rounded-[24px] transition-all group flex justify-between items-center"
                                        >
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{item.name}</h4>
                                                <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-1 block">
                                                    {item.price > 0 ? `+ R$ ${item.price.toFixed(2)}` : 'Sabor padrão'}
                                                </span>
                                            </div>
                                            <ChevronRight size={18} className="text-white/5 group-hover:text-primary transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
