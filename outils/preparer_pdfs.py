"""
PRÉPARATION DES PDF DU SITE — Clément Noël
==========================================

Lit la liste des documents dans js/donnees.js (objet DOCUMENTS) et, pour
chaque PDF :
  1. retrouve le fichier (à son nouvel emplacement, ou sous son ancien nom) ;
  2. renseigne ses propriétés : titre, auteur, sujet, mots-clés ;
  3. demande aux lecteurs PDF d'afficher ce titre (au lieu du nom de fichier)
     dans l'onglet du navigateur ;
  4. supprime les objets en double (compression sans perte) ;
  5. l'enregistre à l'emplacement prévu dans donnees.js.

Il signale aussi les documents introuvables (liens cassés sur le site) et les
PDF présents dans pdfs/ mais utilisés nulle part.

Installation (une seule fois) :
    python -m pip install -r outils/requirements.txt

Utilisation (depuis la racine du site) :
    python outils/preparer_pdfs.py --verifier        # contrôle seul, rien n'est écrit
    python outils/preparer_pdfs.py                   # traite les PDF sur place
    python outils/preparer_pdfs.py --sortie DOSSIER  # écrit les PDF traités ailleurs

Ajouter un document : déposer le PDF dans pdfs/, ajouter sa ligne dans
DOCUMENTS (js/donnees.js), puis relancer ce script.
"""

from __future__ import annotations

import argparse
import io
import re
import sys
from dataclasses import dataclass
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
FICHIER_DONNEES = RACINE / "js" / "donnees.js"
DOSSIER_PDF = RACINE / "pdfs"

SITE_WEB = "https://clementnoelrenard.github.io/"

# Sujet inscrit dans les propriétés du PDF, selon son sous-dossier de pdfs/
SUJETS = {
    "cv": "Curriculum vitæ",
    "stages": "Stage et alternance en entreprise",
    "projets": "Projet technique",
    "competences": "Preuve de compétence — BUT GEII",
}

