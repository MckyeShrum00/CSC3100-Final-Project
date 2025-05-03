// File: js/app.js
/**
 * Controls dashboard navigation, view switching, and layout behavior
 */

$(document).ready(function () {
    // Set up navbar link handling for admin dashboard
    setupNavLinks();
  
    // Set active page section (dashboard by default)
    showSection('dashboard');
  
    // attach modal trigger buttons 
    $('#btn-new-course').on('click', () => $('#newCourseModal').modal('show'));
    $('#btn-add-students').on('click', () => $('#addStudentsModal').modal('show'));
    $('#btn-create-team').on('click', () => $('#createTeamModal').modal('show'));
    $('#btn-create-review').on('click', () => $('#createReviewModal').modal('show'));
    $('#nav-courses').on('click', () => $('#courses').show());
    $('#nav-teams').on('click', () => $('#teams').show());
    $('#nav-reports').on('click', () => $('#studentReports').show());
    $('#nav-teams').on('click', () => $('#studentTeams').show());
    
      
    
    
    const user = getCurrentUser();
    if (user) {
      $('#user-name').text(`${user.firstName} ${user.lastName}`);
    }
  });
  
  /**
   * Handles switching between main admin dashboard sections
   */
  function setupNavLinks() {
    const navIds = [
      { id: 'nav-courses', section: 'courses' },
      { id: 'nav-teams', section: 'teams' },
      { id: 'nav-reviews', section: 'reviews' },
      { id: 'nav-reports', section: 'reports' },
      { id: 'nav-profile', section: 'profile' },
      { id: 'nav-settings', section: 'settings' },
    ];
  
    navIds.forEach(item => {
      $(`#${item.id}`).on('click', function (e) {
        e.preventDefault();
        showSection(item.section);
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
      });
    });
  }
  
  /**
   * Show a particular section and hide others
   * @param {string} sectionId - 
   */
  function showSection(sectionId) {
    const allSections = [
      'dashboard',
      'courses',
      'teams',
      'reviews',
      'reports',
      'profile',
      'settings'
    ];
  
    allSections.forEach(id => {
      $(`#${id}-section`).hide();
    });
  
    $(`#${sectionId}-section`).show();
  }
  