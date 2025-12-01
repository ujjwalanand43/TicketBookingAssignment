CREATE DATABASE IF NOT EXISTS movie_booking;
USE movie_booking;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
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

CREATE TABLE seats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT,
  row_label VARCHAR(2),
  seat_number INT,
  is_booked BOOLEAN DEFAULT FALSE,
  booking_id INT,
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  movie_id INT,
  total_amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, is_admin) VALUES
('Admin', 'admin@filmtix.com', '$2a$10$rZ5YvqJZKqYqKqYqKqYqKOX8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W', TRUE);

-- Insert sample movies
INSERT INTO movies (title, description, duration, showtime, price, total_seats, genre, cinema) VALUES
('Godzilla x Kong: The New Empire', 'Two titans unite against a colossal threat', 115, '2025-12-10 13:00:00', 50000, 70, 'Sci-Fi', 'Cinema Stela'),
('The Marvels', 'Carol Danvers teams up with Kamala Khan', 105, '2025-12-10 15:15:00', 50000, 70, 'Action', 'Cinema Stela'),
('Arthur The King', 'An adventure racer and a stray dog', 107, '2025-12-10 18:00:00', 50000, 70, 'Adventure', 'Cinema Stela'),
('Exhuma', 'A mysterious supernatural thriller', 134, '2025-12-10 19:15:00', 50000, 70, 'Horror', 'Cinema Stela'),
('Kung Fu Panda 4', 'Po faces his greatest challenge yet', 94, '2025-12-11 13:00:00', 45000, 70, 'Animation', 'Cinema Stela'),
('Dune: Part Two', 'Paul Atreides unites with Chani', 166, '2025-12-11 18:00:00', 55000, 70, 'Sci-Fi', 'Cinema Stela');

-- Create seats for each movie (rows A-G, seats 1-10)
DELIMITER $$
CREATE PROCEDURE create_seats()
BEGIN
  DECLARE movie_id INT;
  DECLARE done INT DEFAULT FALSE;
  DECLARE cur CURSOR FOR SELECT id FROM movies;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO movie_id;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    INSERT INTO seats (movie_id, row_label, seat_number)
    SELECT movie_id, row_label, seat_number
    FROM (
      SELECT 'A' as row_label UNION SELECT 'B' UNION SELECT 'C' UNION 
      SELECT 'D' UNION SELECT 'E' UNION SELECT 'F' UNION SELECT 'G'
    ) rows
    CROSS JOIN (
      SELECT 1 as seat_number UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
      SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    ) seats;
  END LOOP;
  CLOSE cur;
END$$
DELIMITER ;

CALL create_seats();
DROP PROCEDURE create_seats;
