// 👈 আপনার তৈরি করা কাস্টম প্রিজমা ইনস্ট্যান্সটি ইমপোর্ট করুন

import { prisma } from './prisma';

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // const users = await Promise.all([
  //   prisma.user.upsert({
  //     where: { email: 'alice@example.com' },
  //     update: {},
  //     create: { name: 'Alice', email: 'alice@example.com' },
  //   }),
  //   prisma.user.upsert({
  //     where: { email: 'bob@example.com' },
  //     update: {},
  //     create: { name: 'Bob', email: 'bob@example.com' },
  //   }),
  // ]);

  // console.log(`✅ Seeded ${users.length} users`);
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
