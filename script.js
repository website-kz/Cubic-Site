let currentUser = null;
let currentPage = 1;
let currentBlock = null;
let dragging = false;

// ========== AUTH ==========

function register() {
  const u = username.value.trim();
  const p = password.value.trim();
  if (localStorage.getItem("user_" + u)) {
    authError.textContent = "User already exists";
  } else {
    localStorage.setItem("user_" + u, JSON.stringify({ password: p, sites: {} }));
    login();
  }
}

function login() {
  const u = username.value.trim();
  const p = password.value.trim();
  const data = JSON.parse(localStorage.getItem("user_" + u));
  if (data && data.password === p) {
    currentUser = u;
    authContainer.style.display = "none";
    editorContainer.style.display = "block";
    userDisplay.textContent = `👤 ${u}`;
    initPages();
  } else {
    authError.textContent = "Wrong credentials";
  }
}

// ========== PAGES ==========

function initPages() {
  for (let i = 1; i <= 10; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "Page " + i;
    pageSelect.appendChild(opt);
  }
  switchPage();
}

function switchPage() {
  currentPage = pageSelect.value;
  editor.innerHTML = "";
  loadProject();
}

// ========== BLOCKS ==========

function createBlock(type, content = "") {
  const div = document.createElement("div");
  div.className = "block";
  div.style.left = "100px";
  div.style.top = "100px";

  if (type === "text") {
    div.contentEditable = true;
    div.textContent = content || "Edit me!";
  } else if (type === "image") {
    const img = document.createElement("img");
    img.src = content;
    div.appendChild(img);
  }

  div.addEventListener("mousedown", startDrag);
  div.addEventListener("click", () => selectBlock(div));
  editor.appendChild(div);
}

function addTextBlock() {
  createBlock("text");
}

function addImageBlock() {
  uploadImage.click();
}

uploadImage.onchange = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image")) {
    const reader = new FileReader();
    reader.onload = () => {
      createBlock("image", reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// ========== STYLES & INTERACTION ==========

function selectBlock(block) {
  if (currentBlock) currentBlock.classList.remove("selected");
  currentBlock = block;
  block.classList.add("selected");
  stylePanel.style.display = "block";

  styleColor.value = rgbToHex(block.style.color || "#000000");
  styleWeight.value = block.style.fontWeight || 400;
  styleRadius.value = block.style.borderRadius.replace("px", "") || 0;
  styleNeon.checked = block.style.textShadow.includes("neon");
}

function deleteSelected() {
  if (currentBlock) {
    currentBlock.remove();
    currentBlock = null;
    stylePanel.style.display = "none";
  }
}

styleColor.oninput = () => {
  if (currentBlock) currentBlock.style.color = styleColor.value;
};

styleWeight.oninput = () => {
  if (currentBlock) currentBlock.style.fontWeight = styleWeight.value;
};

styleRadius.oninput = () => {
  if (currentBlock) currentBlock.style.borderRadius = styleRadius.value + "px";
};

styleNeon.onchange = () => {
  if (currentBlock) {
    currentBlock.style.textShadow = styleNeon.checked
      ? "0 0 5px #0ff, 0 0 10px #0ff"
      : "none";
  }
};

// ========== DRAG & DROP ==========

function startDrag(e) {
  dragging = e.target;
  const shiftX = e.clientX - dragging.getBoundingClientRect().left;
  const shiftY = e.clientY - dragging.getBoundingClientRect().top;

  function moveAt(ev) {
    dragging.style.left = ev.pageX - shiftX + "px";
    dragging.style.top = ev.pageY - shiftY + "px";
  }

  function stopDrag() {
    document.removeEventListener("mousemove", moveAt);
    document.removeEventListener("mouseup", stopDrag);
    dragging = null;
  }

  document.addEventListener("mousemove", moveAt);
  document.addEventListener("mouseup", stopDrag);
}

// ========== SAVE / LOAD ==========

function saveProject() {
  const blocks = [...editor.children].map((el) => ({
    html: el.outerHTML
  }));

  const slot = projectSlot.value;
  const data = JSON.parse(localStorage.getItem("user_" + currentUser));
  if (!data.sites[currentPage]) data.sites[currentPage] = {};
  data.sites[currentPage][slot] = blocks;
  localStorage.setItem("user_" + currentUser, JSON.stringify(data));
  alert("Saved to slot " + slot);
}

function loadProject() {
  editor.innerHTML = "";
  const slot = projectSlot.value;
  const data = JSON.parse(localStorage.getItem("user_" + currentUser));
  const blocks = data?.sites?.[currentPage]?.[slot] || [];
  blocks.forEach((b) => {
    const temp = document.createElement("div");
    temp.innerHTML = b.html;
    const node = temp.firstChild;
    node.addEventListener("mousedown", startDrag);
    node.addEventListener("click", () => selectBlock(node));
    editor.appendChild(node);
  });
}

// ========== UTILS ==========

function rgbToHex(rgb) {
  if (!rgb) return "#000000";
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  if (!result) return rgb;
  return (
    "#" +
    result
      .slice(1)
      .map((n) => parseInt(n).toString(16).padStart(2, "0"))
      .join("")
  );
}