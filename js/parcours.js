/* ==========================================================================
   PAGE « PARCOURS » — CV dynamique
   --------------------------------------------------------------------------
   Construit parcours.html à partir de PROFIL, PARCOURS, COMPETENCES et
   INTERETS (js/donnees.js). Aucun contenu n'est écrit en dur ici.

   SOMMAIRE
   1. Réglages
   2. Profil et chiffres clés
   3. Filtres de la frise
   4. Frise chronologique
   5. Compétences
   6. Centres d'intérêt
   7. Apparition au défilement
   8. Initialisation
   ========================================================================== */


/* ==========================================================================
   1. RÉGLAGES
   ========================================================================== */
const TYPES_PARCOURS = {
    experience: { libelle: "Expériences", singulier: "Expérience" },
    formation:  { libelle: "Formations",  singulier: "Formation" },
    projet:     { libelle: "Projets",     singulier: "Projet" }
};

const NIVEAU_MAX = 5;


/* ==========================================================================
   2. PROFIL ET CHIFFRES CLÉS
   ========================================================================== */

/**
 * Remplit l'en-tête : photo, nom, titre, accroche, boutons de contact.
 * @param {HTMLElement} conteneur
 */
function afficherProfil(conteneur) {
    const boutons = creerElement("div", { classe: "cv-profil__actions" }, [
        creerElement("a", { classe: "bouton bouton--plein", texte: "Télécharger le CV",
                            attributs: { href: SITE.cv, target: "_blank", rel: "noopener" } }),
        creerElement("a", { classe: "bouton", texte: "Me contacter",
                            attributs: { href: `mailto:${SITE.email}` } }),
        ...SITE.liens.map(({ libelle, lien }) =>
            creerElement("a", { classe: "bouton", texte: libelle,
                                attributs: { href: lien, target: "_blank", rel: "noopener" } }))
    ]);

    conteneur.append(
        creerElement("img", { classe: "cv-profil__photo",
                              attributs: { src: PROFIL.photo, alt: `Photo de ${PROFIL.nom}`, width: 120, height: 120 } }),
        creerElement("div", { classe: "cv-profil__texte" }, [
            creerElement("h1", { classe: "titre-principal", texte: PROFIL.nom }),
            creerElement("p", { classe: "cv-profil__titre", texte: PROFIL.titre }),
            creerElement("p", { classe: "cv-profil__lieu", texte: PROFIL.localisation })
        ]),
        creerElement("p", { classe: "texte texte--justifie cv-profil__accroche", texte: PROFIL.accroche }),
        creerElement("p", { classe: "cv-profil__objectif", texte: PROFIL.objectif }),
        boutons
    );
}

/**
 * Additionne la durée (en mois) de toutes les entrées d'un type donné.
 * @param {string} type
 * @returns {number}
 */
function compterMois(type) {
    return PARCOURS
        .filter((entree) => entree.type === type && !entree.aVenir)
        .reduce((total, { debut, fin }) => {
            const dateDebut = lireDate(debut);
            const dateFin = fin ? lireDate(fin) : new Date();
            return total + (dateFin.getFullYear() - dateDebut.getFullYear()) * 12
                         + (dateFin.getMonth() - dateDebut.getMonth()) + 1;
        }, 0);
}

/**
 * Affiche quelques chiffres calculés automatiquement depuis les données.
 * @param {HTMLElement} conteneur
 */
function afficherChiffresCles(conteneur) {
    const moisExperience = compterMois("experience");
    const chiffres = [
        { valeur: Math.floor(moisExperience / 12) || moisExperience,
          libelle: moisExperience >= 12 ? "ans d'expérience en entreprise" : "mois en entreprise" },
        { valeur: PARCOURS.filter((e) => e.type === "experience").length, libelle: "entreprises" },
        { valeur: PARCOURS.filter((e) => e.type === "projet").length,     libelle: "projets techniques" },
        { valeur: Object.keys(DOCUMENTS).length,                          libelle: "documents en ligne" }
    ];

    for (const { valeur, libelle } of chiffres) {
        conteneur.append(creerElement("div", { classe: "chiffre" }, [
            creerElement("span", { classe: "chiffre__valeur", texte: String(valeur) }),
            creerElement("span", { classe: "chiffre__libelle", texte: libelle })
        ]));
    }
}


