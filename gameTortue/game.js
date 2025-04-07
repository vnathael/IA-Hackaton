window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
  
    const turtleImg = document.getElementById('turtleImg');
    const deadTurtleImg = document.getElementById('turtle_dead');
    const plasticImgs = [
      document.getElementById('plastic1'),
      document.getElementById('plastic2'),
      document.getElementById('plastic3'),
    ];
  
    let turtle = { x: 400, y: 300, size: 80, speed: 5, isSlowed: false, slowTime: 0, isDead: false, lastHitTime: 0 };
    let keys = {};
    let plastics = [];
    let darkness = 0;
    let redness = 0;  
    let lastSpawn = 0;
    let deadTurtles = [];
    let plasticSpawnRate = 1000;
    let isGamePaused = false;

    // Compteur de tortues tuées et score
    let killedTurtles = 0;
    let score = 0;
    let lastScoreIncrease = 0;

    // Liste des textes informatifs sur le plastique
    let infoTexts = [
        "Solution : Réduire l’utilisation des plastiques à usage unique.",
        "Solution : Participer à des nettoyages de plages locaux.",
        "Solution : Utiliser des alternatives réutilisables comme des sacs en tissu.",
        "Solution : Recycler correctement chaque déchet plastique.",
        "Solution : Sensibiliser les autres à l’impact du plastique sur l’environnement.",
        "Causes : Les sacs plastiques se retrouvent souvent dans l’océan.",
        "Causes : Les filets de pêche abandonnés sont un piège pour les tortues.",
        "Causes : Des millions de bouteilles plastiques sont jetées chaque année.",
        "Causes : Le plastique non biodégradable met des centaines d’années à se décomposer.",   
        "Causes : Les plastiques se retrouvent dans l’océan à cause de la mauvaise gestion des déchets.",   
        "Effet : Les tortues peuvent ingérer du plastique, ce qui les tue.",                  
        "Effet : Les tortues marines sont en danger d'extinction à cause du plastique.",
        "Effet : Le plastique perturbe les écosystèmes marins et la chaîne alimentaire",     
        "Effet : Les plages sont polluées, rendant l’habitat des tortues insalubre.",     
        "Effet : La pollution plastique aggrave le réchauffement climatique, menaçant les tortues.",      
      ];
  
    // Affichage de la fiche pop-up
    function showPopup() {
        // Mettre le jeu en pause
        isGamePaused = true;
    
        const randomText = infoTexts[Math.floor(Math.random() * infoTexts.length)];
    
        const popup = document.createElement('div');
        popup.id = 'popup';
        popup.innerHTML = `
            <div class="popup-content">
                <p>${randomText}</p>
                <button id="resumeButton">Revenir au jeu</button>
            </div>
        `;
    
        document.body.appendChild(popup);
    
        // Gèle le jeu en désactivant les mouvements
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
    
        // Action du bouton pour reprendre le jeu
        document.getElementById('resumeButton').addEventListener('click', resumeGame);
    }
    
    
// Gère la pression d'une touche
function handleKeyDown(e) {
    keys[e.key] = true;
}

