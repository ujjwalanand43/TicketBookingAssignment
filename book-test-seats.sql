-- Book some seats for the first movie (Godzilla x Kong) for testing
-- This will book seats A1-A5 and B1-B3 (8 seats total)

UPDATE seats 
SET is_booked = 1, booking_id = 999
WHERE movie_id = 1 
AND (
  (row_label = 'A' AND seat_number IN (1,2,3,4,5))
  OR (row_label = 'B' AND seat_number IN (1,2,3))
);

-- Verify the update
SELECT COUNT(*) as booked_seats FROM seats WHERE movie_id = 1 AND is_booked = 1;
