

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
    
    window.stateMachine.on('activeSubjectChange', (data) => this.handleActiveChange(data));
    window.stateMachine.on('stateChange', (data) => this.handleStateChange(data));
    window.stateMachine.on('configChange', (data) => this.updateScheduleButton());

    
    this.groupType.addEventListener('change', (e) => this.handleConfigChange('groupType', e.target.value));
    this.groupLevel.addEventListener('change', (e) => this.handleConfigChange('groupLevel', e.target.value));
    this.educationType.addEventListener('change', (e) => this.handleConfigChange('educationType', e.target.value));
    this.configGrade.addEventListener('change', (e) => this.handleConfigChange('grade', e.target.value));

    
    this.scheduleBtn.addEventListener('click', () => this.handleScheduleClick());

    
    this.closeBtn.addEventListener('click', () => this.handleClose());
  }

  
  handleActiveChange(data) {
    const { subjectId } = data;
    
    if (subjectId) {
      const subject = window.stateMachine.getSubject(subjectId);
      this.showCard(subject);
    } else {
      this.hideCard();
    }
  }

  
  showCard(subject) {
    
    this.activeIcon.textContent = subject.icon;
    this.activeName.textContent = subject.name;
    this.subjectInput.value = subject.name;
    
    
    const savedConfig = JSON.parse(localStorage.getItem('smsmConfigData') || '{}');
    console.log('[INFO] Loading saved config:', savedConfig);
    
    
    const config = subject.config || {};
    this.groupType.value = config.groupType || savedConfig.groupType || '';
    this.groupLevel.value = config.groupLevel || savedConfig.groupLevel || '';
    this.educationType.value = config.educationType || savedConfig.educationType || '';
    this.configGrade.value = config.grade || savedConfig.grade || '';
    
    
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
    
    
    this.updateStatusBadge(subject.state);
    
    
    this.updateScheduleButton();

    
    this.card.style.display = 'block';
    this.emptyState.style.display = 'none';
    
    
    this.card.classList.remove('animate-fade-in-up');
    void this.card.offsetWidth; 
    this.card.classList.add('animate-fade-in-up');
  }

  
  hideCard() {
    this.card.style.display = 'none';
    
    
    const registeredCount = window.stateMachine.getSubjectsByState(SubjectState.PENDING).length +
                           window.stateMachine.getSubjectsByState(SubjectState.ACCEPTED).length +
                           window.stateMachine.getSubjectsByState(SubjectState.REJECTED).length;
    
    if (registeredCount === 0) {
      this.emptyState.style.display = 'flex';
    }
  }

  
  handleStateChange(data) {
    const activeSubject = window.stateMachine.getActiveSubject();
    if (activeSubject && data.subjectId === activeSubject.id) {
      this.updateStatusBadge(data.newState);
    }
  }

  
  updateStatusBadge(state) {
    const badgeClass = StateBadgeClass[state];
    const label = StateLabels[state];
    
    this.activeStatus.className = `badge ${badgeClass}`;
    this.activeStatus.innerHTML = `
      <span class="status-dot ${state === SubjectState.DRAFT ? 'pending' : state}"></span>
      ${label}
    `;
  }

  
  handleConfigChange(field, value) {
    const activeSubject = window.stateMachine.getActiveSubject();
    if (activeSubject) {
      window.stateMachine.updateConfig(activeSubject.id, field, value);
      
      
      const savedConfig = JSON.parse(localStorage.getItem('smsmConfigData') || '{}');
      savedConfig[field] = value;
      localStorage.setItem('smsmConfigData', JSON.stringify(savedConfig));
      console.log('[SAVE] Saved config:', savedConfig);
    }
  }

  
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

  
  handleScheduleClick() {
    if (this.scheduleBtn.disabled) return;
    
    
    const event = new CustomEvent('showTimetable');
    document.dispatchEvent(event);
  }

  
  handleClose() {
    window.stateMachine.setActiveSubject(null);
  }
}


window.ConfigBarComponent = ConfigBarComponent;
