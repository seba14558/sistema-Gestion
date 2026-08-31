import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get('/resumen', async (req, res) => {
  try {
    const [tarjetas, billeteras, efectivo, compras] = await Promise.all([
      prisma.tarjeta.findMany(),
      prisma.billetera.findMany(),
      prisma.efectivo.findMany(),
      prisma.compra.findMany()
    ]);

    let ventasEfectivo = 0;
    let ventasBilleteras = 0;
    let ventasTarjetas = 0;

    const monthlyData: Record<string, {mes: string, tarjetas: number, billeteras: number, efectivo: number, total: number}> = {};

    const processRecord = (record: any, type: 'tarjetas' | 'billeteras' | 'efectivo') => {
      const monthStr = record.fecha.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[monthStr]) {
        monthlyData[monthStr] = { mes: monthStr, tarjetas: 0, billeteras: 0, efectivo: 0, total: 0 };
      }
      monthlyData[monthStr][type] += record.monto;
      monthlyData[monthStr].total += record.monto;
      
      if (type === 'efectivo') ventasEfectivo += record.monto;
      if (type === 'billeteras') ventasBilleteras += record.monto;
      if (type === 'tarjetas') ventasTarjetas += record.monto;
    };

    tarjetas.forEach(t => processRecord(t, 'tarjetas'));
    billeteras.forEach(b => processRecord(b, 'billeteras'));
    efectivo.forEach(e => processRecord(e, 'efectivo'));

    const ventasTotales = ventasEfectivo + ventasBilleteras + ventasTarjetas;

    let totalCompras = 0;
    let comprasFacturadas = 0;
    let comprasSinFactura = 0;

    compras.forEach(c => {
      totalCompras += c.monto;
      if (c.tipoFactura === 'A' || c.tipoFactura === 'B') {
        comprasFacturadas += c.monto;
      } else {
        comprasSinFactura += c.monto;
      }
    });

    const ventasPorMes = Object.values(monthlyData).sort((a, b) => a.mes.localeCompare(b.mes));

    // Format data for charts
    const chartDataMensual = ventasPorMes.map(item => ({
      name: item.mes,
      tarjetas: item.tarjetas,
      billeteras: item.billeteras,
      efectivo: item.efectivo
    }));

    const distribucionPagos = [
      { name: 'Tarjetas', value: ventasTarjetas },
      { name: 'Billeteras', value: ventasBilleteras },
      { name: 'Efectivo', value: ventasEfectivo }
    ].filter(item => item.value > 0);

    const result: any = {
      ventasTotales,
      ventasEfectivo,
      ventasBilleteras,
      ventasTarjetas,
      totalCompras,
      comprasFacturadas,
      comprasSinFactura,
      ventasPorMes, // For Informes page
      chartDataMensual, // For Dashboard
      distribucionPagos
    };

    if (req.user?.role === 'ADMIN') {
      result.costo = totalCompras;
      result.rentabilidad = ventasTotales - totalCompras;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate informe' });
  }
});

export default router;
