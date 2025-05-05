// STUDENT.JS
/**
 * Student dashboard functionality
 */

let studentList = [];

$(document).ready(function () {
  // Load user data
  const currentUser = getCurrentUser();

  if (currentUser) {
    // Update user name in the navbar
    $('#user-name').text(`${currentUser.firstName} ${currentUser.lastName}`);

    // Check if student, if not redirect
    if (currentUser.userType === 'admin') {
      window.location.href = 'admin-dashboard.html';
    }
  }

  // Initialize dashboard components
  initializeDataTables();
  loadStudentData();
  setupEventHandlers();
});

/**
 * Initializes DataTables for better table functionality
 */
function initializeDataTables() {
  if ($.fn.DataTable) {
    $('.data-table').DataTable({
      responsive: true,
      order: [[0, 'asc']],
    });
  }
}

/**
 * Loads student data (courses, reviews, feedback)
 */
function loadStudentData() {
  fetch('http://localhost:8000/api/students', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      studentList = data;
      renderStudentList(studentList);
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to load student data. Please try again later.', 'error');
    });
}

/**
 * Render student list in a table
 */
function renderStudentList(students) {
  if (!students || students.length === 0) {
    $('#student-table-body').html(`
      <tr>
        <td colspan="5" class="text-center">No students found.</td>
      </tr>
    `);
    return;
  }

  let html = '';
  students.forEach(student => {
    html += `
      <tr>
        <td>${student.StudentID}</td>
        <td>${student.FirstName} ${student.LastName}</td>
        <td>${student.Email}</td>
        <td>${student.EnrollmentDate}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary edit-student-btn" data-id="${student.StudentID}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-student-btn" data-id="${student.StudentID}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  $('#student-table-body').html(html);
}

/**
 * Handle adding a new student
 */
function handleAddStudent() {
  if (!$('#add-student-form')[0].checkValidity()) {
    $('#add-student-form')[0].reportValidity();
    return;
  }

  const newStudent = {
    firstName: $('#student-first-name').val().trim(),
    lastName: $('#student-last-name').val().trim(),
    email: $('#student-email').val().trim(),
    enrollmentDate: $('#student-enrollment-date').val(),
  };

  fetch('http://localhost:8000/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify(newStudent),
  })
    .then(response => response.json())
    .then(data => {
      studentList.push(data);
      renderStudentList(studentList);

      Swal.fire('Success!', `Student "${data.FirstName} ${data.LastName}" added.`, 'success');
      $('#addStudentModal').modal('hide');
      $('#add-student-form')[0].reset();
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to add student. Please try again.', 'error');
    });
}

/**
 * Handle editing a student
 */
function handleEditStudent() {
  const studentId = $('#edit-student-id').val();
  const updatedStudent = {
    firstName: $('#edit-student-first-name').val().trim(),
    lastName: $('#edit-student-last-name').val().trim(),
    email: $('#edit-student-email').val().trim(),
    enrollmentDate: $('#edit-student-enrollment-date').val(),
  };

  fetch(`http://localhost:8000/api/students/${studentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify(updatedStudent),
  })
    .then(response => response.json())
    .then(() => {
      const index = studentList.findIndex(student => student.StudentID === parseInt(studentId));
      if (index !== -1) {
        studentList[index] = { ...studentList[index], ...updatedStudent };
        renderStudentList(studentList);
      }

      Swal.fire('Success!', 'Student updated successfully.', 'success');
      $('#editStudentModal').modal('hide');
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to update student. Please try again.', 'error');
    });
}

/**
 * Handle deleting a student
 */
function handleDeleteStudent(studentId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:8000/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
        },
      })
        .then(() => {
          studentList = studentList.filter(student => student.StudentID !== studentId);
          renderStudentList(studentList);
          Swal.fire('Deleted!', 'The student has been deleted.', 'success');
        })
        .catch(() => {
          Swal.fire('Error', 'Failed to delete student. Please try again.', 'error');
        });
    }
  });
}

/**
 * Sets up event handlers for the student dashboard
 */
function setupEventHandlers() {
  // Add student handler
  $('#btn-add-student').on('click', function () {
    $('#addStudentModal').modal('show');
  });

  $('#save-new-student').on('click', handleAddStudent);

  // Edit student handler
  $(document).on('click', '.edit-student-btn', function () {
    const studentId = $(this).data('id');
    const student = studentList.find(student => student.StudentID === studentId);

    if (student) {
      $('#edit-student-id').val(student.StudentID);
      $('#edit-student-first-name').val(student.FirstName);
      $('#edit-student-last-name').val(student.LastName);
      $('#edit-student-email').val(student.Email);
      $('#edit-student-enrollment-date').val(student.EnrollmentDate);

      $('#editStudentModal').modal('show');
    }
  });

  $('#save-edit-student').on('click', handleEditStudent);

  // Delete student handler
  $(document).on('click', '.delete-student-btn', function () {
    const studentId = $(this).data('id');
    handleDeleteStudent(studentId);
  });
}