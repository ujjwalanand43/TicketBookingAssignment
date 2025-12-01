require('dotenv').config();
const mysql = require('mysql2/promise');

async function getUsers() {
    console.log('Connecting to database...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: true }
    });

    console.log('✓ Connected!\n');

    try {
        const [users] = await connection.query('SELECT * FROM users');

        console.log('=== ALL USERS ===\n');
        console.log(`Total users: ${users.length}\n`);

        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  ID: ${user.id}`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Is Admin: ${user.is_admin ? 'Yes' : 'No'}`);
            console.log(`  Created: ${user.created_at}`);
            console.log('');
        });

        console.log('=== USERS JSON ===');
        console.log(JSON.stringify(users, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await connection.end();
}

getUsers();
