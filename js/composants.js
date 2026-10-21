/* ==========================================================================
   COMPOSANTS COMMUNS — Clément Noël · v4
   --------------------------------------------------------------------------
   Fonctions partagées par toutes les pages : en-tête et menu hamburger,
   pied de page « cartouche », transitions entre pages, animations au
   défilement, compteurs, effet de décodage, listes de documents.

   Utilisation dans une page HTML :
     <body data-page="accueil">              → identifiant de la page (voir SITE.navigation)
     <header id="en-tete"></header>          → en-tête + menu générés
     <footer id="pied-de-page"></footer>     → cartouche généré
     class="apparition"                      → l'élément apparaît au défilement
     data-decodage                           → le texte se « décode » en apparaissant
     data-composant="nom"                    → bloc rempli automatiquement (voir § 9)

   Scripts à charger dans cet ordre (avec defer) :
     js/donnees.js, js/composants.js, puis le script propre à la page.

   SOMMAIRE
   1. Utilitaires
   2. Dates et durées
   3. Données calculées (chiffres clés, références des documents)
   4. En-tête, horloge et menu hamburger
   5. Pied de page (cartouche de plan)
   6. Animations : apparitions, compteurs, décodage
   7. Défilement : progression, barre d'état
   8. Transitions entre les pages
   9. Composants automatiques [data-composant]
   10. Initialisation
   ========================================================================== */


/* ==========================================================================
   1. UTILITAIRES
   ========================================================================== */

/**
 * Crée un élément HTML en une seule instruction.
 * @param {string} balise  - nom de la balise ("a", "li", "section"...)
 * @param {object} options - { classe, texte, attributs: { href: "..." } }
 *                           un attribut null, undefined ou false est ignoré
 * @param {Array}  enfants - éléments ou textes à placer à l'intérieur
 * @returns {HTMLElement}
 */
function creerElement(balise, options = {}, enfants = []) {
    const element = document.createElement(balise);

    if (options.classe) element.className = options.classe;
    if (options.texte !== undefined) element.textContent = options.texte;

    for (const [nom, valeur] of Object.entries(options.attributs || {})) {
        if (valeur !== undefined && valeur !== null && valeur !== false) {
            element.setAttribute(nom, valeur);
        }
    }

    for (const enfant of enfants) {
        if (enfant !== null && enfant !== undefined && enfant !== false) element.append(enfant);
    }
    return element;
}

/** Complète un nombre avec des zéros : deuxChiffres(3) → "03". */
function deuxChiffres(nombre) {
    return String(nombre).padStart(2, "0");
}

/** Vrai si l'utilisateur a demandé à limiter les animations (réglage système). */
function animationsReduites() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Promesse résolue après « ms » millisecondes (pour enchaîner des animations). */
function attendre(ms) {
    return new Promise((resoudre) => setTimeout(resoudre, ms));
}

/** Durée (ms) laissée au rideau d'ouverture avant de lancer les animations. */
const DELAI_RIDEAU = 450;


/* ==========================================================================
   2. DATES ET DURÉES
   ========================================================================== */
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
              "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** "AAAA-MM" → Date (1er du mois). */
function lireDate(texte) {
    const [annee, mois] = texte.split("-").map(Number);
    return new Date(annee, (mois || 1) - 1, 1);
}

/** "2024-04" → « avr. 2024 ». */
function formaterDate(texte) {
    const date = lireDate(texte);
    return `${MOIS[date.getMonth()]} ${date.getFullYear()}`;
}

/** « avr. 2024 – juil. 2024 » ou « mars 2025 – aujourd'hui ». */
function formaterPeriode(debut, fin) {
    return `${formaterDate(debut)} – ${fin ? formaterDate(fin) : "aujourd'hui"}`;
}

