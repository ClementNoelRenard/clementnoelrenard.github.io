/* ==========================================================================
   COMPOSANTS COMMUNS — Clément Noël
   --------------------------------------------------------------------------
   Fonctions réutilisables qui construisent les éléments répétés sur toutes
   les pages (navigation, pied de page, listes de documents, liens) à partir
   des données de js/donnees.js.

   Utilisation dans une page HTML :
     <body data-page="accueil">                 → identifiant de la page active
     <nav id="navigation"></nav>                → menu généré
     <footer id="pied-de-page" data-retour></footer>
                                                → pied de page (+ lien retour)
     <div data-composant="documents"></div>     → toutes les catégories de PDF
     <div data-composant="liens"></div>         → liens externes (LinkedIn...)
     <div data-composant="ressources"></div>    → ressources partagées
     <a data-composant="email"></a>             → adresse e-mail cliquable
     <a data-composant="cv"></a>                → lien de téléchargement du CV

   Scripts à charger dans cet ordre (avec defer) :
     js/donnees.js, js/composants.js, puis le script propre à la page.

   SOMMAIRE
   1. Utilitaires (création d'éléments, dates)
   2. Navigation
   3. Pied de page
   4. Documents
   5. Liens
   6. Initialisation automatique
   ========================================================================== */


/* ==========================================================================
   1. UTILITAIRES
   ========================================================================== */

/**
 * Crée un élément HTML en une seule instruction.
 * @param {string} balise   - nom de la balise ("a", "li", "section"...)
 * @param {object} options  - { classe, texte, attributs: { href: "..." } }
 * @param {Array}  enfants  - éléments ou textes à ajouter à l'intérieur
 * @returns {HTMLElement}
 */
function creerElement(balise, options = {}, enfants = []) {
    const element = document.createElement(balise);

    if (options.classe) element.className = options.classe;
    if (options.texte)  element.textContent = options.texte;

    for (const [nom, valeur] of Object.entries(options.attributs || {})) {
        if (valeur !== undefined && valeur !== null && valeur !== false) {
            element.setAttribute(nom, valeur);
        }
    }

    for (const enfant of enfants) {
        if (enfant) element.append(enfant);
    }
    return element;
}

/** Noms des mois utilisés pour l'affichage des dates. */
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
              "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/**
 * Convertit "AAAA-MM" en objet Date (1er du mois).
 * @param {string} texte
 * @returns {Date}
 */
function lireDate(texte) {
    const [annee, mois] = texte.split("-").map(Number);
    return new Date(annee, (mois || 1) - 1, 1);
}

/**
 * Affiche une date "AAAA-MM" sous la forme « avr. 2024 ».
 * @param {string} texte
 * @returns {string}
 */
