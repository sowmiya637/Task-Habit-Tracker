// ===== Modal Logic for "Add Habit" =====

// Select elements
const modal = document.getElementById("habitModal");
const openBtn = document.querySelector(".add-btn");
const closeBtn = document.querySelector(".close-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const habitForm = document.getElementById("habitForm");
const contentSection = document.querySelector(".content");
const emptyState = document.querySelector(".empty-state");

// Open modal
openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Close modal
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
cancelBtn.addEventListener("click", () => (modal.style.display = "none"));

// Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});


// ===== THEME TOGGLE FUNCTIONALITY =====
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector("i");

// Load theme preference from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
  themeIcon.classList.replace("fa-moon", "fa-sun");
}

// Toggle theme when button clicked
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");

  // Switch icon
  themeIcon.classList.toggle("fa-moon", !isDark);
  themeIcon.classList.toggle("fa-sun", isDark);

  // Save preference
  localStorage.setItem("theme", isDark ? "dark" : "light");
});


function getVisibleDays(habit) {
  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const shortWeekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = new Date();
  const startDate = habit.weekStart ? new Date(habit.weekStart) : today;

  const visibleDays = [];
  let currentDate = new Date(startDate);

  while (visibleDays.length < 7) {
    if (
      habit.frequency === "Daily" ||
      habit.frequency === "Weekly" ||
      (habit.frequency === "Custom" && habit.days.includes(weekdays[currentDate.getDay()]))
    ) {
      visibleDays.push({
        day: shortWeekdays[currentDate.getDay()],
        date: currentDate.getDate(),
        fullDate: new Date(currentDate)
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return visibleDays;
}



function updateWeekStartIfCompleted(habit) {
  const visibleDays = getVisibleDays(habit);
  const allCompleted = visibleDays.every(d => habit.completedDates && habit.completedDates[d.fullDate.toDateString()]);
  if (allCompleted) {
    const nextWeek = new Date(habit.weekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    habit.weekStart = nextWeek.toDateString();
  }
}




// ================= FILTER / SORT / SEARCH LOGIC =================

// Select UI elements
const filterSelect = document.querySelector(".filter select");
const sortSelect = document.querySelector(".sort select");
const searchInput = document.querySelector(".search-box input");

// Helper function to refresh displayed habits
function updateHabitDisplay() {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];

  // 1️⃣ --- FILTER BY FREQUENCY ---
  const filterValue = filterSelect.value;
  let filtered = habits;
  if (filterValue !== "All Frequency") {
    filtered = habits.filter(h => h.frequency === filterValue);
  }

  // 2️⃣ --- SEARCH BY NAME/DESCRIPTION ---
  const searchValue = searchInput.value.toLowerCase().trim();
  if (searchValue) {
    filtered = filtered.filter(habit =>
      habit.name.toLowerCase().includes(searchValue) ||
      (habit.description && habit.description.toLowerCase().includes(searchValue))
    );
  }

  // 3️⃣ --- SORT LOGIC ---
  const sortValue = sortSelect.value;
  switch (sortValue) {
    case "Streak":
      filtered.sort((a, b) => (b.streak || 0) - (a.streak || 0));
      break;
    case "Created at":
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "Ascending":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "Descending":
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  // Render the filtered habits
  renderFilteredHabits(filtered);
}

// ====== RENDER FILTERED HABITS ======
function renderFilteredHabits(filteredHabits) {
  const existingList = contentSection.querySelector(".habit-list");
  if (existingList) existingList.remove();

  if (filteredHabits.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  const listContainer = document.createElement("div");
  listContainer.classList.add("habit-list");
  contentSection.appendChild(listContainer);

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  filteredHabits.forEach(habit => {
    const habitCard = document.createElement("div");
    habitCard.classList.add("habit-card");

    let visibleDays = [];

    // Reuse same day generation logic
    if (habit.frequency === "Weekly" && habit.days.length === 1) {
      const selectedDay = habit.days[0];
      const targetIndex = weekdays.indexOf(selectedDay);
      let currentDate = new Date(today);

      while (currentDate.getDay() !== targetIndex) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (let i = 0; i < 7; i++) {
        const d = new Date(currentDate);
        d.setDate(currentDate.getDate() + i * 7);
        visibleDays.push({
          day: shortWeekdays[d.getDay()],
          date: d.getDate()
        });
      }

    } else if (habit.frequency === "Custom" && habit.days.length > 0) {
      const selectedIndexes = habit.days.map(d => weekdays.indexOf(d));
      let currentDate = new Date(today);
      let count = 0;

      while (count < 7) {
        const d = new Date(currentDate);
        if (selectedIndexes.includes(d.getDay())) {
          visibleDays.push({
            day: shortWeekdays[d.getDay()],
            date: d.getDate()
          });
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

    } else {
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        visibleDays.push({
          day: shortWeekdays[d.getDay()],
          date: d.getDate()
        });
      }
    }

    // ===== CARD TEMPLATE =====
    habitCard.innerHTML = `
      <div class="habit-header">
        <div>
          <h3>${habit.name}</h3>
          <p>${habit.description || ""}</p>
        </div>
       <div class="habit-actions">
  <button class="delete-btn">
    <img src="../asset/delete.png" alt="Delete" title="Delete" style="width:16px; height:16px; cursor:pointer;">
  </button>
  <button class="edit-btn">
    <img src="../asset/edit.png" alt="Edit" title="Edit" style="width:16px; height:16px; cursor:pointer;">
  </button>
  <button class="mark-btn">Mark complete</button>
</div>
      </div>
      <div class="habit-meta">
        <span class="badge"><i class="fa-regular fa-calendar"></i> ${habit.frequency}</span>
        <span class="streak"><i class="fa-solid fa-fire"></i> ${habit.streak} day streak</span>
      </div>
      <div class="week-grid">
        ${visibleDays.map(d => `
          <div class="day-box">
            <span class="day">${d.day}</span>
            <span class="date">${d.date}</span>
          </div>`).join("")}
      </div>
    `;

    listContainer.appendChild(habitCard);

    // === Bind Buttons ===
    const deleteBtn = habitCard.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => openDeleteModal(habit.id, habit.name));

    const editBtn = habitCard.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => openEditHabitModal(habit));

    const markBtn = habitCard.querySelector(".mark-btn");
    markBtn.addEventListener("click", () => toggleHabitCompletion(habit.id, markBtn, habitCard));

    // Apply completion state
    applyCompletionState(habit, habitCard, markBtn);
  });
  // ✅ Apply rules after filtered habits are rendered
  applyRulesToHabits(); // <-- ADD THIS
}

// === EVENT LISTENERS ===
filterSelect.addEventListener("change", updateHabitDisplay);
sortSelect.addEventListener("change", updateHabitDisplay);
searchInput.addEventListener("input", updateHabitDisplay);


// ===== FREQUENCY → CHOOSE DAY LOGIC =====
const frequencySelect = document.getElementById("frequency");
const chooseDayContainer = document.getElementById("chooseDayContainer");
const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

frequencySelect.addEventListener("change", () => {
  chooseDayContainer.innerHTML = "";

  const freq = frequencySelect.value;
  if (freq === "Weekly" || freq === "Custom") {
    const label = document.createElement("label");
    label.textContent = "Choose day *";
    chooseDayContainer.appendChild(label);

    const dropdownBox = document.createElement("div");
    dropdownBox.classList.add("dropdown-box");
    dropdownBox.textContent = "Select day";
    chooseDayContainer.appendChild(dropdownBox);

    const daysList = document.createElement("div");
    daysList.classList.add("days-list", "hidden");
    chooseDayContainer.appendChild(daysList);

    dropdownBox.addEventListener("click", () => {
      daysList.classList.toggle("hidden");
    });

    if (freq === "Weekly") renderWeekly(daysList, dropdownBox);
    if (freq === "Custom") renderCustom(daysList, dropdownBox);
  }
});

// ===== WEEKLY MODE (single-select with left checkbox) =====
function renderWeekly(daysList, dropdownBox) {
  allDays.forEach(day => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" class="weekly-day" value="${day}"> ${day}`;
    daysList.appendChild(label);
  });

  const boxes = daysList.querySelectorAll(".weekly-day");
  boxes.forEach(box => {
    box.addEventListener("change", () => {
      if (box.checked) {
        boxes.forEach(other => {
          if (other !== box) other.checked = false;
        });
        dropdownBox.textContent = box.value;
      } else {
        dropdownBox.textContent = "Select day";
      }
    });
  });
}

// ===== CUSTOM MODE (multi-select with select all + left checkboxes) =====
function renderCustom(daysList, dropdownBox) {
  const selectAllLabel = document.createElement("label");
  selectAllLabel.innerHTML = `<input type="checkbox" id="selectAll"> Select all`;
  daysList.appendChild(selectAllLabel);

  allDays.forEach(day => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" class="custom-day" value="${day}"> ${day}`;
    daysList.appendChild(label);
  });

  const selectAllBox = daysList.querySelector("#selectAll");
  const dayBoxes = daysList.querySelectorAll(".custom-day");

  selectAllBox.addEventListener("change", () => {
    dayBoxes.forEach(cb => (cb.checked = selectAllBox.checked));
    updateCustomDropdownText(dropdownBox);
  });

  dayBoxes.forEach(cb => {
    cb.addEventListener("change", () => updateCustomDropdownText(dropdownBox));
  });
}

function updateCustomDropdownText(dropdownBox) {
  const selected = [...document.querySelectorAll(".custom-day:checked")].map(cb => cb.value);
  dropdownBox.textContent = selected.length ? selected.join(", ") : "Select day";
}

// ===== FORM SUBMIT + LOCAL STORAGE =====
habitForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = habitForm.querySelector("input[type='text']").value.trim();
  const description = habitForm.querySelector("textarea").value.trim();
  const frequency = frequencySelect.value;
  let selectedDays = [];

  if (frequency === "Weekly") {
    const selected = document.querySelector(".weekly-day:checked");
    if (selected) selectedDays.push(selected.value);
  } else if (frequency === "Custom") {
    selectedDays = [...document.querySelectorAll(".custom-day:checked")].map(cb => cb.value);
  }

  const today = new Date();
let weekStart = today;

if (frequency === "Weekly" && selectedDays.length === 1) {
  const targetIndex = allDays.indexOf(selectedDays[0]);
  weekStart = new Date(today);
  while (weekStart.getDay() !== targetIndex) {
    weekStart.setDate(weekStart.getDate() + 1);
  }
} else if (frequency === "Custom" && selectedDays.length > 0) {
  const indexes = selectedDays.map(d => allDays.indexOf(d));
  weekStart = new Date(today);
  while (!indexes.includes(weekStart.getDay())) {
    weekStart.setDate(weekStart.getDate() + 1);
  }
}

const habit = {
  id: Date.now(),
  name,
  description,
  frequency,
  days: selectedDays,
  streak: 0,
  createdAt: new Date().toISOString(),
  weekStart: weekStart.toDateString(), // ← ADD THIS
};


  // Save to localStorage
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  habits.push(habit);
  localStorage.setItem("habits", JSON.stringify(habits));

  showToast("Habit added successfully!", "success");

  // Close and reset form
  modal.style.display = "none";
  habitForm.reset();
  chooseDayContainer.innerHTML = "";
  // ✅ Re-render all habits & apply rules
  renderHabits();  
});


// ✅ paste here — before renderHabits()
function getCurrentWeekRange() {
  const today = new Date();
  const savedWeek = JSON.parse(localStorage.getItem("habitWeekRange"));

  // ✅ Step 1: If saved week exists and today is still inside that week → use it
  if (savedWeek && today >= new Date(savedWeek.start) && today <= new Date(savedWeek.end)) {
    return savedWeek;
  }

  // ✅ Step 2: Else generate new week (Monday–Sunday)
  const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ...
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek - 1)); // move back to Monday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // end of week

  const newRange = { start: monday.toDateString(), end: sunday.toDateString() };

  // ✅ Save this new range in localStorage
  localStorage.setItem("habitWeekRange", JSON.stringify(newRange));
  return newRange;
}

