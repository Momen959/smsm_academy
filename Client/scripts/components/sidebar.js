

class SidebarComponent {
  constructor() {
    this.container = document.getElementById('subjectsList');
    this.subjects = [];
    this.init();
  }

  init() {
    
    window.stateMachine.on('stateChange', (data) => this.handleStateChange(data));
    window.stateMachine.on('activeSubjectChange', (data) => this.handleActiveChange(data));
  }

  
  loadSubjects(subjects) {
    this.subjects = subjects;
    
    
    subjects.forEach(subject => {
      window.stateMachine.initSubject(subject.id, subject);
    });

    this.render();
  }

  
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
      
      // Check if RTL mode
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      console.log('[SIDEBAR] Rendering subject:', subject.name, '| isRTL:', isRTL);
      
      // Arrow SVG - points left in RTL, right in LTR
      const arrowSVG = isRTL 
        ? `<svg class="subject-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>`
        : `<svg class="subject-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>`;
      
      // Force correct layout via inline styles
      if (isRTL) {
          // Default flex-direction: row handles RTL correctly (Icon Right, Arrow Left)
          item.style.textAlign = 'right';
      }

      // Same HTML structure for both - flexbox RTL automatically reverses visual order
      item.innerHTML = `
        <div class="subject-icon">${subject.icon}</div>
        <div class="subject-info" style="${isRTL ? 'text-align: right;' : ''}">
          <div class="subject-name">${subject.name}</div>
          <div class="subject-meta">${subject.meta || 'Multiple groups available'}</div>
        </div>
        ${isRegistered ? `
          <span class="badge ${StateBadgeClass[subjectData.state]}">
            ${StateLabels[subjectData.state]}
          </span>
        ` : arrowSVG}
      `;

      if (!isRegistered) {
        item.addEventListener('click', () => this.handleSubjectClick(subject.id));
      }

      this.container.appendChild(item);
    });
  }

  
  handleSubjectClick(subjectId) {
    window.stateMachine.setActiveSubject(subjectId);
  }

  
  handleStateChange(data) {
    this.render();
  }

  
  handleActiveChange(data) {
    this.render();
  }
}


window.SidebarComponent = SidebarComponent;
