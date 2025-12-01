require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function resetPassword() {
    console.log('=== Password Reset Tool ===\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: true }
    });

    try {
        // Get all users
        const [users] = await connection.query('SELECT id, name, email FROM users');

        console.log('Available users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email})`);
        });
        console.log('');

        rl.question('Enter user number to reset password: ', async (userNum) => {
            const selectedUser = users[parseInt(userNum) - 1];

            if (!selectedUser) {
                console.log('Invalid user number!');
                rl.close();
                await connection.end();
                return;
            }

            rl.question(`Enter new password for ${selectedUser.email}: `, async (newPassword) => {
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                await connection.query(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, selectedUser.id]
                );

                console.log(`\n✅ Password updated successfully!`);
                console.log(`Email: ${selectedUser.email}`);
                console.log(`New Password: ${newPassword}`);

                rl.close();
                await connection.end();
            });
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        await connection.end();
    }
}

resetPassword();
