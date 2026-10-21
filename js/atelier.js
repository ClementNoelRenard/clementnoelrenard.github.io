/* ==========================================================================
   PAGE « ATELIER » — loisirs et ressources · v4
   --------------------------------------------------------------------------
   Construit les cartes de centres d'intérêt (INTERETS) et la liste des
   ressources (SITE.ressources) depuis js/donnees.js.
   ========================================================================== */

/**
 * Une carte par centre d'intérêt.
 * @param {HTMLElement} conteneur
 */
function afficherAteliers(conteneur) {
    INTERETS.forEach(({ titre, texte }, index) => {
        conteneur.append(creerElement("article", { classe: "atelier apparition", attributs: { style: `--delai: ${(index % 3) * 0.08}s` } }, [
            creerElement("p", { classe: "atelier__code etiquette-mono" }, [
                creerElement("span", { texte: `ATL-${deuxChiffres(index + 1)}` }),
                creerElement("span", { texte: "◆", attributs: { "aria-hidden": "true" } })
            ]),
            creerElement("h3", { classe: "atelier__titre", texte: titre }),
            creerElement("p", { classe: "atelier__texte", texte })
        ]));
    });
}

/**
 * Liste de liens externes.
 * @param {HTMLElement} conteneur
 */
function afficherRessources(conteneur) {
    for (const { libelle, lien } of SITE.ressources) {
        conteneur.append(creerElement("a", { attributs: { href: lien, target: "_blank", rel: "noopener" } }, [
            creerElement("span", { texte: libelle }),
            creerElement("span", { texte: "↗", attributs: { "aria-hidden": "true" } })
        ]));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ateliers = document.getElementById("ateliers");
    const ressources = document.getElementById("ressources");
    if (ateliers) afficherAteliers(ateliers);
    if (ressources) afficherRessources(ressources);
});
