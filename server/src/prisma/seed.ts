import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

function excelDateToDate(val: any): Date {
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
      return date;
    }
  }
  if (typeof val === 'string' && val.trim() !== '') {
    const str = val.trim();
    const parts = str.split('/');
    if (parts.length === 3) {
      const p1 = parseInt(parts[0]);
      const p2 = parseInt(parts[1]);
      let p3 = parseInt(parts[2]);
      
      let year = p3;
      if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;
      else if (year < 1000) year = 2000 + (year % 100);
      else if (year > 2030) year = 2026;

      let month = p2;
      let day = p1;
      if (p1 > 12 && p2 <= 12) {
        day = p1;
        month = p2;
      } else if (p2 > 12 && p1 <= 12) {
        day = p2;
        month = p1;
      }
      
      if (year >= 2020 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(Date.UTC(year, month - 1, day));
      }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      let yr = d.getFullYear();
      if (yr < 2020 || yr > 2030) yr = 2026;
      return new Date(Date.UTC(yr, d.getMonth(), d.getDate()));
    }
  }
  return new Date(Date.UTC(2026, 7, 15));
}

async function main() {
  console.log('Clearing database...');
  await prisma.compra.deleteMany();
  await prisma.tarjeta.deleteMany();
  await prisma.efectivo.deleteMany();
  await prisma.billetera.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const clientePassword = await bcrypt.hash('cliente123', 10);

  await prisma.user.createMany({
    data: [
      { username: 'admin', password: adminPassword, role: 'ADMIN' },
      { username: 'cliente', password: clientePassword, role: 'CLIENTE' }
    ]
  });

  const excelPath = path.join(__dirname, '../../../Sistema_Gestion_Moderno.xlsx');
  console.log('Reading Excel file from:', excelPath);

  try {
    const workbook = XLSX.readFile(excelPath);

    // 1. Seed Billeteras
    if (workbook.Sheets['Base de Datos Billeteras Virtua']) {
      const sheet = workbook.Sheets['Base de Datos Billeteras Virtua'];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const records = [];
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (row[0] !== '' && row[1] !== '' && row[2] !== '') {
          records.push({
            fecha: excelDateToDate(row[0]),
            medio: String(row[1]).trim(),
            monto: Math.abs(parseFloat(row[2]) || 0)
          });
        }
      }
      if (records.length > 0) {
        console.log(`Seeding ${records.length} Billeteras records from Excel...`);
        await prisma.billetera.createMany({ data: records });
      }
    }

    // 2. Seed Efectivo
    if (workbook.Sheets['Base de Datos Efectivo']) {
      const sheet = workbook.Sheets['Base de Datos Efectivo'];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const records = [];
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (row[0] !== '' && row[1] !== '' && row[2] !== '') {
          records.push({
            fecha: excelDateToDate(row[0]),
            medio: String(row[1]).trim(),
            monto: Math.abs(parseFloat(row[2]) || 0)
          });
        }
      }
      if (records.length > 0) {
        console.log(`Seeding ${records.length} Efectivo records from Excel...`);
        await prisma.efectivo.createMany({ data: records });
      }
    }

    // 3. Seed Tarjetas
    if (workbook.Sheets['Base de Datos Tarjetas']) {
      const sheet = workbook.Sheets['Base de Datos Tarjetas'];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const records = [];
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (row[0] !== '' && row[1] !== '' && row[2] !== '') {
          records.push({
            fecha: excelDateToDate(row[0]),
            medio: String(row[1]).trim(),
            monto: Math.abs(parseFloat(row[2]) || 0)
          });
        }
      }
      if (records.length > 0) {
        console.log(`Seeding ${records.length} Tarjetas records from Excel...`);
        await prisma.tarjeta.createMany({ data: records });
      }
    }

    // 4. Seed Compras
    if (workbook.Sheets['Compras']) {
      const sheet = workbook.Sheets['Compras'];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const records = [];
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (row[0] !== '' && row[1] !== '' && row[2] !== '') {
          records.push({
            fecha: excelDateToDate(row[0]),
            medio: String(row[1]).trim(),
            monto: Math.abs(parseFloat(row[2]) || 0),
            cuit: String(row[3] || '').trim(),
            tipoFactura: String(row[4] || 'C').trim(),
            registroMovimiento: excelDateToDate(row[5] || row[0])
          });
        }
      }
      if (records.length > 0) {
        console.log(`Seeding ${records.length} Compras records from Excel...`);
        await prisma.compra.createMany({ data: records });
      }
    }

  } catch (err) {
    console.error('Error parsing Excel for seed:', err);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
