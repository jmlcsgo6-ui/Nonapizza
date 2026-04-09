const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { neonConfig, Pool } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Configuração Serverless Neon
neonConfig.webSocketConstructor = ws;

const app = express();

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

let prisma;
if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    prisma = new PrismaClient({ 
        adapter,
        datasourceUrl: connectionString 
    });
} else {
    // Fallback para não quebrar o servidor na largada se a chave sumir
    prisma = new PrismaClient();
}

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
        res.send(`NONA SERVER ONLINE! Banco de dados conectado: ${sCount} tamanhos e ${cCount} categorias encontrados. 🍕🚀`);
    } catch (e) {
        res.send(`SERVER ONLINE mas ERRO DE BANCO: ${e.message}`);
    }
});

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.adminUser.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, name: user.name });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// --- Public Routes ---
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({ include: { products: true } });
        res.json(categories);
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({ include: { category: true } });
        res.json(products);
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/ingredients', async (req, res) => {
    try {
        const ingredients = await prisma.ingredient.findMany();
        res.json(ingredients);
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/crusts', async (req, res) => {
    try {
        const crusts = await prisma.crustOption.findMany();
        res.json(crusts);
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/sizes', async (req, res) => {
    try {
        const sizes = await prisma.sizeOption.findMany();
        res.json(sizes);
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, address, payment, total, items } = req.body;
        const order = await prisma.order.create({
            data: {
                customerName, address: address || 'Nao informado', payment: payment || 'Nao informado', total,
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
    } catch(e) { res.status(500).json({error: e.message}); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
