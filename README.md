# FilmTIX - Movie Ticket Booking App

A modern movie ticket booking system with authentication, seat selection, and payment options.

## Setup

1. Install dependencies:
```
npm install
```

2. Set up cloud MySQL database (e.g., AWS RDS, Google Cloud SQL, or PlanetScale)

3. Create `.env` file with your database credentials:
```
DB_HOST=your-cloud-mysql-host
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=movie_booking
PORT=3000
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
```

4. Run the SQL script in `database.sql` on your cloud MySQL database

5. Start the server:
```
npm start
```

6. Open `http://localhost:3000` in your browser

## Features

**Authentication:**
- User registration and login
- JWT-based authentication
- Admin and user roles

**User Features:**
- Browse movies by date
- View movie details and showtimes
- Interactive seat selection (A-G rows, 1-10 seats)
- Real-time seat availability
- Multiple payment options (QRIS/Cash)
- View booking history

**Admin Features:**
- Add new movies with showtimes
- View all bookings
- Manage movie details

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express, JWT, bcrypt
- Database: MySQL (Cloud)

## Default Admin Login
- Email: admin@filmtix.com
- Password: admin123
