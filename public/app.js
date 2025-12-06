const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let selectedMovie = null;
let selectedSeats = [];
let selectedDate = new Date();

// Auth handling
const authPage = document.getElementById('auth-page');
const mainApp = document.getElementById('main-app');
const authForm = document.getElementById('auth-form');
const authSwitchLink = document.getElementById('auth-switch-link');
let isLoginMode = true;

if (token && currentUser) {
  showMainApp();
} else {
  authPage.classList.remove('hidden');
}

authSwitchLink.onclick = (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  document.getElementById('auth-title').textContent = isLoginMode ? 'Login to FilmTIX' : 'Register for FilmTIX';
  document.getElementById('name-group').classList.toggle('hidden', isLoginMode);
  authForm.querySelector('button').textContent = isLoginMode ? 'Login' : 'Register';
  document.getElementById('auth-switch-text').innerHTML = isLoginMode
    ? 'Don\'t have an account? <a href="#" id="auth-switch-link">Register</a>'
    : 'Already have an account? <a href="#" id="auth-switch-link">Login</a>';
  document.getElementById('auth-switch-link').onclick = authSwitchLink.onclick;
};

authForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value;

  try {
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const body = isLoginMode ? { email, password } : { name, email, password };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    if (response.ok) {
      if (isLoginMode) {
        token = result.token;
        currentUser = result.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        showMainApp();
      } else {
        alert('Registration successful! Please login.');
        authSwitchLink.click();
      }
    } else {
      alert(result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

function showMainApp() {
  authPage.classList.add('hidden');
  mainApp.classList.remove('hidden');
  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('user-avatar').textContent = currentUser.name[0].toUpperCase();

  if (currentUser.isAdmin) {
    document.getElementById('admin-btn').classList.remove('hidden');
    document.getElementById('my-bookings-btn').classList.add('hidden');
  }

  initApp();
}

document.getElementById('logout-btn').onclick = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.reload();
};

document.getElementById('admin-btn').onclick = () => {
  window.location.href = 'admin.html';
};

document.getElementById('my-bookings-btn').onclick = () => {
  window.location.href = 'bookings.html';
};

// Initialize app
function initApp() {
  generateDateSelector();
  loadMovies();
}

function generateDateSelector() {
  const container = document.getElementById('date-selector');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateItem = document.createElement('div');
    dateItem.className = 'date-item' + (i === 0 ? ' active' : '');
    dateItem.innerHTML = `
      <div class="date-day">${days[date.getDay()]}</div>
      <div class="date-date">${date.getDate()}, ${months[date.getMonth()]}</div>
    `;
    dateItem.onclick = () => {
      document.querySelectorAll('.date-item').forEach(el => el.classList.remove('active'));
      dateItem.classList.add('active');
      selectedDate = date;
      loadMovies();
    };
    container.appendChild(dateItem);
  }
}

async function loadMovies() {
  try {
    const response = await fetch(`${API_URL}/movies`);
    const movies = await response.json();
    displayMovies(movies);
  } catch (error) {
    console.error('Error loading movies:', error);
  }
}

function displayMovies(movies) {
  const grid = document.getElementById('movies-grid');
  const defaultPoster = 'https://via.placeholder.com/300x400/667eea/ffffff?text=No+Poster';

  grid.innerHTML = movies.map(movie => {
    const posterUrl = movie.poster_url ? `http://localhost:3000${movie.poster_url}` : defaultPoster;
    return `
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-poster" style="background-image: url('${posterUrl}'); background-size: cover; background-position: center;">
      </div>
      <div class="movie-info-card">
        <div class="movie-title">${movie.title}</div>
        <div class="movie-genre">${movie.genre || 'Movie'}</div>
      </div>
    </div>
  `;
  }).join('');

  // Add click event listeners to movie cards
  grid.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', function () {
      const movieId = parseInt(this.getAttribute('data-movie-id'));
      const movie = movies.find(m => m.id === movieId);
      if (movie) {
        selectMovie(movie);
      }
    });
  });
}

async function selectMovie(movie) {
  console.log('Selected movie:', movie);
  selectedMovie = movie;
  selectedSeats = [];
  document.getElementById('booking-title').textContent = movie.title;

  try {
    const response = await fetch(`${API_URL}/movies/${movie.id}/seats`);
    const seats = await response.json();
    console.log('Loaded seats:', seats.length);
    
    // Check if all seats are booked
    const availableSeats = seats.filter(seat => !seat.is_booked);
    if (availableSeats.length === 0) {
      displayFullyBookedMessage(movie);
    } else {
      displayBookingPanel(movie, seats);
    }
  } catch (error) {
    console.error('Error loading seats:', error);
    alert('Failed to load seats. Please try again.');
  }
}

