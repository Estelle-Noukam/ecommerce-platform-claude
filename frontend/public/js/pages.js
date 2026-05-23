/* LOGIN */
async function renderLogin() {
  document.getElementById('app').innerHTML = `
  <div class="page auth-page">
    <div class="auth-left">
      <div class="auth-headline">La boutique<br>qui vous <span>ressemble</span></div>
      <p class="auth-subline">Découvrez des milliers de produits, gérez vos commandes et profitez d'une expérience d'achat fluide.</p>
    </div>
    <div class="auth-right">
      <h2>Connexion</h2>
      <p class="subtitle">Accédez à votre compte</p>
      <div class="error-banner" id="login-error"></div>
      <div class="form-group"><label>E-mail</label><input type="email" id="login-email" placeholder="vous@exemple.fr" /></div>
      <div class="form-group"><label>Mot de passe</label><input type="password" id="login-password" placeholder="••••••••" /></div>
      <button class="btn btn-black btn-full mt-2" onclick="submitLogin()">Se connecter</button>
      <hr class="divider">
      <p class="text-center text-muted" style="font-size:0.85rem">Pas de compte ? <a href="#" onclick="Router.go('register')">S'inscrire</a></p>
      <p class="text-center" style="font-size:0.75rem;color:var(--text-muted);margin-top:.5rem;font-family:var(--mono)">admin@example.com / Admin1234!</p>
    </div>
  </div>`;
  document.getElementById('login-password').addEventListener('keydown',e=>{if(e.key==='Enter')submitLogin();});
}

async function submitLogin() {
  try {
    await Auth.login(document.getElementById('login-email').value.trim(), document.getElementById('login-password').value);
    await refreshCartCount();
    Router.go('home');
    toast('Bienvenue '+Auth.current.username+' !','success');
  } catch(err) { showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}],'login-error'); }
}

/* REGISTER */
async function renderRegister() {
  document.getElementById('app').innerHTML = `
  <div class="page auth-page">
    <div class="auth-left">
      <div class="auth-headline">Rejoignez<br><span>ShopVault</span></div>
      <p class="auth-subline">Créez votre compte gratuitement et commencez à shopper dès maintenant.</p>
    </div>
    <div class="auth-right">
      <h2>Inscription</h2>
      <p class="subtitle">Créez votre compte</p>
      <div class="error-banner" id="reg-error"></div>
      <div class="form-row">
        <div class="form-group"><label>Prénom</label><input type="text" id="r-first" placeholder="Marie" /></div>
        <div class="form-group"><label>Nom</label><input type="text" id="r-last" placeholder="Dupont" /></div>
      </div>
      <div class="form-group"><label>Nom d'utilisateur *</label><input type="text" id="r-user" placeholder="marie_dupont" /></div>
      <div class="form-group"><label>E-mail *</label><input type="email" id="r-email" placeholder="vous@exemple.fr" /></div>
      <div class="form-group"><label>Mot de passe *</label><input type="password" id="r-pass" placeholder="Min. 8 car., 1 maj., 1 chiffre" /></div>
      <div class="form-group"><label>Confirmation *</label><input type="password" id="r-confirm" placeholder="Répéter" /></div>
      <button class="btn btn-black btn-full mt-2" onclick="submitRegister()">Créer mon compte</button>
      <hr class="divider">
      <p class="text-center text-muted" style="font-size:0.85rem">Déjà inscrit ? <a href="#" onclick="Router.go('login')">Se connecter</a></p>
    </div>
  </div>`;
}

async function submitRegister() {
  try {
    await Auth.register({ first_name:getField('r-first'), last_name:getField('r-last'), username:getField('r-user'), email:getField('r-email'), password:getField('r-pass'), confirm_password:getField('r-confirm') });
    await refreshCartCount();
    Router.go('home');
    toast('Compte créé avec succès !','success');
  } catch(err) { showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}],'reg-error'); }
}

