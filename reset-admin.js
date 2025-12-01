require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
    console.log('=== Resetting Admin Password ===\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: true }
    });

    try {
        // Set new password to "admin123"
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await connection.query(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@filmtix.com']
        );

        console.log('✅ Admin password has been reset!\n');
        console.log('Login Credentials:');
        console.log('  Email: admin@filmtix.com');
        console.log('  Password: admin123');
        console.log('\nYou can now login to the admin panel!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await connection.end();
}

resetAdminPassword();
