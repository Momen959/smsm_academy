/**
 * SmSm Academy - Admin Dashboard
 * Manages all admin operations: subjects, groups, timeslots, applications
 */

const API_BASE = 'http://localhost:5000/api/admin';

class AdminDashboard {
  constructor() {
    this.token = localStorage.getItem('adminToken');
    this.currentSection = 'dashboard';
    
    // Check authentication
    if (!this.token && !window.location.pathname.includes('index.html')) {
      window.location.href = 'index.html';
      return;
    }
    
    this.init();
  }
  
  init() {
    this.setupNavigation();
    this.setupEventListeners();
    this.setupModalListeners();
    this.loadDashboardData();
    console.log('🎓 Admin Dashboard initialized');
  }
  
  // ═══════════════════════════════════════════════════════
  // API HELPERS
  // ═══════════════════════════════════════════════════════
  
  async apiCall(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'API Error');
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════
  
  setupNavigation() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.navigateTo(section);
      });
    });
  }
  
  navigateTo(section) {
    // Update nav active state
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });
    
    // Update page title
    const titles = {
      dashboard: 'Dashboard',
      applications: 'Applications',
      subjects: 'Subjects',
      groups: 'Groups',
      schedule: 'Schedule',
      teachers: 'Teachers'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    this.currentSection = section;
    
    // Load section data
    this.loadSectionData(section);
  }
  
  loadSectionData(section) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => {
      el.style.display = 'none';
      el.classList.remove('active');
    });
    
    // Show current view
    const viewId = `view-${section}`;
    const viewEl = document.getElementById(viewId);
    if (viewEl) {
      viewEl.style.display = 'block';
      setTimeout(() => viewEl.classList.add('active'), 10);
    }
    
    // Load data for section
    switch(section) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'applications':
        this.loadApplications();
        break;
      case 'subjects':
        this.loadSubjects();
        break;
      case 'groups':
        this.loadGroups();
        break;
      case 'schedule':
        this.loadTimeslots();
        break;
      case 'teachers':
        this.loadTeachers();
        break;
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════
  
  async loadDashboardData() {
    try {
      // Load stats
      const [applications, subjects, groupsResult] = await Promise.all([
        this.apiCall('/applications').catch(() => []),
        this.apiCall('/subjects').catch(() => []),
        this.apiCall('/groups').catch(() => ({ groups: [] }))
      ]);
      
      // Update stats
      const pendingApps = Array.isArray(applications) ? applications.filter(a => a.status === 'pending') : [];
      document.getElementById('pendingCount').textContent = pendingApps.length;
      document.getElementById('pendingBadge').textContent = pendingApps.length;
      
      // Update groups count
      const groups = groupsResult.groups || groupsResult || [];
      const groupsCount = Array.isArray(groups) ? groups.length : 0;
      document.getElementById('groupsCount').textContent = groupsCount;
      
      // Update subjects count
      const subjectsCount = Array.isArray(subjects) ? subjects.length : 0;
      document.getElementById('subjectsCount').textContent = subjectsCount;
      
      // Load applications table
      this.renderApplicationsTable(pendingApps.slice(0, 5));
      
      // Load subjects list
      this.renderSubjectsList(Array.isArray(subjects) ? subjects : []);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // APPLICATIONS
  // ═══════════════════════════════════════════════════════
  
  async loadApplications() {
    try {
      const applications = await this.apiCall('/applications');
      this.renderApplicationsTable(Array.isArray(applications) ? applications : []);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }
  
  renderApplicationsTable(applications) {
    const tbody = document.getElementById('applicationsTableBody');
    if (!tbody) return;
    
    if (applications.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-gray-500);">
            No pending applications
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = applications.map(app => `
      <tr data-id="${app._id}">
        <td>
          <div class="student-cell">
            <div class="student-avatar">${(app.fullName || 'U')[0].toUpperCase()}</div>
            <div class="student-info">
              <div class="student-name">${app.fullName || 'Unknown'}</div>
              <div class="student-email">${app.email || ''}</div>
            </div>
          </div>
        </td>
        <td>${app.subject?.name || 'N/A'}</td>
        <td>${app.groupType || 'N/A'}</td>
        <td>${app.day || ''} ${app.time || ''}</td>
        <td>
          <button class="btn btn-ghost btn-sm view-payment-btn" data-image="${app.paymentScreenshot || ''}">
            View
          </button>
        </td>
        <td>
          <span class="status-badge ${app.status || 'pending'}">${app.status || 'pending'}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-success btn-sm approve-btn" data-id="${app._id}" title="Approve">
              ✓
            </button>
            <button class="btn btn-danger btn-sm reject-btn" data-id="${app._id}" title="Reject">
              ✕
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    // Add event listeners
    tbody.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', () => this.updateApplicationStatus(btn.dataset.id, 'approved'));
    });
    
    tbody.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => this.updateApplicationStatus(btn.dataset.id, 'rejected'));
    });
  }
  
  async updateApplicationStatus(id, status) {
    try {
      console.log(`Updating application ${id} to ${status}`);
      const result = await this.apiCall(`/applications/${id}/status`, 'PUT', { status });
      console.log('Update result:', result);
      this.loadDashboardData(); // Refresh
      this.showNotification(`Application ${status}`, 'success');
    } catch (error) {
      console.error('Update application error:', error);
      this.showNotification(`Error: ${error.message}`, 'error');
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // SUBJECTS
  // ═══════════════════════════════════════════════════════
  
  async loadSubjects() {
    try {
      const subjects = await this.apiCall('/subjects');
      this.renderSubjectsList(Array.isArray(subjects) ? subjects : []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }
  
  renderSubjectsList(subjects) {
    const container = document.getElementById('subjectsList');
    if (!container) return;
    
    if (subjects.length === 0) {
      container.innerHTML = '<div class="empty-state">No subjects yet. Click + to add one.</div>';
      return;
    }
    
    container.innerHTML = subjects.map(subject => `
      <div class="config-item" data-id="${subject._id}">
        <div class="config-item-icon">${subject.name[0].toUpperCase()}</div>
        <div class="config-item-name">${subject.name}</div>
        <div class="config-item-actions">
          <button class="btn btn-ghost btn-icon btn-icon-sm edit-subject-btn" data-id="${subject._id}" data-name="${subject.name}">
            ✎
          </button>
          <button class="btn btn-ghost btn-icon btn-icon-sm delete-subject-btn" data-id="${subject._id}">
            ✕
          </button>
        </div>
      </div>
    `).join('');
    
    container.querySelectorAll('.edit-subject-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showEditSubjectModal(btn.dataset.id, btn.dataset.name));
    });
    
    container.querySelectorAll('.delete-subject-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSubject(btn.dataset.id));
    });
  }
  
  async createSubject(name) {
    try {
      await this.apiCall('/subjects', 'POST', { name });
      this.loadSubjects();
      this.showNotification('Subject created successfully', 'success');
    } catch (error) {
      this.showNotification('Error creating subject: ' + error.message, 'error');
    }
  }
  
  async updateSubject(id, name) {
    try {
      await this.apiCall(`/subjects/${id}`, 'PUT', { name });
      this.loadSubjects();
      this.showNotification('Subject updated successfully', 'success');
    } catch (error) {
      this.showNotification('Error updating subject: ' + error.message, 'error');
    }
  }
  
  async deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await this.apiCall(`/subjects/${id}`, 'DELETE');
      this.loadSubjects();
      this.showNotification('Subject deleted successfully', 'success');
    } catch (error) {
      this.showNotification('Error deleting subject: ' + error.message, 'error');
    }
  }
  
  showEditSubjectModal(id, currentName) {
    const newName = prompt('Enter new subject name:', currentName);
    if (newName && newName !== currentName) {
      this.updateSubject(id, newName);
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // GROUPS
  // ═══════════════════════════════════════════════════════
  
  async loadGroups() {
    try {
      const result = await this.apiCall('/groups');
      const groups = result.groups || result || [];
      this.renderGroupsList(Array.isArray(groups) ? groups : []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }
  
  renderGroupsList(groups) {
    const container = document.getElementById('groupTypesList');
    if (!container) return;
    
    if (groups.length === 0) {
      container.innerHTML = '<div class="empty-state">No groups yet.</div>';
      return;
    }
    
    container.innerHTML = groups.map(group => `
      <div class="config-item" data-id="${group._id}">
        <div class="config-item-name">${group.name || 'Unnamed Group'}</div>
        <div class="config-item-meta">${group.subject?.name || ''} - ${group.teacher?.name || ''}</div>
        <div class="config-item-actions">
          <button class="btn btn-ghost btn-icon btn-icon-sm delete-group-btn" data-id="${group._id}">
            ✕
          </button>
        </div>
      </div>
    `).join('');
    
    container.querySelectorAll('.delete-group-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteGroup(btn.dataset.id));
    });
  }
  
  async deleteGroup(id) {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await this.apiCall(`/groups/${id}`, 'DELETE');
      this.loadGroups();
      this.showNotification('Group deleted successfully', 'success');
    } catch (error) {
      this.showNotification('Error deleting group: ' + error.message, 'error');
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // TIMESLOTS
  // ═══════════════════════════════════════════════════════
  
  async loadTimeslots() {
    try {
      const result = await this.apiCall('/timeslots');
      const timeslots = result.timeslots || result || [];
      this.renderTimeslotsList(Array.isArray(timeslots) ? timeslots : []);
    } catch (error) {
      console.error('Error loading timeslots:', error);
    }
  }

  renderTimeslotsList(timeslots) {
    const container = document.getElementById('timeslotsList');
    if (!container) return;
    
    if (timeslots.length === 0) {
      container.innerHTML = '<div class="empty-state">No timeslots yet. Click + to add one.</div>';
      return;
    }
    
    container.innerHTML = timeslots.map(slot => {
      const start = new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const end = new Date(slot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const day = new Date(slot.startTime).toLocaleDateString([], {weekday: 'long'});
      
      return `
      <div class="config-item" data-id="${slot._id}">
        <div class="config-item-icon">📅</div>
        <div class="config-item-name">${day} ${start}-${end}</div>
        <div class="config-item-meta">
          ${slot.group?.subject?.name || 'Subject'} - ${slot.teacher?.name || 'Teacher'}
        </div>
        <div class="config-item-actions">
          <button class="btn btn-ghost btn-icon btn-icon-sm delete-timeslot-btn" data-id="${slot._id}">
            ✕
          </button>
        </div>
      </div>
    `}).join('');
    
    container.querySelectorAll('.delete-timeslot-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteTimeslot(btn.dataset.id));
    });
  }
  
  async createTimeslot(data) {
    try {
      await this.apiCall('/timeslots', 'POST', data);
      this.loadTimeslots();
      this.showNotification('Timeslot created successfully', 'success');
    } catch (error) {
      this.showNotification('Error creating timeslot: ' + error.message, 'error');
    }
  }
  
  async deleteTimeslot(id) {
    if (!confirm('Are you sure you want to delete this timeslot?')) return;
    
    try {
      await this.apiCall(`/timeslots/${id}`, 'DELETE');
      this.loadTimeslots();
      this.showNotification('Timeslot deleted successfully', 'success');
    } catch (error) {
      this.showNotification('Error deleting timeslot: ' + error.message, 'error');
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // TEACHERS
  // ═══════════════════════════════════════════════════════
  
  async loadTeachers() {
    try {
      const result = await this.apiCall('/teachers');
      const teachers = result.teachers || result || [];
      this.renderTeachersList(Array.isArray(teachers) ? teachers : []);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  }
  
  renderTeachersList(teachers) {
    const container = document.getElementById('teachersList');
    if (!container) return;
    
    if (teachers.length === 0) {
      container.innerHTML = '<div class="empty-state">No teachers yet. Click + to add one.</div>';
      return;
    }
    
    container.innerHTML = teachers.map(teacher => `
      <div class="config-item" data-id="${teacher._id}">
        <div class="config-item-icon">👨‍🏫</div>
        <div class="config-item-name">${teacher.name}</div>
        <div class="config-item-meta">${teacher.email || ''}</div>
        <div class="config-item-actions">
          <button class="btn btn-ghost btn-icon btn-icon-sm delete-teacher-btn" data-id="${teacher._id}">
            ✕
          </button>
        </div>
      </div>
    `).join('');
    
    container.querySelectorAll('.delete-teacher-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteTeacher(btn.dataset.id));
    });
  }
  
  async deleteTeacher(id) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await this.apiCall(`/teachers/${id}`, 'DELETE');
      this.loadTeachers();
      this.showNotification('Teacher deleted successfully', 'success');
    } catch (error) {
      this.showNotification('Error deleting teacher: ' + error.message, 'error');
    }
  }

  // ═══════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════
  
  setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
    
    // Add New button in header
    const addNewBtns = document.querySelectorAll('.admin-header-actions .btn-primary');
    addNewBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleAddNew());
    });
    
    // Add buttons in config sections
    const configBtns = [
      'addSubjectBtn', 'addGroupBtn', 'addTeacherBtn', 'addTimeslotBtn'
    ];
    
    configBtns.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => this.handleAddNew(id));
    });
  }
  
  handleAddNew(btnId) {
    switch(btnId) {
      case 'addSubjectBtn':
        this.showAddSubjectModal();
        break;
      case 'addGroupBtn':
        this.showAddGroupModal();
        break;
      case 'addTeacherBtn':
        this.showAddTeacherModal();
        break;
      case 'addTimeslotBtn':
        this.showAddTimeslotModal();
        break;
      default:
        // Default based on current section
        switch(this.currentSection) {
          case 'subjects':
            this.showAddSubjectModal();
            break;
          case 'groups':
            this.showAddGroupModal();
            break;
          case 'teachers':
            this.showAddTeacherModal();
            break;
          case 'schedule':
            this.showAddTimeslotModal();
            break;
          default:
            this.showNotification('Select a section first', 'info');
        }
    }
  }
  
  showAddSubjectModal() {
    const name = prompt('Enter subject name:');
    if (name) {
      this.createSubject(name);
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // MODAL MANAGEMENT
  // ═══════════════════════════════════════════════════════
  
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }
  
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      // Reset form
      const form = modal.querySelector('form');
      if (form) form.reset();
    }
  }
  
  setupModalListeners() {
    // Close buttons
    document.querySelectorAll('.modal-close, .modal-overlay [data-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.dataset.modal || e.target.classList.contains('modal-close')) {
          const modalId = e.target.dataset.modal || e.target.closest('.modal-overlay')?.id;
          if (modalId) this.closeModal(modalId);
        }
      });
    });
    
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });
    
    // Form submissions
    this.setupFormSubmissions();
  }
  
  setupFormSubmissions() {
    // Teacher Form
    const teacherForm = document.getElementById('teacherForm');
    if (teacherForm) {
      teacherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          name: document.getElementById('teacherName').value,
          email: document.getElementById('teacherEmail').value,
          phone: document.getElementById('teacherPhone').value || undefined
        };
        await this.createTeacher(data);
        this.closeModal('teacherModal');
      });
    }
    
    // Group Form
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
      groupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          subjectId: document.getElementById('groupSubject').value,
          type: document.getElementById('groupType').value,
          capacity: parseInt(document.getElementById('groupCapacity').value),
          level: document.getElementById('groupLevel').value,
          educationType: document.getElementById('groupEducationType').value,
          grade: document.getElementById('groupGrade').value
        };
        await this.createGroup(data);
        this.closeModal('groupModal');
      });
    }
    
    // Timeslot Form
    const timeslotForm = document.getElementById('timeslotForm');
    if (timeslotForm) {
      timeslotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const day = document.getElementById('timeslotDay').value;
        const timePeriod = document.getElementById('timeslotPeriod').value;
        
        // Parse time period (format: "08:00-10:00")
        const [startTime, endTime] = timePeriod.split('-');
        
        const data = {
          group: document.getElementById('timeslotGroup').value,
          teacher: document.getElementById('timeslotTeacher').value,
          day: day,
          startTime: startTime,
          endTime: endTime
        };
        await this.createTimeslot(data);
        this.closeModal('timeslotModal');
      });
    }
  }
  
  async showAddTeacherModal() {
    this.openModal('teacherModal');
  }
  
  async showAddGroupModal() {
    // Populate subjects dropdown
    try {
      const subjects = await this.apiCall('/subjects');
      const select = document.getElementById('groupSubject');
      if (select) {
        select.innerHTML = '<option value="">Select a subject...</option>';
        (Array.isArray(subjects) ? subjects : []).forEach(s => {
          select.innerHTML += `<option value="${s._id}">${s.name}</option>`;
        });
      }
    } catch (error) {
      console.error('Error loading subjects for group modal:', error);
    }
    this.openModal('groupModal');
  }
  
  async showAddTimeslotModal() {
    // Populate groups and teachers dropdowns
    try {
      const [groupsResult, teachersResult] = await Promise.all([
        this.apiCall('/groups'),
        this.apiCall('/teachers')
      ]);
      
      const groups = groupsResult.groups || groupsResult || [];
      const teachers = teachersResult.teachers || teachersResult || [];
      
      // Populate groups
      const groupSelect = document.getElementById('timeslotGroup');
      if (groupSelect) {
        groupSelect.innerHTML = '<option value="">Select a group...</option>';
        (Array.isArray(groups) ? groups : []).forEach(g => {
          const label = `${g.subject?.name || 'Unknown'} - ${g.type} (${g.capacity} capacity)`;
          groupSelect.innerHTML += `<option value="${g._id}">${label}</option>`;
        });
      }
      
      // Populate teachers
      const teacherSelect = document.getElementById('timeslotTeacher');
      if (teacherSelect) {
        teacherSelect.innerHTML = '<option value="">Select a teacher...</option>';
        (Array.isArray(teachers) ? teachers : []).forEach(t => {
          teacherSelect.innerHTML += `<option value="${t._id}">${t.name}</option>`;
        });
      }
    } catch (error) {
      console.error('Error loading data for timeslot modal:', error);
    }
    this.openModal('timeslotModal');
  }
  
  // ═══════════════════════════════════════════════════════
  // CREATE METHODS FOR NEW ENTITIES
  // ═══════════════════════════════════════════════════════
  
  async createTeacher(data) {
    try {
      await this.apiCall('/teachers', 'POST', data);
      this.loadTeachers();
      this.showNotification('Teacher created successfully', 'success');
    } catch (error) {
      this.showNotification('Error creating teacher: ' + error.message, 'error');
    }
  }
  
  async createGroup(data) {
    try {
      await this.apiCall('/groups', 'POST', data);
      this.loadGroups();
      this.showNotification('Group created successfully', 'success');
    } catch (error) {
      this.showNotification('Error creating group: ' + error.message, 'error');
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════
  
  logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'index.html';
  }
  
  showNotification(message, type = 'info') {
    // Simple notification
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      font-weight: 500;
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// ═══════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════

class AdminLogin {
  constructor() {
    this.form = document.getElementById('loginForm');
    if (this.form) {
      this.init();
    }
  }
  
  init() {
    this.form.addEventListener('submit', (e) => this.handleLogin(e));
  }
  
  async handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const result = await response.json();
      
      if (response.ok && result.token) {
        localStorage.setItem('adminToken', result.token);
        window.location.href = 'dashboard.html';
      } else {
        this.showError(result.message || 'Login failed');
      }
    } catch (error) {
      this.showError('Connection error. Is the server running?');
    }
  }
  
  showNotification(message, type = 'info') {
    // Remove any existing notification
    const existing = document.querySelector('.admin-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      notification.style.transition = 'all 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  showError(message) {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    } else {
      alert(message);
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard')) {
    window.adminDashboard = new AdminDashboard();
  } else {
    window.adminLogin = new AdminLogin();
  }
});
