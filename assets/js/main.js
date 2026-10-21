/* Rendu des sections à partir de data.js + interactions de la page */
(function () {
  "use strict";

  var D = window.PORTFOLIO;
  if (!D) return;

  var TYPE_LABEL = { experience: "Expérience", formation: "Formation", projet: "Projet" };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var docsByCode = {};
  D.documents.forEach(function (d) { docsByCode[d.code] = d; });

  // Entrées du parcours qui citent chaque document (sert à la recherche)
  var parcoursByDoc = {};
  D.parcours.forEach(function (p) {
    (p.docs || []).forEach(function (code) { (parcoursByDoc[code] = parcoursByDoc[code] || []).push(p); });
  });

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function normalize(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  function thumbOf(doc) {
    return "assets/thumbs/" + doc.fichier.split("/").pop().replace(/\.pdf$/i, ".jpg");
  }
  function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

  var ICON_DL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function keywordsHtml(list) {
    if (!list || !list.length) return "";
    return '<ul class="keywords">' + list.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul>";
  }
  function pointsHtml(list) {
    if (!list || !list.length) return "";
    return '<ul class="tl-points">' + list.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul>";
  }

  function docCardHtml(doc) {
    return (
      '<article class="doc-card" data-cat="' + esc(doc.cat) + '" data-code="' + esc(doc.code) + '">' +
        '<div class="doc-thumb"><img src="' + esc(thumbOf(doc)) + '" alt="" loading="lazy" decoding="async"></div>' +
        '<div class="doc-body">' +
          '<p class="doc-code"><b>' + esc(doc.code) + "</b><span>" + esc(doc.type) + "</span></p>" +
          '<h4><a class="doc-open" href="' + esc(doc.fichier) + '" target="_blank" rel="noopener">' + esc(doc.titre) + "</a></h4>" +
          '<div class="doc-foot">' +
            '<span class="doc-meta">' + doc.pages + " p. · " + esc(doc.taille) + "</span>" +
            '<a class="doc-dl" href="' + esc(doc.fichier) + '" download aria-label="Télécharger : ' + esc(doc.titre) + '" title="Télécharger">' + ICON_DL + "</a>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  /* ---------- Chiffres clés ---------- */
  function renderStats() {
    var counts = {
      experiences: D.parcours.filter(function (p) { return p.type === "experience"; }).length,
      projets: D.parcours.filter(function (p) { return p.type === "projet"; }).length,
      documents: D.documents.length
    };
    Object.keys(counts).forEach(function (k) {
      var el = $('[data-stat="' + k + '"]');
      if (el) el.textContent = counts[k];
    });
  }

  /* ---------- Réalisations ---------- */
  function renderWorks() {
    var grid = $("#work-grid");
    var works = D.parcours.filter(function (p) { return p.une; });
    grid.innerHTML = works.map(function (p, i) {
      var feature = i === 0;
      var nDocs = (p.docs || []).length;
      return (
        '<article class="work-card reveal' + (feature ? " is-feature" : "") + '">' +
          '<div class="work-media' + (p.imageFit === "contain" ? " is-contain" : "") + '">' +
            '<img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || "") + '" loading="lazy" decoding="async">' +
            '<span class="tag"><span class="dot dot-' + p.type + '" aria-hidden="true"></span>' + TYPE_LABEL[p.type] + "</span>" +
          "</div>" +
          '<div class="work-body">' +
            '<p class="work-meta">' + (feature ? '<span class="feature-flag">À la une · </span>' : "") + esc(p.organisme) + "</p>" +
            '<h3><button class="work-link" type="button" data-id="' + esc(p.id) + '">' + esc(p.titre) + "</button></h3>" +
            '<p class="work-summary">' + esc(p.resume) + "</p>" +
            (feature ? keywordsHtml(p.motsCles) : "") +
            '<div class="work-foot"><span>' + esc(p.periode) + " · " + plural(nDocs, "doc.", "docs") + '</span><span class="more">Voir la fiche →</span></div>' +
          "</div>" +
        "</article>"
      );
    }).join("");

    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".work-card");
      if (!card) return;
      openSheet($(".work-link", card).dataset.id);
    });
  }

  /* ---------- Fiche détaillée ---------- */
  var sheet = $("#sheet");
  var sheetContent = $("#sheet-content");

  function openSheet(id) {
    var p = D.parcours.filter(function (x) { return x.id === id; })[0];
    if (!p || !sheet) return;
    var docs = (p.docs || []).map(function (c) { return docsByCode[c]; }).filter(Boolean);

    sheetContent.innerHTML =
      '<button class="icon-btn sheet-close" type="button" data-close aria-label="Fermer la fiche">' + ICON_CLOSE + "</button>" +
      (p.image ? '<div class="sheet-media' + (p.imageFit === "contain" ? " is-contain" : "") + '"><img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || "") + '"></div>' : "") +
      '<div class="sheet-body">' +
        "<div>" +
          '<p class="tag" style="color: var(--c-' + p.type + '); margin-bottom: 8px;"><span class="dot dot-' + p.type + '" aria-hidden="true"></span>' + TYPE_LABEL[p.type] + "</p>" +
          '<h2 id="sheet-title">' + esc(p.titre) + "</h2>" +
        "</div>" +
        '<dl class="sheet-specs">' +
          "<div><dt>Organisme</dt><dd>" + esc(p.organisme) + "</dd></div>" +
          "<div><dt>Période</dt><dd>" + esc(p.periode) + "</dd></div>" +
          "<div><dt>Durée</dt><dd>" + esc(p.duree || "—") + "</dd></div>" +
        "</dl>" +
        '<div class="sheet-section"><h3>Missions &amp; réalisations</h3>' + pointsHtml(p.points) + "</div>" +
        (p.motsCles ? '<div class="sheet-section"><h3>Mots-clés</h3>' + keywordsHtml(p.motsCles) + "</div>" : "") +
        (docs.length ? '<div class="sheet-section"><h3>Documents (' + docs.length + ')</h3><div class="sheet-docs">' + docs.map(docCardHtml).join("") + "</div></div>" : "") +
      "</div>";

    sheet.showModal();
    sheet.scrollTop = 0;
    $(".sheet-close", sheet).focus();
  }

  if (sheet) {
    sheet.addEventListener("click", function (e) {
      if (e.target === sheet || e.target.closest("[data-close]")) sheet.close();
    });
  }

  /* ---------- Parcours ---------- */
  function renderTimeline() {
    var list = $("#timeline");
    list.innerHTML = D.parcours.map(function (p) {
      var parts = p.periode.split(" – ");
      var docs = (p.docs || []).map(function (c) { return docsByCode[c]; }).filter(Boolean);
      return (
        '<li class="tl-item' + (p.aVenir ? " is-future" : "") + (p.enCours ? " is-current" : "") + '" data-type="' + p.type + '">' +
          '<div class="tl-date"><strong>' + esc(parts[0]) + "</strong>" + (parts[1] ? '<span class="tl-end">' + esc(parts[1]) + "</span>" : "") + "</div>" +
          '<div class="tl-rail" aria-hidden="true"><span class="tl-node"></span></div>' +
          '<article class="tl-card">' +
            '<div class="tl-top">' +
              '<span class="tag tl-type">' + TYPE_LABEL[p.type] + "</span>" +
              (p.aVenir ? '<span class="tl-badge">À venir</span>' : "") +
              (p.enCours ? '<span class="tl-badge">En cours</span>' : "") +
              (p.duree && !p.aVenir ? '<span class="tl-dur">' + esc(p.duree) + "</span>" : "") +
            "</div>" +
            "<h3>" + esc(p.titre) + "</h3>" +
            '<p class="tl-org">' + esc(p.organisme) + "</p>" +
            pointsHtml(p.points) +
            keywordsHtml(p.motsCles) +
            (docs.length ? '<ul class="tl-docs" aria-label="Documents liés">' + docs.map(function (d) {
              return '<li><a class="doc-chip" href="' + esc(d.fichier) + '" target="_blank" rel="noopener"><span class="code">' + esc(d.code) + "</span>" + esc(d.titre) + '<span class="meta">' + d.pages + " p.</span></a></li>";
            }).join("") + "</ul>" : "") +
          "</article>" +
        "</li>"
      );
    }).join("");

    var chips = $all("#timeline-filters .chip");
    chips.forEach(function (chip) {
      var f = chip.dataset.filter;
      var n = f === "all" ? D.parcours.length : D.parcours.filter(function (p) { return p.type === f; }).length;
      $(".chip-count", chip).textContent = n;
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        applyTimelineFilter(f);
      });
    });
    applyTimelineFilter("all");
  }

  function applyTimelineFilter(f) {
    var items = $all("#timeline .tl-item");
    var last = null;
    items.forEach(function (li) {
      var show = f === "all" || li.dataset.type === f;
      li.hidden = !show;
      li.classList.remove("is-last");
      if (show) last = li;
    });
    if (last) last.classList.add("is-last");
  }

  /* ---------- Compétences ---------- */
  function renderSkills() {
    $("#skills").innerHTML = D.competences.map(function (g, i) {
      return (
        '<section class="skill-group reveal">' +
          "<h3>" + esc(g.groupe) + '<span class="code">' + String(i + 1).padStart(2, "0") + "</span></h3>" +
          '<ul class="skill-list">' + g.items.map(function (it) {
            var n = it[1], bars = "";
            for (var k = 1; k <= 5; k++) bars += '<i class="' + (k <= n ? "on" : "") + '"></i>';
            return (
              '<li class="skill">' +
                '<span class="skill-name">' + esc(it[0]) + "</span>" +
                '<span class="meter" role="img" aria-label="Niveau ' + n + ' sur 5">' + bars + "</span>" +
                '<span class="skill-val" aria-hidden="true">' + n + "/5</span>" +
              "</li>"
            );
          }).join("") + "</ul>" +
        "</section>"
      );
    }).join("");

    $("#referentiel").innerHTML = D.referentiel.map(function (b) {
      return (
        '<section class="ref-block" data-bloc="' + esc(b.cle) + '">' +
          "<h4>" + esc(b.bloc) + "</h4>" +
          '<ul class="ref-list">' + b.items.map(function (it) {
            var links = it.docs.map(function (c) {
              var d = docsByCode[c];
              if (!d) return "";
              return '<a href="' + esc(d.fichier) + '" target="_blank" rel="noopener" title="' + esc(d.titre) + '" aria-label="Ouvrir : ' + esc(d.titre) + '">' + esc(d.code) + " ↗</a>";
            }).join("");
            return (
              '<li class="ref-item"><span class="code">' + esc(it.code) + "</span>" +
                "<div>" + esc(it.texte) + '<div class="ref-links">' + links + "</div></div>" +
              "</li>"
            );
          }).join("") + "</ul>" +
        "</section>"
      );
    }).join("");
  }

  /* ---------- Documents ---------- */
  var docState = { cat: "all", q: "" };

  function renderDocuments() {
    var groups = $("#doc-groups");
    groups.innerHTML = D.categoriesDocuments.map(function (cat, i) {
      var docs = D.documents.filter(function (d) { return d.cat === cat.id; });
      return (
        '<section class="doc-group" data-cat="' + esc(cat.id) + '">' +
          '<div class="doc-group-head">' +
            '<span class="code">' + String(i + 1).padStart(2, "0") + "</span>" +
            "<h3>" + esc(cat.label) + "</h3>" +
            '<span class="count">' + plural(docs.length, "document", "documents") + "</span>" +
          "</div>" +
          '<div class="doc-grid">' + docs.map(docCardHtml).join("") + "</div>" +
        "</section>"
      );
    }).join("");

    // Texte de recherche : titre, code, catégorie + mots-clés des projets liés
    $all(".doc-card", groups).forEach(function (card) {
      var d = docsByCode[card.dataset.code];
      var cat = D.categoriesDocuments.filter(function (c) { return c.id === d.cat; })[0];
      var extra = (parcoursByDoc[d.code] || []).map(function (p) {
        return [p.titre, p.organisme].concat(p.motsCles || []).join(" ");
      }).join(" ");
      card.dataset.search = normalize([d.code, d.titre, d.type, cat ? cat.label : "", extra].join(" "));
    });

    var filters = $("#doc-filters");
    var all = [{ id: "all", court: "Tout" }].concat(D.categoriesDocuments);
    filters.innerHTML = all.map(function (c) {
      var n = c.id === "all" ? D.documents.length : D.documents.filter(function (d) { return d.cat === c.id; }).length;
      return '<button type="button" class="chip" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === "all") + '">' + esc(c.court) + ' <span class="chip-count">' + n + "</span></button>";
    }).join("");

    filters.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      $all(".chip", filters).forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      docState.cat = chip.dataset.cat;
      applyDocFilter();
    });

    $("#doc-search").addEventListener("input", function (e) {
      docState.q = normalize(e.target.value.trim());
      applyDocFilter();
    });
  }

  function applyDocFilter() {
    var terms = docState.q.split(/\s+/).filter(Boolean);
    var total = 0;
    $all("#doc-groups .doc-group").forEach(function (group) {
      var visible = 0;
      var catOk = docState.cat === "all" || group.dataset.cat === docState.cat;
      $all(".doc-card", group).forEach(function (card) {
        var show = catOk && terms.every(function (t) { return card.dataset.search.indexOf(t) !== -1; });
        card.hidden = !show;
        if (show) visible++;
      });
      group.hidden = visible === 0;
      $(".count", group).textContent = plural(visible, "document", "documents");
      total += visible;
    });
    $("#doc-empty").hidden = total !== 0;
  }

  /* ---------- Thème ---------- */
  function initTheme() {
    var btn = $("#theme-toggle");
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    function current() {
      return document.documentElement.dataset.theme || (mq.matches ? "dark" : "light");
    }
    function label() {
      btn.setAttribute("aria-label", current() === "dark" ? "Passer au thème clair" : "Passer au thème sombre");
    }
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      label();
    });
    label();
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var topbar = $("#topbar");
    var nav = $("#nav");
    var menuBtn = $("#menu-toggle");

    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    }
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });

    var rocket = $("#rocket");
    function onScroll() {
      var y = window.scrollY;
      topbar.classList.toggle("is-scrolled", y > 8);
      if (!rocket.classList.contains("is-launching")) rocket.classList.toggle("is-visible", y > 900);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    rocket.addEventListener("click", function () {
      if (reduceMotion) { window.scrollTo(0, 0); return; }
      rocket.classList.add("is-launching");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(function () {
        rocket.classList.remove("is-launching");
        onScroll();
      }, 900);
    });

    // Section active dans la barre de navigation
    if ("IntersectionObserver" in window) {
      var links = {};
      $all(".nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          $all(".nav a").forEach(function (a) { a.classList.remove("is-active"); });
          if (links[en.target.id]) links[en.target.id].classList.add("is-active");
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $all("main > section[id]").forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---------- Contact ---------- */
  function initCopy() {
    var btn = $("#copy-mail");
    if (!btn) return;
    var original = btn.textContent;
    btn.addEventListener("click", function () {
      var done = function (ok) {
        btn.textContent = ok ? "Adresse copiée ✓" : "Copie impossible";
        btn.classList.toggle("is-done", ok);
        setTimeout(function () { btn.textContent = original; btn.classList.remove("is-done"); }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(btn.dataset.mail).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  }

  /* ---------- Apparition au défilement ---------- */
  function initReveal() {
    var els = $all(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  renderStats();
  renderWorks();
  renderTimeline();
  renderSkills();
  renderDocuments();
  initTheme();
  initNav();
  initCopy();
  initReveal();
})();
