// Motion design du site. Chargé après app.js : il observe le contenu affiché
// par le routeur (#vue) et y ajoute les animations, sans toucher au rendu.
(function(){
  var reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduit) return;
  var d = document.documentElement;
  var vue = document.getElementById("vue");
  if (!vue) return;

  // ---- Apparitions au défilement ----
  // Une « clé » identifie chaque bloc dans la rubrique (type + rang) : quand les
  // données se rafraîchissent et que la page est redessinée, un bloc déjà vu
  // réapparaît tel quel, sans rejouer son animation.
  var CIBLES = [".section-t", ".vitrine .carte-v", ".atouts", ".confiance .bloc", ".tete-liste",
    ".annonce", ".tuile", ".resume", ".global", ".eres-prog .ere-prog", ".fil-nv li", ".jour",
    ".avis-liste li", ".note-moy", ".suivre", ".cgu > div", ".bloc-titre", ".cases"];
  var dejaVus = {};
  var io = new IntersectionObserver(function(entrees){
    var n = 0;
    entrees.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target;
      el.style.setProperty("--rd", Math.min(n * 0.06, 0.36) + "s");
      el.classList.add("vu");
      dejaVus[el.dataset.cle] = true;
      io.unobserve(el);
      n++;
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  function introEnCours(){ return d.classList.contains("anim"); }

  function preparer(){
    io.disconnect();
    CIBLES.forEach(function(sel, s){
      var els = vue.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++){
        var el = els[i];
        if (el.classList.contains("rv")) continue;
        // pendant l'animation d'ouverture, le haut de l'accueil est déjà animé par intro.css
        if (introEnCours() && el.matches(".vitrine .carte-v")) continue;
        var cle = s + "-" + i;
        el.dataset.cle = cle;
        el.classList.add("rv");
        if (dejaVus[cle]) el.classList.add("vu", "deja");
        else io.observe(el);
      }
    });
    photos();
    inclinables();
    compteurs();
  }

  // ---- Photos : fondu à la fin du chargement ----
  function photos(){
    vue.querySelectorAll(".slab img:not([data-m])").forEach(function(img){
      img.dataset.m = "1";
      if (img.complete && img.naturalWidth) return;
      img.classList.add("img-att");
      var ok = function(){ img.classList.remove("img-att"); };
      img.addEventListener("load", ok, { once: true });
      img.addEventListener("error", ok, { once: true });
    });
  }

  // ---- Cartes inclinables (souris uniquement) ----
  var souris = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  function inclinables(){
    if (!souris) return;
    vue.querySelectorAll(".vitrine .carte-v, .annonce .slab").forEach(function(el){ el.classList.add("tiltable"); });
  }
  var actif = null, raf = 0, dernier = null;
  function appliquer(){
    raf = 0;
    if (!actif || !dernier) return;
    var r = actif.getBoundingClientRect();
    var x = (dernier.clientX - r.left) / r.width, y = (dernier.clientY - r.top) / r.height;
    actif.style.setProperty("--ry", ((x - .5) * 10).toFixed(2) + "deg");
    actif.style.setProperty("--rx", ((.5 - y) * 10).toFixed(2) + "deg");
    actif.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
    actif.style.setProperty("--my", (y * 100).toFixed(1) + "%");
  }
  function relacher(){
    if (!actif) return;
    actif.classList.remove("tilt");
    actif.style.removeProperty("--rx"); actif.style.removeProperty("--ry");
    actif = null;
  }
  if (souris){
    document.addEventListener("pointermove", function(e){
      var el = e.target.closest && e.target.closest(".tiltable");
      if (el !== actif){ relacher(); if (el){ actif = el; el.classList.add("tilt"); } }
      if (!actif) return;
      dernier = e;
      if (!raf) raf = requestAnimationFrame(appliquer);
    }, { passive: true });
    document.addEventListener("pointerleave", relacher);
    window.addEventListener("blur", relacher);
  }

  // ---- Chiffres du héros qui défilent jusqu'à leur valeur ----
  function compteurs(){
    var zone = vue.querySelector(".chiffres-s:not([data-m])");
    if (!zone) return;
    // tant que les annonces ne sont pas chargées, les chiffres valent 0 : on attend le vrai rendu
    if (!/[1-9]/.test(zone.textContent)) return;
    zone.dataset.m = "1";
    // Un seul départ par rubrique : si la page est redessinée pendant le défilement,
    // les nouveaux chiffres reprennent la même chronologie au lieu de recommencer.
    if (!dejaVus["chiffres"]){
      var attente = d.classList.contains("intro-tempo") ? 3700 : (introEnCours() ? 900 : 350);
      dejaVus["chiffres"] = performance.now() + attente;
    }
    var debut = dejaVus["chiffres"], duree = 1100;
    if (performance.now() - debut >= duree) return;
    zone.querySelectorAll("b").forEach(function(b){
      var m = b.textContent.match(/^(\d[\d\s\u00a0\u202f]*(?:[.,]\d+)?)(.*)$/);
      if (!m) return;
      var brut = m[1].replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
      var cible = parseFloat(brut);
      if (!isFinite(cible)) return;
      var dec = (brut.split(".")[1] || "").length, suite = m[2], fin = b.textContent;
      var fmt = function(v){ return v.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suite; };
      (function pas(){
        if (!b.isConnected) return;
        var p = Math.max(0, Math.min((performance.now() - debut) / duree, 1)), e = 1 - Math.pow(1 - p, 3);
        b.textContent = p < 1 ? fmt(cible * e) : fin;
        if (p < 1) requestAnimationFrame(pas);
      })();
    });
  }

  // ---- Transition de page à chaque changement de rubrique ----
  // On repère un changement de rubrique en comparant l'adresse au dernier rendu traité.
  var derniere = location.hash;
  new MutationObserver(function(){
    if (location.hash !== derniere){
      derniere = location.hash;
      dejaVus = {};
      vue.classList.remove("page-in"); void vue.offsetWidth; vue.classList.add("page-in");
    }
    preparer();
    pastille();
  }).observe(vue, { childList: true });

  // ---- Menu : pastille glissante ----
  var nav = document.querySelector(".nav");
  var pas_ = null;
  function pastille(){
    if (!nav) return;
    if (!pas_){
      pas_ = document.createElement("span");
      pas_.className = "nav-pastille cachee";
      pas_.setAttribute("aria-hidden", "true");
      nav.prepend(pas_);
      nav.classList.add("a-pastille");
      requestAnimationFrame(function(){ pas_.style.transition = "none"; placer(); void pas_.offsetWidth; pas_.style.transition = ""; });
      return;
    }
    placer();
  }
  function placer(){
    var a = nav.querySelector('a[aria-current="page"]');
    if (!a){ pas_.classList.add("cachee"); return; }
    pas_.classList.remove("cachee");
    pas_.style.width = a.offsetWidth + "px";
    pas_.style.height = a.offsetHeight + "px";
    pas_.style.transform = "translate(" + a.offsetLeft + "px," + a.offsetTop + "px)";
  }
  window.addEventListener("resize", function(){ if (pas_) placer(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (pas_) placer(); });

  // ---- Bandeau resserré au défilement ----
  var bandeau = document.querySelector(".bandeau"), serre = false;
  window.addEventListener("scroll", function(){
    var s = scrollY > 24;
    if (s !== serre){ serre = s; bandeau.classList.toggle("serre", s); }
  }, { passive: true });

  preparer();
  pastille();
})();
