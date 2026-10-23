const container = document.getElementById('tutorials');
const challengeContainer = document.getElementById('challengeTracks');
const searchInput = document.getElementById('courseSearch');
const searchForm = document.getElementById('courseSearchForm');
const courseCount = document.getElementById('courseCount');
const emptyCourses = document.getElementById('emptyCourses');
let courses = [];
const challengeSlugs = new Set(['project-challenges', 'quiz']);

const courseIcons = {
  html: ['5', 'course-icon-html'],
  css: ['#', 'course-icon-css'],
  javascript: ['JS', 'course-icon-javascript'],
  'project-challenges': ['★', 'course-icon-challenge'],
  quiz: ['?', 'course-icon-quiz']
};

function getCourseLabel(course) {
  if (course.slug === 'project-challenges') return 'Practice track';
  if (course.slug === 'quiz') return 'Quick quiz';
  return 'Beginner friendly';
}

function createCourseCard(course, index) {
  const card = document.createElement('a');
  const [iconLabel, iconClass] = courseIcons[course.slug] || ['</>', 'course-icon-default'];
  const lessonCount = course.lessonCount || 0;
  const link = `/tutorial.html?t=${encodeURIComponent(course.slug)}`;
  card.className = 'course-card';
  card.href = link;
  card.style.animationDelay = `${index * 70}ms`;

  const top = document.createElement('div');
  top.className = 'course-card-top';
  const icon = document.createElement('span');
  icon.className = `course-icon ${iconClass}`;
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = iconLabel;
  const level = document.createElement('span');
  level.className = 'course-level';
  level.textContent = getCourseLabel(course);
  top.append(icon, level);

  const title = document.createElement('h3');
  title.textContent = course.title;
  const description = document.createElement('p');
  description.textContent = course.description;
  const footer = document.createElement('div');
  footer.className = 'course-card-footer';
  const lessons = document.createElement('span');
  lessons.textContent = `${lessonCount} ${lessonCount === 1 ? 'lesson' : 'lessons'}`;
  const start = document.createElement('span');
  start.className = 'course-start';
  start.textContent = challengeSlugs.has(course.slug) ? 'Open track  →' : 'Start learning  →';
  footer.append(lessons, start);
  card.append(top, title, description, footer);
  return card;
}

function renderChallengeTracks() {
  if (!challengeContainer) return;
  const challengeCourses = courses.filter(course => challengeSlugs.has(course.slug));
  challengeContainer.replaceChildren(...challengeCourses.map(createCourseCard));
}

function renderCourses(query = '') {
  const normalizedQuery = query.trim().toLowerCase();
  const matchingCourses = courses.filter(course => !challengeSlugs.has(course.slug) &&
    `${course.title} ${course.description} ${course.slug}`.toLowerCase().includes(normalizedQuery)
  );

  container.replaceChildren(...matchingCourses.map(createCourseCard));
  courseCount.textContent = `${matchingCourses.length} ${matchingCourses.length === 1 ? 'course' : 'courses'}`;
  emptyCourses.hidden = matchingCourses.length > 0;
  return matchingCourses;
}

searchInput.addEventListener('input', () => renderCourses(searchInput.value));
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const matchingCourses = renderCourses(searchInput.value);
  if (matchingCourses[0]) {
    window.location.href = `/tutorial.html?t=${encodeURIComponent(matchingCourses[0].slug)}`;
  } else {
    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
  }
});

fetch('/api/tutorials')
  .then(response => {
    if (!response.ok) throw new Error('Could not load tutorials.');
    return response.json();
  })
  .then(list => {
    courses = list;
    renderCourses(searchInput.value);
    renderChallengeTracks();
  })
  .catch(() => {
    container.innerHTML = '<p class="loading-state">Tutorials could not be loaded. Check that the server is running and refresh.</p>';
    if (challengeContainer) challengeContainer.innerHTML = '<p class="loading-state">Challenge tracks could not be loaded.</p>';
    courseCount.textContent = 'Unavailable';
  });