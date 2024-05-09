const { ipcRenderer } = require("electron");

const closeBtn = document.querySelector(".close-btn");
closeBtn.addEventListener("click", (e) => {
  ipcRenderer.send("close-about");
});

const linkUrl = document.querySelector(".site-link");
linkUrl.addEventListener("click", (e) => {
  e.preventDefault();
  ipcRenderer.send("open-url");
});

const copyRight = document.querySelector(".copyright");
copyRight.innerHTML = `${
  new Date().getFullYear() - 1
} - ${new Date().getFullYear()}`;
