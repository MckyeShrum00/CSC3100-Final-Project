// COURSES.JS
/**
 * Course management functionality
 */

let coursesList = [];

$(document).ready(function () {
  if ($('#courses').length) {
    loadCoursesList();
    setupCourseEventHandlers();
  }

  $('#save-new-course').on('click', handleCreateCourse);
  $('#save-edit-course').on('click', handleEditCourse);
});

/**
 * Load courses list from the backend
 */
function loadCoursesList() {
  $('#courses').html(`
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
    .then(response => response.json())
    .then(data => {
      console.log('Courses loaded successfully:', data); // Debugging log
      coursesList = data;
      renderCoursesList(coursesList);
    })
    .catch(error => {
      console.error('Error loading courses:', error); // Debugging log
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
    $('#courses').html(`
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
            <h5 class="card-title">${course.CourseName}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${course.CourseCode} - ${course.Semester}</h6>
            <p class="card-text">${course.Description || 'No description provided.'}</p>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-secondary edit-course-btn" data-id="${course.CourseID}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-course-btn" data-id="${course.CourseID}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  $('#courses').html(html);
}

/**
 * Handle new course creation
 */
function handleCreateCourse() {
  console.log('Create Course button clicked'); // Debugging log

  if (!$('#new-course-form')[0].checkValidity()) {
    console.error('Form validation failed'); // Debugging log
    $('#new-course-form')[0].reportValidity();
    return;
  }

  const newCourse = {
    courseName: $('#course-name').val().trim(),
    courseCode: $('#course-code').val().trim(),
    semester: $('#course-semester').val(),
    description: $('#course-description').val().trim(),
  };

  console.log('New course data:', newCourse); // Debugging log

  fetch('http://localhost:8000/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify(newCourse),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to create course');
      }
      return response.json();
    })
    .then(data => {
      console.log('Course created successfully:', data); // Debugging log
      coursesList.push(data);
      renderCoursesList(coursesList);

      Swal.fire('Success!', `Course "${data.courseName}" created.`, 'success');
      $('#newCourseModal').modal('hide');
      $('#new-course-form')[0].reset();
    })
    .catch(error => {
      console.error('Error creating course:', error); // Debugging log
      Swal.fire('Error', 'Failed to create course. Please try again.', 'error');
    });
}

/**
 * Handle course editing
 */
function handleEditCourse() {
  const courseId = $('#edit-course-id').val();
  const updatedCourse = {
    courseName: $('#edit-course-name').val().trim(),
    courseCode: $('#edit-course-code').val().trim(),
    semester: $('#edit-course-semester').val(),
    description: $('#edit-course-description').val().trim(),
  };

  console.log('Editing course with ID:', courseId, 'Updated data:', updatedCourse); // Debugging log

  fetch(`http://localhost:8000/api/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify(updatedCourse),
  })
    .then(response => response.json())
    .then(() => {
      console.log('Course updated successfully'); // Debugging log
      const index = coursesList.findIndex(course => course.CourseID === parseInt(courseId));
      if (index !== -1) {
        coursesList[index] = { ...coursesList[index], ...updatedCourse };
        renderCoursesList(coursesList);
      }

      Swal.fire('Success!', 'Course updated successfully.', 'success');
      $('#editCourseModal').modal('hide');
    })
    .catch(error => {
      console.error('Error updating course:', error); // Debugging log
      Swal.fire('Error', 'Failed to update course. Please try again.', 'error');
    });
}

/**
 * Handle course deletion
 */
function handleDeleteCourse(courseId) {
  console.log('Deleting course with ID:', courseId); // Debugging log

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
        .then(() => {
          console.log('Course deleted successfully'); // Debugging log
          coursesList = coursesList.filter(course => course.CourseID !== courseId);
          renderCoursesList(coursesList);
          Swal.fire('Deleted!', 'The course has been deleted.', 'success');
        })
        .catch(error => {
          console.error('Error deleting course:', error); // Debugging log
          Swal.fire('Error', 'Failed to delete course. Please try again.', 'error');
        });
    }
  });
}

// These attach event handlers
function setupCourseEventHandlers() {
  $(document).on('click', '.edit-course-btn', function () {
    const courseId = $(this).data('id');
    const course = coursesList.find(course => course.CourseID === courseId);

    if (course) {
      console.log('Editing course:', course); // Debugging log
      $('#edit-course-id').val(course.CourseID);
      $('#edit-course-name').val(course.CourseName);
      $('#edit-course-code').val(course.CourseCode);
      $('#edit-course-semester').val(course.Semester);
      $('#edit-course-description').val(course.Description);

      $('#editCourseModal').modal('show');
    }
  });

  $(document).on('click', '.delete-course-btn', function () {
    const courseId = $(this).data('id');
    handleDeleteCourse(courseId);
  });
}