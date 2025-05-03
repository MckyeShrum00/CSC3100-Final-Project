// File: js/reviews.js
/**
 * Reviews management functionality 
 * Handles creating, editing, managing, and completing peer reviews
 */

// Global variables
let reviewsList = [];
let currentReview = null;
let reviewQuestions = [];
let reviewTeamMembers = [];

$(document).ready(function () {
  initializeReviewsModule();
  setupReviewsEventHandlers();
});

function initializeReviewsModule() {
  if ($('#reviews-container').length) loadReviewsList();
  if ($('#pending-reviews-container').length) loadPendingReviews();
  if ($('#completed-reviews-container').length) loadCompletedReviews();
}

function setupReviewsEventHandlers() {
  $('#create-review-btn').on('click', showCreateReviewModal);
  $('#add-question-btn').on('click', addNewQuestion);

  $(document).on('change', '.question-type-select', function () {
    const questionId = $(this).attr('id').split('-')[1];
    updateQuestionOptions(questionId, $(this).val());
  });

  $(document).on('click', '.remove-question-btn', function () {
    if ($('.question-card').length > 1) {
      $(this).closest('.question-card').remove();
    } else {
      Swal.fire({
        title: 'Warning',
        text: 'You must have at least one question in the review.',
        icon: 'warning'
      });
    }
  });

  $('#save-create-review').on('click', handleCreateReview);
  $('#save-schedule-review').on('click', handleScheduleReview); // optional
  $('#review-course').on('change', function () {
    const courseId = $(this).val();
    if (courseId) loadCourseTeams(courseId);
  });

  $(document).on('click', '.edit-review-btn', function () {
    const id = $(this).data('review-id');
    editReview(id); // implement if needed
  });

  $(document).on('click', '.delete-review-btn', function () {
    const id = $(this).data('review-id');
    confirmDeleteReview(id); // implement if needed
  });

  $(document).on('click', '.view-review-btn', function () {
    const id = $(this).data('review-id');
    viewReviewDetails(id); // implement if needed
  });

  $(document).on('click', '.start-review-btn', function () {
    const id = $(this).data('review-id');
    startReview(id); // implement if needed
  });

  $('#submit-review-btn').on('click', submitReview);
  $('#toggle-public-feedback').on('change', function () {
    $('.public-feedback-container').toggle($(this).prop('checked'));
  });
}

function showCreateReviewModal() {
  $('#create-review-form')[0].reset();
  $('#createReviewModalLabel').text('Create New Review');
  $('#save-create-review').text('Create Review');
  $('#questions-container').empty();
  addNewQuestion();
  loadAvailableCourses();
  $('#createReviewModal').modal('show');
}

function addNewQuestion() {
  const count = $('.question-card').length + 1;
  const html = `
    <div class="card mb-3 question-card">
      <div class="card-body">
        <div class="row mb-2">
          <div class="col-md-8">
            <label for="question-${count}-text" class="form-label">Question Text</label>
            <input type="text" class="form-control" id="question-${count}-text" placeholder="Enter your question" required>
          </div>
          <div class="col-md-4">
            <label for="question-${count}-type" class="form-label">Question Type</label>
            <select class="form-select question-type-select" id="question-${count}-type" required>
              <option value="likert">Likert Scale</option>
              <option value="multiple">Multiple Choice</option>
              <option value="text">Short Answer</option>
            </select>
          </div>
        </div>
        <div class="question-options" id="question-${count}-options">
          ${generateLikertOptions()}
        </div>
        <div class="form-check form-switch mt-3">
          <input class="form-check-input" type="checkbox" id="question-${count}-required" checked>
          <label class="form-check-label" for="question-${count}-required">Required</label>
        </div>
        <div class="text-end mt-2">
          <button type="button" class="btn btn-sm btn-outline-danger remove-question-btn">
            <i class="bi bi-trash"></i> Remove
          </button>
        </div>
      </div>
    </div>
  `;
  $('#questions-container').append(html);
}

function updateQuestionOptions(questionId, type) {
  const container = $(`#question-${questionId}-options`);
  container.empty();

  if (type === 'likert') {
    container.html(generateLikertOptions());
  } else if (type === 'multiple') {
    container.html(`
      <label class="form-label">Answer Options</label>
      ${['A', 'B', 'C'].map(letter => `
        <div class="input-group mb-2">
          <span class="input-group-text">${letter}</span>
          <input type="text" class="form-control" placeholder="Option ${letter}">
        </div>
      `).join('')}
    `);
  } else if (type === 'text') {
    container.html(`
      <label class="form-label">Max Answer Length</label>
      <div class="input-group">
        <input type="number" class="form-control" value="500" min="50" max="2000">
        <span class="input-group-text">characters</span>
      </div>
    `);
  }
}

function generateLikertOptions() {
  const labels = ['Poor', 'Below Avg', 'Average', 'Above Avg', 'Excellent'];
  return `
    <label class="form-label">Scale Options</label>
    ${labels.map((label, i) => `
      <div class="input-group mb-2">
        <span class="input-group-text">${i + 1}</span>
        <input type="text" class="form-control" value="${label}">
      </div>
    `).join('')}
  `;
}

function handleCreateReview() {
  if (!$('#create-review-form')[0].checkValidity()) {
    $('#create-review-form')[0].reportValidity();
    return;
  }

  const data = {
    course: $('#review-course').val(),
    team: $('#review-team').val(),
    name: $('#review-name').val().trim(),
    type: $('#review-type').val(),
    privateEnabled: $('#include-private-feedback').prop('checked'),
    publicEnabled: $('#include-public-feedback').prop('checked'),
    questions: []
  };

  $('.question-card').each(function () {
    const qId = $(this).find('.question-type-select').attr('id').split('-')[1];
    const type = $(`#question-${qId}-type`).val();
    const q = {
      text: $(`#question-${qId}-text`).val().trim(),
      type,
      required: $(`#question-${qId}-required`).prop('checked'),
      options: []
    };

    if (type === 'likert' || type === 'multiple') {
      $(this).find('.input-group input').each(function (i) {
        const value = type === 'likert' ? (i + 1) : String.fromCharCode(65 + i);
        q.options.push({ value, text: $(this).val().trim() });
      });
    } else if (type === 'text') {
      q.maxLength = $(this).find('input[type="number"]').val();
    }

    data.questions.push(q);
  });

  Swal.fire({
    title: 'Success!',
    text: `Review "${data.name}" has been created.`,
    icon: 'success'
  }).then(() => {
    $('#createReviewModal').modal('hide');
    $('#create-review-form')[0].reset();
    loadReviewsList(); // reload simulated list
  });
}