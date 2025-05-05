// TEAMS.JS
/**
 * Teams management functionality
 */

let teamsList = [];

$(document).ready(function () {
  if ($('#teams-section').length) {
    loadTeamsList();
    setupTeamEventHandlers();
  }

  $('#save-new-team').on('click', handleCreateTeam);
});

/**
 * Load teams list from the backend
 */
function loadTeamsList() {
  const courseId = $('#select-course').val(); // Assuming a dropdown exists to select a course

  if (!courseId) {
    $('#teams-section').html(`
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        Please select a course to view teams.
      </div>
    `);
    return;
  }

  $('#teams-section').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading teams...</p>
    </div>
  `);

  fetch(`http://localhost:8000/api/courses/${courseId}/teams`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      teamsList = data;
      renderTeamsList(teamsList);
    })
    .catch(() => {
      $('#teams-section').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to load teams. Please try again later.
        </div>
      `);
    });
}

/**
 * Render teams in a card view
 */
function renderTeamsList(teams) {
  if (!teams || teams.length === 0) {
    $('#teams-section').html(`
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No teams found. Use the "Create New Team" button to add one.
      </div>
    `);
    return;
  }

  let html = '<div class="row">';
  teams.forEach(team => {
    html += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${team.GroupName}</h5>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-danger delete-team-btn" data-id="${team.GroupID}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  $('#teams-section').html(html);
}

/**
 * Handle new team creation
 */
function handleCreateTeam() {
  const courseId = $('#create-team-select-course').val();
  const groupName = $('#team-name').val().trim();

  if (!courseId || !groupName) {
    Swal.fire('Error', 'All fields are required.', 'error');
    return;
  }

  fetch(`http://localhost:8000/api/courses/${courseId}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify({ groupName }),
  })
    .then(response => response.json())
    .then(data => {
      teamsList.push(data);
      renderTeamsList(teamsList);

      Swal.fire('Success!', `Team "${data.GroupName}" created.`, 'success');
      $('#newTeamModal').modal('hide');
      $('#new-team-form')[0].reset();
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to create team. Please try again.', 'error');
    });
}

/**
 * Handle team deletion
 */
function handleDeleteTeam(teamId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:8000/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
        },
      })
        .then(() => {
          teamsList = teamsList.filter(team => team.GroupID !== teamId);
          renderTeamsList(teamsList);
          Swal.fire('Deleted!', 'The team has been deleted.', 'success');
        })
        .catch(() => {
          Swal.fire('Error', 'Failed to delete team. Please try again.', 'error');
        });
    }
  });
}

// Attach event handlers for delete buttons
function setupTeamEventHandlers() {
  $(document).on('click', '.delete-team-btn', function () {
    const teamId = $(this).data('id');
    handleDeleteTeam(teamId);
  });

  $('#select-course').on('change', function () {
    loadTeamsList();
  });
}