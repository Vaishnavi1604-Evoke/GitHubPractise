// Store bookings in local storage
let bookings = JSON.parse(localStorage.getItem('cakeBookings')) || [];

// Price mapping for sizes
const sizePrices = {
    'small': 25,
    'medium': 40,
    'large': 60,
    'xlarge': 80
};

// Topping prices
const toppingPrices = {
    'sprinkles': 5,
    'chocolate_chips': 5,
    'berries': 8,
    'nuts': 6,
    'whipped_cream': 4
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', handleBookingSubmit);
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deliveryDate').setAttribute('min', today);
    
    // Display saved bookings
    displayBookings();
});

// Handle form submission
function handleBookingSubmit(event) {
    event.preventDefault();
    
    // Collect form data
    const formData = {
        id: Date.now(),
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        cakeType: document.getElementById('cakeType').value,
        size: document.getElementById('size').value,
        toppings: getSelectedToppings(),
        deliveryDate: document.getElementById('deliveryDate').value,
        specialRequest: document.getElementById('specialRequest').value,
        delivery: document.querySelector('input[name="delivery"]:checked').value,
        bookingDate: new Date().toLocaleDateString()
    };
    
    // Calculate total price
    formData.totalPrice = calculatePrice(formData);
    
    // Validate form
    if (validateBooking(formData)) {
        // Add to bookings array
        bookings.push(formData);
        
        // Save to localStorage
        localStorage.setItem('cakeBookings', JSON.stringify(bookings));
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        document.getElementById('bookingForm').reset();
        
        // Refresh bookings display
        displayBookings();
    }
}

// Get selected toppings
function getSelectedToppings() {
    const toppings = document.querySelectorAll('input[name="toppings"]:checked');
    return Array.from(toppings).map(t => t.value);
}

// Validate booking data
function validateBooking(formData) {
    // Check if all required fields are filled
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.cakeType || !formData.size || !formData.deliveryDate || 
        !formData.delivery) {
        alert('Please fill in all required fields!');
        return false;
    }
    
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address!');
        return false;
    }
    
    // Check if phone is valid
    const phoneRegex = /^[0-9\-\s]+$/;
    if (!phoneRegex.test(formData.phone) || formData.phone.length < 10) {
        alert('Please enter a valid phone number!');
        return false;
    }
    
    // Check if delivery date is in future
    const selectedDate = new Date(formData.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        alert('Delivery date must be in the future!');
        return false;
    }
    
    return true;
}

// Calculate total price
function calculatePrice(formData) {
    let total = sizePrices[formData.size] || 0;
    
    // Add topping prices
    formData.toppings.forEach(topping => {
        total += toppingPrices[topping] || 0;
    });
    
    // Add delivery charge
    if (formData.delivery === 'delivery') {
        total += 10;
    }
    
    return total;
}

// Display all bookings
function displayBookings() {
    const bookingsList = document.getElementById('bookingsList');
    const bookingSummary = document.getElementById('bookingSummary');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '';
        bookingSummary.innerHTML = '<p style="text-align: center; color: #999;">No booking yet. Fill the form above!</p>';
        return;
    }
    
    bookingsList.innerHTML = '';
    bookingSummary.innerHTML = `<p style="color: #4caf50; font-weight: bold;">✓ Total Bookings: ${bookings.length}</p>`;
    
    bookings.forEach(booking => {
        const bookingItem = createBookingCard(booking);
        bookingsList.appendChild(bookingItem);
    });
}

// Create booking card
function createBookingCard(booking) {
    const div = document.createElement('div');
    div.className = 'booking-item';
    
    const cakeTypeDisplay = booking.cakeType.charAt(0).toUpperCase() + booking.cakeType.slice(1).replace(/([A-Z])/g, ' $1');
    const sizeDisplay = booking.size.charAt(0).toUpperCase() + booking.size.slice(1);
    const toppingsDisplay = booking.toppings.length > 0 
        ? booking.toppings.map(t => t.replace(/_/g, ' ')).join(', ')
        : 'None';
    
    div.innerHTML = `
        <h3>Booking ID: ${booking.id}</h3>
        <p><strong>Name:</strong> ${booking.fullName}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Cake Type:</strong> ${cakeTypeDisplay}</p>
        <p><strong>Size:</strong> ${sizeDisplay}</p>
        <p><strong>Toppings:</strong> ${toppingsDisplay}</p>
        <p><strong>Delivery Date:</strong> ${booking.deliveryDate}</p>
        <p><strong>Delivery:</strong> ${booking.delivery.charAt(0).toUpperCase() + booking.delivery.slice(1)}</p>
        ${booking.specialRequest ? `<p><strong>Special Requests:</strong> ${booking.specialRequest}</p>` : ''}
        <p><strong>Total Price:</strong> $${booking.totalPrice.toFixed(2)}</p>
        <p style="font-size: 0.9em; color: #999;">Booked on: ${booking.bookingDate}</p>
        <button onclick="deleteBooking(${booking.id})" class="btn btn-delete" style="margin-top: 10px; background: #ff6b6b; width: 100%; padding: 8px;">Delete Booking</button>
    `;
    
    return div;
}

// Delete booking
function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to delete this booking?')) {
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('cakeBookings', JSON.stringify(bookings));
        displayBookings();
        alert('Booking deleted successfully!');
    }
}

// Show success message
function showSuccessMessage() {
    const summary = document.getElementById('bookingSummary');
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = '✓ Booking confirmed successfully!';
    summary.innerHTML = '';
    summary.appendChild(message);
    
    setTimeout(() => {
        displayBookings();
    }, 2000);
}