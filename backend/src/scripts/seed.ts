import { PrismaClient, BookingStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a default user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create sample bookings
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];
  const names = [
    'Rajesh Kumar',
    'Priya Sharma',
    'Amit Patel',
    'Sneha Reddy',
    'Vikram Singh',
    'Anjali Mehta',
    'Rahul Gupta',
    'Kavita Nair',
  ];

  const bookings = Array.from({ length: 50 }, (_, i) => ({
    name: names[i % names.length],
    address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
    city: cities[i % cities.length],
    mobile: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
    vehicleNo: `MH${Math.floor(Math.random() * 100)}${String.fromCharCode(65 + (i % 26))}${Math.floor(Math.random() * 10000)}`,
    status: ((i % 4) + 1) as BookingStatus,
    comment: i % 3 === 0 ? `Sample comment ${i + 1}` : null,
  }));

  await prisma.booking.createMany({
    data: bookings,
    skipDuplicates: true,
  });

  console.log('✅ Created 50 sample bookings');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

