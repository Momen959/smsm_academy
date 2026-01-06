/**
 * SmSm Academy - Timetable Component
 * Handles the schedule grid and time slot selection
 */

class TimetableComponent {
  constructor() {
    this.container = document.getElementById('timetableContainer');
    this.grid = document.getElementById('timetableGrid');
    this.selectedSlot = null;
    this.timeSlots = [];
    
    this.init();
  }

  init() {
    // Listen for show timetable event
    document.addEventListener('showTimetable', () => this.show());
    
    // Listen for state changes
    window.stateMachine.on('activeSubjectChange', (data) => {
      if (!data.subjectId) {
        this.hide();
      }
    });
  }

  /**
   * Load time slots from API
   */
  async loadTimeSlots() {
    try {
      // Get active subject for filtering
      const activeSubject = window.stateMachine.getActiveSubject();
      const subjectId = activeSubject?.id || null;
      
      // Fetch from API
      const response = await window.apiService.getTimeslotGrid(subjectId);
      
      if (response && response.timeSlots && response.timeSlots.length > 0) {
        this.timeSlots = response.timeSlots;
        console.log('✅ Timeslots loaded from API');
        return;
      }
    } catch (error) {
      console.warn('⚠️ Could not load timeslots from API, using generated data:', error.message);
    }
    
    // Fallback: generate default time slots if API fails or returns empty
    this.generateFallbackTimeSlots();
  }

  /**
   * Generate fallback time slots (only used if API fails)
   */
  generateFallbackTimeSlots() {
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const times = [
      { start: '08:00', end: '10:00', label: '8-10 AM' },
      { start: '10:00', end: '12:00', label: '10-12 PM' },
      { start: '12:00', end: '14:00', label: '12-2 PM' },
      { start: '14:00', end: '16:00', label: '2-4 PM' },
      { start: '16:00', end: '18:00', label: '4-6 PM' },
      { start: '18:00', end: '20:00', label: '6-8 PM' }
    ];

    const teachers = ['Dr. Ahmed', 'Prof. Sarah', 'Mr. Mohamed', 'Ms. Fatima', 'Dr. Hassan'];

    this.timeSlots = times.map(time => ({
      ...time,
      slots: days.map(day => ({
        day,
        time: time.label,
        startTime: time.start,
        endTime: time.end,
        teacher: teachers[Math.floor(Math.random() * teachers.length)],
        capacity: Math.floor(Math.random() * 20) + 5,
        enrolled: Math.floor(Math.random() * 25),
        available: Math.random() > 0.2
      }))
    }));

    // Ensure some slots are full
    this.timeSlots.forEach(row => {
      row.slots.forEach(slot => {
        if (slot.enrolled >= slot.capacity) {
          slot.available = false;
        }
      });
    });
  }

  /**
   * Render the timetable grid
   */
  render() {
    // Clear existing content except headers
    const rows = this.grid.querySelectorAll('.timetable-time-cell, .timetable-slot');
    rows.forEach(row => row.remove());

    // Render time slot rows
    this.timeSlots.forEach((timeRow, rowIndex) => {
      // Time label cell
      const timeCell = document.createElement('div');
      timeCell.className = 'timetable-cell timetable-time-cell';
      timeCell.textContent = timeRow.label;
      this.grid.appendChild(timeCell);

      // Day slots
      timeRow.slots.forEach((slot, colIndex) => {
        const slotCell = document.createElement('div');
        const isEmpty = slot.isEmpty || slot.hasSlot === false;
        const isAvailable = slot.available && slot.hasSlot && slot.enrolled < slot.capacity;
        const isFull = slot.hasSlot && !slot.available;
        const isSelected = this.selectedSlot?.day === slot.day && 
                          this.selectedSlot?.startTime === slot.startTime;

        // Determine slot class
        let slotClass = 'empty';
        if (isAvailable) slotClass = 'available';
        else if (isFull) slotClass = 'full';

        slotCell.className = `timetable-cell timetable-slot ${slotClass} ${isSelected ? 'selected' : ''}`;
        slotCell.dataset.day = slot.day;
        slotCell.dataset.time = slot.startTime;
        
        if (isEmpty) {
          // No class scheduled for this slot
          slotCell.innerHTML = `
            <span class="slot-empty">—</span>
          `;
        } else if (isAvailable) {
          // Available slot - can click to register
          slotCell.innerHTML = `
            <span class="slot-teacher">${slot.teacher}</span>
            <span class="slot-capacity">${slot.capacity - slot.enrolled} spots left</span>
          `;
          slotCell.addEventListener('click', () => this.selectSlot(slot));
        } else {
          // Full slot
          slotCell.innerHTML = `
            <span class="slot-teacher">Full</span>
          `;
        }

        this.grid.appendChild(slotCell);
      });
    });
  }

  /**
   * Show the timetable
   */
  async show() {
    this.selectedSlot = null;
    
    // Load timeslots from API
    await this.loadTimeSlots();
    
    // Render the grid
    this.render();
    
    // Expand container
    this.container.classList.remove('collapsed');
    this.container.classList.add('expanded');

    // Hide registration form if visible
    const formContainer = document.getElementById('registrationFormContainer');
    formContainer.classList.remove('expanded');
    formContainer.classList.add('collapsed');
  }

  /**
   * Hide the timetable
   */
  hide() {
    this.container.classList.remove('expanded');
    this.container.classList.add('collapsed');
  }

  /**
   * Select a time slot
   */
  selectSlot(slot) {
    this.selectedSlot = slot;
    
    // Update state machine
    const activeSubject = window.stateMachine.getActiveSubject();
    if (activeSubject) {
      window.stateMachine.setSchedule(activeSubject.id, {
        day: slot.day,
        time: slot.time,
        startTime: slot.startTime,
        endTime: slot.endTime,
        teacher: slot.teacher
      });
    }

    // Re-render to show selection
    this.render();

    // Collapse timetable after brief delay
    setTimeout(() => {
      this.hide();
      
      // Show registration form
      const event = new CustomEvent('showRegistrationForm', { 
        detail: { schedule: slot } 
      });
      document.dispatchEvent(event);
    }, 300);
  }

  /**
   * Get the selected slot
   */
  getSelectedSlot() {
    return this.selectedSlot;
  }
}

// Export for global access
window.TimetableComponent = TimetableComponent;
