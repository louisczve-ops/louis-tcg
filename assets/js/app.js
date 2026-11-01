// Extensions : [id, nom FR, code, date, cartes numérotées, total de la série principale, sous-séries]
// sous-série : [préfixe, libellé, nombre]
const ERES = [
 {nom:"Épée et Bouclier", periode:"2020 – 2023", sets:[
  ["swsh1","Épée et Bouclier","SWSH1","Fév. 2020",202,216],
  ["swsh2","Clash des Rebelles","SWSH2","Mai 2020",192,209],
  ["swsh3","Ténèbres Embrasées","SWSH3","Août 2020",189,201],
  ["swsh35","La Voie du Maître","SWSH3.5","Sept. 2020",73,80],
  ["swsh4","Voltage Éclatant","SWSH4","Nov. 2020",185,203],
  ["swsh45","Destinées Radieuses","SWSH4.5","Fév. 2021",72,73,[["SV","Coffre chromatique",122]]],
  ["swsh5","Styles de Combat","SWSH5","Mars 2021",163,183],
  ["swsh6","Règne de Glace","SWSH6","Juin 2021",198,233],
  ["swsh7","Évolution Céleste","SWSH7","Août 2021",203,237],
  ["cel25","Célébrations","CEL25","Oct. 2021",25,25,[["CC","Collection classique",25]]],
  ["swsh8","Poing de Fusion","SWSH8","Nov. 2021",264,284],
  ["swsh9","Stars Étincelantes","SWSH9","Fév. 2022",172,186,[["TG","Galerie de dresseurs",30]]],
  ["swsh10","Astres Radieux","SWSH10","Mai 2022",189,216,[["TG","Galerie de dresseurs",30]]],
  ["pgo","Pokémon GO","PGO","Juil. 2022",78,88],
  ["swsh11","Origine Perdue","SWSH11","Sept. 2022",196,217,[["TG","Galerie de dresseurs",30]]],
  ["swsh12","Tempête Argentée","SWSH12","Nov. 2022",195,215,[["TG","Galerie de dresseurs",30]]],
  ["swsh125","Zénith Suprême","SWSH12.5","Janv. 2023",159,160,[["GG","Galerie de Galar",70]]]
 ]},
 {nom:"Écarlate et Violet", periode:"2023 – 2025", sets:[
  ["sv1","Écarlate et Violet","SV1","Mars 2023",198,258],
  ["sv2","Évolutions à Paldea","SV2","Juin 2023",193,279],
  ["sv3","Flammes Obsidiennes","SV3","Août 2023",197,230],
  ["sv35","151","SV3.5","Sept. 2023",165,207],
  ["sv4","Faille Paradoxe","SV4","Nov. 2023",182,266],
  ["sv45","Destinées de Paldea","SV4.5","Janv. 2024",91,245],
  ["sv5","Forces Temporelles","SV5","Mars 2024",162,218],
  ["sv6","Mascarade Crépusculaire","SV6","Mai 2024",167,226],
  ["sv65","Fable Nébuleuse","SV6.5","Août 2024",64,99],
  ["sv7","Couronne Stellaire","SV7","Sept. 2024",142,175],
  ["sv8","Étincelles Déferlantes","SV8","Nov. 2024",191,252],
  ["sv85","Évolutions Prismatiques","SV8.5","Janv. 2025",131,180],
  ["sv9","Aventures Ensemble","SV9","Mars 2025",159,190],
  ["sv10","Rivalités Destinées","SV10","Mai 2025",182,244],
  ["blk","Foudre Noire","BLK","Juil. 2025",86,172],
  ["wht","Flamme Blanche","WHT","Juil. 2025",86,173]
 ]},
 {nom:"Méga-Évolution", periode:"2025 – aujourd'hui", sets:[
  ["me1","Méga-Évolution","ME1","Sept. 2025",132,188],
  ["me2","Flammes Fantasmagoriques","ME2","Nov. 2025",94,130],
  ["me25","Héros Transcendants","ME2.5","Janv. 2026",217,295],
  ["me3","Équilibre Parfait","ME3","Mars 2026",88,124],
  ["me4","Chaos Ascendant","ME4","Mai 2026",86,122],
  ["me5","Nuit Noire","ME5","Juil. 2026",84,120],
  ["30a","30e Anniversaire","30A","Sept. 2026",128,161,[["CC","Collection classique",30]]]
 ]}
];

const SETS = {};
ERES.forEach(e=>e.sets.forEach(s=>{
  const [id,nom,code,date,imprime,principal,sous=[]] = s;
  const total = principal + sous.reduce((a,x)=>a+x[2],0);
  SETS[id] = {id,nom,code,date,imprime,principal,sous,total,ere:e.nom};
}));
const TOTAL_GLOBAL = Object.values(SETS).reduce((a,s)=>a+s.total,0);

// Collection : { setId: Set(clés de cases) }
const possede = {};
let db = null, peutEcrire = false;
const pad = (n,l)=>String(n).padStart(l,"0");
const nbPossede = id => possede[id] ? possede[id].size : 0;
const etat = document.getElementById("etat");
const vue = document.getElementById("vue");
let filtre = "toutes";

function esc(t){const d=document.createElement("div");d.textContent=t;return d.innerHTML}

