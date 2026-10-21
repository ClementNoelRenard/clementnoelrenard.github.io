/* ==========================================================================
   SNAKE — mini-jeu de l'atelier
   --------------------------------------------------------------------------
   Seul script du site : un jeu ne peut pas fonctionner sans JavaScript.
   Il est autonome (aucune autre dépendance) et n'est chargé que par snake.html.

   Commandes : flèches, ZQSD ou WASD ; Espace ou P = démarrer / pause ;
   écran tactile : glisser sur le plateau ou croix directionnelle.
   Les 10 meilleurs scores sont gardés dans le navigateur (localStorage).

   SOMMAIRE
   1. Réglages
   2. État de la partie
   3. Règles du jeu
   4. Dessin
   5. Scores enregistrés
   6. Commandes
   7. Initialisation
   ========================================================================== */


/* ==========================================================================
   1. RÉGLAGES
   ========================================================================== */
const JEU = {
    cases: 20,              // plateau de 20 × 20 cases
    vitesseInitiale: 130,   // millisecondes entre deux déplacements
    vitesseMinimale: 60,
    accelerationParPomme: 3,
    pointsParPomme: 10,
    cleScores: "snakeScores",
    nombreScores: 10,
    couleurs: { serpent: "#fff", pomme: "#fff", defaut: "#777", grille: "#151515" }
};

const DIRECTIONS = {
    haut:   { x: 0,  y: -1 },
    bas:    { x: 0,  y: 1 },
    gauche: { x: -1, y: 0 },
    droite: { x: 1,  y: 0 }
};

const TOUCHES = {
    ArrowUp: "haut", ArrowDown: "bas", ArrowLeft: "gauche", ArrowRight: "droite",
    z: "haut", s: "bas", q: "gauche", d: "droite", w: "haut", a: "gauche"
};


/* ==========================================================================
   2. ÉTAT DE LA PARTIE
   ========================================================================== */
const partie = {
    etat: "attente",     // "attente" | "jeu" | "pause" | "fin"
    serpent: [],
    direction: DIRECTIONS.droite,
    fileDirections: [],  // virages demandés entre deux pas (évite les demi-tours)
    pomme: { x: 0, y: 0 },
    score: 0,
    vitesse: JEU.vitesseInitiale,
    cumul: 0,
    instantPrecedent: 0
};

let elements = {};


/* ==========================================================================
   3. RÈGLES DU JEU
   ========================================================================== */

/** Remet le serpent au centre, trois cases de long, vers la droite. */
function nouvellePartie() {
    const milieu = Math.floor(JEU.cases / 2);
    partie.serpent = [{ x: milieu, y: milieu }, { x: milieu - 1, y: milieu }, { x: milieu - 2, y: milieu }];
    partie.direction = DIRECTIONS.droite;
    partie.fileDirections = [];
    partie.score = 0;
    partie.vitesse = JEU.vitesseInitiale;
    placerPomme();
    afficherScore();
}

/** Place la pomme sur une case libre, au hasard. */
function placerPomme() {
    const libres = [];
    for (let x = 0; x < JEU.cases; x++) {
        for (let y = 0; y < JEU.cases; y++) {
            if (!partie.serpent.some((anneau) => anneau.x === x && anneau.y === y)) libres.push({ x, y });
        }
    }
    partie.pomme = libres[Math.floor(Math.random() * libres.length)];
}

/** Enregistre un virage, sauf un demi-tour sur soi-même. */
function demanderDirection(nom) {
    if (partie.etat === "attente" || partie.etat === "fin") demarrer();

    const nouvelle = DIRECTIONS[nom];
    const derniere = partie.fileDirections.at(-1) || partie.direction;
    const demiTour = nouvelle.x === -derniere.x && nouvelle.y === -derniere.y;
    if (!demiTour && nouvelle !== derniere && partie.fileDirections.length < 2) {
        partie.fileDirections.push(nouvelle);
    }
}