/** Nombre de mois entre deux dates "AAAA-MM", bornes incluses (fin null = aujourd'hui). */
function compterMois(debut, fin) {
    const dateDebut = lireDate(debut);
    const dateFin = fin ? lireDate(fin) : new Date();
    return (dateFin.getFullYear() - dateDebut.getFullYear()) * 12
         + (dateFin.getMonth() - dateDebut.getMonth()) + 1;
}

/** Durée lisible : « 4 mois », « 1 an 5 mois », « 3 ans ». */
function calculerDuree(debut, fin) {
    const total = compterMois(debut, fin);
    const annees = Math.floor(total / 12);
    const mois = total % 12;
    const morceaux = [];
    if (annees > 0) morceaux.push(`${annees} an${annees > 1 ? "s" : ""}`);
    if (mois > 0) morceaux.push(`${mois} mois`);
    return morceaux.join(" ");
}


/* ==========================================================================
   3. DONNÉES CALCULÉES
   ========================================================================== */

/**
 * Chiffres clés calculés depuis PARCOURS et DOCUMENTS (jamais écrits en dur).
 * @returns {{valeur: number, libelle: string}[]}
 */
function calculerChiffres() {
    const experiences = PARCOURS.filter((e) => e.type === "experience" && !e.aVenir);
    const moisEnEntreprise = experiences.reduce((total, e) => total + compterMois(e.debut, e.fin), 0);

    return [
        { valeur: Math.floor(moisEnEntreprise / 12),                 libelle: "ans en entreprise" },
        { valeur: experiences.length,                                libelle: "entreprises" },
        { valeur: PARCOURS.filter((e) => e.type === "projet").length, libelle: "projets techniques" },
        { valeur: Object.keys(DOCUMENTS).length,                     libelle: "documents PDF" }
    ];
}

/** Préfixe de référence selon le sous-dossier de pdfs/. */
const PREFIXES_DOCUMENTS = { cv: "CV", stages: "STG", projets: "PRJ", competences: "CMP" };

let referencesDocuments = null;

/**
 * Référence de nomenclature d'un document : « STG-03 », « CMP-11 »...
 * Numérotation dans l'ordre de DOCUMENTS, par dossier.
 * @param {string} identifiant
 * @returns {string}
 */
function referenceDocument(identifiant) {
    if (!referencesDocuments) {
        referencesDocuments = {};
        const compteurs = {};
        for (const [id, { fichier }] of Object.entries(DOCUMENTS)) {
            const dossier = fichier.split("/")[1];
            const prefixe = PREFIXES_DOCUMENTS[dossier] || "DOC";
            compteurs[prefixe] = (compteurs[prefixe] || 0) + 1;
            referencesDocuments[id] = `${prefixe}-${deuxChiffres(compteurs[prefixe])}`;
        }
    }
    return referencesDocuments[identifiant] || "DOC-??";
}

/**
 * Liste de liens PDF : référence, titre, « PDF ↗ ».
 * Un identifiant inconnu est signalé dans la console.
 * @param {string[]} identifiants - clés de DOCUMENTS
 * @returns {HTMLElement} <ul>
 */
function creerListeDocuments(identifiants) {
    const liste = creerElement("ul", { classe: "liste-docs" });
    for (const identifiant of identifiants) {
        const documentPdf = DOCUMENTS[identifiant];
        if (!documentPdf) {
            console.warn(`Document inconnu dans donnees.js : « ${identifiant} »`);
            continue;
        }
        liste.append(creerElement("li", {}, [
            creerElement("a", { attributs: { href: documentPdf.fichier, target: "_blank", rel: "noopener" } }, [
                creerElement("span", { classe: "liste-docs__ref", texte: referenceDocument(identifiant) }),
                creerElement("span", { texte: documentPdf.titre }),
                creerElement("span", { classe: "liste-docs__action", texte: "PDF ↗" })
            ])
        ]));
    }
    return liste;
}


/* ==========================================================================
   4. EN-TÊTE, HORLOGE ET MENU HAMBURGER
   ========================================================================== */

