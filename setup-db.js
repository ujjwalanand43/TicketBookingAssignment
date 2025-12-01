require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    console.log('Connecting to database...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: true }
    });

    console.log('✓ Connected to database!');

    try {
        // Check if tables exist
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`✓ Found ${tables.length} tables`);

        // Check movies
        const [movies] = await connection.query('SELECT COUNT(*) as count FROM movies');
        console.log(`✓ Movies in database: ${movies[0].count}`);

        // If no movies, insert sample data
        if (movies[0].count === 0) {
            console.log('Adding sample movies...');
            const movieData = [
                ['Godzilla x Kong: The New Empire', 'Two titans unite against a colossal threat', 115, '2025-12-10 13:00:00', 50000, 70, 'Sci-Fi', 'Cinema Stela'],
                ['The Marvels', 'Carol Danvers teams up with Kamala Khan', 105, '2025-12-10 15:15:00', 50000, 70, 'Action', 'Cinema Stela'],
                ['Arthur The King', 'An adventure racer and a stray dog', 107, '2025-12-10 18:00:00', 50000, 70, 'Adventure', 'Cinema Stela'],
                ['Exhuma', 'A mysterious supernatural thriller', 134, '2025-12-10 19:15:00', 50000, 70, 'Horror', 'Cinema Stela'],
                ['Kung Fu Panda 4', 'Po faces his greatest challenge yet', 94, '2025-12-11 13:00:00', 45000, 70, 'Animation', 'Cinema Stela'],
                ['Dune: Part Two', 'Paul Atreides unites with Chani', 166, '2025-12-11 18:00:00', 55000, 70, 'Sci-Fi', 'Cinema Stela']
            ];

            for (const movie of movieData) {
                const [result] = await connection.query(
                    'INSERT INTO movies (title, description, duration, showtime, price, total_seats, genre, cinema) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    movie
                );

                // Create seats for this movie
                const movieId = result.insertId;
                const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
                for (const row of rows) {
                    for (let i = 1; i <= 10; i++) {
                        await connection.query(
                            'INSERT INTO seats (movie_id, row_label, seat_number) VALUES (?, ?, ?)',
                            [movieId, row, i]
                        );
                    }
                }
            }
            console.log('✓ Sample movies and seats added');
        }

        // Check admin user
        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@filmtix.com']);
        if (users.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(
                'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
                ['Admin', 'admin@filmtix.com', hashedPassword, true]
            );
            console.log('✓ Admin user created');
        } else {
            console.log('✓ Admin user exists');
        }

        console.log('\n✅ Database is ready!');
        console.log('\nAdmin login credentials:');
        console.log('  Email: admin@filmtix.com');
        console.log('  Password: admin123');
        console.log('\nStart the server with: npm start');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await connection.end();
}

setupDatabase();
