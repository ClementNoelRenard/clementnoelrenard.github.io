/* ==========================================================================
   PAGE « PARCOURS » — CV dynamique · v4
   --------------------------------------------------------------------------
   Construit parcours.html à partir de PROFIL, PARCOURS et COMPETENCES
   (js/donnees.js). Aucun contenu n'est écrit en dur ici.

   La frise est un « bus » vertical qui se remplit de jaune pendant le
   défilement ; chaque étape s'allume quand le signal l'atteint.

   SOMMAIRE
   1. Réglages
   2. Profil
   3. Frise chronologique
   4. Filtres
   5. Signal sur le bus (défilement)
   6. Compétences
   7. Initialisation
   ========================================================================== */


/* ==========================================================================
   1. RÉGLAGES
   ========================================================================== */
const TYPES_PARCOURS = {
    experience: { libelle: "Expériences", singulier: "Expérience", code: "EXP" },
    formation:  { libelle: "Formations",  singulier: "Formation",  code: "FOR" },
    projet:     { libelle: "Projets",     singulier: "Projet",     code: "PRJ" }
};

/** Nombre de segments des bargraphes (niveau sur 5 → 2 segments par point). */
const SEGMENTS_BARGRAPHE = 10;
const NIVEAU_MAX = 5;


/* ==========================================================================
   2. PROFIL
   ========================================================================== */

/**
 * @param {HTMLElement} conteneur
 */
function afficherProfil(conteneur) {
    conteneur.classList.add("profil", "apparition");
    conteneur.append(
        creerElement("img", { classe: "profil__photo", attributs: { src: PROFIL.photo, alt: `Portrait de ${PROFIL.nom}`, width: 180, height: 180 } }),
        creerElement("div", {}, [
            creerElement("h3", { classe: "profil__nom", texte: PROFIL.nom }),
            creerElement("p", { classe: "profil__titre", texte: `${PROFIL.titre} · ${PROFIL.localisation}` }),
            creerElement("p", { classe: "profil__accroche", texte: PROFIL.accroche }),
            creerElement("p", { classe: "profil__objectif" }, [
                creerElement("span", { classe: "led led--jaune led--clignote", attributs: { "aria-hidden": "true" } }),
                PROFIL.objectif
            ]),
            creerElement("div", { classe: "groupe-boutons profil__actions" }, [
                creerElement("a", { classe: "bouton bouton--plein", attributs: { href: SITE.cv, target: "_blank", rel: "noopener" } }, [
                    "CV.pdf", creerElement("span", { classe: "bouton__fleche", texte: "↓", attributs: { "aria-hidden": "true" } })
                ]),
                creerElement("a", { classe: "bouton", texte: "Me contacter", attributs: { href: `mailto:${SITE.email}` } }),
                creerElement("button", { classe: "bouton bouton--discret", texte: "Imprimer", attributs: { type: "button", "data-imprimer": "" } })
            ])
        ])
    );
    conteneur.querySelector("[data-imprimer]").addEventListener("click", () => window.print());
}


/* ==========================================================================
   3. FRISE CHRONOLOGIQUE
   ========================================================================== */

/**
 * Attribue un code à chaque étape : EXP-01 = la plus ancienne expérience.
 * @returns {Map<object, string>}
 */
function numeroterParcours() {
    const codes = new Map();
    for (const [type, { code }] of Object.entries(TYPES_PARCOURS)) {
        PARCOURS.filter((entree) => entree.type === type)
            .sort((a, b) => lireDate(a.debut) - lireDate(b.debut))
            .forEach((entree, index) => codes.set(entree, `${code}-${deuxChiffres(index + 1)}`));
    }
    return codes;
}

/**
 * Crée la carte d'une étape.
 * @param {object} entree - élément de PARCOURS
 * @param {string} code   - ex. « EXP-03 »
 * @returns {HTMLElement}
 */
