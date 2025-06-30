// API Base URL
const API_BASE_URL = 'https://localhost:7153/api';

// Global variables
let allUsers = [];
let allBooks = [];
let allGenres = [];
let currentSection = 'dashboard';

// DOM Elements
const dashboardSection = document.getElementById('dashboardSection');
const bookManagementSection = document.getElementById('bookManagementSection');
const userManagementSection = document.getElementById('userManagementSection');
const roleManagementSection = document.getElementById('roleManagementSection');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboard();
    loadGenres();
    updateUserDropdown();
});

// Check if user is admin
function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || userInfo.userRole !== 'Admin') {
        alert('Bu sayfaya erişim yetkiniz yok!');
        window.location.href = '../index.html';
    }
}

// Update user dropdown
function updateUserDropdown() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown && userInfo.userName) {
        userDropdown.innerHTML = `<i class="fas fa-user me-1"></i>${userInfo.userName}`;
    }
}

// Navigation functions
function showDashboard() {
    hideAllSections();
    dashboardSection.classList.remove('d-none');
    currentSection = 'dashboard';
    updateActiveNav('dashboard');
    loadDashboard();
}

function showBookManagement() {
    hideAllSections();
    bookManagementSection.classList.remove('d-none');
    currentSection = 'books';
    updateActiveNav('books');
    loadBooks();
}

function showUserManagement() {
    hideAllSections();
    userManagementSection.classList.remove('d-none');
    currentSection = 'users';
    updateActiveNav('users');
    loadUsers();
}

function showRoleManagement() {
    hideAllSections();
    roleManagementSection.classList.remove('d-none');
    currentSection = 'roles';
    updateActiveNav('roles');
    loadUsersForRoleManagement();
}

function hideAllSections() {
    dashboardSection.classList.add('d-none');
    bookManagementSection.classList.add('d-none');
    userManagementSection.classList.add('d-none');
    roleManagementSection.classList.add('d-none');
}

function updateActiveNav(section) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const navLinks = {
        'dashboard': document.querySelector('.nav-link'),
        'books': document.querySelectorAll('.nav-link')[1],
        'users': document.querySelectorAll('.nav-link')[2],
        'roles': document.querySelectorAll('.nav-link')[3]
    };
    
    if (navLinks[section]) {
        navLinks[section].classList.add('active');
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadRecentBooks()
        ]);
    } catch (error) {
        console.error('Dashboard yüklenirken hata:', error);
        showAlert('Dashboard yüklenirken hata oluştu', 'danger');
    }
}

async function loadDashboardStats() {
    try {
        // Load books count
        const booksResponse = await fetch(`${API_BASE_URL}/books`);
        if (booksResponse.ok) {
            const books = await booksResponse.json();
            document.getElementById('totalBooks').textContent = books.length;
        }

        // Load users count
        const usersResponse = await fetch(`${API_BASE_URL}/users/list`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            document.getElementById('totalUsers').textContent = users.length;
        }

        // Load admin count
        const adminResponse = await fetch(`${API_BASE_URL}/users/list-by-role/Admin`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (adminResponse.ok) {
            const adminUsers = await adminResponse.json();
            document.getElementById('totalAdmins').textContent = adminUsers.length;
        }

        // Load genres count
        const genresResponse = await fetch(`${API_BASE_URL}/genre`);
        if (genresResponse.ok) {
            const genres = await genresResponse.json();
            document.getElementById('totalGenres').textContent = genres.length;
        }
    } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
    }
}