const ICONES = {
  colis:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
  camion:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
  etiquette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/></svg>',
  pile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="12" height="16" rx="2"/><path d="M4 7v12a2 2 0 0 0 2 2h9"/></svg>'
};
// ===== Étiquettes de gradation (lues dans le titre de l'annonce) =====
const GRADEURS = ["PSA","PCA","NXR","CGC","BGS","CollectAura","Collect Aura"];
function gradation(titre){
  const t = String(titre||"");
  const m = t.match(new RegExp("\\b("+GRADEURS.join("|").replace(/ /g,"\\s")+")\\b(?:[^0-9]{0,14}?)(10|[1-9](?:[.,]5)?)\\b","i"));
  if(m) return {org:m[1].replace(/\s+/g,"").toUpperCase()==="COLLECTAURA"?"CollectAura":m[1].toUpperCase(), note:m[2].replace(".",",")};
  const s = t.match(/\b(slab|grad[ée]e?)\s+(PSA|PCA|NXR|CGC|BGS)\b/i);
  if(s) return {org:s[2].toUpperCase(), note:""};
  return null;
}
function langue(titre){
  const t = normal(String(titre||""));
  if(/\bjap\b|japonais/.test(t)) return "JAP";
  if(/chinois/.test(t)) return "CHN";
  if(/indonesien/.test(t)) return "IND";
  if(/anglais|\ben\b/.test(t)) return "EN";
  if(/\bfr\b|francais/.test(t)) return "FR";
  return "";
}
function etiquette(a){
  const g = gradation(a.titre);
  if(!g) return `<span class="lab brut"><span>Carte à l'unité</span></span>`;
  return `<span class="lab${g.note==="10"?" dix":""}"><span>${esc(g.org)}</span>${g.note?`<b>${esc(g.note)}</b>`:`<small>Slab</small>`}</span>`;
}
function slabHtml(a, lien){
  const ph = photoSur(a.photo);
  const img = ph ? `<img src="${esc(ph)}" alt="${esc(a.titre||"")}" loading="lazy">` : `<span class="vide-s">LT</span>`;
  const href = lien===undefined ? lienSur(a.lien) : lien;
  return href
    ? `<a class="slab" href="${esc(href)}"${/^https:/.test(href)?' target="_blank" rel="noopener"':""} aria-label="${esc(a.titre||"")}">${etiquette(a)}${img}</a>`
    : `<span class="slab">${etiquette(a)}${img}</span>`;
}

