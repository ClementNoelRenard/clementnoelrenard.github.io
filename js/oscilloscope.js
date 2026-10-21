/* ==========================================================================
   OSCILLOSCOPE — écran animé de la page d'accueil
   --------------------------------------------------------------------------
   Dessine sur un <canvas> deux voies, comme un oscilloscope numérique :
     CH1 (jaune) : sinusoïde, réglable avec la souris ou le doigt
                   (gauche ↔ droite = fréquence, bas ↔ haut = amplitude)
     CH2 (vert)  : signal PWM dont le rapport cyclique varie lentement
   Les mesures affichées sous l'écran suivent les réglages.

   Utilisation :
     <figure data-oscilloscope>
         <canvas class="instrument__ecran"></canvas>
         <dd data-mesure="frequence"></dd> <dd data-mesure="amplitude"></dd> <dd data-mesure="rapport"></dd>
     </figure>
   ========================================================================== */

/** Échelle simulée : 10 divisions horizontales de 5 ms, 8 divisions verticales de 1 V. */
const ECHELLE = { divisionsX: 10, divisionsY: 8, msParDivision: 5, voltsParDivision: 1 };

class Oscilloscope {
    /**
     * @param {HTMLElement} instrument - élément portant data-oscilloscope
     */
    constructor(instrument) {
        this.canvas = instrument.querySelector("canvas");
        this.contexte = this.canvas.getContext("2d");
        this.mesures = {
            frequence: instrument.querySelector('[data-mesure="frequence"]'),
            amplitude: instrument.querySelector('[data-mesure="amplitude"]'),
            rapport:   instrument.querySelector('[data-mesure="rapport"]')
        };

        const styles = getComputedStyle(document.documentElement);
        this.couleurs = {
            voie1:  styles.getPropertyValue("--jaune").trim() || "#ffd000",
            voie2:  styles.getPropertyValue("--vert").trim() || "#3dff7a",
            grille: "rgba(255, 255, 255, 0.07)",
            axes:   "rgba(255, 255, 255, 0.2)"
        };

        // « reglage » suit « cible » en douceur (pas de saut quand la souris bouge)
        this.reglage = { frequence: 2, amplitude: 0.6, rapport: 0.5 };
        this.cible = { ...this.reglage };
        this.manuel = false;
        this.visible = true;
        this.phase = 0;
        this.instantPrecedent = 0;
        this.derniereMesure = 0;

        this.redimensionner();
        new ResizeObserver(() => this.redimensionner()).observe(this.canvas);
        new IntersectionObserver(([entree]) => { this.visible = entree.isIntersecting; }).observe(this.canvas);
        this.canvas.addEventListener("pointermove", (evenement) => this.regler(evenement));
        this.canvas.addEventListener("pointerleave", () => { this.manuel = false; });

        if (animationsReduites()) {
            this.dessiner(false);
            this.afficherMesures();
            return;
        }
        requestAnimationFrame((instant) => this.boucle(instant));
    }

    /** Adapte la résolution du canvas à sa taille affichée (écrans haute densité inclus). */
    redimensionner() {
        const { width, height } = this.canvas.getBoundingClientRect();
        const densite = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.round(width * densite);
        this.canvas.height = Math.round(height * densite);
        this.contexte.setTransform(densite, 0, 0, densite, 0, 0);
        this.largeur = width;
        this.hauteur = height;
        if (animationsReduites()) this.dessiner(false);
    }

    /** Position du pointeur → fréquence (horizontal) et amplitude (vertical). */
    regler(evenement) {
        const zone = this.canvas.getBoundingClientRect();
        const x = (evenement.clientX - zone.left) / zone.width;
        const y = (evenement.clientY - zone.top) / zone.height;
        this.manuel = true;
        this.cible.frequence = 0.75 + x * 5;
        this.cible.amplitude = 0.15 + (1 - y) * 0.7;
    }

    /** Boucle d'animation (≈ 60 images par seconde, en pause hors écran). */
    boucle(instant) {
        const ecart = Math.min(0.05, (instant - this.instantPrecedent) / 1000);
        this.instantPrecedent = instant;
        const secondes = instant / 1000;

        // Sans pointeur, le signal dérive lentement tout seul
        if (!this.manuel) {
            this.cible.frequence = 2 + Math.sin(secondes * 0.23) * 1.1;
            this.cible.amplitude = 0.58 + Math.sin(secondes * 0.37) * 0.16;
        }
        this.cible.rapport = 0.5 + Math.sin(secondes * 0.6) * 0.35;

        for (const cle of Object.keys(this.reglage)) {
            this.reglage[cle] += (this.cible[cle] - this.reglage[cle]) * Math.min(1, ecart * 6);
        }
        this.phase += ecart * 1.6;

        if (this.visible) {
            this.dessiner(true);
            if (instant - this.derniereMesure > 150) {
                this.afficherMesures();
                this.derniereMesure = instant;
            }
        }
        requestAnimationFrame((suivant) => this.boucle(suivant));
    }

