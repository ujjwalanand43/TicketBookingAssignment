const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !currentUser || !currentUser.isAdmin) {
    alert('Admin access required');
    window.location.href = 'index.html';
}

document.getElementById('movie-form').onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('duration', document.getElementById('duration').value);
    formData.append('genre', document.getElementById('genre').value);
    formData.append('showtime', document.getElementById('showtime').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('total_seats', document.getElementById('total-seats').value);
    formData.append('cinema', document.getElementById('cinema').value);

    const posterFile = document.getElementById('poster').files[0];
    if (posterFile) {
        formData.append('poster', posterFile);
    }

    try {
        const response = await fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const result = await response.json();
        if (response.ok) {
            alert('Movie added successfully!');
            document.getElementById('movie-form').reset();
            loadBookings();
        } else {
            alert(result.error);
        }
    } catch (error) {
        alert('Failed to add movie: ' + error.message);
    }
};

async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookings = await response.json();
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayBookings(bookings) {
    const list = document.getElementById('bookings-list');
    if (bookings.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">No bookings yet.</p>';
        return;
    }
    list.innerHTML = bookings.map(booking => `
    <div class="booking-item">
      <div>
        <strong>${booking.title}</strong><br>
        <small>${new Date(booking.showtime).toLocaleString()}</small>
      </div>
      <div>
        ${booking.name}<br>
        <small>${booking.email}</small>
      </div>
      <div>
        Seats: ${booking.seats || 'N/A'}<br>
        <small>${booking.payment_method}</small>
      </div>
      <div>
        <strong>₹${parseFloat(booking.total_amount).toLocaleString()}</strong><br>
        <small>${new Date(booking.booking_date).toLocaleDateString()}</small>
      </div>
    </div>
  `).join('');
}

loadBookings();