function generateWeekDates() {
  const { start, end } = getCurrentWeekRange();
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

function renderHabitCalendar() {
  const container = document.getElementById("habitCalendar");
  if (!container) return; // avoid creating new one accidentally

  // ✅ Clear old boxes before re-render
  container.innerHTML = "";

  const weekDates = generateWeekDates();

  weekDates.forEach(date => {
    const box = document.createElement("div");
    box.classList.add("day-box");
    box.textContent = date.toDateString().slice(0, 10);

    // ✅ Toggle green on click
    box.addEventListener("click", () => {
      box.classList.toggle("selected");
    });

    container.appendChild(box);
  });
}



  //RENDER HABITS
function renderHabits() {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const existingList = contentSection.querySelector(".habit-list");
  if (existingList) existingList.remove();

  if (habits.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  const listContainer = document.createElement("div");
  listContainer.classList.add("habit-list");
  contentSection.appendChild(listContainer);

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  habits.forEach(habit => {
    const habitCard = document.createElement("div");
    habitCard.classList.add("habit-card");
   
    


    let visibleDays = [];

    if (habit.frequency === "Weekly" && habit.days.length === 1) {
      // === Weekly: 7 upcoming same weekdays ===
      const selectedDay = habit.days[0];
      const targetIndex = weekdays.indexOf(selectedDay);
      let currentDate = new Date(today);

      while (currentDate.getDay() !== targetIndex) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (let i = 0; i < 7; i++) {
        const d = new Date(currentDate);
        d.setDate(currentDate.getDate() + i * 7);
        visibleDays.push({
          day: shortWeekdays[d.getDay()],
          date: d.getDate()
        });
      }

    } else if (habit.frequency === "Custom" && habit.days.length > 0) {
      // === Custom: show 7 real upcoming days following selected weekdays pattern ===
      const selectedIndexes = habit.days.map(d => weekdays.indexOf(d));
      let currentDate = new Date(today);
      let count = 0;

      while (count < 7) {
        const d = new Date(currentDate);
        if (selectedIndexes.includes(d.getDay())) {
          visibleDays.push({
            day: shortWeekdays[d.getDay()],
            date: d.getDate()
          });
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

    } else {
      // === Daily: next 7 consecutive days ===
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        visibleDays.push({
          day: shortWeekdays[d.getDay()],
          date: d.getDate()
        });
      }
    }

    // ===== CARD TEMPLATE =====
    habitCard.innerHTML = `
      <div class="habit-header">
        <div>
          <h3>${habit.name}</h3>
          <p>${habit.description || ""}</p>
        </div>
      <div class="habit-actions">
  <button class="delete-btn">
    <img src="../asset/delete.png" alt="Delete" title="Delete" style="width:16px; height:16px; cursor:pointer;">
  </button>
  <button class="edit-btn">
    <img src="../asset/edit.png" alt="Edit" title="Edit" style="width:16px; height:16px; cursor:pointer;">
  </button>
  <button class="mark-btn">Mark complete</button>
</div>


      </div>
      <div class="habit-meta">
        <span class="badge"><i class="fa-regular fa-calendar"></i> ${habit.frequency}</span>
        <span class="streak"><i class="fa-solid fa-fire"></i> ${habit.streak} day streak</span>
      </div>
      <div class="week-grid">
        ${visibleDays.map(d => `
          <div class="day-box">
            <span class="day">${d.day}</span>
            <span class="date">${d.date}</span>
          </div>`).join("")}
      </div>
    `;

    listContainer.appendChild(habitCard);
     // Apply rules AFTER all cards are rendered
  applyRulesToHabits();


    
    // ===== DELETE BUTTON EVENT =====
const deleteBtn = habitCard.querySelector(".delete-btn");
deleteBtn.addEventListener("click", () => {
  openDeleteModal(habit.id, habit.name);
});
// ===== EDIT BUTTON EVENT =====
const editBtn = habitCard.querySelector(".edit-btn");
editBtn.addEventListener("click", () => {
  openEditHabitModal(habit);
});
// ===== MARK COMPLETE BUTTON EVENT =====
const markBtn = habitCard.querySelector(".mark-btn");
markBtn.addEventListener("click", () => {
  toggleHabitCompletion(habit.id, markBtn, habitCard);
});

// Check and apply saved completion state for today
applyCompletionState(habit, habitCard, markBtn);


  });
  // ✅ STEP: Apply rules after all habits are rendered
   applyRulesToHabits();
}

// ====== HANDLE MARK COMPLETE LOGIC ======
function toggleHabitCompletion(habitId, button, habitCard) {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const today = new Date();
  const todayKey = today.toDateString();

  const updatedHabits = habits.map(habit => {
    if (habit.id === habitId) {
      habit.completedDates = habit.completedDates || {};

      const alreadyCompleted = habit.completedDates[todayKey];

      // ✅ Only toggle today's completion
      habit.completedDates[todayKey] = !alreadyCompleted;

      // ✅ Only update streak if today is newly marked complete
      if (!alreadyCompleted && habit.completedDates[todayKey]) {
        habit.streak = (habit.streak || 0) + 1;
      }

      // ✅ Do NOT decrease streak if today is unmarked
      // streak stays same if user toggles off

      // Update streak display
      const streakEl = habitCard.querySelector(".streak");
      if (streakEl) {
        streakEl.innerHTML = `<i class="fa-solid fa-fire"></i> ${habit.streak || 0} day streak`;
      }

      // Update UI for day boxes
      updateCompletionUI(habit, habitCard, button);

      // Move week start if all days completed
      updateWeekStartIfCompleted(habit);
      

    }
    return habit;
  });

  localStorage.setItem("habits", JSON.stringify(updatedHabits));


  //  Update max streak after completion
updateMaxStreak();
  // Refresh dashboard chart if available
if (typeof updateWeeklyChart === "function") {
  updateWeeklyChart();
}
if (typeof updateActiveHabitsCard === "function") updateActiveHabitsCard();

}



function calculateStreak(completedDates) {
  const dates = Object.keys(completedDates)
    .filter(date => completedDates[date])
    .map(d => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a); // newest first

  if (dates.length === 0) return 0;

  let streak = 1;
  let prevDate = dates[0];

  for (let i = 1; i < dates.length; i++) {
    const diff = (prevDate - dates[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      prevDate = dates[i];
    } else break; // stop counting if non-consecutive
  }

  return streak;
}

// ====== UPDATE MAX STREAK FOR DASHBOARD ======
function updateMaxStreak() {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  localStorage.setItem("maxStreak", maxStreak);

  // If dashboard is open, update it live
  if (typeof updateStreakCard === "function") {
    updateStreakCard();
  }
}

// ====== APPLY COMPLETION STATE ON LOAD ======
function applyCompletionState(habit, habitCard, button) {
  updateCompletionUI(habit, habitCard, button);
}

// ====== UPDATE UI COLORS & BUTTON ======
function updateCompletionUI(habit, habitCard, button) {
  const today = new Date();
   today.setHours(0, 0, 0, 0); // normalize once, outside the loop
  const todayKey = today.toDateString();

  const dayBoxes = habitCard.querySelectorAll(".day-box");

  dayBoxes.forEach(box => {
    const dateText = box.querySelector(".date")?.textContent?.trim(); // number like "4"
    const dayText = box.querySelector(".day")?.textContent?.trim(); // "Mon", "Tue", etc.

    if (!dateText) return;

    // Build a real Date object for that box
    // const boxDate = new Date(today.getFullYear(), today.getMonth(), parseInt(dateText));
    // If date number < today's date, assume next month if habit is monthly view
let boxMonth = today.getMonth();
let boxYear = today.getFullYear();

// Handle next month wrap
if (parseInt(dateText) < today.getDate()) {
  boxMonth += 1;
  if (boxMonth > 11) {
    boxMonth = 0;
    boxYear += 1;
  }
}

const boxDate = new Date(boxYear, boxMonth, parseInt(dateText));

    boxDate.setHours(0, 0, 0, 0); // normalize
    const boxKey = boxDate.toDateString();

    // Reset style
    box.style.backgroundColor = "#f5f5f5";
    box.style.color = "#000";

    //  If this date was completed → Green
    if (habit.completedDates && habit.completedDates[boxKey]) {
      box.style.backgroundColor = "#2e8b57";
      box.style.color = "#fff";
    }
    //  Past uncompleted dates → Red
else if (boxDate < today && !habit.completedDates[boxKey]) {
  box.style.backgroundColor = "#e74c3c";
  box.style.color = "#fff";
}
//  Today and completed → Green
  else if (boxDate.getTime() === today.getTime() && habit.completedDates[boxKey]) {
      box.style.backgroundColor = "#2e8b57";
      box.style.color = "#fff";
    }
//  Today not completed
    else if (boxDate.getTime() === today.getTime() && !habit.completedDates[boxKey]) {
      box.style.backgroundColor = "#f5f5f5";
      box.style.color = "#000";
    }
//  Future → Gray
else if (boxDate > today) {
  box.style.backgroundColor = "#ddd";
  box.style.color = "#555";
}


  });
  

  // === Button state ===
  if (habit.completedDates && habit.completedDates[todayKey]) {
    button.textContent = "Completed";
    button.style.backgroundColor = "#2e8b57";
    button.style.color = "#fff";
  } else {
    button.textContent = "Mark complete";
    button.style.backgroundColor = "";
    button.style.color = "";
  }
}



// ===== DELETE MODAL LOGIC =====
let habitToDeleteId = null;
const deleteModal = document.getElementById("deleteModal");
const deleteMessage = document.getElementById("deleteMessage");

function openDeleteModal(habitId, habitName) {
  habitToDeleteId = habitId;
  deleteMessage.innerHTML = `Are you sure you want to delete the <b>${habitName}</b>?`;
  deleteModal.style.display = "flex";
}

function closeDeleteModal() {
  deleteModal.style.display = "none";
}

function confirmDelete() {
  if (!habitToDeleteId) return;

  let habits = JSON.parse(localStorage.getItem("habits")) || [];
  habits = habits.filter(habit => habit.id !== habitToDeleteId);
  localStorage.setItem("habits", JSON.stringify(habits));

  closeDeleteModal();
  renderHabits();
  showToast("Habit deleted successfully!", "error");
}

// ===== EDIT MODAL LOGIC =====
let editingHabitId = null;
const editModal = document.getElementById("editModal");
const editHabitForm = document.getElementById("editHabitForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const editFreqSelect = document.getElementById("editHabitFrequency");
const editDaySelection = document.getElementById("editDaySelection");
const editDayTitle = document.getElementById("editDayTitle");
const editDaysList = document.getElementById("editDaysList");

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Handle frequency change inside edit modal
editFreqSelect.addEventListener("change", () => {
  const freq = editFreqSelect.value;
  renderEditDaySelection(freq);
});

// Render day selection dynamically
function renderEditDaySelection(freq, selectedDays = []) {
  editDaysList.innerHTML = "";
  editDaySelection.style.display = "none";

  if (freq === "Weekly") {
    // ✅ WEEKLY — checkbox (only one selectable)
    editDaySelection.style.display = "block";
    editDayTitle.textContent = "Choose a day *";

    weekdays.forEach(day => {
      const div = document.createElement("div");
      div.className = "day-option";
      div.innerHTML = `
        <input type="checkbox" class="edit-weekly-day" id="edit_${day}" value="${day}" ${selectedDays.includes(day) ? "checked" : ""}>
        <label for="edit_${day}">${day}</label>
      `;
      editDaysList.appendChild(div);
    });

    // Allow only one checkbox selected at a time
    const checkboxes = editDaysList.querySelectorAll(".edit-weekly-day");
    checkboxes.forEach(box => {
      box.addEventListener("change", () => {
        if (box.checked) {
          checkboxes.forEach(other => {
            if (other !== box) other.checked = false;
          });
        }
      });
    });

  } else if (freq === "Custom") {
    // ✅ CUSTOM — multiple selectable with Select All
    editDaySelection.style.display = "block";
    editDayTitle.textContent = "Choose multiple days *";

    const selectAllDiv = document.createElement("div");
    selectAllDiv.className = "day-option";
    selectAllDiv.innerHTML = `
      <input type="checkbox" id="edit_selectAll">
      <label for="edit_selectAll"><strong>Select All</strong></label>
    `;
    editDaysList.appendChild(selectAllDiv);

    weekdays.forEach(day => {
      const div = document.createElement("div");
      div.className = "day-option";
      div.innerHTML = `
        <input type="checkbox" class="edit-custom-day" id="edit_${day}" value="${day}" ${selectedDays.includes(day) ? "checked" : ""}>
        <label for="edit_${day}">${day}</label>
      `;
      editDaysList.appendChild(div);
    });

    const selectAllBox = document.getElementById("edit_selectAll");
    const dayBoxes = editDaysList.querySelectorAll(".edit-custom-day");

    selectAllBox.addEventListener("change", () => {
      dayBoxes.forEach(cb => (cb.checked = selectAllBox.checked));
    });
  }
}


// Open Edit Modal with prefilled data
function openEditHabitModal(habit) {
  editingHabitId = habit.id;
  document.getElementById("editHabitName").value = habit.name;
  document.getElementById("editHabitDesc").value = habit.description || "";
  document.getElementById("editHabitFrequency").value = habit.frequency;

  renderEditDaySelection(habit.frequency, habit.days || []);
  editModal.style.display = "flex";
}

// Close Edit Modal
cancelEditBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === editModal) editModal.style.display = "none";
});

// Save Updated Habit
editHabitForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const updatedName = document.getElementById("editHabitName").value.trim();
  const updatedDesc = document.getElementById("editHabitDesc").value.trim();
  const updatedFreq = document.getElementById("editHabitFrequency").value;

  let selectedDays = [];
  if (updatedFreq === "Weekly") {
  const selectedBox = editDaysList.querySelector(".edit-weekly-day:checked");
  if (selectedBox) selectedDays = [selectedBox.value];
} else if (updatedFreq === "Custom") {
  selectedDays = Array.from(editDaysList.querySelectorAll(".edit-custom-day:checked"))
    .map(cb => cb.value);
}

   else if (updatedFreq === "Custom") {
    selectedDays = Array.from(editDaysList.querySelectorAll("input[type='checkbox']:checked"))
      .map(cb => cb.value);
  }

  if (!updatedName || !updatedFreq) {
    alert("Please fill out all required fields!");
    return;
  }

  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const updatedHabits = habits.map(h =>
    h.id === editingHabitId
      ? { ...h, name: updatedName, description: updatedDesc, frequency: updatedFreq, days: selectedDays }
      : h
  );

  localStorage.setItem("habits", JSON.stringify(updatedHabits));
  editModal.style.display = "none";
  renderHabits();
  showToast("Habit updated successfully!", "info");
});

