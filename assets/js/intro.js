// Animation d'ouverture : décidée avant l'affichage pour éviter tout clignotement.
// Jouée une fois par visite, seulement en arrivant sur l'accueil,
// jamais si le visiteur a réduit les animations sur son appareil.
(function(){
  var d = document.documentElement;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var vue = false;
  try { vue = sessionStorage.getItem("intro-vue") === "1"; } catch (e) {}
  var accueil = !location.hash || location.hash === "#";
  d.classList.add("anim");
  if (!vue && accueil) {
    d.classList.add("intro-joue", "intro-tempo");
    try { sessionStorage.setItem("intro-vue", "1"); } catch (e) {}
  }
  // passe = true quand le visiteur saute l'animation : le contenu arrive alors tout de suite.
  function fin(passe){
    if (!d.classList.contains("intro-joue")) return;
    d.classList.remove("intro-joue");
    if (passe === true) d.classList.remove("intro-tempo");
    d.classList.add("intro-fin");
    var i = document.getElementById("intro");
    if (i) i.remove();
  }
  if (d.classList.contains("intro-joue")) {
    setTimeout(fin, 2900);
    document.addEventListener("click", function(e){ if (e.target.closest && e.target.closest("#intro")) fin(true); });
    document.addEventListener("keydown", function(){ fin(true); }, { once: true });
  }
  // Après l'entrée, on retire les animations pour qu'un rafraîchissement des données ne les rejoue pas.
  setTimeout(function(){ d.classList.remove("anim"); }, 5600);
})();
