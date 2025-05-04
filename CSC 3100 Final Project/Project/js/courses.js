// File: js/courses.js
/**
 * Course management functionality
 * Handles viewing, creating, editing, and managing courses
 */

let coursesList = [];

$(document).ready(function () {
  // Initialize course module if the section exists
  if ($('#courses-section').length) {
    loadCoursesList();
    setupCourseEventHandlers();
  }

  // Handle modal actions
  $('#save-new-course').on('click', handleCreateCourse);
});

/**
 * Load courses list from the backend
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

  fetch('http://localhost:8000/api/courses', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
  })
    .then(response => {
      if (response.status === 401) {
        // Redirect to login if token is invalid or expired
        window.location.href = '../index.html';
        return;
      }
      return response.json();
    })
    .then(data => {
      coursesList = data;
      renderCoursesList(coursesList);
    })
    .catch(() => {
      $('#courses-section').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to load courses. Please try again later.
        </div>
      `);
    });
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
 * Handle new course creation
 */
function handleCreateCourse() {
  if (!$('#new-course-form')[0].checkValidity()) {
    $('#new-course-form')[0].reportValidity();
    return;
  }

  const newCourse = {
    name: $('#course-name').val().trim(),
    code: $('#course-code').val().trim(),
    semester: $('#course-semester').val(),
    description: $('#course-description').val().trim(),
  };

  fetch('http://localhost:8000/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify(newCourse),
  })
    .then(response => {
      if (response.status === 401) {
        window.location.href = '../index.html';
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to create course');
      }
      return response.json();
    })
    .then(data => {
      coursesList.push(data);
      renderCoursesList(coursesList);

      Swal.fire('Success!', `Course "${data.name}" created.`, 'success');
      $('#newCourseModal').modal('hide');
      $('#new-course-form')[0].reset();
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to create course. Please try again.', 'error');
    });
}

/**
 * Handle course deletion
 */
function handleDeleteCourse(courseId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:8000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
        },
      })
        .then(response => {
          if (response.status === 401) {
            window.location.href = '../index.html';
            return;
          }
          if (!response.ok) {
            throw new Error('Failed to delete course');
          }
          coursesList = coursesList.filter(course => course.id !== courseId);
          renderCoursesList(coursesList);
          Swal.fire('Deleted!', 'The course has been deleted.', 'success');
        })
        .catch(() => {
          Swal.fire('Error', 'Failed to delete course. Please try again.', 'error');
        });
    }
  });
}

// Attach delete event handler
$(document).on('click', '.delete-course-btn', function () {
  const courseId = $(this).data('id');
  handleDeleteCourse(courseId);
});