    /** Dessine la grille puis les deux voies. */
    dessiner(avecBruit) {
        const c = this.contexte;
        const L = this.largeur;
        const H = this.hauteur;
        const divisionY = H / ECHELLE.divisionsY;
        c.clearRect(0, 0, L, H);

        this.dessinerGrille();

        // CH2 : PWM
        const niveauBasPwm = H * 0.8;
        this.tracer((x) => {
            const position = ((x / L) * this.reglage.frequence * 2 + this.phase * 0.5) % 1;
            return position < this.reglage.rapport ? niveauBasPwm - divisionY * 1.2 : niveauBasPwm;
        }, this.couleurs.voie2, 1.5);

        // CH1 : sinusoïde + harmonique 3 + léger bruit
        const centre = H * 0.38;
        this.tracer((x) => {
            const angle = (x / L) * this.reglage.frequence * Math.PI * 2 - this.phase * 2;
            const bruit = avecBruit ? (Math.random() - 0.5) * 1.2 : 0;
            return centre
                 - Math.sin(angle) * this.reglage.amplitude * divisionY * 2.4
                 - Math.sin(angle * 3) * this.reglage.amplitude * divisionY * 0.25
                 + bruit;
        }, this.couleurs.voie1, 2);

        // Repère de niveau de la voie 1 (petit triangle à gauche)
        c.fillStyle = this.couleurs.voie1;
        c.beginPath();
        c.moveTo(0, centre - 6);
        c.lineTo(8, centre);
        c.lineTo(0, centre + 6);
        c.fill();
    }

    /** Grille 10 × 8 divisions et axes centraux gradués. */
    dessinerGrille() {
        const c = this.contexte;
        const L = this.largeur;
        const H = this.hauteur;

        c.lineWidth = 1;
        c.strokeStyle = this.couleurs.grille;
        c.beginPath();
        for (let i = 1; i < ECHELLE.divisionsX; i++) {
            const x = Math.round((i * L) / ECHELLE.divisionsX) + 0.5;
            c.moveTo(x, 0);
            c.lineTo(x, H);
        }
        for (let j = 1; j < ECHELLE.divisionsY; j++) {
            const y = Math.round((j * H) / ECHELLE.divisionsY) + 0.5;
            c.moveTo(0, y);
            c.lineTo(L, y);
        }
        c.stroke();

        // Graduations : 5 par division sur les axes centraux
        c.strokeStyle = this.couleurs.axes;
        c.beginPath();
        const milieuX = Math.round(L / 2) + 0.5;
        const milieuY = Math.round(H / 2) + 0.5;
        for (let k = 0; k <= ECHELLE.divisionsX * 5; k++) {
            const x = (k * L) / (ECHELLE.divisionsX * 5);
            c.moveTo(x, milieuY - 3);
            c.lineTo(x, milieuY + 3);
        }
        for (let k = 0; k <= ECHELLE.divisionsY * 5; k++) {
            const y = (k * H) / (ECHELLE.divisionsY * 5);
            c.moveTo(milieuX - 3, y);
            c.lineTo(milieuX + 3, y);
        }
        c.stroke();
    }

    /**
     * Trace une courbe y = fonction(x) avec un halo lumineux (effet phosphore).
     * @param {(x: number) => number} fonction
     * @param {string} couleur
     * @param {number} epaisseur
     */
    tracer(fonction, couleur, epaisseur) {
        const c = this.contexte;
        c.save();
        c.strokeStyle = couleur;
        c.lineWidth = epaisseur;
        c.lineJoin = "round";
        c.shadowColor = couleur;
        c.shadowBlur = 10;
        c.beginPath();
        for (let x = 0; x <= this.largeur; x += 2) {
            const y = fonction(x);
            if (x === 0) c.moveTo(x, y);
            else c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
    }

    /** Met à jour les mesures (fréquence, tension crête à crête, rapport cyclique). */
    afficherMesures() {
        const dureeEcranS = (ECHELLE.divisionsX * ECHELLE.msParDivision) / 1000;
        const frequence = this.reglage.frequence / dureeEcranS;
        const tensionCrete = this.reglage.amplitude * 2.4 * 2 * ECHELLE.voltsParDivision;

        if (this.mesures.frequence) this.mesures.frequence.textContent = `${frequence.toFixed(1)} Hz`;
        if (this.mesures.amplitude) this.mesures.amplitude.textContent = `${tensionCrete.toFixed(2)} Vcc`;
        if (this.mesures.rapport) this.mesures.rapport.textContent = `${Math.round(this.reglage.rapport * 100)} %`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-oscilloscope]").forEach((instrument) => new Oscilloscope(instrument));
});