/** Remplit <header id="en-tete"> : logo, statut, horloge, bouton menu, menu. */
function afficherEnTete() {
    const conteneur = document.getElementById("en-tete");
    if (!conteneur) return;
    conteneur.classList.add("en-tete");

    const horloge = creerElement("span", { classe: "en-tete__horloge", attributs: { "aria-hidden": "true" } });
    const bouton = creerElement("button", {
        classe: "menu-bouton",
        attributs: { type: "button", "aria-expanded": "false", "aria-controls": "menu" }
    }, [
        creerElement("span", { classe: "menu-bouton__barres", attributs: { "aria-hidden": "true" } },
                     [creerElement("span"), creerElement("span"), creerElement("span")]),
        creerElement("span", { classe: "menu-bouton__texte", texte: "Menu" })
    ]);

    conteneur.append(
        creerElement("div", { classe: "conteneur en-tete__barre" }, [
            creerElement("a", { classe: "logo", attributs: { href: "index.html", "aria-label": `${SITE.auteur} — accueil` } }, [
                creerElement("span", { classe: "logo__bloc", texte: "CN", attributs: { "aria-hidden": "true" } }),
                creerElement("span", { classe: "logo__texte" }, [
                    SITE.auteur,
                    creerElement("small", { texte: "Automatisme // GEII" })
                ])
            ]),
            creerElement("p", { classe: "en-tete__statut" }, [
                creerElement("span", { classe: "led led--vert led--clignote", attributs: { "aria-hidden": "true" } }),
                creerElement("strong", { texte: "Run" }),
                creerElement("span", { classe: "en-tete__statut-texte", texte: SITE.statut })
            ]),
            horloge,
            bouton
        ]),
        creerElement("div", { classe: "en-tete__progression", attributs: { "aria-hidden": "true" } })
    );

    // Le menu est placé après l'en-tête, pas dedans : le flou d'arrière-plan
    // de l'en-tête enfermerait un élément « position: fixed » dans ses 64 px.
    const menu = construireMenu();
    conteneur.after(menu);

    demarrerHorloge(horloge);
    activerMenu(bouton, menu);
}

/** Affiche l'heure de Paris, mise à jour chaque seconde. */
function demarrerHorloge(element) {
    const format = new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Paris"
    });
    const mettreAJour = () => { element.textContent = format.format(new Date()); };
    mettreAJour();
    setInterval(mettreAJour, 1000);
}

/**
 * Construit le menu plein écran depuis SITE.navigation.
 * Le lien de la page courante reçoit aria-current="page".
 * @returns {HTMLElement}
 */
function construireMenu() {
    const pageActive = document.body.dataset.page;

    const elements = SITE.navigation.map((entree, index) =>
        creerElement("li", { classe: "menu__element" }, [
            creerElement("a", {
                classe: "menu__lien",
                attributs: {
                    href: entree.lien,
                    "aria-current": entree.id === pageActive ? "page" : null,
                    style: `--i: ${index}`
                }
            }, [
                creerElement("span", { classe: "menu__code", texte: deuxChiffres(index + 1) }),
                creerElement("span", { classe: "menu__libelle", texte: entree.libelle }),
                creerElement("span", { classe: "menu__description", texte: entree.description })
            ])
        ]));

    return creerElement("div", {
        classe: "menu",
        attributs: { id: "menu", role: "dialog", "aria-modal": "true", "aria-label": "Menu principal", inert: "" }
    }, [
        creerElement("div", { classe: "conteneur menu__interieur" }, [
            creerElement("p", { classe: "menu__entete" }, [
                creerElement("span", { texte: "// Navigation" }),
                creerElement("span", { texte: `${SITE.navigation.length} modules` })
            ]),
            creerElement("nav", { attributs: { "aria-label": "Navigation principale" } }, [
                creerElement("ol", { classe: "menu__liste" }, elements)
            ]),
            creerElement("div", { classe: "menu__pied" }, [
                creerElement("a", { texte: SITE.email, attributs: { href: `mailto:${SITE.email}` } }),
                creerElement("div", { classe: "menu__pied-liens" }, [
                    ...SITE.liens.map(({ libelle, lien }) =>
                        creerElement("a", { texte: libelle, attributs: { href: lien, target: "_blank", rel: "noopener" } })),
                    creerElement("a", { texte: "CV.pdf ↓", attributs: { href: SITE.cv, target: "_blank", rel: "noopener" } })
                ])
            ])
        ]),
        creerElement("div", { classe: "menu__hachures", attributs: { "aria-hidden": "true" } })
    ]);
}

