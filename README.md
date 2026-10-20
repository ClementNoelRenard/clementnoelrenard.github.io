# Site personnel — Clément Noël

En ligne : https://clementnoelrenard.github.io/

## Arborescence

```
index.html          Accueil
parcours.html       CV dynamique : frise chronologique, filtres, compétences
archive.html        Documents PDF classés par catégorie
loisir.html         Loisirs (mini-jeux)
snake.html          Jeu Snake
style.css           Feuille de style commune (variables en tête de fichier)

js/donnees.js       ← TOUT LE CONTENU : profil, parcours, compétences, documents
js/composants.js    Fonctions communes : navigation, pied de page, listes de PDF
js/parcours.js      Construction de la page parcours.html

pdfs/cv/            CV au format PDF
pdfs/stages/        Rapports et soutenances de stage / alternance (Annee_Entreprise_Type.pdf)
pdfs/projets/       Dossiers de projets (Formation_Projet_Type.pdf)
pdfs/competences/   Preuves de compétences du BUT GEII

cv/cv_clement_noel.tex   CV au format LaTeX
outils/preparer_pdfs.py  Renseigne les propriétés des PDF et détecte les liens cassés
```

## Mettre à jour le site

Tout se fait dans `js/donnees.js`, les pages se mettent à jour automatiquement :

| Je veux…                         | Je modifie…                                        |
|----------------------------------|----------------------------------------------------|
| ajouter une expérience / un projet | une entrée dans `PARCOURS`                       |
| ajouter un PDF                   | le fichier dans `pdfs/…`, puis `DOCUMENTS` et `CATEGORIES` |
| changer une compétence           | `COMPETENCES`                                      |
| ajouter une page au menu         | `SITE.navigation` (+ `data-page` sur le `<body>`)  |
| changer la version / l'année     | `SITE.version`, `SITE.annee`                       |
| changer les couleurs             | bloc `:root` en tête de `style.css`                |

## Préparer les PDF

```bash
python -m pip install -r outils/requirements.txt
python outils/preparer_pdfs.py --verifier   # contrôle : fichiers manquants ou non utilisés
python outils/preparer_pdfs.py              # écrit titre, auteur et sujet dans chaque PDF
```

## Compiler le CV LaTeX

Avec une distribution LaTeX (MiKTeX, TeX Live) depuis le dossier `cv/` :

```bash
pdflatex cv_clement_noel.tex
```

Ou sur [Overleaf](https://www.overleaf.com) : importer `cv_clement_noel.tex` (et la photo
`images/MOI3.jpg` si souhaitée, en adaptant `\photo`), compilateur **pdfLaTeX**.
Copier ensuite le PDF obtenu dans `pdfs/cv/CV_Clement-Noel.pdf`.
