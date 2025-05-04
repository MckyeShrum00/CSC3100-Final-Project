/**
 * Teams management functionality
 * Handles creating, editing, and managing teams
 */

// Global variables
let currentCourse = null;
let teamsList = [];

$(document).ready(function () {
  // Initialize the teams module if the section exists
  if ($('#teams-section').length) {
    loadTeamsList();
    setupTeamEventHandlers();
  }

  // Handle modal action
  $('#save-new-team').on('click', handleCreateTeam);
});

/**
 * Load teams list from the backend
 */
function loadTeamsList() {
  $('#teams-section').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading teams...</p>
    </div>
  `);

  fetch('http://localhost:8000/api/teams', {
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
            <h5 class="card-title">${team.name}</h5>
            <p class="card-text">${team.description || 'No description provided.'}</p>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-secondary edit-team-btn" data-id="${team.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-team-btn" data-id="${team.id}">
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
  if (!$('#new-team-form')[0].checkValidity()) {
    $('#new-team-form')[0].reportValidity();
    return;
  }

  const newTeam = {
    name: $('#team-name').val().trim(),
    description: $('#team-description').val().trim(),
  };

  fetch('http://localhost:8000/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify(newTeam),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to create team');
      }
      return response.json();
    })
    .then(data => {
      teamsList.push(data);
      renderTeamsList(teamsList);

      Swal.fire('Success!', `Team "${data.name}" created.`, 'success');
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
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete team');
          }
          teamsList = teamsList.filter(team => team.id !== teamId);
          renderTeamsList(teamsList);
          Swal.fire('Deleted!', 'The team has been deleted.', 'success');
        })
        .catch(() => {
          Swal.fire('Error', 'Failed to delete team. Please try again.', 'error');
        });
    }
  });
}

// Attach delete event handler
$(document).on('click', '.delete-team-btn', function () {
  const teamId = $(this).data('id');
  handleDeleteTeam(teamId);
});