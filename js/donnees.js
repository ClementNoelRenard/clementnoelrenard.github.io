/* ==========================================================================
   DONNÉES DU SITE — Clément Noël
   --------------------------------------------------------------------------
   C'est le SEUL fichier à modifier pour mettre à jour le contenu du site :
   les pages (accueil, parcours, documents) sont construites automatiquement
   à partir des objets ci-dessous par js/composants.js et js/parcours.js.

   SOMMAIRE
   1. SITE         : informations générales, navigation, liens
   2. DOCUMENTS    : tous les PDF du site (une entrée = un fichier)
   3. CATEGORIES   : regroupement des documents sur la page « Documents »
   4. PROFIL       : présentation utilisée par la page « Parcours »
   5. PARCOURS     : expériences, formations et projets (frise chronologique)
   6. COMPETENCES  : compétences techniques notées sur 5
   7. INTERETS     : centres d'intérêt

   AJOUTER UN DOCUMENT
   1. Déposer le PDF dans pdfs/<categorie>/ (nommage : Annee_Organisme_Type.pdf)
   2. Ajouter une entrée dans DOCUMENTS ci-dessous :
        "identifiant-unique": { titre: "...", fichier: "pdfs/..." },
   3. Citer son identifiant dans CATEGORIES et/ou dans PARCOURS
   4. (optionnel) python outils/preparer_pdfs.py  → ajoute titre et auteur
      dans les propriétés du PDF et vérifie qu'aucun lien n'est cassé.
   ========================================================================== */


/* ==========================================================================
   1. SITE
   ========================================================================== */
const SITE = {
    auteur:  "Clément Noël",
    version: "v3.0",
    annee:   2026,
    email:   "clementnoelrenard2001@ik.me",
    cv:      "pdfs/cv/CV_Clement-Noel.pdf",

    /* Menu principal : « id » doit correspondre à <body data-page="..."> */
    navigation: [
        { id: "accueil",   libelle: "Accueil",   lien: "index.html" },
        { id: "parcours",  libelle: "Parcours",  lien: "parcours.html" },
        { id: "documents", libelle: "Documents", lien: "archive.html" },
        { id: "loisirs",   libelle: "Loisirs",   lien: "loisir.html" },
        { id: "contact",   libelle: "Contact",   lien: "mailto:clementnoelrenard2001@ik.me" }
    ],

    /* Liens externes (page d'accueil et page parcours) */
    liens: [
        { libelle: "LinkedIn", lien: "https://www.linkedin.com/in/clement-noel-renard/" },
        { libelle: "Codeberg", lien: "https://codeberg.org/ClementNoelRenard" },
        { libelle: "GitHub",   lien: "https://github.com/ClementNoelRenard" }
    ],

    /* Ressources partagées sur la page d'accueil */
    ressources: [
        { libelle: "Logiciels alternatifs européens", lien: "https://european-alternatives.eu/alternatives-to" },
        { libelle: "Distributions Linux (DistroWatch)", lien: "https://distrowatch.com/" }
    ]
};


/* ==========================================================================
   2. DOCUMENTS
   Chaque entrée s'écrit sur une ligne :  "id": { titre: "...", fichier: "..." },
   (format lu aussi par outils/preparer_pdfs.py : garder les guillemets doubles)
   ========================================================================== */