function renderAccueil(){
  const nbSets = Object.keys(SETS).length;
  const tot = Object.keys(SETS).reduce((a,id)=>a+nbPossede(id),0);
  const enVente = annonces.filter(a=>a.etat!=="Vendu");
  const avecPhoto = enVente.filter(a=>photoSur(a.photo));
  const gradees = enVente.filter(a=>gradation(a.titre));
  const prixMin = enVente.length ? Math.min(...enVente.map(a=>Number(a.prix)||0)) : 0;
  const moy = avis.length ? avis.reduce((a,x)=>a+(Number(x.note)||0),0)/avis.length : 0;
  const pile = (gradees.filter(a=>photoSur(a.photo)).length>=3 ? gradees.filter(a=>photoSur(a.photo)) : avecPhoto).slice(0,3);
  const orgs = [...new Set(gradees.map(a=>gradation(a.titre).org))].slice(0,3);
  vue.innerHTML = `<div class="accueil">
  <section class="hero-s">
    <div>
      <span class="sur-s">${enVente.length} cartes en vente${orgs.length?" · "+orgs.map(esc).join(" · "):""} · FR · JAP</span>
      <h1>Cartes Pokémon gradées, vérifiées, prêtes à partir.</h1>
      <p class="accroche">Des cartes gradées, vintage ou récentes, et des cartes à l'unité choisies une à une. Toutes sont en vente sur mon profil Vinted, envoyées bien protégées.</p>
      <div class="cta">
        <a class="bouton plein" href="https://www.vinted.fr/member/82876743" target="_blank" rel="noopener">Voir la boutique Vinted</a>
        <a class="bouton clair" href="#boutique">Parcourir les cartes</a>
      </div>
      <div class="chiffres-s">
        <div><b>${enVente.length}</b>en vente</div>
        <div><b>${gradees.length}</b>gradées</div>
        <div><b>${enVente.length?euro(prixMin):"–"}</b>à partir de</div>
      </div>
    </div>
    <div class="pile-s" aria-hidden="true">${pile.length===3?pile.map(a=>slabHtml(a,"#boutique")).join(""):`<span class="slab"><span class="lab brut"><span>Louis TCG</span></span><span class="vide-s">LT</span></span>`.repeat(3)}</div>
  </section>

  ${avecPhoto.length?`<div class="section-t"><div><h2>Dernières cartes en vente</h2><p>Clique sur une carte pour l'ouvrir sur Vinted.</p></div><a href="#boutique">Toute la boutique →</a></div>
  <div class="vitrine">${avecPhoto.slice(0,4).map(a=>`<div class="carte-v">${slabHtml(a)}<span class="t">${esc(a.titre||"")}</span><span class="prix">${euro(a.prix)}</span></div>`).join("")}</div>`:""}

  <section class="panneau atouts" aria-label="Pourquoi acheter ici">
    <div class="atout">${ICONES.colis}<div><b>Emballage soigné</b><span>Bulle et carton rigide</span></div></div>
    <div class="atout">${ICONES.camion}<div><b>Envoi rapide</b><span>UPS, Mondial Relay, Chronopost</span></div></div>
    <div class="atout">${ICONES.etiquette}<div><b>Prix négociables</b><span>Fais-moi une offre</span></div></div>
    <div class="atout">${ICONES.pile}<div><b>Remise sur les lots</b><span>-10 % pour 2, -15 % pour 3</span></div></div>
  </section>

  <div class="section-t"><div><h2>Avis et collection</h2><p>Ce qu'en disent mes acheteurs, et les cartes que je garde.</p></div></div>
  <div class="confiance deux">
    <a class="bloc" href="#avis">
      <span class="etiq">Avis</span>
      ${avis.length
        ? `<div style="display:flex;align-items:baseline;gap:10px"><span class="grosse-note">${moy.toLocaleString("fr-FR",{maximumFractionDigits:1})}</span>${etoiles(moy)}</div><p>${avis.length} avis d'acheteurs Vinted.</p>`
        : `<h3>Avis des acheteurs</h3><p>Les évaluations laissées par mes acheteurs sur Vinted.</p>`}
      <span class="aller">Lire les avis →</span>
    </a>
    <a class="bloc sombre" href="#tcg">
      <span class="etiq">Collection</span>
      <h3>Le classeur</h3>
      <div class="ligne-c">${anneau(tot,TOTAL_GLOBAL)}<div><b>${tot.toLocaleString("fr-FR")} / ${TOTAL_GLOBAL.toLocaleString("fr-FR")}</b>cartes sur ${nbSets} extensions</div></div>
      <span class="aller">Ouvrir le classeur →</span>
    </a>
  </div>

  ${nouveautes.length?`<section class="panneau">
    <div class="ph"><h3>Nouveautés</h3><a href="#nouveautes">Tout voir →</a></div>
    <ul class="fil-nv">${nouveautes.slice(0,3).map(ligneNv).join("")}</ul>
  </section>`:""}

  <section class="panneau suivre">
    <div><h2>Ne rate aucune nouvelle carte</h2><p>Abonne-toi à mon profil Vinted : Vinted te prévient à chaque nouvelle annonce.</p></div>
    <a class="bouton vinted" href="https://www.vinted.fr/member/82876743" target="_blank" rel="noopener">Suivre louis_czve</a>
  </section>
  </div>`;
}

let recherche = "";
const normal = t => t.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
function anneau(n,tot,cls=""){
  const p = tot?Math.round(n/tot*100):0;
  return `<div class="anneau ${cls}${n>=tot&&tot?" complet":""}" style="--p:${p}" role="img" aria-label="${p} % complété"><span>${p}%</span></div>`;
}
function renderListe(){
  let h = `<p class="fil"><a href="#">Accueil</a> › TCG</p>
  <div class="tete-liste"><h2>Extensions TCG</h2><p>Clique sur une extension pour ouvrir son classeur. Le total compte toutes les cartes, secrètes comprises.</p></div>
  <div class="recherche">
    <input id="q" type="search" placeholder="Rechercher une extension (ex. 151, Évolution…)" value="${esc(recherche)}" aria-label="Rechercher une extension">
    <div class="sauts">${[...ERES].reverse().map((e,i)=>`<a href="#tcg" data-ere="ere-${i}">${esc(e.nom)}</a>`).join("")}</div>
  </div>`;
  [...ERES].reverse().forEach((e,i)=>{
    const totE = e.sets.reduce((a,s)=>a+SETS[s[0]].total,0);
    h += `<section class="panneau" id="ere-${i}"><div class="ph"><h3>Série ${esc(e.nom)}</h3><small>${e.periode} · ${e.sets.length} extensions · ${totE.toLocaleString("fr-FR")} cartes</small></div><div class="tuiles">`;
    [...e.sets].reverse().forEach(s=>{
      const x = SETS[s[0]], n = nbPossede(x.id);
      h += `<a class="tuile" href="#set-${x.id}" data-cherche="${esc(normal(x.nom+" "+x.code))}">
        ${anneau(n,x.total)}
        <span class="txt"><span class="code">${x.code}</span><span class="nom">${esc(x.nom)}</span><span class="det">${n} / ${x.total} cartes · ${x.date}</span></span>
      </a>`;
    });
    h += `</div><div class="aucun" hidden>Aucune extension ne correspond.</div></section>`;
  });
  vue.innerHTML = h;
  const q = document.getElementById("q");
  q.oninput = ()=>{recherche=q.value;filtrerListe()};
  vue.querySelectorAll(".sauts a").forEach(a=>a.onclick=ev=>{ev.preventDefault();document.getElementById(a.dataset.ere).scrollIntoView({behavior:"smooth",block:"start"})});
  filtrerListe();
}
function filtrerListe(){
  const t = normal(recherche.trim());
  vue.querySelectorAll("section.panneau").forEach(sec=>{
    let vis=0;
    sec.querySelectorAll(".tuile").forEach(a=>{const ok=!t||a.dataset.cherche.includes(t);a.hidden=!ok;if(ok)vis++});
    sec.querySelector(".aucun").hidden = vis>0;
    sec.hidden = !!t && vis===0;
  });
}

function renderCollection(){
  const ids = Object.keys(SETS);
  const tot = ids.reduce((a,id)=>a+nbPossede(id),0);
  const commencees = ids.filter(id=>nbPossede(id)>0).sort((a,b)=>nbPossede(b)/SETS[b].total-nbPossede(a)/SETS[a].total);
  let h = `<p class="fil"><a href="#">Accueil</a> › Ma collection</p>
  <section class="panneau global">
    ${anneau(tot,TOTAL_GLOBAL,"grand")}
    <div class="info"><h2>Ma collection</h2><p><b>${tot.toLocaleString("fr-FR")}</b> cartes sur ${TOTAL_GLOBAL.toLocaleString("fr-FR")} · ${commencees.length} extension${commencees.length>1?"s":""} commencée${commencees.length>1?"s":""} sur ${ids.length}</p></div>
  </section>
  <section class="panneau"><div class="ph"><h3>Par série</h3></div><div class="eres-prog">`;
  [...ERES].reverse().forEach(e=>{
    const t = e.sets.reduce((a,s)=>a+SETS[s[0]].total,0), n = e.sets.reduce((a,s)=>a+nbPossede(s[0]),0);
    h += `<div class="ere-prog"><div class="l">${esc(e.nom)}<span>${n} / ${t.toLocaleString("fr-FR")} · ${Math.round(n/t*100)} %</span></div><div class="barre"><i style="width:${n/t*100}%"></i></div></div>`;
  });
  h += `</div></section>
  <section class="panneau"><div class="ph"><h3>Extensions commencées</h3><small>de la plus complète à la moins complète</small></div>`;
  if(!commencees.length) h += `<div class="aucun">Tu n'as encore coché aucune carte. Ouvre une extension depuis l'onglet <a href="#tcg">TCG</a> et touche les cases des cartes que tu possèdes.</div>`;
  else {
    h += `<div class="tuiles">`+commencees.map(id=>{const x=SETS[id],n=nbPossede(id);return `<a class="tuile" href="#set-${id}">${anneau(n,x.total)}<span class="txt"><span class="code">${x.code}</span><span class="nom">${esc(x.nom)}</span><span class="det">${n} / ${x.total} cartes · il en manque ${x.total-n}</span></span></a>`}).join("")+`</div>`;
  }
  h += `</section>`;
  vue.innerHTML = h;
}

function cases(x){
  // Série principale : 1..principal, au-delà du numéro imprimé = secrète
  const L = x.principal>=100||x.imprime>=100 ? 3 : 3;
  const blocs = [{titre:"Série principale", items:[]}];
  for(let i=1;i<=x.principal;i++){
    blocs[0].items.push({k:String(i), lab:pad(i,L), sous:"/"+pad(x.imprime,L), secrete:i>x.imprime});
  }
  x.sous.forEach(([p,lib,n])=>{
    const b={titre:lib, items:[]};
    const l = n>=100?3:2;
    for(let i=1;i<=n;i++) b.items.push({k:p+i, lab:p+pad(i,l), sous:"/"+p+pad(n,l), secrete:false});
    blocs.push(b);
  });
  return blocs;
}

function renderSet(id){
  const x = SETS[id];
  if(!x){location.hash="tcg";return}
  const n = nbPossede(id), sec = x.principal - x.imprime;
  const mineS = possede[id] || new Set();
  let secOk=0; for(let i=x.imprime+1;i<=x.principal;i++) if(mineS.has(String(i))) secOk++;
  let h = `<p class="fil"><a href="#">Accueil</a> › <a href="#tcg">TCG</a> › ${esc(x.nom)}</p>
  <section class="panneau resume">
    <div id="ann">${anneau(n,x.total,"grand")}</div>
    <div class="info">
      <h2>${esc(x.nom)}</h2>
      <p class="meta">Série ${esc(x.ere)} · ${x.code} · sortie ${x.date}</p>
      <div class="repartition">
        <span class="puce">${x.imprime} numérotées</span>
        ${sec>0?`<span class="puce or">${sec} secrètes</span>`:""}
        ${x.sous.map(s=>`<span class="puce">${s[2]} ${esc(s[1].toLowerCase())}</span>`).join("")}
        <span class="puce">Total ${x.total}</span>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><b id="cpt">${n}</b><span>possédées</span></div>
      <div class="stat"><b id="manq">${x.total-n}</b><span>manquantes</span></div>
      <div class="stat"><b id="secok">${secOk}${sec>0?"/"+sec:""}</b><span>secrètes</span></div>
    </div>
  </section>
  <section class="panneau"><div class="pc">
  <div class="barre"><i id="bar" style="width:${Math.round(n/x.total*100)}%"></i></div>
  <div class="outils">
    ${["toutes","possedees","manquantes"].map(f=>`<button class="filtre" aria-pressed="${filtre===f}" data-f="${f}">${f==="toutes"?"Toutes":f==="possedees"?"Possédées":"Manquantes"}</button>`).join("")}
    <span class="aide">${peutEcrire?"Touche une case pour la cocher ou la décocher.":"Lecture seule : connecte-toi en propriétaire pour cocher tes cartes."}</span>
  </div>`;
  const mine = possede[id] || new Set();
  cases(x).forEach(b=>{
    const items = b.items.filter(c=> filtre==="toutes" || (filtre==="possedees") === mine.has(c.k));
    h += `<div class="bloc-titre">${esc(b.titre)} · ${b.items.length}</div>`;
    if(!items.length){h += `<div class="vide">Aucune carte ici pour ce filtre.</div>`;return}
    h += `<div class="cases">` + items.map(c=>`<button class="case${c.secrete?" secrete":""}${mine.has(c.k)?" ok":""}" data-k="${c.k}" ${peutEcrire?"":"disabled"} aria-pressed="${mine.has(c.k)}" title="${c.lab}${c.sous}${c.secrete?" (secrète)":""}">${c.lab}<small>${c.sous}</small></button>`).join("") + `</div>`;
  });
  h += `<p class="note">Les cases à bordure noire sont les cartes secrètes, numérotées au-delà du total imprimé (ex. 210/202).</p></div></section>`;
  vue.innerHTML = h;
  vue.querySelectorAll(".filtre").forEach(b=>b.onclick=()=>{filtre=b.dataset.f;renderSet(id)});
  vue.querySelectorAll(".case").forEach(b=>b.onclick=()=>basculer(id,b.dataset.k,b));
}

const enCours = {};
async function basculer(id,k,btn){
  if(!db||!peutEcrire) return;
  const s = possede[id] || (possede[id]=new Set());
  if(s.has(k)) s.delete(k); else s.add(k);
  btn.classList.toggle("ok", s.has(k)); btn.setAttribute("aria-pressed", s.has(k));
  const x = SETS[id];
  document.getElementById("cpt").textContent = s.size;
  document.getElementById("manq").textContent = x.total - s.size;
  let so=0; for(let i=x.imprime+1;i<=x.principal;i++) if(s.has(String(i))) so++;
  document.getElementById("secok").textContent = so + (x.principal>x.imprime ? "/"+(x.principal-x.imprime) : "");
  document.getElementById("ann").innerHTML = anneau(s.size,x.total,"grand");
  document.getElementById("bar").style.width = Math.round(s.size/x.total*100)+"%";
  enregistrer(id);
}
// une écriture à la fois par extension
async function enregistrer(id){
  if(enCours[id]){enCours[id]="encore";return}
  enCours[id]=true;
  try{
    await db.doc("collection/"+id).set({cartes:[...possede[id]], maj:new Date().toISOString()});
    etat.textContent = "Enregistré";
  }catch(e){
    etat.textContent = "Échec de l'enregistrement, réessaie.";
  }
  const again = enCours[id]==="encore"; enCours[id]=false;
  if(again) enregistrer(id);
}


// ===== Boutique Vinted et avis =====
let annonces = [], avis = [];
// Copie publique des annonces (annonces.json, publiée avec la page) : visible par tous, même sans compte
let annoncesDb = false;
const triAjout = a => (a||[]).slice().sort((x,y)=>String(y.ajout||"").localeCompare(String(x.ajout||"")));
fetch("data/annonces.json",{cache:"no-cache"}).then(r=>r.ok?r.json():[]).then(d=>{
  if(Array.isArray(d) && !annoncesDb){
    annonces = triAjout(d);
    const h = location.hash.slice(1);
    if((h==="boutique"||h==="") && !(document.activeElement && document.activeElement.closest && document.activeElement.closest("form"))) renderPage();
  }
}).catch(()=>{});
const lienSur = u => /^https:\/\/(www\.)?vinted\.fr\//.test(u||"") ? u : "";
const photoSur = u => (typeof u==="string" && /^(photos\/[A-Za-z0-9_-]+\.jpg|\/_blob\/[A-Za-z0-9_-]+|https:\/\/[^\s"'<>]+)$/.test(u)) ? u : "";
const euro = n => (Number(n)||0).toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
function etoiles(n){n=Math.max(0,Math.min(5,Math.round(Number(n)||0)));return `<span class="etoiles" aria-label="${n} sur 5">${"★".repeat(n)}<span class="vide-e">${"★".repeat(5-n)}</span></span>`}

let filtreB = "vente";
function renderBoutique(){
  const enVente = annonces.filter(a=>a.etat!=="Vendu");
  const gradeesB = enVente.filter(a=>gradation(a.titre));
  const liste = filtreB==="vente" ? enVente : filtreB==="gradees" ? gradeesB : filtreB==="vendu" ? annonces.filter(a=>a.etat==="Vendu") : annonces;
  let h = `<p class="fil"><a href="#">Accueil</a> › Boutique</p>
  <div class="tete-liste"><h2>Ma boutique Vinted</h2><p>Mes cartes en vente sur Vinted (louis_czve). Lots : -10 % pour 2 cartes, -15 % pour 3. Envoi UPS, Mondial Relay ou Chronopost.</p><p style="margin-top:10px"><a class="bouton plein" href="https://www.vinted.fr/member/82876743" target="_blank" rel="noopener">Voir mon profil Vinted</a></p></div>
  <section class="panneau boutique-p"><div class="ph"><h3>Annonces</h3><div class="filtres-b">${[["vente","En vente ("+enVente.length+")"],["gradees","Gradées ("+gradeesB.length+")"],["vendu","Vendues ("+(annonces.length-enVente.length)+")"],["tout","Tout"]].map(([k,l])=>`<button type="button" data-fb="${k}" aria-pressed="${filtreB===k}">${l}</button>`).join("")}</div></div>`;
  if(!annonces.length) h += `<div class="aucun">Aucune annonce pour l'instant. ${peutEcrire?"Ajoute ta première annonce avec le formulaire ci-dessous.":"Les annonces apparaîtront ici."}</div>`;
  else if(!liste.length) h += `<div class="aucun">Aucune carte dans cette catégorie.</div>`;
  else h += `<div class="annonces">`+liste.map(a=>`<div class="annonce${a.etat==="Vendu"?" est-vendu":""}">
      ${slabHtml(a)}
      <span class="t">${esc(a.titre||"")}</span>
      ${langue(a.titre)?`<div class="puces-a"><span>${langue(a.titre)}</span></div>`:""}
      <div class="l2"><span class="prix">${euro(a.prix)}</span><span class="etat-a${a.etat==="Vendu"?" vendu":""}">${esc(a.etat||"En vente")}</span></div>
      ${lienSur(a.lien)?`<a class="voir" href="${esc(a.lien)}" target="_blank" rel="noopener">Voir sur Vinted →</a>`:""}
      ${peutEcrire?`<button class="btn leger" data-suppr-annonce="${esc(a.id)}">Retirer</button>`:""}
    </div>`).join("")+`</div>`;
  if(peutEcrire) h += `<form class="form" id="f-annonce">
      <label class="large">Titre de l'annonce<input id="a-titre" required maxlength="160" placeholder="Ex. Ectoplasma TG06 Origine Perdue FR - PSA 9"></label>
      <label>Prix (€)<input id="a-prix" type="number" min="0" step="0.01" required placeholder="70"></label>
      <label>État<select id="a-etat"><option>En vente</option><option>Réservé</option><option>Vendu</option></select></label>
      <label class="large">Lien Vinted (facultatif)<input id="a-lien" type="url" placeholder="https://www.vinted.fr/items/…"></label>
      <button class="btn" type="submit">Ajouter l'annonce</button>
    </form>`;
  h += `</section>`;
  vue.innerHTML = h;
  vue.querySelectorAll("[data-fb]").forEach(b=>b.onclick=()=>{filtreB=b.dataset.fb;renderBoutique()});
  const f=document.getElementById("f-annonce");
  if(f) f.onsubmit=async ev=>{ev.preventDefault();
    const d={titre:document.getElementById("a-titre").value.trim(),prix:parseFloat(document.getElementById("a-prix").value)||0,etat:document.getElementById("a-etat").value,lien:document.getElementById("a-lien").value.trim(),ajout:new Date().toISOString()};
    if(!d.titre) return;
    try{await db.collection("annonces").add(d);etat.textContent="Annonce ajoutée"}catch(e){etat.textContent="L'annonce n'a pas pu être ajoutée, réessaie."}};
  vue.querySelectorAll("[data-suppr-annonce]").forEach(b=>b.onclick=async()=>{try{await db.doc("annonces/"+b.dataset.supprAnnonce).delete();etat.textContent="Annonce retirée"}catch(e){etat.textContent="Impossible de retirer l'annonce."}});
}