async function loadRecentBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (response.ok) {
            const books = await response.json();
            const recentBooks = books.slice(0, 5); // Son 5 kitap
            
            const tbody = document.querySelector('#recentBooksTable tbody');
            tbody.innerHTML = recentBooks.map(book => `
                <tr>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>₺${book.price.toFixed(2)}</td>
                    <td>${formatDate(book.publishedDate)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-action" onclick="editBook(${book.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-action" onclick="deleteBook(${book.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Son kitaplar yüklenirken hata:', error);
    }
}

// Book management functions
async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (response.ok) {
            allBooks = await response.json();
            displayBooks();
        } else {
            throw new Error('Kitaplar yüklenemedi');
        }
    } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
        showAlert('Kitaplar yüklenirken hata oluştu', 'danger');
    }
}

function displayBooks() {
    const tbody = document.querySelector('#booksTable tbody');
    tbody.innerHTML = allBooks.map(book => {
        // Kategori adını bul
        const genre = allGenres.find(g => g.id === book.genreId);
        const genreName = genre ? genre.name : 'N/A';
        
        return `
            <tr>
                <td>${book.id}</td>
                <td>
                    ${book.photo ? 
                        `<img src="${book.photo}" alt="${book.title}" style="width: 50px; height: 50px; object-fit: cover;">` :
                        `<i class="fas fa-book fa-2x text-muted"></i>`
                    }
                </td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${genreName}</td>
                <td>₺${book.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="editBook(${book.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteBook(${book.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddBookModal() {
    document.getElementById('bookModalTitle').textContent = 'Yeni Kitap Ekle';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    populateGenreSelect();
    new bootstrap.Modal(document.getElementById('bookModal')).show();
}

function editBook(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('bookModalTitle').textContent = 'Kitap Düzenle';
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookPrice').value = book.price;
    document.getElementById('bookDescription').value = book.description;
    document.getElementById('bookPublishedDate').value = book.publishedDate.split('T')[0];
    document.getElementById('bookPhoto').value = book.photo || '';

    populateGenreSelect(book.genreId);
    new bootstrap.Modal(document.getElementById('bookModal')).show();
}

async function saveBook() {
    const bookId = document.getElementById('bookId').value;
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        genreId: parseInt(document.getElementById('bookGenre').value),
        price: parseFloat(document.getElementById('bookPrice').value),
        description: document.getElementById('bookDescription').value,
        publishedDate: document.getElementById('bookPublishedDate').value,
        photo: document.getElementById('bookPhoto').value || null
    };

    // Eğer güncelleme işlemi ise ID ekle
    if (bookId) {
        bookData.id = parseInt(bookId);
    }

    try {
        const url = bookId ? `${API_BASE_URL}/books/${bookId}` : `${API_BASE_URL}/books`;
        const method = bookId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            showAlert(bookId ? 'Kitap başarıyla güncellendi' : 'Kitap başarıyla eklendi', 'success');
            bootstrap.Modal.getInstance(document.getElementById('bookModal')).hide();
            loadBooks();
            if (currentSection === 'dashboard') {
                loadDashboard();
            }
        } else {
            const error = await response.json();
            showAlert(error.message || 'Bir hata oluştu', 'danger');
        }
    } catch (error) {
        console.error('Kitap kaydedilirken hata:', error);
        showAlert('Kitap kaydedilirken hata oluştu', 'danger');
    }
}

async function deleteBook(bookId) {
    if (!confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            showAlert('Kitap başarıyla silindi', 'success');
            loadBooks();
            if (currentSection === 'dashboard') {
                loadDashboard();
            }
        } else {
            const error = await response.json();
            showAlert(error.message || 'Kitap silinirken hata oluştu', 'danger');
        }
    } catch (error) {
        console.error('Kitap silinirken hata:', error);
        showAlert('Kitap silinirken hata oluştu', 'danger');
    }
}

// User management functions
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/list`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            allUsers = await response.json();
            displayUsers();
        } else {
            throw new Error('Kullanıcılar yüklenemedi');
        }
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        showAlert('Kullanıcılar yüklenirken hata oluştu', 'danger');
    }
}

function displayUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = allUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.userName}</td>
            <td>${user.email}</td>
            <td>${user.fullName}</td>
            <td>${formatDate(user.dateAdded)}</td>
        </tr>
    `).join('');
}

async function filterUsersByRole() {
    const roleFilter = document.getElementById('roleFilter').value;
    
    if (!roleFilter) {
        displayUsers();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/list-by-role/${roleFilter}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            displayFilteredUsers(users);
        } else {
            throw new Error('Kullanıcılar filtrelenemedi');
        }
    } catch (error) {
        console.error('Kullanıcılar filtrelenirken hata:', error);
        showAlert('Kullanıcılar filtrelenirken hata oluştu', 'danger');
    }
}

function displayFilteredUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.userName}</td>
            <td>${user.email}</td>
            <td>${user.fullName}</td>
            <td>${formatDate(user.dateAdded)}</td>
        </tr>
    `).join('');
}

// Role management functions
async function loadUsersForRoleManagement() {
    try {
        // Önce tüm kullanıcıları al
        const allUsersResponse = await fetch(`${API_BASE_URL}/users/list`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (allUsersResponse.ok) {
            const allUsers = await allUsersResponse.json();
            
            // Her kullanıcı için rol bilgisini al
            const usersWithRoles = [];
            for (const user of allUsers) {
                // Admin rolündeki kullanıcıları kontrol et
                const adminResponse = await fetch(`${API_BASE_URL}/users/list-by-role/Admin`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                let userRole = 'User'; // Varsayılan rol
                
                if (adminResponse.ok) {
                    const adminUsers = await adminResponse.json();
                    const isAdmin = adminUsers.some(adminUser => adminUser.id === user.id);
                    if (isAdmin) {
                        userRole = 'Admin';
                    }
                }
                
                usersWithRoles.push({
                    ...user,
                    role: userRole
                });
            }
            
            displayUsersForRoleManagement(usersWithRoles);
        } else {
            throw new Error('Kullanıcılar yüklenemedi');
        }
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        showAlert('Kullanıcılar yüklenirken hata oluştu', 'danger');
    }
}

function displayUsersForRoleManagement(users) {
    const tbody = document.querySelector('#rolesTable tbody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.userName}</td>
            <td>${user.email}</td>
            <td><span class="badge bg-${user.role === 'Admin' ? 'danger' : 'primary'}">${user.role}</span></td>
            <td>
                <select class="form-select form-select-sm" id="roleSelect_${user.id}">
                    <option value="">Rol Seçin</option>
                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                    <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="assignRoleToUser(${user.id})">
                    <i class="fas fa-save"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showAssignRoleModal(userId, userName) {
    document.getElementById('assignUserId').value = userId;
    document.getElementById('assignUserName').value = userName;
    document.getElementById('assignRoleName').value = '';
    new bootstrap.Modal(document.getElementById('assignRoleModal')).show();
}

async function assignRole() {
    const userId = document.getElementById('assignUserId').value;
    const roleName = document.getElementById('assignRoleName').value;

    if (!roleName) {
        showAlert('Lütfen bir rol seçin', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/assign-role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                roleName: roleName
            })
        });

        if (response.ok) {
            showAlert('Rol başarıyla atandı', 'success');
            bootstrap.Modal.getInstance(document.getElementById('assignRoleModal')).hide();
            loadUsers();
            if (currentSection === 'roles') {
                loadUsersForRoleManagement();
            }
            
            // Dashboard'u güncelle
            if (currentSection === 'dashboard') {
                loadDashboard();
            }
        } else {
            const error = await response.json();
            showAlert(error.message || 'Rol atanırken hata oluştu', 'danger');
        }
    } catch (error) {
        console.error('Rol atanırken hata:', error);
        showAlert('Rol atanırken hata oluştu', 'danger');
    }
}

async function assignRoleToUser(userId) {
    const roleSelect = document.getElementById(`roleSelect_${userId}`);
    const roleName = roleSelect.value;

    if (!roleName) {
        showAlert('Lütfen bir rol seçin', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/assign-role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                userId: userId,
                roleName: roleName
            })
        });

        if (response.ok) {
            showAlert('Rol başarıyla atandı', 'success');
            loadUsersForRoleManagement();
            
            // Dashboard'u güncelle
            if (currentSection === 'dashboard') {
                loadDashboard();
            }
        } else {
            const error = await response.json();
            showAlert(error.message || 'Rol atanırken hata oluştu', 'danger');
        }
    } catch (error) {
        console.error('Rol atanırken hata:', error);
        showAlert('Rol atanırken hata oluştu', 'danger');
    }
}

// Utility functions
async function loadGenres() {
    try {
        const response = await fetch(`${API_BASE_URL}/genre`);
        if (response.ok) {
            allGenres = await response.json();
        }
    } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
    }
}

function populateGenreSelect(selectedGenreId = null) {
    const genreSelect = document.getElementById('bookGenre');
    genreSelect.innerHTML = '<option value="">Kategori Seçin</option>';
    
    allGenres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        if (selectedGenreId && genre.id === selectedGenreId) {
            option.selected = true;
        }
        genreSelect.appendChild(option);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

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

function goToHome() {
    window.location.href = '../index.html';
}

function showProfile() {
    window.location.href = 'profile.html';
}

function showAdminPanel() {
    // Zaten admin panelindeyiz, sayfayı yenile
    window.location.reload();
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = '../index.html';
} 