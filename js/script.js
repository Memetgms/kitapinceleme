// API Base URL - Backend'inizin çalıştığı adresi buraya yazın
const API_BASE_URL = 'https://localhost:7153/api'

// Global variables
let allBooks = [];
let allGenres = [];
let currentFilter = 'all';
let currentSearchTerm = '';

// DOM Elements
const booksContainer = document.getElementById('booksContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');
const genreDropdown = document.getElementById('genreDropdown');
const sortSelect = document.getElementById('sortSelect');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadAllBooks();
    loadGenres();
    loadHeroPopularBook();
    loadHeroFavoriteBook();
    setupEventListeners();
    updateAuthButtons();

    // Sıralama butonu event
    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.addEventListener('click', function() {
            const sortSelect = document.getElementById('sortSelect');
            const orderSelect = document.getElementById('orderSelect');
            const sortBy = sortSelect.value;
            const order = orderSelect.value;
            fetchSortedBooks(sortBy, order);
        });
    }
});

// Setup event listeners
function setupEventListeners() {
    // Search input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearchTerm = this.value.toLowerCase();
            filterAndDisplayBooks();
        }, 300);
    });

    // Enter key in search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBooks();
        }
    });
}

// Load all books from API
async function loadAllBooks() {
    try {
        showLoading(true);
        currentFilter = 'all';
        updateActiveFilter('all');
        
        console.log('API çağrısı yapılıyor:', `${API_BASE_URL}/books`);
        const response = await fetch(`${API_BASE_URL}/books`);
        console.log('API yanıtı:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allBooks = await response.json();
        console.log('Yüklenen kitaplar:', allBooks);
        filterAndDisplayBooks();
        
    } catch (error) {
        console.error('Kitaplar yüklenirken hata oluştu:', error);
        showError('Kitaplar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
        showLoading(false);
    }
}

// Load genres from API
async function loadGenres() {
    try {
        console.log('Kategoriler yükleniyor:', `${API_BASE_URL}/genre`);
        const response = await fetch(`${API_BASE_URL}/genre`);
        console.log('Kategori yanıtı:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allGenres = await response.json();
        console.log('Yüklenen kategoriler:', allGenres);
        populateGenreFilters();
        populateGenreDropdown();
        
    } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
    }
}

// Load books by genre
async function loadBooksByGenre(genreId) {
    try {
        showLoading(true);
        currentFilter = genreId;
        updateActiveFilter(genreId);
        
        console.log('Kategori kitapları yükleniyor:', `${API_BASE_URL}/genre/${genreId}`);
        const response = await fetch(`${API_BASE_URL}/genre/${genreId}`);
        console.log('Kategori kitapları yanıtı:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allBooks = await response.json();
        console.log('Yüklenen kategori kitapları:', allBooks);
        filterAndDisplayBooks();
        
    } catch (error) {
        console.error('Kategori kitapları yüklenirken hata oluştu:', error);
        showError('Kategori kitapları yüklenirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Populate genre filter buttons
function populateGenreFilters() {
    const filterContainer = document.getElementById('genreFilter');
    
    // Clear existing buttons except "Tüm Kitaplar"
    const allBooksBtn = filterContainer.querySelector('button');
    filterContainer.innerHTML = '';
    filterContainer.appendChild(allBooksBtn);
    
    // Add genre buttons
    allGenres.forEach(genre => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-primary';
        button.textContent = genre.name;
        button.onclick = () => loadBooksByGenre(genre.id);
        filterContainer.appendChild(button);
    });
}

// Populate genre dropdown
function populateGenreDropdown() {
    genreDropdown.innerHTML = '';
    
    allGenres.forEach(genre => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'dropdown-item';
        link.href = '#';
        link.textContent = genre.name;
        link.onclick = (e) => {
            e.preventDefault();
            loadBooksByGenre(genre.id);
        };
        item.appendChild(link);
        genreDropdown.appendChild(item);
    });
}

// Filter and display books
function filterAndDisplayBooks() {
    let filteredBooks = [...allBooks];
    
    // Apply search filter
    if (currentSearchTerm) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(currentSearchTerm) ||
            book.author.toLowerCase().includes(currentSearchTerm) ||
            book.description.toLowerCase().includes(currentSearchTerm)
        );
    }
    
    // Apply sorting
    const sortValue = sortSelect.value;
    if (sortValue) {
        filteredBooks.sort((a, b) => {
            switch (sortValue) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'author':
                    return a.author.localeCompare(b.author);
                case 'price':
                    return a.price - b.price;
                case 'date':
                    return new Date(b.publishedDate) - new Date(a.publishedDate);
                default:
                    return 0;
            }
        });
    }
    
    displayBooks(filteredBooks);
}

// Display books in the grid
function displayBooks(books) {
    console.log('Görüntülenecek kitaplar:', books);
    
    if (books.length === 0) {
        booksContainer.innerHTML = '';
        noResults.classList.remove('d-none');
        return;
    }
    
    noResults.classList.add('d-none');
    
    booksContainer.innerHTML = books.map(book => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card book-card">
                <div class="card-img-top">
                    ${book.photo ? 
                        `<img src="${book.photo}" alt="${book.title}" class="w-100 h-100" style="object-fit: cover;">` :
                        `<i class="fas fa-book"></i>`
                    }
                </div>
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="author">
                        <i class="fas fa-user me-1"></i>${book.author}
                    </p>
                    <p class="card-text">${truncateText(book.description, 100)}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="price">₺${book.price.toFixed(2)}</span>
                        <span class="date">${formatDate(book.publishedDate)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm btn-details" onclick="showBookDetails(${book.id})">
                        <i class="fas fa-eye me-1"></i>Detaylar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search books
function searchBooks() {
    currentSearchTerm = searchInput.value.toLowerCase();
    filterAndDisplayBooks();
}

// Sort books
function sortBooks() {
    filterAndDisplayBooks();
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
        booksContainer.innerHTML = '';
        noResults.classList.add('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}

// Show error message
function showError(message) {
    booksContainer.innerHTML = `
        <div class="col-12 text-center">
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        </div>
    `;
}

// Utility functions
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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
    window.location.href = 'pages/login.html';
}

function goToRegister() {
    window.location.href = 'pages/register.html';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    updateAuthButtons();
    window.location.reload();
}

function showProfile() {
    window.location.href = 'pages/profile.html';
}

function showAdminPanel() {
    window.location.href = 'pages/admin.html';
}

// Book details function - Kitap detay sayfasına yönlendirme
function showBookDetails(bookId) {
    window.location.href = `pages/book-details.html?id=${bookId}`;
}

// Update active filter button
function updateActiveFilter(genreId) {
    // Remove active class from all buttons
    document.querySelectorAll('#genreFilter .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    if (genreId === 'all') {
        document.querySelector('#genreFilter .btn').classList.add('active');
    } else {
        const genre = allGenres.find(g => g.id === genreId);
        if (genre) {
            const buttons = document.querySelectorAll('#genreFilter .btn');
            buttons.forEach(btn => {
                if (btn.textContent === genre.name) {
                    btn.classList.add('active');
                }
            });
        }
    }
}

// YAZARA GÖRE FİLTRELEME
async function filterByAuthor() {
    const author = document.getElementById('authorFilterInput').value.trim();
    if (!author) return;
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/filter/by-author?author=${encodeURIComponent(author)}`);
        if (!response.ok) throw new Error('Yazara göre filtreleme başarısız');
        const books = await response.json();
        displayBooks(books);
    } catch (e) {
        showError('Yazara göre filtreleme sırasında hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// YILA GÖRE FİLTRELEME
async function filterByYear() {
    const year = document.getElementById('yearFilterInput').value.trim();
    if (!year) return;
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/filter/by-year?year=${encodeURIComponent(year)}`);
        if (!response.ok) throw new Error('Yıla göre filtreleme başarısız');
        const books = await response.json();
        displayBooks(books);
    } catch (e) {
        showError('Yıla göre filtreleme sırasında hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Load most popular book for the hero section
async function loadHeroPopularBook() {
    try {
        const response = await fetch(`${API_BASE_URL}/MostPopular/most-popular-book`);
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return; // 404 ise sessizce devam et
        }
        const book = await response.json();
        displayHeroPopularBook(book);
    } catch (error) {
        console.error('Popüler kitap (hero) yüklenirken hata oluştu:', error);
    }
}

// Display the most popular book in the hero section
function displayHeroPopularBook(book) {
    const container = document.getElementById('hero-popular-book-container');
    if (!container) return;

    container.innerHTML = `
        <div class="hero-book-card" onclick="showBookDetails(${book.id})">
            <div class="hero-book-card-badge"><i class="fas fa-crown me-1"></i>En Popüler</div>
            <img src="${book.photo || 'https://via.placeholder.com/150x220.png?text=Kitap'}" alt="${book.title}" class="hero-book-img">
            <div class="hero-book-info">
                <h5 class="hero-book-title">${truncateText(book.title, 25)}</h5>
                <p class="hero-book-author">${book.author}</p>
                <span class="hero-book-price">${book.price.toFixed(2)} TL</span>
            </div>
        </div>
    `;
}

// Load most favorite book for the hero section
async function loadHeroFavoriteBook() {
    try {
        const response = await fetch(`${API_BASE_URL}/MostPopular/most-favorite-book`);
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
        }
        const book = await response.json();
        displayHeroFavoriteBook(book);
    } catch (error) {
        console.error('Favori kitap (hero) yüklenirken hata oluştu:', error);
    }
}

// Display the most favorite book in the hero section
function displayHeroFavoriteBook(book) {
    const container = document.getElementById('hero-favorite-book-container');
    if (!container) return;

    container.innerHTML = `
        <div class="hero-book-card hero-book-card-favorite" onclick="showBookDetails(${book.id})">
            <div class="hero-book-card-badge-favorite"><i class="fas fa-heart me-1"></i>En Favori</div>
            <img src="${book.photo || 'https://via.placeholder.com/150x220.png?text=Kitap'}" alt="${book.title}" class="hero-book-img">
            <div class="hero-book-info">
                <h5 class="hero-book-title">${truncateText(book.title, 25)}</h5>
                <p class="hero-book-author">${book.author}</p>
                <span class="hero-book-price">${book.price.toFixed(2)} TL</span>
            </div>
        </div>
    `;
}

// Sıralı kitapları API'den çek
async function fetchSortedBooks(sortBy, order) {
    try {
        showLoading(true);
        let url = `${API_BASE_URL}/query`;
        if (sortBy) {
            url += `?sortBy=${sortBy}`;
            if (order) url += `&order=${order}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Kitaplar yüklenemedi');
        allBooks = await response.json();
        filterAndDisplayBooks();
    } catch (error) {
        showError('Kitaplar yüklenirken hata oluştu.');
    } finally {
        showLoading(false);
    }
} 