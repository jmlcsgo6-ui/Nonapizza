import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/api';
import { useBuilder } from '../../context/BuilderContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PizzaBuilder() {
    const { 
        isBuilderOpen, setIsBuilderOpen, step, setStep,
        selectedSize, setSelectedSize, flavorsCount, setFlavorsCount,
        segments, setSegments, selectedCrust, setSelectedCrust,
        obs, setObs, resetBuilder
    } = useBuilder();
    const { addToCart, setIsCartOpen } = useCart();

    const [sizes, setSizes] = useState<any[]>([]);
    const [crusts, setCrusts] = useState<any[]>([]);
    const [flavors, setFlavors] = useState<any[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerTarget, setDrawerTarget] = useState<any>(null);
    const [search, setSearch] = useState('');

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
        segments.forEach((f: any) => { if(f) { flavorTotal += f.price; totalCounted++; } });
        const averageFlavor = totalCounted > 0 ? (flavorTotal / totalCounted) : 0;
        const crustPrice = selectedCrust ? selectedCrust.price : 0;
        return (selectedSize.price + averageFlavor + crustPrice);
    }, [selectedSize, segments, selectedCrust]);

    const isComplete = selectedSize && segments.every((s: any) => s !== null);

    const handleAddToCart = () => {
        if (!isComplete) return;
        const cartItem = {
            productId: `custom-${Date.now()}`,
            productName: `Pizza ${selectedSize.name} Personalizada`,
            qty: 1,
            price: calculateTotal,
            price_original: calculateTotal,
            obs: obs,
            segments: segments.map((s: any) => s?.name || 'Sabor não escolhido')
        };
        addToCart(cartItem);
        setIsBuilderOpen(false);
        resetBuilder();
        setTimeout(() => setIsCartOpen(true), 300);
    };

    if (!isBuilderOpen) return null;

    const filteredOptions = (drawerTarget === 'crust' ? crusts : flavors).filter((f: any) => 
        search ? f.name.toLowerCase().includes(search.toLowerCase()) : true
    );

    const getCoordinatesForPercent = (percent: number) => {
        const radius = 45;
        const center = 50;
        const x = center + radius * Math.cos(2 * Math.PI * percent - Math.PI/2);
        const y = center + radius * Math.sin(2 * Math.PI * percent - Math.PI/2);
        return [x, y];
    };

    return (
        <div className={`builder-overlay ${isBuilderOpen ? 'active' : ''}`}>
            <div className="builder-header">
                <div className="header-left">
                    {step === 2 && (
                        <button className="header-back-btn" onClick={() => setStep(1)}>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                    )}
                    <h3>Montar Pizza</h3>
                </div>
                <button id="close-builder" onClick={() => setIsBuilderOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="builder-body">
                {/* Step 1 */}
                <div className={`builder-step ${step === 1 ? 'active' : 'slide-left'}`}>
                    <h2 className="step-title">Como começamos?</h2>
                    <p className="step-desc">Escolha o tamanho e quantos sabores deseja.</p>

                    <div className="builder-section">
                        <h4 className="text-center">Tamanho</h4>
                        <div className="cards-grid">
                            {sizes.map((s: any) => (
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={s.id} 
                                    className={`size-card ${selectedSize?.id === s.id ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(s)}
                                >
                                    <div className="size-icon"><i className="fa-solid fa-pizza-slice"></i></div>
                                    <h5>{s.name}</h5>
                                    <p>{s.maxSlices} fatias</p>
                                    <p className="mt-2" style={{ color: '#ff5e00', fontWeight: 'bold', fontSize: '0.85rem' }}>A partir de R$ {s.price.toFixed(2).replace('.', ',')}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="builder-section text-center">
                        <h4>Quantidade de Sabores</h4>
                        <div className="flavors-count-control mx-auto">
                            <button className="qty-btn" onClick={() => setFlavorsCount(Math.max(1, flavorsCount - 1))}>-</button>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{flavorsCount}</span>
                            <button className="qty-btn" onClick={() => setFlavorsCount(Math.min(selectedSize?.maxSlices || 4, flavorsCount + 1))}>+</button>
                        </div>
                    </div>

                    <div className="step-footer mt-4">
                        <button className="btn btn-primary btn-large w-100" disabled={!selectedSize} onClick={() => setStep(2)}>
                            Avançar para Montagem <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                        </button>
                    </div>
                </div>

                {/* Step 2 */}
                <div className={`builder-step ${step === 2 ? 'active' : ''}`}>
                    <div className="builder-split">
                        <div className="builder-visual">
                        <div className="pizza-svg-wrapper">
                            <div className="pizza-base"></div>
                            <div className="pizza-svg-container">
                                <svg viewBox="0 0 100 100" className="pizza-svg-element">
                                    {segments.map((seg: any, i: number) => {
                                        const total = segments.length;
                                        const isSelected = !!seg;
                                        const truncate = (str: string, len: number) => str.length > len ? str.substring(0, len) + '...' : str;
                                        const textContent = isSelected ? truncate(seg.name, 12) : `Sabor ${i + 1}`;
                                        
                                        if (total === 1) {
                                            return (
                                                <motion.g 
                                                    key={i} 
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                                                    onClick={() => { setDrawerTarget(i); setDrawerOpen(true); }} 
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <circle cx="50" cy="50" r="45" className={`pizza-slice ${isSelected ? 'has-flavor' : ''}`} />
                                                    <text x="50" y="50" className="slice-text" dominantBaseline="middle" fontSize="3.5">{textContent}</text>
                                                </motion.g>
                                            );
                                        } else {
                                            const startPercent = i / total;
                                            const endPercent = (i + 1) / total;
                                            const [startX, startY] = getCoordinatesForPercent(startPercent);
                                            const [endX, endY] = getCoordinatesForPercent(endPercent);
                                            const largeArcFlag = (endPercent - startPercent) > 0.5 ? 1 : 0;
                                            const pathData = `M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
                                            
                                            const midPercent = (startPercent + endPercent) / 2;
                                            const textRadius = 25;
                                            const textX = 50 + textRadius * Math.cos(2 * Math.PI * midPercent - Math.PI/2);
                                            const textY = 50 + textRadius * Math.sin(2 * Math.PI * midPercent - Math.PI/2);
                                            
                                            return (
                                                <motion.g 
                                                    key={i} 
                                                    initial={{ scale: 0.8, opacity: 0, x: (midPercent > 0.5 ? 10 : -10), y: (midPercent > 0.25 && midPercent < 0.75 ? 10 : -10) }}
                                                    animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 15 }}
                                                    onClick={() => { setDrawerTarget(i); setDrawerOpen(true); }} 
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <path d={pathData} className={`pizza-slice ${isSelected ? 'has-flavor' : ''}`} />
                                                    <text x={textX} y={textY} className="slice-text" dominantBaseline="middle" fontSize="2.5">{isSelected ? truncate(seg.name, 10) : `Sabor ${i + 1}`}</text>
                                                </motion.g>
                                            );
                                        }
                                    })}
                                </svg>
                            </div>
                        </div>
                        <p className="visual-hint">
                            <i className="fa-solid fa-hand-pointer" style={{ marginRight: '4px' }}></i> Toque para escolher o sabor
                        </p>
                    </div>

                    <div className="builder-options-scroll custom-scrollbar">
                        <div className="builder-options">
                            {/* Borda Selector */}
                            <button className="crust-select-btn" onClick={() => { setDrawerTarget('crust'); setDrawerOpen(true); }}>
                                <div className="crust-info">
                                    <span className="crust-label">Borda</span>
                                    <span className="crust-value">{selectedCrust?.name || 'Tradicional'}</span>
                                </div>
                                <i className="fa-solid fa-chevron-right" style={{ color: '#b0b0b0' }}></i>
                            </button>

                            {/* Order Summary */}
                            <div className="builder-summary">
                                <h4>Sua Pizza</h4>
                                <ul id="builder-summary-list">
                                    {selectedSize && (
                                        <li>
                                            <span>Tamanho {selectedSize.name}</span>
                                            <span>R$ {selectedSize.price.toFixed(2).replace('.', ',')}</span>
                                        </li>
                                    )}
                                    {segments.map((seg: any, i: number) => seg && (
                                        <li key={i}>
                                            <span>- Sabor {i + 1}: {seg.name}</span>
                                            <span>{seg.price > 0 ? `+ R$ ${seg.price.toFixed(2).replace('.', ',')}` : 'Incluso'}</span>
                                        </li>
                                    ))}
                                    {selectedCrust && (
                                        <li>
                                            <span>Borda {selectedCrust.name}</span>
                                            <span>{selectedCrust.price > 0 ? `+ R$ ${selectedCrust.price.toFixed(2).replace('.', ',')}` : 'Inclusa'}</span>
                                        </li>
                                    )}
                                </ul>
                                <div className="builder-total">
                                    <span>Total:</span>
                                    <strong>R$ {calculateTotal.toFixed(2).replace('.', ',')}</strong>
                                </div>
                            </div>

                            {/* Observations */}
                            <div className="builder-obs">
                                <h4>Observações</h4>
                                <textarea 
                                    id="builder-obs"
                                    placeholder="Ex: Sem cebola, bem assada..."
                                    value={obs}
                                    onChange={(e) => setObs(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ height: '100px' }}></div> {/* Spacer for fixed button */}
                    </div>
                    </div>

                    {/* Add to Order Button */}
                    <div className="builder-footer-cta">
                        <button 
                            className="btn btn-primary btn-large w-100" 
                            disabled={!isComplete} 
                            onClick={handleAddToCart}
                        >
                            <i className="fa-solid fa-cart-shopping"></i> ADICIONAR AO PEDIDO
                        </button>
                    </div>
                </div>
            </div>

            {/* Flavor/Crust Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a0a', zIndex: 4000, display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0 }}>{drawerTarget === 'crust' ? 'Escolha a Borda' : `Escolha o Sabor ${typeof drawerTarget === 'number' ? drawerTarget + 1 : ''}`}</h4>
                            <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <div className="options-search-wrapper">
                            <div className="options-search">
                                <i className="fa-solid fa-search"></i>
                                <input 
                                    type="text" 
                                    placeholder="Buscar..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="options-list custom-scrollbar">
                            {filteredOptions.map((opt: any) => (
                                <motion.div 
                                    whileTap={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    key={opt.id} 
                                    className="option-item" 
                                    onClick={() => {
                                        if (drawerTarget === 'crust') {
                                            setSelectedCrust(opt);
                                        } else {
                                            const newSegments = [...segments];
                                            newSegments[drawerTarget] = opt;
                                            setSegments(newSegments);
                                        }
                                        setDrawerOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    <div className="option-item-info">
                                        <h5>{opt.name}</h5>
                                        {opt.description && <p>{opt.description}</p>}
                                    </div>
                                    <span className="option-price">
                                        {opt.price > 0 ? `+ R$ ${opt.price.toFixed(2).replace('.', ',')}` : 'Incluso'}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
