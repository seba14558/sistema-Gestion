import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { fecha, medio, monto, cuit, tipoFactura } = req.body;
    const record = await prisma.compra.create({
      data: { 
        fecha: new Date(fecha), 
        medio, 
        monto: Number(monto),
        cuit,
        tipoFactura
      }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create compra record' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, medio, tipoFactura, page = '1', limit = '20' } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.CompraWhereInput = {};

    const hasFechaDesde = fechaDesde && (fechaDesde as string).trim() !== '';
    const hasFechaHasta = fechaHasta && (fechaHasta as string).trim() !== '';

    if (hasFechaDesde || hasFechaHasta) {
      where.fecha = {};
      if (hasFechaDesde) {
        const dStr = (fechaDesde as string).trim();
        const dateObj = new Date(dStr.includes('T') ? dStr : `${dStr}T00:00:00.000Z`);
        if (!isNaN(dateObj.getTime())) where.fecha.gte = dateObj;
      }
      if (hasFechaHasta) {
        const hStr = (fechaHasta as string).trim();
        const dateObj = new Date(hStr.includes('T') ? hStr : `${hStr}T23:59:59.999Z`);
        if (!isNaN(dateObj.getTime())) where.fecha.lte = dateObj;
      }
    }

    const medioVal = (medio as string || '').trim();
    if (medioVal !== '' && medioVal !== 'Todos') {
      where.medio = { contains: medioVal };
    }

    const facturaVal = (tipoFactura as string || '').trim();
    if (facturaVal !== '' && facturaVal !== 'Todas') {
      where.tipoFactura = facturaVal;
    }

    const [total, data] = await Promise.all([
      prisma.compra.count({ where }),
      prisma.compra.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { fecha: 'desc' }
      })
    ]);

    res.json({
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    console.error('Error fetching compras:', error);
    res.status(500).json({ error: 'Failed to fetch compras' });
  }
});

export default router;
