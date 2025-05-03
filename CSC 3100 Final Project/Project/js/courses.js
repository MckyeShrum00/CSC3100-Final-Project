// File: js/courses.js
/**
 * Course management functionality 
 * Handles viewing, creating, and managing courses
 */

let coursesList = [];

$(document).ready(function () {
  // Initialize course module if the section exists
  if ($('#courses-section').length) {
    loadCoursesList();
    setupCourseEventHandlers();
  }

  // Handle modal action
  $('#save-new-course').on('click', handleCreateCourse);
});

/**
 * Load courses list (simulated fetch)
 */
function loadCoursesList() {
  $('#courses-section').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading courses...</p>
    </div>
  `);

  setTimeout(() => {
    // Sample static data
    coursesList = [
      { id: 1, name: 'Introduction to Computer Science', code: 'CS 101', semester: 'Spring 2025', description: 'Intro course for CS fundamentals.' },
      { id: 2, name: 'Software Engineering', code: 'SE 210', semester: 'Spring 2025', description: 'Covers agile practices and SDLC.' },
      { id: 3, name: 'Database Systems', code: 'DB 305', semester: 'Fall 2025', description: 'Hands-on with SQL and NoSQL.' }
    ];
    renderCoursesList(coursesList);
  }, 800);
}

/**
 * Render courses in a card view
 */
function renderCoursesList(courses) {
  if (!courses || courses.length === 0) {
    $('#courses-section').html(`
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No courses found. Use the "Create New Course" button to add one.
      </div>
    `);
    return;
  }

  let html = '<div class="row">';
  courses.forEach(course => {
    html += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${course.name}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${course.code} - ${course.semester}</h6>
            <p class="card-text">${course.description || 'No description provided.'}</p>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-secondary edit-course-btn" data-id="${course.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-course-btn" data-id="${course.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  $('#courses-section').html(html);
}

/**
 * Set up course modal and card button event handlers
 */
function setupCourseEventHandlers() {
  $(document).on('click', '.edit-course-btn', function () {
    const courseId = $(this).data('id');
    const course = coursesList.find(c => c.id === courseId);
    if (course) {
      $('#newCourseModalLabel').text('Edit Course');
      $('#course-name').val(course.name);
      $('#course-code').val(course.code);
      $('#course-semester').val(course.semester);
      $('#course-description').val(course.description);
      $('#newCourseModal').modal('show');
    }
  });

  $(document).on('click', '.delete-course-btn', function () {
    const courseId = $(this).data('id');
    const course = coursesList.find(c => c.id === courseId);
    if (!course) return;

    Swal.fire({
      title: 'Delete Course',
      text: `Are you sure you want to delete "${course.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        coursesList = coursesList.filter(c => c.id !== courseId);
        renderCoursesList(coursesList);
        Swal.fire('Deleted!', 'The course has been deleted.', 'success');
      }
    });
  });
}

/**
 * Handle new course creation 
 */
function handleCreateCourse() {
  if (!$('#new-course-form')[0].checkValidity()) {
    $('#new-course-form')[0].reportValidity();
    return;
  }

  const newCourse = {
    id: Math.floor(Math.random() * 10000),
    name: $('#course-name').val().trim(),
    code: $('#course-code').val().trim(),
    semester: $('#course-semester').val(),
    description: $('#course-description').val().trim()
  };

  coursesList.push(newCourse);
  renderCoursesList(coursesList);

  Swal.fire('Success!', `Course "${newCourse.name}" created.`, 'success');
  $('#newCourseModal').modal('hide');
  $('#new-course-form')[0].reset();
}