// Gère la relâche d'une touche
function handleKeyUp(e) {
    keys[e.key] = false;
}


    // Reprendre le jeu après le pop-up
    function resumeGame() {
        console.log('Reprendre le jeu');
    
        // Réactiver les écouteurs d'événements
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    
        // Fermer le popup
        const popup = document.getElementById('popup');
        if (popup) {
            popup.remove();
        }
    
        // Reprendre le jeu
        isGamePaused = false;
    
        // Réinitialiser les touches
        keys = {};

        plastics = [];
    }
    
  
    // Fonction pour dessiner la tortue
    function drawTurtle() {
      if (!turtle.isDead) {
        ctx.drawImage(turtleImg, turtle.x - turtle.size / 2, turtle.y - turtle.size / 2, turtle.size, turtle.size);
      }
    }
  
    // Fonction pour dessiner les tortues mortes dans le fond
    function drawDeadTurtles() {
      deadTurtles.forEach((t, index) => {
        ctx.drawImage(deadTurtleImg, t.x - t.size / 2, t.y - t.size / 2, t.size, t.size);
      });
    }
  
    // Fonction pour dessiner un plastique
    function drawPlastic(p) {
      ctx.drawImage(p.img, p.x, p.y, p.size, p.size);
    }
  
    // Met à jour la position de la tortue selon les touches pressées
    function updateTurtle() {
        if (isGamePaused) {
            return; // Si le jeu est en pause, on ne met pas à jour la tortue
        }
    
        if (keys['ArrowUp']) turtle.y -= turtle.speed;
        if (keys['ArrowDown']) turtle.y += turtle.speed;
        if (keys['ArrowLeft']) turtle.x -= turtle.speed;
        if (keys['ArrowRight']) turtle.x += turtle.speed;
    
        // Garder la tortue dans les limites du canvas
        turtle.x = Math.max(turtle.size / 2, Math.min(canvas.width - turtle.size / 2, turtle.x));
        turtle.y = Math.max(turtle.size / 2, Math.min(canvas.height - turtle.size / 2, turtle.y));
    }
  
    // Spawning des plastiques
    function spawnPlastic() {
      const side = Math.floor(Math.random() * 4);
      const size = 30 + Math.random() * 40;
      const speed = 2 + Math.random() * 3;
      const img = plasticImgs[Math.floor(Math.random() * plasticImgs.length)];
  
      let x, y, vx, vy;
      if (side === 0) { x = 0; y = Math.random() * canvas.height; vx = speed; vy = 0; }
      else if (side === 1) { x = canvas.width; y = Math.random() * canvas.height; vx = -speed; vy = 0; }
      else if (side === 2) { x = Math.random() * canvas.width; y = 0; vx = 0; vy = speed; }
      else { x = Math.random() * canvas.width; y = canvas.height; vx = 0; vy = -speed; }
  
      plastics.push({ x, y, vx, vy, size, img });
    }
  
    // Met à jour les plastiques
    function updatePlastics() {
      for (let p of plastics) {
        p.x += p.vx;
        p.y += p.vy;
      }
      plastics = plastics.filter(p => p.x >= -100 && p.x <= canvas.width + 100 && p.y >= -100 && p.y <= canvas.height + 100);
    }
  
    // Vérification des collisions avec les plastiques
    function checkCollisions() {
      if (isGamePaused) {
        return;
      }
    
      if (turtle.isDead || (Date.now() - turtle.lastHitTime < 500)) {
        return;
      }

      for (let p of plastics) {
        const dx = turtle.x - (p.x + p.size / 2);
        const dy = turtle.y - (p.y + p.size / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
  
        if (dist < turtle.size / 2 + p.size / 2) {
          if (p.img === plasticImgs[0]) {
            if (!turtle.isSlowed) {
              turtle.isSlowed = true;
              turtle.speed *= 0.3;
  
              setTimeout(() => {
                turtle.speed /= 0.3;
                turtle.isSlowed = false;
              }, 10000);
            }
          } else if (!turtle.isDead) {
            // Si la tortue n'est pas encore morte, on la tue
            turtle.isDead = true;
            deadTurtles.push({ x: turtle.x, y: turtle.y, size: turtle.size });
  
            // Compte une tortue tuée
            killedTurtles++;
  
            // Vérifie si on a atteint 3 morts et afficher le pop-up
            if (killedTurtles % 3 === 0) {
              showPopup();
            }

            // Réinitialisation immédiate de la tortue
            turtle = { x: 400, y: 300, size: 80, speed: 5, isSlowed: false, slowTime: 0, isDead: false, lastHitTime: Date.now() };
          }
        }
      }
    }
  
    // Appliquer l'effet d'obscurité et de rouge
    function applyBloodEffect() {
      ctx.fillStyle = `rgba(255, 0, 0, ${redness})`; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  
    // Affiche les informations du jeu (score et tortues tuées)
    function drawUI() {
      ctx.fillStyle = 'white';
      ctx.font = '18px Arial';
      ctx.fillText(`Tortues tuées: ${killedTurtles}`, canvas.width - 180, 20);
    }
  
    // Fonction de réinitialisation du jeu
    function resetGame() {
        turtle = { x: 400, y: 300, size: 80, speed: 5, isSlowed: false, slowTime: 0, isDead: false, lastHitTime: 0 };
        plastics = [];
        deadTurtles = [];
        score = 0;
        redness = 0; 
        lastScoreIncrease = 0;
        lastSpawn = 0;
        plasticSpawnRate = 1000;
        killedTurtles = 0;
    }

    // Fonction pour quitter le jeu
    function quitGame() {
      window.location.href = "/index.html";
    }

    // Boucle principale du jeu
    function gameLoop(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Si le jeu est en pause, ne pas faire d'updates
        if (isGamePaused) {
            requestAnimationFrame(gameLoop);
            return;
        }
    
        applyBloodEffect();
    
        updateTurtle(); // Met à jour la position de la tortue si le jeu n'est pas en pause
        updatePlastics();
        checkCollisions();
    
        plastics.forEach(drawPlastic);
        drawDeadTurtles();
        drawTurtle();
    
        drawUI();
    
        if (timestamp - lastSpawn > plasticSpawnRate) {
            spawnPlastic();
            lastSpawn = timestamp;
    
            if (plasticSpawnRate > 200) {
                plasticSpawnRate -= 50;
            }
        }
    
        if (timestamp - lastScoreIncrease >= 10000) {
            score += 10;
            lastScoreIncrease = timestamp;
        }
    
        requestAnimationFrame(gameLoop);
    }
    
    
  
    // Event listeners pour les boutons
    document.getElementById("quitButton").addEventListener("click", quitGame);
    document.getElementById("resetButton").addEventListener("click", resetGame);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  
    if (turtleImg.complete && plasticImgs.every(img => img.complete)) {
      console.log('Les images sont prêtes, démarrer le jeu...');
      requestAnimationFrame(gameLoop);
    } else {
      console.error('Les images ne sont pas encore chargées.');
    }
};
