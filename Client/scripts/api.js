/**
 * SmSm Academy - API Configuration & Helper Functions
 * Handles all communication with the backend server
 */

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  
  // User endpoints
  USER: {
    SUBJECTS: '/user/subjects',
    APPLICATIONS: '/user/applications',
    OPTIONS: '/user/options',
    TIMESLOTS: '/user/timeslots',
    TIMESLOTS_GRID: '/user/timeslots/grid',
    TIMESLOTS_CONFIG: '/user/timeslots/config',
  },
  
  // Admin endpoints (for future use)
  ADMIN: {
    SUBJECTS: '/admin/subjects',
    GROUPS: '/admin/groups',
    TIMESLOTS: '/admin/timeslots',
    APPLICATIONS: '/admin/applications',
  }
};

/**
 * API Helper Class
 */
class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  /**
   * Make a GET request
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  /**
   * Make a POST request with JSON data
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }

  /**
   * Make a POST request with FormData (for file uploads)
   */
  async postFormData(endpoint, formData) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header - browser will set it with boundary
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API FormData POST Error:', error);
      throw error;
    }
  }

  /**
   * Fetch active subjects from backend
   */
  async getSubjects() {
    return this.get(API_CONFIG.USER.SUBJECTS);
  }

  /**
   * Fetch dropdown options (group types, education types, grades)
   */
  async getOptions() {
    return this.get(API_CONFIG.USER.OPTIONS);
  }

  /**
   * Fetch timeslots (optionally filtered by subject/group type)
   */
  async getTimeslots(subjectId = null, groupType = null) {
    let query = '';
    const params = [];
    if (subjectId) params.push(`subjectId=${subjectId}`);
    if (groupType) params.push(`groupType=${groupType}`);
    if (params.length > 0) query = '?' + params.join('&');
    
    return this.get(API_CONFIG.USER.TIMESLOTS + query);
  }

  /**
   * Fetch timeslots in grid format for timetable display
   */
  async getTimeslotGrid(subjectId = null, groupType = null) {
    let query = '';
    const params = [];
    if (subjectId) params.push(`subjectId=${subjectId}`);
    if (groupType) params.push(`groupType=${groupType}`);
    if (params.length > 0) query = '?' + params.join('&');
    
    return this.get(API_CONFIG.USER.TIMESLOTS_GRID + query);
  }

  /**
   * Fetch time configuration (available days and time periods)
   */
  async getTimeConfig() {
    return this.get(API_CONFIG.USER.TIMESLOTS_CONFIG);
  }

  /**
   * Create a draft application
   */
  async createDraftApplication(studentId, groupId) {
    return this.post(API_CONFIG.USER.APPLICATIONS, {
      student: studentId,
      group: groupId
    });
  }

  /**
   * Submit application with payment proof
   */
  async submitApplication(applicationId, formData) {
    return this.postFormData(`${API_CONFIG.USER.APPLICATIONS}/${applicationId}`, formData);
  }
}

// Create global API service instance
window.apiService = new ApiService();

console.log('[INIT] API Service initialized');
