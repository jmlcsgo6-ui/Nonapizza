import React, { useEffect, useState } from 'react';
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
            } catch(e) {
                console.error("Error loading builder data:", e);
            }
        };
        fetchData();
    }, []);

    const [qty, setQty] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerTarget, setDrawerTarget] = useState(null); // 'crust' or segment index
    const [search, setSearch] = useState('');

    useEffect(() => {
        setSegments(Array(flavorsCount).fill(null));
    }, [flavorsCount, setSegments]);

    if (!isBuilderOpen) return null;

    const handleSliceClick = (idx) => {
        setDrawerTarget(idx);
        setDrawerOpen(true);
    };

    const handleSelectOption = (item) => {
        if (drawerTarget === 'crust') {
            setSelectedCrust(item);
        } else {
            const newSegments = [...segments];
            newSegments[drawerTarget] = item;
            setSegments(newSegments);
        }
        setDrawerOpen(false);
        setSearch('');
    };

    const calculateTotal = () => {
        if (!selectedSize) return 0;
        let base = selectedSize.price;
        let flavorTotal = 0;
        let totalCounted = 0;
        segments.forEach(f => {
            if(f) { flavorTotal += f.price; totalCounted++; }
        });
        const averageFlavor = totalCounted > 0 ? (flavorTotal / totalCounted) : 0;
        const crustPrice = selectedCrust ? selectedCrust.price : 0;
        return (base + averageFlavor + crustPrice) * qty;
    };

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
        setTimeout(() => setIsCartOpen(true), 150);
    };

    return (
        <div id="pizza-builder-overlay" className="builder-overlay active">
            <div className="builder-header">
                <h3>Montar Pizza</h3>
                <button id="close-builder" onClick={() => setIsBuilderOpen(false)}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="builder-body">
                {step === 1 && (
                    <div id="builder-step-1" className="builder-step active">
                        <h2 className="step-title">Como começamos?</h2>
                        <p className="step-desc">Escolha o tamanho e quantos sabores deseja.</p>

                        <div className="builder-section">
                            <h4>Tamanho</h4>
                            <div className="cards-grid">
                                {sizes.map(s => (
                                    <div 
                                        key={s.id} 
                                        className={`size-card ${selectedSize?.id === s.id ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(s)}
                                    >
                                        <div className="size-icon"><i className="fa-solid fa-pizza-slice"></i></div>
                                        <h5>{s.name}</h5>
                                        <p>{s.maxSlices} fatias max</p>
                                        <p className="mt-2 text-primary">A partir de R$ {s.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="builder-section text-center mt-4">
                            <h4>Quantidade de Sabores</h4>
                            <div className="flavors-count-control mx-auto">
                                <button className="qty-btn" onClick={() => setFlavorsCount(Math.max(1, flavorsCount - 1))}>-</button>
                                <span>{flavorsCount}</span>
                                <button className="qty-btn" onClick={() => setFlavorsCount(Math.min(selectedSize?.maxSlices || 3, flavorsCount + 1))}>+</button>
                            </div>
                        </div>

                        <div className="step-footer mt-4">
                            <button 
                                className="btn btn-primary btn-large w-100" 
                                disabled={!selectedSize}
                                onClick={() => setStep(2)}
                            >
                                Avançar para Montagem <i className="fa-solid fa-arrow-right" style={{marginLeft: '8px'}}></i>
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div id="builder-step-2" className="builder-step active">
                        <div className="builder-split">
                            <div className="builder-visual">
                                <div className="pizza-svg-wrapper">
                                    <div className="pizza-base"></div>
                                    <PizzaSVG count={flavorsCount} segments={segments} onSliceClick={handleSliceClick} />
                                </div>
                                <p className="visual-hint"><i className="fa-solid fa-hand-pointer"></i> Clique em um pedaço para escolher o sabor</p>
                            </div>
                            <div className="builder-options">
                                <button className="btn-text" onClick={() => setStep(1)}><i className="fa-solid fa-arrow-left"></i> Voltar tamanhos</button>
                                
                                <div className="builder-section" style={{marginTop: '2rem'}}>
                                    <button className="crust-select-btn" onClick={() => { setDrawerTarget('crust'); setDrawerOpen(true); }}>
                                        <div className="crust-info">
                                            <span className="crust-label">Borda</span>
                                            <span className="crust-value">{selectedCrust?.name || 'Selecione...'}</span>
                                        </div>
                                        <i className="fa-solid fa-chevron-right"></i>
                                    </button>
                                </div>

                                <div className="builder-summary">
                                    <h4>Sua Pizza</h4>
                                    <ul>
                                        <li><span>Tamanho {selectedSize?.name}</span><span>R$ {selectedSize?.price.toFixed(2)}</span></li>
                                        {segments.map((seg, i) => seg && <li key={i}><span>{seg.name}</span><span>+ R$ {seg.price.toFixed(2)}</span></li>)}
                                        {selectedCrust && selectedCrust.price > 0 && <li><span>Borda {selectedCrust.name}</span><span>+ R$ {selectedCrust.price.toFixed(2)}</span></li>}
                                    </ul>
                                    <div className="builder-total">
                                        <span>Total:</span>
                                        <strong>R$ {calculateTotal().toFixed(2)}</strong>
                                    </div>
                                </div>

                                <div className="builder-obs" style={{marginBottom: '2rem'}}>
                                    <h4>Observações</h4>
                                    <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex: Sem cebola..."></textarea>
                                </div>

                                <button 
                                    className="btn btn-primary btn-large w-100" 
                                    disabled={!isComplete} 
                                    onClick={handleAddToCart}
                                >
                                    <i className="fa-solid fa-cart-plus" style={{marginRight: '8px'}}></i> Adicionar ao Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Options Drawer */}
            <div className={`builder-drawer ${drawerOpen ? 'active' : ''}`}>
                <div className="cart-header">
                    <h3>{drawerTarget === 'crust' ? 'Escolha a Borda' : 'Escolha o Sabor'}</h3>
                    <button onClick={() => { setDrawerOpen(false); setSearch(''); }}><i className="fa-solid fa-xmark"></i></button>
                </div>
                
                {drawerTarget !== 'crust' && (
                    <div className="options-search-wrapper" style={{padding: '1rem'}}>
                        <input className="form-input" placeholder="Buscar sabor..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                )}
                
                <div className="options-list" style={{padding: '1rem', overflowY: 'auto'}}>
                    {(drawerTarget === 'crust' ? crusts : flavors)
                        .filter(f => search ? f.name.toLowerCase().includes(search.toLowerCase()) : true)
                        .map(item => (
                        <div key={item.id} className="flavor-option-card hover-scale" onClick={() => handleSelectOption(item)}>
                            <div className="foc-info">
                                <h5>{item.name}</h5>
                                {item.price > 0 && <span className="text-primary">+ R$ {item.price.toFixed(2)}</span>}
                            </div>
                            <div className="foc-action"><i className="fa-solid fa-plus"></i></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
