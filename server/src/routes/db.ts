import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

const getModel = (tabla: string) => {
  switch (tabla.toLowerCase()) {
    case 'billeteras': return prisma.billetera;
    case 'efectivo': return prisma.efectivo;
    case 'tarjetas': return prisma.tarjeta;
    default: return null;
  }
};

const handleGet = async (req: any, res: any, tableName: string) => {
  try {
    const model = getModel(tableName) as any;
    if (!model) return res.status(400).json({ error: 'Invalid table name' });

    const { fechaDesde, fechaHasta, medio, montoMin, montoMax, search, page = '1', limit = '20', sortBy = 'fecha', sortOrder = 'desc' } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

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
    
    const searchVal = (search as string || '').trim();
    if (searchVal !== '') {
      where.medio = { contains: searchVal };
    }

    const hasMontoMin = montoMin !== undefined && montoMin !== null && (montoMin as string).trim() !== '';
    const hasMontoMax = montoMax !== undefined && montoMax !== null && (montoMax as string).trim() !== '';

    if (hasMontoMin || hasMontoMax) {
      where.monto = {};
      if (hasMontoMin) {
        const val = parseFloat(montoMin as string);
        if (!isNaN(val)) where.monto.gte = val;
      }
      if (hasMontoMax) {
        const val = parseFloat(montoMax as string);
        if (!isNaN(val)) where.monto.lte = val;
      }
    }

    const orderBy = { [sortBy as string || 'fecha']: sortOrder === 'asc' ? 'asc' : 'desc' };

    const [total, data] = await Promise.all([
      model.count({ where }),
      model.findMany({ where, skip, take: limitNum, orderBy })
    ]);

    res.json({
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    res.status(500).json({ error: `Failed to fetch ${tableName}` });
  }
};

router.get('/billeteras', (req, res) => handleGet(req, res, 'billeteras'));
router.get('/efectivo', (req, res) => handleGet(req, res, 'efectivo'));
router.get('/tarjetas', (req, res) => handleGet(req, res, 'tarjetas'));

router.put('/:tabla/:id', requireAdmin, async (req, res) => {
  try {
    const tabla = req.params.tabla as string;
    const id = req.params.id as string;
    const model = getModel(tabla) as any;
    if (!model) return res.status(400).json({ error: 'Invalid table name' });

    const data = { ...req.body };
    if (data.fecha) data.fecha = new Date(data.fecha);
    if (data.monto) data.monto = Number(data.monto);

    const record = await model.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

router.delete('/:tabla/:id', requireAdmin, async (req, res) => {
  try {
    const tabla = req.params.tabla as string;
    const id = req.params.id as string;
    const model = getModel(tabla) as any;
    if (!model) return res.status(400).json({ error: 'Invalid table name' });

    await model.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

router.get('/:tabla/export', requireAdmin, async (req, res) => {
  try {
    const tabla = req.params.tabla as string;
    const model = getModel(tabla) as any;
    if (!model) return res.status(400).json({ error: 'Invalid table name' });

    const records = await model.findMany({ orderBy: { fecha: 'desc' } });
    if (records.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      return res.send('id,fecha,medio,monto,createdAt\n');
    }

    const headers = Object.keys(records[0]).join(',');
    const rows = records.map((row: any) => 
      Object.values(row).map(v => {
        if (v instanceof Date) return v.toISOString();
        return `"${v}"`;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${tabla}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
