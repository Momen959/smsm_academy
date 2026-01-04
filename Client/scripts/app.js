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

    // Load sample subjects
    this.loadSampleData();

    // Listen for registration complete
    document.addEventListener('registrationComplete', (e) => this.handleRegistrationComplete(e));

    // Subscribe to state changes for registered subjects
    window.stateMachine.on('stateChange', (data) => this.updateRegisteredSubjects());

    console.log('🎓 SmSm Academy initialized successfully!');
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
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.setAttribute('lang', 'ar');
      // Move sidebar to right
      if (sidebar) sidebar.style.order = '1';
      if (mainContent) mainContent.style.flexDirection = 'row-reverse';
    } else {
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.setAttribute('lang', 'en');
      // Move sidebar to left
      if (sidebar) sidebar.style.order = '-1';
      if (mainContent) mainContent.style.flexDirection = 'row';
    }

    // Update all elements with data-en and data-ar attributes
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        el.textContent = text;
      }
    });

    // Reload subjects with current language
    this.loadSampleData();
  }

  /**
   * Load subjects from API (with fallback to sample data)
   */
  async loadSampleData() {
    // Color palette for subjects
    const colorPalette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];
    
    try {
      // Try to fetch from API
      const apiSubjects = await window.apiService.getSubjects();
      
      if (apiSubjects && apiSubjects.length > 0) {
        // Transform API data to frontend format
        const subjects = apiSubjects.map((subject, index) => ({
          id: subject._id,
          name: subject.name,
          icon: subject.name.charAt(0).toUpperCase(),
          meta: this.currentLang === 'ar' ? 'مجموعات متاحة' : 'Groups available',
          color: colorPalette[index % colorPalette.length]
        }));
        
        this.sidebar.loadSubjects(subjects);
        console.log('✅ Subjects loaded from API');
        return;
      }
    } catch (error) {
      console.warn('⚠️ Could not load subjects from API, using fallback data:', error.message);
    }
    
    // Fallback to hardcoded data if API fails
    const subjects = [
      {
        id: 'math',
        name: this.currentLang === 'ar' ? 'الرياضيات' : 'Mathematics',
        icon: 'M',
        meta: this.currentLang === 'ar' ? '12 مجموعة متاحة' : '12 groups available',
        color: '#3b82f6'
      },
      {
        id: 'physics',
        name: this.currentLang === 'ar' ? 'الفيزياء' : 'Physics',
        icon: 'P',
        meta: this.currentLang === 'ar' ? '8 مجموعات متاحة' : '8 groups available',
        color: '#8b5cf6'
      },
      {
        id: 'chemistry',
        name: this.currentLang === 'ar' ? 'الكيمياء' : 'Chemistry',
        icon: 'C',
        meta: this.currentLang === 'ar' ? '10 مجموعات متاحة' : '10 groups available',
        color: '#10b981'
      },
      {
        id: 'biology',
        name: this.currentLang === 'ar' ? 'الأحياء' : 'Biology',
        icon: 'B',
        meta: this.currentLang === 'ar' ? '6 مجموعات متاحة' : '6 groups available',
        color: '#f59e0b'
      },
      {
        id: 'english',
        name: this.currentLang === 'ar' ? 'اللغة الإنجليزية' : 'English',
        icon: 'E',
        meta: this.currentLang === 'ar' ? '15 مجموعة متاحة' : '15 groups available',
        color: '#ef4444'
      },
      {
        id: 'arabic',
        name: this.currentLang === 'ar' ? 'اللغة العربية' : 'Arabic',
        icon: 'A',
        meta: this.currentLang === 'ar' ? '9 مجموعات متاحة' : '9 groups available',
        color: '#06b6d4'
      },
      {
        id: 'french',
        name: this.currentLang === 'ar' ? 'اللغة الفرنسية' : 'French',
        icon: 'F',
        meta: this.currentLang === 'ar' ? '5 مجموعات متاحة' : '5 groups available',
        color: '#ec4899'
      },
      {
        id: 'german',
        name: this.currentLang === 'ar' ? 'اللغة الألمانية' : 'German',
        icon: 'G',
        meta: this.currentLang === 'ar' ? '4 مجموعات متاحة' : '4 groups available',
        color: '#6366f1'
      }
    ];

    this.sidebar.loadSubjects(subjects);
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
   */
  createRegisteredCard(subject) {
    const card = document.createElement('div');
    card.className = 'registered-subject-card';
    
    const stateClass = subject.state === SubjectState.PENDING ? 'pending' :
                       subject.state === SubjectState.ACCEPTED ? 'accepted' : 'rejected';
    
    const stateIcon = subject.state === SubjectState.PENDING ? '⏳' :
                      subject.state === SubjectState.ACCEPTED ? '✓' : '✗';

    card.innerHTML = `
      <div class="registered-subject-icon ${stateClass}">${subject.icon}</div>
      <div class="registered-subject-info">
        <div class="registered-subject-name">${subject.name}</div>
        <div class="registered-subject-details">
          <span>${subject.config.groupType} • ${subject.config.groupLevel}</span>
          <span>${subject.schedule?.day} ${subject.schedule?.time}</span>
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