# Anciens noms des fichiers (réorganisation d'octobre 2026).
# Permet au script de retrouver un PDF qui n'a pas encore été déplacé.
# Ce tableau peut être supprimé une fois la migration terminée.
ANCIENS_NOMS = {
    "pdfs/cv/CV_Clement-Noel.pdf": "pdfs/clementnoel_CV_reseau.pdf",
    "pdfs/stages/2026_INEO-Aquitaine_Rapport-alternance.pdf": "pdfs/CN_R_2026.pdf",
    "pdfs/stages/2026_INEO-Aquitaine_Soutenance-alternance.pdf": "pdfs/CN_P_2026.pdf",
    "pdfs/stages/2025_INEO-Aquitaine_Rapport-stage.pdf": "pdfs/CN_R_2024.pdf",
    "pdfs/stages/2025_INEO-Aquitaine_Soutenance-stage.pdf": "pdfs/CN_P_2024.pdf",
    "pdfs/stages/2024_ISP-Aquitaine_Rapport-stage.pdf": "pdfs/CN_R_2023.pdf",
    "pdfs/stages/2024_ISP-Aquitaine_Soutenance-stage.pdf": "pdfs/CN_P_2023.pdf",
    "pdfs/stages/2021_Lacosse-Emballage_Rapport-stage.pdf": "pdfs/CN_P_lacosse.pdf",
    "pdfs/projets/BTS-CRSA_Tri-ronds-de-serviette_Soutenance.pdf": "pdfs/CN_P_CRSA.pdf",
    "pdfs/projets/PTUT_Cave-a-vin_Rapport.pdf": "pdfs/cave_a_vin.pdf",
    "pdfs/projets/AOP-S4_Liaison-sans-fil_Soutenance.pdf": "pdfs/SSL_oral.pdf",
    "pdfs/projets/SAE-S4_MugOchaud_Rapport.pdf": "pdfs/SAE_S4.pdf",
    "pdfs/projets/SAE-S4_MugOchaud_Dossier-de-conception.pdf": "pdfs/C4_DDC.pdf",
    "pdfs/projets/SAE-S4_MugOchaud_Dossier-de-fabrication.pdf": "pdfs/C4_DDF.pdf",
    "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Cahier-des-charges.pdf": "pdfs/RMS-CDC v4.1.pdf",
    "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Dossier-de-conception.pdf": "pdfs/Groupe43_RMS_DDC.pdf",
    "pdfs/projets/SAE-S3_Robot-Mini-Sumo_Dossier-de-fabrication.pdf": "pdfs/RMS_DDF_EQ43.pdf",
    "pdfs/competences/BUT-GEII_Referentiel-competences.pdf": "pdfs/competence.pdf",
    "pdfs/competences/BUT-GEII_C1_Analyse-fonctionnelle.pdf": "pdfs/C1.pdf",
    "pdfs/competences/BUT-GEII_C2_Solution-technique.pdf": "pdfs/C2.pdf",
    "pdfs/competences/BUT-GEII_C3_Maquettage.pdf": "pdfs/C3.pdf",
    "pdfs/competences/BUT-GEII_V1_Procedure-essais.pdf": "pdfs/V1.pdf",
    "pdfs/competences/BUT-GEII_V2_Non-conformites.pdf": "pdfs/V2.pdf",
    "pdfs/competences/BUT-GEII_M1_Operation-maintenance.pdf": "pdfs/M1.pdf",
    "pdfs/competences/BUT-GEII_M2_Procedure-maintenance.pdf": "pdfs/M2.pdf",
    "pdfs/competences/BUT-GEII_I1_Installation-mise-en-service.pdf": "pdfs/I11.pdf",
    "pdfs/competences/BUT-GEII_G1_Documents-professionnels.pdf": "pdfs/G1.pdf",
    "pdfs/competences/BUT-GEII_G2_Taches-administratives.pdf": "pdfs/G2.pdf",
}


@dataclass
class Document:
    identifiant: str
    titre: str
    fichier: str  # chemin relatif à la racine du site, ex. "pdfs/cv/CV.pdf"


# --------------------------------------------------------------------------
# Lecture de js/donnees.js
# --------------------------------------------------------------------------

def lire_auteur(texte: str) -> str:
    """Retourne SITE.auteur, ou un nom par défaut s'il est introuvable."""
    trouve = re.search(r'auteur:\s*"([^"]+)"', texte)
    return trouve.group(1) if trouve else "Clément Noël"


def lire_documents(texte: str) -> list[Document]:
    """Extrait les entrées  "id": { titre: "...", fichier: "..." }  de DOCUMENTS.

    Seul le bloc « const DOCUMENTS = { ... }; » est lu, pour ignorer les
    exemples écrits dans les commentaires du fichier.
    """
    bloc = re.search(r"const DOCUMENTS\s*=\s*\{(.*?)\n\};", texte, re.DOTALL)
    if not bloc:
        raise SystemExit(f"Objet DOCUMENTS introuvable dans {FICHIER_DONNEES}")

    motif = re.compile(
        r'"(?P<id>[^"]+)"\s*:\s*\{\s*titre:\s*"(?P<titre>[^"]*)"\s*,\s*fichier:\s*"(?P<fichier>[^"]+)"\s*\}'
    )
    return [Document(m["id"], m["titre"], m["fichier"]) for m in motif.finditer(bloc.group(1))]


# --------------------------------------------------------------------------
# Traitement des PDF
# --------------------------------------------------------------------------

def trouver_source(document: Document) -> Path | None:
    """Cherche le PDF à son emplacement actuel, puis sous son ancien nom."""
    for chemin in (document.fichier, ANCIENS_NOMS.get(document.fichier)):
        if chemin and (RACINE / chemin).is_file():
            return RACINE / chemin
    return None


