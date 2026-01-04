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

    // Reset form
    this.form.reset();
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
  handleSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!this.form.checkValidity()) {
      this.form.reportValidity();
      return;
    }

    // Collect form data
    const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      grade: document.getElementById('studentGrade').value,
      paymentFile: this.fileInput.files[0]
    };

    // Update state machine
    const activeSubject = window.stateMachine.getActiveSubject();
    if (activeSubject) {
      window.stateMachine.setFormData(activeSubject.id, formData);
      
      // Submit registration
      if (window.stateMachine.submitRegistration(activeSubject.id)) {
        // Hide form
        this.hide();
        
        // Show success feedback
        this.showSuccessMessage();
        
        // Refresh registered subjects list
        const event = new CustomEvent('registrationComplete', {
          detail: { subjectId: activeSubject.id }
        });
        document.dispatchEvent(event);
      }
    }
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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
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
