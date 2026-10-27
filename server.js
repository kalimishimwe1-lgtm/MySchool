const express = require('express');
const path = require('path');
const tutorials = require('./data/Tutorials.json');
const lessonExpansions = require('./data/LessonExpansions.json');

for (const [slug, lessons] of Object.entries(lessonExpansions)) {
  const tutorial = tutorials[slug];
  if (!tutorial) throw new Error(`Lesson expansion references unknown tutorial: ${slug}`);

  const lessonIds = new Set(tutorial.lessons.map(lesson => lesson.id));
  for (const lesson of lessons) {
    if (lessonIds.has(lesson.id)) {
      throw new Error(`Duplicate lesson id "${lesson.id}" in tutorial "${slug}"`);
    }
    lessonIds.add(lesson.id);
  }
  tutorial.lessons.push(...lessons);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Get all tutorials
app.get('/api/tutorials', (req, res) => {
  const list = Object.entries(tutorials).map(([key, val]) => ({
    slug: key,
    title: val.title,
    description: val.description,
    lessonCount: val.lessons.length
  }));
  res.json(list);
});

// Get one tutorial
app.get('/api/tutorials/:slug', (req, res) => {
  const t = tutorials[req.params.slug];
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json({ slug: req.params.slug, ...t });
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});