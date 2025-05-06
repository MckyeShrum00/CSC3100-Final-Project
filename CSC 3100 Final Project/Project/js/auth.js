// AUTH.JS
// File: js/auth.js
// Authentication related functionality
// Constants
const TOKEN_KEY = 'swollenhippo_auth_token';
const USER_KEY = 'swollenhippo_user';

/**
 * Authenticate user with backend and store JWT and user info
 */
function authenticateUser(email, password) {
  return fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    return response.json();
  })
  .then(data => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    const redirectUrl = data.user.userType === 'admin' ? 'pages/admin-dashboard.html' 
    : data.user.userType === 'instructor' ? 'pages/instructor-dashboard.html' 
    : 'pages/student-dashboard.html';

    return {
      success: true,
      user: data.user,
      redirectUrl
    };
  })
  .catch(e => {
    return { 
      success: false, 
      message: e.message };
  });
}

/**
 * Check if token exists and is not expired
 */
function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (!token) {
    return false;
  }
  
  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (tokenData.exp && tokenData.exp > now) {
      return true;
    } else {
      logoutUser(); // Expired
      return false;
    }
  } catch (e) {
    // Invalid token format
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return false;
  }
}

/**
 * Gets current user data
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
 * Logs out the current user
 */
function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '../index.html';
}

// Attach logout handler to all logout buttons
$(document).ready(function() {
  $('#nav-logout').on('click', function(e) {
    e.preventDefault();
    logoutUser();
  });
  
  // If on a secured page, redirect to login if not authenticated
  if (window.location.pathname.includes('/pages/') && 
      !window.location.pathname.includes('/landing.html') && 
      !isAuthenticated()) {
    window.location.href = '../index.html';
  }
});