const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function changeRole() {
  try {
    const user = await prisma.user.update({
      where: { username: 'Seba' },
      data: { role: 'ADMIN' }
    });
    console.log('Usuario actualizado exitosamente:');
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

changeRole();