function formaterDate(texte) {
    const date = lireDate(texte);
    return `${MOIS[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Affiche une période : « avr. 2024 – juil. 2024 » ou « mars 2025 – aujourd'hui ».
 * @param {string}      debut - "AAAA-MM"
 * @param {string|null} fin   - "AAAA-MM" ou null si en cours
 * @returns {string}
 */
function formaterPeriode(debut, fin) {
    return `${formaterDate(debut)} – ${fin ? formaterDate(fin) : "aujourd'hui"}`;
}

/**
 * Calcule une durée lisible entre deux dates : « 4 mois », « 1 an 5 mois ».
 * @param {string}      debut - "AAAA-MM"
 * @param {string|null} fin   - "AAAA-MM" ou null (= aujourd'hui)
 * @returns {string}
 */
function calculerDuree(debut, fin) {
    const dateDebut = lireDate(debut);
    const dateFin = fin ? lireDate(fin) : new Date();
    const totalMois = (dateFin.getFullYear() - dateDebut.getFullYear()) * 12
                    + (dateFin.getMonth() - dateDebut.getMonth()) + 1;

    const annees = Math.floor(totalMois / 12);
    const mois = totalMois % 12;
    const morceaux = [];
    if (annees > 0) morceaux.push(`${annees} an${annees > 1 ? "s" : ""}`);
    if (mois > 0)   morceaux.push(`${mois} mois`);
    return morceaux.join(" ");
}


/* ==========================================================================
   2. NAVIGATION
   ========================================================================== */

/**
 * Remplit <nav id="navigation"> avec les liens de SITE.navigation.
 * Le lien de la page courante (body[data-page]) reçoit aria-current="page".
 */
function afficherNavigation() {
    const conteneur = document.getElementById("navigation");
    if (!conteneur) return;

    const pageActive = document.body.dataset.page;
    conteneur.classList.add("navigation");
    conteneur.setAttribute("aria-label", "Navigation principale");

    for (const entree of SITE.navigation) {
        conteneur.append(creerElement("a", {
            classe: "lien",
            texte: entree.libelle,
            attributs: {
                href: entree.lien,
                "aria-current": entree.id === pageActive ? "page" : null
            }
        }));
    }
}


/* ==========================================================================
   3. PIED DE PAGE
   ========================================================================== */

/**
 * Remplit <footer id="pied-de-page">.
 * Avec l'attribut data-retour, un lien « Retour à l'accueil » est ajouté.
 */
function afficherPiedDePage() {
    const conteneur = document.getElementById("pied-de-page");
    if (!conteneur) return;

    conteneur.classList.add("pied-de-page");

    if (conteneur.hasAttribute("data-retour")) {
        conteneur.append(
            creerElement("a", { classe: "lien", texte: "← Retour à l'accueil", attributs: { href: "index.html" } }),
            creerElement("div", { classe: "pied-de-page__espace" })
        );
    }
    conteneur.append(`© ${SITE.annee} — ${SITE.auteur} — ${SITE.version}`);
}


/* ==========================================================================
   4. DOCUMENTS
   ========================================================================== */

/**
 * Crée le lien vers un document de DOCUMENTS à partir de son identifiant.
 * Un identifiant inconnu est signalé dans la console (aide au débogage).
 * @param {string} identifiant - clé de l'objet DOCUMENTS
 * @param {string} [classe]    - classe CSS du lien
 * @returns {HTMLElement|null}
 */
function creerLienDocument(identifiant, classe = "lien") {
    const documentPdf = DOCUMENTS[identifiant];
    if (!documentPdf) {
        console.warn(`Document inconnu dans donnees.js : « ${identifiant} »`);
        return null;
    }
    return creerElement("a", {
        classe,
        texte: documentPdf.titre,
        attributs: { href: documentPdf.fichier, target: "_blank", rel: "noopener" }
    });
}

/**
 * Crée une liste <ul> de documents.
 * @param {string[]} identifiants
 * @returns {HTMLElement}
 */
function creerListeDocuments(identifiants) {
    const liste = creerElement("ul", { classe: "liste-documents" });
    for (const identifiant of identifiants) {
        const lien = creerLienDocument(identifiant);
        if (lien) liste.append(creerElement("li", { classe: "liste-documents__element" }, [lien]));
    }
    return liste;
}

/**
 * Affiche toutes les catégories de CATEGORIES, numérotées « 01 — ... ».
 * @param {HTMLElement} conteneur
 */
function afficherCategoriesDocuments(conteneur) {
    CATEGORIES.forEach((categorie, index) => {
        const numero = String(index + 1).padStart(2, "0");
        conteneur.append(creerElement("section", { classe: "section" }, [
            creerElement("h2", { classe: "titre-section", texte: `${numero} — ${categorie.titre}` }),
            categorie.description
                ? creerElement("p", { classe: "texte", texte: categorie.description })
                : null,
            creerListeDocuments(categorie.documents)
        ]));
    });
}


/* ==========================================================================
   5. LIENS
   ========================================================================== */

/**
 * Affiche une liste verticale de liens externes.
 * @param {HTMLElement} conteneur
 * @param {{libelle: string, lien: string}[]} liens
 */
function afficherListeLiens(conteneur, liens) {
    conteneur.classList.add("liste-liens");
    for (const { libelle, lien } of liens) {
        conteneur.append(creerElement("a", {
            classe: "lien",
            texte: libelle,
            attributs: { href: lien, target: "_blank", rel: "noopener" }
        }));
    }
}

/**
 * Transforme un <a data-composant="email"> en lien mailto vers SITE.email.
 * @param {HTMLAnchorElement} lien
 */
function afficherEmail(lien) {
    lien.href = `mailto:${SITE.email}`;
    if (!lien.textContent.trim()) lien.textContent = SITE.email;
}

/**
 * Transforme un <a data-composant="cv"> en lien vers le CV PDF.
 * @param {HTMLAnchorElement} lien
 */
function afficherLienCv(lien) {
    lien.href = SITE.cv;
    lien.target = "_blank";
    lien.rel = "noopener";
    if (!lien.textContent.trim()) lien.textContent = "Télécharger mon CV (PDF)";
}


/* ==========================================================================
   6. INITIALISATION AUTOMATIQUE
   Chaque composant [data-composant="nom"] est associé à sa fonction.
   Pour ajouter un composant : écrire la fonction puis l'ajouter ici.
   ========================================================================== */
const COMPOSANTS = {
    documents:  (element) => afficherCategoriesDocuments(element),
    liens:      (element) => afficherListeLiens(element, SITE.liens),
    ressources: (element) => afficherListeLiens(element, SITE.ressources),
    email:      (element) => afficherEmail(element),
    cv:         (element) => afficherLienCv(element)
};

function initialiserComposants() {
    afficherNavigation();
    afficherPiedDePage();

    for (const element of document.querySelectorAll("[data-composant]")) {
        const construire = COMPOSANTS[element.dataset.composant];
        if (construire) construire(element);
        else console.warn(`Composant inconnu : « ${element.dataset.composant} »`);
    }
}

document.addEventListener("DOMContentLoaded", initialiserComposants);
