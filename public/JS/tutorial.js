const params = new URLSearchParams(location.search);
const slug = params.get('t') || 'html';
const requestedLessonId = params.get('l');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
const progressKey = `myschool-progress-${slug}`;
let tutorial;
let lesson;
let completedLessons = new Set();

try {
  completedLessons = new Set(JSON.parse(localStorage.getItem(progressKey) || '[]'));
} catch {
  completedLessons = new Set();
}

function lessonUrl(targetLesson) {
  const query = new URLSearchParams({ t: slug, l: targetLesson.id });
  return `/tutorial.html?${query.toString()}`;
}

function renderSidebar() {
  const completedCount = tutorial.lessons.filter(item => completedLessons.has(item.id)).length;
  const progress = tutorial.lessons.length ? Math.round(completedCount / tutorial.lessons.length * 100) : 0;
  const backLink = document.createElement('a');
  backLink.className = 'sidebar-back';
  backLink.href = '/#courses';
  backLink.textContent = '← All tutorials';
  const heading = document.createElement('h2');
  heading.textContent = tutorial.title;
  const progressLabel = document.createElement('div');
  progressLabel.className = 'sidebar-progress-label';
  progressLabel.innerHTML = `<span>YOUR PROGRESS</span><span>${completedCount} / ${tutorial.lessons.length}</span>`;
  const progressTrack = document.createElement('div');
  progressTrack.className = 'sidebar-progress-track';
  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '100');
  progressTrack.setAttribute('aria-valuenow', String(progress));
  const progressFill = document.createElement('div');
  progressFill.className = 'sidebar-progress-fill';
  progressFill.style.width = `${progress}%`;
  progressTrack.append(progressFill);
  const list = document.createElement('nav');
  list.className = 'lesson-list';
  list.setAttribute('aria-label', 'Lessons');

  tutorial.lessons.forEach(item => {
    const link = document.createElement('a');
    link.href = lessonUrl(item);
    link.className = `lesson-link${item.id === lesson.id ? ' active' : ''}${completedLessons.has(item.id) ? ' completed' : ''}`;
    if (item.id === lesson.id) link.setAttribute('aria-current', 'page');
    const check = document.createElement('span');
    check.className = 'lesson-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = completedLessons.has(item.id) ? '✓' : '○';
    const title = document.createElement('span');
    title.textContent = item.title;
    link.append(check, title);
    list.append(link);
  });

  sidebar.replaceChildren(backLink, heading, progressLabel, progressTrack, list);
}

function renderLesson() {
  const lessonIndex = tutorial.lessons.indexOf(lesson);
  const isComplete = completedLessons.has(lesson.id);
  const previousLesson = tutorial.lessons[lessonIndex - 1];
  const nextLesson = tutorial.lessons[lessonIndex + 1];
  content.innerHTML = `
    <div class="lesson-breadcrumb"><a href="/#courses">Tutorials</a> / ${tutorial.title}</div>
    <p class="lesson-kicker">${tutorial.title}</p>
    <h1>${lesson.title}</h1>
    <article class="lesson-copy">${lesson.content}</article>
    <div class="lesson-actions">
      <button class="button-primary" id="tryLesson" type="button">Try this example <span aria-hidden="true">↗</span></button>
      <button class="button-secondary" id="toggleComplete" type="button">${isComplete ? '✓ Completed' : 'Mark as complete'}</button>
    </div>
    <nav class="lesson-pager" aria-label="Lesson navigation">
      ${previousLesson ? `<a href="${lessonUrl(previousLesson)}"><span>← PREVIOUS</span>${previousLesson.title}</a>` : '<span></span>'}
      ${nextLesson ? `<a href="${lessonUrl(nextLesson)}"><span>NEXT LESSON →</span>${nextLesson.title}</a>` : '<a href="/#courses"><span>COURSE COMPLETE</span>Choose another tutorial →</a>'}
    </nav>
  `;

  document.getElementById('tryLesson').addEventListener('click', () => {
    localStorage.setItem('editorCode', lesson.example || '<h1>Hello, web!</h1>');
    window.location.href = '/editor.html';
  });
  document.getElementById('toggleComplete').addEventListener('click', () => {
    if (completedLessons.has(lesson.id)) completedLessons.delete(lesson.id);
    else completedLessons.add(lesson.id);
    localStorage.setItem(progressKey, JSON.stringify([...completedLessons]));
    renderSidebar();
    renderLesson();
  });
}

fetch(`/api/tutorials/${encodeURIComponent(slug)}`)
  .then(response => {
    if (!response.ok) throw new Error('Tutorial not found.');
    return response.json();
  })
  .then(data => {
    tutorial = data;
    if (!Array.isArray(tutorial.lessons) || tutorial.lessons.length === 0) {
      throw new Error('This tutorial does not have any lessons yet.');
    }
    lesson = tutorial.lessons.find(item => item.id === requestedLessonId) || tutorial.lessons[0];
    document.title = `${lesson.title} | MySchool`;
    renderSidebar();
    renderLesson();
  })
  .catch(error => {
    sidebar.innerHTML = '<a class="sidebar-back" href="/#courses">← All tutorials</a>';
    content.innerHTML = `<p class="page-state">${error.message} <a href="/#courses">Browse tutorials</a></p>`;
  });