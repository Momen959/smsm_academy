/**
 * SmSm Academy - Configuration Bar Component
 * Handles the subject configuration dropdowns
 */

class ConfigBarComponent {
  constructor() {
    this.card = document.getElementById('activeSubjectCard');
    this.emptyState = document.getElementById('canvasEmpty');
    this.subjectInput = document.getElementById('subjectInput');
    this.groupType = document.getElementById('groupType');
    this.groupLevel = document.getElementById('groupLevel');
    this.educationType = document.getElementById('educationType');
    this.configGrade = document.getElementById('configGrade');
    this.scheduleBtn = document.getElementById('scheduleBtn');
    this.closeBtn = document.getElementById('closeSubjectBtn');
    this.activeIcon = document.getElementById('activeSubjectIcon');
    this.activeName = document.getElementById('activeSubjectName');
    this.activeStatus = document.getElementById('activeSubjectStatus');

    this.init();
  }

  init() {
    // Subscribe to state machine events
    window.stateMachine.on('activeSubjectChange', (data) => this.handleActiveChange(data));
    window.stateMachine.on('stateChange', (data) => this.handleStateChange(data));
    window.stateMachine.on('configChange', (data) => this.updateScheduleButton());

    // Config field change listeners
    this.groupType.addEventListener('change', (e) => this.handleConfigChange('groupType', e.target.value));
    this.groupLevel.addEventListener('change', (e) => this.handleConfigChange('groupLevel', e.target.value));
    this.educationType.addEventListener('change', (e) => this.handleConfigChange('educationType', e.target.value));
    this.configGrade.addEventListener('change', (e) => this.handleConfigChange('grade', e.target.value));

    // Schedule button click
    this.scheduleBtn.addEventListener('click', () => this.handleScheduleClick());

    // Close button click
    this.closeBtn.addEventListener('click', () => this.handleClose());
  }

  /**
   * Handle active subject change
   */
  handleActiveChange(data) {
    const { subjectId } = data;
    
    if (subjectId) {
      const subject = window.stateMachine.getSubject(subjectId);
      this.showCard(subject);
    } else {
      this.hideCard();
    }
  }

  /**
   * Show the active subject card
   */
  showCard(subject) {
    // Update card content
    this.activeIcon.textContent = subject.icon;
    this.activeName.textContent = subject.name;
    this.subjectInput.value = subject.name;
    
    // Load saved config from localStorage (for persistence)
    const savedConfig = JSON.parse(localStorage.getItem('smsmConfigData') || '{}');
    console.log('📋 Loading saved config:', savedConfig);
    
    // Use saved config if subject has no config yet
    const config = subject.config || {};
    this.groupType.value = config.groupType || savedConfig.groupType || '';
    this.groupLevel.value = config.groupLevel || savedConfig.groupLevel || '';
    this.educationType.value = config.educationType || savedConfig.educationType || '';
    this.configGrade.value = config.grade || savedConfig.grade || '';
    
    // Auto-apply saved config to state machine if not already set
    if (!config.groupType && savedConfig.groupType) {
      window.stateMachine.updateConfig(subject.id, 'groupType', savedConfig.groupType);
    }
    if (!config.groupLevel && savedConfig.groupLevel) {
      window.stateMachine.updateConfig(subject.id, 'groupLevel', savedConfig.groupLevel);
    }
    if (!config.educationType && savedConfig.educationType) {
      window.stateMachine.updateConfig(subject.id, 'educationType', savedConfig.educationType);
    }
    if (!config.grade && savedConfig.grade) {
      window.stateMachine.updateConfig(subject.id, 'grade', savedConfig.grade);
    }
    
    // Update status badge
    this.updateStatusBadge(subject.state);
    
    // Update schedule button state
    this.updateScheduleButton();

    // Show card, hide empty state
    this.card.style.display = 'block';
    this.emptyState.style.display = 'none';
    
    // Trigger animation
    this.card.classList.remove('animate-fade-in-up');
    void this.card.offsetWidth; // Force reflow
    this.card.classList.add('animate-fade-in-up');
  }

  /**
   * Hide the active subject card
   */
  hideCard() {
    this.card.style.display = 'none';
    
    // Only show empty state if no registered subjects
    const registeredCount = window.stateMachine.getSubjectsByState(SubjectState.PENDING).length +
                           window.stateMachine.getSubjectsByState(SubjectState.ACCEPTED).length +
                           window.stateMachine.getSubjectsByState(SubjectState.REJECTED).length;
    
    if (registeredCount === 0) {
      this.emptyState.style.display = 'flex';
    }
  }

  /**
   * Handle state change
   */
  handleStateChange(data) {
    const activeSubject = window.stateMachine.getActiveSubject();
    if (activeSubject && data.subjectId === activeSubject.id) {
      this.updateStatusBadge(data.newState);
    }
  }

  /**
   * Update status badge
   */
  updateStatusBadge(state) {
    const badgeClass = StateBadgeClass[state];
    const label = StateLabels[state];
    
    this.activeStatus.className = `badge ${badgeClass}`;
    this.activeStatus.innerHTML = `
      <span class="status-dot ${state === SubjectState.DRAFT ? 'pending' : state}"></span>
      ${label}
    `;
  }

  /**
   * Handle config field change
   */
  handleConfigChange(field, value) {
    const activeSubject = window.stateMachine.getActiveSubject();
    if (activeSubject) {
      window.stateMachine.updateConfig(activeSubject.id, field, value);
      
      // Save config to localStorage for persistence
      const savedConfig = JSON.parse(localStorage.getItem('smsmConfigData') || '{}');
      savedConfig[field] = value;
      localStorage.setItem('smsmConfigData', JSON.stringify(savedConfig));
      console.log('💾 Saved config:', savedConfig);
    }
  }

  /**
   * Update schedule button state
   */
  updateScheduleButton() {
    const activeSubject = window.stateMachine.getActiveSubject();
    
    if (activeSubject && window.stateMachine.isConfigComplete(activeSubject.id)) {
      this.scheduleBtn.disabled = false;
      this.scheduleBtn.classList.add('active');
    } else {
      this.scheduleBtn.disabled = true;
      this.scheduleBtn.classList.remove('active');
    }
  }

  /**
   * Handle schedule button click
   */
  handleScheduleClick() {
    if (this.scheduleBtn.disabled) return;
    
    // Emit event to show timetable
    const event = new CustomEvent('showTimetable');
    document.dispatchEvent(event);
  }

  /**
   * Handle close button
   */
  handleClose() {
    window.stateMachine.setActiveSubject(null);
  }
}

// Export for global access
window.ConfigBarComponent = ConfigBarComponent;
