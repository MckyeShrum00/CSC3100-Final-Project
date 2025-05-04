/**
 * Reviews management functionality
 * Handles creating, editing, managing, and completing peer reviews
 */

// Global variables
let reviewsList = [];
let currentReview = null;

$(document).ready(function () {
  // Initialize the reviews module if the section exists
  if ($('#reviews-section').length) {
    loadReviewsList();
    setupReviewEventHandlers();
  }

  // Handle modal action
  $('#save-new-review').on('click', handleCreateReview);
});

/**
 * Load reviews list from the backend
 */
function loadReviewsList() {
  $('#reviews-section').html(`
    <div class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading reviews...</p>
    </div>
  `);

  fetch('http://localhost:8000/api/reviews', {
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
            <h5 class="card-title">${review.title}</h5>
            <p class="card-text">${review.description || 'No description provided.'}</p>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-secondary edit-review-btn" data-id="${review.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-review-btn" data-id="${review.id}">
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
  if (!$('#new-review-form')[0].checkValidity()) {
    $('#new-review-form')[0].reportValidity();
    return;
  }

  const newReview = {
    title: $('#review-title').val().trim(),
    description: $('#review-description').val().trim(),
  };

  fetch('http://localhost:8000/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('swollenhippo_auth_token')}`,
    },
    body: JSON.stringify(newReview),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to create review');
      }
      return response.json();
    })
    .then(data => {
      reviewsList.push(data);
      renderReviewsList(reviewsList);

      Swal.fire('Success!', `Review "${data.title}" created.`, 'success');
      $('#newReviewModal').modal('hide');
      $('#new-review-form')[0].reset();
    })
    .catch(() => {
      Swal.fire('Error', 'Failed to create review. Please try again.', 'error');
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
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete review');
          }
          reviewsList = reviewsList.filter(review => review.id !== reviewId);
          renderReviewsList(reviewsList);
          Swal.fire('Deleted!', 'The review has been deleted.', 'success');
        })
        .catch(() => {
          Swal.fire('Error', 'Failed to delete review. Please try again.', 'error');
        });
    }
  });
}

// Attach delete event handler
$(document).on('click', '.delete-review-btn', function () {
  const reviewId = $(this).data('id');
  handleDeleteReview(reviewId);
});