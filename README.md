# Site personnel — Clément Noël · v4 « Brut industriel »

En ligne : https://clementnoelrenard.github.io/

Panneau de commande et plan technique : noir carbone, jaune sécurité, typographie
pochoir, oscilloscope interactif, menu hamburger plein écran, frise qui s'allume
au défilement, nomenclature des rapports, cartouche de plan en pied de page.

## Arborescence

```
index.html          Accueil : démarrage, oscilloscope, modules, fiche technique, contact
parcours.html       CV dynamique : profil, frise filtrable, compétences
archive.html        Documents : nomenclature des PDF avec recherche
loisir.html         Atelier : centres d'intérêt, mini-jeu, ressources
snake.html          Jeu Snake (clavier + tactile)
404.html            Page « défaut » pour les adresses introuvables
style.css           Toute la mise en forme (variables en tête de fichier)

js/donnees.js       ← TOUT LE CONTENU : profil, parcours, compétences, documents, menu
js/composants.js    Fonctions communes : en-tête, menu, cartouche, animations, transitions
js/accueil.js       Séquence de démarrage, modules, fiche technique
js/oscilloscope.js  Écran d'oscilloscope animé (canvas)
js/parcours.js      Frise, filtres, bargraphes de compétences
js/documents.js     Nomenclature, recherche, tailles des fichiers
js/atelier.js       Cartes de l'atelier, ressources
js/snake.js         Jeu Snake

pdfs/               cv/, stages/, projets/, competences/
cv/cv_clement_noel.tex   CV au format LaTeX
```

## Mettre à jour le site

Tout se fait dans `js/donnees.js` ; les pages se reconstruisent seules :

| Je veux…                            | Je modifie…                                              |
|-------------------------------------|----------------------------------------------------------|
| ajouter une expérience / un projet  | une entrée dans `PARCOURS`                               |
| ajouter un PDF                      | le fichier dans `pdfs/…`, puis `DOCUMENTS` et `CATEGORIES` |
| changer une compétence              | `COMPETENCES`                                            |
| changer le texte de l'accueil       | `ACCUEIL` (démarrage, modules, fiche, à propos)          |
| ajouter une page au menu            | `SITE.navigation` (+ `data-page` sur le `<body>`)        |
| changer le statut, la version       | `SITE.statut`, `SITE.version`                            |
| changer les couleurs, les polices   | bloc `:root` en tête de `style.css`                      |

Références (`STG-03`, `EXP-04`…), durées, chiffres clés et tailles des PDF sont
calculés automatiquement.

## Tester en local

Les pages fonctionnent en double-cliquant dessus, mais les tailles de PDF et la
page 404 demandent un petit serveur :

```bash
python -m http.server 8000
```

puis ouvrir http://localhost:8000.

## Accessibilité

- Menu utilisable au clavier (Échap pour fermer), lien « Aller au contenu ».
- Toutes les animations sont coupées si le système demande moins d'animations.
- La page Parcours s'imprime proprement (fond blanc, sans images ni menus).
