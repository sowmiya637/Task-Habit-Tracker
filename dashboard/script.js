// ===== Tab Switching =====
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ===== Add Task =====
document.getElementById("addTask").addEventListener("click", () => {
  const input = document.getElementById("taskInput");
  if (input.value.trim()) {
    const li = document.createElement("li");
    li.innerHTML = `${input.value} <span>&times;</span>`;
    li.querySelector("span").onclick = () => li.remove();
    document.getElementById("taskList").appendChild(li);
    input.value = "";
  }
});

// ===== Add Habit =====
document.getElementById("addHabit").addEventListener("click", () => {
  const input = document.getElementById("habitInput");
  if (input.value.trim()) {
    const li = document.createElement("li");
    li.innerHTML = `${input.value} <span>&times;</span>`;
    li.querySelector("span").onclick = () => li.remove();
    document.getElementById("habitList").appendChild(li);
    input.value = "";
  }
});

// ===== Add Rule =====
document.getElementById("addRule").addEventListener("click", () => {
  const input = document.getElementById("ruleInput");
  if (input.value.trim()) {
    const li = document.createElement("li");
    li.innerHTML = `${input.value} <span>&times;</span>`;
    li.querySelector("span").onclick = () => li.remove();
    document.getElementById("ruleList").appendChild(li);
    input.value = "";
  }
});

// ===== Line Chart =====
const lineCtx = document.getElementById("lineChart").getContext("2d");

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// const completedData = [4, 3, 4, 3, 4, 4, 4];
const habits = JSON.parse(localStorage.getItem("habits")) || [];
const completedData = [0, 0, 0, 0, 0, 0, 0]; // placeholder

if (window.updateWeeklyChart) {
  setTimeout(() => updateWeeklyChart(habits), 0);
}
const totalHabits = 4;