/* ==========================================================================
   3. FILTRES DE LA FRISE
   Le filtre actif est conservé dans l'adresse (#experience, #projet...)
   pour pouvoir partager un lien déjà filtré.
   ========================================================================== */

/**
 * Crée les boutons « Tout / Expériences / Formations / Projets ».
 * @param {HTMLElement} conteneur
 * @param {HTMLElement} frise
 */
function afficherFiltres(conteneur, frise) {
    const options = [{ type: "tout", libelle: "Tout", nombre: PARCOURS.length }]
        .concat(Object.entries(TYPES_PARCOURS).map(([type, { libelle }]) => ({
            type, libelle, nombre: PARCOURS.filter((e) => e.type === type).length
        })));

    for (const { type, libelle, nombre } of options) {
        const bouton = creerElement("button", {
            classe: "filtre",
            attributs: { type: "button", "data-filtre": type, "aria-pressed": "false" }
        }, [libelle, creerElement("span", { classe: "filtre__nombre", texte: String(nombre) })]);

        bouton.addEventListener("click", () => {
            appliquerFiltre(conteneur, frise, type);
            history.replaceState(null, "", type === "tout" ? location.pathname : `#${type}`);
        });
        conteneur.append(bouton);
    }

    const typeInitial = location.hash.slice(1);
    appliquerFiltre(conteneur, frise, TYPES_PARCOURS[typeInitial] ? typeInitial : "tout");
}

/**
 * Masque les entrées de la frise qui ne correspondent pas au filtre.
 * @param {HTMLElement} conteneur - zone des boutons
 * @param {HTMLElement} frise
 * @param {string} type - "tout" ou une clé de TYPES_PARCOURS
 */
function appliquerFiltre(conteneur, frise, type) {
    for (const bouton of conteneur.querySelectorAll(".filtre")) {
        bouton.setAttribute("aria-pressed", String(bouton.dataset.filtre === type));
    }
    for (const entree of frise.querySelectorAll(".frise__entree")) {
        entree.hidden = type !== "tout" && entree.dataset.type !== type;
    }
}


/* ==========================================================================
   4. FRISE CHRONOLOGIQUE
   ========================================================================== */

/**
 * Crée le bloc HTML d'une entrée du parcours.
 * @param {object} entree - un élément de PARCOURS
 * @returns {HTMLElement}
 */
function creerEntreeFrise(entree) {
    const type = TYPES_PARCOURS[entree.type];
    const sousTitre = [entree.organisme, entree.lieu].filter(Boolean).join(" · ");

    const entete = creerElement("div", { classe: "frise__entete" }, [
        creerElement("span", { classe: `etiquette etiquette--${entree.type}`, texte: type.singulier }),
        entree.aVenir ? creerElement("span", { classe: "etiquette etiquette--a-venir", texte: "À venir" }) : null,
        creerElement("time", {
            classe: "frise__date",
            texte: `${formaterPeriode(entree.debut, entree.fin)} · ${calculerDuree(entree.debut, entree.fin)}`,
            attributs: { datetime: entree.debut }
        })
    ]);

    const points = entree.points?.length
        ? creerElement("ul", { classe: "frise__points" },
                       entree.points.map((point) => creerElement("li", { texte: point })))
        : null;

    const tags = entree.tags?.length
        ? creerElement("ul", { classe: "tags", attributs: { "aria-label": "Outils et technologies" } },
                       entree.tags.map((tag) => creerElement("li", { classe: "tag", texte: tag })))
        : null;

    const documents = entree.documents?.length
        ? creerElement("details", { classe: "frise__documents" }, [
              creerElement("summary", { texte: `Documents (${entree.documents.length})` }),
              creerListeDocuments(entree.documents)
          ])
        : null;

    const image = entree.image
        ? creerElement("img", { classe: "frise__image",
                                attributs: { src: entree.image, alt: "", loading: "lazy", decoding: "async" } })
        : null;

    return creerElement("li", {
        classe: `frise__entree apparition${entree.aVenir ? " frise__entree--a-venir" : ""}`,
        attributs: { "data-type": entree.type }
    }, [
        creerElement("span", { classe: `frise__point frise__point--${entree.type}`, attributs: { "aria-hidden": "true" } }),
        creerElement("article", { classe: `frise__carte${image ? " frise__carte--image" : ""}` }, [
            creerElement("div", { classe: "frise__contenu" }, [
                entete,
                creerElement("h3", { classe: "frise__titre", texte: entree.titre }),
                creerElement("p", { classe: "frise__organisme", texte: sousTitre }),
                points, tags, documents
            ]),
            image
        ])
    ]);
}

