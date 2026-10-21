# Site personnel — Clément Noël · v5

En ligne : https://clementnoelrenard.github.io/

Site en **HTML + CSS uniquement** : pas de bibliothèque, pas de police externe,
pas de JavaScript (sauf le jeu Snake, qui ne peut pas s'en passer).

## Arborescence

```
index.html      Accueil : présentation, liens vers le parcours, les documents, l'atelier
parcours.html   Parcours : frise triable (expériences, formations, projets), compétences
archive.html    Documents : PDF triables par catégorie
loisir.html     Atelier : boîtes des centres d'intérêt, mini-jeu, ressources
snake.html      Jeu Snake (+ js/snake.js, seul script du site)
404.html        Page affichée pour une adresse introuvable
style.css       Toute la mise en forme (variables en tête de fichier)

images/         Photos et fond
pdfs/           cv/, stages/, projets/, competences/
cv/             CV au format LaTeX
```

## Comment ça marche sans JavaScript

- **Menu hamburger** : un élément `<details>` ; cliquer sur le bouton l'ouvre ou
  le ferme. Le bloc du menu est identique dans chaque page : seul
  `aria-current="page"` change de lien.
- **Tri des documents et du parcours** : des boutons radio cachés dans des
  `<label>`. Le bouton n°N affiche uniquement les éléments qui portent la
  classe `groupe-N` (voir `style.css`, § 8).

## Mettre à jour le site

| Je veux…                     | Je fais…                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| ajouter un PDF               | le déposer dans `pdfs/…`, puis copier une ligne `<li class="liste-documents__element">` dans la bonne section d'`archive.html` |
| ajouter une étape au parcours | copier un bloc `<li class="etape …">` dans `parcours.html`, à sa place chronologique, avec `groupe-1` (expérience), `groupe-2` (formation) ou `groupe-3` (projet) |
| ajouter une boîte à l'atelier | copier un bloc `<article class="boite">` dans `loisir.html`             |
| changer une compétence        | modifier `--niveau`, `aria-label` et le texte « n/5 » dans `parcours.html` |
| ajouter une page au menu      | copier une ligne `<li class="menu__element">` dans le menu de **chaque** page |
| changer les couleurs, tailles | bloc `:root` en tête de `style.css`                                      |

Penser à mettre à jour les compteurs des boutons de tri, par ex. « Stages (7) ».
