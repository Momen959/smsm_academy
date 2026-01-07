/**
 * SmSm Academy - Main Application
 * Initializes all components and manages the app
 */

class SmSmAcademy {
  constructor() {
    this.sidebar = null;
    this.configBar = null;
    this.timetable = null;
    this.form = null;
    this.registeredContainer = document.getElementById('registeredSubjects');
    this.canvasEmpty = document.getElementById('canvasEmpty');
    this.currentLang = 'en';

    this.init();
  }

  init() {
    // Initialize components
    this.sidebar = new SidebarComponent();
    this.configBar = new ConfigBarComponent();
    this.timetable = new TimetableComponent();
    this.form = new FormComponent();

    // Initialize language switching
    this.initLanguageToggle();

    // Load subjects and options from API
    this.loadSubjects();
    this.loadOptions();
    
    // Load saved applications from localStorage
    this.loadSavedApplications();

    // Listen for registration complete
    document.addEventListener('registrationComplete', (e) => this.handleRegistrationComplete(e));

    // Subscribe to state changes for registered subjects
    window.stateMachine.on('stateChange', (data) => this.updateRegisteredSubjects());

    console.log('[INIT] SmSm Academy initialized successfully!');
  }
  
  /**
   * Load saved applications from localStorage and sync status from backend
   */
  async loadSavedApplications() {
    try {
      const savedApps = JSON.parse(localStorage.getItem('smsmApplications') || '[]');
      
      if (savedApps.length === 0) {
        console.log('[INFO] No saved applications in localStorage');
        return;
      }
      
      console.log(`[INFO] Loading ${savedApps.length} saved applications from localStorage`);
      
      // Sync status from backend for each application that has a serverId
      let statusUpdated = false;
      for (const app of savedApps) {
        if (app.serverId) {
          try {
            const response = await fetch(`http://localhost:5000/api/user/applications/${app.serverId}/status`);
            if (response.ok) {
              const data = await response.json();
              if (data.status && app.status !== data.status) {
                console.log(`[SYNC] Syncing status for ${app.subject?.name}: ${app.status} -> ${data.status}`);
                app.status = data.status;
                statusUpdated = true;
              }
            }
          } catch (error) {
            console.warn(`[WARN] Could not sync status for application ${app.serverId}:`, error.message);
          }
        }
      }
      
      // Save updated apps back to localStorage if any status changed
      if (statusUpdated) {
        localStorage.setItem('smsmApplications', JSON.stringify(savedApps));
        console.log('[SAVE] Updated localStorage with synced statuses');
      }
      
      // Wait for subjects to load before restoring
      setTimeout(() => {
        // Create a unique registration for each saved application
        savedApps.forEach((app, index) => {
          // Find the subject in state machine
          const subject = window.stateMachine.subjects.get(app.subject?.id);
          
          if (subject) {
            // Create a unique registration ID based on the app
            const registrationId = app.id || `restored_${app.subject.id}_${index}`;
            
            // Create registration data
            const registrationData = {
              ...subject,
              registrationId: registrationId,
              registrationNumber: index + 1,
              config: {
                groupType: app.groupType,
                educationType: app.educationType,
                grade: app.grade
              },
              schedule: app.schedule,
              formData: {
                fullName: app.fullName,
                email: app.email,
                phone: app.phone,
                grade: app.grade
              },
              state: this.mapStatusToState(app.status),
              subjectId: app.subject.id,
              submittedAt: app.submittedAt
            };
            
            // Add to registrations map
            window.stateMachine.registrations.set(registrationId, registrationData);
            console.log(`[OK] Restored application for ${app.subject.name} with status ${app.status}`);
          }
        });
        
        // Update registered subjects display
        this.updateRegisteredSubjects();
      }, 1500); // Wait for subjects to load
      
    } catch (error) {
      console.error('Error loading saved applications:', error);
    }
  }
  
  /**
   * Map localStorage status to SubjectState
   */
  mapStatusToState(status) {
    const statusMap = {
      'pending': SubjectState.PENDING,
      'accepted': SubjectState.ACCEPTED,
      'approved': SubjectState.ACCEPTED,
      'rejected': SubjectState.REJECTED
    };
    return statusMap[status?.toLowerCase()] || SubjectState.PENDING;
  }

