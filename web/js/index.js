const { ipcRenderer } = require("electron");

// Dom Elements

const output = document.querySelector(".output");
// Global Variable
let kjvUrl = { url: "../web/bible/english-kjv.txt", lan: "KJV" };
let nkjvUrl = { url: "../web/bible/english-nkjv.txt", lan: "NKJV" };
let frenchUrl = { url: "../web/bible/french.txt", lan: "French" };
let russianUrl = { url: "../web/bible/russian.txt", lan: "Russian" };

let selectedUrl = JSON.parse(localStorage.getItem("bible")) || kjvUrl;
let timer = +localStorage.getItem("timer") * 1000 || 5 * 1000;

const storeBible = (bible) => {
  localStorage.setItem("bible", JSON.stringify(bible));
};

const generateRandomNumber = (n) => Math.floor(Math.random() * n);

const displayVerse = (verse, lan) => {
  output.innerHTML = `<p class="quote">
  ${verse[0]}
  <span class="verse">${verse[1]}${lan ? "(" + lan + ")" : ""}</span>
</p>`;
};
// Get Quote Function
const getQoutes = async (url, lan = "") => {
  timer = +localStorage.getItem("timer") * 1000 || 5 * 1000;
  try {
    const res = await fetch(url);
    const data = await res.text();
    const dataArray = data
      .split("\n")
      .filter(
        (data) =>
          data.charAt(0) != "#" &&
          data.charAt(0) != ";" &&
          data != "\r" &&
          data != ""
      );
    const verse = dataArray[generateRandomNumber(dataArray.length)].split("\t");
    displayVerse(verse, lan);
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

ipcRenderer.on("changeUrl", (_, url) => {
  switch (url) {
    case "french":
      selectedUrl = frenchUrl;
      storeBible(selectedUrl);
      getQoutes(selectedUrl.url, selectedUrl.lan);
      break;
    case "nkjv":
      selectedUrl = nkjvUrl;
      storeBible(selectedUrl);
      getQoutes(selectedUrl.url, selectedUrl.lan);
      break;
    case "kjv":
      selectedUrl = kjvUrl;
      storeBible(selectedUrl);
      getQoutes(selectedUrl.url, selectedUrl.lan);
      break;
    case "russian":
      selectedUrl = russianUrl;
      storeBible(selectedUrl);
      getQoutes(selectedUrl.url, selectedUrl.lan);
      break;
  }
});

const alwaysOnTop = localStorage.getItem("top") || "True";

ipcRenderer.send("top", alwaysOnTop);

ipcRenderer.on("topTrue", () => {
  localStorage.setItem("top", "True");
});

ipcRenderer.on("topFalse", () => {
  localStorage.setItem("top", "False");
});

ipcRenderer.on("copy", async () => {
  const quoteContainer = document.querySelector(".quote");
  navigator.clipboard.writeText(quoteContainer.textContent);
});

ipcRenderer.on("timer", async (_, time) => {
  timer = time;
  localStorage.setItem("timer", time);
  location.reload();
});

getQoutes(selectedUrl.url, selectedUrl.lan);

setInterval(() => {
  getQoutes(selectedUrl.url, selectedUrl.lan);
}, timer);
output.addEventListener("click", () =>
  getQoutes(selectedUrl.url, selectedUrl.lan)
);