/**
 * Ouverture / fermeture du menu : bouton, touche Échap, lien e-mail.
 * Quand le menu est ouvert, le reste de la page est rendu inerte
 * (ni cliquable ni atteignable au clavier).
 */
function activerMenu(bouton, menu) {
    const racine = document.documentElement;
    const texte = bouton.querySelector(".menu-bouton__texte");
    const zonesDerriere = [document.querySelector("main"), document.getElementById("pied-de-page")].filter(Boolean);

    function basculer(ouvrir) {
        racine.classList.toggle("menu-ouvert", ouvrir);
        bouton.setAttribute("aria-expanded", String(ouvrir));
        texte.textContent = ouvrir ? "Fermer" : "Menu";
        menu.inert = !ouvrir;
        zonesDerriere.forEach((zone) => { zone.inert = ouvrir; });
        if (ouvrir) menu.querySelector(".menu__lien").focus({ preventScroll: true });
    }

    bouton.addEventListener("click", () => basculer(!racine.classList.contains("menu-ouvert")));

    document.addEventListener("keydown", (evenement) => {
        if (evenement.key === "Escape" && racine.classList.contains("menu-ouvert")) {
            basculer(false);
            bouton.focus();
        }
    });

    // Les autres liens changent de page : le rideau de transition prend le relais
    menu.addEventListener("click", (evenement) => {
        const lien = evenement.target.closest("a");
        if (lien && lien.getAttribute("href").startsWith("mailto:")) basculer(false);
    });
}


/* ==========================================================================
   5. PIED DE PAGE : CARTOUCHE DE PLAN
   ========================================================================== */

/** Remplit <footer id="pied-de-page"> avec un cartouche de dessin technique. */
function afficherPiedDePage() {
    const conteneur = document.getElementById("pied-de-page");
    if (!conteneur) return;
    conteneur.classList.add("pied");

    const pages = SITE.navigation.filter((entree) => !entree.lien.startsWith("mailto:"));
    const index = pages.findIndex((entree) => entree.id === document.body.dataset.page);
    const designation = index >= 0 ? pages[index].libelle : (document.body.dataset.titre || document.title);

    const cases = [
        { cle: "Désignation", valeur: designation, classe: "cartouche__case--titre" },
        { cle: "Dessiné par", valeur: SITE.auteur },
        { cle: "Date",        valeur: String(SITE.annee) },
        { cle: "Révision",    valeur: SITE.version },
        { cle: "Folio",       valeur: index >= 0 ? `${deuxChiffres(index + 1)}/${deuxChiffres(pages.length)}` : "—" },
        { cle: "Échelle",     valeur: "1:1" }
    ];

    conteneur.append(
        creerElement("div", { classe: "hachures", attributs: { "aria-hidden": "true" } }),
        creerElement("div", { classe: "conteneur" }, [
            creerElement("dl", { classe: "cartouche" }, cases.map(({ cle, valeur, classe }) =>
                creerElement("div", { classe: `cartouche__case ${classe || ""}` }, [
                    creerElement("dt", { classe: "cartouche__cle etiquette-mono", texte: cle }),
                    creerElement("dd", { classe: "cartouche__valeur", texte: valeur })
                ]))),
            creerElement("div", { classe: "pied__bas" }, [
                creerElement("p", { texte: `© ${SITE.annee} ${SITE.auteur} — conçu et câblé à la main.` }),
                creerElement("nav", { classe: "pied__liens", attributs: { "aria-label": "Profils en ligne" } },
                    SITE.liens.map(({ libelle, lien }) =>
                        creerElement("a", { texte: libelle, attributs: { href: lien, target: "_blank", rel: "noopener" } }))),
                // Chemin complet : reste sur la page même avec <base href="/"> (page 404)
                creerElement("a", { classe: "pied__haut", texte: "Haut de page ↑", attributs: { href: `${location.pathname}#contenu` } })
            ])
        ])
    );
}


