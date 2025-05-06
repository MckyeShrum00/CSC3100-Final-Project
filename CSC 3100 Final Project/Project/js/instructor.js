// File: js/instructor.js
/**
 * Instructor-specific dashboard functionality 
 */

let instructorCourses = [];


$(document).ready(function () {
  const currentUser = getCurrentUser();

  if (currentUser && currentUser.userType === 'admin') {
    $('#user-name').text(`${currentUser.firstName} ${currentUser.lastName}`);
    initializeInstructorDashboard();
  } else if (currentUser && currentUser.userType !== 'admin') {
    // Redirect others (e.g., student/admin)
    window.location.href = 'student-dashboard.html';
  }
});

/**
 * Initialize the instructor dashboard by loading courses and stats
 */
function initializeInstructorDashboard() {
  loadInstructorCourses();
  setupInstructorEventHandlers();
}

/**
 * Load courses assigned to the instructor (simulated fetch)
 */
function loadInstructorCourses() {
  $('#courses').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading your courses...</p>
    </div>
  `);

  
  setTimeout(() => {
    instructorCourses = [
      { id: 'CS101', name: 'CS 101: Intro to Computer Science', teamCount: 3, reviewCount: 2 },
      { id: 'SE210', name: 'SE 210: Software Engineering', teamCount: 2, reviewCount: 4 }
    ];
    renderInstructorCourses(instructorCourses);
  }, 600);
}

/**
 * Render cards for instructor courses with quick actions
 */
function renderInstructorCourses(courses) {
  let html = '<div class="row">';
  courses.forEach(course => {
    html += `
      <div class="col-md-6 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${course.name}</h5>
            <p class="card-text">
              Teams: <strong>${course.teamCount}</strong><br>
              Reviews: <strong>${course.reviewCount}</strong>
            </p>
            <div class="d-grid gap-2">
              <button class="btn btn-outline-info btn-sm create-team-btn" data-course="${course.id}">
                <i class="bi bi-people"></i> Create Team
              </button>
              <button class="btn btn-outline-warning btn-sm create-review-btn" data-course="${course.id}">
                <i class="bi bi-clipboard-check"></i> Start Review
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';

  $('#courses').html(html);
}

/**
 * Set up button interactions for instructors
 */
function setupInstructorEventHandlers() {
  $(document).on('click', '.create-team-btn', function () {
    const courseId = $(this).data('course');
    $('#team-course').val(courseId);
    $('#createTeamModal').modal('show');
  });

  $(document).on('click', '.create-review-btn', function () {
    const courseId = $(this).data('course');
    Swal.fire({
      title: 'Start a Review?',
      text: `Start a new peer review session for ${courseId}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, start it!'
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire('Started!', 'The peer review session is now active.', 'success');
        // Simulated backend action
      }
    });
  });
}