/**
 * Affiche toutes les entrées, de la plus récente à la plus ancienne.
 * @param {HTMLElement} frise - élément <ol>
 */
function afficherFrise(frise) {
    const triees = [...PARCOURS].sort((a, b) => lireDate(b.debut) - lireDate(a.debut));
    for (const entree of triees) frise.append(creerEntreeFrise(entree));
}


/* ==========================================================================
   5. COMPÉTENCES
   ========================================================================== */

/**
 * Crée une jauge de NIVEAU_MAX segments, lisible par les lecteurs d'écran.
 * @param {number} niveau
 * @returns {HTMLElement}
 */
function creerJauge(niveau) {
    const jauge = creerElement("span", {
        classe: "jauge",
        attributs: { role: "img", "aria-label": `Niveau ${niveau} sur ${NIVEAU_MAX}` }
    });
    for (let i = 1; i <= NIVEAU_MAX; i++) {
        jauge.append(creerElement("span", {
            classe: `jauge__segment${i <= niveau ? " jauge__segment--rempli" : ""}`,
            attributs: { style: `--rang: ${i}` }
        }));
    }
    return jauge;
}

/**
 * Affiche chaque domaine de compétences avec ses jauges.
 * @param {HTMLElement} conteneur
 */
function afficherCompetences(conteneur) {
    for (const { domaine, elements } of COMPETENCES) {
        conteneur.append(creerElement("div", { classe: "competences__domaine apparition" }, [
            creerElement("h3", { classe: "competences__titre", texte: domaine }),
            creerElement("ul", { classe: "competences__liste" },
                elements.map(({ nom, niveau }) => creerElement("li", { classe: "competence" }, [
                    creerElement("span", { classe: "competence__nom", texte: nom }),
                    creerJauge(niveau)
                ])))
        ]));
    }
}


/* ==========================================================================
   6. CENTRES D'INTÉRÊT
   ========================================================================== */

/**
 * @param {HTMLElement} conteneur - élément <ul>
 */
function afficherInterets(conteneur) {
    for (const interet of INTERETS) {
        conteneur.append(creerElement("li", { classe: "tag tag--large", texte: interet }));
    }
}


/* ==========================================================================
   7. APPARITION AU DÉFILEMENT
   Les éléments .apparition deviennent visibles en entrant dans l'écran.
   Désactivé si l'utilisateur a demandé moins d'animations.
   ========================================================================== */
function activerApparitions() {
    const elements = document.querySelectorAll(".apparition");
    const animationsReduites = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (animationsReduites || !("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("apparition--visible"));
        return;
    }

    const observateur = new IntersectionObserver((entrees) => {
        for (const entree of entrees) {
            if (entree.isIntersecting) {
                entree.target.classList.add("apparition--visible");
                observateur.unobserve(entree.target);
            }
        }
    }, { rootMargin: "0px 0px -10% 0px" });

    elements.forEach((element) => observateur.observe(element));
}


/* ==========================================================================
   8. INITIALISATION
   Chaque bloc n'est construit que si son conteneur existe dans la page.
   ========================================================================== */
function initialiserParcours() {
    const zone = (id) => document.getElementById(id);

    if (zone("cv-profil"))     afficherProfil(zone("cv-profil"));
    if (zone("cv-chiffres"))   afficherChiffresCles(zone("cv-chiffres"));
    if (zone("cv-frise")) {
        afficherFrise(zone("cv-frise"));
        if (zone("cv-filtres")) afficherFiltres(zone("cv-filtres"), zone("cv-frise"));
    }
    if (zone("cv-competences")) afficherCompetences(zone("cv-competences"));
    if (zone("cv-interets"))    afficherInterets(zone("cv-interets"));

    const boutonImprimer = zone("cv-imprimer");
    if (boutonImprimer) boutonImprimer.addEventListener("click", () => window.print());

    activerApparitions();
}

document.addEventListener("DOMContentLoaded", initialiserParcours);
