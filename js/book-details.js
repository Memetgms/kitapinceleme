// API Base URL
const API_BASE_URL = 'https://localhost:7153/api';

// Global variables
let currentBook = null;
let currentBookId = null;
let selectedRating = 5;

// DOM Elements - null check ekleyelim
let bookTitle, bookAuthor, bookDescription, bookPrice, bookGenre, bookPhoto, bookRating, bookRatingCount;
let reviewsContainer, loadingSpinner, errorMessage, errorText;
let reviewModal, reviewForm, reviewComment, reviewRating, reviewSubmitBtn;
let reviewLoadingSpinner, reviewErrorMessage, reviewSuccessMessage;

// Initialize DOM elements
function initializeDOMElements() {
    bookTitle = document.getElementById('bookTitle');
    bookAuthor = document.getElementById('bookAuthor');
    bookDescription = document.getElementById('bookDescription');
    bookPrice = document.getElementById('bookPrice');
    bookGenre = document.getElementById('bookGenre');
    bookPhoto = document.getElementById('bookPhoto');
    bookRating = document.getElementById('bookRating');
    bookRatingCount = document.getElementById('bookRatingCount');
    reviewsContainer = document.getElementById('reviewsContainer');
    loadingSpinner = document.getElementById('loadingSpinner');
    errorMessage = document.getElementById('errorMessage');
    errorText = document.getElementById('errorText');

    // Review modal elements
    reviewModal = document.getElementById('reviewModal');
    reviewForm = document.getElementById('reviewForm');
    reviewComment = document.getElementById('reviewComment');
    reviewRating = document.getElementById('reviewRating');
    reviewSubmitBtn = document.getElementById('reviewSubmitBtn');
    reviewLoadingSpinner = document.getElementById('reviewLoadingSpinner');
    reviewErrorMessage = document.getElementById('reviewErrorMessage');
    reviewSuccessMessage = document.getElementById('reviewSuccessMessage');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    loadBookDetails();
    setupEventListeners();
    checkAuthStatus();
    updateAuthButtons();
});

// Setup event listeners
function setupEventListeners() {
    // Review form submission - only if form exists
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddReview();
        });
    }

    // Rating stars interaction - only if container exists
    setupRatingStars();
}

