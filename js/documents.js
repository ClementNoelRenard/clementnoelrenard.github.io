/* ==========================================================================
   PAGE « DOCUMENTS » — nomenclature des PDF · v4
   --------------------------------------------------------------------------
   Affiche DOCUMENTS regroupés par CATEGORIES (js/donnees.js) sous forme de
   nomenclature (liste de pièces d'un plan) : repère, référence, désignation,
   catégorie, taille. Recherche instantanée et filtre par catégorie.

   SOMMAIRE
   1. Construction du tableau
   2. Taille des fichiers
   3. Recherche et filtres
   4. Initialisation
   ========================================================================== */


/* ==========================================================================
   1. CONSTRUCTION DU TABLEAU
   ========================================================================== */

/**
 * Crée les lignes du tableau : une ligne de titre par catégorie, puis une
 * ligne par document.
 * @param {HTMLElement} corps - élément <tbody>
 */
function afficherNomenclature(corps) {
    let repere = 0;

    CATEGORIES.forEach((categorie, indexCategorie) => {
        corps.append(creerElement("tr", { classe: "nomenclature__groupe", attributs: { "data-categorie": indexCategorie } }, [
            creerElement("th", { attributs: { colspan: 6, scope: "colgroup" } }, [
                categorie.titre,
                creerElement("span", { texte: `${deuxChiffres(categorie.documents.length)} pièces` })
            ])
        ]));

        for (const identifiant of categorie.documents) {
            const documentPdf = DOCUMENTS[identifiant];
            if (!documentPdf) {
                console.warn(`Document inconnu dans donnees.js : « ${identifiant} »`);
                continue;
            }
            repere += 1;
            const reference = referenceDocument(identifiant);
            const designation = creerElement("a", {
                texte: documentPdf.titre,
                attributs: { href: documentPdf.fichier, target: "_blank", rel: "noopener" }
            });

            const ligne = creerElement("tr", { classe: "nomenclature__ligne", attributs: { "data-categorie": indexCategorie } }, [
                creerElement("td", { classe: "col-rep", texte: deuxChiffres(repere) }),
                creerElement("td", { classe: "col-ref", texte: reference }),
                creerElement("td", { classe: "col-designation" }, [designation]),
                creerElement("td", { classe: "col-categorie etiquette-mono", texte: categorie.court }),
                creerElement("td", { classe: "col-taille", texte: "— Mo", attributs: { "data-fichier": documentPdf.fichier } }),
                creerElement("td", { classe: "col-action", texte: "Ouvrir ↗", attributs: { "aria-hidden": "true" } })
            ]);
            // Texte utilisé par la recherche (titre, référence, nom du fichier, catégorie)
            ligne.dataset.recherche = normaliser(`${documentPdf.titre} ${reference} ${documentPdf.fichier} ${categorie.titre}`);
            ligne.dataset.titre = documentPdf.titre;
            corps.append(ligne);
        }
    });
}


/* ==========================================================================
   2. TAILLE DES FICHIERS
   Demandée au serveur (requête HEAD, sans télécharger le fichier).
   En cas d'échec, la colonne affiche simplement « PDF ».
   ========================================================================== */

/** 1 234 567 octets → « 1,2 Mo ». */
function formaterTaille(octets) {
    if (octets >= 1048576) return `${(octets / 1048576).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
    return `${Math.round(octets / 1024)} ko`;
}

/**
 * @param {HTMLElement} corps
 */
function afficherTailles(corps) {
    for (const cellule of corps.querySelectorAll("[data-fichier]")) {
        fetch(cellule.dataset.fichier, { method: "HEAD" })
            .then((reponse) => {
                const taille = Number(reponse.headers.get("Content-Length"));
                cellule.textContent = reponse.ok && taille ? formaterTaille(taille) : "PDF";
            })
            .catch(() => { cellule.textContent = "PDF"; });
    }
}


/* ==========================================================================
   3. RECHERCHE ET FILTRES
   ========================================================================== */

/** Minuscules sans accents : « Compétence » et « competence » se trouvent. */
function normaliser(texte) {
    return texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Surligne la partie du titre qui correspond à la recherche.
 * @param {HTMLAnchorElement} lien
 * @param {string} titre
 * @param {string} recherche - déjà normalisée
 */
function surligner(lien, titre, recherche) {
    const position = recherche ? normaliser(titre).indexOf(recherche) : -1;
    if (position < 0) {
        lien.textContent = titre;
        return;
    }
    lien.replaceChildren(
        titre.slice(0, position),
        creerElement("mark", { texte: titre.slice(position, position + recherche.length) }),
        titre.slice(position + recherche.length)
    );
}

/**
 * Relie le champ de recherche et les boutons de catégorie au tableau.
 * @param {object} zones - { champ, filtres, corps, compte, vide }
 */
function activerRecherche({ champ, filtres, corps, compte, vide }) {
    let categorieActive = "toutes";

    function appliquer() {
        const recherche = normaliser(champ.value.trim());
        let visibles = 0;

        for (const ligne of corps.querySelectorAll(".nomenclature__ligne")) {
            const correspond = (categorieActive === "toutes" || ligne.dataset.categorie === categorieActive)
                            && ligne.dataset.recherche.includes(recherche);
            ligne.hidden = !correspond;
            if (correspond) visibles += 1;
            surligner(ligne.querySelector(".col-designation a"), ligne.dataset.titre, correspond ? recherche : "");
        }

        // Une catégorie sans ligne visible masque aussi son titre
        for (const groupe of corps.querySelectorAll(".nomenclature__groupe")) {
            groupe.hidden = !corps.querySelector(`.nomenclature__ligne[data-categorie="${groupe.dataset.categorie}"]:not([hidden])`);
        }

        compte.replaceChildren(creerElement("strong", { texte: deuxChiffres(visibles) }), ` référence${visibles > 1 ? "s" : ""}`);
        vide.hidden = visibles > 0;
    }

    // Boutons : « Toutes » + une catégorie par entrée de CATEGORIES
    const options = [{ valeur: "toutes", libelle: "Toutes" }]
        .concat(CATEGORIES.map((categorie, index) => ({ valeur: String(index), libelle: categorie.court })));

    for (const { valeur, libelle } of options) {
        const bouton = creerElement("button", {
            classe: "filtre",
            texte: libelle,
            attributs: { type: "button", "aria-pressed": String(valeur === categorieActive) }
        });
        bouton.addEventListener("click", () => {
            categorieActive = valeur;
            filtres.querySelectorAll(".filtre").forEach((autre) => autre.setAttribute("aria-pressed", String(autre === bouton)));
            appliquer();
        });
        filtres.append(bouton);
    }

    champ.addEventListener("input", appliquer);

    // Touche « / » : place le curseur dans la recherche (comme sur GitHub)
    document.addEventListener("keydown", (evenement) => {
        if (evenement.key === "/" && document.activeElement !== champ) {
            evenement.preventDefault();
            champ.focus();
        }
    });

    appliquer();
}


/* ==========================================================================
   4. INITIALISATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const corps = document.getElementById("doc-lignes");
    if (!corps) return;

    afficherNomenclature(corps);
    afficherTailles(corps);
    activerRecherche({
        champ:   document.getElementById("doc-recherche"),
        filtres: document.getElementById("doc-filtres"),
        corps,
        compte:  document.getElementById("doc-compte"),
        vide:    document.getElementById("doc-vide")
    });
});
