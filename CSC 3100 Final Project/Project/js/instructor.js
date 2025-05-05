/**
 * Instructor-specific dashboard functionality
 */

let instructorCourses = [];

$(document).ready(function () {
  if ($('#instructor-dashboard').length) {
    initializeInstructorDashboard();
  }

  $('#save-new-review').on('click', handleCreateReview);
  $('#save-new-teams').on('click', handleCreateTeams);
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
  const instructorId = localStorage.getItem('instructor_id'); // Assuming instructor ID is stored in localStorage

  $('#instructor-dashboard').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading your courses...</p>
    </div>
  `);

  fetch(`http://localhost:8000/api/instructor/${instructorId}/courses`, {
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
        <strong>${course.CourseName}</strong> (${course.CourseCode}) - ${course.Semester}
        <button class="btn btn-sm btn-outline-primary float-end create-review-btn" data-id="${course.CourseID}">
          Create Review
        </button>
        <button class="btn btn-sm btn-outline-secondary float-end me-2 create-teams-btn" data-id="${course.CourseID}">
          Create Teams
        </button>
      </li>
    `;
  });
  html += '</ul>';

  $('#instructor-dashboard').html(html);
}

/**
 * Handle creating a new review session
 */
function handleCreateReview() {
  const instructorId = localStorage.getItem('instructor_id');
  const courseId = $('#create-review-select-course').val();
  const assessmentType = $('#create-review-select-type').val();
  const startDate = $('#create-review-start-date').val();
  const endDate = $('#create-review-end-date').val();

  if (!courseId || !assessmentType || !startDate || !endDate) {
    Swal.fire('Error', 'All fields are required.', 'error');
    return;
  }

  fetch(`http://localhost:8000/api/instructor/${instructorId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify({ courseId, assessmentType, startDate, endDate }),
  })
    .then(response => response.json())
    .then(data => {
      Swal.fire('Success!', `Review session "${data.AssessmentType}" created.`, 'success');
      $('#createReviewModal').modal('hide');
      $('#create-review-form')[0].reset();
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to create review session. Please try again.', 'error');
    });
}

/**
 * Handle creating or regenerating teams for a course
 */
function handleCreateTeams() {
  const instructorId = localStorage.getItem('instructor_id');
  const courseId = $('#create-teams-select-course').val();
  const teamSize = $('#create-teams-size').val();

  if (!courseId || !teamSize) {
    Swal.fire('Error', 'All fields are required.', 'error');
    return;
  }

  fetch(`http://localhost:8000/api/instructor/${instructorId}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify({ courseId, teamSize }),
  })
    .then(response => response.json())
    .then(data => {
      Swal.fire('Success!', `Teams for course "${data.CourseName}" created.`, 'success');
      $('#createTeamsModal').modal('hide');
      $('#create-teams-form')[0].reset();
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to create teams. Please try again.', 'error');
    });
}

// Attach event handlers for creating reviews and teams
$(document).on('click', '.create-review-btn', function () {
  const courseId = $(this).data('id');
  $('#create-review-select-course').val(courseId);
  $('#createReviewModal').modal('show');
});

$(document).on('click', '.create-teams-btn', function () {
  const courseId = $(this).data('id');
  $('#create-teams-select-course').val(courseId);
  $('#createTeamsModal').modal('show');
});