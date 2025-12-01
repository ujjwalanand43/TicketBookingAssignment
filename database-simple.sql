CREATE DATABASE IF NOT EXISTS movie_booking;
USE movie_booking;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT,
  showtime DATETIME,
  price DECIMAL(10,2),
  total_seats INT,
  genre VARCHAR(100),
  cinema VARCHAR(255),
  poster_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT,
  row_label VARCHAR(2),
  seat_number INT,
  is_booked BOOLEAN DEFAULT FALSE,
  booking_id INT,
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  movie_id INT,
  total_amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

INSERT INTO users (name, email, password, is_admin) VALUES
('Admin', 'admin@filmtix.com', '$2a$10$rZ5YvqJZKqYqKqYqKqYqKOX8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W', TRUE);

INSERT INTO movies (title, description, duration, showtime, price, total_seats, genre, cinema) VALUES
('Godzilla x Kong: The New Empire', 'Two titans unite against a colossal threat', 115, '2025-12-10 13:00:00', 50000, 70, 'Sci-Fi', 'Cinema Stela'),
('The Marvels', 'Carol Danvers teams up with Kamala Khan', 105, '2025-12-10 15:15:00', 50000, 70, 'Action', 'Cinema Stela'),
('Arthur The King', 'An adventure racer and a stray dog', 107, '2025-12-10 18:00:00', 50000, 70, 'Adventure', 'Cinema Stela'),
('Exhuma', 'A mysterious supernatural thriller', 134, '2025-12-10 19:15:00', 50000, 70, 'Horror', 'Cinema Stela'),
('Kung Fu Panda 4', 'Po faces his greatest challenge yet', 94, '2025-12-11 13:00:00', 45000, 70, 'Animation', 'Cinema Stela'),
('Dune: Part Two', 'Paul Atreides unites with Chani', 166, '2025-12-11 18:00:00', 55000, 70, 'Sci-Fi', 'Cinema Stela');
