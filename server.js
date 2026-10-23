const express = require('express');
const path = require('path');
const tutorials = require('./data/Tutorials.json');

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