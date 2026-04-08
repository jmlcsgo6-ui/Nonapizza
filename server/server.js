const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { neonConfig, Pool } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Configuração para ambientes Serverless (Vercel)
neonConfig.webSocketConstructor = ws;

const app = express();

app.use(express.json());

// Rota de teste ultra simples
app.get('/', (req, res) => {
    res.send('SERVER IS AWAKE! 🚀');
});

const JWT_SECRET = process.env.JWT_SECRET || 'nona_super_secret';

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, name: user.name });
});

// Middleware
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token ausente' });
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// --- Public Routes ---
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({ include: { products: true } });
        res.json(categories);
    } catch (error) {
        console.error("ERRO CATEGORIAS:", error);
        res.status(500).json({ error: "Erro ao buscar categorias", details: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    const products = await prisma.product.findMany({ include: { category: true } });
    res.json(products);
});

app.get('/api/ingredients', async (req, res) => {
    const ingredients = await prisma.ingredient.findMany();
    res.json(ingredients);
});

app.get('/api/crusts', async (req, res) => {
    const crusts = await prisma.crustOption.findMany();
    res.json(crusts);
});

app.get('/api/sizes', async (req, res) => {
    try {
        const sizes = await prisma.sizeOption.findMany();
        res.json(sizes);
    } catch (error) {
        console.error("ERRO DETALHADO BUSCA TAMANHOS:", error);
        res.status(500).json({ 
            error: "Erro ao buscar tamanhos", 
            message: error.message,
            code: error.code
        });
    }
});

app.post('/api/orders', async (req, res) => {
    const { customerName, address, payment, total, items } = req.body;
    const order = await prisma.order.create({
        data: {
            customerName, address, payment, total,
            items: {
                create: items.map(i => ({
                    productName: i.productName,
                    desc: i.desc,
                    price: i.price,
                    qty: i.qty,
                    obs: i.obs
                }))
            }
        },
        include: { items: true }
    });
    res.json(order);
});

// --- Admin Routes (Secured) ---
app.get('/api/admin/orders', authMiddleware, async (req, res) => {
    const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
    res.json(orders);
});

app.put('/api/admin/orders/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const order = await prisma.order.update({
        where: { id: parseInt(req.params.id) },
        data: { status }
    });
    res.json(order);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Nona Pizza Backend running on port ${PORT}`);
});

module.exports = app;
