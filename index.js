document.getElementById("tortue").addEventListener("click", () => {
  window.location.href = "/IA-Hackaton/gameTortue/game.html";
});

document.getElementById("poisson").addEventListener("click", () => {
  window.location.href = "/gamePoisson/game.html";
});

document.getElementById("calmar").addEventListener("click", () => {
  window.location.href = "/gameCalmar/game.html";
});

// === Gestion de la popup RÈGLES ===
const reglesBtn = document.getElementById("reglesBtn");
const modal = document.getElementById("reglesModal");
const closeBtn = document.querySelector(".close");

reglesBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
