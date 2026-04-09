document.addEventListener('DOMContentLoaded', () => {
    // Header sticky transition
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
            header.classList.add('scrolled');
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.8)';
            header.style.boxShadow = 'none';
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Reveal on Scroll
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

    // Hero Background Animation scrubbed by scroll
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const context = canvas.getContext('2d');
        const frameCount = 144;
        const images = new Map(); // Use Map for better management
        const preloadedFrames = new Set();
        
        const currentFrame = index => `phhoto/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`;

        // Loading states
        let lastRenderedIndex = -1;
        let isPreloadingStarted = false;

        const preloadImage = (index) => {
            if (images.has(index) || preloadedFrames.has(index)) return Promise.resolve(images.get(index));
            
            return new Promise((resolve) => {
                const img = new Image();
                img.src = currentFrame(index);
                img.onload = () => {
                    images.set(index, img);
                    preloadedFrames.add(index);
                    resolve(img);
                };
            });
        };

        // Initial Batches (First 10 frames + key frames)
        const initAnimation = async () => {
            await preloadImage(0); // Load first frame FAST
            resizeCanvas();
            renderFrame(0);
            
            // Progressive preload of first batch
            for (let i = 1; i < 20; i++) {
                preloadImage(i);
            }
        };

        const renderFrame = (index) => {
            if (index === lastRenderedIndex) return;
            
            const img = images.get(index);
            if (img && img.complete) {
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;
                let renderWidth, renderHeight, x, y;

                if (canvasAspect > imgAspect) {
                    renderWidth = canvas.width;
                    renderHeight = canvas.width / imgAspect;
                    x = 0;
                    y = (canvas.height - renderHeight) / 2;
                } else {
                    renderHeight = canvas.height;
                    renderWidth = canvas.height * imgAspect;
                    y = 0;
                    const focusX = window.innerWidth <= 768 ? 0.75 : 0.5;
                    x = (canvas.width * 0.5) - (renderWidth * focusX);
                    x = Math.max(canvas.width - renderWidth, Math.min(0, x));
                }

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, x, y, renderWidth, renderHeight);
                lastRenderedIndex = index;
            } else {
                // If frame not ready, load it and surrounding frames
                preloadImage(index).then(() => renderFrame(index));
                // Predict direction and load neighbor frames
                for(let i=1; i<=5; i++) {
                    if(index+i < frameCount) preloadImage(index+i);
                    if(index-i >= 0) preloadImage(index-i);
                }
            }
        };

        const wrapper = document.querySelector('.hero-wrapper');
        let scrollTicking = false;

        const handleScroll = () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    if (wrapper) {
                        const scrollTop = window.scrollY;
                        const startScroll = wrapper.offsetTop; 
                        const maxScroll = wrapper.offsetHeight - window.innerHeight; 
                        
                        let scrollFraction = (scrollTop - startScroll) / maxScroll;
                        scrollFraction = Math.max(0, Math.min(1, scrollFraction));

                        const frameIndex = Math.floor(scrollFraction * (frameCount - 1));
                        renderFrame(frameIndex);
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            handleScroll();
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        initAnimation();
    }

    // --- MENU & CART SYSTEM ---
    const menuData = [
        { id: 1, category: 'tradicionais', name: 'Calabresa com Cebola', desc: 'Calabresa artesanal finamente fatiada, cebola roxa e orégano.', price: 50.90 },
        { id: 2, category: 'tradicionais', name: 'Marguerita', desc: 'Molho pelati, mozzarella de búfala fresca e manjericão abundante.', price: 54.90 },
        { id: 3, category: 'tradicionais', name: 'Frango com Catupiry', desc: 'Frango desfiado temperado com especiarias e verdadeiro Catupiry.', price: 54.90 },
        { id: 4, category: 'especiais', name: '5 Queijos', desc: 'Mozzarella, provolone, gorgonzola, parmesão e Catupiry original.', price: 61.00 },
        { id: 5, category: 'especiais', name: 'Pepperoni Artesanal', desc: 'Pepperoni curado e mozzarela especial com toque de mel picante.', price: 72.00 },
        { id: 6, category: 'especiais', name: 'Parma & Rúcula', desc: 'Presunto de Parma D.O.P., rúcula selvagem e lascas de grana padano.', price: 89.00 },
        { id: 7, category: 'doces', name: 'Chocolate Premium', desc: 'Ganache de chocolate belga, morangos frescos e raspas de chocolate branco.', price: 54.90 },
        { id: 8, category: 'doces', name: 'Doce de Leite com Nozes', desc: 'Doce de leite argentino cremoso artesanal coberto com nozes pecã.', price: 59.90 },
        { id: 9, category: 'bebidas', name: 'Coca-Cola 2L', desc: 'Refrigerante gelado para acompanhar.', price: 13.90 },
        { id: 10, category: 'bebidas', name: 'Heineken Long Neck', desc: 'Cerveja premium super gelada.', price: 12.00 }
    ];

    let cart = [];
    let currentCategory = 'tradicionais';
    const FRETE_GRATIS_TARGET = 150.00;

    // Elements
    const menuContainer = document.getElementById('menu-container');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // Modals
    const productModal = document.getElementById('product-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const cartDrawer = document.getElementById('cart-drawer');
    
    // Buttons
    const mobileCartBtn = document.getElementById('mobile-cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const openCheckoutBtn = document.getElementById('checkout-btn');
    const closeCheckoutBtns = document.querySelectorAll('.close-checkout');
    
    // Product Modal Elements
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const qtyValue = document.getElementById('qty-value');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const modalPrice = document.getElementById('modal-price');
    const modalObs = document.getElementById('modal-obs');
    
    let currentProduct = null;
    let currentQty = 1;

    // Render Menu
    const renderMenu = (category) => {
        if (!menuContainer) return;
        
        // Exibir Skeletons
        menuContainer.innerHTML = '';
        for(let i=0; i<4; i++) {
            menuContainer.innerHTML += `<div class="menu-item skeleton" style="border:none"></div>`;
        }
        
        setTimeout(() => {
            menuContainer.innerHTML = '';
            const filtered = menuData.filter(item => item.category === category);
            
            filtered.forEach(item => {
                const el = document.createElement('div');
                el.className = 'menu-item';
                el.style.animation = 'popIn 0.4s ease forwards';
                el.style.opacity = '0';
                
                el.innerHTML = `
                    <div class="menu-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.desc}</p>
                        <span class="price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button class="btn btn-primary btn-sm hover-scale" onclick="openProductModal(${item.id})">Pedir</button>
                `;
                menuContainer.appendChild(el);
            });
        }, 600); // 600ms de carregamento simulado
    };

    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderMenu(currentCategory);
        });
    });

    const menuModal = document.getElementById('full-menu-modal');
    document.querySelectorAll('#card-ver-cardapio').forEach(btn => {
        if(btn) btn.addEventListener('click', () => {
            menuModal.classList.add('active');
            renderMenu(currentCategory); 
        });
    });
    
    const closeMenuBtn = document.getElementById('close-menu-modal');
    if(closeMenuBtn) closeMenuBtn.addEventListener('click', () => {
        menuModal.classList.remove('active');
    });

    // Modal Logic
    window.openProductModal = (id) => {
        currentProduct = menuData.find(i => i.id === id);
        if (!currentProduct) return;
        
        document.getElementById('modal-product-name').innerText = currentProduct.name;
        document.getElementById('modal-product-desc').innerText = currentProduct.desc;
        currentQty = 1;
        qtyValue.innerText = currentQty;
        modalObs.value = '';
        updateModalPrice();
        
        productModal.classList.add('active');
    };

    const updateModalPrice = () => {
        const total = currentProduct.price * currentQty;
        modalPrice.innerText = total.toFixed(2).replace('.', ',');
    };

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.classList.remove('active');
        });
    });

    if (qtyMinus) qtyMinus.addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            qtyValue.innerText = currentQty;
            updateModalPrice();
        }
    });

    if (qtyPlus) qtyPlus.addEventListener('click', () => {
        currentQty++;
        qtyValue.innerText = currentQty;
        updateModalPrice();
    });

    if (addToCartBtn) addToCartBtn.addEventListener('click', () => {
        const originalText = addToCartBtn.innerHTML;
        addToCartBtn.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado';
        addToCartBtn.classList.add('btn-anim-check');
        
        setTimeout(() => {
            cart.push({
                id: Date.now(),
                product: currentProduct,
                qty: currentQty,
                obs: modalObs.value
            });
            productModal.classList.remove('active');
            updateCartUI();
            
            if(mobileCartBtn && !cartDrawer.classList.contains('open')) {
                const mcbQty = document.getElementById('mcb-qty');
                mcbQty.classList.remove('pulse-badge');
                void mcbQty.offsetWidth; // reflow
                mcbQty.classList.add('pulse-badge');
            }
            
            addToCartBtn.innerHTML = originalText;
            addToCartBtn.classList.remove('btn-anim-check');
        }, 500);
    });

    // Cart Logic
    const toggleCart = () => cartDrawer.classList.toggle('open');
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
    }

    const updateCartUI = () => {
        const container = document.getElementById('cart-items-container');
        if (!container) return;
        container.innerHTML = '';
        
        let total = 0;
        let itemsCount = 0;

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart-msg">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"><i class="fa-solid fa-basket-shopping"></i></div>
                    <p>Seu carrinho está vazio.</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-muted);">Que tal começar com uma deliciosa Calabresa?</p>
                    <button class="btn btn-primary btn-sm mt-2" onclick="document.getElementById('card-ver-cardapio').click()">Ver Cardápio</button>
                </div>
            `;
        } else {
            cart.forEach(item => {
                const itemTotal = item.product.price * item.qty;
                total += itemTotal;
                itemsCount += item.qty;

                const tr = document.createElement('div');
                tr.className = 'cart-item';
                tr.innerHTML = `
                    <div class="ci-info">
                        <h5>${item.qty}x ${item.product.name}</h5>
                        ${item.obs ? `<p>Obs: ${item.obs}</p>` : ''}
                        <div class="ci-price">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <button class="ci-remove" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
                `;
                container.appendChild(tr);
            });
        }

        document.getElementById('cart-total-price').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
        document.getElementById('mcb-qty').innerText = itemsCount;
        document.getElementById('checkout-total').innerText = total.toFixed(2).replace('.', ',');

        // Frete progress
        const freteFill = document.getElementById('frete-progress');
        const freteText = document.getElementById('frete-text');
        
        if (total >= FRETE_GRATIS_TARGET) {
            if (freteFill) freteFill.style.width = '100%';
            if (freteText) {
                freteText.innerText = 'Você ganhou frete grátis! 🎉';
                freteText.style.color = '#4cd964';
            }
        } else {
            const diff = FRETE_GRATIS_TARGET - total;
            const pct = (total / FRETE_GRATIS_TARGET) * 100;
            if (freteFill) freteFill.style.width = `${pct}%`;
            if (freteText) {
                freteText.innerText = `Faltam R$ ${diff.toFixed(2).replace('.', ',')} para frete grátis`;
                freteText.style.color = 'var(--primary)';
            }
        }

        if (itemsCount > 0) {
            if (mobileCartBtn) mobileCartBtn.classList.add('visible');
        } else {
            if (mobileCartBtn) mobileCartBtn.classList.remove('visible');
        }
    };

    window.removeFromCart = (cartItemId) => {
        cart = cart.filter(i => i.id !== cartItemId);
        updateCartUI();
    };

    // Checkout Logic
    if (openCheckoutBtn) {
        openCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return alert('Adicione itens ao carrinho primeiro!');
            cartDrawer.classList.remove('open');
            checkoutModal.classList.add('active');
        });
    }

    if (closeCheckoutBtns) {
        closeCheckoutBtns.forEach(btn => btn.addEventListener('click', () => checkoutModal.classList.remove('active')));
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            checkoutForm.style.display = 'none';
            const fx = document.getElementById('order-success-fx');
            if(fx) fx.style.display = 'block';
            
            setTimeout(() => {
                cart = [];
                updateCartUI();
                checkoutModal.classList.remove('active');
                checkoutForm.style.display = 'block';
                fx.style.display = 'none';
            }, 3500);
        });
    }

    // Init App
    renderMenu('tradicionais');
    updateCartUI();

    // --- PIZZA BUILDER SYSTEM ---
    const sizesConfig = [
        { id: 'pequena', name: 'Pequena', fatias: 4, desc: '25cm', basePrice: 40 },
        { id: 'media', name: 'Média', fatias: 6, desc: '30cm', basePrice: 50 },
        { id: 'grande', name: 'Grande', fatias: 8, desc: '35cm', basePrice: 60 }
    ];
    
    const crustsConfig = [
        { id: 'tradicional', name: 'Tradicional', price: 0 },
        { id: 'catupiry', name: 'Catupiry Original', price: 10 },
        { id: 'cheddar', name: 'Cheddar Cremoso', price: 10 },
        { id: 'chocolate', name: 'Chocolate ao Leite', price: 15 }
    ];
    
    let bState = {
        size: null,
        flavorsCount: 1,
        flavors: [],
        crust: crustsConfig[0],
        obs: ''
    };
    
    let currentSliceIdx = null;
    let selectingType = 'flavor';
    
    const builderOverlay = document.getElementById('pizza-builder-overlay');
    const bStep1 = document.getElementById('builder-step-1');
    const bStep2 = document.getElementById('builder-step-2');
    const bSizesContainer = document.getElementById('builder-sizes');
    const fcValue = document.getElementById('fc-value');
    const btnNextStep = document.getElementById('btn-next-step');
    const optionsDrawer = document.getElementById('options-drawer');
    const optionsSearch = document.getElementById('options-search');
    const optionsList = document.getElementById('options-list-container');
    const optionsDrawerTitle = document.getElementById('options-drawer-title');
    
    document.querySelectorAll('#btn-monte-sua-pizza-final, #card-monte-pizza').forEach(btn => {
        if(btn) btn.addEventListener('click', () => {
            resetBuilder();
            builderOverlay.classList.add('active');
        });
    });
    
    document.getElementById('close-builder').addEventListener('click', () => {
        builderOverlay.classList.remove('active');
    });

    document.getElementById('close-options-drawer').addEventListener('click', () => {
        optionsDrawer.classList.remove('open');
    });

    // Step 1 Logic
    const initBuilderStep1 = () => {
        if(!bSizesContainer) return;
        bSizesContainer.innerHTML = '';
        sizesConfig.forEach(sz => {
            const el = document.createElement('div');
            el.className = `size-card ${bState.size?.id === sz.id ? 'active' : ''}`;
            el.innerHTML = `
                <div class="size-icon"><i class="fa-solid fa-pizza-slice"></i></div>
                <h5>${sz.name}</h5>
                <p>${sz.fatias} fatias (${sz.desc})</p>
                <p class="mt-2 text-primary" style="color: var(--primary);">A partir de R$ ${sz.basePrice.toFixed(2).replace('.',',')}</p>
            `;
            el.addEventListener('click', () => {
                bState.size = sz;
                initBuilderStep1();
                validateStep1();
            });
            bSizesContainer.appendChild(el);
        });
        if(fcValue) fcValue.innerText = bState.flavorsCount;
    };
    
    document.getElementById('fc-minus').addEventListener('click', () => {
        if(bState.flavorsCount > 1) { bState.flavorsCount--; initBuilderStep1(); validateStep1(); }
    });
    document.getElementById('fc-plus').addEventListener('click', () => {
        if(bState.flavorsCount < 3) { bState.flavorsCount++; initBuilderStep1(); validateStep1(); }
    });
    
    const validateStep1 = () => {
        btnNextStep.disabled = !bState.size;
    };
    
    btnNextStep.addEventListener('click', () => {
        bStep1.classList.remove('active');
        bStep1.classList.add('slide-left');
        bStep2.classList.add('active');
        initBuilderStep2();
    });
    
    document.getElementById('btn-prev-step').addEventListener('click', () => {
        bStep2.classList.remove('active');
        bStep1.classList.remove('slide-left');
        bStep1.classList.add('active');
    });
    
    const resetBuilder = () => {
        bState = { size: null, flavorsCount: 1, flavors: [], crust: crustsConfig[0], obs: '' };
        bStep2.classList.remove('active');
        bStep1.classList.remove('slide-left');
        bStep1.classList.add('active');
        document.getElementById('builder-obs').value = '';
        initBuilderStep1();
        validateStep1();
    };

    // Step 2 Logic & SVG
    const getCoordinatesForPercent = (percent) => {
        const radius = 190;
        const center = 200;
        const x = center + radius * Math.cos(2 * Math.PI * percent - Math.PI/2);
        const y = center + radius * Math.sin(2 * Math.PI * percent - Math.PI/2);
        return [x, y];
    };

    const drawPizzaSVG = () => {
        const container = document.getElementById('pizza-svg-container');
        if(!container) return;
        container.innerHTML = '';
        
        const count = bState.flavorsCount;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 400 400');
        
        if(bState.flavors.length !== count) {
            bState.flavors = Array(count).fill(null);
        }
        
        for(let i=0; i<count; i++) {
            const defaultText = `Sabor ${i+1}`;
            const isSelected = !!bState.flavors[i];
            const textContent = isSelected ? bState.flavors[i].name : defaultText;
            
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            if (count === 1) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', 200);
                circle.setAttribute('cy', 200);
                circle.setAttribute('r', 190);
                circle.setAttribute('class', `pizza-slice ${isSelected ? 'has-flavor' : ''}`);
                
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', 200);
                text.setAttribute('y', 200);
                text.setAttribute('class', 'slice-text');
                text.textContent = textContent;
                
                g.appendChild(circle);
                g.appendChild(text);
            } else {
                const startPercent = i / count;
                const endPercent = (i + 1) / count;
                const [startX, startY] = getCoordinatesForPercent(startPercent);
                const [endX, endY] = getCoordinatesForPercent(endPercent);
                const largeArcFlag = 0;
                
                const pathData = [
                    `M 200 200`,
                    `L ${startX} ${startY}`,
                    `A 190 190 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                    `L 200 200`
                ].join(' ');
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('class', `pizza-slice ${isSelected ? 'has-flavor' : ''}`);
                
                const midPercent = (startPercent + endPercent) / 2;
                const textRadius = 110;
                const textX = 200 + textRadius * Math.cos(2 * Math.PI * midPercent - Math.PI/2);
                const textY = 200 + textRadius * Math.sin(2 * Math.PI * midPercent - Math.PI/2);
                
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', textX);
                text.setAttribute('y', textY);
                text.setAttribute('class', 'slice-text');
                const shortText = textContent.length > 15 ? textContent.substring(0, 15) + '...' : textContent;
                text.textContent = shortText;
                
                g.appendChild(path);
                g.appendChild(text);
            }
            
            g.addEventListener('click', () => {
                currentSliceIdx = i;
                selectingType = 'flavor';
                optionsDrawerTitle.innerText = `Sabor para pedaço ${i+1}`;
                if(document.getElementById('options-search-container')) document.getElementById('options-search-container').style.display = 'block';
                renderOptionsDrawer();
                optionsDrawer.classList.add('open');
            });
            
            svg.appendChild(g);
        }
        
        container.appendChild(svg);
    };
    
    const updateBuilderSummary = () => {
        const list = document.getElementById('builder-summary-list');
        list.innerHTML = `<li><span>Tamanho ${bState.size.name}</span><span>R$ ${bState.size.basePrice.toFixed(2).replace('.',',')}</span></li>`;
        
        let total = bState.size.basePrice;
        let diffItemsTotal = 0;
        let validFlavorsCount = 0;
        
        bState.flavors.forEach((f, idx) => {
            if(f) {
                validFlavorsCount++;
                let extra = Math.max(0, f.price - 50);
                let proportionalExtra = extra / bState.flavorsCount;
                
                diffItemsTotal += proportionalExtra;
                list.innerHTML += `<li><span style="color:var(--text-muted); font-size:0.85rem">- Sabor ${idx+1}: ${f.name}</span><span>+ R$ ${proportionalExtra.toFixed(2).replace('.',',')}</span></li>`;
            } else {
                list.innerHTML += `<li><span style="color:var(--text-muted); font-size:0.85rem">- Sabor ${idx+1}: Pendente...</span><span></span></li>`;
            }
        });
        total += diffItemsTotal;
        
        if (bState.crust) {
            total += bState.crust.price;
            if(bState.crust.price > 0) {
                list.innerHTML += `<li><span>Borda ${bState.crust.name}</span><span>+ R$ ${bState.crust.price.toFixed(2).replace('.',',')}</span></li>`;
            } else {
                list.innerHTML += `<li><span>Borda ${bState.crust.name}</span><span>Inclusa</span></li>`;
            }
        }
        
        document.getElementById('builder-total-price').innerText = `R$ ${total.toFixed(2).replace('.',',')}`;
        document.getElementById('btn-add-custom-pizza').disabled = validFlavorsCount < bState.flavorsCount;
        return total;
    };
    
    const initBuilderStep2 = () => {
        document.getElementById('selected-crust-name').innerText = bState.crust.name;
        drawPizzaSVG();
        updateBuilderSummary();
    };
    
    document.getElementById('btn-select-crust').addEventListener('click', () => {
        selectingType = 'crust';
        optionsDrawerTitle.innerText = "Escolha sua borda";
        if(document.getElementById('options-search-container')) document.getElementById('options-search-container').style.display = 'none';
        renderOptionsDrawer();
        optionsDrawer.classList.add('open');
    });
    
    const renderOptionsDrawer = (filter = '') => {
        optionsList.innerHTML = '';
        if (selectingType === 'flavor') {
            const pizzaFlavors = menuData.filter(m => m.category === 'tradicionais' || m.category === 'especiais' || m.category === 'doces');
            const filtered = filter ? pizzaFlavors.filter(f => f.name.toLowerCase().includes(filter.toLowerCase())) : pizzaFlavors;
            
            filtered.forEach(f => {
                const el = document.createElement('div');
                el.className = 'option-item';
                let extra = Math.max(0, f.price - 50);
                let proportionalExtra = extra / bState.flavorsCount;
                
                el.innerHTML = `
                    <div class="option-item-info">
                        <h5>${f.name}</h5>
                        <p>${f.desc}</p>
                    </div>
                    <div class="option-price">${proportionalExtra > 0 ? '+ R$ '+proportionalExtra.toFixed(2).replace('.',',') : 'Incluso'}</div>
                `;
                el.addEventListener('click', () => {
                    bState.flavors[currentSliceIdx] = f;
                    optionsDrawer.classList.remove('open');
                    initBuilderStep2();
                });
                optionsList.appendChild(el);
            });
        } else if (selectingType === 'crust') {
            crustsConfig.forEach(c => {
                const el = document.createElement('div');
                el.className = 'option-item';
                el.innerHTML = `
                    <div class="option-item-info">
                        <h5>${c.name}</h5>
                    </div>
                    <div class="option-price">${c.price > 0 ? '+ R$ '+c.price.toFixed(2).replace('.',',') : 'Grátis'}</div>
                `;
                el.addEventListener('click', () => {
                    bState.crust = c;
                    document.getElementById('selected-crust-name').innerText = c.name;
                    optionsDrawer.classList.remove('open');
                    initBuilderStep2();
                });
                optionsList.appendChild(el);
            });
        }
    };
    
    optionsSearch.addEventListener('input', (e) => {
        renderOptionsDrawer(e.target.value);
    });
    
    const btnAddCustom = document.getElementById('btn-add-custom-pizza');
    btnAddCustom.addEventListener('click', () => {
        const originalHTML = btnAddCustom.innerHTML;
        btnAddCustom.innerHTML = '<i class="fa-solid fa-check"></i> Montada e Adicionada';
        btnAddCustom.classList.add('btn-anim-check');
        
        setTimeout(() => {
            const t = updateBuilderSummary();
            const customProduct = {
                id: 'custom-' + Date.now(),
                name: `Pizza ${bState.size.name} Personalizada`,
                desc: bState.flavors.map(f => f.name).join(' / ') + ` | Borda: ${bState.crust.name}`,
                price: t
            };
            
            cart.push({
                id: Date.now(),
                product: customProduct,
                qty: 1,
                obs: document.getElementById('builder-obs').value
            });
            
            builderOverlay.classList.remove('active');
            updateCartUI();
            
            if(mobileCartBtn && !cartDrawer.classList.contains('open')) {
                const mcbQty = document.getElementById('mcb-qty');
                mcbQty.classList.remove('pulse-badge');
                void mcbQty.offsetWidth;
                mcbQty.classList.add('pulse-badge');
            }
            
            btnAddCustom.innerHTML = originalHTML;
            btnAddCustom.classList.remove('btn-anim-check');
            
            // Optionally open cart drawer automatically, but maybe better to omit to let user see pulse feedback
            // document.getElementById('cart-drawer').classList.add('open');
        }, 500);
    });

});
