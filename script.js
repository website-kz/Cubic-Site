const editor = document.getElementById('editor');

function makeBlockDraggable(el) {
  el.draggable = true;
  el.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', null);
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
  });
}

editor.addEventListener('dragover', e => {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  const afterElement = getDragAfterElement(editor, e.clientY);
  if (afterElement == null) {
    editor.appendChild(dragging);
  } else {
    editor.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.block:not(.dragging)')];
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

function makeResizable(el) {
  el.style.resize = 'both';
  el.style.overflow = 'auto';
}

function addTextBlock() {
  const div = document.createElement('div');
  div.className = 'block';
  div.contentEditable = true;
  div.innerText = 'Editable text';
  makeBlockDraggable(div);
  makeResizable(div);
  editor.appendChild(div);
}

function addImageBlock() {
  const div = document.createElement('div');
  div.className = 'block';
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '100%';
    div.appendChild(img);
    input.remove();
  };
  div.appendChild(input);
  makeBlockDraggable(div);
  makeResizable(div);
  editor.appendChild(div);
}

function addButtonBlock() {
  const div = document.createElement('div');
  div.className = 'block';
  const btn = document.createElement('button');
  btn.textContent = 'Click me';
  btn.onclick = () => {
    const url = prompt('Enter URL:');
    if (url) window.location.href = url;
  };
  div.appendChild(btn);
  makeBlockDraggable(div);
  makeResizable(div);
  editor.appendChild(div);
}

function addFunctionalBlock() {
  const div = document.createElement('div');
  div.className = 'block';
  const textarea = document.createElement('textarea');
  textarea.placeholder = '// Paste your .c or .cpp code here';
  div.appendChild(textarea);
  makeBlockDraggable(div);
  makeResizable(div);
  editor.appendChild(div);
}