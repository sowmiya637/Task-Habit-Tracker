// === Modal Controls ===
const modal = document.getElementById("taskModal");
const addTaskBtn = document.getElementById("addTaskBtn");
const closeBtn = document.querySelector(".close");
// const cancelBtn = document.querySelector(".cancel-btn");
const cancelTaskBtn = document.querySelector(".task-cancel-btn");
const form = document.getElementById("taskForm");

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

// === Filters - wire up selects ===
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const sortSelect = document.getElementById("sortSelect");
// When filters change, re-render tasks
if (statusFilter) statusFilter.addEventListener("change", () => displayTasks());
if (priorityFilter) priorityFilter.addEventListener("change", () => displayTasks());
if (sortSelect) sortSelect.addEventListener("change", () => displayTasks());

let editIndex = null; // Track which task is being edited

addTaskBtn.addEventListener("click", () => {
  modal.style.display = "block";
  form.reset();
  editIndex = null; // new task mode
  document.querySelector(".modal-content h2").textContent = "Add task";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// cancelBtn.addEventListener("click", () => {
//   modal.style.display = "none";
// });
if (cancelTaskBtn) {
  cancelTaskBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}


window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// === Add / Edit Task Form Submission ===

// === Display Tasks ===
function displayTasks() {
  const container = document.querySelector(".empty-state");
  let allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  //searching a tasks..

  const searchValue = document.getElementById("searchInput")
  ? document.getElementById("searchInput").value.toLowerCase()
  : "";
  

  // === Read filter values ===
  const statusVal = statusFilter ? statusFilter.value : "All";
  const priorityVal = priorityFilter ? priorityFilter.value : "All";

  // === Filter tasks ===

  const tasks = allTasks
  .filter(task => {
    const statusMatch = (statusVal === "All") || (task.status === statusVal);
    const priorityMatch = (priorityVal === "All") || (task.priority === priorityVal);
    const searchMatch =
      task.title.toLowerCase().includes(searchValue) ||
      task.desc.toLowerCase().includes(searchValue);
    return statusMatch && priorityMatch && searchMatch;
  });

   
// === Sorting Logic ===
const sortVal = sortSelect ? sortSelect.value : "Created";

if (sortVal === "Priority") {
  const order = { High: 3, Medium: 2, Low: 1 };
  tasks.sort((a, b) => order[b.priority] - order[a.priority]);
} else if (sortVal === "Status") {
  const order = { "Todo": 1, "In Progress": 2, "Done": 3 };
  tasks.sort((a, b) => order[a.status] - order[b.status]);
} else if (sortVal === "Created") {
  // Sort newest first (requires createdAt field)
  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}


  // If no tasks after filtering, show empty state message
  if (tasks.length === 0) {
    container.innerHTML = `
      <i class="fa-regular fa-clipboard"></i>
      <p>No tasks found. Create your first task to get started!</p>
    `;
    return;
  }

  container.innerHTML = ""; // clear old tasks

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.classList.add("task-card");

    
   //tasks completed strikeout
       if (task.status === "Completed" || task.status === "Done") {
  div.classList.add("completed");
}

    const tasksList = JSON.parse(localStorage.getItem("tasksList")) || [];
// renderTasks(tasks

    div.innerHTML = `
  <div class="task-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <i class="fa-solid fa-grip-vertical" style="color:#6b7280; cursor:grab;"></i>
      <h3 style="margin: 0; font-size: 18px; color: #333;">${task.title}</h3>
    </div>
    <div class="task-actions-icons" style="display: flex; gap: 10px;">
      <i class="fa-solid fa-chevron-up move-up" title="Move Up" style="cursor: pointer; color: #0c0c0cff;"></i>
      <i class="fa-solid fa-chevron-down move-down" title="Move Down" style="cursor: pointer; color: #0c0c0cff;"></i>
      <img src="../asset/edit.png" 
       alt="Edit" 
       title="Edit" 
       class="edit" 
       style="width: 16px; height: 16px; cursor: pointer;">
       
  <img src="../asset/delete.png" 
       alt="Delete" 
       title="Delete" 
       class="delete" 
       style="width: 16px; height: 16px; cursor: pointer;">
    </div>
  </div>

  <p style="margin: 5px 0 10px; text-align:left; color: #666; font-size: 14px;">${task.desc || "No description"}</p>

<p style="margin: 5px 0; text-align:left; font-size: 14px; display: flex; align-items: center; gap: 10px;">


  <!-- Priority -->
  <!-- <span style="display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; background-color: ${task.priority === 'High' ? '#ff6b6b' : task.priority === 'Medium' ? '#fbc531' : '#2e1f9eff'}; color: white; font-size: 12px; padding: 4px 10px;">
    <i class="fa-solid fa-flag" style="color: #fff; font-size: 14px;"></i>
    ${task.priority}
  </span> -->
  <span style="display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; background-color: ${task.priority === 'High' ? '#ff6b6b' : task.priority === 'Medium' ? '#fbc531' : '#2e1f9eff'}; color: white; font-size: 12px; padding: 4px 10px;">
  <img src="../asset/${task.priority === 'High' ? 'flag.png' : task.priority === 'Medium' ? 'flag.png' : 'flag.png'}" 
       alt="${task.priority} flag" 
       style="width: 14px; height: 14px;">
  ${task.priority}
</span>


  <!-- Date -->
<span style="display: inline-flex; align-items: center; gap: 6px; border: 1px solid #d1d5db; border-radius: 10px; padding: 4px 10px; background-color: #f3f3f8ff;">
  <img src="../asset/calender.png" 
       alt="calendar" 
       style="width: 14px; height: 14px;">
  <span style="color: #374151; font-weight: 500;">${formatDate(task.date)}</span>
</span>

</p>

<!-- status -->

  <p style="margin: 5px 0;  text-align:left; font-size: 14px; display: flex; align-items: center; gap: 6px;">
  <b style="color: #333;">Status</b>
  <select 
    style="width: 150px; padding: 10px 12px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 10px; background-color: #fff; color: #374151; outline: none; cursor: pointer;">
    <option value="Todo" ${task.status === "Todo" ? "selected" : ""}>Todo</option>
    <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
    <option value="Done" ${task.status === "Done" ? "selected" : ""}>Done</option>
  </select>
</p>

<!-- subtask -->

<div class="subtask-section" style="margin-top: 10px;">
    <div class="subtask-header"
         style="display: flex; align-items: center; gap: 6px; font-size: 14px; color: #4b5563; cursor: pointer; margin-bottom: 6px;">
      <i class="fa-solid fa-chevron-right" style="font-size: 13px; color: #6b7280;"></i>
      <span>Subtasks (<span class="subtask-count">0</span>)</span>
    </div>

    <div class="subtask-content" style="display: none;">
      <div class="subtask-input"
           style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
        <input type="text" placeholder="Add subtask" class="subtask-input-field"
               style="flex: 1; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; outline: none;" />
        <button class="add-subtask-btn"
                style="background-color: #34d399; border: none; color: white; width: 35px; height: 35px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
          <i class="fa-solid fa-plus" style="font-size: 15px;"></i>
        </button>
      </div>

      <ul class="subtask-list" style="list-style: none; margin: 0; padding: 0;"></ul>
    </div>
</div>

`;

// === Handle Status Change ===
const statusSelect = div.querySelector("select");
statusSelect.addEventListener("change", (e) => {
  const newStatus = e.target.value;
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks[index].status = newStatus;
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // ✅ Notify other pages (like dashboard) to update chart dynamically
//   window.dispatchEvent(new Event("storage"));

  // ✅ Update dashboard immediately when task status changes
  if (typeof updateDashboard === "function") {
    updateDashboard();
  }

  // ✅ Re-render tasks to reflect change visually
  displayTasks();
  

});


// Edit Task
    div.querySelector(".edit").addEventListener("click", () => {
      openEditModal(index);
    });

    // Delete Task
    // div.querySelector(".delete").addEventListener("click", () => {
    //   if (confirm("Are you sure you want to delete this task?")) {
    //     deleteTask(index);
    //   }
    // });

    div.querySelector(".delete").addEventListener("click", () => {
  confirmDeleteTask(index);
});

    // Move Up
div.querySelector(".move-up").addEventListener("click", () => {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  if (index > 0) {
    [tasks[index - 1], tasks[index]] = [tasks[index], tasks[index - 1]];
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
  }
});

// Move Down
div.querySelector(".move-down").addEventListener("click", () => {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  if (index < tasks.length - 1) {
    [tasks[index + 1], tasks[index]] = [tasks[index], tasks[index + 1]];
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
  }
});



// === ✅ Apply Show Badge Rule (without affecting existing code) ===
// const allRules = JSON.parse(localStorage.getItem("automationRules")) || [];

// // Filter only active task rules with showBadge action
// const showBadgeRules = allRules.filter(
//   rule => rule.enabled && rule.applyTo === "task" && rule.action?.type === "showBadge"
// );

// // For each showBadge rule, check if current task meets all conditions
// showBadgeRules.forEach(rule => {
//   const conditions = rule.conditions || [];

//   const matches = conditions.every(cond => {
//     const field = cond.field?.toLowerCase();
//     const operator = cond.operator?.toLowerCase();
//     const value = cond.value?.toLowerCase();
//     const taskValue = (task[field] || "").toLowerCase();

//     if (operator === "equals") return taskValue === value;
//     if (operator === "notequals") return taskValue !== value;
//     return taskValue.includes(value);
//   });

//   // If all conditions match, show badge on task
//   if (matches) {
//     const badge = document.createElement("span");
//     badge.textContent = rule.action.value || rule.name;
//     badge.classList.add("task-badge");

//     // ✅ Style (adjust colors as you like)
//     badge.style.background = "#908c8aff";
//     badge.style.color = "#fff";
//     badge.style.padding = "2px 8px";
//     badge.style.borderRadius = "6px";
//     badge.style.fontSize = "12px";
//     badge.style.marginLeft = "8px";

//     // Insert badge right beside task title
//     const titleEl = div.querySelector(".task-top h3");
//     if (titleEl) titleEl.after(badge);
//   }
// });


    container.appendChild(div);


// === Subtask Logic ===
const subtaskSection = div.querySelector(".subtask-section");
const header = subtaskSection.querySelector(".subtask-header");
const content = subtaskSection.querySelector(".subtask-content");
const chevron = header.querySelector("i");
const subtaskList = subtaskSection.querySelector(".subtask-list");
const subtaskCount = subtaskSection.querySelector(".subtask-count");
const addBtn = subtaskSection.querySelector(".add-subtask-btn");
const input = subtaskSection.querySelector(".subtask-input-field");

// Toggle show/hide subtasks
header.addEventListener("click", () => {
  const visible = content.style.display === "block";
  content.style.display = visible ? "none" : "block";
  chevron.classList.toggle("fa-chevron-down", !visible);
  chevron.classList.toggle("fa-chevron-right", visible);
});

// Add subtask
addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (text === "") return;

  const li = document.createElement("li");
  li.style.cssText = `
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 4px; border-bottom: 1px solid #f3f4f6; font-size: 14px;
    color: #374151;
  `;
  li.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <input type="checkbox" style="width: 16px; height: 16px; accent-color: #34d399;">
      <span>${text}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <i class="fa-solid fa-pen-to-square" title="Edit" style="cursor: pointer; color: #2d794f; font-size: 14px;"></i>
      <i class="fa-solid fa-trash" title="Delete" style="cursor: pointer; color: #e74c3c; font-size: 14px;"></i>
    </div>
  `;

  subtaskList.appendChild(li);
  input.value = "";
  subtaskCount.textContent = subtaskList.children.length;

  //  Delete subtask
  li.querySelector(".fa-trash").addEventListener("click", () => {
    li.remove();
    subtaskCount.textContent = subtaskList.children.length;
  });

  //  Edit subtask
  li.querySelector(".fa-pen-to-square").addEventListener("click", () => {
    const span = li.querySelector("span");
    const currentText = span.textContent;
    const newText = prompt("Edit subtask:", currentText);

    if (newText && newText.trim() !== "") {
      span.textContent = newText.trim();
    }
  });
});


// === DRAG & DROP FUNCTIONALITY ===
const taskCards = container.querySelectorAll(".task-card");

taskCards.forEach(card => {
  card.setAttribute("draggable", true);

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.dataset.index || index);

     // ✅ Prevent heavy ghost preview (fixes lag / hang issue)
    const img = new Image();
    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO0dO8PAwADzwG8lXxQ8wAAAABJRU5ErkJggg==";
    e.dataTransfer.setDragImage(img, 0, 0);

    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });
});

container.addEventListener("dragover", (e) => {
  e.preventDefault();
  const draggingCard = container.querySelector(".dragging");
  const afterElement = getDragAfterElement(container, e.clientY);
  if (afterElement == null) {
    container.appendChild(draggingCard);
  } else {
    container.insertBefore(draggingCard, afterElement);
  }
});

container.addEventListener("drop", () => {
  const newOrder = Array.from(container.querySelectorAll(".task-card")).map(card => {
    const title = card.querySelector("h3").textContent;
    return JSON.parse(localStorage.getItem("tasks")).find(t => t.title === title);
  });
  localStorage.setItem("tasks", JSON.stringify(newOrder));
  displayTasks();
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".task-card:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}




 });
 // ✅ Apply showBadge rules after rendering all tasks
  applyRulesToTasks();
}

// === Open Modal for Editing ===
function openEditModal(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];

  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDesc").value = task.desc;
  document.getElementById("taskDate").value = task.date;
  document.getElementById("taskPriority").value = task.priority;
  document.getElementById("taskStatus").value = task.status;

  document.querySelector(".modal-content h2").textContent = "Edit task";
  modal.style.display = "block";
  editIndex = index;
}

// === Delete Task(toaster) ===
function deleteTask(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
  showToast1("Done!Your item has been removed.");
}


// Load tasks on page load
// document.addEventListener("DOMContentLoaded", displayTasks);
// === INITIALIZE ON PAGE LOAD ===
document.addEventListener("DOMContentLoaded", displayTasks);

// === ADD / EDIT TASK SUBMIT HANDLER ===
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const date = document.getElementById("taskDate").value;
  const priority = document.getElementById("taskPriority").value;
  const status = document.getElementById("taskStatus").value;

  if (!title || !date || !priority || !status) {
    alert("Please fill all required fields!");
    return;
  }

  const newTask = { title, desc, date, priority, status };
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (editIndex !== null) {
    tasks[editIndex] = newTask;
    showToast1("✅ All set! Your changes have been added successfully!");
  } else {
    tasks.push(newTask);
    showToast1("✅ Task added successfully!");
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  modal.style.display = "none";
  form.reset();
  displayTasks();
});


// //  Dark Mode Toggle
// const themeToggle = document.getElementById("themeToggle");
// themeToggle.addEventListener("click", () => {
//   document.body.classList.toggle("dark-mode");

//   // Save preference
//   localStorage.setItem(
//     "theme",
//     document.body.classList.contains("dark-mode") ? "dark" : "light"
//   );

//   // Change icon dynamically
//   themeToggle.innerHTML = document.body.classList.contains("dark-mode")
//     ? '<i class="fa-solid fa-sun"></i>'
//     : '<i class="fa-solid fa-moon"></i>';
// });

// // Keep theme on reload
// if (localStorage.getItem("theme") === "dark") {
//   document.body.classList.add("dark-mode");
//   themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
// }



//searching a tasks

document.getElementById("searchInput")?.addEventListener("input", displayTasks);


// Convert date from yyyy-mm-dd → dd-mm-yyyy
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}
// === Apply Show Badge Rules after rendering all tasks ===

// function applyRulesToTasks() {
//   const allRules = JSON.parse(localStorage.getItem("automationRules")) || [];

//   const showBadgeRules = allRules.filter(
//     r => r.enabled && r.applyTo === "task" && r.action?.type === "showBadge"
//   );

//   const taskCards = document.querySelectorAll(".task-card");
//   const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

//   const parseDate = (val) => {
//     if (!val) return null;
//     if (typeof val !== "string") return null;
//     if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
//       const [y, m, d] = val.split("-").map(Number);
//       return new Date(y, m - 1, d);
//     }
//     if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
//       const [d, m, y] = val.split("/").map(Number);
//       return new Date(y, m - 1, d);
//     }
//     const parsed = new Date(val);
//     return isNaN(parsed) ? null : parsed;
//   };

//   taskCards.forEach(card => {
//     const title = card.querySelector(".task-top h3")?.textContent.trim();
//     const task = allTasks.find(t => t.title === title);
//     if (!task) return;

//     const oldBadge = card.querySelector(".task-badge");
//     if (oldBadge) oldBadge.remove();

//     showBadgeRules.forEach(rule => {
//       const conditions = rule.conditions || [];
//       const operatorType = (rule.operatorType || "AND").toUpperCase();

//       const results = conditions.map(cond => {
//         let field = cond.field?.toLowerCase();
//         const operator = cond.operator?.toLowerCase();
//         let ruleValue = (cond.value || "").trim().toLowerCase();

//         let taskValue = "";
//         if (["duedate", "due date", "due_date", "date"].includes(field)) {
//           taskValue = task["date"];
//           field = "date";
//         } else {
//           taskValue = (task[field] || "").toString().trim().toLowerCase();
//         }

//         const normalize = val => {
//           if (["completed", "done", "finish", "finished"].includes(val)) return "done";
//           if (["pending", "todo", "to-do", "incomplete"].includes(val)) return "todo";
//           if (["high", "medium", "low"].includes(val)) return val;
//           return val;
//         };
//         ruleValue = normalize(ruleValue);
//         taskValue = normalize(taskValue);

//         // === Handle date-based logic ===
//         if (field === "date") {
//           const taskDate = parseDate(taskValue);
//           if (!taskDate) return false;

//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
//           const taskDay = new Date(taskDate);
//           taskDay.setHours(0, 0, 0, 0);

//           // For "yesterday", "tomorrow", "today" text values
//           if (["yesterday", "today", "tomorrow"].includes(ruleValue)) {
//             if (ruleValue === "today") {
//               return taskDay.getTime() === today.getTime();
//             }
//             if (ruleValue === "yesterday") {
//               //  Match all dates BEFORE today
//               return taskDay.getTime() < today.getTime();
//             }
//             if (ruleValue === "tomorrow") {
//               //  Match all dates AFTER today
//               return taskDay.getTime() > today.getTime();
//             }
//           }

//           // === For custom date values in rule (e.g. "2025-11-10") ===
//           const ruleDate = parseDate(cond.value);
//           if (!ruleDate) return false;
//           ruleDate.setHours(0, 0, 0, 0);

//           if (operator === "before") return taskDay < ruleDate;
//           if (operator === "after") return taskDay > ruleDate;
//           if (operator === "on" || operator === "equals")
//             return taskDay.getTime() === ruleDate.getTime();

//           return false;
//         }

//         // === Handle normal text fields ===
//         if (operator === "equals") return taskValue === ruleValue;
//         if (operator === "notequals") return taskValue !== ruleValue;
//         if (operator === "contains") return taskValue.includes(ruleValue);
//         return false;
//       });

//       // Filter out invalid (undefined/null) results before applying logic
// const validResults = results.filter(r => typeof r === "boolean");

// let matches = false;
// if (validResults.length > 0) {
//   if (operatorType === "AND") {
//     matches = validResults.every(Boolean);
//   } else if (operatorType === "OR") {
//     matches = validResults.some(Boolean);
//   }
// }

// if (matches) {
//         const badge = document.createElement("span");
//         badge.textContent = rule.action.value || rule.name;
//         badge.classList.add("task-badge");
//         badge.style.background = "#908c8a";
//         badge.style.color = "#fff";
//         badge.style.padding = "2px 8px";
//         badge.style.borderRadius = "6px";
//         badge.style.fontSize = "12px";
//         badge.style.marginLeft = "8px";

//         const titleEl = card.querySelector(".task-top h3");
//         if (titleEl) titleEl.after(badge);
//       }
//     });
//   });
// }
// function applyRulesToTasks() {
//   // Get all rules from localStorage
//   const allRules = JSON.parse(localStorage.getItem("automationRules")) || [];

//   // Only rules that are for tasks and show badges
//   const showBadgeRules = allRules.filter(rule => 
//     rule.enabled && rule.applyTo === "task" && rule.action?.type === "showBadge"
//   );

//   // Get all task cards on the page
//   const taskCards = document.querySelectorAll(".task-card");
//   const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

//   // Function to parse different date formats
//   const parseDate = (val) => {
//     if (!val || typeof val !== "string") return null;

//     if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
//       const [y, m, d] = val.split("-").map(Number);
//       return new Date(y, m - 1, d);
//     }

//     if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
//       const [d, m, y] = val.split("/").map(Number);
//       return new Date(y, m - 1, d);
//     }

//     const parsed = new Date(val);
//     return isNaN(parsed) ? null : parsed;
//   };

//   // Loop through all task cards
//   taskCards.forEach(card => {
//     const titleEl = card.querySelector(".task-top h3");
//     if (!titleEl) return;

//     const title = titleEl.textContent.trim();
//     const task = allTasks.find(t => t.title === title);
//     if (!task) return;


//     // Remove existing badge if any
//     const oldBadge = card.querySelector(".task-badge");
//     if (oldBadge) oldBadge.remove();

//     // Apply each rule
//     showBadgeRules.forEach(rule => {
//       const conditions = rule.conditions || [];
//       const operatorType = (rule.operatorType || "AND").toUpperCase();

//       // Check all conditions
//       const results = conditions.map(cond => {
//         let field = cond.field?.toLowerCase();
//         const operator = cond.operator?.toLowerCase();
//         let ruleValue = (cond.value || "").trim().toLowerCase();

//         // Get task value
//         let taskValue = "";
//         if (["duedate", "due date", "due_date", "date"].includes(field)) {
//           taskValue = task["date"];
//           field = "date";
//         } else {
//           taskValue = (task[field] || "").toString().trim().toLowerCase();
//         }

//         // Normalize certain text values
//         const normalize = val => {
//           switch (val) {
//             case "completed": case "done": case "finish": case "finished": return "done";
//             case "pending": case "todo": case "to-do": case "incomplete": return "todo";
//             case "high": case "medium": case "low": return val;
//             default: return val;
//           }
//         };
//         ruleValue = normalize(ruleValue);
//         taskValue = normalize(taskValue);

//         // Handle date field
//        if (field === "date") {
//   const taskDateObj = parseDate(taskValue);
//   if (!taskDateObj) return false;

//   // Normalize task date to midnight
//   const taskTime = new Date(taskDateObj.getFullYear(), taskDateObj.getMonth(), taskDateObj.getDate()).getTime();

//   const today = new Date();
//   const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
//   const yesterdayTime = todayTime - 24*60*60*1000;
//   const tomorrowTime  = todayTime + 24*60*60*1000;

//   // Handle relative keywords
//   if (ruleValue === "today") return taskTime === todayTime;
//   if (ruleValue === "yesterday") return taskTime === yesterdayTime;
//   if (ruleValue === "tomorrow") return taskTime === tomorrowTime;

//   // For custom operator rules
//   switch (operator.toLowerCase()) {
//     case "equals": return taskTime === parseDate(cond.value).getTime();
//     case "lt":   return taskTime < yesterdayTime; // strictly before yesterday
//     case "lte":  return taskTime <= yesterdayTime; // up to yesterday
//     case "gt":   return taskTime > tomorrowTime;  // strictly after tomorrow
//     case "gte":  return taskTime >= tomorrowTime; // from tomorrow onwards
//     default: return false;
//   }
// }
      
//         // Normal text comparison
//         switch (operator) {
//           case "equals": return taskValue === ruleValue;
//           case "notequals": return taskValue !== ruleValue;
//           case "contains": return taskValue.includes(ruleValue);
//           default: return false;
//         }
//       });

//       // Combine results based on AND/OR
//       const validResults = results.filter(r => typeof r === "boolean");
//       let matches = false;

//       if (validResults.length > 0) {
//         switch (operatorType) {
//           case "AND": matches = validResults.every(Boolean); break;
//           case "OR": matches = validResults.some(Boolean); break;
//         }
//       }

//       // Show badge if rule matches
//       if (matches) {
//         const badge = document.createElement("span");
//         badge.textContent = rule.action.value || rule.name;
//         badge.classList.add("task-badge");
//         badge.style.background = "#908c8a";
//         badge.style.color = "#fff";
//         badge.style.padding = "2px 8px";
//         badge.style.borderRadius = "6px";
//         badge.style.fontSize = "12px";
//         badge.style.marginLeft = "8px";

//         if (titleEl) titleEl.after(badge);
//       }
//     });
//   });
// }
function applyRulesToTasks() {
  const allRules = JSON.parse(localStorage.getItem("automationRules")) || [];
  const showBadgeRules = allRules.filter(rule =>
    rule.enabled && rule.applyTo === "task" && rule.action?.type === "showBadge"
  );

  const taskCards = document.querySelectorAll(".task-card");
  const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Parse date helper
  const parseDate = (val) => {
    if (!val) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      const [d, m, y] = val.split("/").map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(val);
    return isNaN(parsed) ? null : parsed;
  };

  taskCards.forEach(card => {
    const titleEl = card.querySelector(".task-top h3");
    if (!titleEl) return;

    const title = titleEl.textContent.trim();
    const task = allTasks.find(t => t.title === title);
    if (!task) return;

    // Remove old badge
    const oldBadge = card.querySelector(".task-badge");
    if (oldBadge) oldBadge.remove();

    showBadgeRules.forEach(rule => {
      const conditions = rule.conditions || [];
      const operatorType = (rule.operatorType || "AND").toUpperCase();

      const results = conditions.map(cond => {
        let field = cond.field?.toLowerCase();
        let operator = (cond.operator || "").toLowerCase();
        let ruleValue = (cond.value || "").trim().toLowerCase();

        // Map human-readable operator to internal code
        switch (operator) {
          case "less than": operator = "lt"; break;
          case "less than or equal": operator = "lte"; break;
          case "equal": operator = "equals"; break;
          case "greater than": operator = "gt"; break;
          case "greater than or equal": operator = "gte"; break;
        }

        // Get task value
        let taskValue = "";
        if (["duedate", "due date", "due_date", "date"].includes(field)) {
          taskValue = task["date"];
          field = "date";
        } else {
          taskValue = (task[field] || "").toString().trim().toLowerCase();
        }

        // Normalize some text
        const normalize = val => {
          switch (val) {
            case "completed": case "done": case "finish": case "finished": return "done";
            case "pending": case "todo": case "to-do": case "incomplete": return "todo";
            case "high": case "medium": case "low": return val;
            default: return val;
          }
        };
        ruleValue = normalize(ruleValue);
        taskValue = normalize(taskValue);

        if (field === "date") {
          const taskDate = parseDate(taskValue);
          if (!taskDate) return false;

          const today = new Date();
          const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const yesterdayTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();

          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const tomorrowTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).getTime();

          const taskTime = taskDate.getTime();
  
          switch (operator) {
            case "equals":
              if (ruleValue === "today") return taskTime === todayTime;
              if (ruleValue === "yesterday") return taskTime === yesterdayTime;
              if (ruleValue === "tomorrow") return taskTime === tomorrowTime;
              return taskTime === parseDate(cond.value)?.getTime();

            case "lt":   // less than rule date
              if (ruleValue === "yesterday") return taskTime < yesterdayTime;
              if (ruleValue === "today") return taskTime < todayTime;
              return taskTime < parseDate(cond.value)?.getTime();

            case "lte":  // less than or equal
              if (ruleValue === "yesterday") return taskTime <= yesterdayTime;
              if (ruleValue === "today") return taskTime <= todayTime;
              return taskTime <= parseDate(cond.value)?.getTime();

            case "gt":   // greater than rule date
              if (ruleValue === "tomorrow") return taskTime > tomorrowTime;
              if (ruleValue === "today") return taskTime > todayTime;
              return taskTime > parseDate(cond.value)?.getTime();

            case "gte":  // greater than or equal
              if (ruleValue === "tomorrow") return taskTime >= tomorrowTime;
              if (ruleValue === "today") return taskTime >= todayTime;
              return taskTime >= parseDate(cond.value)?.getTime();

            default: return false;
          }
        }

        // Normal text comparison
        switch (operator) {
          case "equals": return taskValue === ruleValue;
          case "notequals": return taskValue !== ruleValue;
          case "contains": return taskValue.includes(ruleValue);
          default: return false;
        }
      });

      const validResults = results.filter(r => typeof r === "boolean");
      let matches = false;
      if (validResults.length > 0) {
        matches = operatorType === "AND" ? validResults.every(Boolean) : validResults.some(Boolean);
      }

      if (matches) {
        const badge = document.createElement("span");
        badge.textContent = rule.action.value || rule.name;
        badge.classList.add("task-badge");
        badge.style.background = "#908c8a";
        badge.style.color = "#fff";
        badge.style.padding = "2px 8px";
        badge.style.borderRadius = "6px";
        badge.style.fontSize = "12px";
        badge.style.marginLeft = "8px";
        if (titleEl) titleEl.after(badge);
      }
    });
  });
}



// ===== Toast Notification =====
function showToast1(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  toastMessage.textContent = message;

  toast.classList.add("show");

  // Auto close after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);

  // Manual close
  document.getElementById("toast-close").onclick = () => {
    toast.classList.remove("show");
  };
}

// ===== Delete Confirmation Modal =====
let deleteIndex = null;

function confirmDeleteTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];
  deleteIndex = index;

  document.getElementById("deleteMessage").innerHTML =
    `Are you sure you want to delete the <b>${task.title}</b> task?`;

  document.getElementById("deleteModal").style.display = "flex";
}

// Close modal actions
document.querySelector(".close-modal").onclick = () => {
  document.getElementById("deleteModal").style.display = "none";
};
document.querySelector(".cancel-btn").onclick = () => {
  document.getElementById("deleteModal").style.display = "none";
};

// Confirm delete
document.querySelector(".delete-btn").onclick = () => {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.splice(deleteIndex, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
  showToast1("🗑️ Task deleted successfully!");
  document.getElementById("deleteModal").style.display = "none";
};

// Attach delete event to each delete icon
// (Make sure this is inside your displayTasks loop)
div.querySelector(".delete").addEventListener("click", () => {
  confirmDeleteTask(index);
});


function markTaskCompleted(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks = tasks.map(task =>
    task.id === id ? { ...task, status: "completed" } : task
  );

  localStorage.setItem("tasks", JSON.stringify(tasks));

  //  update dashboard immediately
  updateDashboardStats();
}