function creerCarte(entree, code) {
    const type = TYPES_PARCOURS[entree.type];
    const sousTitre = [entree.organisme, entree.lieu].filter(Boolean).join(" · ");

    const texte = creerElement("div", {}, [
        creerElement("h3", { classe: "carte__titre", texte: entree.titre }),
        creerElement("p", { classe: "carte__organisme", texte: sousTitre }),
        entree.points?.length
            ? creerElement("ul", { classe: "carte__points" }, entree.points.map((point) => creerElement("li", { texte: point })))
            : null,
        entree.tags?.length
            ? creerElement("ul", { classe: "etiquettes", attributs: { "aria-label": "Outils et technologies" } },
                           entree.tags.map((tag) => creerElement("li", { classe: "etiquette", texte: tag })))
            : null,
        entree.documents?.length
            ? creerElement("details", { classe: "carte__documents" }, [
                  creerElement("summary", { texte: `Documents liés (${entree.documents.length})` }),
                  creerListeDocuments(entree.documents)
              ])
            : null
    ]);

    const image = entree.image
        ? creerElement("div", { classe: "carte__image-cadre" }, [
              creerElement("img", { classe: "carte__image", attributs: { src: entree.image, alt: "", loading: "lazy", decoding: "async" } })
          ])
        : null;

    return creerElement("article", {
        classe: `carte apparition apparition--balayage${image ? " carte--image" : ""}${entree.aVenir ? " carte--a-venir" : ""}`,
        attributs: { "data-type": entree.type }
    }, [
        creerElement("span", { classe: "carte__noeud", attributs: { "aria-hidden": "true" } }),
        creerElement("header", { classe: "carte__tete etiquette-mono" }, [
            creerElement("span", { classe: "carte__code", texte: code }),
            creerElement("span", { classe: `puce puce--${entree.type}`, texte: type.singulier }),
            entree.aVenir ? creerElement("span", { classe: "puce puce--a-venir", texte: "À venir" }) : null,
            creerElement("time", {
                classe: "carte__date",
                texte: `${formaterPeriode(entree.debut, entree.fin)} · ${calculerDuree(entree.debut, entree.fin)}`,
                attributs: { datetime: entree.debut }
            })
        ]),
        creerElement("div", { classe: "carte__corps" }, [texte, image])
    ]);
}

/**
 * Affiche les étapes de la plus récente à la plus ancienne, regroupées par
 * année de début (une grande année en contour au-dessus de chaque groupe).
 * @param {HTMLElement} frise
 */
function afficherFrise(frise) {
    const codes = numeroterParcours();
    const triees = [...PARCOURS].sort((a, b) => lireDate(b.debut) - lireDate(a.debut));

    frise.append(creerElement("div", { classe: "frise__bus", attributs: { "aria-hidden": "true" } }, [
        creerElement("div", { classe: "frise__bus-remplissage" })
    ]));

    let groupe = null;
    for (const entree of triees) {
        const annee = entree.debut.slice(0, 4);
        if (!groupe || groupe.dataset.annee !== annee) {
            groupe = creerElement("section", { classe: "frise__groupe", attributs: { "data-annee": annee, "aria-label": `Année ${annee}` } }, [
                creerElement("p", { classe: "frise__annee", texte: annee, attributs: { "aria-hidden": "true" } })
            ]);
            frise.append(groupe);
        }
        groupe.append(creerCarte(entree, codes.get(entree)));
    }
}


/* ==========================================================================
   4. FILTRES
   Le filtre actif est conservé dans l'adresse (#experience, #projet...)
   pour partager un lien déjà filtré.
   ========================================================================== */

/**
 * @param {HTMLElement} conteneur - zone des boutons
 * @param {HTMLElement} frise
 */
