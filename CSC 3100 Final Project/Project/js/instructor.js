/**
 * Instructor-specific dashboard functionality
 */

let instructorCourses = [];

$(document).ready(function () {
  if ($('#instructor-dashboard').length) {
    initializeInstructorDashboard();
  }
});

/**
 * Initialize the instructor dashboard by loading courses and stats
 */
function initializeInstructorDashboard() {
  loadInstructorCourses();
}

/**
 * Load courses assigned to the instructor
 */
function loadInstructorCourses() {
  $('#instructor-dashboard').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading your courses...</p>
    </div>
  `);

  fetch('http://localhost:8000/api/courses', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      instructorCourses = data;
      renderInstructorCourses(instructorCourses);
    })
    .catch(() => {
      $('#instructor-dashboard').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to load courses. Please try again later.
        </div>
      `);
    });
}

/**
 * Render instructor courses in a list
 */
function renderInstructorCourses(courses) {
  if (!courses || courses.length === 0) {
    $('#instructor-dashboard').html(`
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No courses assigned to you yet.
      </div>
    `);
    return;
  }

  let html = '<ul class="list-group">';
  courses.forEach(course => {
    html += `
      <li class="list-group-item">
        <strong>${course.name}</strong> (${course.code}) - ${course.semester}
      </li>
    `;
  });
  html += '</ul>';

  $('#instructor-dashboard').html(html);
}