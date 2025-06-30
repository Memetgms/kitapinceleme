// API Base URL
const API_BASE_URL = 'https://localhost:7153/api';

// Global variables
let currentUserId = null;
let currentReviewId = null;

// DOM Elements
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const totalReviews = document.getElementById('totalReviews');
const reviewsContainer = document.getElementById('reviewsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const noReviews = document.getElementById('noReviews');
const userDropdown = document.getElementById('userDropdown');
const favoritesContainer = document.getElementById('favoritesContainer');
const noFavorites = document.getElementById('noFavorites');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserProfile();
    updateUserDropdown();
    loadUserFavorites();
});

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || !userInfo.userId) {
        alert('Bu sayfaya erişmek için giriş yapmalısınız!');
        window.location.href = '../index.html';
        return;
    }
    
    currentUserId = userInfo.userId;
}

// Update user dropdown
function updateUserDropdown() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userDropdown && userInfo.userName) {
        userDropdown.innerHTML = `<i class="fas fa-user me-1"></i>${userInfo.userName}`;
    }
    
    // Admin paneli göster/gizle
    const adminPanelItem = document.getElementById('adminPanelItem');
    if (adminPanelItem) {
        if (userInfo.userRole === 'Admin') {
            adminPanelItem.style.display = 'block';
        } else {
            adminPanelItem.style.display = 'none';
        }
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        showLoading(true);
        hideNoReviews();
        
        const response = await fetch(`${API_BASE_URL}/userinfo/${currentUserId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const userInfo = await response.json();
            displayUserProfile(userInfo);
        } else if (response.status === 404) {
            // Kullanıcı bulundu ama yorumu yok - localStorage'dan bilgileri göster
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            displayUserProfile({
                userName: userInfo.userName || 'Kullanıcı',
                email: userInfo.email || 'kullanici@email.com',
                reviews: []
            });
        } else {
            throw new Error('Profil yüklenemedi');
        }
    } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        
        // Hata durumunda localStorage'dan bilgileri göster
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        displayUserProfile({
            userName: userInfo.userName || 'Kullanıcı',
            email: userInfo.email || 'kullanici@email.com',
            reviews: []
        });
    } finally {
        showLoading(false);
    }
}

// Display user profile
function displayUserProfile(userInfo) {
    // Update user info
    userName.textContent = userInfo.userName;
    userEmail.textContent = userInfo.email;
    totalReviews.textContent = userInfo.reviews ? userInfo.reviews.length : 0;
    
    // Display reviews
    if (userInfo.reviews && userInfo.reviews.length > 0) {
        displayReviews(userInfo.reviews);
    } else {
        showNoReviews();
    }
}

// Display reviews
function displayReviews(reviews) {
    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-2 col-sm-3 text-center">
                        <img src="${review.photo || '../images/default-book.jpg'}" 
                             alt="${review.title}" 
                             class="review-book-image"
                             onerror="this.src='../images/default-book.jpg'">
                    </div>
                    <div class="col-md-8 col-sm-6">
                        <h5 class="card-title mb-2">${review.title}</h5>
                        <div class="rating-stars mb-2">
                            ${generateStarRating(review.rating)}
                        </div>
                        <p class="card-text">${review.comment}</p>
                    </div>
                    <div class="col-md-2 col-sm-3 text-end">
                        <button class="btn btn-sm btn-danger" onclick="showDeleteReviewModal(${review.id}, '${review.title}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Generate star rating
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Show delete review modal
function showDeleteReviewModal(reviewId, bookTitle) {
    currentReviewId = reviewId;
    document.getElementById('deleteReviewText').textContent = `"${bookTitle}" kitabına yaptığınız yorum silinecek.`;
    new bootstrap.Modal(document.getElementById('deleteReviewModal')).show();
}

// Confirm delete review
async function confirmDeleteReview() {
    if (!currentReviewId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/userinfo/delete-review/${currentReviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showAlert('Yorum başarıyla silindi', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteReviewModal')).hide();
            loadUserProfile(); // Profili yenile
        } else {
            const error = await response.json();
            showAlert(error.message || 'Yorum silinirken hata oluştu', 'danger');
        }
    } catch (error) {
        console.error('Yorum silinirken hata:', error);
        showAlert('Yorum silinirken hata oluştu', 'danger');
    }
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
        reviewsContainer.innerHTML = '';
        noReviews.classList.add('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}

// Show no reviews message
function showNoReviews() {
    reviewsContainer.innerHTML = '';
    noReviews.classList.remove('d-none');
}

// Hide no reviews message
function hideNoReviews() {
    noReviews.classList.add('d-none');
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Navigation functions
function goToHome() {
    window.location.href = '../index.html';
}

function showProfile() {
    // Zaten profil sayfasındayız, sayfayı yenile
    window.location.reload();
}

function showAdminPanel() {
    window.location.href = 'admin.html';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = '../index.html';
}

// Favori kitapları yükle
async function loadUserFavorites() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const favorites = await response.json();
            if (favorites.length === 0) {
                favoritesContainer.innerHTML = '';
                noFavorites.classList.remove('d-none');
                return;
            }
            noFavorites.classList.add('d-none');
            // Kitap detaylarını topluca çekmek için kitapları API'den al
            const booksRes = await fetch(`${API_BASE_URL}/books`);
            const books = booksRes.ok ? await booksRes.json() : [];
            favoritesContainer.innerHTML = favorites.map(fav => {
                const book = books.find(b => b.id === fav.bookId);
                if (!book) return '';
                return `
                <div class="col-md-3 col-sm-6">
                    <div class="card h-100">
                        <div class="card-img-top text-center" style="height:180px;display:flex;align-items:center;justify-content:center;">
                            ${book.photo ? `<img src="${book.photo}" alt="${book.title}" style="max-height:170px;max-width:100%;object-fit:cover;">` : `<i class='fas fa-book fa-3x text-muted'></i>`}
                        </div>
                        <div class="card-body text-center">
                            <h5 class="card-title">${book.title}</h5>
                        </div>
                        <div class="card-footer text-center">
                            <button class="btn btn-danger btn-sm" onclick="removeFavoriteFromProfile(${fav.id})">
                                <i class="fas fa-heart-broken me-1"></i>Favoriden Çıkar
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }
    } catch (e) {
        favoritesContainer.innerHTML = '<div class="col-12 text-center text-danger">Favori kitaplar yüklenemedi.</div>';
    }
}

// Favoriden çıkar (profildeki buton için)
async function removeFavoriteFromProfile(favoriteId) {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            loadUserFavorites();
        } else {
            alert('Favoriden çıkarılamadı!');
        }
    } catch (e) {
        alert('Favoriden çıkarılırken hata oluştu!');
    }
} 