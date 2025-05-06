// File: js/reports.js
/**
 * Reporting and analytics for admin dashboard
 * Displays metrics on reviews, student participation, and course engagement
 */

$(document).ready(function () {
    if ($('#reports').length) {
      loadReports();
    }
  });
  
  /**
   * Simulates report generation
   */
  function loadReports() {
    $('#reports').html(`
      <div class="text-center my-5">
        <div class="spinner-border text-info" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Generating reports...</p>
      </div>
    `);
  
    setTimeout(() => {
      const reportData = [
        {
          course: 'CS 101',
          totalStudents: 20,
          submittedReviews: 18,
          completionRate: '90%',
          flagged: 1
        },
        {
          course: 'SE 210',
          totalStudents: 15,
          submittedReviews: 14,
          completionRate: '93%',
          flagged: 0
        },
        {
          course: 'DB 305',
          totalStudents: 10,
          submittedReviews: 7,
          completionRate: '70%',
          flagged: 3
        }
      ];
  
      renderReportTable(reportData);
    }, 800);
  }
  
  /**
   * Render report table with summary metrics
   * @param {Array} data 
   */
  function renderReportTable(data) {
    let html = `
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Peer Review Completion Report</h5>
        </div>
        <div class="card-body table-responsive">
          <table class="table table-striped">
            <caption>Summary of review participation by course</caption>
            <thead>
              <tr>
                <th>Course</th>
                <th>Total Students</th>
                <th>Submitted Reviews</th>
                <th>Completion Rate</th>
                <th>Flagged Reviews</th>
              </tr>
            </thead>
            <tbody>
    `;
  
    data.forEach(row => {
      html += `
        <tr>
          <td>${row.course}</td>
          <td>${row.totalStudents}</td>
          <td>${row.submittedReviews}</td>
          <td>${row.completionRate}</td>
          <td class="${row.flagged > 0 ? 'text-danger fw-bold' : 'text-muted'}">${row.flagged}</td>
        </tr>
      `;
    });
  
    html += `
            </tbody>
          </table>
        </div>
        <div class="card-footer text-end">
          <button class="btn btn-outline-secondary btn-sm" id="export-report">
            <i class="bi bi-download me-1"></i>Export CSV
          </button>
        </div>
      </div>
    `;
  
    $('#reports').html(html);
  
    // Export handler
    $('#export-report').on('click', () => {
      exportReportToCSV(data);
    });
  }
  
  /**
   * Export report data to CSV (client-side)
   * @param {Array} data 
   */
  function exportReportToCSV(data) {
    const headers = ['Course', 'Total Students', 'Submitted Reviews', 'Completion Rate', 'Flagged Reviews'];
    const rows = data.map(r => [r.course, r.totalStudents, r.submittedReviews, r.completionRate, r.flagged]);
  
    let csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'peer_review_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  