/** Avance d'une case : mange, grandit ou perd. */
function avancer() {
    if (partie.fileDirections.length) partie.direction = partie.fileDirections.shift();

    const tete = partie.serpent[0];
    const nouvelleTete = { x: tete.x + partie.direction.x, y: tete.y + partie.direction.y };
    const mange = nouvelleTete.x === partie.pomme.x && nouvelleTete.y === partie.pomme.y;
    const corps = mange ? partie.serpent : partie.serpent.slice(0, -1);   // la queue se libère si on ne mange pas

    const horsPlateau = nouvelleTete.x < 0 || nouvelleTete.y < 0 || nouvelleTete.x >= JEU.cases || nouvelleTete.y >= JEU.cases;
    const collision = corps.some((anneau) => anneau.x === nouvelleTete.x && anneau.y === nouvelleTete.y);
    if (horsPlateau || collision) {
        terminer();
        return;
    }

    partie.serpent = [nouvelleTete, ...corps];
    if (mange) {
        partie.score += JEU.pointsParPomme;
        partie.vitesse = Math.max(JEU.vitesseMinimale, partie.vitesse - JEU.accelerationParPomme);
        afficherScore();
        placerPomme();
    }
}

function demarrer() {
    if (partie.etat === "fin" || partie.etat === "attente") nouvellePartie();
    partie.etat = "jeu";
    partie.cumul = 0;
    partie.instantPrecedent = performance.now();
    elements.calque.hidden = true;
    requestAnimationFrame(boucle);
}

/** En jeu : met en pause. Sinon : démarre, reprend ou relance. */
function basculerPause() {
    if (partie.etat === "jeu") {
        partie.etat = "pause";
        afficherCalque("Pause", "Espace ou bouton pour reprendre", "Reprendre");
    } else {
        demarrer();
    }
}

function terminer() {
    partie.etat = "fin";
    const rang = enregistrerScore(partie.score);
    dessiner(true);
    afficherScores();
    const message = rang === 1 ? "Nouveau record !" : `Score : ${partie.score} pts`;
    afficherCalque("Perdu", `${message} — Espace pour rejouer`, "Rejouer");
}

/** Boucle d'animation : avance d'un pas toutes les « vitesse » millisecondes. */
function boucle(instant) {
    if (partie.etat !== "jeu") return;
    partie.cumul += instant - partie.instantPrecedent;
    partie.instantPrecedent = instant;

    while (partie.cumul >= partie.vitesse && partie.etat === "jeu") {
        partie.cumul -= partie.vitesse;
        avancer();
    }
    if (partie.etat === "jeu") {
        dessiner(false);
        requestAnimationFrame(boucle);
    }
}


/* ==========================================================================
   4. DESSIN
   ========================================================================== */

/** Adapte la résolution du canvas à sa taille affichée. */
function redimensionner() {
    const { canvas, contexte } = elements;
    const taille = canvas.getBoundingClientRect().width;
    const densite = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(taille * densite);
    canvas.height = Math.round(taille * densite);
    contexte.setTransform(densite, 0, 0, densite, 0, 0);
    elements.taille = taille;
    dessiner(partie.etat === "fin");
}

/**
 * @param {boolean} perdu - true : le serpent est grisé (fin de partie)
 */
function dessiner(perdu) {
    const { contexte: c, taille } = elements;
    const caseTaille = taille / JEU.cases;
    c.clearRect(0, 0, taille, taille);

    // Grille discrète
    c.strokeStyle = JEU.couleurs.grille;
    c.lineWidth = 1;
    c.beginPath();
    for (let i = 1; i < JEU.cases; i++) {
        const position = Math.round(i * caseTaille) + 0.5;
        c.moveTo(position, 0); c.lineTo(position, taille);
        c.moveTo(0, position); c.lineTo(taille, position);
    }
    c.stroke();

    // Pomme : petit carré plein
    const marge = caseTaille * 0.25;
    c.fillStyle = JEU.couleurs.pomme;
    c.fillRect(partie.pomme.x * caseTaille + marge, partie.pomme.y * caseTaille + marge, caseTaille - 2 * marge, caseTaille - 2 * marge);

    // Serpent
    c.fillStyle = perdu ? JEU.couleurs.defaut : JEU.couleurs.serpent;
    for (const anneau of partie.serpent) {
        c.fillRect(anneau.x * caseTaille + 1, anneau.y * caseTaille + 1, caseTaille - 2, caseTaille - 2);
    }
}