const DOCUMENTS = {
    /* --- CV --- */
    "cv":                     { titre: "Curriculum vitæ — Clément Noël", fichier: "pdfs/cv/CV_Clement-Noel.pdf" },

    /* --- Stages et alternance --- */
    "ineo-rapport-2026":      { titre: "Rapport d'alternance 2026 — INEO Aquitaine", fichier: "pdfs/stages/2026_INEO-Aquitaine_Rapport-alternance.pdf" },
    "ineo-soutenance-2026":   { titre: "Support de soutenance d'alternance 2026 — INEO Aquitaine", fichier: "pdfs/stages/2026_INEO-Aquitaine_Soutenance-alternance.pdf" },
    "ineo-rapport-2025":      { titre: "Rapport de stage 2025 — INEO Aquitaine", fichier: "pdfs/stages/2025_INEO-Aquitaine_Rapport-stage.pdf" },
    "ineo-soutenance-2025":   { titre: "Support de soutenance de stage 2025 — INEO Aquitaine", fichier: "pdfs/stages/2025_INEO-Aquitaine_Soutenance-stage.pdf" },
    "isp-rapport-2024":       { titre: "Rapport de stage 2024 — ISP Aquitaine", fichier: "pdfs/stages/2024_ISP-Aquitaine_Rapport-stage.pdf" },
    "isp-soutenance-2024":    { titre: "Support de soutenance de stage 2024 — ISP Aquitaine", fichier: "pdfs/stages/2024_ISP-Aquitaine_Soutenance-stage.pdf" },
    "lacosse-rapport-2021":   { titre: "Rapport de stage BTS CRSA — Lacosse Emballage", fichier: "pdfs/stages/2021_Lacosse-Emballage_Rapport-stage.pdf" },

    /* --- Projets --- */
    "crsa-soutenance":        { titre: "Projet BTS CRSA — Machine de tri de ronds de serviette", fichier: "pdfs/projets/BTS-CRSA_Tri-ronds-de-serviette_Soutenance.pdf" },
    "ptut-cave-a-vin":        { titre: "Projet tuteuré — Cave à vin", fichier: "pdfs/projets/PTUT_Cave-a-vin_Rapport.pdf" },
    "aop-liaison-sans-fil":   { titre: "AOP S4 — Liaison sans fil (module NRF24L01)", fichier: "pdfs/projets/AOP-S4_Liaison-sans-fil_Soutenance.pdf" },
    "mugochaud-rapport":      { titre: "SAE S4 MugOchaud — Rapport de projet", fichier: "pdfs/projets/SAE-S4_MugOchaud_Rapport.pdf" },
    "mugochaud-ddc":          { titre: "SAE S4 MugOchaud — Dossier de conception", fichier: "pdfs/projets/SAE-S4_MugOchaud_Dossier-de-conception.pdf" },
    "mugochaud-ddf":          { titre: "SAE S4 MugOchaud — Dossier de fabrication", fichier: "pdfs/projets/SAE-S4_MugOchaud_Dossier-de-fabrication.pdf" },
    "rms-cdc":                { titre: "SAE S3 Robot Mini-Sumo — Cahier des charges", fichier: "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Cahier-des-charges.pdf" },
    "rms-ddc":                { titre: "SAE S3 Robot Mini-Sumo — Dossier de conception détaillée", fichier: "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Dossier-de-conception.pdf" },
    "rms-ddf":                { titre: "SAE S3 Robot Mini-Sumo — Dossier de fabrication", fichier: "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Dossier-de-fabrication.pdf" },

    /* --- Compétences du BUT GEII --- */
    "competences-referentiel": { titre: "Référentiel des compétences du BUT GEII", fichier: "pdfs/competences/BUT-GEII_Referentiel-competences.pdf" },
    "competence-c1":          { titre: "C1 — J'identifie les fonctions demandées à la lecture du cahier des charges", fichier: "pdfs/competences/BUT-GEII_C1_Analyse-fonctionnelle.pdf" },
    "competence-c2":          { titre: "C2 — Je propose une solution technique pour répondre à une fonction", fichier: "pdfs/competences/BUT-GEII_C2_Solution-technique.pdf" },
    "competence-c3":          { titre: "C3 — J'affine une solution technique par un maquettage numérique ou matériel", fichier: "pdfs/competences/BUT-GEII_C3_Maquettage.pdf" },
    "competence-v1":          { titre: "V1 — J'applique, j'élabore et je rédige une procédure d'essais", fichier: "pdfs/competences/BUT-GEII_V1_Procedure-essais.pdf" },
    "competence-v2":          { titre: "V2 — J'identifie et je corrige les non-conformités d'un prototype", fichier: "pdfs/competences/BUT-GEII_V2_Non-conformites.pdf" },
    "competence-m1":          { titre: "M1 — J'applique une opération de maintenance à un système", fichier: "pdfs/competences/BUT-GEII_M1_Operation-maintenance.pdf" },
    "competence-m2":          { titre: "M2 — Je rédige la procédure de maintenance d'un système", fichier: "pdfs/competences/BUT-GEII_M2_Procedure-maintenance.pdf" },
    "competence-i1":          { titre: "I1.1 & I1.2 — J'installe, je mets en service et je gère l'installation d'un système", fichier: "pdfs/competences/BUT-GEII_I1_Installation-mise-en-service.pdf" },
    "competence-g1":          { titre: "G1 — Je rédige et j'archive des documents professionnels", fichier: "pdfs/competences/BUT-GEII_G1_Documents-professionnels.pdf" },
    "competence-g2":          { titre: "G2 — J'effectue des tâches administratives", fichier: "pdfs/competences/BUT-GEII_G2_Taches-administratives.pdf" }
};


