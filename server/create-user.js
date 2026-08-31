const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUser() {
  const username = 'nuevo_cliente';
  const password = 'cliente123';
  const role = 'CLIENTE';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role
      }
    });
    
    console.log('Usuario creado exitosamente:');
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
