/**
 * SmSm Academy - Registration Form Component
 * Handles the student registration form
 */

class FormComponent {
  constructor() {
    this.container = document.getElementById('registrationFormContainer');
    this.form = document.getElementById('registrationForm');
    this.summaryDay = document.getElementById('summaryDay');
    this.summaryTime = document.getElementById('summaryTime');
    this.changeScheduleBtn = document.getElementById('changeScheduleBtn');
    this.fileInput = document.getElementById('paymentScreenshot');
    this.filePreview = document.getElementById('filePreview');
    this.submitBtn = document.getElementById('submitRegistration');

    this.init();
  }

  init() {
    // Listen for show form event
    document.addEventListener('showRegistrationForm', (e) => this.show(e.detail.schedule));
    
    // Listen for state changes
    window.stateMachine.on('activeSubjectChange', (data) => {
      if (!data.subjectId) {
        this.hide();
      }
    });

    // Change schedule button
    this.changeScheduleBtn.addEventListener('click', () => this.handleChangeSchedule());

    // File input change
    this.fileInput.addEventListener('change', (e) => this.handleFileChange(e));

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Show the registration form
   */
  show(schedule) {
    // Update schedule summary
    const dayNames = {
      'Sat': 'Saturday',
      'Sun': 'Sunday',
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday'
    };

    this.summaryDay.textContent = dayNames[schedule.day] || schedule.day;
    this.summaryTime.textContent = `${schedule.time} • ${schedule.teacher}`;

    // Load saved user data from localStorage (if any)
    try {
      const savedData = JSON.parse(localStorage.getItem('smsmUserData') || '{}');
      console.log('[INFO] Loading saved user data:', savedData);
      
      const fullNameInput = document.getElementById('fullName');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      
      if (savedData.fullName && fullNameInput) fullNameInput.value = savedData.fullName;
      if (savedData.email && emailInput) emailInput.value = savedData.email;
      if (savedData.phone && phoneInput) phoneInput.value = savedData.phone;
    } catch (e) {
      console.warn('Could not load saved user data:', e);
    }

    // Only reset file upload, NOT the user info fields
    this.fileInput.value = '';
    this.filePreview.style.display = 'none';
    this.filePreview.innerHTML = '';

    // Expand container
    this.container.classList.remove('collapsed');
    this.container.classList.add('expanded');
  }

  /**
   * Hide the registration form
   */
  hide() {
    this.container.classList.remove('expanded');
    this.container.classList.add('collapsed');
  }

  /**
   * Handle change schedule button
   */
  handleChangeSchedule() {
    this.hide();
    
    // Show timetable
    setTimeout(() => {
      const event = new CustomEvent('showTimetable');
      document.dispatchEvent(event);
    }, 200);
  }

  /**
   * Handle file input change
   */
  handleFileChange(event) {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        this.fileInput.value = '';
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview.innerHTML = `
          <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-lg);">
            <img src="${e.target.result}" alt="Payment screenshot" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-md);">
            <div style="flex: 1;">
              <div style="font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--color-gray-800);">${file.name}</div>
              <div style="font-size: var(--text-xs); color: var(--color-gray-500);">${(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button type="button" id="removeFile" class="btn btn-ghost btn-icon btn-icon-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `;
        this.filePreview.style.display = 'block';
        
        // Add remove handler
        document.getElementById('removeFile').addEventListener('click', () => {
          this.fileInput.value = '';
          this.filePreview.style.display = 'none';
          this.filePreview.innerHTML = '';
        });
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!this.form.checkValidity()) {
      this.form.reportValidity();
      return;
    }

    // Disable submit button and show loading state
    this.submitBtn.disabled = true;
    const originalText = this.submitBtn.querySelector('span').textContent;
    this.submitBtn.querySelector('span').textContent = 'Submitting...';

    // Get active subject and config
    const activeSubject = window.stateMachine.getActiveSubject();
    if (!activeSubject) {
      this.submitBtn.disabled = false;
      this.submitBtn.querySelector('span').textContent = originalText;
      return;
    }

    // Collect form data for local state
    // Grade is taken from config selection, not form input
    const localFormData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      grade: activeSubject.config?.grade || '',  // Get from config bar selection
      paymentFile: this.fileInput.files[0]
    };

    // Create FormData for API submission (with file)
    const apiFormData = new FormData();
    apiFormData.append('fullName', localFormData.fullName);
    apiFormData.append('email', localFormData.email);
    apiFormData.append('phone', localFormData.phone);
    apiFormData.append('grade', localFormData.grade);  // From config selection
    apiFormData.append('subjectId', activeSubject.id);
    apiFormData.append('groupType', activeSubject.config?.groupType || '');
    apiFormData.append('groupLevel', activeSubject.config?.groupLevel || '');
    apiFormData.append('educationType', activeSubject.config?.educationType || '');
    apiFormData.append('scheduleDay', activeSubject.schedule?.day || '');
    apiFormData.append('scheduleTime', activeSubject.schedule?.time || '');
    
