/**
 * SmSm Academy - Sidebar Component
 * Handles the subjects sidebar list
 */

class SidebarComponent {
  constructor() {
    this.container = document.getElementById('subjectsList');
    this.subjects = [];
    this.init();
  }

  init() {
    // Subscribe to state changes
    window.stateMachine.on('stateChange', (data) => this.handleStateChange(data));
    window.stateMachine.on('activeSubjectChange', (data) => this.handleActiveChange(data));
  }

  /**
   * Load subjects data
   */
  loadSubjects(subjects) {
    this.subjects = subjects;
    
    // Initialize each subject in state machine
    subjects.forEach(subject => {
      window.stateMachine.initSubject(subject.id, subject);
    });

    this.render();
  }

  /**
   * Render the sidebar
   */
  render() {
    this.container.innerHTML = '';
    
    this.subjects.forEach((subject, index) => {
      const subjectData = window.stateMachine.getSubject(subject.id);
      const isActive = window.stateMachine.activeSubjectId === subject.id;
      const isRegistered = [
        SubjectState.PENDING, 
        SubjectState.ACCEPTED, 
        SubjectState.REJECTED
      ].includes(subjectData?.state);

      const item = document.createElement('div');
      item.className = `subject-item${isActive ? ' active' : ''}${isRegistered ? ' registered' : ''}`;
      item.dataset.subjectId = subject.id;
      item.style.animationDelay = `${index * 50}ms`;
      
      item.innerHTML = `
        <div class="subject-icon">${subject.icon}</div>
        <div class="subject-info">
          <div class="subject-name">${subject.name}</div>
          <div class="subject-meta">${subject.meta || 'Multiple groups available'}</div>
        </div>
        ${isRegistered ? `
          <span class="badge ${StateBadgeClass[subjectData.state]}">
            ${StateLabels[subjectData.state]}
          </span>
        ` : `
          <svg class="subject-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `}
      `;

      if (!isRegistered) {
        item.addEventListener('click', () => this.handleSubjectClick(subject.id));
      }

      this.container.appendChild(item);
    });
  }

  /**
   * Handle subject click
   */
  handleSubjectClick(subjectId) {
    window.stateMachine.setActiveSubject(subjectId);
  }

  /**
   * Handle state change
   */
  handleStateChange(data) {
    this.render();
  }

  /**
   * Handle active subject change
   */
  handleActiveChange(data) {
    this.render();
  }
}

// Export for global access
window.SidebarComponent = SidebarComponent;