  /**
   * Initialize language toggle functionality
   */
  initLanguageToggle() {
    const langBtns = document.querySelectorAll('.lang-btn');
    
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        this.switchLanguage(lang);
        
        // Update active button
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  /**
   * Switch language between English and Arabic
   */
  switchLanguage(lang) {
    this.currentLang = lang;
    const htmlElement = document.documentElement;
    const sidebar = document.querySelector('.subjects-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Set RTL for Arabic
    if (lang === 'ar') {
      console.log('[INFO] Switching to Arabic (RTL) - Native Mode');
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.setAttribute('lang', 'ar');
      
      // Move sidebar to right
      if (sidebar) sidebar.style.order = '1';
      if (mainContent) mainContent.style.flexDirection = 'row-reverse';
      
      // Handle absolute positioned elements if needed
      const langToggle = document.querySelector('.lang-toggle');
      if (langToggle) {
        langToggle.style.left = 'auto';
        langToggle.style.right = '1rem';
      }
    } else {
      console.log('[INFO] Switching to English (LTR)');
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.setAttribute('lang', 'en');
      
      // Move sidebar to left
      if (sidebar) sidebar.style.order = '-1';
      if (mainContent) mainContent.style.flexDirection = 'row';
      
      const langToggle = document.querySelector('.lang-toggle');
      if (langToggle) {
        langToggle.style.right = 'auto';
        langToggle.style.left = '1rem';
      }
    }

    // Update all elements with data-en and data-ar attributes
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        el.textContent = text;
      }
    });