function renderAvis(){
  const moy = avis.length ? avis.reduce((a,x)=>a+(Number(x.note)||0),0)/avis.length : 0;
  let h = `<p class="fil"><a href="#">Accueil</a> › Avis</p>
  <div class="tete-liste"><h2>Avis</h2><p>Les évaluations laissées par mes acheteurs sur Vinted.</p></div>
  <section class="panneau note-moy"><span class="gros">${avis.length?moy.toLocaleString("fr-FR",{maximumFractionDigits:1}):"–"}</span><div>${etoiles(moy)}<div style="color:var(--gris);font-size:.85rem">${avis.length} avis</div></div></section>
  <section class="panneau"><div class="ph"><h3>Ce que disent les acheteurs</h3></div>`;
  if(!avis.length) h += `<div class="aucun">Aucun avis pour l'instant. ${peutEcrire?"Ajoute tes avis Vinted avec le formulaire ci-dessous.":"Ils apparaîtront ici."}</div>`;
  else h += `<ul class="avis-liste">`+avis.map(a=>`<li><div class="hd"><span class="qui">${esc(a.auteur||"Acheteur Vinted")}</span><span class="quand">${esc(a.date||"")}</span></div>${etoiles(a.note)}${a.texte?`<p>${esc(a.texte)}</p>`:""}${peutEcrire?`<button class="btn leger" data-suppr-avis="${esc(a.id)}">Retirer</button>`:""}</li>`).join("")+`</ul>`;
  if(peutEcrire) h += `<form class="form" id="f-avis">
      <label>Pseudo de l'acheteur<input id="v-auteur" required maxlength="60"></label>
      <label>Note<select id="v-note"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>
      <label>Date<input id="v-date" maxlength="40" placeholder="Ex. octobre 2026"></label>
      <label class="large">Commentaire<textarea id="v-texte" maxlength="1000"></textarea></label>
      <button class="btn" type="submit">Ajouter l'avis</button>
    </form>`;
  h += `</section>`;
  vue.innerHTML = h;
  const f=document.getElementById("f-avis");
  if(f) f.onsubmit=async ev=>{ev.preventDefault();
    const d={auteur:document.getElementById("v-auteur").value.trim(),note:parseInt(document.getElementById("v-note").value,10),date:document.getElementById("v-date").value.trim(),texte:document.getElementById("v-texte").value.trim(),ajout:new Date().toISOString()};
    if(!d.auteur) return;
    try{await db.collection("avis").add(d);etat.textContent="Avis ajouté"}catch(e){etat.textContent="L'avis n'a pas pu être ajouté, réessaie."}};
  vue.querySelectorAll("[data-suppr-avis]").forEach(b=>b.onclick=async()=>{try{await db.doc("avis/"+b.dataset.supprAvis).delete();etat.textContent="Avis retiré"}catch(e){etat.textContent="Impossible de retirer l'avis."}});
}
function abonnerBoutique(){
  const tri = a => (a||[]).slice().sort((x,y)=>String(y.ajout||"").localeCompare(String(x.ajout||"")));
  const rafraichir = page => { if((location.hash.slice(1)===page || location.hash.slice(1)==="") && !(document.activeElement && document.activeElement.closest && document.activeElement.closest("form"))) renderPage(); };
  db.collection("annonces").onSnapshot(sn=>{if(!sn.docs.length) return; annoncesDb=true; annonces=tri(sn.docs.map(d=>({id:d.id,...d.data()})));rafraichir("boutique")},()=>{});
  db.collection("avis").onSnapshot(sn=>{avis=tri(sn.docs.map(d=>({id:d.id,...d.data()})));rafraichir("avis")},()=>{});
}
function renderCgu(){
  vue.innerHTML = `<p class="fil"><a href="#">Accueil</a> › Conditions générales</p>
  <div class="tete-liste"><h2>Conditions générales d'utilisation</h2><p>Les règles simples qui s'appliquent quand tu visites Louis TCG ou que tu achètes une de mes cartes.</p></div>
  <section class="panneau"><div class="cgu">
    <div><h3>1. Objet du site</h3><p>Louis TCG présente ma collection de cartes Pokémon et les cartes que je vends. Le site est tenu par un particulier, vendeur sous le pseudo louis_czve sur Vinted.</p></div>
    <div><h3>2. Achats</h3><p>Aucun paiement ne se fait sur ce site. Toutes les ventes passent par Vinted : le bouton « Voir sur Vinted » de chaque annonce mène à la page où tu peux acheter, faire une offre ou m'écrire. Les conditions de Vinted s'appliquent à chaque achat, y compris sa protection acheteurs.</p></div>
    <div><h3>3. Prix et disponibilité</h3><p>Les prix sont indiqués en euros, hors frais Vinted et frais d'envoi. Ils sont souvent négociables. Une carte affichée ici peut déjà être vendue : c'est l'annonce Vinted qui fait foi.</p></div>
    <div><h3>4. État des cartes</h3><p>Chaque carte est décrite le plus fidèlement possible, photos à l'appui. Les notes des cartes gradées (NXR, PCA…) sont attribuées par ces sociétés de gradation, pas par moi.</p></div>
    <div><h3>5. Envoi</h3><p>Envoi rapide et soigné (bulle et carton rigide) par UPS, Mondial Relay ou Chronopost. Pas d'envoi par Vinted Go.</p></div>
    <div><h3>6. Retours et litiges</h3><p>En cas de problème avec une commande, écris-moi d'abord sur la messagerie Vinted : on trouvera une solution. Sinon, la procédure de litige de Vinted s'applique.</p></div>
    <div><h3>7. Propriété intellectuelle</h3><p>Pokémon et les noms, visuels et cartes associés appartiennent à Nintendo, Creatures, GAME FREAK et The Pokémon Company. Louis TCG est un site personnel, sans lien avec ces sociétés. Les photos des annonces sont les miennes.</p></div>
    <div><h3>8. Données personnelles et cookies</h3><ul>
      <li>Le site ne demande ni compte ni coordonnées et ne vend aucune donnée.</li>
      <li>Il n'utilise ni publicité ni outil de pistage.</li>
      <li>Seul un stockage technique dans ton navigateur est utilisé, par exemple pour retenir ton choix sur les cookies. Les polices d'écriture sont chargées depuis Google Fonts.</li>
      <li>Tu peux changer ton choix à tout moment avec le lien « Cookies » en bas de page.</li>
    </ul></div>
    <div><h3>9. Contact</h3><p>Pour toute question, écris-moi sur Vinted (louis_czve).</p></div>
    <p class="maj">Dernière mise à jour : 31 octobre 2026</p>
  </div></section>`;
}

