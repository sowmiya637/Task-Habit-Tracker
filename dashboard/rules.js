document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  initTabs();
  initModal();
  initConditions();
  loadRules();
  initSearch();
  initDeletePopup();
}

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const currentPage = window.location.pathname.split("/").pop();
  tabs.forEach(tab => {
    const href = tab.getAttribute("href");
    tab.classList.toggle("active", href === currentPage);
  });
}

function initModal() {
  const modal = document.getElementById("addRuleModal");
  const addRuleBtn = document.getElementById("addRuleBtn");
  const closeBtn = document.querySelector(".close");
  const cancelBtn = document.querySelector(".cancel-btn");

  addRuleBtn.addEventListener("click", () => {
    document.getElementById("modalTitle").textContent = "Add Rule";
    document.getElementById("editRuleId").value = "";
    modal.style.display = "block";
  });
  
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    resetForm();
  });
  
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    resetForm();
  });
  
  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.style.display = "none";
      resetForm();
    }
  });

  const ruleForm = document.getElementById("ruleForm");
  ruleForm.addEventListener("submit", handleFormSubmit);
}

function initConditions() {
  const applyToSelect = document.getElementById("applyTo");
  const addConditionBtn = document.querySelector(".add-condition");
  const conditionList = document.querySelector(".condition-list");
  const actionSelect = document.getElementById("actionSelect");

  const valueOptions = {
    task: {
      priority: ["High", "Medium", "Low"],
      status: ["To-do", "In Progress", "Completed"],
      dueDate: ["Yesterday", "Today", "Tomorrow"]
    },
    habit: {
  dailyType: ["Daily", "Weekly", "Custom"],
  // streaks: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
}

  };

  // Function to update action options based on applyTo selection
  function updateActionOptions(selectedValue) {
    actionSelect.innerHTML = ''; // Clear existing options
    
    if (selectedValue === "task") {
      actionSelect.innerHTML = `
        <option value="showBadge">Show badge</option>
      `;
    } else if (selectedValue === "habit") {
      actionSelect.innerHTML = `
        <option value="highlight">Highlight</option>
      `;
    }
  }

  applyToSelect.addEventListener("change", () => {
    const selectedValue = applyToSelect.value;
    conditionList.innerHTML = '';
    
    // Update action options based on selection
    updateActionOptions(selectedValue);
    
    if (selectedValue) {
      addNewConditionRow(selectedValue);
    }
  });


  function addNewConditionRow(conditionType) {
    const newRow = document.createElement("div");
    newRow.classList.add("condition-row");

    if (conditionType === "task") {
      newRow.innerHTML = `
        <select class="field">
          <option value="">Select Field</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
          <option value="dueDate">Due date</option>
        </select>
        <select class="operator">
          <option value="equals">Equal</option>
          <option value="notEquals">Not Equal</option>
          <option value="Greater Than">Greater Than</option>
          <option value="Less Than">Less Than</option>
          <option value="Greater Than Or Equal">Greater Than Or Equal</option>
          <option value="Less Than Or Equal">Less Than Or Equal</option>
        </select>
        <select class="value"><option value="">Select Value</option></select>
        <button type="button" class="delete-condition-btn">🗑️</button>
      `;
    } else {
      newRow.innerHTML = `
        <select class="field">
  <option value="">Select Field</option>
  <option value="dailyType">Daily Type</option>
  <option value="streaks">Streaks</option>
</select>

        <select class="operator">
          <option value="equals">Equal</option>
          <option value="notEquals">Not Equal</option>
          <option value="Greater Than">Greater Than</option>
          <option value="Less Than">Less Than</option>
          <option value="Greater Than Or Equal">Greater Than Or Equal</option>
          <option value="Less Than Or Equal">Less Than Or Equal</option>
        </select>
        <select class="value"><option value="">Select Value</option></select>
        <button type="button" class="delete-condition-btn">🗑️</button>
      `;
    }

    conditionList.appendChild(newRow); //new condition row created dynamically
    
    newRow.querySelector(".field").addEventListener("change", () => {
      updateValueOptions(newRow.querySelector(".field"), conditionType);
    });
  }

  conditionList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-condition-btn")) {
      e.target.closest(".condition-row").remove();
    }
  });

  addConditionBtn.addEventListener("click", () => {
    const selectedValue = applyToSelect.value;
    if (!selectedValue) {
      alert("Select 'Apply to' first!");
      return;
    }
    addNewConditionRow(selectedValue);
  });
}

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rules = getRulesFromStorage();
    const filteredRules = rules.filter(rule => 
      rule.name.toLowerCase().includes(searchTerm) || 
      rule.description.toLowerCase().includes(searchTerm)
    );
    displayRules(filteredRules);
  });
}

