require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: true }
}).promise();

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.id;
        req.isAdmin = decoded.isAdmin;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
};

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        res.json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log(users)
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, isAdmin: user.is_admin },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all movies
app.get('/api/movies', async (req, res) => {
    try {
        const [movies] = await db.query('SELECT * FROM movies ORDER BY showtime');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get movie seats
app.get('/api/movies/:id/seats', async (req, res) => {
    try {
        const [seats] = await db.query('SELECT * FROM seats WHERE movie_id = ? ORDER BY row_label, seat_number', [req.params.id]);
        res.json(seats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create movie with image upload (admin)
app.post('/api/movies', authMiddleware, adminMiddleware, upload.single('poster'), async (req, res) => {
    const { title, description, duration, showtime, price, total_seats, genre, cinema } = req.body;
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [result] = await db.query(
            'INSERT INTO movies (title, description, duration, showtime, price, total_seats, genre, cinema, poster_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, duration, showtime, price, total_seats, genre, cinema, posterUrl]
        );

        // Create seats
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const seatsPerRow = 10;
        for (let row of rows) {
            for (let i = 1; i <= seatsPerRow; i++) {
                await db.query(
                    'INSERT INTO seats (movie_id, row_label, seat_number) VALUES (?, ?, ?)',
                    [result.insertId, row, i]
                );
            }
        }

        res.json({ id: result.insertId, message: 'Movie created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Book tickets
app.post('/api/bookings', authMiddleware, async (req, res) => {
    const { movie_id, seat_ids, payment_method } = req.body;
    try {
        if (!seat_ids || seat_ids.length === 0) {
            return res.status(400).json({ error: 'Please select at least one seat' });
        }

        // Check if seats are available
        const [seats] = await db.query(
            'SELECT * FROM seats WHERE id IN (?) AND movie_id = ? AND is_booked = 0',
            [seat_ids, movie_id]
        );

        if (seats.length !== seat_ids.length) {
            return res.status(400).json({ error: 'Some seats are already booked' });
        }

        const [movie] = await db.query('SELECT price FROM movies WHERE id = ?', [movie_id]);
        const totalAmount = movie[0].price * seat_ids.length;

        // Create booking
        const [booking] = await db.query(
            'INSERT INTO bookings (user_id, movie_id, total_amount, payment_method) VALUES (?, ?, ?, ?)',
            [req.userId, movie_id, totalAmount, payment_method]
        );

        // Mark seats as booked
        await db.query('UPDATE seats SET is_booked = 1, booking_id = ? WHERE id IN (?)', [booking.insertId, seat_ids]);

        res.json({ message: 'Booking successful', bookingId: booking.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user bookings (MUST come before /:id route)
app.get('/api/bookings/my', authMiddleware, async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, m.title, m.showtime, m.cinema, m.poster_url,
                GROUP_CONCAT(CONCAT(s.row_label, s.seat_number) SEPARATOR ', ') as seats
            FROM bookings b
            JOIN movies m ON b.movie_id = m.id
            LEFT JOIN seats s ON s.booking_id = b.id
            WHERE b.user_id = ?
            GROUP BY b.id
            ORDER BY b.booking_date DESC
        `, [req.userId]);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get booking details (for ticket)
app.get('/api/bookings/:id', authMiddleware, async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, m.title, m.showtime, m.cinema, m.poster_url, m.duration, m.genre, u.name, u.email,
                GROUP_CONCAT(CONCAT(s.row_label, s.seat_number) ORDER BY s.row_label, s.seat_number SEPARATOR ', ') as seats
            FROM bookings b
            JOIN movies m ON b.movie_id = m.id
            JOIN users u ON b.user_id = u.id
            LEFT JOIN seats s ON s.booking_id = b.id
            WHERE b.id = ? AND b.user_id = ?
            GROUP BY b.id
        `, [req.params.id, req.userId]);

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(bookings[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all bookings (admin)
app.get('/api/bookings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, m.title, u.name, u.email,
                GROUP_CONCAT(CONCAT(s.row_label, s.seat_number) SEPARATOR ', ') as seats
            FROM bookings b
            JOIN movies m ON b.movie_id = m.id
            JOIN users u ON b.user_id = u.id
            LEFT JOIN seats s ON s.booking_id = b.id
            GROUP BY b.id
            ORDER BY b.booking_date DESC
        `);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
