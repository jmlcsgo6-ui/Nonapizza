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

    const filteredOptions = (drawerTarget === 'crust' ? crusts : flavors).filter(f => 
        search ? f.name.toLowerCase().includes(search.toLowerCase()) : true
    );

    return (
        <>
            <div id="pizza-builder-overlay" className="builder-overlay active">
                <div className="builder-header">
                    <h3>Montar Pizza</h3>
                    <button id="close-builder" onClick={() => setIsBuilderOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div className="builder-body">
                    <div id="builder-step-1" className={`builder-step ${step === 1 ? 'active' : 'slide-left'}`}>
                        <h2 className="step-title">Como começamos?</h2>
                        <p className="step-desc">Escolha o tamanho e quantos sabores deseja.</p>

                        <div className="builder-section">
                            <h4>Tamanho</h4>
                            <div className="cards-grid" id="builder-sizes">
                                {sizes.map(s => (
                                    <div 
                                        key={s.id} 
                                        className={`size-card ${selectedSize?.id === s.id ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(s)}
                                    >
                                        <div className="size-icon"><i className="fa-solid fa-pizza-slice"></i></div>
                                        <h5>{s.name}</h5>
                                        <p style={{ marginTop: '0.2rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.maxSlices} fatias {s.maxSlices === 4 ? '(25cm)' : s.maxSlices === 6 ? '(30cm)' : s.maxSlices === 8 ? '(35cm)' : ''}</p>
                                        <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>A partir de R$ {s.price.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="builder-section text-center">
                            <h4>Quantidade de Sabores</h4>
                            <div className="flavors-count-control mx-auto">
                                <button className="qty-btn" onClick={() => setFlavorsCount(Math.max(1, flavorsCount - 1))}>-</button>
                                <span style={{ margin: '0 15px' }} className="font-bold text-xl">{flavorsCount}</span>
                                <button className="qty-btn" onClick={() => setFlavorsCount(Math.min(selectedSize?.maxSlices || 3, flavorsCount + 1))}>+</button>
                            </div>
                            <p className="fc-hint">Máximo de {selectedSize?.maxSlices || 3} sabores por pizza.</p>
                        </div>

                        <div className="step-footer mt-4">
                            <button className="btn btn-primary btn-large w-100" disabled={!selectedSize} onClick={() => setStep(2)}>
                                Avançar para Montagem <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                            </button>
                        </div>
                    </div>

                    <div id="builder-step-2" className={`builder-step ${step === 2 ? 'active' : ''}`}>
                            <div className="builder-split">
                                {/* Esquerda: Visual da Pizza */}
                                <div className="builder-visual">
                                    <div className="pizza-svg-wrapper">
                                        <div className="pizza-base"></div>
                                        <div className="pizza-svg-container" id="pizza-svg-container">
                                            <PizzaSVG count={flavorsCount} segments={segments} onSliceClick={(idx) => { setDrawerTarget(idx); setDrawerOpen(true); }} />
                                        </div>
                                    </div>
                                    <p className="visual-hint"><i className="fa-solid fa-hand-pointer"></i> Clique em um pedaço para
                                        escolher o sabor</p>
                                </div>

                                {/* Direita: Opções */}
                                <div className="builder-options">
                                    <button className="btn-text" onClick={() => setStep(1)}>
                                        <i className="fa-solid fa-arrow-left"></i> Voltar tamanhos
                                    </button>

                                    <div className="builder-section" style={{ marginTop: '2rem' }}>
                                        <button className="crust-select-btn" onClick={() => { setDrawerTarget('crust'); setDrawerOpen(true); }}>
                                            <div className="crust-info">
                                                <span className="crust-label">Borda</span>
                                                <span className="crust-value">{selectedCrust?.name || 'Selecione'}</span>
                                            </div>
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>

                                    <div className="builder-summary">
                                        <h4>Sua Pizza</h4>
                                        <ul id="builder-summary-list">
                                            {segments.map((seg, i) => (
                                                <li key={i} className="summary-item" onClick={() => { setDrawerTarget(i); setDrawerOpen(true); }} style={{ cursor: 'pointer', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span className="si-name" style={{ color: seg ? '#fff' : 'var(--text-muted)' }}>1/{flavorsCount} - {seg?.name || 'Sabor não escolhido'}</span>
                                                    <span className="si-price" style={{ fontWeight: 'bold' }}>{seg?.price > 0 ? `+ R$ ${seg.price.toFixed(2)}` : ''}</span>
                                                </li>
                                            ))}
                                            {selectedCrust && selectedCrust.price > 0 && (
                                                <li className="summary-item" style={{ padding: '0.8rem 0', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span className="si-name">Borda {selectedCrust.name}</span>
                                                    <span className="si-price" style={{ fontWeight: 'bold' }}>+ R$ {selectedCrust.price.toFixed(2)}</span>
                                                </li>
                                            )}
                                        </ul>
                                        <div className="builder-total">
                                            <span>Total:</span>
                                            <strong>R$ {calculateTotal().toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    <div className="builder-obs" style={{ marginBottom: '2rem' }}>
                                        <h4>Observações</h4>
                                        <textarea 
                                            value={obs} 
                                            onChange={e => setObs(e.target.value)} 
                                            placeholder="Ex: Sem cebola, bem assada..."
                                            style={{ width: '100%', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', minHeight: '80px', marginTop: '0.5rem', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <button className="btn btn-primary btn-large w-100" disabled={!isComplete} onClick={handleAddToCart}>
                                        <i className="fa-solid fa-cart-plus" style={{ marginRight: '8px' }}></i> Adicionar ao Pedido
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Flavor / Crust Selector Drawer */}
            <div id="options-drawer" className={`cart-drawer ${drawerOpen ? 'open' : ''}`} style={{ zIndex: 5100 }}>
                <div className="cart-header">
                    <h3>Escolha {drawerTarget === 'crust' ? 'a Borda' : 'o Sabor'}</h3>
                    <button onClick={() => setDrawerOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div className="options-search-wrapper" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="options-search" style={{ position: 'relative' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-muted)' }}></i>
                        <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50px', color: '#fff' }} />
                    </div>
                </div>

                <div className="options-list" style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                    {filteredOptions.map(item => (
                        <div 
                            key={item.id} 
                            style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
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
                                <h4 style={{ fontWeight: 'bold' }}>{item.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.price > 0 ? `+ R$ ${item.price.toFixed(2)}` : 'Incluso'}</span>
                            </div>
                            <div style={{ alignSelf: 'center' }}><i className="fa-solid fa-chevron-right" style={{ color: 'var(--text-muted)'}}></i></div>
                        </div>
                    ))}
                </div>
            </div>
            {drawerOpen && <div className="modal-overlay active" style={{ zIndex: 5000, background: 'rgba(0,0,0,0.8)' }} onClick={() => setDrawerOpen(false)}></div>}
        </>
    );
}
