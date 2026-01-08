

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
    
    this.sidebar = new SidebarComponent();
    this.configBar = new ConfigBarComponent();
    this.timetable = new TimetableComponent();
    this.form = new FormComponent();

    
    this.initLanguageToggle();

    
    this.loadSubjects();
    this.loadOptions();
    
    
    this.loadSavedApplications();

    
    document.addEventListener('registrationComplete', (e) => this.handleRegistrationComplete(e));

    
    window.stateMachine.on('stateChange', (data) => this.updateRegisteredSubjects());

    console.log('[INIT] SmSm Academy initialized successfully!');
  }
  
  

  async loadSavedApplications() {
    try {
      const savedApps = JSON.parse(localStorage.getItem('smsmApplications') || '[]');
      
      if (savedApps.length === 0) {
        console.log('[INFO] No saved applications in localStorage');
        return;
      }
      
      console.log(`[INFO] Loading ${savedApps.length} saved applications from localStorage`);
      
      const hydratedApps = [];
      const validIds = [];
      let hasChanges = false;

      for (const app of savedApps) {
        // Handle both new format { id: "..." } and legacy { serverId: "...", ... }
        const appId = app.id || app.serverId;
        
        // Filter out legacy client-side IDs starting with "APP_"
        if (appId && typeof appId === 'string' && appId.startsWith('APP_')) {
             console.warn(`[WARN] Removing legacy client-side application ID: ${appId}`);
             hasChanges = true;
             continue;
        }

        if (appId) {
            try {
                // Fetch full details from server
                const response = await fetch(`http://localhost:5000/api/user/applications/${appId}`);
                if (response.ok) {
                    const fullAppData = await response.json();
                    hydratedApps.push(fullAppData);
                    validIds.push({ id: appId });
                    
                    // If we migrated from legacy format, mark as changed
                    if (!app.id || app.serverId) hasChanges = true;
                    
                } else if (response.status === 404 || response.status === 400) {
                    // Application not found on server or invalid ID -> Remove
                    console.warn(`[WARN] Application ${appId} not found on server (status ${response.status}), removing.`);
                    hasChanges = true;
                } else {
                    // Server error (500, etc) -> Keep to try again later
                    console.warn(`[WARN] Server error ${response.status} for ${appId}, keeping in storage.`);
                    validIds.push({ id: appId });
                }
            } catch (err) {
                 // Network error -> Keep
                 console.error(`[ERROR] Failed to fetch application ${appId} (Network Error), keeping in storage:`, err);
                 validIds.push({ id: appId });
            }
        } else {
             // Invalid entry without ID
             hasChanges = true;
        }
      }
      
      // Update localStorage if we found invalid items or migrated formats
      if (hasChanges) {
        localStorage.setItem('smsmApplications', JSON.stringify(validIds));
        console.log('[SAVE] Cleaned up localStorage: removed invalid/legacy applications');
      }

      // Populate state machine with successfully loaded apps
      setTimeout(() => {
        hydratedApps.forEach((app, index) => {
          const registrationId = app.id;
          
          // Handle cases where subject might have been deleted
          const subjectId = app.subject?.id || null;
          const subjectName = app.subject?.name || 'Deleted Subject';
          
          // Construct subject data from API response with fallbacks
          const subjectData = {
            id: subjectId,
            name: subjectName,
            icon: app.subject?.icon || subjectName.charAt(0) || '?',
            color: '#6b7280', // Gray color for potentially deleted references
            meta: app.hasDeletedReferences 
                ? (this.currentLang === 'ar' ? 'بيانات محذوفة' : 'Data deleted')
                : (this.currentLang === 'ar' ? 'مجموعات متاحة' : 'Groups available')
          };

          // Try to match color from sidebar if available
          if (this.sidebar && this.sidebar.subjects) {
             const match = this.sidebar.subjects.find(s => s.id === app.subject.id);
             if (match) {
                 subjectData.color = match.color;
                 subjectData.meta = match.meta;
                 subjectData.icon = match.icon;
             }
          }

          const registrationData = {
            ...subjectData,
            registrationId: registrationId,
            registrationNumber: index + 1,
            config: app.config,
            schedule: app.schedule,
            formData: {
              fullName: app.fullName,
              email: app.email,
              phone: app.phone,
              grade: app.grade
            },
            state: this.mapStatusToState(app.status),
            subjectId: subjectId,
            submittedAt: app.submittedAt,
            serverId: app.id,
            hasDeletedReferences: app.hasDeletedReferences
          };

          window.stateMachine.registrations.set(registrationId, registrationData);
          console.log(`[OK] Restored application for ${subjectName} with status ${app.status}`);
        });
        
        this.updateRegisteredSubjects();
      }, 1000);
      
    } catch (error) {
      console.error('[ERROR] Error loading saved applications:', error);
    }
  }
  
  
  mapStatusToState(status) {
    const statusMap = {
      'pending': SubjectState.PENDING,
      'accepted': SubjectState.ACCEPTED,
      'approved': SubjectState.ACCEPTED,
      'rejected': SubjectState.REJECTED
    };
    return statusMap[status?.toLowerCase()] || SubjectState.PENDING;
  }

  
  initLanguageToggle() {
    const langBtns = document.querySelectorAll('.lang-btn');
    
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        this.switchLanguage(lang);
        
        
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  
  switchLanguage(lang) {
    this.currentLang = lang;
    const htmlElement = document.documentElement;
    const sidebar = document.querySelector('.subjects-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    
    if (lang === 'ar') {
      console.log('[INFO] Switching to Arabic (RTL) - Native Mode');
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.setAttribute('lang', 'ar');
      
      
      if (sidebar) sidebar.style.order = '1';
      if (mainContent) mainContent.style.flexDirection = 'row-reverse';
      
      
      const langToggle = document.querySelector('.lang-toggle');
      if (langToggle) {
        langToggle.style.left = 'auto';
        langToggle.style.right = '1rem';
      }
    } else {
      console.log('[INFO] Switching to English (LTR)');
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.setAttribute('lang', 'en');
      
      
      if (sidebar) sidebar.style.order = '-1';
      if (mainContent) mainContent.style.flexDirection = 'row';
      
      const langToggle = document.querySelector('.lang-toggle');
      if (langToggle) {
        langToggle.style.right = 'auto';
        langToggle.style.left = '1rem';
      }
    }

    
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        el.textContent = text;
      }
    });

    
    this.loadSubjects();
  }

  
  async loadSubjects() {
    
    const colorPalette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];
    
    try {
      
      const apiSubjects = await window.apiService.getSubjects();
      
      if (apiSubjects && apiSubjects.length > 0) {
        
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

        
        const subjects = apiSubjects.map((subject, index) => {
          
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

  
  async loadOptions() {
    try {
      const options = await window.apiService.getOptions();
      
      if (options) {
        
        this.options = options;
        
        
        if (options.groupTypes) {
          this.populateSelect('groupType', options.groupTypes, 'Select type...', 'اختر النوع...');
        }
        
        
        if (options.groupLevels) {
          this.populateSelect('groupLevel', options.groupLevels, 'Select level...', 'اختر المستوى...');
        }
        
        
        if (options.educationTypes) {
          this.populateSelect('educationType', options.educationTypes, 'Select type...', 'اختر النوع...');
        }
        
        
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

  
  populateSelect(selectId, options, defaultLabelEn, defaultLabelAr) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    
    select.innerHTML = '';
    
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = this.currentLang === 'ar' ? defaultLabelAr : defaultLabelEn;
    defaultOption.setAttribute('data-en', defaultLabelEn);
    defaultOption.setAttribute('data-ar', defaultLabelAr);
    select.appendChild(defaultOption);
    
    
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = this.currentLang === 'ar' ? opt.labelAr : opt.labelEn;
      option.setAttribute('data-en', opt.labelEn);
      option.setAttribute('data-ar', opt.labelAr);
      select.appendChild(option);
    });
  }

  
  handleRegistrationComplete(event) {
    this.updateRegisteredSubjects();
    
    
    document.getElementById('activeSubjectCard').style.display = 'none';
  }

  
  updateRegisteredSubjects() {
    const states = [SubjectState.PENDING, SubjectState.ACCEPTED, SubjectState.REJECTED];
    const registeredSubjects = [];
    
    states.forEach(state => {
      registeredSubjects.push(...window.stateMachine.getSubjectsByState(state));
    });

    
    this.registeredContainer.innerHTML = '';

    if (registeredSubjects.length === 0) {
      
      if (!window.stateMachine.getActiveSubject()) {
        this.canvasEmpty.style.display = 'flex';
      }
      return;
    }

    
    this.canvasEmpty.style.display = 'none';

    
    registeredSubjects.forEach(subject => {
      const card = this.createRegisteredCard(subject);
      this.registeredContainer.appendChild(card);
    });
  }

  
  createRegisteredCard(subject) {
    const card = document.createElement('div');
    card.className = 'registered-subject-card';
    
    const stateClass = subject.state === SubjectState.PENDING ? 'pending' :
                       subject.state === SubjectState.ACCEPTED ? 'accepted' : 'rejected';
    
    const stateIcon = subject.state === SubjectState.PENDING ? '<i class="fas fa-clock"></i>' :
                      subject.state === SubjectState.ACCEPTED ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';

    
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


document.addEventListener('DOMContentLoaded', () => {
  window.app = new SmSmAcademy();
});


document.addEventListener('keydown', (e) => {
  
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
