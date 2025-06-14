// API Base URL
const API_BASE_URL = 'https://localhost:7153/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkRememberedUser();
});

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // Real-time validation
    emailInput.addEventListener('input', function() {
        validateEmail();
    });

    passwordInput.addEventListener('input', function() {
        validatePassword();
    });

    // Enter key support
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !loadingSpinner.classList.contains('d-none')) {
            return; // Don't allow submission while loading
        }
    });
}

// Handle login
async function handleLogin() {
    try {
        // Validate form
        if (!validateForm()) {
            return;
        }

        showLoading(true);
        hideMessages();

        const loginData = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        console.log('Giriş yapılıyor:', `${API_BASE_URL}/users/login`);
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        console.log('Login yanıtı:', response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Giriş başarısız');
        }

        const result = await response.json();
        console.log('Login başarılı:', result);

        // Save token
        saveToken(result.token);

        // Save user info if remember me is checked
        if (rememberMeCheckbox.checked) {
            saveRememberedUser(loginData.email);
        } else {
            clearRememberedUser();
        }

        // Show success message
        showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');

        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Giriş hatası:', error);
        showError(error.message || 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
        showLoading(false);
    }
}

// Validate form
function validateForm() {
    let isValid = true;

    if (!validateEmail()) {
        isValid = false;
    }

    if (!validatePassword()) {
        isValid = false;
    }

    return isValid;
}

// Validate email
function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        showFieldError(emailInput, 'E-posta adresi gereklidir.');
        return false;
    }

    if (!emailRegex.test(email)) {
        showFieldError(emailInput, 'Geçerli bir e-posta adresi girin.');
        return false;
    }

    clearFieldError(emailInput);
    return true;
}

// Validate password
function validatePassword() {
    const password = passwordInput.value;

    if (!password) {
        showFieldError(passwordInput, 'Şifre gereklidir.');
        return false;
    }

    if (password.length < 6) {
        showFieldError(passwordInput, 'Şifre en az 6 karakter olmalıdır.');
        return false;
    }

    clearFieldError(passwordInput);
    return true;
}

// Show field error
function showFieldError(field, message) {
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

// Clear field error
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggle');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Save token to localStorage
function saveToken(token) {
    localStorage.setItem('authToken', token);
    
    // Decode token to get user info
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('userInfo', JSON.stringify({
            userId: payload.nameid,
            userName: payload.unique_name,
            userRole: payload.role
        }));
    } catch (error) {
        console.error('Token decode hatası:', error);
    }
}

// Save remembered user
function saveRememberedUser(email) {
    localStorage.setItem('rememberedUser', email);
}

// Clear remembered user
function clearRememberedUser() {
    localStorage.removeItem('rememberedUser');
}

// Check for remembered user
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        emailInput.value = rememberedUser;
        rememberMeCheckbox.checked = true;
    }
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
        loginForm.classList.add('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
        loginForm.classList.remove('d-none');
    }
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('d-none');
    successMessage.classList.add('d-none');
}

// Show success message
function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.remove('d-none');
    errorMessage.classList.add('d-none');
}

// Hide all messages
function hideMessages() {
    errorMessage.classList.add('d-none');
    successMessage.classList.add('d-none');
}

// Utility function to check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (payload.exp > currentTime) {
                // Token is valid, redirect to home
                window.location.href = 'index.html';
                return;
            } else {
                // Token expired, clear it
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
            }
        } catch (error) {
            console.error('Token validation error:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
        }
    }
}

// Check auth status on page load
checkAuthStatus(); 