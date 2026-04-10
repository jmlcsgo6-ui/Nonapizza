import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/api';
import { useBuilder } from '../context/BuilderContext';
import { useCart } from '../context/CartContext';

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
        return (selectedSize.price + averageFlavor + crustPrice);
    }, [selectedSize, segments, selectedCrust]);

    const isComplete = selectedSize && segments.every(s => s !== null);

    const handleAddToCart = () => {
        if (!isComplete) return;
        
        const cartItem = {
            productId: `custom-${Date.now()}`,
            productName: `Pizza ${selectedSize.name} Personalizada`,
            qty: 1,
            price: calculateTotal,
            price_original: calculateTotal,
            obs: obs,
            segments: segments.map(s => s?.name || 'Sabor não escolhido')
        };
        
        addToCart(cartItem);
        setIsBuilderOpen(false);
        resetBuilder();
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = '<i class="fa-solid fa-circle-check"></i> Pizza adicionada ao carrinho!';
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('visible'), 100);
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
        setTimeout(() => setIsCartOpen(true), 300);
    };

    if (!isBuilderOpen) return null;

    const filteredOptions = (drawerTarget === 'crust' ? crusts : flavors).filter(f => 
        search ? f.name.toLowerCase().includes(search.toLowerCase()) : true
    );

    const getCoordinatesForPercent = (percent) => {
        const radius = 190;
        const center = 200;
        const x = center + radius * Math.cos(2 * Math.PI * percent - Math.PI/2);
        const y = center + radius * Math.sin(2 * Math.PI * percent - Math.PI/2);
        return [x, y];
    };

    return (
        <div id="pizza-builder-overlay" className={`builder-overlay ${isBuilderOpen ? 'active' : ''}`}>
            <div className="builder-header">
                <h3>Montar Pizza</h3>
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
                            {sizes.map(s => (
                                <div 
                                    key={s.id} 
                                    className={`size-card ${selectedSize?.id === s.id ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(s)}
                                >
                                    <div className="size-icon"><i className="fa-solid fa-pizza-slice"></i></div>
                                    <h5>{s.name}</h5>
                                    <p>{s.maxSlices} fatias ({s.name === 'Pequena' ? '25cm' : s.name === 'Média' ? '30cm' : '35cm'})</p>
                                    <p className="mt-2" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>A partir de R$ {s.price.toFixed(2).replace('.', ',')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="builder-section text-center">
                        <h4>Quantidade de Sabores</h4>
                        <div className="flavors-count-control mx-auto">
                            <button className="qty-btn" onClick={() => setFlavorsCount(Math.max(1, flavorsCount - 1))}>-</button>
                            <span>{flavorsCount}</span>
                            <button className="qty-btn" onClick={() => setFlavorsCount(Math.min(selectedSize?.maxSlices || 3, flavorsCount + 1))}>+</button>
                        </div>
                        <p className="fc-hint">Máximo de 3 sabores por pizza.</p>
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
                                <div className="pizza-crust-visual" style={{ 
                                    position: 'absolute', inset: '4%', borderRadius: '50%', 
                                    border: selectedCrust ? '14px solid #c25215' : 'none',
                                    zIndex: 2, pointerEvents: 'none',
                                    borderColor: selectedCrust?.price > 0 ? 'var(--primary)' : '#d08f37'
                                }}></div>
                                <div className="pizza-svg-container">
                                    <svg viewBox="0 0 400 400" className="pizza-svg-element">
                                        {segments.map((seg, i) => {
                                            const total = segments.length;
                                            const isSelected = !!seg;
                                            const textContent = isSelected ? seg.name : `Sabor ${i+1}`;
                                            
                                            if (total === 1) {
                                                return (
                                                    <g key={i} onClick={() => { setDrawerTarget(i); setDrawerOpen(true); }} style={{ cursor: 'pointer' }}>
                                                        <circle cx="200" cy="200" r="190" className={`pizza-slice ${isSelected ? 'has-flavor' : ''}`} />
                                                        <text x="200" y="200" className="slice-text">{textContent}</text>
                                                    </g>
                                                );
                                            } else {
                                                const startPercent = i / total;
                                                const endPercent = (i + 1) / total;
                                                const [startX, startY] = getCoordinatesForPercent(startPercent);
                                                const [endX, endY] = getCoordinatesForPercent(endPercent);
                                                const pathData = `M 200 200 L ${startX} ${startY} A 190 190 0 0 1 ${endX} ${endY} L 200 200`;
                                                
                                                const midPercent = (startPercent + endPercent) / 2;
                                                const textRadius = 110;
                                                const textX = 200 + textRadius * Math.cos(2 * Math.PI * midPercent - Math.PI/2);
                                                const textY = 200 + textRadius * Math.sin(2 * Math.PI * midPercent - Math.PI/2);
                                                
                                                return (
                                                    <g key={i} onClick={() => { setDrawerTarget(i); setDrawerOpen(true); }} style={{ cursor: 'pointer' }}>
                                                        <path d={pathData} className={`pizza-slice ${isSelected ? 'has-flavor' : ''}`} />
                                                        <text x={textX} y={textY} className="slice-text">{textContent}</text>
                                                    </g>
                                                );
                                            }
                                        })}
                                    </svg>
                                </div>
                            </div>
                            <p className="visual-hint" style={{ textAlign: 'center', width: '100%' }}>
                                <i className="fa-solid fa-hand-pointer"></i> Toque para escolher o sabor
                            </p>
                        </div>

                        <div className="builder-options">
                            <button className="btn-text" onClick={() => setStep(1)}><i className="fa-solid fa-arrow-left"></i> Voltar tamanhos</button>

                            <div className="builder-section">
                                <button className="crust-select-btn" onClick={() => { setDrawerTarget('crust'); setDrawerOpen(true); }}>
                                    <div className="crust-info">
                                        <span className="crust-label">Borda</span>
                                        <span className="crust-value">{selectedCrust?.name || 'Tradicional'}</span>
                                    </div>
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>

                            <div className="builder-summary">
                                <h4>Sua Pizza</h4>
                                <ul id="builder-summary-list">
                                    <li><span>Tamanho {selectedSize?.name}</span><span>R$ {selectedSize?.price.toFixed(2).replace('.', ',')}</span></li>
                                    {segments.map((seg, i) => (
                                        <li key={i}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>- Sabor {i+1}: {seg?.name || 'Pendente...'}</span>
                                            <span>{seg ? (seg.price > 0 ? `+ R$ ${(seg.price / (segments.length || 1)).toFixed(2).replace('.', ',')}` : 'Incluso') : ''}</span>
                                        </li>
                                    ))}
                                    <li><span>Borda {selectedCrust?.name || 'Tradicional'}</span><span>{selectedCrust?.price > 0 ? `+ R$ ${selectedCrust.price.toFixed(2).replace('.', ',')}` : 'Inclusa'}</span></li>
                                </ul>
                                <div className="builder-total">
                                    <span>Total:</span>
                                    <strong id="builder-total-price">R$ {calculateTotal.toFixed(2).replace('.', ',')}</strong>
                                </div>
                            </div>

                            <div className="builder-obs">
                                <h4>Observações</h4>
                                <textarea 
                                    id="builder-obs" 
                                    placeholder="Ex: Sem cebola, bem assada..."
                                    value={obs}
                                    onChange={e => setObs(e.target.value)}
                                ></textarea>
                            </div>

                            <button 
                                className="btn btn-primary btn-large w-100" 
                                disabled={!isComplete}
                                onClick={handleAddToCart}
                            >
                                <i className="fa-solid fa-cart-plus" style={{ marginRight: '8px' }}></i> Adicionar ao Pedido
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Options Drawer */}
            <div id="options-drawer" className={`cart-drawer ${drawerOpen ? 'open' : ''}`} style={{ zIndex: 4000 }}>
                <div className="cart-header">
                    <h3 id="options-drawer-title">{drawerTarget === 'crust' ? 'Escolha a Borda' : 'Escolha o Sabor'}</h3>
                    <button id="close-options-drawer" onClick={() => setDrawerOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>
                
                {drawerTarget !== 'crust' && (
                    <div className="options-search-wrapper">
                        <div className="options-search">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input 
                                type="text" 
                                placeholder="Buscar sabor..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="options-list" id="options-list-container">
                    {filteredOptions.map(item => (
                        <div key={item.id} className="option-item" onClick={() => {
                            if (drawerTarget === 'crust') setSelectedCrust(item);
                            else {
                                const newSegments = [...segments];
                                newSegments[drawerTarget] = item;
                                setSegments(newSegments);
                            }
                            setDrawerOpen(false);
                            setSearch('');
                        }}>
                            <div className="option-item-info">
                                <h5>{item.name}</h5>
                                <p>{item.desc || (item.price > 0 ? `+ R$ ${item.price.toFixed(2).replace('.', ',')}` : 'Sabor Tradicional')}</p>
                            </div>
                            <div className="option-price">
                                {drawerTarget === 'crust' 
                                    ? (item.price > 0 ? `+ R$ ${item.price.toFixed(2).replace('.', ',')}` : 'Grátis')
                                    : (item.price > 0 ? `+ R$ ${(item.price / segments.length).toFixed(2).replace('.', ',')}` : 'Incluso')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {drawerOpen && <div className="modal-overlay" style={{ zIndex: 3500, opacity: 1, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setDrawerOpen(false)}></div>}
        </div>
    );
}