    // Include the timeslot ID if available
    if (activeSubject.schedule?.timeslotId) {
      apiFormData.append('timeslotId', activeSubject.schedule.timeslotId);
    }
    
    if (this.fileInput.files[0]) {
      apiFormData.append('paymentProof', this.fileInput.files[0]);
    }

    // Generate unique application ID
    const applicationId = 'APP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Create application object for localStorage
    const applicationData = {
      id: applicationId,
      fullName: localFormData.fullName,
      email: localFormData.email,
      phone: localFormData.phone,
      grade: localFormData.grade,
      subject: {
        id: activeSubject.id,
        name: activeSubject.name
      },
      groupType: activeSubject.config?.groupType || '',
      educationType: activeSubject.config?.educationType || '',
      schedule: {
        day: activeSubject.schedule?.day || '',
        time: activeSubject.schedule?.time || '',
        teacher: activeSubject.schedule?.teacher || '',
        timeslotId: activeSubject.schedule?.timeslotId || null,
        groupName: activeSubject.schedule?.groupName || '' // Add group name
      },
      status: 'pending',
      submittedAt: new Date().toISOString(),
      hasPaymentProof: !!this.fileInput.files[0]
    };

    let apiSuccess = false;
    try {
      // Try to submit to backend API
      const response = await window.apiService.postFormData('/user/applications/submit', apiFormData);
      console.log('[OK] Registration submitted to API:', response);
      apiSuccess = true;
      
      // Update local application with server ID if available
      if (response.data && response.data._id) {
        applicationData.serverId = response.data._id;
      }
    } catch (error) {
      console.warn('[WARN] Could not submit to API, saving locally only:', error.message);
    }

    // Save application to localStorage
    this.saveApplicationToLocalStorage(applicationData);
    console.log('[SAVE] Saved application to localStorage:', applicationData);

    // Save user data to localStorage for future registrations
    const userDataToSave = {
      fullName: localFormData.fullName,
      email: localFormData.email,
      phone: localFormData.phone
    };
    localStorage.setItem('smsmUserData', JSON.stringify(userDataToSave));
    console.log('[SAVE] Saved user data to localStorage:', userDataToSave);

    // Update local state machine regardless of API success
    window.stateMachine.setFormData(activeSubject.id, localFormData);
    
    // Submit registration locally
    if (window.stateMachine.submitRegistration(activeSubject.id)) {
      // Hide form
      this.hide();
      
      // Show success feedback
      this.showSuccessMessage();
      
      // Refresh registered subjects list
      const completeEvent = new CustomEvent('registrationComplete', {
        detail: { subjectId: activeSubject.id }
      });
      document.dispatchEvent(completeEvent);
    }

    // Restore button state
    this.submitBtn.disabled = false;
    this.submitBtn.querySelector('span').textContent = originalText;
  }

  /**
   * Save application to localStorage
   */
  saveApplicationToLocalStorage(application) {
    try {
      // Get existing applications
      const existingApps = JSON.parse(localStorage.getItem('smsmApplications') || '[]');
      
      // Add new application
      existingApps.push(application);
      
      // Save back to localStorage
      localStorage.setItem('smsmApplications', JSON.stringify(existingApps));
      
      console.log(`[INFO] Total applications in localStorage: ${existingApps.length}`);
    } catch (error) {
      console.error('Error saving application to localStorage:', error);
    }
  }

  /**
   * Get all applications from localStorage
   */
  static getApplicationsFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('smsmApplications') || '[]');
    } catch (error) {
      console.error('Error reading applications from localStorage:', error);
      return [];
    }
  }

  /**
   * Get applications for a specific email
   */
  static getApplicationsByEmail(email) {
    const allApps = FormComponent.getApplicationsFromLocalStorage();
    return allApps.filter(app => app.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Show success message
   */
  showSuccessMessage() {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'success-toast animate-fade-in-up';
    toast.style.cssText = `
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-6);
      background: var(--color-success);
      color: white;
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      z-index: 1000;
    `;
    toast.innerHTML = `
      <i class="fas fa-check-circle" style="font-size: 24px;"></i>
      <div>
        <div style="font-weight: var(--font-semibold);">Registration Submitted!</div>
        <div style="font-size: var(--text-sm); opacity: 0.9;">Your application is now pending review.</div>
      </div>
    `;

    document.body.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}

// Export for global access
window.FormComponent = FormComponent;