// Load book details from URL parameter
async function loadBookDetails() {
    try {
        // Get book ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        currentBookId = urlParams.get('id');
        
        if (!currentBookId) {
            showError('Kitap ID bulunamadı.');
            return;
        }

        showLoading(true);
        hideMessages();

        console.log('Kitap detayları yükleniyor:', `${API_BASE_URL}/bookdetails/${currentBookId}`);
        const response = await fetch(`${API_BASE_URL}/bookdetails/${currentBookId}`);
        console.log('Kitap detayları yanıtı:', response);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Kitap bulunamadı.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        currentBook = await response.json();
        console.log('Yüklenen kitap:', currentBook);
        
        displayBookDetails();
        displayReviews(currentBook.reviews || []);

    } catch (error) {
        console.error('Kitap detayları yüklenirken hata oluştu:', error);
        showError(error.message || 'Kitap detayları yüklenirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Display book details
function displayBookDetails() {
    if (!currentBook) return;

    // Update page title
    document.title = `${currentBook.title} - Kitap İnceleme`;

    // Update breadcrumb
    updateBreadcrumb();

    // Update book information - check if elements exist
    if (bookTitle) bookTitle.textContent = currentBook.title;
    
    if (bookAuthor) bookAuthor.textContent = currentBook.author;
    if (bookDescription) bookDescription.textContent = currentBook.description;
    if (bookPrice) bookPrice.textContent = `₺${currentBook.price.toFixed(2)}`;
    if (bookGenre) bookGenre.textContent = currentBook.genreName || 'Kategori belirtilmemiş';

    // Update book photo
    if (bookPhoto) {
        console.log('Kitap fotoğrafı bilgisi:', currentBook.photo);
        if (currentBook.photo && typeof currentBook.photo === 'string' && currentBook.photo.trim() !== '') {
            const photoUrl = currentBook.photo.trim();
            bookPhoto.onerror = function() {
                console.error('Kitap fotoğrafı yüklenemedi:', photoUrl);
                this.style.display = 'none';
                const placeholderIcon = this.parentElement.querySelector('.placeholder-icon');
                if (placeholderIcon) {
                    placeholderIcon.style.display = 'block';
                }
            };
            bookPhoto.onload = function() {
                this.style.display = 'block';
                const placeholderIcon = this.parentElement.querySelector('.placeholder-icon');
                if (placeholderIcon) {
                    placeholderIcon.style.display = 'none';
                }
            };
            bookPhoto.src = photoUrl;
            bookPhoto.alt = currentBook.title;
        } else {
            console.log('Kitap fotoğrafı yok veya geçersiz, placeholder gösteriliyor');
            bookPhoto.style.display = 'none';
            const placeholderIcon = bookPhoto.parentElement.querySelector('.placeholder-icon');
            if (placeholderIcon) {
                placeholderIcon.style.display = 'block';
            }
        }
    }

    // Update rating
    updateBookRating();
}

// Update breadcrumb
function updateBreadcrumb() {
    const breadcrumbContainer = document.getElementById('breadcrumbContainer');
    if (breadcrumbContainer && currentBook) {
        breadcrumbContainer.innerHTML = `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item">
                        <a href="index.html">
                            <i class="fas fa-home me-1"></i>Ana Sayfa
                        </a>
                    </li>
                    <li class="breadcrumb-item">
                        <a href="index.html">Kitaplar</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">
                        ${currentBook.title}
                    </li>
                </ol>
            </nav>
        `;
    }
}

// Update book rating display
function updateBookRating() {
    if (!bookRating || !bookRatingCount) return;

    // Calculate average rating from reviews
    const reviews = currentBook.reviews || [];
    let averageRating = 0;
    let reviewCount = reviews.length;

    if (reviewCount > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / reviewCount;
    }

    if (averageRating > 0) {
        bookRating.innerHTML = generateStarRating(averageRating);
        bookRatingCount.textContent = `(${reviewCount} değerlendirme)`;
        bookRatingCount.style.display = 'inline';
    } else {
        bookRating.innerHTML = '<span class="text-muted">Henüz değerlendirme yok</span>';
        bookRatingCount.style.display = 'none';
    }
}

// Display reviews
function displayReviews(reviews) {
    if (!reviewsContainer) return;

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-comments text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">Bu kitap için henüz yorum yapılmamış.</p>
                <p class="text-muted">İlk yorumu siz yapın!</p>
            </div>
        `;
        return;
    }

    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-user">
                    <i class="fas fa-user-circle me-2"></i>
                    <strong>${review.userName}</strong>
                </div>
                <div class="review-rating">
                    ${generateStarRating(review.rating)}
                </div>
            </div>
            <div class="review-content">
                ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Handle add review
async function handleAddReview() {
    try {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            showReviewError('Yorum yapmak için giriş yapmanız gerekiyor.');
            return;
        }

        // Validate form
        if (!validateReviewForm()) {
            return;
        }

        showReviewLoading(true);
        hideReviewMessages();

        const reviewData = {
            bookId: parseInt(currentBookId),
            comment: reviewComment.value.trim(),
            rating: parseInt(reviewRating.value)
        };

        console.log('Yorum ekleniyor:', `${API_BASE_URL}/review/add`);
        const response = await fetch(`${API_BASE_URL}/review/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        });

        console.log('Yorum ekleme yanıtı:', response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Yorum eklenirken bir hata oluştu.');
        }

        const result = await response.json();
        console.log('Yorum başarıyla eklendi:', result);

        // Show success message
        showReviewSuccess('Yorumunuz başarıyla eklendi!');

        // Reset form
        if (reviewForm) reviewForm.reset();
        resetRatingStars();

        // Close modal after a short delay
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(reviewModal);
            if (modal) {
                modal.hide();
            }
        }, 1500);

        // Reload book details to get updated reviews
        setTimeout(() => {
            loadBookDetails();
        }, 2000);

    } catch (error) {
        console.error('Yorum ekleme hatası:', error);
        showReviewError(error.message || 'Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
        showReviewLoading(false);
    }
}

// Validate review form
function validateReviewForm() {
    let isValid = true;

    if (!reviewRating || !reviewComment) return false;

    const rating = parseInt(reviewRating.value);
    if (!rating || rating < 1 || rating > 5) {
        showReviewFieldError(reviewRating, 'Lütfen 1-5 arası bir puan verin.');
        isValid = false;
    } else {
        clearReviewFieldError(reviewRating);
    }

    const comment = reviewComment.value.trim();
    if (!comment) {
        showReviewFieldError(reviewComment, 'Yorum metni gereklidir.');
        isValid = false;
    } else if (comment.length < 10) {
        showReviewFieldError(reviewComment, 'Yorum en az 10 karakter olmalıdır.');
        isValid = false;
    } else if (comment.length > 500) {
        showReviewFieldError(reviewComment, 'Yorum en fazla 500 karakter olabilir.');
        isValid = false;
    } else {
        clearReviewFieldError(reviewComment);
    }

    return isValid;
}

// Setup rating stars interaction
function setupRatingStars() {
    const ratingContainer = document.getElementById('ratingStars');
    if (!ratingContainer) return;

    const stars = ratingContainer.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            setRating(index + 1);
        });

        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });

        star.addEventListener('mouseleave', () => {
            highlightStars(parseInt(reviewRating.value) || 0);
        });
    });
}

// Set rating
function setRating(rating) {
    if (reviewRating) {
        reviewRating.value = rating;
        highlightStars(rating);
    }
}