// Bandeau cookies : choix retenu dans ce navigateur
const bandeau = document.getElementById("cookies");
function choixCookies(){try{return localStorage.getItem("cookies-choix")}catch(e){return null}}
function fermerCookies(v){try{localStorage.setItem("cookies-choix",v)}catch(e){}bandeau.hidden=true}
document.getElementById("cookies-accepter").onclick=()=>fermerCookies("accepte");
document.getElementById("cookies-refuser").onclick=()=>fermerCookies("refuse");
document.getElementById("gerer-cookies").onclick=()=>{bandeau.hidden=false};
if(!choixCookies()) bandeau.hidden=false;

// ===== Nouveautés (nouveautes.json, publiée avec la page, mise à jour chaque soir) =====
let nouveautes = [];
fetch("data/nouveautes.json",{cache:"no-cache"}).then(r=>r.ok?r.json():[]).then(d=>{
  if(!Array.isArray(d)) return;
  nouveautes = d.slice().sort((x,y)=>String(y.date||"").localeCompare(String(x.date||"")));
  const h = location.hash.slice(1);
  if((h==="nouveautes"||h==="") && !(document.activeElement && document.activeElement.closest && document.activeElement.closest("form"))) renderPage();
}).catch(()=>{});
const TYPES_NV = {nouveau:"Nouveau", prix:"Prix modifié", vendu:"Vendu", retire:"Retiré", info:"Info"};
function dateNv(iso, avecHeure){const d=new Date(iso);if(isNaN(d))return "";return d.toLocaleDateString("fr-FR",avecHeure?{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}:{weekday:"long",day:"numeric",month:"long"})}
function ligneNv(n){
  const t = TYPES_NV[n.type] ? n.type : "info";
  const ph = photoSur(n.photo), li = lienSur(n.lien);
  const vign = ph ? `<img class="vignette" src="${esc(ph)}" alt="" loading="lazy">` : `<span class="vignette vide">LT</span>`;
  const titre = li ? `<a href="${esc(li)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${esc(n.titre||"")}</a>` : esc(n.titre||"");
  return `<li>${vign}<div class="quoi"><span class="type ${t}">${TYPES_NV[t]}</span><b>${titre}</b>${n.detail?`<span>${esc(n.detail)}</span>`:""}</div><span class="quand">${dateNv(n.date,true)}</span></li>`;
}
function renderNouveautes(){
  let h = `<p class="fil"><a href="#">Accueil</a> › Nouveautés</p>
  <div class="tete-liste"><h2>Nouveautés</h2><p>Les nouvelles cartes, les changements de prix et les ventes, mis à jour chaque soir.</p></div>
  <section class="panneau">`;
  if(!nouveautes.length) h += `<div class="aucun">Rien de neuf pour l'instant. Les prochaines nouveautés apparaîtront ici.</div>`;
  else {
    let jourPrec = ""; h += `<div>`;
    nouveautes.forEach(n=>{
      const j = dateNv(n.date,false);
      if(j!==jourPrec){ if(jourPrec) h += `</ul>`; h += `<div class="jour">${esc(j)}</div><ul class="fil-nv">`; jourPrec=j; }
      h += ligneNv(n);
    });
    h += `</ul></div>`;
  }
  h += `</section>
  <section class="panneau suivre" style="margin-top:18px">
    <div><h2>Être prévenu automatiquement</h2><p>Abonne-toi à mon profil Vinted : Vinted t'envoie une notification à chaque nouvelle annonce.</p></div>
    <a class="bouton vinted" href="https://www.vinted.fr/member/82876743" target="_blank" rel="noopener">Suivre sur Vinted</a>
  </section>`;
  vue.innerHTML = h;
}

