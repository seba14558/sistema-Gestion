import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.post('/tarjeta', requireAdmin, async (req, res) => {
  try {
    const { fecha, medio, monto } = req.body;
    const [year, month, day] = fecha.split('-').map(Number);
    const record = await prisma.tarjeta.create({
      data: { fecha: new Date(year, month - 1, day), medio, monto: Number(monto) }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tarjeta record' });
  }
});

router.post('/billetera', requireAdmin, async (req, res) => {
  try {
    const { fecha, medio, monto } = req.body;
    const [year, month, day] = fecha.split('-').map(Number);
    const record = await prisma.billetera.create({
      data: { fecha: new Date(year, month - 1, day), medio, monto: Number(monto) }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create billetera record' });
  }
});

router.post('/efectivo', requireAdmin, async (req, res) => {
  try {
    const { fecha, medio, monto } = req.body;
    const [year, month, day] = fecha.split('-').map(Number);
    const record = await prisma.efectivo.create({
      data: { fecha: new Date(year, month - 1, day), medio, monto: Number(monto) }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create efectivo record' });
  }
});

router.get('/resumen', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ error: 'mes and anio are required' });
    }

    const month = parseInt(mes as string) - 1;
    const year = parseInt(anio as string);
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const whereClause = {
      fecha: {
        gte: startDate,
        lte: endDate
      }
    };

    const [tarjetas, billeteras, efectivo] = await Promise.all([
      prisma.tarjeta.findMany({ where: whereClause }),
      prisma.billetera.findMany({ where: whereClause }),
      prisma.efectivo.findMany({ where: whereClause })
    ]);

    let totalTarjetas = 0;
    let totalBilleteras = 0;
    let totalEfectivo = 0;

    const ventasPorDiaMap: Record<string, {tarjetas: number, billeteras: number, efectivo: number, fecha: string}> = {};
    const facturacionDiariaMap: Record<string, number> = {};
    
    const topeBilleteras: Record<string, {total: number, operaciones: number}> = {};

    // Process Tarjetas
    for (const t of tarjetas) {
      totalTarjetas += t.monto;
      const dateStr = t.fecha.toISOString().split('T')[0];
      if (!ventasPorDiaMap[dateStr]) ventasPorDiaMap[dateStr] = {fecha: dateStr, tarjetas: 0, billeteras: 0, efectivo: 0};
      ventasPorDiaMap[dateStr].tarjetas += t.monto;
      
      facturacionDiariaMap[dateStr] = (facturacionDiariaMap[dateStr] || 0) + t.monto;
    }

    // Process Billeteras
    for (const b of billeteras) {
      totalBilleteras += b.monto;
      const dateStr = b.fecha.toISOString().split('T')[0];
      if (!ventasPorDiaMap[dateStr]) ventasPorDiaMap[dateStr] = {fecha: dateStr, tarjetas: 0, billeteras: 0, efectivo: 0};
      ventasPorDiaMap[dateStr].billeteras += b.monto;
      
      facturacionDiariaMap[dateStr] = (facturacionDiariaMap[dateStr] || 0) + b.monto;
      
      const key = b.medio || 'Otro';
      if (!topeBilleteras[key]) topeBilleteras[key] = { total: 0, operaciones: 0 };
      topeBilleteras[key].total += b.monto;
      topeBilleteras[key].operaciones += 1;
    }

    // Process Efectivo
    for (const e of efectivo) {
      totalEfectivo += e.monto;
      const dateStr = e.fecha.toISOString().split('T')[0];
      if (!ventasPorDiaMap[dateStr]) ventasPorDiaMap[dateStr] = {fecha: dateStr, tarjetas: 0, billeteras: 0, efectivo: 0};
      ventasPorDiaMap[dateStr].efectivo += e.monto;
      
      facturacionDiariaMap[dateStr] = (facturacionDiariaMap[dateStr] || 0) + e.monto;
    }

    const ventasPorDia = Object.values(ventasPorDiaMap).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const facturacionDiaria = Object.entries(facturacionDiariaMap)
      .map(([fecha, total]) => ({ fecha, total }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    res.json({
      totalTarjetas,
      totalBilleteras,
      totalEfectivo,
      totalGeneral: totalTarjetas + totalBilleteras + totalEfectivo,
      ventasPorDia,
      topeBilleteras,
      facturacionDiaria
    });

  } catch (error) {
    console.error('Error in resumen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