//SHOW TOASTER 
function showToast(message, type = "success") {
  // Remove existing toast if any
  const oldToast = document.querySelector(".toast-message");
  if (oldToast) oldToast.remove();

  // Create main toast container
  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;

  // Icon (✅)
  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.innerHTML = "&#10003;"; // checkmark

  // Message text
  const text = document.createElement("span");
  text.className = "toast-text";
  text.textContent = message;

  // Close button (×)
  const close = document.createElement("span");
  close.className = "toast-close";
  close.innerHTML = "&times;";
  close.onclick = () => toast.remove();

  // Append all parts
  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(close);
  document.body.appendChild(toast);

  // Show animation
  setTimeout(() => toast.classList.add("show"), 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
       //highlight card by integrating rules

function applyRulesToHabits() {
  const allRules = JSON.parse(localStorage.getItem("automationRules")) || [];

  // Filter only rules that apply to habits and have highlight action
  const highlightRules = allRules.filter(
    (r) => r.enabled && r.applyTo === "habit" && r.action?.type === "highlight"
  );

  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const habitCards = document.querySelectorAll(".habit-card");

  habitCards.forEach((card) => {
    const titleEl = card.querySelector("h3");
    if (!titleEl) return;

    const habitTitle = titleEl.textContent.trim().toLowerCase();
    const habit = habits.find(
      (h) => h.name.trim().toLowerCase() === habitTitle
    );
    if (!habit) return;

    // Reset previous styles before applying rules
    card.style.border = "none";
    card.style.boxShadow = "none";

    // Go through all highlight rules
    highlightRules.forEach((rule) => {
      const conditions = rule.conditions || [];
      const logic = (rule.logic || "OR").toUpperCase();

      let matches = false;

      //  Use switch for logic handling
      switch (logic) {
        case "AND":
          matches = conditions.every((cond) => evaluateCondition(habit, cond));
          break;

        case "OR":
        default:
          matches = conditions.some((cond) => evaluateCondition(habit, cond));
          break;
      }

      //  Apply highlight color if conditions match
      if (matches) {
        const color = rule.action.value || "#00FF00"; 
        card.style.border = `2px solid ${color}`;
        card.style.borderRadius = "8px";
        card.style.boxShadow = `0 0 10px ${color}55`;
      }
    });
  });
}

// Evaluate a single condition

function evaluateCondition(habit, cond) {
  if (!cond.field || !cond.operator || cond.value === undefined) return false;

  let field = cond.field.toLowerCase(); //convert streak and freq in lowercase
  let operator = cond.operator.toLowerCase();
  let value = cond.value.toString().toLowerCase(); //Converts the condition’s value to string format and lowercase.

  // Field name normalization
  switch (field) {
    case "dailytype":
      field = "frequency";
      break;
    case "streaks":
      field = "streak";
      break;
  }

  // Special handling for numeric streak field
  if (field === "streak") {
    const habitStreak = Number(habit.streak) || 0;
    const ruleNumber = Number(value) || 0;

    switch (operator) {
      case "equals":
        return habitStreak === ruleNumber;

      case "notequals":
        return habitStreak !== ruleNumber;

      case "greaterthan":
        return habitStreak > ruleNumber;

      case "lessthan":
        return habitStreak < ruleNumber;

      default:
        return false;
    }
  }

  // For text fields (like frequency, description, etc.)
  let rawValue = habit[field];
  if (rawValue === undefined || rawValue === null) rawValue = "";

  // Convert everything to lowercase string array for comparison
  const habitValues = Array.isArray(rawValue)
    ? rawValue.map((v) => v.toString().toLowerCase())
    : [rawValue.toString().toLowerCase()];

  // Switch-case for string comparisons
  switch (operator) {
    case "equals":
      return habitValues.includes(value);

    case "notequals":
      return !habitValues.includes(value);

    case "contains":
      return habitValues.some((v) => v.includes(value));

    default:
      return false;
  }
}


// Trigger rule application whenever habits or rules update
document.addEventListener("DOMContentLoaded", () => {
  renderHabits(); // make sure habits are rendered first
  applyRulesToHabits();
  // renderHabitCalendar();
});
//dynamically update the UI whenever habits or rules change, without page reload
window.addEventListener("storage", (e) => {
  if (e.key === "automationRules" || e.key === "habits") {
    applyRulesToHabits();
  }
});


// ===== INITIAL LOAD =====
document.addEventListener("DOMContentLoaded", renderHabits);
