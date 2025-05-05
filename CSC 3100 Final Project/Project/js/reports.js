/**
 * Reporting and analytics for admin dashboard
 * Displays metrics on reviews, student participation, and course engagement
 */

$(document).ready(function () {
  if ($('#reports-section').length) {
    loadCourseReports();
    setupReportEventHandlers();
  }
});

/**
 * Load summary stats for a course
 */
function loadCourseReports(courseId = null) {
  $('#reports-section').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Generating course reports...</p>
    </div>
  `);

  const url = courseId
    ? `http://localhost:8000/api/reports/${courseId}`
    : `http://localhost:8000/api/reports`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      renderCourseReportTable(data);
    })
    .catch(() => {
      $('#reports-section').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to load course reports. Please try again later.
        </div>
      `);
    });
}

/**
 * Render course report data in a table
 */
function renderCourseReportTable(reports) {
  if (!reports || reports.length === 0) {
    $('#reports-section').html(`
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No course reports available at the moment.
      </div>
    `);
    return;
  }

  let html = `
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
  `;

  reports.forEach(report => {
    html += `
      <tr>
        <td>${report.metric}</td>
        <td>${report.value}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  $('#reports-section').html(html);
}

/**
 * Load detailed team report for a course and team
 */
function loadTeamReport(courseId, teamId) {
  $('#team-report-section').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Generating team report...</p>
    </div>
  `);

  fetch(`http://localhost:8000/api/reports/${courseId}/team/${teamId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      renderTeamReportTable(data);
    })
    .catch(() => {
      $('#team-report-section').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to load team report. Please try again later.
        </div>
      `);
    });
}

/**
 * Render team report data in a table
 */
function renderTeamReportTable(report) {
  if (!report || report.length === 0) {
    $('#team-report-section').html(`
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No team report available at the moment.
      </div>
    `);
    return;
  }

  let html = `
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
  `;

  report.forEach(item => {
    html += `
      <tr>
        <td>${item.metric}</td>
        <td>${item.value}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  $('#team-report-section').html(html);
}

/**
 * Sets up event handlers for the reports dashboard
 */
function setupReportEventHandlers() {
  // Load course report when a course is selected
  $('#select-course').on('change', function () {
    const courseId = $(this).val();
    if (courseId) {
      loadCourseReports(courseId);
    }
  });

  // Load team report when a team is selected
  $('#select-team').on('change', function () {
    const courseId = $('#select-course').val();
    const teamId = $(this).val();
    if (courseId && teamId) {
      loadTeamReport(courseId, teamId);
    }
  });
}