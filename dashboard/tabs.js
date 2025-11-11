// Highlight active tab dynamically
const tabs = document.querySelectorAll('.tab');
const currentPage = window.location.pathname.split('/').pop();

tabs.forEach(tab => {
  // Highlight based on current page
  if (tab.getAttribute('href') === currentPage) {
    tab.classList.add('active');
  }

  // Change color on click
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});
