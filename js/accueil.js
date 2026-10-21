/* ==========================================================================
   PAGE D'ACCUEIL — Clément Noël · v4
   --------------------------------------------------------------------------
   Construit la séquence de démarrage, les modules de navigation et la
   fiche technique à partir d'ACCUEIL et PROFIL (js/donnees.js).
   L'oscilloscope est géré par js/oscilloscope.js.

   SOMMAIRE
   1. Séquence de démarrage
   2. Modules de navigation
   3. Fiche technique et plaque signalétique
   4. Initialisation
   ========================================================================== */


/* ==========================================================================
   1. SÉQUENCE DE DÉMARRAGE
   Chaque ligne s'écrit lettre par lettre, puis son état s'affiche.
   ========================================================================== */

/**
 * @param {HTMLElement} liste - élément <ol>
 */
async function lancerDemarrage(liste) {
    const lignes = ACCUEIL.demarrage.map(({ texte, etat, actif }) => {
        const libelle = creerElement("span");
        const etiquetteEtat = creerElement("span", { classe: `demarrage__etat${actif ? " demarrage__etat--actif" : ""}` });
        const ligne = creerElement("li", { classe: "demarrage__ligne" }, [
            creerElement("span", { classe: "demarrage__invite", texte: ">", attributs: { "aria-hidden": "true" } }),
            libelle,
            creerElement("span", { classe: "demarrage__points", attributs: { "aria-hidden": "true" } }),
            etiquetteEtat
        ]);
        liste.append(ligne);
        return { ligne, libelle, etiquetteEtat, texte, etat };
    });

    if (animationsReduites()) {
        for (const { ligne, libelle, etiquetteEtat, texte, etat } of lignes) {
            ligne.classList.add("est-visible");
            libelle.textContent = texte;
            etiquetteEtat.textContent = etat;
        }
        return;
    }

    await attendre(DELAI_RIDEAU + 150);
    for (const { ligne, libelle, etiquetteEtat, texte, etat } of lignes) {
        ligne.classList.add("est-visible");
        for (let i = 1; i <= texte.length; i++) {
            libelle.textContent = texte.slice(0, i);
            await attendre(16);
        }
        await attendre(140);
        etiquetteEtat.textContent = etat;
        await attendre(80);
    }
}


/* ==========================================================================
   2. MODULES DE NAVIGATION
   ========================================================================== */

/**
 * Une carte par entrée d'ACCUEIL.modules. Un lien vers un PDF s'ouvre
 * dans un nouvel onglet.
 * @param {HTMLElement} conteneur
 */
function afficherModules(conteneur) {
    const nombreDocuments = Object.keys(DOCUMENTS).length;

    ACCUEIL.modules.forEach((module, index) => {
        const pdf = module.lien.endsWith(".pdf");
        conteneur.append(creerElement("a", {
            classe: "module apparition",
            attributs: {
                href: module.lien,
                target: pdf ? "_blank" : null,
                rel: pdf ? "noopener" : null,
                style: `--delai: ${index * 0.1}s`
            }
        }, [
            creerElement("span", { classe: "module__tete etiquette-mono" }, [
                creerElement("span", { texte: module.code }),
                creerElement("span", { classe: "led", attributs: { "aria-hidden": "true" } })
            ]),
            creerElement("span", { classe: "module__numero", texte: deuxChiffres(index + 1), attributs: { "aria-hidden": "true" } }),
            creerElement("h3", { classe: "module__titre", texte: module.titre }),
            creerElement("span", { classe: "module__description", texte: module.description.replace("{documents}", nombreDocuments) }),
            creerElement("span", { classe: "module__action" }, [
                creerElement("span", { texte: module.action }),
                creerElement("span", { classe: "module__fleche", texte: pdf ? "↓" : "→", attributs: { "aria-hidden": "true" } })
            ])
        ]));
    });
}


/* ==========================================================================
   3. FICHE TECHNIQUE ET PLAQUE SIGNALÉTIQUE
   ========================================================================== */

/**
 * @param {HTMLElement} conteneur
 */
function afficherFiche(conteneur) {
    const plaque = creerElement("figure", { classe: "plaque apparition" }, [
        creerElement("div", { classe: "plaque__photo" }, [
            creerElement("img", { attributs: { src: PROFIL.photo, alt: `Portrait de ${PROFIL.nom}`, width: 340, height: 425, loading: "lazy" } })
        ]),
        creerElement("figcaption", {}, [
            creerElement("dl", { classe: "plaque__legende" }, ACCUEIL.plaque.flatMap(({ cle, valeur }) => [
                creerElement("dt", { classe: "plaque__cle etiquette-mono", texte: cle }),
                creerElement("dd", { classe: "plaque__valeur", texte: valeur })
            ]))
        ])
    ]);

    const texte = creerElement("div", { classe: "apparition", attributs: { style: "--delai: 0.12s" } }, [
        creerElement("dl", { classe: "specs" }, ACCUEIL.fiche.map(({ cle, valeur }) =>
            creerElement("div", { classe: "specs__ligne" }, [
                creerElement("dt", { classe: "specs__cle etiquette-mono", texte: cle }),
                creerElement("dd", { classe: "specs__valeur", texte: valeur })
            ]))),
        creerElement("blockquote", { classe: "citation", texte: ACCUEIL.citation }),
        creerElement("div", { classe: "apropos" }, ACCUEIL.apropos.map((paragraphe) => creerElement("p", { texte: paragraphe })))
    ]);

    conteneur.append(plaque, texte);
}


/* ==========================================================================
   4. INITIALISATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const zone = (id) => document.getElementById(id);

    if (zone("demarrage")) lancerDemarrage(zone("demarrage"));
    if (zone("modules"))   afficherModules(zone("modules"));
    if (zone("fiche"))     afficherFiche(zone("fiche"));
});
