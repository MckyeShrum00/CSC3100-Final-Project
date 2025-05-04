/**
 * Reporting and analytics for admin dashboard
 * Displays metrics on reviews, student participation, and course engagement
 */

$(document).ready(function () {
  if ($('#reports-section').length) {
    loadReports();
  }
});

/**
 * Load reports from the backend
 */
function loadReports() {
  $('#reports-section').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Generating reports...</p>
    </div>
  `);

  fetch('http://localhost:8000/api/reports', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      renderReportTable(data);
    })
    .catch(() => {
      $('#reports-section').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to load reports. Please try again later.
        </div>
      `);
    });
}

/**
 * Render report data in a table
 */
function renderReportTable(reports) {
  if (!reports || reports.length === 0) {
    $('#reports-section').html(`
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No reports available at the moment.
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