function displayFullyBookedMessage(movie) {
  const content = document.getElementById('booking-content');
  const defaultPoster = 'https://via.placeholder.com/400x500/667eea/ffffff?text=No+Poster';
  const posterUrl = movie.poster_url || defaultPoster;

  content.innerHTML = `
    <div class="selected-movie">
      <img src="http://localhost:3000${posterUrl}" style="width: 100%; border-radius: 10px; margin-bottom: 15px;" alt="${movie.title}">
      <div class="movie-genres">
        <span class="genre-tag">${movie.genre}</span>
      </div>
    </div>
    <div style="text-align: center; padding: 40px 20px; background: #fff3cd; border-radius: 10px; margin-top: 20px;">
      <h3 style="color: #856404; margin-bottom: 10px;">🎫 All Tickets Booked!</h3>
      <p style="color: #856404;">Sorry, all seats for this show are already booked. Please select another movie or showtime.</p>
    </div>
  `;
}

function displayBookingPanel(movie, seats) {
  const content = document.getElementById('booking-content');
  const defaultPoster = 'https://via.placeholder.com/400x500/667eea/ffffff?text=No+Poster';
  const posterUrl = movie.poster_url || defaultPoster;

  content.innerHTML = `
    <div class="selected-movie">
      <img src="http://localhost:3000${posterUrl}" style="width: 100%; border-radius: 10px; margin-bottom: 15px;" alt="${movie.title}">
      <div class="movie-genres">
        <span class="genre-tag">${movie.genre}</span>
      </div>
    </div>

    <div class="showtime-select">
      <label>Cinema</label>
      <select id="cinema-select">
        <option>${movie.cinema || 'Cinema Stela'}</option>
      </select>
    </div>

    <div class="time-slots">
      <div class="time-slot active">${new Date(movie.showtime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>

    <h4 style="margin: 20px 0 10px 0;">Select Seats</h4>
    <div class="seat-legend">
      <div class="legend-item">
        <div class="legend-box" style="background: #333;"></div>
        <span>Available</span>
      </div>
      <div class="legend-item">
        <div class="legend-box" style="background: #667eea;"></div>
        <span>Selected</span>
      </div>
      <div class="legend-item">
        <div class="legend-box" style="background: #ddd;"></div>
        <span>Booked</span>
      </div>
    </div>

    <div style="text-align: center; margin: 15px 0; color: #666;">
      <div style="font-size: 1.5rem; margin-bottom: 5px;">🎬 SCREEN 🎬</div>
      <div style="height: 3px; background: linear-gradient(to right, transparent, #667eea, transparent); margin: 0 auto; width: 80%;"></div>
    </div>

    <div class="seat-grid" id="seat-grid"></div>

    <div class="price-summary">
      <div class="price-row">
        <span>Tickets (<span id="ticket-count">0</span>)</span>
        <span id="ticket-price">₹0</span>
      </div>
      <div class="price-row">
        <span>Sub Total</span>
        <span id="subtotal">₹0</span>
      </div>
      <div class="price-row">
        <span>Convenience Fee</span>
        <span id="discount">₹0</span>
      </div>
      <div class="price-row total">
        <span>Total</span>
        <span id="total">₹0</span>
      </div>
    </div>

    <button class="payment-btn razorpay" onclick="processRazorpayPayment()" style="width: 100%; background: #528FF0; font-size: 1.1rem; padding: 15px;">
      💳 Pay with Razorpay
    </button>
  `;

  renderSeats(seats);
}

function renderSeats(seats) {
  const grid = document.getElementById('seat-grid');
  if (!grid) {
    console.error('Seat grid element not found!');
    return;
  }

  console.log('Rendering seats:', seats.length);
  grid.innerHTML = seats.map(seat => `
    <button class="seat ${seat.is_booked ? 'booked' : ''}" 
            data-seat-id="${seat.id}"
            data-seat-label="${seat.row_label}${seat.seat_number}"
            ${seat.is_booked ? 'disabled' : ''}>
      <div class="seat-icon">🪑</div>
      <div class="seat-label">${seat.row_label}${seat.seat_number}</div>
    </button>
  `).join('');

  // Add click event listeners to all seats
  const availableSeats = grid.querySelectorAll('.seat:not(.booked)');
  console.log('Available seats:', availableSeats.length);

  availableSeats.forEach(seatBtn => {
    seatBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const seatId = parseInt(this.getAttribute('data-seat-id'));
      const seatLabel = this.getAttribute('data-seat-label');
      console.log('Seat clicked:', seatLabel);
      toggleSeat(seatId, seatLabel, this);
    });
  });
}

