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
    $('#nav-courses').on('click', () =>  {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#courses').show()});
    $('#nav-teams').on('click', () =>  {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#teams').show()});
    $('#nav-reviews').on('click', () =>  {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#reviews').show()});
    $('#nav-reports').on('click', () =>  {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#reports-section').show()});
    
    
    $('#btnCourses').on('click', () => {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#courses').show()});
    $('#btnStudents').on('click', () => {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #studentTeams, #studentCourses').hide(); $('#courses').show()});
    $('#btnTeams').on('click', () => {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#teams').show()});
    $('#btnReviews').on('click', () => {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#reviews').show()});
    $('#allReviews').on('click', () => {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#reviews').show()});
    
    $('#nav-coursesStudent').on('click', () => {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#studentCourses').show()});
    $('#nav-teamsStudent').on('click', () => {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#studentTeams').show()});
    $('#allReviewsStudent').on('click', () => {$('#dashboard-section, #courses, #teams, #reports-section, #profile-section, #settings-section, #reviews, #studentTeams, #studentCourses').hide(); $('#studentCourses').show()});
    
    
      
    
    
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
      { id: 'nav-teamsStudent', section: 'teamsStudent' },
      { id: 'nav-coursesStudent', section: 'coursesStudent' },
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
  