const codeArea = document.getElementById('code');
const preview = document.getElementById('preview');
const resetButton = document.getElementById('resetBtn');
const defaultCode = codeArea.value;

const lessonExample = localStorage.getItem('editorCode');
const startingCode = lessonExample || defaultCode;
codeArea.value = startingCode;
localStorage.removeItem('editorCode');

function run() {
  preview.srcdoc = codeArea.value;
}

document.getElementById('runBtn').addEventListener('click', run);
resetButton.addEventListener('click', () => {
  codeArea.value = startingCode;
  run();
});

run();

codeArea.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') run();
});