/* HOME */
async function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  let featured = [], cats = [];
  try { [featured, cats] = await Promise.all([api.get('/api/products?featured=true'), api.get('/api/products/categories')]); } catch {}
  app.innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="hero">
      <div class="hero-content">
        <h1>Bienvenue sur<br><span>ShopVault</span></h1>
        <p>Des produits soigneusement sélectionnés, livrés directement chez vous.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="Router.go('catalog')" style="padding:14px 32px;font-size:1rem">Explorer le catalogue</button>
          ${!Auth.current?`<button class="btn btn-secondary" onclick="Router.go('register')" style="padding:14px 32px;font-size:1rem;background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.2)">Créer un compte</button>`:''}
        </div>
      </div>
    </div>
    <div class="container">
      <div class="section">
        <div class="section-title">Coups de cœur</div>
        <div class="section-sub">Notre sélection de produits incontournables</div>
        <div class="products-grid">
          ${featured.map(p=>renderProductCard(p)).join('')}
        </div>
      </div>
      <div class="section" style="border-top:1px solid var(--border);padding-top:3rem">
        <div class="section-title">Nos catégories</div>
        <div class="section-sub">Trouvez ce que vous cherchez</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem">
          ${cats.map(c=>`
          <div onclick="_catalogFilter='${c.id}';Router.go('catalog')" style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;text-align:center;cursor:pointer;transition:var(--transition)" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="font-size:2.5rem;margin-bottom:.5rem">${getCatEmoji(c.name)}</div>
            <div style="font-weight:600;font-size:0.9rem">${esc(c.name)}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function renderProductCard(p) {
  return `
  <div class="product-card-wrap">
    ${p.featured?`<div class="product-badge">⭐ Coup de cœur</div>`:''}
    <div class="product-card" onclick="openProductModal(${p.id})">
      <div class="product-img">${getCatEmoji(p.category_name)}</div>
      <div class="product-body">
        <div class="product-category">${esc(p.category_name||'')}</div>
        <div class="product-name">${esc(p.name)}</div>
        <div class="product-desc">${esc(p.description||'')}</div>
        <div class="product-footer">
          <div class="product-price">${fmtPrice(p.price)}</div>
          <div class="product-stock">${p.stock>0?`${p.stock} en stock`:'Rupture'}</div>
        </div>
      </div>
    </div>
  </div>`;
}

async function openProductModal(id) {
  let p;
  try { p = await api.get(`/api/products/${id}`); } catch { toast('Erreur chargement produit','error'); return; }
  openModal(renderModal({
    title: esc(p.name),
    body: `
    <div style="text-align:center;font-size:5rem;margin-bottom:1rem">${getCatEmoji(p.category_name)}</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
      <div>
        <div style="font-size:0.78rem;color:var(--text-muted);font-family:var(--mono);text-transform:uppercase;margin-bottom:4px">${esc(p.category_name||'')}</div>
        <div style="font-size:0.9rem;color:var(--text-dim);line-height:1.6">${esc(p.description||'')}</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:var(--bg);border-radius:var(--radius);margin-bottom:1rem">
      <div style="font-family:var(--font-display);font-size:2rem;font-weight:600">${fmtPrice(p.price)}</div>
      <div style="font-size:0.82rem;color:${p.stock>0?'var(--success)':'var(--danger)'};font-family:var(--mono)">${p.stock>0?`✓ ${p.stock} en stock`:'✕ Rupture de stock'}</div>
    </div>
    <div class="error-banner" id="add-error"></div>
    ${p.stock>0?`
    <div class="form-group">
      <label>Quantité</label>
      <input type="number" id="add-qty" value="1" min="1" max="${p.stock}" style="width:100px" />
    </div>`:''}`,
    footer: p.stock>0
      ? `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
         <button class="btn btn-black" onclick="addToCart(${p.id})">🛒 Ajouter au panier</button>`
      : `<button class="btn btn-secondary" onclick="closeModal()">Fermer</button>`,
  }));
}

async function addToCart(productId) {
  const qty = parseInt(getField('add-qty'))||1;
  try {
    await api.post('/api/cart/items', { product_id:productId, quantity:qty });
    await refreshCartCount();
    closeModal();
    toast('Ajouté au panier !','success');
  } catch(err) { showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}],'add-error'); }
}

/* CATALOG */
let _catalogFilter = 'all', _catalogSearch = '', _products = [], _categories = [];

async function renderCatalog() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  try { [_products, _categories] = await Promise.all([api.get('/api/products'), api.get('/api/products/categories')]); } catch {}
  renderCatalogView();
}

function renderCatalogView() {
  let filtered = _products;
  if (_catalogFilter !== 'all') filtered = filtered.filter(p => String(p.category_id) === String(_catalogFilter));
  if (_catalogSearch) filtered = filtered.filter(p => (p.name+p.description||'').toLowerCase().includes(_catalogSearch.toLowerCase()));

  document.getElementById('app').innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="container">
      <div class="page-header">
        <div><h2>Catalogue</h2><div class="sub">${_products.length} produit(s)</div></div>
        ${Auth.isAdmin()?`<button class="btn btn-primary" onclick="openProductFormModal()">+ Ajouter</button>`:''}
      </div>
      <div class="filters-bar">
        <button class="filter-chip ${_catalogFilter==='all'?'active':''}" onclick="_catalogFilter='all';renderCatalogView()">Tous</button>
        ${_categories.map(c=>`<button class="filter-chip ${_catalogFilter===String(c.id)?'active':''}" onclick="_catalogFilter='${c.id}';renderCatalogView()">${getCatEmoji(c.name)} ${esc(c.name)}</button>`).join('')}
        <input class="search-bar" type="search" placeholder="🔍 Rechercher…" value="${esc(_catalogSearch)}" oninput="_catalogSearch=this.value;renderCatalogView()" />
      </div>
      ${filtered.length===0?`<div class="empty-state"><div class="icon">🔍</div><h3>Aucun produit</h3><p>Essayez un autre terme ou filtre</p></div>`:`
      <div class="products-grid">
        ${filtered.map(p=>`
        <div class="product-card-wrap">
          ${p.featured?`<div class="product-badge">⭐</div>`:''}
          <div class="product-card" onclick="openProductModal(${p.id})">
            <div class="product-img">${getCatEmoji(p.category_name)}</div>
            <div class="product-body">
              <div class="product-category">${esc(p.category_name||'')}</div>
              <div class="product-name">${esc(p.name)}</div>
              <div class="product-desc">${esc(p.description||'')}</div>
              <div class="product-footer">
                <div class="product-price">${fmtPrice(p.price)}</div>
                <div class="product-stock" style="color:${p.stock>0?'var(--success)':'var(--danger)'}">${p.stock>0?`${p.stock} dispo`:'Rupture'}</div>
              </div>
              ${Auth.isAdmin()?`
              <div style="margin-top:.75rem;display:flex;gap:6px" onclick="event.stopPropagation()">
                <button class="btn btn-ghost btn-sm" onclick="openProductFormModal(${p.id})">Éditer</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Suppr.</button>
              </div>`:''}
            </div>
          </div>
        </div>`).join('')}
      </div>`}
    </div>
  </div>`;
}

function openProductFormModal(id) {
  const p = id ? _products.find(x=>x.id===id) : null;
  openModal(renderModal({
    title: p ? 'Modifier le produit' : 'Nouveau produit',
    body: `
    <div class="error-banner" id="prod-error"></div>
    <div class="form-group"><label>Nom *</label><input type="text" id="pf-name" value="${esc(p?.name||'')}" placeholder="Nom du produit" /></div>
    <div class="form-group"><label>Description</label><textarea id="pf-desc">${esc(p?.description||'')}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Prix (€) *</label><input type="number" id="pf-price" value="${p?.price||''}" min="0" step="0.01" /></div>
      <div class="form-group"><label>Stock *</label><input type="number" id="pf-stock" value="${p?.stock||0}" min="0" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Catégorie</label>
        <select id="pf-cat">
          <option value="">-- Aucune --</option>
          ${_categories.map(c=>`<option value="${c.id}" ${p?.category_id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Actif</label>
        <select id="pf-active">
          <option value="true" ${!p||p.active?'selected':''}>Oui</option>
          <option value="false" ${p&&!p.active?'selected':''}>Non</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label>Image URL</label><input type="text" id="pf-img" value="${esc(p?.image_url||'')}" placeholder="https://..." /></div>
    <div class="form-group"><label>Coup de cœur</label>
      <select id="pf-featured">
        <option value="false" ${!p?.featured?'selected':''}>Non</option>
        <option value="true" ${p?.featured?'selected':''}>Oui</option>
      </select>
    </div>`,
    footer:`<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
            <button class="btn btn-black" onclick="submitProductForm(${id||'null'})">${p?'Enregistrer':'Créer'}</button>`,
  }));
}

async function submitProductForm(id) {
  const payload = {
    name:getField('pf-name'), description:getField('pf-desc'),
    price:parseFloat(getField('pf-price')), stock:parseInt(getField('pf-stock')),
    category_id:getField('pf-cat')||null, active:getField('pf-active')==='true',
    featured:getField('pf-featured')==='true', image_url:getField('pf-img')||null,
  };
  try {
    if (id) {
      const updated = await api.put(`/api/products/${id}`, payload);
      const idx = _products.findIndex(p=>p.id===id);
      if (idx!==-1) _products[idx]={..._products[idx],...updated};
      toast('Produit mis à jour','success');
    } else {
      const created = await api.post('/api/products', payload);
      _products.unshift(created);
      toast('Produit créé','success');
    }
    closeModal(); renderCatalogView();
  } catch(err) { showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}],'prod-error'); }
}

async function deleteProduct(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  try {
    await api.delete(`/api/products/${id}`);
    _products = _products.filter(p=>p.id!==id);
    renderCatalogView(); toast('Produit supprimé','info');
  } catch(err) { toast(err.data?.error||'Erreur','error'); }
}

/* CART */
let _cartItems = [];

async function renderCart() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  try { _cartItems = await api.get('/api/cart'); } catch {}
  renderCartView();
}

function renderCartView() {
  const total = _cartItems.reduce((s,i)=>s+parseFloat(i.price)*i.quantity,0);
  document.getElementById('app').innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="container">
      <div class="page-header"><h2>Mon panier</h2></div>
      ${_cartItems.length===0?`
      <div class="empty-state">
        <div class="icon">🛒</div>
        <h3>Votre panier est vide</h3>
        <p style="margin-bottom:1rem">Découvrez nos produits et commencez à shopper</p>
        <button class="btn btn-black" onclick="Router.go('catalog')">Voir le catalogue</button>
      </div>`:`
      <div class="cart-page">
        <div>
          <div class="cart-items">
            ${_cartItems.map(i=>`
            <div class="cart-item">
              <div class="cart-item-img">${getCatEmoji(i.category_name)}</div>
              <div class="cart-item-info">
                <div class="cart-item-name">${esc(i.name)}</div>
                <div class="cart-item-price">${fmtPrice(i.price)} / unité</div>
                <div class="qty-control">
                  <button class="qty-btn" onclick="updateQty(${i.product_id},${i.quantity-1})">−</button>
                  <span class="qty-num">${i.quantity}</span>
                  <button class="qty-btn" onclick="updateQty(${i.product_id},${i.quantity+1})">+</button>
                  <button class="btn btn-danger btn-sm" onclick="removeFromCart(${i.product_id})">✕</button>
                </div>
              </div>
              <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:600;flex-shrink:0">${fmtPrice(parseFloat(i.price)*i.quantity)}</div>
            </div>`).join('')}
          </div>
          <button class="btn btn-secondary btn-sm mt-1" onclick="clearCart()">🗑 Vider le panier</button>
        </div>
        <div class="cart-summary">
          <div class="summary-title">Récapitulatif</div>
          ${_cartItems.map(i=>`
          <div class="summary-line">
            <span>${esc(i.name)} ×${i.quantity}</span>
            <span>${fmtPrice(parseFloat(i.price)*i.quantity)}</span>
          </div>`).join('')}
          <div class="summary-line">
            <span>Livraison</span><span style="color:var(--success)">Gratuite</span>
          </div>
          <div class="summary-line">
            <span>Total</span>
            <span class="summary-total">${fmtPrice(total)}</span>
          </div>
          <button class="btn btn-black btn-full mt-2" onclick="openCheckoutModal()" style="padding:14px">Commander →</button>
        </div>
      </div>`}
    </div>
  </div>`;
}

async function updateQty(productId, qty) {
  try {
    await api.put(`/api/cart/items/${productId}`,{quantity:qty});
    _cartItems = await api.get('/api/cart');
    await refreshCartCount();
    renderCartView();
  } catch(err) { toast(err.data?.error||'Erreur','error'); }
}

async function removeFromCart(productId) {
  try {
    await api.delete(`/api/cart/items/${productId}`);
    _cartItems = _cartItems.filter(i=>i.product_id!==productId);
    await refreshCartCount(); renderCartView();
    toast('Article retiré','info');
  } catch(err) { toast(err.data?.error||'Erreur','error'); }
}

async function clearCart() {
  if (!confirm('Vider le panier ?')) return;
  try {
    await api.delete('/api/cart');
    _cartItems=[]; await refreshCartCount(); renderCartView();
    toast('Panier vidé','info');
  } catch(err) { toast(err.data?.error||'Erreur','error'); }
}

function openCheckoutModal() {
  const total = _cartItems.reduce((s,i)=>s+parseFloat(i.price)*i.quantity,0);
  openModal(renderModal({
    title: 'Finaliser la commande',
    body:`
    <div style="background:var(--bg);border-radius:var(--radius);padding:1rem;margin-bottom:1.5rem">
      <div style="font-weight:600;margin-bottom:.5rem">Récapitulatif</div>
      ${_cartItems.map(i=>`<div style="display:flex;justify-content:space-between;font-size:0.85rem;padding:4px 0">${esc(i.name)} ×${i.quantity}<span>${fmtPrice(parseFloat(i.price)*i.quantity)}</span></div>`).join('')}
      <div style="border-top:1px solid var(--border);margin-top:.5rem;padding-top:.5rem;font-weight:700;display:flex;justify-content:space-between">Total<span>${fmtPrice(total)}</span></div>
    </div>
    <div class="error-banner" id="checkout-error"></div>
    <div class="form-group"><label>Adresse de livraison *</label><textarea id="chk-addr" placeholder="123 rue de la Paix, 75001 Paris" style="min-height:80px"></textarea></div>
    <div class="form-group"><label>Notes (optionnel)</label><textarea id="chk-notes" placeholder="Instructions de livraison..." style="min-height:60px"></textarea></div>`,
    footer:`<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
            <button class="btn btn-black" onclick="submitOrder()">✓ Confirmer la commande</button>`,
  }));
}

async function submitOrder() {
  const addr = getField('chk-addr').trim();
  if (!addr || addr.length < 10) { showErrors([{msg:'Adresse de livraison requise (min. 10 caractères)'}],'checkout-error'); return; }
  try {
    const order = await api.post('/api/orders',{ shipping_address:addr, notes:getField('chk-notes') });
    _cartItems=[]; await refreshCartCount();
    closeModal();
    toast('Commande #'+order.id+' confirmée !','success',5000);
    Router.go('orders');
  } catch(err) { showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}],'checkout-error'); }
}

/* ORDERS */
let _orders=[], _expandedOrder=null;

async function renderOrders() {
  const app = document.getElementById('app');
  app.innerHTML=`<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  try { _orders = await api.get('/api/orders'); } catch {}
  renderOrdersView();
}

function renderOrdersView() {
  document.getElementById('app').innerHTML=`
  <div class="page">
    ${renderNavbar()}
    <div class="container">
      <div class="page-header"><h2>Mes commandes</h2><div class="sub">${_orders.length} commande(s)</div></div>
      ${_orders.length===0?`
      <div class="empty-state">
        <div class="icon">📦</div>
        <h3>Aucune commande</h3>
        <p style="margin-bottom:1rem">Commencez par explorer notre catalogue</p>
        <button class="btn btn-black" onclick="Router.go('catalog')">Voir le catalogue</button>
      </div>`:`
      <div>
        ${_orders.map(o=>`
        <div class="order-card">
          <div class="order-header" onclick="toggleOrder(${o.id})">
            <div>
              <div class="order-id">Commande #${o.id}</div>
              <div style="font-size:0.82rem;color:var(--text-muted)">${fmtDateTime(o.created_at)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              ${statusBadge(o.status)}
              <div class="order-total">${fmtPrice(o.total)}</div>
              <span style="color:var(--text-muted)">${_expandedOrder===o.id?'▲':'▼'}</span>
            </div>
          </div>
          ${_expandedOrder===o.id?`<div id="order-detail-${o.id}" class="order-items-list"><div class="loading-page" style="min-height:80px"><div class="spinner"></div></div></div>`:''}
        </div>`).join('')}
      </div>`}
    </div>
  </div>`;
  if (_expandedOrder) loadOrderDetail(_expandedOrder);
}

async function toggleOrder(id) {
  _expandedOrder = _expandedOrder===id ? null : id;
  renderOrdersView();
}

async function loadOrderDetail(id) {
  const el = document.getElementById(`order-detail-${id}`);
  if (!el) return;
  try {
    const order = await api.get(`/api/orders/${id}`);
    el.innerHTML=`
    <div style="padding:.5rem 0">
      ${order.items.map(i=>`
      <div class="order-item-row">
        <span>${esc(i.product_name)} ×${i.quantity}</span>
        <span>${fmtPrice(parseFloat(i.product_price)*i.quantity)}</span>
      </div>`).join('')}
      <div style="margin-top:.75rem;font-size:0.82rem;color:var(--text-muted)">📍 ${esc(order.shipping_address)}</div>
      ${order.notes?`<div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px">💬 ${esc(order.notes)}</div>`:''}
    </div>`;
  } catch { el.innerHTML=`<div style="padding:1rem;color:var(--danger)">Erreur chargement</div>`; }
}

/* PROFILE */
async function renderProfile() {
  const app = document.getElementById('app');
  app.innerHTML=`<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  let user;
  try { user = await api.get('/api/users/profile'); } catch { Router.go('home'); return; }
  app.innerHTML=`
  <div class="page">
    ${renderNavbar()}
    <div class="container" style="max-width:700px">
      <div class="page-header"><h2>Mon profil</h2></div>
      <div class="card mb-2">
        <div class="card-body">
          <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:1.5rem">
            <div style="width:64px;height:64px;border-radius:16px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;color:var(--accent-dark);font-family:var(--font-display)">${(user.username||'?')[0].toUpperCase()}</div>
            <div>
              <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:600">${esc(user.username)}</div>
              <div style="color:var(--text-muted);font-family:var(--mono);font-size:0.82rem">${esc(user.email)} · <span class="badge badge-${user.role}">${user.role}</span></div>
            </div>
          </div>
          <div class="error-banner" id="profile-error"></div>
          <div class="form-row">
            <div class="form-group"><label>Prénom</label><input type="text" id="prf-first" value="${esc(user.first_name||'')}" /></div>
            <div class="form-group"><label>Nom</label><input type="text" id="prf-last" value="${esc(user.last_name||'')}" /></div>
          </div>
          <div class="form-group"><label>Téléphone</label><input type="text" id="prf-phone" value="${esc(user.phone||'')}" placeholder="+33 6 00 00 00 00" /></div>
          <div class="form-group"><label>Adresse de livraison par défaut</label><textarea id="prf-addr">${esc(user.address||'')}</textarea></div>
          <button class="btn btn-black" onclick="submitProfile()">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function submitProfile() {
  try {
    await api.put('/api/users/profile',{ first_name:getField('prf-first'), last_name:getField('prf-last'), phone:getField('prf-phone'), address:getField('prf-addr') });
    toast('Profil mis à jour','success');
    showErrors([],'profile-error');
  } catch(err) { showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}],'profile-error'); }
}

/* ADMIN */
let _adminUsers=[], _adminOrders=[], _adminTab='orders';

async function renderAdmin() {
  if (!Auth.isAdmin()) { Router.go('home'); return; }
  const app = document.getElementById('app');
  app.innerHTML=`<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  try {
    [_adminOrders, _adminUsers] = await Promise.all([api.get('/api/orders'), api.get('/api/users')]);
    if (Auth.isAdmin()) { try { var stats = await api.get('/api/orders/stats'); window._adminStats=stats; } catch {} }
  } catch {}
  renderAdminView();
}

function renderAdminView(filter='') {
  const stats = window._adminStats||{};
  const orders = filter
    ? _adminOrders.filter(o=>(o.username||'').toLowerCase().includes(filter)||(o.email||'').toLowerCase().includes(filter)||String(o.id).includes(filter))
    : _adminOrders;

  document.getElementById('app').innerHTML=`
  <div class="page">
    ${renderNavbar()}
    <div class="container">
      <div class="page-header"><div><h2>Administration</h2><div class="sub">Vue d'ensemble de la boutique</div></div></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${stats.total||0}</div><div class="stat-label">Commandes total</div></div>
        <div class="stat-card"><div class="stat-value">${fmtPrice(stats.revenue||0)}</div><div class="stat-label">Chiffre d'affaires</div></div>
        <div class="stat-card"><div class="stat-value">${stats.confirmed||0}</div><div class="stat-label">Confirmées</div></div>
        <div class="stat-card"><div class="stat-value">${_adminUsers.length}</div><div class="stat-label">Utilisateurs</div></div>
      </div>
      <div class="tabs">
        <button class="tab ${_adminTab==='orders'?'active':''}" onclick="_adminTab='orders';renderAdminView()">Commandes (${_adminOrders.length})</button>
        <button class="tab ${_adminTab==='users'?'active':''}" onclick="_adminTab='users';renderAdminView()">Utilisateurs (${_adminUsers.length})</button>
      </div>
      ${_adminTab==='orders'?`
      <div class="table-card">
        <div class="table-header">
          <div class="table-title">Toutes les commandes</div>
          <input class="search-bar" style="width:220px;border-radius:var(--radius)" type="search" placeholder="Rechercher…" oninput="renderAdminView(this.value.toLowerCase())" />
        </div>
        <div style="overflow-x:auto">
        <table>
          <thead><tr><th>#</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${orders.map(o=>`
            <tr>
              <td class="td-mono">#${o.id}</td>
              <td><div style="font-weight:600">${esc(o.username)}</div><div style="font-size:0.78rem;color:var(--text-muted)">${esc(o.email)}</div></td>
              <td class="td-mono">${fmtPrice(o.total)}</td>
              <td>${statusBadge(o.status)}</td>
              <td class="td-mono">${fmtDate(o.created_at)}</td>
              <td><div class="actions-cell">
                <select onchange="adminSetOrderStatus(${o.id},this.value)" style="padding:5px 8px;font-size:0.8rem;border-radius:var(--radius)">
                  ${['pending','confirmed','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
                </select>
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>
        </div>
      </div>`:`
      <div class="table-card">
        <div class="table-header"><div class="table-title">Utilisateurs</div></div>
        <table>
          <thead><tr><th>Utilisateur</th><th>E-mail</th><th>Rôle</th><th>Inscription</th><th>Actions</th></tr></thead>
          <tbody>
            ${_adminUsers.map(u=>`
            <tr>
              <td><div style="font-weight:600">${esc(u.username)}</div></td>
              <td class="td-mono">${esc(u.email)}</td>
              <td>${statusBadge(u.role==='admin'?'admin':'user')}</td>
              <td class="td-mono">${fmtDate(u.created_at)}</td>
              <td><div class="actions-cell">
                ${u.id!==Auth.current.id?`
                <button class="btn btn-ghost btn-sm" onclick="adminToggleRole(${u.id},'${u.role==='admin'?'user':'admin'}')">${u.role==='admin'?'→ user':'→ admin'}</button>
                <button class="btn btn-danger btn-sm" onclick="adminDeleteUser(${u.id})">Suppr.</button>`:'<span style="color:var(--text-muted);font-size:0.8rem">vous</span>'}
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>
  </div>`;
}

async function adminSetOrderStatus(id, status) {
  try {
    await api.patch(`/api/orders/${id}/status`,{status});
    const idx=_adminOrders.findIndex(o=>o.id===id);
    if(idx!==-1) _adminOrders[idx].status=status;
    toast('Statut mis à jour','success');
    renderAdminView();
  } catch(err) { toast(err.data?.error||'Erreur','error'); }
}

async function adminToggleRole(id, role) {
  try {
    await api.patch(`/api/users/${id}/role`,{role});
    const idx=_adminUsers.findIndex(u=>u.id===id);
    if(idx!==-1) _adminUsers[idx].role=role;
    renderAdminView(); toast('Rôle mis à jour','success');
  } catch(err) { toast(err.data?.error||'Erreur','error'); }
}

async function adminDeleteUser(id) {
  if (!confirm('Supprimer cet utilisateur et toutes ses données ?')) return;
  try {
    await api.delete(`/api/users/${id}`);
    _adminUsers=_adminUsers.filter(u=>u.id!==id);
    renderAdminView(); toast('Utilisateur supprimé','info');
  } catch(err) { toast(err.data?.error||'Erreur','error'); }
}
