// AUTH.JS
// File: js/auth.js
/**
 * Authentication related functionality 
 */

// Constants
const TOKEN_KEY = 'swollenhippo_auth_token';
const USER_KEY = 'swollenhippo_user';

/**
 * user authentication
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise} Authentication result
 */
function authenticateUser(email, password) {
  return new Promise((resolve, reject) => {
    
    setTimeout(() => {
      // Check if email contains admin to determine user type 
      const isAdmin = email.includes('admin');
      
      if (email && password.length >= 8) {
        const userData = {
          id: Math.floor(Math.random() * 1000) + 1,
          email: email,
          firstName: isAdmin ? 'Admin' : 'Student',
          lastName: 'User',
          userType: isAdmin ? 'admin' : 'student'
        };
        
        // Generate a fake token
        const token = btoa(JSON.stringify({
          userId: userData.id,
          email: userData.email,
          exp: new Date().getTime() + (24 * 60 * 60 * 1000) 
        }));
        
        // Store authentication data
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        resolve({
          success: true,
          user: userData,
          redirectUrl: isAdmin ? 'pages/admin-dashboard.html' : 'pages/student-dashboard.html'
        });
      } else {
        reject({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
    }, 700); 
  });
}

/**
 * Registers a new user
 * @param {Object} userData User registration data
 * @returns {Promise} Registration result
 */
function registerUser(userData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userData.email && userData.password && userData.firstName && userData.lastName) {
        // Generate a user ID
        userData.id = Math.floor(Math.random() * 1000) + 1;
        
        // Generate a fake token
        const token = btoa(JSON.stringify({
          userId: userData.id,
          email: userData.email,
          exp: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        
        // Store authentication data
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        resolve({
          success: true,
          user: userData,
          redirectUrl: userData.userType === 'admin' ? 'pages/admin-dashboard.html' : 'pages/student-dashboard.html'
        });
      } else {
        reject({ 
          success: false, 
          message: 'Missing required registration fields' 
        });
      }
    }, 700); // Simulate network delay
  });
}

/**
 * Checks if user is authenticated
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (!token) {
    return false;
  }
  
  try {
    const tokenData = JSON.parse(atob(token));
    // Check token expiration
    if (tokenData.exp < new Date().getTime()) {
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