function afficherScore() {
    elements.score.textContent = partie.score;
}

function afficherCalque(titre, texte, bouton) {
    elements.calqueTitre.textContent = titre;
    elements.calqueTexte.textContent = texte;
    elements.bouton.textContent = bouton;
    elements.calque.hidden = false;
}


/* ==========================================================================
   5. SCORES ENREGISTRÉS (localStorage)
   Si le navigateur refuse l'accès (navigation privée), le jeu continue
   sans mémoriser les scores.
   ========================================================================== */
function lireScores() {
    try {
        return JSON.parse(localStorage.getItem(JEU.cleScores)) || [];
    } catch {
        return [];
    }
}

/** Ajoute un score et renvoie son rang (1 = record), ou 0 s'il n'est pas classé. */
function enregistrerScore(score) {
    if (score === 0) return 0;
    const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    const entree = { score, date };
    const scores = [...lireScores(), entree].sort((a, b) => b.score - a.score).slice(0, JEU.nombreScores);
    try {
        localStorage.setItem(JEU.cleScores, JSON.stringify(scores));
    } catch {
        /* stockage indisponible : rien à faire */
    }
    return scores.indexOf(entree) + 1;
}

function afficherScores() {
    const liste = elements.scores;
    liste.replaceChildren();
    const scores = lireScores();

    if (scores.length === 0) {
        const vide = document.createElement("li");
        vide.textContent = "Aucun score";
        liste.append(vide);
        return;
    }
    scores.forEach(({ score }, index) => {
        const ligne = document.createElement("li");
        const rang = document.createElement("span");
        const points = document.createElement("span");
        rang.textContent = `#${index + 1}`;
        points.textContent = `${score} pts`;
        ligne.append(rang, points);
        liste.append(ligne);
    });
}


/* ==========================================================================
   6. COMMANDES (CLAVIER, TACTILE)
   ========================================================================== */
function activerCommandes() {
    document.addEventListener("keydown", (evenement) => {
        const touche = evenement.key.length === 1 ? evenement.key.toLowerCase() : evenement.key;

        if (TOUCHES[touche]) {
            evenement.preventDefault();   // pas de défilement de la page avec les flèches
            demanderDirection(TOUCHES[touche]);
            return;
        }
        // Espace / Entrée sur un bouton ou un lien : le clic s'en charge déjà
        const surElementActif = evenement.target.closest("button, a, summary");
        if ([" ", "p"].includes(touche) && !surElementActif) {
            evenement.preventDefault();
            basculerPause();
        }
    });

    elements.bouton.addEventListener("click", basculerPause);

    // Croix directionnelle
    document.querySelectorAll("[data-direction]").forEach((bouton) => {
        bouton.addEventListener("pointerdown", (evenement) => {
            evenement.preventDefault();
            demanderDirection(bouton.dataset.direction);
        });
    });

    // Glisser sur le plateau
    let depart = null;
    elements.canvas.addEventListener("pointerdown", (evenement) => { depart = { x: evenement.clientX, y: evenement.clientY }; });
    elements.canvas.addEventListener("pointerup", (evenement) => {
        if (!depart) return;
        const dx = evenement.clientX - depart.x;
        const dy = evenement.clientY - depart.y;
        depart = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;   // simple toucher : ignoré
        demanderDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "droite" : "gauche") : (dy > 0 ? "bas" : "haut"));
    });

    // Onglet masqué : pause automatique
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && partie.etat === "jeu") basculerPause();
    });
}


/* ==========================================================================
   7. INITIALISATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("jeu-canvas");
    if (!canvas) return;

    elements = {
        canvas,
        contexte:    canvas.getContext("2d"),
        calque:      document.getElementById("jeu-calque"),
        calqueTitre: document.getElementById("jeu-calque-titre"),
        calqueTexte: document.getElementById("jeu-calque-texte"),
        bouton:      document.getElementById("jeu-demarrer"),
        score:       document.getElementById("jeu-score"),
        scores:      document.getElementById("jeu-scores")
    };

    nouvellePartie();
    afficherScores();
    activerCommandes();
    new ResizeObserver(redimensionner).observe(canvas);
});