/* ==========================================================================
   3. CATÉGORIES DE LA PAGE « DOCUMENTS » (archive.html)
   L'ordre des catégories et des documents est celui de l'affichage.
   ========================================================================== */
const CATEGORIES = [
    {
        titre: "Stages & expériences professionnelles",
        documents: ["ineo-rapport-2026", "ineo-soutenance-2026", "ineo-rapport-2025", "ineo-soutenance-2025",
                    "isp-rapport-2024", "isp-soutenance-2024", "lacosse-rapport-2021"]
    },
    {
        titre: "Projets & réalisations",
        documents: ["crsa-soutenance", "ptut-cave-a-vin", "aop-liaison-sans-fil"]
    },
    {
        titre: "SAE S4 — MugOchaud",
        documents: ["mugochaud-rapport", "mugochaud-ddc", "mugochaud-ddf"]
    },
    {
        titre: "SAE S3 — Robot Mini-Sumo",
        documents: ["rms-cdc", "rms-ddc", "rms-ddf"]
    },
    {
        titre: "Preuves de compétences — BUT GEII",
        description: "Rapports d'activité démontrant l'acquisition des compétences du référentiel GEII.",
        documents: ["competences-referentiel", "competence-c1", "competence-c2", "competence-c3",
                    "mugochaud-ddc", "mugochaud-ddf", "competence-v1", "competence-v2",
                    "competence-m1", "competence-m2", "competence-i1", "competence-g1", "competence-g2"]
    }
];


/* ==========================================================================
   4. PROFIL (page « Parcours »)
   ========================================================================== */
const PROFIL = {
    nom:          "Clément Noël",
    titre:        "Automaticien — Automatisme & systèmes embarqués",
    localisation: "Pessac (33)",
    photo:        "images/MOI3.jpg",
    accroche:     "Double diplômé BTS CRSA et BUT GEII (parcours Automatisme et Informatique Industrielle), "
                + "je conçois, programme et mets en service des systèmes automatisés, de l'armoire électrique "
                + "à la supervision.",
    objectif:     "En recherche d'une alternance 2026 – 2029 pour le cycle ingénieur industriel de l'ESTIA (Bidart)."
};


/* ==========================================================================
   5. PARCOURS (frise chronologique de la page « Parcours »)
   type       : "experience" | "formation" | "projet"  (sert aux filtres)
   debut, fin : "AAAA-MM" ; fin: null = en cours
   points     : liste des réalisations (affichée en puces)
   tags       : outils ou technologies (étiquettes)
   documents  : identifiants de DOCUMENTS (liens PDF)
   image      : illustration facultative
   Les entrées sont triées automatiquement de la plus récente à la plus ancienne.
   ========================================================================== */
