/**
 * Teams management functionality 
 * Handles creating, editing, and managing teams
 */

// Global variables
let currentCourse = null;
let teamsList = [];

$(document).ready(function() {
  // Initialize teams components
  initializeTeamsModule();
  
  // Setup event handlers
  setupTeamsEventHandlers();
});

/**
 * Initialize the teams module
 */
function initializeTeamsModule() {
  // Check if we're on the teams page
  if ($('#teams').length) {
    loadTeamsList();
  }
  console.log('test')
  
  // Initialize select2 for better dropdown UX if available
  if ($.fn.select2) {
    $('.team-member-select').select2({
      placeholder: 'Select team members',
      width: '100%'
    });
  }
}

/**
 * Setup event handlers for teams functionality
 */
function setupTeamsEventHandlers() {
  // Create team button
  $('#create-team-btn').on('click', function() {
    showCreateTeamModal();
  });
  
  // Team formation method change
  $('#team-method').on('change', function() {
    const method = $(this).val();
    $('#manual-selection-container, #random-assignment-container').hide();
    
    if (method === 'manual') {
      $('#manual-selection-container').show();
    } else if (method === 'random') {
      $('#random-assignment-container').show();
    }
  });
  
  // Course selection change
  $('#team-course').on('change', function() {
    const courseId = $(this).val();
    if (courseId) {
      loadCourseStudents(courseId);
    }
  });
  
  // Save team button
  $('#save-create-team').on('click', function() {
    handleCreateTeam();
  });
  
  // Edit team button (using event delegation for dynamically created elements)
  $(document).on('click', '.edit-team-btn', function() {
    const teamId = $(this).data('team-id');
    editTeam(teamId);
  });
  
  // Delete team button (using event delegation)
  $(document).on('click', '.delete-team-btn', function() {
    const teamId = $(this).data('team-id');
    confirmDeleteTeam(teamId);
  });
  
  // View team button (using event delegation)
  $(document).on('click', '.view-team-btn', function() {
    const teamId = $(this).data('team-id');
    viewTeamDetails(teamId);
  });
}

/**
 * Load teams list from the server
 */
function loadTeamsList() {
  
  // Show loading state
  $('#teams').html('<div class="text-center my-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Loading teams...</p></div>');
  
  setTimeout(() => {
    // teams data
    teamsList = [
      {
        id: 1,
        name: 'Team Alpha',
        courseId: 'CS101',
        courseName: 'Introduction to Computer Science',
        memberCount: 5,
        createdDate: '2025-03-15'
      },
      {
        id: 2,
        name: 'Team Beta',
        courseId: 'CS101',
        courseName: 'Introduction to Computer Science',
        memberCount: 4,
        createdDate: '2025-03-15'
      },
      {
        id: 3,
        name: 'Team Gamma',
        courseId: 'CS101',
        courseName: 'Introduction to Computer Science',
        memberCount: 5,
        createdDate: '2025-03-15'
      },
      {
        id: 4,
        name: 'Agile Team',
        courseId: 'SE210',
        courseName: 'Software Engineering',
        memberCount: 6,
        createdDate: '2025-02-28'
      },
      {
        id: 5,
        name: 'Team SQL',
        courseId: 'DB305',
        courseName: 'Database Systems',
        memberCount: 3,
        createdDate: '2025-04-05'
      }
    ];
    
    renderTeamsList(teamsList);
  }, 800);
}

/**
 * Renders the teams list in the UI
 * @param {Array} teams List of teams to display
 */