function afficherFiltres(conteneur, frise) {
    const options = [{ type: "tout", libelle: "Tout", nombre: PARCOURS.length }].concat(
        Object.entries(TYPES_PARCOURS).map(([type, { libelle }]) => ({
            type, libelle, nombre: PARCOURS.filter((entree) => entree.type === type).length
        })));

    for (const { type, libelle, nombre } of options) {
        const bouton = creerElement("button", {
            classe: "filtre",
            attributs: { type: "button", "data-filtre": type, "aria-pressed": "false" }
        }, [libelle, creerElement("span", { classe: "filtre__nombre", texte: deuxChiffres(nombre) })]);

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
 * Masque les cartes d'un autre type, puis les années devenues vides.
 * @param {HTMLElement} conteneur
 * @param {HTMLElement} frise
 * @param {string} type - "tout" ou une clé de TYPES_PARCOURS
 */
function appliquerFiltre(conteneur, frise, type) {
    for (const bouton of conteneur.querySelectorAll(".filtre")) {
        bouton.setAttribute("aria-pressed", String(bouton.dataset.filtre === type));
    }
    for (const carte of frise.querySelectorAll(".carte")) {
        carte.hidden = type !== "tout" && carte.dataset.type !== type;
    }
    for (const groupe of frise.querySelectorAll(".frise__groupe")) {
        groupe.hidden = !groupe.querySelector(".carte:not([hidden])");
    }
    mettreAJourSignal(frise);
}


/* ==========================================================================
   5. SIGNAL SUR LE BUS
   Le bus se remplit jusqu'au milieu de l'écran ; les cartes et les années
   au-dessus de ce point sont « actives » (nœud allumé).
   ========================================================================== */

/**
 * @param {HTMLElement} frise
 */
function mettreAJourSignal(frise) {
    const niveau = window.innerHeight * 0.55;
    const zone = frise.getBoundingClientRect();
    const progression = Math.min(1, Math.max(0, (niveau - zone.top) / zone.height));
    frise.style.setProperty("--progression-frise", progression.toFixed(4));

    for (const element of frise.querySelectorAll(".carte, .frise__groupe")) {
        if (element.hidden) continue;
        element.classList.toggle("est-active", element.getBoundingClientRect().top < niveau);
    }
}


/* ==========================================================================
   6. COMPÉTENCES
   ========================================================================== */

/**
 * Bargraphe de SEGMENTS_BARGRAPHE segments, qui s'allument l'un après
 * l'autre quand le domaine apparaît à l'écran.
 * @param {number} niveau - de 1 à NIVEAU_MAX
 * @returns {HTMLElement}
 */
function creerBargraphe(niveau) {
    const allumes = Math.round((niveau / NIVEAU_MAX) * SEGMENTS_BARGRAPHE);
    const bargraphe = creerElement("span", {
        classe: "bargraphe",
        attributs: { role: "img", "aria-label": `Niveau ${niveau} sur ${NIVEAU_MAX}` }
    });
    for (let rang = 1; rang <= SEGMENTS_BARGRAPHE; rang++) {
        bargraphe.append(creerElement("span", {
            classe: `bargraphe__segment${rang <= allumes ? " bargraphe__segment--allume" : ""}`,
            attributs: { style: `--rang: ${rang}` }
        }));
    }
    return bargraphe;
}

/**
 * @param {HTMLElement} conteneur
 */
function afficherCompetences(conteneur) {
    COMPETENCES.forEach(({ domaine, elements }, index) => {
        conteneur.append(creerElement("section", { classe: "domaine apparition", attributs: { style: `--delai: ${(index % 2) * 0.1}s` } }, [
            creerElement("header", { classe: "domaine__tete" }, [
                creerElement("h3", { classe: "domaine__titre", texte: domaine }),
                creerElement("span", { classe: "etiquette-mono", texte: `CMP-${deuxChiffres(index + 1)}` })
            ]),
            creerElement("ul", { classe: "domaine__liste" }, elements.map(({ nom, niveau }) =>
                creerElement("li", { classe: "competence" }, [
                    creerElement("span", { classe: "competence__nom", texte: nom }),
                    creerBargraphe(niveau),
                    creerElement("span", { classe: "competence__valeur", texte: `${niveau}/${NIVEAU_MAX}`, attributs: { "aria-hidden": "true" } })
                ])))
        ]));
    });
}


/* ==========================================================================
   7. INITIALISATION
   Chaque bloc n'est construit que si son conteneur existe dans la page.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const zone = (id) => document.getElementById(id);

    if (zone("cv-profil")) afficherProfil(zone("cv-profil"));

    const frise = zone("cv-frise");
    if (frise) {
        afficherFrise(frise);
        if (zone("cv-filtres")) afficherFiltres(zone("cv-filtres"), frise);
        surDefilement(() => mettreAJourSignal(frise));
    }

    if (zone("cv-competences")) afficherCompetences(zone("cv-competences"));
});