const PARCOURS = [
    /* ---------- Expériences professionnelles ---------- */
    {
        type: "experience",
        debut: "2025-03", fin: "2026-07",
        titre: "Alternant automaticien",
        organisme: "INEO Aquitaine (Equans)",
        lieu: "Conception industrielle",
        points: [
            "Co-conception du rétrofit d'interfaces opérateur (IHM) de gamme Schneider Electric",
            "Installation d'une baie industrielle avec commutateur KVM et automate Siemens",
            "Organisation du travail en autonomie, gestion de la charge et travail en équipe"
        ],
        tags: ["Schneider Vijeo Designer", "EcoStruxure", "Siemens TIA Portal", "KVM"],
        documents: ["ineo-rapport-2026", "ineo-soutenance-2026", "ineo-rapport-2025", "ineo-soutenance-2025"],
        image: "images/STAGE_INEO.png"
    },
    {
        type: "experience",
        debut: "2024-04", fin: "2024-07",
        titre: "Stagiaire automaticien en bureau d'études",
        organisme: "ISP Aquitaine",
        lieu: "Conception industrielle",
        points: [
            "Conception et mise en œuvre d'une supervision basée sur un serveur OPC UA",
            "Intégration d'une cellule robotique ABB",
            "Découverte des protocoles réseau et des contraintes propres à la robotique"
        ],
        tags: ["OPC UA", "Robotique ABB", "Réseaux industriels"],
        documents: ["isp-rapport-2024", "isp-soutenance-2024"],
        image: "images/STAGE_ISP.png"
    },
    {
        type: "experience",
        debut: "2021-04", fin: "2021-07",
        titre: "Stagiaire électricien de maintenance",
        organisme: "Lacosse Emballage",
        lieu: "Scierie — maintenance industrielle",
        points: [
            "Restauration complète d'une machine de découpe de bois",
            "Mise aux normes et réintégration dans le process de production",
            "Gestion de projet de bout en bout : électricité, mécanique, pneumatique, programmation"
        ],
        tags: ["Maintenance", "Mise aux normes", "Pneumatique"],
        documents: ["lacosse-rapport-2021"]
    },
    {
        type: "experience",
        debut: "2020-01", fin: "2020-02",
        titre: "Stagiaire vendeur conseil",
        organisme: "Yess Électrique",
        lieu: "Distribution de matériel électrique",
        points: [
            "Conseil technique aux professionnels à partir d'un cahier des charges",
            "Relation client"
        ],
        tags: ["Relation client"]
    },

    /* ---------- Formations ---------- */
    {
        type: "formation",
        debut: "2026-09", fin: "2029-07",
        titre: "Cycle ingénieur industriel (alternance)",
        organisme: "ESTIA",
        lieu: "Bidart",
        points: ["Objectif : intégrer le cycle ingénieur par la voie de l'alternance — recherche d'entreprise en cours"],
        tags: ["Ingénierie industrielle"],
        aVenir: true
    },
    {
        type: "formation",
        debut: "2023-09", fin: "2026-07",
        titre: "BUT GEII — parcours Automatisme et Informatique Industrielle",
        organisme: "IUT de Bordeaux",
        lieu: "Gradignan",
        points: [
            "Programmation, électronique, informatique, énergie et automatisme",
            "Trois projets menés en conditions d'entreprise (SAE)",
            "DUT GEII obtenu en 2025, BUT GEII en 2026"
        ],
        tags: ["Automatisme", "Électronique", "Informatique industrielle"],
        documents: ["competences-referentiel"],
        image: "images/GEII.png"
    },
    {
        type: "formation",
        debut: "2020-09", fin: "2023-07",
        titre: "BTS CRSA — Conception et Réalisation de Systèmes Automatiques",
        organisme: "Lycée Val de Garonne",
        lieu: "Marmande",
        points: [
            "Construction mécanique, informatique et automatisme",
            "Projet majeur d'un an : conception de A à Z d'un process et programmation robotique (Roboguide)"
        ],
        tags: ["Automatisme", "Conception mécanique", "Robotique"]
    },
    {
        type: "formation",
        debut: "2018-09", fin: "2020-07",
        titre: "Bac Pro MELEC, BEP Électrotechnique et BIA",
        organisme: "Baccalauréat professionnel",
        lieu: "Métiers de l'électricité et de ses environnements connectés",
        points: [
            "Bac Pro MELEC (2020), BEP Électrotechnique (2019)",
            "Brevet d'Initiation Aéronautique (2019)"
        ],
        tags: ["Électricité"]
    },

    /* ---------- Projets ---------- */
    {
        type: "projet",
        debut: "2025-01", fin: "2025-04",
        titre: "SAE S4 — MugOchaud",
        organisme: "IUT de Bordeaux — BUT GEII",
        points: [
            "Système chauffant un mug et maintenant son contenu à une température de consigne (projet de 30 h en binôme)",
            "Rédaction du dossier de conception, câblage de l'armoire et programmation de l'automate (LADDER)",
            "Tests, validation des exigences et rédaction de la procédure de maintenance"
        ],
        tags: ["Automate Siemens", "LADDER", "Grafcet", "Câblage d'armoire"],
        documents: ["mugochaud-rapport", "mugochaud-ddc", "mugochaud-ddf"],
        image: "images/SAE_S4.png"
    },
    {
        type: "projet",
        debut: "2024-09", fin: "2025-06",
        titre: "Projet tuteuré — Cave à vin",
        organisme: "IUT de Bordeaux — BUT GEII",
        points: [
            "Régulation de la température (jusqu'à 5 °C) et de l'humidité (70 %) d'une enceinte climatique",
            "Mise à jour du programme TIA Portal, ajout de deux sondes PT1000 et mise au point du PID",
            "Transfert de la platine de test dans une nouvelle armoire — projet à trois étudiants"
        ],
        tags: ["TIA Portal", "Régulation PID", "PT1000"],
        documents: ["ptut-cave-a-vin"],
        image: "images/ptut_cav.png"
    },
    {
        type: "projet",
        debut: "2024-09", fin: "2025-01",
        titre: "SAE S3 — Robot Mini-Sumo",
        organisme: "IUT de Bordeaux — BUT GEII",
        points: [
            "Conception d'un robot autonome pour un tournoi de mini-sumo",
            "Choix et implantation des capteurs de détection d'adversaire (VL53L0X)"
        ],
        tags: ["Robotique", "Capteurs", "Électronique"],
        documents: ["rms-cdc", "rms-ddc", "rms-ddf"],
        image: "images/SAE_S3.png"
    },
    {
        type: "projet",
        debut: "2024-01", fin: "2024-06",
        titre: "AOP S4 — Liaison sans fil",
        organisme: "IUT de Bordeaux — BUT GEII",
        points: ["Étude d'une liaison radio (module NRF24L01), schémas électroniques et programmation Arduino"],
        tags: ["Arduino", "Radio", "Électronique"],
        documents: ["aop-liaison-sans-fil"],
        image: "images/SSL.png"
    },
    {
        type: "projet",
        debut: "2021-09", fin: "2022-06",
        titre: "Projet BTS — Machine de tri de ronds de serviette",
        organisme: "Lycée Val de Garonne — BTS CRSA",
        points: ["Responsable de la conception du pupitre opérateur (IHM) de la machine"],
        tags: ["IHM", "Conception mécanique", "Automatisme"],
        documents: ["crsa-soutenance"],
        image: "images/oralcrsa.png"
    }
];


