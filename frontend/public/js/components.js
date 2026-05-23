const CAT_EMOJI = { 'Électronique':'💻','Vêtements':'👕','Maison':'🏠','Sport':'⚽','Livres':'📚','Alimentation':'🥗','default':'📦' };
function getCatEmoji(name) { return CAT_EMOJI[name]||CAT_EMOJI.default; }

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtPrice(p) { return parseFloat(p).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}); }
function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtDateTime(d) { return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function getField(id) { return (document.getElementById(id)||{}).value||''; }

function renderNavbar() {
  const u = Auth.current;
  if (!u) return '';
  return `
  <nav class="navbar">
    <div class="navbar-brand" onclick="Router.go('home')">Shop<span class="brand-dot">.</span>Vault</div>
    <div class="navbar-links">
      <button class="nav-link ${Router.current==='home'?'active':''}" onclick="Router.go('home')">Accueil</button>
      <button class="nav-link ${Router.current==='catalog'?'active':''}" onclick="Router.go('catalog')">Catalogue</button>
      <button class="nav-link ${Router.current==='orders'?'active':''}" onclick="Router.go('orders')">Commandes</button>
      <button class="nav-link ${Router.current==='profile'?'active':''}" onclick="Router.go('profile')">Profil</button>
      ${Auth.isAdmin()?`<button class="nav-link ${Router.current==='admin'?'active':''}" onclick="Router.go('admin')">Admin</button>`:''}
    </div>
    <div class="navbar-right">
      <span class="badge badge-${u.role}">${u.role}</span>
      <button class="cart-btn" onclick="Router.go('cart')">
        🛒 Panier <span class="cart-count" id="cart-count">${_cartCount}</span>
      </button>
      <button class="nav-link danger" onclick="doLogout()">Déconnexion</button>
    </div>
  </nav>`;
}

async function doLogout() {
  await Auth.logout();
  _cartCount = 0;
  Router.go('login');
  toast('Déconnexion réussie','info');
}

function renderModal({title,body,footer}) {
  return `
  <div class="modal-overlay" id="modal-overlay" onclick="closeModalOutside(event)">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer?`<div class="modal-footer">${footer}</div>`:''}
    </div>
  </div>`;
}
function openModal(html) { closeModal(); const el=document.createElement('div'); el.id='modal-root'; el.innerHTML=html; document.body.appendChild(el); }
function closeModal() { const el=document.getElementById('modal-root'); if(el) el.remove(); }
function closeModalOutside(e) { if(e.target.id==='modal-overlay') closeModal(); }

function statusBadge(s) { return `<span class="badge badge-${s}">${s}</span>`; }
