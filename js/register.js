// API Base URL
const API_BASE_URL = 'https://localhost:7153/api';

// DOM Elements
const registerForm = document.getElementById('registerForm');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const fullNameInput = document.getElementById('fullName');
const userNameInput = document.getElementById('userName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsAcceptedCheckbox = document.getElementById('termsAccepted');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });

    // Real-time validation
    fullNameInput.addEventListener('input', function() {
        validateFullName();
    });

    userNameInput.addEventListener('input', function() {
        validateUserName();
    });

    emailInput.addEventListener('input', function() {
        validateEmail();
    });

    passwordInput.addEventListener('input', function() {
        validatePassword();
        validatePasswordMatch();
    });

    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });

    termsAcceptedCheckbox.addEventListener('change', function() {
        validateTerms();
    });

    // Enter key support
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !loadingSpinner.classList.contains('d-none')) {
            return; // Don't allow submission while loading
        }
    });
}

// Handle registration
async function handleRegister() {
    try {
        // Validate form
        if (!validateForm()) {
            return;
        }

        showLoading(true);
        hideMessages();

        const registerData = {
            fullName: fullNameInput.value.trim(),
            userName: userNameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        console.log('Kayıt yapılıyor:', `${API_BASE_URL}/users/register`);
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        console.log('Register yanıtı:', response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(parseErrorMessages(errorData));
        }

        console.log('Kayıt başarılı');

        // Show success message
        showSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');

        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Kayıt hatası:', error);
        showError(error.message || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
        showLoading(false);
    }
}

// Parse error messages from API response
function parseErrorMessages(errorData) {
    if (typeof errorData === 'string') {
        return errorData;
    }

    if (errorData.errors) {
        const errorMessages = [];
        for (const field in errorData.errors) {
            errorData.errors[field].forEach(error => {
                errorMessages.push(error);
            });
        }
        return errorMessages.join(', ');
    }

    if (errorData.message) {
        return errorData.message;
    }

    return 'Bilinmeyen bir hata oluştu.';
}

// Validate form
function validateForm() {
    let isValid = true;

    if (!validateFullName()) {
        isValid = false;
    }

    if (!validateUserName()) {
        isValid = false;
    }

    if (!validateEmail()) {
        isValid = false;
    }

    if (!validatePassword()) {
        isValid = false;
    }

    if (!validatePasswordMatch()) {
        isValid = false;
    }

    if (!validateTerms()) {
        isValid = false;
    }

    return isValid;
}

// Validate full name
function validateFullName() {
    const fullName = fullNameInput.value.trim();

    if (!fullName) {
        showFieldError(fullNameInput, 'Ad soyad gereklidir.');
        return false;
    }

    if (fullName.length < 2) {
        showFieldError(fullNameInput, 'Ad soyad en az 2 karakter olmalıdır.');
        return false;
    }

    if (fullName.length > 50) {
        showFieldError(fullNameInput, 'Ad soyad en fazla 50 karakter olabilir.');
        return false;
    }

    clearFieldError(fullNameInput);
    return true;
}

// Validate user name
function validateUserName() {
    const userName = userNameInput.value.trim();
    const userNameRegex = /^[a-zA-Z0-9_-]+$/;

    if (!userName) {
        showFieldError(userNameInput, 'Kullanıcı adı gereklidir.');
        return false;
    }

    if (userName.length < 3) {
        showFieldError(userNameInput, 'Kullanıcı adı en az 3 karakter olmalıdır.');
        return false;
    }

    if (userName.length > 20) {
        showFieldError(userNameInput, 'Kullanıcı adı en fazla 20 karakter olabilir.');
        return false;
    }

    if (!userNameRegex.test(userName)) {
        showFieldError(userNameInput, 'Kullanıcı adı sadece harf, rakam, tire ve alt çizgi içerebilir.');
        return false;
    }

    clearFieldError(userNameInput);
    return true;
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

    if (password.length > 50) {
        showFieldError(passwordInput, 'Şifre en fazla 50 karakter olabilir.');
        return false;
    }

    clearFieldError(passwordInput);
    return true;
}

// Validate password match
function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
        showFieldError(confirmPasswordInput, 'Şifre tekrarı gereklidir.');
        return false;
    }

    if (password !== confirmPassword) {
        showFieldError(confirmPasswordInput, 'Şifreler eşleşmiyor.');
        return false;
    }

    clearFieldError(confirmPasswordInput);
    return true;
}

// Validate terms
function validateTerms() {
    if (!termsAcceptedCheckbox.checked) {
        showFieldError(termsAcceptedCheckbox, 'Kullanım şartlarını kabul etmelisiniz.');
        return false;
    }

    clearFieldError(termsAcceptedCheckbox);
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
function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const toggleIcon = document.getElementById(fieldId === 'password' ? 'passwordToggle' : 'confirmPasswordToggle');

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

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
        registerForm.classList.add('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
        registerForm.classList.remove('d-none');
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