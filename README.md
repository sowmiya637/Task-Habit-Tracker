
#  Ultimate Front-End PoC Challenge: Task & Habit Tracker + Analytics

##  Overview
The **Task & Habit Tracker + Analytics** is a fully interactive web application built purely with **Vanilla JavaScript, HTML, and CSS**.  
It combines **task management**, **habit tracking**, **smart analytics**, and a **rule-based engine** to create a dynamic productivity experience — no frameworks or libraries required.

---

##  Goals
To design and implement a **frontend-only** project that demonstrates:
- Advanced JavaScript logic (state management, rule engine, localStorage)
- Intuitive and responsive UI/UX
- Real-time interactivity and analytics updates

---

##  Core Features

###  1. Task & Habit Management
#### Tasks
- Fields: **Title**, **Description**, **Due Date**, **Priority**
- Status options: `Active`, `In-Progress`, `Stalled`, `Completed`
- Add, edit, delete, and reorder tasks dynamically.

#### Habits
- Fields: **Name**, **Frequency** (`Daily`, `Weekly`, `Custom`)
- Built-in **habit streak tracker** with a progress bar or calendar visualization.
- Optional **custom tracking rules** (e.g., "Track only on weekdays").

---

###  2. Smart Sorting & Filtering
- Filter and sort **tasks** and **habits** by:
  - Status
  - Priority
  - Due Date
  - Streaks
- Supports **multi-level filters** (e.g., "High priority habits due today").
- Real-time filtering with smooth transitions.

---

###  3. Interactive Dashboard
Displays **live analytics** that update automatically:
-  Tasks completed today
-  Tasks overdue
-  Longest habit streak
-  Weekly progress chart (CSS/JS-driven)

The dashboard dynamically reacts as users **add/update/delete** tasks or habits.

---

### 🖱️ 4. Drag & Drop + Subtasks
- **Reorder tasks and habits** intuitively using drag-and-drop.
- **Subtasks** supported with independent reordering.
- Bonus: Collapsible subtask sections for clean UI organization.

---

### ✨ 5. Animations & Visual Feedback
- Smooth **fade, slide, and highlight animations** for:
  - Adding/removing items
  - Completing tasks
  - Dragging and dropping
- Interactive **hover effects** and **tooltips** for clarity.

---

### ⚡ 6. Custom Rule Engine (Logic Layer)
A mini **rule engine** allows users to define dynamic behavior:
```text
Example 1: If task priority = "High" and due date ≤ today → highlight red
Example 2: If habit streak ≥ 7 → show "🔥 Streak Master" badge
````

This layer demonstrates **logical evaluation, condition parsing, and UI reactivity** using pure JavaScript.

---

###  7. Persistence & Undo

* All data (tasks, habits, dashboard state) saved in **localStorage**.
* **Automatic load on page refresh.**
* Bonus: Implemented **Undo/Redo Stack (5 actions)** to revert recent changes.

---

###  8. Theme & Responsiveness

* **Light/Dark Mode** toggle with smooth transitions.
* Fully **responsive layout**:

  * Desktop → detailed dashboard view
  * Mobile → adaptive, collapsible sections
* Bonus: **Adaptive analytics cards** on smaller screens.

---

##  Tech Stack

| Category      | Technology                                       |
| ------------- | ------------------------------------------------ |
| Front-End     | HTML5, CSS3, JavaScript (Vanilla JS)             |
| Data Storage  | LocalStorage                                     |
| Visualization | CSS charts / Canvas / JS calculations            |
| UI/UX         | Responsive Design, Animations, Custom Components |

---



##  Key Concepts Demonstrated

* DOM manipulation and event delegation
* Local state management using plain JavaScript
* Data-driven UI rendering
* Real-time analytics updates
* Rule-based evaluation engine
* Custom animation handling with CSS transitions
* Responsive, mobile-first design principles



