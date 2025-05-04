// AUTH.JS
// File: js/auth.js
/**
 * Authentication-related functionality
 */

// Constants
const TOKEN_KEY = 'swollenhippo_auth_token';
const USER_KEY = 'swollenhippo_user';

/**
 * Authenticates a user by sending credentials to the backend.
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise} Authentication result
 */
function authenticateUser(email, password) {
  return fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }
      return response.json();
    })
    .then(data => {
      // Store the token and user data
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        redirectUrl: data.user.userType === 'admin'
          ? 'pages/admin-dashboard.html'
          : 'pages/student-dashboard.html',
      };
    })
    .catch(error => {
      return {
        success: false,
        message: error.message,
      };
    });
}

/**
 * Registers a new user by sending data to the backend.
 * @param {Object} userData User registration data
 * @returns {Promise} Registration result
 */
function registerUser(userData) {
  return fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      return response.json();
    })
    .then(data => {
      // Store the token and user data
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        redirectUrl: userData.userType === 'admin'
          ? 'pages/admin-dashboard.html'
          : 'pages/student-dashboard.html',
      };
    })
    .catch(error => {
      return {
        success: false,
        message: error.message,
      };
    });
}

/**
 * Checks if the user is authenticated by verifying the token.
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return false;
  }

  try {
    const tokenData = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    // Check token expiration
    if (tokenData.exp * 1000 < new Date().getTime()) {
      // Token expired, clear storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return false;
    }
    return true;
  } catch (e) {
    // Invalid token format
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return false;
  }
}

/**
 * Gets the current user data from localStorage.
 * @returns {Object|null} User data or null if not authenticated
 */
function getCurrentUser() {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (e) {
    return null;
  }
}

/**
 * Logs out the current user by clearing localStorage and redirecting to login.
 */
function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '../index.html';
}

// Attach logout handler to all logout buttons
$(document).ready(function () {
  $('#nav-logout').on('click', function (e) {
    e.preventDefault();
    logoutUser();
  });

  // If on a secured page, redirect to login if not authenticated
  if (
    window.location.pathname.includes('/pages/') &&
    !window.location.pathname.includes('/landing.html') &&
    !isAuthenticated()
  ) {
    window.location.href = '../index.html';
  }
});