/* ==========================================================================
   6. COMPÉTENCES (niveau de 1 à 5)
   ========================================================================== */
const COMPETENCES = [
    {
        domaine: "Programmation industrielle",
        elements: [
            { nom: "EcoStruxure / Vijeo Designer", niveau: 5 },
            { nom: "Unity Pro XL",                 niveau: 5 },
            { nom: "TIA Portal V21",               niveau: 4 }
        ]
    },
    {
        domaine: "Électricité",
        elements: [
            { nom: "Mise aux normes, entretien",      niveau: 5 },
            { nom: "Schémas (XRelais, SEE Electrical)", niveau: 4 }
        ]
    },
    {
        domaine: "Électronique",
        elements: [
            { nom: "Dépannage de cartes électroniques", niveau: 4 },
            { nom: "Schémas (EasyEDA, KiCad)",          niveau: 3 }
        ]
    },
    {
        domaine: "Conception & fabrication",
        elements: [
            { nom: "Impression 3D FDM, découpe laser", niveau: 5 },
            { nom: "Inventor, Fusion 360",             niveau: 4 },
            { nom: "Statique, cinématique",            niveau: 3 },
            { nom: "SolidWorks",                       niveau: 2 },
            { nom: "Résistance des matériaux",         niveau: 2 }
        ]
    },
    {
        domaine: "Informatique",
        elements: [
            { nom: "Windows, Linux, VMware, Office 365",          niveau: 5 },
            { nom: "Intégration de LLM, protection des données",  niveau: 5 },
            { nom: "Serveurs Docker, VLAN, VPN",                  niveau: 3 },
            { nom: "Bases de données, vidéosurveillance",         niveau: 2 },
            { nom: "C++, Python, HTML",                           niveau: 2 },
            { nom: "MATLAB, GNU Octave",                          niveau: 1 }
        ]
    }
];


/* ==========================================================================
   7. CENTRES D'INTÉRÊT
   ========================================================================== */
const INTERETS = [
    "Conception 3D et impression FDM",
    "Auto-hébergement et vie privée numérique",
    "Contributions Wikipédia, OpenStreetMap et documentation Debian",
    "Aéronautique et spatial (BIA, Kerbal Space Program)",
    "Optimisation de réseaux d'automatisation sur Factorio",
    "Trail en solitaire dans les Pyrénées"
];
