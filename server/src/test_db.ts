import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const sample = await prisma.billetera.findMany({ take: 10, orderBy: { fecha: 'desc' } });
  console.log('Sample dates:', sample.map((s: any) => ({ id: s.id, fecha: s.fecha.toISOString() })));

  const minDate = await prisma.billetera.findFirst({ orderBy: { fecha: 'asc' } });
  const maxDate = await prisma.billetera.findFirst({ orderBy: { fecha: 'desc' } });

  console.log('Min date in DB:', minDate?.fecha.toISOString());
  console.log('Max date in DB:', maxDate?.fecha.toISOString());

  const testFilter2025 = await prisma.billetera.findMany({
    where: {
      fecha: {
        gte: new Date('2025-01-01T00:00:00.000Z'),
        lte: new Date('2025-12-31T23:59:59.999Z')
      }
    }
  });
  console.log('Filtered 2025 count:', testFilter2025.length);

  const testFilter2026 = await prisma.billetera.findMany({
    where: {
      fecha: {
        gte: new Date('2026-01-01T00:00:00.000Z'),
        lte: new Date('2026-12-31T23:59:59.999Z')
      }
    }
  });
  console.log('Filtered 2026 count:', testFilter2026.length);
}

test().finally(() => prisma.$disconnect());