let garderScroll=false;
function renderPage(){router()}
function router(){
  const h = location.hash.slice(1);
  if(h==="tcg") renderListe();
  else if(h==="collection") renderCollection();
  else if(h==="boutique") renderBoutique();
  else if(h==="avis") renderAvis();
  else if(h==="cgu") renderCgu();
  else if(h==="nouveautes") renderNouveautes();
  else if(h.startsWith("set-")) renderSet(h.slice(4));
  else renderAccueil();
  const actif = h==="nouveautes"?"nav-nouveautes":h==="boutique"?"nav-boutique":h==="avis"?"nav-avis":h==="collection"?"nav-collection":(h==="tcg"||h.startsWith("set-"))?"nav-tcg":"nav-accueil";
  ["nav-accueil","nav-tcg","nav-collection","nav-boutique","nav-nouveautes","nav-avis"].forEach(n=>document.getElementById(n).removeAttribute("aria-current"));
  if(h!=="cgu") document.getElementById(actif).setAttribute("aria-current","page");
  if(!garderScroll) window.scrollTo(0,0);
}
window.addEventListener("hashchange", ()=>{filtre="toutes";router()});
router();

(async()=>{
  try{
    if(typeof claude==="undefined"){etat.textContent="";return}
    const user = await claude.use("user");
    db = await claude.use("db");
    if(!db){etat.textContent="Collection indisponible ici (connecte-toi à claude.ai)";return}
    peutEcrire = user ? (user.isOwner() || (user.can && user.can("data.write")===true)) : false;
    abonnerBoutique();
    db.collection("collection").onSnapshot(snap=>{
      snap.docs.forEach(d=>{
        if(enCours[d.id]) return;
        const c = (d.data()||{}).cartes || [];
        possede[d.id] = new Set(c);
      });
      etat.textContent = peutEcrire ? "Collection synchronisée" : "Mode lecture";
      const h = location.hash.slice(1);
      if(document.activeElement && document.activeElement.id==="q") return;
      if(h.startsWith("set-") && document.querySelector(".case:focus")) return;
      const y=scrollY; garderScroll=true; router(); garderScroll=false; scrollTo(0,y);
    }, ()=>{etat.textContent="Connexion à la collection perdue";});
  }catch(e){etat.textContent="Collection indisponible";}
})();
