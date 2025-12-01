const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

if (!token) {
  alert('Please login first');
  window.location.href = 'index.html';
}

async function loadMyBookings() {
  try {
    const response = await fetch(`${API_URL}/bookings/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookings = await response.json();
    displayBookings(bookings);
  } catch (error) {
    console.error('Error loading bookings:', error);
  }
}

function displayBookings(bookings) {
  const list = document.getElementById('my-bookings-list');
  const defaultPoster = 'https://via.placeholder.com/80x110/667eea/ffffff?text=Movie';

  if (bookings.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #999;">You haven\'t booked any tickets yet.</p>';
    return;
  }
  list.innerHTML = bookings.map(booking => {
    const posterUrl = booking.poster_url || defaultPoster;
    return `
    <div class="booking-item" style="display: flex; gap: 15px; align-items: center;">
      <img src="${posterUrl}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 8px;" alt="${booking.title}">`;
      <div style="flex: 1;">
        <div>
          <strong style="font-size: 1.1rem;">${booking.title}</strong><br>
          <small style="color: #666;">${booking.cinema}</small>
        </div>
        <div style="margin-top: 10px;">
          <span style="color: #666;">📅 ${new Date(booking.showtime).toLocaleString()}</span><br>
          <span style="color: #666;">💺 Seats: ${booking.seats || 'N/A'}</span>
        </div>
      </div>
      <div style="text-align: right;">
        <strong style="font-size: 1.2rem; color: #667eea;">₹${parseFloat(booking.total_amount).toLocaleString()}</strong><br>
        <small style="color: #666;">${booking.payment_method}</small><br>
        <small style="color: #999;">Booked: ${new Date(booking.booking_date).toLocaleDateString()}</small>
      </div>
    </div>
    `).join('');
}

loadMyBookings();