def sujet_du_document(document: Document) -> str:
    """Déduit le sujet à partir du sous-dossier : pdfs/<categorie>/fichier.pdf."""
    parties = Path(document.fichier).parts
    categorie = parties[1] if len(parties) > 2 else ""
    return SUJETS.get(categorie, "Document")


def preparer_pdf(source: Path, destination: Path, document: Document, auteur: str) -> tuple[int, int]:
    """Écrit une copie du PDF avec ses propriétés renseignées.

    Retourne (taille avant, taille après) en octets.
    """
    from pypdf import PdfReader, PdfWriter  # importé ici : --verifier fonctionne sans pypdf

    lecteur = PdfReader(source)
    redacteur = PdfWriter(clone_from=lecteur)

    redacteur.add_metadata({
        "/Title": document.titre,
        "/Author": auteur,
        "/Subject": f"{sujet_du_document(document)} — Portfolio de {auteur}",
        "/Keywords": "automatisme, informatique industrielle, GEII, CRSA, " + auteur,
        "/Creator": SITE_WEB,
    })

    # Le lecteur PDF affiche le titre du document plutôt que le nom du fichier
    redacteur.create_viewer_preferences()
    redacteur.viewer_preferences.display_doctitle = True

    # Compression sans perte : objets identiques fusionnés, objets inutilisés supprimés
    redacteur.compress_identical_objects()

    tampon = io.BytesIO()
    redacteur.write(tampon)
    contenu = tampon.getvalue()

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(contenu)
    return source.stat().st_size, len(contenu)


def lister_orphelins(documents: list[Document]) -> list[Path]:
    """PDF présents dans pdfs/ mais absents de DOCUMENTS (et pas d'anciens noms)."""
    utilises = {(RACINE / d.fichier).resolve() for d in documents}
    utilises |= {(RACINE / ancien).resolve() for ancien in ANCIENS_NOMS.values()}
    return sorted(p for p in DOSSIER_PDF.rglob("*.pdf") if p.resolve() not in utilises)


def taille_lisible(octets: int) -> str:
    return f"{octets / 1_048_576:.1f} Mo" if octets >= 1_048_576 else f"{octets / 1024:.0f} ko"


# --------------------------------------------------------------------------
# Programme principal
# --------------------------------------------------------------------------

def main() -> int:
    parametres = argparse.ArgumentParser(description="Prépare les PDF listés dans js/donnees.js.")
    parametres.add_argument("--verifier", action="store_true",
                            help="contrôle les fichiers sans rien écrire")
    parametres.add_argument("--sortie", type=Path, default=RACINE,
                            help="dossier où écrire les PDF (par défaut : la racine du site)")
    options = parametres.parse_args()

    # Accents et flèches lisibles même dans une console Windows
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    texte =FICHIER_DONNEES.read_text(encoding="utf-8")
    auteur = lire_auteur(texte)
    documents = lire_documents(texte)
    print(f"{len(documents)} documents trouvés dans {FICHIER_DONNEES.relative_to(RACINE)}\n")

    manquants = []
    for document in documents:
        source = trouver_source(document)
        if source is None:
            manquants.append(document)
            print(f"  [MANQUANT] {document.fichier}")
            continue

        if options.verifier:
            etat = "OK" if source == RACINE / document.fichier else "À DÉPLACER"
            print(f"  [{etat:^10}] {document.fichier}")
            continue

        destination = options.sortie / document.fichier
        avant, apres = preparer_pdf(source, destination, document, auteur)
        print(f"  [ OK ] {document.fichier}  ({taille_lisible(avant)} → {taille_lisible(apres)})")

    orphelins = lister_orphelins(documents)
    if orphelins:
        print("\nPDF non référencés dans donnees.js :")
        for chemin in orphelins:
            print(f"  - {chemin.relative_to(RACINE)}")

    if manquants:
        print(f"\n{len(manquants)} document(s) introuvable(s) : liens cassés sur le site.")
        return 1
    print("\nTerminé.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
