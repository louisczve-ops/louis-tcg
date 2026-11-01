// Assemblage de l'accueil à l'ouverture, comme si le visiteur montait la page :
// 1. pendant que le rideau se lève : grille de plan + emplacements en pointillés ;
// 2. puis chaque bloc arrive de son côté et s'emboîte avec un « clic » vert.
// Ne joue qu'avec l'animation d'ouverture (une fois par visite, sur l'accueil).
(function(){
  var d = document.documentElement;
  if (!d.classList.contains("intro-joue")) return;
  d.classList.add("assemble");
  var vue = document.getElementById("vue");

  var T_PLAN = 1550;          // le plan se dessine juste avant que le rideau se lève (1,7 s)
  var ATTENTE_BLOCS = 1.4;    // puis les blocs arrivent, une fois le rideau parti
  var DUREE = 0.75, ECART = 0.12;
  var RESSORT = "cubic-bezier(.34,1.38,.64,1)";

  // Ordre de montage, direction d'arrivée et nom affiché dans l'emplacement
  var PLAN = [
    [".bandeau", "translateY(-110%)", "En-tête", document],
    [".hero-s", "translateX(-80px) rotate(-1.2deg)", "Accueil"],
    [".section-t", "translateX(-50px)", "Titre"],
    [".vitrine .carte-v", "translateY(90px) rotate(var(--rot))", "Carte"],
    [".atouts", "translateY(70px)", "Atouts"],
    [".confiance .bloc", "translateX(var(--cote))", "Bloc"],
    ["#vue > .accueil > .panneau", "translateY(60px)", "Section"]
  ];

  var demarre = false, fini = false, plan, grille, blocs = [], interieurs = [], minuteurs = [];

  function dessiner(attenteBlocs){
    if (demarre || fini) return;
    demarre = true;
    // éléments du haut de page, dans l'ordre du montage
    var vus = [];
    PLAN.forEach(function(p){
      var racine = p[3] || vue;
      racine.querySelectorAll(p[0]).forEach(function(el, i){
        if (vus.indexOf(el) !== -1) return;
        vus.push(el);
        blocs.push({ el: el, depuis: p[1], nom: p[2] + (p[2] === "Carte" ? " " + (i + 1) : ""), i: i, sel: p[0] });
      });
    });
    // on mesure sans les animations en cours, pour obtenir la position finale
    blocs.forEach(function(b){ b.el.style.animation = "none"; });
    var limite = innerHeight + 40;
    blocs = blocs.filter(function(b){
      var r = b.el.getBoundingClientRect();
      b.r = { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
      if (r.top > limite || !r.width){ b.el.style.animation = ""; return false; }
      return true;
    });

    grille = document.createElement("div"); grille.className = "asm-grille";
    plan = document.createElement("div"); plan.className = "asm-plan"; plan.setAttribute("aria-hidden", "true");
    blocs.forEach(function(b, k){
      var t = document.createElement("div");
      t.className = "asm-trou" + (b.sel === ".bandeau" ? " bandeau-t" : "");
      t.style.cssText = "left:" + b.r.x + "px;top:" + b.r.y + "px;width:" + b.r.w + "px;height:" + b.r.h + "px;--t:" + (0.2 + k * 0.06).toFixed(2) + "s";
      t.innerHTML = "<span>" + b.nom + "</span>";
      plan.appendChild(t);
    });
    document.body.prepend(plan);
    document.body.prepend(grille);
    requestAnimationFrame(function(){ grille.classList.add("on"); });

    // arrivée de chaque bloc, puis « clic »
    var t = attenteBlocs, fin = 0;
    blocs.forEach(function(b){
      var el = b.el;
      if (b.sel === ".vitrine .carte-v") el.style.setProperty("--rot", (b.i % 2 ? 5 : -5) + "deg");
      if (b.sel === ".confiance .bloc") el.style.setProperty("--cote", (b.i % 2 ? 80 : -80) + "px");
      el.style.setProperty("--asm-from", b.depuis);
      el.style.animation = "asm-in " + DUREE + "s " + RESSORT + " " + t.toFixed(2) + "s backwards, " +
                           "asm-clic .55s ease-out " + (t + DUREE * 0.62).toFixed(2) + "s forwards";
      if (b.sel === ".hero-s") interieurHero(el, t + DUREE * 0.7);
      fin = Math.max(fin, t + DUREE + 0.55);
      t += b.sel === ".vitrine .carte-v" ? 0.09 : ECART;
    });
    minuteurs.push(setTimeout(function(){ plan.classList.add("off"); grille.classList.remove("on"); }, (fin - 0.3) * 1000));
    minuteurs.push(setTimeout(nettoyer, (fin + 0.6) * 1000));
  }

  // Une fois l'accueil calé : le texte arrive en cascade et les cartes sont distribuées
  function interieurHero(hero, t){
    var txt = hero.querySelectorAll(":scope > div:first-child > *");
    txt.forEach(function(e, k){
      e.style.animation = "asm-monte .7s cubic-bezier(.2,.8,.2,1) " + (t + k * 0.09).toFixed(2) + "s both";
      interieurs.push(e);
    });
    [0, 2, 1].forEach(function(n, k){
      var s = hero.querySelectorAll(".pile-s .slab")[n];
      if (!s) return;
      s.style.animation = "asm-distribue .8s cubic-bezier(.2,.9,.25,1.05) " + (t + 0.25 + k * 0.12).toFixed(2) + "s both";
      interieurs.push(s);
    });
  }

  function nettoyer(){
    if (fini) return;
    fini = true;
    minuteurs.forEach(clearTimeout);
    // on retire d'abord les animations d'entrée générales pour qu'elles ne se rejouent pas
    d.classList.remove("anim", "assemble");
    blocs.concat(interieurs.map(function(e){ return { el: e }; })).forEach(function(b){
      b.el.style.animation = "";
      b.el.style.removeProperty("--asm-from");
      b.el.style.removeProperty("--rot");
      b.el.style.removeProperty("--cote");
    });
    if (plan) plan.remove();
    if (grille) grille.remove();
  }

  // Si l'accueil est redessiné pendant le montage (données arrivées tard), on affiche tout de suite.
  new MutationObserver(function(){
    if (!demarre || fini) return;
    d.classList.remove("intro-tempo");
    nettoyer();
  }).observe(vue, { childList: true });

  minuteurs.push(setTimeout(function(){ dessiner(ATTENTE_BLOCS); }, T_PLAN));
  // Animation d'ouverture passée d'un clic ou d'une touche : on monte la page aussitôt.
  function passer(){ if (!demarre){ minuteurs.forEach(clearTimeout); minuteurs = []; dessiner(0.45); } }
  document.addEventListener("click", function(e){ if (e.target.closest && e.target.closest("#intro")) passer(); });
  document.addEventListener("keydown", passer, { once: true });
})();