function renderTeamsList(teams) {
  if (!teams || teams.length === 0) {
    $('#teams').html(`
      <div class="alert alert-info" role="alert">
        <i class="bi bi-info-circle me-2"></i>
        No teams have been created yet. Click the "Create Team" button to get started.
      </div>
    `);
    return;
  }
  
  // Group teams by course
  const teamsByCourse = {};
  teams.forEach(team => {
    if (!teamsByCourse[team.courseId]) {
      teamsByCourse[team.courseId] = {
        courseName: team.courseName,
        teams: []
      };
    }
    teamsByCourse[team.courseId].teams.push(team);
  });
  

  let html = '';
  
  Object.keys(teamsByCourse).forEach(courseId => {
    const courseData = teamsByCourse[courseId];
    
    html += `
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">${courseData.courseName} (${courseId})</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <caption>Teams for ${courseData.courseName}</caption>
              <thead>
                <tr>
                  <th scope="col">Team Name</th>
                  <th scope="col">Members</th>
                  <th scope="col">Created Date</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
    `;
    
    courseData.teams.forEach(team => {
      html += `
        <tr>
          <td>${team.name}</td>
          <td>${team.memberCount} students</td>
          <td>${formatDate(team.createdDate)}</td>
          <td>
            <div class="btn-group" role="group" aria-label="Team actions">
              <button type="button" class="btn btn-sm btn-outline-primary view-team-btn" data-team-id="${team.id}" aria-label="View team details">
                <i class="bi bi-eye" aria-hidden="true"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary edit-team-btn" data-team-id="${team.id}" aria-label="Edit team">
                <i class="bi bi-pencil" aria-hidden="true"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger delete-team-btn" data-team-id="${team.id}" aria-label="Delete team">
                <i class="bi bi-trash" aria-hidden="true"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    
    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  });
  
  $('#teams').html(html);
}

/**
 * Shows the create team modal
 */
function showCreateTeamModal() {
  // Reset the form
  $('#create-team-form')[0].reset();
  $('#manual-selection-container, #random-assignment-container').hide();
  
  // Load available courses
  loadAvailableCourses();
  
  // Show the modal
  $('#createTeamModal').modal('show');
}

/**
 * Loads available courses for the team creation dropdown
 */
function loadAvailableCourses() {
  const courses = [
    { id: 'CS101', name: 'CS 101: Introduction to Computer Science' },
    { id: 'SE210', name: 'SE 210: Software Engineering' },
    { id: 'DB305', name: 'DB 305: Database Systems' }
  ];
  
  const $courseSelect = $('#team-course');
  $courseSelect.empty();
  $courseSelect.append('<option value="">Select a course</option>');
  
  courses.forEach(course => {
    $courseSelect.append(`<option value="${course.id}">${course.name}</option>`);
  });
}

/**
 * Loads students for a specific course
 * @param {string} courseId The course ID to load students for
 */
function loadCourseStudents(courseId) {
  // Store the current course ID
  currentCourse = courseId;
  
  // Sample students data
  const students = [
    { id: 1, name: 'John Doe', email: 'jdoe@school.edu' },
    { id: 2, name: 'Jane Smith', email: 'jsmith@school.edu' },
    { id: 3, name: 'Alex Johnson', email: 'ajohnson@school.edu' },
    { id: 4, name: 'Sam Williams', email: 'swilliams@school.edu' },
    { id: 5, name: 'Taylor Brown', email: 'tbrown@school.edu' },
    { id: 6, name: 'Morgan Miller', email: 'mmiller@school.edu' },
    { id: 7, name: 'Riley Wilson', email: 'rwilson@school.edu' },
    { id: 8, name: 'Jordan Lee', email: 'jlee@school.edu' }
  ];
  
  // Update the students dropdown
  const $studentsSelect = $('#team-members');
  $studentsSelect.empty();
  
  students.forEach(student => {
    $studentsSelect.append(`<option value="${student.id}">${student.name} (${student.email})</option>`);
  });
}

/**
 * Handles creating a new team
 */
function handleCreateTeam() {
  if (!$('#create-team-form')[0].checkValidity()) {
    $('#create-team-form')[0].reportValidity();
    return;
  }
  
  const teamData = {
    course: $('#team-course').val(),
    name: $('#team-name').val().trim(),
    method: $('#team-method').val()
  };
  
  if (!teamData.course || !teamData.name || !teamData.method) {
    Swal.fire({
      title: 'Missing Information',
      text: 'Please fill in all required fields.',
      icon: 'error'
    });
    return;
  }
  
  if (teamData.method === 'manual') {
    const selectedMembers = $('#team-members').val();
    if (!selectedMembers || selectedMembers.length === 0) {
      Swal.fire({
        title: 'No Members Selected',
        text: 'Please select at least one team member.',
        icon: 'warning'
      });
      return;
    }
    teamData.members = selectedMembers;
  } else if (teamData.method === 'random') {
    teamData.count = $('#team-count').val();
    teamData.balanced = $('#balance-teams').prop('checked');
  }
  
  $('#save-create-team').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...');
  
  setTimeout(() => {
    // Add to the teams list 
    const newTeam = {
      id: Math.floor(Math.random() * 1000) + 10, // Generate random ID
      name: teamData.name,
      courseId: teamData.course,
      courseName: $(`#team-course option[value="${teamData.course}"]`).text().replace(teamData.course + ': ', ''),
      memberCount: teamData.method === 'manual' ? teamData.members.length : Math.floor(8 / teamData.count),
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    teamsList.push(newTeam);
    
    // Re-render the teams list
    renderTeamsList(teamsList);
    
    Swal.fire({
      title: 'Success!',
      text: `Team "${teamData.name}" has been created.`,
      icon: 'success'
    }).then(() => {
      $('#createTeamModal').modal('hide');
      $('#create-team-form')[0].reset();
      $('#manual-selection-container, #random-assignment-container').hide();
      $('#save-create-team').prop('disabled', false).html('Create Team');
    });
  }, 1000);
}

/**
 * Opens the edit team modal for a specific team
 * @param {number} teamId The ID of the team to edit
 */
function editTeam(teamId) {
  // Find the team in our list
  const team = teamsList.find(t => t.id === teamId);
  if (!team) {
    Swal.fire({
      title: 'Error',
      text: 'Team not found',
      icon: 'error'
    });
    return;
  }
  
  // Reset the form
  $('#create-team-form')[0].reset();
  
  // Populate the form with team data
  $('#team-course').val(team.courseId);
  $('#team-name').val(team.name);
  
  // Default to manual selection for editing
  $('#team-method').val('manual');
  $('#manual-selection-container').show();
  $('#random-assignment-container').hide();
  
  // Load course students 
  loadCourseStudents(team.courseId);
  
  // Update modal title
  $('#createTeamModalLabel').text('Edit Team');
  $('#save-create-team').text('Save Changes');
  
  // Show the modal
  $('#createTeamModal').modal('show');
  
  // After modal is shown, we would load team members in a real app
  setTimeout(() => {
    // Simulate selecting 3 random students
    const randomIndexes = [1, 3, 5]; // Just for demo
    $('#team-members').val(randomIndexes);
    
    // If using select2, trigger change event
    if ($.fn.select2) {
      $('#team-members').trigger('change');
    }
  }, 500);
}

/**
 * Confirms deletion of a team
 * @param {number} teamId The ID of the team to delete
 */
function confirmDeleteTeam(teamId) {
  // Find the team in our list
  const team = teamsList.find(t => t.id === teamId);
  if (!team) {
    Swal.fire({
      title: 'Error',
      text: 'Team not found',
      icon: 'error'
    });
    return;
  }
  
  Swal.fire({
    title: 'Delete Team',
    text: `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteTeam(teamId);
    }
  });
}

/**
 * Deletes a team
 * @param {number} teamId The ID of the team to delete
 */
function deleteTeam(teamId) {
  setTimeout(() => {
    // Remove from the teams list
    teamsList = teamsList.filter(t => t.id !== teamId);
    
    // Re-render the teams list
    renderTeamsList(teamsList);
    
    Swal.fire({
      title: 'Deleted!',
      text: 'The team has been deleted.',
      icon: 'success'
    });
  }, 800);
}

/**
 * Shows the team details modal
 * @param {number} teamId The ID of the team to view
 */
function viewTeamDetails(teamId) {
  // Find the team in our list
  const team = teamsList.find(t => t.id === teamId);
  if (!team) {
    Swal.fire({
      title: 'Error',
      text: 'Team not found',
      icon: 'error'
    });
    return;
  }
  
  // Sample team members
  const teamMembers = [
    { id: 1, name: 'John Doe', email: 'jdoe@school.edu', role: 'Team Lead' },
    { id: 3, name: 'Alex Johnson', email: 'ajohnson@school.edu', role: 'Member' },
    { id: 5, name: 'Taylor Brown', email: 'tbrown@school.edu', role: 'Member' },
    { id: 7, name: 'Riley Wilson', email: 'rwilson@school.edu', role: 'Member' }
  ];
  
  // Build members HTML
  let membersHtml = '';
  teamMembers.forEach(member => {
    membersHtml += `
      <tr>
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td>${member.role}</td>
      </tr>
    `;
  });
  
  Swal.fire({
    title: team.name,
    html: `
      <div class="text-start">
        <p><strong>Course:</strong> ${team.courseName} (${team.courseId})</p>
        <p><strong>Created:</strong> ${formatDate(team.createdDate)}</p>
        <hr>
        <h5>Team Members:</h5>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${membersHtml}
            </tbody>
          </table>
        </div>
      </div>
    `,
    width: '600px'
  });
}

/**
 * Formats a date string to a more readable format
 * @param {string} dateString The date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadTeamsList,
    createTeam: handleCreateTeam,
    editTeam,
    deleteTeam,
    viewTeamDetails
  };
}