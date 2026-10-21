/*
 * Contenu du portfolio — tout ce qui s’affiche dans les sections
 * Réalisations, Parcours, Compétences et Documents vient d’ici.
 *
 * Ajouter un PDF : déposer le fichier dans pdfs/<dossier>/, générer sa
 * miniature dans assets/thumbs/ (même nom, en .jpg), puis ajouter une
 * entrée dans `documents`. Pour le relier à une ligne du parcours, ajouter
 * son code dans le tableau `docs` de l’entrée concernée.
 */
window.PORTFOLIO = {
  categoriesDocuments: [
    { id: "stages",      court: "Stages",      label: "Stages & alternance" },
    { id: "sae-s4",      court: "SAE S4",      label: "SAE S4 — MugOchaud" },
    { id: "sae-s3",      court: "SAE S3",      label: "SAE S3 — Robot Mini-Sumo" },
    { id: "projets",     court: "Projets",     label: "Autres projets" },
    { id: "competences", court: "Compétences", label: "Preuves de compétences — BUT GEII" },
    { id: "cv",          court: "CV",          label: "Curriculum vitæ" }
  ],

  documents: [
    { code: "STG-01", cat: "stages", type: "Rapport",    titre: "Rapport d’alternance 2026 — INEO Aquitaine",              fichier: "pdfs/stages/2026_INEO-Aquitaine_Rapport-alternance.pdf",   pages: 44, taille: "9,8 Mo" },
    { code: "STG-02", cat: "stages", type: "Soutenance", titre: "Soutenance d’alternance 2026 — INEO Aquitaine",           fichier: "pdfs/stages/2026_INEO-Aquitaine_Soutenance-alternance.pdf", pages: 22, taille: "2,1 Mo" },
    { code: "STG-03", cat: "stages", type: "Rapport",    titre: "Rapport de stage 2025 — INEO Aquitaine",                  fichier: "pdfs/stages/2025_INEO-Aquitaine_Rapport-stage.pdf",         pages: 48, taille: "16,4 Mo" },
    { code: "STG-04", cat: "stages", type: "Soutenance", titre: "Soutenance de stage 2025 — INEO Aquitaine",               fichier: "pdfs/stages/2025_INEO-Aquitaine_Soutenance-stage.pdf",      pages: 20, taille: "5,8 Mo" },
    { code: "STG-05", cat: "stages", type: "Rapport",    titre: "Rapport de stage 2024 — ISP Aquitaine",                   fichier: "pdfs/stages/2024_ISP-Aquitaine_Rapport-stage.pdf",          pages: 42, taille: "2,7 Mo" },
    { code: "STG-06", cat: "stages", type: "Soutenance", titre: "Soutenance de stage 2024 — ISP Aquitaine",                fichier: "pdfs/stages/2024_ISP-Aquitaine_Soutenance-stage.pdf",       pages: 25, taille: "4,3 Mo" },
    { code: "STG-07", cat: "stages", type: "Rapport",    titre: "Rapport de stage BTS CRSA — Lacosse Emballage",           fichier: "pdfs/stages/2021_Lacosse-Emballage_Rapport-stage.pdf",      pages: 8,  taille: "4,5 Mo" },

    { code: "PRJ-04", cat: "sae-s4", type: "Rapport", titre: "MugOchaud — Rapport de projet",        fichier: "pdfs/projets/SAE-S4_MugOchaud_Rapport.pdf",               pages: 10, taille: "613 ko" },
    { code: "PRJ-05", cat: "sae-s4", type: "Dossier", titre: "MugOchaud — Dossier de conception",    fichier: "pdfs/projets/SAE-S4_MugOchaud_Dossier-de-conception.pdf", pages: 29, taille: "2,2 Mo" },
    { code: "PRJ-06", cat: "sae-s4", type: "Dossier", titre: "MugOchaud — Dossier de fabrication",   fichier: "pdfs/projets/SAE-S4_MugOchaud_Dossier-de-fabrication.pdf", pages: 18, taille: "3,0 Mo" },

    { code: "PRJ-07", cat: "sae-s3", type: "Dossier", titre: "Robot Mini-Sumo — Cahier des charges",               fichier: "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Cahier-des-charges.pdf",      pages: 12, taille: "1,7 Mo" },
    { code: "PRJ-08", cat: "sae-s3", type: "Dossier", titre: "Robot Mini-Sumo — Dossier de conception détaillée",  fichier: "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Dossier-de-conception.pdf",   pages: 38, taille: "1,3 Mo" },
    { code: "PRJ-09", cat: "sae-s3", type: "Dossier", titre: "Robot Mini-Sumo — Dossier de fabrication",           fichier: "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Dossier-de-fabrication.pdf",  pages: 14, taille: "584 ko" },

    { code: "PRJ-02", cat: "projets", type: "Rapport",    titre: "Projet tuteuré — Cave à vin",                                  fichier: "pdfs/projets/PTUT_Cave-a-vin_Rapport.pdf",                        pages: 22, taille: "1,3 Mo" },
    { code: "PRJ-03", cat: "projets", type: "Soutenance", titre: "AOP S4 — Liaison sans fil (module NRF24L01)",                  fichier: "pdfs/projets/AOP-S4_Liaison-sans-fil_Soutenance.pdf",             pages: 9,  taille: "2,0 Mo" },
    { code: "PRJ-01", cat: "projets", type: "Soutenance", titre: "Projet BTS CRSA — Machine de tri de ronds de serviette",        fichier: "pdfs/projets/BTS-CRSA_Tri-ronds-de-serviette_Soutenance.pdf",     pages: 44, taille: "4,5 Mo" },

    { code: "CMP-01", cat: "competences", type: "Référentiel", titre: "Référentiel des compétences du BUT GEII",                                         fichier: "pdfs/competences/BUT-GEII_Referentiel-competences.pdf",         pages: 1,  taille: "259 ko" },
    { code: "CMP-02", cat: "competences", type: "Preuve", titre: "C1 — J’identifie les fonctions demandées à la lecture du cahier des charges",         fichier: "pdfs/competences/BUT-GEII_C1_Analyse-fonctionnelle.pdf",        pages: 1,  taille: "188 ko" },
    { code: "CMP-03", cat: "competences", type: "Preuve", titre: "C2 — Je propose une solution technique pour répondre à une fonction",                 fichier: "pdfs/competences/BUT-GEII_C2_Solution-technique.pdf",           pages: 4,  taille: "344 ko" },
    { code: "CMP-04", cat: "competences", type: "Preuve", titre: "C3 — J’affine une solution technique par un maquettage numérique ou matériel",        fichier: "pdfs/competences/BUT-GEII_C3_Maquettage.pdf",                   pages: 6,  taille: "1,6 Mo" },
    { code: "CMP-05", cat: "competences", type: "Preuve", titre: "V1 — J’applique, j’élabore et je rédige une procédure d’essais",                      fichier: "pdfs/competences/BUT-GEII_V1_Procedure-essais.pdf",             pages: 6,  taille: "1,9 Mo" },
    { code: "CMP-06", cat: "competences", type: "Preuve", titre: "V2 — J’identifie et je corrige les non-conformités d’un prototype",                   fichier: "pdfs/competences/BUT-GEII_V2_Non-conformites.pdf",              pages: 3,  taille: "3,4 Mo" },
    { code: "CMP-07", cat: "competences", type: "Preuve", titre: "M1 — J’applique une opération de maintenance à un système",                          fichier: "pdfs/competences/BUT-GEII_M1_Operation-maintenance.pdf",        pages: 8,  taille: "1013 ko" },
    { code: "CMP-08", cat: "competences", type: "Preuve", titre: "M2 — Je rédige la procédure de maintenance d’un système",                            fichier: "pdfs/competences/BUT-GEII_M2_Procedure-maintenance.pdf",        pages: 6,  taille: "2,3 Mo" },
    { code: "CMP-09", cat: "competences", type: "Preuve", titre: "I1.1 & I1.2 — J’installe, je mets en service et je gère l’installation d’un système", fichier: "pdfs/competences/BUT-GEII_I1_Installation-mise-en-service.pdf", pages: 4,  taille: "360 ko" },
    { code: "CMP-10", cat: "competences", type: "Preuve", titre: "G1 — Je rédige et j’archive des documents professionnels",                           fichier: "pdfs/competences/BUT-GEII_G1_Documents-professionnels.pdf",     pages: 45, taille: "4,8 Mo" },
    { code: "CMP-11", cat: "competences", type: "Preuve", titre: "G2 — J’effectue des tâches administratives",                                        fichier: "pdfs/competences/BUT-GEII_G2_Taches-administratives.pdf",       pages: 2,  taille: "379 ko" },

    { code: "CV-01", cat: "cv", type: "CV", titre: "Curriculum vitæ — Clément Noël", fichier: "pdfs/cv/CV_Clement-Noel.pdf", pages: 1, taille: "833 ko" }
  ],

  // Du plus récent au plus ancien. `une` = affiché dans la section Réalisations,
  // `enCours` = étape actuelle, `aVenir` = étape prévue.
  parcours: [
    {
      id: "master", type: "formation", enCours: true,
      titre: "Master Génie Industriel — option Conception Électronique",
      organisme: "INSSET · Université de Picardie Jules Verne",
      periode: "2026 – en cours",
      points: ["Spécialisation en conception électronique, après le BUT GEII parcours AII"]
    },
    {
      id: "ineo", type: "experience", une: true,
      titre: "Alternant automaticien",
      organisme: "INEO Aquitaine (Equans) · Conception industrielle",
      periode: "mars 2025 – juil. 2026", duree: "1 an 5 mois",
      resume: "Co-conception du rétrofit d’interfaces opérateur Schneider Electric et installation d’une baie industrielle avec KVM et automate Siemens.",
      points: [
        "Co-conception du rétrofit d’interfaces opérateur (IHM) de gamme Schneider Electric",
        "Installation d’une baie industrielle avec commutateur KVM et automate Siemens",
        "Organisation du travail en autonomie, gestion de la charge et travail en équipe"
      ],
      motsCles: ["Vijeo Designer", "EcoStruxure", "TIA Portal", "KVM"],
      docs: ["STG-01", "STG-02", "STG-03", "STG-04"],
      image: "assets/img/ineo-ihm.jpg", imageAlt: "Écran tactile Schneider Electric affichant le logo INEO au démarrage"
    },
    {
      id: "mugochaud", type: "projet", une: true,
      titre: "SAE S4 — MugOchaud",
      organisme: "IUT de Bordeaux · BUT GEII",
      periode: "janv. 2025 – avr. 2025", duree: "4 mois",
      resume: "Chauffer un mug et maintenir son contenu à température de consigne : armoire, automate et programme LADDER.",
      points: [
        "Système chauffant un mug et maintenant son contenu à une température de consigne (projet de 30 h en binôme)",
        "Rédaction du dossier de conception, câblage de l’armoire et programmation de l’automate (LADDER)",
        "Tests, validation des exigences et rédaction de la procédure de maintenance"
      ],
      motsCles: ["Automate Siemens", "LADDER", "Grafcet", "Câblage d’armoire"],
      docs: ["PRJ-04", "PRJ-05", "PRJ-06"],
      image: "assets/img/mugochaud.jpg", imageAlt: "Poste de travail : armoire électrique avec automate Siemens, maquette en bois et dossier de conception à l’écran"
    },
    {
      id: "cave", type: "projet", une: true,
      titre: "Projet tuteuré — Cave à vin",
      organisme: "IUT de Bordeaux · BUT GEII",
      periode: "sept. 2024 – juin 2025", duree: "10 mois",
      resume: "Régulation PID de la température et de l’humidité d’une enceinte climatique sous TIA Portal.",
      points: [
        "Régulation de la température (jusqu’à 5 °C) et de l’humidité (70 %) d’une enceinte climatique",
        "Mise à jour du programme TIA Portal, ajout de deux sondes PT1000 et mise au point du PID",
        "Transfert de la platine de test dans une nouvelle armoire — projet à trois étudiants"
      ],
      motsCles: ["TIA Portal", "Régulation PID", "PT1000"],
      docs: ["PRJ-02"],
      image: "assets/img/cave-a-vin.jpg", imageAlt: "Platine de test : automate Siemens, modules Peltier ventilés et câblage", imageFit: "contain"
    },
    {
      id: "sumo", type: "projet", une: true,
      titre: "SAE S3 — Robot Mini-Sumo",
      organisme: "IUT de Bordeaux · BUT GEII",
      periode: "sept. 2024 – janv. 2025", duree: "5 mois",
      resume: "Robot autonome pour un tournoi de mini-sumo, avec capteurs de détection d’adversaire VL53L0X.",
      points: [
        "Conception d’un robot autonome pour un tournoi de mini-sumo",
        "Choix et implantation des capteurs de détection d’adversaire (VL53L0X)"
      ],
      motsCles: ["Robotique", "Capteurs", "Électronique"],
      docs: ["PRJ-07", "PRJ-08", "PRJ-09"],
      image: "assets/img/robot-sumo.jpg", imageAlt: "Gros plan sur l’avant du robot mini-sumo et ses capteurs"
    },
    {
      id: "isp", type: "experience", une: true,
      titre: "Stagiaire automaticien — bureau d’études",
      organisme: "ISP Aquitaine · Conception industrielle",
      periode: "avr. 2024 – juil. 2024", duree: "4 mois",
      resume: "Supervision basée sur un serveur OPC UA et intégration d’une cellule robotique ABB.",
      points: [
        "Conception et mise en œuvre d’une supervision basée sur un serveur OPC UA",
        "Intégration d’une cellule robotique ABB",
        "Découverte des protocoles réseau et des contraintes propres à la robotique"
      ],
      motsCles: ["OPC UA", "Robotique ABB", "Réseaux industriels"],
      docs: ["STG-05", "STG-06"],
      image: "assets/img/isp-robot.jpg", imageAlt: "Schéma de principe : bras robotisé intervenant sur les brides d’une turbine", imageFit: "contain"
    },
    {
      id: "aop", type: "projet", une: true,
      titre: "AOP S4 — Liaison sans fil",
      organisme: "IUT de Bordeaux · BUT GEII",
      periode: "janv. 2024 – juin 2024", duree: "6 mois",
      resume: "Étude d’une liaison radio NRF24L01 : schémas électroniques et programmation Arduino.",
      points: ["Étude d’une liaison radio (module NRF24L01), schémas électroniques et programmation Arduino"],
      motsCles: ["Arduino", "Radio", "Électronique"],
      docs: ["PRJ-03"],
      image: "assets/img/liaison-sans-fil.jpg", imageAlt: "Deux cartes Arduino reliées chacune à un module radio NRF24L01 avec antenne"
    },
    {
      id: "but", type: "formation",
      titre: "BUT GEII — Automatisme et Informatique Industrielle",
      organisme: "IUT de Bordeaux · Gradignan",
      periode: "2023 – 2026",
      points: [
        "Programmation, électronique, informatique, énergie et automatisme",
        "Trois projets menés en conditions d’entreprise (SAE)",
        "DUT GEII obtenu en 2025, BUT GEII en 2026"
      ],
      docs: ["CMP-01"]
    },
    {
      id: "tri", type: "projet", une: true,
      titre: "Projet BTS — Machine de tri de ronds de serviette",
      organisme: "Lycée Val de Garonne · BTS CRSA",
      periode: "sept. 2021 – juin 2022", duree: "10 mois",
      resume: "Responsable de la conception du pupitre opérateur (IHM) d’une machine de tri.",
      points: ["Responsable de la conception du pupitre opérateur (IHM) de la machine"],
      motsCles: ["IHM", "Conception mécanique", "Automatisme"],
      docs: ["PRJ-01"],
      image: "assets/img/tri-ronds.jpg", imageAlt: "Modélisation 3D de la machine de tri : bâti en profilés, carter vitré et coffret électrique", imageFit: "contain"
    },
    {
      id: "lacosse", type: "experience",
      titre: "Stagiaire électricien de maintenance",
      organisme: "Lacosse Emballage · Scierie",
      periode: "avr. 2021 – juil. 2021", duree: "4 mois",
      points: [
        "Restauration complète d’une machine de découpe de bois",
        "Mise aux normes et réintégration dans le process de production",
        "Gestion de projet de bout en bout : électricité, mécanique, pneumatique, programmation"
      ],
      motsCles: ["Maintenance", "Mise aux normes", "Pneumatique"],
      docs: ["STG-07"]
    },
    {
      id: "bts", type: "formation",
      titre: "BTS CRSA — Conception et Réalisation de Systèmes Automatiques",
      organisme: "Lycée Val de Garonne · Marmande",
      periode: "2020 – 2023",
      points: [
        "Construction mécanique, informatique et automatisme",
        "Projet majeur d’un an : conception de A à Z d’un process et programmation robotique (Roboguide)"
      ]
    },
    {
      id: "yess", type: "experience",
      titre: "Stagiaire vendeur conseil",
      organisme: "Yess Électrique · Distribution de matériel électrique",
      periode: "janv. 2020 – févr. 2020", duree: "2 mois",
      points: [
        "Conseil technique aux professionnels à partir d’un cahier des charges",
        "Relation client"
      ]
    },
    {
      id: "bac", type: "formation",
      titre: "Bac Pro MELEC, BEP Électrotechnique et BIA",
      organisme: "Métiers de l’électricité et de ses environnements connectés",
      periode: "2018 – 2020",
      points: [
        "Bac Pro MELEC (2020), BEP Électrotechnique (2019)",
        "Brevet d’Initiation Aéronautique (2019)"
      ]
    }
  ],

  // Auto-évaluation sur 5
  competences: [
    { groupe: "Programmation industrielle", items: [
      ["EcoStruxure / Vijeo Designer", 5],
      ["Unity Pro XL", 5],
      ["TIA Portal V21", 4]
    ]},
    { groupe: "Électricité & électronique", items: [
      ["Mise aux normes, entretien", 5],
      ["Schémas (XRelais, SEE Electrical)", 4],
      ["Dépannage de cartes électroniques", 4],
      ["Schémas (EasyEDA, KiCad)", 3]
    ]},
    { groupe: "Conception & fabrication", items: [
      ["Impression 3D FDM, découpe laser", 5],
      ["Inventor, Fusion 360", 4],
      ["Statique, cinématique", 3],
      ["SolidWorks", 2],
      ["Résistance des matériaux", 2]
    ]},
    { groupe: "Informatique", items: [
      ["Windows, Linux, VMware, Office 365", 5],
      ["Intégration de LLM, protection des données", 5],
      ["Serveurs Docker, VLAN, VPN", 3],
      ["Bases de données, vidéosurveillance", 2],
      ["C++, Python, HTML", 2],
      ["MATLAB, GNU Octave", 1]
    ]}
  ],

  // Référentiel BUT GEII (parcours AII) et documents qui en apportent la preuve
  referentiel: [
    { bloc: "Concevoir", cle: "concevoir", items: [
      { code: "C1", texte: "J’identifie les fonctions demandées à la lecture du cahier des charges", docs: ["CMP-02"] },
      { code: "C2", texte: "Je propose une solution technique pour répondre à une fonction", docs: ["CMP-03"] },
      { code: "C3", texte: "J’affine une solution technique par un maquettage numérique ou matériel", docs: ["CMP-04"] },
      { code: "C4", texte: "Je rédige un dossier de conception et de fabrication", docs: ["PRJ-05", "PRJ-06", "PRJ-08", "PRJ-09"] }
    ]},
    { bloc: "Vérifier", cle: "verifier", items: [
      { code: "V1", texte: "J’applique, j’élabore et je rédige une procédure d’essais", docs: ["CMP-05"] },
      { code: "V2", texte: "J’identifie et je corrige les non-conformités d’un prototype", docs: ["CMP-06"] }
    ]},
    { bloc: "Maintenir", cle: "maintenir", items: [
      { code: "M1", texte: "J’applique une opération de maintenance à un système", docs: ["CMP-07"] },
      { code: "M2", texte: "Je rédige la procédure de maintenance d’un système", docs: ["CMP-08"] }
    ]},
    { bloc: "Intégrer", cle: "integrer", items: [
      { code: "I1", texte: "J’installe, je mets en service et je gère l’installation d’un système", docs: ["CMP-09"] }
    ]},
    { bloc: "Manager", cle: "manager", items: [
      { code: "G1", texte: "Je rédige et j’archive des documents professionnels", docs: ["CMP-10"] },
      { code: "G2", texte: "J’effectue des tâches administratives", docs: ["CMP-11"] }
    ]}
  ]
};
