const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Categories
    const catTradicionais = await prisma.category.create({ data: { name: 'Tradicionais', desc: 'Clássicos atemporais perfeitos para qualquer ocasião' } });
    const catEspeciais = await prisma.category.create({ data: { name: 'Especiais', desc: 'Receitas exclusivas da nossa cozinha' } });
    const catDoces = await prisma.category.create({ data: { name: 'Doces', desc: 'O final perfeito para sua refeição' } });
    const catBebidas = await prisma.category.create({ data: { name: 'Bebidas', desc: 'Para acompanhar' } });

    // 2. Products
    const products = [
        { name: 'Margherita', desc: 'Molho de tomate fresco, mussarela, manjericão, azeite extra virgem.', price: 44.90, categoryId: catTradicionais.id },
        { name: 'Calabresa com Cebola', desc: 'Molho de tomate fresco, mussarela, calabresa artesanal, cebola roxa.', price: 46.90, categoryId: catTradicionais.id },
        { name: 'Frango com Catupiry', desc: 'Molho de tomate, frango desfiado temperado, legítimo Catupiry.', price: 48.90, categoryId: catTradicionais.id },
        { name: 'Parma e Rúcula', desc: 'Molho, mussarela de búfala, presunto parma, rúcula fresca, parmesão.', price: 62.90, categoryId: catEspeciais.id },
        { name: 'Trufada Gourmet', desc: 'Mussarela, azeite trufado, mix de cogumelos frescos.', price: 65.90, categoryId: catEspeciais.id },
        { name: 'Morango com Nutella', desc: 'Delicioso creme de leite ninho, Nutella original e morangos frescos.', price: 54.90, categoryId: catDoces.id },
        { name: 'Coca-Cola 2L', desc: 'Refrigerante 2 Litros.', price: 12.00, categoryId: catBebidas.id },
    ];
    for(const p of products) {
        await prisma.product.create({ data: p });
    }

    // 3. Flavors (Ingredients)
    const flavors = [
        { name: 'Calabresa com Cebola', price: 0.45 },
        { name: '4 Queijos', price: 2.30 },
        { name: '5 Queijos', price: 5.50 },
        { name: 'Marguerita', price: 1.63 },
        { name: 'Frango com Catupiry', price: 3.50 },
        { name: 'Parma com Rúcula', price: 12.00 },
        { name: 'Morango e Nutella', price: 8.50 },
        { name: 'Portuguesa', price: 4.20 },
        { name: 'Pepperoni', price: 6.80 },
        { name: 'Abobrinha com Gorgonzola', price: 5.00 }
    ];
    for (const f of flavors) {
        await prisma.ingredient.create({ data: f });
    }

    // 4. Crusts
    const crusts = [
        { name: 'Tradicional', price: 0.00 },
        { name: 'Fina', price: 0.00 },
        { name: 'Grossa', price: 0.00 },
        { name: 'Catupiry Original', price: 15.00 },
        { name: 'Cheddar Premium', price: 18.00 },
        { name: 'Cream Cheese e Alho', price: 22.00 }
    ];
    for (const c of crusts) {
        await prisma.crustOption.create({ data: c });
    }

    // 5. Sizes
    const sizes = [
        { name: 'Pequena', minSlices: 1, maxSlices: 2, price: 35.00 },
        { name: 'Média', minSlices: 1, maxSlices: 3, price: 50.00 },
        { name: 'Grande', minSlices: 1, maxSlices: 3, price: 60.00 }
    ];
    for (const s of sizes) {
        await prisma.sizeOption.create({ data: s });
    }

    // 6. Admin User
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.create({
        data: {
            name: 'Administrador Nona',
            email: 'admin@nona.com',
            password: hash
        }
    });

    console.log('Database seeded perfectly!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