function toggleSeat(seatId, seatLabel, seatBtn) {
  if (seatBtn.classList.contains('selected')) {
    seatBtn.classList.remove('selected');
    selectedSeats = selectedSeats.filter(s => s.id !== seatId);
    console.log('Seat deselected:', seatLabel);
  } else {
    seatBtn.classList.add('selected');
    selectedSeats.push({ id: seatId, label: seatLabel });
    console.log('Seat selected:', seatLabel);
  }
  console.log('Total selected seats:', selectedSeats.length);
  updatePriceSummary();
}

function updatePriceSummary() {
  const count = selectedSeats.length;
  const price = selectedMovie.price;
  const subtotal = count * price;
  const fee = Math.round(subtotal * 0.02); // 2% convenience fee
  const total = subtotal + fee;

  document.getElementById('ticket-count').textContent = count;
  document.getElementById('ticket-price').textContent = `₹${(price * count).toLocaleString()}`;
  document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById('discount').textContent = `₹${fee.toLocaleString()}`;
  document.getElementById('total').textContent = `₹${total.toLocaleString()}`;
}

async function processRazorpayPayment() {
  if (selectedSeats.length === 0) {
    alert('Please select at least one seat');
    return;
  }

  const count = selectedSeats.length;
  const price = selectedMovie.price;
  const subtotal = count * price;
  const fee = Math.round(subtotal * 0.02);
  const total = subtotal + fee;

  const options = {
    key: 'rzp_test_R9fUFOT1UyoZxP', // Your Razorpay key
    amount: total * 100, // Amount in paise
    currency: 'INR',
    name: 'FilmTIX',
    description: `${selectedMovie.title} - ${count} Ticket(s)`,
    image: 'https://via.placeholder.com/100x100/667eea/ffffff?text=FT',
    handler: async function (response) {
      // Payment successful
      try {
        const bookingResponse = await fetch(`${API_URL}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            movie_id: selectedMovie.id,
            seat_ids: selectedSeats.map(s => s.id),
            payment_method: 'Razorpay',
            payment_id: response.razorpay_payment_id
          })
        });

        const result = await bookingResponse.json();
        if (bookingResponse.ok) {
          showTicket(result.bookingId);
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert('Booking failed: ' + error.message);
      }
    },
    prefill: {
      name: currentUser.name,
      email: currentUser.email
    },
    theme: {
      color: '#667eea'
    }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function (response) {
    alert('Payment failed: ' + response.error.description);
  });
  rzp.open();
}

async function processPayment(method) {
  if (selectedSeats.length === 0) {
    alert('Please select at least one seat');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        movie_id: selectedMovie.id,
        seat_ids: selectedSeats.map(s => s.id),
        payment_method: method
      })
    });

    const result = await response.json();
    if (response.ok) {
      // Show ticket
      showTicket(result.bookingId);
    } else {
      alert(result.error);
    }
  } catch (error) {
    alert('Booking failed: ' + error.message);
  }
}

async function showTicket(bookingId) {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const booking = await response.json();
    const defaultPoster = 'https://via.placeholder.com/400x500/667eea/ffffff?text=Movie+Ticket';
    const posterUrl = booking.poster_url ? `http://localhost:3000${booking.poster_url}` : defaultPoster;

    const ticketHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; margin: 50px auto;">
        <h2 style="text-align: center; color: #667eea; margin-bottom: 20px;">🎉 Booking Confirmed!</h2>
        
        <img src="${posterUrl}" style="width: 100%; border-radius: 10px; margin-bottom: 20px;" alt="${booking.title}">
        
        <div style="border: 2px dashed #ddd; padding: 20px; border-radius: 10px;">
          <h3 style="margin: 0 0 15px 0;">${booking.title}</h3>
          <p style="margin: 5px 0;"><strong>Cinema:</strong> ${booking.cinema}</p>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${new Date(booking.showtime).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Seats:</strong> ${booking.seats}</p>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${booking.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${booking.email}</p>
          <p style="margin: 15px 0 5px 0; font-size: 1.2rem;"><strong>Total Paid:</strong> ₹${parseFloat(booking.total_amount).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Payment:</strong> ${booking.payment_method}</p>
          <p style="margin: 5px 0; color: #999; font-size: 0.9rem;">Booking ID: #${booking.id}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="location.reload()" class="btn" style="margin-right: 10px;">Book Another</button>
          <button onclick="window.location.href='bookings.html'" class="btn btn-secondary">My Bookings</button>
        </div>
      </div>
    `;

    document.getElementById('main-app').innerHTML = ticketHTML;
  } catch (error) {
    alert('Booking successful! Redirecting...');
    setTimeout(() => location.reload(), 2000);
  }
}

// Make functions global
window.processPayment = processPayment;
window.processRazorpayPayment = processRazorpayPayment;
