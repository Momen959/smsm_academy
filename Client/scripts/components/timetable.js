

class TimetableComponent {
  constructor() {
    this.container = document.getElementById('timetableContainer');
    this.grid = document.getElementById('timetableGrid');
    this.selectedSlot = null;
    this.timeSlots = [];
    
    this.init();
  }

  init() {
    
    document.addEventListener('showTimetable', () => this.show());
    
    
    window.stateMachine.on('activeSubjectChange', (data) => {
      if (!data.subjectId) {
        this.hide();
      }
    });
    
    
    window.stateMachine.on('configChange', async (data) => {
      
      if (this.container && this.container.classList.contains('expanded')) {
        console.log('[SYNC] Config changed, reloading timetable...');
        await this.loadTimeSlots();
        this.render();
      }
    });
  }

  
  async loadTimeSlots() {
    try {
      
      const activeSubject = window.stateMachine.getActiveSubject();
      const subjectId = activeSubject?.id || null;
      const groupType = activeSubject?.config?.groupType || null;
      
      console.log('[INFO] Loading timeslots with filters:', { subjectId, groupType });
      
      
      const response = await window.apiService.getTimeslotGrid(subjectId, groupType);
      
      if (response && response.timeSlots && response.timeSlots.length > 0) {
        this.timeSlots = response.timeSlots;
        console.log('[OK] Timeslots loaded from API');
        return;
      }
    } catch (error) {
      console.warn('[WARN] Could not load timeslots from API, using generated data:', error.message);
    }
    
    
    this.generateFallbackTimeSlots();
  }

  
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

    
    this.timeSlots.forEach(row => {
      row.slots.forEach(slot => {
        if (slot.enrolled >= slot.capacity) {
          slot.available = false;
        }
      });
    });
  }

  
  render() {
    
    const rows = this.grid.querySelectorAll('.timetable-time-cell, .timetable-slot');
    rows.forEach(row => row.remove());

    
    this.timeSlots.forEach((timeRow, rowIndex) => {
      
      const timeCell = document.createElement('div');
      timeCell.className = 'timetable-cell timetable-time-cell';
      timeCell.textContent = timeRow.label;
      this.grid.appendChild(timeCell);

      
      timeRow.slots.forEach((slot, colIndex) => {
        const slotCell = document.createElement('div');
        const isEmpty = slot.isEmpty || slot.hasSlot === false;
        const isAvailable = slot.available && slot.hasSlot && slot.enrolled < slot.capacity;
        const isFull = slot.hasSlot && !slot.available;
        const isSelected = this.selectedSlot?.day === slot.day && 
                          this.selectedSlot?.startTime === slot.startTime;

        
        let slotClass = 'empty';
        if (isAvailable) slotClass = 'available';
        else if (isFull) slotClass = 'full';

        slotCell.className = `timetable-cell timetable-slot ${slotClass} ${isSelected ? 'selected' : ''}`;
        slotCell.dataset.day = slot.day;
        slotCell.dataset.time = slot.startTime;
        
        if (isEmpty) {
          
          slotCell.innerHTML = `
            <span class="slot-empty">—</span>
          `;
        } else if (isAvailable) {
          
          
          slotCell.innerHTML = `
            <div class="slot-group" style="font-size: 0.8em; color: var(--color-primary); font-weight: bold; margin-bottom: 2px;">${slot.groupName || ''}</div>
            <span class="slot-teacher">${slot.teacher}</span>
            <span class="slot-capacity">${slot.capacity - slot.enrolled} spots left</span>
          `;
          slotCell.addEventListener('click', () => this.selectSlot(slot));
        } else {
          
          
          slotCell.innerHTML = `
            <div class="slot-group" style="font-size: 0.8em; color: var(--color-gray-500); font-weight: bold; margin-bottom: 2px;">${slot.groupName || ''}</div>
            <span class="slot-teacher">Full</span>
          `;
        }

        this.grid.appendChild(slotCell);
      });
    });
  }

  
  async show() {
    this.selectedSlot = null;
    
    
    await this.loadTimeSlots();
    
    
    this.render();
    
    
    this.container.classList.remove('collapsed');
    this.container.classList.add('expanded');

    
    const formContainer = document.getElementById('registrationFormContainer');
    formContainer.classList.remove('expanded');
    formContainer.classList.add('collapsed');
  }

  
  hide() {
    this.container.classList.remove('expanded');
    this.container.classList.add('collapsed');
  }

  
  selectSlot(slot) {
    this.selectedSlot = slot;
    
    
    const activeSubject = window.stateMachine.getActiveSubject();
    if (activeSubject) {
      window.stateMachine.setSchedule(activeSubject.id, {
        timeslotId: slot._id,  
        day: slot.day,
        time: slot.time,
        startTime: slot.startTime,
        endTime: slot.endTime,
        teacher: slot.teacher,
        groupName: slot.groupName 
      });
    }

    
    this.render();

    
    setTimeout(() => {
      this.hide();
      
      
      const event = new CustomEvent('showRegistrationForm', { 
        detail: { schedule: slot } 
      });
      document.dispatchEvent(event);
    }, 300);
  }

  
  getSelectedSlot() {
    return this.selectedSlot;
  }
}


window.TimetableComponent = TimetableComponent;
