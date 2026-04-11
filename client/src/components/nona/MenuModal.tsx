import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import { useCart } from '../../context/CartContext';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
}

interface Category {
    id: string;
    name: string;
    products: Product[];
}

interface PizzaSize {
    id: string;
    name: string;
    price: number;
    maxSlices: number;
}

interface Crust {
    id: string;
    name: string;
    price: number;
}

interface Flavor {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
}

export default function MenuModal() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [addedNotif, setAddedNotif] = useState<string | null>(null);
    const [detailCrust, setDetailCrust] = useState<Crust | null>(null);
    const [detailObs, setDetailObs] = useState('');
    const { addToCart, setIsCartOpen, cart, cartTotal } = useCart();
    const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // ── Monte sua Pizza state ──
    const [builderOpen, setBuilderOpen] = useState(false);
    const [builderStep, setBuilderStep] = useState(1); // 1=size, 2=flavors, 3=extras+obs
    const [sizes, setSizes] = useState<PizzaSize[]>([]);
    const [crusts, setCrusts] = useState<Crust[]>([]);
    const [flavors, setFlavors] = useState<Flavor[]>([]);
    const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
    const [flavorsCount, setFlavorsCount] = useState(2);
    const [selectedFlavors, setSelectedFlavors] = useState<Flavor[]>([]);
    const [selectedCrust, setSelectedCrust] = useState<Crust | null>(null);
    const [pizzaObs, setPizzaObs] = useState('');
    const [flavorSearch, setFlavorSearch] = useState('');

    useEffect(() => {
        const handleOpenMenu = () => setIsOpen(true);
        document.addEventListener('open-menu', handleOpenMenu);
        return () => document.removeEventListener('open-menu', handleOpenMenu);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [catRes, cruRes] = await Promise.all([
                    api.get('/api/categories'),
                    api.get('/api/crusts')
                ]);
                setCategories(catRes.data);
                if (catRes.data.length > 0) setActiveCategory(0);
                setCrusts(cruRes.data);
                if (cruRes.data.length > 0) setDetailCrust(cruRes.data[0]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (isOpen) fetchInitialData();
    }, [isOpen]);

    // Fetch builder data when builder opens
    useEffect(() => {
        const fetchBuilderData = async () => {
            try {
                const [szRes, flavRes] = await Promise.all([
                    api.get('/api/sizes'),
                    api.get('/api/ingredients')
                ]);
                setSizes(szRes.data);
                setFlavors(flavRes.data);
                if (crusts.length > 0) setSelectedCrust(crusts[0]);
            } catch (e) {
                console.error('Error loading builder data:', e);
            }
        };
        if (builderOpen) fetchBuilderData();
    }, [builderOpen]);

    const scrollToCategory = (index: number) => {
        setActiveCategory(index);
        const ref = categoryRefs.current[index];
        if (ref && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const offsetTop = ref.offsetTop - container.offsetTop - 60;
            container.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollTop = container.scrollTop + 80;
        for (let i = categoryRefs.current.length - 1; i >= 0; i--) {
            const ref = categoryRefs.current[i];
            if (ref) {
                const offsetTop = ref.offsetTop - container.offsetTop;
                if (scrollTop >= offsetTop) {
                    setActiveCategory(i);
                    break;
                }
            }
        }
    };

    const categoryOfSelected = useMemo(() => {
        if (!selectedProduct) return null;
        return categories.find(c => c.products.some(p => p.id === selectedProduct.id));
    }, [selectedProduct, categories]);

    const isSelectedPizza = useMemo(() => {
        if (!categoryOfSelected) return false;
        const name = categoryOfSelected.name.toLowerCase();
        return name.includes('pizza') || name.includes('salgada') || name.includes('doce') || name.includes('especial') || name.includes('tradicionai');
    }, [categoryOfSelected]);

    const handleAddToCart = (p: Product) => {
        let finalPrice = p.price;
        let finalName = p.name;
        
        let uniqueId = p.id;
        if (isSelectedPizza && detailCrust) {
            finalPrice += detailCrust.price;
            if (detailCrust.price > 0 || detailCrust.name.toLowerCase() !== 'tradicional' && detailCrust.name.toLowerCase() !== 'sem borda') {
                finalName += ` (Borda ${detailCrust.name})`;
                uniqueId += `-${detailCrust.id}`;
            }
        }

        addToCart({ productId: uniqueId, productName: finalName, price: finalPrice, qty: 1, obs: detailObs });
        setAddedNotif(p.name);
        setTimeout(() => setAddedNotif(null), 2000);
        setSelectedProduct(null);
        setDetailObs('');
    };

    // ── Builder Logic ──
    const openBuilder = () => {
        setBuilderStep(1);
        setSelectedSize(null);
        setFlavorsCount(2);
        setSelectedFlavors([]);
        setPizzaObs('');
        setFlavorSearch('');
        setBuilderOpen(true);
    };

    const toggleFlavor = (flavor: Flavor) => {
        setSelectedFlavors(prev => {
            const exists = prev.find(f => f.id === flavor.id);
            if (exists) return prev.filter(f => f.id !== flavor.id);
            if (prev.length >= flavorsCount) return prev;
            return [...prev, flavor];
        });
    };

    const pizzaTotal = useMemo(() => {
        if (!selectedSize) return 0;
        const flavorAvg = selectedFlavors.length > 0
            ? selectedFlavors.reduce((sum, f) => sum + f.price, 0) / selectedFlavors.length
            : 0;
        const crustPrice = selectedCrust?.price || 0;
        return selectedSize.price + flavorAvg + crustPrice;
    }, [selectedSize, selectedFlavors, selectedCrust]);

    const isPizzaComplete = selectedSize && selectedFlavors.length === flavorsCount;

    const handleAddPizzaToCart = () => {
        if (!isPizzaComplete || !selectedSize) return;
        const flavorNames = selectedFlavors.map(f => f.name);
        const cartItem = {
            productId: `custom-pizza-${Date.now()}`,
            productName: `Pizza ${selectedSize.name} (${flavorNames.join(' + ')})`,
            qty: 1,
            price: pizzaTotal,
            price_original: pizzaTotal,
            obs: pizzaObs,
            segments: flavorNames
        };
        addToCart(cartItem);
        setAddedNotif(`Pizza ${selectedSize.name} montada`);
        setTimeout(() => setAddedNotif(null), 2500);
        setBuilderOpen(false);
    };

    const filteredFlavors = flavors.filter(f =>
        flavorSearch ? f.name.toLowerCase().includes(flavorSearch.toLowerCase()) : true
    );

    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="ifood-menu-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="ifood-menu-container"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        {/* ── HEADER ── */}
                        <div className="ifood-menu-header">
                            <div className="ifood-header-info">
                                <div className="ifood-restaurant-icon">
                                    <i className="fa-solid fa-pizza-slice"></i>
                                </div>
                                <div>
                                    <h2 className="ifood-restaurant-name">Nona Pizza</h2>
                                    <p className="ifood-restaurant-sub">Pizzaria • Artesanal</p>
                                </div>
                            </div>
                            <button className="ifood-close-btn" onClick={() => setIsOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                         {/* ── CATEGORY CHIPS ── */}
                        <div className="ifood-categories-bar">
                            <div className="ifood-categories-scroll">
                                <button
                                    className="ifood-chip ifood-sparkle-chip"
                                    onClick={() => {
                                        // Achar o target index onde o builder está
                                        const pizzaCategoryIndex = categories.findIndex(c => 
                                            c.name.toLowerCase().includes('pizza') || 
                                            c.name.toLowerCase().includes('salgada') ||
                                            c.name.toLowerCase().includes('especial')
                                        );
                                        scrollToCategory(pizzaCategoryIndex !== -1 ? pizzaCategoryIndex : 0);
                                    }}
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> Monte sua Pizza
                                </button>
                                {categories.map((cat, i) => (
                                    <button
                                        key={cat.id}
                                        className={`ifood-chip ${activeCategory === i ? 'active' : ''}`}
                                        onClick={() => scrollToCategory(i)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── PRODUCT LIST ── */}
                        <div
                            className="ifood-products-scroll"
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                        >
                            {loading ? (
                                <div className="ifood-loading">
                                    <div className="ifood-skeleton-card"></div>
                                    <div className="ifood-skeleton-card"></div>
                                    <div className="ifood-skeleton-card"></div>
                                    <div className="ifood-skeleton-card"></div>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="ifood-empty">
                                    <i className="fa-solid fa-utensils"></i>
                                    <p>Nenhum produto disponível no momento.</p>
                                </div>
                            ) : (
                                (() => {
                                    const pizzaCategoryIndex = categories.findIndex(c => 
                                        c.name.toLowerCase().includes('pizza') || 
                                        c.name.toLowerCase().includes('salgada') ||
                                        c.name.toLowerCase().includes('especial')
                                    );
                                    const targetIndex = pizzaCategoryIndex !== -1 ? pizzaCategoryIndex : 0;

                                    return categories.map((cat, catIndex) => (
                                        <div
                                            key={cat.id}
                                            ref={(el) => { categoryRefs.current[catIndex] = el; }}
                                            className="ifood-category-section"
                                        >
                                            <h3 className="ifood-category-title">{cat.name}</h3>

                                            {/* ── MONTE SUA PIZZA ── */}
                                            {catIndex === targetIndex && (
                                                <motion.div
                                                    className="ifood-monte-card"
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={openBuilder}
                                                >
                                                    <div className="ifood-monte-icon-wrap">
                                                        <div className="ifood-monte-pizza-icon">
                                                            <svg viewBox="0 0 100 100" width="60" height="60">
                                                                <circle cx="50" cy="50" r="45" fill="#c78d51" stroke="#8c531e" strokeWidth="4" />
                                                                <path d="M 50 50 L 50 5 A 45 45 0 0 1 88.97 72.5 Z" fill="#f5c842" opacity="0.9" />
                                                                <path d="M 50 50 L 88.97 72.5 A 45 45 0 0 1 11.03 72.5 Z" fill="#e8a830" opacity="0.9" />
                                                                <path d="M 50 50 L 11.03 72.5 A 45 45 0 0 1 50 5 Z" fill="#f0d060" opacity="0.9" />
                                                                <circle cx="35" cy="30" r="4" fill="#EA1D2C" opacity="0.7" />
                                                                <circle cx="65" cy="35" r="3" fill="#EA1D2C" opacity="0.6" />
                                                                <circle cx="55" cy="70" r="3.5" fill="#EA1D2C" opacity="0.7" />
                                                                <circle cx="30" cy="60" r="3" fill="#388E3C" opacity="0.6" />
                                                                <circle cx="70" cy="60" r="2.5" fill="#388E3C" opacity="0.6" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="ifood-monte-info">
                                                        <h4 className="ifood-monte-title">
                                                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                                                            Monte sua Pizza
                                                        </h4>
                                                        <p className="ifood-monte-sub">Escolha 2 ou 3 sabores e personalize como quiser</p>
                                                        <span className="ifood-monte-price">A partir de R$ 35,00</span>
                                                    </div>
                                                    <div className="ifood-monte-action">
                                                        <span className="ifood-monte-btn">Montar</span>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className="ifood-items-list">
                                                {cat.products.map((product) => (
                                                    <motion.div
                                                        key={product.id}
                                                        className="ifood-product-card"
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setDetailObs('');
                                                            if (crusts.length > 0) setDetailCrust(crusts[0]);
                                                        }}
                                                        whileTap={{ scale: 0.98 }}
                                                        layout
                                                    >
                                                        <div className="ifood-product-info">
                                                            <h4 className="ifood-product-name">{product.name}</h4>
                                                            <p className="ifood-product-desc">
                                                                {product.description || 'Deliciosa opção artesanal preparada com ingredientes selecionados.'}
                                                            </p>
                                                            <span className="ifood-product-price">
                                                                R$ {product.price.toFixed(2).replace('.', ',')}
                                                            </span>
                                                        </div>
                                                        <div className="ifood-product-action">
                                                            {product.image ? (
                                                                <div className="ifood-product-img" style={{ backgroundImage: `url(${product.image})` }}></div>
                                                            ) : (
                                                                <div className="ifood-product-img ifood-product-img-placeholder">
                                                                    <i className="fa-solid fa-pizza-slice"></i>
                                                                </div>
                                                            )}
                                                            <button
                                                                className="ifood-add-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const isPz = cat.name.toLowerCase().includes('pizza') || cat.name.toLowerCase().includes('salgada') || cat.name.toLowerCase().includes('doce') || cat.name.toLowerCase().includes('especial') || cat.name.toLowerCase().includes('tradicionai');
                                                                    if (isPz) {
                                                                        setSelectedProduct(product);
                                                                        setDetailObs('');
                                                                        if (crusts.length > 0) setDetailCrust(crusts[0]);
                                                                    } else {
                                                                        handleAddToCart(product);
                                                                    }
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-plus"></i>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                                })()
                            )}
                            <div style={{ height: '100px' }}></div>
                        </div>

                        {/* ── CART FOOTER BAR ── */}
                        {cartCount > 0 && (
                            <motion.button
                                className="ifood-cart-bar"
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                onClick={() => { setIsOpen(false); setTimeout(() => setIsCartOpen(true), 300); }}
                            >
                                <div className="ifood-cart-badge">{cartCount}</div>
                                <span className="ifood-cart-label">Ver carrinho</span>
                                <span className="ifood-cart-total">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </motion.button>
                        )}

                        {/* ── ADDED NOTIFICATION ── */}
                        <AnimatePresence>
                            {addedNotif && (
                                <motion.div
                                    className="ifood-added-toast"
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                >
                                    <i className="fa-solid fa-check-circle"></i>
                                    <span>{addedNotif} adicionado!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* ═══════════════════════════════════════════════════
                       PRODUCT DETAIL MODAL (Simple Products)
                       ═══════════════════════════════════════════════════ */}
                    <AnimatePresence>
                        {selectedProduct && (
                            <motion.div
                                className="ifood-detail-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedProduct(null)}
                            >
                                <motion.div
                                    className="ifood-detail-modal"
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="ifood-detail-hero">
                                        {selectedProduct.image ? (
                                            <img src={selectedProduct.image} alt={selectedProduct.name} />
                                        ) : (
                                            <div className="ifood-detail-placeholder">
                                                <i className="fa-solid fa-pizza-slice"></i>
                                            </div>
                                        )}
                                        <button className="ifood-detail-close" onClick={() => setSelectedProduct(null)}>
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                    <div className="ifood-detail-body">
                                        <h2 className="ifood-detail-name">{selectedProduct.name}</h2>
                                        <p className="ifood-detail-desc">
                                            {selectedProduct.description || 'Uma deliciosa opção artesanal da Nona Pizza, preparada com ingredientes frescos e selecionados.'}
                                        </p>
                                        <div className="ifood-detail-price-row">
                                            <span className="ifood-detail-price">
                                                R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>

                                        {isSelectedPizza && crusts.length > 0 && (
                                            <div className="ifood-builder-group mt-4" style={{ marginTop: '1.5rem' }}>
                                                <h4 className="ifood-builder-label">
                                                    <i className="fa-solid fa-circle-notch"></i> Escolha a borda
                                                </h4>
                                                <div className="ifood-crust-list">
                                                    {crusts.map(crust => (
                                                        <button
                                                            key={crust.id}
                                                            className={`ifood-crust-card ${detailCrust?.id === crust.id ? 'selected' : ''}`}
                                                            onClick={() => setDetailCrust(crust)}
                                                        >
                                                            <div className="ifood-crust-info">
                                                                <span className="ifood-crust-name">{crust.name}</span>
                                                                <span className="ifood-crust-price">
                                                                    {crust.price > 0
                                                                        ? `+ R$ ${crust.price.toFixed(2).replace('.', ',')}`
                                                                        : 'Inclusa'}
                                                                </span>
                                                            </div>
                                                            <div className={`ifood-flavor-check ${detailCrust?.id === crust.id ? 'checked' : ''}`}>
                                                                {detailCrust?.id === crust.id && <i className="fa-solid fa-check"></i>}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="ifood-builder-group mt-4" style={{ marginTop: '1.5rem' }}>
                                            <h4 className="ifood-builder-label">
                                                <i className="fa-solid fa-message"></i> Observações
                                            </h4>
                                            <textarea
                                                className="ifood-builder-obs"
                                                placeholder="Ex: Tirar cebola, mandar sachês, bem assada..."
                                                value={detailObs}
                                                onChange={(e) => setDetailObs(e.target.value)}
                                                rows={2}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="ifood-detail-footer">
                                        <button
                                            className="ifood-detail-add-btn"
                                            onClick={() => handleAddToCart(selectedProduct)}
                                        >
                                            <span>Adicionar</span>
                                            <span>
                                                R$ {(selectedProduct.price + (isSelectedPizza && detailCrust ? detailCrust.price : 0)).toFixed(2).replace('.', ',')}
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ═══════════════════════════════════════════════════
                       🍕 MONTE SUA PIZZA — FULL BUILDER MODAL
                       ═══════════════════════════════════════════════════ */}
                    <AnimatePresence>
                        {builderOpen && (
                            <motion.div
                                className="ifood-detail-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setBuilderOpen(false)}
                            >
                                <motion.div
                                    className="ifood-builder-modal"
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Builder Header */}
                                    <div className="ifood-builder-header">
                                        <button className="ifood-builder-back" onClick={() => {
                                            if (builderStep > 1) setBuilderStep(builderStep - 1);
                                            else setBuilderOpen(false);
                                        }}>
                                            <i className="fa-solid fa-arrow-left"></i>
                                        </button>
                                        <h3 className="ifood-builder-title">Monte sua Pizza</h3>
                                        <button className="ifood-close-btn" onClick={() => setBuilderOpen(false)}>
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>

                                    {/* Step Indicator */}
                                    <div className="ifood-steps-bar">
                                        {[1, 2, 3].map(s => (
                                            <div key={s} className={`ifood-step-dot ${builderStep >= s ? 'active' : ''}`}>
                                                <div className="ifood-step-num">{s}</div>
                                                <span>{s === 1 ? 'Tamanho' : s === 2 ? 'Sabores' : 'Finalizar'}</span>
                                            </div>
                                        ))}
                                        <div className="ifood-steps-line">
                                            <div className="ifood-steps-fill" style={{ width: `${((builderStep - 1) / 2) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Builder Body */}
                                    <div className="ifood-builder-body">

                                        {/* ── STEP 1: SIZE + FLAVOR COUNT ── */}
                                        {builderStep === 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="ifood-builder-section"
                                            >
                                                <div className="ifood-builder-group">
                                                    <h4 className="ifood-builder-label">
                                                        <i className="fa-solid fa-ruler"></i> Tamanho
                                                    </h4>
                                                    <div className="ifood-size-grid">
                                                        {sizes.map(sz => (
                                                            <button
                                                                key={sz.id}
                                                                className={`ifood-size-card ${selectedSize?.id === sz.id ? 'active' : ''}`}
                                                                onClick={() => setSelectedSize(sz)}
                                                            >
                                                                <div className="ifood-size-icon">
                                                                    <i className="fa-solid fa-pizza-slice"></i>
                                                                </div>
                                                                <span className="ifood-size-name">{sz.name}</span>
                                                                <span className="ifood-size-slices">{sz.maxSlices} fatias</span>
                                                                <span className="ifood-size-price">
                                                                    A partir de R$ {sz.price.toFixed(2).replace('.', ',')}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="ifood-builder-group">
                                                    <h4 className="ifood-builder-label">
                                                        <i className="fa-solid fa-layer-group"></i> Quantidade de Sabores
                                                    </h4>
                                                    <div className="ifood-flavor-count-row">
                                                        {[1, 2, 3].map(n => (
                                                            <button
                                                                key={n}
                                                                className={`ifood-count-btn ${flavorsCount === n ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    setFlavorsCount(n);
                                                                    setSelectedFlavors(prev => prev.slice(0, n));
                                                                }}
                                                            >
                                                                {n} {n === 1 ? 'sabor' : 'sabores'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    className="ifood-builder-next"
                                                    disabled={!selectedSize}
                                                    onClick={() => setBuilderStep(2)}
                                                >
                                                    Escolher sabores <i className="fa-solid fa-arrow-right"></i>
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* ── STEP 2: CHOOSE FLAVORS ── */}
                                        {builderStep === 2 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="ifood-builder-section"
                                            >
                                                <div className="ifood-flavor-header">
                                                    <h4 className="ifood-builder-label">
                                                        <i className="fa-solid fa-pizza-slice"></i> Escolha {flavorsCount} {flavorsCount === 1 ? 'sabor' : 'sabores'}
                                                    </h4>
                                                    <div className="ifood-flavor-counter">
                                                        <span className={selectedFlavors.length === flavorsCount ? 'complete' : ''}>
                                                            {selectedFlavors.length}/{flavorsCount}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="ifood-flavor-search">
                                                    <i className="fa-solid fa-search"></i>
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar sabor..."
                                                        value={flavorSearch}
                                                        onChange={(e) => setFlavorSearch(e.target.value)}
                                                    />
                                                </div>

                                                <div className="ifood-flavor-list">
                                                    {filteredFlavors.map(flavor => {
                                                        const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                                                        const isDisabled = !isSelected && selectedFlavors.length >= flavorsCount;
                                                        return (
                                                            <motion.button
                                                                key={flavor.id}
                                                                className={`ifood-flavor-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                                onClick={() => !isDisabled && toggleFlavor(flavor)}
                                                                whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                                                            >
                                                                <div className="ifood-flavor-img-wrap">
                                                                    {flavor.image ? (
                                                                        <img src={flavor.image} alt={flavor.name} />
                                                                    ) : (
                                                                        <div className="ifood-flavor-img-ph">
                                                                            <i className="fa-solid fa-pizza-slice"></i>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="ifood-flavor-info">
                                                                    <span className="ifood-flavor-name">{flavor.name}</span>
                                                                    <span className="ifood-flavor-desc">
                                                                        {flavor.description || 'Sabor artesanal'}
                                                                    </span>
                                                                    <span className="ifood-flavor-price">
                                                                        {flavor.price > 0
                                                                            ? `+ R$ ${flavor.price.toFixed(2).replace('.', ',')}`
                                                                            : 'Incluso'}
                                                                    </span>
                                                                </div>
                                                                <div className={`ifood-flavor-check ${isSelected ? 'checked' : ''}`}>
                                                                    {isSelected && <i className="fa-solid fa-check"></i>}
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>

                                                <button
                                                    className="ifood-builder-next"
                                                    disabled={selectedFlavors.length !== flavorsCount}
                                                    onClick={() => setBuilderStep(3)}
                                                >
                                                    Próximo <i className="fa-solid fa-arrow-right"></i>
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* ── STEP 3: CRUST + OBS + CONFIRM ── */}
                                        {builderStep === 3 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="ifood-builder-section"
                                            >
                                                {/* Crust */}
                                                <div className="ifood-builder-group">
                                                    <h4 className="ifood-builder-label">
                                                        <i className="fa-solid fa-circle-notch"></i> Borda
                                                    </h4>
                                                    <div className="ifood-crust-list">
                                                        {crusts.map(crust => (
                                                            <button
                                                                key={crust.id}
                                                                className={`ifood-crust-card ${selectedCrust?.id === crust.id ? 'selected' : ''}`}
                                                                onClick={() => setSelectedCrust(crust)}
                                                            >
                                                                <div className="ifood-crust-info">
                                                                    <span className="ifood-crust-name">{crust.name}</span>
                                                                    <span className="ifood-crust-price">
                                                                        {crust.price > 0
                                                                            ? `+ R$ ${crust.price.toFixed(2).replace('.', ',')}`
                                                                            : 'Inclusa'}
                                                                    </span>
                                                                </div>
                                                                <div className={`ifood-flavor-check ${selectedCrust?.id === crust.id ? 'checked' : ''}`}>
                                                                    {selectedCrust?.id === crust.id && <i className="fa-solid fa-check"></i>}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Observations */}
                                                <div className="ifood-builder-group">
                                                    <h4 className="ifood-builder-label">
                                                        <i className="fa-solid fa-message"></i> Observações
                                                    </h4>
                                                    <textarea
                                                        className="ifood-builder-obs"
                                                        placeholder="Ex: Sem cebola, bem assada, fatiar..."
                                                        value={pizzaObs}
                                                        onChange={(e) => setPizzaObs(e.target.value)}
                                                        rows={3}
                                                    ></textarea>
                                                </div>

                                                {/* Summary */}
                                                <div className="ifood-builder-summary">
                                                    <h4 className="ifood-summary-title">Resumo do pedido</h4>
                                                    <div className="ifood-summary-row">
                                                        <span>Tamanho {selectedSize?.name}</span>
                                                        <span>R$ {selectedSize?.price.toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                    {selectedFlavors.map((f, i) => (
                                                        <div key={f.id} className="ifood-summary-row">
                                                            <span>Sabor {i + 1}: {f.name}</span>
                                                            <span>{f.price > 0 ? `+ R$ ${f.price.toFixed(2).replace('.', ',')}` : 'Incluso'}</span>
                                                        </div>
                                                    ))}
                                                    {selectedCrust && (
                                                        <div className="ifood-summary-row">
                                                            <span>Borda {selectedCrust.name}</span>
                                                            <span>{selectedCrust.price > 0 ? `+ R$ ${selectedCrust.price.toFixed(2).replace('.', ',')}` : 'Inclusa'}</span>
                                                        </div>
                                                    )}
                                                    <div className="ifood-summary-row ifood-summary-total">
                                                        <span>Total</span>
                                                        <span>R$ {pizzaTotal.toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Builder Footer */}
                                    {builderStep === 3 && (
                                        <div className="ifood-builder-footer">
                                            <button
                                                className="ifood-detail-add-btn"
                                                disabled={!isPizzaComplete}
                                                onClick={handleAddPizzaToCart}
                                            >
                                                <span><i className="fa-solid fa-cart-shopping"></i> Adicionar</span>
                                                <span>R$ {pizzaTotal.toFixed(2).replace('.', ',')}</span>
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
