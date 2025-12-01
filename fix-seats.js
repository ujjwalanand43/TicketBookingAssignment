require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixSeats() {
    console.log('Connecting to database...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: true }
    });

    console.log('✓ Connected!');

    try {
        // Get all movies
        const [movies] = await connection.query('SELECT id FROM movies');
        console.log(`Found ${movies.length} movies`);

        // Check if seats exist
        const [existingSeats] = await connection.query('SELECT COUNT(*) as count FROM seats');
        console.log(`Existing seats: ${existingSeats[0].count}`);

        if (existingSeats[0].count === 0) {
            console.log('Creating seats for all movies...');

            const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
            let totalSeats = 0;

            for (const movie of movies) {
                for (const row of rows) {
                    for (let i = 1; i <= 10; i++) {
                        await connection.query(
                            'INSERT INTO seats (movie_id, row_label, seat_number, is_booked) VALUES (?, ?, ?, ?)',
                            [movie.id, row, i, false]
                        );
                        totalSeats++;
                    }
                }
                console.log(`✓ Created seats for movie ID ${movie.id}`);
            }

            console.log(`\n✅ Created ${totalSeats} seats total!`);
        } else {
            console.log('Seats already exist. Checking if all movies have seats...');

            for (const movie of movies) {
                const [movieSeats] = await connection.query(
                    'SELECT COUNT(*) as count FROM seats WHERE movie_id = ?',
                    [movie.id]
                );

                if (movieSeats[0].count === 0) {
                    console.log(`Creating seats for movie ID ${movie.id}...`);
                    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

                    for (const row of rows) {
                        for (let i = 1; i <= 10; i++) {
                            await connection.query(
                                'INSERT INTO seats (movie_id, row_label, seat_number, is_booked) VALUES (?, ?, ?, ?)',
                                [movie.id, row, i, false]
                            );
                        }
                    }
                    console.log(`✓ Created 70 seats for movie ID ${movie.id}`);
                } else {
                    console.log(`✓ Movie ID ${movie.id} has ${movieSeats[0].count} seats`);
                }
            }
        }

        console.log('\n✅ All done! Seats are ready.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await connection.end();
}

fixSeats();
