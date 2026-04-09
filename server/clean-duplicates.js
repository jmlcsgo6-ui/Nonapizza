const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicates() {
    console.log('Limpando duplicatas...');
    
    // Pega todos os tamanhos
    const sizes = await prisma.sizeOption.findMany({ orderBy: { id: 'asc' } });
    console.log('Tamanhos encontrados:', sizes.length, sizes.map(s => `${s.id}:${s.name}`).join(', '));
    
    // Pega nomes únicos e mantém apenas o primeiro de cada
    const seen = new Set();
    const toDelete = [];
    for (const s of sizes) {
        if (seen.has(s.name)) {
            toDelete.push(s.id);
        } else {
            seen.add(s.name);
        }
    }
    
    if (toDelete.length > 0) {
        await prisma.sizeOption.deleteMany({ where: { id: { in: toDelete } } });
        console.log('Duplicatas removidas:', toDelete);
    } else {
        console.log('Sem duplicatas.');
    }
    
    const remaining = await prisma.sizeOption.findMany();
    console.log('Tamanhos restantes:', remaining.map(s => `${s.id}:${s.name}`).join(', '));
}

cleanDuplicates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
