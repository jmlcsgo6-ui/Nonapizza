import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/api';
import { useBuilder } from '../context/BuilderContext';
import { useCart } from '../context/CartContext';
import PizzaSVG from './PizzaSVG';

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
    const [drawerTarget, setDrawerTarget] = useState(null); // 'crust' ou indice do segmento
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
        console.log("Handle Add To Cart", { step, isComplete, selectedSize });
        if (!isComplete) return;
        
        const cartItem = {
            productId: `custom-${Date.now()}`,
            productName: `Pizza ${selectedSize.name} Personalizada`,
            qty: qty,
            price: calculateTotal / qty,
            obs: obs,
            segments: segments.map(s => s?.name || 'Sabor não escolhido')
        };
        
        console.log("Adding to cart:", cartItem);
        addToCart(cartItem);
        
        resetBuilder();
        setIsBuilderOpen(false);
        setTimeout(() => setIsCartOpen(true), 300);
    };

    const handleNextStep = () => {
        console.log("ACTIVATE_PHASE_2: TRACE_SEQUENCE_START");
        setStep(2);
    };

    if (!isBuilderOpen) return null;

    const filteredOptions = (drawerTarget === 'crust' ? crusts : flavors).filter(f => 
        search ? f.name.toLowerCase().includes(search.toLowerCase()) : true
    );

    return (
        <>
            <div id="pizza-builder-overlay" className="builder-overlay active font-mono">
                <div className="builder-header bg-black border-b border-white/10 px-8 flex justify-between items-center h-[80px]">
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-6 bg-primary"></div>
                        <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white italic">ALQUIMIA_BUILDER_v2.0</h3>
                    </div>
                    <button id="close-builder" onClick={() => setIsBuilderOpen(false)} className="text-white/40 hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="builder-body bg-black relative">
                    {/* STEP 1 */}
                    <div id="builder-step-1" className={`builder-step ${step === 1 ? 'active' : 'slide-left'} w-full max-w-5xl mx-auto`}>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-4">INITIAL_CALIBRATION</h2>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">DEFINA A ESCALA E A COMPLEXIDADE DA OBRA</p>
                        </div>

                        <div className="w-full space-y-12">
                            <div className="builder-section">
                                <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-6 border-l-2 border-primary pl-4">SELECT_MASS_INDEX</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {sizes.map(s => (
                                        <div 
                                            key={s.id} 
                                            className={`bg-black border p-8 cursor-pointer transition-all relative group overflow-hidden ${selectedSize?.id === s.id ? 'border-primary' : 'border-white/10 hover:border-white/30'}`}
                                            onClick={() => setSelectedSize(s)}
                                        >
                                            {selectedSize?.id === s.id && <div className="absolute top-0 right-0 w-8 h-8 bg-primary text-black flex items-center justify-center font-black text-[10px] italic">SEL</div>}
                                            <h5 className="text-lg font-black italic text-white uppercase">{s.name}</h5>
                                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-2 mb-4">
                                                {s.name === 'Pequena' ? '04_UN | 25CM' : s.name === 'Média' ? '06_UN | 30CM' : s.name === 'Grande' ? '08_UN | 35CM' : `${s.maxSlices}_UN`}
                                            </p>
                                            <p className="text-primary font-black tracking-tighter italic">UNIT_BASE: R$ {s.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="builder-section text-center border border-white/5 p-12 bg-white/[0.01]">
                                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">MODULE_SENSORS (COMPOSIÇÃO)</h4>
                                <div className="flex items-center justify-center gap-12">
                                    <button className="w-12 h-12 border border-white/20 text-white/40 hover:text-white hover:border-primary transition-all font-black" onClick={() => setFlavorsCount(Math.max(1, flavorsCount - 1))}>-</button>
                                    <div className="text-center">
                                        <span className="text-5xl font-black text-white italic tracking-tighter">{flavorsCount.toString().padStart(2, '0')}</span>
                                        <p className="text-[8px] font-bold text-primary uppercase tracking-widest mt-2">ACTIVE_FLAVORS</p>
                                    </div>
                                    <button className="w-12 h-12 border border-white/20 text-white/40 hover:text-white hover:border-primary transition-all font-black" onClick={() => setFlavorsCount(Math.min(selectedSize?.maxSlices || 3, flavorsCount + 1))}>+</button>
                                </div>
                                <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.4em] mt-8 italic">HARDWARE_LIMIT: {selectedSize?.maxSlices || 3} MOD_MAX</p>
                            </div>

                            <button 
                                className="w-full bg-primary py-6 text-black font-black text-xs uppercase tracking-[0.5em] hover:bg-white transition-all disabled:opacity-20 disabled:grayscale" 
                                disabled={!selectedSize} 
                                onClick={handleNextStep}
                            >
                                START_ALCHEMY_STATION_02
                            </button>
                        </div>
                    </div>

                    {/* STEP 2 */}
                    <div id="builder-step-2" className={`builder-step ${step === 2 ? 'active' : ''} w-full max-w-[1400px] mx-auto`}>
                            <div className="flex flex-col lg:flex-row gap-8 w-full">
                                {/* Visual Section */}
                                <div className="flex-1 bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center p-12 relative min-h-[500px]">
                                    <div className="absolute top-4 left-4 flex items-center gap-3">
                                        <div className="w-2 h-2 bg-primary"></div>
                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">RENDER_ACTIVE_SENSORS</span>
                                    </div>
                                    <div className="pizza-svg-wrapper relative scale-110">
                                        <div className="pizza-base"></div>
                                        <div className="pizza-svg-container">
                                            <PizzaSVG count={flavorsCount} segments={segments} onSliceClick={(idx) => { setDrawerTarget(idx); setDrawerOpen(true); }} />
                                        </div>
                                    </div>
                                    <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.4em] mt-12 animate-pulse italic">INPUT_REQUIRED: CLIQUE NO COMPONENTE PARA DEFINIR</p>
                                </div>

                                {/* Options Section */}
                                <div className="w-full lg:w-[450px] space-y-6">
                                    <button className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-2 mb-4" onClick={() => setStep(1)}>
                                        <i className="fa-solid fa-arrow-left"></i> RE_CALIBRATE_SYSTEM
                                    </button>

                                    <div className="bg-black border border-white/10 p-1">
                                        <div className="bg-black p-6 space-y-6">
                                            <button className="w-full border border-white/10 p-4 flex justify-between items-center hover:border-primary transition-all group" onClick={() => { setDrawerTarget('crust'); setDrawerOpen(true); }}>
                                                <div className="text-left">
                                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] block mb-1">MODULE_CRUST</span>
                                                    <span className="text-xs font-black text-white uppercase group-hover:text-primary transition-colors">{selectedCrust?.name || 'SELECTOR_IDLE'}</span>
                                                </div>
                                                <i className="fa-solid fa-chevron-right text-white/20"></i>
                                            </button>

                                            <div className="space-y-2">
                                                <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] block">DATA_MANIFEST</span>
                                                <div className="border border-white/5 divide-y divide-white/5">
                                                    {segments.map((seg, i) => (
                                                        <div key={i} className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.03]" onClick={() => { setDrawerTarget(i); setDrawerOpen(true); }}>
                                                            <div>
                                                                <span className="text-[9px] font-black text-white/40 mr-3">0{i+1}</span>
                                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${seg ? 'text-white' : 'text-red-500/50 italic'}`}>{seg?.name || 'MISSING_DATA'}</span>
                                                            </div>
                                                            <span className="text-[9px] font-black text-primary italic">{seg?.price > 0 ? `+${seg.price.toFixed(2)}` : ''}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] leading-none mb-1">TOTAL_COST</span>
                                                    <span className="text-3xl font-black text-white italic tracking-tighter italic">R$ {calculateTotal.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] block">SPECIAL_INSTRUCTIONS</span>
                                                <textarea 
                                                    value={obs} 
                                                    onChange={e => setObs(e.target.value)} 
                                                    placeholder="REMARKS..."
                                                    className="w-full bg-white/[0.03] border border-white/10 p-4 text-[11px] text-white focus:border-primary outline-none h-24 resize-none uppercase font-mono tracking-widest placeholder:text-white/5"
                                                />
                                            </div>

                                            <button 
                                                className="w-full bg-primary py-5 text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-white transition-all disabled:opacity-20 disabled:grayscale" 
                                                disabled={!isComplete} 
                                                onClick={handleAddToCart}
                                            >
                                                COMMIT_TO_ORDER_QUEUE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Selector Drawer Sharp */}
            <div id="options-drawer" className={`cart-drawer ${drawerOpen ? 'open' : ''} font-mono`} style={{ zIndex: 5100, borderRadius: 0 }}>
                <div className="cart-header border-b border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">{drawerTarget === 'crust' ? 'MOD_CRUST' : 'MOD_FLAVOR'}</h3>
                    <button onClick={() => setDrawerOpen(false)} className="text-white/40 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div className="p-6 border-b border-white/10">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/20"></i>
                        <input type="text" placeholder="QUERY_ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 py-3 pl-12 pr-4 text-[10px] text-white outline-none uppercase tracking-[0.3em] placeholder:text-white/5" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredOptions.map(item => (
                        <div 
                            key={item.id} 
                            className="p-6 border-b border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/[0.03] group"
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
                                <h4 className="font-bold text-[11px] text-white group-hover:text-primary transition-colors uppercase tracking-[0.1em]">{item.name}</h4>
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mt-1">{item.price > 0 ? `+ R$ ${item.price.toFixed(2)}` : 'STANDARD_UNIT'}</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-white/10 group-hover:text-primary transition-colors"></i>
                        </div>
                    ))}
                </div>
            </div>
            {drawerOpen && <div className="modal-overlay active" style={{ zIndex: 5000, background: 'rgba(0,0,0,0.9)' }} onClick={() => setDrawerOpen(false)}></div>}
        </>
    );
}
