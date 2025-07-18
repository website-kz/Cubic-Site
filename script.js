let currentUser = null;
let currentPage = "page1";
let pages = {};

// REGISTRATION & LOGIN
function register() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if (localStorage.getItem("user_" + u)) {
    showMsg("Пользователь уже существует!");
  } else {
    localStorage.setItem("user_" + u, JSON.stringify({ password: p, sites: {} }));
    showMsg("Успешно зарегистрирован!");
  }
}

function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const userData = JSON.parse(localStorage.getItem("user_" + u));
  if (userData && userData.password === p) {
    currentUser = u;
    document.getElementById("auth").style.display = "none";
    document.getElementById("editor").style.display = "block";
    pages = {}; for (let i = 1; i <= 10; i++) pages["page" + i] = "";
    showMsg("Добро пожаловать, " + u);
  } else {
    showMsg("Неверные данные.");
  }
}

function showMsg(msg) {
  document.getElementById("auth-msg").innerText = msg;
}

// DRAG & DROP
function allowDrop(e) {
  e.preventDefault();
}

function drag(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}

function drop(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData("text");
  const dragged = document.getElementById(data);
  e.target.appendChild(dragged);
}

// ADD BLOCK
function addBlock() {
  const type = document.getElementById("block-type").value;
  const color = document.getElementById("block-color").value;
  const radius = document.getElementById("border-radius").value + "px";
  const weight = document.getElementById("font-weight").value;
  const neon = document.getElementById("neon-effect").checked;
  const imgFile = document.getElementById("image-upload").files[0];

  const block = document.createElement("div");
  block.className = "block";
  block.style.backgroundColor = color;
  block.style.borderRadius = radius;
  block.style.fontWeight = weight;
  block.draggable = true;
  block.id = "block_" + Math.random();
  block.ondragstart = drag;
  if (neon) block.classList.add("neon");

  if (type === "text") {
    block.textContent = "Текстовый блок";
  } else if (type === "button") {
    const btn = document.createElement("a");
    btn.href = "#";
    btn.textContent = "Перейти";
    btn.className = "btn";
    block.appendChild(btn);
  } else if (type === "image") {
    if (imgFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        block.appendChild(img);
      };
      reader.readAsDataURL(imgFile);
    } else {
      alert("Загрузите изображение.");
      return;
    }
  } else if (type === "code") {
    const pre = document.createElement("pre");
    pre.textContent = "// Код: int main() { return 0; }";
    block.appendChild(pre);
  }

  document.getElementById("canvas").appendChild(block);
}

// PAGE SWITCH
function changePage() {
  savePageContent(currentPage);
  currentPage = document.getElementById("page-select").value;
  document.getElementById("canvas").innerHTML = pages[currentPage] || "";
}

function savePageContent(page) {
  pages[page] = document.getElementById("canvas").innerHTML;
}

// SAVE / LOAD
function saveSite(num) {
  savePageContent(currentPage);
  const user = JSON.parse(localStorage.getItem("user_" + currentUser));
  user.sites["site" + num] = JSON.stringify(pages);
  localStorage.setItem("user_" + currentUser, JSON.stringify(user));
  alert("Сайт " + num + " сохранен.");
}

function loadSite(num) {
  const user = JSON.parse(localStorage.getItem("user_" + currentUser));
  const site = user.sites["site" + num];
  if (!site) return alert("Сайт не найден.");
  pages = JSON.parse(site);
  document.getElementById("canvas").innerHTML = pages[currentPage] || "";
}