// const lineChart = new Chart(lineCtx, {
window.lineChart = new Chart(lineCtx, {
  type: "line",
  data: {
    labels: days,
    datasets: [{
      label: "Completed",
      data: completedData,
      borderColor: "#2F80ED",
      backgroundColor: "#2F80ED",
      borderWidth: 2,
      tension: 0,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: "#2F80ED",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#111827",
        bodyColor: "#0b3b76",
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
        displayColors: false,
        padding: 10,
        callbacks: {
          title: (items) => items[0].label,
          label: (ctx) => `Completed : ${ctx.parsed.y}`,
          footer: () => `Total habits : ${totalHabits}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: { color: "#111827" }
      },
      y: {
        beginAtZero: true,
        max: 6,
        grid: {
          color: "rgba(0,0,0,0.04)",
          borderDash: [5, 5]
        },
        ticks: { stepSize: 1, color: "#111827" }
      }
    }
  }
});

// ====== Update Line Chart from Habits ======
window.updateWeeklyChart = function () {
  if (!window.lineChart) return;

  const habits = JSON.parse(localStorage.getItem("habits")) || [];

  // Fixed order of weekdays
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  habits.forEach(habit => {
    if (habit.completedDates) {
      Object.keys(habit.completedDates).forEach(dateStr => {
        const dayName = new Date(dateStr).toDateString().slice(0, 3);
        const idx = weekDays.indexOf(dayName);
        if (idx !== -1) counts[idx]++;
      });
    }
  });

  // Update chart
  window.lineChart.data.labels = weekDays;
  window.lineChart.data.datasets[0].data = counts;
  window.lineChart.update();

  console.log("✅ Line chart updated (Mon–Sun):", counts);
};

// ====== DARK/LIGHT MODE ======
const toggleBtn = document.getElementById("themeToggle");
const body = document.body;
let darkMode = false;
const allCharts = [lineChart];

function updateChartColors() {
  const textColor = darkMode ? "#f1f5f9" : "#111827";
  const gridColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
  const lineColor = darkMode ? "#60A5FA" : "#2F80ED";

  allCharts.forEach(chart => {
    if (chart.options.scales) {
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.options.scales.y.grid.color = gridColor;
    }
    chart.options.plugins.tooltip.titleColor = textColor;
    chart.options.plugins.tooltip.bodyColor = textColor;

    if (chart.config.type === "line") {
      chart.data.datasets[0].borderColor = lineColor;
      chart.data.datasets[0].pointBackgroundColor = lineColor;
    }
    chart.update();
  });
}

toggleBtn.addEventListener("click", () => {
  darkMode = !darkMode;
  body.classList.toggle("dark", darkMode);
  toggleBtn.innerHTML = darkMode
    ? `<i class="fa-solid fa-sun"></i>`
    : `<i class="fa-solid fa-moon"></i>`;
  updateChartColors();
});

//  THEME TOGGLE 
const themeToggle = document.querySelector(".theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

//  Dynamic Donut Chart Function
let dynamicDonutChart;

function updateDashboard() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const today = new Date();

  //  Count status (case-insensitive, flexible)
  const normalize = (s) => s?.toLowerCase().replace(/\s+/g, "");

  const todo = tasks.filter(t => normalize(t.status) === "todo").length;
  const inProgress = tasks.filter(t => normalize(t.status) === "inprogress").length;
  const completed = tasks.filter(t =>
    ["done", "completed"].includes(normalize(t.status))
  ).length;

  let overdue = 0;
  tasks.forEach(task => {
    const dueDate = task.date ? new Date(task.date) : null;
    if (dueDate && dueDate < today && !["done", "completed"].includes(normalize(task.status))) {
      overdue++;
    }
  });

 
  const completedEl = document.getElementById("completedCount");
  const overdueEl = document.getElementById("overdueCount");
  if (completedEl) completedEl.textContent = completed;
  if (overdueEl) overdueEl.textContent = overdue;

  // ----- Draw donut chart -----
  const ctx = document.getElementById("donutChart");
  if (!ctx) return;
  if (dynamicDonutChart) dynamicDonutChart.destroy();

  dynamicDonutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Todo", "In Progress", "Overdue", "Completed"],
      datasets: [{
        data: [todo, inProgress, overdue, completed],
        backgroundColor: ["#bfbfbf", "#007bff", "#ffb400", "#00c896"],
        hoverOffset: 10
      }]
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} Tasks`
          }
        }
      }
    }
  });

  // ----- Update legend -----
  const legendContainer = document.getElementById("chartLegend");
  if (legendContainer) {
    legendContainer.innerHTML = `
      <li><span class="legend-dot" style="background:#bfbfbf"></span> Todo - ${todo}</li>
      <li><span class="legend-dot" style="background:#007bff"></span> In Progress - ${inProgress}</li>
      <li><span class="legend-dot" style="background:#ffb400"></span> Overdue - ${overdue}</li>
      <li><span class="legend-dot" style="background:#00c896"></span> Completed - ${completed}</li>
    `;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  if (window.updateWeeklyChart) updateWeeklyChart(habits);
});

//  Make updateDashboard globally accessible
window.updateDashboard = updateDashboard;

//  Auto-run on load
document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  updateStreakCard(); 
 updateActiveHabitsCard(); 
});


// Auto-update if changes happen in another tab
window.addEventListener("storage", (e) => {
  if (e.key === "tasks") updateDashboard();
});

//  Fetch max streak from localStorage or habits data
function updateStreakCard() {
  // First check if it's already saved by habits.js
  const savedMax = localStorage.getItem("maxStreak");

  if (savedMax !== null) {
    const streakEl = document.getElementById("maxStreak");
    if (streakEl) streakEl.textContent = savedMax;
    return;
  }

  // Otherwise, compute manually
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  let maxStreak = 0;

  habits.forEach(habit => {
    // Use streak property if available (habits.js maintains it)
    if (habit.streak && habit.streak > maxStreak) {
      maxStreak = habit.streak;
    }
  });

  // Update card and save to localStorage
  const streakEl = document.getElementById("maxStreak");
  if (streakEl) streakEl.textContent = maxStreak;

  localStorage.setItem("maxStreak", maxStreak);
}


function updateActiveHabitsCard() {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];

  // Count all habits that are not marked deleted or archived
  const activeHabits = habits.filter(habit => !habit.deleted && !habit.archived).length;

  // Find the <h3> element with text "Active habits"
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const title = card.querySelector('h3');
    if (title && title.textContent.trim().toLowerCase() === 'active habits') {
      const numberEl = card.querySelector('.number');
      if (numberEl) numberEl.textContent = activeHabits;
    }
  });

  console.log(" Active Habits Updated:", activeHabits);
}