function initDeletePopup() {
  document.getElementById("confirmDelete").addEventListener("click", () => {
    if (deleteId !== null) {
      const rules = getRulesFromStorage();
      const filteredRules = rules.filter(rule => rule.id !== deleteId);
      saveRulesToStorage(filteredRules);
      loadRules();
      deleteId = null;
    }
    closePopup();
  });

  document.getElementById("cancelDelete").addEventListener("click", closePopup);
  document.getElementById("cancelDelete2").addEventListener("click", closePopup);
}

let deleteId = null;

function deleteRule(ruleId) {
  // Create popup HTML
  const popupHTML = `
    <div id="deletePopup" class="popup-overlay">
      <div class="popup-box">
        <p>Delete</p>
        <button id="cancelDelete2">X</button>
        <p>Are you sure you want to delete this rule?</p>
        <div class="popup-buttons">
          <button id="confirmDelete">Yes, Delete</button>
          <button id="cancelDelete">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Insert popup into body
  document.body.insertAdjacentHTML("beforeend", popupHTML);

  // Store rule ID for later deletion
  const deleteId = ruleId;

  // Show popup
  const popup = document.getElementById("deletePopup");
  popup.style.display = "flex";

  // Cancel (close popup)
  document.getElementById("cancelDelete").onclick = () => popup.remove();
  document.getElementById("cancelDelete2").onclick = () => popup.remove();

  // Confirm delete
  document.getElementById("confirmDelete").onclick = () => {
    const rules = getRulesFromStorage();
    const filteredRules = rules.filter(rule => rule.id !== deleteId);
    saveRulesToStorage(filteredRules);
    loadRules();

     showToast2("Rule deleted successfully!", "info"); // Toast for delete
    popup.remove();
  };
}


function closePopup() {
  document.getElementById("deletePopup").style.display = "none";
}

function handleFormSubmit(e) { //func handle form submission
  e.preventDefault();

  const ruleId = document.getElementById("editRuleId").value;
  const name = document.getElementById("ruleName").value.trim();
  const desc = document.getElementById("ruleDesc").value.trim();
  const applyTo = document.getElementById("applyTo").value;
  const actionType = document.getElementById("actionSelect").value;
  const actionValue = document.getElementById("actionValue").value.trim();
  const operatorType = document.getElementById("condition").value; // ✅ AND / OR


  if (!name) {
    alert("Please enter a rule name!");
    return;
  }

  const conditions = [];
  const conditionRows = document.querySelectorAll('.condition-row');
  conditionRows.forEach(row => {
    const field = row.querySelector('.field').value;
    const operator = row.querySelector('.operator').value;
    // const value = row.querySelector('.value').value;
    let valueElement = row.querySelector('.value'); // check for select
if (!valueElement) {
  valueElement = row.querySelector('input.streak-input'); // fallback for streak input
}
const value = valueElement ? valueElement.value : '';

    if (field && operator && value) {
      conditions.push({
        field,
        operator,
        value
      });
    }
  });

  if (conditions.length === 0) {
    alert("Please add at least one valid condition!");
    return;
  }

  const rule = {
    id: ruleId || Date.now().toString(),
    name,
    description: desc,
    applyTo,
    operatorType,
    conditions,
    action: {
      type: actionType,
      value: actionValue
    },
    enabled: true,
    createdAt: ruleId ? undefined : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  saveRule(rule);
  loadRules();
  
// Show toast
if (ruleId) {
  showToast2("Rule updated successfully!", "success");
} else {
  showToast2("Rule added successfully!", "success");
}

  const modal = document.getElementById("addRuleModal");
  modal.style.display = "none";
  resetForm();
}

function resetForm() {
  document.getElementById("ruleForm").reset();
  document.getElementById("editRuleId").value = "";
  document.getElementById("modalTitle").textContent = "Add Rule";
  
  const conditionList = document.querySelector(".condition-list");
  conditionList.innerHTML = '';  
}

//  Update Value Options (Habit / Task)
function updateValueOptions(selectElement, conditionType) {
  const fieldValue = selectElement.value;
  const valueSelect = selectElement.closest(".condition-row").querySelector(".value");

  // Clear old options
  valueSelect.innerHTML = '<option value="">Select Value</option>';

  // ===== For HABITS =====
  if (conditionType === "habit") {
    if (fieldValue === "dailyType") {
      // Show Daily, Weekly, Custom
      ["Daily", "Weekly", "Custom"].forEach(val => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        valueSelect.appendChild(opt);
      });
    } 
    else if (fieldValue === "streaks") {
  // Create input instead of select
  const input = document.createElement("input");
  input.type = "number";
  input.min = 0;
  input.placeholder = "0";
  input.classList.add("streak-input");

  // Match width and height of the original select
  input.style.width = "80px";
  input.style.height = "30px"; 
  input.style.padding = "2px 4px";
  input.style.fontSize = "13px";

  // Replace the select element with this input
  valueSelect.replaceWith(input);
}

  }

  // For TASKS
  if (conditionType === "task") {
    const valueOptions = {
      priority: ["High", "Medium", "Low"],
      status: ["To-do", "In Progress", "Completed"],
      dueDate: ["Yesterday", "Today", "Tomorrow"]
    };

    if (valueOptions[fieldValue]) {
      valueOptions[fieldValue].forEach(val => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        valueSelect.appendChild(opt);
      });
    }
  }
}


function getRulesFromStorage() { 
  const rules = localStorage.getItem('automationRules');
  return rules ? JSON.parse(rules) : [];
}

function saveRulesToStorage(rules) {
  localStorage.setItem('automationRules', JSON.stringify(rules));
}

function saveRule(rule) {  
  const rules = getRulesFromStorage();
  
  if (rule.id && rules.find(r => r.id === rule.id)) {
    const index = rules.findIndex(r => r.id === rule.id);
    rules[index] = rule;
  } else {
    rules.push(rule);
  }
  
  saveRulesToStorage(rules);
}

function toggleRule(ruleId, enabled) {
  const rules = getRulesFromStorage();
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    rule.enabled = enabled;
    rule.updatedAt = new Date().toISOString();
    saveRulesToStorage(rules);
  }
}

function loadRules() { 
  const rules = getRulesFromStorage();
  displayRules(rules);
}

function displayRules(rules) {
  const rulesList = document.getElementById("rulesList");
  const rulesEmptyState = document.getElementById("rulesEmptyState");

  rulesList.innerHTML = '';

  if (rules.length === 0) {
    rulesEmptyState.style.display = 'block';
    return;
  }

  rulesEmptyState.style.display = 'none';

  rules.forEach(rule => {
    const card = createRuleCard(rule);
    rulesList.appendChild(card);
  });
}

function createRuleCard(rule) {
  const card = document.createElement("div");
  card.classList.add("rule-card", rule.enabled ? "active" : "inactive");
  card.dataset.ruleId = rule.id;

  const left = document.createElement("div");
  left.classList.add("left-section");

  const titleRow = document.createElement("div");
  titleRow.style.display = "flex";
  titleRow.style.alignItems = "center";
  titleRow.style.gap = "8px";

  const title = document.createElement("h4");
  title.textContent = rule.name;

  const tag = document.createElement("h4");
  tag.textContent = rule.applyTo;

  titleRow.appendChild(title);
  titleRow.appendChild(tag);

  const descText = document.createElement("p");
  descText.textContent = rule.description || "No description provided";
  descText.style.fontSize = "13px";
  descText.style.margin = "4px 0 0 0";
  descText.style.color = "#777";

  left.appendChild(titleRow);
  left.appendChild(descText);

  const right = document.createElement("div");
  right.classList.add("right-section");

// Delete icon as image
const deleteIcon = document.createElement("img");
deleteIcon.src = "../asset/delete.png"; 
deleteIcon.alt = "Delete";
deleteIcon.title = "Delete Rule";
deleteIcon.style.width = "20px";
deleteIcon.style.height = "20px";
deleteIcon.style.cursor = "pointer";
deleteIcon.addEventListener("click", () => deleteRule(rule.id));

// Edit icon as image
const editIcon = document.createElement("img");
editIcon.src = "../asset/edit.png"; 
editIcon.alt = "Edit";
editIcon.title = "Edit Rule";
editIcon.style.width = "20px";
editIcon.style.height = "20px";
editIcon.style.cursor = "pointer";
editIcon.addEventListener("click", () => editRule(rule));

  const toggle = document.createElement("label");
  toggle.classList.add("switch");
  toggle.innerHTML = `<input type="checkbox" ${rule.enabled ? 'checked' : ''}><span class="slider round"></span>`;
  const checkbox = toggle.querySelector("input");
  checkbox.addEventListener("change", () => {
    toggleRule(rule.id, checkbox.checked);
    card.classList.toggle("inactive", !checkbox.checked);
    card.classList.toggle("active", checkbox.checked);
  });

  right.appendChild(deleteIcon);
  right.appendChild(editIcon);
  right.appendChild(toggle);

  card.appendChild(left);
  card.appendChild(right);

  return card;
}

function editRule(rule) {
  const modal = document.getElementById("addRuleModal");
  const modalTitle = document.getElementById("modalTitle");
  
  modalTitle.textContent = "Edit Rule";
  document.getElementById("editRuleId").value = rule.id;
  document.getElementById("ruleName").value = rule.name;
  document.getElementById("ruleDesc").value = rule.description;
  document.getElementById("applyTo").value = rule.applyTo;
  document.getElementById("actionSelect").value = rule.action.type;
  document.getElementById("actionValue").value = rule.action.value || '';
  if (document.getElementById("condition")) {
    document.getElementById("condition").value = (rule.operatorType || "and").toLowerCase();
  }

  const conditionList = document.querySelector(".condition-list");
  conditionList.innerHTML = '';

  if (rule.conditions && rule.conditions.length > 0) {
    rule.conditions.forEach(condition => {
      addNewConditionRow(rule.applyTo, condition);
    });
  } else {
    addNewConditionRow(rule.applyTo);
  }

  modal.style.display = "block";
}

function addNewConditionRow(conditionType, conditionData = null) {
  const conditionList = document.querySelector(".condition-list");
  const newRow = document.createElement("div");
  newRow.classList.add("condition-row");

  if (conditionType === "task") {
    newRow.innerHTML = `
      <select class="field">
        <option value="">Select Field</option>
        <option value="priority">Priority</option>
        <option value="status">Status</option>
        <option value="dueDate">Due date</option>
      </select>
      <select class="operator">
        <option value="equals">Equal</option>
          <option value="notEquals">Not Equal</option>
          <option value="Greater Than">Greater Than</option>
          <option value="Less Than">Less Than</option>
          <option value="Greater Than Or Equal">Greater Than Or Equal</option>
          <option value="Less Than Or Equal">Less Than Or Equal</option>
      </select>
      <select class="value"><option value="">Select Value</option></select>
      <button type="button" class="delete-condition-btn">🗑️</button>
    `;
  } else {
    newRow.innerHTML = `
      <select class="field">
        <option value="">Select Field</option>
<option value="dailyType">Daily Type</option>
<option value="streaks">Streaks</option>

      </select>
      <select class="operator">
        <option value="equals">Equal</option>
          <option value="notEquals">Not Equal</option>
          <option value="Greater Than">Greater Than</option>
          <option value="Less Than">Less Than</option>
          <option value="Greater Than Or Equal">Greater Than Or Equal</option>
          <option value="Less Than Or Equal">Less Than Or Equal</option>
      </select>
      <select class="value"><option value="">Select Value</option></select>
      <button type="button" class="delete-condition-btn">🗑️</button>
    `;
  }

  conditionList.appendChild(newRow);
  
  if (conditionData) {
  const fieldSelect = newRow.querySelector('.field');
  const operatorSelect = newRow.querySelector('.operator');
  const valueSelect = newRow.querySelector('.value');

  // Set the saved field & operator
  fieldSelect.value = conditionData.field;
  operatorSelect.value = conditionData.operator;

  //  Load correct options (creates input for streaks)
updateValueOptions(fieldSelect, conditionType);

//  If streaks, set the value on input
if (conditionData.field === "streaks") {
  const input = newRow.querySelector("input.streak-input");
  if (input) input.value = conditionData.value;
} else {
  const valueSelect = newRow.querySelector(".value");
  if (valueSelect) valueSelect.value = conditionData.value;
}

}


  newRow.querySelector(".field").addEventListener("change", () => {
    updateValueOptions(newRow.querySelector(".field"), conditionType);
  });
}

function resetForm() {
  document.getElementById("ruleForm").reset();
  document.getElementById("editRuleId").value = "";
  document.getElementById("modalTitle").textContent = "Add Rule";
  
  // Clear conditions
  const conditionList = document.querySelector(".condition-list");
  conditionList.innerHTML = '';
  
  // Reset action select to default state (empty or both options)
  const actionSelect = document.getElementById("actionSelect");
  actionSelect.innerHTML = `
    <option value="showBadge">Show badge</option>
    <option value="highlight">Highlight</option>
  `;
}
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector("i");
  const body = document.body;
  const header = document.querySelector("header");

  // Check saved theme in localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    header.classList.add("dark-mode");
    themeIcon.classList.replace("fa-moon", "fa-sun");

  }

  // Toggle on click
  themeToggle.addEventListener("click", () => {
    const isDark = body.classList.toggle("dark-mode");
    header.classList.toggle("dark-mode");

    // Change icon
    themeIcon.classList.toggle("fa-moon", !isDark);
    themeIcon.classList.toggle("fa-sun", isDark);

    // Save theme preference
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });



});
// ===== Toast Notification =====
function showToast2(message) {
  const container = document.getElementById("toastContainer");

  const toast = document.createElement("div");
  toast.classList.add("toast");

  toast.innerHTML = `
    <div class="toast-icon">✔</div>
    <div class="toast-content">
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close-btn">&times;</button>
  `;

  toast.querySelector(".toast-close-btn").addEventListener("click", () => {
    toast.classList.add("hiding");
    toast.addEventListener("animationend", () => toast.remove());
  });

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hiding");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}