    // Reload subjects with current language
    this.loadSubjects();
  }

  /**
   * Load subjects from API (no fallback - backend required)
   */
  async loadSubjects() {
    // Color palette for subjects
    const colorPalette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];
    
    try {
      // Fetch from API
      const apiSubjects = await window.apiService.getSubjects();
      
      if (apiSubjects && apiSubjects.length > 0) {
        // Subject Translations
        const translations = {
          'Mathematics': { ar: 'الرياضيات', en: 'Mathematics' },
          'Math': { ar: 'الرياضيات', en: 'Math' },
          'Physics': { ar: 'الفيزياء', en: 'Physics' },
          'Chemistry': { ar: 'الكيمياء', en: 'Chemistry' },
          'Biology': { ar: 'الأحياء', en: 'Biology' },
          'English': { ar: 'اللغة الإنجليزية', en: 'English' },
          'Arabic': { ar: 'اللغة العربية', en: 'Arabic' },
          'French': { ar: 'اللغة الفرنسية', en: 'French' },
          'German': { ar: 'اللغة الألمانية', en: 'German' },
          'History': { ar: 'التاريخ', en: 'History' },
          'Geography': { ar: 'الجغرافيا', en: 'Geography' },
          'Science': { ar: 'العلوم', en: 'Science' },
          'Computer': { ar: 'الحاسب الآلي', en: 'Computer' },
          'Computer Science': { ar: 'علوم الحاسب', en: 'Computer Science' }
        };

        // Transform API data to frontend format
        const subjects = apiSubjects.map((subject, index) => {
          // Try to find translation, fallback to original name
          const translation = translations[subject.name] || translations[Object.keys(translations).find(k => subject.name.includes(k))];
          const displayName = translation ? (this.currentLang === 'ar' ? translation.ar : translation.en) : subject.name;
          
          return {
            id: subject._id,
            name: displayName,
            icon: displayName.charAt(0).toUpperCase(),
            meta: this.currentLang === 'ar' ? 'مجموعات متاحة' : 'Groups available',
            color: colorPalette[index % colorPalette.length]
          };
        });
        
        this.sidebar.loadSubjects(subjects);
        console.log('[OK] Subjects loaded from API:', subjects.length);
      } else {
        console.warn('[WARN] No subjects found in database');
        this.sidebar.loadSubjects([]);
      }
    } catch (error) {
      console.error('[ERROR] Could not load subjects from API:', error.message);
      console.error('   Make sure the backend server is running on http://localhost:5000');
      this.sidebar.loadSubjects([]);
    }
  }

  /**
   * Load dropdown options from API (group types, education types, grades)
   */
  async loadOptions() {
    try {
      const options = await window.apiService.getOptions();
      
      if (options) {
        // Store options for later use
        this.options = options;
        
        // Populate Group Type dropdown
        if (options.groupTypes) {
          this.populateSelect('groupType', options.groupTypes, 'Select type...', 'اختر النوع...');
        }
        
        // Populate Group Level dropdown
        if (options.groupLevels) {
          this.populateSelect('groupLevel', options.groupLevels, 'Select level...', 'اختر المستوى...');
        }
        
        // Populate Education Type dropdown
        if (options.educationTypes) {
          this.populateSelect('educationType', options.educationTypes, 'Select type...', 'اختر النوع...');
        }
        
        // Populate Grade dropdowns (config bar and registration form)
        if (options.grades) {
          this.populateSelect('configGrade', options.grades, 'Select grade...', 'اختر الصف...');
          this.populateSelect('studentGrade', options.grades, 'Select your grade...', 'اختر الصف...');
        }
        
        console.log('[OK] Options loaded from API');
      }
    } catch (error) {
      console.error('[ERROR] Could not load options from API:', error.message);
    }
  }

  /**
   * Populate a select element with options from API
   */
  populateSelect(selectId, options, defaultLabelEn, defaultLabelAr) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Clear existing options except the first one
    select.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = this.currentLang === 'ar' ? defaultLabelAr : defaultLabelEn;
    defaultOption.setAttribute('data-en', defaultLabelEn);
    defaultOption.setAttribute('data-ar', defaultLabelAr);
    select.appendChild(defaultOption);
    
    // Add options from API
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = this.currentLang === 'ar' ? opt.labelAr : opt.labelEn;
      option.setAttribute('data-en', opt.labelEn);
      option.setAttribute('data-ar', opt.labelAr);
      select.appendChild(option);
    });
  }

  /**
   * Handle registration complete event
   */
  handleRegistrationComplete(event) {
    this.updateRegisteredSubjects();
    
    // Hide active subject card
    document.getElementById('activeSubjectCard').style.display = 'none';
  }

  /**
   * Update the registered subjects list
   */
  updateRegisteredSubjects() {
    const states = [SubjectState.PENDING, SubjectState.ACCEPTED, SubjectState.REJECTED];
    const registeredSubjects = [];
    
    states.forEach(state => {
      registeredSubjects.push(...window.stateMachine.getSubjectsByState(state));
    });

    // Clear container
    this.registeredContainer.innerHTML = '';

    if (registeredSubjects.length === 0) {
      // Show empty state if no active subject
      if (!window.stateMachine.getActiveSubject()) {
        this.canvasEmpty.style.display = 'flex';
      }
      return;
    }

    // Hide empty state
    this.canvasEmpty.style.display = 'none';

    // Render registered subjects
    registeredSubjects.forEach(subject => {
      const card = this.createRegisteredCard(subject);
      this.registeredContainer.appendChild(card);
    });
  }

  /**
   * Create a registered subject card
   * Supports multiple registrations per subject with registration numbers
   */
  createRegisteredCard(subject) {
    const card = document.createElement('div');
    card.className = 'registered-subject-card';
    
    const stateClass = subject.state === SubjectState.PENDING ? 'pending' :
                       subject.state === SubjectState.ACCEPTED ? 'accepted' : 'rejected';
    
    const stateIcon = subject.state === SubjectState.PENDING ? '<i class="fas fa-clock"></i>' :
                      subject.state === SubjectState.ACCEPTED ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';

    // Show registration number if there are multiple
    const regNumber = subject.registrationNumber ? ` #${subject.registrationNumber}` : '';
    const displayName = `${subject.name}${regNumber}`;

    card.innerHTML = `
      <div class="registered-subject-icon ${stateClass}">${subject.icon || subject.name?.charAt(0) || '?'}</div>
      <div class="registered-subject-info">
        <div class="registered-subject-name">${displayName}</div>
        <div class="registered-subject-details">
          <span>${subject.schedule?.groupName || subject.config?.groupType || 'N/A'} • ${subject.config?.groupLevel || 'N/A'}</span>
          <span>${subject.schedule?.day || ''} ${subject.schedule?.time || ''}</span>
        </div>
      </div>
      <div class="registered-subject-status">
        <span class="badge ${StateBadgeClass[subject.state]}">
          ${StateLabels[subject.state]}
        </span>
      </div>
    `;

    return card;
  }

  /**
   * Simulate admin status update (for demo purposes)
   */
  simulateStatusUpdate(subjectId, newStatus) {
    const subject = window.stateMachine.getSubject(subjectId);
    if (subject && subject.state === SubjectState.PENDING) {
      if (newStatus === 'accepted') {
        window.stateMachine.transition(subjectId, SubjectState.ACCEPTED);
      } else if (newStatus === 'rejected') {
        window.stateMachine.transition(subjectId, SubjectState.REJECTED);
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SmSmAcademy();
});

// For demo: add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Press 'A' to approve first pending, 'R' to reject
  if (e.key === 'a' || e.key === 'A') {
    const pending = window.stateMachine.getSubjectsByState(SubjectState.PENDING)[0];
    if (pending) {
      window.app.simulateStatusUpdate(pending.id, 'accepted');
    }
  }
  if (e.key === 'r' || e.key === 'R') {
    const pending = window.stateMachine.getSubjectsByState(SubjectState.PENDING)[0];
    if (pending) {
      window.app.simulateStatusUpdate(pending.id, 'rejected');
    }
  }
});