/* ==========================================================================
   6. ANIMATIONS : APPARITIONS, COMPTEURS, DÉCODAGE
   ========================================================================== */
let observateurApparitions = null;

/**
 * Surveille les éléments .apparition pas encore suivis : ils reçoivent
 * « est-visible » en entrant dans l'écran. Peut être rappelée après
 * l'ajout de contenu (ex. filtre de la frise).
 * @param {ParentNode} [racine=document]
 */
function observerApparitions(racine = document) {
    const elements = racine.querySelectorAll(".apparition:not(.est-observe)");

    if (animationsReduites() || !("IntersectionObserver" in window)) {
        elements.forEach(rendreVisible);
        return;
    }

    observateurApparitions ??= new IntersectionObserver((entrees) => {
        for (const entree of entrees) {
            if (entree.isIntersecting) {
                observateurApparitions.unobserve(entree.target);
                rendreVisible(entree.target);
            }
        }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    elements.forEach((element) => {
        element.classList.add("est-observe");
        observateurApparitions.observe(element);
    });
}

/** Affiche un élément et lance ses compteurs et décodages. */
function rendreVisible(element) {
    element.classList.add("est-observe", "est-visible");
    const cibles = [element, ...element.querySelectorAll("[data-compteur], [data-decodage]")];
    for (const cible of cibles) {
        if (cible.hasAttribute("data-compteur")) animerCompteur(cible);
        if (cible.hasAttribute("data-decodage")) decoderTexte(cible);
    }
}

/**
 * Fait défiler un nombre de 0 jusqu'à data-compteur.
 * data-chiffres : nombre de chiffres affichés (zéros à gauche).
 */
function animerCompteur(element) {
    const cible = Number(element.dataset.compteur);
    const chiffres = Number(element.dataset.chiffres) || String(cible).length;
    const afficher = (valeur) => { element.textContent = String(valeur).padStart(chiffres, "0"); };

    if (animationsReduites()) {
        afficher(cible);
        return;
    }

    const duree = 1400;
    const debut = performance.now();
    function etape(maintenant) {
        const avancement = Math.min(1, (maintenant - debut) / duree);
        afficher(Math.round(cible * (1 - Math.pow(1 - avancement, 3))));   // ralentit à l'arrivée
        if (avancement < 1) requestAnimationFrame(etape);
    }
    requestAnimationFrame(etape);
}

const CARACTERES_DECODAGE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>_+=";

/**
 * Effet « décodage » : les lettres défilent au hasard puis se fixent
 * une à une, en 0,65 s. À réserver à des titres courts sans balise interne.
 */
function decoderTexte(element) {
    if (element.dataset.decode === "fait" || animationsReduites()) return;
    element.dataset.decode = "fait";

    const final = element.textContent;
    const duree = 650;
    const debut = performance.now();

    function etape(maintenant) {
        const avancement = Math.min(1, (maintenant - debut) / duree);
        const fixes = Math.floor(avancement * final.length);
        let texte = final.slice(0, fixes);
        for (let i = fixes; i < final.length; i++) {
            texte += final[i] === " " ? " "
                   : CARACTERES_DECODAGE[Math.floor(Math.random() * CARACTERES_DECODAGE.length)];
        }
        element.textContent = texte;
        if (avancement < 1) requestAnimationFrame(etape);
        else element.textContent = final;
    }
    requestAnimationFrame(etape);
}


/* ==========================================================================
   7. DÉFILEMENT : PROGRESSION, BARRE D'ÉTAT
   ========================================================================== */
const ecouteursDefilement = [];

/**
 * Exécute une fonction à chaque défilement ou redimensionnement
 * (au plus une fois par image affichée).
 * @param {Function} fonction
 */
function surDefilement(fonction) {
    ecouteursDefilement.push(fonction);
    fonction();
}

/** Progression sous l'en-tête et barre d'état « X / Y / % » (souris). */
function activerSuiviDefilement() {
    const enTete = document.getElementById("en-tete");
    const valeurs = { x: creerElement("b", { texte: "0000" }), y: creerElement("b", { texte: "0000" }), pourcentage: creerElement("b", { texte: "000" }) };
    document.body.append(creerElement("div", { classe: "barre-etat", attributs: { "aria-hidden": "true" } }, [
        creerElement("span", {}, ["X ", valeurs.x]),
        creerElement("span", {}, ["Y ", valeurs.y]),
        creerElement("span", {}, ["DÉF. ", valeurs.pourcentage, " %"])
    ]));

    let enAttente = false;
    const planifier = () => {
        if (enAttente) return;
        enAttente = true;
        requestAnimationFrame(() => {
            enAttente = false;
            const maximum = document.documentElement.scrollHeight - window.innerHeight;
            const progression = maximum > 0 ? Math.min(1, window.scrollY / maximum) : 0;
            enTete?.style.setProperty("--progression", progression.toFixed(4));
            valeurs.pourcentage.textContent = String(Math.round(progression * 100)).padStart(3, "0");
            ecouteursDefilement.forEach((fonction) => fonction());
        });
    };

    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", planifier, { passive: true });
    window.addEventListener("pointermove", (evenement) => {
        valeurs.x.textContent = String(Math.round(evenement.clientX)).padStart(4, "0");
        valeurs.y.textContent = String(Math.round(evenement.clientY + window.scrollY)).padStart(4, "0");
    }, { passive: true });
    planifier();
}


/* ==========================================================================
   8. TRANSITIONS ENTRE LES PAGES
   Un clic sur un lien interne fait redescendre le rideau (style.css § 7),
   puis la page suivante s'ouvre.
   ========================================================================== */
function activerTransitions() {
    if (animationsReduites()) return;

    document.addEventListener("click", (evenement) => {
        const lien = evenement.target.closest("a[href]");
        if (!lien || evenement.defaultPrevented || evenement.button !== 0
            || evenement.metaKey || evenement.ctrlKey || evenement.shiftKey || evenement.altKey
            || lien.target === "_blank" || lien.hasAttribute("download")) return;

        const url = new URL(lien.href, location.href);
        const pageInterne = url.origin === location.origin
                         && (url.pathname.endsWith(".html") || url.pathname.endsWith("/"));
        const memePage = url.pathname === location.pathname;
        if (!pageInterne || memePage) return;

        evenement.preventDefault();
        document.documentElement.classList.add("est-en-sortie");
        setTimeout(() => { location.href = url.href; }, 380);
    });

    // Retour arrière : la page revient du cache avec le rideau baissé
    window.addEventListener("pageshow", (evenement) => {
        if (evenement.persisted) document.documentElement.classList.remove("est-en-sortie");
    });
}


/* ==========================================================================
   9. COMPOSANTS AUTOMATIQUES [data-composant="nom"]
   Pour en ajouter un : écrire sa fonction puis la déclarer dans COMPOSANTS.
   ========================================================================== */

/** <a data-composant="email"> → lien mailto vers SITE.email. */
function afficherEmail(lien) {
    lien.href = `mailto:${SITE.email}`;
    if (!lien.textContent.trim()) lien.textContent = SITE.email;
}

/** <a data-composant="cv"> → lien vers le CV PDF. */
function afficherLienCv(lien) {
    lien.href = SITE.cv;
    lien.target = "_blank";
    lien.rel = "noopener";
}

/** <div data-composant="liens"> → boutons vers les profils en ligne. */
function afficherLiens(conteneur) {
    conteneur.classList.add("groupe-boutons");
    for (const { libelle, lien } of SITE.liens) {
        conteneur.append(creerElement("a", { classe: "bouton bouton--discret", attributs: { href: lien, target: "_blank", rel: "noopener" } }, [
            libelle,
            creerElement("span", { classe: "bouton__fleche", texte: "↗", attributs: { "aria-hidden": "true" } })
        ]));
    }
}

/** <div data-composant="bandeau"> → bandeau défilant (ACCUEIL.bandeau). */
function afficherBandeau(conteneur) {
    conteneur.classList.add("bandeau");
    const groupe = (copie) => creerElement("ul", {
        classe: "bandeau__groupe",
        attributs: { "aria-hidden": copie ? "true" : null }
    }, ACCUEIL.bandeau.map((texte) => creerElement("li", { classe: "bandeau__element", texte })));

    // Deux copies côte à côte : la piste glisse de 50 % puis recommence, sans coupure
    conteneur.append(creerElement("div", { classe: "bandeau__piste" }, [groupe(false), groupe(true)]));
}

/** <div data-composant="chiffres"> → afficheurs numériques animés. */
function afficherChiffres(conteneur) {
    conteneur.classList.add("chiffres");
    calculerChiffres().forEach(({ valeur, libelle }, index) => {
        const chiffres = Math.max(2, String(valeur).length);
        conteneur.append(creerElement("div", { classe: "afficheur apparition", attributs: { style: `--delai: ${index * 0.08}s` } }, [
            creerElement("span", { classe: "afficheur__ecran", attributs: { "aria-hidden": "true" } }, [
                creerElement("span", { classe: "afficheur__fantome", texte: "8".repeat(chiffres) }),
                creerElement("span", { texte: "0".repeat(chiffres), attributs: { "data-compteur": valeur, "data-chiffres": chiffres } })
            ]),
            creerElement("span", { classe: "afficheur__libelle etiquette-mono" }, [
                creerElement("span", { classe: "sr", texte: `${valeur} ` }),
                libelle
            ])
        ]));
    });
}

/** <ul data-composant="interets"> → étiquettes des centres d'intérêt. */
function afficherInterets(liste) {
    liste.classList.add("etiquettes", "etiquettes--grandes");
    for (const { titre } of INTERETS) liste.append(creerElement("li", { classe: "etiquette", texte: titre }));
}

const COMPOSANTS = {
    email:    afficherEmail,
    cv:       afficherLienCv,
    liens:    afficherLiens,
    bandeau:  afficherBandeau,
    chiffres: afficherChiffres,
    interets: afficherInterets
};


/* ==========================================================================
   10. INITIALISATION
   ========================================================================== */
function initialiserComposants() {
    afficherEnTete();
    afficherPiedDePage();

    for (const element of document.querySelectorAll("[data-composant]")) {
        const construire = COMPOSANTS[element.dataset.composant];
        if (construire) construire(element);
        else console.warn(`Composant inconnu : « ${element.dataset.composant} »`);
    }

    activerTransitions();
    activerSuiviDefilement();

    // Les scripts de page ont construit leur contenu pendant ce même événement :
    // on attend la fin du rideau d'ouverture pour lancer les apparitions.
    setTimeout(() => observerApparitions(), animationsReduites() ? 0 : DELAI_RIDEAU);
}

document.addEventListener("DOMContentLoaded", initialiserComposants);
