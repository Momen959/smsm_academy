

const SubjectState = {
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
    this.registrations = new Map();   
    this.activeRegistrationId = null; 
    this.listeners = new Map();
    this.registrationCounter = 0;
  }

  
  initSubject(subjectId, subjectData) {
    this.subjects.set(subjectId, {
      id: subjectId,
      ...subjectData
    });
  }

  
  getSubject(subjectId) {
    return this.subjects.get(subjectId);
  }

  
  getAllSubjects() {
    return Array.from(this.subjects.values());
  }

  
  createRegistration(subjectId) {
    const subject = this.subjects.get(subjectId);
    if (!subject) return null;

    this.registrationCounter++;
    const registrationId = `reg_${subjectId}_${this.registrationCounter}_${Date.now()}`;
    
    const registration = {
      id: registrationId,
      subjectId: subjectId,
      name: subject.name,
      icon: subject.icon,
      color: subject.color,
      state: SubjectState.DRAFT,
      config: {
        groupType: '',
        groupLevel: '',
        educationType: '',
        grade: ''
      },
      schedule: null,
      formData: null,
      timestamp: null,
      registrationNumber: this.getRegistrationCountForSubject(subjectId) + 1
    };

    this.registrations.set(registrationId, registration);
    return registrationId;
  }

  
  getRegistrationCountForSubject(subjectId) {
    return Array.from(this.registrations.values())
      .filter(r => r.subjectId === subjectId).length;
  }

  
  getRegistrationsForSubject(subjectId) {
    return Array.from(this.registrations.values())
      .filter(r => r.subjectId === subjectId);
  }

  
  getRegistration(registrationId) {
    return this.registrations.get(registrationId);
  }

  
  getSubjectsByState(state) {
    return Array.from(this.registrations.values())
      .filter(r => r.state === state);
  }

  
  canTransition(registrationId, newState) {
    const registration = this.registrations.get(registrationId);
    if (!registration) return false;
    
    const allowedTransitions = StateTransitions[registration.state];
    return allowedTransitions && allowedTransitions.includes(newState);
  }

  
  transition(registrationId, newState) {
    const registration = this.registrations.get(registrationId);
    if (!registration) return false;

    
    if (registration.state === SubjectState.PENDING || 
        registration.state === SubjectState.DRAFT ||
        registration.state === SubjectState.SCHEDULE_SELECTED) {
      const oldState = registration.state;
      registration.state = newState;
      
      if (newState === SubjectState.SUBMITTED) {
        registration.timestamp = new Date().toISOString();
      }

      this.emit('stateChange', { registrationId, oldState, newState, subject: registration });
      return true;
    }

    if (!this.canTransition(registrationId, newState)) {
      console.warn(`Invalid transition from ${registration.state} to ${newState}`);
      return false;
    }

    const oldState = registration.state;
    registration.state = newState;
    
    if (newState === SubjectState.SUBMITTED) {
      registration.timestamp = new Date().toISOString();
    }

    this.emit('stateChange', { registrationId, oldState, newState, subject: registration });
    return true;
  }

  
  setActiveSubject(subjectId) {
    
    if (this.activeRegistrationId) {
      const prevReg = this.registrations.get(this.activeRegistrationId);
      if (prevReg && prevReg.state === SubjectState.DRAFT) {
        
        this.registrations.delete(this.activeRegistrationId);
      }
    }

    if (subjectId) {
      
      const registrationId = this.createRegistration(subjectId);
      this.activeRegistrationId = registrationId;
      this.emit('activeSubjectChange', { subjectId, registrationId });
    } else {
      this.activeRegistrationId = null;
      this.emit('activeSubjectChange', { subjectId: null, registrationId: null });
    }
  }

  
  getActiveSubject() {
    if (!this.activeRegistrationId) return null;
    const registration = this.registrations.get(this.activeRegistrationId);
    if (!registration) return null;
    
    
    return {
      ...registration,
      id: registration.subjectId  
    };
  }

  
  updateConfig(subjectId, configKey, value) {
    
    const registration = this.registrations.get(this.activeRegistrationId);
    if (registration) {
      registration.config[configKey] = value;
      this.emit('configChange', { 
        subjectId: registration.subjectId, 
        registrationId: this.activeRegistrationId,
        configKey, 
        value, 
        config: registration.config 
      });
    }
  }

  
  isConfigComplete(subjectId) {
    const registration = this.registrations.get(this.activeRegistrationId);
    if (!registration) return false;
    
    const { groupType, groupLevel, educationType, grade } = registration.config;
    return groupType && groupLevel && educationType && grade;
  }

  
  setSchedule(subjectId, schedule) {
    const registration = this.registrations.get(this.activeRegistrationId);
    if (registration) {
      registration.schedule = schedule;
      if (registration.state === SubjectState.DRAFT) {
        this.transition(this.activeRegistrationId, SubjectState.SCHEDULE_SELECTED);
      }
      this.emit('scheduleChange', { 
        subjectId: registration.subjectId, 
        registrationId: this.activeRegistrationId,
        schedule 
      });
    }
  }

  
  setFormData(subjectId, formData) {
    const registration = this.registrations.get(this.activeRegistrationId);
    if (registration) {
      registration.formData = formData;
      this.emit('formDataChange', { 
        subjectId: registration.subjectId,
        registrationId: this.activeRegistrationId, 
        formData 
      });
    }
  }

  
  resetSubjectConfig(subjectId) {
    const registration = this.registrations.get(this.activeRegistrationId);
    if (registration) {
      registration.config = {
        groupType: '',
        groupLevel: '',
        educationType: '',
        grade: ''
      };
      registration.schedule = null;
      registration.formData = null;
    }
  }

  
  submitRegistration(subjectId) {
    const registration = this.registrations.get(this.activeRegistrationId);
    if (!registration || registration.state !== SubjectState.SCHEDULE_SELECTED) {
      return false;
    }

    if (this.transition(this.activeRegistrationId, SubjectState.SUBMITTED)) {
      this.transition(this.activeRegistrationId, SubjectState.PENDING);
      this.activeRegistrationId = null;
      this.emit('registrationSubmitted', { 
        subjectId: registration.subjectId, 
        registrationId: registration.id,
        subject: registration 
      });
      return true;
    }
    return false;
  }

  
  getAllRegistrations() {
    return Array.from(this.registrations.values());
  }

  
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


window.stateMachine = new SubjectStateMachine();

