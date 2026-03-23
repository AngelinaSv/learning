const { PrismaClient } = require('@prisma/client');
const { PrismaPg }= require('@prisma/adapter-pg');
const { createClient } = require('redis');

// const prisma = new PrismaClient();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

async function main() {
    console.log('🔄 Починаємо перевірку підключень...\n');

    // --- 1. ПЕРЕВІРКА REDIS ---
    // Використовуємо внутрішнє ім'я контейнера 'redis' як хост
    const redisClient = createClient({
        url: 'redis://redis:6379'
    });

    redisClient.on('error', (err) => console.log('❌ Помилка Redis:', err));

    await redisClient.connect();
    console.log('✅ Успішно підключено до Redis!');

    // Записуємо та читаємо тестове значення
    await redisClient.set('course_topic', 'Node.js & Docker Integration');
    const redisValue = await redisClient.get('course_topic');
    console.log(`📦 Отримано з Redis: ${redisValue}\n`);


    // --- 2. ПЕРЕВІРКА POSTGRES (PRISMA) ---
    console.log('⏳ Підключення до бази даних Postgres через Prisma...');
    
    // Створюємо новий тестовий запис
    const newStudent = await prisma.student.create({
        data: {
            name: `Студент ${Math.floor(Math.random() * 1000)}`,
        },
    });
    console.log('✅ Створено запис у Postgres:', newStudent);

    // Зчитуємо всі існуючі записи
    const allStudents = await prisma.student.findMany();
    console.log(`📊 Всього записів у базі: ${allStudents.length}`);
    console.log(allStudents);


    // --- 3. ЗАВЕРШЕННЯ ---
    await redisClient.quit();
    await prisma.$disconnect();
    console.log('\n🏁 Перевірку успішно завершено!');
}

main().catch((e) => {
    console.error('Сталася критична помилка:', e);
    process.exit(1);
});
