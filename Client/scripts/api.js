

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  
  
  USER: {
    SUBJECTS: '/user/subjects',
    APPLICATIONS: '/user/applications',
    OPTIONS: '/user/options',
    TIMESLOTS: '/user/timeslots',
    TIMESLOTS_GRID: '/user/timeslots/grid',
    TIMESLOTS_CONFIG: '/user/timeslots/config',
  },
  
  
  ADMIN: {
    SUBJECTS: '/admin/subjects',
    GROUPS: '/admin/groups',
    TIMESLOTS: '/admin/timeslots',
    APPLICATIONS: '/admin/applications',
  }
};


class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  
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

  
  async postFormData(endpoint, formData) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        body: formData, 
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

  
  async getSubjects() {
    return this.get(API_CONFIG.USER.SUBJECTS);
  }

  
  async getOptions() {
    return this.get(API_CONFIG.USER.OPTIONS);
  }

  
  async getTimeslots(subjectId = null, groupType = null) {
    let query = '';
    const params = [];
    if (subjectId) params.push(`subjectId=${subjectId}`);
    if (groupType) params.push(`groupType=${groupType}`);
    if (params.length > 0) query = '?' + params.join('&');
    
    return this.get(API_CONFIG.USER.TIMESLOTS + query);
  }

  
  async getTimeslotGrid(subjectId = null, groupType = null) {
    let query = '';
    const params = [];
    if (subjectId) params.push(`subjectId=${subjectId}`);
    if (groupType) params.push(`groupType=${groupType}`);
    if (params.length > 0) query = '?' + params.join('&');
    
    return this.get(API_CONFIG.USER.TIMESLOTS_GRID + query);
  }

  
  async getTimeConfig() {
    return this.get(API_CONFIG.USER.TIMESLOTS_CONFIG);
  }

  
  async createDraftApplication(studentId, groupId) {
    return this.post(API_CONFIG.USER.APPLICATIONS, {
      student: studentId,
      group: groupId
    });
  }

  
  async submitApplication(applicationId, formData) {
    return this.postFormData(`${API_CONFIG.USER.APPLICATIONS}/${applicationId}`, formData);
  }
}


window.apiService = new ApiService();

console.log('[INIT] API Service initialized');
