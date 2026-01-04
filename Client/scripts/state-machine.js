/**
 * SmSm Academy - State Machine
 * Manages subject registration states and transitions
 */

const SubjectState = {
  IDLE: 'idle',
  DRAFT: 'draft',
  SCHEDULE_SELECTED: 'schedule_selected',
  SUBMITTED: 'submitted',
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

const StateTransitions = {
  [SubjectState.IDLE]: [SubjectState.DRAFT],
  [SubjectState.DRAFT]: [SubjectState.IDLE, SubjectState.SCHEDULE_SELECTED],
  [SubjectState.SCHEDULE_SELECTED]: [SubjectState.DRAFT, SubjectState.SUBMITTED],
  [SubjectState.SUBMITTED]: [SubjectState.PENDING],
  [SubjectState.PENDING]: [SubjectState.ACCEPTED, SubjectState.REJECTED],
  [SubjectState.ACCEPTED]: [],
  [SubjectState.REJECTED]: [SubjectState.DRAFT]
};

const StateLabels = {
  [SubjectState.IDLE]: 'Available',
  [SubjectState.DRAFT]: 'Draft',
  [SubjectState.SCHEDULE_SELECTED]: 'Schedule Selected',
  [SubjectState.SUBMITTED]: 'Submitted',
  [SubjectState.PENDING]: 'Pending Review',
  [SubjectState.ACCEPTED]: 'Accepted',
  [SubjectState.REJECTED]: 'Rejected'
};

const StateBadgeClass = {
  [SubjectState.IDLE]: 'badge-info',
  [SubjectState.DRAFT]: 'badge-info',
  [SubjectState.SCHEDULE_SELECTED]: 'badge-primary',
  [SubjectState.SUBMITTED]: 'badge-warning',
  [SubjectState.PENDING]: 'badge-warning',
  [SubjectState.ACCEPTED]: 'badge-success',
  [SubjectState.REJECTED]: 'badge-error'
};

class SubjectStateMachine {
  constructor() {
    this.subjects = new Map();
    this.activeSubjectId = null;
    this.listeners = new Map();
  }

  /**
   * Initialize a subject with IDLE state
   */
  initSubject(subjectId, subjectData) {
    this.subjects.set(subjectId, {
      id: subjectId,
      ...subjectData,
      state: SubjectState.IDLE,
      config: {
        groupType: '',
        groupLevel: '',
        educationType: ''
      },
      schedule: null,
      formData: null,
      timestamp: null
    });
  }

  /**
   * Get subject data
   */
  getSubject(subjectId) {
    return this.subjects.get(subjectId);
  }

  /**
   * Get all subjects
   */
  getAllSubjects() {
    return Array.from(this.subjects.values());
  }

  /**
   * Get subjects in a specific state
   */
  getSubjectsByState(state) {
    return this.getAllSubjects().filter(s => s.state === state);
  }

  /**
   * Check if transition is valid
   */
  canTransition(subjectId, newState) {
    const subject = this.subjects.get(subjectId);
    if (!subject) return false;
    
    const allowedTransitions = StateTransitions[subject.state];
    return allowedTransitions.includes(newState);
  }

  /**
   * Transition subject to new state
   */
  transition(subjectId, newState) {
    if (!this.canTransition(subjectId, newState)) {
      console.warn(`Invalid transition from ${this.subjects.get(subjectId)?.state} to ${newState}`);
      return false;
    }

    const subject = this.subjects.get(subjectId);
    const oldState = subject.state;
    subject.state = newState;
    
    // Update timestamp on submit
    if (newState === SubjectState.SUBMITTED) {
      subject.timestamp = new Date().toISOString();
    }

    this.emit('stateChange', { subjectId, oldState, newState, subject });
    return true;
  }

  /**
   * Set active subject (draft mode)
   */
  setActiveSubject(subjectId) {
    // Cancel previous draft if exists
    if (this.activeSubjectId && this.activeSubjectId !== subjectId) {
      const prevSubject = this.subjects.get(this.activeSubjectId);
      if (prevSubject && prevSubject.state === SubjectState.DRAFT) {
        this.transition(this.activeSubjectId, SubjectState.IDLE);
        this.resetSubjectConfig(this.activeSubjectId);
      }
    }

    this.activeSubjectId = subjectId;
    
    if (subjectId) {
      const subject = this.subjects.get(subjectId);
      if (subject && subject.state === SubjectState.IDLE) {
        this.transition(subjectId, SubjectState.DRAFT);
      }
    }

    this.emit('activeSubjectChange', { subjectId });
  }

  /**
   * Get active subject
   */
  getActiveSubject() {
    return this.activeSubjectId ? this.subjects.get(this.activeSubjectId) : null;
  }

  /**
   * Update subject configuration
   */
  updateConfig(subjectId, configKey, value) {
    const subject = this.subjects.get(subjectId);
    if (subject) {
      subject.config[configKey] = value;
      this.emit('configChange', { subjectId, configKey, value, config: subject.config });
    }
  }

  /**
   * Check if all config fields are filled
   */
  isConfigComplete(subjectId) {
    const subject = this.subjects.get(subjectId);
    if (!subject) return false;
    
    const { groupType, groupLevel, educationType } = subject.config;
    return groupType && groupLevel && educationType;
  }

  /**
   * Set schedule for subject
   */
  setSchedule(subjectId, schedule) {
    const subject = this.subjects.get(subjectId);
    if (subject) {
      subject.schedule = schedule;
      if (subject.state === SubjectState.DRAFT) {
        this.transition(subjectId, SubjectState.SCHEDULE_SELECTED);
      }
      this.emit('scheduleChange', { subjectId, schedule });
    }
  }

  /**
   * Set form data for subject
   */
  setFormData(subjectId, formData) {
    const subject = this.subjects.get(subjectId);
    if (subject) {
      subject.formData = formData;
      this.emit('formDataChange', { subjectId, formData });
    }
  }

  /**
   * Reset subject configuration
   */
  resetSubjectConfig(subjectId) {
    const subject = this.subjects.get(subjectId);
    if (subject) {
      subject.config = {
        groupType: '',
        groupLevel: '',
        educationType: ''
      };
      subject.schedule = null;
      subject.formData = null;
    }
  }

  /**
   * Submit registration
   */
  submitRegistration(subjectId) {
    const subject = this.subjects.get(subjectId);
    if (!subject || subject.state !== SubjectState.SCHEDULE_SELECTED) {
      return false;
    }

    if (this.transition(subjectId, SubjectState.SUBMITTED)) {
      this.transition(subjectId, SubjectState.PENDING);
      this.activeSubjectId = null;
      this.emit('registrationSubmitted', { subjectId, subject });
      return true;
    }
    return false;
  }

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

// Create global instance
window.stateMachine = new SubjectStateMachine();