// Highlight stars
function highlightStars(rating) {
    const stars = document.querySelectorAll('#ratingStars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Reset rating stars
function resetRatingStars() {
    if (reviewRating) {
        reviewRating.value = '';
        highlightStars(0);
    }
}

// Show review field error
function showReviewFieldError(field, message) {
    if (!field) return;
    
    field.classList.add('is-invalid');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear review field error
function clearReviewFieldError(field) {
    if (!field) return;
    
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Show review loading
function showReviewLoading(show) {
    if (!reviewLoadingSpinner || !reviewSubmitBtn) return;
    
    if (show) {
        reviewLoadingSpinner.classList.remove('d-none');
        reviewSubmitBtn.disabled = true;
    } else {
        reviewLoadingSpinner.classList.add('d-none');
        reviewSubmitBtn.disabled = false;
    }
}

// Show review error message
function showReviewError(message) {
    if (!reviewErrorMessage) return;
    
    const errorText = reviewErrorMessage.querySelector('span');
    if (errorText) {
        errorText.textContent = message;
    }
    reviewErrorMessage.classList.remove('d-none');
    if (reviewSuccessMessage) {
        reviewSuccessMessage.classList.add('d-none');
    }
}

// Show review success message
function showReviewSuccess(message) {
    if (!reviewSuccessMessage) return;
    
    const successText = reviewSuccessMessage.querySelector('span');
    if (successText) {
        successText.textContent = message;
    }
    reviewSuccessMessage.classList.remove('d-none');
    if (reviewErrorMessage) {
        reviewErrorMessage.classList.add('d-none');
    }
}

// Hide review messages
function hideReviewMessages() {
    if (reviewErrorMessage) {
        reviewErrorMessage.classList.add('d-none');
    }
    if (reviewSuccessMessage) {
        reviewSuccessMessage.classList.add('d-none');
    }
}

// Check auth status for review button
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const addReviewBtn = document.getElementById('addReviewBtn');
    
    if (addReviewBtn) {
        if (token) {
            addReviewBtn.style.display = 'inline-block';
            addReviewBtn.onclick = () => {
                const modal = new bootstrap.Modal(reviewModal);
                modal.show();
            };
        } else {
            addReviewBtn.style.display = 'none';
        }
    }
}

// Update auth buttons based on login status
function updateAuthButtons() {
    const authButtonsContainer = document.querySelector('.d-flex');
    if (!authButtonsContainer) return;

    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (token && userInfo.userName) {
        // User is logged in
        authButtonsContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user me-1"></i>${userInfo.userName}
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onclick="showProfile()">
                        <i class="fas fa-user-circle me-2"></i>Profil
                    </a></li>
                    ${userInfo.userRole === 'Admin' ? 
                        `<li><a class="dropdown-item" href="#" onclick="showAdminPanel()">
                            <i class="fas fa-cog me-2"></i>Admin Panel
                        </a></li>` : ''
                    }
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">
                        <i class="fas fa-sign-out-alt me-2"></i>Çıkış Yap
                    </a></li>
                </ul>
            </div>
        `;
    } else {
        // User is not logged in
        authButtonsContainer.innerHTML = `
            <button class="btn btn-outline-light me-2" onclick="goToLogin()">
                <i class="fas fa-sign-in-alt me-1"></i>Giriş Yap
            </button>
            <button class="btn btn-light" onclick="goToRegister()">
                <i class="fas fa-user-plus me-1"></i>Kayıt Ol
            </button>
        `;
    }
}

// Navigation functions
function goToLogin() {
    window.location.href = 'login.html';
}

function goToRegister() {
    window.location.href = 'register.html';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    updateAuthButtons();
    checkAuthStatus();
    window.location.reload();
}

function showProfile() {
    alert('Profil sayfası yakında eklenecek!');
}

function showAdminPanel() {
    alert('Admin paneli yakında eklenecek!');
}

// Show loading spinner
function showLoading(show) {
    if (!loadingSpinner) return;
    
    const bookDetailsContent = document.querySelector('.book-details-content');
    
    if (show) {
        loadingSpinner.classList.remove('d-none');
        if (bookDetailsContent) {
            bookDetailsContent.style.display = 'none';
        }
    } else {
        loadingSpinner.classList.add('d-none');
        if (bookDetailsContent) {
            bookDetailsContent.style.display = 'block';
        }
    }
}

// Show error message
function showError(message) {
    if (!errorText) return;
    
    errorText.textContent = message;
    if (errorMessage) {
        errorMessage.classList.remove('d-none');
    }
    
    const bookDetailsContent = document.querySelector('.book-details-content');
    if (bookDetailsContent) {
        bookDetailsContent.style.display = 'none';
    }
}

// Hide messages
function hideMessages() {
    if (errorMessage) {
        errorMessage.classList.add('d-none');
    }
}

// Utility functions
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-warning"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-warning"></i>';
    }

    return stars;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Add to cart function (placeholder)
function addToCart() {
    alert('Sepete ekleme özelliği yakında eklenecek!');
}

// Add to favorites function (placeholder)
function addToFavorites() {
    alert('Favorilere ekleme özelliği yakında eklenecek!');
} 