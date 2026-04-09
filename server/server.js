const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Prisma lê DATABASE_URL automaticamente das variáveis de ambiente do Vercel
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'nona_super_secret';

// Middleware de Auth
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

// --- Rota de Diagnóstico ---
app.get('/', async (req, res) => {
    try {
        const sCount = await prisma.sizeOption.count();
        const cCount = await prisma.category.count();
        res.send(`NONA SERVER ONLINE! ${sCount} tamanhos e ${cCount} categorias no banco. 🍕`);
    } catch (e) {
        res.send(`SERVER ONLINE mas ERRO DE BANCO: ${e.message}`);
    }
});

// --- Auth Admin ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.adminUser.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });
        const token = jwt.sign({ id: user.id, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, name: user.name });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// --- Auth Customer (Login do Site) ---
app.post('/api/customer/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashed, phone }
        });
        const token = jwt.sign({ id: user.id, role: 'USER' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, name: user.name });
    } catch(e) { res.status(400).json({ error: 'Email já cadastrado' }); }
});

app.post('/api/customer/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Senha incorreta' });
        const token = jwt.sign({ id: user.id, role: 'USER' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, name: user.name });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- Public Routes ---
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({ include: { products: true } });
        res.json(categories);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({ include: { category: true } });
        res.json(products);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/ingredients', async (req, res) => {
    try {
        const ingredients = await prisma.ingredient.findMany();
        res.json(ingredients);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/crusts', async (req, res) => {
    try {
        const crusts = await prisma.crustOption.findMany();
        res.json(crusts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/sizes', async (req, res) => {
    try {
        const sizes = await prisma.sizeOption.findMany();
        res.json(sizes);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, phone, address, payment, total, items, userId } = req.body;
        const order = await prisma.order.create({
            data: {
                userId: userId || null,
                customerName,
                phone: phone || null,
                address: address || 'Nao informado',
                payment: payment || 'Nao informado',
                total,
                items: {
                    create: items.map(i => ({
                        productName: i.productName,
                        desc: i.desc || '',
                        price: i.price,
                        qty: i.qty,
                        obs: i.obs || ''
                    }))
                }
            },
            include: { items: true }
        });
        res.json(order);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/customer/orders', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const orders = await prisma.order.findMany({
            where: { userId: decoded.id },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch(e) { res.status(401).json({ error: 'Sessão expirada' }); }
});

// --- Tracking Routes (Public) ---
app.get('/api/track/:id', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { items: true }
        });
        if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
        res.json(order);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/track/phone/:phone', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { phone: req.params.phone },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        res.json(orders);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Admin ---
app.get('/api/admin/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
        res.json(orders);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/orders/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(order);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
