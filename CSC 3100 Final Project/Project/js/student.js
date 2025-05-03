// STUDENT.JS
// File: js/student.js
/**
 * Student dashboard functionality 
 */

$(document).ready(function() {
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
        order: [[0, 'asc']]
      });
    }
  }
  
  /**
   * Loads student data (courses, reviews, feedback)
   */
  function loadStudentData() {
    
    // Add click handler for review links
    $('.list-group-item-action').on('click', function(e) {
      e.preventDefault();
      $('#reviewModal').modal('show');
    });
  }
  
  /**
   * Sets up event handlers for the student dashboard
   */
  function setupEventHandlers() {
    // Join course handler
    $('#btn-join-course').on('click', function() {
      $('#joinCourseModal').modal('show');
    });
    
    $('#join-course-btn').on('click', function() {
      handleJoinCourse();
    });
    
    // Review submission handler
    $('#submit-review-btn').on('click', function() {
      handleSubmitReview();
    });
  }
  
  /**
   * Handles joining a course with enrollment code
   */
  function handleJoinCourse() {
    if (!$('#join-course-form')[0].checkValidity()) {
      $('#join-course-form')[0].reportValidity();
      return;
    }
    
    const enrollmentCode = $('#enrollment-code').val().trim();
    
    if (!enrollmentCode) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter an enrollment code.',
        icon: 'error'
      });
      return;
    }
    
    
    setTimeout(() => {
      Swal.fire({
        title: 'Success!',
        text: 'You have successfully joined the course.',
        icon: 'success'
      }).then(() => {
        $('#joinCourseModal').modal('hide');
        $('#join-course-form')[0].reset();
        
        
      });
    }, 500);
  }
  
  /**
   * Handles submitting a peer review
   */
  function handleSubmitReview() {
    if (!$('#review-form')[0].checkValidity()) {
      $('#review-form')[0].reportValidity();
      return;
    }
    
    // Collect review form data
    const reviewData = {
      questions: {
        q1: $('input[name="question1"]:checked').val(),
        q2: $('input[name="question2"]:checked').val(),
        q3: $('input[name="question3"]:checked').val()
      },
      publicFeedback: $('#public-feedback').val().trim(),
      privateFeedback: $('#private-feedback').val().trim()
    };
    
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to edit this review after submission.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          Swal.fire(
            'Submitted!',
            'Your review has been submitted successfully.',
            'success'
          ).then(() => {
            $('#reviewModal').modal('hide');
            $('#review-form')[0].reset();
            
            // Update the UI to reflect the completed review
            $('.alert-warning').html(`
              <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-2 fs-4" aria-hidden="true"></i>
                <div>
                  <h4 class="alert-heading">Pending Reviews!</h4>
                  <p class="mb-0">You have 1 pending peer review to complete. The deadline is April 27, 2025.</p>
                </div>
              </div>
            `);
            
            // Update the pending reviews card
            $('.card-header .badge').text('1');
            $('.list-group-item-action:first').remove();
            
            // Update the stats card
            $('.card.bg-warning .card-text').text('1');
          });
        }, 700);
      }
    });
  }
  
  /**
   * Displays feedback details in a modal
   * @param {number} feedbackId Feedback ID
   */
  function viewFeedbackDetails(feedbackId) {
    Swal.fire({
      title: 'Feedback Details',
      html: `
        <div class="text-start">
          <h5>DB 305: Milestone Review</h5>
          <p><strong>Overall Score:</strong> 4.5/5.0</p>
          <hr>
          <h6>Question Scores:</h6>
          <ul>
            <li>Contribution: 5/5</li>
            <li>Communication: 4/5</li>
            <li>Meeting Deadlines: 4.5/5</li>
          </ul>
          <hr>
          <h6>Comments:</h6>
          <p>Great job managing the database design. Communication was clear and you were responsive to team needs.</p>
        </div>
      `,
      width: '600px'
    });
  }