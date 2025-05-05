// REVIEWS.JS
/**
 * Reviews management functionality
 */

let reviewsList = [];

$(document).ready(function () {
  if ($('#reviews-section').length) {
    loadReviewsList();
    setupReviewEventHandlers();
  }

  $('#save-new-review').on('click', handleCreateReview);
  $('#save-edit-review').on('click', handleEditReview);
});

/**
 * Load reviews list from the backend
 */
function loadReviewsList(courseId = null) {
  $('#reviews-section').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading reviews...</p>
    </div>
  `);

  const url = courseId
    ? `http://localhost:8000/api/reviews?courseId=${courseId}`
    : `http://localhost:8000/api/reviews`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      reviewsList = data;
      renderReviewsList(reviewsList);
    })
    .catch(() => {
      $('#reviews-section').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to load reviews. Please try again later.
        </div>
      `);
    });
}

/**
 * Render reviews in a card view
 */
function renderReviewsList(reviews) {
  if (!reviews || reviews.length === 0) {
    $('#reviews-section').html(`
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No reviews found. Use the "Create New Review" button to add one.
      </div>
    `);
    return;
  }

  let html = '<div class="row">';
  reviews.forEach(review => {
    html += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${review.AssessmentType}</h5>
            <p class="card-text">Start: ${review.StartDate}<br>End: ${review.EndDate}</p>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-secondary edit-review-btn" data-id="${review.AssessmentID}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-review-btn" data-id="${review.AssessmentID}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  $('#reviews-section').html(html);
}

/**
 * Handle new review creation
 */
function handleCreateReview() {
  const courseId = $('#create-review-select-course').val();
  const groupId = $('#create-review-select-teams').val();
  const assessmentType = $('#create-review-select-review').val();
  const startDate = $('#dateReviewStart').val();
  const endDate = $('#dateReviewEnd').val();

  if (!courseId || !groupId || !assessmentType || !startDate || !endDate) {
    Swal.fire('Error', 'All fields are required.', 'error');
    return;
  }

  fetch('http://localhost:8000/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify({ courseId, groupId, assessmentType, startDate, endDate }),
  })
    .then(response => response.json())
    .then(data => {
      reviewsList.push(data);
      renderReviewsList(reviewsList);

      Swal.fire('Success!', `Review "${data.AssessmentType}" created.`, 'success');
      $('#newReviewModal').modal('hide');
      $('#new-review-form')[0].reset();
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to create review. Please try again.', 'error');
    });
}

/**
 * Handle review editing
 */
function handleEditReview() {
  const reviewId = $('#edit-review-id').val();
  const updatedReview = {
    courseId: $('#edit-review-select-course').val(),
    groupId: $('#edit-review-select-teams').val(),
    assessmentType: $('#edit-review-select-review').val(),
    startDate: $('#edit-review-start-date').val(),
    endDate: $('#edit-review-end-date').val(),
  };

  fetch(`http://localhost:8000/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify(updatedReview),
  })
    .then(response => response.json())
    .then(() => {
      const index = reviewsList.findIndex(review => review.AssessmentID === parseInt(reviewId));
      if (index !== -1) {
        reviewsList[index] = { ...reviewsList[index], ...updatedReview };
        renderReviewsList(reviewsList);
      }

      Swal.fire('Success!', 'Review updated successfully.', 'success');
      $('#editReviewModal').modal('hide');
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to update review. Please try again.', 'error');
    });
}

/**
 * Handle review deletion
 */
function handleDeleteReview(reviewId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:8000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
        },
      })
        .then(() => {
          reviewsList = reviewsList.filter(review => review.AssessmentID !== reviewId);
          renderReviewsList(reviewsList);
          Swal.fire('Deleted!', 'The review has been deleted.', 'success');
        })
        .catch(() => {
          Swal.fire('Error', 'Failed to delete review. Please try again.', 'error');
        });
    }
  });
}

/**
 * Sets up event handlers for the reviews dashboard
 */
function setupReviewEventHandlers() {
  // Edit review handler
  $(document).on('click', '.edit-review-btn', function () {
    const reviewId = $(this).data('id');
    const review = reviewsList.find(review => review.AssessmentID === reviewId);

    if (review) {
      $('#edit-review-id').val(review.AssessmentID);
      $('#edit-review-select-course').val(review.CourseID);
      $('#edit-review-select-teams').val(review.GroupID);
      $('#edit-review-select-review').val(review.AssessmentType);
      $('#edit-review-start-date').val(review.StartDate);
      $('#edit-review-end-date').val(review.EndDate);

      $('#editReviewModal').modal('show');
    }
  });

  // Delete review handler
  $(document).on('click', '.delete-review-btn', function () {
    const reviewId = $(this).data('id');
    handleDeleteReview(reviewId);
  });
}